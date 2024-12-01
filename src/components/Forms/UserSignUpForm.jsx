import React, { useState } from "react";
import { auth, db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { uploadToCloudinary } from "../../Upload";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      profilePic,
      username,
    } = formData;

    if (!firstname || !lastname || !email || !username || !password) {
      return setError("All fields are required.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setUploading(true);
      setError(null);

      let profilePicUrl = "";
      if (profilePic) {
        profilePicUrl = await uploadToCloudinary(profilePic);
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        firstname,
        lastname,
        email,
        profilePic: profilePicUrl,
        referralCode: username,
        username,
        booksbought: [],
        bookspublished: [],
        booksbookmarked: [],
        currentCart: [],
        depositHistory: [],
        withdrawalHistory: [],
        walletbalance: 0,
        isCustomer: false,
        isAuthor: false,
        isReferred: false,
        referredBy: "",
        booksBoughtByPeople: [],
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
      setError(`Error creating user: ${error.message}`);
      toast.error(`Error creating user: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <div className="w-full max-w-4xl p-8 bg-white shadow-2xl rounded-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
          Sign Up
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid Layout for Fields */}
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

            {/* Third Row: Password and Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Profile Picture Upload */}
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
              uploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? "Signing Up..." : "Sign Up"}
          </button>

          {/* Error Message */}
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
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
