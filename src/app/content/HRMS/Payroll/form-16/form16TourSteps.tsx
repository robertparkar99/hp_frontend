import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Form 16 Tour Step interface
export interface Form16TourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    action?: (tour: Tour) => void;
    classes?: string;
  }>;

}

// API Tour Step Data interface
interface Form16TourStepData {
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
    console.error('[Form16 Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch Form 16 tour steps from API
const fetchForm16TourStepsFromAPI = async (menuId: number): Promise<Form16TourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[Form16 Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
    console.log('[Form16 Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[Form16 Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: Form16TourStepData[] = [];

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
          console.log(`[Form16 Tour] Found array data in response.${key}`);
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

    console.log('[Form16 Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[Form16 Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Create Form 16 tour steps with API data override using Map approach
const createForm16TourSteps = (apiTourData: Form16TourStepData[] = []): Form16TourStep[] => {
  // Create a map for efficient lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();
  apiTourData.forEach((step: Form16TourStepData) => {
    apiStepsMap.set(step.on_click, { title: step.title, description: step.description });
  });

  console.log('[Form16 Tour] API steps map:', Array.from(apiStepsMap.entries()));

  return [
    {
      id: 'form16-welcome',
      title: apiStepsMap.get('form16-welcome')?.title || 'Welcome to Form 16 Page!',
      text: apiStepsMap.get('form16-welcome')?.description || 'This page allows you to generate Form 16 certificates for employees. Let\'s take a quick tour to understand the functionality.',
      attachTo: {
        element: '#form16-header',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip Tour',
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',

        }
      ]
    },
    {
      id: 'form16-department-select',
      title: apiStepsMap.get('form16-department-select')?.title || 'Select Department',
      text: apiStepsMap.get('form16-department-select')?.description || 'Choose the department from the dropdown. This will filter employees belonging to that department.',
      attachTo: {
        element: '#tour-department-select',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',

          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',

        }
      ]
    },
    {
      id: 'form16-employee-select',
      title: apiStepsMap.get('form16-employee-select')?.title || 'Select Employee',
      text: apiStepsMap.get('form16-employee-select')?.description || 'After selecting a department, choose the specific employee from the dropdown list.',
      attachTo: {
        element: '#tour-employee-select',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',

          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',

        }
      ]
    },
    {
      id: 'form16-year-select',
      title: apiStepsMap.get('form16-year-select')?.title || 'Select Year',
      text: apiStepsMap.get('form16-year-select')?.description || 'Choose the assessment year for which you want to generate the Form 16 certificate.',
      attachTo: {
        element: '#tour-year-select',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Previous',

          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',

        }
      ]
    },
    {
      id: 'form16-allowance-section',
      title: apiStepsMap.get('form16-allowance-section')?.title || 'Allowance Section',
      text: apiStepsMap.get('form16-allowance-section')?.description || 'View and select the allowances to be included in the Form 16. These are the allowances earned by the employee.',
      attachTo: {
        element: '#tour-allowance-section',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',

          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',

        }
      ]
    },
    {
      id: 'form16-deduction-section',
      title: apiStepsMap.get('form16-deduction-section')?.title || 'Deduction Section',
      text: apiStepsMap.get('form16-deduction-section')?.description || 'View and select the deductions to be included in the Form 16. These include PF, PT, Tax deductions, etc.',
      attachTo: {
        element: '#tour-deduction-section',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',

          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',

        }
      ]
    },
    {
      id: 'form16-submit-button',
      title: apiStepsMap.get('form16-submit-button')?.title || 'Generate Form 16',
      text: apiStepsMap.get('form16-submit-button')?.description || 'Click this button to generate the Form 16 certificate for the selected employee with the chosen year and deductions.',
      attachTo: {
        element: '#tour-submit-button',
        on: 'top'
      },
      buttons: [
        {
          text: 'Previous',

          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish Tour',

        }
      ]
    }
  ];
};

// Form 16 Tour Steps
export const form16TourSteps: Form16TourStep[] = [
  {
    id: 'form16-welcome',
    title: 'Welcome to Form 16 Page!',
    text: 'This page allows you to generate Form 16 certificates for employees. Let\'s take a quick tour to understand the functionality.',
    attachTo: {
      element: '#form16-header',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip Tour',
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-department-select',
    title: 'Select Department',
    text: 'Choose the department from the dropdown. This will filter employees belonging to that department.',
    attachTo: {
      element: '#tour-department-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-employee-select',
    title: 'Select Employee',
    text: 'After selecting a department, choose the specific employee from the dropdown list.',
    attachTo: {
      element: '#tour-employee-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-year-select',
    title: 'Select Year',
    text: 'Choose the assessment year for which you want to generate the Form 16 certificate.',
    attachTo: {
      element: '#tour-year-select',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-allowance-section',
    title: 'Allowance Section',
    text: 'View and select the allowances to be included in the Form 16. These are the allowances earned by the employee.',
    attachTo: {
      element: '#tour-allowance-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-deduction-section',
    title: 'Deduction Section',
    text: 'View and select the deductions to be included in the Form 16. These include PF, PT, Tax deductions, etc.',
    attachTo: {
      element: '#tour-deduction-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',

      }
    ]
  },
  {
    id: 'form16-submit-button',
    title: 'Generate Form 16',
    text: 'Click this button to generate the Form 16 certificate for the selected employee with the chosen year and deductions.',
    attachTo: {
      element: '#tour-submit-button',
      on: 'top'
    },
    buttons: [
      {
        text: 'Previous',

        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Finish Tour',

      }
    ]
  }
];

// Form 16 Tour Class
export class Form16Tour {
  private tour: Tour | null = null;
  private static readonly TOUR_COMPLETED_KEY = 'form16TourCompleted';

  // Start the tour
  public async startTour(menuId?: number): Promise<void> {
    // Check if tour was already completed
    if (sessionStorage.getItem(Form16Tour.TOUR_COMPLETED_KEY) === 'true') {
      console.log('Form 16 tour already completed, skipping...');
      return;
    }

    // Get current page info including menuId
    const pageInfo = getPageInfo();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/HRMS/Payroll/form-16';

    // Use provided menuId, or get from pageInfo, or from session storage
    let finalMenuId: number = menuId || pageInfo.menuId;

    // Try to get menuId from session storage if still not found
    if (!finalMenuId && typeof window !== 'undefined') {
      const storedMenuId = sessionStorage.getItem('triggerPageTourMenuId');
      if (storedMenuId) {
        finalMenuId = parseInt(storedMenuId) || 0;
      }
    }

    // Use menu_id 109 for Form 16
    const apiMenuId = finalMenuId || 109;

    // Fetch tour steps from API
    console.log('[Form16 Tour] Fetching API data with menu_id:', apiMenuId);
    const apiTourData = await fetchForm16TourStepsFromAPI(apiMenuId);

    // Create tour steps with API data override
    const tourSteps = createForm16TourSteps(apiTourData);

    console.log('Starting Form 16 tour...');

    this.tour = new Shepherd.Tour({
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

    // Log tour started
    logUserJourney({
      eventType: 'tour_started',
      stepKey: 'form16-welcome',
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));

    // Handle step show events - log each step view
    this.tour.on('show', (e: any) => {
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

    // Add steps to tour with transformed buttons
    tourSteps.forEach(step => {
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
                  btn.action ? btn.action(this.tour!) : this.tour!.next();
                }
              };

            case 'Previous':
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => btn.action ? btn.action(this.tour!) : this.tour!.back()
              };

            case 'Skip Tour':
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => btn.action ? btn.action(this.tour!) : this.tour!.cancel()
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
                  sessionStorage.setItem(
                    Form16Tour.TOUR_COMPLETED_KEY,
                    'true'
                  );
                  btn.action ? btn.action(this.tour!) : this.tour!.complete();
                }
              };

            default:
              return {
                text: btn.text,
                classes: btn.classes,
                action: () => { }
              };
          }
        }) as any
      });
    });

    // Handle tour completion
    this.tour.on('complete', () => {
      sessionStorage.setItem(Form16Tour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      console.log('Form 16 tour completed');

      logUserJourney({
        eventType: 'tour_step_complete',
        stepKey: 'form16-complete',
        menuId: finalMenuId,
        accessLink: currentPath,
      }).catch(err => console.error('Journey logging error:', err));
    });

    // Handle tour cancellation
    this.tour.on('cancel', () => {
      sessionStorage.setItem(Form16Tour.TOUR_COMPLETED_KEY, 'true');
      sessionStorage.removeItem('triggerPageTour');
      console.log('Form 16 tour cancelled');

      logUserJourney({
        eventType: 'tour_skipped',
        stepKey: null,
        menuId: finalMenuId,
        accessLink: currentPath,
      }).catch(err => console.error('Journey logging error:', err));
    });

    // Start the tour
    setTimeout(() => {
      this.tour?.start();
    }, 100);
  }

  // Check if tour should start (triggered from sidebar)
  public shouldStartTour(): boolean {
    const triggerValue = sessionStorage.getItem('triggerPageTour');
    // Only start if triggered and not completed
    return triggerValue === 'form-16' &&
      sessionStorage.getItem(Form16Tour.TOUR_COMPLETED_KEY) !== 'true';
  }

  // Clear tour state (for testing or reset)
  public clearTourState(): void {
    sessionStorage.removeItem(Form16Tour.TOUR_COMPLETED_KEY);
  }

  // Cancel the tour
  public cancelTour(): void {
    this.tour?.cancel();
  }
}

// Create and export a singleton instance
export const form16Tour = new Form16Tour();
