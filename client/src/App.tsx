import "./styles.css"; // Import global styles
import Form from "./components/Form"; // Import the Form component
// Main App component
const App = () => {
  return (
    // Flex container to center content and take full viewport height
    <div className="flex w-full h-screen">
      {/* Responsive container: full width on mobile, half width on large screens */}
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <Form /> {/* Render the Form component */}
      </div>
      {/* Decorative side panel, only visible on large screens */}
      <div className="hidden lg:flex h-full w-1/2 relative items-center justify-center bg-gray-200">
        {/* Gradient circle for visual appeal */}
        <div className="w-60 h-60 bg-gradient-to-tr from-white-500 to-black rounded-full animate-bounce" />
        {/* Semi-transparent overlay with blur effect */}
        <div className="w-full h-1/2 bottom-0 absolute bg-white/10 backdrop-blur-lg" />
      </div>
    </div>
  );
};

export default App; // Export App as default
