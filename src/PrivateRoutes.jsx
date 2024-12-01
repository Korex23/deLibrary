import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase/config";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // To manage loading state while checking authentication
  const [user, setUser] = useState(null); // To hold the authenticated user (or null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Set user state based on authentication status
      setLoading(false); // Stop loading once the auth state is fetched
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while the user state is being determined
  }

  if (!user) {
    return <Navigate to="/" />; // Redirect to login page if no user is authenticated
  }

  return children; // Render the protected content if user is authenticated
};

export default PrivateRoute;
