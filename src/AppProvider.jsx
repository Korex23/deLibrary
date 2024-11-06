import React from "react";
import { UserProvider } from "./context/context";
import { WalletProvider } from "./context/WalletContext";
import { BooksProvider } from "./context/BooksContext";

const AppProvider = ({ children }) => {
  return (
    <>
      <WalletProvider>
        <BooksProvider>
          <UserProvider>{children}</UserProvider>
        </BooksProvider>
      </WalletProvider>
    </>
  );
};

export default AppProvider;
