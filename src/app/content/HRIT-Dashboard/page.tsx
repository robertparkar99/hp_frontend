// page.tsx
"use client";
import Index  from '../HRMS/HRIT_Dashboard/Index';
import Header from "@/components/Header/Header";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Wrapper component that uses useSearchParams - wrapped in Suspense
function IndexWithSearchParams() {
  const searchParams = useSearchParams();
  return <Index />;
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
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-0 md:ml-24 lg:ml-76" : "ml-0 md:ml-24"} px-4 py-4`}>
        <Suspense fallback={<div>Loading...</div>}>
          <IndexWithSearchParams />
        </Suspense>
      </div>
    </>
  );
}