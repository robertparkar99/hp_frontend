import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

/**
 * Tour Steps for My Learning Dashboard
 * These steps cover all major functionality and UI elements
 */

export interface LearningDashboardTourStep {
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

export const createLearningDashboardTourSteps = (tourInstance: Shepherd.Tour): LearningDashboardTourStep[] => {
    const steps: LearningDashboardTourStep[] = [
        {
            id: 'welcome',
            title: 'Welcome to My Learning Dashboard!',
            text: 'Let\'s take a quick tour to help you navigate through all the learning features available to you. This dashboard tracks your progress and helps you continue your learning journey.',
            attachTo: {
                element: '#tour-page-header',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Skip Tour',
                    action: () => tourInstance.cancel(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'browse-courses',
            title: '📚 Browse Courses',
            text: 'Click this button to browse and discover new courses available for you. You can explore various subjects and enroll in courses that interest you.',
            attachTo: {
                element: '#tour-browse-courses',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'progress-overview',
            title: '📊 Progress Overview',
            text: 'This section shows your learning progress at a glance. You can see your courses in progress, completed courses, skills earned, and learning hours.',
            attachTo: {
                element: '#tour-progress-overview',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'courses-in-progress',
            title: '📖 Courses In Progress',
            text: 'Track your currently enrolled courses here. Click to see detailed progress and continue where you left off.',
            attachTo: {
                element: '#tour-stat-courses-progress',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'completed-courses',
            title: '✅ Completed Courses',
            text: 'View all courses you have successfully completed. Celebrate your achievements and track your learning milestones.',
            attachTo: {
                element: '#tour-stat-completed',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'skills-earned',
            title: '🏆 Skills Earned',
            text: 'Monitor the skills you have acquired through your courses. Each course completion adds to your skill portfolio.',
            attachTo: {
                element: '#tour-stat-skills',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'learning-hours',
            title: '⏱️ Learning Hours',
            text: 'Track your total learning hours. Set goals and monitor your progress towards achieving your learning objectives.',
            attachTo: {
                element: '#tour-stat-hours',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'my-courses',
            title: '📋 My Courses Section',
            text: 'This is where you manage all your courses. Switch between tabs to view courses in progress, completed courses, or recommended courses for you.',
            attachTo: {
                element: '#tour-my-courses',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'in-progress-tab',
            title: '📌 In Progress Tab',
            text: 'View all courses you are currently enrolled in. Click on a course card to continue learning from where you left off.',
            attachTo: {
                element: '#tour-tab-in-progress',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'completed-tab',
            title: '✅ Completed Tab',
            text: 'Access your completed courses here. Review what you have learned and revisit any course materials anytime.',
            attachTo: {
                element: '#tour-tab-completed',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'recommended-tab',
            title: '💡 Recommended Tab',
            text: 'Discover personalized course recommendations based on your learning history and interests. Enroll in new courses to expand your skills.',
            attachTo: {
                element: '#tour-tab-recommended',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'course-grid',
            title: '📚 Course Cards',
            text: 'Each course card shows the course title, thumbnail, progress, skills you will learn, and difficulty level. Click to view details or continue learning.',
            attachTo: {
                element: '#tour-course-grid',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'quick-actions',
            title: '⚡ Quick Actions',
            text: 'Access frequently used learning actions quickly. Search for courses, view certificates, access your wishlist, and more.',
            attachTo: {
                element: '#tour-quick-actions',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'skill-progress',
            title: '📈 Skill Progress Tracker',
            text: 'Track your skill development over time. See your proficiency levels and identify areas for improvement.',
            attachTo: {
                element: '#tour-skill-progress',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'learning-calendar',
            title: '📅 Learning Calendar',
            text: 'View your scheduled learning activities and deadlines. Plan your study time effectively.',
            attachTo: {
                element: '#tour-learning-calendar',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: () => tourInstance.next()
                }
            ]
        },
        {
            id: 'learning-stats',
            title: '📊 Learning Statistics',
            text: 'Detailed analytics and statistics about your learning journey. Track your performance and growth.',
            attachTo: {
                element: '#tour-learning-stats',
                on: 'top'
            },
            buttons: [
                {
                    text: 'Previous',
                    action: () => tourInstance.back(),
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Finish Tour',
                    action: () => tourInstance.complete()
                }
            ]
        },
        {
            id: 'tour-complete',
            title: '🎉 Tour Complete!',
            text: 'Congratulations! You now know how to navigate your Learning Dashboard. Start exploring courses and continue your learning journey. Happy learning!',
            attachTo: {
                element: '#tour-page-header',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Close',
                    action: () => tourInstance.complete()
                }
            ]
        }
    ];

    return steps;
};

/**
 * Create and configure the learning dashboard tour
 */
export const createLearningDashboardTour = (): Shepherd.Tour => {
    const tour = new Shepherd.Tour({
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

    return tour;
};

/**
 * Custom CSS for the learning dashboard tour
 */
export const learningDashboardTourStyles = `
    .shepherd-theme-custom {
        --shepherd-theme-primary: #3080ff;
        --shepherd-theme-secondary: #6c757d;
    }

    .shepherd-theme-custom .shepherd-header {
        background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
        color: white;
        border-radius: 12px 12px 0 0;
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

    .shepherd-theme-custom .shepherd-button {
        background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.3s ease;
        margin: 0 5px;
    }

    .shepherd-theme-custom .shepherd-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 229, 0.4);
    }

    .shepherd-theme-custom .shepherd-button-secondary {
        background: #f0f0f0 !important;
        color: #333 !important;
        border: 1px solid #ddd !important;
    }

    .shepherd-theme-custom .shepherd-button-secondary:hover {
        background: #e0e0e0 !important;
        transform: translateY(-2px);
    }

    .shepherd-theme-custom .shepherd-cancel-icon {
        color: white;
        font-size: 24px;
        opacity: 0.8;
        transition: opacity 0.3s;
    }

    .shepherd-theme-custom .shepherd-cancel-icon:hover {
        opacity: 1;
    }

    .shepherd-has-title .shepherd-content .shepherd-header {
        background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
        padding: 16px 20px;
    }

    .shepherd-theme-custom .shepherd-element {
        box-shadow: 0 10px 40px rgba(0, 123, 229, 0.3);
        border-radius: 12px;
        max-width: 400px;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    .shepherd-theme-custom .shepherd-element:hover {
        animation: pulse 2s infinite;
    }
`;

// Inject styles into document head
if (typeof window !== 'undefined') {
    const existingStyle = document.querySelector('#learning-dashboard-tour-styles');
    if (!existingStyle) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'learning-dashboard-tour-styles';
        styleSheet.textContent = learningDashboardTourStyles;
        document.head.appendChild(styleSheet);
    }
}

export default {
    createLearningDashboardTourSteps,
    createLearningDashboardTour,
    learningDashboardTourStyles
};
