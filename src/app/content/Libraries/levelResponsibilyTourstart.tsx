
"use client";

import { useEffect } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { initializeLORTour } from "../Libraries/LevelResponsibilityTour";

interface LevelResponsibilityTourProps {
  onComplete?: () => void;
}

const LevelResponsibilityTour: React.FC<LevelResponsibilityTourProps> = ({ onComplete }) => {
  useEffect(() => {
    // Initialize the tour with section switcher
    const switchSection = (section: 'description' | 'responsibility' | 'business') => {
      // Dispatch custom event for section switching
      window.dispatchEvent(new CustomEvent('lor-tour-switch-section', { detail: { section } }));
    };
    
    const tour = initializeLORTour(switchSection);
    
    // Listen for section switch requests from tour steps
    const handleSectionSwitch = (e: CustomEvent) => {
      const section = e.detail.section as 'description' | 'responsibility' | 'business';
      const tabButton = document.querySelector(`[data-section="${section}"]`) as HTMLButtonElement;
      if (tabButton) {
        tabButton.click();
      }
    };
    
    window.addEventListener('lor-tour-switch-section' as any, handleSectionSwitch as any);

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

    // Override the onComplete callback
    const originalComplete = (tour as any).complete.bind(tour);
    (tour as any).complete = function() {
      onComplete?.();
      originalComplete();
    };

    const originalCancel = (tour as any).cancel.bind(tour);
    (tour as any).cancel = function() {
      onComplete?.();
      originalCancel();
    };

    tour.start();

    return () => {
      tour.cancel();
      document.head.removeChild(style);
      window.removeEventListener('lor-tour-switch-section' as any, handleSectionSwitch as any);
    };
  }, [onComplete]);

  return null;
};

export default LevelResponsibilityTour;
