import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

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

    // Create tour steps
    private createSteps(): AttendanceTourStep[] {
        const steps: AttendanceTourStep[] = [];

        // Step 1: Welcome / Header
        steps.push({
            id: 'attendance-welcome',
            title: '👋 Welcome to My Attendance',
            text: 'This page helps you track your daily attendance, punch in/out, and view your attendance records. Let\'s take a quick tour!',
            attachTo: {
                element: '#tour-attendance-header',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 2: Time Tracking Card
        steps.push({
            id: 'attendance-time-tracking',
            title: '⏱️ Time Tracking',
            text: 'This is your main time tracking card. Click "Punch In" when you start work and "Punch Out" when you finish. The status indicator shows your current state.',
            attachTo: {
                element: '#tour-attendance-card',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => this.tour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 3: Punch In/Out Button
        steps.push({
            id: 'attendance-punch-button',
            title: '🔘 Punch In/Out Button',
            text: 'Use this button to punch in or out. When you\'re checked in, it shows "Punch Out" in green. The button records your arrival time and location.',
            attachTo: {
                element: '#tour-punch-button',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => this.tour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 4: Stats Section
        steps.push({
            id: 'attendance-stats',
            title: '📊 Attendance Statistics',
            text: 'View your attendance statistics here including total working days, present days, absent days, and your attendance percentage.',
            attachTo: {
                element: '#tour-attendance-stats',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => this.tour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 5: Attendance Records
        steps.push({
            id: 'attendance-records',
            title: '📋 Attendance Records',
            text: 'This table shows your complete attendance history. You can see dates, punch in/out times, total hours worked, and daily status.',
            attachTo: {
                element: '#tour-attendance-records',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
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

    // Start the tour
    public startTour(): void {
        if (this.isActive) return;

        console.log('[AttendanceTour] Starting tour...');

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

        const steps = this.createSteps();
        console.log('[AttendanceTour] Tour steps created:', steps.length);

        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('cancel', () => {
            this.isActive = false;
            this.clearTourState();
        });

        this.tour.on('complete', () => {
            this.isActive = false;
            localStorage.setItem(AttendanceDashboardTour.COMPLETED_KEY, 'true');
            this.clearTourState();
            this.showCompletionMessage();
        });

        this.isActive = true;

        // Clear the trigger and start
        AttendanceDashboardTour.clearTrigger();

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
            this.clearTourState();
        }
    }

    // Complete the tour
    public completeTour(): void {
        if (this.tour) {
            this.tour.complete();
            this.isActive = false;
            localStorage.setItem(AttendanceDashboardTour.COMPLETED_KEY, 'true');
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
