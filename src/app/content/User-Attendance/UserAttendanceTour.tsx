import Shepherd, { Tour, Step } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration interface
export interface UserAttendanceTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: () => void;
    classes?: string;
  }>;
  beforeShowPromise?: () => Promise<void>;
  when?: {
    show?: () => void;
    hide?: () => void;
  };
}

// CSS styles for the tour
export const userAttendanceTourStyles = `
  .shepherd-theme-user-attendance {
    --shepherd-theme-primary: #007BE5;
    --shepherd-theme-secondary: #6c757d;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
  }

  .shepherd-theme-user-attendance .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 16px 20px;
  }

  .shepherd-theme-user-attendance .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-user-attendance .shepherd-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    padding: 20px;
  }

  .shepherd-theme-user-attendance .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-weight: 500;
    font-size: 14px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0 5px;
  }

  .shepherd-theme-user-attendance .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-user-attendance .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-user-attendance .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-user-attendance .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
    cursor: pointer;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #007BE5;
    padding: 16px 20px;
  }

  .shepherd-theme-user-attendance .shepherd-element {
    border-radius: 12px;
    max-width: 400px;
  }

  @keyframes pulse-element {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  .tour-highlight-active {
    animation: pulse-element 2s infinite;
    position: relative;
    z-index: 1000;
    box-shadow: 0 0 0 4px rgba(0, 123, 229, 0.3);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = userAttendanceTourStyles;
  document.head.appendChild(styleSheet);
}

// Create tour steps
export const createUserAttendanceTourSteps = (): UserAttendanceTourStep[] => {
  return [
    {
      id: 'user-attendance-welcome',
      title: '👋 Welcome to User Attendance',
      text: 'This page allows you to manage and track user attendance records. Let me show you around the key features.',
      attachTo: {
        element: '#tour-user-attendance-header',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip Tour',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            if (tour) tour.cancel();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-employee-selector',
      title: '👥 Employee Selection',
      text: 'Select one or more employees to view their attendance records. You can filter by department or search for specific employees.',
      attachTo: {
        element: '#tour-employee-selector',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-date-filters',
      title: '📅 Date Range Filters',
      text: 'Filter attendance records by selecting a date range. Choose "From Date" and "To Date" to narrow down the results.',
      attachTo: {
        element: '#tour-date-filters',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-search',
      title: '🔍 Search Button',
      text: 'Click this button to apply your selected filters and search for attendance records matching your criteria.',
      attachTo: {
        element: '#tour-search-button',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-add',
      title: '➕ Add Attendance',
      text: 'Click this button to add new attendance records manually. This opens a form where you can enter attendance details.',
      attachTo: {
        element: '#tour-add-button',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-stats',
      title: '📊 Attendance Statistics',
      text: 'This section shows key statistics including total records, present days, absent days, and average working hours.',
      attachTo: {
        element: '#tour-stats-cards',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-list',
      title: '📋 Attendance Records',
      text: 'This table displays all attendance records with details like date, punch-in/out times, total hours, and status. You can edit records directly from here.',
      attachTo: {
        element: '#tour-attendance-list',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish Tour',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            if (tour) {
              tour.complete();
            }
          }
        }
      ]
    }
  ];
};

// Tour class for managing the User Attendance tour
export class UserAttendanceTour {
  private static instance: UserAttendanceTour | null = null;
  private tour: Tour | null = null;
  private currentStepIndex: number = 0;

  private constructor() {}

  // Get singleton instance
  public static getInstance(): UserAttendanceTour {
    if (!UserAttendanceTour.instance) {
      UserAttendanceTour.instance = new UserAttendanceTour();
    }
    return UserAttendanceTour.instance;
  }

  // Initialize and start the tour
  public start(): void {
    // Check if tour is already active
    if (this.tour && this.tour.getCurrentStep()) {
      console.log('User Attendance tour is already running');
      return;
    }

    console.log('Starting User Attendance tour');

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shepherd-theme-user-attendance',
        scrollTo: {
          behavior: 'smooth' as const,
          block: 'center' as const
        },
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 8
      },
      useModalOverlay: true,
      exitOnEsc: true,
      keyboardNavigation: true
    });

    // Add steps to the tour
    const steps = createUserAttendanceTourSteps();
    steps.forEach(step => {
      this.tour!.addStep(step as unknown as Step);
    });

    // Handle tour events
    this.tour.on('show', (event) => {
      const currentStep = event.step;
      const element = currentStep.getElement();
      if (element) {
        element.classList.add('tour-highlight-active');
      }
      this.currentStepIndex = this.tour?.steps.findIndex((s) => s.id === currentStep.id) || 0;
    });

    this.tour.on('hide', (event) => {
      const currentStep = event.step;
      const element = currentStep.getElement();
      if (element) {
        element.classList.remove('tour-highlight-active');
      }
    });

    this.tour.on('cancel', () => {
      this.cleanup();
      console.log('User Attendance tour cancelled');
    });

    this.tour.on('complete', () => {
      this.cleanup();
      console.log('User Attendance tour completed');
    });

    // Start the tour
    setTimeout(() => {
      this.tour?.start();
    }, 100);
  }

  // Navigate to next step
  public next(): void {
    this.tour?.next();
  }

  // Navigate to previous step
  public back(): void {
    const steps = this.tour?.steps;
    if (steps && this.currentStepIndex > 0) {
      this.tour?.show(steps[this.currentStepIndex - 1].id);
    }
  }

  // Cancel the tour
  public cancel(): void {
    this.tour?.cancel();
  }

  // Complete the tour
  public complete(): void {
    this.tour?.complete();
  }

  // Cleanup after tour ends
  private cleanup(): void {
    // Remove highlight from any element
    const highlightedElements = document.querySelectorAll('.tour-highlight-active');
    highlightedElements.forEach(el => el.classList.remove('tour-highlight-active'));

    // Clear session storage flag
    sessionStorage.removeItem('triggerPageTour');
    sessionStorage.removeItem('triggerUserAttendanceTour');

    // Clear local storage
    localStorage.removeItem('userAttendanceTourCompleted');
    localStorage.setItem('userAttendanceTourCompleted', Date.now().toString());
  }

  // Check if tour was completed
  public static isTourCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    const completed = localStorage.getItem('userAttendanceTourCompleted');
    if (!completed) return false;

    // Check if completed within last 24 hours (optional: prevent showing too frequently)
    const dayInMs = 24 * 60 * 60 * 1000;
    const completedTime = parseInt(completed, 10);
    const now = Date.now();

    return now - completedTime < dayInMs;
  }
}

// Utility function to trigger the tour from outside
export const triggerUserAttendanceTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('triggerUserAttendanceTour', 'true');
  }
};

// Utility function to check if tour should be triggered
export const shouldStartUserAttendanceTour = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check if tour was already completed recently
  if (UserAttendanceTour.isTourCompleted()) {
    console.log('User Attendance tour already completed recently');
    return false;
  }

  // Check for trigger flag from sidebar tour
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const shouldTrigger = triggerValue === 'user-attendance';
  
  if (shouldTrigger) {
    console.log('User Attendance tour triggered from sidebar');
  }
  
  return shouldTrigger;
};

