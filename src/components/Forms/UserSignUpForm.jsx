import React, { useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { uploadToCloudinary } from "../../Upload";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/logo.png";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const UserSignUpForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const togglePasswordVisibility1 = () => setShowPassword1(!showPassword1);

  // Check if the username already exists
  const isUsernameTaken = async (username) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const validateForm = () => {
    const { firstname, lastname, email, password, confirmPassword } = formData;
    if (!firstname || !lastname || !email || !password)
      return "All fields are required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errorMessage = validateForm();
    if (errorMessage) return setError(errorMessage);

    try {
      setUploading(true);

      // Check for username duplication
      const usernameTaken = await isUsernameTaken(formData.username);
      if (usernameTaken) {
        setUploading(false);
        return setError("Username already exists. Choose a different one.");
      }

      let profilePicUrl = "";
      if (formData.profilePic) {
        profilePicUrl = await uploadToCloudinary(formData.profilePic);
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        ...formData,
        profilePic: profilePicUrl,
        walletbalance: 0,
        booksbought: [],
        bookspublished: [],
        booksbookmarked: [],
      });

      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        profilePic: null,
      });
      toast.success("User created successfully!");
      navigate("/onboarding");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use. Please use a different email.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <div className="w-full max-w-4xl p-8 bg-white shadow-2xl rounded">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <Link to={"/"} className="flex items-center">
            <img src={logo} alt="logo" className="w-16 h-16 mr-2" />
            <span className="text-3xl font-bold text-[#005097]">BIRMBOOK</span>
          </Link>
        </div>

        <p className="text-center text-xl mb-5">
          Welcome to Birmbook, create an account to get started
        </p>

        {error && (
          <p className="text-center font-bold text-red-500 mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Row: Firstname and Lastname */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Second Row: Email and Username */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword1 ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword1 ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Profile Picture
            </label>
            <label className="flex items-center justify-center w-full px-4 py-3 border border-dashed border-gray-400 text-gray-600 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <span className="text-sm">
                {formData.profilePic ? formData.profilePic.name : "Choose File"}
              </span>
              <input
                type="file"
                name="profilePic"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 mt-6 rounded-lg text-white font-semibold ${
              uploading ? "bg-blue-400" : "bg-blue-600"
            }`}
          >
            {uploading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-700">
          Already have an account?{" "}
          <Link to={"/signin"} className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignUpForm;
