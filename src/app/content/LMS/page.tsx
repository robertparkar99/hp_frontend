"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import LearningCatalog from "@/app/content/LMS/dashboard";
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

    // Set localStorage for chatbot to detect LMS Course module
    localStorage.setItem('activeSection', 'LMS');
    localStorage.setItem('activeSubItem', 'Course List');
    
    // Dispatch event to notify chatbot of module change
    window.dispatchEvent(new Event('activeItemChange'));

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
      <div className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-[304px]" : "md:ml-24"} ml-0 p-4 md:p-6`}>
        <LearningCatalog />
      </div>
    </>
  );
}