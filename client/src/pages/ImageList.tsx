import { useEffect, useState } from "react"; // Import React and hooks
import Image from "../components/Image"; // Import the Image component

interface ImageData {
  id: number;
  title: string;
  description: string;
  date_created: string;
  user_id: string;
  url: string;
}

const ImageList = () => {
  const [images, setImages] = useState<ImageData[]>([]); // State for storing images
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error messages

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true); // Set loading to true before fetching
      setError(null); // Reset error state
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (!token) {
          setError("No authentication token found.");
          setLoading(false);
          return;
        }
        const response = await fetch("http://localhost:5000/image", {
          headers: {
            "x-access-token": token, // Pass token in request header
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.statusText}`);
        }
        const data = await response.json(); // Parse JSON response
        console.log("Fetched images:", data); // Log fetched images for debugging
        setImages(data.images || []); // Update images state
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "An error occurred while fetching images."); // Set error message
        } else {
          setError("An error occurred while fetching images."); // Set generic error message
        }
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    fetchImages(); // Fetch images on component mount
  }, []);

  if (loading) return <div>Loading images...</div>; // Show loading message
  if (error) return <div className="text-red-500">{error}</div>; // Show error message

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8">
      {images.map((img) => (
        <Image key={img.id} {...img} /> // Render Image component for each image
      ))}
    </div>
  );
};

export default ImageList; // Export ImageList component
