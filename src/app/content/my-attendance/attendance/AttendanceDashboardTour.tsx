import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Type for tour step data from API
export interface AttendanceTourStepData {
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
        console.error('[Attendance Tour] Error getting userData:', e);
    }
    return null;
};

// Fetch tour steps from API
const fetchAttendanceTourStepsFromAPI = async (menuId: number): Promise<AttendanceTourStepData[]> => {
    const userData = getUserData();
    if (!userData) {
        console.log('[Attendance Tour] No userData available, using default tour steps');
        return [];
    }

    try {
        // Use localhost as base URL as specified, with token and sub_institute_id from userData
        const baseUrl = userData.url;
        const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
        console.log('[Attendance Tour] Fetching tour steps from API:', apiUrl);

        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[Attendance Tour] Raw API response:', json);

        // Handle different response formats
        let tourData: AttendanceTourStepData[] = [];

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
                    console.log(`[Attendance Tour] Found array data in response.${key}`);
                    break;
                }
            }
        }

        console.log('[Attendance Tour] Parsed tour data:', tourData);
        return tourData;
    } catch (error) {
        console.error('[Attendance Tour] Error fetching tour steps:', error);
        return [];
    }
};

export interface AttendanceTourStep {
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
}

export class AttendanceDashboardTour {
    public tour: Tour | null = null;
    private isActive = false;

    // Constants for tour state persistence
    private static readonly TOUR_TRIGGER_KEY = 'triggerPageTour';
    private static readonly TOUR_STATE_KEY = 'attendanceTourState';
    private static readonly PAUSED_STEP_KEY = 'attendanceTourPausedStep';
    private static readonly COMPLETED_KEY = 'attendanceTourCompleted';

    // Tour trigger value for this page
    public static readonly TRIGGER_VALUE = 'attendance-dashboard';

    constructor() {}

    // Get page info with menuId - uses getPageInfo from journeyLogger
    private getPageMenuInfo(): { menuId: number; accessLink: string } {
        const pageInfo = getPageInfo();
        return {
            menuId: pageInfo.menuId,
            accessLink: pageInfo.accessLink
        };
    }

    // Log journey event for tour start
    private logTourStarted(): void {
        const { menuId, accessLink } = this.getPageMenuInfo();
        logUserJourney({
            eventType: 'tour_started',
            stepKey: 'attendance-dashboard-tour',
            menuId: menuId,
            accessLink: accessLink,
        }).catch(console.error);
    }

    // Log journey event for step view
    private logStepView(stepId: string): void {
        const { menuId, accessLink } = this.getPageMenuInfo();
        logUserJourney({
            eventType: 'tour_step_view',
            stepKey: stepId,
            menuId: menuId,
            accessLink: accessLink,
        }).catch(console.error);
    }

    // Log journey event for step completion
    private logStepComplete(stepId: string): void {
        const { menuId, accessLink } = this.getPageMenuInfo();
        logUserJourney({
            eventType: 'tour_step_complete',
            stepKey: stepId,
            menuId: menuId,
            accessLink: accessLink,
        }).catch(console.error);
    }

    // Log journey event for tour skipped
    private logTourSkipped(): void {
        const { menuId, accessLink } = this.getPageMenuInfo();
        logUserJourney({
            eventType: 'tour_skipped',
            stepKey: 'attendance-dashboard-tour',
            menuId: menuId,
            accessLink: accessLink,
        }).catch(console.error);
    }

    // Log journey event for tour complete
    private logTourComplete(): void {
        const { menuId, accessLink } = this.getPageMenuInfo();
        logUserJourney({
            eventType: 'tour_complete',
            stepKey: 'attendance-dashboard-tour',
            menuId: menuId,
            accessLink: accessLink,
        }).catch(console.error);
    }

    // Check if tour should be triggered
    public static shouldStartTour(): boolean {
        if (typeof window === 'undefined') return false;
        
        const triggerValue = sessionStorage.getItem(AttendanceDashboardTour.TOUR_TRIGGER_KEY);
        const isCompleted = localStorage.getItem(AttendanceDashboardTour.COMPLETED_KEY);
        
        console.log('[AttendanceTour] shouldStartTour check:', {
            triggerValue,
            isCompleted,
            matches: triggerValue === AttendanceDashboardTour.TRIGGER_VALUE,
            notCompleted: !isCompleted
        });
        
        return triggerValue === AttendanceDashboardTour.TRIGGER_VALUE && !isCompleted;
    }

    // Clear the trigger after handling
    public static clearTrigger(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(AttendanceDashboardTour.TOUR_TRIGGER_KEY);
        }
    }

    // Create tour steps - optionally with API data
    private createSteps(apiTourData?: AttendanceTourStepData[]): AttendanceTourStep[] {
        const steps: AttendanceTourStep[] = [];

        // Create a Map from API data for easy lookup by step ID
        const apiStepsMap = new Map<string, { title: string; description: string }>();

        if (apiTourData && apiTourData.length > 0) {
            console.log('[Attendance Tour] Creating apiStepsMap from API data:', apiTourData.length);

            apiTourData.forEach((stepData) => {
                const stepId = stepData.on_click || stepData.onClick || stepData.step_key || stepData.stepKey || String(stepData.id) || '';
                const stepTitle = stepData.title || stepData.Title || stepData.name || stepData.step_title || stepData.stepTitle || '';
                const stepDescription = stepData.description || stepData.Description || stepData.text || stepData.Text || stepData.content || stepData.step_description || '';

                if (stepId) {
                    apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
                }
            });

            console.log('[Attendance Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
        }

        // Default hardcoded steps with API overrides
        console.log('[Attendance Tour] Using default tour steps with API overrides');

        // Step 1: Welcome / Header
        steps.push({
            id: 'attendance-welcome',
            title: apiStepsMap.get('attendance-welcome')?.title || '👋 Welcome to My Attendance',
            text: apiStepsMap.get('attendance-welcome')?.description || 'This page helps you track your daily attendance, punch in/out, and view your attendance records. Let\'s take a quick tour!',
            attachTo: {
                element: '#tour-attendance-header',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => {
                        this.logTourSkipped();
                        this.cancelTour();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('attendance-welcome');
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 2: Time Tracking Card
        steps.push({
            id: 'attendance-time-tracking',
            title: apiStepsMap.get('attendance-time-tracking')?.title || '⏱️ Time Tracking',
            text: apiStepsMap.get('attendance-time-tracking')?.description || 'This is your main time tracking card. Click "Punch In" when you start work and "Punch Out" when you finish. The status indicator shows your current state.',
            attachTo: {
                element: '#tour-attendance-card',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        this.logStepComplete('attendance-time-tracking');
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('attendance-time-tracking');
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 3: Punch In/Out Button
        steps.push({
            id: 'attendance-punch-button',
            title: apiStepsMap.get('attendance-punch-button')?.title || '🔘 Punch In/Out Button',
            text: apiStepsMap.get('attendance-punch-button')?.description || 'Use this button to punch in or out. When you\'re checked in, it shows "Punch Out" in green. The button records your arrival time and location.',
            attachTo: {
                element: '#tour-punch-button',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        this.logStepComplete('attendance-punch-button');
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('attendance-punch-button');
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 4: Stats Section
        steps.push({
            id: 'attendance-stats',
            title: apiStepsMap.get('attendance-stats')?.title || '📊 Attendance Statistics',
            text: apiStepsMap.get('attendance-stats')?.description || 'View your attendance statistics here including total working days, present days, absent days, and your attendance percentage.',
            attachTo: {
                element: '#tour-attendance-stats',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        this.logStepComplete('attendance-stats');
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        this.logStepComplete('attendance-stats');
                        this.tour?.next();
                    }
                }
            ]
        });

        // Step 5: Attendance Records
        steps.push({
            id: 'attendance-records',
            title: apiStepsMap.get('attendance-records')?.title || '📋 Attendance Records',
            text: apiStepsMap.get('attendance-records')?.description || 'This table shows your complete attendance history. You can see dates, punch in/out times, total hours worked, and daily status.',
            attachTo: {
                element: '#tour-attendance-records',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        this.logStepComplete('attendance-records');
                        this.tour?.back();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Finish Tour',
                    action: () => {
                        this.logStepComplete('attendance-records');
                        this.completeTour();
                    }
                }
            ]
        });

        return steps;
    }

    // Start the tour - fetches from API first, then falls back to default steps
    public async startTour(): Promise<void> {
        if (this.isActive) return;

        console.log('[AttendanceTour] Starting tour...');

        // Get menuId for API call - use 100 as specified in the task
        const { menuId } = getPageInfo();

        // Fetch tour steps from API
        console.log('[AttendanceTour] Fetching tour steps from API with menuId:', menuId);
        const apiTourData = await fetchAttendanceTourStepsFromAPI(menuId);

        // Create steps with API data (or fallback to default if no API data)
        const steps = this.createSteps(apiTourData);
        console.log('[AttendanceTour] Tour steps created:', steps.length);

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

        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events - log step view when step is shown
        this.tour.on('show', (e: any) => {
            const step = e.step;
            if (step && step.id) {
                this.logStepView(step.id);
            }
        });

        // Handle tour cancel - log skipped
        this.tour.on('cancel', () => {
            this.isActive = false;
            this.logTourSkipped();
            this.clearTourState();
        });

        // Handle tour complete - log completed
        this.tour.on('complete', () => {
            this.isActive = false;
            localStorage.setItem(AttendanceDashboardTour.COMPLETED_KEY, 'true');
            this.logTourComplete();
            this.clearTourState();
            this.showCompletionMessage();
        });

        this.isActive = true;

        // Clear the trigger and start
        AttendanceDashboardTour.clearTrigger();

        // Log tour started
        this.logTourStarted();

        setTimeout(() => {
            console.log('[AttendanceTour] Calling tour.start()');
            this.tour?.start();
        }, 100);
    }

    // Cancel the tour
    public cancelTour(): void {
        if (this.tour) {
            this.tour.cancel();
            this.isActive = false;
            this.logTourSkipped();
            this.clearTourState();
        }
    }

    // Complete the tour
    public completeTour(): void {
        if (this.tour) {
            this.tour.complete();
            this.isActive = false;
            localStorage.setItem(AttendanceDashboardTour.COMPLETED_KEY, 'true');
            this.logTourComplete();
            this.clearTourState();
            this.showCompletionMessage();
        }
    }

    // Clear tour state
    private clearTourState(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AttendanceDashboardTour.TOUR_STATE_KEY);
            localStorage.removeItem(AttendanceDashboardTour.PAUSED_STEP_KEY);
        }
    }

    // Show completion message
    private showCompletionMessage(): void {
        console.log('🎉 Attendance tour completed!');
    }

    // Check if tour is active
    public isTourActive(): boolean {
        return this.isActive;
    }

    // Reset tour (to allow it to run again)
    public static resetTour(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AttendanceDashboardTour.COMPLETED_KEY);
            localStorage.removeItem(AttendanceDashboardTour.TOUR_STATE_KEY);
            localStorage.removeItem(AttendanceDashboardTour.PAUSED_STEP_KEY);
        }
    }
}

// Export tour styles
export const attendanceTourStyles = `
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

// Inject styles if not already injected
if (typeof document !== 'undefined') {
    const existingStyle = document.querySelector('#attendance-tour-styles');
    if (!existingStyle) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'attendance-tour-styles';
        styleSheet.textContent = attendanceTourStyles;
        document.head.appendChild(styleSheet);
    }
}
