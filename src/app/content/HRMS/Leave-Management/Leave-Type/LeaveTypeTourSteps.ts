import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Custom interface for tour steps (extends Shepherd options with id)
export interface LeaveTypeTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: any;
    classes?: string;
  }>;
  beforeShowPromise?: () => Promise<void>;
  when?: {
    show?: () => void;
    hide?: () => void;
  };
}

// Tour step configuration for Leave Type page
export const leaveTypeTourSteps: LeaveTypeTourStep[] = [
  {
    id: 'leave-type-welcome',
    title: 'Welcome to Leave Types Management!',
    text: 'This page allows you to manage all leave types for your organization. Let me show you around.',
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
    id: 'leave-type-add-button',
    title: '➕ Add Leave Type',
    text: 'Click this button to open the leave type creation form. You can add new leave types like Annual Leave, Sick Leave, Casual Leave, etc.',
    attachTo: { element: '#tour-add-leave-type', on: 'bottom' },
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
    id: 'leave-type-form',
    title: '📝 Leave Type Form',
    text: 'This form allows you to create or edit leave types. Fill in the Leave Type ID, Name, Sort Order, and Status.',
    attachTo: { element: '#tour-leave-type-form', on: 'top' },
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
    id: 'leave-type-id',
    title: '🏷️ Leave Type ID',
    text: 'Enter a unique identifier for this leave type (e.g., LTY001, EL for Earned Leave). This helps in organizing leave types.',
    attachTo: { element: '#tour-leave-type-id', on: 'bottom' },
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
    id: 'leave-type-name',
    title: '📋 Leave Type Name',
    text: 'Enter the display name for this leave type (e.g., Annual Leave, Sick Leave, Casual Leave, Maternity Leave).',
    attachTo: { element: '#tour-leave-type-name', on: 'bottom' },
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
    id: 'leave-type-sort-order',
    title: '🔢 Sort Order',
    text: 'Enter a number to determine the display order of this leave type in lists. Lower numbers appear first.',
    attachTo: { element: '#tour-leave-type-sort-order', on: 'bottom' },
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
    id: 'leave-type-status',
    title: '🔘 Status',
    text: 'Set the status as Active or Inactive. Inactive leave types will not be available for leave requests.',
    attachTo: { element: '#tour-leave-type-status', on: 'bottom' },
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
    id: 'leave-type-submit',
    title: '💾 Submit Button',
    text: 'Click Submit to save the new leave type, or Update if you are editing an existing leave type.',
    attachTo: { element: '#tour-leave-type-submit', on: 'top' },
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
    id: 'leave-type-cancel',
    title: '❌ Cancel Button',
    text: 'Click Cancel to close the form without saving any changes.',
    attachTo: { element: '#tour-leave-type-cancel', on: 'top' },
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
    id: 'leave-type-table',
    title: '📊 Leave Types Table',
    text: 'This table displays all your leave types. You can search, filter, and view details of each leave type here.',
    attachTo: { element: '#tour-leave-type-table', on: 'top' },
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
    id: 'leave-type-search',
    title: '🔍 Search Filters',
    text: 'Use the input fields in each column header to search and filter leave types by ID, Name, Sort Order, or Status.',
    attachTo: { element: '#tour-leave-type-table', on: 'top' },
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
    id: 'leave-type-srno',
    title: '🔢 Sr No.',
    text: 'This column shows the serial number of each leave type entry. You can sort leave types by their order here.',
    attachTo: { element: '#tour-leave-type-srno', on: 'bottom' },
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
    id: 'leave-type-id-column',
    title: '🏷️ Leave Type ID Column',
    text: 'This column displays the unique identifier for each leave type. Use the search input to filter by Leave Type ID.',
    attachTo: { element: '#tour-leave-type-id-column', on: 'bottom' },
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
    id: 'leave-type-name-column',
    title: '📋 Leave Type Name Column',
    text: 'This column shows the display name of each leave type. You can search and filter by leave type name here.',
    attachTo: { element: '#tour-leave-type-name-column', on: 'bottom' },
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
    id: 'leave-type-sort-column',
    title: '🔢 Sort Order Column',
    text: 'This column displays the sort order number for each leave type. Use the search input to filter by sort order.',
    attachTo: { element: '#tour-leave-type-sort-column', on: 'bottom' },
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
    id: 'leave-type-status-column',
    title: '🔘 Status Column',
    text: 'This column shows the status (Active/Inactive) of each leave type. Use the search input to filter by status.',
    attachTo: { element: '#tour-leave-type-status-column', on: 'bottom' },
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
    id: 'leave-type-actions',
    title: '⚡ Actions',
    text: 'Use the action buttons to Edit or Delete a leave type. Edit modifies existing details, while Delete removes the leave type.',
    attachTo: { element: '#tour-leave-type-actions', on: 'left' },
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
    id: 'leave-type-pagination',
    title: '📄 Pagination',
    text: 'Use these controls to navigate through multiple pages of leave types. You can also change the number of rows per page.',
    attachTo: { element: '#tour-leave-type-table', on: 'bottom' },
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
    id: 'leave-type-complete',
    title: '🎉 Tour Complete!',
    text: 'Congratulations! You now know how to manage leave types. Click Finish to close this tour.',
    attachTo: { element: '#tour-add-leave-type', on: 'bottom' },
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
          sessionStorage.setItem('leaveTypeTourCompleted', 'true');
          sessionStorage.removeItem('triggerPageTour');
          this.complete();
        }
      }
    ]
  }
];

// Function to create and start the tour
export const startLeaveTypeTour = (): void => {
  // Check if tour was already completed in this session
  if (sessionStorage.getItem('leaveTypeTourCompleted') === 'true') {
    console.log('Leave Type tour already completed in this session');
    sessionStorage.removeItem('triggerPageTour');
    return;
  }

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom leave-type-tour',
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
  leaveTypeTourSteps.forEach(step => {
    tour.addStep(step);
  });

  // Handle tour completion
  tour.on('complete', () => {
    sessionStorage.setItem('leaveTypeTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Type tour completed');
  });

  // Handle tour cancellation
  tour.on('cancel', () => {
    sessionStorage.setItem('leaveTypeTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Type tour cancelled');
  });

  // Start the tour after a short delay to ensure DOM is ready
  setTimeout(() => {
    tour.start();
  }, 500);
};

// Export tour styles
export const leaveTypeTourStyles = `
  .shepherd-theme-custom.leave-type-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title.leave-type-tour .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-element.highlighted {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = leaveTypeTourStyles;
  styleSheet.id = 'leave-type-tour-styles';
  // Check if styles already exist
  if (!document.getElementById('leave-type-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
