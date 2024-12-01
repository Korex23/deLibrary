import React, { useState, useEffect } from "react";
import { useUser } from "../context/context";

const SalesRecord = () => {
  const { userDetails } = useUser();
  const [salesRecord, setSalesRecord] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });

  useEffect(() => {
    setSalesRecord(userDetails.booksBoughtByPeople);
  }, [userDetails]);

  const sortTable = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sortedData = [...salesRecord].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSalesRecord(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Sales Record</h2>
      <div className="w-[800px] overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("title")}
              >
                Title
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("price")}
              >
                Price (₦)
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("date")}
              >
                Date
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("name")}
              >
                Name
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("school")}
              >
                School
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("departmentOrClass")}
              >
                Department
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("studentType")}
              >
                Student/Lecture
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("academicYear")}
              >
                Academic Year
              </th>
              <th
                className="border border-gray-300 px-2 py-1 cursor-pointer"
                onClick={() => sortTable("matricOrLecturerID")}
              >
                Matric No/Lecturer ID
              </th>
            </tr>
          </thead>
          <tbody>
            {salesRecord.map((record, index) => (
              <tr key={index} className="text-center even:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1">
                  {record.title}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {record.price}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {record.name || "N/A"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {record.school || "N/A"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {record.departmentOrClass || "N/A"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {record.studentType || "N/A"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {record.academicYear || "N/A"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {record.matricOrLecturerID || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesRecord;
