import React, { useEffect, useState } from "react";
import customer from "../../assets/customer.jpg";
import author from "../../assets/author.jpg";
import { useUser } from "../../context/context";
import {
  collection,
  getDocs,
  where,
  doc,
  updateDoc,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Onboarding = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referrer, setReferrer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });
    };

    fetchData();
  }, []);

  const getReferrer = async () => {
    const q = query(
      collection(db, "users"),
      where("referralCode", "==", referralCode)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot;
  };

  const handleSelectCustomer = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      isCustomer: true,
    });
    navigate("/dashboard");
  };

  const handleSelectAuthor = async () => {
    try {
      const referrer = await getReferrer();
      let referrerData = null;

      if (!referrer.empty) {
        const referrerDoc = referrer.docs[0];
        referrerData = {
          id: referrerDoc.id,
          name: `${referrerDoc.data().firstname} ${
            referrerDoc.data().lastname
          }`,
        };
      }

      // Update user data with or without referrer information
      await updateDoc(doc(db, "users", user.uid), {
        isAuthor: true,
        isCustomer: true,
        ...(referrerData && {
          referrer: referrerData.id,
          referredBy: referrerData.name,
        }), // Include referrer ID if found
      });

      if (referrerData) {
        setReferrer(referrerData.name);
        // alert(`You have been referred by ${referrerData.name}.`);
        toast.success(`You have been referred by ${referrerData.name}.`);
      }

      closeModalHandler();
      navigate("/dashboard");
    } catch (error) {
      // alert("Invalid referral code. Please try again.");
      toast.error("Invalid referral code. Please try again.");
    }
  };

  const openModalHandler = () => {
    setOpenModal(true);
  };

  const closeModalHandler = () => {
    setOpenModal(false);
  };

  return (
    <div>
      <div className="flex justify-center items-center flex-wrap min-h-screen bg-gray-100 gap-5">
        <SelectRoleCard
          title="Customer"
          description="Access exclusive deals, rewards, and personalized recommendations."
          image={customer}
          onSelect={handleSelectCustomer}
        />
        <SelectRoleCard
          title="Author"
          description="Share your expertise, publish articles, and engage with a community of readers."
          image={author}
          onSelect={openModalHandler}
        />
      </div>
      {openModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96 shadow-lg relative">
            <h2 className="text-2xl font-semibold mb-4">Enter Referral Code</h2>
            <input
              type="text"
              placeholder="Referral Code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500 mb-4"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            <button
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out"
              onClick={handleSelectAuthor}
            >
              Submit
            </button>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeModalHandler}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectRoleCard = ({ title, description, image, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="w-80 h-[400px] cursor-pointer rounded-lg shadow-lg bg-white px-3 py-3 border border-gray-200 hover:shadow-xl transition-shadow relative"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-52 object-cover rounded-lg mb-4"
      />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
      <div className="flex justify-center">
        <button className="w-[90%] py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 absolute bottom-5">
          Choose {title}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
