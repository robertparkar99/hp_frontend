import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tour Step Interface
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

// Tour configuration
export const viewDetailTourOptions: any = {
    defaultStepOptions: {
        cancelIcon: {
            enabled: true
        },
        classes: 'shepherd-theme-custom',
        scrollTo: {
            behavior: 'smooth' as const,
            block: 'center' as const
        },
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 8
    },
    useModalOverlay: true,
    exitOnEsc: true,
    keyboardNavigation: true
};

// Create tour steps for ViewDetail page
export const createViewDetailSteps = (
    tour: Shepherd.Tour,
    onComplete?: () => void
): TourStep[] => {
    const steps: TourStep[] = [];
    let currentStepIndex = 0;

    // Helper to create Next action
    const createNextAction = () => {
        const nextIndex = currentStepIndex + 1;
        return () => {
            const steps = tour.steps || [];
            if (steps[nextIndex]) {
                tour.show(steps[nextIndex].id);
            } else {
                tour.complete();
            }
        };
    };

    // Helper to create Back action
    const createBackAction = () => {
        const prevIndex = currentStepIndex - 1;
        return () => {
            const steps = tour.steps || [];
            if (steps[prevIndex] && prevIndex >= 0) {
                tour.show(steps[prevIndex].id);
            } else {
                tour.show(steps[0].id);
            }
        };
    };

    // Step 1: Welcome
    steps.push({
        id: 'vd-welcome',
        title: '🎉 Course Enrollment Successful!',
        text: 'Welcome to the course detail page! Here you can access all course materials, track your progress, and complete modules. Let\'s take a quick tour.',
        attachTo: {
            element: '#vd-course-header',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    sessionStorage.setItem('viewDetailTourCompleted', 'true');
                    tour.cancel();
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Start Tour',
                action: createNextAction()
            }
        ]
    });
    currentStepIndex++;

    // Step 2: Back Button
    steps.push({
        id: 'vd-back-button',
        title: '🔙 Navigation',
        text: 'Use this back button to return to the Learning Catalog when you\'re done exploring this course.',
        attachTo: {
            element: '#vd-back-button',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Back',
                action: createBackAction(),
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: createNextAction()
            }
        ]
    });
    currentStepIndex++;

    // Step 3: Course Hero
    steps.push({
        id: 'vd-course-hero',
        title: '📚 Course Overview',
        text: 'This section shows the course title, thumbnail, and key information like module count and resources.',
        attachTo: {
            element: '#vd-course-hero',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Back',
                action: createBackAction(),
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: createNextAction()
            }
        ]
    });
    currentStepIndex++;

    // Step 4: Tab Navigation
    steps.push({
        id: 'vd-tab-navigation',
        title: '📑 Course Tabs',
        text: 'Switch between **Modules** (course chapters) and **Resources** (additional materials) using these tabs.',
        attachTo: {
            element: '#vd-tab-navigation',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Back',
                action: createBackAction(),
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: createNextAction()
            }
        ]
    });
    currentStepIndex++;

    // Step 5: Module Grid
    steps.push({
        id: 'vd-module-grid',
        title: '📖 Course Modules',
        text: 'These are the course modules/chapters. Click on a module to view its contents and start learning.',
        attachTo: {
            element: '#vd-module-grid',
            on: 'top'
        },
        buttons: [
            {
                text: 'Back',
                action: createBackAction(),
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: createNextAction()
            }
        ]
    });
    currentStepIndex++;

    // Step 6: First Module
    steps.push({
        id: 'vd-first-module',
        title: '🎯 First Module',
        text: 'Click on any module to expand and see its contents. Each module may have videos, documents, links, and other learning materials.',
        attachTo: {
            element: '#vd-module-0',
            on: 'right'
        },
        buttons: [
            {
                text: 'Back',
                action: createBackAction(),
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: createNextAction()
            }
        ]
    });
    currentStepIndex++;

    // Step 7: Tour Complete
    steps.push({
        id: 'vd-tour-complete',
        title: '🎉 You\'re Ready!',
        text: 'You now know how to navigate the course detail page. Start by clicking on a module to begin learning. Good luck!',
        attachTo: {
            element: '#vd-course-header',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Back',
                action: createBackAction(),
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Finish',
                action: () => {
                    sessionStorage.setItem('viewDetailTourCompleted', 'true');
                    if (onComplete) {
                        onComplete();
                    }
                    tour.complete();
                }
            }
        ]
    });
    currentStepIndex++;

    return steps;
};

// Custom CSS for the tour
export const viewDetailTourStyles = `
    .shepherd-theme-custom {
        --shepherd-theme-primary: #3080ff;
        --shepherd-theme-secondary: #6c757d;
        max-width: 400px;
    }

    .shepherd-theme-custom .shepherd-header {
        background: linear-gradient(135deg, #007BE5 0%, #546ee5 100%);
        color: white;
        border-radius: 8px 8px 0 0;
        padding: 16px 20px;
    }

    .shepherd-theme-custom .shepherd-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: white;
    }

    .shepherd-theme-custom .shepherd-text {
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        padding: 20px;
    }

    .shepherd-theme-custom .shepherd-text strong {
        color: #007BE5;
    }

    .shepherd-theme-custom .shepherd-button {
        background: #007BE5;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.2s ease;
        margin: 4px;
    }

    .shepherd-theme-custom .shepherd-button:hover {
        background: #0056b3;
        transform: translateY(-1px);
    }

    .shepherd-theme-custom .shepherd-button-secondary {
        background: #6c757d !important;
    }

    .shepherd-theme-custom .shepherd-button-secondary:hover {
        background: #545b62 !important;
    }

    .shepherd-theme-custom .shepherd-cancel-icon {
        color: white;
        font-size: 20px;
        opacity: 0.8;
    }

    .shepherd-theme-custom .shepherd-cancel-icon:hover {
        opacity: 1;
    }

    .shepherd-has-title .shepherd-content .shepherd-header {
        background: linear-gradient(135deg, #007BE5 0%, #546ee5 100%);
        padding: 16px 20px;
    }

    .shepherd-theme-custom .shepherd-element {
        box-shadow: 0 10px 40px rgba(0, 123, 229, 0.3);
        border-radius: 12px;
        overflow: hidden;
    }

    .shepherd-theme-custom .shepherd-arrow:before {
        background: linear-gradient(135deg, #007BE5 0%, #546ee5 100%);
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.03); }
        100% { transform: scale(1); }
    }

    .shepherd-element-highlight {
        animation: pulse 1.5s ease-in-out infinite;
        z-index: 9999 !important;
        position: relative;
    }
`;

// Inject styles into document head
export const injectViewDetailTourStyles = () => {
    if (typeof document !== 'undefined') {
        // Check if styles already exist
        const existingStyle = document.getElementById('view-detail-tour-styles');
        if (!existingStyle) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'view-detail-tour-styles';
            styleSheet.textContent = viewDetailTourStyles;
            document.head.appendChild(styleSheet);
        }
    }
};
