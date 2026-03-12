import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export interface AssessmentLibraryTourStep {
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
    scrollTo?: boolean;
}

export const assessmentLibraryTourSteps: AssessmentLibraryTourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Assessment Library!',
        text: 'This page allows you to manage all your assessments, quizzes, and evaluations. Let\'s explore the key features together.',
        attachTo: {
            element: '#assessment-library-title',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.cancel();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'create-assessment',
        title: 'Create Assessment',
        text: 'Click here to create a new assessment. You can build custom quizzes, tests, and evaluations for your organization.',
        attachTo: {
            element: '#tour-create-assessment',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Previous',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.back();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'ai-assessment',
        title: 'AI-Powered Assessment Builder',
        text: 'Use AI to quickly generate assessments based on your requirements. This feature helps you create assessments faster with intelligent suggestions.',
        attachTo: {
            element: '#tour-ai-assessment',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Previous',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.back();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'info-help',
        title: 'Help & Information',
        text: 'Click here to access help documentation and get more information about using the Assessment Library.',
        attachTo: {
            element: '#tour-info-help',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Previous',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.back();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'assessment-stats',
        title: 'Assessment Statistics',
        text: 'Get a quick overview of your assessments. This shows total assessments, active ones, closed assessments, and recent/upcoming deadlines.',
        attachTo: {
            element: '#tour-assessment-stats',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Previous',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.back();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'search-bar',
        title: 'Search Assessments',
        text: 'Use the search bar to quickly find assessments by title, description, or other criteria.',
        attachTo: {
            element: '#tour-search-bar',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Previous',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.back();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'filter-panel',
        title: 'Filter Assessments',
        text: 'Filter assessments by category, difficulty level, status, and more. Click to open the filter options panel.',
        attachTo: {
            element: '#tour-filter-button',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Previous',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.back();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'assessment-cards',
        title: 'Assessment Cards',
        text: 'Each card displays an assessment with key information including title, type, difficulty, duration, question count, and status. Click to view details or start the assessment.',
        attachTo: {
            element: '#tour-assessment-card-0',
            on: 'top'
        },
        scrollTo: false,
        buttons: [
            {
                text: 'Previous',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.back();
                    }
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.next();
                    }
                }
            }
        ]
    },
    {
        id: 'tour-complete',
        title: 'You\'re All Set!',
        text: 'You now know how to navigate the Assessment Library. Create assessments, filter and search through your library, and track all your evaluations. Happy assessing!',
        attachTo: {
            element: '#assessment-library-title',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Finish Tour',
                action: () => {
                    const tour = AssessmentLibraryTour.tour;
                    if (tour) {
                        tour.complete();
                    }
                }
            }
        ]
    }
];

export class AssessmentLibraryTour {
    public static tour: Shepherd.Tour | null = null;
    private static readonly TOUR_COMPLETED_KEY = 'assessmentLibraryTourCompleted';

    // Check if tour should start based on trigger
    public static shouldStartTour(): boolean {
        if (typeof window === 'undefined') return false;
        
        // Check if triggered from sidebar
        const triggerValue = sessionStorage.getItem('triggerPageTour');
        const isAssessmentLibrary = triggerValue === 'assessment-library' || 
                                     triggerValue === 'true' ||
                                     window.location.pathname.includes('/Assessment-Library');
        
        // Check if tour already completed
        const tourCompleted = sessionStorage.getItem(this.TOUR_COMPLETED_KEY) === 'true';
        
        // Start tour only if triggered from sidebar and not completed
        return isAssessmentLibrary && !tourCompleted;
    }

    // Mark tour as completed
    public static markTourCompleted(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(this.TOUR_COMPLETED_KEY, 'true');
        }
    }

    // Start the tour
    public static startTour(): void {
        if (typeof window === 'undefined') return;

        // Clear the trigger flag
        sessionStorage.removeItem('triggerPageTour');

        // Mark tour as starting
        this.markTourCompleted();

        // Check if tour already completed
        if (sessionStorage.getItem(this.TOUR_COMPLETED_KEY) === 'true') {
            // Re-enable tour for this session if it was just marked
            sessionStorage.setItem(this.TOUR_COMPLETED_KEY, 'false');
        }

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

        // Add steps to tour
        assessmentLibraryTourSteps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('complete', () => {
            this.markTourCompleted();
            this.tour = null;
        });

        this.tour.on('cancel', () => {
            this.markTourCompleted();
            this.tour = null;
        });

        // Start tour after a small delay to ensure DOM is ready
        setTimeout(() => {
            this.tour?.start();
        }, 500);
    }

    // Restart the tour
    public static restartTour(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(this.TOUR_COMPLETED_KEY);
        }
        this.startTour();
    }
}

// Export styles
export const assessmentTourStyles = `
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
    const existingStyle = document.querySelector('#assessment-tour-styles');
    if (!existingStyle) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'assessment-tour-styles';
        styleSheet.textContent = assessmentTourStyles;
        document.head.appendChild(styleSheet);
    }
}
