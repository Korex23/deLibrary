import React from "react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, getTotalPrice } = useCart();

  return (
    <>
      {cart.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <h1 className="text-3xl font-semibold text-gray-500">
            Your cart is empty
          </h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cart.map((book) => (
            <div
              key={book.id}
              className="p-4 bg-white rounded-lg shadow-md flex flex-col"
            >
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
            </div>
          ))}
        </div>
      )}
      <div>
        <h2>Total Price: ${getTotalPrice()}</h2>
      </div>
    </>
  );
};

export default Cart;
