import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase/config";
import { getDoc, doc } from "firebase/firestore";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // Manage loading state
  const [user, setUser] = useState(null); // Hold authenticated user state
  const [isAuthor, setIsAuthor] = useState(false); // User role: Author
  const [isCustomer, setIsCustomer] = useState(false); // User role: Customer

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(true); // Start loading when auth state changes

      if (currentUser) {
        console.log("Authenticated user:", currentUser.uid);

        try {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          console.log("User document fetched:", userDoc);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data:", userData);

            setUser(currentUser); // Set user state
            setIsAuthor(userData.isAuthor || false); // Set role: Author
            setIsCustomer(userData.isCustomer || false); // Set role: Customer
          } else {
            console.error("No such user document!");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        console.log("No user is logged in.");
        setUser(null);
      }

      setLoading(false); // Stop loading after state updates
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    console.log("Loading...");
    return <div>Loading...</div>; // Show loading indicator
  }

  if (!user) {
    console.log("No authenticated user, redirecting to /signin.");
    return <Navigate to="/signin" />; // Redirect to login page
  }

  // Redirect to onboarding if the user is neither a customer nor an author
  if (!isAuthor && !isCustomer) {
    console.log(
      "User is neither an author nor a customer, redirecting to /onboarding."
    );
    return <Navigate to="/onboarding" />;
  }

  if (!isAuthor) {
    console.log("User is not an author, redirecting to /dashboard.");
    return <Navigate to="/dashboard" />;
  }

  console.log("Protected route allowed.");
  return children; // Render protected content
};

export default ProtectedRoute;
