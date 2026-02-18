import Shepherd, { Tour, Step } from 'shepherd.js';
import type { StepOptions } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration for Salary Structure page
export const salaryStructureTourSteps: StepOptions[] = [
  {
    id: 'welcome',
    title: 'Welcome to Salary Structure Management',
    text: 'This page allows you to manage employee salary structures. Let\'s explore the features together.',
    attachTo: { element: '#salary-structure-header', on: 'bottom' },
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
    id: 'header-section',
    title: 'Salary Structure Header',
    text: 'This is the main header for the Salary Structure Management section. All salary-related operations are performed from this page.',
    attachTo: { element: '#salary-structure-header', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'department-selector',
    title: 'Select Department',
    text: 'Choose one or more departments to filter employees. The selection will affect which employees\' salary structures you can view and edit.',
    attachTo: { element: '#department-selector', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'employee-status',
    title: 'Employee Status',
    text: 'Filter employees by their status: Active, Inactive, or view All employees. This helps you manage salary structures for different employee groups.',
    attachTo: { element: '#employee-status', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'search-button',
    title: 'Search Button',
    text: 'Click this button to fetch and display employee salary data based on your selected filters (department and status).',
    attachTo: { element: '#search-button', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'export-buttons',
    title: 'Export Options',
    text: 'Export your salary structure data in various formats: Print, PDF, Excel, or CSV. Choose the format that best suits your reporting needs.',
    attachTo: { element: '#export-buttons', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'data-table',
    title: 'Salary Structure Data Table',
    text: 'This table displays all employee salary information. You can search within columns, sort data, and edit salary values directly. Use the input fields in each column header to filter data.',
    attachTo: { element: '#salary-data-table', on: 'top' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'column-srno',
    title: 'Sr No. Column',
    text: 'This column shows the serial number for each row. You can search or filter by serial number using the input field in the header.',
    attachTo: { element: '#column-srno', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'column-empno',
    title: 'Employee No. Column',
    text: 'This column displays the employee number for each employee. Use the search input to filter by employee number.',
    attachTo: { element: '#column-empno', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'column-empname',
    title: 'Employee Name Column',
    text: 'This column shows the full name of each employee. You can search or filter by employee name using the input field.',
    attachTo: { element: '#column-empname', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'column-department',
    title: 'Department Column',
    text: 'This column displays the department each employee belongs to. Filter by department to find employees in specific departments.',
    attachTo: { element: '#column-department', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'column-gender',
    title: 'Gender Column',
    text: 'This column shows the gender of each employee (M for Male, F for Female). Use the search input to filter by gender.',
    attachTo: { element: '#column-gender', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'column-status',
    title: 'Status Column',
    text: 'This column shows whether the employee is Active or Inactive. Use the search input to filter employees by their status.',
    attachTo: { element: '#column-status', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'payroll-columns-general',
    title: 'Payroll Component Columns',
    text: 'These columns represent different payroll components (Basic, DA, HRA, Allowances, etc.). Each column header shows the component name and type: +1 indicates addition, -1 indicates deduction. Click on any cell to edit the salary value.',
    attachTo: { element: '#salary-data-table', on: 'top' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'column-gross-total',
    title: 'Gross Total Column',
    text: 'This column shows the gross total salary for each employee, calculated automatically by adding all positive payroll components and subtracting deductions. Click to view but do not edit - this is auto-calculated.',
    attachTo: { element: '#column-gross-total', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'submit-button',
    title: 'Submit Salary Structure',
    text: 'After making changes to salary values, click this button to save the salary structures. Changes will be persisted to the database.',
    attachTo: { element: '#submit-button', on: 'top' },
    buttons: [
      {
        text: 'Previous',
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
    id: 'tour-complete',
    title: 'Tour Complete!',
    text: 'Congratulations! You now know how to use the Salary Structure Management page. You can filter employees, edit salary values, and export data as needed.',
    attachTo: { element: '#salary-structure-header', on: 'bottom' },
    buttons: [
      {
        text: 'Restart Tour',
        action: function(this: Tour) {
          localStorage.removeItem('salaryStructureTourCompleted');
          this.cancel();
        },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish',
        action: function(this: Tour) {
          localStorage.setItem('salaryStructureTourCompleted', 'true');
          this.complete();
        }
      }
    ]
  }
];

// Create and return the tour instance
export const createSalaryStructureTour = (): Tour => {
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

  // Add steps to the tour
  salaryStructureTourSteps.forEach((step: StepOptions) => {
    tour.addStep(step);
  });

  return tour;
};

// Tour styles
export const salaryStructureTourStyles = `
  .shepherd-theme-custom.salary-structure-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = salaryStructureTourStyles;
  styleSheet.id = 'salary-structure-tour-styles';
  // Only add if not already added
  if (!document.getElementById('salary-structure-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
