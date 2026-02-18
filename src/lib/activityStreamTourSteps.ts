/**
 * Activity Stream Tour Steps
 * Uses Shepherd.js for guided onboarding
 */

import { StepOptionsAttachTo } from 'shepherd.js';

interface TourStepAttachTo extends StepOptionsAttachTo {
  on: 'top' | 'bottom' | 'left' | 'right';
}

interface TourStep {
  id: string;
  title: string;
  text: string;
  attachTo: TourStepAttachTo;
  buttons: {
    text: string;
    action: string;
  }[];
}

export const activityStreamTourSteps: TourStep[] = [
  // Step 1: Welcome / Header
  {
    id: 'welcome',
    title: 'Welcome to Task Activity Stream',
    text: 'Welcome to the Task Activity Stream! This page helps you track and manage tasks across your team.',
    attachTo: {
      element: '#tour-header',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 2: Stats - Total
  {
    id: 'stats-total',
    title: 'Total Tasks',
    text: 'Total Tasks - Shows the total number of tasks assigned to you.',
    attachTo: {
      element: '#tour-stats-total',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 3: Stats - Pending
  {
    id: 'stats-pending',
    title: 'Pending Tasks',
    text: 'Pending - Shows tasks that are waiting to be started.',
    attachTo: {
      element: '#tour-stats-pending',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 4: Stats - Completed
  {
    id: 'stats-completed',
    title: 'Completed Tasks',
    text: 'Completed - Shows tasks that have been finished.',
    attachTo: {
      element: '#tour-stats-completed',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 5: Stats - In Progress
  {
    id: 'stats-inprogress',
    title: 'In Progress Tasks',
    text: 'In Progress - Shows tasks that are currently being worked on.',
    attachTo: {
      element: '#tour-stats-inprogress',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 6: Filter - Search
  {
    id: 'filter-search',
    title: 'Filter Tasks',
    text: 'Search - Type here to find tasks by title or description.',
    attachTo: {
      element: '#tour-filter-search',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 7: Filter - Status
  {
    id: 'filter-status',
    title: 'Filter Tasks by Status',
    text: 'Status Filter - Select a status to filter tasks (All, PENDING, IN-PROGRESS, COMPLETED).',
    attachTo: {
      element: '#tour-filter-status',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 8: Tab - Today
  {
    id: 'tab-today',
    title: 'Today Task Views',
    text: 'Today Tab - Click here to view tasks that are due today.',
    attachTo: {
      element: '#tour-tab-today',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 9: Tab - Upcoming
  {
    id: 'tab-upcoming',
    title: 'Upcoming Task Views',
    text: 'Upcoming Tab - Click here to view tasks scheduled for this week.',
    attachTo: {
      element: '#tour-tab-upcoming',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 10: Tab - Recent
  {
    id: 'tab-recent',
    title: 'Recent Task Views',
    text: 'Recent Tab - Click here to view tasks that have been updated recently.',
    attachTo: {
      element: '#tour-tab-recent',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 11: Task Card
  {
    id: 'task-card',
    title: 'Task Details',
    text: 'Task Card - Each card shows task details. Click "Reply & Update" to respond and change status.',
    attachTo: {
      element: '.space-y-4 .rounded-xl',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Next',
        action: 'next'
      }
    ]
  },

  // Step 12: Reply & Update
  {
    id: 'task-reply',
    title: 'Reply & Update',
    text: 'Reply & Update - Add a message and select new status, then click "Send Reply" to save.',
    attachTo: {
      element: '.bg-gray-50.border-t',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: 'back'
      },
      {
        text: 'Finish',
        action: 'finish'
      }
    ]
  }
];

// Custom CSS for enhanced tour experience
export const tourStyles = `
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
        background: #007BE5 !important;
    }

    .shepherd-theme-custom .shepherd-button-secondary:hover {
        background: #0056b3 !important;
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

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;

export default activityStreamTourSteps;
