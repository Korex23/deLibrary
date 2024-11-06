import React, { useState } from "react";
import { useBooks } from "../../../context/BooksContext";

const BookPublishingForm = () => {
  const {
    updateBooks,
    updateAllBooks,
    bookInfo,
    handleBookChangeForm,
    setBookInfo,
  } = useBooks();
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await updateAllBooks();
      await updateBooks();
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
        ratings: 0,
        soldCopies: 0,
        reviews: [],
      });
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

      <input
        type="text"
        name="title"
        value={bookInfo.title}
        onChange={handleBookChangeForm}
        placeholder="Title"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <div>
        <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-600 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
          <span className="text-sm">Choose Front Cover</span>
          <span className="ml-2 text-xs">
            {bookInfo.frontCover ? bookInfo.frontCover.name : ""}
          </span>
          <input
            type="file"
            name="frontCover"
            onChange={handleBookChangeForm}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>

      <div>
        <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-600 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
          <span className="text-sm">Choose Back Cover</span>
          <span className="ml-2 text-xs">
            {bookInfo.backCover ? bookInfo.backCover.name : ""}
          </span>
          <input
            type="file"
            name="backCover"
            onChange={handleBookChangeForm}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>

      <div>
        <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-600 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
          <span className="text-sm">Choose PDF</span>
          <span className="ml-2 text-xs">
            {bookInfo.pdf ? bookInfo.pdf.name : ""}
          </span>
          <input
            type="file"
            name="pdf"
            onChange={handleBookChangeForm}
            className="hidden"
            accept=".pdf"
          />
        </label>
      </div>

      <textarea
        name="description"
        value={bookInfo.description}
        onChange={handleBookChangeForm}
        placeholder="Description"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="number"
        name="price"
        value={bookInfo.price}
        onChange={handleBookChangeForm}
        placeholder="Price"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="text"
        name="isbn"
        value={bookInfo.isbn}
        onChange={handleBookChangeForm}
        placeholder="ISBN"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="text"
        name="categories"
        value={bookInfo.categories.join(",")}
        onChange={handleBookChangeForm}
        placeholder="Categories (comma separated)"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="date"
        name="releaseDate"
        value={bookInfo.releaseDate.toISOString().split("T")[0]}
        onChange={handleBookChangeForm}
        className="w-full p-2 border border-gray-300 rounded"
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
};

export default BookPublishingForm;
