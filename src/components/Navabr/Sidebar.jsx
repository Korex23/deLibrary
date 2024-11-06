import { useState } from "react";
import { Link, Outlet, NavLink } from "react-router-dom";
import { useUser } from "../../context/context";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

const Sidebar = () => {
  const { user } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
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
              className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
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
              <div className="h-full px-4 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                <ul className="space-y-8 font-medium relative">
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="author">Authors Section</Link>
                  </li>
                  <li>
                    <Link to="">My Books</Link>
                  </li>
                  <li>
                    <Link to="">Bookmarked Books</Link>
                  </li>
                  <li>
                    <Link to="">Book Store</Link>
                  </li>
                  <li>
                    <Link to="">FAQ</Link>
                  </li>
                  <li>
                    <Link to="wallet">My Wallet</Link>
                  </li>
                </ul>
                {user && (
                  <div className="absolute bottom-10 font-medium">
                    <button onClick={logout}>Logout</button>
                  </div>
                )}
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
