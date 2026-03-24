"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
// import { organizationProfileTourSteps } from "@/lib/organizationProfileTourSteps";
import { logUserJourney, getPageInfo } from "@/utils/journeyLogger";

const OrganizationProfileTour = ({ onComplete, onSwitchTab }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const currentTabRef = useRef('info');
  const tourInstanceRef = useRef(null);
  const isSwitchingTabRef = useRef(false);

  // State for storing tour steps from API
  const [tourStepsFromAPI, setTourStepsFromAPI] = useState([]);

  // State for session data
  const [sessionData, setSessionData] = useState(null);

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
        console.error("Invalid userData in localStorage", e);
      }
    }
  }, []);

  // Fetch tour steps from API
  useEffect(() => {
    async function fetchTourSteps() {
      if (!sessionData) return;

      try {
        // Get menuId and accessLink from page info
        const { menuId, accessLink } = getPageInfo();
        console.log('[OrgProfileTour] Current page menuId:', menuId, 'accessLink:', accessLink);

        // Fetch tour steps with proper authentication and filtering
        const res = await fetch(
          `${sessionData.url}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
        );

        if (!res.ok) {
          const errorRes = res.clone();
          try {
            const errorText = await errorRes.text();
            console.error('[OrgProfileTour] Tour steps API error:', res.status, errorText);
          } catch (e) {
            console.error('[OrgProfileTour] Tour steps API error:', res.status);
          }
          throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[OrgProfileTour] Tour steps API response:', json);

        // Handle different response formats
        let tourData = [];
        if (Array.isArray(json)) {
          tourData = json;
        } else if (json.data && Array.isArray(json.data)) {
          tourData = json.data;
        } else if (json.result && Array.isArray(json.result)) {
          tourData = json.result;
        }

        console.log('[OrgProfileTour] Parsed tour data:', tourData);

        // Filter by menu_id and access_link from getPageInfo
        console.log('[OrgProfileTour] Filtering by menuId:', menuId, 'accessLink:', accessLink);

        const filteredData = tourData.filter((step) =>
          step.menu_id === menuId && step.access_link === accessLink
        );

        console.log('[OrgProfileTour] Filtered tour data:', filteredData);

        setTourStepsFromAPI(filteredData.length > 0 ? filteredData : tourData);
      } catch (error) {
        console.error("[OrgProfileTour] Error fetching tour steps:", error);
      }
    }

    fetchTourSteps();
  }, [sessionData]);

  // Map on_click to element IDs
  const getAttachToConfig = (stepId) => {
    const configs = {
      'org-profile-welcome': { element: '#org-profile-header', on: 'bottom' },
      'org-info-tab': { element: '#tab-info', on: 'bottom' },
      'org-info-legal-name': { element: '#org-legal-name', on: 'right' },
      'org-info-cin': { element: '#org-cin', on: 'right' },
      'org-info-pan': { element: '#org-pan', on: 'right' },
      'org-info-industry': { element: '#org-industry', on: 'right' },
      'org-info-employee-count': { element: '#org-employee-count', on: 'right' },
      'org-info-work-week': { element: '#org-work-week', on: 'right' },
      'org-info-address': { element: '#org-address', on: 'right' },
      'org-info-logo': { element: '#org-logo-upload', on: 'right' },
      'org-info-sister-companies': { element: '#org-sister-companies', on: 'top' },
      'org-info-submit': { element: '#org-info-submit-btn', on: 'top' },
      'department-tab': { element: '#tab-structure', on: 'bottom' },
      'department-search': { element: '#department-search-input', on: 'bottom' },
      'department-actions': { element: '#department-actions-toolbar', on: 'bottom' },
      'department-add-btn': { element: '#add-department-btn', on: 'left' },
      'department-list': { element: '#department-structure-container', on: 'top' },
      'department-card-actions': { element: '#department-card-actions', on: 'left' },
      'sub-departments': { element: '#sub-departments-list', on: 'right' },
      'compliance-tab': { element: '#tab-config', on: 'bottom' },
      'compliance-form-name': { element: '#compliance-name', on: 'right' },
      'compliance-form-description': { element: '#compliance-description', on: 'right' },
      'compliance-form-department': { element: '#compliance-department', on: 'right' },
      'compliance-form-assignee': { element: '#compliance-assignee', on: 'right' },
      'compliance-form-due-date': { element: '#compliance-due-date', on: 'right' },
      'compliance-form-frequency': { element: '#compliance-frequency', on: 'right' },
      'compliance-form-attachment': { element: '#compliance-attachment', on: 'right' },
      'compliance-form-submit': { element: '#compliance-submit-btn', on: 'top' },
      'compliance-table': { element: '#compliance-data-table', on: 'top' },
      'compliance-export': { element: '#compliance-export-buttons', on: 'left' },
      'disciplinary-tab': { element: '#tab-disciplinary', on: 'bottom' },
      'disciplinary-form-department': { element: '#disciplinary-department', on: 'right' },
      'disciplinary-form-employee': { element: '#disciplinary-employee', on: 'right' },
      'disciplinary-form-datetime': { element: '#disciplinary-datetime', on: 'right' },
      'disciplinary-form-location': { element: '#disciplinary-location', on: 'right' },
      'disciplinary-form-misconduct': { element: '#disciplinary-misconduct', on: 'right' },
      'disciplinary-form-description': { element: '#disciplinary-description', on: 'top' },
      'disciplinary-form-witness': { element: '#disciplinary-witness', on: 'right' },
      'disciplinary-form-action': { element: '#disciplinary-action', on: 'right' },
      'disciplinary-form-remarks': { element: '#disciplinary-remarks', on: 'top' },
      'disciplinary-form-submit': { element: '#disciplinary-submit-btn', on: 'top' },
      'disciplinary-table': { element: '#disciplinary-data-table', on: 'top' },
      'disciplinary-export': { element: '#disciplinary-export-buttons', on: 'left' },
      'tour-complete': { element: '#org-profile-header', on: 'top' },
    };
    return configs[stepId] || { element: '#org-profile-header', on: 'bottom' };
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

    // Wait for tour steps to be loaded before starting
    if (tourStepsFromAPI.length === 0) {
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
  }, [tourStepsFromAPI]);

  const startTour = () => {
    setIsTourActive(true);

    // Log tour start event
    const pageInfo = getPageInfo();
    logUserJourney({
      eventType: 'tour_started',
      stepKey: null,
      menuId: pageInfo.menuId,
      accessLink: pageInfo.accessLink,
    });

    // Determine which steps to use: API data or fallback to hardcoded
    const stepsToUse = tourStepsFromAPI.length > 0 ? tourStepsFromAPI : organizationProfileTourSteps;
    const isUsingAPI = tourStepsFromAPI.length > 0;

    console.log('[OrgProfileTour] Using API data:', isUsingAPI, 'Steps count:', stepsToUse.length);

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
      const currentStep = stepsToUse[index];
      const stepId = isUsingAPI ? currentStep?.on_click : currentStep?.id;

      const skip = {
        text: "Skip",
        action: async () => {
          await switchTab(stepTabMap[index]);
          tour.cancel();
          setIsTourActive(false);
          localStorage.setItem("orgProfileTourCompleted", "true");

          // Log tour skipped event
          const pageInfo = getPageInfo();
          logUserJourney({
            eventType: 'tour_skipped',
            stepKey: stepId || `step_${index}`,
            menuId: pageInfo.menuId,
            accessLink: pageInfo.accessLink,
          });

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

          // Log tour complete event
          const pageInfo = getPageInfo();
          logUserJourney({
            eventType: 'tour_complete',
            stepKey: stepId || `step_${index}`,
            menuId: pageInfo.menuId,
            accessLink: pageInfo.accessLink,
          });

          onComplete?.();
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === stepsToUse.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    // Add steps to tour - use API data or fallback to hardcoded steps
    if (isUsingAPI) {
      // Map API data to tour steps format
      stepsToUse.forEach((apiStep, index) => {
        const attachTo = getAttachToConfig(apiStep.on_click);
        const stepId = apiStep.on_click;

        tour.addStep({
          id: stepId,
          title: apiStep.title,
          text: [apiStep.description],
          attachTo,
          beforeShowPromise: function () {
            return new Promise(resolve => setTimeout(resolve, 300));
          },
          buttons: getButtons(index),
          highlightClass: 'highlight',
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: { enabled: true },
        });
      });
    } else {
      // Use hardcoded steps
      stepsToUse.forEach((step, index) => {
        tour.addStep({
          ...step,
          title: step.title || "Tour",
          buttons: getButtons(index),
        });
      });
    }

    // Handle step show event for tab switching
    tour.on('show', async (event) => {
      const stepId = event.step.id;
      let stepIndex;

      if (isUsingAPI) {
        stepIndex = stepsToUse.findIndex(s => s.on_click === stepId);
      } else {
        stepIndex = stepsToUse.findIndex(s => s.id === stepId);
      }

      if (stepIndex >= 0) {
        const targetTab = stepTabMap[stepIndex];
        if (targetTab && targetTab !== currentTabRef.current && !isSwitchingTabRef.current) {
          await switchTab(targetTab);
        }

        // Log tour step view event
        const currentStep = stepsToUse[stepIndex];
        const currentStepId = isUsingAPI ? currentStep?.on_click : currentStep?.id;
        const pageInfo = getPageInfo();
        logUserJourney({
          eventType: 'tour_step_view',
          stepKey: currentStepId || `step_${stepIndex}`,
          menuId: pageInfo.menuId,
          accessLink: pageInfo.accessLink,
        });
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
