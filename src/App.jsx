import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoutes from "./ProtectedRoutes";
import PrivateRoute from "./PrivateRoutes";
import Spinner from "./components/Spinner";

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
const ResetPassword = lazy(() => import("./components/Forms/ResetPassword"));
const BookDetails = lazy(() => import("./BooksCatalogue/BookDetails"));
const ReadABook = lazy(() => import("./BooksCatalogue/ReadABook"));
const Bookmarks = lazy(() => import("./BooksCatalogue/Bookmarks"));
const AllBooks = lazy(() => import("./BooksCatalogue/AllBooks"));

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Spinner />}>
        <UserSignUpForm />
      </Suspense>
    ),
  },
  {
    path: "/signin",
    element: (
      <Suspense fallback={<Spinner />}>
        <SignInForm />
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<Spinner />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <Suspense fallback={<Spinner />}>
        <Onboarding />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<Spinner />}>
        <Sidebar />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Spinner />}>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </Suspense>
        ),
      },
      {
        path: "author",
        element: (
          <Suspense fallback={<Spinner />}>
            <ProtectedRoutes>
              <AuthorDashboard />
            </ProtectedRoutes>
          </Suspense>
        ),
      },
      {
        path: "bookmarks",
        element: (
          <Suspense fallback={<Spinner />}>
            <Bookmarks />
          </Suspense>
        ),
      },
      {
        path: "wallet",
        element: (
          <Suspense fallback={<Spinner />}>
            <Wallet />
          </Suspense>
        ),
      },
      {
        path: "books",
        element: (
          <Suspense fallback={<Spinner />}>
            <AllBooks />
          </Suspense>
        ),
      },
      {
        path: "mybooks",
        element: (
          <Suspense fallback={<Spinner />}>
            <AllBooks />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "books",
    element: (
      <Suspense fallback={<Spinner />}>
        <Sidebar />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Spinner />}>
            <AllBooks />
          </Suspense>
        ),
      },
      {
        path: ":bookId",
        element: (
          <Suspense fallback={<Spinner />}>
            <BookDetails />
          </Suspense>
        ),
      },
      {
        path: "read/:bookId",
        element: (
          <Suspense fallback={<Spinner />}>
            <ReadABook />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "spinner",
    element: <Spinner />,
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
