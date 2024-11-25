import React, { useCallback, useState, useEffect } from "react";
import { useBooks } from "../context/BooksContext";
import { useUser } from "../context/context";
import BoughtBooksCard from "../components/Cards/BoughtBooksCard";

const AllBoughtBooks = () => {
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
      <div className="ml-[200px] flex flex-col gap-3">
        {booksBought.map((book) => (
          <BoughtBooksCard key={book.id} book={book} />
        ))}
      </div>
    </>
  );
};

export default AllBoughtBooks;
