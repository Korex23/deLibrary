import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { PaystackButton } from "react-paystack";
import { toast } from "react-toastify";

// Create UserContext
const WalletContext = createContext();

// Custom hook to use WalletContext
export const useWallet = () => useContext(WalletContext);

// WalletProvider component that wraps your app and provides wallet data
export const WalletProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(0);
  const [depositHistory, setDepositHistory] = useState([]);
  const [user, setUser] = useState(null);

  const publicKey = import.meta.env.VITE_PAYSTACK_KEY;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Set loading to true when auth state changes
      setUser(currentUser);

      if (currentUser) {
        // Fetch user document by ID
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(`${userData.firstname} ${userData.lastname}`);
          setBalance(userData.walletbalance);
          setDepositHistory(userData.depositHistory);
          console.log(userData.depositHistory);
          console.log(userData.walletbalance);
          console.log(name);
          console.log(userData);
          console.log(amount);
        } else {
          console.error("No such document!");
          setName("");
        }
      } else {
        setName("");
      }

      setLoading(false); // Set loading to false after data is fetched
    });

    return () => unsubscribe();
  }, []);

  const onSuccessCallback = async ({ reference }) => {
    toast.success(`Payment successful with reference ${reference}`);
    setReference(reference);

    // Fetch the latest user document to get the current wallet balance
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const currentBalance = userDoc.exists() ? userDoc.data().walletbalance : 0;

    // Calculate new balance
    const newBalance = parseFloat(currentBalance) + parseFloat(amount);
    setBalance(newBalance); // Update local balance state

    // Update Firestore with the new balance and deposit history
    await updateDoc(doc(db, "users", user.uid), {
      walletbalance: parseFloat(newBalance),
      depositHistory: [
        ...depositHistory,
        {
          amount,
          reference,
          success: true,
          date: new Date(),
        },
      ],
    });
  };

  const componentProps = {
    email: user?.email,
    amount: amount * 100,
    metadata: {
      name,
    },
    publicKey,

    text: "Pay with Paystack",
    onSuccess: (reference) => onSuccessCallback(reference),
    onClose: () => toast.error("Payment Cancelled"),
  };

  return (
    <WalletContext.Provider
      value={{ componentProps, balance, setAmount, depositHistory }}
    >
      {!loading && children}
    </WalletContext.Provider>
  );
};
