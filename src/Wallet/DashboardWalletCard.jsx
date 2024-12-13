import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { PaystackButton } from "react-paystack";

const WalletCard = () => {
  const { balance, componentProps, setAmount, modalOpen, setModalOpen } =
    useWallet();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-gray-100 p-4 md:p-6">
      {/* Wallet Balance Card */}
      <div className="bg-[#00509730] shadow-lg rounded-lg p-4 md:w-[400px] max-w-md flex items-center justify-between gap-8 md:gap-0">
        <div>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#005097] font-semibold">
            ₦ {parseFloat(balance).toFixed(2)}
          </p>
          <h2 className="text-sm md:text-md mb-4">Wallet Balance</h2>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="mt-6 bg-[#005097] text-white text-sm md:text-md py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ease-in-out duration-300"
        >
          Refill Wallet
        </button>
      </div>

      {/* Modal for Deposit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <h3 className="text-2xl font-semibold mb-4 text-center">
              Deposit Funds
            </h3>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-4 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onChange={(e) => setAmount(e.target.value)}
            />
            <PaystackButton
              {...componentProps}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletCard;
