import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { PaystackButton } from "react-paystack";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { FaMinus } from "react-icons/fa6";

const Cart = () => {
  const { cart, getTotalPrice, removeFromCart, componentProps, payWithWallet } =
    useCart();

  const [authors, setAuthors] = useState({});

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
    cart.forEach((book) => {
      getAuthor(book);
    });
  }, [cart]);

  return (
    <div className="container mx-auto p-4">
      {cart.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <h1 className="text-3xl font-semibold text-gray-500">
            Your cart is empty
          </h1>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Cart Items Section */}
          <div className="w-[380px]">
            <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>
            <div className="space-y-4">
              {cart.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center bg-white rounded-lg shadow-md p-4 relative"
                >
                  {/* Book Image */}
                  <img
                    src={book.frontCoverUrl}
                    alt={book.title}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  {/* Book Details */}
                  <div className="flex-1 ml-4">
                    <h2 className="text-lg font-semibold capitalize">
                      {book.title}
                    </h2>
                    <span className="text-gray-500">
                      {authors[book.id]
                        ? `${authors[book.id]}`
                        : "Loading author..."}
                    </span>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-lg font-semibold">
                        ${book.price}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(book.id)}
                        className="text-red-500 hover:text-red-700 font-semibold absolute top-1 right-2"
                      >
                        {/* <FaMinus /> */}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>${getTotalPrice()}</span>
            </div>
            <div className="bg-[#005097] px-3 py-2 text-white w-full text-center rounded-lg mt-4">
              <PaystackButton {...componentProps} />
            </div>
            <button
              onClick={payWithWallet}
              className="bg-[#72c6f3] text-white px-3 py-2 mt-2 w-full rounded-lg"
            >
              Pay with Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
