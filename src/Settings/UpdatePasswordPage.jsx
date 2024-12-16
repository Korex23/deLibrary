import React, { useState } from "react";
import { auth } from "../firebase/config";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

const UpdatePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordToggle, setpasswordToggle] = useState(false);
  const [confirmPasswordToggle, setConfirmPasswordToggle] = useState(false);
  const [newPasswordToggle, setNewPasswordToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleUpdatePassword = async () => {
    try {
      if (newPassword !== confirmNewPassword) {
        setErrorMessage("New password and confirmation don't match");
        toast.error("New password and confirmation don't match");
        return;
      }

      // Reauthenticate user
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      setSuccessMessage("Password updated successfully!");
      toast.success("Password updated successfully!");
    } catch (error) {
      setErrorMessage(error.message);
      if (error.message === "Firebase: Error (auth/network-request-failed).") {
        toast.error("Network Failed, Check your internet connection");
      } else if (error.message === "Firebase: Error (auth/wrong-password).") {
        toast.error("Enter the correct password");
      } else if (
        error.message === "Firebase: Error (auth/invalid-credential)."
      ) {
        toast.error("Current Password is Incorrect");
      } else if (error.message === "Firebase: Error (auth/invalid-email).") {
        toast.error("Invalid Email");
      }
    }
  };

  const handlePasswordToggle = (e) => {
    setpasswordToggle(!passwordToggle);
    e.preventDefault();
  };

  const handleNewPasswordToggle = (e) => {
    setNewPasswordToggle(!newPasswordToggle);
    e.preventDefault();
  };

  const handleConfirmPasswordToggle = (e) => {
    setConfirmPasswordToggle(!confirmPasswordToggle);
    e.preventDefault();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-[100%] sm:w-[90%] mx-auto mb-5">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#005097]">
          Update Password
        </h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="hidden">
            <label htmlFor="email"> Email</label>
            <input
              type="email"
              id="email"
              value={auth.currentUser.email}
              autoComplete="username"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:outline-none block w-full p-2.5 mb-4"
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="currentPassword">
              Current Password
            </label>
            <div className="relative">
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 "
                onClick={handlePasswordToggle}
              >
                {passwordToggle ? <FaEyeSlash /> : <FaEye />}
              </button>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:outline-none block w-full p-2.5 mb-4"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 "
                onClick={handleNewPasswordToggle}
              >
                {newPasswordToggle ? <FaEye /> : <FaEyeSlash />}
              </button>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:outline-none block w-full p-2.5 mb-4"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="confirmNewPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 "
                onClick={handleConfirmPasswordToggle}
              >
                {confirmPasswordToggle ? <FaEye /> : <FaEyeSlash />}
              </button>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="confirm-password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:outline-none block w-full p-2.5 mb-4"
              />
            </div>
          </div>

          <button
            type="submit"
            onClick={handleUpdatePassword}
            className="bg-[#005097] text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
