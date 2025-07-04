const Form = () => {
  return (
    <div className="bg-white px-10 py-20 rounded-md border-2 border-gray-200">
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
        <div className="flex mt-8 justify-between items-center">
          <div>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember" className="ml-2 font-medium text-base">
              Remember for 30 days
            </label>
          </div>
          <button className="font-medium text-base text-violet-500">
            Forgot password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
