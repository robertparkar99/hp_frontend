"use client";
import  Header  from "@/components/Header/Header";
import { useState, useEffect } from "react";
import EmployeeOnboarding from "./EmployeeOnboarding";

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
    <div>
      <div className="mb-5">
      <Header  />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar}  /> */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-76" : "ml-24"} p-2`}>
      <EmployeeOnboarding />
      </div>
    </div>
  );
}