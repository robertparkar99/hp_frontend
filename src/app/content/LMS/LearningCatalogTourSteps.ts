import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Type for tour step data from API
export interface LearningCatalogTourStepData {
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
        console.error('[Learning Catalog Tour] Error getting userData:', e);
    }
    return null;
};

// Helper to get session data for role checks
const getSessionData = (): { user_profile_name?: string } | null => {
    if (typeof window === 'undefined') return null;
    try {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsed = JSON.parse(userData);
            return {
                user_profile_name: parsed.org_type
            };
        }
    } catch (e) {
        console.error('[Learning Catalog Tour] Error getting sessionData:', e);
    }
    return null;
};

// Helper to check if admin actions should be shown
const canShowAdminActions = (sessionData: { user_profile_name?: string } | null): boolean => {
    return (
        sessionData &&
        sessionData.user_profile_name &&
        ["ADMIN", "HR"].includes(sessionData.user_profile_name.toUpperCase())
    );
};

// Fetch tour steps from API
const fetchLearningCatalogTourStepsFromAPI = async (menuId: number): Promise<LearningCatalogTourStepData[]> => {
    const userData = getUserData();
    if (!userData) {
        console.log('[Learning Catalog Tour] No userData available, using default tour steps');
        return [];
    }

    try {
        const baseUrl = userData.url;
        const apiUrl = `${baseUrl}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`;
        console.log('[Learning Catalog Tour] Fetching tour steps from API:', apiUrl);

        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[Learning Catalog Tour] Raw API response:', json);

        // Handle different response formats
        let tourData: LearningCatalogTourStepData[] = [];

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
                    console.log(`[Learning Catalog Tour] Found array data in response.${key}`);
                    break;
                }
            }
        }

        console.log('[Learning Catalog Tour] Parsed tour data:', tourData);
        return tourData;
    } catch (error) {
        console.error('[Learning Catalog Tour] Error fetching tour steps:', error);
        return [];
    }
};

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

// Export function to fetch API data and create steps with API overrides
// This can be called from the parent component to get tour steps with API data
export const fetchAndCreateLearningCatalogSteps = async (
    tour: Shepherd.Tour,
    menuId: string | number,
    apiTourData?: LearningCatalogTourStepData[],
    onComplete?: () => void
): Promise<TourStep[]> => {
    // Get menuId dynamically from getPageInfo() - with fallback to session storage trigger
    const pageInfo = getPageInfo();
    const menuIdFromStorage = sessionStorage.getItem('triggerPageTourMenuId');
    const menuIdToUse = menuIdFromStorage ? parseInt(menuIdFromStorage) : pageInfo.menuId;

    // Fetch from API
    const apiTourDataResult = await fetchLearningCatalogTourStepsFromAPI(menuIdToUse);

    // Log the API data to console
    console.log('[Learning Catalog Tour] API data fetched and logged:', apiTourDataResult);

    // Create steps with API data (pass apiTourData to createLearningCatalogSteps)
    return createLearningCatalogSteps(tour, menuId, apiTourDataResult, onComplete);
};

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

// Create tour steps for Learning Catalog with API overrides
export const createLearningCatalogSteps = (
    tour: Shepherd.Tour,
    menuId: string | number,
    apiTourData?: LearningCatalogTourStepData[],
    onComplete?: () => void
): TourStep[] => {
    const steps: TourStep[] = [];
    let currentStepIndex = 0;

    // Get session data for role checks
    const sessionData = getSessionData();

    // Access link for journey logging
    const { accessLink } = getPageInfo();
    console.log('[LearningCatalogTour] Access Link:', accessLink);

    // Create a Map from API data for easy lookup by step ID
    const apiStepsMap = new Map<string, { title: string; description: string }>();

    if (apiTourData && apiTourData.length > 0) {
        console.log('[Learning Catalog Tour] Creating apiStepsMap from API data:', apiTourData.length);

        apiTourData.forEach((stepData: LearningCatalogTourStepData) => {
            const stepId = stepData.on_click || stepData.onClick || stepData.step_key || stepData.stepKey || String(stepData.id) || '';
            const stepTitle = stepData.title || stepData.Title || stepData.name || stepData.step_title || stepData.stepTitle || '';
            const stepDescription = stepData.description || stepData.Description || stepData.text || stepData.Text || stepData.content || stepData.step_description || '';

            if (stepId) {
                apiStepsMap.set(stepId, { title: stepTitle, description: stepDescription });
            }
        });

        console.log('[Learning Catalog Tour] apiStepsMap created:', Array.from(apiStepsMap.entries()));
    }

    console.log('[Learning Catalog Tour] Using default tour steps with API overrides');

    // Helper to create Next action
    const createNextAction = (stepId: string) => {
        const nextIndex = currentStepIndex + 1;
        return () => {
            // Log tour step complete
            logUserJourney({
                eventType: 'tour_step_complete',
                stepKey: stepId,
                menuId: menuId,
                accessLink: accessLink,
            });

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
        title: apiStepsMap.get('lc-welcome')?.title || '🎓 Welcome to Learning Catalog!',
        text: apiStepsMap.get('lc-welcome')?.description || 'This is your Learning Catalog dashboard where you can discover, enroll, and manage courses to advance your skills and career. Let\'s take a quick tour to explore all features.',
        attachTo: {
            element: '#lc-header',
            on: 'bottom'
        },
        when: {
            show: () => {
                // Log tour step view
                logUserJourney({
                    eventType: 'tour_step_view',
                    stepKey: 'lc-welcome',
                    menuId: menuId,
                    accessLink: accessLink,
                });
            }
        },
        buttons: [
            {
                text: 'Skip Tour',
                action: () => {
                    // Log tour skipped
                    logUserJourney({
                        eventType: 'tour_skipped',
                        stepKey: 'lc-welcome',
                        menuId: menuId,
                        accessLink: accessLink,
                    });
                    sessionStorage.setItem('learningCatalogTourCompleted', 'true');
                    tour.cancel();
                },
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Start Tour',
                action: createNextAction('lc-welcome')
            }
        ]
    });
    currentStepIndex++;

    // Step 2: Header Section
    steps.push({
        id: 'lc-header-section',
        title: apiStepsMap.get('lc-header-section')?.title || '📍 Main Header',
        text: apiStepsMap.get('lc-header-section')?.description || 'This header shows your Learning Catalog title and description. Use this as your navigation reference when browsing courses.',
        attachTo: {
            element: '#lc-header',
            on: 'bottom'
        },
        when: {
            show: () => {
                // Log tour step view
                logUserJourney({
                    eventType: 'tour_step_view',
                    stepKey: 'lc-header-section',
                    menuId: menuId,
                    accessLink: accessLink,
                });
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
                action: createNextAction('lc-header-section')
            }
        ]
    });
    currentStepIndex++;

    // Step 3: Admin Actions (External Course, AI, Create Course)
    if (canShowAdminActions(sessionData)) {
        steps.push({
            id: 'lc-admin-actions',
            title: apiStepsMap.get('lc-admin-actions')?.title || '⚡ Admin Actions',
            text: apiStepsMap.get('lc-admin-actions')?.description || 'As an admin, you have special actions available:\n\n• **External Course**: Browse and add courses from Udemy\n• **Build with AI**: Generate new courses using AI\n• **Create Course**: Manually create a new course',
            attachTo: {
                element: '#lc-admin-actions',
                on: 'bottom'
            },
            when: {
                show: () => {
                    // Log tour step view
                    logUserJourney({
                        eventType: 'tour_step_view',
                        stepKey: 'lc-admin-actions',
                        menuId: menuId,
                        accessLink: accessLink,
                    });
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
                    action: createNextAction('lc-admin-actions')
                }
            ]
        });
        currentStepIndex++;
    }

    // Step 5: Filter Sidebar
    // steps.push({
    //     id: 'lc-filter-sidebar',
    //     title: apiStepsMap.get('lc-filter-sidebar')?.title || '🎯 Filter Sidebar',
    //     text: apiStepsMap.get('lc-filter-sidebar')?.description || 'Use these filters to find courses that match your needs:\n\n• **Subject Types**: Filter by type (video, document, etc.)\n• **Categories**: Filter by course category\n• **Clear All**: Reset all filters at once',
    //     attachTo: {
    //         element: '#lc-filter-sidebar',
    //         on: 'right'
    //     },
    //     when: {
    //         show: () => {
    //             // Log tour step view
    //             logUserJourney({
    //                 eventType: 'tour_step_view',
    //                 stepKey: 'lc-filter-sidebar',
    //                 menuId: menuId,
    //                 accessLink: accessLink,
    //             });
    //         }
    //     },
    //     beforeShowPromise: () => {
    //         return new Promise(resolve => {
    //             // Ensure filter sidebar is visible
    //             const filterToggle = document.querySelector('#lc-filters-toggle') as HTMLElement;
    //             if (filterToggle) {
    //                 filterToggle.click();
    //             }
    //             setTimeout(resolve, 300);
    //         });
    //     },
    //     buttons: [
    //         {
    //             text: 'Back',
    //             action: createBackAction(),
    //             classes: 'shepherd-button-secondary'
    //         },
    //         {
    //             text: 'Next',
    //             action: createNextAction('lc-filter-sidebar')
    //         }
    //     ]
    // });
    // currentStepIndex++;

    // Step 6: Search Toolbar - Search Bar Only
    steps.push({
        id: 'lc-search-toolbar',
        title: apiStepsMap.get('lc-search-toolbar')?.title || '🔎 Search Bar',
        text: apiStepsMap.get('lc-search-toolbar')?.description || 'Use the search bar to find courses by title, description, category, or short name. Type keywords and press enter to search.',
        attachTo: {
            element: '#lc-search-box',
            on: 'bottom'
        },
        when: {
            show: () => {
                // Log tour step view
                logUserJourney({
                    eventType: 'tour_step_view',
                    stepKey: 'lc-search-toolbar',
                    menuId: menuId,
                    accessLink: accessLink,
                });
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
                action: createNextAction('lc-search-toolbar')
            }
        ]
    });
    currentStepIndex++;

    // Step 7: First Course Card
    steps.push({
        id: 'lc-course-card-0',
        title: apiStepsMap.get('lc-course-card-0')?.title || '📖 First Course Card',
        text: apiStepsMap.get('lc-course-card-0')?.description || 'This is the first course card. Each card shows the course thumbnail, title, category, duration, rating, and actions.',
        attachTo: {
            element: '#lc-course-card-0',
            on: 'top'
        },
        when: {
            show: () => {
                // Log tour step view
                logUserJourney({
                    eventType: 'tour_step_view',
                    stepKey: 'lc-course-card-0',
                    menuId: menuId,
                    accessLink: accessLink,
                });
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
                action: createNextAction('lc-course-card-0')
            }
        ]
    });
    currentStepIndex++;

    // Step 8: Enroll Button
    steps.push({
        id: 'lc-enroll-btn-0',
        title: apiStepsMap.get('lc-enroll-btn-0')?.title || '🎯 Enroll Button',
        text: apiStepsMap.get('lc-enroll-btn-0')?.description || 'Click the **Enroll** button to enroll in a course. Once enrolled, you can access all course materials and track your progress.',
        attachTo: {
            element: '#lc-enroll-btn-0',
            on: 'top'
        },
        when: {
            show: () => {
                // Log tour step view
                logUserJourney({
                    eventType: 'tour_step_view',
                    stepKey: 'lc-enroll-btn-0',
                    menuId: menuId,
                    accessLink: accessLink,
                });
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
                action: createNextAction('lc-enroll-btn-0')
            }
        ]
    });
    currentStepIndex++;

    // Step 11: External Course Dialog (if applicable)
    if (canShowAdminActions(sessionData)) {
        steps.push({
            id: 'lc-external-course',
            title: apiStepsMap.get('lc-external-course')?.title || '🌐 External Course Integration',
            text: apiStepsMap.get('lc-external-course')?.description || 'Browse courses from external platforms like Udemy directly from your dashboard. Add them to your catalog for unified learning.',
            attachTo: {
                element: '#lc-admin-actions',
                on: 'bottom'
            },
            when: {
                show: () => {
                    // Log tour step view
                    logUserJourney({
                        eventType: 'tour_step_view',
                        stepKey: 'lc-external-course',
                        menuId: menuId,
                        accessLink: accessLink,
                    });
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
                    action: createNextAction('lc-external-course')
                }
            ]
        });
        currentStepIndex++;
    }

    // Step 12: AI Course Builder
    if (canShowAdminActions(sessionData)) {
        steps.push({
            id: 'lc-ai-builder',
            title: apiStepsMap.get('lc-ai-builder')?.title || '🤖 AI Course Builder',
            text: apiStepsMap.get('lc-ai-builder')?.description || 'Use AI to generate customized courses based on your requirements. Simply provide a topic, and AI will create a structured course for you.',
            attachTo: {
                element: '#lc-admin-actions',
                on: 'bottom'
            },
            when: {
                show: () => {
                    // Log tour step view
                    logUserJourney({
                        eventType: 'tour_step_view',
                        stepKey: 'lc-ai-builder',
                        menuId: menuId,
                        accessLink: accessLink,
                    });
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
                    action: createNextAction('lc-ai-builder')
                }
            ]
        });
        currentStepIndex++;
    }

    // Step 13: Create Course Form
    if (canShowAdminActions(sessionData)) {
        steps.push({
            id: 'lc-create-course',
            title: apiStepsMap.get('lc-create-course')?.title || '✏️ Create Course Manually',
            text: apiStepsMap.get('lc-create-course')?.description || 'Create courses manually with full control over content:\n\n• **Course Details**: Set title, description, and thumbnail\n• **Subject Mapping**: Link to subjects and standards\n• **Settings**: Configure difficulty, status, and more',
            attachTo: {
                element: '#lc-admin-actions',
                on: 'bottom'
            },
            when: {
                show: () => {
                    // Log tour step view
                    logUserJourney({
                        eventType: 'tour_step_view',
                        stepKey: 'lc-create-course',
                        menuId: menuId,
                        accessLink: accessLink,
                    });
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
                    action: createNextAction('lc-create-course')
                }
            ]
        });
        currentStepIndex++;
    }

    // Step 14: Tour Complete
    steps.push({
        id: 'lc-tour-complete',
        title: apiStepsMap.get('lc-tour-complete')?.title || '🎉 Tour Complete!',
        text: apiStepsMap.get('lc-tour-complete')?.description || 'Congratulations! You now know how to use the Learning Catalog. Start exploring courses and enhance your skills today!',
        attachTo: {
            element: '#lc-header',
            on: 'bottom'
        },
        when: {
            show: () => {
                // Log tour step view
                logUserJourney({
                    eventType: 'tour_step_view',
                    stepKey: 'lc-tour-complete',
                    menuId: menuId,
                    accessLink: accessLink,
                });
            }
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
                    // Log tour complete
                    logUserJourney({
                        eventType: 'tour_step_complete',
                        stepKey: 'lc-tour-complete',
                        menuId: menuId,
                        accessLink: accessLink,
                    });
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
