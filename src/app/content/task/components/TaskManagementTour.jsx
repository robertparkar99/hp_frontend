"use client";

import React, { useEffect, useState, useRef } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { taskManagementTourSteps } from "@/lib/taskManagementTourSteps";
import Icon from "@/components/AppIcon";

const TaskManagementTour = ({ onComplete, onSwitchView }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const tourInstanceRef = useRef(null);

  useEffect(() => {
    // Check if tour has already been completed
    const tourCompleted = localStorage.getItem("taskManagementTourCompleted");
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

    // Button logic
    const getButtons = (index) => {
      const skip = {
        text: "Skip",
        action: () => {
          tour.cancel();
          setIsTourActive(false);
          localStorage.setItem("taskManagementTourCompleted", "true");
          onComplete?.();
        },
        classes: "shepherd-skip",
      };

      const back = {
        text: "Back",
        action: () => {
          tour.back();
        },
        classes: "shepherd-back",
      };

      const next = {
        text: "Next",
        action: () => {
          tour.next();
        },
        classes: "shepherd-next",
      };

      const finish = {
        text: "Finish",
        action: () => {
          tour.complete();
          setIsTourActive(false);
          localStorage.setItem("taskManagementTourCompleted", "true");
          onComplete?.();
        },
        classes: "shepherd-finish",
      };

      if (index === 0) return [skip, next];
      if (index === taskManagementTourSteps.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    // Add steps to tour
    taskManagementTourSteps.forEach((step, index) => {
      tour.addStep({
        ...step,
        title: step.title || "Tour",
        buttons: getButtons(index),
      });
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

export default TaskManagementTour;
