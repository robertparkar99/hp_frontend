import Shepherd, { Tour, Step as ShepherdStep } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Define step options with title support
interface PayrollTypeTourStep {
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
  advanceOn?: {
    selector: string;
    event: string;
  };
  when?: {
    show?: () => void;
    hide?: () => void;
  };
  beforeShowPromise?: () => Promise<void>;
}

// Tour steps configuration for Payroll Types page
export const payrollTypesTourSteps: PayrollTypeTourStep[] = [
  {
    id: 'payroll-types-header',
    title: '👋 Welcome to Payroll Types',
    text: 'This page allows you to manage payroll components like earnings and deductions. Let\'s explore the features together!',
    attachTo: { element: '#payroll-types-header', on: 'bottom' },
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
    id: 'add-payroll-type-btn',
    title: '➕ Add Payroll Type',
    text: 'Click here to add a new payroll type. You can create earning components (like basic salary, HRA, etc.) or deduction components (like PF, TDS, etc.).',
    attachTo: { element: '#add-payroll-type-btn', on: 'bottom' },
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
    id: 'summary-cards',
    title: '📊 Summary Cards',
    text: 'These cards show quick statistics:\n• Total Types: All payroll components\n• Active Types: Currently active components\n• Earnings vs Deductions: Ratio of earning to deduction types',
    attachTo: { element: '#summary-cards', on: 'bottom' },
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
    id: 'search-filter',
    title: '🔍 Global Search',
    text: 'Use this search bar to find payroll types by name, type, or amount type. Results update instantly as you type.',
    attachTo: { element: '#search-filter', on: 'bottom' },
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
    id: 'payroll-types-table',
    title: '📋 Payroll Types Data Table',
    text: 'This table displays all your payroll types with all details. Use pagination at the bottom to navigate through records.',
    attachTo: { element: '#payroll-types-table', on: 'top' },
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
    id: 'table-title',
    title: '📝 Table Title',
    text: 'This shows the current count of payroll types matching your filters. Use column filters to narrow down results.',
    attachTo: { element: '#table-title', on: 'bottom' },
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
    id: 'column-filters',
    title: '🎯 Column-wise Filtering',
    text: 'Each column has its own search input. Type in any column header (Type, Name, Amount Type, etc.) to filter results for that specific field.',
    attachTo: { element: '#column-filters', on: 'top' },
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
    id: 'srno-column',
    title: '🔢 Sr.No Column',
    text: 'This shows the serial number of each record. Click column headers to sort by that field.',
    attachTo: { element: '#srno-column', on: 'top' },
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
    id: 'type-column',
    title: '📌 Type Column',
    text: 'This column shows whether the payroll component is an "Earning" (green badge) or "Deduction" (orange badge). Click the column header to sort alphabetically.',
    attachTo: { element: '#type-column', on: 'top' },
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
    id: 'name-column',
    title: '📛 Name Column',
    text: 'This shows the payroll name (e.g., Basic Salary, HRA, PF, etc.). Click header to sort alphabetically.',
    attachTo: { element: '#name-column', on: 'top' },
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
    id: 'amount-type-column',
    title: '💰 Amount Type Column',
    text: 'Shows whether the amount is "Fixed" (specific amount) or "Percentage" (percentage of salary). Click header to sort.',
    attachTo: { element: '#amount-type-column', on: 'top' },
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
    id: 'amount-percentage-column',
    title: '📈 Amount / Percentage Column',
    text: 'Displays the fixed amount or percentage value for this payroll component. Empty cells are shown as "-".',
    attachTo: { element: '#amount-percentage-column', on: 'top' },
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
    id: 'day-count-column',
    title: '📅 Day Wise Count Column',
    text: 'Indicates if this payroll type considers day-wise count. "Yes" (green) means it does, "No" (orange) means it doesn\'t.',
    attachTo: { element: '#day-count-column', on: 'top' },
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
    id: 'status-column',
    title: '✅ Status Column',
    text: 'Shows whether the payroll type is "Active" (green) or "Inactive" (red). Inactive types are not used in payroll calculations.',
    attachTo: { element: '#status-column', on: 'top' },
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
    id: 'actions-cell',
    title: '⚡ Actions Column',
    text: 'Use these buttons to:\n• Edit (blue): Modify the payroll type\n• Delete (red): Remove the payroll type\n⚠️ Deletion cannot be undone!',
    attachTo: { element: '#actions-cell', on: 'top' },
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
    id: 'pagination',
    title: '📄 Pagination',
    text: 'Navigate through multiple pages of payroll types. You can change rows per page using the dropdown.',
    attachTo: { element: '#pagination', on: 'top' },
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
    id: 'column-filters-tip',
    title: '💡 Pro Tip',
    text: 'Combine global search with column filters for precise results. Clear filters by clicking the X in each column input.',
    attachTo: { element: '#column-filters-tip', on: 'top' },
    buttons: [
      {
        text: 'Back',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish',
        action: function(this: Tour) { this.complete(); }
      }
    ]
  }
];

// Function to initialize and start the tour
export const startPayrollTypesTour = (): void => {
  // Check if tour was already completed in this session
  const tourCompleted = sessionStorage.getItem('payrollTypesTourCompleted');
  if (tourCompleted) {
    console.log('Payroll Types tour already completed, skipping...');
    return;
  }

  const tour = new Shepherd.Tour({
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

  // Add all steps to the tour
  payrollTypesTourSteps.forEach(step => {
    tour.addStep(step);
  });

  // Handle tour completion
  tour.on('complete', () => {
    sessionStorage.setItem('payrollTypesTourCompleted', 'true');
    console.log('Payroll Types tour completed!');
  });

  // Handle tour cancellation
  tour.on('cancel', () => {
    sessionStorage.setItem('payrollTypesTourCompleted', 'true');
    console.log('Payroll Types tour cancelled');
  });

  // Start the tour
  tour.start();
};

// Function to check if tour should be triggered
export const shouldStartPayrollTypesTour = (): boolean => {
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const tourCompleted = sessionStorage.getItem('payrollTypesTourCompleted');
  
  // Start tour if triggered via sidebar and not yet completed
  if (triggerValue === 'payroll-types' && !tourCompleted) {
    // Clear the trigger after reading
    sessionStorage.removeItem('triggerPageTour');
    return true;
  }
  
  return false;
};

// Function to mark tour as not completed (for testing/reset)
export const resetPayrollTypesTour = (): void => {
  sessionStorage.removeItem('payrollTypesTourCompleted');
};
