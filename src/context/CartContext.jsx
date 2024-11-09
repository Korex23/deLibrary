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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCart(userData.currentCart);
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
      console.log("New Cart Array:", newCart); // Check if newCart is correct
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

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, getTotalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};
