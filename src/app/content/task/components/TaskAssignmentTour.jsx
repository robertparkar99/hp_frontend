"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { taskAssignmentTourSteps } from "@/lib/taskAssignmentTourSteps";
import Icon from "@/components/AppIcon";

const TaskAssignmentTour = ({ onComplete, onSwitchView }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const currentViewRef = useRef('progress');
  const tourInstanceRef = useRef(null);
  const isSwitchingViewRef = useRef(false);

  // View mapping based on step indices
  const stepViewMap = {
    0: 'progress',    // Welcome
    1: 'progress',    // View Tabs
    2: 'progress',    // Dashboard Stats
    3: 'progress',    // Filters
    4: 'progress',    // Data Table
    5: 'progress',    // Table Actions
    6: 'progress',    // Export Button
    7: 'assignment',  // Switch to New Assignment
    8: 'assignment',  // New Assignment Header
    9: 'assignment',  // Department
    10: 'assignment', // Job Role
    11: 'assignment', // Employees
    12: 'assignment', // Task Title
    13: 'assignment', // AI Generation
    14: 'assignment', // Description
    15: 'assignment', // Repeat
    16: 'assignment', // Skills
    17: 'assignment', // Observer
    18: 'assignment', // KRAs
    19: 'assignment', // KPIs
    20: 'assignment', // Monitoring Points
    21: 'assignment', // Attachment
    22: 'assignment', // Priority
    23: 'assignment', // Submit
    24: 'progress',   // Tour Complete
  };

  // Function to switch views with delay for rendering
  const switchView = useCallback(async (targetView) => {
    if (!targetView || targetView === currentViewRef.current || isSwitchingViewRef.current) {
      return Promise.resolve();
    }

    isSwitchingViewRef.current = true;
    currentViewRef.current = targetView;

    // If switching to assignment view, click the assignment tab
    if (targetView === 'assignment') {
      const assignmentTab = document.querySelector('#tab-assignment');
      if (assignmentTab) {
        assignmentTab.click();
      }
    }

    // Call the view switch callback
    if (onSwitchView) {
      onSwitchView(targetView);
    } else {
      // Dispatch custom event for view switching
      window.dispatchEvent(new CustomEvent('taskAssignmentTourSwitchView', { detail: targetView }));
    }

    // Wait for the view content to render (1200ms for safe rendering)
    await new Promise(resolve => setTimeout(resolve, 1200));
    isSwitchingViewRef.current = false;

    return Promise.resolve();
  }, [onSwitchView]);

  useEffect(() => {
    // Check if tour has already been completed
    const tourCompleted = localStorage.getItem("taskAssignmentTourCompleted");
    if (tourCompleted) {
      return;
    }

    // Start tour after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startTour();
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (tourInstanceRef.current) {
        tourInstanceRef.current.cancel();
      }
    };
  }, []);

  const startTour = () => {
    setIsTourActive(true);

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: "smooth", block: "center" },
        classes: "shepherd-theme-arrows",
      },
    });

    tourInstanceRef.current = tour;

    // Add CSS for custom styling
    const style = document.createElement("style");
    style.textContent = `
      .shepherd-element {
        border-radius: 0.875rem !important;
        max-width: 400px !important;
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
      .shepherd-title {
        font-size: 1.125rem !important;
        font-weight: 600 !important;
        color: white !important;
      }
      .shepherd-text {
        font-size: 0.875rem !important;
        line-height: 1.5 !important;
        color: #374151 !important;
      }
      
      /* Highlight element during tour */
      .highlight {
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5) !important;
        border-radius: 0.5rem !important;
        position: relative !important;
        z-index: 100 !important;
      }

      @media (max-width: 767px) {
        .shepherd-element {
          max-width: 90vw !important;
        }
        .shepherd-content {
          border-radius: 0.5rem 0.5rem 0 0 !important;
        }
        .shepherd-header {
          padding: 0.75rem !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
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

    // Button logic with view switching
    const getButtons = (index) => {
      const skip = {
        text: "Skip",
        action: async () => {
          await switchView(stepViewMap[index]);
          tour.cancel();
          setIsTourActive(false);
          localStorage.setItem("taskAssignmentTourCompleted", "true");
          onComplete?.();
        },
        classes: "shepherd-skip",
      };

      const back = {
        text: "Back",
        action: async () => {
          const prevView = stepViewMap[index - 1];
          if (prevView && prevView !== currentViewRef.current) {
            await switchView(prevView);
          }
          tour.back();
        },
        classes: "shepherd-back",
      };

      const next = {
        text: "Next",
        action: async () => {
          const nextView = stepViewMap[index + 1];
          if (nextView && nextView !== currentViewRef.current) {
            await switchView(nextView);
          }
          tour.next();
        },
        classes: "shepherd-next",
      };

      const finish = {
        text: "Finish",
        action: () => {
          tour.complete();
          setIsTourActive(false);
          localStorage.setItem("taskAssignmentTourCompleted", "true");
          onComplete?.();
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === taskAssignmentTourSteps.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    // Add steps to tour with view switching
    taskAssignmentTourSteps.forEach((step, index) => {
      tour.addStep({
        ...step,
        title: step.title || "Tour",
        buttons: getButtons(index),
      });
    });

    // Handle step show event for view switching
    tour.on('show', async (event) => {
      const stepIndex = taskAssignmentTourSteps.findIndex(s => s.id === event.step.id);
      if (stepIndex >= 0) {
        const targetView = stepViewMap[stepIndex];
        if (targetView && targetView !== currentViewRef.current && !isSwitchingViewRef.current) {
          await switchView(targetView);
        }
      }
    });

    // Start the tour
    tour.start();

    return () => {
      tour.cancel();
      document.head.removeChild(style);
      setIsTourActive(false);
    };
  };

  // Render a tour button that can be clicked to start the tour manually
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isTourActive && (
        <button
          onClick={startTour}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
          title="Start Task Assignment Tour"
        >
          <Icon name="HelpCircle" size={18} />
          <span className="text-sm font-medium">Take Tour</span>
        </button>
      )}
    </div>
  );
};

export default TaskAssignmentTour;
