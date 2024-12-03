import React, { useState } from "react";
import { useBooks } from "../../../context/BooksContext";
import Select from "react-select";

const BookPublishingForm = () => {
  const {
    updateBooks,
    updateAllBooks,
    bookInfo,
    handleBookChangeForm,
    setBookInfo,
    users,
    onlyMe,
    setOnlyMe,
    anyone,
    setAnyone,
    updateBookInfoWithDistributors,
  } = useBooks();

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({}); // State for validation errors

  const validateForm = () => {
    const newErrors = {};
    if (!bookInfo.title) newErrors.title = "Book title is required.";
    if (!bookInfo.price || bookInfo.price <= 0)
      newErrors.price = "Price must be a positive number.";
    if (!bookInfo.isbn) newErrors.isbn = "ISBN is required.";
    if (!bookInfo.releaseDate)
      newErrors.releaseDate = "Release date is required.";
    if (!bookInfo.description)
      newErrors.description = "Description is required.";
    if (!bookInfo.frontCover) newErrors.frontCover = "Front cover is required.";
    if (!bookInfo.backCover) newErrors.backCover = "Back cover is required.";
    if (!bookInfo.pdf) newErrors.pdf = "PDF file is required.";
    return newErrors;
  };

  const handleDistributorChange = (selectedOptions) => {
    updateBookInfoWithDistributors(selectedOptions);
    setOnlyMe(false);
    setAnyone(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; // Stop submission if validation fails
    }

    setUploading(true);
    try {
      await updateAllBooks();
      await updateBooks();

      // Reset form and clear file uploads after submission
      setBookInfo({
        title: "",
        frontCover: null,
        backCover: null,
        pdf: null,
        description: "",
        price: 0,
        isbn: "",
        categories: [],
        releaseDate: "",
        ratings: [],
        soldCopies: 0,
        reviews: [],
        allowedDistributors: [],
        isDistributorsAllowed: false,
      });

      setOnlyMe(false);
      setAnyone(false);
      setErrors({}); // Clear any errors
    } catch (error) {
      console.error("Failed to submit book:", error);
    }
    setUploading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Book Publishing Form
      </h2>

      {/* Grid Container */}
      <div className="grid grid-cols-2 gap-6">
        {/* Book Title */}
        <div className="col-span-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Book Title
          </label>
          <input
            type="text"
            name="title"
            value={bookInfo.title}
            onChange={handleBookChangeForm}
            placeholder="Enter book title"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Price
          </label>
          <input
            type="number"
            name="price"
            value={isNaN(bookInfo.price) ? "" : bookInfo.price}
            onChange={handleBookChangeForm}
            placeholder="Enter book price"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price}</p>
          )}
        </div>

        {/* ISBN */}
        <div>
          <label
            htmlFor="isbn"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            value={bookInfo.isbn}
            onChange={handleBookChangeForm}
            placeholder="Enter ISBN"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
          {errors.isbn && <p className="text-red-500 text-sm">{errors.isbn}</p>}
        </div>

        {/* Release Date */}
        <div>
          <label
            htmlFor="releaseDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Release Date
          </label>
          <input
            type="date"
            name="releaseDate"
            value={bookInfo.releaseDate}
            onChange={handleBookChangeForm}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
          {errors.releaseDate && (
            <p className="text-red-500 text-sm">{errors.releaseDate}</p>
          )}
        </div>

        {/* Categories */}
        <div>
          <label
            htmlFor="categories"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Categories
          </label>
          <input
            type="text"
            name="categories"
            value={bookInfo.categories.join(", ")}
            onChange={handleBookChangeForm}
            placeholder="Enter categories (comma separated)"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>
      </div>

      {/* Description - Full Width */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Book Description
        </label>
        <textarea
          name="description"
          value={bookInfo.description}
          onChange={handleBookChangeForm}
          placeholder="Enter book description"
          rows={5}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>

      {/* File Upload Section - Grid */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        {/* Front Cover */}
        <div className="relative">
          <label
            htmlFor="frontCover"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Front Cover
          </label>
          <input
            type="file"
            name="frontCover"
            id="frontCover"
            onChange={handleBookChangeForm}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("frontCover").click()}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition duration-300"
          >
            {bookInfo.frontCover
              ? bookInfo.frontCover.name
              : "Upload Front Cover"}
          </button>

          {errors.frontCover && (
            <p className="text-red-500 text-sm">{errors.frontCover}</p>
          )}
        </div>

        {/* Back Cover */}
        <div className="relative">
          <label
            htmlFor="backCover"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Back Cover
          </label>
          <input
            type="file"
            name="backCover"
            id="backCover"
            onChange={handleBookChangeForm}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("backCover").click()}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition duration-300"
          >
            {bookInfo.backCover ? bookInfo.backCover.name : "Upload Back Cover"}
          </button>

          {errors.backCover && (
            <p className="text-red-500 text-sm">{errors.backCover}</p>
          )}
        </div>

        {/* PDF Upload - Full Width */}
        <div className="col-span-2 relative">
          <label
            htmlFor="pdf"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            PDF Upload
          </label>
          <input
            type="file"
            name="pdf"
            id="pdf"
            onChange={handleBookChangeForm}
            accept=".pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("pdf").click()}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition duration-300"
          >
            {bookInfo.pdf ? bookInfo.pdf.name : "Upload PDF"}
          </button>

          {errors.pdf && <p className="text-red-500 text-sm">{errors.pdf}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading}
        className={`w-full p-3 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {uploading ? "Uploading..." : "Publish Book"}
      </button>
    </form>
  );
};

export default BookPublishingForm;
