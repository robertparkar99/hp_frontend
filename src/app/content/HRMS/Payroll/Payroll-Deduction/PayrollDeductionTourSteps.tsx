import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export interface PayrollDeductionTourStep {
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

export const PayrollDeductionTourSteps: PayrollDeductionTourStep[] = [
  {
    id: 'payroll-deduction-welcome',
    title: 'Welcome to Payroll Deduction Management!',
    text: 'This page allows you to manage payroll deductions for allowances and deductions. Let me guide you through all the features.',
    attachTo: {
      element: '#payroll-deduction-title',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip Tour',
        action: (tour: Tour) => tour.cancel(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: (tour: Tour) => tour.next()
      }
    ]
  },
  {
    id: 'payroll-deduction-deduction-type',
    title: 'Deduction Type Selection',
    text: 'Choose between "Allowance" or "Deduction" type. This determines which payroll type you will be working with.',
    attachTo: {
      element: '#deduction-type-select',
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
    id: 'payroll-deduction-payroll-name',
    title: 'Payroll Name',
    text: 'Select the specific payroll name from the dropdown. The available options depend on the deduction type you selected.',
    attachTo: {
      element: '#payroll-name-select',
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
    id: 'payroll-deduction-month',
    title: 'Month Selection',
    text: 'Choose the month for which you want to manage payroll deductions.',
    attachTo: {
      element: '#month-select',
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
    id: 'payroll-deduction-year',
    title: 'Year Selection',
    text: 'Select the year for the payroll deductions you want to manage.',
    attachTo: {
      element: '#year-select',
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
    id: 'payroll-deduction-search',
    title: 'Search Button',
    text: 'Click the Search button to fetch employee data based on your selected filters. The table will display all eligible employees.',
    attachTo: {
      element: '#search-button',
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
    id: 'payroll-deduction-datatable',
    title: 'Employee Data Table',
    text: 'This table displays all employees with their details. You can filter by any column using the search inputs in each column header. The table also supports sorting.',
    attachTo: {
      element: '.rdt_Table',
      on: 'top'
    },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
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
    id: 'payroll-deduction-amount-field',
    title: 'Amount Input Field',
    text: 'Enter or modify the deduction/allowance amount for each employee in this field. Changes are saved locally until you submit.',
    attachTo: {
      element: 'input[type="number"]',
      on: 'bottom'
    },
    advanceOn: {
      selector: 'input[type="number"]',
      event: 'focus'
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
    id: 'payroll-deduction-submit',
    title: 'Submit Data',
    text: 'Click Submit Data to save all entered amounts to the system. This will permanently save the payroll deduction records.',
    attachTo: {
      element: '#submit-button',
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
    id: 'payroll-deduction-export-print',
    title: 'Print Functionality',
    text: 'Use the Print button to print the current table data. This is useful for generating hard copies of the payroll deduction records.',
    attachTo: {
      element: '#export-print',
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
    id: 'payroll-deduction-export-pdf',
    title: 'Export to PDF',
    text: 'Click the PDF button to export the current data to a PDF file. The exported file includes all employee details and amounts.',
    attachTo: {
      element: '#export-pdf',
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
    id: 'payroll-deduction-export-excel',
    title: 'Export to Excel',
    text: 'Use the Excel button to export data to an Excel spreadsheet. This format is ideal for further analysis or sharing with other systems.',
    attachTo: {
      element: '#export-excel',
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
        action: (tour: Tour) => tour.complete()
      }
    ]
  }
];

export class PayrollDeductionTour {
  private tour!: Tour;

  public startTour(): void {
    if (sessionStorage.getItem('payrollDeductionTourCompleted') === 'true') return;

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' }
      },
      useModalOverlay: true,
      exitOnEsc: true
    });

    PayrollDeductionTourSteps.forEach(step => {
      this.tour.addStep({
        ...step,
        buttons: step.buttons?.map(btn => ({
          text: btn.text,
          classes: btn.classes,
          action: () => {
            if (btn.text === 'Next') this.tour.next();
            if (btn.text === 'Previous') this.tour.back();
            if (btn.text === 'Skip Tour') this.tour.cancel();
            if (btn.text === 'Finish Tour') this.tour.complete();
          }
        }))
      });
    });

    this.tour.on('complete', () => {
      sessionStorage.setItem('payrollDeductionTourCompleted', 'true');
    });

    this.tour.on('cancel', () => {
      sessionStorage.setItem('payrollDeductionTourCompleted', 'true');
    });

    this.tour.start();
  }
}


// Export tour styles
export const PayrollDeductionTourStyles = `
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
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = PayrollDeductionTourStyles;
  document.head.appendChild(styleSheet);
}
