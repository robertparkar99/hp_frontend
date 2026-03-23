import Shepherd, { StepOptions, Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Type for tour step data from API
interface MonthlyPayrollTourStepData {
  on_click?: string;
  onClick?: string;
  step_key?: string;
  stepKey?: string;
  id?: number | string;
  title?: string;
  Title?: string;
  name?: string;
  step_title?: string;
  stepTitle?: string;
  description?: string;
  Description?: string;
  text?: string;
  Text?: string;
  content?: string;
  step_description?: string;
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
    console.error('[Monthly Payroll Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchMonthlyPayrollTourStepsFromAPI = async (menuId: number): Promise<MonthlyPayrollTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[Monthly Payroll Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[Monthly Payroll Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[Monthly Payroll Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: MonthlyPayrollTourStepData[] = [];

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
          console.log(`[Monthly Payroll Tour] Found array data in response.${key}`);
          break;
        }
      }
    }

    console.log('[Monthly Payroll Tour] Parsed tour data:', tourData);
    return tourData;
  } catch (error) {
    console.error('[Monthly Payroll Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Extend Shepherd interface to include our custom properties for StepOptions
declare module 'shepherd.js' {
  interface StepOptions {
    id?: string;
    title?: string;
    text?: string | string[];
    attachTo?: {
      element: string | HTMLElement;
      on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    };
    buttons?: ButtonOptions[];
    classes?: string;
    cancelIcon?: {
      enabled?: boolean;
      label?: string;
    };
    scrollTo?: boolean | {
      behavior?: 'smooth' | 'auto';
      block?: 'start' | 'center' | 'end';
    };
    when?: {
      show?: () => void;
      hide?: () => void;
    };
  }
  
  interface ButtonOptions {
    action?: ((this: Tour, e: Event) => void) | string;
    classes?: string;
    text?: string;
    type?: string;
  }
}

// Helper functions for button actions with correct Shepherd.js signature
const cancelAction = function(this: Tour) {
  this.cancel();
};

const backAction = function(this: Tour) {
  this.back();
};

const nextAction = function(this: Tour) {
  this.next();
};

// Function to generate tour steps with API overrides
export const getMonthlyPayrollTourSteps = (apiTourData?: MonthlyPayrollTourStepData[]): StepOptions[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[Monthly Payroll Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData: MonthlyPayrollTourStepData) => {
      const stepId = stepData.on_click || stepData.onClick || stepData.step_key || stepData.stepKey || String(stepData.id) || '';
      const stepTitle = stepData.title || stepData.Title || stepData.name || stepData.step_title || stepData.stepTitle || '';
      const stepDescription = stepData.description || stepData.Description || stepData.text || stepData.Text || stepData.content || stepData.step_description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[Monthly Payroll Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[Monthly Payroll Tour] Using default tour steps with API overrides');

  return [
    {
      id: 'tour-welcome',
      title: apiStepsMap.get('tour-welcome')?.title || 'Welcome to Monthly Payroll Management',
      text: apiStepsMap.get('tour-welcome')?.description || 'This tour will guide you through all the features of the Monthly Payroll management system. Click "Next" to begin.',
      attachTo: { element: '#monthly-payroll-title', on: 'bottom' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-secondary',
          text: 'Skip Tour',
          action: cancelAction
        },
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Start Tour',
          action: nextAction
        }
      ]
    },
    {
      id: 'tour-employee-selector',
      title: apiStepsMap.get('tour-employee-selector')?.title || '🎯 Employee Selection',
      text: apiStepsMap.get('tour-employee-selector')?.description || 'Use this section to select employees for payroll processing. You can filter by department and select specific employees using the dropdown.',
      attachTo: { element: '#employee-selector-container', on: 'bottom' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-secondary',
          text: 'Back',
          action: backAction
        },
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Next',
          action: nextAction
        }
      ]
    },
    {
      id: 'tour-month-selection',
      title: apiStepsMap.get('tour-month-selection')?.title || '📅 Month Selection',
      text: apiStepsMap.get('tour-month-selection')?.description || 'Select the month for which you want to process payroll. The dropdown contains all 12 months.',
      attachTo: { element: '#month-select', on: 'bottom' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-secondary',
          text: 'Back',
          action: backAction
        },
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Next',
          action: nextAction
        }
      ]
    },
    {
      id: 'tour-year-selection',
      title: apiStepsMap.get('tour-year-selection')?.title || '📆 Year Selection',
      text: apiStepsMap.get('tour-year-selection')?.description || 'Select the financial year for payroll processing. The system provides a range of years to choose from.',
      attachTo: { element: '#year-select', on: 'bottom' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-secondary',
          text: 'Back',
          action: backAction
        },
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Next',
          action: nextAction
        }
      ]
    },
    {
      id: 'tour-search-button',
      title: apiStepsMap.get('tour-search-button')?.title || '🔍 Search Button',
      text: apiStepsMap.get('tour-search-button')?.description || 'Click this button to fetch employee payroll data based on your selected filters. The button shows "Searching..." while loading.',
      attachTo: { element: '#search-button', on: 'bottom' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-secondary',
          text: 'Back',
          action: backAction
        },
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Next',
          action: nextAction
        }
      ]
    },
    {
      id: 'tour-payroll-table',
      title: apiStepsMap.get('tour-payroll-table')?.title || '📊 Payroll Data Table',
      text: apiStepsMap.get('tour-payroll-table')?.description || 'After searching, this table will display all employee payroll data. You can sort columns by clicking on headers and filter data using the search inputs.',
      attachTo: { element: '#payroll-data-table', on: 'top' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-secondary',
          text: 'Back',
          action: backAction
        },
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Next',
          action: nextAction
        }
      ]
    },
    {
      id: 'tour-submit-payroll',
      title: apiStepsMap.get('tour-submit-payroll')?.title || '✅ Submit Payroll',
      text: apiStepsMap.get('tour-submit-payroll')?.description || 'Click this button to save all payroll data. Once submitted, you can generate PDF salary slips and the records become locked for deletion. The button is disabled if no data is available.',
      attachTo: { element: '#submit-payroll-button', on: 'top' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-secondary',
          text: 'Back',
          action: backAction
        },
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Next',
          action: nextAction
        }
      ]
    },
    {
      id: 'tour-complete',
      title: apiStepsMap.get('tour-complete')?.title || '🎉 Tour Complete!',
      text: apiStepsMap.get('tour-complete')?.description || 'Congratulations! You have completed the Monthly Payroll Management tour. You can now efficiently manage payroll processing for your organization. Click "Done" to close.',
      attachTo: { element: '#monthly-payroll-title', on: 'bottom' },
      buttons: [
        {
          classes: 'shepherd-button shepherd-button-primary',
          text: 'Done',
          action: nextAction
        }
      ]
    }
  ];
};

// Keep backward compatibility - export default steps (without API data)
export const MonthlyPayrollTourSteps: StepOptions[] = getMonthlyPayrollTourSteps();

// Function to create and configure the tour (async to fetch API data)
export const createMonthlyPayrollTour = async (menuId?: number, accessLink?: string): Promise<Tour> => {
  // Default menuId to 140 for Monthly Payroll
  const menuIdToUse = menuId || 140;
  
  // Fetch API data first
  console.log('[Monthly Payroll Tour] Fetching tour steps from API with menuId:', menuIdToUse);
  const apiTourData = await fetchMonthlyPayrollTourStepsFromAPI(menuIdToUse);
  console.log('[Monthly Payroll Tour] API tour data fetched:', apiTourData.length, 'steps');

  // Get steps with API overrides
  const steps = getMonthlyPayrollTourSteps(apiTourData);
  console.log('[Monthly Payroll Tour] Tour steps created:', steps.length);

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom monthly-payroll-tour',
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

  // Add steps to the tour with journey logging for button clicks
  steps.forEach((step) => {
    const modifiedButtons = step.buttons?.map((btn: any) => ({
      ...btn,
      action: function(this: Tour) {
        // Log step completion when user clicks Next or Finish
        const buttonText = btn.text?.toLowerCase() || '';
        if (buttonText === 'next' || buttonText === 'start tour' || buttonText === 'done' || buttonText === 'finish tour') {
          logUserJourney({
            eventType: 'tour_step_complete',
            stepKey: step.id || 'monthly-payroll-step',
            menuId: menuIdToUse,
            accessLink: accessLink || '/HRMS/Payroll/Monthly-Payroll',
          }).catch(err => console.error('Journey logging error:', err));
        }

        // Execute original action
        if (btn.action) {
          btn.action.call(this, this);
        }
      }
    }));

    tour.addStep({
      ...step,
      buttons: modifiedButtons
    } as any);
  });

  return tour;
};

// Custom styles for the tour
export const monthlyPayrollTourStyles = `
  /* Base shepherd styles */
  .shepherd-element {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    z-index: 9999 !important;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
    color: white;
    border-radius: 8px 8px 0 0;
    padding: 12px 16px;
  }

  .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    padding: 16px 20px;
    margin: 0;
  }

  /* Button base styles */
  .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-weight: 500;
    font-size: 14px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0 4px;
    min-width: 80px;
    pointer-events: auto !important;
  }

  .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 229, 0.3);
  }

  .shepherd-button:active {
    transform: translateY(0);
  }

  /* Secondary button styles */
  .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-button-secondary:hover {
    background: #5a6268 !important;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
  }

  /* Primary button styles */
  .shepherd-button-primary {
    background: #007BE5 !important;
  }

  .shepherd-button-primary:hover {
    background: #0056b3 !important;
  }

  /* Cancel icon */
  .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
    opacity: 0.8;
    cursor: pointer;
    pointer-events: auto !important;
  }

  .shepherd-cancel-icon:hover {
    opacity: 1;
  }

  /* Main element */
  .shepherd-element {
    box-shadow: 0 10px 40px rgba(0, 123, 229, 0.25);
    border-radius: 12px;
    max-width: 400px;
    background: white;
    overflow: hidden;
    pointer-events: auto !important;
  }

  /* Arrow styles */
  .shepherd-arrow:before {
    background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
  }

  /* Modal overlay */
  .shepherd-modal-overlay {
    background: rgba(0, 0, 0, 0.5);
    opacity: 0.5;
    pointer-events: auto !important;
  }

  /* Animation */
  @keyframes shepherd-scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .shepherd-element {
    animation: shepherd-scale-in 0.3s ease-out;
  }

  /* Footer styles */
  .shepherd-footer {
    padding: 12px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    pointer-events: auto !important;
  }

  /* Header styles */
  .shepherd-header {
    pointer-events: auto !important;
  }

  /* Ensure all interactive elements are clickable */
  .shepherd-content {
    pointer-events: auto !important;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('monthly-payroll-tour-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'monthly-payroll-tour-styles';
    styleSheet.textContent = monthlyPayrollTourStyles;
    document.head.appendChild(styleSheet);
  }
}
