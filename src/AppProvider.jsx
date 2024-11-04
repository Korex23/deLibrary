import React from "react";
import { UserProvider } from "./context/context";

const AppProvider = ({ children }) => {
  return (
    <>
      <UserProvider>{children}</UserProvider>
    </>
  );
};

export default AppProvider;
