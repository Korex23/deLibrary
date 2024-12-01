import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoutes from "./ProtectedRoutes";
import PrivateRoute from "./PrivateRoutes";

// Lazy load the components
const UserSignUpForm = lazy(() => import("./components/Forms/UserSignUpForm"));
const Onboarding = lazy(() => import("./components/Forms/Onboarding"));
const Dashboard = lazy(() => import("./CustomerDashboard/Dashboard"));
const Sidebar = lazy(() => import("./components/Navabr/Sidebar"));
const AuthorDashboard = lazy(() =>
  import("./PublishersDashboard/AuthorsDashbard")
);
const Wallet = lazy(() => import("./Wallet/Wallet"));
const SignInForm = lazy(() => import("./components/Forms/SignInForm"));
const BookDetails = lazy(() => import("./BooksCatalogue/BookDetails"));
const ReadABook = lazy(() => import("./BooksCatalogue/ReadABook"));
const Bookmarks = lazy(() => import("./BooksCatalogue/Bookmarks"));
const AllBooks = lazy(() => import("./BooksCatalogue/AllBooks"));

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <UserSignUpForm />
      </Suspense>
    ),
  },
  {
    path: "/signin",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Onboarding />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </Suspense>
        ),
      },
      {
        path: "author",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoutes>
              <AuthorDashboard />
            </ProtectedRoutes>
          </Suspense>
        ),
      },
      {
        path: "bookmarks",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Bookmarks />
          </Suspense>
        ),
      },
      {
        path: "wallet",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Wallet />
          </Suspense>
        ),
      },
      {
        path: "books",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AllBooks />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "books",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AllBooks />
          </Suspense>
        ),
      },
      {
        path: ":bookId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BookDetails />
          </Suspense>
        ),
      },
      {
        path: "read/:bookId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ReadABook />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={BrowserRouter} />
      <ToastContainer />
    </>
  );
}

export default App;
