/**
 * Task Progress Assignment Tour Steps
 * Uses Shepherd.js for guided onboarding
 */

export const taskAssignmentTourSteps = [
  // Step 1: Welcome / Header
  {
    id: 'task-assignment-welcome',
    attachTo: { element: '#task-assignment-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    classes: 'custom-class-name-1 custom-class-name-2',
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Welcome to Task Progress Assignment',
    text: ['This section allows you to assign learning tasks, assessments, and development activities to employees. You can track progress, manage assignments, and monitor completion status.']
  },
  
  // Step 2: View Tabs
  {
    id: 'task-assignment-tabs',
    attachTo: { element: '#task-assignment-tabs', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'View Tabs',
    text: ['Switch between Progress Dashboard to view existing assignments and New Assignment to create new task assignments.']
  },

  // Step 3: Progress Dashboard Stats
  {
    id: 'task-dashboard-stats',
    attachTo: { element: '#task-dashboard-stats', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Dashboard Statistics',
    text: ['View key metrics: Total Assignments, Completed tasks, In Progress tasks, and Overdue tasks. These stats help you monitor overall progress.']
  },

  // Step 4: Filters
  {
    id: 'task-filters',
    attachTo: { element: '#task-filters', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Filter Options',
    text: ['Filter tasks by Department, Job Role, Priority, and Status. Use these filters to quickly find specific assignments.']
  },

  // Step 5: Task Data Table
  {
    id: 'task-data-table',
    attachTo: { element: '#task-data-table', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Task Assignments Table',
    text: ['View all task assignments in this table. You can search, filter by columns, and view task details. Click on column headers to sort.']
  },

  // Step 6: Table Actions
  {
    id: 'task-table-actions',
    attachTo: { element: '#task-table-actions', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Table Actions',
    text: ['Use the Edit button to modify task assignments or the Delete button to remove tasks. These actions are only available to administrators.']
  },

  // Step 7: Export Button
  {
    id: 'task-export',
    attachTo: { element: '#task-export', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Export Data',
    text: ['Export task assignment data using the Export button for reporting and documentation purposes.']
  },

  // Step 8: Switch to New Assignment
  {
    id: 'switch-to-assignment',
    attachTo: { element: '#tab-assignment', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Create New Assignment',
    text: ['Click here to switch to New Assignment view and create task assignments for employees.']
  },

  // Step 9: New Assignment Header
  {
    id: 'new-assignment-header',
    attachTo: { element: '#new-assignment-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'New Assignment Form',
    text: ['This is the New Assignment form where you can create task assignments. Fill in the details below to assign tasks to employees.']
  },

  // Step 10: Department Selection
  {
    id: 'assignment-department',
    attachTo: { element: '#assignment-department', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Select Department',
    text: ['Select the department for which you want to assign tasks. This will filter job roles and employees accordingly.']
  },

  // Step 11: Job Role Selection
  {
    id: 'assignment-jobrole',
    attachTo: { element: '#assignment-jobrole', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Select Job Role',
    text: ['Choose the job role for which tasks will be assigned. This helps match tasks to appropriate employee skills.']
  },

  // Step 12: Employee Selection
  {
    id: 'assignment-employees',
    attachTo: { element: '#assignment-employees', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Assign to Employees',
    text: ['Select one or more employees to assign tasks. You can hold Ctrl/Cmd to select multiple employees at once.']
  },

  // Step 13: Task Title
  {
    id: 'assignment-task-title',
    attachTo: { element: '#assignment-task-title', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Task Title',
    text: ['Enter or select a task title. You can type a custom task name or select from predefined job-role tasks or previously assigned tasks.']
  },

  // Step 14: AI Task Generation
  {
    id: 'assignment-ai-generation',
    attachTo: { element: '#assignment-ai-gen', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'AI Task Generation',
    text: ['Use the AI assistant to generate detailed task descriptions, monitoring points, KRAs, KPIs, and more based on the task title.']
  },

  // Step 15: Task Description
  {
    id: 'assignment-description',
    attachTo: { element: '#assignment-description', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Task Description',
    text: ['Provide a detailed description of the task, including objectives, requirements, and expected outcomes.']
  },

  // Step 16: Repeat Settings
  {
    id: 'assignment-repeat',
    attachTo: { element: '#assignment-repeat', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Task Repetition',
    text: ['Set how often the task should repeat (e.g., every 1-14 days) and the end date for repetition. Leave empty for one-time tasks.']
  },

  // Step 17: Skills Required
  {
    id: 'assignment-skills',
    attachTo: { element: '#assignment-skills', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Skills Required',
    text: ['Select the skills required to complete this task. Skills are automatically loaded based on the selected job role.']
  },

  // Step 18: Observer Selection
  {
    id: 'assignment-observer',
    attachTo: { element: '#assignment-observer', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Select Observer',
    text: ['Choose an observer or manager who will monitor and review the task completion. This person will be notified of task progress.']
  },

  // Step 19: KRAs
  {
    id: 'assignment-kras',
    attachTo: { element: '#assignment-kras', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Key Result Areas (KRAs)',
    text: ['Define the Key Result Areas - the key outcomes or results expected from this task. These help measure task success.']
  },

  // Step 20: KPIs
  {
    id: 'assignment-kpis',
    attachTo: { element: '#assignment-kpis', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Performance Indicators (KPIs)',
    text: ['Set specific Performance Indicators that will be used to evaluate the quality of task completion.']
  },

  // Step 21: Monitoring Points
  {
    id: 'assignment-monitoring',
    attachTo: { element: '#assignment-monitoring', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Monitoring Points',
    text: ['Add specific monitoring points or checkpoints that should be tracked during task execution.']
  },

  // Step 22: File Attachment
  {
    id: 'assignment-attachment',
    attachTo: { element: '#assignment-attachment', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Attachment',
    text: ['Upload relevant documents, templates, or reference materials for the task. Supports JPG, PNG, PDF, DOCX up to 5MB.']
  },

  // Step 23: Task Priority
  {
    id: 'assignment-priority',
    attachTo: { element: '#assignment-priority', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Task Priority',
    text: ['Set the priority level for the task: High (red), Medium (yellow), or Low (teal). This helps employees focus on important tasks.']
  },

  // Step 24: Submit Button
  {
    id: 'assignment-submit',
    attachTo: { element: '#assignment-submit', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Submit Assignment',
    text: ['Click Submit to create the task assignment for all selected employees. The task will be added to their task lists.']
  },

  // Step 25: Completion
  {
    id: 'tour-complete',
    attachTo: { element: '#task-assignment-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Tour Complete!',
    text: ['You have completed the Task Progress Assignment tour. You can now create and manage task assignments, track employee progress, and export reports. Click Finish to close this tour.']
  }
];

export default taskAssignmentTourSteps;
