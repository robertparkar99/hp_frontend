  
"use client";

import { useEffect, useState, useRef } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { employeeDirectoryTourSteps } from "@/lib/employeeDirectoryTourSteps";
import { logUserJourney, getPageInfo } from "@/utils/journeyLogger";

interface SessionData {
  url: string;
  token: string;
  subInstituteId: string;
}

interface TourStepFromAPI {
  id: number;
  menu_id: number;
  access_link: string;
  event_type: string;
  title: string;
  description: string;
  on_click: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface EmployeeDirectoryTourProps {
  onComplete?: () => void;
}

const EmployeeDirectoryTour: React.FC<EmployeeDirectoryTourProps> = ({ onComplete }) => {
  const tourInstanceRef = useRef<Shepherd.Tour | null>(null);

  // State for storing tour steps from API
  const [tourStepsFromAPI, setTourStepsFromAPI] = useState<TourStepFromAPI[]>([]);

  // State for session data
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
        console.error("[EmployeeDirectoryTour] Invalid userData in localStorage", e);
      }
    }
  }, []);

  // Fetch tour steps from API
  useEffect(() => {
    async function fetchTourSteps() {
      if (!sessionData) return;

      try {
        // Get menuId and accessLink from page info
        const pageInfo = getPageInfo();
        console.log('[EmployeeDirectoryTour] Current page menuId:', pageInfo.menuId, 'accessLink:', pageInfo.accessLink);

        // Fetch tour steps with proper authentication and filtering
        const res = await fetch(
          `${sessionData.url}/table_data?table=Onboarding_tour_details&filters[menu_id]=${pageInfo.menuId}&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
        );

        if (!res.ok) {
          const errorRes = res.clone();
          try {
            const errorText = await errorRes.text();
            console.error('[EmployeeDirectoryTour] Tour steps API error:', res.status, errorText);
          } catch (e) {
            console.error('[EmployeeDirectoryTour] Tour steps API error:', res.status);
          }
          throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[EmployeeDirectoryTour] Tour steps API response:', json);

        // Handle different response formats
        let tourData = [];
        if (Array.isArray(json)) {
          tourData = json;
        } else if (json.data && Array.isArray(json.data)) {
          tourData = json.data;
        } else if (json.result && Array.isArray(json.result)) {
          tourData = json.result;
        }

        console.log('[EmployeeDirectoryTour] Parsed tour data:', tourData);

        // Filter by menu_id and access_link from getPageInfo
        console.log('[EmployeeDirectoryTour] Filtering by menuId:', pageInfo.menuId, 'accessLink:', pageInfo.accessLink);

        const filteredData = tourData.filter((step: TourStepFromAPI) =>
          step.menu_id === pageInfo.menuId && step.access_link === pageInfo.accessLink
        );

        console.log('[EmployeeDirectoryTour] Filtered tour data:', filteredData);

        setTourStepsFromAPI(filteredData.length > 0 ? filteredData : tourData);
      } catch (error) {
        console.error("[EmployeeDirectoryTour] Error fetching tour steps:", error);
      }
    }

    fetchTourSteps();
  }, [sessionData]);

  // Map on_click to element IDs
  const getAttachToConfig = (stepId: string): { element: string; on: string } => {
    const configs: Record<string, { element: string; on: string }> = {
      'employee-directory-welcome': { element: '#employee-directory-header', on: 'bottom' },
      'add-employee-btn': { element: '#add-employee-btn', on: 'bottom' },
      'search-bar': { element: '#search-input', on: 'bottom' },
      'filters-button': { element: '#filters-button', on: 'bottom' },
      'export-button': { element: '#export-button', on: 'bottom' },
      'view-mode-toggle': { element: '#view-mode-toggle-container', on: 'bottom' },
      'employee-table-section': { element: '#employee-table-section', on: 'top' },
      'table-actions-menu': { element: '.table-actions-menu-first', on: 'left' },
      'stats-sidebar-overview': { element: '#stats-sidebar-overview', on: 'auto' },
      'tour-complete': { element: '#employee-directory-header', on: 'bottom' },
    };
    return configs[stepId] || { element: '#employee-directory-header', on: 'bottom' };
  };

  useEffect(() => {
    // Determine which steps to use: API data or fallback to hardcoded
    const stepsToUse = tourStepsFromAPI.length > 0 ? tourStepsFromAPI : employeeDirectoryTourSteps;
    const isUsingAPI = tourStepsFromAPI.length > 0;

    console.log('[EmployeeDirectoryTour] Using API data:', isUsingAPI, 'Steps count:', stepsToUse.length);

    // Log tour start event
    const pageInfo = getPageInfo();
    logUserJourney({
      eventType: 'tour_started',
      stepKey: null,
      menuId: pageInfo.menuId,
      accessLink: pageInfo.accessLink,
    });

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: 'smooth', block: 'center' },
        classes: 'shepherd-theme-arrows',
      },
    });

    tourInstanceRef.current = tour;

    // Add CSS for custom styling
    const style = document.createElement('style');
    style.textContent = `
      .shepherd-element {
        border-radius: 0.875rem !important;
        max-width: 400px;
      }
      .shepherd-content {
        border-radius: 0.875rem 0.875rem 0 0 !important;
      }
      .shepherd-header {
        background: linear-gradient(90deg, #3b82f6, #2563eb) !important;
        padding: 1rem !important;
        border-radius: 0.875rem 0.875rem 0 0 !important;
      }
      .shepherd-arrow {
        z-index: 999;
        width: 1rem;
        height: 1.5rem;
        position: absolute;
        border-top-color: #286e98 !important;
        bottom: -0.75rem;
      }
      .shepherd-element.shepherd-has-title[data-popper-placement^="bottom"] > .shepherd-arrow:before {
        background-color: #3775e7ff;
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
      .shepherd-back:hover {
        background: #e5e7eb !important;
      }
      .shepherd-next,
      .shepherd-finish {
        background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
        color: white !important;
        box-shadow: 0 8px 20px rgba(37,99,235,0.35);
      }
      .shepherd-next:hover,
      .shepherd-finish:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 30px rgba(37,99,235,0.45);
      }
      .highlight {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 3px !important;
      }
      
      /* Responsive adjustments */
      @media (max-width: 767px) {
        .shepherd-element {
          border-radius: 0.5rem !important;
          max-width: 90vw;
        }
        .shepherd-content {
          border-radius: 0.5rem 0.5rem 0 0 !important;
        }
        .shepherd-header {
          padding: 0.75rem !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
        }
        .shepherd-arrow {
          width: 0.75rem;
          height: 1.125rem;
          bottom: -0.5625rem;
        }
        .shepherd-footer {
          padding: 0.75rem 1rem 1rem;
          gap: 0.5rem;
        }
        .shepherd-button {
          padding: 0.375rem 0.875rem !important;
          font-size: 0.75rem;
        }
      }

      @media (max-width: 480px) {
        .shepherd-header {
          padding: 0.5rem !important;
        }
        .shepherd-footer {
          padding: 0.5rem 0.75rem 0.75rem;
          flex-direction: column;
          gap: 0.375rem;
        }
        .shepherd-button {
          padding: 0.25rem 0.75rem !important;
          font-size: 0.6875rem;
        }
      }
    `;
    document.head.appendChild(style);

    /* ------------------------------
       BUTTON LOGIC
    ------------------------------ */
    const getButtons = (index: number, stepId?: string) => {
      const currentStep = stepsToUse[index];
      const stepKey = isUsingAPI ? (currentStep as TourStepFromAPI)?.on_click : currentStep?.id;

      const skip = {
        text: "Skip",
        action: () => {
          tour.cancel();

          // Log tour skipped event
          logUserJourney({
            eventType: 'tour_skipped',
            stepKey: String(stepKey || `step_${index}`),
            menuId: pageInfo.menuId,
            accessLink: pageInfo.accessLink,
          });
          onComplete?.();
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

          // Mark tour as completed
          localStorage.setItem('employeeDirectoryTourCompleted', 'true');

          // Log tour complete event
          logUserJourney({
            eventType: 'tour_complete',
            stepKey: String(stepKey || `step_${index}`),
            menuId: pageInfo.menuId,
            accessLink: pageInfo.accessLink,
          });
          onComplete?.();
        },
        classes: "shepherd-finish",
      };

      // Special buttons for the actions menu step
      if (stepId === 'table-actions-menu') {
        const editEmployee = {
          text: "Edit Employee",
          action: () => {
            // Navigate to edit employee page
            sessionStorage.setItem('triggerPageTour', 'edit-employee');
            localStorage.removeItem('employeeEditTourCompleted');
            window.location.href = '/content/user/edit/';
          },
          classes: "shepherd-next",
        };

        const assignTask = {
          text: "Assign Task",
          action: () => {
            // Navigate to task assignment page
            sessionStorage.setItem('triggerPageTour', 'task-assignment');
            localStorage.removeItem('taskManagementTourCompleted');
            window.location.href = '/content/task/assign/';
          },
          classes: "shepherd-next",
        };

        return [skip, editEmployee, assignTask];
      }

      if (index === 0) return [skip, next];
      if (index === stepsToUse.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    /* ------------------------------
       ADD STEPS
    ------------------------------ */
    if (isUsingAPI) {
      // Map API data to tour steps format
      stepsToUse.forEach((apiStep, index) => {
        const attachTo = getAttachToConfig((apiStep as TourStepFromAPI).on_click);
        const stepId = (apiStep as TourStepFromAPI).on_click;

        tour.addStep({
          id: stepId,
          title: apiStep.title,
          text: (apiStep as TourStepFromAPI).description,
          attachTo,
          beforeShowPromise: function () {
            return new Promise(resolve => setTimeout(resolve, 300));
          },
          buttons: getButtons(index, stepId),
          // @ts-ignore - Shepherd.js types are not fully compatible with our dynamic step creation
          highlightClass: 'highlight',
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: { enabled: true },
          // For the actions menu step, show without modal so users can click the buttons
          when: stepId === 'table-actions-menu' ? {
            show: () => {
              // Remove modal overlay for this step to allow clicking
              const overlay = document.querySelector('.shepherd-modal-overlay-container');
              if (overlay) {
                (overlay as HTMLElement).style.display = 'none';
              }
            },
            hide: () => {
              // Restore modal overlay for next steps
              const overlay = document.querySelector('.shepherd-modal-overlay-container');
              if (overlay) {
                (overlay as HTMLElement).style.display = 'block';
              }
            }
          } : undefined,
        });
      });
    } else {
      // Use hardcoded steps
      stepsToUse.forEach((step: any, index: number) => {
        // For the actions menu step, we'll handle it specially
        tour.addStep({
          ...step,
          title: step.title || "Tour",
          buttons: getButtons(index, step.id),
          // For the actions menu step, show without modal so users can click the buttons
          when: step.id === 'table-actions-menu' ? {
            show: () => {
              // Remove modal overlay for this step to allow clicking
              const overlay = document.querySelector('.shepherd-modal-overlay-container');
              if (overlay) {
                (overlay as HTMLElement).style.display = 'none';
              }
            },
            hide: () => {
              // Restore modal overlay for next steps
              const overlay = document.querySelector('.shepherd-modal-overlay-container');
              if (overlay) {
                (overlay as HTMLElement).style.display = 'block';
              }
            }
          } : undefined,
        } as any);
      });
    }

    // Log tour step view event when steps are shown
    tour.on('show', (e: any) => {
      const step = e.step;
      const stepId = step.id;

      const stepIndex = isUsingAPI
        ? stepsToUse.findIndex((s: any) => (s as TourStepFromAPI).on_click === stepId)
        : stepsToUse.findIndex((s: any) => s.id === stepId);

      const currentStep = stepsToUse[stepIndex] as TourStepFromAPI;
      const currentStepKey = isUsingAPI ? currentStep?.on_click : currentStep?.id;

      logUserJourney({
        eventType: 'tour_step_view',
        stepKey: String(currentStepKey || `step_${stepIndex}`),
        menuId: pageInfo.menuId,
        accessLink: pageInfo.accessLink,
      });
    });

    // Mark tour as completed when cancelled (user has seen it)
    tour.on('cancel', () => {
      localStorage.setItem('employeeDirectoryTourCompleted', 'true');
    });

    // Start the tour after a short delay to ensure API data is loaded
    const timer = setTimeout(() => {
      tour.start();
    }, 1500);

    return () => {
      clearTimeout(timer);
      tour.cancel();
      document.head.removeChild(style);
    };
  }, [onComplete, tourStepsFromAPI]);

  return null;
};

export default EmployeeDirectoryTour;
