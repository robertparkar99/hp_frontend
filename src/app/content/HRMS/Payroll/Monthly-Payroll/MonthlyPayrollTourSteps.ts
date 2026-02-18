import Shepherd, { Step, StepOptions, Tour } from 'shepherd.js';

// Extend Shepherd interface to include our custom classes and button actions
declare module 'shepherd.js' {
  interface StepOptions {
    classes?: string;
  }
  
  interface ButtonOptions {
    action?: ((this: Tour, e: Event) => void) | string;
    classes?: string;
    text?: string;
    type?: string;
  }
}

// Helper functions for button actions with correct Shepherd.js signature
const cancelAction = function(this: Tour) {
  this.cancel();
};

const backAction = function(this: Tour) {
  this.back();
};

const nextAction = function(this: Tour) {
  this.next();
};

export const MonthlyPayrollTourSteps: StepOptions[] = [
  {
    id: 'tour-welcome',
    title: 'Welcome to Monthly Payroll Management',
    text: 'This tour will guide you through all the features of the Monthly Payroll management system. Click "Next" to begin.',
    attachTo: { element: '#monthly-payroll-title', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-secondary',
        text: 'Skip Tour',
        action: cancelAction
      },
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Start Tour',
        action: nextAction
      }
    ]
  },
  {
    id: 'tour-employee-selector',
    title: '🎯 Employee Selection',
    text: 'Use this section to select employees for payroll processing. You can filter by department and select specific employees using the dropdown.',
    attachTo: { element: '#employee-selector-container', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-secondary',
        text: 'Back',
        action: backAction
      },
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Next',
        action: nextAction
      }
    ]
  },
  {
    id: 'tour-month-selection',
    title: '📅 Month Selection',
    text: 'Select the month for which you want to process payroll. The dropdown contains all 12 months.',
    attachTo: { element: '#month-select', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-secondary',
        text: 'Back',
        action: backAction
      },
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Next',
        action: nextAction
      }
    ]
  },
  {
    id: 'tour-year-selection',
    title: '📆 Year Selection',
    text: 'Select the financial year for payroll processing. The system provides a range of years to choose from.',
    attachTo: { element: '#year-select', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-secondary',
        text: 'Back',
        action: backAction
      },
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Next',
        action: nextAction
      }
    ]
  },
  {
    id: 'tour-search-button',
    title: '🔍 Search Button',
    text: 'Click this button to fetch employee payroll data based on your selected filters. The button shows "Searching..." while loading.',
    attachTo: { element: '#search-button', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-secondary',
        text: 'Back',
        action: backAction
      },
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Next',
        action: nextAction
      }
    ]
  },
  {
    id: 'tour-payroll-table',
    title: '📊 Payroll Data Table',
    text: 'After searching, this table will display all employee payroll data. You can sort columns by clicking on headers and filter data using the search inputs.',
    attachTo: { element: '#payroll-data-table', on: 'top' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-secondary',
        text: 'Back',
        action: backAction
      },
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Next',
        action: nextAction
      }
    ]
  },
  {
    id: 'tour-submit-payroll',
    title: '✅ Submit Payroll',
    text: 'Click this button to save all payroll data. Once submitted, you can generate PDF salary slips and the records become locked for deletion. The button is disabled if no data is available.',
    attachTo: { element: '#submit-payroll-button', on: 'top' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-secondary',
        text: 'Back',
        action: backAction
      },
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Next',
        action: nextAction
      }
    ]
  },
  {
    id: 'tour-complete',
    title: '🎉 Tour Complete!',
    text: 'Congratulations! You have completed the Monthly Payroll Management tour. You can now efficiently manage payroll processing for your organization. Click "Done" to close.',
    attachTo: { element: '#monthly-payroll-title', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button shepherd-button-primary',
        text: 'Done',
        action: nextAction
      }
    ]
  }
];

// Function to create and configure the tour
export const createMonthlyPayrollTour = (): Tour => {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom monthly-payroll-tour',
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
  MonthlyPayrollTourSteps.forEach(step => {
    tour.addStep(step);
  });

  return tour;
};

// Custom styles for the tour
export const monthlyPayrollTourStyles = `
  /* Base shepherd styles */
  .shepherd-element {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    z-index: 9999 !important;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
    color: white;
    border-radius: 8px 8px 0 0;
    padding: 12px 16px;
  }

  .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    padding: 16px 20px;
    margin: 0;
  }

  /* Button base styles */
  .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-weight: 500;
    font-size: 14px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0 4px;
    min-width: 80px;
    pointer-events: auto !important;
  }

  .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 229, 0.3);
  }

  .shepherd-button:active {
    transform: translateY(0);
  }

  /* Secondary button styles */
  .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-button-secondary:hover {
    background: #5a6268 !important;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  }

  /* Primary button styles */
  .shepherd-button-primary {
    background: #007BE5 !important;
  }

  .shepherd-button-primary:hover {
    background: #0056b3 !important;
  }

  /* Cancel icon */
  .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
    opacity: 0.8;
    cursor: pointer;
    pointer-events: auto !important;
  }

  .shepherd-cancel-icon:hover {
    opacity: 1;
  }

  /* Main element */
  .shepherd-element {
    box-shadow: 0 10px 40px rgba(0, 123, 229, 0.25);
    border-radius: 12px;
    max-width: 400px;
    background: white;
    overflow: hidden;
    pointer-events: auto !important;
  }

  /* Arrow styles */
  .shepherd-arrow:before {
    background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
  }

  /* Modal overlay */
  .shepherd-modal-overlay {
    background: rgba(0, 0, 0, 0.5);
    opacity: 0.5;
    pointer-events: auto !important;
  }

  /* Animation */
  @keyframes shepherd-scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .shepherd-element {
    animation: shepherd-scale-in 0.3s ease-out;
  }

  /* Footer styles */
  .shepherd-footer {
    padding: 12px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    pointer-events: auto !important;
  }

  /* Header styles */
  .shepherd-header {
    pointer-events: auto !important;
  }

  /* Ensure all interactive elements are clickable */
  .shepherd-content {
    pointer-events: auto !important;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('monthly-payroll-tour-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'monthly-payroll-tour-styles';
    styleSheet.textContent = monthlyPayrollTourStyles;
    document.head.appendChild(styleSheet);
  }
}
