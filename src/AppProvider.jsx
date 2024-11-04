import React from "react";
import { UserProvider } from "./context/context";
import { WalletProvider } from "./context/WalletContext";

const AppProvider = ({ children }) => {
  return (
    <>
      <WalletProvider>
        <UserProvider>{children}</UserProvider>
      </WalletProvider>
    </>
  );
};

export default AppProvider;
