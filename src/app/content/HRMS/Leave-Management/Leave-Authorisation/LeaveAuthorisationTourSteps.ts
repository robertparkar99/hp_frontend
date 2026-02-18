import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
const waitForElement = (selector: string, timeout = 8000): Promise<void> => {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
            if (document.querySelector(selector)) {
                resolve();
            } else if (Date.now() - start > timeout) {
                reject(`Element not found: ${selector}`);
            } else {
                requestAnimationFrame(check);
            }
        };

        check();
    });
};

export interface LeaveAuthorisationTourStep {
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

export const createLeaveAuthorisationTourSteps = (): LeaveAuthorisationTourStep[] => {
    return [
        {
            id: 'leave-auth-welcome',
            title: 'Welcome to Leave Authorisation!',
            text: 'This page allows you to view and manage employee leave requests. Let me show you around.',
            attachTo: {
                element: '#tour-leave-auth-header',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => {
                        sessionStorage.setItem('leaveAuthTourCompleted', 'true');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-filter-section',
            title: '🔍 Filter Section',
            text: 'Use this section to filter leave requests by date range and status. You can select multiple statuses at once.',
            attachTo: {
                element: '#tour-leave-auth-filter',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-from-date',
            title: '📅 From Date',
            text: 'Select the starting date for filtering leave requests. Leave requests from this date onwards will be displayed.',
            attachTo: {
                element: '#tour-leave-auth-from-date',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-to-date',
            title: '📅 To Date',
            text: 'Select the ending date for filtering leave requests. Leave requests up to this date will be displayed.',
            attachTo: {
                element: '#tour-leave-auth-to-date',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-status',
            title: '📋 Leave Status',
            text: 'Select one or more leave statuses (Approved, Rejected, Pending) to filter the requests. Click on each status to select/deselect it. Press Ctrl+A to select all.',
            attachTo: {
                element: '#tour-leave-auth-status',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-search',
            title: '🔎 Search Button',
            text: 'Click this button to apply your filters and fetch the leave requests matching your criteria.',
            attachTo: {
                element: '#tour-leave-auth-search',
                on: 'left'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-results-header',
            title: '📊 Leave Requests Results',
            text: 'This section displays the filtered leave requests. Each card represents a leave application.',
            attachTo: {
                element: '#tour-leave-auth-results',
                on: 'bottom'
            },
            beforeShowPromise: () => waitForElement('#tour-leave-auth-results'),
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-employee-info',
            title: '👤 Employee Information',
            text: 'This shows the employee name, ID, and current leave status (Approved/Rejected/Pending).',
            attachTo: {
                element: '#tour-leave-auth-employee-info',
                on: 'left'
            },
            beforeShowPromise: () => waitForElement('#tour-leave-auth-employee-info'),
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-hod-comment',
            title: '💬 HOD Comment',
            text: 'Enter your comment as Head of Department here. This will be saved when you update the leave request.',
            attachTo: {
                element: '#tour-leave-auth-hod-comment',
                on: 'top'
            },
            beforeShowPromise: () => waitForElement('#tour-leave-auth-hod-comment'),

            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-hr-remarks',
            title: '📝 HR Remarks',
            text: 'Add HR remarks here. This field is optional and used for additional notes about the leave request.',
            attachTo: {
                element: '#tour-leave-auth-hr-remarks',
                on: 'top'
            },
            beforeShowPromise: () => waitForElement('#tour-leave-auth-hr-remarks'),

            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-status-dropdown',
            title: '📌 Status Dropdown',
            text: 'Select the new status for this leave request: Approved, Rejected, or Pending. The status change will be applied when you click the update button.',
            attachTo: {
                element: '#tour-leave-auth-status-dropdown',
                on: 'top'
            },
            beforeShowPromise: () => waitForElement('#tour-leave-auth-status-dropdown'),

            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-update-button',
            title: '✅ Update / Approve Button',
            text: 'Click this button to save your changes (HOD comment, HR remarks, and status). The leave request will be updated in the system.',
            attachTo: {
                element: '#tour-leave-auth-update-button',
                on: 'left'
            },
            beforeShowPromise: () => waitForElement('#tour-leave-auth-update-button'),

            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Next',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                }
            ]
        },
        {
            id: 'leave-auth-view-details',
            title: '👁️ View Details',
            text: 'Click this button to see complete details of the leave application in a popup dialog.',
            attachTo: {
                element: '#tour-leave-auth-view-details',
                on: 'left'
            },
            beforeShowPromise: () => waitForElement('#tour-leave-auth-view-details'),

            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        // Will be replaced by tour instance
                    }
                },
                {
                    text: 'Finish',
                    action: () => {
                        const tourInstance = leaveAuthorisationTour;
                        tourInstance.finishTour();
                    }
                }
            ]
        },
        {
            id: 'leave-auth-complete',
            title: '🎉 Tour Complete!',
            text: 'Congratulations! You now know how to use the Leave Authorisation page. You can filter requests, add comments, change status, and update leave requests. If you need to restart this tour, click the "New" button in the sidebar.',
            attachTo: {
                element: '#tour-leave-auth-header',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Done',
                    action: () => {
                        const tourInstance = leaveAuthorisationTour;
                        tourInstance.finishTour();
                    }
                }
            ]

        }
    ];
};

export class LeaveAuthorisationTour {
    public tour: Tour | null = null;
    private isActive = false;
    // private currentStepIndex = 0;

    constructor() {
        // Inject styles
        this.injectStyles();
    }

    private injectStyles(): void {
        if (typeof document !== 'undefined') {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'leave-auth-tour-styles';
            styleSheet.textContent = `
                .shepherd-theme-leave-auth {
                    --shepherd-theme-primary: #3080ff;
                    --shepherd-theme-secondary: #6c757d;
                }

                .shepherd-theme-leave-auth .shepherd-header {
                    background: #007BE5;
                    color: white;
                    border-radius: 4px 4px 0 0;
                }

                .shepherd-theme-leave-auth .shepherd-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                    color: white;
                }

                .shepherd-theme-leave-auth .shepherd-text {
                    font-size: 14px;
                    line-height: 1.5;
                    color: #171717;
                    padding: 16px;
                }

                .shepherd-theme-leave-auth .shepherd-button {
                    background: #007BE5;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .shepherd-theme-leave-auth .shepherd-button:hover {
                    background: #0056b3;
                    transform: translateY(-1px);
                }

                .shepherd-theme-leave-auth .shepherd-button-secondary {
                    background: #6c757d !important;
                }

                .shepherd-theme-leave-auth .shepherd-button-secondary:hover {
                    background: #5a6268 !important;
                }

                .shepherd-theme-leave-auth .shepherd-cancel-icon {
                    color: white;
                    font-size: 20px;
                }

                .shepherd-has-title .shepherd-content .shepherd-header {
                    background: #546ee5;
                    padding: 1em;
                }

                .shepherd-theme-leave-auth .shepherd-element {
                    box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
                    border-radius: 12px;
                    max-width: 400px;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                .shepherd-highlight {
                    animation: pulse 2s infinite;
                }
            `;

            // Only add if not already exists
            if (!document.getElementById('leave-auth-tour-styles')) {
                document.head.appendChild(styleSheet);
            }
        }
    }

    public startTour(): void {
        // Check if tour was already completed
        // if (sessionStorage.getItem('leaveAuthTourCompleted') === 'true') {
        //     console.log('Leave Authorisation tour already completed, skipping...');
        //     return;
        // }

        // Check if tour is already active
        if (this.isActive) {
            console.log('Leave Authorisation tour is already active');
            return;
        }

        console.log('Starting Leave Authorisation tour...');

        this.tour = new Shepherd.Tour({
            defaultStepOptions: {
                cancelIcon: {
                    enabled: true
                },
                classes: 'shepherd-theme-leave-auth',
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

        const steps = createLeaveAuthorisationTourSteps();

        // Add steps with button actions
        steps.forEach((step, index) => {
            if (!this.tour) return;

           const buttons = step.buttons?.map(btn => {
  if (btn.text === 'Next') {
    return {
      ...btn,
      action: () => this.tour?.show(steps[index + 1].id)
    };
  }

  if (btn.text === 'Back') {
    return {
      ...btn,
      action: () => this.tour?.show(steps[index - 1].id)
    };
  }

  return btn; // keeps Finish action untouched
});



            this.tour.addStep({
                ...step,
                buttons
            });
        });

        // Handle tour events
        this.tour.on('show', (event) => {
            const currentStep = event.step;
            const element = currentStep.getElement();
            if (element) {
                element.classList.add('shepherd-highlight');
            }
        });

        this.tour.on('hide', (event) => {
            const currentStep = event.step;
            const element = currentStep.getElement();
            if (element) {
                element.classList.remove('shepherd-highlight');
            }
        });

        this.tour.on('cancel', () => {
            this.isActive = false;
            console.log('Leave Authorisation tour cancelled');
        });

        this.tour.on('complete', () => {
            this.isActive = false;
            sessionStorage.setItem('leaveAuthTourCompleted', 'true');
            console.log('Leave Authorisation tour completed');
        });

        this.isActive = true;

        // Start tour
        setTimeout(() => {
            this.tour?.start();
        }, 500);
    }

    public isTourActive(): boolean {
        return this.isActive;
    }

    public restartTour(): void {
        sessionStorage.removeItem('leaveAuthTourCompleted');
        this.startTour();
    }
    public finishTour(): void {
        console.log('Finish tour called, isActive:', this.isActive, 'tour:', this.tour);
        sessionStorage.setItem('leaveAuthTourCompleted', 'true');
        this.isActive = false;
        
        // Try to complete the tour
        if (this.tour) {
            this.tour.complete();
        }
        
        // Fallback: directly remove tour elements from DOM
        setTimeout(() => {
            const tourElements = document.querySelectorAll('.shepherd-element');
            tourElements.forEach(el => el.remove());
            
            const overlayElements = document.querySelectorAll('.shepherd-modal-overlay');
            overlayElements.forEach(el => el.remove());
            
            console.log('Tour elements removed from DOM');
            
            // Refresh the page
            window.location.reload();
        }, 100);
    }

}

// Export singleton instance
export const leaveAuthorisationTour = new LeaveAuthorisationTour();
