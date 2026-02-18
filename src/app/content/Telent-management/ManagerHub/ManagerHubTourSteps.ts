import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration
export interface ManagerHubTourStep {
    id: string;
    title: string;
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
    scrollTo?: boolean;
}

// Tab types
export type TourTabType = 'interviews' | 'offers' | 'team';

// Custom event name for tab switching
const TAB_SWITCH_EVENT = 'managerhub-tab-switch';

// Helper function to switch tabs by dispatching custom event
export const switchManagerHubTab = (tabValue: string): void => {
    console.log(`[ManagerHubTour] Dispatching tab switch event: ${tabValue}`);
    const event = new CustomEvent(TAB_SWITCH_EVENT, { detail: { tab: tabValue } });
    window.dispatchEvent(event);
};

// Helper function to switch tabs by clicking (fallback)
const clickTabTrigger = async (tabValue: string): Promise<void> => {
    console.log(`[ManagerHubTour] Clicking tab: ${tabValue}`);
    const tabTrigger = document.querySelector<HTMLElement>(`#tour-${tabValue}-tab`);
    if (tabTrigger) {
        // Remove all data-state attributes that might block clicks
        tabTrigger.removeAttribute('data-state');
        tabTrigger.setAttribute('data-state', 'active');
        // Click the tab
        tabTrigger.click();
        console.log(`[ManagerHubTour] Clicked tab: ${tabValue}`);
        // Wait for tab content to render
        await new Promise(resolve => setTimeout(resolve, 800));
    } else {
        console.warn(`[ManagerHubTour] Tab trigger not found: #tour-${tabValue}-tab`);
    }
};

// Create and export tour instance
let managerHubTourInstance: Shepherd.Tour | null = null;

// Interview Tab Tour Steps
const createInterviewTabSteps = (): ManagerHubTourStep[] => [
    {
        id: 'interview-welcome',
        title: '💬 Interview Feedback Tab',
        text: 'This tab shows all interview feedback that requires your review. Let\'s explore the interview feedback features together.',
        attachTo: {
            element: '#tour-interview-tab',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    managerHubTourInstance?.cancel();
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('interviewTabTourCompleted', 'true');
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Start Tour',
                action: () => {
                    managerHubTourInstance?.show('interview-tab');
                }
            }
        ]
    },
    {
        id: 'interview-tab',
        title: '💬 Interview Feedback Tab',
        text: 'This tab shows all interview feedback that requires your review. You can see candidate details, ratings, and make hiring decisions.',
        attachTo: {
            element: '#tour-interview-tab',
            on: 'bottom'
        },
        beforeShowPromise: async () => {
            // Switch to interviews tab
            switchManagerHubTab('interviews');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('interview-welcome');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    managerHubTourInstance?.show('candidate-card');
                }
            }
        ]
    },
    {
        id: 'candidate-card',
        title: '👤 Candidate Card',
        text: 'Each candidate card shows their name, applied position, interview date, and interviewer. The rating shows their overall performance.',
        attachTo: {
            element: '#tour-first-candidate-card',
            on: 'top'
        },
        beforeShowPromise: async () => {
            // Ensure we're on interviews tab
            switchManagerHubTab('interviews');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('interview-tab');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    managerHubTourInstance?.show('hiring-decision');
                }
            }
        ]
    },
    {
        id: 'hiring-decision',
        title: '✅ Hiring Decisions',
        text: 'After reviewing a candidate\'s profile and feedback, you can either Reject or Hire them. Add notes before making your decision.',
        attachTo: {
            element: '#tour-hiring-decision',
            on: 'top'
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('candidate-card');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Finish Tour',
                action: () => {
                    managerHubTourInstance?.complete();
                }
            }
        ]
    }
];

// Offers Tab Tour Steps
const createOffersTabSteps = (): ManagerHubTourStep[] => [
    {
        id: 'offers-welcome',
        title: '📝 Offer Management Tab',
        text: 'This tab shows all job offers created for candidates. Let\'s explore the offer management features together.',
        attachTo: {
            element: '#tour-offers-tab',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    managerHubTourInstance?.cancel();
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('offersTabTourCompleted', 'true');
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Start Tour',
                action: () => {
                    managerHubTourInstance?.show('offers-tab');
                }
            }
        ]
    },
    {
        id: 'offers-tab',
        title: '📝 Offer Management Tab',
        text: 'This tab shows all job offers created for candidates. You can track offer status (Draft, Sent, Accepted, Rejected) and manage the onboarding process.',
        attachTo: {
            element: '#tour-offers-tab',
            on: 'bottom'
        },
        beforeShowPromise: async () => {
            // Switch to offers tab
            switchManagerHubTab('offers');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('offers-welcome');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    managerHubTourInstance?.show('offers-kpi-cards');
                }
            }
        ]
    },
    {
        id: 'offers-kpi-cards',
        title: '📊 KPI Cards',
        text: 'These KPI cards show the count of total offers and their status breakdown. Track how many offers are in each stage.',
        attachTo: {
            element: '#tour-offer-stats',
            on: 'bottom'
        },
        beforeShowPromise: async () => {
            // Ensure we're on offers tab
            switchManagerHubTab('offers');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('offers-tab');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    managerHubTourInstance?.show('offers-offer-cards');
                }
            }
        ]
    },
    {
        id: 'offers-offer-cards',
        title: '📋 Offer Cards',
        text: 'Each offer card shows the candidate name, position, salary, and current status. You can view details, download offer letters, or take actions.',
        attachTo: {
            element: '#tour-first-offer-card',
            on: 'top'
        },
        beforeShowPromise: async () => {
            // Ensure we're on offers tab
            switchManagerHubTab('offers');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('offers-kpi-cards');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    managerHubTourInstance?.show('offers-status');
                }
            }
        ]
    },
    {
        id: 'offers-status',
        title: '🏷️ Offer Status Tracking',
        text: 'Track the status of each offer through the hiring pipeline. Filter by status to find offers that need your attention.',
        attachTo: {
            element: '#tour-offer-tabs',
            on: 'top'
        },
        beforeShowPromise: async () => {
            // Ensure we're on offers tab
            switchManagerHubTab('offers');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('offers-offer-cards');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Finish Tour',
                action: () => {
                    // Mark offers tab tour as completed and start team overview tour
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('offersTabTourCompleted', 'true');
                    }
                    // Start team overview tour
                    managerHubTourInstance?.cancel();
                    startTabTourWithCallback('team');
                }
            }
        ]
    }
];

// Team Tab Tour Steps
const createTeamTabSteps = (): ManagerHubTourStep[] => [
    {
        id: 'team-welcome',
        title: '👥 Team Overview Tab',
        text: 'Get a comprehensive view of your hiring team\'s progress. Let\'s explore the team overview features together.',
        attachTo: {
            element: '#tour-team-tab',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    managerHubTourInstance?.cancel();
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('teamTabTourCompleted', 'true');
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Start Tour',
                action: () => {
                    managerHubTourInstance?.show('team-tab');
                }
            }
        ]
    },
    {
        id: 'team-tab',
        title: '👥 Team Overview Tab',
        text: 'Get a comprehensive view of your hiring team\'s progress. Track department-wise hiring status and recent updates.',
        attachTo: {
            element: '#tour-team-tab',
            on: 'bottom'
        },
        beforeShowPromise: async () => {
            // Switch to team tab
            switchManagerHubTab('team');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('team-welcome');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    managerHubTourInstance?.show('department-status');
                }
            }
        ]
    },
    {
        id: 'department-status',
        title: '📊 Department Hiring Status',
        text: 'See how each department is progressing with their hiring goals. The progress bars show filled positions vs total openings.',
        attachTo: {
            element: '#tour-department-status',
            on: 'left'
        },
        beforeShowPromise: async () => {
            // Ensure we're on team tab
            switchManagerHubTab('team');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('team-tab');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    managerHubTourInstance?.show('team-updates');
                }
            }
        ]
    },
    {
        id: 'team-updates',
        title: '📰 Recent Team Updates',
        text: 'Stay informed about recent hiring activities, open positions needing attention, and scheduled interviews.',
        attachTo: {
            element: '#tour-team-updates',
            on: 'right'
        },
        beforeShowPromise: async () => {
            // Ensure team tab is active
            switchManagerHubTab('team');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    managerHubTourInstance?.show('department-status');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Finish Tour',
                action: () => {
                    managerHubTourInstance?.complete();
                }
            }
        ]
    }
];

// Define all tour steps (full tour - backward compatible)
const createTourSteps = (): ManagerHubTourStep[] => {
    return [
        {
            id: 'welcome',
            title: '👋 Welcome to Manager Dashboard!',
            text: 'This dashboard helps you manage interview feedback, track offers, and monitor your hiring team. Let\'s explore all the features together.',
            attachTo: {
                element: '#tour-managerhub-title',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => {
                        managerHubTourInstance?.cancel();
                        if (typeof window !== 'undefined') {
                            sessionStorage.setItem('managerHubTourCompleted', 'true');
                        }
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => {
                        managerHubTourInstance?.show('pending-approvals');
                    }
                }
            ]
        },
        {
            id: 'pending-approvals',
            title: '⏳ Pending Approvals',
            text: 'This card shows you how many requisitions are waiting for your approval. Click on it to see details.',
            attachTo: {
                element: '#tour-pending-approvals',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('welcome');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('interview-feedback-card');
                    }
                }
            ]
        },
        {
            id: 'interview-feedback-card',
            title: '💬 Interview Feedback',
            text: 'This card shows pending interview feedback that needs your review and input.',
            attachTo: {
                element: '#tour-interview-feedback-card',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('pending-approvals');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('this-month-hires-card');
                    }
                }
            ]
        },
        {
            id: 'this-month-hires-card',
            title: '🎉 This Month Hires',
            text: 'Track your hiring success! This shows how many new hires joined this month compared to last month.',
            attachTo: {
                element: '#tour-this-month-hires-card',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('interview-feedback-card');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('dashboard-tabs');
                    }
                }
            ]
        },
        {
            id: 'dashboard-tabs',
            title: '📑 Dashboard Tabs',
            text: 'Switch between Interview Feedback, Offer Management, and Team Overview tabs to access different sections.',
            attachTo: {
                element: '#tour-managerhub-tabs',
                on: 'top'
            },
            scrollTo: false,
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('this-month-hires-card');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('interview-tab');
                    }
                }
            ]
        },
        {
            id: 'interview-tab',
            title: '💬 Interview Feedback Tab',
            text: 'This tab shows all interview feedback that requires your review. You can see candidate details, ratings, and make hiring decisions.',
            attachTo: {
                element: '#tour-interview-tab',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('interviews');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('dashboard-tabs');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('candidate-card');
                    }
                }
            ]
        },
        {
            id: 'candidate-card',
            title: '👤 Candidate Card',
            text: 'Each candidate card shows their name, applied position, interview date, and interviewer. The rating shows their overall performance.',
            attachTo: {
                element: '#tour-first-candidate-card',
                on: 'top'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('interviews');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('interview-tab');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('hiring-decision');
                    }
                }
            ]
        },
        {
            id: 'hiring-decision',
            title: '✅ Hiring Decisions',
            text: 'After reviewing a candidate\'s profile and feedback, you can either Reject or Hire them. Add notes before making your decision.',
            attachTo: {
                element: '#tour-hiring-decision',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('candidate-card');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('offers-tab');
                    }
                }
            ]
        },
        {
            id: 'offers-tab',
            title: '📝 Offer Management Tab',
            text: 'This tab shows all job offers created for candidates. You can track offer status (Draft, Sent, Accepted, Rejected) and manage the onboarding process.',
            attachTo: {
                element: '#tour-offers-tab',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('offers');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('hiring-decision');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('offers-kpi-cards');
                    }
                }
            ]
        },
        {
            id: 'offers-kpi-cards',
            title: '📊 KPI Cards',
            text: 'These KPI cards show the count of total offers and their status breakdown. Track how many offers are in each stage.',
            attachTo: {
                element: '#tour-offer-stats',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('offers');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('offers-tab');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('offers-offer-cards');
                    }
                }
            ]
        },
        {
            id: 'offers-offer-cards',
            title: '📋 Offer Cards',
            text: 'Each offer card shows the candidate name, position, salary, and current status. You can view details, download offer letters, or take actions.',
            attachTo: {
                element: '#tour-first-offer-card',
                on: 'top'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('offers');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('offers-kpi-cards');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('offers-status-tracking');
                    }
                }
            ]
        },
        {
            id: 'offers-status-tracking',
            title: '🏷️ Offer Status Tracking',
            text: 'Track the status of each offer through the hiring pipeline. Filter by status (All, Sent, Accepted, Rejected) to find offers that need your attention.',
            attachTo: {
                element: '#tour-offer-tabs',
                on: 'top'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('offers');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('offers-offer-cards');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('team-tab');
                    }
                }
            ]
        },
        {
            id: 'team-tab',
            title: '👥 Team Overview Tab',
            text: 'Get a comprehensive view of your hiring team\'s progress. Track department-wise hiring status and recent updates.',
            attachTo: {
                element: '#tour-team-tab',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('team');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('offers-status-tracking');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('department-status');
                    }
                }
            ]
        },
        {
            id: 'department-status',
            title: '📊 Department Hiring Status',
            text: 'See how each department is progressing with their hiring goals. The progress bars show filled positions vs total openings.',
            attachTo: {
                element: '#tour-department-status',
                on: 'left'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('team');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('team-tab');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        managerHubTourInstance?.show('team-updates');
                    }
                }
            ]
        },
        {
            id: 'team-updates',
            title: '📰 Recent Team Updates',
            text: 'Stay informed about recent hiring activities, open positions needing attention, and scheduled interviews.',
            attachTo: {
                element: '#tour-team-updates',
                on: 'right'
            },
            beforeShowPromise: async () => {
                switchManagerHubTab('team');
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        managerHubTourInstance?.show('department-status');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Finish Tour',
                    action: () => {
                        managerHubTourInstance?.complete();
                    }
                }
            ]
        }
    ];
};

// Create Shepherd tour instance with common options
const createTour = (): Shepherd.Tour => {
    return new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: {
                enabled: true
            },
            classes: 'shepherd-theme-custom',
            scrollTo: {
                behavior: 'smooth',
                block: 'center'
            },
            modalOverlayOpeningPadding: 15,
            modalOverlayOpeningRadius: 10
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });
};

// Create and start the full tour (backward compatible)
export const startManagerHubTour = (): void => {
    // Check if tour was already completed in this session
    if (typeof window !== 'undefined') {
        const tourCompleted = sessionStorage.getItem('managerHubTourCompleted');
        if (tourCompleted === 'true') {
            console.log('ManagerHub tour already completed in this session, skipping...');
            return;
        }
    }

    console.log('Starting ManagerHub full tour...');

    // Create new tour instance
    const tour = createTour();

    // Create and add steps
    const steps = createTourSteps();
    steps.forEach(step => {
        tour.addStep(step);
    });

    // Handle tour completion
    tour.on('complete', () => {
        console.log('ManagerHub tour completed!');
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('managerHubTourCompleted', 'true');
        }
    });

    // Handle tour cancellation
    tour.on('cancel', () => {
        console.log('ManagerHub tour cancelled');
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('managerHubTourCompleted', 'true');
        }
    });

    // Store instance
    managerHubTourInstance = tour;

    // Start tour after a short delay to ensure DOM is ready
    setTimeout(() => {
        tour.start();
    }, 800);
};

// Start tab-specific tour
export const startTabTour = (tabType: TourTabType): void => {
    console.log(`Starting ${tabType} tab tour...`);
    
    let steps: ManagerHubTourStep[];
    let tourCompletedKey: string;
    let welcomeStepId: string;

    switch (tabType) {
        case 'interviews':
            steps = createInterviewTabSteps();
            tourCompletedKey = 'interviewTabTourCompleted';
            welcomeStepId = 'interview-welcome';
            break;
        case 'offers':
            steps = createOffersTabSteps();
            tourCompletedKey = 'offersTabTourCompleted';
            welcomeStepId = 'offers-welcome';
            break;
        case 'team':
            steps = createTeamTabSteps();
            tourCompletedKey = 'teamTabTourCompleted';
            welcomeStepId = 'team-welcome';
            break;
        default:
            console.error(`Unknown tab type: ${tabType}`);
            return;
    }

    // Check if this tab tour was already completed
    if (typeof window !== 'undefined') {
        const tourCompleted = sessionStorage.getItem(tourCompletedKey);
        if (tourCompleted === 'true') {
            console.log(`${tabType} tab tour already completed, skipping...`);
            return;
        }
    }

    // Create new tour instance
    const tour = createTour();

    // Add steps
    steps.forEach(step => {
        tour.addStep(step);
    });

    // Handle tour completion
    tour.on('complete', () => {
        console.log(`${tabType} tab tour completed!`);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(tourCompletedKey, 'true');
        }
    });

    // Handle tour cancellation
    tour.on('cancel', () => {
        console.log(`${tabType} tab tour cancelled`);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(tourCompletedKey, 'true');
        }
    });

    // Store instance
    managerHubTourInstance = tour;

    // Start tour after a short delay to ensure DOM is ready
    setTimeout(() => {
        tour.start();
        // Show the welcome step first
        setTimeout(() => {
            tour.show(welcomeStepId);
        }, 100);
    }, 500);
};

// Export function to check if full tour should be triggered
export const shouldTriggerManagerHubTour = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check if triggered from sidebar
    const trigger = sessionStorage.getItem('triggerPageTour');
    const isFromSidebar = trigger === 'manager-hub';
    
    // Check if tour was already completed
    const completed = sessionStorage.getItem('managerHubTourCompleted');
    const isCompleted = completed === 'true';
    
    // Return true only if triggered from sidebar and not completed
    return isFromSidebar && !isCompleted;
};

// Export function to check if specific tab tour should be triggered
export const shouldTriggerTabTour = (tabType: TourTabType): boolean => {
    if (typeof window === 'undefined') return false;
    
    const tourCompletedKey = `${tabType}TabTourCompleted`;
    const completed = sessionStorage.getItem(tourCompletedKey);
    const isCompleted = completed === 'true';
    
    return !isCompleted;
};

// Start all tab tours sequentially (Interview → Offer → Team)
export const startAllTabTours = (): void => {
    console.log('[ManagerHubTour] Starting all tab tours sequentially...');
    
    // Clear all tab tour completed flags to ensure they run
    sessionStorage.removeItem('interviewTabTourCompleted');
    sessionStorage.removeItem('offersTabTourCompleted');
    sessionStorage.removeItem('teamTabTourCompleted');
    
    // Start with Interview tab tour
    startTabTourWithCallback('interviews', () => {
        // After Interview tour completes, start Offer tour
        console.log('[ManagerHubTour] Interview tour completed, starting Offer tour...');
        startTabTourWithCallback('offers', () => {
            // After Offer tour completes, start Team tour
            console.log('[ManagerHubTour] Offer tour completed, starting Team tour...');
            startTabTour('team');
        });
    });
};

// Start a single tab tour with a completion callback
const startTabTourWithCallback = (tabType: TourTabType, onComplete?: () => void): void => {
    console.log(`[ManagerHubTour] Starting ${tabType} tab tour with callback...`);
    
    let steps: ManagerHubTourStep[];
    let tourCompletedKey: string;
    let welcomeStepId: string;

    switch (tabType) {
        case 'interviews':
            steps = createInterviewTabSteps();
            tourCompletedKey = 'interviewTabTourCompleted';
            welcomeStepId = 'interview-welcome';
            break;
        case 'offers':
            steps = createOffersTabSteps();
            tourCompletedKey = 'offersTabTourCompleted';
            welcomeStepId = 'offers-welcome';
            break;
        case 'team':
            steps = createTeamTabSteps();
            tourCompletedKey = 'teamTabTourCompleted';
            welcomeStepId = 'team-welcome';
            break;
        default:
            console.error(`Unknown tab type: ${tabType}`);
            return;
    }

    // Create new tour instance
    const tour = createTour();

    // Add steps
    steps.forEach(step => {
        tour.addStep(step);
    });

    // Handle tour completion
    tour.on('complete', () => {
        console.log(`${tabType} tab tour completed!`);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(tourCompletedKey, 'true');
        }
        // Call the completion callback
        if (onComplete) {
            onComplete();
        }
    });

    // Handle tour cancellation
    tour.on('cancel', () => {
        console.log(`${tabType} tab tour cancelled`);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(tourCompletedKey, 'true');
        }
    });

    // Store instance
    managerHubTourInstance = tour;

    // Start tour after a short delay to ensure DOM is ready
    setTimeout(() => {
        tour.start();
        // Show the welcome step first
        setTimeout(() => {
            tour.show(welcomeStepId);
        }, 100);
    }, 500);
};

// Export function to check if all tab tours should be triggered (for Offer Management)
export const shouldTriggerAllTabTours = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check if triggered from sidebar with offer-management
    const trigger = sessionStorage.getItem('triggerPageTour');
    const isFromSidebar = trigger === 'offer-management';
    
    // Check if any tab tour is not completed
    const interviewCompleted = sessionStorage.getItem('interviewTabTourCompleted') === 'true';
    const offersCompleted = sessionStorage.getItem('offersTabTourCompleted') === 'true';
    const teamCompleted = sessionStorage.getItem('teamTabTourCompleted') === 'true';
    
    const allToursCompleted = interviewCompleted && offersCompleted && teamCompleted;
    
    // Return true if triggered from sidebar and not all tours completed
    return isFromSidebar && !allToursCompleted;
};

// Start direct tour: Welcome → Team Overview (skip intermediate steps)
export const startDirectTeamTour = (): void => {
    console.log('[ManagerHubTour] Starting direct tour to Team Overview...');
    
    // Clear tour completed flags
    sessionStorage.removeItem('managerHubTourCompleted');
    sessionStorage.removeItem('teamTabTourCompleted');
    
    // Create new tour instance
    const tour = createTour();
    
    // Add a welcome step
    tour.addStep({
        id: 'direct-welcome',
        title: '👋 Quick Tour to Team Overview!',
        text: 'Let\'s take you directly to explore the Team Overview section where you can see department hiring progress and recent updates.',
        attachTo: {
            element: '#tour-team-tab',
            on: 'bottom'
        },
        beforeShowPromise: async () => {
            // Switch to team tab
            switchManagerHubTab('team');
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    tour.cancel();
                    sessionStorage.setItem('teamTabTourCompleted', 'true');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Start Tour',
                action: () => {
                    tour.show('team-dept-status');
                }
            }
        ]
    });
    
    // Add team overview elements steps
    tour.addStep({
        id: 'team-dept-status',
        title: '📊 Department Hiring Status',
        text: 'See how each department is progressing with their hiring goals. The progress bars show filled positions vs total openings.',
        attachTo: {
            element: '#tour-department-status',
            on: 'left'
        },
        beforeShowPromise: async () => {
            switchManagerHubTab('team');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    tour.show('direct-welcome');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    tour.show('team-updates');
                }
            }
        ]
    });
    
    tour.addStep({
        id: 'team-updates',
        title: '📰 Recent Team Updates',
        text: 'Stay informed about recent hiring activities, open positions needing attention, and scheduled interviews.',
        attachTo: {
            element: '#tour-team-updates',
            on: 'right'
        },
        beforeShowPromise: async () => {
            switchManagerHubTab('team');
        },
        buttons: [
            {
                text: 'Back',
                action: () => {
                    tour.show('team-dept-status');
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Finish Tour',
                action: () => {
                    tour.complete();
                }
            }
        ]
    });
    
    // Handle tour completion
    tour.on('complete', () => {
        console.log('Direct team tour completed!');
        sessionStorage.setItem('teamTabTourCompleted', 'true');
    });
    
    // Handle tour cancellation
    tour.on('cancel', () => {
        console.log('Direct team tour cancelled');
        sessionStorage.setItem('teamTabTourCompleted', 'true');
    });
    
    // Store instance
    managerHubTourInstance = tour;
    
    // Start tour
    setTimeout(() => {
        tour.start();
    }, 500);
};

// Export tour instance for external access
export const getManagerHubTourInstance = (): Shepherd.Tour | null => {
    return managerHubTourInstance;
};

// Custom CSS for enhanced tour experience
export const managerHubTourStyles = `
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
        background: #007BE5 !important;
    }

    .shepherd-theme-custom .shepherd-button-secondary:hover {
        background: #0056b3 !important;
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

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = managerHubTourStyles;
    document.head.appendChild(styleSheet);
}
