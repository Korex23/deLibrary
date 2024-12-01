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

  const handleDistributorChange = (selectedOptions) => {
    updateBookInfoWithDistributors(selectedOptions);
    setOnlyMe(false);
    setAnyone(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await updateAllBooks();
      await updateBooks();

      // Reset form after submission
      setBookInfo({
        title: "",
        frontCover: null,
        backCover: null,
        pdf: null,
        description: "",
        price: 0,
        isbn: "",
        categories: [],
        releaseDate: new Date(),
        ratings: [],
        soldCopies: 0,
        reviews: [],
        allowedDistributors: [],
        isDistributorsAllowed: false,
      });

      setOnlyMe(false);
      setAnyone(false);
    } catch (error) {
      console.error("Failed to submit book:", error);
    }
    setUploading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-8 bg-white rounded-lg shadow-lg max-w-lg mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Book Information
      </h2>

      {/* Book Title */}
      <div>
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
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
        />
      </div>

      {/* Book Description */}
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
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
        />
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
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
        />
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
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
        />
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
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
        />
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
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
        />
      </div>

      {/* Distribution Settings */}
      <h3 className="text-xl font-semibold text-gray-800 mt-6">
        Distribution Settings
      </h3>
      <div className="flex gap-6 items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={anyone}
            onChange={() => {
              setAnyone(true);
              setOnlyMe(false);
              updateBookInfoWithDistributors([]);
            }}
            className="h-5 w-5 text-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-gray-700">Anyone</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={onlyMe}
            onChange={() => {
              setOnlyMe(true);
              setAnyone(false);
              updateBookInfoWithDistributors([]);
            }}
            className="h-5 w-5 text-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-gray-700">Only Me</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={!onlyMe && !anyone}
            onChange={() => {
              setAnyone(false);
              setOnlyMe(false);
              updateBookInfoWithDistributors([]);
            }}
            className="h-5 w-5 text-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-gray-700">Custom Distributors</span>
        </label>
      </div>

      {/* Select Distributors */}
      {!(onlyMe || anyone) && (
        <div className="mt-4">
          <label
            htmlFor="distributors"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Distributors
          </label>
          <Select
            isMulti
            options={users}
            value={bookInfo.allowedDistributors}
            onChange={handleDistributorChange}
            placeholder="Select distributors"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
          />
        </div>
      )}

      {/* Upload PDF, Front Cover, and Back Cover */}
      <div className="space-y-4">
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
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-300"
            onClick={() => document.getElementById("frontCover").click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>
              {" "}
              {bookInfo.frontCover
                ? bookInfo.frontCover.name
                : "Upload Front Cover"}
            </span>
          </button>
        </div>

        <div className="relative">
          <label
            htmlFor="frontCover"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Front Cover
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
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-300"
            onClick={() => document.getElementById("backCover").click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>
              {" "}
              {bookInfo.backCover
                ? bookInfo.backCover.name
                : "Upload Back Cover"}
            </span>
          </button>
        </div>
        <div className="relative">
          {/* Label for the custom file input */}
          <label
            htmlFor="pdf"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            PDF Upload
          </label>

          {/* The input is hidden but accessible to users */}
          <input
            type="file"
            name="pdf"
            id="pdf"
            onChange={handleBookChangeForm}
            accept=".pdf"
            className="hidden"
          />

          {/* Custom File Upload Button */}
          <button
            type="button"
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 bg-white flex items-center justify-center gap-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-300"
            onClick={() => document.getElementById("pdf").click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>{bookInfo.pdf ? bookInfo.pdf.name : "Upload PDF"}</span>
          </button>

          {/* File Name Display */}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading}
        className={`w-full p-3 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-300 ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {uploading ? "Uploading..." : "Publish Book"}
      </button>
    </form>
  );
};

export default BookPublishingForm;
