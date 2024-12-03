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
  const { user } = useUser(); // Access current user
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for submission

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
    return await getDocs(q);
  };

  const handleSelectCustomer = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user.uid), { isCustomer: true });
      toast.success("Welcome! You're now onboarded as a Customer.");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAuthor = async () => {
    setLoading(true);
    try {
      const referrerSnapshot = await getReferrer();
      let referrerData = null;

      if (!referrerSnapshot.empty) {
        const referrerDoc = referrerSnapshot.docs[0];
        referrerData = {
          id: referrerDoc.id,
          name: `${referrerDoc.data().firstname} ${
            referrerDoc.data().lastname
          }`,
        };
      }

      // Update current user's data with referral info
      await updateDoc(doc(db, "users", user.uid), {
        isAuthor: true,
        isCustomer: true,
        isReferred: !!referrerData,
        ...(referrerData && {
          referrer: referrerData.id,
          referredBy: referrerData.name,
        }),
      });

      if (referrerData) {
        toast.success(`You've been referred by ${referrerData.name}.`);
      } else {
        toast.success("You're onboarded as an Author!");
      }

      closeModalHandler();
      navigate("/dashboard");
    } catch (error) {
      toast.error("Invalid referral code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModalHandler = () => setOpenModal(true);
  const closeModalHandler = () => setOpenModal(false);

  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-bold text-center mt-10 mb-2 text-[#005097]">
        Welcome to Your New Journey!
      </h1>
      <p className="text-lg text-gray-600 text-center">
        Choose your role to unlock a personalized experience.
      </p>

      <div className="flex justify-center bg-gray-100 px-4 pt-10">
        <div className="flex flex-wrap gap-6 justify-center ">
          {/* Customer Role Card */}
          <SelectRoleCard
            title="Join as a Customer"
            description="Unlock exclusive deals, earn rewards, and enjoy personalized content tailored to your interests."
            image={customer}
            onSelect={handleSelectCustomer}
          />

          {/* Author Role Card */}
          <SelectRoleCard
            title="Become an Author"
            description="Share your knowledge, publish articles, and engage with a thriving community of readers."
            image={author}
            onSelect={openModalHandler}
          />
        </div>

        {/* Modal for Referral Code */}
        {openModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeModalHandler}
                aria-label="Close modal"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Enter Referral Code
              </h2>
              <p className="text-gray-600 mb-4 text-center">
                If you were referred by an existing author, enter their code to
                connect with them. Otherwise, leave it blank.
              </p>
              <input
                type="text"
                placeholder="Referral Code (Optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSelectAuthor}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SelectRoleCard = ({ title, description, image, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="w-80 h-[430px] cursor-pointer rounded-lg shadow-lg bg-white px-3 py-3 border border-gray-200 hover:shadow-xl transition-shadow relative"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-52 object-cover rounded-lg mb-4"
      />
      <h2 className="text-xl font-semibold text-[#005097] mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
      <div className="flex justify-center">
        <button className="w-[90%] py-2 bg-[#005097] text-white rounded-lg hover:bg-blue-700 absolute bottom-5">
          Choose {title}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
