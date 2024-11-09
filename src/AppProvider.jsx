import React from "react";
import { UserProvider } from "./context/context";
import { WalletProvider } from "./context/WalletContext";
import { BooksProvider } from "./context/BooksContext";
import { CartProvider } from "./context/CartContext";

const AppProvider = ({ children }) => {
  return (
    <>
      <WalletProvider>
        <BooksProvider>
          <CartProvider>
            <UserProvider>{children}</UserProvider>
          </CartProvider>
        </BooksProvider>
      </WalletProvider>
    </>
  );
};

export default AppProvider;
