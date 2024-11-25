import React, { useState } from "react";
import { useBooks } from "../../context/BooksContext";
import { FaShoppingCart, FaBookmark } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { useUser } from "../../context/context";

const BooksCard = () => {
  const { allBooks, AddToBookmarks, bookmarks } = useBooks();
  const { cart, addToCart, setReferralCode } = useCart();
  const { userDetails } = useUser();

  const [activeReferralCode, setActiveReferralCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const checkValidReferralCode = async (referralCode) => {
    try {
      const q = query(
        collection(db, "users"),
        where("referralCode", "==", referralCode)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        return { isValid: true, referrerId: referrerDoc.id };
      }

      return { isValid: false, referrerId: null };
    } catch (error) {
      console.error("Error checking referral code:", error);
      return { isValid: false, referrerId: null };
    }
  };

  const handleAddToCart = async (book) => {
    try {
      // If a referral code is entered, validate it
      let referrerDetails = null;
      if (activeReferralCode.trim()) {
        const { isValid, referrerId } = await checkValidReferralCode(
          activeReferralCode
        );

        if (isValid) {
          referrerDetails = { id: referrerId };
          setReferralCode(activeReferralCode); // Store the referral code
        } else {
          setErrorMessage("Invalid referral code.");
        }
      }

      // Add the book to the cart regardless of referral code validity
      await addToCart(book, activeReferralCode, referrerDetails);

      // Reset state after adding to cart
      setActiveReferralCode(""); // Clear the entered referral code
      setErrorMessage(""); // Clear error messages
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
      // toast.error("Failed to add book to cart.");
    }
  };

  const isBookBookmarked = (bookId) => {
    return bookmarks.some((bookmark) => bookmark.id === bookId);
  };

  const isBookInCart = (bookId) => {
    return cart.some((item) => item.id === bookId);
  };

  const isBookBought = (bookId) => {
    return userDetails.booksbought.some((book) => book.id === bookId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allBooks.map((book) => (
        <Link to={`/books/${book.id}`} key={book.id}>
          <div className="p-4 bg-white rounded-lg shadow-md flex flex-col">
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
                {book.categories.join(", ")}
              </span>
            </div>

            {/* Referral Code Input for Allowed Distributors */}
            {book.isDistributorsAllowed &&
              !isBookInCart(book.id) &&
              !isBookBought(book.id) && (
                <div className="mt-4">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter referral code (Optional)"
                    value={activeReferralCode}
                    onChange={(e) => setActiveReferralCode(e.target.value)}
                  />
                  {errorMessage && (
                    <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                  )}
                </div>
              )}

            {/* Buttons for Cart, View, and Bookmark */}
            <div className="flex justify-between mt-4">
              {/* Cart Button */}
              <button
                className={`flex items-center py-2 px-4 rounded-lg transition duration-300 ${
                  isBookInCart(book.id) || isBookBought(book.id)
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                onClick={() => handleAddToCart(book)} // Always call handleAddToCart
                disabled={isBookInCart(book.id) || isBookBought(book.id)} // Disable only for already added books
              >
                <FaShoppingCart className="mr-2" />
                {isBookBought(book.id)
                  ? "Bought"
                  : isBookInCart(book.id)
                  ? "In Cart"
                  : "Add to Cart"}
              </button>

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
        </Link>
      ))}
    </div>
  );
};

export default BooksCard;
