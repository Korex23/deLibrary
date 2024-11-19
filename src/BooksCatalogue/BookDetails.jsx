import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { Document, Page, pdfjs } from "react-pdf";
import { FaShoppingCart } from "react-icons/fa";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useCart } from "../context/CartContext";
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useUser } from "../context/context";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BookDetails = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { getABook, bookInfo } = useBooks();
  const { userDetails } = useUser();
  const { addToCart } = useCart();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const currentUser = auth.currentUser;

  useEffect(() => {
    setLoading(true);
    getABook(bookId).finally(() => setLoading(false));
  }, [bookId, getABook]);

  // useEffect(() => {
  //   if (ratings.length > 0) {
  //     const avg = ratings.reduce((sum, rate) => sum + rate, 0) / ratings.length;
  //     setAverageRating(avg.toFixed(1));
  //   } else {
  //     setAverageRating(0);
  //   }
  // }, [ratings]);

  // const submitRating = async () => {
  //   if (userRating > 0 && userRating <= 5) {
  //     setRatings((prev) => [...prev, userRating]);
  //     setUserRating(0);
  //   }

  //   // Reference the specific document
  //   const bookRef = doc(db, "books", bookId);

  //   // Update the document
  //   await updateDoc(bookRef, {
  //     ratings: [userRating],
  //   });
  // };

  useEffect(() => {
    if (bookInfo) {
      setRatings(bookInfo.ratings || []);
      setReviews(bookInfo.reviews);
      console.log(reviews);

      const existingRating = bookInfo.ratings.find(
        (rating) => rating.uid === currentUser.uid
      );
      if (existingRating) setUserRating(existingRating.rating);
    }
  }, [bookInfo, currentUser]);

  useEffect(() => {
    if (ratings.length > 0) {
      const avg =
        ratings.reduce((sum, { rating }) => sum + rating, 0) / ratings.length;
      setAverageRating(avg.toFixed(1));
    } else {
      setAverageRating(0);
    }
  }, [ratings]);

  const submitRating = async () => {
    if (userRating > 0 && userRating <= 5) {
      const updatedRatings = [...ratings];
      const existingIndex = updatedRatings.findIndex(
        (rating) => rating.uid === currentUser.uid
      );

      if (existingIndex !== -1) {
        updatedRatings[existingIndex].rating = userRating; // Update existing rating
      } else {
        updatedRatings.push({ uid: currentUser.uid, rating: userRating }); // Add new rating
      }

      setRatings(updatedRatings);

      const bookRef = doc(db, "books", bookId);
      await updateDoc(bookRef, { ratings: updatedRatings });
    }
  };

  const submitReview = async () => {
    if (newReview.trim()) {
      const newReviewData = {
        uid: currentUser.uid,
        firstName: userDetails.firstname,
        lastName: userDetails.lastname,
        comment: newReview.trim(),
        createdAt: Date.now(),
      };

      const updatedReviews = [...reviews, newReviewData];
      setReviews(updatedReviews);
      setNewReview("");

      const bookRef = doc(db, "books", bookId);
      await updateDoc(bookRef, { reviews: updatedReviews });
    }
  };

  if (loading) {
    return <p className="text-center mt-4">Loading book details...</p>;
  }
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));
  };

  // const submitReview = () => {
  //   if (newReview.trim()) {
  //     setReviews((prevReviews) => [
  //       ...prevReviews,
  //       { id: Date.now(), user: "Anonymous", comment: newReview.trim() },
  //     ]);
  //     setNewReview("");
  //   }
  // };

  if (loading) {
    return <p className="text-center mt-4">Loading book details...</p>;
  }

  if (!bookInfo) {
    return <p className="text-center mt-4">Book not found!</p>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-5">
      <div className="md:w-64"></div>
      <div className="col-span-6">
        {/* Breadcrumb Navigation */}
        <nav className="text-gray-500 mb-4">
          <span
            onClick={() => navigate("/books")}
            className="cursor-pointer hover:underline"
          >
            Books
          </span>
          {" / "}
          <span>{bookInfo.title}</span>
        </nav>

        {/* Book Details */}
        <div className="flex flex-col items-center p-6">
          <h1 className="text-3xl font-bold mb-6">{bookInfo.title}</h1>
          <img
            src={bookInfo.frontCoverUrl}
            alt={bookInfo.title}
            className="h-64 w-full md:w-48 object-cover rounded-lg mb-4"
          />
          <p className="text-lg mb-2">{bookInfo.description}</p>
          <span className="text-gray-500 mb-4">
            Categories: {bookInfo.categories.join(", ")}
          </span>
          <p className="text-lg font-bold mt-4">Price: ${bookInfo.price}</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => addToCart(bookInfo)}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <FaShoppingCart />
              Add to Cart
            </button>
            <a
              href={bookInfo.pdfUrl}
              download={`${bookInfo.title}.pdf`}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg"
            >
              Download PDF
            </a>
          </div>

          {/* PDF Viewer */}
          <div className="mt-4 w-full flex flex-col items-center">
            <Document
              file={bookInfo.pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<p>Loading {bookInfo.title}</p>}
            >
              <Page
                pageNumber={currentPage}
                width={600}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="no-margin"
              />
            </Document>

            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-300"
              >
                Previous
              </button>
              <p>
                Page {currentPage} of {numPages}
              </p>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-8 w-full">
            <h2 className="text-2xl font-bold mb-4">Rate This Book</h2>
            <p className="text-lg font-bold mt-4">
              Average Rating: {averageRating}
            </p>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  onClick={() => setUserRating(index + 1)}
                  className={`cursor-pointer ${
                    userRating > index ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  {userRating > index ? "★" : "☆"}
                </span>
              ))}
            </div>
            <button
              onClick={submitRating}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              Submit Rating
            </button>
            <p className="mt-4 text-lg">
              Average Rating: {averageRating} ({ratings.length} ratings)
            </p>
          </div>

          {/* User Reviews */}
          <div className="mt-8 w-full">
            <h2 className="text-2xl font-bold mt-8">Reviews</h2>
            {reviews.map((review) => (
              <div key={review.createdAt} className="mb-4">
                <p className="font-semibold">
                  {review.firstName} {review.lastName}
                </p>
                <p>{review.comment}</p>
              </div>
            ))}
            <textarea
              placeholder="Write your review here..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="w-full border p-2 rounded-lg mb-2"
            />
            <button
              onClick={submitReview}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
