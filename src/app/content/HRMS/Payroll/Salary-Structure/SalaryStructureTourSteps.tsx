import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface SalaryStructureTourStepData {
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
    console.error('[SalaryStructure Tour] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
export const fetchSalaryStructureTourStepsFromAPI = async (menuId: number): Promise<SalaryStructureTourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[SalaryStructure Tour] No userData available, using default tour steps');
    return [];
  }

  try {
    const baseUrl = userData.url;
    const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
    console.log('[SalaryStructure Tour] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[SalaryStructure Tour] Raw API response:', json);

    // Handle different response formats
    let tourData: SalaryStructureTourStepData[] = [];

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
          console.log(`[SalaryStructure Tour] Found array data in response.${key}`);
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

    console.log('[SalaryStructure Tour] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[SalaryStructure Tour] Error fetching tour steps:', error);
    return [];
  }
};

// Custom interface for tour steps (since StepOptions in shepherd.js v15 may not include id)
export interface SalaryStructureTourStep {
  id: string;
  title?: string;
  text: string;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  };
  buttons?: Array<{
    text: string;
    // Using function type that accepts any this context for shepherd.js compatibility
    action: (this: any, ...args: any[]) => void;
    classes?: string;
  }>;
  advanceOn?: {
    selector: string;
    event: string;
  };
  beforeShowPromise?: () => Promise<void>;
}

// Create tour steps with API data override using Map approach
export const createSalaryStructureTourSteps = (apiTourData?: SalaryStructureTourStepData[]): SalaryStructureTourStep[] => {
  // Create a Map from API data for easy lookup by step ID
  const apiStepsMap = new Map<string, { title: string; description: string }>();

  if (apiTourData && apiTourData.length > 0) {
    console.log('[SalaryStructure Tour] Creating apiStepsMap from API data:', apiTourData.length);

    apiTourData.forEach((stepData) => {
      const stepId = stepData.on_click || '';
      const stepTitle = stepData.title || '';
      const stepDescription = stepData.description || '';

      if (stepId) {
        apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
      }
    });

    console.log('[SalaryStructure Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
  }

  console.log('[SalaryStructure Tour] Using tour steps with API overrides');

  return [
    {
      id: 'welcome',
      title: apiStepsMap.get('welcome')?.title || 'Welcome to Salary Structure Management',
      text: apiStepsMap.get('welcome')?.description || 'This page allows you to manage employee salary structures. Let\'s explore the features together.',
      attachTo: { element: '#salary-structure-header', on: 'bottom' },
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
      id: 'header-section',
      title: apiStepsMap.get('header-section')?.title || 'Salary Structure Header',
      text: apiStepsMap.get('header-section')?.description || 'This is the main header for the Salary Structure Management section. All salary-related operations are performed from this page.',
      attachTo: { element: '#salary-structure-header', on: 'bottom' },
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
      id: 'department-selector',
      title: apiStepsMap.get('department-selector')?.title || 'Select Department',
      text: apiStepsMap.get('department-selector')?.description || 'Choose one or more departments to filter employees. The selection will affect which employees\' salary structures you can view and edit.',
      attachTo: { element: '#department-selector', on: 'bottom' },
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
      id: 'employee-status',
      title: apiStepsMap.get('employee-status')?.title || 'Employee Status',
      text: apiStepsMap.get('employee-status')?.description || 'Filter employees by their status: Active, Inactive, or view All employees. This helps you manage salary structures for different employee groups.',
      attachTo: { element: '#employee-status', on: 'bottom' },
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
      id: 'search-button',
      title: apiStepsMap.get('search-button')?.title || 'Search Button',
      text: apiStepsMap.get('search-button')?.description || 'Click this button to fetch and display employee salary data based on your selected filters (department and status).',
      attachTo: { element: '#search-button', on: 'bottom' },
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
      id: 'export-buttons',
      title: apiStepsMap.get('export-buttons')?.title || 'Export Options',
      text: apiStepsMap.get('export-buttons')?.description || 'Export your salary structure data in various formats: Print, PDF, Excel, or CSV. Choose the format that best suits your reporting needs.',
      attachTo: { element: '#export-buttons', on: 'bottom' },
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
      id: 'data-table',
      title: apiStepsMap.get('data-table')?.title || 'Salary Structure Data Table',
      text: apiStepsMap.get('data-table')?.description || 'This table displays all employee salary information. You can search within columns, sort data, and edit salary values directly. Use the input fields in each column header to filter data.',
      attachTo: { element: '#salary-data-table', on: 'top' },
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
      id: 'column-srno',
      title: apiStepsMap.get('column-srno')?.title || 'Sr No. Column',
      text: apiStepsMap.get('column-srno')?.description || 'This column shows the serial number for each row. You can search or filter by serial number using the input field in the header.',
      attachTo: { element: '#column-srno', on: 'bottom' },
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
      id: 'column-empno',
      title: apiStepsMap.get('column-empno')?.title || 'Employee No. Column',
      text: apiStepsMap.get('column-empno')?.description || 'This column displays the employee number for each employee. Use the search input to filter by employee number.',
      attachTo: { element: '#column-empno', on: 'bottom' },
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
      id: 'column-empname',
      title: apiStepsMap.get('column-empname')?.title || 'Employee Name Column',
      text: apiStepsMap.get('column-empname')?.description || 'This column shows the full name of each employee. You can search or filter by employee name using the input field.',
      attachTo: { element: '#column-empname', on: 'bottom' },
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
      id: 'column-department',
      title: apiStepsMap.get('column-department')?.title || 'Department Column',
      text: apiStepsMap.get('column-department')?.description || 'This column displays the department each employee belongs to. Filter by department to find employees in specific departments.',
      attachTo: { element: '#column-department', on: 'bottom' },
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
      id: 'column-gender',
      title: apiStepsMap.get('column-gender')?.title || 'Gender Column',
      text: apiStepsMap.get('column-gender')?.description || 'This column shows the gender of each employee (M for Male, F for Female). Use the search input to filter by gender.',
      attachTo: { element: '#column-gender', on: 'bottom' },
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
      id: 'column-status',
      title: apiStepsMap.get('column-status')?.title || 'Status Column',
      text: apiStepsMap.get('column-status')?.description || 'This column shows whether the employee is Active or Inactive. Use the search input to filter employees by their status.',
      attachTo: { element: '#column-status', on: 'bottom' },
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
      id: 'payroll-columns-general',
      title: apiStepsMap.get('payroll-columns-general')?.title || 'Payroll Component Columns',
      text: apiStepsMap.get('payroll-columns-general')?.description || 'These columns represent different payroll components (Basic, DA, HRA, Allowances, etc.). Each column header shows the component name and type: +1 indicates addition, -1 indicates deduction. Click on any cell to edit the salary value.',
      attachTo: { element: '#salary-data-table', on: 'top' },
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
      id: 'column-gross-total',
      title: apiStepsMap.get('column-gross-total')?.title || 'Gross Total Column',
      text: apiStepsMap.get('column-gross-total')?.description || 'This column shows the gross total salary for each employee, calculated automatically by adding all positive payroll components and subtracting deductions. Click to view but do not edit - this is auto-calculated.',
      attachTo: { element: '#column-gross-total', on: 'bottom' },
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
      id: 'submit-button',
      title: apiStepsMap.get('submit-button')?.title || 'Submit Salary Structure',
      text: apiStepsMap.get('submit-button')?.description || 'After making changes to salary values, click this button to save the salary structures. Changes will be persisted to the database.',
      attachTo: { element: '#submit-button', on: 'top' },
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
      id: 'tour-complete',
      title: apiStepsMap.get('tour-complete')?.title || 'Tour Complete!',
      text: apiStepsMap.get('tour-complete')?.description || 'Congratulations! You now know how to use the Salary Structure Management page. You can filter employees, edit salary values, and export data as needed.',
      attachTo: { element: '#salary-structure-header', on: 'bottom' },
      buttons: [
        {
          text: 'Restart Tour',
          action: function (this: Tour) {
            localStorage.removeItem('salaryStructureTourCompleted');
            this.cancel();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish',
          action: function (this: Tour) {
            localStorage.setItem('salaryStructureTourCompleted', 'true');
            this.complete();
          }
        }
      ]
    }
  ];
};

// Export default tour steps for backward compatibility
export const salaryStructureTourSteps: SalaryStructureTourStep[] = createSalaryStructureTourSteps();

// Create and return the tour instance with API data
export const createSalaryStructureTour = async (menuId?: number): Promise<Tour> => {
  // Get current page info including menuId
  const pageInfo = getPageInfo();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/HRMS/Payroll/Salary-Structure';

  // Use provided menuId, or get from pageInfo, or from session storage
  let finalMenuId: number = menuId || pageInfo.menuId;

  // Try to get menuId from session storage if still not found
  if (!finalMenuId && typeof window !== 'undefined') {
    const storedMenuId = sessionStorage.getItem('triggerPageTourMenuId');
    if (storedMenuId) {
      finalMenuId = parseInt(storedMenuId) || 0;
    }
  }

  // Use menu_id 106 for Salary Structure
  const apiMenuId = finalMenuId || 106;

  // Fetch tour steps from API
  console.log('[SalaryStructure Tour] Fetching API data with menu_id:', apiMenuId);
  const apiTourData = await fetchSalaryStructureTourStepsFromAPI(apiMenuId);

  // Create tour steps with API data override
  const tourSteps = createSalaryStructureTourSteps(apiTourData);

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

  // Add steps to the tour
  tourSteps.forEach((step: SalaryStructureTourStep) => {
    tour.addStep(step as any);
  });

  // Log tour started
  logUserJourney({
    eventType: 'tour_started',
    stepKey: 'welcome',
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
    sessionStorage.setItem('salaryStructureTourCompleted', 'true');
    console.log('Salary Structure tour completed!');

    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: 'tour-complete',
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  });

  // Handle tour cancellation
  tour.on('cancel', () => {
    sessionStorage.setItem('salaryStructureTourCompleted', 'true');
    console.log('Salary Structure tour cancelled');

    logUserJourney({
      eventType: 'tour_skipped',
      stepKey: null,
      menuId: finalMenuId,
      accessLink: currentPath,
    }).catch(err => console.error('Journey logging error:', err));
  });

  return tour;
};

// Tour styles
export const salaryStructureTourStyles = `
  .shepherd-theme-custom.salary-structure-tour {
    --shepherd-theme-primary: #3080ff;
    --shepherd-theme-secondary: #6c757d;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-header {
    background: #007BE5;
    color: white;
    border-radius: 4px 4px 0 0;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-text {
    font-size: 14px;
    line-height: 1.5;
    color: #171717;
    padding: 16px;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button {
    background: #007BE5;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button-secondary {
    background: #6c757d !important;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-button-secondary:hover {
    background: #5a6268 !important;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-cancel-icon {
    color: white;
    font-size: 20px;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #546ee5;
    padding: 1em;
  }

  .shepherd-theme-custom.salary-structure-tour .shepherd-element {
    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
    border-radius: 12px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = salaryStructureTourStyles;
  styleSheet.id = 'salary-structure-tour-styles';
  // Only add if not already added
  if (!document.getElementById('salary-structure-tour-styles')) {
    document.head.appendChild(styleSheet);
  }
}
