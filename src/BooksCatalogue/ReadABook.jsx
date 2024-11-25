import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/context";
import { useBooks } from "../context/BooksContext";
import { Document, Page, pdfjs } from "react-pdf";
import { db } from "../firebase/config";
import { updateDoc, doc } from "firebase/firestore";

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ReadABook = () => {
  const { bookId } = useParams();
  const { userDetails, user } = useUser();
  const { getABook, currentBook } = useBooks();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePreviousPage = async () => {
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    await updateCurrentPageInFirestore(newPage);
  };

  const handleNextPage = async () => {
    const newPage = Math.min(currentPage + 1, numPages);
    setCurrentPage(newPage);
    await updateCurrentPageInFirestore(newPage);
  };

  const updateCurrentPageInFirestore = async (newPage) => {
    try {
      // Find the book in the user's booksbought array
      const updatedBooks = userDetails.booksbought.map((book) => {
        if (book.id === bookId) {
          return { ...book, currentPage: newPage }; // Update currentPage for the book
        }
        return book;
      });

      // Update the user document with the new currentPage for the book
      const userRef = doc(db, "users", user.uid); // Assuming user document is in "users" collection
      await updateDoc(userRef, {
        booksbought: updatedBooks,
      });
    } catch (err) {
      console.error("Error updating current page:", err);
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        // Check if the book is in the user's bought list
        const hasBoughtBook = userDetails.booksbought?.some(
          (book) => book.id === bookId
        );

        if (!hasBoughtBook) {
          setError("You haven't purchased this book.");
          return;
        }

        // Get the book data from context
        await getABook(bookId);

        // Fetch the current page from the user's booksbought array
        const userBook = userDetails.booksbought.find(
          (book) => book.id === bookId
        );
        if (userBook && userBook.currentPage) {
          setCurrentPage(userBook.currentPage); // Set the current page from Firestore
        } else {
          setCurrentPage(1); // Default to page 1 if no page info is available
        }
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("An error occurred while fetching the book.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, userDetails, getABook]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mx-[400px] flex justify-center items-center">
      <div className="container mx-auto mt-4">
        <h1 className="text-2xl font-bold mb-4">{currentBook.title}</h1>
        <div className="mt-4 w-full flex flex-col items-center">
          <Document
            file={currentBook.pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p>Loading {currentBook.title}</p>}
          >
            <Page
              pageNumber={currentPage}
              width={600}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="no-margin"
            />
          </Document>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-300"
            >
              Previous
            </button>
            <p>
              Page {currentPage} of {numPages}
            </p>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadABook;
