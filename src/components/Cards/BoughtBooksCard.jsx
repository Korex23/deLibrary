import React, { useEffect, useState } from "react";
import { useUser } from "../../context/context";
import { pdfjs } from "react-pdf";
import { Link } from "react-router-dom";

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BoughtBooksCard = ({ book }) => {
  const { userDetails } = useUser();
  const { id, frontCoverUrl, title, price, description } = book;

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        // Check if the book is in the user's bought list
        const hasBoughtBook = userDetails.booksbought?.some(
          (book) => book.id === id
        );

        if (!hasBoughtBook) {
          setError("You haven't purchased this book.");
          return;
        }

        // Fetch the current page from the user's booksbought array
        const userBook = userDetails.booksbought.find((book) => book.id === id);
        if (userBook && userBook.currentPage) {
          setCurrentPage(userBook.currentPage || 10); // Set the current page from Firestore
          setNumPages(userBook.numberOfPages || 200);
          setRatings(userBook.ratings || []);
        } else {
          setCurrentPage(1); // Default to page 1 if no page info is available
        }
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("An error occurred while fetching the book.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, userDetails]);

  useEffect(() => {
    if (ratings.length > 0) {
      const avg =
        ratings.reduce((sum, { rating }) => sum + rating, 0) / ratings.length;
      setAverageRating(avg.toFixed(1));
    } else {
      setAverageRating(0);
    }
  }, [ratings]);

  const progress = Math.min((currentPage / numPages) * 100, 100);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md grid grid-cols-5 gap-5">
      <div>
        <img
          src={frontCoverUrl}
          alt={title}
          className="h-24 w-24 object-cover rounded-lg"
        />
      </div>

      {/* <p className="mt-4 text-lg">
        Average Rating: {averageRating} ({ratings.length} ratings)
      </p> */}

      {/* Progress Bar */}
      <div className="col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <label className="block text-gray-500">Reading Progress</label>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-[#005097] h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-gray-500 text-sm mt-1">{`${Math.round(
          progress
        )}% Completed`}</span>
      </div>

      {/* Error and Loading States */}
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {loading && <div className="text-gray-500">Loading...</div>}

      <div className="flex justify-between mt-4 ml-auto">
        <Link to={`/books/read/${id}`}>
          <button className="bg-[#005097] hover:bg-[#72c6f3] text-white py-2 px-4 rounded-lg transition duration-300">
            Read
          </button>
        </Link>
      </div>
    </div>
  );
};

export default BoughtBooksCard;
