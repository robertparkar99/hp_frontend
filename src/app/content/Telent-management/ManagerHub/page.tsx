"use client";
import EmployeeDirectory from "@/app/content/user/index";
import  Header  from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import { useState, useEffect } from "react";
import ManagerDashboard from "./ManagerDashboard";
export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Sync with localStorage and handle sidebar state changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(sidebarState === "true");
    };

    checkSidebarState();
    window.addEventListener("sidebarStateChange", checkSidebarState);

    return () => {
      window.removeEventListener("sidebarStateChange", checkSidebarState);
    };
  }, []);

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };
  return (
    <div className="overflow-x-hidden">
      <div className="mb-5">
      <Header  />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar}  /> */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-76" : "md:ml-24"} ml-0 px-2 md:px-4`}>
      <ManagerDashboard />
      </div>
    </div>
  );
}