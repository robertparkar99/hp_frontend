import Shepherd, { StepOptions, Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration for Leave Allocation page
export const leaveAllocationTourSteps: StepOptions[] = [
  {
    id: 'leave-allocation-welcome',
    title: 'Welcome to Leave Allocation Management!',
    text: 'This page allows you to manage leave allocations for departments and employees. Let me show you around.',
    attachTo: { element: '#tour-header', on: 'bottom' },
    buttons: [
      {
        text: 'Skip Tour',
        action: function(this: Tour) { this.cancel(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Start Tour',
        action: function(this: Tour) { this.next(); }
      }
    ]
  },
  {
    id: 'leave-allocation-type-toggle',
    title: '🔄 Allocation Type Toggle',
    text: 'Switch between Department-Wise and Employee-Wise leave allocation using these toggle switches.',
    attachTo: { element: '#tour-allocation-type-toggle', on: 'bottom' },
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
    id: 'leave-allocation-department-wise',
    title: '🏢 Department-Wise Allocation',
    text: 'Department-Wise allocation allows you to allocate leave days to entire departments at once. All employees in the department receive the same leave days.',
    attachTo: { element: '#tour-department-wise', on: 'bottom' },
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
    id: 'leave-allocation-employee-wise',
    title: '👤 Employee-Wise Allocation',
    text: 'Employee-Wise allocation allows you to allocate leave days to individual employees. This is useful for custom leave assignments.',
    attachTo: { element: '#tour-employee-wise', on: 'bottom' },
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
    id: 'leave-allocation-add-button',
    title: '➕ Add Leave Allocation',
    text: 'Click this button to open the leave allocation form. For department-wise, it creates allocations for entire departments. For employee-wise, it allocates to individual employees.',
    attachTo: { element: '#tour-add-leave-allocation', on: 'bottom' },
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
    id: 'leave-allocation-form',
    title: '📝 Leave Allocation Form',
    text: 'This form allows you to create leave allocations. Select the department/employee, leave type, year, and number of days.',
    attachTo: { element: '#tour-leave-allocation-form', on: 'top' },
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
    id: 'leave-allocation-department-select',
    title: '🏢 Department Selection',
    text: 'Select the department for which you want to allocate leave days. This dropdown contains all available departments.',
    attachTo: { element: '#tour-dept-department', on: 'bottom' },
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
    id: 'leave-allocation-employee-select',
    title: '👤 Employee Selection',
    text: 'Select the individual employee for whom you want to allocate leave days. This dropdown contains all employees.',
    attachTo: { element: '#tour-emp-employee', on: 'bottom' },
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
    id: 'leave-allocation-leave-type',
    title: '📋 Leave Type Selection',
    text: 'Select the type of leave you want to allocate. Options include Annual Leave, Sick Leave, Emergency Leave, Maternity Leave, etc.',
    attachTo: { element: '#tour-leave-type-select', on: 'bottom' },
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
    id: 'leave-allocation-year',
    title: '📅 Year Selection',
    text: 'Enter the year for which this leave allocation is valid. This helps track leave allocations across different years.',
    attachTo: { element: '#tour-year-input', on: 'bottom' },
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
    id: 'leave-allocation-days',
    title: '🔢 Number of Days',
    text: 'Enter the number of leave days to allocate. This can be partial days or full days depending on your organization policy.',
    attachTo: { element: '#tour-days-input', on: 'bottom' },
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
    id: 'leave-allocation-save',
    title: '💾 Save Allocation',
    text: 'Click this button to save the leave allocation. The allocation will be added to the table below.',
    attachTo: { element: '#tour-save-allocation', on: 'top' },
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
    id: 'leave-allocation-cancel',
    title: '❌ Cancel Button',
    text: 'Click Cancel to close the form without saving any changes.',
    attachTo: { element: '#tour-cancel-allocation', on: 'top' },
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
    id: 'leave-allocation-table',
    title: '📊 Allocations Table',
    text: 'This table displays all leave allocations. You can view, search, filter, and manage allocations here.',
    attachTo: { element: '#tour-allocations-table', on: 'top' },
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
    id: 'leave-allocation-srno',
    title: '🔢 Serial Number',
    text: 'This column shows the serial number of each allocation entry. Use the search input to filter by entry number.',
    attachTo: { element: '#tour-srno-column', on: 'bottom' },
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
    id: 'leave-allocation-dept-column',
    title: '🏢 Department Column',
    text: 'This column displays the department for each allocation. Use the search input to filter by department name.',
    attachTo: { element: '#tour-department-column', on: 'bottom' },
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
    id: 'leave-allocation-employee-column',
    title: '👤 Employee Column',
    text: 'This column shows the employee name for individual allocations. Use the search input to filter by employee name.',
    attachTo: { element: '#tour-employee-column', on: 'bottom' },
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
    id: 'leave-allocation-leavetype-column',
    title: '📋 Leave Type Column',
    text: 'This column displays the type of leave allocated. Use the search input to filter by leave type.',
    attachTo: { element: '#tour-leavetype-column', on: 'bottom' },
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
    id: 'leave-allocation-year-column',
    title: '📅 Year Column',
    text: 'This column shows the year for which the leave is allocated. Use the search input to filter by year.',
    attachTo: { element: '#tour-year-column', on: 'bottom' },
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
    id: 'leave-allocation-days-column',
    title: '🔢 Days Allocated Column',
    text: 'This column displays the number of days allocated. Use the search input to filter by number of days.',
    attachTo: { element: '#tour-days-column', on: 'bottom' },
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
    id: 'leave-allocation-status',
    title: '🔘 Status Column',
    text: 'This column shows the status (Active/Inactive) of each allocation. Use the search input to filter by status.',
    attachTo: { element: '#tour-status-column', on: 'bottom' },
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
    id: 'leave-allocation-actions',
    title: '⚡ Actions Column',
    text: 'Use the action buttons to Edit or Delete an allocation. Edit modifies existing details, while Delete removes the allocation.',
    attachTo: { element: '#tour-actions-column', on: 'left' },
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
    id: 'leave-allocation-pagination',
    title: '📄 Pagination',
    text: 'Use these controls to navigate through multiple pages of allocations. You can also change the number of rows per page.',
    attachTo: { element: '#tour-pagination', on: 'top' },
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
    id: 'leave-allocation-complete',
    title: '🎉 Tour Complete!',
    text: 'Congratulations! You now know how to manage leave allocations. Click Finish to close this tour.',
    attachTo: { element: '#tour-add-leave-allocation', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: function(this: Tour) { this.back(); },
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish Tour',
        action: function(this: Tour) {
          // Mark tour as completed in sessionStorage
          sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
          sessionStorage.removeItem('triggerPageTour');
          this.complete();
        }
      }
    ]
  }
];

// Function to check if tour should start
export const shouldStartLeaveAllocationTour = (): boolean => {
  // Check if tour was triggered by sidebar navigation
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const isLeaveAllocationTrigger = triggerValue === 'leave-allocation' || triggerValue === 'true';
  
  // Check if tour was already completed in this session
  const isTourCompleted = sessionStorage.getItem('leaveAllocationTourCompleted') === 'true';
  
  // Return true only if triggered and not completed
  return isLeaveAllocationTrigger && !isTourCompleted;
};

// Function to create and start the tour
export const startLeaveAllocationTour = (): void => {
  // Check if tour was already completed in this session
  if (sessionStorage.getItem('leaveAllocationTourCompleted') === 'true') {
    console.log('Leave Allocation tour already completed in this session');
    sessionStorage.removeItem('triggerPageTour');
    return;
  }

  // Check if tour was triggered by sidebar navigation
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  if (triggerValue !== 'leave-allocation' && triggerValue !== 'true') {
    console.log('Leave Allocation tour not triggered by sidebar, skipping...');
    return;
  }

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom leave-allocation-tour',
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

  // Add all steps to the tour
  leaveAllocationTourSteps.forEach(step => {
    tour.addStep(step);
  });

  // Handle tour completion
  tour.on('complete', () => {
    sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Allocation tour completed');
  });

  // Handle tour cancellation
  tour.on('cancel', () => {
    sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Allocation tour cancelled');
  });

  // Start the tour after a short delay to ensure DOM is ready
  setTimeout(() => {
    tour.start();
  }, 500);
};

// Export tour styles
export const leaveAllocationTourStyles = `
  .shepherd-theme-custom.leave-allocation-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title.leave-allocation-tour .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-element.highlighted {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = leaveAllocationTourStyles;
  styleSheet.id = 'leave-allocation-tour-styles';
  // Check if styles already exist
  if (!document.getElementById('leave-allocation-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
