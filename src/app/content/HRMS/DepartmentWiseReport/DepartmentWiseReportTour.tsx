import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

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
    };

    // Handle tour cancellation
    private handleCancel = (): void => {
        this.isActive = false;
        this.clearTourState();
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

    // Create tour steps
    private createSteps(): TourStep[] {
        const steps: TourStep[] = [];

        // Step 1: Welcome / Introduction
        steps.push({
            id: 'welcome',
            title: '👋 Welcome to Department Wise Report!',
            text: 'This page allows you to generate and view attendance reports organized by department. Let\'s explore the features together.',
            attachTo: {
                element: '#tour-page-title',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => this.tour?.cancel(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 2: From Date Picker
        steps.push({
            id: 'from-date',
            title: '📅 From Date',
            text: 'Select the starting date for your attendance report. This defines the beginning of the date range you want to analyze.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 3: To Date Picker
        steps.push({
            id: 'to-date',
            title: '📅 To Date',
            text: 'Select the ending date for your attendance report. This defines the end of the date range you want to analyze.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 4: Employee/Department Selector
        steps.push({
            id: 'employee-selector',
            title: '👥 Employee & Department Filter',
            text: 'Use this section to filter by departments and/or specific employees. You can select multiple departments and employees using the dropdown menus.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 5: Search Button
        steps.push({
            id: 'search-button',
            title: '🔍 Search Button',
            text: 'Click this button to generate the attendance report based on your selected date range and filters. The data will be displayed in the table below.',
            attachTo: {
                element: '#tour-search-button',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 6: Export Buttons
        steps.push({
            id: 'export-buttons',
            title: '📤 Export Options',
            text: 'Once data is loaded, you can export it using these buttons: Print (🖨️), PDF export, or Excel export. This helps you share or save reports offline.',
            attachTo: {
                element: '#tour-export-buttons',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Step 7: Data Table
        steps.push({
            id: 'data-table',
            title: '📊 Attendance Data Table',
            text: 'This table displays the attendance data for all employees matching your filters. You can view columns like: Sr No., Department, Employee Name, Total Days, Week Off, Holiday, Total Working, Total Present, Absent Days, Half Days, and Late Comes. Click column headers to sort.',
            attachTo: {
                element: '#tour-data-table',
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
                    action: () => this.tour?.complete()
                }
            ]
        });

        return steps;
    }

    // Start the tour
    public startTour(): void {
        // Check if tour was already completed
        if (localStorage.getItem('departmentWiseReportTourCompleted') === 'true') {
            console.log('Department Wise Report tour already completed');
            return;
        }

        // Check if already active
        if (this.isActive) return;

        console.log('Starting Department Wise Report tour');

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
    public resumeTour(): void {
        const savedPausedStep = parseInt(
            localStorage.getItem(DepartmentWiseReportTour.PAUSED_STEP_KEY) || '0',
            10
        );

        if (savedPausedStep > 0 && !localStorage.getItem('departmentWiseReportTourCompleted')) {
            console.log('Resuming Department Wise Report tour from step:', savedPausedStep);

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
