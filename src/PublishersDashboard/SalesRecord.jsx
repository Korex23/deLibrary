import React, { useState, useEffect } from "react";
import { useUser } from "../context/context";
import Pagination from "../components/Pagination";

const SalesRecord = () => {
  const { userDetails } = useUser();
  const [salesRecord, setSalesRecord] = useState([]);
  const [filteredSalesRecord, setFilteredSalesRecord] = useState([]); // For search results
  const [currentPage, setCurrentPage] = useState(1); // Initialize the current page
  const [entriesPerPage, setEntriesPerPage] = useState(10); // Default entries per page
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState(""); // State to track the search term

  useEffect(() => {
    const records = userDetails.booksBoughtByPeople || [];
    setSalesRecord(records);
    setFilteredSalesRecord(records); // Initialize filtered data
  }, [userDetails]);

  const sortTable = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sortedData = [...filteredSalesRecord].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredSalesRecord(sortedData);
    setSortConfig({ key, direction });
  };

  // Filter logic for search
  useEffect(() => {
    const filteredData = salesRecord.filter((record) =>
      Object.values(record)
        .join(" ") // Concatenate all values in a single string
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredSalesRecord(filteredData);
    setCurrentPage(1); // Reset to the first page on search
  }, [searchTerm, salesRecord]);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredSalesRecord.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  return (
    <div className="container mx-auto p-4 bg-gray-50 rounded-lg shadow-lg mt-20">
      <h2 className="text-4xl font-bold text-[#005097] mb-4 text-center">
        Sales Record
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sales record..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead className="bg-[#005097] text-white">
            <tr>
              <th
                className="border px-3 py-2 cursor-pointer"
                onClick={() => sortTable("title")}
              >
                Title
              </th>
              <th
                className="border px-3 py-2 cursor-pointer"
                onClick={() => sortTable("price")}
              >
                Price (₦)
              </th>
              <th
                className="border px-3 py-2 cursor-pointer hidden md:table-cell"
                onClick={() => sortTable("date")}
              >
                Date
              </th>
              <th
                className="border px-3 py-2 cursor-pointer hidden sm:table-cell"
                onClick={() => sortTable("name")}
              >
                Name
              </th>
              <th
                className="border px-3 py-2 cursor-pointer hidden lg:table-cell"
                onClick={() => sortTable("school")}
              >
                School
              </th>
              <th
                className="border px-3 py-2 cursor-pointer hidden md:table-cell"
                onClick={() => sortTable("departmentOrClass")}
              >
                Department
              </th>
              <th
                className="border px-3 py-2 cursor-pointer hidden lg:table-cell"
                onClick={() => sortTable("studentType")}
              >
                Student/Lecture
              </th>
              <th
                className="border px-3 py-2 cursor-pointer hidden xl:table-cell"
                onClick={() => sortTable("academicYear")}
              >
                Academic Year
              </th>
              <th
                className="border px-3 py-2 cursor-pointer hidden xl:table-cell"
                onClick={() => sortTable("matricOrLecturerID")}
              >
                Matric No/ID
              </th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((record, index) => (
              <tr
                key={index}
                className="text-center even:bg-gray-50 hover:bg-gray-100 transition"
              >
                <td className="border px-3 py-2">{record.title}</td>
                <td className="border px-3 py-2">
                  {record.price.toLocaleString()}
                </td>
                <td className="border px-3 py-2 hidden md:table-cell">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="border px-3 py-2 hidden sm:table-cell">
                  {record.name || "N/A"}
                </td>
                <td className="border px-3 py-2 hidden lg:table-cell">
                  {record.school || "N/A"}
                </td>
                <td className="border px-3 py-2 hidden md:table-cell">
                  {record.departmentOrClass || "N/A"}
                </td>
                <td className="border px-3 py-2 hidden lg:table-cell">
                  {record.studentType || "N/A"}
                </td>
                <td className="border px-3 py-2 hidden xl:table-cell">
                  {record.academicYear || "N/A"}
                </td>
                <td className="border px-3 py-2 hidden xl:table-cell">
                  {record.matricOrLecturerID || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        totalEntries={filteredSalesRecord.length}
        entriesPerPage={entriesPerPage}
        setEntriesPerPage={setEntriesPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default SalesRecord;
