import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface LeaveTypeTourStepData {
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
    console.error('[LeaveType Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchLeaveTypeTourStepsFromAPI = async (menuId: number): Promise<LeaveTypeTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[LeaveType Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[LeaveType Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[LeaveType Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: LeaveTypeTourStepData[] = [];

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
          console.log(`[LeaveType Tour] Found array data in response.${key}`);
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

    console.log('[LeaveType Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[LeaveType Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Custom interface for tour steps (extends Shepherd options with id)
export interface LeaveTypeTourStep {
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

// Function to create tour steps with optional API data
export const createLeaveTypeTourSteps = (apiTourData?: LeaveTypeTourStepData[]): LeaveTypeTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[LeaveType Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || '';
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[LeaveType Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[LeaveType Tour] Using tour steps with API overrides');

  return [
    {
      id: 'leave-type-welcome',
      title: apiStepsMap.get('leave-type-welcome')?.title || 'Welcome to Leave Types Management!',
      text: apiStepsMap.get('leave-type-welcome')?.description || 'This page allows you to manage all leave types for your organization. Let me show you around.',
      attachTo: { element: '#tour-header', on: 'bottom' },
      buttons: [
        {
          text: 'Skip Tour',
          action: function (this: Tour) {
            sessionStorage.setItem('leaveTypeTourCompleted', 'true');
            sessionStorage.removeItem('triggerPageTour');
            this.cancel();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Start Tour',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-type-add-button',
      title: apiStepsMap.get('leave-type-add-button')?.title || '➕ Add Leave Type',
      text: apiStepsMap.get('leave-type-add-button')?.description || 'Click this button to open the leave type creation form. You can add new leave types like Annual Leave, Sick Leave, Casual Leave, etc.',
      attachTo: { element: '#tour-add-leave-type', on: 'bottom' },
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
      id: 'leave-type-form',
      title: apiStepsMap.get('leave-type-form')?.title || '📝 Leave Type Form',
      text: apiStepsMap.get('leave-type-form')?.description || 'This form allows you to create or edit leave types. Fill in the Leave Type ID, Name, Sort Order, and Status.',
      attachTo: { element: '#tour-leave-type-form', on: 'top' },
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
      id: 'leave-type-id',
      title: apiStepsMap.get('leave-type-id')?.title || '🏷️ Leave Type ID',
      text: apiStepsMap.get('leave-type-id')?.description || 'Enter a unique identifier for this leave type (e.g., LTY001, EL for Earned Leave). This helps in organizing leave types.',
      attachTo: { element: '#tour-leave-type-id', on: 'bottom' },
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
      id: 'leave-type-name',
      title: apiStepsMap.get('leave-type-name')?.title || '📋 Leave Type Name',
      text: apiStepsMap.get('leave-type-name')?.description || 'Enter the display name for this leave type (e.g., Annual Leave, Sick Leave, Casual Leave, Maternity Leave).',
      attachTo: { element: '#tour-leave-type-name', on: 'bottom' },
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
      id: 'leave-type-sort-order',
      title: apiStepsMap.get('leave-type-sort-order')?.title || '🔢 Sort Order',
      text: apiStepsMap.get('leave-type-sort-order')?.description || 'Enter a number to determine the display order of this leave type in lists. Lower numbers appear first.',
      attachTo: { element: '#tour-leave-type-sort-order', on: 'bottom' },
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
      id: 'leave-type-status',
      title: apiStepsMap.get('leave-type-status')?.title || '🔘 Status',
      text: apiStepsMap.get('leave-type-status')?.description || 'Set the status as Active or Inactive. Inactive leave types will not be available for leave requests.',
      attachTo: { element: '#tour-leave-type-status', on: 'bottom' },
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
      id: 'leave-type-submit',
      title: apiStepsMap.get('leave-type-submit')?.title || '💾 Submit Button',
      text: apiStepsMap.get('leave-type-submit')?.description || 'Click Submit to save the new leave type, or Update if you are editing an existing leave type.',
      attachTo: { element: '#tour-leave-type-submit', on: 'top' },
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
      id: 'leave-type-cancel',
      title: apiStepsMap.get('leave-type-cancel')?.title || '❌ Cancel Button',
      text: apiStepsMap.get('leave-type-cancel')?.description || 'Click Cancel to close the form without saving any changes.',
      attachTo: { element: '#tour-leave-type-cancel', on: 'top' },
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
      id: 'leave-type-table',
      title: apiStepsMap.get('leave-type-table')?.title || '📊 Leave Types Table',
      text: apiStepsMap.get('leave-type-table')?.description || 'This table displays all your leave types. You can search, filter, and view details of each leave type here.',
      attachTo: { element: '#tour-leave-type-table', on: 'top' },
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
      id: 'leave-type-search',
      title: apiStepsMap.get('leave-type-search')?.title || '🔍 Search Filters',
      text: apiStepsMap.get('leave-type-search')?.description || 'Use the input fields in each column header to search and filter leave types by ID, Name, Sort Order, or Status.',
      attachTo: { element: '#tour-leave-type-table', on: 'top' },
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
      id: 'leave-type-srno',
      title: apiStepsMap.get('leave-type-srno')?.title || '🔢 Sr No.',
      text: apiStepsMap.get('leave-type-srno')?.description || 'This column shows the serial number of each leave type entry. You can sort leave types by their order here.',
      attachTo: { element: '#tour-leave-type-srno', on: 'bottom' },
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
      id: 'leave-type-id-column',
      title: apiStepsMap.get('leave-type-id-column')?.title || '🏷️ Leave Type ID Column',
      text: apiStepsMap.get('leave-type-id-column')?.description || 'This column displays the unique identifier for each leave type. Use the search input to filter by Leave Type ID.',
      attachTo: { element: '#tour-leave-type-id-column', on: 'bottom' },
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
      id: 'leave-type-name-column',
      title: apiStepsMap.get('leave-type-name-column')?.title || '📋 Leave Type Name Column',
      text: apiStepsMap.get('leave-type-name-column')?.description || 'This column shows the display name of each leave type. You can search and filter by leave type name here.',
      attachTo: { element: '#tour-leave-type-name-column', on: 'bottom' },
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
      id: 'leave-type-sort-column',
      title: apiStepsMap.get('leave-type-sort-column')?.title || '🔢 Sort Order Column',
      text: apiStepsMap.get('leave-type-sort-column')?.description || 'This column displays the sort order number for each leave type. Use the search input to filter by sort order.',
      attachTo: { element: '#tour-leave-type-sort-column', on: 'bottom' },
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
      id: 'leave-type-status-column',
      title: apiStepsMap.get('leave-type-status-column')?.title || '🔘 Status Column',
      text: apiStepsMap.get('leave-type-status-column')?.description || 'This column shows the status (Active/Inactive) of each leave type. Use the search input to filter by status.',
      attachTo: { element: '#tour-leave-type-status-column', on: 'bottom' },
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
      id: 'leave-type-actions',
      title: apiStepsMap.get('leave-type-actions')?.title || '⚡ Actions',
      text: apiStepsMap.get('leave-type-actions')?.description || 'Use the action buttons to Edit or Delete a leave type. Edit modifies existing details, while Delete removes the leave type.',
      attachTo: { element: '#tour-leave-type-actions', on: 'left' },
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
      id: 'leave-type-pagination',
      title: apiStepsMap.get('leave-type-pagination')?.title || '📄 Pagination',
      text: apiStepsMap.get('leave-type-pagination')?.description || 'Use these controls to navigate through multiple pages of leave types. You can also change the number of rows per page.',
      attachTo: { element: '#tour-leave-type-table', on: 'bottom' },
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
      id: 'leave-type-complete',
      title: apiStepsMap.get('leave-type-complete')?.title || '🎉 Tour Complete!',
      text: apiStepsMap.get('leave-type-complete')?.description || 'Congratulations! You now know how to manage leave types. Click Finish to close this tour.',
      attachTo: { element: '#tour-add-leave-type', on: 'bottom' },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish Tour',
          action: function (this: Tour) {
            // Mark tour as completed in sessionStorage
            sessionStorage.setItem('leaveTypeTourCompleted', 'true');
            sessionStorage.removeItem('triggerPageTour');
            this.complete();
          }
        }
      ]
    }
  ];
};

// Export for backwards compatibility
export const leaveTypeTourSteps = createLeaveTypeTourSteps();

// Function to create and start the tour
export const startLeaveTypeTour = async (menuId?: number): Promise<void> => {
  // Check if tour was already completed in this session
  if (sessionStorage.getItem('leaveTypeTourCompleted') === 'true') {
    console.log('Leave Type tour already completed in this session');
    sessionStorage.removeItem('triggerPageTour');
    return;
  }

  // Get current page info including menuId
  const pageInfo = getPageInfo();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/HRMS/Leave-Management/Leave-Type';

  // Use provided menuId, or get from pageInfo, or from session storage
  let finalMenuId: number = menuId || pageInfo.menuId;

  // Try to get menuId from session storage if still not found
  if (!finalMenuId && typeof window !== 'undefined') {
    const storedMenuId = sessionStorage.getItem('triggerPageTourMenuId');
    if (storedMenuId) {
      finalMenuId = parseInt(storedMenuId) || 0;
    }
  }

  // Fetch tour steps from API (menu_id = 165 for Leave Type)
  const apiTourData = await fetchLeaveTypeTourStepsFromAPI(165);
  console.log('[LeaveType Tour] API tour data fetched:', apiTourData);

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom leave-type-tour',
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

  // Get tour steps with API data
  const tourSteps = createLeaveTypeTourSteps(apiTourData);

  // Add all steps to the tour
  tourSteps.forEach(step => {
    tour.addStep(step as any);
  });

  // Log tour started
  logUserJourney({
    eventType: 'tour_started',
    stepKey: 'leave-type-welcome',
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
    const { menuId, accessLink } = getPageInfo();
    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: stepId,
      menuId: menuId || finalMenuId,
      accessLink: accessLink || currentPath,
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
    sessionStorage.setItem('leaveTypeTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Type tour completed');

    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: 'leave-type-complete',
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  });

  // Handle tour cancellation/skipped
  tour.on('cancel', () => {
    sessionStorage.setItem('leaveTypeTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('Leave Type tour cancelled/skipped');

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
export const leaveTypeTourStyles = `
  .shepherd-theme-custom.leave-type-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title.leave-type-tour .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .shepherd-theme-custom.leave-type-tour .shepherd-element.highlighted {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = leaveTypeTourStyles;
  styleSheet.id = 'leave-type-tour-styles';
  // Check if styles already exist
  if (!document.getElementById('leave-type-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
