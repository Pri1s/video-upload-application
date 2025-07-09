import React from "react"; // Import React

interface ImageProps {
  id: number;
  title: string;
  description: string;
  date_created: string;
  user_id: string;
  url: string;
}

const Image = ({ title, description, url }: ImageProps) => {
  return (
    <div className="border rounded shadow p-4 flex flex-col items-center">
      <img
        src={url} // Image source URL
        alt={title} // Alt text for accessibility
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h2 className="font-bold text-lg">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}{" "}
      {/* Show description if available */}
    </div>
  );
};

export default Image; // Export Image component
