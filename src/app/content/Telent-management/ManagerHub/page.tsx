"use client";
import EmployeeDirectory from "@/app/content/user/index";
import  Header  from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import { useState, useEffect } from "react";
import ManagerDashboard from "./ManagerDashboard";
import { startManagerHubTour, shouldTriggerManagerHubTour, startAllTabTours, shouldTriggerAllTabTours } from "./ManagerHubTourSteps";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tourInitialized, setTourInitialized] = useState(false);

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

  // Handle tour trigger from sidebar tour flow
  useEffect(() => {
    if (tourInitialized) return;

    // Check if we need to start tours from Offer Management redirect
    const startManagerHubTours = sessionStorage.getItem('startManagerHubTours');
    if (startManagerHubTours === 'true') {
      console.log('[ManagerHub] Starting tours from Offer Management redirect');

      // Clear the flag immediately to prevent re-triggering
      sessionStorage.removeItem('startManagerHubTours');

      // Clear the triggerPageTour flag if set
      sessionStorage.removeItem('triggerPageTour');

      // Clear all tour completed flags to ensure tours run
      sessionStorage.removeItem('managerHubTourCompleted');
      sessionStorage.removeItem('interviewTabTourCompleted');
      sessionStorage.removeItem('offersTabTourCompleted');
      sessionStorage.removeItem('teamTabTourCompleted');

      // Start all tab tours sequentially (Interview → Offer → Team)
      // This includes the complete tour with Hiring Decisions and all steps
      setTimeout(() => {
        startAllTabTours();
        setTourInitialized(true);
      }, 500);
      return;
    }

    // Check if all tab tours should be triggered (for Offer Management)
    const shouldStartAllTours = shouldTriggerAllTabTours();
    console.log('[ManagerHub] Should trigger all tab tours:', shouldStartAllTours);

    if (shouldStartAllTours) {
      // Clear the trigger flag immediately to prevent re-triggering
      sessionStorage.removeItem('triggerPageTour');

      // Start all tab tours sequentially (Interview → Offer → Team)
      setTimeout(() => {
        startAllTabTours();
        setTourInitialized(true);
      }, 500);
      return;
    }

    // Fall back to single tour check
    const shouldStartTour = shouldTriggerManagerHubTour();
    console.log('[ManagerHub] Should trigger tour from sidebar:', shouldStartTour);

    if (shouldStartTour) {
      // Clear the trigger flag immediately to prevent re-triggering
      sessionStorage.removeItem('triggerPageTour');

      // Start the tour after a delay to ensure DOM is ready
      setTimeout(() => {
        startManagerHubTour();
        setTourInitialized(true);
      }, 500);
    } else {
      setTourInitialized(true);
    }
  }, [tourInitialized]);

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