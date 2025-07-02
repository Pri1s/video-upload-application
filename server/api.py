# Imports
import os

from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate  # For handling database migrations

from dataplane import (
    s3_upload,
)  # Importing the s3_upload function from dataplane module
import boto3  # For interacting with AWS S3 and Cloudflare R2
from botocore.config import Config  # For configuring the S3 client

import uuid  # For generating unique IDs (in this case, for users)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename  # For securely handling file uploads

import jwt  # For handling JSON Web Tokens (JWTs) for authentication
import time  # For handling time-related operations, especially for token expiration
import uuid  # For generating unique identifiers
import datetime  # For handling date and time, especially for token expiration
from functools import wraps

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///movies.db"
app.config["JWT_SECRET_KEY"] = "temporary_secret"
app.config["UPLOADS_FOLDER"] = os.path.join(app.root_path, "static", "uploads")
app.config["CLOUDFLARE_ACCOUNT_ID"] = "9648112a9e151c1b4a5206f6fa027450"
app.config["CLOUDFLARE_BUCKET_NAME"] = "video-upload-application-storage"
app.config["CLIENT_ACCESS_KEY"] = "54020df3eeabfae174e565a0b6b532bd"
app.config["CLIENT_SECRET_KEY"] = (
    "8b7161cc2179dd6f693e5048364baa07902f0b58bdd016f9e5c2c4b95d518bdf"
)

db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate with the app and db

cloudflare_connection_url = (
    f"https://{app.config['CLOUDFLARE_ACCOUNT_ID']}.r2.cloudflarestorage.com"
)

s3_connect = boto3.client(
    "s3",
    endpoint_url=cloudflare_connection_url,
    aws_access_key_id=app.config["CLIENT_ACCESS_KEY"],
    aws_secret_access_key=app.config["CLIENT_SECRET_KEY"],
    config=Config(signature_version="s3v4"),
    region_name="us-east-1",
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    admin = db.Column(db.Boolean, default=False)


class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(1000), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    cloudflare_url = db.Column(db.String(1000), nullable=True)
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, nullable=False)


def token_required(f):
    # Use wraps to preserve the original function's metadata
    @wraps(f)
    def decorated(*args, **kwargs):
        # Initialize token variable
        token = None

        # Check if token exists in request headers under 'x-access-token'
        if "x-access-token" in request.headers:
            # Get the token value from headers
            token = request.headers["x-access-token"]
        else:
            # Return error if no token is provided
            return jsonify({"message": "Token is missing!"}), 401

        try:
            # Decode the token using the secret key
            data = jwt.decode(token, app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
            # Query database to find user with matching public_id from token
            current_user = User.query.filter_by(public_id=data["public_id"]).first()
        except Exception as e:
            # Return error if token is invalid or expired
            return jsonify({"message": "Token is invalid!"}), 401

        # Call the original function with the authenticated user and any other arguments
        return f(current_user, *args, **kwargs)

    # Return the decorated function
    return decorated


# User handling routes
@app.route("/user", methods=["GET"])
@token_required  # Protect this route with token authentication
def get_all_users(current_user):
    if not current_user.admin:
        return jsonify({"message": "Cannot perform this action!"}), 403
    users = User.query.all()
    output = []  # List to hold user data upon querying the database
    for user in users:
        user_data = {
            "public_id": user.public_id,
            "username": user.username,
            "password": user.password,  # Note: In a real application, do not return passwords
            "admin": user.admin,
        }
        output.append(user_data)
    return jsonify({"users": output})


@app.route("/user/<public_id>", methods=["GET"])
@token_required
def get_one_user(current_user, public_id):
    if not current_user.admin:
        return jsonify({"message": "Cannot perform this action!"}), 403
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({"message": "User not found!"}), 404
    user_data = {
        "public_id": user.public_id,
        "username": user.username,
        "password": user.password,  # Note: In a real application, do not return passwords
        "admin": user.admin,
    }
    return jsonify({"user": user_data})


@app.route("/user", methods=["POST"])
@token_required
def create_user(current_user):
    if not current_user.admin:
        return jsonify({"message": "Cannot perform this action!"}), 403
    data = request.get_json()
    hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256")
    new_user = User(
        public_id=str(
            uuid.uuid4()
        ),  # Generate a unique public ID for the user using uuid version 4
        username=data["username"],
        password=hashed_password,
        admin=False,
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201


@app.route("/user/<public_id>", methods=["PUT"])
@token_required
def promote_user(current_user, public_id):  # Promote given user into an admin
    if not current_user.admin:
        return jsonify({"message": "Cannot perform this action!"}), 403
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({"message": "User not found!"}), 404
    user.admin = True
    db.session.commit()
    return jsonify({"message": "User promoted to admin!"})


@app.route("/user/<public_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, public_id):
    if not current_user.admin:
        return jsonify({"message": "Cannot perform this action!"}), 403
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({"message": "User not found!"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully!"})


# Login routes
@app.route("/login")
def login():  # Get request by default
    auth = (
        request.authorization
    )  # Get the authorization header (information) from the request
    if not auth or not auth.username or not auth.password:
        return make_response(
            "Coult not verify!",
            401,
            {
                "WWW-Authenticate": 'Basic realm="Login required"'
            },  # This is the header that will be sent back to the client
        )

    user = User.query.filter_by(username=auth.username).first()
    if not user or not check_password_hash(user.password, auth.password):
        return make_response(
            "Could not verify!",
            401,
            {
                "WWW-Authenticate": 'Basic realm="Login required"'
            },  # This is the header that will be sent back to the client
        )

    user = User.query.filter_by(username=auth.username).first()
    if not user or not check_password_hash(user.password, auth.password):
        return make_response(
            "Could not verify!",
            401,
            {"WWW-Authenticate": 'Basic realm="Login required"'},
        )
    token = jwt.encode(
        {
            "public_id": user.public_id,
            "exp": datetime.datetime.utcnow()
            + datetime.timedelta(minutes=30),  # Token expiration time set to 30 minutes
        },
        app.config["JWT_SECRET_KEY"],  # Secret key for encoding the JWT
        algorithm="HS256",
    )
    # Ensure token is a string for JSON serialization
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return jsonify(
        {
            "message": "Login successful!",
            "public_id": user.public_id,
            "token": token,
        }
    )


# Image handling routes
@app.route("/image", methods=["GET"])
@token_required
def get_all_images(current_user):
    images = Image.query.filter_by(user_id=current_user.public_id).all()
    output = []

    for image in images:
        if image.user_id == current_user.public_id:
            image_data = {
                "id": image.id,
                "title": image.title,
                "description": image.description,
                "date_created": image.date_created,
                "user_id": image.user_id,
                "url": image.cloudflare_url,  # Generate URL for the image
            }
            output.append(image_data)

    return jsonify({"images": output})


@app.route("/image/<image_id>", methods=["GET"])
@token_required
def get_one_image(current_user, image_id):
    return ""


@app.route("/upload", methods=["POST"])
@token_required
def upload_image(current_user):
    try:
        # Accept multiple files from the 'image' field
        files = request.files.getlist("image")
        if not files or files == [None]:
            return jsonify({"error": "No image file(s) provided"}), 400

        allowed_extensions = {"png", "jpg", "jpeg", "gif"}
        uploaded_images = []

        for file in files:
            if not file or file.filename == "":
                continue  # Skip empty files

            # Check if file extension is allowed
            if (
                "." not in file.filename
                or file.filename.rsplit(".", 1)[1].lower() not in allowed_extensions
            ):
                continue  # Skip invalid file types

            # Generate unique filename
            original_filename = secure_filename(file.filename)
            file_extension = original_filename.rsplit(".", 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}_{int(time.time())}.{file_extension}"

            # Upload file to Cloudflare R2
            s3_connect.upload_fileobj(
                file,
                app.config["CLOUDFLARE_BUCKET_NAME"],
                unique_filename,
                ExtraArgs={"ContentType": file.content_type},
            )

            # Get title and description from form data (support per-file if needed)
            title = request.form.get("title", original_filename)
            description = request.form.get("description", "")

            public_url = f"{cloudflare_connection_url}/{app.config['CLOUDFLARE_BUCKET_NAME']}/{unique_filename}"

            # Create new Image instance and add to database
            new_image = Image(
                title=title,
                description=description,
                filename=unique_filename,
                cloudflare_url=public_url,
                user_id=current_user.public_id,
            )
            db.session.add(new_image)
            db.session.flush()  # Get new_image.id before commit

            uploaded_images.append(
                {
                    "message": "Image uploaded to R2 successfully",
                    "filename": unique_filename,
                    "cloudflare_url": public_url,
                    "image_id": new_image.id,
                }
            )

        db.session.commit()

        if not uploaded_images:
            return jsonify({"error": "No valid images uploaded"}), 400

        return jsonify({"uploaded_images": uploaded_images}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
