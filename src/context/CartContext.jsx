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
  const [referralCode, setReferralCode] = useState("");
  const [referrers, setReferrers] = useState([]);
  const [authorReferrer, setAuthorReferrer] = useState("");

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

  const addToCart = async (book, referralCode = "", referrerDetails = null) => {
    try {
      // Add the book to the cart with the associated referral code and referrer
      const newCart = [
        ...cart,
        {
          ...book,
          referralCode, // Attach the referral code directly
          referrer: referrerDetails, // Attach the specific referrer details
        },
      ];

      // Update cart state
      setCart(newCart);
      setReferralCode("");

      // Persist cart in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        currentCart: newCart,
      });

      toast.success("Book added to cart");
    } catch (error) {
      console.error("Error adding book to cart:", error);
      toast.error("Error adding book to cart");
    }
  };

  console.log(cart);
  // console.log(authorReferrer);

  // console.log(referrers);

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

      // Extract only book ID and title for each book in the cart
      const booksToAdd = cart.map((book) => ({
        id: book.id,
        title: book.title,
        numberOfPages: book.numberOfPages,
      }));

      // Merge cart contents (book ID and title) into `boughtBooks` and reset cart in database
      const updatedBoughtBooks = [...boughtBooks, ...booksToAdd];
      await updateDoc(doc(db, "users", user.uid), {
        booksbought: updatedBoughtBooks,
        currentCart: [],
      });

      // Process each book in the cart
      for (const book of cart) {
        const bookRef = doc(db, "books", book.id);

        // Update the book's soldCopies count
        await updateDoc(bookRef, {
          soldCopies: (book.soldCopies || 0) + 1,
        });

        // Handle distributor logic (if applicable)
        if (book.referrer?.id) {
          const distributorRef = doc(db, "users", book.referrer.id);
          const distributorDoc = await getDoc(distributorRef);

          if (distributorDoc.exists()) {
            const currentDistributorBalance =
              distributorDoc.data().walletbalance || 0;

            // Update distributor's wallet balance
            const updatedDistributorBalance =
              currentDistributorBalance + (book.price || 0) * 0.1;

            await updateDoc(distributorRef, {
              walletbalance: updatedDistributorBalance,
            });
          }
        }

        // Handle author logic
        const authorRef = doc(db, "users", book.authorId);
        const authorDoc = await getDoc(authorRef);

        if (authorDoc.exists()) {
          const currentAuthorBalance = authorDoc.data().walletbalance || 0;
          let updatedAuthorBalance;

          // Calculate author's wallet balance share based on referrer/distributor presence
          if (book.referrer?.id) {
            updatedAuthorBalance =
              currentAuthorBalance + (book.price || 0) * 0.75; // Distributor exists
          } else {
            updatedAuthorBalance =
              currentAuthorBalance + (book.price || 0) * 0.85; // No distributor
          }

          // Get the current date
          const currentDate = new Date().toISOString();

          // Retrieve current boughtbooks array from author data or initialize it
          const currentAuthorBooks = authorDoc.data().booksBoughtByPeople || [];

          // Add the new book details to the array
          const newBookEntry = {
            id: book.id,
            title: book.title,
            date: currentDate,
            price: book.price || 0,
          };
          const updatedAuthorBooks = [...currentAuthorBooks, newBookEntry];

          await updateDoc(authorRef, {
            walletbalance: updatedAuthorBalance,
            booksBoughtByPeople: updatedAuthorBooks, // Update the author's boughtbooks array
          });

          // Handle author's referrer (if exists)
          const authorReferrerId = authorDoc.data().referredBy;
          if (authorReferrerId) {
            const authorReferrerRef = doc(db, "users", authorReferrerId);
            const referrerDoc = await getDoc(authorReferrerRef);

            if (referrerDoc.exists()) {
              const currentReferrerBalance =
                referrerDoc.data().walletbalance || 0;

              // Update author's referrer's wallet balance
              const updatedReferrerBalance =
                currentReferrerBalance + (book.price || 0) * 0.05;

              await updateDoc(authorReferrerRef, {
                walletbalance: updatedReferrerBalance,
              });
            }
          }
        } else {
          console.error(`Author with ID ${book.authorId} not found.`);
        }
      }

      // Update local state
      setBoughtBooks(updatedBoughtBooks);
      setCart([]); // Clear local cart
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
        setReferralCode,
        boughtBooks,
        componentProps,
        referralCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
