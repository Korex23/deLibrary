import React from "react";
import { useBooks } from "../../context/BooksContext";
import { FaShoppingCart, FaBookmark } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const BooksCard = () => {
  const { allBooks, AddToBookmarks, bookmarks } = useBooks();
  const { addToCart } = useCart();

  // Helper function to check if a book is already bookmarked
  const isBookBookmarked = (bookId) => {
    return bookmarks.some((bookmark) => bookmark.id === bookId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allBooks.map((book) => (
        <div
          key={book.id}
          className="p-4 bg-white rounded-lg shadow-md flex flex-col"
        >
          <img
            src={book.frontCoverUrl}
            alt={book.title}
            className="h-64 w-full object-cover rounded-lg"
          />
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <span className="text-gray-500">${book.price}</span>
          </div>
          <p className="mt-4 text-gray-600">{book.description}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-500">{book.categories.join(", ")}</span>
          </div>

          {/* Buttons for Cart, View, and Bookmark */}
          <div className="flex justify-between mt-4">
            {/* Cart Button */}
            <button
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300"
              onClick={() => addToCart(book)}
            >
              <FaShoppingCart className="mr-2" />
              Cart
            </button>

            {/* View Button */}
            <Link to={`/books/${book.id}`}>
              <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-300">
                View
              </button>
            </Link>

            {/* Bookmark Button */}
            <button
              className={`flex items-center py-2 px-4 rounded-lg transition duration-300 ${
                isBookBookmarked(book.id)
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}
              onClick={() => {
                if (!isBookBookmarked(book.id)) {
                  AddToBookmarks(book.id);
                }
              }}
              disabled={isBookBookmarked(book.id)}
            >
              <FaBookmark className="mr-2" />
              {isBookBookmarked(book.id) ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BooksCard;
