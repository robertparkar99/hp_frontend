/**
 * Employee Directory Tour Steps
 * Uses Shepherd.js for guided onboarding
 */

export const employeeDirectoryTourSteps = [
  // Step 1: Welcome / Header
  {
    id: 'employee-directory-welcome',
    attachTo: { element: '#employee-directory-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Welcome to Employee Directory',
    text: ['This section allows you to search, filter, and manage your organization\'s workforce information efficiently. You can view employee details, assign tasks, and export data.']
  },

  // Step 2: Add Employee Button
  {
    id: 'add-employee-btn',
    attachTo: { element: '#add-employee-btn', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Add New Employee',
    text: ['Click here to add a new employee to your organization. You can fill in employee details, assign departments, roles, and set up initial credentials.']
  },

  // Step 3: Search Bar
  {
    id: 'search-bar',
    attachTo: { element: '#search-input', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Search Employees',
    text: ['Use this search bar to quickly find employees by name, department, job role, email, or skills. The results update in real-time as you type.']
  },

  // Step 4: Filters Button
  {
    id: 'filters-button',
    attachTo: { element: '#filters-button', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Advanced Filters',
    text: ['Click here to expand advanced filtering options. You can filter employees by department, role, status, and more.']
  },

  // Step 5: Export Button
  {
    id: 'export-button',
    attachTo: { element: '#export-button', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Export Data',
    text: ['Export employee data to various formats for reporting and documentation purposes.']
  },

  // Step 6: View Mode Toggle - Table
  {
    id: 'view-mode-toggle',
    attachTo: { element: '#view-mode-toggle-container', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'View Mode Toggle',
    text: ['Switch between Table View (detailed spreadsheet-like display) and Card View (visual tile-based display) using these buttons.']
  },

  // Step 7: Employee Table
  {
    id: 'employee-table-section',
    attachTo: { element: '#employee-table-section', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Employee Table',
    text: ['View all employees in a tabular format. Each row shows employee details including name, mobile, department, role, and status. Click column headers to sort and use input fields to filter by column.']
  },

  // Step 8: Table Actions Menu
  {
    id: 'table-actions-menu',
    attachTo: { element: '.table-actions-menu-first', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        // Dispatch event to open the actions menu
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('tour:showActions', { detail: {} }));
          resolve();
        }, 500);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Employee Actions',
    text: ['Click on "Edit Employee" or "Assign Task" buttons in the dropdown menu to navigate to those pages. The tour will continue on the respective page.']
  },

  // Step 9: Stats Sidebar - Overview
  {
    id: 'stats-sidebar-overview',
    attachTo: { element: '#stats-sidebar-overview', on: 'auto' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: true,
    cancelIcon: { enabled: true },
    title: 'Quick Statistics',
    text: ['View quick statistics about your workforce including active count and inactive count at a glance.']
  },

  // Step 10: Completion
  {
    id: 'tour-complete',
    attachTo: { element: '#employee-directory-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Tour Complete!',
    text: ['You have completed the Employee Directory tour. You can now efficiently manage your organization\'s workforce. Click Finish to close this tour.']
  }
];

export default employeeDirectoryTourSteps;
