const Form = () => {
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
            placeholder="Enter your username"
            className="w-full border border-gray-300 p-2 rounded-md mt-1"
          />
        </div>
        {/* Password input field */}
        <div>
          <label className="text-lg font-medium">Password</label>
          <input
            type="text"
            placeholder="Enter your password"
            className="w-full border border-gray-300 p-2 rounded-md mt-1"
          />
        </div>
        <div className="mt-8 flex flex-col gap-y-4">
          <button className="py-2 border border-gray-300 bg-black text-lg text-white font-bold rounded-md hover:bg-gray-800 active:scale-[0.85] transition-all duration-200">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
