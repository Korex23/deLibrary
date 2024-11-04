import Onboarding from "./components/Forms/Onboarding";
import UserSignUpForm from "./components/Forms/UserSignUpForm";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./CustomerDashboard/Dashboard";
import ProtectedRoutes from "./ProtectedRoutes";

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <UserSignUpForm />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/dashboard",
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "author",
        element: (
          <ProtectedRoutes>
            <div>Admin Dashboard</div>,
          </ProtectedRoutes>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={BrowserRouter} />;
}

export default App;
