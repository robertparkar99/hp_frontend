import Shepherd, { StepOptions, Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration for My Leave page
export const myLeaveTourSteps: StepOptions[] = [
  {
    id: 'my-leave-welcome',
    title: 'Welcome to My Leave Page!',
    text: 'This page allows you to view and manage your leave requests. Let me show you around.',
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
    id: 'my-leave-filter',
    title: '📅 Year Filter',
    text: 'Use this dropdown to filter your leave records by academic year. Select different years to view your leave history.',
    attachTo: { element: '#tour-year-filter', on: 'bottom' },
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
    id: 'my-leave-history',
    title: '📋 Leave History',
    text: 'This section displays all your leave requests. Each card shows the leave type, status, duration, and other details.',
    attachTo: { element: '#tour-leave-history', on: 'top' },
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
    id: 'my-leave-card',
    title: '📄 Leave Card',
    text: 'Each leave card shows: Leave Type (e.g., Sick Leave, Casual Leave), Status (Approved/Pending/Rejected), Duration in days, Applied date, and Leave period.',
    attachTo: { element: '#tour-leave-card', on: 'top' },
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
    id: 'my-leave-view-details',
    title: '👁️ View Details',
    text: 'Click this button to see complete details of the leave request including the reason, approved by, and full date range.',
    attachTo: { element: '#tour-view-details', on: 'left' },
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
    id: 'my-leave-status',
    title: '🏷️ Leave Status',
    text: 'The status badge shows the current state of your leave request: Green (Approved), Yellow (Pending), or Red (Rejected).',
    attachTo: { element: '#tour-leave-status', on: 'left' },
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
    id: 'my-leave-complete',
    title: '🎉 Tour Complete!',
    text: 'You now know how to use the My Leave page! To apply for a new leave, click the "New" button in the sidebar and select "Apply Leave".',
    attachTo: { element: '#tour-sidebar-new', on: 'right' },
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
          sessionStorage.setItem('myLeaveTourCompleted', 'true');
          sessionStorage.removeItem('triggerPageTour');
          this.complete();
        }
      }
    ]
  }
];

// Function to create and start the tour
export const startMyLeaveTour = (): void => {
  // Check if tour was already completed in this session
  if (sessionStorage.getItem('myLeaveTourCompleted') === 'true') {
    console.log('My Leave tour already completed in this session');
    sessionStorage.removeItem('triggerPageTour');
    return;
  }

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom my-leave-tour',
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
  myLeaveTourSteps.forEach(step => {
    tour.addStep(step);
  });

  // Handle tour completion
  tour.on('complete', () => {
    sessionStorage.setItem('myLeaveTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('My Leave tour completed');
  });

  // Handle tour cancellation
  tour.on('cancel', () => {
    sessionStorage.setItem('myLeaveTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('My Leave tour cancelled');
  });

  // Start the tour after a short delay to ensure DOM is ready
  setTimeout(() => {
    tour.start();
  }, 500);
};

// Export tour styles
export const myLeaveTourStyles = `
  .shepherd-theme-custom.my-leave-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title.my-leave-tour .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-element.highlighted {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = myLeaveTourStyles;
  styleSheet.id = 'my-leave-tour-styles';
  // Check if styles already exist
  if (!document.getElementById('my-leave-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
