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

const BooksForYou = () => {
  const { userDetails } = useUser();
  const { allBooks, getBoughtBooks, bookmarks, getBookmarkedBooks } =
    useBooks();
  const { cart, addToCart, setReferralCode } = useCart();

  const [activeReferralCode, setActiveReferralCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [authors, setAuthors] = useState({});
  const [boughtBooks, setBoughtBooks] = useState([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  const [allTheBooks, setAllTheBooks] = useState([]);
  const [booksForYou, setBooksForYou] = useState([]);

  // Function to get books bought by the user
  const fetchBoughtBooks = async () => {
    if (userDetails) {
      const books = await getBoughtBooks(userDetails.id);
      const bookmarked = await getBookmarkedBooks(userDetails.id);
      setBookmarkedBooks(bookmarked);
      setBoughtBooks(books);

      setAllTheBooks([...books, ...bookmarked]);
      console.log("All the books:", allTheBooks);
    }
  };

  // Function to get the two most frequent categories and filter books
  const getBooksForYou = () => {
    if (allTheBooks.length > 0) {
      // Create an array to store all the categories
      const allCategories = [];

      // Loop through each book in boughtBooks and extract categories
      allTheBooks.forEach((book) => {
        if (book.categories && Array.isArray(book.categories)) {
          allCategories.push(...book.categories);
        }
      });

      // Log all categories to the console
      console.log("All categories from bought books:", allCategories);

      // Count the frequency of each category
      const categoryCounts = allCategories.reduce((counts, category) => {
        counts[category] = (counts[category] || 0) + 1;
        return counts;
      }, {});

      // Sort categories by frequency (most frequent first)
      const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category);

      // Get the top two most frequent categories
      const topCategories = sortedCategories.slice(0, 2);
      console.log("Top 2 categories:", topCategories);

      // Filter allBooks to find books that match the top categories
      const booksForYou = allBooks.filter((book) =>
        book.categories?.some((category) => topCategories.includes(category))
      );

      // Store the filtered books in the state
      setBooksForYou(booksForYou);
      console.log("Books for you:", booksForYou);
    }
  };

  useEffect(() => {
    if (userDetails) {
      fetchBoughtBooks();
    }
  }, [userDetails]);

  useEffect(() => {
    if (boughtBooks.length > 0) {
      getBooksForYou();
    }
  }, [boughtBooks]);

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
    booksForYou.forEach((book) => {
      getAuthor(book);
    });
  }, [booksForYou]);
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
      <div>
        <div className="grid grid-cols-5 gap-9">
          {booksForYou.map((book) => {
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
                  {authors[book.id]
                    ? `${authors[book.id]}`
                    : "Loading author..."}
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
    </div>
  );
};

export default BooksForYou;
