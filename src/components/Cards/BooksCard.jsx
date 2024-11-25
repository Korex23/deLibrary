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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

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

  const handleAddToCart = async () => {
    if (!selectedBook) return; // Ensure a book is selected

    try {
      let referrerDetails = null;
      if (activeReferralCode.trim()) {
        const { isValid, referrerId } = await checkValidReferralCode(
          activeReferralCode
        );

        if (isValid) {
          referrerDetails = { id: referrerId };
          setReferralCode(activeReferralCode);
        } else {
          setErrorMessage("Invalid referral code.");
          return;
        }
      }

      // Add to cart logic
      await addToCart(selectedBook, activeReferralCode, referrerDetails);

      // Reset modal state
      setIsModalOpen(false);
      setSelectedBook(null);
      setActiveReferralCode("");
      setErrorMessage("");
      toast.success(`${selectedBook.title} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add book to cart.");
    }
  };

  const isBookBookmarked = (bookId) =>
    bookmarks.some((bookmark) => bookmark.id === bookId);
  const isBookInCart = (bookId) => cart.some((item) => item.id === bookId);
  const isBookBought = (bookId) =>
    userDetails.booksbought.some((book) => book.id === bookId);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allBooks.map((book) => (
        <div key={book.id} className="relative group">
          <Link to={`/books/${book.id}`} className="block">
            <div className="p-4 bg-white rounded-lg shadow-md flex flex-col w-[230px]">
              <img
                src={book.frontCoverUrl}
                alt={book.title}
                className="h-32 w-32 object-cover rounded-lg"
              />
              <h2 className="text-xl font-semibold mt-4">{book.title}</h2>
              <span className="text-gray-500">${book.price}</span>
              <p className="mt-4 text-gray-600 line-clamp-2">
                {book.description}
              </p>
              <span className="text-gray-500 mt-4">
                {book.categories.join(", ")}
              </span>
            </div>
          </Link>

          {/* Hover Buttons */}
          <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2 mb-4">
              <button
                className={`py-2 px-4 rounded-lg ${
                  isBookInCart(book.id) || isBookBought(book.id)
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-[#005097] hover:bg-blue-600 text-white"
                }`}
                onClick={(e) => {
                  e.preventDefault(); // Prevent Link click
                  if (!isBookInCart(book.id) && !isBookBought(book.id)) {
                    setSelectedBook(book);
                    setIsModalOpen(true); // Open modal
                  }
                }}
                disabled={isBookInCart(book.id) || isBookBought(book.id)}
              >
                <FaShoppingCart />
              </button>

              <button
                className={`py-2 px-4 rounded-lg ${
                  isBookBookmarked(book.id)
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
                onClick={(e) => {
                  e.preventDefault(); // Prevent Link click
                  if (!isBookBookmarked(book.id)) {
                    AddToBookmarks(book.id);
                  }
                }}
                disabled={isBookBookmarked(book.id)}
              >
                <FaBookmark />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-96"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            <h3 className="text-xl font-semibold mb-4">Enter Referral Code</h3>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Referral code (Optional)"
              value={activeReferralCode}
              onChange={(e) => setActiveReferralCode(e.target.value)}
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#005097] hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksCard;
