/**
 * Organization Profile Management Tour Steps
 * Uses Shepherd.js for guided onboarding
 */

export const organizationProfileTourSteps = [
  // Step 1: Welcome / Header
  {
    id: 'org-profile-welcome',
    attachTo: { element: '#org-profile-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    classes: 'custom-class-name-1 custom-class-name-2',
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Welcome to Organization Profile Management',
    text: ['This section allows you to manage your organization\'s complete profile, including basic information, department structure, compliance requirements, and disciplinary records.']
  },
  
  // Step 2: Organization Info Tab
  {
    id: 'org-info-tab',
    attachTo: { element: '#tab-info', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Organization Information',
    text: ['Start by filling out your organization\'s basic information including legal name, CIN, GSTIN, PAN, registered address, and uploading your company logo. You can also add sister concerns/companies here.']
  },

  // Step 3: Organization Info Form - Legal Name
  {
    id: 'org-info-legal-name',
    attachTo: { element: '#org-legal-name', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Legal Name',
    text: ['Enter your organization\'s official legal name as registered with regulatory authorities.']
  },

  // Step 4: Organization Info Form - CIN
  {
    id: 'org-info-cin',
    attachTo: { element: '#org-cin', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Corporate Identification Number (CIN)',
    text: ['Enter your 21-digit Corporate Identification Number. This is a unique identifier for your company issued by ROC.']
  },

  // Step 5: Organization Info Form - PAN
  {
    id: 'org-info-pan',
    attachTo: { element: '#org-pan', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'PAN (Permanent Account Number)',
    text: ['Enter your organization\'s 10-character PAN (e.g., AAAAA9999A). This is required for tax purposes.']
  },

  // Step 6: Organization Info Form - Industry
  {
    id: 'org-info-industry',
    attachTo: { element: '#org-industry', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Industry',
    text: ['Select your organization\'s industry type from the dropdown. This helps in generating industry-specific reports and compliance requirements.']
  },

  // Step 7: Organization Info Form - Employee Count
  {
    id: 'org-info-employee-count',
    attachTo: { element: '#org-employee-count', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Employee Count',
    text: ['Select the approximate number of employees in your organization. This helps in determining appropriate HR policies and compliance requirements.']
  },

  // Step 8: Organization Info Form - Work Week
  {
    id: 'org-info-work-week',
    attachTo: { element: '#org-work-week', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Work Week',
    text: ['Select your organization\'s standard work week schedule - either Monday to Friday or Monday to Saturday.']
  },

  // Step 9: Organization Info Form - Registered Address
  {
    id: 'org-info-address',
    attachTo: { element: '#org-address', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Registered Address',
    text: ['Enter your organization\'s complete registered address as per official records.']
  },

  // Step 10: Organization Info Form - Logo Upload
  {
    id: 'org-info-logo',
    attachTo: { element: '#org-logo-upload', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Organization Logo',
    text: ['Upload your organization\'s logo here. Recommended size is 200x200px. Accepted formats: PNG, JPG up to 2MB.']
  },

  // Step 11: Sister Companies
  {
    id: 'org-info-sister-companies',
    attachTo: { element: '#org-sister-companies', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Sister Companies',
    text: ['You can add sister concerns or subsidiary companies here. Click the + button to add another company.']
  },

  // Step 12: Submit Button
  {
    id: 'org-info-submit',
    attachTo: { element: '#org-info-submit-btn', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Save Information',
    text: ['Click Submit to save all organization information. The data will be validated before submission.']
  },

  // Step 13: Department Management Tab
  {
    id: 'department-tab',
    attachTo: { element: '#tab-structure', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Department Management',
    text: ['Switch to this tab to manage your organization\'s department structure. You can add, edit, and organize departments and sub-departments.']
  },

  // Step 14: Department Search
  {
    id: 'department-search',
    attachTo: { element: '#department-search-input', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Search Departments',
    text: ['Use this search bar to quickly find specific departments or sub-departments by name.']
  },

  // Step 15: Department Actions
  {
    id: 'department-actions',
    attachTo: { element: '#department-actions-toolbar', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Department Actions',
    text: ['Access various tools: Settings for configuration, Custom Fields to add fields, AI Assistant for recommendations, and Add Department to create new departments.']
  },

  // Step 16: Add Department Button
  {
    id: 'department-add-btn',
    attachTo: { element: '#add-department-btn', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Add New Department',
    text: ['Click here to add a new department to your organization structure.']
  },

  // Step 17: Department List
  {
    id: 'department-list',
    attachTo: { element: '#department-list-container', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Department List',
    text: ['View all your organization\'s departments here. Each department card shows the department name and allows various actions.']
  },

  // Step 18: Department Actions (per department)
  {
    id: 'department-card-actions',
    attachTo: { element: '#department-card-actions', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Department Actions',
    text: ['View details, Edit department name, Add sub-departments, View analytics, Manage permissions, or get AI recommendations.']
  },

  // Step 19: Sub-departments
  {
    id: 'sub-departments',
    attachTo: { element: '#sub-departments-list', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Sub-departments',
    text: ['View and manage sub-departments under each main department. Double-click to edit a sub-department name.']
  },

  // Step 20: Compliance Management Tab
  {
    id: 'compliance-tab',
    attachTo: { element: '#tab-config', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Compliance Management',
    text: ['Switch to this tab to manage compliance requirements, task assignments, and track compliance-related activities.']
  },

  // Step 21: Compliance Form - Name
  {
    id: 'compliance-form-name',
    attachTo: { element: '#compliance-name', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Compliance Name',
    text: ['Enter the name of the compliance requirement or task you want to add.']
  },

  // Step 22: Compliance Form - Description
  {
    id: 'compliance-form-description',
    attachTo: { element: '#compliance-description', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Description',
    text: ['Provide a detailed description of the compliance requirement or task.']
  },

  // Step 23: Compliance Form - Department
  {
    id: 'compliance-form-department',
    attachTo: { element: '#compliance-department', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Assign to Department',
    text: ['Select the department responsible for this compliance requirement.']
  },

  // Step 24: Compliance Form - Assigned To
  {
    id: 'compliance-form-assignee',
    attachTo: { element: '#compliance-assignee', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Assign to Employee',
    text: ['Select the specific employee responsible for completing this compliance task.']
  },

  // Step 25: Compliance Form - Due Date
  {
    id: 'compliance-form-due-date',
    attachTo: { element: '#compliance-due-date', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Due Date',
    text: ['Set the deadline for completing this compliance requirement.']
  },

  // Step 26: Compliance Form - Frequency
  {
    id: 'compliance-form-frequency',
    attachTo: { element: '#compliance-frequency', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Frequency',
    text: ['Choose how often this compliance needs to be addressed: One-Time, Daily, Weekly, Monthly, Quarterly, Yearly, or Custom.']
  },

  // Step 27: Compliance Form - Attachment
  {
    id: 'compliance-form-attachment',
    attachTo: { element: '#compliance-attachment', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Attachment',
    text: ['Upload relevant documents, templates, or reference materials for this compliance requirement.']
  },

  // Step 28: Compliance Form - Submit
  {
    id: 'compliance-form-submit',
    attachTo: { element: '#compliance-submit-btn', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Submit Compliance',
    text: ['Click Submit to add this compliance requirement to the system.']
  },

  // Step 29: Compliance Data Table
  {
    id: 'compliance-table',
    attachTo: { element: '#compliance-data-table', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Compliance Records',
    text: ['View all compliance records in this table. You can search, filter, and sort by any column. Use the export buttons to download data.']
  },

  // Step 30: Compliance Export Options
  {
    id: 'compliance-export',
    attachTo: { element: '#compliance-export-buttons', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Export Options',
    text: ['Export compliance data using Print, Excel, or PDF formats for reporting and documentation.']
  },

  // Step 31: Disciplinary Management Tab
  {
    id: 'disciplinary-tab',
    attachTo: { element: '#tab-disciplinary', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Disciplinary Management',
    text: ['Switch to this tab to manage disciplinary incidents, records, and actions taken against employees.']
  },

  // Step 32: Disciplinary Form - Department
  {
    id: 'disciplinary-form-department',
    attachTo: { element: '#disciplinary-department', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Department',
    text: ['Select the department of the employee involved in the incident.']
  },

  // Step 33: Disciplinary Form - Employee
  {
    id: 'disciplinary-form-employee',
    attachTo: { element: '#disciplinary-employee', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Employee',
    text: ['Select the employee involved in the disciplinary incident.']
  },

  // Step 34: Disciplinary Form - Incident Date/Time
  {
    id: 'disciplinary-form-datetime',
    attachTo: { element: '#disciplinary-datetime', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Incident Date & Time',
    text: ['Specify when the incident occurred. This helps in investigating and tracking patterns.']
  },

  // Step 35: Disciplinary Form - Location
  {
    id: 'disciplinary-form-location',
    attachTo: { element: '#disciplinary-location', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Location',
    text: ['Enter the location where the incident took place.']
  },

  // Step 36: Disciplinary Form - Misconduct Type
  {
    id: 'disciplinary-form-misconduct',
    attachTo: { element: '#disciplinary-misconduct', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Type of Misconduct',
    text: ['Select the type of misconduct from options like Late Arrival, Absenteeism, Misbehavior, Violation of Policy, or Others.']
  },

  // Step 37: Disciplinary Form - Description
  {
    id: 'disciplinary-form-description',
    attachTo: { element: '#disciplinary-description', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Description',
    text: ['Provide a detailed description of the incident including what happened, when, and any relevant circumstances.']
  },

  // Step 38: Disciplinary Form - Witness
  {
    id: 'disciplinary-form-witness',
    attachTo: { element: '#disciplinary-witness', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Witness',
    text: ['Select any witnesses who observed the incident (optional but recommended for documentation).']
  },

  // Step 39: Disciplinary Form - Action Taken
  {
    id: 'disciplinary-form-action',
    attachTo: { element: '#disciplinary-action', on: 'right' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Action Taken',
    text: ['Select the disciplinary action taken: Warning, Suspension, Termination, Counseling, or Others.']
  },

  // Step 40: Disciplinary Form - Remarks
  {
    id: 'disciplinary-form-remarks',
    attachTo: { element: '#disciplinary-remarks', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Remarks',
    text: ['Add any additional notes or remarks regarding the incident and action taken (optional).']
  },

  // Step 41: Disciplinary Form - Submit
  {
    id: 'disciplinary-form-submit',
    attachTo: { element: '#disciplinary-submit-btn', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Submit Report',
    text: ['Click Submit to record this disciplinary incident in the system.']
  },

  // Step 42: Disciplinary Data Table
  {
    id: 'disciplinary-table',
    attachTo: { element: '#disciplinary-data-table', on: 'top' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Disciplinary Records',
    text: ['View all disciplinary records in this table. Search and filter to find specific incidents. Edit or delete records as needed.']
  },

  // Step 43: Disciplinary Export Options
  {
    id: 'disciplinary-export',
    attachTo: { element: '#disciplinary-export-buttons', on: 'left' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Export Records',
    text: ['Export disciplinary records using Print, Excel, or PDF formats for reporting and documentation.']
  },

  // Step 44: Completion
  {
    id: 'tour-complete',
    attachTo: { element: '#org-profile-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 300));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Tour Complete!',
    text: ['You have completed the Organization Profile Management tour. You can now manage your organization\'s profile, departments, compliance requirements, and disciplinary records. Click Finish to close this tour.']
  }
];

export default organizationProfileTourSteps;
