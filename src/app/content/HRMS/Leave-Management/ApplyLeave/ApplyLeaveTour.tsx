import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

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
    public startTour(): void {
        if (this.isActive) return;

        console.log('Starting ApplyLeave tour...');

        // Clear the trigger flag
        // sessionStorage.removeItem('triggerPageTour');

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
        console.log('ApplyLeave tour steps created:', steps.length);

        // Add steps to tour
        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
   this.tour.on('cancel', () => {
    this.isActive = false;
    this.saveTourState();
    localStorage.setItem(ApplyLeaveTour.COMPLETED_KEY, 'true');
    sessionStorage.removeItem('triggerPageTour');
});


 this.tour.on('complete', () => {
    this.isActive = false;
    this.saveTourState();
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

    private createSteps(): ApplyLeaveTourStep[] {
        const steps: ApplyLeaveTourStep[] = [];

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
            title: '🏖️ Leave Application',
            text: 'Welcome to the Leave Application page! This tour will guide you through all the features for submitting leave requests. Let\'s set up the form to show you all available options.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Type of Leave field - now shows employee option
        steps.push({
            id: 'apply-leave-type',
            title: '📋 Type of Leave',
            text: 'Select whether this leave is for "Self" or for an "Employee". We\'ve automatically selected "Employee" to show you additional fields below.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Department field - now visible
        steps.push({
            id: 'apply-leave-department',
            title: '🏢 Department',
            text: 'Select the department of the employee you\'re applying leave for. This field appears when "Employee" is selected as the Type of Leave.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Employee field - now visible
        steps.push({
            id: 'apply-leave-employee',
            title: '👤 Employee',
            text: 'Select the specific employee you\'re applying leave for. Employees are filtered based on the department selected above.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Leave Type field
        steps.push({
            id: 'apply-leave-leave-type',
            title: '🏷️ Leave Type',
            text: 'Select the type of leave you want to apply for (e.g., Casual Leave, Sick Leave, Earned Leave, etc.). This will be loaded from your organization\'s leave policy.',
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
                    action: () => this.tour?.next()
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
            title: '📅 Day Type',
            text: 'Choose whether you\'re taking a "Full" day leave or a "Half" day leave. We\'ve selected "Full" to show you the date range fields.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // From Date field - now visible
        steps.push({
            id: 'apply-leave-from-date',
            title: '📆 From Date',
            text: 'Select the starting date of your leave. For full day leave, this is when your leave period begins.',
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

        // To Date field - now visible
        steps.push({
            id: 'apply-leave-to-date',
            title: '📆 To Date',
            text: 'Select the end date of your leave. Your leave period will run from the From Date to this To Date (inclusive).',
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

        // Comment field
        steps.push({
            id: 'apply-leave-comment',
            title: '💬 Comment',
            text: 'Add any comments or notes about your leave request. This is optional but can help your manager understand your leave request better.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Submit button
        steps.push({
            id: 'apply-leave-submit',
            title: '✅ Submit',
            text: 'Click here to submit your leave application. Make sure all required fields are filled before submitting.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Reset button
        steps.push({
            id: 'apply-leave-reset',
            title: '🔄 Reset',
            text: 'Use this button to clear all form fields and start fresh. This is useful if you want to cancel the current leave request.',
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
                    action: () => this.tour?.next()
                }
            ]
        });

        // Submitted Applications Table
        steps.push({
            id: 'apply-leave-table',
            title: '📊 Submitted Leave Applications',
            text: 'This table shows all your submitted leave applications. You can view the status, dates, and details of each request here.',
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
                    action: () => this.tour?.complete()
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
    public restartTour(): void {
        localStorage.removeItem(ApplyLeaveTour.COMPLETED_KEY);
        localStorage.removeItem(ApplyLeaveTour.TOUR_STATE_KEY);
        this.isActive = false;
        this.startTour();
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
