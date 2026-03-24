import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface ApplyLeaveTourStepData {
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
        console.error('[ApplyLeave Tour] Error getting userData:', e);
    }
    return null;
};

// Fetch tour steps from API
const fetchApplyLeaveTourStepsFromAPI = async (menuId: number): Promise<ApplyLeaveTourStepData[]> => {
    const userData = getUserData();
    if (!userData) {
        console.log('[ApplyLeave Tour] No userData available, using default tour steps');
        return [];
    }

    try {
        const baseUrl = userData.url;
        const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
        console.log('[ApplyLeave Tour] Fetching tour steps from API:', apiUrl);

        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[ApplyLeave Tour] Raw API response:', json);

        // Handle different response formats
        let tourData: ApplyLeaveTourStepData[] = [];

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
                    console.log(`[ApplyLeave Tour] Found array data in response.${key}`);
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

        console.log('[ApplyLeave Tour] Parsed tour data:', normalizedTourData);
        return normalizedTourData;
    } catch (error) {
        console.error('[ApplyLeave Tour] Error fetching tour steps:', error);
        return [];
    }
};

export interface ApplyLeaveTourStep {
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

// Form control interface for tour to interact with form
export interface ApplyLeaveFormControls {
    setTypeOfLeave: (value: string) => void;
    setDayType: (value: string) => void;
    openTypeOfLeaveDropdown: () => void;
    openDayTypeDropdown: () => void;
}

export class ApplyLeaveTour {
    public tour: Tour | null = null;
    private isActive = false;
    private formControls: ApplyLeaveFormControls | null = null;

    // Tour state persistence keys
    private static readonly TOUR_STATE_KEY = 'applyLeaveTourState';
    private static readonly COMPLETED_KEY = 'applyLeaveTourCompleted';

    // Tour trigger value for this page
    public static readonly TRIGGER_VALUE = 'apply-leave';

    // Global instance for cross-component access
    public static globalInstance: ApplyLeaveTour | null = null;

    constructor() {
        ApplyLeaveTour.globalInstance = this;
    }

    // Set form controls for tour to interact with
    public setFormControls(controls: ApplyLeaveFormControls): void {
        this.formControls = controls;
    }

    // Check if tour should start (only when triggered from sidebar)
 public shouldStartTour(): boolean {
  if (typeof window === 'undefined') return false;

  const triggerValue = sessionStorage.getItem('triggerPageTour');

  console.log('ApplyLeave tour trigger:', triggerValue);

  // Tour runs ONLY when sidebar explicitly triggered it
  if (triggerValue !== 'apply-leave') {
    return false;
  }

  return true;
}


    // Start the tour
    public async startTour(): Promise<void> {
        if (this.isActive) return;

        console.log('Starting ApplyLeave tour...');

        // Fetch tour steps from API (menu_id = 102 for Apply Leave)
        const apiTourData = await fetchApplyLeaveTourStepsFromAPI(102);
        console.log('[ApplyLeave Tour] API tour data fetched:', apiTourData);

        // Clear the trigger flag
        // sessionStorage.removeItem('triggerPageTour');

        // Log tour started event
        const { menuId: startMenuId, accessLink: startAccessLink } = getPageInfo();
        logUserJourney({
            eventType: 'tour_started',
            stepKey: 'apply-leave-tour',
            menuId: startMenuId,
            accessLink: startAccessLink || '/HRMS/Leave-Management/ApplyLeave',
        }).catch(console.error);

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

        const steps = this.createSteps(apiTourData);
        console.log('ApplyLeave tour steps created:', steps.length);

        // Add steps to tour
        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('show', (event) => {
            const currentStep = event.step;
            const stepId = currentStep.id || 'apply-leave-step';
            // Log tour step view journey event
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
                eventType: 'tour_step_view',
                stepKey: stepId,
                menuId: menuId,
                accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
            }).catch(console.error);
        });

   this.tour.on('cancel', () => {
    this.isActive = false;
    this.saveTourState();
       // Log tour skipped journey event
       const { menuId, accessLink } = getPageInfo();
       const currentStep = this.tour?.getCurrentStep();
       const stepId = currentStep?.id || 'apply-leave-tour';
       logUserJourney({
           eventType: 'tour_skipped',
           stepKey: stepId,
           menuId: menuId,
           accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
       }).catch(console.error);
    localStorage.setItem(ApplyLeaveTour.COMPLETED_KEY, 'true');
    sessionStorage.removeItem('triggerPageTour');
});


 this.tour.on('complete', () => {
    this.isActive = false;
    this.saveTourState();
     // Log tour completed journey event
     const { menuId, accessLink } = getPageInfo();
     logUserJourney({
         eventType: 'tour_complete',
         stepKey: 'apply-leave-tour',
         menuId: menuId,
         accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
     }).catch(console.error);
    localStorage.setItem(ApplyLeaveTour.COMPLETED_KEY, 'true');
    sessionStorage.removeItem('triggerPageTour');
    this.showCompletionMessage();
});


        this.isActive = true;
        this.saveTourState();

        // Start tour after a short delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Calling ApplyLeave tour.start()');
            this.tour?.start();
        }, 300);
    }

    private createSteps(apiTourData?: ApplyLeaveTourStepData[]): ApplyLeaveTourStep[] {
        const steps: ApplyLeaveTourStep[] = [];

        // Create a Map from API data for easy lookup by step ID
        const apiStepsMap = new Map<string, { title: string; description: string }>();

        if (apiTourData && apiTourData.length > 0) {
            console.log('[ApplyLeave Tour] Creating apiStepsMap from API data:', apiTourData);

            apiTourData.forEach((stepData) => {
                const stepId = stepData.on_click || '';
                const stepTitle = stepData.title || '';
                const stepDescription = stepData.description || '';

                if (stepId) {
                    apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
                }
            });

            console.log('[ApplyLeave Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
        }

        console.log('[ApplyLeave Tour] Using tour steps with API overrides');

        // Helper to auto-set form values for tour
        const setupTourForm = async () => {
            // Set type of leave to "employee" to show department/employee fields
            if (this.formControls) {
                this.formControls.setTypeOfLeave('employee');
                await new Promise(resolve => setTimeout(resolve, 300));
                this.formControls.openTypeOfLeaveDropdown();
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        };

        // Welcome step
        steps.push({
            id: 'apply-leave-welcome',
            title: apiStepsMap.get('apply-leave-welcome')?.title || '🏖️ Leave Application',
            text: apiStepsMap.get('apply-leave-welcome')?.description || 'Welcome to the Leave Application page! This tour will guide you through all the features for submitting leave requests. Let\'s set up the form to show you all available options.',
            attachTo: {
                element: '#tour-leave-title',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await setupTourForm();
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => this.tour?.cancel(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => {
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-welcome',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Type of Leave field - now shows employee option
        steps.push({
            id: 'apply-leave-type',
            title: apiStepsMap.get('apply-leave-type')?.title || '📋 Type of Leave',
            text: apiStepsMap.get('apply-leave-type')?.description || 'Select whether this leave is for "Self" or for an "Employee". We\'ve automatically selected "Employee" to show you additional fields below.',
            attachTo: {
                element: '#tour-type-of-leave',
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-type',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Department field - now visible
        steps.push({
            id: 'apply-leave-department',
            title: apiStepsMap.get('apply-leave-department')?.title || '🏢 Department',
            text: apiStepsMap.get('apply-leave-department')?.description || 'Select the department of the employee you\'re applying leave for. This field appears when "Employee" is selected as the Type of Leave.',
            attachTo: {
                element: '#tour-department',
                on: 'right'
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-department',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Employee field - now visible
        steps.push({
            id: 'apply-leave-employee',
            title: apiStepsMap.get('apply-leave-employee')?.title || '👤 Employee',
            text: apiStepsMap.get('apply-leave-employee')?.description || 'Select the specific employee you\'re applying leave for. Employees are filtered based on the department selected above.',
            attachTo: {
                element: '#tour-employee',
                on: 'right'
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-employee',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Leave Type field
        steps.push({
            id: 'apply-leave-leave-type',
            title: apiStepsMap.get('apply-leave-leave-type')?.title || '🏷️ Leave Type',
            text: apiStepsMap.get('apply-leave-leave-type')?.description || 'Select the type of leave you want to apply for (e.g., Casual Leave, Sick Leave, Earned Leave, etc.). This will be loaded from your organization\'s leave policy.',
            attachTo: {
                element: '#tour-leave-type',
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-leave-type',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Day Type field - set to "full" to show date fields
        const setupFullDay = async () => {
            if (this.formControls) {
                this.formControls.setDayType('full');
                await new Promise(resolve => setTimeout(resolve, 300));
                this.formControls.openDayTypeDropdown();
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        };

        steps.push({
            id: 'apply-leave-day-type',
            title: apiStepsMap.get('apply-leave-day-type')?.title || '📅 Day Type',
            text: apiStepsMap.get('apply-leave-day-type')?.description || 'Choose whether you\'re taking a "Full" day leave or a "Half" day leave. We\'ve selected "Full" to show you the date range fields.',
            attachTo: {
                element: '#tour-day-type',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await setupFullDay();
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-day-type',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // From Date field - now visible
        steps.push({
            id: 'apply-leave-from-date',
            title: apiStepsMap.get('apply-leave-from-date')?.title || '📆 From Date',
            text: apiStepsMap.get('apply-leave-from-date')?.description || 'Select the starting date of your leave. For full day leave, this is when your leave period begins.',
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-from-date',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // To Date field - now visible
        steps.push({
            id: 'apply-leave-to-date',
            title: apiStepsMap.get('apply-leave-to-date')?.title || '📆 To Date',
            text: apiStepsMap.get('apply-leave-to-date')?.description || 'Select the end date of your leave. Your leave period will run from the From Date to this To Date (inclusive).',
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-to-date',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Comment field
        steps.push({
            id: 'apply-leave-comment',
            title: apiStepsMap.get('apply-leave-comment')?.title || '💬 Comment',
            text: apiStepsMap.get('apply-leave-comment')?.description || 'Add any comments or notes about your leave request. This is optional but can help your manager understand your leave request better.',
            attachTo: {
                element: '#tour-comment',
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-comment',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Submit button
        steps.push({
            id: 'apply-leave-submit',
            title: apiStepsMap.get('apply-leave-submit')?.title || '✅ Submit',
            text: apiStepsMap.get('apply-leave-submit')?.description || 'Click here to submit your leave application. Make sure all required fields are filled before submitting.',
            attachTo: {
                element: '#tour-submit-btn',
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-submit',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Reset button
        steps.push({
            id: 'apply-leave-reset',
            title: apiStepsMap.get('apply-leave-reset')?.title || '🔄 Reset',
            text: apiStepsMap.get('apply-leave-reset')?.description || 'Use this button to clear all form fields and start fresh. This is useful if you want to cancel the current leave request.',
            attachTo: {
                element: '#tour-reset-btn',
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
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-reset',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.next();
                    }
                }
            ]
        });

        // Submitted Applications Table
        steps.push({
            id: 'apply-leave-table',
            title: apiStepsMap.get('apply-leave-table')?.title || '📊 Submitted Leave Applications',
            text: apiStepsMap.get('apply-leave-table')?.description || 'This table shows all your submitted leave applications. You can view the status, dates, and details of each request here.',
            attachTo: {
                element: '#tour-submitted-table',
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
                    action: () => {
                        // Log step complete
                        const { menuId, accessLink } = getPageInfo();
                        logUserJourney({
                            eventType: 'tour_step_complete',
                            stepKey: 'apply-leave-table',
                            menuId: menuId,
                            accessLink: accessLink || '/HRMS/Leave-Management/ApplyLeave',
                        }).catch(console.error);
                        this.tour?.complete();
                    }
                }
            ]
        });

        return steps;
    }

    // Save tour state to localStorage
    private saveTourState(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(ApplyLeaveTour.TOUR_STATE_KEY, JSON.stringify({
                isActive: this.isActive,
                timestamp: Date.now()
            }));
        }
    }

    // Show completion message
    private showCompletionMessage(): void {
        console.log('✅ ApplyLeave tour completed successfully!');
    }

    // Cancel tour
    public cancelTour(): void {
        if (this.tour) {
            this.tour.cancel();
            this.isActive = false;
            localStorage.setItem(ApplyLeaveTour.COMPLETED_KEY, 'true');
        }
    }

    // Restart tour
    public async restartTour(): Promise<void> {
        localStorage.removeItem(ApplyLeaveTour.COMPLETED_KEY);
        localStorage.removeItem(ApplyLeaveTour.TOUR_STATE_KEY);
        this.isActive = false;
        await this.startTour();
    }

    // Check if tour is active
    public isTourActive(): boolean {
        return this.isActive;
    }
}

// Custom CSS for ApplyLeave tour
export const applyLeaveTourStyles = `
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

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = applyLeaveTourStyles;
    document.head.appendChild(styleSheet);
}
