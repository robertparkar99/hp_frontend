import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface DepartmentWiseReportTourStepData {
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
        console.error('[DepartmentWiseReport Tour] Error getting userData:', e);
    }
    return null;
};

// Fetch tour steps from API
const fetchDepartmentWiseReportTourStepsFromAPI = async (menuId: number): Promise<DepartmentWiseReportTourStepData[]> => {
    const userData = getUserData();
    if (!userData) {
        console.log('[DepartmentWiseReport Tour] No userData available, using default tour steps');
        return [];
    }

    try {
        const baseUrl = userData.url;
        const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
        console.log('[DepartmentWiseReport Tour] Fetching tour steps from API:', apiUrl);

        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[DepartmentWiseReport Tour] Raw API response:', json);

        // Handle different response formats
        let tourData: DepartmentWiseReportTourStepData[] = [];

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
                    console.log(`[DepartmentWiseReport Tour] Found array data in response.${key}`);
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

        console.log('[DepartmentWiseReport Tour] Parsed tour data:', normalizedTourData);
        return normalizedTourData;
    } catch (error) {
        console.error('[DepartmentWiseReport Tour] Error fetching tour steps:', error);
        return [];
    }
};

export interface TourStep {
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

export class DepartmentWiseReportTour {
    public tour: Tour | null = null;
    private isActive = false;
    private pausedStepIndex: number = 0;

    // Constants for tour state persistence
    private static readonly TOUR_STATE_KEY = 'departmentWiseReportTourState';
    private static readonly PAUSED_STEP_KEY = 'departmentWiseReportTourPausedStep';

    // Handle step show event
    private handleShow = (event: any): void => {
        const currentStep = event.step;
        const steps = this.tour?.steps || [];
        const stepIndex = steps.findIndex((s: any) => s.id === currentStep.id);

        if (stepIndex >= 0) {
            this.pausedStepIndex = stepIndex;
            localStorage.setItem(
                DepartmentWiseReportTour.PAUSED_STEP_KEY,
                String(stepIndex)
            );
        }

        const element = currentStep.getElement();
        if (element) {
            element.style.animation = 'pulse 2s infinite';
        }

        // Log tour step view event
        const stepId = currentStep.id || `step_${stepIndex}`;
        const { menuId, accessLink } = getPageInfo();
        logUserJourney({
            eventType: 'tour_step_view',
            stepKey: stepId,
            menuId: menuId,
            accessLink: accessLink || '/HRMS/DepartmentWiseReport',
        });
    };

    // Handle step hide event
    private handleHide = (event: any): void => {
        const currentStep = event.step;
        const element = currentStep.getElement();
        if (element) {
            element.style.animation = '';
        }
    };

    // Handle tour completion
    private handleComplete = (): void => {
        this.isActive = false;
        this.clearTourState();
        localStorage.setItem('departmentWiseReportTourCompleted', 'true');
        this.showCompletionMessage();

        // Log tour complete event
        const { menuId, accessLink } = getPageInfo();
        logUserJourney({
            eventType: 'tour_complete',
            stepKey: 'department-wise-report-tour',
            menuId: menuId,
            accessLink: accessLink || '/HRMS/DepartmentWiseReport',
        });
    };

    // Handle tour cancellation
    private handleCancel = (): void => {
        this.isActive = false;
        this.clearTourState();

        // Log tour skipped event
        const { menuId, accessLink } = getPageInfo();
        logUserJourney({
            eventType: 'tour_skipped',
            stepKey: 'department-wise-report-tour',
            menuId: menuId,
            accessLink: accessLink || '/HRMS/DepartmentWiseReport',
        });
    };

    // Save tour state to localStorage
    private saveTourState(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(DepartmentWiseReportTour.TOUR_STATE_KEY, JSON.stringify({
                isActive: this.isActive,
                pausedStepIndex: this.pausedStepIndex,
                timestamp: Date.now()
            }));
        }
    }

    // Clear tour state from localStorage
    private clearTourState(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(DepartmentWiseReportTour.TOUR_STATE_KEY);
            localStorage.removeItem(DepartmentWiseReportTour.PAUSED_STEP_KEY);
        }
    }

    // Helper method to log tour step completion
    private logStepComplete = (stepId: string): (() => void) => {
        return () => {
            const { menuId, accessLink } = getPageInfo();
            logUserJourney({
                eventType: 'tour_step_complete',
                stepKey: stepId,
                menuId: menuId,
                accessLink: accessLink || '/HRMS/DepartmentWiseReport',
            });
        };
    };

    // Create tour steps with optional API data override
    private createSteps(apiTourData?: DepartmentWiseReportTourStepData[]): TourStep[] {
        const steps: TourStep[] = [];

        // Create a Map from API data for easy lookup by step ID
        const apiStepsMap = new Map<string, { title: string; description: string }>();

        if (apiTourData && apiTourData.length > 0) {
            console.log('[DepartmentWiseReport Tour] Creating apiStepsMap from API data:', apiTourData.length);

            apiTourData.forEach((stepData) => {
                const stepId = stepData.on_click || '';
                const stepTitle = stepData.title || '';
                const stepDescription = stepData.description || '';

                if (stepId) {
                    apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
                }
            });

            console.log('[DepartmentWiseReport Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
        }

        console.log('[DepartmentWiseReport Tour] Using tour steps with API overrides');

        // Step 1: Welcome / Introduction
        steps.push({
            id: 'welcome',
            title: apiStepsMap.get('welcome')?.title || '👋 Welcome to Department Wise Report!',
            text: apiStepsMap.get('welcome')?.description || 'This page allows you to generate and view attendance reports organized by department. Let\'s explore the features together.',
            attachTo: {
                element: '#tour-page-title',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => {
                        this.logStepComplete('welcome')();
                        this.tour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => {
                        this.logStepComplete('welcome')();
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 2: From Date Picker
        steps.push({
            id: 'from-date',
            title: apiStepsMap.get('from-date')?.title || '📅 From Date',
            text: apiStepsMap.get('from-date')?.description || 'Select the starting date for your attendance report. This defines the beginning of the date range you want to analyze.',
            attachTo: {
                element: '#tour-from-date',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => {
                        this.logStepComplete('from-date')();
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('from-date')();
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 3: To Date Picker
        steps.push({
            id: 'to-date',
            title: apiStepsMap.get('to-date')?.title || '📅 To Date',
            text: apiStepsMap.get('to-date')?.description || 'Select the ending date for your attendance report. This defines the end of the date range you want to analyze.',
            attachTo: {
                element: '#tour-to-date',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => {
                        this.logStepComplete('to-date')();
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('to-date')();
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 4: Employee/Department Selector
        steps.push({
            id: 'employee-selector',
            title: apiStepsMap.get('employee-selector')?.title || '👥 Employee & Department Filter',
            text: apiStepsMap.get('employee-selector')?.description || 'Use this section to filter by departments and/or specific employees. You can select multiple departments and employees using the dropdown menus.',
            attachTo: {
                element: '#tour-employee-selector',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => {
                        this.logStepComplete('employee-selector')();
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('employee-selector')();
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 5: Search Button
        steps.push({
            id: 'search-button',
            title: apiStepsMap.get('search-button')?.title || '🔍 Search Button',
            text: apiStepsMap.get('search-button')?.description || 'Click this button to generate the attendance report based on your selected date range and filters. The data will be displayed in the table below.',
            attachTo: {
                element: '#tour-search-button',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => {
                        this.logStepComplete('search-button')();
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('search-button')();
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 6: Export Buttons
        steps.push({
            id: 'export-buttons',
            title: apiStepsMap.get('export-buttons')?.title || '📤 Export Options',
            text: apiStepsMap.get('export-buttons')?.description || 'Once data is loaded, you can export it using these buttons: Print (🖨️), PDF export, or Excel export. This helps you share or save reports offline.',
            attachTo: {
                element: '#tour-export-buttons',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => {
                        this.logStepComplete('export-buttons')();
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('export-buttons')();
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 7: Data Table
        steps.push({
            id: 'data-table',
            title: apiStepsMap.get('data-table')?.title || '📊 Attendance Data Table',
            text: apiStepsMap.get('data-table')?.description || 'This table displays the attendance data for all employees matching your filters. You can view columns like: Sr No., Department, Employee Name, Total Days, Week Off, Holiday, Total Working, Total Present, Absent Days, Half Days, and Late Comes. Click column headers to sort.',
            attachTo: {
                element: '#tour-data-table',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => {
                        this.logStepComplete('data-table')();
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Finish Tour',
                    action: () => {
                        this.logStepComplete('data-table')();
                        this.tour?.complete();
                    }
                }
            ]
        });

        return steps;
    }

    // Start the tour
    public async startTour(): Promise<void> {
        // Check if tour was already completed
        if (localStorage.getItem('departmentWiseReportTourCompleted') === 'true') {
            console.log('Department Wise Report tour already completed');
            return;
        }

        // Check if already active
        if (this.isActive) return;

        console.log('Starting Department Wise Report tour');

        // Fetch tour steps from API (menu_id = 164 for Department Wise Report)
        const apiTourData = await fetchDepartmentWiseReportTourStepsFromAPI(164);
        console.log('[DepartmentWiseReport Tour] API tour data fetched:', apiTourData);

        // Log tour started event
        const { menuId, accessLink } = getPageInfo();
        logUserJourney({
            eventType: 'tour_started',
            stepKey: 'department-wise-report-tour',
            menuId: menuId,
            accessLink: accessLink || '/HRMS/DepartmentWiseReport',
        });

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
        console.log('Tour steps created:', steps.length);

        // Add steps to tour
        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('cancel', this.handleCancel);
        this.tour.on('show', this.handleShow);
        this.tour.on('hide', this.handleHide);
        this.tour.on('complete', this.handleComplete);

        this.isActive = true;
        this.saveTourState();

        // Start tour with a small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Calling tour.start()');
            this.tour?.start();
        }, 100);
    }

    // Resume tour from saved step
    public async resumeTour(): Promise<void> {
        const savedPausedStep = parseInt(
            localStorage.getItem(DepartmentWiseReportTour.PAUSED_STEP_KEY) || '0',
            10
        );

        if (savedPausedStep > 0 && !localStorage.getItem('departmentWiseReportTourCompleted')) {
            console.log('Resuming Department Wise Report tour from step:', savedPausedStep);

            // Fetch tour steps from API
            const apiTourData = await fetchDepartmentWiseReportTourStepsFromAPI(164);

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
            steps.forEach(step => {
                this.tour!.addStep(step);
            });

            this.tour.on('cancel', this.handleCancel);
            this.tour.on('show', this.handleShow);
            this.tour.on('hide', this.handleHide);
            this.tour.on('complete', this.handleComplete);

            this.isActive = true;

            setTimeout(() => {
                if (steps[savedPausedStep]) {
                    this.tour?.show(steps[savedPausedStep].id);
                } else {
                    this.tour?.start();
                }
            }, 100);
        }
    }

    // Cancel the tour
    public cancelTour(): void {
        if (this.tour) {
            this.tour.cancel();
            this.isActive = false;
            this.clearTourState();
        }
    }

    // Restart the tour
    public restartTour(): void {
        localStorage.removeItem('departmentWiseReportTourCompleted');
        this.clearTourState();
        this.pausedStepIndex = 0;
        this.isActive = false;
        this.startTour();
    }

    // Show completion message
    private showCompletionMessage(): void {
        console.log('Department Wise Report tour completed successfully!');
    }

    // Check if tour is active
    public isTourActive(): boolean {
        return this.isActive;
    }
}

// Custom CSS for enhanced tour experience
export const departmentTourStyles = `
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
    styleSheet.textContent = departmentTourStyles;
    document.head.appendChild(styleSheet);
}
