"use client";
import  Header  from "@/components/Header/Header";
import { useState, useEffect } from "react";
import JobroleLibrary from "./jobroleLibrary";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showTour, setShowTour] = useState(false);
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

    const handleStartTour = () => {
    console.log("Starting tour...");
    setShowWelcomeModal(false);
    setShowTour(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem("competencyManagementOnboardingCompleted", "true");
  };


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
      <JobroleLibrary showDetailTour={{ show: showTour, onComplete: handleTourComplete }} />
      </div>
    </div>
  );
}