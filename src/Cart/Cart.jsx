import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/context";
import { PaystackButton } from "react-paystack";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { IoCartOutline } from "react-icons/io5";

const Cart = () => {
  const publicKey = import.meta.env.VITE_PAYSTACK_KEY;

  const {
    cart,
    getTotalPrice,
    removeFromCart,
    payWithWallet,
    onSuccessCallback,
  } = useCart();
  const { user, userDetails } = useUser();
  const [authors, setAuthors] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState("student"); // Default to student
  const name = `${userDetails?.firstname || ""} ${userDetails?.lastname || ""}`;
  const [disable, setDisable] = useState(false);
  const [formData, setFormData] = useState({
    school: "",
    name: name,
    idNumber: "",
    department: "",
    academicYear: "",
  });

  const componentProps = {
    email: user?.email,
    amount: getTotalPrice() * 100,
    metadata: {
      name: formData.name, // Ensure you're passing the name from formData
    },
    publicKey,

    text: "Pay with Paystack",
    onSuccess: (reference) => {
      console.log("Paystack payment success, reference: ", reference);
      onSuccessCallback(reference, formData);
    },

    onClose: () => toast.error("Payment Cancelled"),
  };

  // Disable scrolling on the body when the cart or modal is open
  useEffect(() => {
    if (isCartOpen || isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isCartOpen, isModalOpen]);

  // Function to fetch author data
  const getAuthor = async (book) => {
    if (!authors[book.id]) {
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
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, studentType: "student", [name]: value });
  };

  // Handle role change
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    // Update the formData based on selected role
    setFormData({
      ...formData,
      idNumber: "", // Reset ID field on role change
      studentType:
        selectedRole === "student"
          ? "student"
          : selectedRole === "lecturer"
          ? "lecturer"
          : null,
    });

    console.log(formData);
  };
  return (
    <div className="relative">
      {/* Cart Icon */}
      <div className="relative">
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="z-50 text-3xl"
        >
          <IoCartOutline className="text-gray-700 hover:text-gray-900" />
        </button>
        <span
          className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs font-semibold ${
            cart.length > 0 ? "" : "hidden"
          }`}
        >
          {cart.length}
        </span>
      </div>

      {/* Cart Overlay */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isCartOpen ? "translate-x-0 z-50" : "translate-x-full"
        }`}
      >
        <div className="container mx-auto p-4 h-full overflow-auto">
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-red-500 text-lg font-bold mb-4"
          >
            Close Cart
          </button>

          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <h1 className="text-3xl font-semibold text-gray-500">
                Your cart is empty
              </h1>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Cart Items Section */}
              <div className="space-y-4">
                {cart.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center bg-white rounded-lg shadow-md p-4 relative"
                  >
                    <img
                      src={book.frontCoverUrl}
                      alt={book.title}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
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
                        <button
                          onClick={() => removeFromCart(book.id)}
                          className="text-red-500 hover:text-red-700 font-semibold absolute top-1 right-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proceed to Checkout Section */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                <div className="flex justify-between items-center font-bold text-lg my-4">
                  <span>Total</span>
                  <span>${getTotalPrice()}</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-3 py-2 w-full rounded-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Checkout Information
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="School"
                className="w-full p-2 border rounded"
              />
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="student"
                    checked={role === "student"}
                    onChange={handleRoleChange}
                  />
                  <span>Student</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="lecturer"
                    checked={role === "lecturer"}
                    onChange={handleRoleChange}
                  />
                  <span>Lecturer</span>
                </label>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder={role === "student" ? "Matric No" : "Lecturer ID"}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department/Class"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="Academic Year"
                className="w-full p-2 border rounded"
              />

              <div className="bg-blue-600 px-3 py-2 text-white w-full text-center rounded-lg">
                <PaystackButton {...componentProps} />
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  payWithWallet(formData);
                  setDisable(true);
                }}
                className={`bg-green-500 text-white px-3 py-2 w-full rounded-lg ${
                  disable ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                disabled={disable}
              >
                {disable ? "Processing..." : "Pay with Wallet"}
              </button>
            </form>

            <button
              onClick={() => setIsModalOpen(false)}
              className="text-red-500 mt-4 w-full text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
