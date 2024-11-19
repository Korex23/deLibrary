import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Create UserContext
const UserContext = createContext();

// Custom hook to use UserContext
export const useUser = () => useContext(UserContext);

// UserProvider component that wraps your app and provides user data
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // If the user is logged in, get the user details
      if (currentUser) {
        // Fetch user document by ID
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserDetails(userData);
          console.log(userData);
        } else {
          console.error("No such document!");
        }
      } else {
      }
      setLoading(false);
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  // Function to log out the user
  const logout = async () => {
    await signOut(auth);

    setUser(null);
  };

  // Provide user and logout functionality to context consumers
  return (
    <UserContext.Provider value={{ user, loading, logout, userDetails }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
