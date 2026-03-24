"use client";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";
import LearningDashboard from "@/app/content/LMS/MyLearningDashboard/learningDashboard";
import { useState, useEffect, useRef } from "react";
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from "@/utils/journeyLogger";

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


interface SessionData {
  url: string;
  token: string;
  subInstituteId: string;
}
// ==================== JOURNEY LOGGING HELPERS ====================

// Log tour started event
const logTourStarted = (tourName: string): void => {
  const { menuId, accessLink } = getPageInfo();
  console.log(`[MyLearningDashboard] Logging tour started: ${tourName}, menuId: ${menuId}`);
  logUserJourney({
    eventType: 'tour_started',
    stepKey: `${tourName}_started`,
    menuId: menuId,
    accessLink: accessLink || `/LMS/MyLearningDashboard`,
  }).catch(console.error);
};

// Log tour step view event
const logTourStepView = (stepId: string): void => {
  const { menuId, accessLink } = getPageInfo();
  logUserJourney({
    eventType: 'tour_step_view',
    stepKey: stepId,
    menuId: menuId,
    accessLink: accessLink || `/LMS/MyLearningDashboard`,
  }).catch(console.error);
};

// Log tour skipped event
const logTourSkipped = (tourName: string, lastStepId?: string): void => {
  const { menuId, accessLink } = getPageInfo();
  console.log(`[MyLearningDashboard] Logging tour skipped: ${tourName}, menuId: ${menuId}`);
  logUserJourney({
    eventType: 'tour_skipped',
    stepKey: lastStepId || `${tourName}_skipped`,
    menuId: menuId,
    accessLink: accessLink || `/LMS/MyLearningDashboard`,
  }).catch(console.error);
};

// Log tour complete event
const logTourComplete = (tourName: string): void => {
  const { menuId, accessLink } = getPageInfo();
  console.log(`[MyLearningDashboard] Logging tour completed: ${tourName}, menuId: ${menuId}`);
  logUserJourney({
    eventType: 'tour_complete',
    stepKey: `${tourName}_completed`,
    menuId: menuId,
    accessLink: accessLink || `/LMS/MyLearningDashboard`,
  }).catch(console.error);
};

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const tourInstanceRef = useRef<Shepherd.Tour | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [tourStepsFromAPI, setTourStepsFromAPI] = useState<any[]>([]);
  const [isLoadingTourSteps, setIsLoadingTourSteps] = useState(true);
  const hasFetchedRef = useRef(false);
  const tourStartedRef = useRef(false);



  // Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: String(sub_institute_id),
        });
      } catch (e) {
        console.error("[RecruitmentManagement] Invalid userData in localStorage", e);
      }
    }
  }, []);


  // Fetch tour steps from API
  useEffect(() => {
    const fetchTourSteps = async () => {
      if (!sessionData) return;

      try {
        const { menuId } = getPageInfo();
        console.log('[RecruitmentManagement] Fetching tour steps for menuId:', menuId);

        const response = await fetch(
          `${sessionData.url}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}`
        );

        if (!response.ok) {
          throw new Error(`yahi hai API error: ${response.status}`);
        }
        const data = await response.json();

        // Handle different response formats
        const stepsArray = Array.isArray(data) ? data : (data.data || []);
        setTourStepsFromAPI(stepsArray);
        console.log('[MyLearningDashboard] Tour steps loaded:', stepsArray);
      } catch (error) {
        console.error('[MyLearningDashboard] Failed to fetch tour steps:', error);
        setTourStepsFromAPI([]);
      } finally {
        setIsLoadingTourSteps(false);
      }
    };

    fetchTourSteps();
  }, [sessionData]);



  // Sync with localStorage and handle sidebar state changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(sidebarState === "true");
    };

    checkSidebarState();
    window.addEventListener("sidebarStateChange", checkSidebarState);

    // Set localStorage for chatbot to detect LMS My Learning module
    localStorage.setItem('activeSection', 'LMS');
    localStorage.setItem('activeSubItem', 'My Learning');

    // Log page visit
    const { menuId, accessLink } = getPageInfo();
    logUserJourney({
      eventType: 'page_visit',
      menuId: menuId,
      accessLink: accessLink || `/LMS/MyLearningDashboard`,
    }).catch(console.error);

    // Dispatch event to notify chatbot of module change
    window.dispatchEvent(new Event('activeItemChange'));

    return () => {
      window.removeEventListener("sidebarStateChange", checkSidebarState);
    };
  }, []);

  // Handle tour trigger from sidebar navigation
  useEffect(() => {
    const checkTourTrigger = () => {
      const triggerValue = sessionStorage.getItem('triggerPageTour');
      const isMyLearningTour = triggerValue === 'my-learning-dashboard';

      console.log('[MyLearningDashboard] Tour trigger check:', { triggerValue, isMyLearningTour, isLoadingTourSteps, tourStepsCount: tourStepsFromAPI.length, tourStarted: tourStartedRef.current });

      // Only start tour if:
      // 1. It's the correct trigger
      // 2. Tour steps are loaded (not loading)
      // 3. Tour hasn't been started yet
      // 4. Tour steps array has data
      if (isMyLearningTour && !isLoadingTourSteps && !tourStartedRef.current && tourStepsFromAPI.length > 0) {
        // Clear the trigger to prevent multiple triggers
        sessionStorage.removeItem('triggerPageTour');

        // Mark tour as started
        tourStartedRef.current = true;

        // Pass the API data to the tour function
        startLearningDashboardTour(tourStepsFromAPI);
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
  }, [tourStepsFromAPI, isLoadingTourSteps]); // Add dependencies to re-run when data loads

  // Start the learning dashboard tour
  const startLearningDashboardTour = (apiTourSteps: any[] = []) => {
    console.log('[MyLearningDashboard] Starting tour with API steps:', apiTourSteps);

    // Check if tour was already completed
    const tourCompleted = sessionStorage.getItem('myLearningDashboardTourCompleted');
    if (tourCompleted === 'true') {
      console.log('[MyLearningDashboard] Tour already completed, skipping...');
      return;
    }

    // Create a map from API data for easy lookup
    const apiStepsMap = new Map();
    apiTourSteps.forEach((step: any) => {
      // Use on_click as the key
      apiStepsMap.set(step.on_click, step);
    });

    console.log('[MyLearningDashboard] API steps map:', apiStepsMap);

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

    // Define tour steps - using API data with fallback to default values
    const steps: any[] = [
      {
        id: 'my-learning-welcome',
        title: apiStepsMap.get('my-learning-welcome')?.title || 'Welcome to My Learning Dashboard!',
        text: apiStepsMap.get('my-learning-welcome')?.description || 'Let\'s take a quick tour to help you navigate through all the learning features available to you.',
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
        title: apiStepsMap.get('browse-courses')?.title || 'Browse Courses',
        text: apiStepsMap.get('browse-courses')?.description || 'Click this button to browse and discover new courses available for you.',
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
        title: apiStepsMap.get('progress-overview')?.title || 'Progress Overview',
        text: apiStepsMap.get('progress-overview')?.description || 'This section shows your learning progress at a glance. You can see courses in progress, completed courses, skills earned, and learning hours.',
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
        title: apiStepsMap.get('my-courses')?.title || 'My Courses Section',
        text: apiStepsMap.get('my-courses')?.description || 'This is where you manage all your courses. Switch between tabs to view courses in progress or completed courses.',
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
        title: apiStepsMap.get('course-grid')?.title || 'Course Cards',
        text: apiStepsMap.get('course-grid')?.description || 'Each course card shows the course title, thumbnail, progress, and skills. Click to view details or continue learning.',
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
        title: apiStepsMap.get('quick-actions')?.title || 'Quick Actions',
        text: apiStepsMap.get('quick-actions')?.description || 'Access frequently used learning actions quickly. Search for courses, view certificates, and more.',
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
        title: apiStepsMap.get('skill-progress')?.title || 'Skill Progress Tracker',
        text: apiStepsMap.get('skill-progress')?.description || 'Track your skill development over time. See your proficiency levels and identify areas for improvement.',
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
        title: apiStepsMap.get('learning-calendar')?.title || 'Learning Calendar',
        text: apiStepsMap.get('learning-calendar')?.description || 'View your scheduled learning activities and deadlines. Plan your study time effectively.',
        attachTo: {
          element: '#tour-learning-calendar',
          on: 'top'
        },
        scrollTo: true,
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
        title: apiStepsMap.get('learning-stats')?.title || 'Learning Statistics',
        text: apiStepsMap.get('learning-stats')?.description || 'Detailed analytics and statistics about your learning journey.',
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
        title: apiStepsMap.get('tour-complete')?.title || 'Tour Complete!',
        text: apiStepsMap.get('tour-complete')?.description || 'Congratulations! You now know how to navigate your Learning Dashboard. Happy learning!',
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

    // Add journey logging: log step view when shown
    tour.on('show', (e: any) => {
      const step = e.step;
      if (step?.id) {
        logTourStepView(step.id);
      }
    });

    // Handle tour completion
    tour.on('complete', () => {
      sessionStorage.setItem('myLearningDashboardTourCompleted', 'true');
      logTourComplete('my_learning_dashboard');
      console.log('[MyLearningDashboard] Tour completed');
    });

    // Handle tour cancellation
    tour.on('cancel', () => {
      sessionStorage.setItem('myLearningDashboardTourCompleted', 'true');
      logTourSkipped('my_learning_dashboard');
      console.log('[MyLearningDashboard] Tour cancelled');
    });

    // Log tour started when tour is about to start
    const originalStart = tour.start.bind(tour);
    tour.start = function () {
      logTourStarted('my_learning_dashboard');
      return originalStart();
    };

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
      --shepherd-theme-primary: #3b82f6;
      --shepherd-theme-secondary: #6b7280;
    }
    .shepherd-theme-custom .shepherd-header {
      background: #3b82f6;
      color: white;
      border-radius: 8px 8px 0 0;
      padding: 12px 16px;
    }
    .shepherd-theme-custom .shepherd-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: white;
    }
    .shepherd-theme-custom .shepherd-text {
      font-size: 14px;
      line-height: 1.6;
      color: #1f2937;
      padding: 16px;
    }
    .shepherd-theme-custom .shepherd-button {
      background: #3b82f6;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 500;
      color: white;
      transition: all 0.2s ease;
      margin-left: 8px;
    }
    .shepherd-theme-custom .shepherd-button:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
    .shepherd-theme-custom .shepherd-button-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .shepherd-theme-custom .shepherd-button-secondary:hover {
      background: #d1d5db;
    }
    .shepherd-theme-custom .shepherd-cancel-icon {
      color: white;
      font-size: 20px;
    }
    .shepherd-theme-custom .shepherd-element {
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      max-width: 420px;
    }
    /* Top layer visibility */
    .shepherd-element {
      z-index: 99999 !important;
    }
    .shepherd-modal-overlay-container {
      z-index: 99998 !important;
    }
    .shepherd-modal-overlay {
      background: rgba(0, 0, 0, 0.4);
    }
    /* Ensure tour content is not clipped */
    .shepherd-content {
      overflow: visible !important;
    }
    /* Better positioning for tour tooltip */
    .shepherd-has-title .shepherd-content .shepherd-header {
      padding-top: 12px;
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