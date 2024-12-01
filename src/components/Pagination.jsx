import React from "react";

const Pagination = ({
  totalEntries,
  entriesPerPage,
  setEntriesPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage)); // Ensure at least 1 page

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col items-center mt-8 space-y-4">
      {/* Entries Per Page Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-gray-700 font-medium">Entries per page:</label>
        <select
          value={entriesPerPage}
          onChange={(e) => {
            setEntriesPerPage(parseInt(e.target.value, 10));
            setCurrentPage(1); // Reset to the first page when changing entries per page
          }}
          className="px-3 py-2 border rounded-lg bg-white text-gray-700"
        >
          {[5, 10, 15, 20].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? "bg-gray-300" : "bg-[#005097] text-white"
          }`}
        >
          Previous
        </button>

        {[...Array(totalPages).keys()].map((number) => (
          <button
            key={number + 1}
            onClick={() => goToPage(number + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === number + 1
                ? "bg-[#005097] text-white"
                : "bg-[#72c6f3] text-white"
            }`}
          >
            {number + 1}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-[#005097] text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
