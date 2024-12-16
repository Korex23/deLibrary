import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { Document, Page, pdfjs } from "react-pdf";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { db, auth } from "../firebase/config";
import { doc, updateDoc, getDoc, collection } from "firebase/firestore";
import { useUser } from "../context/context";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  XIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BookDetails = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { getABook, currentBook, getBoughtBooks } = useBooks();
  const { userDetails, user } = useUser();
  const { addToCart, cart } = useCart();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [boughtBooks, setBoughtBooks] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [responses, setResponses] = useState({});
  const [author, setAuthor] = useState("");
  const [authorId, setAuthorId] = useState("");

  const currentUser = auth.currentUser;

  useEffect(() => {
    setLoading(true);
    getABook(bookId).finally(() => setLoading(false));

    if (user) {
      getBoughtBooks(user.uid).then((books) => {
        setBoughtBooks(books);
      });
    }
  }, [bookId, getABook]);

  useEffect(() => {
    if (currentBook) {
      setRatings(currentBook.ratings || []);
      setReviews(currentBook.reviews || []);
      setAuthorId(currentBook.authorId);
      const existingRating = currentBook.ratings.find(
        (rating) => rating.uid === currentUser?.uid
      );
      if (existingRating) setUserRating(existingRating.rating);
    }
  }, [currentBook, currentUser]);

  const getAuthor = async () => {
    const authorRef = doc(db, "users", authorId);
    const authorDoc = await getDoc(authorRef);
    if (authorDoc.exists()) {
      const authorData = authorDoc.data();
      setAuthor(`${authorData.firstname} ${authorData.lastname}`);
    }
  };

  useEffect(() => {
    if (authorId) {
      getAuthor();
    }
  }, [authorId]);

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
        updatedRatings[existingIndex].rating = userRating;
      } else {
        updatedRatings.push({ uid: currentUser.uid, rating: userRating });
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

  if (!currentBook) {
    return <p className="text-center mt-4">Book not found!</p>;
  }

  const shareUrl = window.location.href; // Get the current URL
  const title = currentBook?.title;

  const isBookInCart = cart.some((item) => item.id === currentBook.id);
  const isBookBought = boughtBooks.some((book) => book.id === currentBook.id);

  return (
    <div className="flex gap-5">
      <div className="md:w-64"></div>
      <div className="p-5 w-[100%] mt-16">
        <div className="flex flex-col md:flex-row gap-8 p-6 w-[100%] rounded-xl bg-gray-50 shadow-lg">
          {/* Book Covers Section */}
          <div className="flex flex-col items-center md:w-1/2">
            <div className="flex gap-4">
              <img
                src={currentBook.frontCoverUrl}
                alt={currentBook.title}
                className="h-80 w-56 object-cover rounded-lg shadow-lg"
              />
              <img
                src={currentBook.backCoverUrl}
                alt={`${currentBook.title} - Back Cover`}
                className="h-80 w-56 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <FacebookShareButton url={shareUrl} quote={title}>
                <FacebookIcon size={40} round />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={title}>
                <XIcon size={40} round />
              </TwitterShareButton>
              <WhatsappShareButton url={shareUrl} title={title}>
                <WhatsappIcon size={40} round />
              </WhatsappShareButton>
              <EmailShareButton
                url={shareUrl}
                subject={title}
                body={`Check out this book: ${title}`}
              >
                <EmailIcon size={40} round />
              </EmailShareButton>
            </div>

            {/* Tasks Section */}
            {isBookBought && (
              <div className="mt-6 w-full">
                <h2
                  className={`text-2xl font-bold ${
                    currentBook.question_answer ? "hidden" : "block"
                  }`}
                >
                  Tasks
                </h2>
                {currentBook.question_answer &&
                  currentBook?.question_answer.map((qna, index) => (
                    <div
                      key={index}
                      className="mt-4 bg-gray-100 p-4 rounded-lg shadow-sm"
                    >
                      <p className="font-semibold text-lg">{qna.task}</p>

                      {/* Display Existing Answers */}
                      <div className="mt-3">
                        <h3 className="font-bold text-gray-700">Responses:</h3>
                        {qna.answers && qna.answers.length > 0 ? (
                          qna.answers.map((answer, idx) => (
                            <p key={idx} className="text-gray-600 mt-2">
                              {idx + 1}. {answer.response}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500">No responses yet.</p>
                        )}
                      </div>

                      {/* Submit New Response */}
                      <textarea
                        placeholder="Write your response here..."
                        value={responses[index] || ""}
                        onChange={(e) =>
                          setResponses((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        className="w-full border p-3 rounded-lg mt-3"
                      />
                      <button
                        onClick={async () => {
                          const responseText = responses[index]?.trim();
                          if (responseText) {
                            const updatedQnA = [...currentBook.question_answer];
                            updatedQnA[index].answers = [
                              ...(updatedQnA[index].answers || []),
                              {
                                uid: user?.uid,
                                response: responseText,
                              },
                            ];

                            // Update local state for responses
                            setResponses((prev) => ({
                              ...prev,
                              [index]: "",
                            }));

                            // Update Firestore
                            const bookRef = doc(db, "books", bookId);
                            await updateDoc(bookRef, {
                              question_answer: updatedQnA,
                            });
                          }
                        }}
                        className="bg-[#005097] hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4"
                      >
                        Submit Response
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Details and Review Section */}
          <div className="flex flex-col md:w-1/2">
            <h1 className="text-4xl font-bold mb-4 text-center md:text-left">
              {currentBook.title}
            </h1>
            <h2 className="text-xl font-semibold mb-4 text-center md:text-left">
              {author}
            </h2>
            <p className="text-lg mb-2">{currentBook.description}</p>

            <span className="text-gray-500 mb-4">
              Categories: {currentBook.categories.join(", ")}
            </span>
            <p className="text-2xl font-semibold mt-4 text-green-600">
              ₦ {currentBook.price}
            </p>
            <button
              onClick={() => addToCart(currentBook)}
              disabled={isBookInCart || isBookBought}
              className={`bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg flex items-center gap-2 mt-6 w-full md:w-auto ${
                isBookInCart ||
                (isBookBought && "cursor-not-allowed opacity-50")
              }`}
            >
              <FaShoppingCart />
              {isBookBought
                ? " (Already Bought)"
                : isBookInCart
                ? "Added to Cart"
                : "Add to Cart"}
            </button>

            {/* Rating Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold">Rate This Book</h2>
              <p className="text-xl my-4">
                Average Rating: {averageRating}{" "}
                <span className="text-yellow-500 text-xl">★</span>
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    onClick={() => setUserRating(index + 1)}
                    className={`cursor-pointer text-3xl ${
                      userRating > index ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    {userRating > index ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <button
                onClick={submitRating}
                className="bg-[#005097] hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4"
              >
                Submit Rating
              </button>
            </div>

            {/* Reviews Section */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <p>No reviews yet. Be the first to leave a review!</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.createdAt}
                    className="p-4 mb-4 bg-gray-100 rounded-lg shadow-sm"
                  >
                    <p className="font-semibold">
                      {review.firstName} {review.lastName}
                    </p>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
              <textarea
                placeholder="Write your review here..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="w-full border p-3 rounded-lg mt-4"
              />
              <button
                onClick={submitReview}
                className="bg-[#005097] hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
