import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import Lottie from "lottie-react";
import animation from "../../assets/loginFile.json";
import { auth } from "../../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const SignInForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return "All fields are required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Invalid email format.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage); // Display validation error
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Redirect to dashboard on success
    } catch (err) {
      setError("Invalid email or password."); // General error message
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="w-[90%] sm:w-[60%] lg:w-[80%] border bg-[#f2f4f4] grid grid-cols-2 flex items-center justify-center">
        <div className="col-span-2 lg:col-span-1 p-6 md:p-10 relative h-full bg-white lg:rounded-none rounded-xl">
          <div className="">
            {/* Logo Section */}
            <div className="flex items-center justify-center mb-10 relative top-0">
              <Link to={"/"} className="flex items-center">
                <img src={logo} alt="logo" className="w-16 h-16 mr-2" />
                <span className="text-3xl font-bold text-[#005097]">
                  BIRMBOOK
                </span>
              </Link>
            </div>

            {/* Welcome Message */}
            <p className="text-center text-lg mb-5">
              Welcome back, Sign in to your account
            </p>

            {/* Display Error Message */}
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            {/* Form Section */}
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              >
                Sign In
              </button>
            </form>

            {/* Sign Up and Forgot Password Links */}
            <div className="mt-4 text-center">
              <p className="text-sm">
                Don't have an account?{" "}
                <Link to="/" className="text-blue-500 hover:underline">
                  Sign Up
                </Link>
              </p>
              <Link
                to="/reset-password"
                className="text-blue-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>

        {/* Lottie Animation Section */}
        <div className="w-[80%] max-[767px]:w-full md:w-[100%] bg-[#f2f4f4] hidden lg:block">
          <div className="w-full md:w-[80%] mx-auto">
            <Lottie animationData={animation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
