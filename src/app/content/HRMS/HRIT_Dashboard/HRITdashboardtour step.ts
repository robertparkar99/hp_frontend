"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Shepherd from "shepherd.js";
import type { Tour as ShepherdTour, StepOptions, PopperPlacement } from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

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

// HRIT Dashboard Tour Steps
export const HRITDashboardTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to HR Analytics Dashboard",
    text: "This dashboard provides real-time workforce insights and analytics. Let me show you around!",
    element: "#dashboard-title",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "department-filter",
    title: "Department Filter",
    text: "Filter data by department using this dropdown. Select 'All Departments' to see aggregate data or choose a specific department.",
    element: "#department-select",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "period-filter",
    title: "Time Period Filter",
    text: "Choose the time period for your analytics. Options include Last 7 Days, Last 30 Days, Last 90 Days, or This Year.",
    element: "#period-select",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "notifications",
    title: "Notifications",
    text: "Click here to view your notifications. A red badge indicates unread notifications.",
    element: "#notification-btn",
    placement: "left" as PopperPlacement,
  },
  {
    id: "overview-section",
    title: "KPI Overview",
    text: "This section shows key performance indicators including Present Today, Leave Utilization, Payroll Accuracy, Productivity Index, and Active Employees.",
    element: "#overview-section",
    placement: "top" as PopperPlacement,
  },
  {
    id: "present-today",
    title: "Present Today KPI",
    text: "Track the percentage of employees present today. Click to view detailed attendance reports.",
    element: "#kpi-present-today",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "leave-utilization",
    title: "Leave Utilization KPI",
    text: "Monitor how leave days are being utilized across departments. Helps in planning resource allocation.",
    element: "#kpi-leave-utilization",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "payroll-accuracy",
    title: "Payroll Accuracy KPI",
    text: "Track the accuracy of payroll processing. Higher percentages indicate better efficiency.",
    element: "#kpi-payroll-accuracy",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "productivity-index",
    title: "Productivity Index KPI",
    text: "Measure overall workforce productivity. This score is calculated based on multiple factors.",
    element: "#kpi-productivity-index",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "active-employees",
    title: "Active Employees KPI",
    text: "Total number of active employees in the organization. Click to view the employee directory.",
    element: "#kpi-active-employees",
    placement: "bottom" as PopperPlacement,
  },
  {
    id: "attendance-section",
    title: "Attendance Module",
    text: "This section displays attendance trends and leave distribution across the organization.",
    element: "#attendance-section",
    placement: "top" as PopperPlacement,
  },
  {
    id: "attendance-chart",
    title: "Attendance Chart",
    text: "Visual representation of attendance data over time. Hover over data points for detailed information.",
    element: "#attendance-chart",
    placement: "left" as PopperPlacement,
  },
  {
    id: "leave-chart",
    title: "Leave Distribution",
    text: "This chart shows the distribution of different types of leave (Sick, Casual, Earned, etc.).",
    element: "#leave-chart",
    placement: "right" as PopperPlacement,
  },
  {
    id: "payroll-section",
    title: "Payroll Module",
    text: "Track payroll trends and insights across departments and time periods.",
    element: "#payroll-section",
    placement: "top" as PopperPlacement,
  },
  {
    id: "payroll-chart",
    title: "Payroll Trends",
    text: "Visualize payroll expenditure trends. Filter by department or time period for specific insights.",
    element: "#payroll-chart",
    placement: "left" as PopperPlacement,
  },
  {
    id: "insights-card",
    title: "HR Insights",
    text: "This card provides AI-generated insights and recommendations based on your workforce data.",
    element: "#insights-card",
    placement: "right" as PopperPlacement,
  },
];

export const useShepherdTour = (
  tourId: string,
  steps: TourStep[],
  redirectOnComplete: boolean = false
): UseShepherdTourReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tour, setTour] = useState<ShepherdTour | null>(null);

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

  // Configure tour steps
  useEffect(() => {
    if (!tour || !showTour) return;

    const getButtons = (index: number, totalSteps: number) => {
      const skip = {
        text: "Skip",
        action: () => {
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
        action: tour.next,
        classes: "shepherd-next",
      };

      const finish = {
        text: "Finish",
        action: () => {
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

    const tourSteps: StepOptions[] = steps.map((step, index) => ({
      id: step.id,
      title: step.title,
      text: step.text,
      attachTo: { element: step.element, on: step.placement },
      buttons: getButtons(index, steps.length),
    }));

    tourSteps.forEach((step) => {
      tour.addStep(step);
    });

    // Start tour after a short delay
    const startTimer = setTimeout(() => {
      try {
        tour.start();
      } catch (error) {
        console.error("Error starting tour:", error);
      }
    }, 800);

    return () => {
      clearTimeout(startTimer);
      tour.cancel();
    };
  }, [tour, showTour, steps, tourId, redirectOnComplete, router]);

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
