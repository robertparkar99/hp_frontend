import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export interface InterviewDashboardTourStep {
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
    pageUrl?: string;
}

// Map step IDs to tab keys for automatic tab switching
export const tourStepToTabMap: { [key: string]: string } = {
    'tour-welcome': 'dashboard',
    'tour-dashboard-tab': 'dashboard',
    'tour-stats-cards': 'dashboard',
    'tour-upcoming-interviews': 'dashboard',
    'tour-candidate-pipeline': 'dashboard',
    'tour-schedule-tab': 'schedule',
    'tour-position-select': 'schedule',
    'tour-candidate-select': 'schedule',
    'tour-date-picker': 'schedule',
    'tour-time-picker': 'schedule',
    'tour-duration-picker': 'schedule',
    'tour-location-input': 'schedule',
    'tour-notes-input': 'schedule',
    'tour-interview-panel': 'schedule',
    'tour-schedule-button': 'schedule',
    'tour-candidates-tab': 'candidates',
    'tour-candidates-search': 'candidates',
    'tour-candidates-filters': 'candidates',
    'tour-candidates-table': 'candidates',
    'tour-candidates-export': 'candidates',
    'tour-interview-panel-tab': 'interview-panel',
    'tour-create-panel-button': 'interview-panel',
    'tour-panel-search': 'interview-panel',
    'tour-panel-filter': 'interview-panel',
    'tour-panel-cards': 'interview-panel',
    'tour-panel-actions': 'interview-panel',
};

// Helper function to wait for element to be available
const waitForElement = (selector: string, maxAttempts: number = 20): Promise<Element | null> => {
    return new Promise((resolve) => {
        let attempts = 0;
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element || attempts >= maxAttempts) {
                resolve(element);
            } else {
                attempts++;
                setTimeout(checkElement, 100);
            }
        };
        checkElement();
    });
};

// Helper function to wait for content in a container
const waitForContent = (containerId: string, maxAttempts: number = 30): Promise<Element | null> => {
    return new Promise((resolve) => {
        let attempts = 0;
        const checkContent = async () => {
            const container = document.querySelector(containerId);
            
            // Check if container exists and has content
            if (container) {
                // For data table, check if rows exist
                const dataTable = container.querySelector('.react-data-table, .rdt_Table');
                if (dataTable) {
                    const rows = dataTable.querySelectorAll('.rdt_TableRow, tr[data-row-id]');
                    if (rows.length > 0) {
                        resolve(container);
                        return;
                    }
                }
                
                // For cards, check if cards exist
                const cards = container.querySelectorAll('[class*="card"], [class*="Card"]');
                if (cards.length > 0) {
                    resolve(container);
                    return;
                }
                
                // For form elements, check if inputs exist
                const inputs = container.querySelectorAll('input, select, textarea');
                if (inputs.length > 0) {
                    resolve(container);
                    return;
                }
                
                // For stats cards, check if cards exist
                const statCards = container.querySelectorAll('.widget-card, [class*="stat"]');
                if (statCards.length > 0) {
                    resolve(container);
                    return;
                }
            }
            
            if (attempts >= maxAttempts) {
                // Even if not fully loaded, resolve with container if it exists
                resolve(container);
            } else {
                attempts++;
                setTimeout(checkContent, 100);
            }
        };
        checkContent();
    });
};

export const createInterviewDashboardTourSteps = (): InterviewDashboardTourStep[] => {
    return [
        // ===== DASHBOARD SECTION =====
        {
            id: 'tour-welcome',
            title: 'Welcome to Interview Management!',
            text: 'Let\'s take a quick tour to help you navigate through all the features of the Interview Management Dashboard. This system helps you manage your entire hiring process.',
            attachTo: {
                element: '#tour-header',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-dashboard-tab',
            title: '📊 Dashboard Tab',
            text: 'This is your main Dashboard tab. It provides an overview of all interview activities including statistics, upcoming interviews, and the candidate pipeline.',
            attachTo: {
                element: '#tour-tab-dashboard',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-stats-cards',
            title: '📈 Statistics Overview',
            text: 'These cards show key metrics: Interviews Today, Active Candidates, Pending Feedback, and Completed Interviews. Click any card to filter the view.',
            attachTo: {
                element: '#tour-stats-cards',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-stats-cards', 15);
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-upcoming-interviews',
            title: '📅 Upcoming Interviews',
            text: 'This section displays all scheduled upcoming interviews. You can view details, reschedule, or cancel interviews from here. Click "Reschedule" to modify an existing interview.',
            attachTo: {
                element: '#tour-upcoming-interviews',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-upcoming-interviews', 15);
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-candidate-pipeline',
            title: '👥 Candidate Pipeline',
            text: 'Track candidates through different stages of the hiring process (Applied → Screening → Interview → Offer → Hired). View conversion rates and average time to hire metrics.',
            attachTo: {
                element: '#tour-candidate-pipeline',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-candidate-pipeline', 15);
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },

        // ===== SCHEDULE INTERVIEW SECTION =====
        {
            id: 'tour-schedule-tab',
            title: '📝 Schedule Interview Tab',
            text: 'Click here to schedule new interviews. You can select candidates, choose panel members, set date/time, and send invitations to all participants.',
            attachTo: {
                element: '#tour-tab-schedule',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-position-select',
            title: '🎯 Position Selection',
            text: 'Select the position you\'re hiring for from the dropdown. Only candidates who applied for this position will be available for selection.',
            attachTo: {
                element: '#tour-position-select',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                // Wait for schedule form to be available
                await waitForElement('#tour-schedule-form', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
                // Wait for the select element specifically
                await waitForElement('#tour-position-select', 15);
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-candidate-select',
            title: '👤 Candidate Selection',
            text: 'Select the candidate you want to interview. Candidates are filtered by the position you selected above. Click on a candidate to select them.',
            attachTo: {
                element: '#tour-candidate-select',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-candidate-select', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-date-picker',
            title: '📅 Date Selection',
            text: 'Click here to select the interview date using the date picker. Choose a date that works for all participants.',
            attachTo: {
                element: '#tour-date-picker',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-date-picker', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-time-picker',
            title: '⏰ Time Selection',
            text: 'Select the interview time from the dropdown options. Available slots are 09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM, and 04:00 PM.',
            attachTo: {
                element: '#tour-time-picker',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-time-picker', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-duration-picker',
            title: '⏱️ Duration Selection',
            text: 'Choose how long the interview will last. Options are 30 minutes, 45 minutes, 60 minutes (1 hour), or 90 minutes (1.5 hours).',
            attachTo: {
                element: '#tour-duration-picker',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-duration-picker', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-location-input',
            title: '📍 Location Input',
            text: 'Enter the interview location. This can be a physical location (e.g., "Conference Room A") or a video call link (e.g., Zoom or Teams meeting link).',
            attachTo: {
                element: '#tour-location-input',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-location-input', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-notes-input',
            title: '📝 Additional Notes',
            text: 'Add any special instructions or requirements for the interview. This helps candidates and panel members prepare better.',
            attachTo: {
                element: '#tour-notes-input',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-notes-input', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-interview-panel',
            title: '👥 Interview Panel Selection',
            text: 'Select an interview panel for this interview. Panels are groups of interviewers with specific expertise. Available panels are highlighted in green. Click to select.',
            attachTo: {
                element: '#tour-interview-panel',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-interview-panel', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-schedule-button',
            title: '✅ Schedule Interview Button',
            text: 'Click this button to confirm and schedule the interview. All required fields must be filled. A confirmation will be sent to the candidate and panel members.',
            attachTo: {
                element: '#tour-schedule-button',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-schedule-button', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },

        // ===== CANDIDATES SECTION =====
        {
            id: 'tour-candidates-tab',
            title: '👥 Candidates Tab',
            text: 'View and manage all candidates who have applied for positions. Track their status, stage, scores, and take actions like scheduling interviews or providing feedback.',
            attachTo: {
                element: '#tour-tab-candidates',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-candidates-search',
            title: '🔍 Search Candidates',
            text: 'Search candidates by name, position, status, stage, applied date, or next interview date. Start typing to filter the results instantly.',
            attachTo: {
                element: '#tour-candidates-search',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-candidates-search', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-candidates-filters',
            title: '🎛️ Advanced Filters',
            text: 'Use advanced filters to narrow down candidates by specific criteria. Filter by stage, date range, and more.',
            attachTo: {
                element: '#tour-candidates-filters',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-candidates-filters', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-candidates-table',
            title: '📊 Candidates DataTable',
            text: 'This table shows all candidates with columns for Name, Position, Status, Stage, Applied Date, Next Interview, and Score. Click column headers to sort. Use input fields in headers to filter by column.',
            attachTo: {
                element: '#tour-candidates-table',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForContent('#tour-candidates-table', 25);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-candidates-export',
            title: '📤 Export Options',
            text: 'Export candidate data in various formats: Print for physical copies, Excel for spreadsheets, or PDF for documents. Choose the format that best fits your needs.',
            attachTo: {
                element: '#tour-candidates-export',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-candidates-export', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },

        // ===== INTERVIEW PANEL SECTION =====
        {
            id: 'tour-interview-panel-tab',
            title: '👥 Interview Panel Tab',
            text: 'Manage interview panels - groups of interviewers who evaluate candidates. Create panels with specific expertise, assign members, and track their availability.',
            attachTo: {
                element: '#tour-tab-interview-panel',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-create-panel-button',
            title: '➕ Create Panel Button',
            text: 'Click here to create a new interview panel. You\'ll be able to define panel name, select target positions, add description, and assign team members.',
            attachTo: {
                element: '#tour-create-panel-button',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-create-panel-button', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-panel-search',
            title: '🔍 Search Panels',
            text: 'Search through existing panels by name or description. Quickly find the panel you need for a specific hiring process.',
            attachTo: {
                element: '#tour-panel-search',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-panel-search', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-panel-filter',
            title: '🎛️ Status Filter',
            text: 'Filter panels by status: All Panels, Active, or Inactive. Only active panels are available for scheduling interviews.',
            attachTo: {
                element: '#tour-panel-filter',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await waitForElement('#tour-panel-filter', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-panel-cards',
            title: '📋 Panel Cards',
            text: 'Each card represents an interview panel showing: Panel name, Status (Active/Inactive), Member count, Description, Upcoming/Total interviews, and Target positions.',
            attachTo: {
                element: '#tour-panel-cards',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await waitForContent('#tour-panel-cards', 25);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.next();
                    }
                }
            ]
        },
        {
            id: 'tour-panel-actions',
            title: '⚡ Panel Actions',
            text: 'Edit panel details (pencil icon) or delete a panel (trash icon). Use "View Details" to see complete panel information.',
            attachTo: {
                element: '.tour-panel-actions',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await waitForElement('.tour-panel-actions', 20);
                await new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Finish Tour',
                    action: () => {
                        const tour = (window as any).interviewDashboardTour;
                        if (tour) tour.complete();
                    }
                }
            ]
        }
    ];
};

export class InterviewDashboardTour {
    private tour: Shepherd.Tour | null = null;

    constructor() {
        this.initTour();
    }

    private initTour(): void {
        if (typeof window === 'undefined') return;

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

        const steps = createInterviewDashboardTourSteps();
        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('cancel', () => {
            this.setTourCompleted();
        });

        this.tour.on('complete', () => {
            this.setTourCompleted();
        });
    }

    private setTourCompleted(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('interviewDashboardTourCompleted', 'true');
        }
    }

    public startTour(): void {
        // Check if tour was already completed
        if (typeof window !== 'undefined' && sessionStorage.getItem('interviewDashboardTourCompleted') === 'true') {
            console.log('Interview Dashboard tour already completed, skipping...');
            return;
        }

        // Make tour instance available globally
        (window as any).interviewDashboardTour = this.tour;

        // Wait for DOM to be ready
        setTimeout(() => {
            this.tour?.start();
        }, 500);
    }

    public isCompleted(): boolean {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem('interviewDashboardTourCompleted') === 'true';
    }

    public restartTour(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('interviewDashboardTourCompleted');
        }
        this.startTour();
    }
}

// Export singleton instance
export const interviewDashboardTour = new InterviewDashboardTour();
