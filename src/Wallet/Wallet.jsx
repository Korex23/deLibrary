import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { PaystackButton } from "react-paystack";
import {
  FaWallet,
  FaCalendarAlt,
  FaSortAmountDown,
  FaCheckCircle,
} from "react-icons/fa";

const Wallet = () => {
  const { depositHistory, balance, componentProps, setAmount } = useWallet();
  const [sortType, setSortType] = useState("date");
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value < 1) {
      setError("Amount must be greater than 0");
    } else {
      setError("");
      setAmount(value);
      setDepositAmount(value);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000); // Clear success message after 3 seconds
  };

  const sortedDeposits = [...depositHistory].sort((a, b) => {
    return sortType === "amount"
      ? b.amount - a.amount
      : b.date.seconds - a.date.seconds;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 w-full">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg transition-transform transform hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
          <FaWallet className="text-green-500" />
          My Wallet
        </h2>

        {/* Balance Section */}
        <div className="mb-6 p-4 bg-green-100 rounded-lg shadow-inner text-center">
          <h3 className="text-2xl font-semibold text-gray-700">Balance:</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            &#x20A6; {parseFloat(balance).toFixed(2)}
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="flex mb-4 border-b border-gray-300">
          <button
            onClick={() => setSortType("date")}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              sortType === "date"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaCalendarAlt className="inline-block mr-2" />
            Sort by Date
          </button>
          <button
            onClick={() => setSortType("amount")}
            className={`flex-1 py-3 text-center font-semibold transition-all ${
              sortType === "amount"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaSortAmountDown className="inline-block mr-2" />
            Sort by Amount
          </button>
        </div>

        {/* Deposit History */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Deposit History:
        </h3>
        <div className="overflow-x-auto max-h-48 mb-6 border rounded-lg shadow-inner">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2">Amount (NGN)</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedDeposits.length > 0 ? (
                sortedDeposits.map((deposit, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-4 py-3 text-gray-800">
                      &#8358; {deposit.amount}
                    </td>
                    <td className="px-4 py-3">{formatDate(deposit.date)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {deposit.reference}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No deposits yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Deposit Form */}
        <div className="mb-6 relative">
          <input
            type="number"
            placeholder="Enter deposit amount"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            value={depositAmount}
            onChange={handleAmountChange}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center justify-center mb-4 text-green-600">
            <FaCheckCircle className="mr-2" />
            Deposit Successful!
          </div>
        )}

        {/* Paystack Button */}
        <div className="flex justify-center">
          <PaystackButton
            {...componentProps}
            onSuccess={handleSuccess}
            className={`w-full py-3 rounded-lg font-semibold transition-all focus:outline-none ${
              error || !depositAmount
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={!!error || !depositAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
