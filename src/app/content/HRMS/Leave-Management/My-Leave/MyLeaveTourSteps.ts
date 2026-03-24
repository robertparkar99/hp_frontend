import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Interface for API tour step data
interface MyLeaveTourStepData {
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
    console.error('[MyLeave Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchMyLeaveTourStepsFromAPI = async (menuId: number): Promise<MyLeaveTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[MyLeave Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[MyLeave Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[MyLeave Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: MyLeaveTourStepData[] = [];

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
          console.log(`[MyLeave Tour] Found array data in response.${key}`);
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

    console.log('[MyLeave Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[MyLeave Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Custom interface for tour steps (since StepOptions in shepherd.js may not include id)
export interface MyLeaveTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: (this: any, ...args: any[]) => void;
    classes?: string;
  }>;
  advanceOn?: {
    selector: string;
    event: string;
  };
  beforeShowPromise?: () => Promise<void>;
}

// Function to create tour steps with optional API data
export const createMyLeaveTourSteps = (apiTourData?: MyLeaveTourStepData[]): MyLeaveTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[MyLeave Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || '';
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[MyLeave Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[MyLeave Tour] Using tour steps with API overrides');

  return [
    {
      id: 'my-leave-welcome',
      title: apiStepsMap.get('my-leave-welcome')?.title || 'Welcome to My Leave Page!',
      text: apiStepsMap.get('my-leave-welcome')?.description || 'This page allows you to view and manage your leave requests. Let me show you around.',
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
      id: 'my-leave-filter',
      title: apiStepsMap.get('my-leave-filter')?.title || '📅 Year Filter',
      text: apiStepsMap.get('my-leave-filter')?.description || 'Use this dropdown to filter your leave records by academic year. Select different years to view your leave history.',
      attachTo: { element: '#tour-year-filter', on: 'bottom' },
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
      id: 'my-leave-history',
      title: apiStepsMap.get('my-leave-history')?.title || '📋 Leave History',
      text: apiStepsMap.get('my-leave-history')?.description || 'This section displays all your leave requests. Each card shows the leave type, status, duration, and other details.',
      attachTo: { element: '#tour-leave-history', on: 'top' },
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
      id: 'my-leave-card',
      title: apiStepsMap.get('my-leave-card')?.title || '📄 Leave Card',
      text: apiStepsMap.get('my-leave-card')?.description || 'Each leave card shows: Leave Type (e.g., Sick Leave, Casual Leave), Status (Approved/Pending/Rejected), Duration in days, Applied date, and Leave period.',
      attachTo: { element: '#tour-leave-card', on: 'top' },
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
      id: 'my-leave-view-details',
      title: apiStepsMap.get('my-leave-view-details')?.title || '👁️ View Details',
      text: apiStepsMap.get('my-leave-view-details')?.description || 'Click this button to see complete details of the leave request including the reason, approved by, and full date range.',
      attachTo: { element: '#tour-view-details', on: 'left' },
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
      id: 'my-leave-status',
      title: apiStepsMap.get('my-leave-status')?.title || '🏷️ Leave Status',
      text: apiStepsMap.get('my-leave-status')?.description || 'The status badge shows the current state of your leave request: Green (Approved), Yellow (Pending), or Red (Rejected).',
      attachTo: { element: '#tour-leave-status', on: 'left' },
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
      id: 'my-leave-complete',
      title: apiStepsMap.get('my-leave-complete')?.title || '🎉 Tour Complete!',
      text: apiStepsMap.get('my-leave-complete')?.description || 'You now know how to use the My Leave page! To apply for a new leave, click the "New" button in the sidebar and select "Apply Leave".',
      attachTo: { element: '#tour-sidebar-new', on: 'right' },
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
            sessionStorage.setItem('myLeaveTourCompleted', 'true');
            sessionStorage.removeItem('triggerPageTour');
            this.complete();
          }
        }
      ]
    }
  ];
};

// Export for backwards compatibility
export const myLeaveTourSteps = createMyLeaveTourSteps();

// Function to create and start the tour
export const startMyLeaveTour = async (): Promise<void> => {
  // Check if tour was already completed in this session
  if (sessionStorage.getItem('myLeaveTourCompleted') === 'true') {
    console.log('My Leave tour already completed in this session');
    sessionStorage.removeItem('triggerPageTour');
    return;
  }

  // Fetch tour steps from API (menu_id = 104 for My Leave)
  const apiTourData = await fetchMyLeaveTourStepsFromAPI(104);
  console.log('[MyLeave Tour] API tour data fetched:', apiTourData);

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom my-leave-tour',
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
  const tourSteps = createMyLeaveTourSteps(apiTourData);

  // Add all steps to the tour
  tourSteps.forEach((step: MyLeaveTourStep) => {
    tour.addStep(step as any);
  });

  // Handle tour completion
  tour.on('complete', () => {
    sessionStorage.setItem('myLeaveTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('My Leave tour completed');
  });

  // Handle tour cancellation
  tour.on('cancel', () => {
    sessionStorage.setItem('myLeaveTourCompleted', 'true');
    sessionStorage.removeItem('triggerPageTour');
    console.log('My Leave tour cancelled');
  });

  // Start the tour after a short delay to ensure DOM is ready
  setTimeout(() => {
    tour.start();
  }, 500);
};

// Export tour styles
export const myLeaveTourStyles = `
  .shepherd-theme-custom.my-leave-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title.my-leave-tour .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .shepherd-theme-custom.my-leave-tour .shepherd-element.highlighted {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = myLeaveTourStyles;
  styleSheet.id = 'my-leave-tour-styles';
  // Check if styles already exist
  if (!document.getElementById('my-leave-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
