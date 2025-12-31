"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import SkillLibrary from "../skillLibraryv2";
import WelcomeModal from "../../Onboarding/Competency-Management/WelcomeModal";
import CompletionScreen from "../../Onboarding/Competency-Management/CompletionScreen";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [activeTab, setActiveTab] = useState("Skill Library");

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

  // Check if onboarding has been completed
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("competencyManagementOnboardingCompleted");
    if (!onboardingCompleted) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  const handleStartTour = () => {
    console.log("Starting tour...");
    setShowWelcomeModal(false);
    setShowTour(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    setShowCompletionScreen(true);
  };

  const handleSkipTour = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("competencyManagementOnboardingCompleted", "true");
  };

  const handleCompletionComplete = () => {
    setShowCompletionScreen(false);
    localStorage.setItem("competencyManagementOnboardingCompleted", "true");
  };

  return (
    <>
      <div className="mb-5">
        <Header />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar} userSessionData={{
        url: "",
        token: "",
        orgType: "",
        subInstituteId: "",
        userId: "",
        userProfile: "",
        userimage: "",
        firstName: "",
        lastName: ""
      }} /> */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-76" : "ml-24"} p-2`}>
        <SkillLibrary showTour={showTour} onTourComplete={handleTourComplete} />
      </div>

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleSkipTour}
        onStartTour={handleStartTour}
      />

      <CompletionScreen
        isOpen={showCompletionScreen}
        onClose={handleCompletionComplete}
        onComplete={handleCompletionComplete}
      />

    </>
  );
}