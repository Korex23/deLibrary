import React, { useEffect, useState } from "react";
import { useBooks } from "../../../context/BooksContext";
import { FaBook, FaChartLine, FaMoneyBillWave } from "react-icons/fa";

const PublishedBooksStatistics = () => {
  const { getPublishedBooks } = useBooks();
  const [bestSellingBook, setBestSellingBook] = useState(null);
  const [totalCopiesSold, setTotalCopiesSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchBookData = async () => {
    try {
      const books = await getPublishedBooks();

      if (books.length === 0) {
        console.log("No books found.");
        return;
      }

      // Find the best-selling book
      const bestBook = books.reduce((prev, current) =>
        prev.soldCopies > current.soldCopies ? prev : current
      );
      setBestSellingBook(bestBook);

      // Calculate total copies sold
      const copiesSold = books.reduce((sum, book) => sum + book.soldCopies, 0);
      setTotalCopiesSold(copiesSold);

      // Calculate total revenue
      const revenue = books.reduce(
        (sum, book) => sum + book.soldCopies * book.price,
        0
      );
      setTotalRevenue(revenue);
    } catch (error) {
      console.error("Error fetching book data:", error);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, []);

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Best Selling Book Card */}
        <div className="flex-1 bg-white shadow-lg rounded-lg p-6 text-center">
          {bestSellingBook ? (
            <div className="flex flex-col items-center space-y-4">
              <FaBook className="text-[#005097] text-5xl" />
              <h2 className="text-xl font-semibold text-gray-700">
                Best Selling Book
              </h2>
              <p className="text-lg font-bold text-[#005097]">
                {bestSellingBook.title}
              </p>
              <p className="text-gray-600">
                <span className="font-bold text-blue-700">
                  {bestSellingBook.soldCopies.toLocaleString()}
                </span>{" "}
                Copies Sold
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-lg">
              Loading best-selling book...
            </p>
          )}
        </div>

        {/* Total Copies Sold Card */}
        <div className="flex-1 bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <FaChartLine className="text-green-500 text-5xl" />
            <h2 className="text-xl font-semibold text-gray-700">
              Total Copies Sold
            </h2>
            <p className="text-4xl font-bold text-[#005097]">
              {totalCopiesSold.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="flex-1 bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <FaMoneyBillWave className="text-yellow-500 text-5xl" />
            <h2 className="text-xl font-semibold text-gray-700">
              Total Revenue Generated
            </h2>
            <p className="text-4xl font-bold text-green-600">
              &#8358;{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishedBooksStatistics;
