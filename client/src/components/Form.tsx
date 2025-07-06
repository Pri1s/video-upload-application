import axios from "axios"; // Import axios for HTTP requests

import React, { useState } from "react";

const Form = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create the Basic Auth header
      const credentials = `${username}:${password}`;
      const encodedCredentials = btoa(credentials);

      // Make the API call to your Flask endpoint
      const response = await axios.get("http://localhost:5000/login", {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/json",
        },
      });

      // Handle the response - extract and console.log the token
      const { token, message, public_id } = response.data;
      console.log("Authentication successful!");
      console.log("Token:", token);
      console.log("Message:", message);
      console.log("Public ID:", public_id);
    } catch (error: any) {
      // Handle any errors
      if (error.response) {
        // Server responded with error status
        console.error("Authentication failed:", error.response.status);
        console.error("Error message:", error.response.data);
      } else if (error.request) {
        // Network error
        console.error("Network error - could not reach server");
      } else {
        // Other error
        console.error("Error:", error.message);
      }
    }
  };

  return (
    <div className="bg-white px-20 py-20 rounded-lg border-2 border-gray-200 shadow-xl">
      {/* Heading for the form */}
      <h1 className="text-5xl font-semibold">Welcome Back</h1>
      {/* Subheading with instructions */}
      <p className="text-lg font-medium text-gray-500 mt-4">
        Please enter your details
      </p>
      <div className="mt-8 space-y-6">
        {/* Username input field */}
        <div>
          <label className="text-lg font-medium">Username</label>
          <input
            type="text"
            value={username}
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md mt-1"
          />
        </div>
        {/* Password input field */}
        <div>
          <label className="text-lg font-medium">Password</label>
          <input
            type="text"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md mt-1"
          />
        </div>
        <div className="mt-8 flex flex-col gap-y-4">
          <button
            onClick={handleSubmission}
            className="py-2 border border-gray-300 bg-black text-lg text-white font-bold rounded-md hover:bg-gray-800 active:scale-[0.85] transition-all duration-200"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
