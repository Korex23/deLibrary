import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { Document, Page, pdfjs } from "react-pdf";
import { FaShoppingCart } from "react-icons/fa";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BookDetails = () => {
  const { bookId } = useParams();
  const { getABook, bookInfo } = useBooks();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getABook(bookId);
  }, [bookId, getABook]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));
  };

  return (
    <div className="flex gap-5">
      <div className="md:w-64"></div>
      <div className="col-span-6">
        <div className="flex flex-col items-center p-6">
          <h1 className="text-3xl font-bold mb-6">{bookInfo.title}</h1>
          <img
            src={bookInfo.frontCoverUrl}
            alt={bookInfo.title}
            className="h-64 w-full object-cover rounded-lg mb-4"
          />
          <p className="text-lg">{bookInfo.description}</p>
          <span className="text-gray-500">
            Categories: {bookInfo.categories.join(", ")}
          </span>

          <div className="mt-4 w-full flex flex-col items-center">
            <Document
              file={bookInfo.pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<p>Loading PDF...</p>}
            >
              <Page
                pageNumber={currentPage}
                width={600}
                renderTextLayer={false} // Disable text layer
                renderAnnotationLayer={false} // Disable annotation layer
                className="no-margin" // Custom class to ensure no margin
              />
            </Document>

            {/* PDF Navigation Controls */}
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
    </div>
  );
};

export default BookDetails;
