import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Type for tour step data from API
export interface UserAttendanceTourStepData {
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
    console.error('[UserAttendance Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchUserAttendanceTourStepsFromAPI = async (menuId: number): Promise<UserAttendanceTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[UserAttendance Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    // Use localhost as base URL, with token and sub_institute_id from userData
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
    console.log('[UserAttendance Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[UserAttendance Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: UserAttendanceTourStepData[] = [];

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
          console.log(`[UserAttendance Tour] Found array data in response.${key}`);
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

    console.log('[UserAttendance Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[UserAttendance Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Tour step configuration interface
export interface UserAttendanceTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: () => void;
    classes?: string;
  }>;
  beforeShowPromise?: () => Promise<void>;
  when?: {
    show?: () => void;
    hide?: () => void;
  };
}

// CSS styles for the tour
export const userAttendanceTourStyles = `
  .shepherd-theme-user-attendance {
    --shepherd-theme-primary: #007BE5;
    --shepherd-theme-secondary: #6c757d;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
  }

  .shepherd-theme-user-attendance .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 16px 20px;
  }

  .shepherd-theme-user-attendance .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-user-attendance .shepherd-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    padding: 20px;
  }

  .shepherd-theme-user-attendance .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-weight: 500;
    font-size: 14px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0 5px;
  }

  .shepherd-theme-user-attendance .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-user-attendance .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-user-attendance .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-user-attendance .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
    cursor: pointer;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #007BE5;
    padding: 16px 20px;
  }

  .shepherd-theme-user-attendance .shepherd-element {
    border-radius: 12px;
    max-width: 400px;
  }

  @keyframes pulse-element {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  .tour-highlight-active {
    animation: pulse-element 2s infinite;
    position: relative;
    z-index: 1000;
    box-shadow: 0 0 0 4px rgba(0, 123, 229, 0.3);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = userAttendanceTourStyles;
  document.head.appendChild(styleSheet);
}

// Create tour steps - optionally with API data
export const createUserAttendanceTourSteps = (apiTourData?: UserAttendanceTourStepData[]): UserAttendanceTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[UserAttendance Tour] Creating apiStepsMap from API data:', apiTourData.length);
    console.log('[UserAttendance Tour] API tour data:', apiStepsMap);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || stepData.onClick || stepData.step_key || stepData.stepKey || String(stepData.id) || '';
      const stepTitle = stepData.title || stepData.Title || stepData.name || stepData.step_title || stepData.stepTitle || '';
      const stepDescription = stepData.description || stepData.Description || stepData.text || stepData.Text || stepData.content || stepData.step_description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[UserAttendance Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  // Default hardcoded steps with API overrides
  console.log('[UserAttendance Tour] Using default tour steps with API overrides');

  return [
    {
      id: 'user-attendance-welcome',
      title: apiStepsMap.get('user-attendance-welcome')?.title || '👋 Welcome to User Attendance',
      text: apiStepsMap.get('user-attendance-welcome')?.description || 'This page allows you to manage and track user attendance records. Let me show you around the key features.',
      attachTo: {
        element: '#tour-user-attendance-header',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip Tour',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            if (tour) tour.cancel();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'user-attendance-welcome',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-employee-selector',
      title: apiStepsMap.get('user-attendance-employee-selector')?.title || '👥 Employee Selection',
      text: apiStepsMap.get('user-attendance-employee-selector')?.description || 'Select one or more employees to view their attendance records. You can filter by department or search for specific employees.',
      attachTo: {
        element: '#tour-employee-selector',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'user-attendance-employee-selector',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-date-filters',
      title: apiStepsMap.get('user-attendance-date-filters')?.title || '📅 Date Range Filters',
      text: apiStepsMap.get('user-attendance-date-filters')?.description || 'Filter attendance records by selecting a date range. Choose "From Date" and "To Date" to narrow down the results.',
      attachTo: {
        element: '#tour-date-filters',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'user-attendance-date-filters',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-search',
      title: apiStepsMap.get('user-attendance-search')?.title || '🔍 Search Button',
      text: apiStepsMap.get('user-attendance-search')?.description || 'Click this button to apply your selected filters and search for attendance records matching your criteria.',
      attachTo: {
        element: '#tour-search-button',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'user-attendance-search',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-add',
      title: apiStepsMap.get('user-attendance-add')?.title || '➕ Add Attendance',
      text: apiStepsMap.get('user-attendance-add')?.description || 'Click this button to add new attendance records manually. This opens a form where you can enter attendance details.',
      attachTo: {
        element: '#tour-add-button',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'user-attendance-add',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-stats',
      title: apiStepsMap.get('user-attendance-stats')?.title || '📊 Attendance Statistics',
      text: apiStepsMap.get('user-attendance-stats')?.description || 'This section shows key statistics including total records, present days, absent days, and average working hours.',
      attachTo: {
        element: '#tour-stats-cards',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'user-attendance-stats',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = UserAttendanceTour.getInstance();
            tour?.next();
          }
        }
      ]
    },
    {
      id: 'user-attendance-list',
      title: apiStepsMap.get('user-attendance-list')?.title || '📋 Attendance Records',
      text: apiStepsMap.get('user-attendance-list')?.description || 'This table displays all attendance records with details like date, punch-in/out times, total hours, and status. You can edit records directly from here.',
      attachTo: {
        element: '#tour-attendance-list',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => {
            const tour = UserAttendanceTour.getInstance();
            tour?.back();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish Tour',
          action: () => {
            // Log step complete before finishing
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'user-attendance-list',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = UserAttendanceTour.getInstance();
            if (tour) {
              tour.complete();
            }
          }
        }
      ]
    }
  ];
};

// Tour class for managing the User Attendance tour
export class UserAttendanceTour {
  private static instance: UserAttendanceTour | null = null;
  private tour: Tour | null = null;
  private currentStepIndex: number = 0;

  private constructor() {}

  // Get singleton instance
  public static getInstance(): UserAttendanceTour {
    if (!UserAttendanceTour.instance) {
      UserAttendanceTour.instance = new UserAttendanceTour();
    }
    return UserAttendanceTour.instance;
  }

  // Initialize and start the tour - fetches from API first, then falls back to default steps
  public async start(): Promise<void> {
    // Check if tour is already active
    if (this.tour && this.tour.getCurrentStep()) {
      console.log('User Attendance tour is already running');
      return;
    }

    console.log('Starting User Attendance tour');

    // Get menuId for API call - use 101 as specified
    const menuId = 101;

    // Fetch tour steps from API
    console.log('[UserAttendance Tour] Fetching tour steps from API with menuId:', menuId);
    const apiTourData = await fetchUserAttendanceTourStepsFromAPI(menuId);

    // Log tour started event
    const { menuId: pageMenuId, accessLink } = getPageInfo();
    logUserJourney({
      eventType: 'tour_started',
      stepKey: 'user-attendance-tour',
      menuId: pageMenuId,
      accessLink: accessLink || '/User-Attendance',
    }).catch(console.error);

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shepherd-theme-user-attendance',
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

    // Add steps to the tour (with API data or default)
    const steps = createUserAttendanceTourSteps(apiTourData);
    steps.forEach(step => {
      this.tour!.addStep(step);
    });

    // Handle tour events
    this.tour.on('show', (event) => {
      const currentStep = event.step;
      const element = currentStep.getElement();
      if (element) {
        element.classList.add('tour-highlight-active');
      }
      this.currentStepIndex = this.tour?.steps.findIndex((s) => s.id === currentStep.id) || 0;

      // Log tour step view journey event
      const { menuId, accessLink } = getPageInfo();
      const stepId = currentStep.id || `step_${this.currentStepIndex}`;
      logUserJourney({
        eventType: 'tour_step_view',
        stepKey: stepId,
        menuId: menuId,
        accessLink: accessLink || '/User-Attendance',
      }).catch(console.error);
    });

    this.tour.on('hide', (event) => {
      const currentStep = event.step;
      const element = currentStep.getElement();
      if (element) {
        element.classList.remove('tour-highlight-active');
      }
    });

    this.tour.on('cancel', () => {
      // Log tour skipped journey event
      const { menuId, accessLink } = getPageInfo();
      const currentStep = this.tour?.getCurrentStep();
      const stepId = currentStep?.id || 'user-attendance-tour';
      logUserJourney({
        eventType: 'tour_skipped',
        stepKey: stepId,
        menuId: menuId,
        accessLink: accessLink || '/User-Attendance',
      }).catch(console.error);

      this.cleanup();
      console.log('User Attendance tour cancelled');
    });

    this.tour.on('complete', () => {
      // Log tour completed journey event
      const { menuId, accessLink } = getPageInfo();
      logUserJourney({
        eventType: 'tour_complete',
        stepKey: 'user-attendance-tour',
        menuId: menuId,
        accessLink: accessLink || '/User-Attendance',
      }).catch(console.error);

      this.cleanup();
      console.log('User Attendance tour completed');
    });

    // Start the tour
    setTimeout(() => {
      this.tour?.start();
    }, 100);
  }

  // Navigate to next step
  public next(): void {
    this.tour?.next();
  }

  // Navigate to previous step
  public back(): void {
    const steps = this.tour?.steps;
    if (steps && this.currentStepIndex > 0) {
      this.tour?.show(steps[this.currentStepIndex - 1].id);
    }
  }

  // Cancel the tour
  public cancel(): void {
    this.tour?.cancel();
  }

  // Complete the tour
  public complete(): void {
    this.tour?.complete();
  }

  // Cleanup after tour ends
  private cleanup(): void {
    // Remove highlight from any element
    const highlightedElements = document.querySelectorAll('.tour-highlight-active');
    highlightedElements.forEach(el => el.classList.remove('tour-highlight-active'));

    // Clear session storage flag
    sessionStorage.removeItem('triggerPageTour');
    sessionStorage.removeItem('triggerUserAttendanceTour');

    // Clear local storage
    localStorage.removeItem('userAttendanceTourCompleted');
    localStorage.setItem('userAttendanceTourCompleted', Date.now().toString());
  }

  // Check if tour was completed
  public static isTourCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    const completed = localStorage.getItem('userAttendanceTourCompleted');
    if (!completed) return false;

    // Check if completed within last 24 hours (optional: prevent showing too frequently)
    const dayInMs = 24 * 60 * 60 * 1000;
    const completedTime = parseInt(completed, 10);
    const now = Date.now();

    return now - completedTime < dayInMs;
  }
}

// Utility function to trigger the tour from outside
export const triggerUserAttendanceTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('triggerUserAttendanceTour', 'true');
  }
};

// Utility function to check if tour should be triggered
export const shouldStartUserAttendanceTour = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check if tour was already completed recently
  if (UserAttendanceTour.isTourCompleted()) {
    console.log('User Attendance tour already completed recently');
    return false;
  }

  // Check for trigger flag from sidebar tour
  const triggerValue = sessionStorage.getItem('triggerPageTour');
  const shouldTrigger = triggerValue === 'user-attendance';
  
  if (shouldTrigger) {
    console.log('User Attendance tour triggered from sidebar');
  }
  
  return shouldTrigger;
};

