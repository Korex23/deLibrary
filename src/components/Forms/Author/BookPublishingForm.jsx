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
