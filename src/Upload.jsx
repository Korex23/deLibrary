import axios from "axios";

/**
 * Uploads a file to Cloudinary and returns the download URL.
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("No file provided for upload");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "userfiles"); // Replace with your actual upload preset

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/userfilesbykorex/upload`, // Replace with your Cloudinary cloud name
      formData
    );
    return response.data.secure_url; // Return the secure URL from Cloudinary
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
