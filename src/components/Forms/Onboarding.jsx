import React, { useEffect } from "react";
import customer from "../../assets/customer.jpg";
import author from "../../assets/author.jpg";
import { useUser } from "../../context/context";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const handleSelectCustomer = async () => {
    alert("Customer role selected!");

    await updateDoc(doc(db, "users", user.uid), {
      isCustomer: true, // Assuming you have a field isRead to track read status
    });
    navigate("/dashboard");
  };

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });
    };

    fetchData();
  }, []);

  const handleSelectAuthor = async () => {
    alert("Author role selected!");
    // Add navigation or role handling logic here
    await updateDoc(doc(db, "users", user.uid), {
      isAuthor: true, // Assuming you have a field isRead to track read status
      isCustomer: true,
    });
    navigate("/dashboard");
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
          onSelect={handleSelectAuthor}
        />
      </div>
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
