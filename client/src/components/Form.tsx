import axios from "axios"; // Import axios for HTTP requests

import React, { useState } from "react"; // Import React and useState hook
import { useNavigate } from "react-router-dom"; // Import navigation hook

const Form = () => {
  const [username, setUsername] = useState(""); // State for username input
  const [password, setPassword] = useState(""); // State for password input
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmission = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    try {
      // Create Basic Auth header
      const credentials = `${username}:${password}`;
      const encodedCredentials = btoa(credentials);

      // Send GET request to Flask /login endpoint
      const response = await axios.get("http://localhost:5000/login", {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/json",
        },
      });

      // Log the token (x-access-token) from the response
      const { token, message, public_id } = response.data;
      localStorage.setItem("token", token); // Store the token in localStorage
      // Navigate to the image list page after successful login
      navigate("/image");
    } catch (error: any) {
      if (error.response) {
        // Server responded with an error status
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
            onChange={(event) => setUsername(event.target.value)} // Update username state
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
            onChange={(event) => setPassword(event.target.value)} // Update password state
            className="w-full border border-gray-300 p-2 rounded-md mt-1"
          />
        </div>
        <div className="mt-8 flex flex-col gap-y-4">
          <button
            onClick={handleSubmission} // Handle form submission
            className="py-2 border border-gray-300 bg-black text-lg text-white font-bold rounded-md hover:bg-gray-800 active:scale-[0.85] transition-all duration-200"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form; // Export
