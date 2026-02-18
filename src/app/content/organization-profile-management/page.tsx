"use client";
import Profile from "@/app/content/organization-profile-management/profile";
import Header from "@/components/Header/Header";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const isMobile = windowWidth < 768;

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const initializeSidebarState = () => {
      const storedState = localStorage.getItem("sidebarOpen");
      // Default to true (expanded) if no stored state
      setIsSidebarOpen(storedState === null ? true : storedState === "true");
      setIsLoading(false);
    };

    initializeSidebarState();

    // Listen for sidebar state changes
    const handleSidebarStateChange = () => {
      const sidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(sidebarState === "true");
    };

    window.addEventListener("sidebarStateChange", handleSidebarStateChange);

    return () => {
      window.removeEventListener("sidebarStateChange", handleSidebarStateChange);
    };
  }, []);

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  // TODO: Replace this with actual session data fetching logic
  const sessionData = {
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    userimage: "",
    firstName: "",
    lastName: ""
  }; // Placeholder object with required properties

  // Calculate margin based on sidebar state - use responsive values
  // On mobile: small margin to look clean
  // On tablet/desktop: 80px collapsed, 280px expanded
  const getMarginLeft = () => {
    if (isMobile) {
      return '12px'; // Mobile - small margin for clean look
    }
    return isSidebarOpen ? '280px' : '80px';
  };

  return (
    <>
      <Header />
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: getMarginLeft(),
          marginRight: '12px',
          marginTop: '12px',
          marginBottom: '1rem',
          minHeight: isMobile ? 'auto' : 'calc(100vh - 60px)',
          overflowX: 'hidden',
          width: isMobile ? 'calc(100% - 24px)' : 'auto'
        }}
      >
        <Profile />
      </div>
    </>
  );
}