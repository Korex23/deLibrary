import React, { useState } from "react";
import { auth, db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { uploadToCloudinary } from "../../Upload";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Withdrawal from "../../Wallet/Withdrawal";

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

    // Input validation
    if (!firstname || !lastname || !email || !username || !password) {
      return setError("All fields are required.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setUploading(true);
      setError(null);

      // Upload profile picture if provided
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

      // Store user data in Firestore
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["firstname", "lastname", "email", "username"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 capitalize">
                {field.replace("name", " Name")}:
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
          ))}

          {/* Password Fields */}
          {["password", "confirmPassword"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 capitalize">
                {field.replace("confirmPassword", "Confirm Password")}:
              </label>
              <input
                type="password"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
          ))}

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-gray-700 mb-1">Profile Picture:</label>
            <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-600 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <span className="text-sm">Choose File</span>
              <span className="ml-2 text-xs">
                {formData.profilePic ? formData.profilePic.name : ""}
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
            className={`w-full py-2 rounded-lg text-white ${
              uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserSignUpForm;
