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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { uploadToCloudinary } from "../Upload";

const BooksContext = createContext();

export const useBooks = () => useContext(BooksContext);

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomComponent = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomComponent}`;
};

export const BooksProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [booksPublished, setBooksPublished] = useState([]);
  const [bookInfo, setBookInfo] = useState({
    title: "",
    frontCover: null,
    backCover: null,
    pdf: null,
    description: "",
    price: 0,
    isbn: "",
    categories: [],
    releaseDate: new Date(),
    ratings: 0,
    soldCopies: 0,
    reviews: [],
  });
  const [allBooks, setAllBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]); // Updated to array for bookmarks

  const handleBookChangeForm = (e) => {
    const { name, value } = e.target;
    setBookInfo((prevBookInfo) => {
      switch (name) {
        case "price":
        case "ratings":
        case "soldCopies":
          return { ...prevBookInfo, [name]: parseFloat(value) };
        case "releaseDate":
          return { ...prevBookInfo, [name]: new Date(value) };
        case "categories":
          return {
            ...prevBookInfo,
            [name]: value.split(",").map((cat) => cat.trim()),
          };
        case "frontCover":
        case "backCover":
        case "pdf":
          return { ...prevBookInfo, [name]: e.target.files[0] };
        default:
          return { ...prevBookInfo, [name]: value };
      }
    });
  };

  const fetchAllBooks = async () => {
    try {
      const books = [];
      const querySnapshot = await getDocs(collection(db, "books"));
      querySnapshot.forEach((doc) => books.push(doc.data()));
      setAllBooks(books);
      console.log(books);
    } catch (error) {
      toast.error("Failed to fetch books.");
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBooksPublished(userData.bookspublished);
          setBookmarks(userData.booksbookmarked || []); // Initialize bookmarks
          console.log(userData.bookspublished);
        } else {
          console.error("No such document!");
        }
      }
      setLoading(false);
    });

    fetchAllBooks();
    getPublishedBooks();

    return () => unsubscribe();
  }, [user]);

  const updateBooks = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      bookspublished: [
        ...booksPublished,
        {
          id: bookInfo.id || uuidv4(),
          title: bookInfo.title,
        },
      ],
    });
    toast.success("Book published successfully!");
  };

  const updateAllBooks = async () => {
    try {
      // Upload files to Cloudinary
      const frontCoverUrl = await uploadToCloudinary(bookInfo.frontCover);
      const backCoverUrl = await uploadToCloudinary(bookInfo.backCover);
      const pdfUrl = await uploadToCloudinary(bookInfo.pdf);

      // Destructure bookInfo, excluding the file properties
      const { frontCover, backCover, pdf, ...bookDataWithoutFiles } = bookInfo;

      const bookWithId = {
        ...bookDataWithoutFiles, // Include all non-file fields
        id: bookInfo.id || uuidv4(), // Generate an ID if not present
        authorId: user.uid, // Set the author ID
        frontCoverUrl, // Add URLs from Cloudinary
        backCoverUrl,
        pdfUrl,
      };

      // Save the document to Firestore
      await setDoc(doc(db, "books", bookWithId.id), bookWithId);

      toast.success("Book added successfully!");
    } catch (error) {
      toast.error("Failed to add book: " + error.message);
    }
  };

  const updateABook = async ({ id }) => {
    const updatedBookInfo = {
      ...bookInfo,
      revisedOn: new Date(),
    };

    try {
      await setDoc(doc(db, "books", id), updatedBookInfo, { merge: true });
      toast.success("Book updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book.");
    }
  };

  const getPublishedBooks = async () => {
    try {
      const books = [];

      const booksQuery = query(
        collection(db, "books"),
        where("authorId", "==", user.uid)
      );

      const querySnapshot = await getDocs(booksQuery);
      querySnapshot.forEach((doc) => books.push(doc.data()));
      setBooksPublished(books);
      console.log(books);
    } catch (error) {
      toast.error("Failed to fetch books.");
      console.error("Error fetching books:", error);
    }
  };

  const getABook = async (id) => {
    try {
      const bookDoc = await getDoc(doc(db, "books", id));
      if (bookDoc.exists()) {
        setBookInfo(bookDoc.data());
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error getting book:", error);
    }
  };

  const AddToBookmarks = async (id) => {
    if (bookmarks.some((bookmark) => bookmark.id === id)) {
      toast.info("Book is already bookmarked!");
      return;
    }

    const newBookmark = {
      id,
      title: bookInfo.title,
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        booksbookmarked: updatedBookmarks,
      });
      toast.success("Book bookmarked successfully!");
      console.log(updatedBookmarks);
    } catch (error) {
      console.error("Error updating bookmarks:", error);
      toast.error("Failed to bookmark the book.");
    }
  };

  // Add this function to your context
  const getBookmarkedBooks = async (userId) => {
    try {
      // Assuming you fetch the bookmarks of the user from a collection or database
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const bookmarks = userDoc.data().booksbookmarked;

      // Find the corresponding books from the allBooks array
      const bookmarkedBooks = allBooks.filter((book) =>
        bookmarks.some((bookmark) => bookmark.id === book.id)
      );

      return bookmarkedBooks; // Return the matching books
    } catch (error) {
      console.error("Error fetching bookmarked books:", error);
      return [];
    }
  };

  return (
    <BooksContext.Provider
      value={{
        updateBooks,
        loading,
        updateAllBooks,
        allBooks,
        bookInfo,
        getABook,
        handleBookChangeForm,
        updateABook,
        booksPublished,
        setBookInfo,
        getPublishedBooks,
        AddToBookmarks,
        bookmarks, // Export bookmarks to use in components
        getBookmarkedBooks, // Export function to fetch bookmark
      }}
    >
      {!loading && children}
    </BooksContext.Provider>
  );
};
