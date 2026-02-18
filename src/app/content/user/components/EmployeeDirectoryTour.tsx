
"use client";

import { useEffect } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { employeeDirectoryTourSteps } from "@/lib/employeeDirectoryTourSteps";

interface EmployeeDirectoryTourProps {
  onComplete?: () => void;
}

const EmployeeDirectoryTour: React.FC<EmployeeDirectoryTourProps> = ({ onComplete }) => {
  useEffect(() => {
    const tourSteps = employeeDirectoryTourSteps;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: 'smooth', block: 'center' },
        classes: 'shepherd-theme-arrows',
      },
    });

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
      if (index === tourSteps.length - 1) return [skip, back, finish];
      return [skip, back, next];
    };

    /* ------------------------------
       ADD STEPS
    ------------------------------ */
    tourSteps.forEach((step: any, index: number) => {
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

    tour.start();

    return () => {
      tour.cancel();
      document.head.removeChild(style);
    };
  }, [onComplete]);

  return null;
};

export default EmployeeDirectoryTour;

