import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoHelpCircleOutline,
  IoBookmarkOutline,
  IoLogOutOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LuStore } from "react-icons/lu";
import { useUser } from "../../context/context";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import logo from "../../assets/logo.png";

const Sidebar = () => {
  const { user } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

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
      <aside>
        <nav>
          <div>
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              aria-controls="default-sidebar"
              type="button"
              className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
              } sm:translate-x-0`}
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
                            <span>Sales Record</span>
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

export default Sidebar;
