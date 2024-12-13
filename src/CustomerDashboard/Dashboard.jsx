import React from "react";
import ContinueReading from "../BooksCatalogue/ContinueReading";
import WalletCard from "../Wallet/DashboardWalletCard";
import { IoHomeOutline } from "react-icons/io5";
import { useUser } from "../context/context";
import LatestBooksCard from "../components/Cards/LatestBooksCard";
import { Link } from "react-router-dom";
import BooksForYou from "../components/Cards/BooksForYou";

const Dashboard = () => {
  const { userDetails } = useUser();
  return (
    <>
      <div className="flex gap-5">
        <div className="md:w-72"></div>
        <div className="w-full mt-16 bg-[#f5f5f5]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-5">
              <div className="flex gap-2 mt-2 mb-5">
                <IoHomeOutline size={20} className="text-[#005097]" />
                <span className="text-[#005097]">Dashboard</span>
              </div>
              <div className="flex gap-2 items-center">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                  Welcome,
                </h1>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#005097]">
                  {`${userDetails.firstname} ${userDetails.lastname}` || "User"}
                </h2>
              </div>
            </div>
            <div className="flex justify-end">
              <WalletCard />
            </div>
          </div>
          <div className="p-5">
            <ContinueReading />
          </div>
          <div className="p-5">
            <div className="rounded-xl p-5 bg-gray-50 shadow-lg">
              <p className="text-2xl font-bold mb-5 text-[#005097]">
                Latest Books
              </p>
              <div className="pr-5">
                <LatestBooksCard />
              </div>

              <div className="mt-8 text-end">
                <Link to="/dashboard/books" className="text-[#005097]">
                  View all
                </Link>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="rounded-xl p-5 bg-gray-50 shadow-lg">
              <p className="text-2xl font-bold mb-5 text-[#005097]">
                Books For You
              </p>
              <div className="pr-5">
                <BooksForYou />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
