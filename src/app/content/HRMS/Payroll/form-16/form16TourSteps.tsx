import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Form 16 Tour Step interface
export interface Form16TourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    classes?: string;
  }>;

}

// Form 16 Tour Steps
export const form16TourSteps: Form16TourStep[] = [
  {
    id: 'form16-welcome',
    title: 'Welcome to Form 16 Page!',
    text: 'This page allows you to generate Form 16 certificates for employees. Let\'s take a quick tour to understand the functionality.',
    attachTo: {
      element: '#form16-header',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip Tour',
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-department-select',
    title: 'Select Department',
    text: 'Choose the department from the dropdown. This will filter employees belonging to that department.',
    attachTo: {
      element: '#tour-department-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-employee-select',
    title: 'Select Employee',
    text: 'After selecting a department, choose the specific employee from the dropdown list.',
    attachTo: {
      element: '#tour-employee-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-year-select',
    title: 'Select Year',
    text: 'Choose the assessment year for which you want to generate the Form 16 certificate.',
    attachTo: {
      element: '#tour-year-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-allowance-section',
    title: 'Allowance Section',
    text: 'View and select the allowances to be included in the Form 16. These are the allowances earned by the employee.',
    attachTo: {
      element: '#tour-allowance-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-deduction-section',
    title: 'Deduction Section',
    text: 'View and select the deductions to be included in the Form 16. These include PF, PT, Tax deductions, etc.',
    attachTo: {
      element: '#tour-deduction-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-submit-button',
    title: 'Generate Form 16',
    text: 'Click this button to generate the Form 16 certificate for the selected employee with the chosen year and deductions.',
    attachTo: {
      element: '#tour-submit-button',
      on: 'top'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish Tour',

      }
    ]
  }
];

// Form 16 Tour Class
export class Form16Tour {
  private tour: Tour | null = null;
  private static readonly TOUR_COMPLETED_KEY = 'form16TourCompleted';

  // Start the tour
  public startTour(): void {
    // Check if tour was already completed
    if (sessionStorage.getItem(Form16Tour.TOUR_COMPLETED_KEY) === 'true') {
      console.log('Form 16 tour already completed, skipping...');
      return;
    }

    console.log('Starting Form 16 tour...');

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shepherd-theme-custom',
        scrollTo: {
          behavior: 'smooth',
          block: 'center'
        },
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 8
      },
      useModalOverlay: true,
      exitOnEsc: true,
      keyboardNavigation: true
    });

    // Add steps to tour with transformed buttons
    form16TourSteps.forEach(step => {
      this.tour!.addStep({
        ...step,
        buttons: step.buttons?.map(btn => {
          switch (btn.text) {
            case 'Next':
              return {
                text: btn.text,
                classes: btn.classes,
                action() {
                  this.next();
                }
              };

            case 'Previous':
              return {
                text: btn.text,
                classes: btn.classes,
                action() {
                  this.back();
                }
              };

            case 'Skip Tour':
              return {
                text: btn.text,
                classes: btn.classes,
                action() {
                  this.cancel();
                }
              };

            case 'Finish Tour':
              return {
                text: btn.text,
                classes: btn.classes,
                action() {
                  sessionStorage.setItem(
                    Form16Tour.TOUR_COMPLETED_KEY,
                    'true'
                  );
                  this.complete();
                }
              };

            default:
              return {
                text: btn.text,
                classes: btn.classes
              };
          }
        })

        // buttons: step.buttons?.map(btn => ({
        //   text: btn.text,
        //   classes: btn.classes,
        //   action: () => {
        //     // Call the original action if it does something
        //     btn.action();

        //     // Handle tour navigation
        //     if (btn.text === 'Next') this.tour!.next();
        //     if (btn.text === 'Previous') (this.tour as any).back();
        //     if (btn.text === 'Skip Tour') this.tour!.cancel();
        //     if (btn.text === 'Finish Tour') {
        //       sessionStorage.setItem(Form16Tour.TOUR_COMPLETED_KEY, 'true');
        //       this.tour!.complete();
        //     }
        //   }
        // }))
      });
    });

    // Handle tour completion
    this.tour.on('complete', () => {
      sessionStorage.setItem(Form16Tour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      console.log('Form 16 tour completed');
    });

    // Handle tour cancellation
    this.tour.on('cancel', () => {
      sessionStorage.setItem(Form16Tour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      console.log('Form 16 tour cancelled');
    });

    // Start the tour
    setTimeout(() => {
      this.tour?.start();
    }, 100);
  }

  // Check if tour should start (triggered from sidebar)
  public shouldStartTour(): boolean {
    const triggerValue = sessionStorage.getItem('triggerPageTour');
    // Only start if triggered and not completed
    return triggerValue === 'form-16' &&
      sessionStorage.getItem(Form16Tour.TOUR_COMPLETED_KEY) !== 'true';
  }

  // Clear tour state (for testing or reset)
  public clearTourState(): void {
    sessionStorage.removeItem(Form16Tour.TOUR_COMPLETED_KEY);
  }

  // Cancel the tour
  public cancelTour(): void {
    this.tour?.cancel();
  }
}

// Create and export a singleton instance
export const form16Tour = new Form16Tour();
