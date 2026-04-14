"use client";

import Header from "@/components/Header/Header";
import { useState, useEffect } from "react";
import ExcelAutomationAgentPage from "./ExcelAutomationAgentPage";

export default function HomePage() {
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

  return (
    <div>
      <div className="mb-5">
        <Header />
      </div>
      <div
        className={`transition-all duration-300 bg-background rounded-2xl p-4 ${
          isSidebarOpen ? "ml-0 md:ml-76" : "ml-0 md:ml-24"
        }`}
      >
        <ExcelAutomationAgentPage />
      </div>
    </div>
  );
}
