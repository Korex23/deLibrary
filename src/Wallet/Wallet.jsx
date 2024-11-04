import React from "react";
import { useWallet } from "../context/WalletContext";
import { PaystackButton } from "react-paystack";

const Wallet = () => {
  const { depositHistory, balance, componentProps, setAmount } = useWallet();

  const formatDate = (timestamp) => {
    if (!timestamp) return ""; // Return empty if timestamp is invalid
    const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString(); // Format the date as needed
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Wallet</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Balance:</h3>
          <p className="text-2xl text-green-600">
            {parseFloat(balance).toFixed(2)} USD
          </p>
        </div>

        <h3 className="text-xl font-semibold mb-2">Deposit History:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left font-semibold">
                  Amount (USD)
                </th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody>
              {depositHistory.length > 0 ? (
                depositHistory.map((deposit, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{deposit.amount} USD</td>
                    <td className="px-4 py-2">{formatDate(deposit.date)}</td>
                    <td className="px-4 py-2">{deposit.reference}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-2">
                    No deposits yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <PaystackButton
            {...componentProps}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
