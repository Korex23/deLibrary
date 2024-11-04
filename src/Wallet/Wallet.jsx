import React from "react";
import { useWallet } from "../context/WalletContext";
import { PaystackButton } from "react-paystack";

const Wallet = () => {
  const { depositHistory, balance, componentProps, setAmount } = useWallet();
  return (
    <>
      <div className="flex gap-5">
        <div className="md:w-64"></div>
        <div className="col-span-6">
          <p>{parseFloat(balance)}</p>
          {depositHistory.map((deposit, index) => (
            <div key={index}>{deposit.amount}</div>
          ))}
          <input
            type="number"
            placeholder="amount"
            onChange={(e) => setAmount(e.target.value)}
          />
          <PaystackButton {...componentProps} />
          <div>Wallet</div>
        </div>
      </div>
    </>
  );
};

export default Wallet;
