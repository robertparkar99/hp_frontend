import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface AttendanceReportTourStepData {
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
    console.error('[AttendanceReport Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchAttendanceReportTourStepsFromAPI = async (menuId: number): Promise<AttendanceReportTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[AttendanceReport Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[AttendanceReport Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[AttendanceReport Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: AttendanceReportTourStepData[] = [];

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
          console.log(`[AttendanceReport Tour] Found array data in response.${key}`);
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

    console.log('[AttendanceReport Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[AttendanceReport Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Tour step configuration interface
export interface AttendanceReportTourStep {
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

// Tour class for managing the Attendance Report tour
export class AttendanceReportTour {
  private static instance: AttendanceReportTour | null = null;
  private tour: Tour | null = null;
  private currentStepIndex: number = 0;

  // Constants for tour state persistence
  private static readonly TOUR_TRIGGER_KEY = 'triggerPageTour';
  private static readonly COMPLETED_KEY = 'attendanceReportTourCompleted';

  // Tour trigger value for this page
  public static readonly TRIGGER_VALUE = 'attendance-report';

  private constructor() {}

  // Get singleton instance
  public static getInstance(): AttendanceReportTour {
    if (!AttendanceReportTour.instance) {
      AttendanceReportTour.instance = new AttendanceReportTour();
    }
    return AttendanceReportTour.instance;
  }

  // Check if tour should be triggered
  public static shouldStartTour(): boolean {
    if (typeof window === 'undefined') return false;

    const triggerValue = sessionStorage.getItem(AttendanceReportTour.TOUR_TRIGGER_KEY);
    const isCompleted = localStorage.getItem(AttendanceReportTour.COMPLETED_KEY);

    console.log('[AttendanceReportTour] shouldStartTour check:', {
      triggerValue,
      isCompleted,
      matches: triggerValue === AttendanceReportTour.TRIGGER_VALUE,
      notCompleted: !isCompleted
    });

    return triggerValue === AttendanceReportTour.TRIGGER_VALUE && !isCompleted;
  }

  // Clear the trigger after handling
  public static clearTrigger(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AttendanceReportTour.TOUR_TRIGGER_KEY);
    }
  }

  // Create tour steps with optional API data override
  private createSteps(apiTourData?: AttendanceReportTourStepData[]): AttendanceReportTourStep[] {
    const steps: AttendanceReportTourStep[] = [];

    // Create a Map from API data for easy lookup by step ID
    const apiStepsMap = new Map<string, { title: string; description: string }>();

    if (apiTourData && apiTourData.length > 0) {
      console.log('[AttendanceReport Tour] Creating apiStepsMap from API data:', apiTourData.length);

      apiTourData.forEach((stepData) => {
        const stepId = stepData.on_click || '';
        const stepTitle = stepData.title || '';
        const stepDescription = stepData.description || '';

        if (stepId) {
          apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
        }
      });

      console.log('[AttendanceReport Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
    }

    console.log('[AttendanceReport Tour] Using tour steps with API overrides');

    // Step 1: Welcome / Header
    steps.push({
      id: 'attendance-report-welcome',
      title: apiStepsMap.get('attendance-report-welcome')?.title || '👋 Welcome to Attendance Report',
      text: apiStepsMap.get('attendance-report-welcome')?.description || 'This page allows you to generate and view attendance reports for employees. Let me show you around the key features.',
      attachTo: {
        element: '#tour-attendance-report-header',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip Tour',
          action: () => this.cancelTour(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'attendance-report-welcome',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = AttendanceReportTour.getInstance();
            tour?.next();
          }
        }
      ]
    });

    // Step 2: Employee Selector
    steps.push({
      id: 'attendance-report-employee-selector',
      title: apiStepsMap.get('attendance-report-employee-selector')?.title || '👥 Employee/Department Selection',
      text: apiStepsMap.get('attendance-report-employee-selector')?.description || 'Select one or more employees or departments to include in the attendance report. You can filter by department or search for specific employees.',
      attachTo: {
        element: '#tour-employee-selector',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => this.tour?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'attendance-report-employee-selector',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = AttendanceReportTour.getInstance();
            tour?.next();
          }
        }
      ]
    });

    // Step 3: From Date Filter
    steps.push({
      id: 'attendance-report-from-date',
      title: apiStepsMap.get('attendance-report-from-date')?.title || '📅 From Date',
      text: apiStepsMap.get('attendance-report-from-date')?.description || 'Select the start date for your attendance report. This defines the beginning of the date range you want to analyze.',
      attachTo: {
        element: '#tour-from-date',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => this.tour?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'attendance-report-from-date',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = AttendanceReportTour.getInstance();
            tour?.next();
          }
        }
      ]
    });

    // Step 4: To Date Filter
    steps.push({
      id: 'attendance-report-to-date',
      title: apiStepsMap.get('attendance-report-to-date')?.title || '📅 To Date',
      text: apiStepsMap.get('attendance-report-to-date')?.description || 'Select the end date for your attendance report. This defines the last date in your attendance analysis range.',
      attachTo: {
        element: '#tour-to-date',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => this.tour?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'attendance-report-to-date',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = AttendanceReportTour.getInstance();
            tour?.next();
          }
        }
      ]
    });

    // Step 5: Search Button
    steps.push({
      id: 'attendance-report-search',
      title: apiStepsMap.get('attendance-report-search')?.title || '🔍 Search Button',
      text: apiStepsMap.get('attendance-report-search')?.description || 'Click this button to generate the attendance report based on your selected filters (employees, departments, and date range).',
      attachTo: {
        element: '#tour-search-button',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => this.tour?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'attendance-report-search',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = AttendanceReportTour.getInstance();
            tour?.next();
          }
        }
      ]
    });

    // Step 6: Legend
    steps.push({
      id: 'attendance-report-legend',
      title: apiStepsMap.get('attendance-report-legend')?.title || '🎨 Status Colors Legend',
      text: apiStepsMap.get('attendance-report-legend')?.description || 'This legend shows the color coding for different attendance statuses: Absent (Red), Latecomer (Orange), HalfDay (Yellow), Weekend (Green), Holiday (Dark Green), SameInOut (Pink), and Present (White).',
      attachTo: {
        element: '#tour-legend',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => this.tour?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => {
            // Log step complete before moving to next
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
              eventType: 'tour_step_complete',
              stepKey: 'attendance-report-legend',
              menuId: menuId,
              accessLink: accessLink || '/User-Attendance',
            }).catch(console.error);

            const tour = AttendanceReportTour.getInstance();
            tour?.next();
          }
        }
      ]
    });

    // Step 7: Data Table
    steps.push({
      id: 'attendance-report-table',
      title: apiStepsMap.get('attendance-report-table')?.title || '📋 Attendance Data Table',
      text: apiStepsMap.get('attendance-report-table')?.description || 'This table displays the attendance records with columns for Date, Department, Employee Name, In Time, Out Time, Duration, and Status. You can also filter by any column using the search inputs.',
      attachTo: {
        element: '#tour-attendance-table',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',
          action: () => this.tour?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish Tour',
          action: () => this.completeTour()
        }
      ]
    });

    return steps;
  }

  // Initialize and start the tour
  public async start(): Promise<void> {
    // Check if tour is already active
    if (this.tour && this.tour.getCurrentStep()) {
      console.log('Attendance Report tour is already running');
      return;
    }

    console.log('Starting Attendance Report tour');

    // Fetch tour steps from API (menu_id = 162 for Attendance Report)
    const apiTourData = await fetchAttendanceReportTourStepsFromAPI(162);
    console.log('[AttendanceReport Tour] API tour data fetched:', apiTourData);

    // Log tour started event
    const { menuId, accessLink } = getPageInfo();
    logUserJourney({
      eventType: 'tour_started',
      stepKey: 'user-attendance-tour',
      menuId: menuId,
      accessLink: accessLink || '/User-Attendance',
    }).catch(console.error);

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shepherd-theme-attendance-report',
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

    // Add steps to the tour (with API data override)
    const steps = this.createSteps(apiTourData);
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
      console.log('Attendance Report tour cancelled');
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
      console.log('Attendance Report tour completed');
    });

    // Clear the trigger and start
    AttendanceReportTour.clearTrigger();

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

  // Private method to cancel tour
  private cancelTour(): void {
    this.cancel();
    this.cleanup();
  }

  // Private method to complete tour
  private completeTour(): void {
    this.complete();
    this.cleanup();
  }

  // Cleanup after tour ends
  private cleanup(): void {
    // Remove highlight from any element
    const highlightedElements = document.querySelectorAll('.tour-highlight-active');
    highlightedElements.forEach(el => el.classList.remove('tour-highlight-active'));

    // Clear session storage flag
    sessionStorage.removeItem('triggerPageTour');
    sessionStorage.removeItem('triggerAttendanceReportTour');

    // Mark tour as completed
    localStorage.setItem(AttendanceReportTour.COMPLETED_KEY, Date.now().toString());
  }

  // Check if tour was completed
  public static isTourCompleted(): boolean {
    if (typeof window === 'undefined') return false;
    const completed = localStorage.getItem(AttendanceReportTour.COMPLETED_KEY);
    if (!completed) return false;

    // Check if completed within last 24 hours (optional: prevent showing too frequently)
    const dayInMs = 24 * 60 * 60 * 1000;
    const completedTime = parseInt(completed, 10);
    const now = Date.now();

    return now - completedTime < dayInMs;
  }

  // Reset tour (to allow it to run again)
  public static resetTour(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AttendanceReportTour.COMPLETED_KEY);
    }
  }
}

// CSS styles for the tour
export const attendanceReportTourStyles = `
  .shepherd-theme-attendance-report {
    --shepherd-theme-primary: #007BE5;
    --shepherd-theme-secondary: #6c757d;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
  }

  .shepherd-theme-attendance-report .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 16px 20px;
  }

  .shepherd-theme-attendance-report .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-attendance-report .shepherd-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    padding: 20px;
  }

  .shepherd-theme-attendance-report .shepherd-button {
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

  .shepherd-theme-attendance-report .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-attendance-report .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-attendance-report .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-attendance-report .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
    cursor: pointer;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #007BE5;
    padding: 16px 20px;
  }

  .shepherd-theme-attendance-report .shepherd-element {
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

// Inject styles if not already injected
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('#attendance-report-tour-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'attendance-report-tour-styles';
    styleSheet.textContent = attendanceReportTourStyles;
    document.head.appendChild(styleSheet);
  }
}

// Utility function to trigger the tour from outside
export const triggerAttendanceReportTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('triggerAttendanceReportTour', 'true');
    sessionStorage.setItem('triggerPageTour', AttendanceReportTour.TRIGGER_VALUE);
  }
};

// Utility function to check if tour should be triggered
export const shouldStartAttendanceReportTour = (): boolean => {
  return AttendanceReportTour.shouldStartTour();
};
