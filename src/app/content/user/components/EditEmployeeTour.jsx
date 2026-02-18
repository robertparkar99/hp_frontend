"use client";

import React, { useEffect, useState, useRef } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { editEmployeeTourSteps, detailedTourSteps, TAB_IDS } from "@/lib/editEmployeeTourSteps";
import Icon from "@/components/AppIcon";

const EditEmployeeTour = ({ onComplete, onSwitchView }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const tourInstanceRef = useRef(null);
  const detailedTourInstanceRef = useRef(null);
  const isInDetailedTour = useRef(false);

  // Map tab index to tab ID
  const getTabIdFromIndex = (index) => {
    const tabIds = Object.keys(TAB_IDS);
    return tabIds[index] || tabIds[0];
  };

  useEffect(() => {
    // Check if tour has already been completed
    const tourCompleted = localStorage.getItem("editEmployeeTourCompleted");
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
      if (detailedTourInstanceRef.current) {
        detailedTourInstanceRef.current.cancel();
      }
    };
  }, []);

  // Function to start detailed tour for a specific tab
  const startDetailedTour = (tabId) => {
    console.log('Starting detailed tour for:', tabId);
    const steps = detailedTourSteps[tabId];
    if (!steps || steps.length === 0) {
      console.warn(`No detailed steps found for tab: ${tabId}`);
      alert(`No detailed steps found for ${tabId}`);
      return;
    }

    console.log('Found steps:', steps.length);
    isInDetailedTour.current = true;

    // Cancel main tour if running
    if (tourInstanceRef.current) {
      tourInstanceRef.current.cancel();
    }

    const detailedTour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: "smooth", block: "center" },
        classes: "shepherd-theme-arrows",
      },
    });

    detailedTourInstanceRef.current = detailedTour;

    // Add CSS for detailed tour
    const style = document.createElement("style");
    style.textContent = `
      .shepherd-element {
        border-radius: 0.875rem !important;
        max-width: 400px !important;
      }
      .shepherd-content {
        border-radius: 0.875rem 0 0 0 !important;
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
        border-top-color: #779ff8 !important;
        bottom: -0.75rem;
      }
      .shepherd-element.shepherd-has-title[data-popper-placement^="bottom"] > .shepherd-arrow:before {
        background-color: #779ff8;
      }
      .shepherd-footer {
        padding: 0.875rem 1.125rem 1.125rem;
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        justify-content: space-between;
        align-items: center;
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
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
      }
      .shepherd-next:hover,
      .shepherd-finish:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 30px rgba(139, 92, 246, 0.45);
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
      .shepherd-detailed-tour-btn {
        width: 100%;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #779ff8 0%, #4465c0 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 0.5rem !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .shepherd-detailed-tour-btn:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4) !important;
      }
      .highlight {
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.5) !important;
        border-radius: 0.5rem !important;
        position: relative !important;
        z-index: 100 !important;
      }
    `;
    document.head.appendChild(style);

    // Buttons for detailed tour
    const getDetailedButtons = (index) => {
      const skip = {
        text: "Skip Detailed Tour",
        action: () => {
          detailedTour.cancel();
          document.head.removeChild(style);
          isInDetailedTour.current = false;
          // Continue with main tour
          if (tourInstanceRef.current) {
            tourInstanceRef.current.next();
          }
        },
        classes: "shepherd-skip",
      };

      const back = {
        text: "Back",
        action: () => {
          detailedTour.back();
        },
        classes: "shepherd-back",
      };

      const next = {
        text: "Next",
        action: () => {
          detailedTour.next();
        },
        classes: "shepherd-next",
      };

      const finish = {
        text: "Continue to Next Tab",
        action: () => {
          detailedTour.complete();
          document.head.removeChild(style);
          isInDetailedTour.current = false;
          // Move to next tab in main tour
          setCurrentTabIndex((prev) => {
            const nextIndex = prev + 1;
            if (nextIndex < editEmployeeTourSteps.length - 1) {
              if (tourInstanceRef.current) {
                tourInstanceRef.current.next();
              }
            }
            return nextIndex;
          });
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === steps.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    // Add steps to detailed tour
    steps.forEach((step, index) => {
      detailedTour.addStep({
        ...step,
        title: step.title || "Detailed Tour",
        buttons: getDetailedButtons(index),
      });
    });

    // Start detailed tour
    detailedTour.start();

    // Handle completion
    detailedTour.on('complete', () => {
      document.head.removeChild(style);
      isInDetailedTour.current = false;
      // Move to next tab
      setCurrentTabIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < editEmployeeTourSteps.length - 1 && tourInstanceRef.current) {
          tourInstanceRef.current.next();
        }
        return nextIndex;
      });
    });

    // Handle cancellation
    detailedTour.on('cancel', () => {
      document.head.removeChild(style);
      isInDetailedTour.current = false;
    });
  };

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

    // Expose function for onclick handlers
    window['startDetailedTourForTab'] = function (tabId) {
      console.log('Global function called for tab:', tabId);
      if (tourInstanceRef.current) {
        tourInstanceRef.current.cancel();
      }
      startDetailedTour(tabId);
    };

    // Add CSS for custom styling
    const style = document.createElement("style");
    style.textContent = `
      .shepherd-element {
        border-radius: 0.875rem !important;
        max-width: 400px !important;
      }
      .shepherd-content {
        border-radius: 0.875rem 0 0 0 !important;
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
        flex-direction: row;
        gap: 0.5rem;
        justify-content: space-between;
        align-items: center;
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
      
      /* Detailed Tour button styling */
      .shepherd-detailed-tour-wrapper {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
      .shepherd-detailed-tour-btn {
        width: 100%;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #8b5cf6, #a855f7) !important;
        color: white !important;
        border: none !important;
        border-radius: 0.5rem !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .shepherd-detailed-tour-btn:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4) !important;
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
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
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
          flex-direction: row;
          gap: 0.375rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .shepherd-button {
          padding: 0.25rem 0.75rem !important;
          font-size: 0.6875rem;
        }
      }
    `;
    document.head.appendChild(style);

    // Button logic
    const getButtons = (index) => {
      const skip = {
        text: "Skip",
        action: () => {
          tour.cancel();
          setIsTourActive(false);
          localStorage.setItem("editEmployeeTourCompleted", "true");
          if (onComplete) onComplete();
        },
        classes: "shepherd-skip",
      };

      const back = {
        text: "Back",
        action: () => {
          setCurrentTabIndex((prev) => Math.max(0, prev - 1));
          tour.back();
        },
        classes: "shepherd-back",
      };

      const next = {
        text: "Next",
        action: () => {
          setCurrentTabIndex((prev) => prev + 1);
          tour.next();
        },
        classes: "shepherd-next",
      };

      const finish = {
        text: "Finish",
        action: () => {
          tour.complete();
          setIsTourActive(false);
          localStorage.setItem("editEmployeeTourCompleted", "true");
          if (onComplete) onComplete();
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === editEmployeeTourSteps.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    // Add steps to tour with Detailed Tour button and progress bar
    editEmployeeTourSteps.forEach((step, index) => {
      // Add Detailed Tour button HTML between text and buttons (only for steps after welcome)
      let stepText = step.text;

      if (index > 0 && index < editEmployeeTourSteps.length - 1) {
        // Get the tab ID for this step
        const tabIds = Object.keys(TAB_IDS);
        const tabId = tabIds[index - 1] || tabIds[0];
        const tabLabel = tabId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        const detailedTourButton = `
          <div class="shepherd-detailed-tour-wrapper" style="margin-top: 1rem; margin-bottom: 0.5rem;">
            <button 
              class="shepherd-detailed-tour-btn" 
              id="detailed-tour-btn-${tabId}"
              data-tab-id="${tabId}"
              style="
                width: 100%;
                padding: 0.5rem 1rem;
                background: linear-gradient(135deg, #779ff8 0%, #4465c0 100%) !important;
                color: white;
                border: none;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
              "
              onclick="if(window.startDetailedTourForTab) window.startDetailedTourForTab('${tabId}');"
            >
              🔍 View ${tabLabel} Details
            </button>
          </div>
        `;
        stepText = stepText ? stepText + detailedTourButton : detailedTourButton;
      }

      // Add progress bar for tab tour steps (show on all steps except welcome and tour complete)
      const totalSteps = editEmployeeTourSteps.length - 2; // Exclude welcome and tour complete
      const currentStep = index; // index 1 = step 1, index 2 = step 2, etc.

      // Only show progress for tab tour steps (not first welcome step and not last tour complete)
      if (index > 0 && index < editEmployeeTourSteps.length - 1) {
        const segments = Array.from({ length: totalSteps }, (_, i) => {
          const isActive = i < currentStep;
          return `
      <div style="
        flex: 1;
        height: 6px;
        margin-right: 4px;
        background: ${isActive ? '#3b82f6' : '#e5e7eb'};
        border-radius: 3px;
        transition: background 0.3s ease;
      "></div>
    `;
        }).join('');

        const progressBar = `
    <div class="shepherd-progress-bar-wrapper" style="margin-top: 1rem;">
      <div style="
        display: flex;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 6px;
      ">
        Step ${currentStep} of ${totalSteps}
      </div>

      <div style="display: flex;">
        ${segments}
      </div>
    </div>
  `;

        stepText = stepText ? stepText + progressBar : progressBar;
      }


      tour.addStep({
        ...step,
        title: step.title || "Tour",
        text: stepText,
        buttons: getButtons(index),
      });
    });

    // Add event listener for Detailed Tour button clicks
    tour.on('show', () => {
      // Find and attach click handlers to all detailed tour buttons
      setTimeout(() => {
        const tabIds = Object.keys(TAB_IDS);
        tabIds.forEach((tabId) => {
          const btn = document.getElementById(`detailed-tour-btn-${tabId}`);
          if (btn && !btn.hasAttribute('data-tour-listener-attached')) {
            // Mark as attached to avoid duplicate listeners
            btn.setAttribute('data-tour-listener-attached', 'true');

            btn.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              console.log(`Detailed tour requested for tab: ${tabId}`);
              // Cancel main tour temporarily
              tour.cancel();
              // Start detailed tour for this tab
              startDetailedTour(tabId);
            });
          }
        });
      }, 200);
    });

    // Start the tour
    tour.start();

    // Cleanup function
    return () => {
      tour.cancel();
      document.head.removeChild(style);
      setIsTourActive(false);
      // Clean up global function
      if (window['startDetailedTourForTab']) {
        delete window['startDetailedTourForTab'];
      }
    };
  };

  // Render a tour button that can be clicked to start the tour manually
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isTourActive && (
        <button
          onClick={startTour}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
          title="Start Edit Employee Tour"
        >
          <Icon name="HelpCircle" size={18} />
          <span className="text-sm font-medium">Take Tour</span>
        </button>
      )}
    </div>
  );
};

export default EditEmployeeTour;
