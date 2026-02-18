// page.tsx
"use client";

import { Suspense } from "react";
import Index from '../HRMS/HRIT_Dashboard/Index';
import Header from "@/components/Header/Header";
import { useState, useEffect } from "react";

function IndexWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Index />
    </Suspense>
  );
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-76" : "ml-24"}`}>
        <IndexWithSuspense />
      </div>
    </>
  );
}
