

"use client";
// import Index from '../Telent-management/Talent-Acquisition-Dashboard/Index';
import { Suspense } from 'react';
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import { useState, useEffect } from "react";
// import Dashboard from "./Component/Dashboard";
// import { Agent } from "http";
import AgentDetail from "./Component/AgentDetail";
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
      <div className={`transition-all duration-300 bg-background rounded-2xl p-4 ${isSidebarOpen ? "ml-76" : "ml-24"} p-2`}>
        {/* <Index/> */}
        <Suspense fallback={<div>Loading...</div>}> 
        <AgentDetail/>
        </Suspense>
      </div>
    </>
  );
}
