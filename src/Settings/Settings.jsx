import React from "react";
import UpdatePasswordPage from "./UpdatePasswordPage";

const Settings = () => {
  return (
    <>
      <div className="flex gap-5">
        <div className="md:w-72"></div>
        <div className="w-full mt-16 bg-[#f5f5f5]">
          <UpdatePasswordPage />
        </div>
      </div>
    </>
  );
};

export default Settings;
