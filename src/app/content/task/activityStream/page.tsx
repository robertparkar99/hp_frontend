"use client";
import ActivityStream from "../activityStream";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import { useState, useEffect } from "react";
export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  //const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if we're on mobile/tablet
  const isMobile = windowWidth < 1024;


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

  // Calculate margin based on sidebar state - use responsive values
  const getMarginLeft = () => {
    if (isMobile) {
      return '12px'; // Mobile - small margin for clean look
    }
    return isSidebarOpen ? '304px' : '96px'; // 24 = 6rem = 96px
  };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };
  return (
    <>
      <div className="mb-5">
        <Header />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar} /> */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: getMarginLeft(),
          marginRight: '12px',
          marginTop: '12px',
          marginBottom: '1rem',
          overflowX: 'hidden',
          width: isMobile ? 'calc(100% - 24px)' : 'auto'
        }}
      >
        <ActivityStream />
      </div>
    </>
  );
}