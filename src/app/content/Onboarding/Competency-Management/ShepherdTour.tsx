
"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    const tourSteps = steps || (tabs ? generateTourSteps(tabs) : []);

    (window as any).detailOnboardingHandler = onOpenDetailModal;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: "smooth", block: "center" },
        classes: 'shepherd-theme-arrows',
        // classes: "custom-shepherd",
      },
    });

    // Add CSS for custom styling
    const style = document.createElement('style');
    style.textContent = `
      .shepherd-element {
        border-radius: 0.875rem !important;
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

      /* Responsive adjustments */
      @media (max-width: 767px) {
        .shepherd-element {
          border-radius: 0.5rem !important;
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
        .detail-onboarding-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
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
        .detail-onboarding-btn {
          padding: 0.4rem 1rem;
        }
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

        // 🔴 REQUIRED: title must exist
        title: step.title || "Tour",

        buttons: getButtons(index),
      });
    });

    tour.start();

    return () => {
      tour.cancel();
      document.head.removeChild(style);
      (window as any).detailOnboardingHandler = undefined;
    };
  }, [tabs, onComplete, onOpenDetailModal]);

  return null;
};

export default ShepherdTour;
