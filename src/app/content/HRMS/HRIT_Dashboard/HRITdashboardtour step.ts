"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Shepherd, { Tour } from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { logUserJourney, getPageInfo } from "@/utils/journeyLogger";

// Interface for API tour step data
interface TourStepData {
  on_click: string;
  title: string;
  description: string;
}

// Helper to get user data from localStorage
const getUserData = (): { url: string; token: string; subInstituteId: string } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
      return {
        url: APP_URL,
        token,
        subInstituteId: String(sub_institute_id)
      };
    }
  } catch (e) {
    console.error('[HRIT Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchHRITTourStepsFromAPI = async (menuId: number): Promise<TourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[HRIT Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    // Use localhost as base URL, with token and sub_institute_id from userData
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
    console.log('[HRIT Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[HRIT Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: TourStepData[] = [];

    if (Array.isArray(json)) {
      tourData = json;
    } else if (json.data && Array.isArray(json.data)) {
      tourData = json.data;
    } else if (json.result && Array.isArray(json.result)) {
      tourData = json.result;
    } else if (json.response && Array.isArray(json.response)) {
      tourData = json.response;
    } else if (typeof json === 'object') {
      for (const key of Object.keys(json)) {
        if (Array.isArray(json[key])) {
          tourData = json[key];
          console.log(`[HRIT Tour] Found array data in response.${key}`);
          break;
        }
      }
    }

    // Normalize field names
    const normalizedTourData = tourData.map((step: any) => ({
      on_click: step.on_click || step.onClick || step.step_key || step.stepKey || step.id,
      title: step.title || step.Title || step.name || step.step_title || step.stepTitle || '',
      description: step.description || step.Description || step.text || step.Text || step.content || step.step_description || ''
    }));

    console.log('[HRIT Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[HRIT Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Define placement type compatible with shepherd.js v15+
export type PopperPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end"
  | "auto"
  | "auto-start"
  | "auto-end";

export interface TourStep {
  id: string;
  title: string;
  text: string;
  element: string;
  placement: PopperPlacement;
}

interface UseShepherdTourReturn {
  showTour: boolean;
  isRedirecting: boolean;
  startTour: () => void;
  cancelTour: () => void;
  completeTour: () => void;
}

// HRIT Dashboard Tour Steps - Only includes elements that exist in the UI


export const useShepherdTour = (
  tourId: string,
  steps: TourStep[],
  redirectOnComplete: boolean = false
): UseShepherdTourReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tour, setTour] = useState<Tour | null>(null);
  const [tourStepsFromAPI, setTourStepsFromAPI] = useState<TourStepData[]>([]);

  // Fetch tour steps from API on mount
  useEffect(() => {
    const fetchTourSteps = async () => {
      // menu_id = 5 for HRIT Dashboard
      const apiSteps = await fetchHRITTourStepsFromAPI(5);
      setTourStepsFromAPI(apiSteps);
    };
    fetchTourSteps();
  }, []);

  // Create tour instance
  useEffect(() => {
    const tourInstance = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: "smooth", block: "center" },
        classes: "shepherd-theme-arrows",
      },
    });

    setTour(tourInstance);

    return () => {
      tourInstance.cancel();
    };
  }, []);

  // Add styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .shepherd-element {
        border-radius: 0.875rem !important;
        max-width: 450px !important;
      }
      .shepherd-content {
        border-radius: 0.875rem 0 0 0 !important;
      }
      .shepherd-header {
        background: linear-gradient(90deg, #3b82f6, #2563eb) !important;
        padding: 1rem !important;
        border-radius: 0.875rem 0 0 0 !important;
      }
      .shepherd-arrow {
        z-index: 999;
      }
      .shepherd-footer {
        padding: 0.875rem 1.125rem 1.125rem;
        display: flex;
        gap: 0.625rem;
        justify-content: space-between;
      }
      .shepherd-button {
        border-radius: 999px !important;
        padding: 0.5rem 1.125rem !important;
        font-weight: 500;
        font-size: 0.875rem;
        transition: all 0.25s ease;
      }
      .shepherd-skip {
        background: transparent !important;
        color: #6b7280 !important;
      }
      .shepherd-skip:hover {
        color: #111827 !important;
      }
      .shepherd-back {
        background: #f3f4f6 !important;
        color: #374151 !important;
      }
      .shepherd-next, .shepherd-finish {
        background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
        color: white !important;
        box-shadow: 0 8px 20px rgba(37,99,235,0.35);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Check if tour should be shown - only from sidebar tour (sessionStorage) or explicit URL param
  useEffect(() => {
    // Check if tour was triggered from sidebar tour (primary trigger)
    const sidebarTrigger = sessionStorage.getItem('triggerPageTour');

    // Check URL param (secondary trigger)
    const urlShowTour = searchParams.get("showTour") === "true";

    // Only start tour if triggered from sidebar tour OR explicitly via URL
    // Do NOT start on normal page load/refresh
    const shouldShowTour = sidebarTrigger === 'HRIT-dashboard' || urlShowTour;

    console.log('[HRIT Tour] Sidebar trigger:', sidebarTrigger);
    console.log('[HRIT Tour] URL showTour:', urlShowTour);
    console.log('[HRIT Tour] Should show:', shouldShowTour);

    if (shouldShowTour) {
      setShowTour(true);

      // Clear the sidebar trigger so tour doesn't reappear on refresh
      if (sidebarTrigger === 'HRIT-dashboard') {
        sessionStorage.removeItem('triggerPageTour');
      }

      // Clear URL param if it was set
      if (urlShowTour) {
        setIsRedirecting(true);
        router.replace(window.location.pathname);
      }
    }
  }, [router, searchParams]);

  // Log journey when tour starts
  const handleTourStart = useCallback(() => {
    const pageInfo = getPageInfo();
    logUserJourney({
      eventType: 'tour_started',
      stepKey: 'HRIT-dashboard-tour',
      menuId: pageInfo.menuId,
      accessLink: pageInfo.accessLink,
    });
  }, []);

  // Log journey when step is shown
  const handleStepShow = useCallback((step: any) => {
    const pageInfo = getPageInfo();
    logUserJourney({
      eventType: 'tour_step_view',
      stepKey: step.id,
      menuId: pageInfo.menuId,
      accessLink: pageInfo.accessLink,
    });
  }, []);

  // Log journey when step is completed
  const handleStepComplete = useCallback((step: any) => {
    const pageInfo = getPageInfo();
    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: step.id,
      menuId: pageInfo.menuId,
      accessLink: pageInfo.accessLink,
    });
  }, []);

  // Log journey when tour is completed or skipped
  const handleTourComplete = useCallback((eventType: string) => {
    const pageInfo = getPageInfo();
    logUserJourney({
      eventType: eventType,
      stepKey: 'HRIT-dashboard-tour',
      menuId: pageInfo.menuId,
      accessLink: pageInfo.accessLink,
    });
  }, []);

  // Track if tour has been started to prevent multiple starts
  const tourStartedRef = useRef(false);

  // Configure tour steps - with dynamic filtering for existing elements
  useEffect(() => {
    if (!tour || !showTour) return;

    // Wait for API data to be available before configuring tour
    // If API data is not yet available, skip this run - the effect will re-run when tourStepsFromAPI changes
    if (tourStepsFromAPI.length === 0) {
      console.log('[HRIT Tour] Waiting for API data...', tourStepsFromAPI);
      return;
    }

    // Prevent multiple tour starts
    if (tourStartedRef.current) {
      console.log('[HRIT Tour] Tour already started, skipping...');
      return;
    }
    tourStartedRef.current = true;

    // Get steps with API data applied using the HRITDashboardTourSteps function
    const stepsWithAPI = HRITDashboardTourSteps(tourStepsFromAPI);

    // Filter steps to only include elements that exist in the DOM
    const existingSteps = stepsWithAPI.filter((step) => {
      const element = document.querySelector(step.element);
      return element !== null;
    });

    console.log('[HRIT Tour] Total steps:', stepsWithAPI.length, 'Existing steps:', existingSteps.length);
    console.log('[HRIT Tour] API steps:', tourStepsFromAPI);



    const getButtons = (index: number, totalSteps: number) => {
      const skip = {
        text: "Skip",
        action: () => {
          handleTourComplete('tour_skipped');
          tour.cancel();
          localStorage.setItem(`${tourId}TourCompleted`, "true");
        },
        classes: "shepherd-skip",
      };

      const back = {
        text: "Back",
        action: tour.back,
        classes: "shepherd-back",
      };

      const next = {
        text: "Next",
        action: () => {
          // Get current step before moving to next
          const currentStep = tour.getCurrentStep();
          if (currentStep) {
            handleStepComplete(currentStep);
          }
          tour.next();
        },
        classes: "shepherd-next",
      };

      const finish = {
        text: "Finish",
        action: () => {
          handleTourComplete('tour_complete');
          tour.complete();
          localStorage.setItem(`${tourId}TourCompleted`, "true");
          if (redirectOnComplete) {
            router.replace(window.location.pathname);
          }
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === totalSteps - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    const tourSteps = existingSteps.map((step: TourStep, index: number) => ({
      id: step.id,
      title: step.title,
      text: step.text,
      attachTo: { element: step.element, on: step.placement },
      buttons: getButtons(index, existingSteps.length),
    }));

    tourSteps.forEach((step) => {
      tour.addStep(step);
    });

    // Add event listeners for journey logging
    tour.on('show', (e: any) => {
      const step = e.step;
      if (step) {
        handleStepShow(step);
      }
    });

    // Start tour after a short delay
    const startTimer = setTimeout(() => {
      try {
        handleTourStart();
        tour.start();
      } catch (error) {
        console.error("Error starting tour:", error);
      }
    }, 800);

    return () => {
      clearTimeout(startTimer);
      tour.cancel();
    };
  }, [tour, showTour, steps, tourId, redirectOnComplete, router, handleTourStart, handleStepShow, handleStepComplete, handleTourComplete, tourStepsFromAPI]);

  const startTour = useCallback(() => {
    if (tour) {
      tour.start();
    }
  }, [tour]);

  const cancelTour = useCallback(() => {
    if (tour) {
      tour.cancel();
      localStorage.setItem(`${tourId}TourCompleted`, "true");
    }
  }, [tour, tourId]);

  const completeTour = useCallback(() => {
    if (tour) {
      tour.complete();
      localStorage.setItem(`${tourId}TourCompleted`, "true");
      if (redirectOnComplete) {
        router.replace(window.location.pathname);
      }
    }
  }, [tour, tourId, redirectOnComplete, router]);

  return {
    showTour,
    isRedirecting,
    startTour,
    cancelTour,
    completeTour,
  };
};

// Default tour steps with API override support
export const HRITDashboardTourSteps = (tourStepsFromAPI: TourStepData[] = []): TourStep[] => {
  // Create a map of on_click to API step for easy lookup
  const apiStepsMap = new Map<string, { title: string; description: string }>();
  tourStepsFromAPI.forEach((step: TourStepData) => {
    apiStepsMap.set(step.on_click, { title: step.title, description: step.description });
  });

  console.log('[HRIT Tour] HRITDashboardTourSteps apiStepsMap:', Array.from(apiStepsMap.entries()));

  return [
    {
      id: "welcome",
      title: apiStepsMap.get('welcome')?.title || "Welcome to HR Analytics Dashboard",
      text: apiStepsMap.get('welcome')?.description || "This dashboard provides real-time workforce insights and analytics. Let me show you around!",
      element: "#dashboard-title",
      placement: "bottom" as PopperPlacement,
    },
    {
      id: "department-filter",
      title: apiStepsMap.get('department-filter')?.title || "Department Filter",
      text: apiStepsMap.get('department-filter')?.description || "Filter data by department using this dropdown. Select 'All Departments' to see aggregate data or choose a specific department.",
      element: "#department-select",
      placement: "bottom" as PopperPlacement,
    },
    {
      id: "period-filter",
      title: apiStepsMap.get('period-filter')?.title || "Time Period Filter",
      text: apiStepsMap.get('period-filter')?.description || "Choose the time period for your analytics. Options include Last 7 Days, Last 30 Days, Last 90 Days, or This Year.",
      element: "#period-select",
      placement: "bottom" as PopperPlacement,
    },
    {
      id: "notifications",
      title: apiStepsMap.get('notifications')?.title || "Notifications",
      text: apiStepsMap.get('notifications')?.description || "Click here to view your notifications. A red badge indicates unread notifications.",
      element: "#notification-btn",
      placement: "left" as PopperPlacement,
    },
    {
      id: "overview-section",
      title: apiStepsMap.get('overview-section')?.title || "KPI Overview",
      text: apiStepsMap.get('overview-section')?.description || "This section shows key performance indicators including Present Today, Leave Utilization, and Active Employees.",
      element: "#overview-section",
      placement: "top" as PopperPlacement,
    },
    {
      id: "present-today",
      title: apiStepsMap.get('present-today')?.title || "Present Today KPI",
      text: apiStepsMap.get('present-today')?.description || "Track the percentage of employees present today. Click to view detailed attendance reports.",
      element: "#kpi-present-today",
      placement: "bottom" as PopperPlacement,
    },
    {
      id: "leave-utilization",
      title: apiStepsMap.get('leave-utilization')?.title || "Leave Utilization KPI",
      text: apiStepsMap.get('leave-utilization')?.description || "Monitor how leave days are being utilized across departments. Helps in planning resource allocation.",
      element: "#kpi-leave-utilization",
      placement: "bottom" as PopperPlacement,
    },
    {
      id: "active-employees",
      title: apiStepsMap.get('active-employees')?.title || "Active Employees KPI",
      text: apiStepsMap.get('active-employees')?.description || "Total number of active employees in the organization. Click to view the employee directory.",
      element: "#kpi-active-employees",
      placement: "bottom" as PopperPlacement,
    },
    {
      id: "attendance-section",
      title: apiStepsMap.get('attendance-section')?.title || "Attendance Module",
      text: apiStepsMap.get('attendance-section')?.description || "This section displays attendance trends and leave distribution across the organization.",
      element: "#attendance-section",
      placement: "top" as PopperPlacement,
    },
    {
      id: "attendance-chart",
      title: apiStepsMap.get('attendance-chart')?.title || "Attendance Chart",
      text: apiStepsMap.get('attendance-chart')?.description || "Visual representation of attendance data over time. Hover over data points for detailed information.",
      element: "#attendance-chart",
      placement: "left" as PopperPlacement,
    },
    {
      id: "leave-chart",
      title: apiStepsMap.get('leave-chart')?.title || "Leave Distribution",
      text: apiStepsMap.get('leave-chart')?.description || "This chart shows the distribution of different types of leave (Sick, Casual, Earned, etc.).",
      element: "#leave-chart",
      placement: "right" as PopperPlacement,
    },
    {
      id: "insights-card",
      title: apiStepsMap.get('insights-card')?.title || "HR Insights",
      text: apiStepsMap.get('insights-card')?.description || "This card provides AI-generated insights and recommendations based on your workforce data.",
      element: "#insights-card",
      placement: "right" as PopperPlacement,
    },
  ];
};

