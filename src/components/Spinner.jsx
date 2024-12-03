import logo from "../assets/logo.png";
import React from "react";

const Spinner = () => {
  return (
    <>
      <div className="flex justify-center items-center h-screen bg-[#00000020]">
        <div className="loading_logo">
          <img src={logo} alt="logo" className="w-28" />
        </div>
      </div>
    </>
  );
};

export default Spinner;
