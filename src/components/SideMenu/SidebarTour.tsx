import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

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

export interface SectionItem {
    key: string;
    label: string;
    icon: React.ReactNode;
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
    private tour: Tour | null = null;
    private sections: SectionItem[] = [];
    private isActive = false;
    private expandSidebar?: () => void;
    private expandSection?: (sectionKey: string) => void;
    private expandSub?: (subKey: string) => void;
    private setActiveSection?: (key: string) => void;

    constructor(sections: SectionItem[], expandSidebar?: () => void, expandSection?: (sectionKey: string) => void, expandSub?: (subKey: string) => void, setActiveSection?: (key: string) => void) {
        this.sections = sections;
        this.expandSidebar = expandSidebar;
        this.expandSection = expandSection;
        this.expandSub = expandSub;
        this.setActiveSection = setActiveSection;
    }

    private createSteps(): TourStep[] {
        const steps: TourStep[] = [];

        // Welcome step
        steps.push({
            id: 'welcome',
            title: 'Welcome to Your Dashboard!',
            text: 'Let\'s take a quick tour to help you navigate through all the amazing features available to you.',
            attachTo: {
                element: '#tour-dashboard',
                on: 'right'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => this.tour?.cancel(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => this.tour?.next()
                }
            ]
        });

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
                    action: () => this.tour?.next()
                }
            ],
            advanceOn: {
                selector: '#tour-dashboard',
                event: 'click'
            }
        });

        // Special step: Expand Organization Management and highlight Organization Detail
        const orgManagementSection = this.sections.find(s => s.label === 'Organization Management');
        const orgDetailSubItem = orgManagementSection?.subItems.find(sub => sub.label === 'Organization Detail');

        if (orgManagementSection && orgDetailSubItem) {
            steps.push({
                id: 'organization-management-expand',
                title: '🏢 Organization Management',
                text: 'Let\'s explore the Organization Management section. We\'ll automatically expand it and show you the Organization Detail menu.',
                attachTo: {
                    element: `#tour-sub-${orgDetailSubItem.key}`,
                    on: 'right'
                },
                beforeShowPromise: async () => {
                    if (this.expandSidebar) this.expandSidebar();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (this.expandSection) this.expandSection(orgManagementSection.key);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (this.expandSub) this.expandSub(orgDetailSubItem.key);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // Wait for element
                    let attempts = 0;
                    while (!document.querySelector(`#tour-sub-${orgDetailSubItem.key}`) && attempts < 10) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        attempts++;
                    }
                },
                buttons: [
                    {
                        text: 'Continue Tour',
                        action: () => this.tour?.next()
                    }
                ]
            });
        }

        // Add steps for each section and its sub-items
        this.sections.forEach((section, sectionIndex) => {
            // Section introduction
            if (section.label !== 'Organization Management') {
                steps.push({
                    id: `section-intro-${section.key}`,
                    title: `${section.label} Section`,
                    text: `Welcome to the ${section.label} section! This contains all ${section.label.toLowerCase()}-related features and tools.`,
                    attachTo: {
                        element: `#tour-section-${section.key}`,
                        on: 'right'
                    },
                    buttons: [
                        {
                            text: 'Explore',
                            action: () => this.tour?.next()
                        }
                    ]
                });
            }


            // Sub-item steps
            section.subItems.forEach((subItem, subIndex) => {
                const isLastSubItem = subIndex === section.subItems.length - 1;
                const hasSubSubItems = subItem.subItems && subItem.subItems.length > 0;

                if (!(section.label === 'Organization Management' && subItem.label === 'Organization Detail')) {
                    steps.push({
                        id: `sub-${subItem.key}`,
                        title: `🔸 ${subItem.label}`,
                        text: `${subItem.label} ${hasSubSubItems ? 'has additional sub-options' : 'takes you to a dedicated page'}. ${this.getSubItemDescription(subItem)}`,
                        attachTo: {
                            element: `#tour-sub-${subItem.key}`,
                            on: 'right'
                        },
                        beforeShowPromise: hasSubSubItems ? () => {
                            if (this.expandSub) this.expandSub(subItem.key);
                            return new Promise(resolve => setTimeout(resolve, 300));
                        } : undefined,
                        buttons: [
                            {
                                text: isLastSubItem ? 'Finish Section' : 'Next',
                                action: () => this.tour?.next()
                            }
                        ],
                        advanceOn: hasSubSubItems ? undefined : {
                            selector: `#tour-sub-${subItem.key}`,
                            event: 'click'
                        }
                    });
                }

                // Sub-sub-item steps
                if (hasSubSubItems) {
                    subItem.subItems!.forEach((subSubItem, subSubIndex) => {
                        const isLastSubSubItem = subSubIndex === subItem.subItems!.length - 1;

                        steps.push({
                            id: `subsub-${subSubItem.key}`,
                            title: ` ${subSubItem.label}`,
                            text: `This is ${subSubItem.label} - a specific feature within ${subItem.label}. ${this.getSubSubItemDescription(subSubItem)}`,
                            attachTo: {
                                element: `#tour-subsub-${subSubItem.key}`,
                                on: 'right'
                            },
                            beforeShowPromise: () => {
                                if (this.expandSub) this.expandSub(subItem.key);
                                return new Promise(resolve => setTimeout(resolve, 300));
                            },
                            buttons: [
                                {
                                    text: isLastSubSubItem ? 'Complete' : 'Next',
                                    action: () => this.tour?.next()
                                }
                            ],
                            advanceOn: {
                                selector: `#tour-subsub-${subSubItem.key}`,
                                event: 'click'
                            }
                        });
                    });
                }
            });

            // Section completion
            if (sectionIndex < this.sections.length - 1) {
                steps.push({
                    id: `section-complete-${section.key}`,
                    title: ` ${section.label} Complete!`,
                    text: `Great! You've explored the ${section.label} section. Let's move on to the next category.`,
                    attachTo: {
                        element: `#tour-section-${section.key}`,
                        on: 'right'
                    },
                    beforeShowPromise: () => {
                        if (this.expandSection) this.expandSection(section.key);
                        return new Promise(resolve => setTimeout(resolve, 300));
                    },
                    buttons: [
                        {
                            text: 'Next Section',
                            action: () => this.tour?.next()
                        }
                    ]
                });
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
                    text: 'Restart Tour',
                    action: () => { this.tour?.complete(); this.restartTour(); },
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Finish',
                    action: () => this.tour?.complete()
                }
            ]
        });

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
        if (this.isActive) return;

        console.log('Starting sidebar tour');

        // Check if tour was already completed
        // const tourCompleted = localStorage.getItem('sidebarTourCompleted');
        // if (tourCompleted) {
        //     console.log('Tour already completed by user');
        //     return;
        // }

        // Ensure the dashboard element exists before starting
        if (!document.querySelector('#tour-dashboard')) {
            console.log('Dashboard element not found, delaying tour start');
            setTimeout(() => this.startTour(), 1000);
            return;
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
        this.tour.on('complete', () => {
            this.isActive = false;
            localStorage.setItem('sidebarTourCompleted', 'true');
            this.showCompletionMessage();
        });

        this.tour.on('cancel', () => {
            this.isActive = false;
            // Don't mark as completed if cancelled
        });

        this.tour.on('show', (event) => {
            // Add custom styling or animations
            const currentStep = event.step;
            const element = currentStep.getElement();
            if (element) {
                element.style.animation = 'pulse 2s infinite';
            }
        });

        this.tour.on('hide', (event) => {
            // Clean up animations
            const currentStep = event.step;
            const element = currentStep.getElement();
            if (element) {
                element.style.animation = '';
            }
        });

        this.isActive = true;

        // Start tour after a short delay
        setTimeout(() => {
            console.log('Calling tour.start()');
            this.tour?.start();
        }, 100);
    }

    public cancelTour(): void {
        if (this.tour) {
            this.tour.cancel();
            this.isActive = false;
        }
    }

    public restartTour(): void {
        localStorage.removeItem('sidebarTourCompleted');
        this.startTour();
    }

    private showCompletionMessage(): void {
        // Could show a toast or modal here
        console.log('Tour completed successfully!');
    }

    public isTourActive(): boolean {
        return this.isActive;
    }

    public updateSections(sections: SectionItem[]): void {
        this.sections = sections;
    }
}

// Custom CSS for enhanced tour experience
export const tourStyles = `
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

// Inject styles into document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = tourStyles;
    document.head.appendChild(styleSheet);
}