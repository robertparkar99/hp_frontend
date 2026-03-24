import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface PayrollDeductionTourStepData {
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
    console.error('[PayrollDeduction Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
export const fetchPayrollDeductionTourStepsFromAPI = async (menuId: number): Promise<PayrollDeductionTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[PayrollDeduction Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[PayrollDeduction Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[PayrollDeduction Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: PayrollDeductionTourStepData[] = [];

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
          console.log(`[PayrollDeduction Tour] Found array data in response.${key}`);
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

    console.log('[PayrollDeduction Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[PayrollDeduction Tour] Error fetching tour steps:', error);
    return [];
  }
};

export interface PayrollDeductionTourStep {
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

// Create tour steps with API data override using Map approach
export const createPayrollDeductionTourSteps = (apiTourData?: PayrollDeductionTourStepData[]): PayrollDeductionTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[PayrollDeduction Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || '';
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[PayrollDeduction Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[PayrollDeduction Tour] Using tour steps with API overrides');

  return [
    {
      id: 'payroll-deduction-welcome',
      title: apiStepsMap.get('payroll-deduction-welcome')?.title || 'Welcome to Payroll Deduction Management!',
      text: apiStepsMap.get('payroll-deduction-welcome')?.description || 'This page allows you to manage payroll deductions for allowances and deductions. Let me guide you through all the features.',
      attachTo: {
        element: '#payroll-deduction-title',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip Tour',
          action: (tour: Tour) => tour.cancel(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: (tour: Tour) => tour.next()
        }
      ]
    },
    {
      id: 'payroll-deduction-deduction-type',
      title: apiStepsMap.get('payroll-deduction-deduction-type')?.title || 'Deduction Type Selection',
      text: apiStepsMap.get('payroll-deduction-deduction-type')?.description || 'Choose between "Allowance" or "Deduction" type. This determines which payroll type you will be working with.',
      attachTo: {
        element: '#deduction-type-select',
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
      id: 'payroll-deduction-payroll-name',
      title: apiStepsMap.get('payroll-deduction-payroll-name')?.title || 'Payroll Name',
      text: apiStepsMap.get('payroll-deduction-payroll-name')?.description || 'Select the specific payroll name from the dropdown. The available options depend on the deduction type you selected.',
      attachTo: {
        element: '#payroll-name-select',
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
      id: 'payroll-deduction-month',
      title: apiStepsMap.get('payroll-deduction-month')?.title || 'Month Selection',
      text: apiStepsMap.get('payroll-deduction-month')?.description || 'Choose the month for which you want to manage payroll deductions.',
      attachTo: {
        element: '#month-select',
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
      id: 'payroll-deduction-year',
      title: apiStepsMap.get('payroll-deduction-year')?.title || 'Year Selection',
      text: apiStepsMap.get('payroll-deduction-year')?.description || 'Select the year for the payroll deductions you want to manage.',
      attachTo: {
        element: '#year-select',
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
      id: 'payroll-deduction-search',
      title: apiStepsMap.get('payroll-deduction-search')?.title || 'Search Button',
      text: apiStepsMap.get('payroll-deduction-search')?.description || 'Click the Search button to fetch employee data based on your selected filters. The table will display all eligible employees.',
      attachTo: {
        element: '#search-button',
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
      id: 'payroll-deduction-datatable',
      title: apiStepsMap.get('payroll-deduction-datatable')?.title || 'Employee Data Table',
      text: apiStepsMap.get('payroll-deduction-datatable')?.description || 'This table displays all employees with their details. You can filter by any column using the search inputs in each column header. The table also supports sorting.',
      attachTo: {
        element: '.rdt_Table',
        on: 'top'
      },
      beforeShowPromise: function () {
        return new Promise(resolve => setTimeout(resolve, 300));
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
      id: 'payroll-deduction-amount-field',
      title: apiStepsMap.get('payroll-deduction-amount-field')?.title || 'Amount Input Field',
      text: apiStepsMap.get('payroll-deduction-amount-field')?.description || 'Enter or modify the deduction/allowance amount for each employee in this field. Changes are saved locally until you submit.',
      attachTo: {
        element: 'input[type="number"]',
        on: 'bottom'
      },
      advanceOn: {
        selector: 'input[type="number"]',
        event: 'focus'
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
      id: 'payroll-deduction-submit',
      title: apiStepsMap.get('payroll-deduction-submit')?.title || 'Submit Data',
      text: apiStepsMap.get('payroll-deduction-submit')?.description || 'Click Submit Data to save all entered amounts to the system. This will permanently save the payroll deduction records.',
      attachTo: {
        element: '#submit-button',
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
      id: 'payroll-deduction-export-print',
      title: apiStepsMap.get('payroll-deduction-export-print')?.title || 'Print Functionality',
      text: apiStepsMap.get('payroll-deduction-export-print')?.description || 'Use the Print button to print the current table data. This is useful for generating hard copies of the payroll deduction records.',
      attachTo: {
        element: '#export-print',
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
      id: 'payroll-deduction-export-pdf',
      title: apiStepsMap.get('payroll-deduction-export-pdf')?.title || 'Export to PDF',
      text: apiStepsMap.get('payroll-deduction-export-pdf')?.description || 'Click the PDF button to export the current data to a PDF file. The exported file includes all employee details and amounts.',
      attachTo: {
        element: '#export-pdf',
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
      id: 'payroll-deduction-export-excel',
      title: apiStepsMap.get('payroll-deduction-export-excel')?.title || 'Export to Excel',
      text: apiStepsMap.get('payroll-deduction-export-excel')?.description || 'Use the Excel button to export data to an Excel spreadsheet. This format is ideal for further analysis or sharing with other systems.',
      attachTo: {
        element: '#export-excel',
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
          action: (tour: Tour) => tour.complete()
        }
      ]
    }
  ];
};

// Export default tour steps for backward compatibility
export const PayrollDeductionTourSteps: PayrollDeductionTourStep[] = createPayrollDeductionTourSteps();

export class PayrollDeductionTour {
  private tour!: Tour;

  public async startTour(menuId?: number): Promise<void> {
    if (sessionStorage.getItem('payrollDeductionTourCompleted') === 'true') return;

    // Get current page info including menuId
    const pageInfo = getPageInfo();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/HRMS/Payroll/Payroll-Deduction';

    // Use provided menuId, or get from pageInfo, or from session storage
    let finalMenuId: number = menuId || pageInfo.menuId;

    // Try to get menuId from session storage if still not found
    if (!finalMenuId && typeof window !== 'undefined') {
      const storedMenuId = sessionStorage.getItem('triggerPageTourMenuId');
      if (storedMenuId) {
        finalMenuId = parseInt(storedMenuId) || 0;
      }
    }

    // Use menu_id 108 for Payroll Deduction
    const apiMenuId = finalMenuId || 108;

    // Fetch tour steps from API
    console.log('[PayrollDeduction Tour] Fetching API data with menu_id:', apiMenuId);
    const apiTourData = await fetchPayrollDeductionTourStepsFromAPI(apiMenuId);

    // Create tour steps with API data override
    const tourSteps = createPayrollDeductionTourSteps(apiTourData);

    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' }
      },
      useModalOverlay: true,
      exitOnEsc: true
    });

    // Log tour started
    logUserJourney({
      eventType: 'tour_started',
      stepKey: 'payroll-deduction-welcome',
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

    tourSteps.forEach(step => {
      this.tour.addStep({
        ...step,
        buttons: step.buttons?.map(btn => ({
          text: btn.text,
          classes: btn.classes,
          action: () => {
            // Log step completion when user clicks Next or Finish
            const buttonText = btn.text?.toLowerCase() || '';
            if (buttonText === 'next' || buttonText === 'finish tour') {
              logUserJourney({
                eventType: 'tour_step_complete',
                stepKey: step.id,
                menuId: finalMenuId,
                accessLink: currentPath,
              }).catch(err => console.error('Journey logging error:', err));
            }

            if (btn.text === 'Next') this.tour.next();
            if (btn.text === 'Previous') this.tour.back();
            if (btn.text === 'Skip Tour') this.tour.cancel();
            if (btn.text === 'Finish Tour') this.tour.complete();
          }
        }))
      });
    });

    this.tour.on('complete', () => {
      sessionStorage.setItem('payrollDeductionTourCompleted', 'true');
      console.log('Payroll Deduction tour completed!');

      logUserJourney({
        eventType: 'tour_step_complete',
        stepKey: 'payroll-deduction-complete',
        menuId: finalMenuId,
        accessLink: currentPath,
      }).catch(err => console.error('Journey logging error:', err));
    });

    this.tour.on('cancel', () => {
      sessionStorage.setItem('payrollDeductionTourCompleted', 'true');
      console.log('Payroll Deduction tour cancelled');

      logUserJourney({
        eventType: 'tour_skipped',
        stepKey: null,
        menuId: finalMenuId,
        accessLink: currentPath,
      }).catch(err => console.error('Journey logging error:', err));
    });

    this.tour.start();
  }
}


// Export tour styles
export const PayrollDeductionTourStyles = `
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
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = PayrollDeductionTourStyles;
  document.head.appendChild(styleSheet);
}
