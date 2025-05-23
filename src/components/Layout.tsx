/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const Layout = ({ isPostJobEnabled, isPhoneNumber }: any) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  useEffect(() => {
    if (pathname == "/sign-up" || pathname == "/sign-in") {
      setShowSidebar(false);
    }
  }, [navigate]);
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {showSidebar && (
        <Sidebar
          isPostJobEnabled={isPostJobEnabled}
          isPhoneNumber={isPhoneNumber}
        />
      )}
      <main className={`flex-1 overflow-auto ${showSidebar && "p-2 md:p-8"}`}>
        <Outlet />
      </main>
    </div>
  );
};
