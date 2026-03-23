import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Type for tour step data from API
export interface SalaryCertificateTourStepData {
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
    console.error('[Salary Certificate Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
const fetchSalaryCertificateTourStepsFromAPI = async (menuId: number): Promise<SalaryCertificateTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[Salary Certificate Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
    console.log('[Salary Certificate Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[Salary Certificate Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: SalaryCertificateTourStepData[] = [];

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
          console.log(`[Salary Certificate Tour] Found array data in response.${key}`);
          break;
        }
      }
    }

    console.log('[Salary Certificate Tour] Parsed tour data:', tourData);
    return tourData;
  } catch (error) {
    console.error('[Salary Certificate Tour] Error fetching tour steps:', error);
    return [];
  }
};

export interface SalaryCertificateTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action: (tour: Tour) => void;
    classes?: string;
  }>;
  advanceOn?: {
    selector: string;
    event: string;
  };
  beforeShowPromise?: () => Promise<void>;
}

// Create tour steps - with API data override support
export const createSalaryCertificateTourSteps = (apiTourData?: SalaryCertificateTourStepData[]): SalaryCertificateTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[Salary Certificate Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData: SalaryCertificateTourStepData) => {
      const stepId = stepData.on_click || stepData.onClick || stepData.step_key || stepData.stepKey || String(stepData.id) || '';
      const stepTitle = stepData.title || stepData.Title || stepData.name || stepData.step_title || stepData.stepTitle || '';
      const stepDescription = stepData.description || stepData.Description || stepData.text || stepData.Text || stepData.content || stepData.step_description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[Salary Certificate Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[Salary Certificate Tour] Using default tour steps with API overrides');

  // Return the tour steps array with API overrides
  return [
    {
      id: 'salary-certificate-welcome',
      title: apiStepsMap.get('salary-certificate-welcome')?.title || 'Welcome to Salary Certificate!',
      text: apiStepsMap.get('salary-certificate-welcome')?.description || 'This page allows you to generate salary certificates for employees. Let\'s take a quick tour to understand all the features.',
      attachTo: {
        element: '#tour-salary-certificate-header',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip Tour',
          action: (tour: Tour) => {
            tour.cancel();
            sessionStorage.setItem('salaryCertificateTourCompleted', 'true');
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-department',
      title: apiStepsMap.get('salary-certificate-department')?.title || '📋 Department Selection',
      text: apiStepsMap.get('salary-certificate-department')?.description || 'Select the department of the employee for whom you want to generate a salary certificate. This will filter the employee list.',
      attachTo: {
        element: '#tour-department-select',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-employee',
      title: apiStepsMap.get('salary-certificate-employee')?.title || '👤 Employee Selection',
      text: apiStepsMap.get('salary-certificate-employee')?.description || 'Choose the specific employee from the selected department. The list will automatically populate based on your department selection.',
      attachTo: {
        element: '#tour-employee-select',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-months',
      title: apiStepsMap.get('salary-certificate-months')?.title || '📅 Month Selection',
      text: apiStepsMap.get('salary-certificate-months')?.description || 'Select one or more months for which you want to generate the salary certificate. Hold Ctrl/Cmd to select multiple months.',
      attachTo: {
        element: '#tour-months-select',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-year',
      title: apiStepsMap.get('salary-certificate-year')?.title || '📆 Year Selection',
      text: apiStepsMap.get('salary-certificate-year')?.description || 'Select the year for which you want to generate the salary certificate.',
      attachTo: {
        element: '#tour-year-select',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-payroll-type',
      title: apiStepsMap.get('salary-certificate-payroll-type')?.title || '💰 Payroll Type',
      text: apiStepsMap.get('salary-certificate-payroll-type')?.description || 'Select the payroll type (e.g., Basic, HRA, DA, Bonus) for the salary certificate.',
      attachTo: {
        element: '#tour-payroll-type',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-reason',
      title: apiStepsMap.get('salary-certificate-reason')?.title || '📝 Reason (Optional)',
      text: apiStepsMap.get('salary-certificate-reason')?.description || 'Enter the reason for generating the salary certificate. This field is optional but can be useful for record-keeping.',
      attachTo: {
        element: '#tour-reason-div',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-generate-btn',
      title: apiStepsMap.get('salary-certificate-generate-btn')?.title || '✅ Generate Certificate',
      text: apiStepsMap.get('salary-certificate-generate-btn')?.description || 'Click this button to generate the salary certificate. It will open the PDF in a new tab for viewing or downloading.',
      attachTo: {
        element: '#tour-generate-btn',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'salary-certificate-download-btn',
      title: apiStepsMap.get('salary-certificate-download-btn')?.title || '📥 Download PDF',
      text: apiStepsMap.get('salary-certificate-download-btn')?.description || 'After generating, use this button to download the salary certificate as a PDF file.',
      attachTo: {
        element: '#tour-download-btn',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',
          action: (tour: Tour) => (tour as any).back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish Tour',
          action: (tour: Tour) => {
            tour.complete();
            sessionStorage.setItem('salaryCertificateTourCompleted', 'true');
          }
        }
      ]
    },
    {
      id: 'salary-certificate-complete',
      title: apiStepsMap.get('salary-certificate-complete')?.title || '🎉 Tour Complete!',
      text: apiStepsMap.get('salary-certificate-complete')?.description || 'Congratulations! You now know how to generate salary certificates. If you need help, click the "New" button in the sidebar to restart this tour.',
      attachTo: {
        element: '#tour-salary-certificate-header',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Done',
          action: (tour: Tour) => {
            tour.cancel();
            sessionStorage.setItem('salaryCertificateTourCompleted', 'true');
          }
        }
      ]
    }
  ];
};

export class SalaryCertificateTour {
  private tour: Tour | null = null;
  private static readonly TOUR_COMPLETED_KEY = 'salaryCertificateTourCompleted';

  // Start the tour (async to fetch API data)
  public async startTour(): Promise<void> {
    // Check if tour was already completed
    if (sessionStorage.getItem(SalaryCertificateTour.TOUR_COMPLETED_KEY) === 'true') {
      console.log('Salary Certificate tour already completed, skipping...');
      return;
    }

    console.log('Starting Salary Certificate tour...');

    // Get current path for journey logging
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Get menuID for journey logging
    const pageInfo = getPageInfo();
    const menuIdFromStorage = sessionStorage.getItem('triggerPageTourMenuId');
    const finalMenuId = menuIdFromStorage ? parseInt(menuIdFromStorage) : pageInfo.menuId;

    // Fetch tour steps from API
    console.log('[Salary Certificate Tour] Fetching tour steps from API with menuId:', finalMenuId);
    const apiTourData = await fetchSalaryCertificateTourStepsFromAPI(finalMenuId);
    console.log('[Salary Certificate Tour] API tour data fetched:', apiTourData.length, 'steps');

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 8
      },
      useModalOverlay: true,
      exitOnEsc: true,
      keyboardNavigation: true
    });

    // Add steps to tour with transformed buttons
    const steps = createSalaryCertificateTourSteps(apiTourData);
    console.log('[Salary Certificate Tour] Tour steps created:', steps.length);
    steps.forEach(step => {
      this.tour!.addStep({
        ...step,
        buttons: step.buttons?.map((btn: any) => {
          switch (btn.text) {
            case 'Next':
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => {
                  // Log step completion
                  logUserJourney({
                    eventType: 'tour_step_complete',
                    stepKey: step.id,
                    menuId: finalMenuId,
                    accessLink: currentPath,
                  }).catch(err => console.error('Journey logging error:', err));
                  btn.action(this.tour!);
                }
              };

            case 'Previous':
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => btn.action(this.tour!)
              };

            case 'Skip Tour':
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => {
                  // Log tour skipped
                  logUserJourney({
                    eventType: 'tour_skipped',
                    stepKey: step.id,
                    menuId: finalMenuId,
                    accessLink: currentPath,
                  }).catch(err => console.error('Journey logging error:', err));
                  btn.action(this.tour!);
                }
              };

            case 'Finish Tour':
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => {
                  // Log step completion
                  logUserJourney({
                    eventType: 'tour_step_complete',
                    stepKey: step.id,
                    menuId: finalMenuId,
                    accessLink: currentPath,
                  }).catch(err => console.error('Journey logging error:', err));
                  btn.action(this.tour!);
                }
              };

            case 'Done':
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => {
                  // Log tour completed
                  logUserJourney({
                    eventType: 'tour_step_complete',
                    stepKey: step.id,
                    menuId: finalMenuId,
                    accessLink: currentPath,
                  }).catch(err => console.error('Journey logging error:', err));
                  btn.action(this.tour!);
                }
              };

            default:
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => btn.action(this.tour!)
              };
          }
        }) as any
      });
    });

    // Log tour started
    logUserJourney({
      eventType: 'tour_started',
      stepKey: 'salary-certificate-welcome',
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));

    // Handle tour show event (for step views)
    this.tour.on('show', (e: any) => {
      const step = e.step;
      if (step && step.options && step.options.id) {
        logUserJourney({
          eventType: 'tour_step_view',
          stepKey: step.options.id,
          menuId: finalMenuId,
          accessLink: currentPath,
        }).catch(err => console.error('Journey logging error:', err));
      }
    });

    // Handle tour completion
    this.tour.on('complete', () => {
      sessionStorage.setItem(SalaryCertificateTour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      sessionStorage.removeItem('triggerPageTourMenuId');
      console.log('Salary Certificate tour completed');
    });

    // Handle tour cancellation
    this.tour.on('cancel', () => {
      sessionStorage.setItem(SalaryCertificateTour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      sessionStorage.removeItem('triggerPageTourMenuId');
      console.log('Salary Certificate tour cancelled');
    });

    // Start the tour with longer delay
    setTimeout(() => {
      this.tour?.start();
    }, 1000);
  }

  // Check if tour should start (triggered from sidebar)
  public shouldStartTour(): boolean {
    const triggerValue = sessionStorage.getItem('triggerPageTour');
    return triggerValue === 'salary-certificate' &&
      sessionStorage.getItem(SalaryCertificateTour.TOUR_COMPLETED_KEY) !== 'true';
  }

  // Clear tour state (for testing or reset)
  public clearTourState(): void {
    sessionStorage.removeItem(SalaryCertificateTour.TOUR_COMPLETED_KEY);
  }

  // Cancel the tour
  public cancelTour(): void {
    this.tour?.cancel();
  }
}

// Create and export a singleton instance
export const salaryCertificateTour = new SalaryCertificateTour();

// Export styles
export const salaryCertificateTourStyles = `
  .shepherd-theme-custom {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
    max-width: 400px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = salaryCertificateTourStyles;
  document.head.appendChild(styleSheet);
}
