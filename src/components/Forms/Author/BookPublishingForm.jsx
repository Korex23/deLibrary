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
      className="space-y-4 p-6 bg-gray-100 rounded-lg shadow-md max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Book Information</h2>

      {/* Book Title */}
      <input
        type="text"
        name="title"
        value={bookInfo.title}
        onChange={handleBookChangeForm}
        placeholder="Title"
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Book Description */}
      <textarea
        name="description"
        value={bookInfo.description}
        onChange={handleBookChangeForm}
        placeholder="Description"
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Price */}
      <input
        type="number"
        name="price"
        value={isNaN(bookInfo.price) ? "" : bookInfo.price}
        onChange={handleBookChangeForm}
        placeholder="Price"
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* ISBN */}
      <input
        type="text"
        name="isbn"
        value={bookInfo.isbn}
        onChange={handleBookChangeForm}
        placeholder="ISBN"
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Categories */}
      <input
        type="text"
        name="categories"
        value={bookInfo.categories.join(", ")}
        onChange={handleBookChangeForm}
        placeholder="Categories (comma separated)"
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Release Date */}
      <input
        type="date"
        name="releaseDate"
        value={bookInfo.releaseDate}
        onChange={handleBookChangeForm}
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Distributors Settings */}
      <h3 className="text-xl font-semibold">Distribution Settings</h3>
      <div className="flex gap-4 items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={anyone}
            onChange={() => {
              setAnyone(true);
              setOnlyMe(false);
              updateBookInfoWithDistributors([]);
            }}
          />
          <span className="ml-2">Anyone</span>
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
          />
          <span className="ml-2">Only Me</span>
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
          />
          <span className="ml-2">Custom Distributors</span>
        </label>
      </div>

      {/* Select Distributors */}
      {!(onlyMe || anyone) && (
        <Select
          isMulti
          options={users}
          value={bookInfo.allowedDistributors}
          onChange={handleDistributorChange}
          placeholder="Select Distributors"
        />
      )}

      {/* Upload PDF, Front Cover, and Back Cover */}
      <div>
        <label htmlFor="frontCover" className="block text-sm font-semibold">
          Front Cover
        </label>
        <input
          type="file"
          name="frontCover"
          onChange={handleBookChangeForm}
          accept="image/*"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label htmlFor="backCover" className="block text-sm font-semibold">
          Back Cover
        </label>
        <input
          type="file"
          name="backCover"
          onChange={handleBookChangeForm}
          accept="image/*"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label htmlFor="pdf" className="block text-sm font-semibold">
          PDF Upload
        </label>
        <input
          type="file"
          name="pdf"
          onChange={handleBookChangeForm}
          accept=".pdf"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading}
        className={`w-full p-2 mt-4 text-white bg-blue-500 rounded ${
          uploading ? "opacity-50" : ""
        }`}
      >
        {uploading ? "Uploading..." : "Publish Book"}
      </button>
    </form>
  );
};

export default BookPublishingForm;
