import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export interface TourStep {
    id: string;
    title?: string;
    text: string;
    level?: number; // 👈 Level property for gating Detail Tour button
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
    pageUrl?: string;  // Page URL to navigate to when this step is shown
}

export interface SectionItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    page_type?: string;
    access_link?: string;
    subItems: Array<{
        key: string;
        label: string;
        icon: React.ReactNode;
        page_type?: string;
        access_link?: string;
        subItems?: Array<{
            key: string;
            label: string;
            page_type?: string;
            access_link?: string;
        }>;
    }>;
}

export class SidebarTourGuide {
    public tour: Shepherd.Tour | null = null;  // Made public for external access
    private sections: SectionItem[] = [];
    private isActive = false;
    private isPaused = false;
    private pausedStepIndex: number = 0;
    private expandSidebar?: () => void;
    private expandSection?: (sectionKey: string) => void;
    private expandSub?: (subKey: string) => void;
    private setActiveSection?: (key: string) => void;
    private isSidebarActive?: () => boolean;
    private navigateToPage?: (url: string) => void;  // Function to navigate to a page
    private onDetailTourComplete?: () => void;  // Callback when detail tour completes

    // 🔥 Class property arrow functions for event handlers
    private handleShow = (event: any): void => {
        const currentStep = event.step;

        // 1️⃣ Save current step index (resume support)
        const steps = this.tour?.steps || [];
        const stepIndex = steps.findIndex((s: any) => s.id === currentStep.id);

        if (stepIndex >= 0) {
            this.pausedStepIndex = stepIndex;
            localStorage.setItem(
                SidebarTourGuide.PAUSED_STEP_KEY,
                String(stepIndex)
            );
        }

        // 2️⃣ Highlight animation
        const element = currentStep.getElement();
        if (element) {
            element.style.animation = 'pulse 2s infinite';
        }
    };

    private handleHide = (event: any): void => {
        const currentStep = event.step;
        const element = currentStep.getElement();
        if (element) {
            element.style.animation = '';
        }
    };

    // 🔥 Handle step completion - redirect to next page
    private handleComplete = (event: any): void => {
        const currentStep = event.step;

        // Get the next step's pageUrl for automatic redirection
        const steps = this.tour?.steps || [];
        const currentStepIndex = steps.findIndex((s: any) => s.id === currentStep.id);

        // If there's a next step with pageUrl, navigate to it
        if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
            const nextStep = steps[currentStepIndex + 1];
            // Access pageUrl from the step options (custom property we added)
            const nextPageUrl = (nextStep as any).options?.pageUrl || (nextStep as any).pageUrl;

            if (nextPageUrl) {
                console.log('[SidebarTour] Step completed, navigating to next page:', nextPageUrl);

                // Update paused step index to next step
                this.pausedStepIndex = currentStepIndex + 1;
                localStorage.setItem(
                    SidebarTourGuide.PAUSED_STEP_KEY,
                    String(this.pausedStepIndex)
                );

                if (this.navigateToPage) {
                    this.navigateToPage(nextPageUrl);
                } else {
                    window.location.href = nextPageUrl;
                }
                return;
            }
        }

        // Original completion logic for final step
        this.isActive = false;
        this.isPaused = false;
        this.clearTourState();
        localStorage.setItem('sidebarTourCompleted', 'true');
        this.showCompletionMessage();
    };

    // Constants for tour state persistence
    private static readonly TOUR_STATE_KEY = 'sidebarTourState';
    private static readonly PAUSED_STEP_KEY = 'sidebarTourPausedStep';

    // Global instance for cross-component access
    public static globalInstance: SidebarTourGuide | null = null;

    constructor(
        sections: SectionItem[],
        expandSidebar?: () => void,
        expandSection?: (sectionKey: string) => void,
        expandSub?: (subKey: string) => void,
        setActiveSection?: (key: string) => void,
        isSidebarActive?: () => boolean,
        navigateToPage?: (url: string) => void  // Navigation function
    ) {
        this.sections = sections;
        this.expandSidebar = expandSidebar;
        this.expandSection = expandSection;
        this.expandSub = expandSub;
        this.setActiveSection = setActiveSection;
        this.isSidebarActive = isSidebarActive;
        this.navigateToPage = navigateToPage;
    }

    // Save tour state to localStorage
    private saveTourState(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SidebarTourGuide.TOUR_STATE_KEY, JSON.stringify({
                isActive: this.isActive,
                isPaused: this.isPaused,
                pausedStepIndex: this.pausedStepIndex,
                timestamp: Date.now()
            }));
        }
    }

    // Load tour state from localStorage
    private loadTourState(): { isActive: boolean; isPaused: boolean; pausedStepIndex: number } | null {
        if (typeof window !== 'undefined') {
            const state = localStorage.getItem(SidebarTourGuide.TOUR_STATE_KEY);
            if (state) {
                try {
                    return JSON.parse(state);
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }

    // Clear tour state from localStorage
    private clearTourState(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(SidebarTourGuide.TOUR_STATE_KEY);
            localStorage.removeItem(SidebarTourGuide.PAUSED_STEP_KEY);
        }
    }

    // Get the current step index
    public getCurrentStepIndex(): number {
        return this.pausedStepIndex;
    }

    // Check if tour is paused
    public isTourPaused(): boolean {
        return this.isPaused;
    }

    // Start the tour from a specific step
    public startTourFromStep(stepIndex: number = 0): void {
        // Check if sidebar is active (expanded) before starting tour
        if (this.isSidebarActive && !this.isSidebarActive()) {
            console.log('Sidebar is not active (collapsed), delaying tour start');
            // Try again after a delay when sidebar might be expanded
            setTimeout(() => this.startTourFromStep(stepIndex), 500);
            return;
        }

        if (this.isActive && !this.isPaused) return;

        console.log('Starting sidebar tour from step:', stepIndex);

        // Ensure the dashboard element exists before starting
        // if (!document.querySelector('#tour-dashboard')) {
        //     console.log('Dashboard element not found, delaying tour start');
        //     setTimeout(() => this.startTourFromStep(stepIndex), 1000);
        //     return;
        // }

        // Load paused step from localStorage if stepIndex is 0 but we have a saved paused step
        if (stepIndex === 0) {
            const savedPausedStep = parseInt(localStorage.getItem(SidebarTourGuide.PAUSED_STEP_KEY) || '0', 10);
            if (savedPausedStep > 0) {
                stepIndex = savedPausedStep;
                console.log('Loaded paused step from localStorage:', stepIndex);
            }
        } else {
            // If stepIndex is provided, save it as the paused step
            localStorage.setItem(SidebarTourGuide.PAUSED_STEP_KEY, String(stepIndex));
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

        const steps = this.createSteps();
        console.log('Tour steps created', steps.length);

        // Add steps to tour
        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('cancel', () => {
            // Only mark as inactive, don't clear paused state if we're just navigating
            if (!this.isPaused) {
                this.isActive = false;
                this.clearTourState();
            }
        });

        this.tour.on('show', this.handleShow);
        this.tour.on('hide', this.handleHide);
        this.tour.on('complete', this.handleComplete);
        this.isActive = true;
        this.isPaused = false;
        this.saveTourState();

        // Start tour from the specified step
        setTimeout(() => {
            console.log('Calling tour.start() from step:', stepIndex);
            if (stepIndex > 0) {
                // Navigate to the specific step
                const steps = this.tour?.steps || [];
                if (steps[stepIndex]) {
                    this.tour?.show(steps[stepIndex].id);
                } else {
                    this.tour?.start();
                }
            } else {
                this.tour?.start();
            }
        }, 100);
    }

    private createSteps(): TourStep[] {
        const steps: TourStep[] = [];
        let currentStepIndex = 0;

        // Helper function to get next step index and create "Next" action with page navigation
        const createNextAction = () => {
            const nextIndex = currentStepIndex + 1;
            return () => {
                const tourSteps = this.tour?.steps || [];
                const nextStep = tourSteps[nextIndex];
                const nextPageUrl = (nextStep as any).pageUrl;

                // Save paused step index before navigation
                this.pausedStepIndex = nextIndex;
                localStorage.setItem(SidebarTourGuide.PAUSED_STEP_KEY, String(nextIndex));

                if (nextPageUrl) {
                    console.log('[SidebarTour] Next button clicked, navigating to:', nextPageUrl);

                    // Clear all page tour completed flags before navigating
                    // This ensures tours will run when triggered from sidebar
                    sessionStorage.removeItem('leaveTypeTourCompleted');
                    sessionStorage.removeItem('myLeaveTourCompleted');
                    sessionStorage.removeItem('organizationDashboardTourCompleted');
                    sessionStorage.removeItem('organizationProfileTourCompleted');
                    sessionStorage.removeItem('attendanceDashboardTourCompleted');
                    sessionStorage.removeItem('skillLibraryTourCompleted');
                    sessionStorage.removeItem('holidayMasterTourCompleted');
                    sessionStorage.removeItem('payrollTypesTourCompleted');
                    sessionStorage.removeItem('payrollDeductionTourCompleted');
                    sessionStorage.removeItem('salaryCertificateTourCompleted');
                    sessionStorage.removeItem('monthlyPayrollTourCompleted');

                    // Determine the trigger value based on the destination page
                    let triggerValue = 'true';
                    if (nextPageUrl.includes('/MyLearningDashboard') || nextPageUrl.includes('my-learning-dashboard') || nextPageUrl.includes('LMS/MyLearning')) {
                        triggerValue = 'my-learning-dashboard';
                    }
                    else if (nextPageUrl.includes('/organization-dashboard')) {
                        triggerValue = 'organization-dashboard';
                    } else if (nextPageUrl.includes('/organization-profile')) {
                        triggerValue = 'organization-profile';
                    } else if (nextPageUrl.includes('/activityStream') || nextPageUrl.includes('/activity-stream') || nextPageUrl.includes('/task/activityStream')) {
                        triggerValue = 'activity-stream';
                    } else if (nextPageUrl.includes('/taskList') || nextPageUrl.includes('/task/taskList') || nextPageUrl.includes('/task/list') || nextPageUrl.includes('/task-management')) {
                        triggerValue = 'task-list';
                    } else if (nextPageUrl.includes('taskActivityStream') || nextPageUrl.includes('task/activity')) {
                        triggerValue = 'task-activity';
                    } else if (nextPageUrl.includes('/user') || nextPageUrl.includes('employee-directory')) {
                        triggerValue = 'employee-directory';
                    } else if (nextPageUrl.includes('/Libraries/LOR')) {
                        triggerValue = 'learning-object-repository';
                    } else if (nextPageUrl.includes('/HRIT-Dashboard')) {
                        triggerValue = 'HRIT-dashboard';
                    }
                    else if (nextPageUrl === '/' || (nextPageUrl.includes('Dashboard') && !nextPageUrl.includes('MyLearningDashboard'))) {
                        triggerValue = 'dashboard';
                    }
                    else if (nextPageUrl.includes('/my-attendance') || nextPageUrl.includes('/attendance')) {
                        triggerValue = 'attendance-dashboard';
                    }
                    else if (nextPageUrl.includes('/User-Attendance')) {
                        triggerValue = 'user-attendance';
                    }
                    else if (nextPageUrl.includes('/AttendanceReport')) {
                        triggerValue = 'attendance-report';
                    }
                    else if (nextPageUrl.includes('/EarlyGoingReport') || nextPageUrl.includes('/early-going') || nextPageUrl.includes('/earlygoing')) {
                        triggerValue = 'early-going';
                    }
                    else if (nextPageUrl.includes('/DepartmentWiseReport')) {
                        triggerValue = 'department-wise-report';
                    }
                    else if (nextPageUrl.includes('/Leave-Management/ApplyLeave') || nextPageUrl.includes('apply-leave')) {
                        triggerValue = 'apply-leave';
                    }
                    else if (nextPageUrl.includes('/Leave-Management/Leave-Authorisation') || nextPageUrl.includes('leave-authorisation') || nextPageUrl.includes('Leave-Authorisation')) {
                        triggerValue = 'leave-authorisation';
                    }
                    else if (nextPageUrl.includes('/Leave-Management/My-Leave') || nextPageUrl.includes('my-leave')) {
                        triggerValue = 'my-leave';
                    }
                    else if (nextPageUrl.includes('/Leave-Management/Leave-Type') || nextPageUrl.includes('leave-type') || nextPageUrl.includes('Leave-Type')) {
                        triggerValue = 'leave-type';
                    }
                    else if (nextPageUrl.includes('/Leave-Management/Leave-Allocation') || nextPageUrl.includes('leave-allocation') || nextPageUrl.includes('Leave-Allocation')) {
                        triggerValue = 'leave-allocation';
                    }
                    else if (nextPageUrl.includes('/Leave-Management/Holiday-Master') || nextPageUrl.includes('holiday-master') || nextPageUrl.includes('Holiday-Master')) {
                        triggerValue = 'holiday-master';
                    }
                    else if (nextPageUrl.includes('/Payroll/Payroll-type') || nextPageUrl.includes('payroll-type') || nextPageUrl.includes('Payroll-Type')) {
                        triggerValue = 'payroll-types';
                    }
                    else if (nextPageUrl.includes('/Payroll/Payroll-Deduction') || nextPageUrl.includes('payroll-deduction') || nextPageUrl.includes('Payroll-Deduction')) {
                        triggerValue = 'payroll-deduction';
                    }
                    else if (nextPageUrl.includes('/Payroll/Salary-Structure') || nextPageUrl.includes('salary-structure') || nextPageUrl.includes('Salary-Structure')) {
                        triggerValue = 'salary-structure';
                    }
                    else if (nextPageUrl.includes('/Payroll/form-16') || nextPageUrl.includes('form-16') || nextPageUrl.includes('Form-16')) {
                        triggerValue = 'form-16';
                    }
                    else if (nextPageUrl.includes('/Payroll/Salary-Certificate') || nextPageUrl.includes('salary-certificate') || nextPageUrl.includes('Salary-Certificate')) {
                        triggerValue = 'salary-certificate';
                    }
                    else if (nextPageUrl.includes('/Payroll/Monthly-Payroll') || nextPageUrl.includes('monthly-payroll') || nextPageUrl.includes('Monthly-Payroll')) {
                        triggerValue = 'monthly-payroll';
                    }
                    // 🎓 Learning Catalog trigger
                    else if (nextPageUrl.includes('/LMS/dashboard') || nextPageUrl.includes('learning-catalog') || nextPageUrl.includes('/content/LMS')) {
                        triggerValue = 'learning-catalog';
                    }
                    // 📝 Assessment Library trigger
                    else if (nextPageUrl.includes('/Assessment-Library') || nextPageUrl.includes('/assessment-library') || nextPageUrl.includes('Assessment-Library')) {
                        triggerValue = 'assessment-library';
                    }
                    // 🎯 Recruitment Management trigger
                    else if (nextPageUrl.includes('/Recruitment-management') || nextPageUrl.includes('/recruitment-management') || nextPageUrl.includes('Recruitment-Management')) {
                        triggerValue = 'recruitment-management';
                    }
                    // 🎯 Manager Hub trigger
                    else if (nextPageUrl.includes('/ManagerHub') || nextPageUrl.includes('/manager-hub') || nextPageUrl.includes('Manager-Hub')) {
                        triggerValue = 'manager-hub';
                    }
                    // 🎯 Offer Management trigger
                    else if (nextPageUrl.includes('/Offer-management') || nextPageUrl.includes('/offer-management') || nextPageUrl.includes('Offer-Management')) {
                        triggerValue = 'offer-management';
                    }
                    // 🎯 Candidate Portal trigger
                    else if (nextPageUrl.includes('/JobPortal') || nextPageUrl.includes('/job-portal') || nextPageUrl.includes('Job-Portal')) {
                        triggerValue = 'candidate-portal';
                    }
                    // 🎯 Interview Management trigger
                    else if (nextPageUrl.includes('/Telent-management') || nextPageUrl.includes('/Talent-management') || nextPageUrl.includes('/interview-management') || nextPageUrl.includes('/Interview-Management')) {
                        triggerValue = 'interview-management';
                    }


                    // Set flag to trigger page tour on destination page using sessionStorage
                    sessionStorage.setItem('triggerPageTour', triggerValue);

                    if (this.navigateToPage) {
                        this.navigateToPage(nextPageUrl);
                    } else {
                        window.location.href = nextPageUrl;
                    }
                } else {
                    this.tour?.next();
                }
            };
        };

        const nextMenuRedirect = (url: string) => {
            return () => {
                console.log('[SidebarTour] New button clicked, navigating to:', url);

                // Clear all page tour completed flags before navigating
                // This ensures tours will run when triggered from sidebar
                sessionStorage.removeItem('leaveTypeTourCompleted');
                sessionStorage.removeItem('myLeaveTourCompleted');
                sessionStorage.removeItem('organizationDashboardTourCompleted');
                sessionStorage.removeItem('organizationProfileTourCompleted');
                sessionStorage.removeItem('attendanceDashboardTourCompleted');
                sessionStorage.removeItem('skillLibraryTourCompleted');
                sessionStorage.removeItem('myLeaveTourCompleted');
                sessionStorage.removeItem('holidayMasterTourCompleted');
                sessionStorage.removeItem('payrollTypesTourCompleted');
                sessionStorage.removeItem('payrollDeductionTourCompleted');
                sessionStorage.removeItem('salaryCertificateTourCompleted');
                sessionStorage.removeItem('monthlyPayrollTourCompleted');

                // Determine the trigger value based on the destination page
                let triggerValue = 'true';
                // Check for My Learning Dashboard first - before generic Dashboard check
                if (url.includes('/MyLearningDashboard') || url.includes('my-learning-dashboard') || url.includes('LMS/MyLearning')) {
                    triggerValue = 'my-learning-dashboard';
                } else if (url.includes('organization-dashboard')) {
                    triggerValue = 'organization-dashboard';
                } else if (url.includes('organization-profile')) {
                    triggerValue = 'organization-profile';
                } else if (url.includes('activityStream') || url.includes('activity-stream') || url.includes('task/activityStream')) {
                    triggerValue = 'activity-stream';
                } else if (url.includes('taskList') || url.includes('task/taskList') || url.includes('task/list') || url.includes('/task') || url.includes('task-management')) {
                    triggerValue = 'task-list';
                } else if (url.includes('taskActivityStream') || url.includes('task/activity')) {
                    triggerValue = 'task-activity';
                } else if (url.includes('/user') || url.includes('employee-directory')) {
                    triggerValue = 'employee-directory';
                } else if (url.includes('/HRIT-Dashboard')) {
                    triggerValue = 'HRIT-dashboard';
                } else if (url === '/' || (url.includes('Dashboard') && !url.includes('MyLearningDashboard'))) {
                    triggerValue = 'dashboard';
                } else if (url.includes('/my-attendance') || url.includes('/attendance')) {
                    triggerValue = 'attendance-dashboard';
                } else if (url.includes('/User-Attendance')) {
                    triggerValue = 'user-attendance';
                } else if (url.includes('/AttendanceReport')) {
                    triggerValue = 'attendance-report';
                } else if (url.includes('/EarlyGoingReport') || url.includes('/early-going') || url.includes('/earlygoing')) {
                    triggerValue = 'early-going';
                } else if (url.includes('/DepartmentWiseReport')) {
                    triggerValue = 'department-wise-report';
                } else if (url.includes('/Leave-Management/ApplyLeave') || url.includes('apply-leave')) {
                    triggerValue = 'apply-leave';
                } else if (url.includes('/Leave-Management/Leave-Authorisation') || url.includes('leave-authorisation') || url.includes('Leave-Authorisation')) {
                    triggerValue = 'leave-authorisation';
                } else if (url.includes('/Leave-Management/My-Leave') || url.includes('My-Leave') || url.includes('my-leave')) {
                    triggerValue = 'my-leave';
                } else if (url.includes('/Leave-Management/Leave-Type') || url.includes('Leave-Type') || url.includes('leave-type')) {
                    triggerValue = 'leave-type';
                } else if (url.includes('/Leave-Management/Leave-Allocation') || url.includes('Leave-Allocation') || url.includes('leave-allocation')) {
                    triggerValue = 'leave-allocation';
                } else if (url.includes('/Leave-Management/Holiday-Master') || url.includes('holiday-master') || url.includes('Holiday-Master')) {
                    triggerValue = 'holiday-master';
                } else if (url.includes('/Payroll/Payroll-type') || url.includes('payroll-type') || url.includes('Payroll-Type')) {
                    triggerValue = 'payroll-types';
                } else if (url.includes('/Payroll/Payroll-Deduction') || url.includes('payroll-deduction') || url.includes('Payroll-Deduction')) {
                    triggerValue = 'payroll-deduction';
                } else if (url.includes('/Payroll/Salary-Structure') || url.includes('salary-structure') || url.includes('Salary-Structure')) {
                    triggerValue = 'salary-structure';
                } else if (url.includes('/Payroll/form-16') || url.includes('form-16') || url.includes('Form-16')) {
                    triggerValue = 'form-16';
                } else if (url.includes('/Payroll/Salary-Certificate') || url.includes('salary-certificate') || url.includes('Salary-Certificate')) {
                    triggerValue = 'salary-certificate';
                } else if (url.includes('/Payroll/Monthly-Payroll') || url.includes('monthly-payroll') || url.includes('Monthly-Payroll')) {
                    triggerValue = 'monthly-payroll';
                }
                // 🎓 Learning Catalog trigger
                else if (url.includes('/LMS/dashboard') || url.includes('learning-catalog') || url.includes('/content/LMS')) {
                    triggerValue = 'learning-catalog';
                }
                // 📝 Assessment Library trigger
                else if (url.includes('/Assessment-Library') || url.includes('/assessment-library') || url.includes('Assessment-Library')) {
                    triggerValue = 'assessment-library';
                }
                // 🎯 Recruitment Management trigger
                else if (url.includes('/Recruitment-management') || url.includes('/recruitment-management') || url.includes('Recruitment-Management')) {
                    triggerValue = 'recruitment-management';
                }
                // 🎯 Manager Hub trigger
                else if (url.includes('/ManagerHub') || url.includes('/manager-hub') || url.includes('Manager-Hub')) {
                    triggerValue = 'manager-hub';
                }
                // 🎯 Offer Management trigger
                else if (url.includes('/Offer-management') || url.includes('/offer-management') || url.includes('Offer-Management')) {
                    triggerValue = 'offer-management';
                }
                // 🎯 Candidate Portal trigger
                else if (url.includes('/JobPortal') || url.includes('/job-portal') || url.includes('Job-Portal')) {
                    triggerValue = 'candidate-portal';
                }
                // 🎯 Interview Management trigger
                else if (url.includes('/Telent-management') || url.includes('/Talent-management') || url.includes('/interview-management') || url.includes('/Interview-Management')) {
                    triggerValue = 'interview-management';
                }

                // Set flag to trigger page tour on destination page using sessionStorage
                sessionStorage.setItem('triggerPageTour', triggerValue);

                // Hide and pause sidebar tour before navigating
                this.hideTour();
                if (this.isActive) {
                    this.pauseTour();
                }

                // Set flag to return to sidebar tour after detail tour completes
                localStorage.setItem('returnToSidebarTour', 'true');

                // Store the paused step index for resuming
                localStorage.setItem(SidebarTourGuide.PAUSED_STEP_KEY, String(this.pausedStepIndex));

                window.location.href = url;
            };
        };

        // Welcome step
        steps.push({
            id: '',
            title: 'Welcome to Your Dashboard!',
            text: 'Let\'s take a quick tour to help you navigate through all the amazing features available to you.',
            attachTo: {
                element: '',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => this.tour?.cancel(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: createNextAction()
                }
            ]
        });
        currentStepIndex++;

        // Header step
        steps.push({
            id: '',
            title: ' Main Header',
            text: 'This is your main header showing your welcome message and search functionality. Use the search bar to quickly find employees.',
            attachTo: {
                element: '',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Next',
                    action: createNextAction()
                }
            ]
        });
        currentStepIndex++;

        // Dashboard step
        steps.push({
            id: 'dashboard',
            title: 'Your Home Base',
            text: 'This is your Dashboard - your central hub for all activities. Click here anytime to return to your main overview.',
            attachTo: {
                element: '#tour-dashboard',
                on: 'right'
            },
            buttons: [
                {
                    text: 'Got it!',
                    action: createNextAction()
                },
                {
                    text: 'View More',
                    action: nextMenuRedirect('/'),
                }
            ],
            advanceOn: {
                selector: '#tour-dashboard',
                event: 'click'
            }
        });
        currentStepIndex++;

        // Special step: Organization Management Section (Level 1)
        const orgManagementSection = this.sections.find(s => s.label === 'Organization Management');
        console.log('Looking for Organization Management section:', orgManagementSection ? 'Found' : 'Not found');
        if (orgManagementSection) {
            console.log('Organization Management section key:', orgManagementSection.key);
        }

        // Step 1: Highlight Organization Management section (Level 1 button)
        if (orgManagementSection) {
            // Normalize the access_link for Organization Management
            const orgAccessLink = orgManagementSection.access_link
                ? (orgManagementSection.access_link.startsWith('/')
                    ? orgManagementSection.access_link
                    : `/${orgManagementSection.access_link}`)
                : undefined;

            steps.push({
                id: 'organization-management-section',
                title: ' Organization Management',
                text: 'This is the Organization Management section. Click on it to expand and see the available options.',
                attachTo: {
                    element: `#tour-section-${orgManagementSection.key}`,
                    on: 'right'
                },
                pageUrl: orgAccessLink,
                beforeShowPromise: () => {
                    if (this.expandSidebar) this.expandSidebar();
                    return new Promise(resolve => setTimeout(resolve, 500));
                },
                buttons: [
                    {
                        text: 'Next',
                        action: createNextAction()
                    },
                    {
                        text: 'View More',
                        action: nextMenuRedirect(orgAccessLink || ''),
                    }
                ],
                advanceOn: {
                    selector: `#tour-section-${orgManagementSection.key}`,
                    event: 'click'
                }
            });
            currentStepIndex++;
        }

        // Special step: Expand Organization Management and highlight Organization Detail (Level 2 submenu)
        const orgDetailSubItem = orgManagementSection?.subItems.find(sub => sub.label === 'Organization Detail');
        console.log('Organization Detail subItem:', orgDetailSubItem ? `Found with key: ${orgDetailSubItem.key}` : 'Not found');

        if (orgManagementSection && orgDetailSubItem) {
            steps.push({
                id: 'organization-detail-submenu',
                title: ' Organization Detail',
                text: 'This is the Organization Detail submenu. Click on it to view organization details and manage settings.',
                attachTo: {
                    element: `#tour-sub-${orgDetailSubItem.key}`,
                    on: 'right'
                },
                pageUrl: '/content/organization-dashboard',
                beforeShowPromise: async () => {
                    // Only expand sidebar and highlight - no page navigation (pageUrl handles it)
                    if (this.expandSidebar) {
                        console.log('Expanding sidebar...');
                        this.expandSidebar();
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (this.expandSection) {
                        console.log('Expanding section:', orgManagementSection.key);
                        this.expandSection(orgManagementSection.key);
                    }
                    if (this.setActiveSection) {
                        console.log('Setting active section:', orgManagementSection.key);
                        this.setActiveSection(orgManagementSection.key);
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (this.expandSub) {
                        console.log('Expanding sub:', orgDetailSubItem.key);
                        this.expandSub(orgDetailSubItem.key);
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Wait for element
                    console.log('Waiting for element:', `#tour-sub-${orgDetailSubItem.key}`);
                    let elementFound = false;
                    for (let attempts = 0; attempts < 10; attempts++) {
                        const element = document.querySelector(`#tour-sub-${orgDetailSubItem.key}`);
                        console.log(`Attempt ${attempts + 1}:`, element ? 'Found!' : 'Not found');
                        if (element) {
                            elementFound = true;
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                    if (!elementFound) {
                        console.warn('Element not found after 10 attempts:', `#tour-sub-${orgDetailSubItem.key}`);
                    }
                },
                buttons: [
                    {
                        text: 'Next',
                        action: createNextAction()
                    }
                ]
            });
            currentStepIndex++;
        }

        // Add steps for each section and its sub-items
        this.sections.forEach((section, sectionIndex) => {
            // Section introduction
            if (section.label !== 'Organization Management') {
                // Normalize the access_link for section
                const sectionAccessLink = section.access_link
                    ? (section.access_link.startsWith('/')
                        ? section.access_link
                        : `/${section.access_link}`)
                    : undefined;

                steps.push({
                    id: `section-intro-${section.key}`,
                    title: `${section.label} Section`,
                    text: `Welcome to the ${section.label} section! This contains all ${section.label.toLowerCase()}-related features and tools.`,
                    level: 1, // 👈 Level 1 - shows Detail Tour button
                    attachTo: {
                        element: `#tour-section-${section.key}`,
                        on: 'right'
                    },
                    pageUrl: sectionAccessLink,
                    beforeShowPromise: () => {
                        if (this.expandSidebar) this.expandSidebar();
                        if (this.expandSection) this.expandSection(section.key);
                        if (this.setActiveSection) this.setActiveSection(section.key);
                        return new Promise(resolve => setTimeout(resolve, 500));
                    },
                    buttons: [
                        {
                            text: 'Next',
                            action: createNextAction()
                        },
                        {
                            text: 'View More',
                            action: nextMenuRedirect(sectionAccessLink || ''),
                        }
                    ]
                });
                currentStepIndex++;
            }


            // Sub-item steps
            section.subItems.forEach((subItem, subIndex) => {
                const isLastSubItem = subIndex === section.subItems.length - 1;
                const hasSubSubItems = subItem.subItems && subItem.subItems.length > 0;

                if (!(section.label === 'Organization Management' && subItem.label === 'Organization Detail')) {
                    const pageUrl = subItem.access_link ? (subItem.access_link.startsWith('/') ? subItem.access_link : `/${subItem.access_link}`) : undefined;
                    steps.push({
                        id: `sub-${subItem.key}`,
                        title: ` ${subItem.label}`,
                        text: `${subItem.label} ${hasSubSubItems ? 'has additional sub-options' : 'takes you to a dedicated page'}. ${this.getSubItemDescription(subItem)}`,
                        level: 2, // 👈 Level 2 - NO Detail Tour button
                        attachTo: {
                            element: `#tour-sub-${subItem.key}`,
                            on: 'right'
                        },
                        pageUrl: pageUrl,
                        beforeShowPromise: () => {
                            // Only expand sidebar and highlight - no page navigation
                            if (this.expandSidebar) this.expandSidebar();
                            if (this.expandSection) this.expandSection(section.key);
                            if (this.setActiveSection) this.setActiveSection(section.key);
                            if (hasSubSubItems && this.expandSub) this.expandSub(subItem.key);
                            return new Promise(resolve => setTimeout(resolve, 500));
                        },
                        buttons: [
                            {
                                text: isLastSubItem ? 'New Section' : 'Next',
                                action: createNextAction()
                            }
                        ].filter(Boolean) as any,
                        advanceOn: hasSubSubItems ? undefined : {
                            selector: `#tour-sub-${subItem.key}`,
                            event: 'click'
                        }
                    });
                    currentStepIndex++;
                }

                // Sub-sub-item steps
                if (hasSubSubItems) {
                    subItem.subItems!.forEach((subSubItem, subSubIndex) => {
                        const isLastSubSubItem = subSubIndex === subItem.subItems!.length - 1;
                        const subSubPageUrl = subSubItem.access_link ? (subSubItem.access_link.startsWith('/') ? subSubItem.access_link : `/${subSubItem.access_link}`) : undefined;

                        steps.push({
                            id: `subsub-${subSubItem.key}`,
                            title: ` ${subSubItem.label}`,
                            text: `This is ${subSubItem.label} - a specific feature within ${subItem.label}. ${this.getSubSubItemDescription(subSubItem)}`,
                            level: 3, // 👈 Level 3 - shows Detail Tour button
                            attachTo: {
                                element: `#tour-subsub-${subSubItem.key}`,
                                on: 'right'
                            },
                            pageUrl: subSubPageUrl,
                            beforeShowPromise: () => {
                                // Only expand sidebar and highlight - no page navigation
                                if (this.expandSidebar) this.expandSidebar();
                                if (this.expandSection) this.expandSection(section.key);
                                if (this.setActiveSection) this.setActiveSection(section.key);
                                if (this.expandSub) this.expandSub(subItem.key);
                                return new Promise(resolve => setTimeout(resolve, 500));
                            },
                            buttons: [
                                {
                                    text: 'Next',
                                    action: createNextAction()
                                },
                                {
                                    text: 'View More',
                                    action: nextMenuRedirect(subSubPageUrl || ''),
                                }
                            ],
                            advanceOn: {
                                selector: `#tour-subsub-${subSubItem.key}`,
                                event: 'click'
                            }
                        });
                        currentStepIndex++;
                    });
                }
            });

            // Section completion
            if (sectionIndex < this.sections.length - 1) {
                const nextSection = this.sections[sectionIndex + 1];
                steps.push({
                    id: `section-complete-${section.key}`,
                    title: ` ${section.label} Complete!`,
                    text: `Great! You've explored the ${section.label} section. Let's move on to the next category.`,
                    attachTo: {
                        element: `#tour-section-${section.key}`,
                        on: 'right'
                    },
                    beforeShowPromise: () => {
                        if (this.expandSidebar) this.expandSidebar();
                        if (this.expandSection) this.expandSection(section.key);
                        if (this.setActiveSection) this.setActiveSection(section.key);
                        return new Promise(resolve => setTimeout(resolve, 500));
                    },
                    buttons: [
                        {
                            text: 'Next',
                            action: createNextAction()
                        }
                    ]
                });
                currentStepIndex++;
            }
        });

        // Final completion step
        steps.push({
            id: 'tour-complete',
            title: 'Tour Complete!',
            text: 'Congratulations! You now know how to navigate through all sections of your dashboard. Happy exploring!',
            attachTo: {
                element: '#tour-dashboard',
                on: 'right'
            },
            beforeShowPromise: () => {
                if (this.expandSidebar) this.expandSidebar();
                return new Promise(resolve => setTimeout(resolve, 500));
            },
            buttons: [
                {
                    text: 'Next',
                    action: () => this.tour?.complete()
                }
            ]
        });
        currentStepIndex++;

        return steps;
    }

    private getSubItemDescription(subItem: any): string {
        // Add specific descriptions based on item labels or types
        const descriptions: { [key: string]: string } = {
            'Employee Directory': 'View and manage all employee information in one place.',
            'Attendance': 'Track and monitor employee attendance records.',
            'Leave Management': 'Handle leave requests and approvals efficiently.',
            'Payroll': 'Manage salary processing and payroll operations.',
            'Reports': 'Generate comprehensive reports and analytics.',
            'Settings': 'Configure system preferences and settings.',
            'Dashboard': 'Get an overview of key metrics and insights.',
            'Profile': 'Manage your personal profile and preferences.'
        };

        return descriptions[subItem.label] || 'Access this feature to perform related tasks.';
    }

    private getSubSubItemDescription(subSubItem: any): string {
        // Add specific descriptions for sub-sub-items
        const descriptions: { [key: string]: string } = {
            'Add Employee': 'Create new employee profiles and accounts.',
            'Edit Employee': 'Update existing employee information.',
            'View Details': 'See comprehensive employee information.',
            'Daily Report': 'Check daily attendance summaries.',
            'Monthly Report': 'Review monthly attendance patterns.',
            'Apply Leave': 'Submit your leave requests.',
            'Approve Leave': 'Review and approve team leave requests.',
            'Leave Balance': 'Check your available leave days.',
            'Salary Slip': 'Download your salary statements.',
            'Tax Documents': 'Access tax-related documents.',
            'Performance': 'Track employee performance metrics.',
            'Analytics': 'View detailed analytics and insights.'
        };

        return descriptions[subSubItem.label] || 'Use this specific functionality.';
    }

    public startTour(): void {
        // Check if there's a paused state to resume from
        const savedState = this.loadTourState();
        const savedPausedStep = parseInt(localStorage.getItem(SidebarTourGuide.PAUSED_STEP_KEY) || '0', 10);

        // Use saved paused step if available
        if (savedPausedStep > 0) {
            console.log('Found saved paused step:', savedPausedStep);
            this.startTourFromStep(savedPausedStep);
            return;
        }

        if (savedState && savedState.isPaused && savedState.pausedStepIndex > 0) {
            console.log('Resuming sidebar tour from saved state, step:', savedState.pausedStepIndex);
            this.startTourFromStep(savedState.pausedStepIndex);
            return;
        }

        // Check if sidebar is active (expanded) before starting tour
        if (this.isSidebarActive && !this.isSidebarActive()) {
            console.log('Sidebar is not active (collapsed), delaying tour start');
            // Try again after a delay when sidebar might be expanded
            setTimeout(() => this.startTour(), 500);
            return;
        }

        if (this.isActive && !this.isPaused) return;

        console.log('Starting sidebar tour');

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

        const steps = this.createSteps();
        console.log('Tour steps created', steps.length);

        // Add steps to tour
        steps.forEach(step => {
            this.tour!.addStep(step);
        });

        // Handle tour events
        this.tour.on('cancel', () => {
            // Only mark as inactive if not paused
            if (!this.isPaused) {
                this.isActive = false;
                this.clearTourState();
            }
        });

        this.tour.on('show', this.handleShow);
        this.tour.on('hide', this.handleHide);
        this.tour.on('complete', this.handleComplete);
        setTimeout(() => {
            console.log('Calling tour.start()');
            this.tour?.start();
        }, 100);
    }

    public pauseTour(): void {
        if (this.tour && this.isActive) {
            this.isPaused = true;
            // Get current step index before pausing
            const currentStep = this.tour.getCurrentStep();
            if (currentStep) {
                const steps = this.tour.steps || [];
                const stepIndex = steps.findIndex((s: any) => s.id === currentStep.id);
                if (stepIndex >= 0) {
                    this.pausedStepIndex = stepIndex;
                }
            }
            this.saveTourState();
            console.log('Sidebar tour paused at step:', this.pausedStepIndex);
        }
    }

    // Hide the tour (used when starting detail tour)
    public hideTour(): void {
        if (this.tour) {
            this.tour.hide();
            console.log('Sidebar tour hidden');
        }
    }

    // Show the tour (used after detail tour completes)
    public showTour(): void {
        if (this.tour && this.isActive) {
            this.tour.show();
            console.log('Sidebar tour shown');
        }
    }

    public continueTour(): void {
        // Continue the tour from the current step if it's active
        if (this.tour && this.isActive) {
            // Check if tour is not already showing
            const currentStep = this.tour.getCurrentStep();
            if (!currentStep) {
                // Tour is active but no current step, resume from paused step
                this.resumeTour();
            } else {
                // Tour has a current step, show it
                this.tour.show();
            }
            console.log('Continuing sidebar tour from current step');
        } else {
            // Tour is not active, start or resume it
            this.startTour();
        }
    }

    public resumeTour(): void {
        // Load paused step from localStorage (instance variable is reset on page navigation)
        const savedPausedStep = parseInt(localStorage.getItem(SidebarTourGuide.PAUSED_STEP_KEY) || '0', 10);

        // Use saved paused step if available, otherwise use instance variable
        const stepToResume = savedPausedStep > 0 ? savedPausedStep : this.pausedStepIndex;

        if (stepToResume > 0) {
            console.log('Resuming sidebar tour from step:', stepToResume);
            this.startTourFromStep(stepToResume);
        } else {
            console.log('No paused step found, starting from beginning');
            this.startTour();
        }
    }

    public cancelTour(): void {
        if (this.tour) {
            this.tour.cancel();
            this.isActive = false;
            this.isPaused = false;
            this.clearTourState();
        }
    }

    public restartTour(): void {
        localStorage.removeItem('sidebarTourCompleted');
        this.clearTourState();
        this.pausedStepIndex = 0;
        this.isPaused = false;
        this.startTourFromStep(0);
    }

    private showCompletionMessage(): void {
        // Could show a toast or modal here
        console.log('Tour completed successfully!');
    }

    public isTourActive(): boolean {
        return this.isActive;
    }

    public startDetailTour(detailTourUrl?: string): void {
        // Start a detailed tour for a specific section
        // PAUSE and HIDE the sidebar tour instead of canceling it
        console.log('Starting detail tour - hiding sidebar tour');

        // Hide the sidebar tour before navigating to detail tour
        this.hideTour();

        if (this.isActive) {
            this.pauseTour();  // Pause instead of cancel
        }

        // Set flag to return to sidebar tour after detail tour completes
        localStorage.setItem('returnToSidebarTour', 'true');

        // Store the paused step index for resuming
        localStorage.setItem(SidebarTourGuide.PAUSED_STEP_KEY, String(this.pausedStepIndex));

        // // Navigate to the specified page with startTour parameter (default to Competency Library)
        const targetUrl = detailTourUrl || '/content/Libraries/skillLibrary?startTour=true';

        if (this.navigateToPage) {
            this.navigateToPage(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    }

    public updateSections(sections: SectionItem[]): void {
        this.sections = sections;
    }

    // Set callback for when detail tour completes
    public setOnDetailTourComplete(callback: () => void): void {
        this.onDetailTourComplete = callback;
    }

    // Call this when detail tour completes to resume sidebar tour
    public onDetailTourCompleteHandler(): void {
        console.log('Detail tour completed, resuming sidebar tour');
        if (this.onDetailTourComplete) {
            this.onDetailTourComplete();
        }
        this.resumeTour();
    }
}

// Custom CSS for enhanced tour experience
export const tourStyles = `
    .shepherd-theme-custom {
        --shepherd-theme-primary: #3080ff;
        --shepherd-theme-secondary: #6c757d;
    }

    .shepherd-theme-custom .shepherd-element {
        box-shadow: 0 8px 32px rgba(0, 123, 229, 0.3);
        border-radius: 12px;
        max-width: 640px !important;
        min-width: 280px !important;
    }

    .shepherd-theme-custom .shepherd-content {
        border-radius: 8px 8px 0 0;
    }

    .shepherd-theme-custom .shepherd-header {
        background: #007BE5;
        color: white;
        border-radius: 12px 12px 0 0;
        padding: 0.75rem 1rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;

        flex-shrink: 0 !important;
    }

    .shepherd-theme-custom .shepherd-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: white;
        padding: 0;
        line-height: 1.3;
        flex: 1;
         white-space: normal !important;
        word-break: break-word;
    }

    .shepherd-theme-custom .shepherd-text {
        font-size: 14px;
        line-height: 1.5;
        color: #171717;
        padding: 16px;
        margin: 0;
    }

    .shepherd-theme-custom .shepherd-text p {
        margin: 0;
        padding: 0;
    }

    .shepherd-theme-custom .shepherd-button {
        background: #007BE5;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 500;
        transition: all 0.2s ease;
        white-space: nowrap !important;
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
        margin-left: auto;
        cursor: pointer;
        flex-shrink: 0;
    }

    .shepherd-theme-custom .shepherd-cancel-icon:hover {
        opacity: 0.8;
    }

    .shepherd-has-title .shepherd-content .shepherd-header {
        background: #546ee5;
        padding: 0.75rem 1rem;
    }

    /* Ensure header has proper layout for title and cancel icon */
    .shepherd-has-title .shepherd-header .shepherd-title,
    .shepherd-has-title .shepherd-header .shepherd-cancel-icon {
        display: inline-flex;
        align-items: center;
    }

    /* Mobile responsiveness */
    @media (max-width: 767px) {
        .shepherd-theme-custom .shepherd-element {
            max-width: 90vw !important;
            min-width: 260px !important;
            border-radius: 12px 12px 0 0 !important;
            bottom: 0 !important;
            top: auto !important;
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            width: auto !important;
            margin: 0 !important;
            transform: none !important;
        }
        .shepherd-theme-custom .shepherd-content {
            border-radius: 12px 12px 0 0 !important;
            max-height: 70vh !important;
            overflow-y: auto !important;
        }
        .shepherd-theme-custom .shepherd-header {
            padding: 0.75rem !important;
            border-radius: 12px 12px 0 0 !important;
        }
        .shepherd-theme-custom .shepherd-title {
            font-size: 16px;
        }
        .shepherd-theme-custom .shepherd-footer {
            padding: 0.75rem 1rem 1rem;
            gap: 0.5rem;
            flex-shrink: 0 !important;
        }
        .shepherd-theme-custom .shepherd-button {
            padding: 8px 16px;
            font-size: 14px;
            flex: 1 !important;
        }
        .shepherd-theme-custom .shepherd-text {
            font-size: 14px;
        }
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
    styleSheet.textContent = tourStyles;
    document.head.appendChild(styleSheet);
}

