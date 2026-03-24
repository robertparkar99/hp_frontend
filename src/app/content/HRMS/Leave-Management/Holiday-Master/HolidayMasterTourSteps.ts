import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Interface for API tour step data
interface HolidayMasterTourStepData {
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
    console.error('[HolidayMaster Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
export const fetchHolidayMasterTourStepsFromAPI = async (menuId: number): Promise<HolidayMasterTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[HolidayMaster Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[HolidayMaster Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[HolidayMaster Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: HolidayMasterTourStepData[] = [];

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
          console.log(`[HolidayMaster Tour] Found array data in response.${key}`);
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

    console.log('[HolidayMaster Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[HolidayMaster Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Tour step configuration interface
export interface HolidayMasterTourStep {
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
  beforeShowPromise?: () => Promise<void>;
}

// Create tour steps with API data override
export const createHolidayMasterTourSteps = (apiTourData?: HolidayMasterTourStepData[]): HolidayMasterTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[HolidayMaster Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || '';
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[HolidayMaster Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[HolidayMaster Tour] Using tour steps with API overrides');

  return [
    {
      id: 'holiday-welcome',
      title: apiStepsMap.get('holiday-welcome')?.title || 'Welcome to Holiday Master!',
      text: apiStepsMap.get('holiday-welcome')?.description || 'This page allows you to manage holidays and day-offs for your organization. Let me show you around.',
      attachTo: { element: '#holiday-header', on: 'bottom' },
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
      id: 'holiday-add-button',
      title: apiStepsMap.get('holiday-add-button')?.title || 'Add New Holiday',
      text: apiStepsMap.get('holiday-add-button')?.description || 'Click this button to add a new holiday. You can specify the holiday name, date, and departments.',
      attachTo: { element: '#holiday-add-button', on: 'left' },
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
      id: 'holiday-stats',
      title: apiStepsMap.get('holiday-stats')?.title || 'Quick Statistics',
      text: apiStepsMap.get('holiday-stats')?.description || "These cards show quick stats: Total Holidays, This Month's holidays, Upcoming events, and Past events.",
      attachTo: { element: '#holiday-stats', on: 'bottom' },
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
      id: 'holiday-tabs',
      title: apiStepsMap.get('holiday-tabs')?.title || 'Holidays & Day Offs',
      text: apiStepsMap.get('holiday-tabs')?.description || 'Switch between "Holidays" tab to manage holidays and "Day Offs" tab to configure weekly day off settings.',
      attachTo: { element: '#holiday-tabs', on: 'bottom' },
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
      id: 'holiday-holidays-list',
      title: apiStepsMap.get('holiday-holidays-list')?.title || 'Holiday List',
      text: apiStepsMap.get('holiday-holidays-list')?.description || 'Here you can see all holidays. Each card shows the holiday name, type, departments, and date. You can also delete holidays from here.',
      attachTo: { element: '#holiday-list-container', on: 'top' },
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
      id: 'holiday-delete-action',
      title: apiStepsMap.get('holiday-delete-action')?.title || 'Delete Holiday',
      text: apiStepsMap.get('holiday-delete-action')?.description || 'Hover over a holiday card to reveal the delete button. Use this to remove holidays.',
      attachTo: { element: '.delete-holiday-btn', on: 'left' },
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
      id: 'holiday-dayoffs-tab',
      title: apiStepsMap.get('holiday-dayoffs-tab')?.title || 'Day Offs Configuration',
      text: apiStepsMap.get('holiday-dayoffs-tab')?.description || 'Switch to the "Day Offs" tab to configure weekly day off settings for your organization.',
      attachTo: { element: '#dayoffs-tab', on: 'bottom' },
      beforeShowPromise: () => {
        return new Promise<void>(resolve => {
          // Auto-select the Day Offs tab
          const dayoffsTab = document.getElementById('dayoffs-tab');
          if (dayoffsTab) {
            dayoffsTab.click();
          }
          // Small delay to allow tab switch animation
          setTimeout(() => resolve(), 100);
        });
      },
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
      id: 'holiday-dayoffs-days',
      title: apiStepsMap.get('holiday-dayoffs-days')?.title || 'Day Selection',
      text: apiStepsMap.get('holiday-dayoffs-days')?.description || 'For each day of the week, select whether it should be a Full Day, Half Day, or Weekend.',
      attachTo: { element: '#dayoffs-selections', on: 'top' },
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
      id: 'holiday-dayoffs-submit',
      title: apiStepsMap.get('holiday-dayoffs-submit')?.title || 'Save Day Offs',
      text: apiStepsMap.get('holiday-dayoffs-submit')?.description || 'After configuring day offs, click this button to save your changes.',
      attachTo: { element: '#dayoffs-submit', on: 'top' },
      buttons: [
        {
          text: 'Back',
          action: function (this: Tour) { this.back(); },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish',
          action: function (this: Tour) { this.complete(); },
          classes: 'shepherd-button-primary'
        }
      ]
    }
  ];
};

// Export default tour steps for backward compatibility
export const holidayMasterTourSteps: HolidayMasterTourStep[] = createHolidayMasterTourSteps();

// Create and configure the tour
export const createHolidayMasterTour = (): Tour => {
  return new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom',
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
};

// Check if tour should be triggered
export const shouldStartHolidayTour = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if triggered from sidebar tour
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const isHolidayMasterTrigger = triggerValue === 'holiday-master' || 
                                  triggerValue === 'holiday-Master' ||
                                  window.location.href.includes('holiday-master');
  
  // Don't start if tour already completed
  const tourCompleted = sessionStorage.getItem('holidayMasterTourCompleted');
  
  return isHolidayMasterTrigger && !tourCompleted;
};

// Mark tour as completed
export const completeHolidayMasterTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('holidayMasterTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
  }
};

// Reset tour (for testing)
export const resetHolidayMasterTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('holidayMasterTourCompleted');
    sessionStorage.removeItem('triggerPageTour');
  }
};
