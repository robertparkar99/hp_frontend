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

// Function to get detailed tour steps with API overrides
export const getDetailedTourSteps = (apiStepsMap = new Map()) => ({
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
      title: apiStepsMap.get('personal-welcome')?.title || 'Personal Information Details fixed',
      text: apiStepsMap.get('personal-welcome')?.text || 'This tab contains all personal details of the employee. Let\'s explore each section!'
    },
    {
      id: 'personal-sidebar',
      attachTo: { element: '#pd-sidebar', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('personal-sidebar')?.title || 'Sidebar Menu fixed ',
      text: apiStepsMap.get('personal-sidebar')?.text || 'This sidebar contains 5 sections: Personal Details, Address, Reporting, Attendance, and Direct Deposit. Click on any section to navigate.'
    },
    {
      id: 'personal-section',
      attachTo: { element: '#pd-section-personal', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('personal-section')?.title || 'Personal Details Section',
      text: apiStepsMap.get('personal-section')?.text || 'Contains fields: Suffix, First Name, Middle Name, Last Name, Email, Password, Birthdate, Mobile, Department, Job Role, Responsibility Level, Gender, User Profile, Joining Year, Status, and User Image.'
    },
    {
      id: 'field-suffix',
      attachTo: { element: '#field-suffix', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-suffix')?.title || 'Suffix Field',
      text: apiStepsMap.get('field-suffix')?.text || 'Select the appropriate suffix: Mr., Mrs., Ms., or Dr. This is optional but helps in formal addressing.'
    },
    {
      id: 'field-firstname',
      attachTo: { element: '#field-firstname', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-firstname')?.title || 'First Name Field',
      text: apiStepsMap.get('field-firstname')?.text || 'Enter the employee\'s first name. This is a required field and will be used for official communications.'
    },
    {
      id: 'field-middlename',
      attachTo: { element: '#field-middlename', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-middlename')?.title || 'Middle Name Field',
      text: apiStepsMap.get('field-middlename')?.text || 'Enter the employee\'s middle name if applicable. This field is optional.'
    },
    {
      id: 'field-lastname',
      attachTo: { element: '#field-lastname', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-lastname')?.title || 'Last Name Field',
      text: apiStepsMap.get('field-lastname')?.text || 'Enter the employee\'s last name. This is a required field and part of their official identity.'
    },
    {
      id: 'field-email',
      attachTo: { element: '#field-email', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-email')?.title || 'Email Field',
      text: apiStepsMap.get('field-email')?.text || 'Enter the employee\'s email address. This will be used for login and official communications.'
    },
    {
      id: 'field-password',
      attachTo: { element: '#field-password', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-password')?.title || 'Password Field',
      text: apiStepsMap.get('field-password')?.text || 'Create a password for the employee\'s login. Click the eye icon to show/hide the password.'
    },
    {
      id: 'field-birthdate',
      attachTo: { element: '#field-birthdate', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-birthdate')?.title || 'Birthdate Field',
      text: apiStepsMap.get('field-birthdate')?.text || 'Select the employee\'s date of birth using the date picker. This is used for age verification and birthday records.'
    },
    {
      id: 'field-mobile',
      attachTo: { element: '#field-mobile', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-mobile')?.title || 'Mobile Field',
      text: apiStepsMap.get('field-mobile')?.text || 'Enter the employee\'s mobile number. This is used for contact purposes and OTP verification.'
    },
    {
      id: 'field-department',
      attachTo: { element: '#field-department', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-department')?.title || 'Department Field',
      text: apiStepsMap.get('field-department')?.text || 'Select the Department for the employee. This determines the organizational unit they belong to.'
    },
    {
      id: 'field-jobrole',
      attachTo: { element: '#field-jobrole', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-jobrole')?.title || 'Job Role Field',
      text: apiStepsMap.get('field-jobrole')?.text || 'Select the Job Role for the employee. Job role determines access permissions, skills, and tasks assigned.'
    },
    {
      id: 'field-responsibility',
      attachTo: { element: '#field-responsibility', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-responsibility')?.title || 'Responsibility Level Field',
      text: apiStepsMap.get('field-responsibility')?.text || 'Select the Level of Responsibility for the employee. This is used for performance reviews and career progression.'
    },
    {
      id: 'field-gender',
      attachTo: { element: '#field-gender', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-gender')?.title || 'Gender Field',
      text: apiStepsMap.get('field-gender')?.text || 'Select the gender: Male or Female. This field is used for personal records and compliance purposes.'
    },
    {
      id: 'field-userprofile',
      attachTo: { element: '#field-userprofile', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-userprofile')?.title || 'User Profile Field',
      text: apiStepsMap.get('field-userprofile')?.text || 'Select the User Profile (Admin, Manager, Employee, etc.) This determines the access level and permissions.'
    },
    {
      id: 'field-joiningyear',
      attachTo: { element: '#field-joiningyear', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-joiningyear')?.title || 'Joining Year Field',
      text: apiStepsMap.get('field-joiningyear')?.text || 'Enter the year the employee joined the organization. This is used for tenure calculation.'
    },
    {
      id: 'field-status',
      attachTo: { element: '#field-status', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-status')?.title || 'Status Field',
      text: apiStepsMap.get('field-status')?.text || 'Select the employment status: Active or In-Active. Inactive employees cannot access the system.'
    },
    {
      id: 'field-userimage',
      attachTo: { element: '#field-userimage', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-userimage')?.title || 'User Image Field',
      text: apiStepsMap.get('field-userimage')?.text || 'Upload a profile photo for the employee. Click the file input to select an image from your device.'
    },
    {
      id: 'personal-submit',
      attachTo: { element: '#pd-submit-btn', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-save')?.title || 'Save Button',
      text: apiStepsMap.get('field-save')?.text || 'Click the Update button to save all the employee details. Make sure all required fields are filled before submitting.'
    }
  ],

  // ========== UPLOAD DOCS DETAILED TOUR ==========
  'upload-docs': [
    {
      id: 'upload-docs-welcome',
      attachTo: { element: '#upload-doc-container', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => {
          const uploadDocsTab = document.querySelector('#tab-upload-docs');
          if (uploadDocsTab) uploadDocsTab.click();
          setTimeout(resolve, 600);
        });
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('upload-docs-welcome')?.title || 'Upload Document Details',
      text: apiStepsMap.get('upload-docs-welcome')?.text || 'This tab manages all employee documents and proofs. Let\'s explore each field!'
    },
    {
      id: 'upload-form-fields',
      attachTo: { element: '#upload-form-fields', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('upload-form-fields')?.title || 'Document Upload Form',
      text: apiStepsMap.get('upload-form-fields')?.text || 'This form contains fields to upload new documents. Let\'s explore each field!'
    },
    {
      id: 'doc-type-field',
      attachTo: { element: '#doc-type-field', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('doc-type-field')?.title || 'Document Type Field',
      text: apiStepsMap.get('doc-type-field')?.text || 'Select the type of document you want to upload: ID Proof, Address Proof, Certificate, Resume, Photo, etc.'
    },
    {
      id: 'doc-title-field',
      attachTo: { element: '#doc-title-field', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('doc-title-field')?.title || 'Document Title Field',
      text: apiStepsMap.get('doc-title-field')?.text || 'Enter a descriptive title for the document. This helps in identifying the document later.'
    },
    {
      id: 'doc-file-field',
      attachTo: { element: '#doc-file-field', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('doc-file-field')?.title || 'File Upload Field',
      text: apiStepsMap.get('doc-file-field')?.text || 'Click to select the file from your device. Supported formats: PDF, DOC, DOCX, TXT.'
    },
    {
      id: 'upload-submit-btn',
      attachTo: { element: '#upload-submit-btn', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('upload-submit-btn')?.title || 'Submit Button',
      text: apiStepsMap.get('upload-submit-btn')?.text || 'Click the Submit button to upload the document. The file will be saved and appear in the list below.'
    },
    {
      id: 'uploaded-docs-section',
      attachTo: { element: '#uploaded-docs-section', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('uploaded-docs-section')?.title || 'Uploaded Documents List',
      text: apiStepsMap.get('uploaded-docs-section')?.text || 'This table shows all previously uploaded documents with their type, title, and filename. Click on filename to view/download.'
    }
  ],

  // ========== JOBROLE SKILL DETAILED TOUR ==========
  'jobrole-skill': [
    {
      id: 'jobrole-skill-welcome',
      attachTo: { element: '#skills-honeycomb', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => {
          const jobroleSkillTab = document.querySelector('#tab-jobrole-skill');
          if (jobroleSkillTab) jobroleSkillTab.click();
          setTimeout(resolve, 600);
        });
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('jobrole-skill-welcome')?.title || 'Job Role Skills Details',
      text: apiStepsMap.get('jobrole-skill-welcome')?.text || 'This tab shows skills assigned to the employee based on their job role. Skills are displayed in a hexagon grid format. Let\'s explore!'
    },
    {
      id: 'skill-hexagon-grid',
      attachTo: { element: '#skills-honeycomb', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('skill-hexagon-grid')?.title || 'Skills Hexagon Grid',
      text: apiStepsMap.get('skill-hexagon-grid')?.text || 'Each hexagon represents a skill. The grid displays all skills assigned to this employee\'s job role. Click on any hexagon to view detailed information.'
    },
    {
      id: 'skill-hex-0',
      attachTo: { element: '#skill-hex-0', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('skill-hex-0')?.title || 'First Skill Hexagon',
      text: apiStepsMap.get('skill-hex-0')?.text || 'Click on this hexagon to view detailed information about this skill including Knowledge, Ability, Behavior, and Attitude attributes.'
    },
    {
      id: 'skill-icon-0',
      attachTo: { element: '#skill-icon-0', on: 'left' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('skill-icon-0')?.title || 'Skill Expand Icon',
      text: apiStepsMap.get('skill-icon-0')?.text || 'Click this icon to expand and view the complete details of this skill including all attributes and proficiency level.'
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
      title: apiStepsMap.get('jobrole-tasks-welcome')?.title || 'Job Role Tasks Details',
      text: apiStepsMap.get('jobrole-tasks-welcome')?.text || 'This tab displays all tasks assigned to the employee based on their job role. Track and manage task completion here.'
    },
    {
      id: 'tasks-table',
      attachTo: { element: '#tasks-table', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('tasks-table')?.title || 'Tasks Table',
      text: apiStepsMap.get('tasks-table')?.text || 'View all tasks with Title, Description, Due Date, Priority, and Status columns. Click on a task to view full details and update progress.'
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
      title: apiStepsMap.get('responsibility-welcome')?.title || 'Level of Responsibility Details',
      text: apiStepsMap.get('responsibility-welcome')?.text || 'This tab shows the responsibility framework for the employee. Used for performance reviews and career planning.'
    },
    {
      id: 'responsibility-grid',
      attachTo: { element: '#responsibility-grid', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('responsibility-grid')?.title || 'Responsibility Grid',
      text: apiStepsMap.get('responsibility-grid')?.text || 'Shows areas with descriptions and responsibility levels (1-5). Level 1 is basic execution, Level 5 is expert/strategic. Use for career progression planning.'
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
      title: apiStepsMap.get('skill-rating-welcome')?.title || 'Skill Rating Details',
      text: apiStepsMap.get('skill-rating-welcome')?.text || 'This tab allows rating of employee skills. Supports self-assessment and manager assessment with evidence/comments.'
    },
    {
      id: 'skill-rating-grid',
      attachTo: { element: '#skill-rating-grid', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('skill-rating-grid')?.title || 'Skill Rating Grid',
      text: apiStepsMap.get('skill-rating-grid')?.text || 'Rate each skill from 1-5 stars. Add evidence or comments to support the rating. Compare self-assessment vs manager assessment to identify gaps.'
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
      title: apiStepsMap.get('competency-welcome')?.title || 'Expected Competency Details',
      text: apiStepsMap.get('competency-welcome')?.text || 'This tab shows competency analysis with radar chart comparing current vs expected levels across different dimensions.'
    },
    {
      id: 'competency-radar',
      attachTo: { element: '#competency-radar-chart', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('competency-radar')?.title || 'Competency Radar Chart',
      text: apiStepsMap.get('competency-radar')?.text || 'The radar chart shows current competency levels vs expected levels across Ability, Behavior, Attitude, and Knowledge. Gap areas indicate training needs.'
    }
  ],

  // ========== ADDRESS DETAILED TOUR ==========
  'address': [
    {
      id: 'address-welcome',
      attachTo: { element: '#pd-section-address', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => {
          const addressTab = document.querySelector('#pd-tab-address');
          if (addressTab) addressTab.click();
          setTimeout(resolve, 600);
        });
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('address-welcome')?.title || 'Address Information',
      text: apiStepsMap.get('address-welcome')?.text || 'This section contains the employee\'s address details. Let\'s explore each field!'
    },
    {
      id: 'field-address',
      attachTo: { element: '#field-address', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-address')?.title || 'Address Field',
      text: apiStepsMap.get('field-address')?.text || 'Enter the employee\'s permanent address. This is used for official communications and records.'
    },
    {
      id: 'field-city',
      attachTo: { element: '#field-city', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-city')?.title || 'City Field',
      text: apiStepsMap.get('field-city')?.text || 'Enter the city name from the address. This helps in regional reporting and compliance.'
    },
    {
      id: 'field-state',
      attachTo: { element: '#field-state', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-state')?.title || 'State Field',
      text: apiStepsMap.get('field-state')?.text || 'Enter the state name from the address. This is required for compliance and tax purposes.'
    },
    {
      id: 'field-pincode',
      attachTo: { element: '#field-pincode', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-pincode')?.title || 'Pincode Field',
      text: apiStepsMap.get('field-pincode')?.text || 'Enter the postal/PIN code of the area. This helps in precise location tracking and delivery.'
    },
    {
      id: 'field-address2',
      attachTo: { element: '#address_2', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-address2')?.title || 'Temporary Address Field',
      text: apiStepsMap.get('field-address2')?.text || 'Enter a temporary address if the employee is currently staying at a different location. This field is optional.'
    }
  ],

  // ========== REPORTING DETAILED TOUR ==========
  'reporting': [
    {
      id: 'reporting-welcome',
      attachTo: { element: '#pd-section-reporting', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => {
          const reportingTab = document.querySelector('#pd-tab-reporting');
          if (reportingTab) reportingTab.click();
          setTimeout(resolve, 600);
        });
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('reporting-welcome')?.title || 'Reporting Information',
      text: apiStepsMap.get('reporting-welcome')?.text || 'This section defines the reporting structure for the employee. Let\'s explore!'
    },
    {
      id: 'field-supervisor',
      attachTo: { element: '#field-supervisor', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-supervisor')?.title || 'Supervisor/Subordinate Field',
      text: apiStepsMap.get('field-supervisor')?.text || 'Select whether this employee is a Supervisor or Subordinate in the reporting hierarchy.'
    },
    {
      id: 'field-employeename',
      attachTo: { element: '#field-employeename', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-employeename')?.title || 'Employee Name Field',
      text: apiStepsMap.get('field-employeename')?.text || 'Select the employee\'s reporting manager or subordinate. This establishes the reporting relationship.'
    },
    {
      id: 'field-reportingmethod',
      attachTo: { element: '#field-reportingmethod', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-reportingmethod')?.title || 'Reporting Method Field',
      text: apiStepsMap.get('field-reportingmethod')?.text || 'Select the reporting method: Direct (reports to one person) or Indirect (reports through multiple levels).'
    }
  ],

  // ========== ATTENDANCE DETAILED TOUR ==========
  'attendance': [
    {
      id: 'attendance-welcome',
      attachTo: { element: '#pd-section-attendance', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => {
          const attendanceTab = document.querySelector('#pd-tab-attendance');
          if (attendanceTab) attendanceTab.click();
          setTimeout(resolve, 600);
        });
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('attendance-welcome')?.title || 'Attendance Information',
      text: apiStepsMap.get('attendance-welcome')?.text || 'This section defines the working days and time settings for the employee. Let\'s explore!'
    },
    {
      id: 'field-workingdays',
      attachTo: { element: '#field-workingdays', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-workingdays')?.title || 'Working Days Field',
      text: apiStepsMap.get('field-workingdays')?.text || 'Select the working days for this employee. Check or uncheck days (Mon-Sat) to set their work schedule.'
    }
  ],

  // ========== DEPOSIT DETAILED TOUR ==========
  'deposit': [
    {
      id: 'deposit-welcome',
      attachTo: { element: '#pd-section-deposit', on: 'top' },
      beforeShowPromise: function () {
        return new Promise(resolve => {
          const depositTab = document.querySelector('#pd-tab-deposit');
          if (depositTab) depositTab.click();
          setTimeout(resolve, 600);
        });
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('deposit-welcome')?.title || 'Direct Deposit Information',
      text: apiStepsMap.get('deposit-welcome')?.text || 'This section contains bank details for salary transfer. Let\'s explore each field!'
    },
    {
      id: 'field-bankname',
      attachTo: { element: '#field-bankname', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-bankname')?.title || 'Bank Name Field',
      text: apiStepsMap.get('field-bankname')?.text || 'Enter the name of the employee\'s bank. This is required for salary disbursement.'
    },
    {
      id: 'field-branchname',
      attachTo: { element: '#field branchname', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-branchname')?.title || 'Branch Name Field',
      text: apiStepsMap.get('field-branchname')?.text || 'Enter the bank branch name. This helps in verifying the bank account details.'
    },
    {
      id: 'field-account',
      attachTo: { element: '#field-account', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-account')?.title || 'Account Number Field',
      text: apiStepsMap.get('field-account')?.text || 'Enter the employee\'s bank account number. This is used for salary transfer via NEFT/RTGS.'
    },
    {
      id: 'field-ifsc',
      attachTo: { element: '#field-ifsc', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-ifsc')?.title || 'IFSC Code Field',
      text: apiStepsMap.get('field-ifsc')?.text || 'Enter the bank\'s IFSC (Indian Financial System Code). This is essential for electronic fund transfer.'
    },
    {
      id: 'field-amount',
      attachTo: { element: '#field-amount', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-amount')?.title || 'Amount Field',
      text: apiStepsMap.get('field-amount')?.text || 'Enter the salary amount to be disbursed. This is the net pay after deductions.'
    },
    {
      id: 'field-transfertype',
      attachTo: { element: '#field-transfertype', on: 'right' },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 500));
      },
      buttons: [],
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: { enabled: true },
      title: apiStepsMap.get('field-transfertype')?.title || 'Transfer Type Field',
      text: apiStepsMap.get('field-transfertype')?.text || 'Select the transfer type: Direct (salary credited to account) or Indirect (through other channels).'
    }
  ]
});

// Function to get main tour steps with API overrides
export const getEditEmployeeTourSteps = (apiStepsMap = new Map()) => [
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
    title: apiStepsMap.get('welcome')?.title || 'Welcome to Edit Employee',
    text: apiStepsMap.get('welcome')?.text || 'This page manages complete employee information with 7 tabs. Each tab has specific form fields. This tour will guide you through each tab. Let\'s start!'
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
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: apiStepsMap.get('tab-personal-info')?.title || 'Personal Information Tab',
    text: apiStepsMap.get('tab-personal-info')?.text || 'This main tab has 5 sections in sidebar: Personal Details, Address, Reporting, Attendance, Direct Deposit. Click sidebar items to navigate.'
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
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: apiStepsMap.get('tab-upload-docs')?.title || 'Upload Document Tab',
    text: apiStepsMap.get('tab-upload-docs')?.text || 'This tab manages employee documents: ID proofs, certificates, resume, photos. Has upload form at top and document list below.'
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
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: apiStepsMap.get('tab-jobrole-skill')?.title || 'Job Role Skills Tab',
    text: apiStepsMap.get('tab-jobrole-skill')?.text || 'Shows skills assigned to employee\'s job role in hexagon grid. Click any skill to view Knowledge, Ability, Behavior, Attitude details.'
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
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: apiStepsMap.get('tab-jobrole-tasks')?.title || 'Job Role Tasks Tab',
    text: apiStepsMap.get('tab-jobrole-tasks')?.text || 'Displays all tasks for this employee\'s job role. Shows: Title, Description, Due Date, Priority, Status. Track task completion here.'
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
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: apiStepsMap.get('tab-responsibility')?.title || 'Level of Responsibility Tab',
    text: apiStepsMap.get('tab-responsibility')?.text || 'Shows responsibility framework with areas, descriptions, and levels (1-5). Used for performance reviews and career planning.'
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
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: apiStepsMap.get('tab-skill-rating')?.title || 'Skill Rating Tab',
    text: apiStepsMap.get('tab-skill-rating')?.text || 'Rate employee skills 1-5 stars. Self-assessment and manager assessment. Add evidence/comments. Compare ratings over time.'
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
    scrollTo: false,
    cancelIcon: { enabled: true },
    title: apiStepsMap.get('tab-competency')?.title || 'Expected Competency Tab',
    text: apiStepsMap.get('tab-competency')?.text || 'Radar chart shows competency analysis. Current vs Expected levels across Ability, Behavior, Attitude, Knowledge. Gap analysis for training.'
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
    title: apiStepsMap.get('tour-complete')?.title || 'Tour Complete!',
    text: apiStepsMap.get('tour-complete')?.text || 'You now know all 7 tabs in Edit Employee page! Each tab contains different sections for managing employee information. Click Finish to continue.'
  }
];
