/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  Settings,
  PlusCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { token } from "@/utils";
import toast from "react-hot-toast";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: PlusCircle, label: "Post a Job", path: "/post-job" },
  { icon: Briefcase, label: "Manage Jobs", path: "/manage-jobs" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: LogOut, label: "Logout", path: "/sign-in" },
];

export const Sidebar = ({ isPostJobEnabled, isPhoneNumber }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  // const [isPostJobEnabled, setIsPostJobEnabled] = React.useState(false);

  // React.useEffect(() => {
  //   const checkCompanyAccess = async () => {
  //     const idToken = localStorage.getItem(token);
  //     if (!idToken) {
  //       toast.error("Seems like you are not logged in");
  //       setTimeout(() => {
  //         navigate("/sign-in");
  //       }, 2000);
  //       return;
  //     }

  //     try {
  //       // console.log("here");
  //       const response = await axios.get(`${host}/company`, {
  //         headers: {
  //           Authorization: idToken,
  //         },
  //       });
  //       if (response.status === 200) {
  //         setIsPostJobEnabled(true);
  //       }
  //     } catch (error) {
  //       console.log(error);

  //       setIsPostJobEnabled(false);
  //     }
  //   };

  //   checkCompanyAccess();
  // }, []);

  const handleLogoutClick = (e: any) => {
    e.preventDefault();
    setIsLogoutModalOpen(true);
  };

  const handlePostJobClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isPostJobEnabled || !isPhoneNumber) {
      e.preventDefault(); // Prevent navigation when disabled
      toast.error("Fill in Company details in the Settings page to post a job");
    }
    setIsMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsMobileMenuOpen(false);
    localStorage.removeItem(token);
    navigate("/sign-in");
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <div
        className={`md:flex md:h-screen md:w-72 flex-col border-r bg-white ${
          isMobileMenuOpen ? "fixed inset-0 z-50" : "hidden md:flex"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-semibold text-blue-600">
            Inovact Opportunities
          </h1>
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isLogout = item.label === "Logout";
            const isPostJob = item.label === "Post a Job";

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={
                  isLogout
                    ? handleLogoutClick
                    : isPostJob
                    ? handlePostJobClick
                    : () => setIsMobileMenuOpen(false)
                }
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isPostJob && (!isPostJobEnabled || !isPhoneNumber)
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : isLogout
                    ? isActive
                      ? "bg-red-100 text-red-700"
                      : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    : isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
                {...(isPostJob && !isPostJobEnabled
                  ? { "aria-disabled": "true" }
                  : {})}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="md:hidden flex h-16 items-center justify-between border-b bg-white px-2">
        <h1 className="text-xl font-bold text-blue-600">
          Inovact Opportunities
        </h1>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Are you sure you want to logout?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You will need to sign in again to access your dashboard.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
