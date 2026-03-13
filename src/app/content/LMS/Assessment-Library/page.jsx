"use client";
import  Header  from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import AssessmentLibrary from "./AssessmentLibrary";
import { useState, useEffect } from "react";
import { AssessmentLibraryTour } from "./AssessmentLibraryTourSteps";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTourReady, setIsTourReady] = useState(false);

  // Sync with localStorage and handle sidebar state changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(sidebarState === "true");
    };

    checkSidebarState();
    window.addEventListener("sidebarStateChange", checkSidebarState);

    // Set localStorage for chatbot to detect LMS Assessment module
    localStorage.setItem('activeSection', 'LMS');
    localStorage.setItem('activeSubItem', 'Assessment');
    
    // Dispatch event to notify chatbot of module change
    window.dispatchEvent(new Event('activeItemChange'));

    return () => {
      window.removeEventListener("sidebarStateChange", checkSidebarState);
    };
  }, []);

  // Check if tour should start and wait for components to be ready
  useEffect(() => {
    if (!isSidebarOpen) return;

    // Wait for sidebar to be open and components to render
    const timer = setTimeout(() => {
      if (AssessmentLibraryTour.shouldStartTour()) {
        console.log('Tour trigger detected in page.jsx, starting tour...');
        setIsTourReady(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  // Start tour when ready
  useEffect(() => {
    if (isTourReady) {
      AssessmentLibraryTour.startTour();
      setIsTourReady(false);
    }
  }, [isTourReady]);

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };
  return (
    <>
      <div className="mb-5">
      <Header  />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar} /> */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-76' : 'lg:ml-24'} p-4 md:p-6 ml-0`}>
      <AssessmentLibrary />
      </div>
    </>
  );
}