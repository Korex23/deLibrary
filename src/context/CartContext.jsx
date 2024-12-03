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
  runTransaction,
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

  const onSuccessCallback = async ({ reference }, formData) => {
    console.log("Payment successful, reference: ", reference);
    console.log("Form data received in onSuccess:", formData);
    try {
      // Show success message
      toast.success(`Payment successful with reference ${reference}`);

      // Extract only book ID and title for each book in the cart
      const booksToAdd = cart.map((book) => ({
        id: book.id || "", // Ensure book ID is defined
        title: book.title || "Unknown Title", // Fallback for title
        numberOfPages: book.numberOfPages || 0, // Default to 0 if undefined
      }));

      // Merge cart contents (book ID and title) into `boughtBooks` and reset cart in database
      const updatedBoughtBooks = [...boughtBooks, ...booksToAdd];
      await updateDoc(doc(db, "users", user.uid), {
        booksbought: updatedBoughtBooks,
        currentCart: [], // Reset cart
      });

      // Process each book in the cart
      for (const book of cart) {
        const bookRef = doc(db, "books", book.id || ""); // Ensure book ID is defined

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
        const authorRef = doc(db, "users", book.authorId || ""); // Ensure author ID is defined
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
            bookid: book.id || "", // Ensure book ID is defined
            id: user.uid, // Use user's ID for consistency
            title: book.title || "Unknown Title", // Fallback for title
            date: currentDate,
            price: book.price || 0,
            school: formData.school || "", // Fallback for school
            studentType: formData.studentType || null, // Fallback to null if undefined
            name: formData.name || "", // Fallback for name
            academicYear: formData.academicYear || "", // Fallback for academicYear
            matricOrLecturerID: formData.matricOrLecturerID || "", // Fallback for ID
            departmentOrClass: formData.departmentOrClass || "", // Fallback for department
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

  const payWithWallet = async (formData) => {
    try {
      // Calculate the total price of books in the cart
      const totalCartPrice = cart.reduce(
        (sum, book) => sum + (book.price || 0),
        0
      );

      // Fetch the user's wallet balance
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        toast.error("User not found.");
        return;
      }

      const currentWalletBalance = userDoc.data().walletbalance || 0;

      // Check if the user has sufficient balance
      if (currentWalletBalance < totalCartPrice) {
        toast.error("Insufficient wallet balance to complete the purchase.");
        return;
      }

      // Deduct the total cart price from the user's wallet balance
      const updatedUserWalletBalance = currentWalletBalance - totalCartPrice;

      // Show success message
      toast.success("Payment successful with wallet balance.");

      // Extract only book ID and title for each book in the cart
      const booksToAdd = cart.map((book) => ({
        id: book.id || "", // Ensure book ID is not undefined
        title: book.title || "Unknown Title", // Provide fallback value for title
        numberOfPages: book.numberOfPages, // Default to 0 if undefined
      }));

      // Merge cart contents into `boughtBooks` and reset the cart in the database
      const updatedBoughtBooks = [...boughtBooks, ...booksToAdd];
      await updateDoc(userRef, {
        booksbought: updatedBoughtBooks,
        currentCart: [], // Reset cart
        walletbalance: updatedUserWalletBalance,
      });

      // Process each book in the cart
      for (const book of cart) {
        const bookRef = doc(db, "books", book.id);

        // Update the book's soldCopies count
        await updateDoc(bookRef, {
          soldCopies: (book.soldCopies || 0) + 1,
        });

        // Handle distributor logic
        if (book.referrer?.id) {
          const distributorRef = doc(db, "users", book.referrer.id);
          const distributorDoc = await getDoc(distributorRef);

          if (distributorDoc.exists()) {
            const currentDistributorBalance =
              distributorDoc.data().walletbalance || 0;
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

          // Calculate author's share
          if (book.referrer?.id) {
            updatedAuthorBalance =
              currentAuthorBalance + (book.price || 0) * 0.75;
          } else {
            updatedAuthorBalance =
              currentAuthorBalance + (book.price || 0) * 0.85;
          }

          const currentDate = new Date().toISOString();
          const currentAuthorBooks = authorDoc.data().booksBoughtByPeople || [];
          const newBookEntry = {
            bookid: book.id || "", // Ensure book ID is not undefined
            id: user.uid, // Use user's ID for consistency
            title: book.title || "Unknown Title", // Provide fallback value for title
            date: currentDate,
            price: book.price || 0,
            school: formData.school || "", // Ensure formData.school is defined
            studentType: formData.studentType || null, // Default to null if undefined
            name: formData.name || "", // Ensure formData.name is defined
            academicYear: formData.academicYear || "", // Default to empty string if undefined
            matricOrLecturerID: formData.idNumber || "", // Use formData.idNumber for consistency
            departmentOrClass: formData.department || "", // Ensure formData.department is defined
          };

          const updatedAuthorBooks = [...currentAuthorBooks, newBookEntry];

          await updateDoc(authorRef, {
            walletbalance: updatedAuthorBalance,
            booksBoughtByPeople: updatedAuthorBooks,
          });

          // Handle author's referrer logic
          const authorReferrerId = authorDoc.data().referredBy;
          if (authorReferrerId) {
            const authorReferrerRef = doc(db, "users", authorReferrerId);
            const referrerDoc = await getDoc(authorReferrerRef);

            if (referrerDoc.exists()) {
              const currentReferrerBalance =
                referrerDoc.data().walletbalance || 0;
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
      toast.error("Error completing the purchase.");
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
        payWithWallet,
        onSuccessCallback,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
