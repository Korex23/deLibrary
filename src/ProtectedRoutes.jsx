import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase/config";
import { collection, getDoc, doc, query, where } from "firebase/firestore";

const ProtectedRoutes = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async () => {
      const currentUser = auth.currentUser;
      setLoading(true); // Set loading to true when auth state changes
      if (currentUser) {
        // Fetch user document by ID
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        console.log(userDoc);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setIsAuthor(userData.isAuthor === true); // Check if the user is an author
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
    return <Navigate to="/dashboard" />; // Redirect if user is not an author
  }

  return children;
};

export default ProtectedRoutes;
