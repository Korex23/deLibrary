import React, { useEffect, useState, useCallback } from "react";
import BookPublishingForm from "../components/Forms/Author/BookPublishingForm";
import BooksCard from "../components/Cards/BooksCard";
import { useBooks } from "../context/BooksContext";
import { useUser } from "../context/context";
import AddTasksToBook from "../components/Cards/Author/AddTasksToBook";

import { Link } from "react-router-dom";

import SalesRecord from "./SalesRecord";
import PublishedBooksStatistics from "../components/Cards/Author/PublishedBooksStatistics";

const AuthorDashboard = () => {
  const { getBookmarkedBooks, getPublishedBooks } = useBooks();
  const [bookmarks, setBookmarks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const { user, userDetails } = useUser();

  const [booksPublished, setBooksPublished] = useState([]);

  const openModalHandler = () => {
    setOpenModal(true);
  };

  const closeModalHandler = () => {
    setOpenModal(false);
  };
  const openModalHandler2 = (id) => {
    setSelectedBookId(id); // Set the selected book ID
    setOpenModal2(true);
  };

  const closeModalHandler2 = () => {
    setOpenModal2(false);
    setSelectedBookId(null); // Clear the selected book ID
  };

  const fetchBookmarkedBooks = useCallback(async () => {
    if (user && user.uid) {
      const books = await getBookmarkedBooks(user.uid);
      setBookmarks(books);
    }
  }, [getBookmarkedBooks, user]);

  const fetchPublishedBooks = useCallback(async () => {
    if (user?.uid && booksPublished.length === 0) {
      const books = await getPublishedBooks();
      setBooksPublished(books);
    }
  }, [getPublishedBooks, user, booksPublished]);

  useEffect(() => {
    if (user?.uid) {
      fetchPublishedBooks();
      fetchBookmarkedBooks();
    }
  }, [user?.uid, fetchBookmarkedBooks, fetchPublishedBooks]);

  return (
    <div className="flex gap-5">
      <div className="md:w-72"></div>
      <div className="bg-gray-100 min-h-screen p-6 mt-16">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#005097]">
              Author Dashboard
            </h1>
            <button
              onClick={openModalHandler}
              className="bg-[#005097] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md"
            >
              Publish New Book
            </button>
          </div>

          {/* Modal */}
          {openModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="rounded-lg shadow-lg p-8 relative w-[60%]">
                {/* Close button */}
                <button
                  onClick={closeModalHandler}
                  className="absolute top-20 right-20 text-red-500 text-4xl"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">Publish New Book</h2>
                <BookPublishingForm />
              </div>
            </div>
          )}

          {/* Statistics */}
          <PublishedBooksStatistics />

          {/* Sales Records */}
          <SalesRecord />

          {/* Books Published Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Books Published
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {booksPublished.map((book) => (
                <div
                  key={book.id}
                  className="relative group p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <Link to={`/books/${book.id}`} className="block">
                    <img
                      src={book.frontCoverUrl}
                      alt={`Cover of ${book.title}`}
                      className="h-40 w-full object-cover rounded-md mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-700 group-hover:text-blue-600">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 mt-1 text-sm">${book.price}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {book.categories?.join(", ") || "No categories"}
                  </p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => openModalHandler2(book.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Add Tasks
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fallback for no books */}
            {booksPublished.length === 0 && (
              <p className="text-gray-500 text-center mt-6">
                No books published yet. Click "Publish New Book" to get started.
              </p>
            )}

            {/* Modal for Adding Tasks */}
            {openModal2 && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 relative w-[90%] md:w-[60%]">
                  {/* Close button */}
                  <button
                    onClick={closeModalHandler2}
                    className="absolute top-4 right-4 text-red-500 text-2xl font-bold"
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Add Task</h2>
                  {selectedBookId && <AddTasksToBook id={selectedBookId} />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDashboard;
