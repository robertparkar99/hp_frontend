import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration interface
export interface HolidayMasterTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: (this: Tour) => void;
    classes?: string;
  }>;
  beforeShowPromise?: () => Promise<unknown>;
}

// Tour step configuration for HolidayMaster
export const holidayMasterTourSteps: HolidayMasterTourStep[] = [
  {
    id: 'holiday-welcome',
    title: 'Welcome to Holiday Master!',
    text: 'This page allows you to manage holidays and day-offs for your organization. Let me show you around.',
    attachTo: { element: '#holiday-header', on: 'bottom' },
    buttons: [
      {
        text: 'Skip',
        action: function(this: Tour) { this.cancel(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-add-button',
    title: 'Add New Holiday',
    text: 'Click this button to add a new holiday. You can specify the holiday name, date, and departments.',
    attachTo: { element: '#holiday-add-button', on: 'left' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-stats',
    title: 'Quick Statistics',
    text: 'These cards show quick stats: Total Holidays, This Month\'s holidays, Upcoming events, and Past events.',
    attachTo: { element: '#holiday-stats', on: 'bottom' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-tabs',
    title: 'Holidays & Day Offs',
    text: 'Switch between "Holidays" tab to manage holidays and "Day Offs" tab to configure weekly day off settings.',
    attachTo: { element: '#holiday-tabs', on: 'bottom' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-holidays-list',
    title: 'Holiday List',
    text: 'Here you can see all holidays. Each card shows the holiday name, type, departments, and date. You can also delete holidays from here.',
    attachTo: { element: '#holiday-list-container', on: 'top' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-delete-action',
    title: 'Delete Holiday',
    text: 'Hover over a holiday card to reveal the delete button. Use this to remove holidays.',
    attachTo: { element: '.delete-holiday-btn', on: 'left' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-dayoffs-tab',
    title: 'Day Offs Configuration',
    text: 'Switch to the "Day Offs" tab to configure weekly day off settings for your organization.',
    attachTo: { element: '#dayoffs-tab', on: 'bottom' },
    beforeShowPromise: () => {
      return new Promise<void>(resolve => {
        // Auto-select the Day Offs tab
        const dayoffsTab = document.getElementById('dayoffs-tab');
        if (dayoffsTab) {
          dayoffsTab.click();
        }
        // Small delay to allow tab switch animation
        setTimeout(() => resolve(), 100);
      });
    },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-dayoffs-days',
    title: 'Day Selection',
    text: 'For each day of the week, select whether it should be a Full Day, Half Day, or Weekend.',
    attachTo: { element: '#dayoffs-selections', on: 'top' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'holiday-dayoffs-submit',
    title: 'Save Day Offs',
    text: 'After configuring day offs, click this button to save your changes.',
    attachTo: { element: '#dayoffs-submit', on: 'top' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish',
        action: function(this: Tour) { this.complete(); },
        classes: 'shepherd-button-primary'
      }
    ]
  }
];

// Create and configure the tour
export const createHolidayMasterTour = (): Tour => {
  return new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom',
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
};

// Check if tour should be triggered
export const shouldStartHolidayTour = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if triggered from sidebar tour
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const isHolidayMasterTrigger = triggerValue === 'holiday-master' || 
                                  triggerValue === 'holiday-Master' ||
                                  window.location.href.includes('holiday-master');
  
  // Don't start if tour already completed
  const tourCompleted = sessionStorage.getItem('holidayMasterTourCompleted');
  
  return isHolidayMasterTrigger && !tourCompleted;
};

// Mark tour as completed
export const completeHolidayMasterTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('holidayMasterTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
  }
};

// Reset tour (for testing)
export const resetHolidayMasterTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('holidayMasterTourCompleted');
    sessionStorage.removeItem('triggerPageTour');
  }
};
