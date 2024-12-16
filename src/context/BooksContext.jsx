import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
import { pdfjs } from "react-pdf"; // Import from react-pdf;

// Set the workerSrc for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
    id: uuidv4(),
    title: "",
    frontCover: null,
    backCover: null,
    pdf: null,
    description: "",
    price: 0,
    isbn: "",
    categories: [],
    releaseDate: new Date().toISOString().split("T")[0],
    ratings: [],
    soldCopies: 0,
    reviews: [],
    allowedDistributors: [], // New property
    isDistributorsAllowed: false, // New property
    questions_answers: [],
  });
  const [allBooks, setAllBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]); // Updated to array for bookmarks
  const [onlyMe, setOnlyMe] = useState(false);
  const [anyone, setAnyone] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [updatePublishedBooks, setUpdatePublishedBooks] = useState([]);

  const handleBookChangeForm = (e) => {
    const { name, value } = e.target;
    setBookInfo((prevBookInfo) => {
      switch (name) {
        case "price":
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
        case "allowedDistributors":
          return {
            ...prevBookInfo,
            allowedDistributors: value,
          };
        case "isDistributorsAllowed":
          return {
            ...prevBookInfo,
            isDistributorsAllowed: !prevBookInfo.isDistributorsAllowed,
          };
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
      console.error("Error fetching books:", error);
    }
  };

  const getAllUsers = async () => {
    try {
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);

      const users = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== auth.currentUser.uid) {
          // Exclude current user
          users.push({
            value: doc.id,
            label: `${doc.data().firstname} ${doc.data().lastname}`,
          });
        }
      });

      return users;
    } catch (error) {
      console.error("Error retrieving users:", error);
      return [];
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

    const fetchUsers = async () => {
      const users = await getAllUsers();
      setUsers(users);
    };

    fetchUsers();

    fetchAllBooks();

    return () => unsubscribe();
  }, [user]);

  const updateBooks = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      bookspublished: [
        ...updatePublishedBooks,
        {
          id: bookInfo.id || uuidv4(),
          title: bookInfo.title,
        },
      ],
    });
  };

  const updateAllBooks = async () => {
    try {
      // Load the PDF to get the page count
      const arrayBuffer = await bookInfo.pdf.arrayBuffer();
      const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer })
        .promise;
      const pageCount = pdfDocument.numPages;

      // Upload files to Cloudinary
      const frontCoverUrl = await uploadToCloudinary(bookInfo.frontCover);
      const backCoverUrl = await uploadToCloudinary(bookInfo.backCover);
      const pdfUrl = await uploadToCloudinary(bookInfo.pdf);

      // Extract relevant book information without files
      const { frontCover, backCover, pdf, ...bookDataWithoutFiles } = bookInfo;

      const bookWithId = {
        ...bookDataWithoutFiles,
        id: bookInfo.id,
        authorId: user.uid,
        frontCoverUrl,
        backCoverUrl,
        pdfUrl,
        numberOfPages: pageCount, // Add the page count to the book object
        allowedDistributors: bookInfo.allowedDistributors,
        isDistributorsAllowed: bookInfo.isDistributorsAllowed,
      };

      // Save the book data to Firestore
      await setDoc(doc(db, "books", bookWithId.id), bookWithId);
      console.log("Book uploaded successfully!");
    } catch (error) {
      console.error("Error adding book:", error.message);
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

      const bookData = books.map((book) => ({
        id: book.id,
        title: book.title,
      }));
      setBooksPublished(books);
      setUpdatePublishedBooks(bookData);
      console.log(books);
      return books;
    } catch (error) {
      toast.error("Failed to fetch books.");
      console.error("Error fetching books:", error);
    }
  };

  const getABook = useCallback(async (id) => {
    try {
      const bookDoc = await getDoc(doc(db, "books", id));
      if (bookDoc.exists()) {
        setCurrentBook(bookDoc.data());
        console.log(bookDoc.data());
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error getting book:", error);
    }
  }, []);

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
      console.log(updatedBookmarks);
    } catch (error) {
      console.error("Error updating bookmarks:", error);
    }
  };

  // Add this function to your context
  const getBookmarkedBooks = async (userId) => {
    try {
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

  const getBoughtBooks = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      const boughtBooks = userDoc.data().booksbought;

      // Find the corresponding books from the allBooks array
      const books = allBooks.filter((book) =>
        boughtBooks.some((boughtBook) => boughtBook.id === book.id)
      );

      return books; // Return the matching books
    } catch (error) {
      console.error("Error fetching bought books:", error);
      return [];
    }
  };

  const updateBookInfoWithDistributors = (selectedOptions) => {
    setBookInfo({
      ...bookInfo,
      allowedDistributors: selectedOptions || [],
      isDistributorsAllowed: anyone || selectedOptions.length > 0,
    });
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
        users,
        bookmarks, // Export bookmarks to use in components
        getBookmarkedBooks, // Export function to fetch bookmarked books
        updateBookInfoWithDistributors,
        getBoughtBooks,
        onlyMe,
        setOnlyMe,
        anyone,
        setAnyone,
        currentBook,
      }}
    >
      {!loading && children}
    </BooksContext.Provider>
  );
};
