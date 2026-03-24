import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface EarlyGoingReportTourStepData {
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
    console.error('[EarlyGoingReport Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchEarlyGoingReportTourStepsFromAPI = async (menuId: number): Promise<EarlyGoingReportTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[EarlyGoingReport Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[EarlyGoingReport Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[EarlyGoingReport Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: EarlyGoingReportTourStepData[] = [];

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
          console.log(`[EarlyGoingReport Tour] Found array data in response.${key}`);
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

    console.log('[EarlyGoingReport Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[EarlyGoingReport Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Tour step configuration interface
export interface EarlyGoingReportTourStep {
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
}

// Singleton tour instance management
let tourInstance: Tour | null = null;
let currentStepIndex: number = 0;

// Constants for tour state persistence
const TOUR_TRIGGER_KEY = 'triggerPageTour';
const COMPLETED_KEY = 'earlyGoingReportTourCompleted';

// Tour trigger value for this page
export const EARLY_GOING_REPORT_TRIGGER_VALUE = 'early-going';

// Create tour steps with optional API data override
const createEarlyGoingReportSteps = (apiTourData?: EarlyGoingReportTourStepData[]): EarlyGoingReportTourStep[] => {
  const steps: EarlyGoingReportTourStep[] = [];

  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[EarlyGoingReport Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || '';
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[EarlyGoingReport Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[EarlyGoingReport Tour] Using tour steps with API overrides');

  // Step 1: Header
  steps.push({
    id: 'earlygoing-header',
    title: apiStepsMap.get('earlygoing-header')?.title || '📋 Early Going Report',
    text: apiStepsMap.get('earlygoing-header')?.description || 'This page displays the Early Going Report for employees who left before their expected out time. Use the filters below to customize your search.',
    attachTo: { element: '#earlygoing-header', on: 'bottom' },
    buttons: [
      {
        text: 'Skip Tour',
        action: () => cancelTour(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: () => {
          // Log step complete before moving to next
          logStepComplete('earlygoing-header');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 2: Filters Section
  steps.push({
    id: 'earlygoing-filters',
    title: apiStepsMap.get('earlygoing-filters')?.title || '🔍 Filters Section',
    text: apiStepsMap.get('earlygoing-filters')?.description || 'Use the filters below to search for specific employees. You can filter by department, employee, and date.',
    attachTo: { element: '#earlygoing-filters', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-filters');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 3: Department Selector
  steps.push({
    id: 'earlygoing-department-selector',
    title: apiStepsMap.get('earlygoing-department-selector')?.title || '🏢 Department Filter',
    text: apiStepsMap.get('earlygoing-department-selector')?.description || 'Select one or more departments to filter employees. Click on the dropdown to see available departments.',
    attachTo: { element: '#earlygoing-department-selector', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-department-selector');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 4: Employee Selector
  steps.push({
    id: 'earlygoing-employee-selector',
    title: apiStepsMap.get('earlygoing-employee-selector')?.title || '👤 Employee Filter',
    text: apiStepsMap.get('earlygoing-employee-selector')?.description || 'Select specific employees within the selected departments. You can choose multiple employees.',
    attachTo: { element: '#earlygoing-employee-selector', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-employee-selector');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 5: Date Picker
  steps.push({
    id: 'earlygoing-date-picker',
    title: apiStepsMap.get('earlygoing-date-picker')?.title || '📅 Date Selection',
    text: apiStepsMap.get('earlygoing-date-picker')?.description || 'Select the date for which you want to view the Early Going Report. By default, it shows today\'s date.',
    attachTo: { element: '#earlygoing-date-picker', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-date-picker');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 6: Search Button
  steps.push({
    id: 'earlygoing-search-button',
    title: apiStepsMap.get('earlygoing-search-button')?.title || '🔘 Search Button',
    text: apiStepsMap.get('earlygoing-search-button')?.description || 'Click the Search button to fetch the Early Going Report data based on your selected filters.',
    attachTo: { element: '#earlygoing-search-button', on: 'top' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-search-button');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 7: Export Buttons
  steps.push({
    id: 'earlygoing-export-buttons',
    title: apiStepsMap.get('earlygoing-export-buttons')?.title || '📤 Export Options',
    text: apiStepsMap.get('earlygoing-export-buttons')?.description || 'Export your report in different formats: Print, PDF, or Excel. Click on the respective button to download.',
    attachTo: { element: '#earlygoing-export-buttons', on: 'left' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-export-buttons');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 8: Print Button
  steps.push({
    id: 'earlygoing-print-button',
    title: apiStepsMap.get('earlygoing-print-button')?.title || '🖨️ Print Report',
    text: apiStepsMap.get('earlygoing-print-button')?.description || 'Click here to print the current report. The print preview will show all displayed data.',
    attachTo: { element: '#earlygoing-print-button', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-print-button');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 9: PDF Button
  steps.push({
    id: 'earlygoing-pdf-button',
    title: apiStepsMap.get('earlygoing-pdf-button')?.title || '📄 Export to PDF',
    text: apiStepsMap.get('earlygoing-pdf-button')?.description || 'Download the report as a PDF file. This will include all table data with proper formatting.',
    attachTo: { element: '#earlygoing-pdf-button', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-pdf-button');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 10: Excel Button
  steps.push({
    id: 'earlygoing-excel-button',
    title: apiStepsMap.get('earlygoing-excel-button')?.title || '📊 Export to Excel',
    text: apiStepsMap.get('earlygoing-excel-button')?.description || 'Download the report as an Excel file. This format is useful for further data analysis.',
    attachTo: { element: '#earlygoing-excel-button', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => {
          logStepComplete('earlygoing-excel-button');
          tourInstance?.next();
        }
      }
    ]
  });

  // Step 11: Data Table
  steps.push({
    id: 'earlygoing-data-table',
    title: apiStepsMap.get('earlygoing-data-table')?.title || '📊 Data Table',
    text: apiStepsMap.get('earlygoing-data-table')?.description || 'The table displays employee early going data including: Sr No., Emp ID, Employee Name, Department, Out Time, and Expected Out Time. Use pagination to navigate through results.',
    attachTo: { element: '#earlygoing-data-table', on: 'top' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Finish Tour',
        action: () => completeTour()
      }
    ]
  });

  return steps;
};

// Helper function to log step complete
const logStepComplete = (stepId: string): void => {
  const { menuId, accessLink } = getPageInfo();
  logUserJourney({
    eventType: 'tour_step_complete',
    stepKey: stepId,
    menuId: menuId,
    accessLink: accessLink || '/HRMS/EarlyGoingReport',
  }).catch(console.error);
};

// Helper function to cancel tour
const cancelTour = (): void => {
  tourInstance?.cancel();
};

// Helper function to complete tour
const completeTour = (): void => {
  tourInstance?.complete();
};

// Tour configuration
export const earlyGoingReportTourConfig = {
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
};

// Helper function to start the tour
export const startEarlyGoingReportTour = async (): Promise<void> => {
  // Check if tour is already active
  if (tourInstance && tourInstance.getCurrentStep()) {
    console.log('Early Going Report tour is already running');
    return;
  }

  console.log('Starting Early Going Report tour');

  // Fetch tour steps from API (menu_id = 163 for Early Going Report)
  const apiTourData = await fetchEarlyGoingReportTourStepsFromAPI(163);
  console.log('[EarlyGoingReport Tour] API tour data fetched:', apiTourData);

  // Log tour started event
  const { menuId, accessLink } = getPageInfo();
  logUserJourney({
    eventType: 'tour_started',
    stepKey: 'early-going-report-tour',
    menuId: menuId,
    accessLink: accessLink || '/HRMS/EarlyGoingReport',
  }).catch(console.error);

  const tour = new Shepherd.Tour(earlyGoingReportTourConfig);
  tourInstance = tour;

  // Add steps to the tour (with API data override)
  const steps = createEarlyGoingReportSteps(apiTourData);
  steps.forEach(step => {
    tour.addStep(step);
  });

  // Handle tour events - when step is shown
  tour.on('show', (event) => {
    const currentStep = event.step;
    currentStepIndex = tour.steps.findIndex((s) => s.id === currentStep.id) || 0;

    // Log tour step view journey event
    const { menuId, accessLink } = getPageInfo();
    const stepId = currentStep.id || `step_${currentStepIndex}`;
    logUserJourney({
      eventType: 'tour_step_view',
      stepKey: stepId,
      menuId: menuId,
      accessLink: accessLink || '/HRMS/EarlyGoingReport',
    }).catch(console.error);
  });

  // Handle tour cancel event
  tour.on('cancel', () => {
    // Log tour skipped journey event
    const { menuId, accessLink } = getPageInfo();
    const currentStep = tour.getCurrentStep();
    const stepId = currentStep?.id || 'early-going-report-tour';
    logUserJourney({
      eventType: 'tour_skipped',
      stepKey: stepId,
      menuId: menuId,
      accessLink: accessLink || '/HRMS/EarlyGoingReport',
    }).catch(console.error);

    cleanup();
    console.log('Early Going Report tour cancelled');
  });

  // Handle tour complete event
  tour.on('complete', () => {
    // Log tour completed journey event
    const { menuId, accessLink } = getPageInfo();
    logUserJourney({
      eventType: 'tour_complete',
      stepKey: 'early-going-report-tour',
      menuId: menuId,
      accessLink: accessLink || '/HRMS/EarlyGoingReport',
    }).catch(console.error);

    cleanup();
    console.log('Early Going Report tour completed');
  });

  // Mark tour as completed in session storage
  sessionStorage.setItem('earlyGoingReportTourCompleted', 'true');
  sessionStorage.removeItem(TOUR_TRIGGER_KEY);

  // Start the tour
  setTimeout(() => {
    tour.start();
  }, 100);
};

// Cleanup after tour ends
const cleanup = (): void => {
  // Clear session storage flags
  sessionStorage.removeItem('triggerPageTour');
  sessionStorage.removeItem('triggerEarlyGoingReportTour');

  // Mark tour as completed
  localStorage.setItem(COMPLETED_KEY, Date.now().toString());

  // Reset tour instance
  tourInstance = null;
  currentStepIndex = 0;
};

// Check if tour should be triggered
export const shouldStartEarlyGoingReportTour = (): boolean => {
  if (typeof window === 'undefined') return false;

  const triggerValue = sessionStorage.getItem(TOUR_TRIGGER_KEY);
  const isCompleted = localStorage.getItem(COMPLETED_KEY);

  console.log('[EarlyGoingReportTour] shouldStartTour check:', {
    triggerValue,
    isCompleted,
    matches: triggerValue === EARLY_GOING_REPORT_TRIGGER_VALUE,
    notCompleted: !isCompleted
  });

  return triggerValue === EARLY_GOING_REPORT_TRIGGER_VALUE && !isCompleted;
};

// Reset tour completion for testing
export const resetEarlyGoingReportTour = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(COMPLETED_KEY);
    sessionStorage.removeItem(TOUR_TRIGGER_KEY);
  }
};

// Utility function to trigger the tour from outside
export const triggerEarlyGoingReportTour = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('triggerEarlyGoingReportTour', 'true');
    sessionStorage.setItem(TOUR_TRIGGER_KEY, EARLY_GOING_REPORT_TRIGGER_VALUE);
  }
};
