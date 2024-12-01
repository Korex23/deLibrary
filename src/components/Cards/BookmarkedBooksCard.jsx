import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useBooks } from "../../context/BooksContext";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/context";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";

const BookmarkedBooksCard = () => {
  const { getBookmarkedBooks } = useBooks();
  const { cart, addToCart } = useCart();
  const { user } = useUser();

  const [bookmarks, setBookmarks] = useState([]);
  const [authors, setAuthors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Default entries per page

  const fetchBookmarkedBooks = useCallback(async () => {
    if (user && user.uid) {
      const books = await getBookmarkedBooks(user.uid);
      setBookmarks(books);
    }
  }, [getBookmarkedBooks, user]);

  useEffect(() => {
    if (user?.uid) {
      fetchBookmarkedBooks();
    }
  }, [user?.uid, fetchBookmarkedBooks]);

  const getAuthor = async (book) => {
    if (!authors[book.id]) {
      try {
        const authorRef = await getDoc(doc(db, "users", book.authorId));
        if (authorRef.exists()) {
          const authorData = authorRef.data();
          setAuthors((prevAuthors) => ({
            ...prevAuthors,
            [book.id]: `${authorData.firstname} ${authorData.lastname}`,
          }));
        }
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    }
  };

  useEffect(() => {
    bookmarks.forEach((book) => {
      getAuthor(book);
    });
  }, [bookmarks]);

  // Calculate the current entries to display
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentBookmarks = bookmarks.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  return (
    <div>
      <div className="grid grid-cols-5 gap-9">
        {currentBookmarks.length > 0 ? (
          currentBookmarks.map((book) => (
            <div
              key={book.id}
              className="relative group p-4 bg-white rounded-lg shadow-md w-[190px]"
            >
              <Link to={`/books/${book.id}`} className="block">
                <img
                  src={book.frontCoverUrl}
                  alt={`Cover of ${book.title}`}
                  className="h-28 w-28 object-cover rounded-lg mx-auto"
                />
                <h2 className="text-lg font-semibold mt-4 text-center">
                  {book.title}
                </h2>
              </Link>
              <span className="text-gray-500 text-center block">
                ${book.price}
              </span>
              <p className="mt-4 text-gray-600 line-clamp-2">
                {authors[book.id] || "Loading author..."}
              </p>
              <span className="text-gray-500 mt-4 block text-sm">
                {book.categories?.join(", ") || "No categories"}
              </span>
            </div>
          ))
        ) : (
          <p>No bookmarked books yet.</p>
        )}
      </div>
      {bookmarks.length > 0 && (
        <Pagination
          totalEntries={bookmarks.length}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default BookmarkedBooksCard;
