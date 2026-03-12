/**
 * Task Management Page Tour Steps (New Assignment Form Only)
 * Uses Shepherd.js for guided onboarding
 * This tour is specifically for the taskManagement.tsx page
 */

export const taskManagementTourSteps = [
  // Step 1: New Assignment Header
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
    text: ['This is the New Assignment form where you can create task assignments for employees. Fill in the details below to assign tasks.']
  },

  // Step 2: Department Selection
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

  // Step 3: Job Role Selection
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

  // Step 4: Employee Selection
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

  // Step 5: Task Title
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

  // Step 6: AI Task Generation
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

  // Step 7: Task Description
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

  // Step 8: Repeat Settings
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

  // Step 9: Skills Required
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

  // Step 10: Observer Selection
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

  // Step 11: KRAs
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

  // Step 12: KPIs
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

  // Step 13: Monitoring Points
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

  // Step 14: File Attachment
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

  // Step 15: Task Priority
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

  // Step 16: Submit Button
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

  // Step 17: Completion
  {
    id: 'tour-complete',
    attachTo: { element: '#new-assignment-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Tour Complete!',
    text: ['You have completed the Task Assignment tour. You can now create and manage task assignments for employees. Click Finish to close this tour.']
  }
];

export default taskManagementTourSteps;
