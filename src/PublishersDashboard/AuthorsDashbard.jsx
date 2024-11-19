import React, { useEffect, useState, useCallback } from "react";
import BookPublishingForm from "../components/Forms/Author/BookPublishingForm";
import BooksCard from "../components/Cards/BooksCard";
import { useBooks } from "../context/BooksContext";
import { useUser } from "../context/context";
import { FaShoppingCart } from "react-icons/fa";
import Cart from "../Cart/Cart";

const AuthorDashboard = () => {
  const { getBookmarkedBooks, getPublishedBooks } = useBooks();
  const [bookmarks, setBookmarks] = useState([]); // Updated to array for bookmarks
  const { user } = useUser();

  const [booksPublished, setBooksPublished] = useState([]);

  // Memoize the functions to prevent unnecessary re-renders
  const fetchBookmarkedBooks = useCallback(async () => {
    if (user && user.uid) {
      const books = await getBookmarkedBooks(user.uid);
      setBookmarks(books);
    }
  }, [getBookmarkedBooks, user]);

  // Fetch published books only if not already fetched
  const fetchPublishedBooks = useCallback(async () => {
    if (user?.uid && booksPublished.length === 0) {
      // Check if booksPublished are already set
      const books = await getPublishedBooks();
      setBooksPublished(books);
    }
  }, [getPublishedBooks, user, booksPublished]);

  useEffect(() => {
    // Call the functions to fetch books only when user data is available
    if (user?.uid) {
      fetchPublishedBooks();
      fetchBookmarkedBooks();
    }
  }, [user?.uid, fetchBookmarkedBooks, fetchPublishedBooks]);

  return (
    <div className="flex gap-5">
      <div className="md:w-64"></div>
      <div className="col-span-6">
        <div>Author Dashboard</div>
        <BookPublishingForm />
        <BooksCard />
        <div>
          <h2 className="text-2xl font-bold mb-4">Books Published</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {booksPublished.map((book) => (
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
                  <span className="text-gray-500">
                    {book.categories
                      ? book.categories.join(", ")
                      : "No categories available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Cart />
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Bookmarked Books</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.length > 0 ? (
              bookmarks.map((book) => (
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
                    <span className="text-gray-500">
                      {book.categories
                        ? book.categories.join(", ")
                        : "No categories available"}
                    </span>
                  </div>

                  {/* Cart and View buttons */}
                  <div className="flex justify-between mt-4">
                    <button
                      className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300"
                      onClick={() => alert(`Added ${book.title} to Cart`)}
                    >
                      <FaShoppingCart className="mr-2" />
                      Cart
                    </button>

                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-300"
                      onClick={() => alert(`Viewing ${book.title}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No bookmarked books yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDashboard;
