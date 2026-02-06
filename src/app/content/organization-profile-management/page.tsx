"use client";
import Profile from "@/app/content/organization-profile-management/profile";
import Header from "@/components/Header/Header";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Initialize from localStorage synchronously to prevent layout shift
    if (typeof window !== 'undefined') {
      return localStorage.getItem("sidebarOpen") === "true";
    }
    return false;
  });

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

  return (
    <>
      <Header />
      <div className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-[80px]"} ml-0 mr-0 lg:mr-4 mt-0 lg:mt-3`}>
        <Profile />
      </div>
    </>
  );
}