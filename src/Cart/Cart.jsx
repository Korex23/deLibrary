import React from "react";
import { useCart } from "../context/CartContext";
import { PaystackButton } from "react-paystack";

const Cart = () => {
  const { cart, getTotalPrice, removeFromCart, componentProps } = useCart();

  return (
    <div className="container mx-auto p-4">
      {cart.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <h1 className="text-3xl font-semibold text-gray-500">
            Your cart is empty
          </h1>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="flex-grow">
            <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>
            <div className="space-y-4">
              {cart.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center bg-white rounded-lg shadow-md p-4"
                >
                  {/* Book Image */}
                  <img
                    src={book.frontCoverUrl}
                    alt={book.title}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  {/* Book Details */}
                  <div className="flex-1 ml-4">
                    <h2 className="text-lg font-semibold">{book.title}</h2>
                    <p className="text-gray-600 mt-1">{book.description}</p>
                    <span className="text-gray-500">
                      Categories: {book.categories.join(", ")}
                    </span>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-lg font-semibold">
                        ${book.price}
                      </span>
                      {/* Quantity Control (Placeholder) */}
                      <div className="flex items-center space-x-2">
                        <button className="px-2 py-1 bg-gray-200 rounded-lg">
                          -
                        </button>
                        <span>1</span>{" "}
                        {/* Replace "1" with quantity if tracking */}
                        <button className="px-2 py-1 bg-gray-200 rounded-lg">
                          +
                        </button>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(book.id)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-lg font-semibold">${getTotalPrice()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Shipping</span>
              <span className="text-lg font-semibold">$5.00</span>{" "}
              {/* Example fixed shipping */}
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>${getTotalPrice() + 5}</span>
            </div>
            <PaystackButton {...componentProps} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
