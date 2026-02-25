/**
 * Edit Employee Page Tour Steps - Tab Only Tour
 * Simplified tour that only covers the 7 tabs
 * 
 * Each tab can have detailed steps when clicking "Detailed Tour" button
 */

// Tab IDs mapping for navigation
export const TAB_IDS = {
  'personal-info': 'tab-personal-info',
  'upload-docs': 'tab-upload-docs',
  'jobrole-skill': 'tab-jobrole-skill',
  'jobrole-tasks': 'tab-jobrole-tasks',
  'responsibility': 'tab-responsibility',
  'skill-rating': 'tab-skill-rating',
  'Jobrole-Type': 'tab-Jobrole-Type'
};

// Detailed tour steps for each tab
// These will be shown when clicking "Detailed Tour" button on specific tab
export const detailedTourSteps = {
  // ========== PERSONAL INFO DETAILED TOUR ==========
  'personal-info': [
    {
      id: 'personal-welcome',
      attachTo: { element: '#pd-header', on: 'bottom' },
      beforeShowPromise: function () {
        return new Promise(resolve => {
          // Click on personal tab in sidebar
          const personalTab = document.querySelector('#pd-tab-personal');
          if (personalTab) personalTab.click();
          setTimeout(resolve, 600);
        });
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: 'Personal Information Details',
      text: 'This tab contains all personal details of the employee. Let\'s explore each section!'
    },
    {
      id: 'personal-sidebar',
      attachTo: { element: '#pd-sidebar', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Sidebar Menu',
      text: 'This sidebar contains 5 sections: Personal Details, Address, Reporting, Attendance, and Direct Deposit. Click on any section to navigate.'
    },
    {
      id: 'personal-section',
      attachTo: { element: '#pd-section-personal', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Personal Details Section',
      text: 'Contains fields: Suffix, First Name, Middle Name, Last Name, Email, Password, Birthdate, Mobile, Department, Job Role, Responsibility Level, Gender, User Profile, Joining Year, Status, and User Image.'
    },
    {
      id: 'personal-name-fields',
      attachTo: { element: '#field-firstname', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Name Fields',
      text: 'Enter the employee\'s name details: Suffix (Mr./Mrs./Ms./Dr.), First Name, Middle Name, and Last Name.'
    },
    {
      id: 'personal-contact-fields',
      attachTo: { element: '#field-email', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Contact Fields',
      text: 'Enter Email address and create a Password for the employee. The email will be used for login.'
    },
    {
      id: 'personal-department',
      attachTo: { element: '#field-department', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Department & Job Role',
      text: 'Select the Department and Job Role for the employee. These determine access permissions and organizational hierarchy.'
    },
    {
      id: 'personal-submit',
      attachTo: { element: '#pd-submit-btn', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Save Button',
      text: 'Click the Update button to save all the employee details. Make sure all required fields are filled before submitting.'
    }
  ],

  // ========== UPLOAD DOCS DETAILED TOUR ==========
  'upload-docs': [
    {
      id: 'upload-docs-welcome',
      attachTo: { element: '#content-upload-docs', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: 'Upload Document Details',
      text: 'This tab manages all employee documents and proofs. Let\'s explore!'
    },
    {
      id: 'upload-form',
      attachTo: { element: '#upload-document-form', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Document Upload Form',
      text: 'Select document type, choose the file from your device, add a description, and click Upload. Supported formats: PDF, JPG, PNG.'
    },
    {
      id: 'document-list',
      attachTo: { element: '#document-list-table', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Document List',
      text: 'View all uploaded documents with Type, Name, Upload Date, Description. Click eye icon to preview, download icon to save, or trash icon to delete.'
    }
  ],

  // ========== JOBROLE SKILL DETAILED TOUR ==========
  'jobrole-skill': [
    {
      id: 'jobrole-skill-welcome',
      attachTo: { element: '#content-jobrole-skill', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: 'Job Role Skills Details',
      text: 'This tab shows skills assigned to the employee based on their job role. Skills are displayed in a hexagon grid format.'
    },
    {
      id: 'skill-hexagon-grid',
      attachTo: { element: '#skill-hexagon-grid', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Skills Hexagon Grid',
      text: 'Each hexagon represents a skill. Click on any hexagon to view detailed information about Knowledge, Ability, Behavior, and Attitude for that skill.'
    }
  ],

  // ========== JOBROLE TASKS DETAILED TOUR ==========
  'jobrole-tasks': [
    {
      id: 'jobrole-tasks-welcome',
      attachTo: { element: '#content-jobrole-tasks', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: 'Job Role Tasks Details',
      text: 'This tab displays all tasks assigned to the employee based on their job role. Track and manage task completion here.'
    },
    {
      id: 'tasks-table',
      attachTo: { element: '#tasks-table', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Tasks Table',
      text: 'View all tasks with Title, Description, Due Date, Priority, and Status columns. Click on a task to view full details and update progress.'
    }
  ],

  // ========== RESPONSIBILITY DETAILED TOUR ==========
  'responsibility': [
    {
      id: 'responsibility-welcome',
      attachTo: { element: '#content-responsibility', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: 'Level of Responsibility Details',
      text: 'This tab shows the responsibility framework for the employee. Used for performance reviews and career planning.'
    },
    {
      id: 'responsibility-grid',
      attachTo: { element: '#responsibility-grid', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Responsibility Grid',
      text: 'Shows areas with descriptions and responsibility levels (1-5). Level 1 is basic execution, Level 5 is expert/strategic. Use for career progression planning.'
    }
  ],

  // ========== SKILL RATING DETAILED TOUR ==========
  'skill-rating': [
    {
      id: 'skill-rating-welcome',
      attachTo: { element: '#content-skill-rating', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: 'Skill Rating Details',
      text: 'This tab allows rating of employee skills. Supports self-assessment and manager assessment with evidence/comments.'
    },
    {
      id: 'skill-rating-grid',
      attachTo: { element: '#skill-rating-grid', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Skill Rating Grid',
      text: 'Rate each skill from 1-5 stars. Add evidence or comments to support the rating. Compare self-assessment vs manager assessment to identify gaps.'
    }
  ],

  // ========== EXPECTED COMPETENCY DETAILED TOUR ==========
  'Jobrole-Type': [
    {
      id: 'competency-welcome',
      attachTo: { element: '#content-competency', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: 'Expected Competency Details',
      text: 'This tab shows competency analysis with radar chart comparing current vs expected levels across different dimensions.'
    },
    {
      id: 'competency-radar',
      attachTo: { element: '#competency-radar-chart', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: { enabled: true },
      title: 'Competency Radar Chart',
      text: 'The radar chart shows current competency levels vs expected levels across Ability, Behavior, Attitude, and Knowledge. Gap areas indicate training needs.'
    }
  ]
};

export const editEmployeeTourSteps = [
  // ========== WELCOME ==========
  {
    id: 'welcome',
    attachTo: { element: '#edit-employee-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Welcome to Edit Employee',
    text: 'This page manages complete employee information with 7 tabs. Each tab has specific form fields. This tour will guide you through each tab. Let\'s start!'
  },

  // ========== PERSONAL INFO TAB ==========
  {
    id: 'tab-personal-info',
    attachTo: { element: '#tab-personal-info', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-personal-info');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 600);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Personal Information Tab',
    text: 'This main tab has 5 sections in sidebar: Personal Details, Address, Reporting, Attendance, Direct Deposit. Click sidebar items to navigate.'
  },

  // ========== UPLOAD DOCUMENT TAB ==========
  {
    id: 'tab-upload-docs',
    attachTo: { element: '#tab-upload-docs', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-upload-docs');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 600);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Upload Document Tab',
    text: 'This tab manages employee documents: ID proofs, certificates, resume, photos. Has upload form at top and document list below.'
  },

  // ========== JOBROLE SKILL TAB ==========
  {
    id: 'tab-jobrole-skill',
    attachTo: { element: '#tab-jobrole-skill', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-jobrole-skill');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 600);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Job Role Skills Tab',
    text: 'Shows skills assigned to employee\'s job role in hexagon grid. Click any skill to view Knowledge, Ability, Behavior, Attitude details.'
  },

  // ========== JOBROLE TASKS TAB ==========
  {
    id: 'tab-jobrole-tasks',
    attachTo: { element: '#tab-jobrole-tasks', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-jobrole-tasks');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 600);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Job Role Tasks Tab',
    text: 'Displays all tasks for this employee\'s job role. Shows: Title, Description, Due Date, Priority, Status. Track task completion here.'
  },

  // ========== RESPONSIBILITY TAB ==========
  {
    id: 'tab-responsibility',
    attachTo: { element: '#tab-responsibility', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-responsibility');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 600);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Level of Responsibility Tab',
    text: 'Shows responsibility framework with areas, descriptions, and levels (1-5). Used for performance reviews and career planning.'
  },

  // ========== SKILL RATING TAB ==========
  {
    id: 'tab-skill-rating',
    attachTo: { element: '#tab-skill-rating', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-skill-rating');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 600);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Skill Rating Tab',
    text: 'Rate employee skills 1-5 stars. Self-assessment and manager assessment. Add evidence/comments. Compare ratings over time.'
  },

  // ========== EXPECTED COMPETENCY TAB ==========
  {
    id: 'tab-competency',
    attachTo: { element: '#tab-Jobrole-Type', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-Jobrole-Type');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 600);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: { behavior: 'smooth', block: 'center' },
    cancelIcon: { enabled: true },
    title: 'Expected Competency Tab',
    text: 'Radar chart shows competency analysis. Current vs Expected levels across Ability, Behavior, Attitude, Knowledge. Gap analysis for training.'
  },

  // ========== COMPLETE ==========
  {
    id: 'tour-complete',
    attachTo: { element: '#edit-employee-header', on: 'bottom' },
    beforeShowPromise: function() {
      return new Promise(resolve => {
        const tabBtn = document.querySelector('#tab-personal-info');
        if (tabBtn) tabBtn.click();
        setTimeout(resolve, 500);
      });
    },
    buttons: [],
    highlightClass: 'highlight',
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: 'Tour Complete!',
    text: 'You now know all 7 tabs in Edit Employee page! Each tab contains different sections for managing employee information. Click Finish to continue.'
  }
];

export default editEmployeeTourSteps;
