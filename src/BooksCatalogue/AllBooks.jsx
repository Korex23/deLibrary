import React from "react";
import BooksCard from "../components/Cards/BooksCard";
import BookmarkedBooksCard from "../components/Cards/BookmarkedBooksCard";

const AllBooks = () => {
  return (
    <>
      <div className="flex gap-5">
        <div className="md:w-64"></div>
        <div className="col-span-6 p-5">
          <div className="rounded-xl p-5 bg-gray-50 shadow-lg">
            <p className="text-3xl font-bold mb-5">Latest Books</p>
            <BooksCard />
          </div>
        </div>
      </div>
    </>
  );
};

export default AllBooks;
