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
export const learningCatalogTourOptions: any = {
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

// Create tour steps for Learning Catalog
export const createLearningCatalogSteps = (
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

    // Step 1: Welcome / Header
    steps.push({
        id: 'lc-welcome',
        title: '🎓 Welcome to Learning Catalog!',
        text: 'This is your Learning Catalog dashboard where you can discover, enroll, and manage courses to advance your skills and career. Let\'s take a quick tour to explore all features.',
        attachTo: {
            element: '#lc-header',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    sessionStorage.setItem('learningCatalogTourCompleted', 'true');
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

    // Step 2: Header Section
    steps.push({
        id: 'lc-header-section',
        title: '📍 Main Header',
        text: 'This header shows your Learning Catalog title and description. Use this as your navigation reference when browsing courses.',
        attachTo: {
            element: '#lc-header',
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

    // Step 3: Admin Actions (External Course, AI, Create Course)
    steps.push({
        id: 'lc-admin-actions',
        title: '⚡ Admin Actions',
        text: 'As an admin, you have special actions available:\n\n• **External Course**: Browse and add courses from Udemy\n• **Build with AI**: Generate new courses using AI\n• **Create Course**: Manually create a new course',
        attachTo: {
            element: '#lc-admin-actions',
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



    // Step 5: Filter Sidebar
    steps.push({
        id: 'lc-filter-sidebar',
        title: '🎯 Filter Sidebar',
        text: 'Use these filters to find courses that match your needs:\n\n• **Subject Types**: Filter by type (video, document, etc.)\n• **Categories**: Filter by course category\n• **Clear All**: Reset all filters at once',
        attachTo: {
            element: '#lc-filter-sidebar',
            on: 'right'
        },
        beforeShowPromise: () => {
            return new Promise(resolve => {
                // Ensure filter sidebar is visible
                const filterToggle = document.querySelector('#lc-filters-toggle') as HTMLElement;
                if (filterToggle) {
                    filterToggle.click();
                }
                setTimeout(resolve, 300);
            });
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

    // Step 6: Search Toolbar - Search Bar Only
    steps.push({
        id: 'lc-search-toolbar',
        title: '🔎 Search Bar',
        text: 'Use the search bar to find courses by title, description, category, or short name. Type keywords and press enter to search.',
        attachTo: {
            element: '#lc-search-box',
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

    // Step 7: First Course Card
    steps.push({
        id: 'lc-course-card-0',
        title: '📖 First Course Card',
        text: 'This is the first course card. Each card shows the course thumbnail, title, category, duration, rating, and actions.',
        attachTo: {
            element: '#lc-course-card-0',
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

    // Step 8: Enroll Button
    steps.push({
        id: 'lc-enroll-btn-0',
        title: '🎯 Enroll Button',
        text: 'Click the **Enroll** button to enroll in a course. Once enrolled, you can access all course materials and track your progress.',
        attachTo: {
            element: '#lc-enroll-btn-0',
            on: 'top'
        },
        when: {
            show: () => {
                // Automatically click the Enroll button after a short delay
                setTimeout(() => {
                    const enrollBtn = document.querySelector('#lc-enroll-btn-0') as HTMLButtonElement;
                    if (enrollBtn && !enrollBtn.disabled) {
                        enrollBtn.click();
                    }
                }, 1000);
            }
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

    // Step 11: External Course Dialog (if applicable)
    steps.push({
        id: 'lc-external-course',
        title: '🌐 External Course Integration',
        text: 'Browse courses from external platforms like Udemy directly from your dashboard. Add them to your catalog for unified learning.',
        attachTo: {
            element: '#lc-admin-actions',
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

    // Step 12: AI Course Builder
    steps.push({
        id: 'lc-ai-builder',
        title: '🤖 AI Course Builder',
        text: 'Use AI to generate customized courses based on your requirements. Simply provide a topic, and AI will create a structured course for you.',
        attachTo: {
            element: '#lc-admin-actions',
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

    // Step 13: Create Course Form
    steps.push({
        id: 'lc-create-course',
        title: '✏️ Create Course Manually',
        text: 'Create courses manually with full control over content:\n\n• **Course Details**: Set title, description, and thumbnail\n• **Subject Mapping**: Link to subjects and standards\n• **Settings**: Configure difficulty, status, and more',
        attachTo: {
            element: '#lc-admin-actions',
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

    // Step 14: Tour Complete
    steps.push({
        id: 'lc-tour-complete',
        title: '🎉 Tour Complete!',
        text: 'Congratulations! You now know how to use the Learning Catalog. Start exploring courses and enhance your skills today!',
        attachTo: {
            element: '#lc-header',
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
                    sessionStorage.setItem('learningCatalogTourCompleted', 'true');
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
export const learningCatalogTourStyles = `
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
export const injectLearningCatalogTourStyles = () => {
    if (typeof document !== 'undefined') {
        // Check if styles already exist
        const existingStyle = document.getElementById('learning-catalog-tour-styles');
        if (!existingStyle) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'learning-catalog-tour-styles';
            styleSheet.textContent = learningCatalogTourStyles;
            document.head.appendChild(styleSheet);
        }
    }
};
