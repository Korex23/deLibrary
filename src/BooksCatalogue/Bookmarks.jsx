import React from "react";
import BookmarkedBooksCard from "../components/Cards/BookmarkedBooksCard";
import BooksForYou from "../components/Cards/BooksForYou";

const Bookmarks = () => {
  return (
    <>
      <div className="flex gap-5">
        <div className="md:w-64"></div>
        <div className="col-span-6 p-5">
          <div className="rounded-xl p-5 bg-gray-50 shadow-lg">
            <p className="text-3xl font-bold mb-5">Bookmarked Books</p>
            <BookmarkedBooksCard />
          </div>
          <div className="mt-10">
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

export default Bookmarks;
