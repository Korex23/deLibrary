import React, { useState, useCallback, useEffect } from "react";
import { useBooks } from "../../context/BooksContext";
import { FaShoppingCart, FaBookmark } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useUser } from "../../context/context";
import Pagination from "../Pagination";

const LatestBooksCard = () => {
  const { allBooks, AddToBookmarks, bookmarks } = useBooks();
  const { cart, addToCart, setReferralCode } = useCart();
  const { userDetails } = useUser();

  const [activeReferralCode, setActiveReferralCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [authors, setAuthors] = useState({});

  function getNewestItems(allBooks) {
    return allBooks
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)) // Sort in descending order
      .slice(0, 10); // Get the top 10
  }

  // Example usage
  const latestBooks = getNewestItems(allBooks);
  console.log(latestBooks);

  // Function to fetch author data
  const getAuthor = async (book) => {
    if (!authors[book.id]) {
      // Prevent duplicate fetching
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
    allBooks.forEach((book) => {
      getAuthor(book);
    });
  }, [allBooks]);
  const checkValidReferralCode = useCallback(async (referralCode) => {
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
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!selectedBook) {
      console.log("No book selected");
      return; // Ensure a book is selected
    }

    try {
      let referrerDetails = null;

      if (activeReferralCode.trim()) {
        console.log("Checking referral code:", activeReferralCode);

        const { isValid, referrerId } = await checkValidReferralCode(
          activeReferralCode
        );

        console.log("Referral code validation result:", {
          isValid,
          referrerId,
        });

        if (!isValid) {
          setErrorMessage("Invalid referral code.");
          console.log("Invalid referral code entered.");
          return;
        }

        if (selectedBook.isDistributorsAllowed) {
          const allowedDistributors = selectedBook.allowedDistributors || [];
          console.log(
            "Distributors allowed:",
            selectedBook.isDistributorsAllowed
          );
          console.log("Allowed distributors:", allowedDistributors);

          if (allowedDistributors.length > 0) {
            console.log(
              "Checking if referrerId is in allowedDistributors:",
              referrerId
            );

            if (
              !allowedDistributors.some(
                (distributor) => distributor.value === referrerId
              )
            ) {
              setErrorMessage(
                "Referral code does not match any allowed distributor."
              );
              console.log(
                "Referral code is valid but not in allowed distributors list."
              );
              return;
            }
          }
        }

        console.log("Referral code is valid and authorized.");
        referrerDetails = { id: referrerId };
        setReferralCode(activeReferralCode);
      }

      // Add to cart logic
      console.log("Adding to cart:", {
        selectedBook,
        activeReferralCode,
        referrerDetails,
      });

      await addToCart(selectedBook, activeReferralCode, referrerDetails);

      // Reset modal state
      setIsModalOpen(false);
      setSelectedBook(null);
      setActiveReferralCode("");
      setErrorMessage("");
      toast.success(`${selectedBook.title} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("Failed to add book to cart.");
    }
  }, [
    selectedBook,
    activeReferralCode,
    checkValidReferralCode,
    setReferralCode,
    addToCart,
  ]);

  const isBookBookmarked = (bookId) =>
    bookmarks.some((bookmark) => bookmark.id === bookId);
  const isBookInCart = (bookId) => cart.some((item) => item.id === bookId);
  const isBookBought = (bookId) =>
    userDetails?.booksbought?.some((book) => book.id === bookId) || false;

  return (
    <div>
      <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-9">
        {latestBooks.map((book) => {
          const isDisabled = isBookInCart(book.id) || isBookBought(book.id);

          return (
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
                {authors[book.id] ? `${authors[book.id]}` : "Loading author..."}
              </p>
              <span className="text-gray-500 mt-4 block text-sm">
                {book.categories?.join(", ") || "No categories"}
              </span>

              {/* Hover Buttons */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex gap-2 mb-4 pointer-events-auto">
                  <button
                    className={`py-2 px-4 rounded-lg ${
                      isDisabled
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-[#005097] hover:bg-blue-600 text-white"
                    }`}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default link behavior
                      if (!isDisabled) {
                        setSelectedBook(book);
                        setIsModalOpen(true);
                      }
                    }}
                    disabled={isDisabled}
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
                      e.preventDefault(); // Prevent default link behavior
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
          );
        })}

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false); // Close only on overlay click
            }}
          >
            <div
              className="bg-white p-6 rounded-lg w-96"
              onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
            >
              <h3 className="text-xl font-semibold mb-4">
                Enter Referral Code
              </h3>
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
    </div>
  );
};

export default LatestBooksCard;
