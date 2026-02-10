"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import AttendanceReport from "@/app/content/HRMS/AttendanceReport/attendanceReport";
import { useState, useEffect } from "react";
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
    <>
      <div className="mb-6">
        <Header />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar} /> */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-76" : "md:ml-24"} px-4 md:px-6 lg:px-8 pb-6`}>
        <div className="space-y-6">
          <AttendanceReport />
        </div>
      </div>
    </>
  );
}