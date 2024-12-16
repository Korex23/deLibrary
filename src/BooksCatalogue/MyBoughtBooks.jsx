import React, { useState, useEffect, useCallback } from "react";
import { useBooks } from "../context/BooksContext";
import { useUser } from "../context/context";
import Pagination from "../components/Pagination";
import MyBoughtBooksCard from "../components/Cards/MyBooks";
import BooksForYou from "../components/Cards/BooksForYou";

const MyBoughtBooks = () => {
  const { getBoughtBooks } = useBooks();
  const { user, userDetails } = useUser();
  const [booksBought, setBooksBought] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  const fetchBoughtBooks = useCallback(async () => {
    const books = await getBoughtBooks(user.uid);
    setBooksBought(books);
    console.log(booksBought);
  }, [getBoughtBooks]);

  useEffect(() => {
    fetchBoughtBooks();

    setTotalEntries(booksBought.length);
  }, [fetchBoughtBooks]);

  const getSlicedBooks = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return booksBought.slice(startIndex, startIndex + entriesPerPage);
  };

  return (
    <>
      <div className="flex gap-5">
        <div className="md:w-64"></div>
        <div className="col-span-6 p-5 mt-16">
          <div className="flex flex-col space-y-5">
            {booksBought.length > 0 ? (
              getSlicedBooks().map((book) => {
                return <MyBoughtBooksCard key={book.id} book={book} />;
              })
            ) : (
              <p>No books bought</p>
            )}
          </div>

          {booksBought.length > 0 ? (
            <Pagination
              entriesPerPage={entriesPerPage}
              totalEntries={totalEntries}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setEntriesPerPage={setEntriesPerPage}
            />
          ) : null}
          <div className="mt-8">
            <div className="rounded-xl p-5 bg-gray-50 shadow-lg">
              <p className="text-2xl font-bold mb-5">Books For You</p>
              <div className="pr-5">
                <BooksForYou />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyBoughtBooks;
