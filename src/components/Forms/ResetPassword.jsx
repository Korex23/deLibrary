import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import Lottie from "lottie-react";
import animation from "../../assets/forgot.json";
import { auth, db } from "../../firebase/config";
import { getDocs, collection, query, where } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const SignInForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if email exists in userinformation collection
      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );
      if (querySnapshot.empty) {
        setError("Email does not exist, please enter correct mail");
        setLoading(false);
        return;
      }

      // If email exists, send password reset email
      await sendPasswordResetEmail(auth, email);
      // Handle successful sign-in here (e.g., redirect to another page)
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="w-[90%] sm:w-[60%] lg:w-[80%] border bg-[#f2f4f4] grid grid-cols-2 flex items-center justify-center">
        <div className="col-span-2 lg:col-span-1 p-6 md:p-10 relative h-full bg-white lg:rounded-none rounded-xl">
          <div className="">
            <div className="flex items-center justify-center mb-10 relative top-0">
              <Link to={"/"} className="flex items-center">
                <img src={logo} alt="logo" className="w-16 h-16 mr-2" />
                <span className="text-3xl font-bold text-[#005097]">
                  BIRMBOOK
                </span>
              </Link>
            </div>
            <p className="text-center mb-5 text-lg">
              Enter your email to reset your password
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
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

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              >
                Reset Password
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm">
                Don't have an account?{" "}
                <Link to="/" className="text-blue-500 hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
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
