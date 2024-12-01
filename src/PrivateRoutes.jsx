import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase/config";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // To show a loading state while checking auth
  const [user, setUser] = useState(null); // Track the user's authentication state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Update user state when auth state changes
      setLoading(false); // Stop loading once the check is done
    });

    console.log("User state:", user); // Log the user state

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking authentication
  }

  if (!user) {
    return <Navigate to="/" />; // If not authenticated, redirect to home or sign-in page
  }

  return children; // If authenticated, render the protected content
};

export default PrivateRoute;
