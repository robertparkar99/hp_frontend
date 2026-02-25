import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export interface SalaryCertificateTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: (tour: Tour) => void;
    classes?: string;
  }>;
  advanceOn?: {
    selector: string;
    event: string;
  };
  beforeShowPromise?: () => Promise<void>;
}

export const createSalaryCertificateTourSteps = (): SalaryCertificateTourStep[] => [
  {
    id: 'salary-certificate-welcome',
    title: 'Welcome to Salary Certificate!',
    text: 'This page allows you to generate salary certificates for employees. Let\'s take a quick tour to understand all the features.',
    attachTo: {
      element: '#tour-salary-certificate-header',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip Tour',
        action: (tour: Tour) => {
          tour.cancel();
          sessionStorage.setItem('salaryCertificateTourCompleted', 'true');
        },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-department',
    title: '📋 Department Selection',
    text: 'Select the department of the employee for whom you want to generate a salary certificate. This will filter the employee list.',
    attachTo: {
      element: '#tour-department-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-employee',
    title: '👤 Employee Selection',
    text: 'Choose the specific employee from the selected department. The list will automatically populate based on your department selection.',
    attachTo: {
      element: '#tour-employee-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-months',
    title: '📅 Month Selection',
    text: 'Select one or more months for which you want to generate the salary certificate. Hold Ctrl/Cmd to select multiple months.',
    attachTo: {
      element: '#tour-months-select',
      on: 'top'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-year',
    title: '📆 Year Selection',
    text: 'Select the year for which you want to generate the salary certificate.',
    attachTo: {
      element: '#tour-year-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-payroll-type',
    title: '💰 Payroll Type',
    text: 'Select the payroll type (e.g., Basic, HRA, DA, Bonus) for the salary certificate.',
    attachTo: {
      element: '#tour-payroll-type',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-reason',
    title: '📝 Reason (Optional)',
    text: 'Enter the reason for generating the salary certificate. This field is optional but can be useful for record-keeping.',
    attachTo: {
      element: '#tour-reason-div',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-generate-btn',
    title: '✅ Generate Certificate',
    text: 'Click this button to generate the salary certificate. It will open the PDF in a new tab for viewing or downloading.',
    attachTo: {
      element: '#tour-generate-btn',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'salary-certificate-download-btn',
    title: '📥 Download PDF',
    text: 'After generating, use this button to download the salary certificate as a PDF file.',
    attachTo: {
      element: '#tour-download-btn',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',
        action: (tour: Tour) => (tour as any).back(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish Tour',
        action: (tour: Tour) => {
          tour.complete();
          sessionStorage.setItem('salaryCertificateTourCompleted', 'true');
        }
      }
    ]
  },
  {
    id: 'salary-certificate-complete',
    title: '🎉 Tour Complete!',
    text: 'Congratulations! You now know how to generate salary certificates. If you need help, click the "New" button in the sidebar to restart this tour.',
    attachTo: {
      element: '#tour-salary-certificate-header',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Done',
        action: (tour: Tour) => {
          tour.cancel();
          sessionStorage.setItem('salaryCertificateTourCompleted', 'true');
        }
      }
    ]
  }
];

export class SalaryCertificateTour {
  private tour: Tour | null = null;
  private static readonly TOUR_COMPLETED_KEY = 'salaryCertificateTourCompleted';

  // Start the tour
  public startTour(): void {
    // Check if tour was already completed
    if (sessionStorage.getItem(SalaryCertificateTour.TOUR_COMPLETED_KEY) === 'true') {
      console.log('Salary Certificate tour already completed, skipping...');
      return;
    }

    console.log('Starting Salary Certificate tour...');

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 8
      },
      useModalOverlay: true,
      exitOnEsc: true,
      keyboardNavigation: true
    });

    // Add steps to tour with transformed buttons
    const steps = createSalaryCertificateTourSteps();
    steps.forEach(step => {
      this.tour!.addStep({
        ...step,
        buttons: step.buttons?.map(btn => ({
          text: btn.text,
          classes: btn.classes,
          action: () => {
            btn.action(this.tour!);
          }
        }))
      });
    });

    // Handle tour completion
    this.tour.on('complete', () => {
      sessionStorage.setItem(SalaryCertificateTour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      console.log('Salary Certificate tour completed');
    });

    // Handle tour cancellation
    this.tour.on('cancel', () => {
      sessionStorage.setItem(SalaryCertificateTour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      console.log('Salary Certificate tour cancelled');
    });

    // Start the tour with longer delay
    setTimeout(() => {
      this.tour?.start();
    }, 1000);
  }

  // Check if tour should start (triggered from sidebar)
  public shouldStartTour(): boolean {
    const triggerValue = sessionStorage.getItem('triggerPageTour');
    return triggerValue === 'salary-certificate' &&
      sessionStorage.getItem(SalaryCertificateTour.TOUR_COMPLETED_KEY) !== 'true';
  }

  // Clear tour state (for testing or reset)
  public clearTourState(): void {
    sessionStorage.removeItem(SalaryCertificateTour.TOUR_COMPLETED_KEY);
  }

  // Cancel the tour
  public cancelTour(): void {
    this.tour?.cancel();
  }
}

// Create and export a singleton instance
export const salaryCertificateTour = new SalaryCertificateTour();

// Export styles
export const salaryCertificateTourStyles = `
  .shepherd-theme-custom {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
    max-width: 400px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = salaryCertificateTourStyles;
  document.head.appendChild(styleSheet);
}
