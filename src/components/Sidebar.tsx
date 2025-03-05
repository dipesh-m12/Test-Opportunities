import React from "react";
import { Link, useLocation } from "react-router-dom";
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

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: PlusCircle, label: "Post a Job", path: "/post-job" },
  { icon: Briefcase, label: "Manage Jobs", path: "/manage-jobs" },
  // { icon: Award, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: LogOut, label: "Logout", path: "/sign-in" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <div
        className={`md:flex md:h-screen md:w-64 flex-col border-r bg-white ${
          isMobileMenuOpen ? "fixed inset-0 z-50" : "hidden md:flex"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold text-blue-600">
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

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isLogout
                    ? isActive
                      ? "bg-red-100 text-red-700" // Active Logout: slightly darker red
                      : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" // Inactive Logout: light red
                    : isActive
                    ? "bg-blue-50 text-blue-600" // Active non-Logout items
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900" // Inactive non-Logout items
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="md:hidden flex h-16 items-center justify-between border-b bg-white px-6">
        <h1 className="text-xl font-bold text-blue-600">Inovact</h1>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};
