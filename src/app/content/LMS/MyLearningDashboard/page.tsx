"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import LearningDashboard from "@/app/content/LMS/MyLearningDashboard/learningDashboard";
import { useState, useEffect, useRef } from "react";
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface TourStep {
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
}
export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const tourInstanceRef = useRef<Shepherd.Tour | null>(null);

  // Sync with localStorage and handle sidebar state changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(sidebarState === "true");
    };

    checkSidebarState();
    window.addEventListener("sidebarStateChange", checkSidebarState);

    return () => {
      window.removeEventListener("sidebarStateChange", checkSidebarState);
    };
  }, []);

  // Handle tour trigger from sidebar navigation
  useEffect(() => {
    const checkTourTrigger = () => {
      const triggerValue = sessionStorage.getItem('triggerPageTour');
      const isMyLearningTour = triggerValue === 'my-learning-dashboard';

      console.log('[MyLearningDashboard] Tour trigger check:', { triggerValue, isMyLearningTour });

      if (isMyLearningTour) {
        // Clear the trigger to prevent multiple triggers
        sessionStorage.removeItem('triggerPageTour');

        // Start the tour after a short delay to ensure UI is ready
        setTimeout(() => {
          startLearningDashboardTour();
        }, 500);
      }
    };

    // Check immediately and also set up a listener
    checkTourTrigger();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'triggerPageTour') {
        checkTourTrigger();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Start the learning dashboard tour
  const startLearningDashboardTour = () => {
    console.log('[MyLearningDashboard] Starting tour...');

    // Check if tour was already completed
    const tourCompleted = sessionStorage.getItem('myLearningDashboardTourCompleted');
    if (tourCompleted === 'true') {
      console.log('[MyLearningDashboard] Tour already completed, skipping...');
      return;
    }

    // Create tour instance
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

    tourInstanceRef.current = tour;

    // Define tour steps
    const steps: any[] = [
      {
        id: 'welcome',
        title: 'Welcome to My Learning Dashboard!',
        text: 'Let\'s take a quick tour to help you navigate through all the learning features available to you.',
        attachTo: {
          element: '#tour-page-header',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Skip Tour',
            action: () => {
              sessionStorage.setItem('myLearningDashboardTourCompleted', 'true');
              tour.cancel();
            },
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Start Tour',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'browse-courses',
        title: 'Browse Courses',
        text: 'Click this button to browse and discover new courses available for you.',
        attachTo: {
          element: '#tour-browse-courses',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'progress-overview',
        title: 'Progress Overview',
        text: 'This section shows your learning progress at a glance. You can see courses in progress, completed courses, skills earned, and learning hours.',
        attachTo: {
          element: '#tour-progress-overview',
          on: 'top'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'my-courses',
        title: 'My Courses Section',
        text: 'This is where you manage all your courses. Switch between tabs to view courses in progress or completed courses.',
        attachTo: {
          element: '#tour-my-courses',
          on: 'top'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'course-grid',
        title: 'Course Cards',
        text: 'Each course card shows the course title, thumbnail, progress, and skills. Click to view details or continue learning.',
        attachTo: {
          element: '#tour-course-grid',
          on: 'top'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'quick-actions',
        title: 'Quick Actions',
        text: 'Access frequently used learning actions quickly. Search for courses, view certificates, and more.',
        attachTo: {
          element: '#tour-quick-actions',
          on: 'top'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'skill-progress',
        title: 'Skill Progress Tracker',
        text: 'Track your skill development over time. See your proficiency levels and identify areas for improvement.',
        attachTo: {
          element: '#tour-skill-progress',
          on: 'top'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'learning-calendar',
        title: 'Learning Calendar',
        text: 'View your scheduled learning activities and deadlines. Plan your study time effectively.',
        attachTo: {
          element: '#tour-learning-calendar',
          on: 'top'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'learning-stats',
        title: 'Learning Statistics',
        text: 'Detailed analytics and statistics about your learning journey.',
        attachTo: {
          element: '#tour-learning-stats',
          on: 'top'
        },
        buttons: [
          {
            text: 'Previous',
            action: () => tour.back(),
            classes: 'shepherd-button-secondary'
          },
          {
            text: 'Finish Tour',
            action: () => {
              sessionStorage.setItem('myLearningDashboardTourCompleted', 'true');
              tour.complete();
            }
          }
        ]
      },
      {
        id: 'tour-complete',
        title: 'Tour Complete!',
        text: 'Congratulations! You now know how to navigate your Learning Dashboard. Happy learning!',
        attachTo: {
          element: '#tour-page-header',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Close',
            action: () => {
              sessionStorage.setItem('myLearningDashboardTourCompleted', 'true');
              tour.complete();
            }
          }
        ]
      }
    ];

    // Add steps to tour
    steps.forEach(step => {
      tour.addStep(step);
    });

    // Handle tour completion
    tour.on('complete', () => {
      sessionStorage.setItem('myLearningDashboardTourCompleted', 'true');
      console.log('[MyLearningDashboard] Tour completed');
    });

    // Handle tour cancellation
    tour.on('cancel', () => {
      sessionStorage.setItem('myLearningDashboardTourCompleted', 'true');
      console.log('[MyLearningDashboard] Tour cancelled');
    });

    // Start the tour
    tour.start();
    console.log('[MyLearningDashboard] Tour started successfully');
  };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };
  return (
    <>
      <style>{`
        .shepherd-theme-custom {
          --shepherd-theme-primary: #3080ff;
          --shepherd-theme-secondary: #6c757d;
        }
        .shepherd-theme-custom .shepherd-header {
          background: linear-gradient(135deg, #007BE5 0%, #0056b3 100%);
          color: white;
          border-radius: 5px 5px 0 0;
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
        .shepherd-theme-custom .shepherd-element {
          box-shadow: 0 10px 40px rgba(0, 123, 229, 0.3);
          border-radius: 12px;
          max-width: 400px;
        }
        .shepherd-theme-custom.shepherd-element {
          position: relative !important;
          z-index: 9999 !important;
        }
        .shepherd-theme-custom .shepherd-modal-overlay {
          z-index: 9998 !important;
        }
      `}</style>
      <div className="mb-5">
        <Header />
      </div>
      {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar} /> */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-[304px]" : "md:ml-24"} ml-0 p-4 md:p-6`}>
        <LearningDashboard />
      </div>
    </>
  );
}