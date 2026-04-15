import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';

// Interface for API tour step data
interface CandidatePortalTourStepData {
    on_click: string;
    title: string;
    description: string;
}

// Helper function to get user data from localStorage
const getUserData = (): { url: string; token: string; subInstituteId: string } | null => {
    if (typeof window === 'undefined') return null;
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
            return {
                url: APP_URL,
                token,
                subInstituteId: String(sub_institute_id)
            };
        }
    } catch (e) {
        console.error('[CandidatePortalTour] Error getting userData:', e);
    }
    return null;
};

// Fetch tour steps from API for Candidate Portal page (menu_id=168)
export const fetchCandidatePortalTourStepsFromAPI = async (): Promise<CandidatePortalTourStepData[]> => {
    const userData = getUserData();
    if (!userData) {
        console.log('[CandidatePortalTour] No userData available');
        return [];
    }

    try {
        // Using menu_id=168 for Candidate Portal page
        const apiUrl = `${userData.url}/table_data?table=Onboarding_tour_details&filters[menu_id]=168&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
        console.log('[CandidatePortalTour] Fetching tour steps from API:', apiUrl);

        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[CandidatePortalTour] Raw API response:', json);

        // Handle different response formats
        let tourData: CandidatePortalTourStepData[] = [];

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
                    console.log(`[CandidatePortalTour] Found array data in response.${key}`);
                    break;
                }
            }
        }

        // Normalize field names
        const normalizedTourData = tourData.map((step: any) => ({
            on_click: step.on_click || step.onClick || step.step_key || step.stepKey || step.id,
            title: step.title || step.Title || step.name || step.step_title || step.stepTitle || '',
            description: step.description || step.Description || step.text || step.Text || step.content || step.step_description || ''
        }));

        console.log('[CandidatePortalTour] Parsed tour data:', normalizedTourData);
        return normalizedTourData;
    } catch (error) {
        console.error('[CandidatePortalTour] Error fetching tour steps:', error);
        return [];
    }
};

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

// API steps map - populated at runtime when tour starts
let apiStepsMap: Map<string, CandidatePortalTourStepData> = new Map();

// ==================== JOURNEY LOGGING HELPERS ====================

// Log tour started event
const logTourStarted = (tourName: string): void => {
    const { menuId, accessLink } = getPageInfo();
    console.log(`[CandidatePortalTour] Logging tour started: ${tourName}, menuId: ${menuId}`);
    logUserJourney({
        eventType: 'tour_started',
        stepKey: `${tourName}_started`,
        menuId: menuId,
        accessLink: accessLink || `/Telent-management/JobPortal`,
    }).catch(console.error);
};

// Log tour step view event
const logTourStepView = (stepId: string): void => {
    const { menuId, accessLink } = getPageInfo();
    logUserJourney({
        eventType: 'tour_step_view',
        stepKey: stepId,
        menuId: menuId,
        accessLink: accessLink || `/Telent-management/JobPortal`,
    }).catch(console.error);
};

// Log tour step complete event
const logTourStepComplete = (stepId: string): void => {
    const { menuId, accessLink } = getPageInfo();
    logUserJourney({
        eventType: 'tour_step_complete',
        stepKey: stepId,
        menuId: menuId,
        accessLink: accessLink || `/Telent-management/JobPortal`,
    }).catch(console.error);
};

// Log tour skipped event
const logTourSkipped = (tourName: string, lastStepId?: string): void => {
    const { menuId, accessLink } = getPageInfo();
    console.log(`[CandidatePortalTour] Logging tour skipped: ${tourName}, menuId: ${menuId}`);
    logUserJourney({
        eventType: 'tour_skipped',
        stepKey: lastStepId || `${tourName}_skipped`,
        menuId: menuId,
        accessLink: accessLink || `/Telent-management/JobPortal`,
    }).catch(console.error);
};

// Log tour complete event
const logTourComplete = (tourName: string): void => {
    const { menuId, accessLink } = getPageInfo();
    console.log(`[CandidatePortalTour] Logging tour completed: ${tourName}, menuId: ${menuId}`);
    logUserJourney({
        eventType: 'tour_complete',
        stepKey: `${tourName}_completed`,
        menuId: menuId,
        accessLink: accessLink || `/Telent-management/JobPortal`,
    }).catch(console.error);
};

export const setTourOpenApplyDialog = (fn: () => void) => {
    tourOpenApplyDialog = fn;
};

export const setTourMode = (mode: boolean) => {
    isTourMode = mode;
};

export const getTourMode = () => isTourMode;

// Helper function to wait for element to be available
const waitForElement = (selector: string, maxAttempts: number = 20): Promise<void> => {
    return new Promise((resolve) => {
        let attempts = 0;
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element || attempts >= maxAttempts) {
                resolve();
            } else {
                attempts++;
                setTimeout(checkElement, 100);
            }
        };
        checkElement();
    });
};

// Force show a specific step
export const forceShowStep = (stepId: string) => {
    if (CandidatePortalTourSteps.tour) {
        CandidatePortalTourSteps.tour.show(stepId);
    }
};



// Tour class to manage the CandidatePortal tour
export class CandidatePortalTourSteps {
    public static tour: Shepherd.Tour | null = null;

    // Initialize and start the tour - fetches API data first
    public static async startTour(): Promise<void> {
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

        // Fetch tour steps from API first
        const apiStepsFromAPI = await fetchCandidatePortalTourStepsFromAPI();
        console.log('[CandidatePortalTour] API steps fetched:', apiStepsFromAPI);

        // Create API steps map for easy lookup (module-level)
        apiStepsMap = new Map();
        apiStepsFromAPI.forEach((step: CandidatePortalTourStepData) => {
            apiStepsMap.set(step.on_click, step);
        });

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

        // Add steps to tour - dynamically update welcome step with API data
        candidatePortalTourSteps.forEach(step => {
            // Override title and text with API data if available
            const apiStep = apiStepsMap.get(step.id);
            if (apiStep) {
                this.tour!.addStep({
                    ...step,
                    title: apiStep.title || step.title,
                    text: apiStep.description || step.text
                });
            } else {
                this.tour!.addStep(step);
            }
        });

        // Add journey logging: log step view when shown
        this.tour.on('show', (e: any) => {
            const step = e.step;
            if (step?.id) {
                logTourStepView(step.id);
            }
        });

        // Handle tour events
        this.tour.on('cancel', () => {
            console.log('CandidatePortal tour cancelled');
            logTourSkipped('candidate_portal');
            sessionStorage.setItem('candidatePortalTourCompleted', 'true');
            isTourMode = false;
            this.tour = null;
        });

        this.tour.on('complete', () => {
            console.log('CandidatePortal tour completed');
            logTourComplete('candidate_portal');
            sessionStorage.setItem('candidatePortalTourCompleted', 'true');
            isTourMode = false;
            this.tour = null;
        });

        // Log tour started when tour is about to start
        const originalStart = this.tour.start.bind(this.tour);
        this.tour.start = function () {
            logTourStarted('candidate_portal');
            return originalStart();
        };

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


// Tour steps for CandidatePortal - Simplified version focusing on key elements
// Note: API data will override these values at runtime in startTour()
export const candidatePortalTourSteps: CandidatePortalTourStep[] = [
    {
        id: 'tour-welcome',
        title: apiStepsMap.get('tour-welcome')?.title || '🎯 Welcome to Job Portal!',
        text: apiStepsMap.get('tour-welcome')?.description || 'Welcome to the Job Portal! This guided tour will help you discover and apply for exciting career opportunities. Let\'s get started!',
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
        title: apiStepsMap.get('tour-header')?.title || '📋 Page Header',
        text: apiStepsMap.get('tour-header')?.description || 'This is the Job Portal header where you can find the main heading and description for the job search section.',
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
        title: apiStepsMap.get('tour-search')?.title || '🔍 Job Search',
        text: apiStepsMap.get('tour-search')?.description || 'Use this search bar to find jobs by title, skills, department, or keywords. Enter your search criteria and click "Search Jobs".',
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
        title: apiStepsMap.get('tour-job-card')?.title || '💼 Job Cards',
        text: apiStepsMap.get('tour-job-card')?.description || 'Each job card shows a complete job opportunity. Click on a card to see full details. Here you can see the job title, company, location, and salary.',
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
        title: apiStepsMap.get('tour-job-title')?.title || '📝 Job Title',
        text: apiStepsMap.get('tour-job-title')?.description || 'This is the job title indicating the position you would be applying for. Make sure to read it carefully to understand the role.',
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
        title: apiStepsMap.get('tour-job-badges')?.title || '🏷️ Job Badges',
        text: apiStepsMap.get('tour-job-badges')?.description || 'These badges show the employment type (Full-time, Contract, Part-time, Internship) and current status of the job posting.',
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
        title: apiStepsMap.get('tour-company-location')?.title || '🏢 Company & Location',
        text: apiStepsMap.get('tour-company-location')?.description || 'Here you can see the company name and the job location. Click to apply and get more details about the workplace.',
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
        title: apiStepsMap.get('tour-salary')?.title || '💰 Salary Range',
        text: apiStepsMap.get('tour-salary')?.description || 'This shows the expected salary range for the position. Use this to evaluate if the compensation meets your expectations.',
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
        title: apiStepsMap.get('tour-description')?.title || '📋 Job Description',
        text: apiStepsMap.get('tour-description')?.description || 'Read the job description to understand the responsibilities, role requirements, and what the company is looking for in a candidate.',
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
        title: apiStepsMap.get('tour-skills')?.title || '🛠️ Required Skills',
        text: apiStepsMap.get('tour-skills')?.description || 'This section lists the key skills and qualifications required for the position. Make sure your skills match these requirements before applying.',
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
        title: apiStepsMap.get('tour-experience')?.title || '📊 Experience Required',
        text: apiStepsMap.get('tour-experience')?.description || 'This shows the minimum experience level needed for this role. Check if your experience matches the requirements.',
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
        title: apiStepsMap.get('tour-education')?.title || '🎓 Education Requirements',
        text: apiStepsMap.get('tour-education')?.description || 'This displays the minimum educational qualifications required for the position.',
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
        title: apiStepsMap.get('tour-job-info')?.title || 'ℹ️ Job Information',
        text: apiStepsMap.get('tour-job-info')?.description || 'Here you can see when the job was posted, how many positions are available, and the application deadline if any.',
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
        title: apiStepsMap.get('tour-benefits')?.title || '🎁 Benefits & Perks',
        text: apiStepsMap.get('tour-benefits')?.description || 'This section highlights the benefits and perks offered by the company for this position.',
        attachTo: {
            element: '#tour-benefits',
            on: 'top'
        },
        beforeShowPromise: () => waitForElement('#tour-benefits', 25),
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
        title: apiStepsMap.get('tour-department-badge')?.title || '🏢 Department',
        text: apiStepsMap.get('tour-department-badge')?.description || 'This badge shows which department the job belongs to within the organization.',
        attachTo: {
            element: '#tour-department-badge',
            on: 'bottom'
        },
        beforeShowPromise: () => waitForElement('#tour-department-badge', 25),
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
        title: apiStepsMap.get('tour-action-buttons')?.title || '⭐ Quick Actions',
        text: apiStepsMap.get('tour-action-buttons')?.description || 'Use these buttons to save jobs to your favorites or share the job posting with others.',
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
            on: 'bottom'
        },
        beforeShowPromise: () => waitForElement('#tour-learn-more', 25),
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
        title: apiStepsMap.get('tour-apply-button')?.title || '🚀 Apply Now',
        text: apiStepsMap.get('tour-apply-button')?.description || 'Click "Apply Now" to submit your application for this job. This is the final step!',
        attachTo: {
            element: '#tour-apply-button',
            on: 'bottom'
        },
        beforeShowPromise: () => waitForElement('#tour-apply-button', 25),
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
        title: apiStepsMap.get('tour-form-personal')?.title || '👤 Personal Information',
        text: apiStepsMap.get('tour-form-personal')?.description || 'Fill in your personal details: First Name, Last Name, Email, and Mobile. These are required fields marked with *.',
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

export default CandidatePortalTourSteps;
