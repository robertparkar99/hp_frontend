import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Type for tour step data from API
export interface AssessmentLibraryTourStepData {
    on_click?: string;
    onClick?: string;
    step_key?: string;
    stepKey?: string;
    id?: number | string;
    title?: string;
    Title?: string;
    name?: string;
    step_title?: string;
    stepTitle?: string;
    description?: string;
    Description?: string;
    text?: string;
    Text?: string;
    content?: string;
    step_description?: string;
}

// Helper to get user data from localStorage
const getUserData = (): { url: string; token: string; subInstituteId: string } | null => {
    if (typeof window === 'undefined') return null;
    try {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
            return {
                url: APP_URL,
                token,
                subInstituteId: String(sub_institute_id)
            };
        }
    } catch (e) {
        console.error('[Assessment Library Tour] Error getting userData:', e);
    }
    return null;
};

// Fetch tour steps from API
const fetchAssessmentLibraryTourStepsFromAPI = async (menuId: number): Promise<AssessmentLibraryTourStepData[]> => {
    const userData = getUserData();
    if (!userData) {
        console.log('[Assessment Library Tour] No userData available, using default tour steps');
        return [];
    }

    try {
        const baseUrl = userData.url;
        const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
        console.log('[Assessment Library Tour] Fetching tour steps from API:', apiUrl);

        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[Assessment Library Tour] Raw API response:', json);

        // Handle different response formats
        let tourData: AssessmentLibraryTourStepData[] = [];

        if (Array.isArray(json)) {
            tourData = json;
        } else if (json.data && Array.isArray(json.data)) {
            tourData = json.data;
        } else if (json.result && Array.isArray(json.result)) {
            tourData = json.result;
        } else if (json.response && Array.isArray(json.response)) {
            tourData = json.response;
        } else if (typeof json === 'object') {
            for (const key of Object.keys(json)) {
                if (Array.isArray(json[key])) {
                    tourData = json[key];
                    console.log(`[Assessment Library Tour] Found array data in response.${key}`);
                    break;
                }
            }
        }

        console.log('[Assessment Library Tour] Parsed tour data:', tourData);
        return tourData;
    } catch (error) {
        console.error('[Assessment Library Tour] Error fetching tour steps:', error);
        return [];
    }
};

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

// Function to generate tour steps with API overrides
export const getAssessmentLibraryTourSteps = (apiTourData?: AssessmentLibraryTourStepData[]): AssessmentLibraryTourStep[] => {
    // Create a Map from API data for easy lookup by step ID
    const apiStepsMap = new Map<string, { title: string; description: string }>();

    if (apiTourData && apiTourData.length > 0) {
        console.log('[Assessment Library Tour] Creating apiStepsMap from API data:', apiTourData.length);

        apiTourData.forEach((stepData: AssessmentLibraryTourStepData) => {
            const stepId = stepData.on_click || stepData.onClick || stepData.step_key || stepData.stepKey || String(stepData.id) || '';
            const stepTitle = stepData.title || stepData.Title || stepData.name || stepData.step_title || stepData.stepTitle || '';
            const stepDescription = stepData.description || stepData.Description || stepData.text || stepData.Text || stepData.content || stepData.step_description || '';

            if (stepId) {
                apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
            }
        });

        console.log('[Assessment Library Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
    }

    console.log('[Assessment Library Tour] Using default tour steps with API overrides');

    return [
        {
            id: 'welcome',
            title: apiStepsMap.get('welcome')?.title || 'Welcome to Assessment Library!',
            text: apiStepsMap.get('welcome')?.description || 'This page allows you to manage all your assessments, quizzes, and evaluations. Let\'s explore the key features together.',
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
            title: apiStepsMap.get('create-assessment')?.title || 'Create Assessment',
            text: apiStepsMap.get('create-assessment')?.description || 'Click here to create a new assessment. You can build custom quizzes, tests, and evaluations for your organization.',
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
            title: apiStepsMap.get('ai-assessment')?.title || 'AI-Powered Assessment Builder',
            text: apiStepsMap.get('ai-assessment')?.description || 'Use AI to quickly generate assessments based on your requirements. This feature helps you create assessments faster with intelligent suggestions.',
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
            title: apiStepsMap.get('info-help')?.title || 'Help & Information',
            text: apiStepsMap.get('info-help')?.description || 'Click here to access help documentation and get more information about using the Assessment Library.',
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
            title: apiStepsMap.get('assessment-stats')?.title || 'Assessment Statistics',
            text: apiStepsMap.get('assessment-stats')?.description || 'Get a quick overview of your assessments. This shows total assessments, active ones, closed assessments, and recent/upcoming deadlines.',
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
            title: apiStepsMap.get('search-bar')?.title || 'Search Assessments',
            text: apiStepsMap.get('search-bar')?.description || 'Use the search bar to quickly find assessments by title, description, or other criteria.',
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
            title: apiStepsMap.get('filter-panel')?.title || 'Filter Assessments',
            text: apiStepsMap.get('filter-panel')?.description || 'Filter assessments by category, difficulty level, status, and more. Click to open the filter options panel.',
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
            title: apiStepsMap.get('assessment-cards')?.title || 'Assessment Cards',
            text: apiStepsMap.get('assessment-cards')?.description || 'Each card displays an assessment with key information including title, type, difficulty, duration, question count, and status. Click to view details or start the assessment.',
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
            title: apiStepsMap.get('tour-complete')?.title || 'You\'re All Set!',
            text: apiStepsMap.get('tour-complete')?.description || 'You now know how to navigate the Assessment Library. Create assessments, filter and search through your library, and track all your evaluations. Happy assessing!',
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
};

// Export function to fetch API data and return steps
// This can be called from the parent component to get tour steps with API data
export const fetchAndCreateAssessmentLibraryTourSteps = async (menuId?: number): Promise<AssessmentLibraryTourStep[]> => {
    // Get menuId dynamically from getPageInfo() - with fallback to session storage trigger
    const pageInfo = getPageInfo();
    const menuIdFromStorage = sessionStorage.getItem('triggerPageTourMenuId');
    const menuIdToUse = menuId || (menuIdFromStorage ? parseInt(menuIdFromStorage) : pageInfo.menuId);

    // Fetch from API
    const apiTourData = await fetchAssessmentLibraryTourStepsFromAPI(menuIdToUse);

    // Log the API data to console
    console.log('[Assessment Library Tour] API data fetched and logged:', apiTourData);

    // Create steps with API data
    return getAssessmentLibraryTourSteps(apiTourData);
};

// Backward compatibility - export default steps (without API data)
export const assessmentLibraryTourSteps: AssessmentLibraryTourStep[] = getAssessmentLibraryTourSteps();

export class AssessmentLibraryTour {
    public static tour: Shepherd.Tour | null = null;
    private static readonly TOUR_COMPLETED_KEY = 'assessmentLibraryTourCompleted';

    // Check if tour should start based on trigger
    public static shouldStartTour(): boolean {
        if (typeof window === 'undefined') return false;
        
        // Get trigger value and current URL
        const triggerValue = sessionStorage.getItem('triggerPageTour');
        const currentUrl = window.location.pathname.toLowerCase()

        // Check if triggered from sidebar OR if we're on the Assessment Library URL
        // Accept multiple trigger values for flexibility
        const isFromSidebar = triggerValue === 'assessment-library' ||
            triggerValue === 'true' ||
            triggerValue === 'assessment-library-tour';

        // Also detect by URL pattern if no explicit trigger
        const isAssessmentLibraryUrl = currentUrl.includes('/assessment-library') ||
            currentUrl.includes('assessment-library') ||
            currentUrl.includes('/lms/assessment');
        
        // Check if tour already completed
        const tourCompleted = sessionStorage.getItem(this.TOUR_COMPLETED_KEY) === 'true';
        
        // Debug logging
        console.log('[AssessmentLibrary] shouldStartTour check:', {
            triggerValue,
            isFromSidebar,
            isAssessmentLibraryUrl,
            tourCompleted,
            url: window.location.pathname
        });

        // Start tour if triggered from sidebar (has trigger value) and not completed
        // We require explicit trigger to prevent starting on direct URL access
        const shouldStart = isFromSidebar && !tourCompleted;

        console.log('[AssessmentLibrary] Tour should start:', shouldStart);

        return shouldStart;
    }

    // Mark tour as completed
    public static markTourCompleted(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(this.TOUR_COMPLETED_KEY, 'true');
        }
    }

    // Start the tour - async to fetch API data
    public static async startTour(): Promise<void> {
        if (typeof window === 'undefined') return;

        // Check if tour already completed (don't start if completed)
        const wasCompleted = sessionStorage.getItem(this.TOUR_COMPLETED_KEY) === 'true';

        // If tour was previously completed, reset it so user can do the tour again
        if (wasCompleted) {
            sessionStorage.setItem(this.TOUR_COMPLETED_KEY, 'false');
        }

        // Get the trigger value BEFORE clearing it
        const triggerValue = sessionStorage.getItem('triggerPageTour');
        console.log('[AssessmentLibrary] Starting tour with trigger:', triggerValue);

        // Clear the trigger flag (only after we've read it)
        sessionStorage.removeItem('triggerPageTour');

        // Get menuId dynamically from getPageInfo() - with fallback to session storage trigger
        const pageInfo = getPageInfo();
        const menuIdFromStorage = sessionStorage.getItem('triggerPageTourMenuId');
        const menuIdToUse = menuIdFromStorage ? parseInt(menuIdFromStorage) : pageInfo.menuId;

        // Fetch tour steps from API using dynamic menuId
        console.log('[AssessmentLibrary] Fetching tour steps from API with menuId:', menuIdToUse);
        const apiTourData = await fetchAssessmentLibraryTourStepsFromAPI(menuIdToUse);
        console.log('[AssessmentLibrary] API data fetched and logged:', apiTourData);

        // Get steps with API overrides
        const steps = getAssessmentLibraryTourSteps(apiTourData);

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
        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Get menuId from session for journey logging
        const getTourMenuId = () => {
            return menuIdToUse;
        };

        const getAccessLink = () => {
            return pageInfo.accessLink || '/Assessment-Library';
        };

        // Handle tour events with journey logging
        this.tour.on('start', () => {
            console.log('Assessment Library Tour started - logging journey');
            const menuId = getTourMenuId();
            logUserJourney({
                eventType: 'tour_started',
                stepKey: 'welcome',
                menuId: menuId,
                accessLink: getAccessLink(),
            }).catch(err => console.error('JourneyLogger: Error logging tour start:', err));
        });

        this.tour.on('show', (e: any) => {
            const step = e.step;
            console.log('Assessment Library Tour step shown:', step.id, '- logging journey');
            const menuId = getTourMenuId();
            logUserJourney({
                eventType: 'tour_step_view',
                stepKey: step.id,
                menuId: menuId,
                accessLink: getAccessLink(),
            }).catch(err => console.error('JourneyLogger: Error logging tour step view:', err));
        });

        // Handle tour events
        this.tour.on('complete', () => {
            this.markTourCompleted();
            const menuId = getTourMenuId();
            logUserJourney({
                eventType: 'tour_step_complete',
                stepKey: 'tour_complete',
                menuId: menuId,
                accessLink: getAccessLink(),
            }).catch(err => console.error('JourneyLogger: Error logging tour complete:', err));
            this.tour = null;
        });

        this.tour.on('cancel', () => {
            this.markTourCompleted();
            const menuId = getTourMenuId();
            logUserJourney({
                eventType: 'tour_skipped',
                stepKey: 'tour_skipped',
                menuId: menuId,
                accessLink: getAccessLink(),
            }).catch(err => console.error('JourneyLogger: Error logging tour skip:', err));
            this.tour = null;
        });

        // Start tour after a small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('[AssessmentLibrary] Calling tour.start()');
            this.tour?.start();
        }, 500);
    }

    // Restart the tour
    public static restartTour(): void {
        if (typeof window !== 'undefined') {
            // Clear completion flag to allow restart
            sessionStorage.removeItem(this.TOUR_COMPLETED_KEY);
            console.log('[AssessmentLibrary] Tour restart requested, cleared completion flag');
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
