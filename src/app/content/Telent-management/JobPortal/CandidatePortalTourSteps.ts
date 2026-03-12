import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export interface CandidatePortalTourStep {
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

// Global state for tour dialog control
let isTourMode = false;
let tourOpenApplyDialog: (() => void) | null = null;

export const setTourOpenApplyDialog = (fn: () => void) => {
    tourOpenApplyDialog = fn;
};

export const setTourMode = (mode: boolean) => {
    isTourMode = mode;
};

export const getTourMode = () => isTourMode;

// Force show a specific step
export const forceShowStep = (stepId: string) => {
    if (CandidatePortalTourSteps.tour) {
        CandidatePortalTourSteps.tour.show(stepId);
    }
};

// Tour steps for CandidatePortal - Simplified version focusing on key elements
export const candidatePortalTourSteps: CandidatePortalTourStep[] = [
    {
        id: 'tour-welcome',
        title: '🎯 Welcome to Job Portal!',
        text: 'Welcome to the Job Portal! This guided tour will help you discover and apply for exciting career opportunities. Let\'s get started!',
        attachTo: {
            element: '#tour-candidate-header',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    const tour = CandidatePortalTourSteps.tour;
                    if (tour) {
                        tour.cancel();
                    }
                    sessionStorage.setItem('candidatePortalTourCompleted', 'true');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Start Tour',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-header',
        title: '📋 Page Header',
        text: 'This is the Job Portal header where you can find the main heading and description for the job search section.',
        attachTo: {
            element: '#tour-candidate-header',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-search',
        title: '🔍 Job Search',
        text: 'Use this search bar to find jobs by title, skills, department, or keywords. Enter your search criteria and click "Search Jobs".',
        attachTo: {
            element: '#tour-search-container',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-job-card',
        title: '💼 Job Cards',
        text: 'Each job card shows a complete job opportunity. Click on a card to see full details. Here you can see the job title, company, location, and salary.',
        attachTo: {
            element: '#tour-job-card-first',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-job-title',
        title: '📝 Job Title',
        text: 'This is the job title indicating the position you would be applying for. Make sure to read it carefully to understand the role.',
        attachTo: {
            element: '#tour-job-title',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-job-badges',
        title: '🏷️ Job Badges',
        text: 'These badges show the employment type (Full-time, Contract, Part-time, Internship) and current status of the job posting.',
        attachTo: {
            element: '#tour-job-badges',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-company-location',
        title: '🏢 Company & Location',
        text: 'Here you can see the company name and the job location. Click to apply and get more details about the workplace.',
        attachTo: {
            element: '#tour-company-location',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-salary',
        title: '💰 Salary Range',
        text: 'This shows the expected salary range for the position. Use this to evaluate if the compensation meets your expectations.',
        attachTo: {
            element: '#tour-salary',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-description',
        title: '📋 Job Description',
        text: 'Read the job description to understand the responsibilities, role requirements, and what the company is looking for in a candidate.',
        attachTo: {
            element: '#tour-description',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-skills',
        title: '🛠️ Required Skills',
        text: 'This section lists the key skills and qualifications required for the position. Make sure your skills match these requirements before applying.',
        attachTo: {
            element: '#tour-skills',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-experience',
        title: '📊 Experience Required',
        text: 'This shows the minimum experience level needed for this role. Check if your experience matches the requirements.',
        attachTo: {
            element: '#tour-experience',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-education',
        title: '🎓 Education Requirements',
        text: 'This displays the minimum educational qualifications required for the position.',
        attachTo: {
            element: '#tour-education',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-job-info',
        title: 'ℹ️ Job Information',
        text: 'Here you can see when the job was posted, how many positions are available, and the application deadline if any.',
        attachTo: {
            element: '#tour-job-info',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-benefits',
        title: '🎁 Benefits & Perks',
        text: 'This section highlights the benefits and perks offered by the company for this position.',
        attachTo: {
            element: '#tour-benefits',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-department-badge',
        title: '🏢 Department',
        text: 'This badge shows which department the job belongs to within the organization.',
        attachTo: {
            element: '#tour-department-badge',
            on: 'left'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-action-buttons',
        title: '⭐ Quick Actions',
        text: 'Use these buttons to save jobs to your favorites or share the job posting with others.',
        attachTo: {
            element: '#tour-action-buttons',
            on: 'left'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-learn-more',
        title: '📖 Learn More',
        text: 'Click "Learn More" to see additional details about the job before deciding to apply.',
        attachTo: {
            element: '#tour-learn-more',
            on: 'left'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ]
    },
    {
        id: 'tour-apply-button',
        title: '🚀 Apply Now',
        text: 'Click "Apply Now" to submit your application for this job. This is the final step!',
        attachTo: {
            element: '#tour-apply-now',
            on: 'left'
        },
        buttons: [
            {
                text: 'Finish Tour',
                action: () => {
                    const tour = CandidatePortalTourSteps.tour;
                    if (tour) {
                        tour.complete();
                    }
                    sessionStorage.setItem('candidatePortalTourCompleted', 'true');
                }
            }
        ]
    },
    {
        id: 'tour-form-personal',
        title: '👤 Personal Information',
        text: 'Fill in your personal details: First Name, Last Name, Email, and Mobile. These are required fields marked with *.',
        attachTo: {
            element: '#tour-personal-info',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: () => {
                    CandidatePortalTourSteps.tour?.next();
                }
            }
        ],
        beforeShowPromise: async () => {
            // Ensure dialog is open
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    },

];

// Tour class to manage the CandidatePortal tour
export class CandidatePortalTourSteps {
    public static tour: Shepherd.Tour | null = null;

    // Initialize and start the tour
    public static startTour(): void {
        // Check if tour was already completed
        if (sessionStorage.getItem('candidatePortalTourCompleted') === 'true') {
            console.log('CandidatePortal tour already completed, skipping...');
            return;
        }

        // Check if tour is already active
        if (this.tour && this.tour.getCurrentStep()) {
            console.log('CandidatePortal tour already active');
            return;
        }

        console.log('Starting CandidatePortal tour...');
        isTourMode = true;

        this.tour = new Shepherd.Tour({
            defaultStepOptions: {
                cancelIcon: {
                    enabled: true
                },
                classes: 'candidate-tour-theme',
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

        // Add steps to tour
        candidatePortalTourSteps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('cancel', () => {
            console.log('CandidatePortal tour cancelled');
            sessionStorage.setItem('candidatePortalTourCompleted', 'true');
            isTourMode = false;
            this.tour = null;
        });

        this.tour.on('complete', () => {
            console.log('CandidatePortal tour completed');
            sessionStorage.setItem('candidatePortalTourCompleted', 'true');
            isTourMode = false;
            this.tour = null;
        });

        // Start the tour
        setTimeout(() => {
            console.log('Calling CandidatePortal tour.start()');
            this.tour?.start();
        }, 800);
    }

    // Cancel the tour
    public static cancelTour(): void {
        if (this.tour) {
            this.tour.cancel();
            this.tour = null;
        }
        isTourMode = false;
    }

    // Restart the tour
    public static restartTour(): void {
        sessionStorage.removeItem('candidatePortalTourCompleted');
        this.cancelTour();
        setTimeout(() => {
            this.startTour();
        }, 300);
    }
}

// Check if tour should be triggered
export const shouldTriggerCandidatePortalTour = (): boolean => {
    const triggerValue = sessionStorage.getItem('triggerPageTour');
    const isCandidatePortalUrl = window.location.pathname.includes('/JobPortal') ||
        window.location.pathname.includes('/job-portal');

    if (triggerValue === 'candidate-portal' && isCandidatePortalUrl) {
        // Clear the trigger after checking
        sessionStorage.removeItem('triggerPageTour');
        return true;
    }

    return false;
};

export default CandidatePortalTourSteps;
