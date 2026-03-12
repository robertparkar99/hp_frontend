
"use client";

import { useEffect, useState } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { generateTourSteps, TourStep } from "@/lib/tourSteps";

interface ShepherdTourProps {
  tabs?: string[];
  steps?: TourStep[];
  onComplete?: () => void;
  onOpenDetailModal?: (tab: string) => void;
}

const ShepherdTour: React.FC<ShepherdTourProps> = ({ tabs, steps, onComplete, onOpenDetailModal }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const tourSteps = steps || (tabs ? generateTourSteps(tabs) : []);

    (window as any).detailOnboardingHandler = onOpenDetailModal;

    // Configure tour with responsive options
    const tourOptions: any = {
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: "smooth", block: "center" },
        classes: 'shepherd-theme-arrows custom-shepherd',
      },
    };

    // Add mobile-specific options
    if (isMobile) {
      tourOptions.defaultStepOptions.classes = 'shepherd-theme-arrows custom-shepherd mobile-shepherd';
    }

    const tour = new Shepherd.Tour(tourOptions);

    // Store tour instance for radio tab switching
    (window as any).currentTour = tour;

    // Add CSS for custom styling
    const style = document.createElement('style');
    style.textContent = `
      /* Base Shepherd Styles */
      .shepherd-element {
        border-radius: 0.875rem !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
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
      
      /* ==============================
         FOOTER / BUTTONS
       ================================ */
       .shepherd-footer {
         padding: 0.875rem 1.125rem 1.125rem;
         display: flex;
         gap: 0.625rem;
         justify-content: space-between;
       }

       /* Base Button */
       .shepherd-button {
         border-radius: 999px !important;
         padding: 0.5rem 1.125rem !important;
         font-weight: 500;
         font-size: 0.875rem;
         transition: all 0.25s ease;
       }

       /* Skip */
       .shepherd-skip {
         background: transparent !important;
         color: #6b7280 !important;
       }
       .shepherd-skip:hover {
         color: #111827 !important;
       }

       /* Back */
       .shepherd-back {
         background: #f3f4f6 !important;
         color: #374151 !important;
       }
       .shepherd-back:hover {
         background: #e5e7eb !important;
       }

       /* Primary CTA */
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

     .detail-onboarding-btn {
       cursor: pointer;
       border: none;
       border-radius: 0.875rem;
       padding: 0.55rem 1.6rem;
       margin-bottom: 0.5rem;
       font-weight: 500;
       background: linear-gradient(135deg, #779ff8  0%, #4465c0  100%) !important;
       color: #ffffff !important;
       box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
       transition: all 0.3s ease;
       width: 100%;
     }
     .detail-onboarding-btn:hover {
       transform: translateY(-2px);
       box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
     }

     /* Radio Button Styling */
     .shepherd-content label {
       display: flex !important;
       align-items: flex-start;
       gap: 6px !important;
       margin: 3px 0 !important;
       cursor: pointer;
       padding: 4px 8px;
       border-radius: 4px;
       transition: background-color 0.2s ease;
       font-size: 11px !important;
       line-height: 1.3;
     }
     .shepherd-content label:hover {
       background-color: #f3f4f6;
     }
     .shepherd-content label input[type="radio"] {
       width: 14px;
       height: 14px;
       cursor: pointer;
       accent-color: #2563eb;
       flex-shrink: 0;
       margin-top: 1px;
     }
     .shepherd-content label span {
       word-wrap: break-word;
     }
     .shepherd-content .tour-radio-container {
       display: flex !important;
       flex-direction: column;
       margin-bottom: 4px;
       max-width: 100%;
     }

     /* ==============================
        RESPONSIVE STYLES
     ================================ */
     
     /* Force full width on mobile */
     @media screen and (max-width: 767px) {
       .shepherd-element {
         position: fixed !important;
         top: auto !important;
         bottom: 0 !important;
         left: 0 !important;
         right: 0 !important;
         width: 100% !important;
         max-width: 100% !important;
         border-radius: 1rem 1rem 0 0 !important;
         margin: 0 !important;
         transform: none !important;
         z-index: 9999 !important;
       }
       .shepherd-content {
         border-radius: 1rem 1rem 0 0 !important;
       }
       .shepherd-header {
         border-radius: 1rem 1rem 0 0 !important;
         padding: 0.75rem 1rem !important;
       }
       .shepherd-footer {
         padding: 1rem !important;
         gap: 0.5rem !important;
       }
       .shepherd-button {
         flex: 1 !important;
         min-width: 80px !important;
         padding: 0.75rem 1rem !important;
         font-size: 0.875rem !important;
       }
       .shepherd-text {
         font-size: 0.875rem !important;
       }
       .shepherd-title {
         font-size: 1.1rem !important;
       }
       .shepherd-content {
         padding: 1rem !important;
       }
       .shepherd-content label {
         font-size: 13px !important;
         padding: 8px 10px !important;
         min-height: 40px !important;
       }
       .shepherd-content label input[type="radio"] {
         width: 18px !important;
         height: 18px !important;
       }
       .tour-radio-container {
         max-height: 150px !important;
         overflow-y: auto !important;
       }
       .detail-onboarding-btn {
         padding: 0.75rem 1rem !important;
         font-size: 0.875rem !important;
         min-height: 48px !important;
       }
       .shepherd-arrow {
         display: none !important;
       }
     }

     @media screen and (max-width: 480px) {
       .shepherd-header {
         padding: 0.5rem 0.75rem !important;
       }
       .shepherd-footer {
         padding: 0.75rem !important;
         flex-wrap: wrap !important;
       }
       .shepherd-button {
         min-width: 70px !important;
         padding: 0.625rem 0.75rem !important;
         font-size: 0.8rem !important;
       }
       .shepherd-content {
         padding: 0.75rem !important;
       }
       .shepherd-text {
         font-size: 0.8rem !important;
       }
       .shepherd-title {
         font-size: 1rem !important;
       }
       .detail-onboarding-btn {
         padding: 0.625rem 0.75rem !important;
       }
     }

     /* Mobile shepherd specific class */
     .mobile-shepherd .shepherd-element {
       position: fixed !important;
       bottom: 0 !important;
       left: 0 !important;
       right: 0 !important;
       width: 100% !important;
       max-width: 100% !important;
       border-radius: 1rem 1rem 0 0 !important;
     }
    `;
    document.head.appendChild(style);

    /* ------------------------------
       BUTTON LOGIC
    ------------------------------ */
    const getButtons = (index: number) => {
      const skip = {
        text: "Skip",
        action: () => {
          tour.cancel();
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
          onComplete?.();
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === tourSteps.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    /* ------------------------------
       ADD STEPS
    ------------------------------ */
    tourSteps.forEach((step, index) => {
      tour.addStep({
        ...step,

        // 🔴 REQUIRED: id, title, and text must exist
        id: step.id || `tour-step-${index}`,
        title: step.title || "Tour",
        text: step.text || "",

        buttons: getButtons(index),
      });
    });

    // Wait for DOM elements to be available before starting tour
    const waitForElements = (): Promise<void> => {
      return new Promise((resolve) => {
        const checkElements = () => {
          const firstTabId = tourSteps[0]?.id;
          if (firstTabId) {
            const element = document.querySelector(`#${firstTabId}`);
            if (element) {
              resolve();
              return;
            }
          }
          // If no specific element found, check for any tab element
          const anyTabElement = document.querySelector('[id^="tab-"]');
          if (anyTabElement) {
            resolve();
            return;
          }
          // If still not found, wait a bit longer
          setTimeout(checkElements, 100);
        };
        checkElements();
      });
    };

    // Start tour after ensuring elements are available
    const startTour = async () => {
      await waitForElements();
      // Additional delay to ensure smooth rendering
      setTimeout(() => {
        try {
          tour.start();
        } catch (error) {
          console.error('Error starting tour:', error);
          onComplete?.();
        }
      }, 200);
    };

    startTour();

    return () => {
      tour.cancel();
      document.head.removeChild(style);
      (window as any).detailOnboardingHandler = undefined;
    };
  }, [tabs, onComplete, onOpenDetailModal, isMobile]);

  return null;
};

// Radio tab change handler for tour step navigation
if (typeof window !== "undefined") {
  (window as any).handleTourTabChange = (selectedTab: string) => {
    const tour = (window as any).currentTour;
    if (!tour) return;

    const steps = tour.steps;

    const targetIndex = steps.findIndex(
      (step: any) => step.id === selectedTab.replace(/\s+/g, "-").toLowerCase()
    );

    if (targetIndex !== -1) {
      tour.show(targetIndex);
    }
  };
}

export default ShepherdTour;
