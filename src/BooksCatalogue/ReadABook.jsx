import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/context";
import { useBooks } from "../context/BooksContext";
import { Document, Page, pdfjs } from "react-pdf";
import { db } from "../firebase/config";
import { updateDoc, doc } from "firebase/firestore";
import { CiZoomIn, CiZoomOut } from "react-icons/ci";

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ReadABook = () => {
  const { bookId } = useParams();
  const { userDetails, user } = useUser();
  const { getABook, currentBook } = useBooks();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(0.8); // Zoom level
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

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

  const handleZoomIn = () => {
    const container = containerRef.current;
    const documentElement = container.querySelector(".react-pdf__Page");

    if (documentElement) {
      const documentWidth = documentElement.offsetWidth * (zoomLevel + 0.2);
      const containerWidth = container.offsetWidth;

      if (documentWidth <= containerWidth) {
        setZoomLevel((prev) => Math.min(prev + 0.2, 1.5));
      }
    }
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const updateCurrentPageInFirestore = async (newPage) => {
    try {
      const updatedBooks = userDetails.booksbought.map((book) => {
        if (book.id === bookId) {
          return { ...book, currentPage: newPage }; // Update currentPage for the book
        }
        return book;
      });

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
        const hasBoughtBook = userDetails.booksbought?.some(
          (book) => book.id === bookId
        );

        if (!hasBoughtBook) {
          setError("You haven't purchased this book.");
          return;
        }

        await getABook(bookId);

        const userBook = userDetails.booksbought.find(
          (book) => book.id === bookId
        );
        if (userBook && userBook.currentPage) {
          setCurrentPage(userBook.currentPage);
        } else {
          setCurrentPage(1);
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="flex gap-5 bg-gray-50 min-h-screen">
      <div className="md:w-64 bg-white shadow-md p-5"></div>
      <div className="flex-1 p-5 mt-16 flex justify-center">
        <div
          className="relative bg-white shadow-lg rounded-xl p-8 max-w-4xl w-full"
          ref={containerRef}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6 capitalize">
            {currentBook.title}
          </h1>

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="text-gray-700 text-2xl p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CiZoomOut />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 1.5}
              className="text-gray-700 text-2xl p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CiZoomIn />
            </button>
          </div>

          <div className="flex flex-col items-center mt-10">
            <Document
              file={currentBook.pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<p>Loading {currentBook.title}...</p>}
              className="border rounded-md shadow-md"
            >
              <Page
                pageNumber={currentPage}
                scale={zoomLevel}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="border rounded-md shadow-md"
              />
            </Document>

            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="px-5 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <p className="text-gray-600 font-medium">
                Page {currentPage} of {numPages}
              </p>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="px-5 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadABook;
