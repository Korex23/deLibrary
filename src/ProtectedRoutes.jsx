import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase/config";
import { getDoc, doc } from "firebase/firestore";

const ProtectedRoutes = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async () => {
      const currentUser = auth.currentUser;
      
      console.log("Auth state changed:", currentUser); // Log auth state change
      setLoading(true);

      if (currentUser) {
        console.log("Authenticated user:", currentUser.uid);
        // User is authenticated, proceed to fetch their document
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          console.log("User document fetched:", userDoc);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data:", userData);
            setUser(true);
            setIsAuthor(userData.isAuthor === true);
          } else {
            console.error("No such user document!");
            setUser(false);
            setIsAuthor(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(false);
          setIsAuthor(false);
        }
      } else {
        console.log("No user is logged in.");
        setUser(false);
        setIsAuthor(false);
      }
      setLoading(false); // Stop loading after state updates
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    console.log("Loading...");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("No authenticated user, redirecting to /signin.");
    return <Navigate to="/signin" />;
  }

  if (!isAuthor) {
    console.log("User is not an author, redirecting to /dashboard.");
    return <Navigate to="/dashboard" />;
  }

  console.log("Protected route allowed.");
  return children;
};

export default ProtectedRoutes;
