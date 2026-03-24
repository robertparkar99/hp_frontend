"use client";
import EmployeeDirectory from "@/app/content/user/index";
import  Header  from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import { useState, useEffect, Suspense } from "react";
import HRDashboard from "./HRDashboard";
import {
  startRecruitmentTourIfTriggered,
  createScreeningAllTabTour,
  createApplicationsTabTour,
  createRecruitmentDashboardTour
} from "./RecruitmentManagementTourSteps";
import { setCurrentPageMenuId, logUserJourney, getPageInfo } from "@/utils/journeyLogger";

// Helper function to get URL parameters
const getUrlParam = (param: string): string | null => {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

interface SessionData {
  url: string;
  token: string;
  subInstituteId: string;
}

interface TourStepData {
  on_click: string;
  title: string;
  description: string;
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tourStepsFromAPI, setTourStepsFromAPI] = useState<TourStepData[]>([]);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: String(sub_institute_id),
        });
      } catch (e) {
        console.error("[RecruitmentManagement] Invalid userData in localStorage", e);
      }
    }
  }, []);

  // Fetch tour steps from API
  useEffect(() => {
    async function fetchTourSteps() {
      if (!sessionData) return;

      try {

        const { menuId } = getPageInfo();
        console.log('[RecruitmentManagement] Fetching tour steps for menuId:', menuId);

        const res = await fetch(
          `${sessionData.url}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[RecruitmentManagement] Tour steps raw API response:', json);

        // Handle different response formats
        let tourData = [];

        // Try to find the data in various response structures
        if (Array.isArray(json)) {
          tourData = json;
        } else if (json.data && Array.isArray(json.data)) {
          tourData = json.data;
        } else if (json.result && Array.isArray(json.result)) {
          tourData = json.result;
        } else if (json.response && Array.isArray(json.response)) {
          tourData = json.response;
        } else if (typeof json === 'object') {
          // Try to find any array property in the response
          for (const key of Object.keys(json)) {
            if (Array.isArray(json[key])) {
              tourData = json[key];
              console.log(`[RecruitmentManagement] Found array data in response.${key}`);
              break;
            }
          }
        }

        // Normalize field names - API might use different casing
        const normalizedTourData = tourData.map((step: any) => ({
          on_click: step.on_click || step.onClick || step.step_key || step.stepKey || step.id,
          title: step.title || step.Title || step.name || step.step_title || step.stepTitle || '',
          description: step.description || step.Description || step.text || step.Text || step.content || step.step_description || ''
        }));

        console.log('[RecruitmentManagement] Parsed tour data:', normalizedTourData);
        console.log('[RecruitmentManagement] Sample tour step:', normalizedTourData[0]);
        setTourStepsFromAPI(normalizedTourData);
      } catch (error) {
        console.error("[RecruitmentManagement] Error fetching tour steps:", error);
      }
    }

    fetchTourSteps();
  }, [sessionData]);
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
    // Only start tour if we have tour steps from API AND triggered from sidebar
    if (tourStepsFromAPI.length === 0) {
      console.log('[RecruitmentManagement] Waiting for tour steps from API...');
      return;
    }

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
        const screeningTour = createScreeningAllTabTour(tourStepsFromAPI);
        screeningTour.start();
      } else if (startApplicationsTour === 'true') {
        // Clear the URL parameter without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('startApplicationsTour');
        window.history.replaceState({}, '', url.toString());

        // Start the applications tab tour
        console.log('[Page] Starting applications tour after URL navigation');
        const applicationsTour = createApplicationsTabTour(tourStepsFromAPI);
        applicationsTour.start();
      } else {
        // Normal tour trigger from sidebar
        console.log('[RecruitmentManagement] Starting recruitment tour with steps:', tourStepsFromAPI);
        startRecruitmentTourIfTriggered(tourStepsFromAPI);
      }
    }, 500); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [tourStepsFromAPI]);

  // Set menuID and log page visit on mount
  useEffect(() => {
    // Set the current page menuId for journey logging
    // This should match the menu ID from the sidebar configuration
    const { menuId } = getPageInfo();

    // If menuId is 0 or not set, try to set a default for Recruitment Management
    if (!menuId) {
      // The menuId should be set by the sidebar when navigating to this page
      // If it's not set, we can still log with whatever menuId is available
      console.log('[RecruitmentManagement] Page loaded, menuId from getPageInfo:', menuId);
    }

    // Log page visit
    logUserJourney({
      eventType: 'page_visit',
      stepKey: 'recruitment_management_page',
      menuId: menuId,
      accessLink: '/Telent-management/Recruitment-management',
    }).catch(console.error);
  }, []);

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };
  return (
    <div>
      <div className="mb-5">
      <Header  />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar}  /> */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-76" : "lg:ml-24"} p-2 ml-0`}>
        <Suspense fallback={<div>Loading...</div>}>
          <HRDashboard />
        </Suspense>
      </div>
    </div>
  );
}