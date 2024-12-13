import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoHelpCircleOutline,
  IoBookmarkOutline,
  IoLogOutOutline,
  IoSettingsOutline,
  IoBookOutline,
} from "react-icons/io5";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LuStore } from "react-icons/lu";
import { useUser } from "../../context/context";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import logo from "../../assets/logo.png";
import Cart from "../../Cart/Cart";

const Sidebar = () => {
  const { user } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Change `isScrolled` to true if the page has been scrolled down
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = () => {
    setIsAuthorDropdownOpen((prev) => !prev);
  };
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <>
      <div
        className={`absolute top-5 right-5 ${isScrolled ? "z-[-10]" : "z-50"}`}
      >
        <UserTopDetails logout={logout} />
      </div>
      <aside>
        <nav>
          <div>
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              aria-controls="default-sidebar"
              type="button"
              className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                />
              </svg>
            </button>

            <aside
              id="default-sidebar"
              className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0`}
              aria-label="Sidebar"
            >
              <div className="h-full px-4 py-4 overflow-y-auto bg-[#fff]">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="birmbook" className="w-10" />
                  <span className="text-[#005097] font-bold text-xl">
                    Birmbook
                  </span>
                </div>
                <ul className="space-y-2 font-medium relative mt-8">
                  <li>
                    <NavLink
                      to="/dashboard"
                      end // Add this attribute to prevent activation on nested routes
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg ${
                          isActive
                            ? "bg-gray-200 text-[#005097]"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <IoHomeOutline className="inline-block mr-3" />
                      <span>Dashboard</span>
                    </NavLink>
                  </li>
                  <li>
                    <div
                      className="flex items-center p-2 rounded-lg cursor-pointer"
                      onClick={toggleDropdown}
                    >
                      <IoPersonOutline className="inline-block mr-3" />
                      <span className="flex-grow">Authors Section</span>
                      {isAuthorDropdownOpen ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>

                    {isAuthorDropdownOpen && (
                      <ul className="ml-6 mt-2 space-y-1">
                        <li>
                          <NavLink
                            to="/dashboard/author/publish"
                            className={({ isActive }) =>
                              `flex items-center p-2 rounded-lg ${
                                isActive
                                  ? "bg-gray-200 text-[#005097]"
                                  : "text-gray-800 hover:bg-gray-100"
                              }`
                            }
                          >
                            <span>Publish a Book</span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/dashboard/author/sales-record"
                            className={({ isActive }) =>
                              `flex items-center p-2 rounded-lg ${
                                isActive
                                  ? "bg-gray-200 text-[#005097]"
                                  : "text-gray-800 hover:bg-gray-100"
                              }`
                            }
                          >
                            <span>Books Published</span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/dashboard/author"
                            className={({ isActive }) =>
                              `flex items-center p-2 rounded-lg ${
                                isActive
                                  ? "bg-gray-200 text-[#005097]"
                                  : "text-gray-800 hover:bg-gray-100"
                              }`
                            }
                          >
                            <span>Publishers Dashboard</span>
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/bookmarks"
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg ${
                          isActive
                            ? "bg-gray-200 text-[#005097]"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <IoBookmarkOutline className="inline-block mr-3" />
                      <span>Bookmarked Books</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/books"
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg ${
                          isActive
                            ? "bg-gray-200 text-[#005097]"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <LuStore className="inline-block mr-3" />
                      <span>Book Store</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dashboard/mybooks"
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg ${
                          isActive
                            ? "bg-gray-200 text-[#005097]"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <IoBookOutline className="inline-block mr-3" />
                      <span>My Books</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/faq"
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg ${
                          isActive
                            ? "bg-gray-200 text-[#005097]"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <IoHelpCircleOutline className="inline-block mr-3" />
                      <span>FAQ</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/wallet"
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg ${
                          isActive
                            ? "bg-gray-200 text-[#005097]"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <IoWalletOutline className="inline-block mr-3" />
                      <span>My Wallet</span>
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/dashboard/settings"
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-lg ${
                          isActive
                            ? "bg-gray-200 text-[#005097]"
                            : "text-gray-800 hover:bg-gray-100"
                        }`
                      }
                    >
                      <IoSettingsOutline className="inline-block mr-3" />
                      <span>Settings</span>
                    </NavLink>
                  </li>

                  {user && (
                    <li className="font-medium">
                      <button
                        onClick={logout}
                        className="flex items-center p-2"
                      >
                        <IoLogOutOutline className="inline-block mr-3" />
                        <span>Logout</span>
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </aside>
          </div>
        </nav>
        <Outlet />
      </aside>
    </>
  );
};

const UserTopDetails = ({ logout }) => {
  const { userDetails } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex flex-col cursor-pointer" onClick={toggleDropdown}>
          {userDetails ? (
            <>
              <span className="text-lg font-semibold">
                {`${userDetails?.firstname || ""} ${
                  userDetails?.lastname || ""
                }`}
              </span>
              <span className="text-gray-500 text-xs">
                {userDetails?.email || ""}
              </span>
            </>
          ) : (
            <div>Loading user details...</div> // Fallback UI while loading user details
          )}
        </div>
        <Cart />
      </div>
      {isDropdownOpen && (
        <div className="absolute top-10 right-10 w-40 bg-white rounded-lg shadow-lg p-3 mt-3">
          <ul className="space-y-2">
            <li>
              <NavLink to="/dashboard" className="flex items-center space-x-2">
                <IoPersonOutline />
                <span>Profile</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/settings"
                className="flex items-center space-x-2"
              >
                <IoSettingsOutline />
                <span>Settings</span>
              </NavLink>
            </li>
            <li>
              <button onClick={logout} className="flex items-center space-x-2">
                <IoLogOutOutline />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Sidebar;
