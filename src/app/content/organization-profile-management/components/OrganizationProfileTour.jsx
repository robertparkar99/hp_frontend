"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { organizationProfileTourSteps } from "@/lib/organizationProfileTourSteps";

const OrganizationProfileTour = ({ onComplete, onSwitchTab }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const currentTabRef = useRef('info');
  const tourInstanceRef = useRef(null);
  const isSwitchingTabRef = useRef(false);

  // Tab mapping based on step indices
  const stepTabMap = {
    0: 'info',    // Welcome
    1: 'info',    // Organization Info Tab
    2: 'info',    // Legal Name
    3: 'info',    // CIN
    4: 'info',    // PAN
    5: 'info',    // Industry
    6: 'info',    // Employee Count
    7: 'info',    // Work Week
    8: 'info',    // Address
    9: 'info',    // Logo
    10: 'info',   // Sister Companies
    11: 'info',   // Submit
    12: 'structure', // Department Tab
    13: 'structure', // Department Search
    14: 'structure', // Department Actions
    15: 'structure', // Add Department Button
    16: 'structure', // Department List
    17: 'structure', // Department Card Actions
    18: 'structure', // Sub-departments
    19: 'config',    // Compliance Tab
    20: 'config',    // Compliance Name
    21: 'config',    // Compliance Description
    22: 'config',    // Compliance Department
    23: 'config',    // Compliance Assignee
    24: 'config',    // Compliance Due Date
    25: 'config',    // Compliance Frequency
    26: 'config',    // Compliance Attachment
    27: 'config',    // Compliance Submit
    28: 'config',    // Compliance Table
    29: 'config',    // Compliance Export
    30: 'disciplinary', // Disciplinary Tab
    31: 'disciplinary', // Disciplinary Department
    32: 'disciplinary', // Disciplinary Employee
    33: 'disciplinary', // Disciplinary DateTime
    34: 'disciplinary', // Disciplinary Location
    35: 'disciplinary', // Disciplinary Misconduct
    36: 'disciplinary', // Disciplinary Description
    37: 'disciplinary', // Disciplinary Witness
    38: 'disciplinary', // Disciplinary Action
    39: 'disciplinary', // Disciplinary Remarks
    40: 'disciplinary', // Disciplinary Submit
    41: 'disciplinary', // Disciplinary Table
    42: 'disciplinary', // Disciplinary Export
    43: 'info',    // Tour Complete
  };

  // Function to switch tabs with delay for rendering
  const switchTab = useCallback(async (targetTab) => {
    if (!targetTab || targetTab === currentTabRef.current || isSwitchingTabRef.current) {
      return Promise.resolve();
    }

    isSwitchingTabRef.current = true;
    currentTabRef.current = targetTab;

    // Call the tab switch callback
    if (onSwitchTab) {
      onSwitchTab(targetTab);
    } else {
      // Dispatch custom event for tab switching
      window.dispatchEvent(new CustomEvent('orgProfileTourSwitchTab', { detail: targetTab }));
    }

    // Wait for the tab content to render (800ms for safe rendering)
    await new Promise(resolve => setTimeout(resolve, 800));
    isSwitchingTabRef.current = false;

    return Promise.resolve();
  }, [onSwitchTab]);

  useEffect(() => {
    // Check if tour has already been completed
    const tourCompleted = localStorage.getItem("orgProfileTourCompleted");
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
        cancelIcon: {
          enabled: true,
          options: {
            label: '✕'
          }
        },
        scrollTo: { behavior: "smooth", block: "center" },
        classes: "shepherd-theme-arrows",
        popperOptions: {
          strategy: 'fixed',
          modifiers: {
            preventOverflow: {
              boundariesElement: 'viewport',
              padding: 16,
              altAxis: true,
              altBoundary: true
            },
            flip: {
              behavior: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'],
              boundariesElement: 'viewport',
              fallbackPlacements: ['top', 'bottom']
            },
            offset: {
              enabled: true,
              offsets: [0, 12]
            },
            applyClass: {
              enabled: true,
              fn: function (data) {
                // Add responsive class based on placement
                const placement = data.state?.options?.placement || 'bottom';
                data.popper.classList.add(`shepherd-popper-${placement}`);
              }
            }
          }
        }
      },
    });

    tourInstanceRef.current = tour;

    // Add CSS for custom styling
    const style = document.createElement("style");
    style.textContent = `
      .shepherd-element {
        border-radius: 0.875rem !important;
        max-width: 400px !important;
        min-width: 280px !important;
        width: auto !important;
        overflow: hidden !important;
      }
      .shepherd-content {
        border-radius: 0.875rem 0.875rem 0 0 !important;
        overflow: hidden !important;
      }
      .shepherd-header {
        background: linear-gradient(90deg, #3b82f6, #2563eb) !important;
        padding: 0.75rem 1rem !important;
        border-radius: 0.875rem 0.875rem 0 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        flex-shrink: 0 !important;
        min-height: 48px !important;
        gap: 0.5rem !important;
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
        flex-shrink: 0 !important;
      }
      .shepherd-button {
        border-radius: 999px !important;
        padding: 0.5rem 1.125rem !important;
        font-weight: 500;
        font-size: 0.875rem;
        transition: all 0.25s ease;
        white-space: nowrap !important;
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
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.3 !important;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .shepherd-text {
        font-size: 0.875rem !important;
        line-height: 1.5 !important;
        color: #374151 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden;
      }
      .shepherd-text p {
        margin: 0 !important;
        padding: 0 !important;
      }

      .shepherd-cancel-icon {
        color: white !important;
        font-size: 20px !important;
        margin-left: auto !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
        padding: 4px !important;
        line-height: 1 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .shepherd-cancel-icon:hover {
        opacity: 0.8 !important;
      }

      /* Ensure header has proper layout for title and cancel icon */
      .shepherd-has-title .shepherd-header {
        display: flex !important;
        flex-direction: row !important;
      }
      .shepherd-has-title .shepherd-header .shepherd-title {
        display: inline-block !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }
      .shepherd-has-title .shepherd-header .shepherd-cancel-icon {
        display: inline-flex !important;
        flex: 0 0 auto !important;
      }

      /* Ensure text content area has proper padding */
      .shepherd-text {
        padding: 1rem !important;
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
          min-width: 260px !important;
          border-radius: 12px 12px 0 0 !important;
          bottom: 0 !important;
          top: auto !important;
          position: fixed !important;
          left: 0 !important;
          right: 0 !important;
          width: auto !important;
          margin: 0 !important;
          transform: none !important;
        }
        .shepherd-content {
          border-radius: 12px 12px 0 0 !important;
          max-height: 70vh !important;
          overflow-y: auto !important;
        }
        .shepherd-header {
          padding: 0.75rem !important;
          border-radius: 12px 12px 0 0 !important;
        }
        .shepherd-title {
          font-size: 1rem !important;
        }
        .shepherd-footer {
          padding: 0.75rem 1rem 1rem;
          gap: 0.5rem;
        }
        .shepherd-button {
          padding: 0.5rem 1rem !important;
          font-size: 0.875rem;
          flex: 1 !important;
        }
        .shepherd-text {
          font-size: 0.875rem !important;
        }
      }

      @media (max-width: 480px) {
        .shepherd-header {
          padding: 0.5rem 0.75rem !important;
        }
        .shepherd-footer {
          padding: 0.5rem 0.75rem 0.75rem;
          gap: 0.5rem;
        }
        .shepherd-button {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.75rem !important;
        }
        .shepherd-title {
          font-size: 0.95rem !important;
        }
        .shepherd-text {
          font-size: 0.8rem !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Button logic with tab switching
    const getButtons = (index) => {
      const skip = {
        text: "Skip",
        action: async () => {
          await switchTab(stepTabMap[index]);
          tour.cancel();
          setIsTourActive(false);
          localStorage.setItem("orgProfileTourCompleted", "true");
          onComplete?.();
        },
        classes: "shepherd-skip",
      };

      const back = {
        text: "Back",
        action: async () => {
          const prevTab = stepTabMap[index - 1];
          if (prevTab && prevTab !== currentTabRef.current) {
            await switchTab(prevTab);
          }
          tour.back();
        },
        classes: "shepherd-back",
      };

      const next = {
        text: "Next",
        action: async () => {
          const nextTab = stepTabMap[index + 1];
          if (nextTab && nextTab !== currentTabRef.current) {
            await switchTab(nextTab);
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
          localStorage.setItem("orgProfileTourCompleted", "true");
          onComplete?.();
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === organizationProfileTourSteps.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    // Add steps to tour with tab switching
    organizationProfileTourSteps.forEach((step, index) => {
      tour.addStep({
        ...step,
        title: step.title || "Tour",
        buttons: getButtons(index),
      });
    });

    // Handle step show event for tab switching
    tour.on('show', async (event) => {
      const stepIndex = organizationProfileTourSteps.findIndex(s => s.id === event.step.id);
      if (stepIndex >= 0) {
        const targetTab = stepTabMap[stepIndex];
        if (targetTab && targetTab !== currentTabRef.current && !isSwitchingTabRef.current) {
          await switchTab(targetTab);
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

  // Tour component doesn't render any UI - tour is controlled by parent via showTour prop
  return null;
};

export default OrganizationProfileTour;
