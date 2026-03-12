import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour step configuration
export interface OfferTourStep {
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
}

// Create and export tour instance
let offerTourInstance: Shepherd.Tour | null = null;

export const startOfferManagementTour = (): void => {
    // Check if tour was already completed in this session
    if (typeof window !== 'undefined') {
        const tourCompleted = sessionStorage.getItem('offerManagementTourCompleted');
        if (tourCompleted === 'true') {
            console.log('Offer Management tour already completed in this session, skipping...');
            return;
        }
    }

    console.log('Starting Offer Management tour...');

    // Create new tour instance
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

    // Define tour steps - Simplified sequence: Welcome → Tab → List → Status → Finish
    const steps: OfferTourStep[] = [
        {
            id: 'welcome',
            title: '👋 Welcome to Offer Management!',
            text: 'This dashboard helps you create, send, and track job offers for candidates. Let\'s explore the key features together.',
            attachTo: {
                element: '#tour-offer-title',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => {
                        tour.cancel();
                        if (typeof window !== 'undefined') {
                            sessionStorage.setItem('offerManagementTourCompleted', 'true');
                        }
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => {
                        tour.show('offer-tab');
                    }
                }
            ]
        },
        {
            id: 'offer-tab',
            title: '📝 Offer Management Tab',
            text: 'This tab shows all job offers created for candidates. You can track offer status (Draft, Sent, Accepted, Rejected) and manage the onboarding process.',
            attachTo: {
                element: '#tour-tab-all',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        tour.show('welcome');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        tour.show('offer-list');
                    }
                }
            ]
        },
        {
            id: 'offer-list',
            title: '📋 Offer List',
            text: 'View all job offers here. Each offer shows the candidate name, position, salary details, and current status.',
            attachTo: {
                element: '#tour-offer-stats',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        tour.show('offer-tab');
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => {
                        tour.show('offer-status');
                    }
                }
            ]
        },
        {
            id: 'offer-status',
            title: '🏷️ Offer Status Tracking',
            text: 'Track the status of each offer through the hiring pipeline. Filter by status (Draft, Sent, Accepted, Rejected) to find offers that need your attention.',
            attachTo: {
                element: '#tour-tab-sent',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                // Switch to sent tab to show status tracking
                const sentTab = document.querySelector<HTMLElement>('#tour-tab-sent');
                if (sentTab) {
                    sentTab.click();
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            },
            buttons: [
                {
                    text: 'Back',
                    action: () => {
                        tour.show('offer-list');
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
        }
    ];

    // Add steps to tour
    steps.forEach(step => {
        tour.addStep(step);
    });

    // Handle tour completion
    tour.on('complete', () => {
        console.log('Offer Management tour completed!');
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('offerManagementTourCompleted', 'true');
        }
    });

    // Handle tour cancellation
    tour.on('cancel', () => {
        console.log('Offer Management tour cancelled');
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('offerManagementTourCompleted', 'true');
        }
    });

    // Store instance
    offerTourInstance = tour;

    // Start tour after a short delay
    setTimeout(() => {
        tour.start();
    }, 500);
};

// Export function to check if tour should be triggered
export const shouldTriggerOfferManagementTour = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check if triggered from sidebar
    const trigger = sessionStorage.getItem('triggerPageTour');
    const isFromSidebar = trigger === 'offer-management';
    
    // Check if tour was already completed
    const completed = sessionStorage.getItem('offerManagementTourCompleted');
    const isCompleted = completed === 'true';
    
    // Return true only if triggered from sidebar and not completed
    return isFromSidebar && !isCompleted;
};

// Export tour instance for external access
export const getOfferTourInstance = (): Shepherd.Tour | null => {
    return offerTourInstance;
};

// Custom CSS for enhanced tour experience
export const offerTourStyles = `
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
    styleSheet.textContent = offerTourStyles;
    document.head.appendChild(styleSheet);
}
