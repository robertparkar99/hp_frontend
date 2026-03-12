import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Extend Window interface to include tour instances
declare global {
    interface Window {
        recruitmentTour?: Shepherd.Tour;
        recruitmentScreeningTour?: Shepherd.Tour;
        recruitmentShortlistedTour?: Shepherd.Tour;
        recruitmentPendingTour?: Shepherd.Tour;
        recruitmentRejectedTour?: Shepherd.Tour;
        recruitmentHiredTour?: Shepherd.Tour;
        recruitmentApplicationsTour?: Shepherd.Tour;
        recruitmentDialogTour?: Shepherd.Tour;
    }
}

export interface RecruitmentTourStep {
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
    advanceOn?: {
        selector: string;
        event: string;
    };
    beforeShowPromise?: () => Promise<void>;
    when?: {
        show?: () => void;
        hide?: () => void;
    };
}

// Custom CSS for recruitment tour
export const recruitmentTourStyles = `
    .shepherd-theme-recruitment {
        --shepherd-theme-primary: #3080ff;
        --shepherd-theme-secondary: #6c757d;
    }

    .shepherd-theme-recruitment .shepherd-header {
        background: #007BE5;
        color: white;
        border-radius: 4px 4px 0 0;
    }

    .shepherd-theme-recruitment .shepherd-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: white;
    }

    .shepherd-theme-recruitment .shepherd-text {
        font-size: 14px;
        line-height: 1.5;
        color: #171717;
        padding: 16px;
    }

    .shepherd-theme-recruitment .shepherd-button {
        background: #007BE5;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .shepherd-theme-recruitment .shepherd-button:hover {
        background: #0056b3;
        transform: translateY(-1px);
    }

    .shepherd-theme-recruitment .shepherd-button-secondary {
        background: #007BE5 !important;
    }

    .shepherd-theme-recruitment .shepherd-button-secondary:hover {
        background: #0056b3 !important;
    }

    .shepherd-theme-recruitment .shepherd-cancel-icon {
        color: white;
        font-size: 20px;
    }

    .shepherd-has-title .shepherd-content .shepherd-header {
        background: #546ee5;
        padding: 1em;
    }

    .shepherd-theme-recruitment .shepherd-element {
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
    const styleSheet = document.createElement('style');
    styleSheet.textContent = recruitmentTourStyles;
    document.head.appendChild(styleSheet);
}

// Helper function to switch tabs programmatically
const switchToTab = (tabId: string): Promise<void> => {
    return new Promise((resolve) => {
        console.log(`[RecruitmentTour] Attempting to switch to tab: ${tabId}`);
        
        // Helper function to dispatch a proper click event
        const dispatchClick = (element: HTMLElement) => {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            element.dispatchEvent(clickEvent);
        };
        
        // Method 1: Try the #tour-{tabId}-tab selector and click with proper event
        const tourTabTrigger = document.querySelector(`#tour-${tabId}-tab`) as HTMLButtonElement | null;
        
        if (tourTabTrigger) {
            console.log(`[RecruitmentTour] Found tour tab trigger, clicking: ${tabId}`);
            dispatchClick(tourTabTrigger);
            setTimeout(resolve, 500);
            return;
        }
        
        // Method 2: Find any element with the value attribute and click
        const valueElement = document.querySelector(`[value="${tabId}"]`) as HTMLElement | null;
        
        if (valueElement) {
            console.log(`[RecruitmentTour] Found value element, clicking: ${tabId}`);
            dispatchClick(valueElement);
            setTimeout(resolve, 500);
            return;
        }
        
        // Method 3: Find the TabsTrigger by role and value
        const allTriggers = document.querySelectorAll('[role="tab"]');
        
        for (const trigger of allTriggers) {
            const value = trigger.getAttribute('data-value') || trigger.getAttribute('value') || trigger.textContent?.toLowerCase().trim();
            if (value && value.includes(tabId.toLowerCase())) {
                console.log(`[RecruitmentTour] Found tab by role=tab, clicking: ${tabId}`);
                dispatchClick(trigger as HTMLElement);
                setTimeout(resolve, 500);
                return;
            }
        }
        
        // Method 4: Try to find and click all buttons that might be tab triggers
        const allButtons = document.querySelectorAll('button');
        
        for (const button of allButtons) {
            const text = button.textContent?.toLowerCase().trim() || '';
            const dataValue = button.getAttribute('data-value') || '';
            
            if (text.includes(tabId.toLowerCase()) || dataValue === tabId) {
                console.log(`[RecruitmentTour] Found button with text/value, clicking: ${tabId}`);
                dispatchClick(button);
                setTimeout(resolve, 500);
                return;
            }
        }
        
        // Method 5: Try to find TabsTrigger by data-state
        const stateTab = document.querySelector(`[data-state*="${tabId}"]`) as HTMLElement | null;
        
        if (stateTab) {
            console.log(`[RecruitmentTour] Found element by data-state, clicking: ${tabId}`);
            dispatchClick(stateTab);
            setTimeout(resolve, 500);
            return;
        }
        
        console.log(`[RecruitmentTour] Tab trigger not found for: ${tabId}`);
        
        // Debug: Log all tab-like elements found
        const tabElements = document.querySelectorAll('[role="tab"], button[data-value]');
        console.log(`[RecruitmentTour] Found ${tabElements.length} tab elements`);
        tabElements.forEach((tab, i) => {
            const text = tab.textContent?.slice(0, 50) || 'no text';
            const attrs = `text: ${text}, data-value: ${tab.getAttribute('data-value')}, value: ${tab.getAttribute('value')}`;
            console.log(`[RecruitmentTour] Tab ${i}: ${attrs}`);
        });
        
        resolve();
    });
};

// Helper function to open dialog
const openDialog = (dialogId: string): Promise<void> => {
    return new Promise((resolve) => {
        const dialogTrigger = document.querySelector(`#${dialogId}`) as HTMLButtonElement | null;
        
        if (dialogTrigger) {
            console.log(`[RecruitmentTour] Opening dialog: ${dialogId}`);
            dialogTrigger.click();
            setTimeout(resolve, 400); // Wait for dialog to open
        } else {
            console.log(`[RecruitmentTour] Dialog trigger not found: ${dialogId}`);
            resolve();
        }
    });
};

// Helper function to scroll element into view
const scrollToElement = (elementId: string): Promise<void> => {
    return new Promise((resolve) => {
        const element = document.querySelector(elementId) as HTMLElement | null;
        
        if (element) {
            console.log(`[RecruitmentTour] Scrolling to element: ${elementId}`);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(resolve, 500); // Wait for scroll to complete
        } else {
            console.log(`[RecruitmentTour] Element not found: ${elementId}`);
            resolve();
        }
    });
};

// ==================== MAIN RECRUITMENT DASHBOARD TOUR ====================
export const getRecruitmentDashboardTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'recruitment-welcome',
            title: 'Welcome to Recruitment Management!',
            text: 'This dashboard helps you manage your entire recruitment process - from creating job postings to reviewing applications. Let\'s explore the key features together.',
            attachTo: {
                element: '#tour-recruitment-header',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await scrollToElement('#tour-recruitment-header');
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => {
                        sessionStorage.setItem('recruitmentTourCompleted', 'true');
                        if (typeof window !== 'undefined') {
                            window.recruitmentTour?.cancel();
                        }
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => {
                        window.recruitmentTour?.next();
                    }
                }
            ]
        },
        {
            id: 'recruitment-create-job',
            title: '📝 Create New Job',
            text: 'Click this button to create a new job posting. You can define job title, description, requirements, salary range, and more.',
            attachTo: {
                element: '#tour-create-job-button',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('jobs');
                await scrollToElement('#tour-create-job-button');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentTour?.next()
                }
            ]
        },
        {
            id: 'recruitment-tabs',
            title: '📑 Navigation Tabs',
            text: 'Switch between Job Postings, Resume Screening, and Applications tabs to manage different aspects of your recruitment pipeline.',
            attachTo: {
                element: '#tour-recruitment-tabs',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('jobs');
                await scrollToElement('#tour-recruitment-tabs');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentTour?.next()
                }
            ]
        },
        {
            id: 'recruitment-search-filter',
            title: '🔍 Search & Filter',
            text: 'Use search to find specific job postings quickly. Apply filters to narrow down results by status, department, or other criteria.',
            attachTo: {
                element: '#tour-search-filter',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('jobs');
                await scrollToElement('#tour-search-filter');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentTour?.next()
                }
            ]
        },
        {
            id: 'recruitment-job-postings',
            title: '📋 Job Postings List',
            text: 'This section displays all your active job postings. Each card shows the job title, employment type, location, status, and key metrics like open positions and application count.',
            attachTo: {
                element: '#tour-job-postings-list',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('jobs');
                await scrollToElement('#tour-job-postings-list');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentTour?.next()
                }
            ]
        },
        {
            id: 'recruitment-job-actions',
            title: '⚡ Quick Actions',
            text: 'For each job posting, you can View details, Edit the posting, or Delete it. Use these actions to manage your job listings efficiently.',
            attachTo: {
                element: '#tour-job-actions',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await switchToTab('jobs');
                await scrollToElement('#tour-job-actions');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentTour?.next()
                }
            ]
        },
        {
            id: 'recruitment-job-status',
            title: '🏷️ Status & Priority',
            text: 'Each job shows its current status (Active/Draft) and priority level (High/Medium/Low). This helps you focus on urgent hiring needs.',
            attachTo: {
                element: '#tour-job-status',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('jobs');
                await scrollToElement('#tour-job-status');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next - Resume Screening',
                    action: () => window.recruitmentTour?.next()
                }
            ]
        },
        {
            id: 'recruitment-screening-tab',
            title: '📋 Resume Screening Tab',
            text: 'Switch to the Resume Screening tab to review and evaluate candidates who have applied. Use AI-powered screening to find the best candidates quickly.',
            attachTo: {
                element: '#tour-screening-tab',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Continue to Resume Screening',
                    action: () => {
                        // Navigate to screening tab using URL and start screening tour
                        console.log('[RecruitmentTour] Navigating to screening tab via URL');
                        
                        // Navigate to screening tab
                        const currentUrl = window.location.href;
                        const url = new URL(currentUrl);
                        url.searchParams.set('tab', 'screening');
                        url.searchParams.set('startScreeningTour', 'true');
                        
                        window.history.pushState({}, '', url.toString());
                        
                        // Reload the page to apply the tab change and start the screening tour
                        window.location.reload();
                    }
                }
            ]
        },
        {
            id: 'recruitment-applications-tab',
            title: '📋 Applications Tab',
            text: 'Switch to the Applications tab to view all job applications. Track candidate applications, view their profiles, and manage the hiring process.',
            attachTo: {
                element: '#tour-applications-tab',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Continue to Applications',
                    action: () => {
                        // Navigate to applications tab using URL and start applications tour
                        console.log('[RecruitmentTour] Navigating to applications tab via URL');
                        
                        // Mark main tour as completed
                        sessionStorage.setItem('recruitmentTourCompleted', 'true');
                        
                        // Navigate to applications tab
                        const currentUrl = window.location.href;
                        const url = new URL(currentUrl);
                        url.searchParams.set('tab', 'applications');
                        url.searchParams.set('startApplicationsTour', 'true');
                        
                        window.history.pushState({}, '', url.toString());
                        
                        // Reload the page to apply the tab change and start the tour
                        window.location.reload();
                    }
                }
            ]
        },
        {
            id: 'recruitment-complete',
            title: '🎉 Dashboard Tour Complete!',
            text: 'Congratulations! You now know the basics of the Recruitment Dashboard. Explore all three tabs to manage your entire recruitment process.',
            attachTo: {
                element: '#tour-recruitment-header',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('jobs');
                await scrollToElement('#tour-recruitment-header');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Finish',
                    action: () => {
                        sessionStorage.setItem('recruitmentTourCompleted', 'true');
                        window.recruitmentTour?.complete();
                    }
                }
            ]
        }
    ];
};

// ==================== CANDIDATE SCREENING TOUR - ALL TAB ====================
export const getScreeningAllTabTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'screening-all-welcome',
            title: '👥 Candidate Overview - All Candidates',
            text: 'Welcome to the Candidate Screening section! This tab shows all candidates who have applied across your job postings.',
            attachTo: {
                element: '#tour-candidate-overview',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-candidate-overview');
            },
            buttons: [
                {
                    text: 'Skip',
                    action: () => {
                        sessionStorage.setItem('screeningAllTabTourCompleted', 'true');
                        window.recruitmentScreeningTour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => window.recruitmentScreeningTour?.next()
                }
            ]
        },
        {
            id: 'screening-all-stats',
            title: '📊 Statistics Overview',
            text: 'Quick stats showing total candidates, shortlisted, pending, rejected, and hired counts. The average AI screening score helps you gauge overall candidate quality.',
            attachTo: {
                element: '#tour-screening-stats',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-screening-stats');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentScreeningTour?.next()
                }
            ]
        },
        {
            id: 'screening-all-search',
            title: '🔍 Search & Filter Candidates',
            text: 'Search candidates by name, skills, or position. Use the filter dropdown to filter by candidate status.',
            attachTo: {
                element: '#tour-screening-search',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-screening-search');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentScreeningTour?.next()
                }
            ]
        },
        {
            id: 'screening-all-tabs',
            title: '📑 Status Filter Tabs',
            text: 'Filter candidates by their application status: All, Shortlisted, Pending, Rejected, or Hired. Each tab shows the count of candidates in that category.',
            attachTo: {
                element: '#tour-screening-tabs',
                on: 'bottom'
            },
            advanceOn: {
                selector: '#tour-screening-tabs',
                event: 'click'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-screening-tabs');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentScreeningTour?.next()
                }
            ]
        },
        {
            id: 'screening-all-candidate-list',
            title: '👤 Candidate Cards',
            text: 'Each candidate card shows their name, applied position, experience, education, location, and current status. Click "View Profile" to see full details.',
            attachTo: {
                element: '#tour-candidate-list',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-candidate-list');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentScreeningTour?.next()
                }
            ]
        },
        {
            id: 'screening-all-score',
            title: '⭐ AI Screening Score',
            text: 'Each candidate shows their AI screening score (0-100%). Higher scores indicate better matches with job requirements.',
            attachTo: {
                element: '#tour-candidate-score',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-candidate-score');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentScreeningTour?.next()
                }
            ]
        },
        {
            id: 'screening-all-status',
            title: '📋 Application Status',
            text: 'Track candidate status: Pending (needs review), Shortlisted (selected for next round), Rejected (not selected), or Hired (offer accepted).',
            attachTo: {
                element: '#tour-candidate-status-badge',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-candidate-status-badge');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentScreeningTour?.next()
                }
            ]
        },
        {
            id: 'screening-all-actions',
            title: '⚡ Candidate Actions',
            text: 'For each candidate, you can: View Profile (see full details), View/Download Resume, Reject, or Shortlist. Take action based on your evaluation.',
            attachTo: {
                element: '#tour-candidate-actions',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-candidate-actions');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next - View Profile',
                    action: () => {
                        // Mark screening tour as completed and hide it
                        sessionStorage.setItem('screeningAllTabTourCompleted', 'true');
                        window.recruitmentScreeningTour?.hide();
                        
                        // Open a candidate profile to show dialog tour
                        const viewButton = document.querySelector('[data-tour-action="view-profile"]') as HTMLButtonElement;
                        if (viewButton) {
                            viewButton.click();
                            // Start dialog tour after dialog opens
                            setTimeout(() => {
                                window.recruitmentDialogTour = createApplicationDialogTour();
                                window.recruitmentDialogTour.start();
                            }, 600);
                        }
                    }
                }
            ]
        },
        {
            id: 'screening-all-complete',
            title: '🎉 Screening Tour Complete!',
            text: 'You now know how to search, filter, and manage all candidates. Let\'s continue to the Applications tab to see all job applications.',
            attachTo: {
                element: '#tour-candidate-overview',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('all');
                await scrollToElement('#tour-candidate-overview');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentScreeningTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Continue to Applications',
                    action: () => {
                        sessionStorage.setItem('screeningAllTabTourCompleted', 'true');
                        
                        // Navigate to applications tab
                        const currentUrl = window.location.href;
                        const url = new URL(currentUrl);
                        url.searchParams.set('tab', 'applications');
                        url.searchParams.set('startApplicationsTour', 'true');
                        
                        window.history.pushState({}, '', url.toString());
                        
                        // Reload the page to apply the tab change and start the applications tour
                        window.location.reload();
                    }
                }
            ]
        }
    ];
};

// ==================== CANDIDATE SCREENING TOUR - SHORTLISTED TAB ====================
export const getScreeningShortlistedTabTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'screening-shortlisted-welcome',
            title: '⭐ Shortlisted Candidates',
            text: 'This tab shows candidates who have been shortlisted for further consideration. These candidates met your initial screening criteria.',
            attachTo: {
                element: '#tour-shortlisted-section',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('shortlisted');
                await scrollToElement('#tour-shortlisted-section');
            },
            buttons: [
                {
                    text: 'Skip',
                    action: () => {
                        sessionStorage.setItem('screeningShortlistedTabTourCompleted', 'true');
                        window.recruitmentShortlistedTour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => window.recruitmentShortlistedTour?.next()
                }
            ]
        },
        {
            id: 'screening-shortlisted-count',
            title: '📊 Shortlisted Count',
            text: 'This badge shows the number of shortlisted candidates. These are candidates ready for interview or further evaluation.',
            attachTo: {
                element: '#tour-shortlisted-count',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('shortlisted');
                await scrollToElement('#tour-shortlisted-count');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentShortlistedTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentShortlistedTour?.next()
                }
            ]
        },
        {
            id: 'screening-shortlisted-match',
            title: '🎯 Match Scores',
            text: 'Review detailed match scores for shortlisted candidates. Look for high skills, experience, and education match percentages.',
            attachTo: {
                element: '#tour-shortlisted-match',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('shortlisted');
                await scrollToElement('#tour-shortlisted-match');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentShortlistedTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentShortlistedTour?.next()
                }
            ]
        },
        {
            id: 'screening-shortlisted-actions',
            title: '👥 Move to Interview',
            text: 'Shortlisted candidates can be moved to the interview stage. Click "View Profile" to see full details before scheduling an interview.',
            attachTo: {
                element: '#tour-shortlisted-actions',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('shortlisted');
                await scrollToElement('#tour-shortlisted-actions');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentShortlistedTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Complete',
                    action: () => {
                        sessionStorage.setItem('screeningShortlistedTabTourCompleted', 'true');
                        window.recruitmentShortlistedTour?.complete();
                    }
                }
            ]
        }
    ];
};

// ==================== CANDIDATE SCREENING TOUR - PENDING TAB ====================
export const getScreeningPendingTabTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'screening-pending-welcome',
            title: '⏳ Pending Review',
            text: 'This tab shows candidates awaiting your review. These candidates have applied but haven\'t been evaluated yet.',
            attachTo: {
                element: '#tour-pending-section',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('pending');
                await scrollToElement('#tour-pending-section');
            },
            buttons: [
                {
                    text: 'Skip',
                    action: () => {
                        sessionStorage.setItem('screeningPendingTabTourCompleted', 'true');
                        window.recruitmentPendingTour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => window.recruitmentPendingTour?.next()
                }
            ]
        },
        {
            id: 'screening-pending-count',
            title: '📊 Pending Count',
            text: 'This badge shows candidates waiting for review. Review these candidates to move them forward in your hiring process.',
            attachTo: {
                element: '#tour-pending-count',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('pending');
                await scrollToElement('#tour-pending-count');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentPendingTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentPendingTour?.next()
                }
            ]
        },
        {
            id: 'screening-pending-review',
            title: '👁️ Review Process',
            text: 'Click "View Profile" to examine each candidate\'s application, resume, and AI screening scores. Then decide to Shortlist or Reject.',
            attachTo: {
                element: '#tour-pending-review',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentPendingTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentPendingTour?.next()
                }
            ]
        },
        {
            id: 'screening-pending-decision',
            title: '✅ Make Your Decision',
            text: 'After reviewing, click "Shortlist" to move candidate forward or "Reject" to decline their application.',
            attachTo: {
                element: '#tour-pending-decision',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await switchToTab('pending');
                await scrollToElement('#tour-pending-decision');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentPendingTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Complete',
                    action: () => {
                        sessionStorage.setItem('screeningPendingTabTourCompleted', 'true');
                        window.recruitmentPendingTour?.complete();
                    }
                }
            ]
        }
    ];
};

// ==================== CANDIDATE SCREENING TOUR - REJECTED TAB ====================
export const getScreeningRejectedTabTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'screening-rejected-welcome',
            title: '❌ Rejected Candidates',
            text: 'This tab shows candidates who have been rejected. You can review them if needed but they won\'t proceed in your hiring pipeline.',
            attachTo: {
                element: '#tour-rejected-section',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('rejected');
                await scrollToElement('#tour-rejected-section');
            },
            buttons: [
                {
                    text: 'Skip',
                    action: () => {
                        sessionStorage.setItem('screeningRejectedTabTourCompleted', 'true');
                        window.recruitmentRejectedTour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => window.recruitmentRejectedTour?.next()
                }
            ]
        },
        {
            id: 'screening-rejected-count',
            title: '📊 Rejected Count',
            text: 'This badge shows the number of rejected candidates. Review this list to ensure rejections were appropriate.',
            attachTo: {
                element: '#tour-rejected-count',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('rejected');
                await scrollToElement('#tour-rejected-count');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentRejectedTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentRejectedTour?.next()
                }
            ]
        },
        {
            id: 'screening-rejected-reason',
            title: '📝 Rejection Reason',
            text: 'When rejecting, it\'s helpful to note the reason. Click "View Profile" to review the candidate\'s details one last time.',
            attachTo: {
                element: '#tour-rejected-reason',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('rejected');
                await scrollToElement('#tour-rejected-reason');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentRejectedTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Complete',
                    action: () => {
                        sessionStorage.setItem('screeningRejectedTabTourCompleted', 'true');
                        window.recruitmentRejectedTour?.complete();
                    }
                }
            ]
        }
    ];
};

// ==================== CANDIDATE SCREENING TOUR - HIRED TAB ====================
export const getScreeningHiredTabTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'screening-hired-welcome',
            title: '🎉 Hired Candidates',
            text: 'This tab shows candidates who have been hired! These are your successful hires who have accepted offers.',
            attachTo: {
                element: '#tour-hired-section',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('hired');
                await scrollToElement('#tour-hired-section');
            },
            buttons: [
                {
                    text: 'Skip',
                    action: () => {
                        sessionStorage.setItem('screeningHiredTabTourCompleted', 'true');
                        window.recruitmentHiredTour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => window.recruitmentHiredTour?.next()
                }
            ]
        },
        {
            id: 'screening-hired-count',
            title: '🎊 Hired Count',
            text: 'This badge shows the number of successful hires. Celebrate your hiring wins!',
            attachTo: {
                element: '#tour-hired-count',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('hired');
                await scrollToElement('#tour-hired-count');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentHiredTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentHiredTour?.next()
                }
            ]
        },
        {
            id: 'screening-hired-details',
            title: '👤 Hired Candidate Details',
            text: 'View details of hired candidates including their position, start date, and other relevant information.',
            attachTo: {
                element: '#tour-hired-details',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('hired');
                await scrollToElement('#tour-hired-details');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentHiredTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Complete',
                    action: () => {
                        sessionStorage.setItem('screeningHiredTabTourCompleted', 'true');
                        window.recruitmentHiredTour?.complete();
                    }
                }
            ]
        }
    ];
};

// ==================== APPLICATIONS TAB TOUR ====================
export const getApplicationsTabTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'applications-welcome',
            title: '📋 Job Applications Overview',
            text: 'Welcome to the Applications tab! This section shows all job applications with their current status in your hiring pipeline.',
            attachTo: {
                element: '#tour-applications-overview',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('applications');
                await scrollToElement('#tour-applications-overview');
            },
            buttons: [
                {
                    text: 'Skip',
                    action: () => {
                        sessionStorage.setItem('applicationsTabTourCompleted', 'true');
                        window.recruitmentApplicationsTour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => window.recruitmentApplicationsTour?.next()
                }
            ]
        },
        // {
        //     id: 'applications-stats',
        //     title: '📊 Application Statistics',
        //     text: 'Quick overview of total applications, active jobs, interviews scheduled, and hires made. Track your recruitment progress at a glance.',
        //     attachTo: {
        //         element: '#tour-applications-stats',
        //         on: 'bottom'
        //     },
        //     beforeShowPromise: async () => {
        //         await switchToTab('applications');
        //         await scrollToElement('#tour-applications-stats');
        //     },
        //     buttons: [
        //         {
        //             text: 'Previous',
        //             action: () => window.recruitmentApplicationsTour?.back(),
        //             classes: 'shepherd-button-secondary'
        //         },
        //         {
        //             text: 'Next',
        //             action: () => window.recruitmentApplicationsTour?.next()
        //         }
        //     ]
        // },
        // {
        //     id: 'applications-search-filter',
        //     title: '🔍 Search & Filter',
        //     text: 'Search applications by candidate name, job title, or other keywords. Use filters to narrow down by status, date range, or job position.',
        //     attachTo: {
        //         element: '#tour-applications-search',
        //         on: 'bottom'
        //     },
        //     beforeShowPromise: async () => {
        //         await switchToTab('applications');
        //         await scrollToElement('#tour-applications-search');
        //     },
        //     buttons: [
        //         {
        //             text: 'Previous',
        //             action: () => window.recruitmentApplicationsTour?.back(),
        //             classes: 'shepherd-button-secondary'
        //         },
        //         {
        //             text: 'Next',
        //             action: () => window.recruitmentApplicationsTour?.next()
        //         }
        //     ]
        // },
        // {
        //     id: 'applications-tabs',
        //     title: '📑 Application Status Tabs',
        //     text: 'Filter applications by status: Applied, Interview, Offer, Hired, or Archived. Each tab shows the count of applications in that stage.',
        //     attachTo: {
        //         element: '#tour-applications-status-tabs',
        //         on: 'bottom'
        //     },
        //     beforeShowPromise: async () => {
        //         await switchToTab('applications');
        //         await scrollToElement('#tour-applications-status-tabs');
        //     },
        //     buttons: [
        //         {
        //             text: 'Previous',
        //             action: () => window.recruitmentApplicationsTour?.back(),
        //             classes: 'shepherd-button-secondary'
        //         },
        //         {
        //             text: 'Next',
        //             action: () => window.recruitmentApplicationsTour?.next()
        //         }
        //     ]
        // },
        {
            id: 'applications-cards',
            title: '📝 Application Cards',
            text: 'Each application card shows the candidate\'s name, applied job position, current status, and application timeline. Click to view full details.',
            attachTo: {
                element: '#tour-applications-cards',
                on: 'top'
            },
            beforeShowPromise: async () => {
                await switchToTab('applications');
                await scrollToElement('#tour-applications-cards');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentApplicationsTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentApplicationsTour?.next()
                }
            ]
        },
        {
            id: 'applications-progress',
            title: '📈 Application Progress',
            text: 'Each application shows its progress through your hiring pipeline. See which stage the candidate is currently in.',
            attachTo: {
                element: '#tour-applications-progress',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await switchToTab('applications');
                await scrollToElement('#tour-applications-progress');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentApplicationsTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentApplicationsTour?.next()
                }
            ]
        },
        {
            id: 'applications-actions',
            title: '⚡ Quick Actions',
            text: 'For each application, you can: View Profile (see full details), Update Status, Schedule Interview, or View Resume. Take action to move candidates forward.',
            attachTo: {
                element: '#tour-applications-actions',
                on: 'left'
            },
            beforeShowPromise: async () => {
                await switchToTab('applications');
                await scrollToElement('#tour-applications-actions');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentApplicationsTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentApplicationsTour?.next()
                }
            ]
        },
        {
            id: 'applications-complete',
            title: '🎉 Applications Tour Complete!',
            text: 'Congratulations! You now know how to manage all job applications. Use the filters and actions to efficiently track and move candidates through your hiring pipeline.',
            attachTo: {
                element: '#tour-applications-overview',
                on: 'bottom'
            },
            beforeShowPromise: async () => {
                await switchToTab('applications');
                await scrollToElement('#tour-applications-overview');
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentApplicationsTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Finish',
                    action: () => {
                        sessionStorage.setItem('applicationsTabTourCompleted', 'true');
                        window.recruitmentApplicationsTour?.complete();
                    }
                }
            ]
        }
    ];
};

// ==================== APPLICATION DETAILS DIALOG TOUR ====================
export const getApplicationDialogTourSteps = (): RecruitmentTourStep[] => {
    return [
        {
            id: 'dialog-welcome',
            title: '👤 Candidate Profile',
            text: 'View candidate details and take actions like scheduling interviews or rejecting candidates.',
            attachTo: {
                element: '#tour-dialog-header',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip',
                    action: () => {
                        window.recruitmentDialogTour?.cancel();
                    },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => window.recruitmentDialogTour?.next()
                }
            ]
        },
        {
            id: 'dialog-actions',
            title: '⚡ Actions',
            text: 'Take action on the candidate: Close the dialog, or Schedule Interview to move them forward in your hiring process.',
            attachTo: {
                element: '#tour-dialog-actions',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => window.recruitmentDialogTour?.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Continue to Applications',
                    action: () => {
                        window.recruitmentDialogTour?.complete();
                        
                        // Close the dialog first
                        const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                        if (closeButton) {
                            closeButton.click();
                        }
                        
                        // Navigate to applications tab
                        const currentUrl = window.location.href;
                        const url = new URL(currentUrl);
                        url.searchParams.set('tab', 'applications');
                        url.searchParams.set('startApplicationsTour', 'true');
                        
                        window.history.pushState({}, '', url.toString());
                        
                        // Reload the page to apply the tab change and start the applications tour
                        window.location.reload();
                    }
                }
            ]
        }
    ];
};

// ==================== TOUR FACTORY FUNCTIONS ====================

// Create main recruitment dashboard tour
export const createRecruitmentDashboardTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getRecruitmentDashboardTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentTour = tour;
    }

    return tour;
};

// Create screening All tab tour
export const createScreeningAllTabTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getScreeningAllTabTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentScreeningTour = tour;
    }

    return tour;
};

// Create screening Shortlisted tab tour
export const createScreeningShortlistedTabTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getScreeningShortlistedTabTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentShortlistedTour = tour;
    }

    return tour;
};

// Create screening Pending tab tour
export const createScreeningPendingTabTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getScreeningPendingTabTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentPendingTour = tour;
    }

    return tour;
};

// Create screening Rejected tab tour
export const createScreeningRejectedTabTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getScreeningRejectedTabTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentRejectedTour = tour;
    }

    return tour;
};

// Create screening Hired tab tour
export const createScreeningHiredTabTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getScreeningHiredTabTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentHiredTour = tour;
    }

    return tour;
};

// Create Applications tab tour
export const createApplicationsTabTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getApplicationsTabTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentApplicationsTour = tour;
    }

    return tour;
};

// Create application details dialog tour
export const createApplicationDialogTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: 'shepherd-theme-recruitment',
            scrollTo: { behavior: 'smooth', block: 'center' },
            modalOverlayOpeningPadding: 10,
            modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
    });

    const steps = getApplicationDialogTourSteps();
    steps.forEach(step => tour.addStep(step));

    if (typeof window !== 'undefined') {
        window.recruitmentDialogTour = tour;
    }

    return tour;
};

// ==================== TOUR TRIGGER FUNCTION ====================

export const startRecruitmentTourIfTriggered = (): boolean => {
    if (typeof window === 'undefined') return false;

    const triggerValue = sessionStorage.getItem('triggerPageTour');
    const tourCompleted = sessionStorage.getItem('recruitmentTourCompleted');

    if (triggerValue === 'recruitment-management' && !tourCompleted) {
        sessionStorage.removeItem('triggerPageTour');
        
        // Start the main recruitment dashboard tour
        const tour = createRecruitmentDashboardTour();
        tour.start();
        
        return true;
    }
    
    return false;
};

// Helper function to start tab-specific tour
export const startTabTour = (tabName: 'all' | 'shortlisted' | 'pending' | 'rejected' | 'hired'): void => {
    if (typeof window === 'undefined') return;

    const tourCompletedKey = `screening${tabName.charAt(0).toUpperCase() + tabName.slice(1)}TabTourCompleted`;
    const completed = sessionStorage.getItem(tourCompletedKey);

    if (!completed) {
        switch (tabName) {
            case 'all':
                createScreeningAllTabTour().start();
                break;
            case 'shortlisted':
                createScreeningShortlistedTabTour().start();
                break;
            case 'pending':
                createScreeningPendingTabTour().start();
                break;
            case 'rejected':
                createScreeningRejectedTabTour().start();
                break;
            case 'hired':
                createScreeningHiredTabTour().start();
                break;
        }
    }
};

// Helper function to start dialog tour
export const startDialogTour = (): void => {
    if (typeof window === 'undefined') return;
    createApplicationDialogTour().start();
};

// Extend window interface for TypeScript
declare global {
    interface Window {
        recruitmentTour?: Shepherd.Tour;
        recruitmentScreeningTour?: Shepherd.Tour;
        recruitmentShortlistedTour?: Shepherd.Tour;
        recruitmentPendingTour?: Shepherd.Tour;
        recruitmentRejectedTour?: Shepherd.Tour;
        recruitmentHiredTour?: Shepherd.Tour;
        recruitmentDialogTour?: Shepherd.Tour;
    }
}
