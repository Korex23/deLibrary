import React, { useCallback, useState, useEffect } from "react";
import { useBooks } from "../context/BooksContext";
import { useUser } from "../context/context";
import BoughtBooksCard from "../components/Cards/BoughtBooksCard";
import { Link } from "react-router-dom";

const ContinueReading = () => {
  const { getBoughtBooks } = useBooks();
  const [booksBought, setBooksBought] = useState([]);
  const { user } = useUser();

  const fetchBoughtBooks = useCallback(async () => {
    const books = await getBoughtBooks(user.uid);
    setBooksBought(books);
    console.log(books);
  }, [getBoughtBooks]);

  useEffect(() => {
    fetchBoughtBooks();
  }, [fetchBoughtBooks]);

  return (
    <>
      <div className="rounded-xl p-5 bg-gray-50 shadow-lg w-full">
        <h3 className="text-2xl text-[#005097] font-bold mb-4">
          Continue Reading
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {booksBought.length > 0 ? (
            booksBought
              .slice(0, 4)
              .map((book) => <BoughtBooksCard key={book.id} book={book} />)
          ) : (
            <p className="text-gray-600 text-2xl">No books bought</p>
          )}
        </div>
        <div className="mt-5">
          <Link
            to="/dashboard/mybooks"
            className={`text-[#005097] ${booksBought.length <= 0 && "hidden"}`}
          >
            View all
          </Link>
        </div>
      </div>
    </>
  );
};

export default ContinueReading;
