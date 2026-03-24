import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface LeaveAllocationTourStepData {
  on_click: string;
  title: string;
  description: string;
}

// Helper to get user data from localStorage
const getUserData = (): { url: string; token: string; subInstituteId: string } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
      return {
        url: APP_URL,
        token,
        subInstituteId: String(sub_institute_id)
      };
    }
  } catch (e) {
    console.error('[LeaveAllocation Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchLeaveAllocationTourStepsFromAPI = async (menuId: number): Promise<LeaveAllocationTourStepData[]> => {
  // Try to get userData for base URL

  let baseUrl;
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL } = JSON.parse(userData);
      if (APP_URL) {
        baseUrl = APP_URL;
      }
    }
  } catch (e) {
    console.log('[LeaveAllocation Tour] Using default base URL');
  }

  try {
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[LeaveAllocation Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[LeaveAllocation Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: LeaveAllocationTourStepData[] = [];

    if (Array.isArray(json)) {
      tourData = json;
    } else if (json.data && Array.isArray(json.data)) {
      tourData = json.data;
    } else if (json.result && Array.isArray(json.result)) {
      tourData = json.result;
    } else if (json.response && Array.isArray(json.response)) {
      tourData = json.response;
    } else if (typeof json === 'object') {
      for (const key of Object.keys(json)) {
        if (Array.isArray(json[key])) {
          tourData = json[key];
          console.log(`[LeaveAllocation Tour] Found array data in response.${key}`);
          break;
        }
      }
    }

    // Normalize field names
    const normalizedTourData = tourData.map((step: any) => ({
      on_click: step.on_click || step.onClick || step.step_key || step.stepKey || step.id || '',
      title: step.title || step.Title || step.name || step.step_title || step.stepTitle || '',
      description: step.description || step.Description || step.text || step.Text || step.content || step.step_description || ''
    }));

    console.log('[LeaveAllocation Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[LeaveAllocation Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Custom interface for tour steps (extends Shepherd options with id)
export interface LeaveAllocationTourStep {
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

// Tour step configuration for Leave Allocation page
export interface LeaveAllocationTourStep {
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

export const createLeaveAllocationTourSteps = (apiTourData?: LeaveAllocationTourStepData[]): LeaveAllocationTourStep[] => {
  // Create a Map from API data for easy lookup by step ID (case-insensitive)
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[LeaveAllocation Tour] Creating apiStepsMap from API data:', apiTourData.length);

    // Process each step - use on_click as the key
    apiTourData.forEach((stepData) => {
      // Use the on_click field as-is first, then also try lowercase
      const stepIdRaw = stepData.on_click || '';
      const stepId = stepIdRaw.toLowerCase().trim();
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        // Store with lowercase key for case-insensitive lookup
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
        // Also store with original case if different
        if (stepIdRaw !== stepId) {
          apiStepsMap.set(stepIdRaw, { title: stepTitle, description: stepDescription });
        }
      }
    });

    console.log('[LeaveAllocation Tour] apiStepsMap created with', apiStepsMap.size, 'entries:', Array.from(apiStepsMap.entries()));
  } else {
    console.log('[LeaveAllocation Tour] No API data received, using default tour steps');
  }

  console.log('[LeaveAllocation Tour] Using tour steps with API overrides');

  // Helper function to get step title/description with case-insensitive lookup
  const getStepContent = (stepId: string): { title: string; description: string } => {
    const lowerId = stepId.toLowerCase();
    const result = apiStepsMap.get(lowerId) || { title: '', description: '' };
    return result;
  };

  // Debug: Log a few sample lookups after function is defined
  console.log('[LeaveAllocation Tour] Sample lookups:');
  console.log('  welcome:', getStepContent('leave-allocation-welcome'));
  console.log('  type-toggle:', getStepContent('leave-allocation-type-toggle'));
  console.log('  add-button:', getStepContent('leave-allocation-add-button'));

  return [
    {
      id: 'leave-allocation-welcome',
      title: getStepContent('leave-allocation-welcome').title || 'Welcome to Leave Allocation!',
      text: getStepContent('leave-allocation-welcome').description || "This page allows you to manage leave allocations for departments and employees. Let's explore all features.",
      attachTo: { element: '#tour-header', on: 'bottom' },
      buttons: [
        {
          text: 'Skip Tour',
          action: function (this: Tour) { this.cancel(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Start Tour',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-type-toggle',
      title: getStepContent('leave-allocation-type-toggle').title || '🔄 Allocation Type Toggle',
      text: getStepContent('leave-allocation-type-toggle').description || 'Switch between Department-Wise and Employee-Wise allocation. Department-Wise allocates to entire departments. Employee-Wise allocates to individual employees.',
      attachTo: { element: '#tour-allocation-type-toggle', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-employee-wise',
      title: getStepContent('leave-allocation-employee-wise').title || '👤 Employee-Wise Allocation',
      text: getStepContent('leave-allocation-employee-wise').description || 'Click this toggle to switch to Employee-Wise allocation mode. This shows employee column in the table.',
      attachTo: { element: '#tour-employee-wise', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next & Switch',
          action: function (this: Tour) {
            // Will be replaced by component
            this.next();
          }
        }
      ]
    },
    {
      id: 'leave-allocation-add-employee-allocation',
      title: getStepContent('leave-allocation-add-button').title || '➕ Add Employee Leave',
      text: getStepContent('leave-allocation-add-button').description || 'Click this button to open the employee leave allocation form.',
      attachTo: { element: '#tour-add-leave-allocation', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next & Open Form',
          action: function (this: Tour) {
            // Will be replaced by component
            this.next();
          }
        }
      ]
    },
    {
      id: 'leave-allocation-employee-form',
      title: getStepContent('leave-allocation-form').title || '📝 Employee Leave Form',
      text: getStepContent('leave-allocation-form').description || 'This form allows you to allocate leave to individual employees. Fill in all required fields.',
      attachTo: { element: '#tour-leave-allocation-form', on: 'top' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-employee-select',
      title: getStepContent('leave-allocation-employee-select').title || '👤 Select Employee',
      text: getStepContent('leave-allocation-employee-select').description || 'Choose the employee who will receive the leave allocation.',
      attachTo: { element: '#tour-emp-employee', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-department-select',
      title: getStepContent('leave-allocation-department-select').title || '🏢 Select Department',
      text: getStepContent('leave-allocation-department-select').description || 'Choose the department for this employee.',
      attachTo: { element: '#tour-dept-department', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-leave-type-select',
      title: getStepContent('leave-allocation-leave-type').title || '📋 Select Leave Type',
      text: getStepContent('leave-allocation-leave-type').description || 'Choose the type of leave (Annual, Sick, Emergency, Maternity, etc.).',
      attachTo: { element: '#tour-leave-type-select', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-year-input',
      title: getStepContent('leave-allocation-year').title || '📅 Year',
      text: getStepContent('leave-allocation-year').description || 'Enter the year for this allocation (default is current year).',
      attachTo: { element: '#tour-year-input', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-days-input',
      title: getStepContent('leave-allocation-days').title || '🔢 Number of Days',
      text: getStepContent('leave-allocation-days').description || 'Enter the number of leave days to allocate.',
      attachTo: { element: '#tour-days-input', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-save-button',
      title: getStepContent('leave-allocation-save').title || '💾 Save Allocation',
      text: getStepContent('leave-allocation-save').description || 'Click Save to create the leave allocation.',
      attachTo: { element: '#tour-save-allocation', on: 'top' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-cancel-button',
      title: getStepContent('leave-allocation-cancel').title || '❌ Cancel',
      text: getStepContent('leave-allocation-cancel').description || 'Click Cancel to close the form without saving.',
      attachTo: { element: '#tour-cancel-allocation', on: 'top' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) {
            // Will be replaced by component
            this.next();
          }
        }
      ]
    },
    {
      id: 'leave-allocation-table-employee-column',
      title: getStepContent('leave-allocation-employee-column').title || '👤 Employee Column',
      text: getStepContent('leave-allocation-employee-column').description || 'This column shows the employee name for each allocation.',
      attachTo: { element: '#tour-employee-column', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-table-department-column',
      title: getStepContent('leave-allocation-dept-column').title || '🏢 Department Column',
      text: getStepContent('leave-allocation-dept-column').description || 'This column shows the department for each allocation.',
      attachTo: { element: '#tour-department-column', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-table-leave-type-column',
      title: getStepContent('leave-allocation-leavetype-column').title || '📋 Leave Type Column',
      text: getStepContent('leave-allocation-leavetype-column').description || 'This column shows the type of leave allocated.',
      attachTo: { element: '#tour-leavetype-column', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-table-days-column',
      title: getStepContent('leave-allocation-days-column').title || '🔢 Days Column',
      text: getStepContent('leave-allocation-days-column').description || 'This column shows the number of days allocated.',
      attachTo: { element: '#tour-days-column', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-table-status-column',
      title: getStepContent('leave-allocation-status').title || '🔘 Status Column',
      text: getStepContent('leave-allocation-status').description || 'This column shows the status (Active/Inactive) of each allocation.',
      attachTo: { element: '#tour-status-column', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-table-actions-column',
      title: getStepContent('leave-allocation-actions').title || '⚡ Actions Column',
      text: getStepContent('leave-allocation-actions').description || 'Use Edit and Delete buttons to manage allocations.',
      attachTo: { element: '#tour-actions-column', on: 'left' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-switch-department-wise',
      title: getStepContent('leave-allocation-department-wise').title || '🔄 Switch to Department Mode',
      text: getStepContent('leave-allocation-department-wise').description || 'Click this toggle to switch back to Department-Wise allocation.',
      attachTo: { element: '#tour-department-wise', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next & Switch',
          action: function (this: Tour) {
            // Will be replaced by component
            this.next();
          }
        }
      ]
    },
    {
      id: 'leave-allocation-add-department-allocation',
      title: getStepContent('leave-allocation-add-button').title || '➕ Add Department Leave',
      text: getStepContent('leave-allocation-add-button').description || 'Click this button to open the department leave allocation form.',
      attachTo: { element: '#tour-add-leave-allocation', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next & Open Form',
          action: function (this: Tour) {
            // Will be replaced by component
            this.next();
          }
        }
      ]
    },
    {
      id: 'leave-allocation-dept-form',
      title: getStepContent('leave-allocation-form').title || '📝 Department Leave Form',
      text: getStepContent('leave-allocation-form').description || 'This form allows you to allocate leave to entire departments.',
      attachTo: { element: '#tour-leave-allocation-form', on: 'top' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-dept-department-select',
      title: getStepContent('leave-allocation-department-select').title || '🏢 Select Department',
      text: getStepContent('leave-allocation-department-select').description || 'Choose the department to allocate leave to.',
      attachTo: { element: '#tour-dept-department', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-dept-leave-type',
      title: getStepContent('leave-allocation-leave-type').title || '📋 Leave Type',
      text: getStepContent('leave-allocation-leave-type').description || 'Choose the type of leave to allocate.',
      attachTo: { element: '#tour-leave-type-select', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-dept-save',
      title: getStepContent('leave-allocation-save').title || '💾 Save',
      text: getStepContent('leave-allocation-save').description || 'Click Save to create the department allocation.',
      attachTo: { element: '#tour-save-allocation', on: 'top' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-allocation-dept-cancel',
      title: getStepContent('leave-allocation-cancel').title || '❌ Cancel',
      text: getStepContent('leave-allocation-cancel').description || 'Click Cancel to close the form.',
      attachTo: { element: '#tour-cancel-allocation', on: 'top' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish',
          action: function (this: Tour) {
            // Will be replaced by tour instance
          }
        }
      ]
    }
  ];
};

// Function to check if tour should start
export const shouldStartLeaveAllocationTour = (): boolean => {
  // Check if tour was triggered by sidebar navigation
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const isLeaveAllocationTrigger = triggerValue === 'leave-allocation' || triggerValue === 'true';
  
  // Check if tour was already completed in this session
  const isTourCompleted = sessionStorage.getItem('leaveAllocationTourCompleted') === 'true';
  
  // Return true only if triggered and not completed
  return isLeaveAllocationTrigger && !isTourCompleted;
};

// Function to create and start the tour
export const startLeaveAllocationTour = async (menuId?: number): Promise<void> => {
  // Check if tour was already completed in this session
  if (sessionStorage.getItem('leaveAllocationTourCompleted') === 'true') {
    console.log('Leave Allocation tour already completed in this session');
    sessionStorage.removeItem('triggerPageTour');
    return;
  }

  // Check if tour was triggered by sidebar navigation
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  if (triggerValue !== 'leave-allocation' && triggerValue !== 'true') {
    console.log('Leave Allocation tour not triggered by sidebar, skipping...');
    return;
  }

  // Get current page info including menuId
  const pageInfo = getPageInfo();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/HRMS/Leave-Management/Leave-Allocation';

  // Use provided menuId, or get from pageInfo, or from session storage
  let finalMenuId: number = menuId || pageInfo.menuId;

  // Try to get menuId from session storage if still not found
  if (!finalMenuId && typeof window !== 'undefined') {
    const storedMenuId = sessionStorage.getItem('triggerPageTourMenuId');
    if (storedMenuId) {
      finalMenuId = parseInt(storedMenuId) || 0;
    }
  }

  // If still no menuId, use default 166 for Leave Allocation
  if (!finalMenuId) {
    finalMenuId = 166;
  }

  console.log('[LeaveAllocation Tour] Starting tour with menuId:', finalMenuId);

  // Fetch tour steps from API
  const apiTourData = await fetchLeaveAllocationTourStepsFromAPI(finalMenuId);
  console.log('[LeaveAllocation Tour] API data fetched:', apiTourData.length, 'steps');

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom leave-allocation-tour',
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

  // Create tour steps with API data
  const tourSteps = createLeaveAllocationTourSteps(apiTourData);

  // Add all steps to the tour
  tourSteps.forEach(step => {
    tour.addStep(step);
  });

  // Log tour started
  logUserJourney({
    eventType: 'tour_started',
    stepKey: 'leave-allocation-welcome',
    menuId: finalMenuId,
    accessLink: currentPath,
  }).catch(err => console.error('Journey logging error:', err));

  // Handle step show events - log each step view
  tour.on('show', (e: any) => {
    const step = e.step;
    if (step && step.id) {
      logUserJourney({
        eventType: 'tour_step_view',
        stepKey: step.id,
        menuId: finalMenuId,
        accessLink: currentPath,
      }).catch(err => console.error('Journey logging error:', err));
    }
  });

  // Log step completion when user clicks Next or Finish
  const logStepComplete = (stepId: string): void => {
    const { menuId: stepMenuId, accessLink: stepAccessLink } = getPageInfo();
    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: stepId,
      menuId: stepMenuId || finalMenuId,
      accessLink: stepAccessLink || currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  };

  // Add step complete logging to all step buttons
  tourSteps.forEach((step) => {
    if (step.buttons) {
      step.buttons.forEach((button) => {
        const originalAction = button.action;
        if (originalAction && typeof originalAction === 'function') {
          const buttonText = button.text?.toLowerCase() || '';
          if (buttonText === 'next' || buttonText === 'finish tour' || buttonText === 'start tour') {
            button.action = function (this: Tour) {
              logStepComplete(step.id);
              originalAction.call(this);
            };
          }
        }
      });
    }
  });

  // Handle tour completion
  tour.on('complete', () => {
    sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Allocation tour completed');

    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: 'leave-allocation-complete',
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  });

  // Handle tour cancellation/skipped
  tour.on('cancel', () => {
    sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Allocation tour cancelled/skipped');

    logUserJourney({
      eventType: 'tour_skipped',
      stepKey: null,
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  });

  // Start the tour after a short delay to ensure DOM is ready
  setTimeout(() => {
    tour.start();
  }, 500);
};

// Export tour styles
export const leaveAllocationTourStyles = `
  .shepherd-theme-custom.leave-allocation-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title.leave-allocation-tour .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .shepherd-theme-custom.leave-allocation-tour .shepherd-element.highlighted {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = leaveAllocationTourStyles;
  styleSheet.id = 'leave-allocation-tour-styles';
  // Check if styles already exist
  if (!document.getElementById('leave-allocation-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
