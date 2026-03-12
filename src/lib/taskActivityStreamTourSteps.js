/**
 * Task Activity Stream Tour Steps
 * Uses Shepherd.js for guided onboarding
 */

export const taskActivityStreamTourSteps = [
  // Step 1: Welcome / Header
  {
    id: 'task-activity-header',
    attachTo: { element: '#task-activity-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Welcome to Task Activity Stream',
    text: ['This section allows you to manage and track task progress across your team. You can view tasks, update statuses, and monitor team performance.']
  },

  // Step 2: Stats Cards
  {
    id: 'task-stats-cards',
    attachTo: { element: '#task-stats-cards', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Quick Statistics',
    text: ['View quick statistics about your tasks including total tasks, completed count, in-progress tasks, and overdue items at a glance.']
  },

  // Step 3: Filters Section
  {
    id: 'task-filters-section',
    attachTo: { element: '#task-filters-section', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Filters',
    text: ['Use these filters to narrow down tasks. You can search by title or description, filter by status, and select specific employees.']
  },

  // Step 4: Search Input
  {
    id: 'task-search-input',
    attachTo: { element: '#task-search-input', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Search Tasks',
    text: ['Search for tasks by title or description. The results update in real-time as you type.']
  },

  // Step 5: Status Filter
  {
    id: 'task-status-filter',
    attachTo: { element: '#task-status-filter', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Filter by Status',
    text: ['Filter tasks by their current status: Pending, In Progress, Completed, or Overdue.']
  },

  // Step 6: Employee Filter
  {
    id: 'task-employee-filter',
    attachTo: { element: '#task-employee-filter', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Filter by Employee',
    text: ['Select a specific employee to view only their assigned tasks. Select "All Employees" to see all tasks.']
  },

  // Step 7: Task Tabs
  {
    id: 'task-tabs',
    attachTo: { element: '#task-tabs', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Task Tabs',
    text: ['Switch between Today, Upcoming, and Recent tabs to view tasks based on their due dates and update times.']
  },

  // Step 8: Today Tab
  {
    id: 'tab-today',
    attachTo: { element: '#tab-today', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Today\'s Tasks',
    text: ['View all tasks due today. Click on a task to see details and update its status.']
  },

  // Step 9: Upcoming Tab
  {
    id: 'tab-upcoming',
    attachTo: { element: '#tab-upcoming', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Upcoming Tasks',
    text: ['View tasks scheduled for this week. Plan ahead and prioritize your work.']
  },

  // Step 10: Recent Tab
  {
    id: 'tab-recent',
    attachTo: { element: '#tab-recent', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Recent Activity',
    text: ['View tasks that have been updated in the last 7 days. Track recent changes and activity.']
  },

  // Step 11: Team Overview Sidebar
  {
    id: 'team-overview-sidebar',
    attachTo: { element: '#team-overview-sidebar', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Team Overview',
    text: ['View your team members and their task statistics including completed, in-progress, and pending tasks.']
  },

  // Step 12: Completion
  {
    id: 'task-tour-complete',
    attachTo: { element: '#task-activity-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Tour Complete!',
    text: ['You have completed the Task Activity Stream tour. You can now efficiently manage and track tasks across your team. Click Finish to close this tour.']
  }
];

export default taskActivityStreamTourSteps;
