import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase/config";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoutes = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true); // Set loading to true when auth state changes
      if (user) {
        // Fetch user document by ID
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setIsAuthor(userData.role === "author"); // Check if the user is an author
        } else {
          console.error("No such document!");
          setUser(null);
          setIsAuthor(false);
        }
      } else {
        setUser(null);
        setIsAuthor(false);
      }
      setLoading(false); // Set loading to false after data is fetched
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message or spinner while checking auth state
  }

  //   if (!user) {
  //     return <Navigate to="/login" />; // Redirect to login if not authenticated
  //   }

  if (!isAuthor) {
    return <Navigate to="/" />; // Redirect if user is not an author
  }

  return children;
};

export default ProtectedRoutes;
