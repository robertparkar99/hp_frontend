"use client";
import EmployeeDirectory from "@/app/content/user/index";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import { useState, useEffect, Suspense } from "react";
import HRDashboard from "./HRDashboard";
import {
  startRecruitmentTourIfTriggered,
  createScreeningAllTabTour,
  createApplicationsTabTour
} from "./RecruitmentManagementTourSteps";

// Helper function to get URL parameters
const getUrlParam = (param: string): string | null => {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

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

  // Handle tour trigger - only start tour when triggered from sidebar
  useEffect(() => {
    // Start tour only if triggered from sidebar (via sessionStorage)
    // This ensures tour doesn't start on page refresh
    const timer = setTimeout(() => {
      // Check if we need to start the screening tour (after continuing from dashboard tour)
      const startScreeningTour = getUrlParam('startScreeningTour');
      const startApplicationsTour = getUrlParam('startApplicationsTour');

      if (startScreeningTour === 'true') {
        // Clear the URL parameter without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('startScreeningTour');
        window.history.replaceState({}, '', url.toString());

        // Start the screening all tab tour
        console.log('[Page] Starting screening tour after URL navigation');
        const screeningTour = createScreeningAllTabTour();
        screeningTour.start();
      } else if (startApplicationsTour === 'true') {
        // Clear the URL parameter without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('startApplicationsTour');
        window.history.replaceState({}, '', url.toString());

        // Start the applications tab tour
        console.log('[Page] Starting applications tour after URL navigation');
        const applicationsTour = createApplicationsTabTour();
        applicationsTour.start();
      } else {
        // Normal tour trigger from sidebar
        startRecruitmentTourIfTriggered();
      }
    }, 500); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, []);

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };
  return (
    <div>
      <div className="mb-5">
        <Header />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar}  /> */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-76" : "ml-24"} p-2`}>
        <Suspense fallback={<div>Loading...</div>}>
          <HRDashboard />
        </Suspense>
      </div>
    </div>
  );
}