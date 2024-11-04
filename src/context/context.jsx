import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Create UserContext
const UserContext = createContext();

// Custom hook to use UserContext
export const useUser = () => useContext(UserContext);

// UserProvider component that wraps your app and provides user data
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
    <UserContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
