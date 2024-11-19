import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [boughtBooks, setBoughtBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  const publicKey = import.meta.env.VITE_PAYSTACK_KEY;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCart(userData.currentCart);
          setBoughtBooks(userData.booksbought);
          setName(`${userData.firstname} ${userData.lastname}`);
        } else {
          console.error("No such document!");
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addToCart = async (book) => {
    try {
      const newCart = [...cart, book];
      console.log("New Cart Array:", newCart);
      setCart(newCart);
      console.log("Setting new cart...");
      await updateDoc(doc(db, "users", user.uid), {
        currentCart: newCart,
      });
      toast.success("Book added to cart");
    } catch (error) {
      console.error("Error adding book to cart:", error);
      toast.error("Error adding book to cart");
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      const newCart = cart.filter((book) => book.id !== bookId);
      setCart(newCart);
      await updateDoc(doc(db, "users", user.uid), {
        currentCart: newCart,
      });
      toast.success("Book removed from cart");
    } catch (error) {
      console.error("Error removing book from cart", error);
      toast.error("Error removing book from cart");
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, book) => total + (book.price || 0), 0);
  };

  const onSuccessCallback = async ({ reference }) => {
    try {
      // Show success message
      toast.success(`Payment successful with reference ${reference}`);

      // Update `booksbought` with current cart contents
      const updatedBoughtBooks = [...boughtBooks, ...cart];
      await updateDoc(doc(db, "users", user.uid), {
        booksbought: updatedBoughtBooks,
        currentCart: [],
      });

      for (const book of cart) {
        const bookRef = doc(db, "books", book.id);
        await updateDoc(bookRef, {
          soldCopies: (book.soldCopies || 0) + 1,
        });

        const authorRef = doc(db, "users", book.authorId);
        const authorDoc = await getDoc(authorRef);

        if (authorDoc.exists()) {
          const currentBalance = authorDoc.data().walletbalance || 0;

          const updatedBalance = currentBalance + (book.price || 0) * 0.9;

          await updateDoc(authorRef, {
            walletbalance: updatedBalance,
          });
        } else {
          console.error(`Author with ID ${book.authorId} not found.`);
        }
      }

      setBoughtBooks(updatedBoughtBooks);
      setCart([]); // Clear the local cart
    } catch (error) {
      console.error("Error updating books after purchase:", error);
      toast.error("Error completing the purchase");
    }
  };

  const componentProps = {
    email: user?.email,
    amount: getTotalPrice() * 100,
    metadata: {
      name,
    },
    publicKey,

    text: "Pay with Paystack",
    onSuccess: (reference) => onSuccessCallback(reference),
    onClose: () => toast.error("Payment Cancelled"),
  };
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        getTotalPrice,
        boughtBooks,
        componentProps,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
