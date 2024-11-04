import Onboarding from "./components/Forms/Onboarding";
import UserSignUpForm from "./components/Forms/UserSignUpForm";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./CustomerDashboard/Dashboard";
import ProtectedRoutes from "./ProtectedRoutes";
import Sidebar from "./components/Navabr/Sidebar";
import AuthorDashboard from "./PublishersDashboard/AuthorsDashbard";
import Wallet from "./Wallet/Wallet";
import SignInForm from "./components/Forms/SignInForm";

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <UserSignUpForm />,
  },
  {
    path: "/signin",
    element: <SignInForm />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/dashboard",
    element: <Sidebar />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "author",
        element: (
          <ProtectedRoutes>
            <AuthorDashboard />
          </ProtectedRoutes>
        ),
      },
      {
        path: "wallet",
        element: <Wallet />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={BrowserRouter} />;
}

export default App;
