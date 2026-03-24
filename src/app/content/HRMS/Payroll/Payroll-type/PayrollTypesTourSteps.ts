import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface PayrollTypesTourStepData {
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
    console.error('[PayrollTypes Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
export const fetchPayrollTypesTourStepsFromAPI = async (menuId: number): Promise<PayrollTypesTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[PayrollTypes Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[PayrollTypes Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[PayrollTypes Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: PayrollTypesTourStepData[] = [];

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
          console.log(`[PayrollTypes Tour] Found array data in response.${key}`);
          break;
        }
      }
    }

    // Normalize field names
    const normalizedTourData = tourData.map((step: any) => ({
      on_click: step.on_click || step.onClick || step.step_key || step.stepKey || step.id,
      title: step.title || step.Title || step.name || step.step_title || step.stepTitle || '',
      description: step.description || step.Description || step.text || step.Text || step.content || step.step_description || ''
    }));

    console.log('[PayrollTypes Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[PayrollTypes Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Define step options with title support
interface PayrollTypeTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: (this: Tour) => void;
    classes?: string;
  }>;
  advanceOn?: {
    selector: string;
    event: string;
  };
  when?: {
    show?: () => void;
    hide?: () => void;
  };
  beforeShowPromise?: () => Promise<void>;
}

// Create tour steps with API data override
export const createPayrollTypesTourSteps = (apiTourData?: PayrollTypesTourStepData[]): PayrollTypeTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[PayrollTypes Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || '';
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[PayrollTypes Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[PayrollTypes Tour] Using tour steps with API overrides');

  return [
    {
      id: 'payroll-types-header',
      title: apiStepsMap.get('payroll-types-header')?.title || '👋 Welcome to Payroll Types',
      text: apiStepsMap.get('payroll-types-header')?.description || 'This page allows you to manage payroll components like earnings and deductions. Let\'s explore the features together!',
      attachTo: { element: '#payroll-types-header', on: 'bottom' },
      buttons: [
        {
          text: 'Skip',
          action: function (this: Tour) { this.cancel(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'add-payroll-type-btn',
      title: apiStepsMap.get('add-payroll-type-btn')?.title || '➕ Add Payroll Type',
      text: apiStepsMap.get('add-payroll-type-btn')?.description || 'Click here to add a new payroll type. You can create earning components (like basic salary, HRA, etc.) or deduction components (like PF, TDS, etc.).',
      attachTo: { element: '#add-payroll-type-btn', on: 'bottom' },
      buttons: [
        {
          text: 'Back',
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
      id: 'summary-cards',
      title: apiStepsMap.get('summary-cards')?.title || '📊 Summary Cards',
      text: apiStepsMap.get('summary-cards')?.description || 'These cards show quick statistics:\n• Total Types: All payroll components\n• Active Types: Currently active components\n• Earnings vs Deductions: Ratio of earning to deduction types',
      attachTo: { element: '#summary-cards', on: 'bottom' },
      buttons: [
        {
          text: 'Back',
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
      id: 'search-filter',
      title: apiStepsMap.get('search-filter')?.title || '🔍 Global Search',
      text: apiStepsMap.get('search-filter')?.description || 'Use this search bar to find payroll types by name, type, or amount type. Results update instantly as you type.',
      attachTo: { element: '#search-filter', on: 'bottom' },
      buttons: [
        {
          text: 'Back',
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
      id: 'payroll-types-table',
      title: apiStepsMap.get('payroll-types-table')?.title || '📋 Payroll Types Data Table',
      text: apiStepsMap.get('payroll-types-table')?.description || 'This table displays all your payroll types with all details. Use pagination at the bottom to navigate through records.',
      attachTo: { element: '#payroll-types-table', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'table-title',
      title: apiStepsMap.get('table-title')?.title || '📝 Table Title',
      text: apiStepsMap.get('table-title')?.description || 'This shows the current count of payroll types matching your filters. Use column filters to narrow down results.',
      attachTo: { element: '#table-title', on: 'bottom' },
      buttons: [
        {
          text: 'Back',
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
      id: 'column-filters',
      title: apiStepsMap.get('column-filters')?.title || '🎯 Column-wise Filtering',
      text: apiStepsMap.get('column-filters')?.description || 'Each column has its own search input. Type in any column header (Type, Name, Amount Type, etc.) to filter results for that specific field.',
      attachTo: { element: '#column-filters', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'srno-column',
      title: apiStepsMap.get('srno-column')?.title || '🔢 Sr.No Column',
      text: apiStepsMap.get('srno-column')?.description || 'This shows the serial number of each record. Click column headers to sort by that field.',
      attachTo: { element: '#srno-column', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'type-column',
      title: apiStepsMap.get('type-column')?.title || '📌 Type Column',
      text: apiStepsMap.get('type-column')?.description || 'This column shows whether the payroll component is an "Earning" (green badge) or "Deduction" (orange badge). Click the column header to sort alphabetically.',
      attachTo: { element: '#type-column', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'name-column',
      title: apiStepsMap.get('name-column')?.title || '📛 Name Column',
      text: apiStepsMap.get('name-column')?.description || 'This shows the payroll name (e.g., Basic Salary, HRA, PF, etc.). Click header to sort alphabetically.',
      attachTo: { element: '#name-column', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'amount-type-column',
      title: apiStepsMap.get('amount-type-column')?.title || '💰 Amount Type Column',
      text: apiStepsMap.get('amount-type-column')?.description || 'Shows whether the amount is "Fixed" (specific amount) or "Percentage" (percentage of salary). Click header to sort.',
      attachTo: { element: '#amount-type-column', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'amount-percentage-column',
      title: apiStepsMap.get('amount-percentage-column')?.title || '📈 Amount / Percentage Column',
      text: apiStepsMap.get('amount-percentage-column')?.description || 'Displays the fixed amount or percentage value for this payroll component. Empty cells are shown as "-".',
      attachTo: { element: '#amount-percentage-column', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'day-count-column',
      title: apiStepsMap.get('day-count-column')?.title || '📅 Day Wise Count Column',
      text: apiStepsMap.get('day-count-column')?.description || 'Indicates if this payroll type considers day-wise count. "Yes" (green) means it does, "No" (orange) means it doesn\'t.',
      attachTo: { element: '#day-count-column', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'status-column',
      title: apiStepsMap.get('status-column')?.title || '✅ Status Column',
      text: apiStepsMap.get('status-column')?.description || 'Shows whether the payroll type is "Active" (green) or "Inactive" (red). Inactive types are not used in payroll calculations.',
      attachTo: { element: '#status-column', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'actions-cell',
      title: apiStepsMap.get('actions-cell')?.title || '⚡ Actions Column',
      text: apiStepsMap.get('actions-cell')?.description || 'Use these buttons to:\n• Edit (blue): Modify the payroll type\n• Delete (red): Remove the payroll type\n⚠️ Deletion cannot be undone!',
      attachTo: { element: '#actions-cell', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'pagination',
      title: apiStepsMap.get('pagination')?.title || '📄 Pagination',
      text: apiStepsMap.get('pagination')?.description || 'Navigate through multiple pages of payroll types. You can change rows per page using the dropdown.',
      attachTo: { element: '#pagination', on: 'top' },
      buttons: [
        {
          text: 'Back',
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
      id: 'column-filters-tip',
      title: apiStepsMap.get('column-filters-tip')?.title || '💡 Pro Tip',
      text: apiStepsMap.get('column-filters-tip')?.description || 'Combine global search with column filters for precise results. Clear filters by clicking the X in each column input.',
      attachTo: { element: '#column-filters-tip', on: 'top' },
      buttons: [
        {
          text: 'Back',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish',
          action: function (this: Tour) { this.complete(); }
        }
      ]
    }
  ];
};

// Export default tour steps for backward compatibility
export const payrollTypesTourSteps: PayrollTypeTourStep[] = createPayrollTypesTourSteps();

// Function to initialize and start the tour with API data
export const startPayrollTypesTour = async (menuId?: number): Promise<void> => {
  // Check if tour was already completed in this session
  const tourCompleted = sessionStorage.getItem('payrollTypesTourCompleted');
  if (tourCompleted) {
    console.log('Payroll Types tour already completed, skipping...');
    return;
  }

  // Get current page info including menuId
  const pageInfo = getPageInfo();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/HRMS/Payroll/Payroll-type';

  // Use provided menuId, or get from pageInfo, or from session storage
  let finalMenuId: number = menuId || pageInfo.menuId;

  // Try to get menuId from session storage if still not found
  if (!finalMenuId && typeof window !== 'undefined') {
    const storedMenuId = sessionStorage.getItem('triggerPageTourMenuId');
    if (storedMenuId) {
      finalMenuId = parseInt(storedMenuId) || 0;
    }
  }

  // Use menu_id 105 for Payroll Types
  const apiMenuId = finalMenuId || 105;

  // Fetch tour steps from API
  console.log('[PayrollTypes Tour] Fetching API data with menu_id:', apiMenuId);
  const apiTourData = await fetchPayrollTypesTourStepsFromAPI(apiMenuId);

  // Create tour steps with API data override
  const tourSteps = createPayrollTypesTourSteps(apiTourData);

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom',
      scrollTo: {
        behavior: 'smooth',
        block: 'center'
      },
      modalOverlayOpeningPadding: 10,
      modalOverlayOpeningRadius: 8
    },
    useModalOverlay: true,
    exitOnEsc: true,
    keyboardNavigation: true
  });

  // Add all steps to the tour
  tourSteps.forEach(step => {
    tour.addStep(step);
  });

  // Log tour started
  logUserJourney({
    eventType: 'tour_started',
    stepKey: 'payroll-types-header',
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
          if (buttonText === 'next' || buttonText === 'finish') {
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
    sessionStorage.setItem('payrollTypesTourCompleted', 'true');
    console.log('Payroll Types tour completed!');

    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: 'payroll-types-complete',
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  });

  // Handle tour cancellation
  tour.on('cancel', () => {
    sessionStorage.setItem('payrollTypesTourCompleted', 'true');
    console.log('Payroll Types tour cancelled');

    logUserJourney({
      eventType: 'tour_skipped',
      stepKey: null,
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  });

  // Start the tour
  tour.start();
};

// Function to check if tour should be triggered
export const shouldStartPayrollTypesTour = (): boolean => {
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const tourCompleted = sessionStorage.getItem('payrollTypesTourCompleted');
  
  // Start tour if triggered via sidebar and not yet completed
  if (triggerValue === 'payroll-types' && !tourCompleted) {
    // Clear the trigger after reading
    sessionStorage.removeItem('triggerPageTour');
    return true;
  }
  
  return false;
};

// Function to mark tour as not completed (for testing/reset)
export const resetPayrollTypesTour = (): void => {
  sessionStorage.removeItem('payrollTypesTourCompleted');
};
