

"use client";
// import Index from '../Telent-management/Talent-Acquisition-Dashboard/Index';
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import { useState, useEffect } from "react";
// import Dashboard from "./Component/Dashboard";
// import { Agent } from "http";
import MultiAgent from "./Component/MultiAgent";
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
      <div className="mb-5">
        <Header />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar} /> */}
      <div className={`transition-all duration-300 bg-background rounded-2xl ${isSidebarOpen ? "ml-76" : "ml-24"} p-4`}>
        {/* <Index/> */}
        <MultiAgent/>
      </div>
    </>
  );
}
