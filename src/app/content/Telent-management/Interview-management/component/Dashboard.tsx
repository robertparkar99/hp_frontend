"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from 'next/navigation';
import { Calendar, Users, UserCheck, MessageSquare } from "lucide-react";
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// ✅ Loader Component
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// ✅ Dynamic imports with loader
const DynamicCandidates = dynamic(() => import("./Candidates"), {
  ssr: false,
  loading: Loader,
});

const DynamicFeedback = dynamic(() => import("./Feedback"), {
  ssr: false,
  loading: Loader,
});

const DynamicInterviewPanels = dynamic(() => import("./InterviewPanels"), {
  ssr: false,
  loading: Loader,
});

const DynamicScheduleInterview = dynamic(() => import("./ScheduleInterview"), {
  ssr: false,
  loading: Loader,
});

// Import the existing components
import { DashboardStats } from "./DashboardStats";
import { UpcomingInterviews } from "./UpcomingInterviews";
import { CandidatePipeline } from "./CandidatePipeline";

// Map step IDs to tab keys for automatic tab switching
const tourStepToTabMap: { [key: string]: string } = {
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

interface Interview {
  id: number;
  candidateName: string;
  position: string;
  positionId: number;
  candidateId: number;
  panelId: number;
  date: string;
  time: string;
  duration: string;
  location: string;
  interviewers: string[];
  status: string;
}

// Tour steps definition
const createTourSteps = (): Shepherd.Step[] => {
  return [
    {
      id: 'tour-welcome',
      title: 'Welcome to Interview Management!',
      text: 'Let\'s take a quick tour to help you navigate through all the features of the Interview Management Dashboard.',
      attachTo: { element: '#tour-header', on: 'bottom' },
      buttons: [
        { text: 'Skip Tour', action: () => { (window as any).interviewDashboardTour?.cancel(); }, classes: 'shepherd-button-secondary' },
        { text: 'Start Tour', action: () => { (window as any).interviewDashboardTour?.next(); } }
      ]
    },
    {
      id: 'tour-dashboard-tab',
      title: '📊 Dashboard Tab',
      text: 'This is your main Dashboard tab showing overview of all interview activities.',
      attachTo: { element: '#tour-tab-dashboard', on: 'bottom' },
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-stats-cards',
      title: '📈 Statistics Overview',
      text: 'These cards show key metrics: Interviews Today, Active Candidates, Pending Feedback, and Completed Interviews.',
      attachTo: { element: '#tour-stats-cards', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-stats-cards'),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-upcoming-interviews',
      title: '📅 Upcoming Interviews',
      text: 'View and manage scheduled upcoming interviews. Click "Reschedule" to modify an existing interview.',
      attachTo: { element: '#tour-upcoming-interviews', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-upcoming-interviews'),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-candidate-pipeline',
      title: '👥 Candidate Pipeline',
      text: 'Track candidates through different stages of the hiring process.',
      attachTo: { element: '#tour-candidate-pipeline', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-candidate-pipeline'),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-schedule-tab',
      title: '📝 Schedule Interview Tab',
      text: 'Schedule new interviews with candidates and panel members.',
      attachTo: { element: '#tour-tab-schedule', on: 'bottom' },
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-position-select',
      title: '🎯 Position Selection',
      text: 'Select the position you\'re hiring for from the dropdown.',
      attachTo: { element: '#tour-position-select', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-position-select', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-candidate-select',
      title: '👤 Candidate Selection',
      text: 'Select the candidate you want to interview.',
      attachTo: { element: '#tour-candidate-select', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-candidate-select', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-date-picker',
      title: '📅 Date Selection',
      text: 'Select the interview date using the date picker.',
      attachTo: { element: '#tour-date-picker', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-date-picker', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-time-picker',
      title: '⏰ Time Selection',
      text: 'Select the interview time from available slots.',
      attachTo: { element: '#tour-time-picker', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-time-picker', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-duration-picker',
      title: '⏱️ Duration Selection',
      text: 'Choose how long the interview will last.',
      attachTo: { element: '#tour-duration-picker', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-duration-picker', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-location-input',
      title: '📍 Location Input',
      text: 'Enter the interview location or video call link.',
      attachTo: { element: '#tour-location-input', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-location-input', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-notes-input',
      title: '📝 Additional Notes',
      text: 'Add special instructions for the interview.',
      attachTo: { element: '#tour-notes-input', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-notes-input', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-interview-panel',
      title: '👥 Interview Panel',
      text: 'Select an interview panel for this interview.',
      attachTo: { element: '#tour-interview-panel', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-interview-panel', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-schedule-button',
      title: '✅ Schedule Button',
      text: 'Click to confirm and schedule the interview.',
      attachTo: { element: '#tour-schedule-button', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-schedule-button', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-candidates-tab',
      title: '👥 Candidates Tab',
      text: 'View and manage all candidates in the hiring process.',
      attachTo: { element: '#tour-tab-candidates', on: 'bottom' },
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-candidates-search',
      title: '🔍 Search Candidates',
      text: 'Search candidates by name, position, status, etc.',
      attachTo: { element: '#tour-candidates-search', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-candidates-search', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-candidates-filters',
      title: '🎛️ Advanced Filters',
      text: 'Filter candidates by stage, date range, and more.',
      attachTo: { element: '#tour-candidates-filters', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-candidates-filters', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-candidates-table',
      title: '📊 Candidates Table',
      text: 'View all candidates with their status, stage, and scores.',
      attachTo: { element: '#tour-candidates-table', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-candidates-table', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-candidates-export',
      title: '📤 Export Options',
      text: 'Export candidate data in various formats.',
      attachTo: { element: '#tour-candidates-export', on: 'left' },
      beforeShowPromise: () => waitForElement('#tour-candidates-export', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-interview-panel-tab',
      title: '👥 Interview Panel Tab',
      text: 'Manage interview panels and assign team members.',
      attachTo: { element: '#tour-tab-interview-panel', on: 'bottom' },
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-create-panel-button',
      title: '➕ Create Panel Button',
      text: 'Create a new interview panel with specific expertise.',
      attachTo: { element: '#tour-create-panel-button', on: 'left' },
      beforeShowPromise: () => waitForElement('#tour-create-panel-button', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-panel-search',
      title: '🔍 Search Panels',
      text: 'Search through existing panels.',
      attachTo: { element: '#tour-panel-search', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-panel-search', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-panel-filter',
      title: '🎛️ Status Filter',
      text: 'Filter panels by status: All, Active, or Inactive.',
      attachTo: { element: '#tour-panel-filter', on: 'bottom' },
      beforeShowPromise: () => waitForElement('#tour-panel-filter', 25),
      buttons: [{ text: 'Next', action: () => { (window as any).interviewDashboardTour?.next(); } }]
    },
    {
      id: 'tour-panel-cards',
      title: '📋 Panel Cards',
      text: 'Each card shows panel details, members, and interview counts.',
      attachTo: { element: '#tour-panel-cards', on: 'top' },
      beforeShowPromise: () => waitForElement('#tour-panel-cards', 25),
      buttons: [{ text: 'Finish Tour', action: () => { (window as any).interviewDashboardTour?.complete(); } }]
    }
  ];
};

// ✅ Separate component that uses useSearchParams - wrapped in Suspense
function DashboardContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openPage, setOpenPage] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [tourStarted, setTourStarted] = useState(false);

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: UserCheck, tourId: "tour-tab-dashboard" },
    { key: "schedule", label: "Schedule Interview", icon: Calendar, tourId: "tour-tab-schedule" },
    { key: "candidates", label: "Candidates", icon: Users, tourId: "tour-tab-candidates" },
    { key: "interview-panel", label: "Interview Panel", icon: UserCheck, tourId: "tour-tab-interview-panel" },
  ];

  const searchParams = useSearchParams();

  // Set URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change - update URL without page reload
  const handleTabChange = useCallback((tabKey: string) => {
    setActiveTab(tabKey);
    setOpenPage(null);

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabKey);
    window.history.pushState({}, '', url.toString());
  }, []);

  // Initialize tour when triggered from sidebar
  useEffect(() => {
    const shouldStartTour = sessionStorage.getItem('triggerPageTour') === 'interview-management';
    const tourCompleted = sessionStorage.getItem('interviewDashboardTourCompleted') === 'true';

    if (shouldStartTour && !tourCompleted && !tourStarted) {
      console.log('Interview Dashboard: Triggering tour from sidebar');

      // Create and start the tour
      const tour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: { enabled: true },
          classes: 'shepherd-theme-custom',
          scrollTo: { behavior: 'smooth', block: 'center' },
          modalOverlayOpeningPadding: 10,
          modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
      });

      // Add steps
      const steps = createTourSteps();
      steps.forEach(step => {
        tour.addStep(step);
      });

      // Store tour instance globally
      (window as any).interviewDashboardTour = tour;

      // Handle tour events for tab switching
      tour.on('show', (event: any) => {
        const stepId = event.step?.id;
        console.log('Tour step shown:', stepId);

        if (stepId && tourStepToTabMap[stepId]) {
          const targetTab = tourStepToTabMap[stepId];
          if (targetTab !== activeTab) {
            console.log(`Switching to tab: ${targetTab}`);
            setActiveTab(targetTab);
          }
        }
      });

      // Handle tour completion
      tour.on('complete', () => {
        sessionStorage.setItem('interviewDashboardTourCompleted', 'true');
        setTourStarted(false);
      });

      tour.on('cancel', () => {
        sessionStorage.setItem('interviewDashboardTourCompleted', 'true');
        setTourStarted(false);
      });

      // Start tour after a short delay
      setTimeout(() => {
        tour.start();
        setTourStarted(true);
      }, 500);

      // Clear the trigger
      sessionStorage.removeItem('triggerPageTour');
    }
  }, [tourStarted, activeTab]);

  const candidate = searchParams.get('candidate');
  const job = searchParams.get('job');


  return (
    <div className="space-y-6 p-6 bg-background rounded-xl">
      {/* Header */}
      <div id="tour-header">
        <h1 className="text-2xl font-bold text-foreground">Interview Management Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening with your interviews today.
        </p>
      </div>

      {/* Navigation Menu Toggle */}
      <div className="border-b border-gray-300 pb-2 mb-4">
        <div className="flex overflow-x-auto scrollbar-hide -mx-2 px-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key && !openPage;
            
            return (
              <button
                key={tab.key}
                id={tab.tourId}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 pb-2 px-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<Loader />}>
        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div id="tour-stats-cards">

            <DashboardStats />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div id="tour-upcoming-interviews">
                <UpcomingInterviews onReschedule={(interview) => { setSelectedInterview(interview); setActiveTab("schedule"); }} />
              </div>
              <div id="tour-candidate-pipeline">

              <CandidatePipeline />
              </div>

            </div>
          </>
        )}

        {activeTab === "schedule" && (
          <div id="tour-schedule-form">
          <DynamicScheduleInterview interview={selectedInterview} candidateId={candidate || undefined} positionId={job || undefined} />
          </div>)}

        {activeTab === "candidates" && (
          <div id="tour-candidates-list">
          <DynamicCandidates />

          </div>
        )}
        {activeTab === "interview-panel" && (
          <div id="tour-panel-members">
          <DynamicInterviewPanels />
          </div>
        )}
        {/* {activeTab === "feedback" && <DynamicFeedback />} */}
      </Suspense>
    </div>
  );
}

// ✅ Export the Dashboard component wrapped in Suspense
export function Dashboard() {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardContent />
    </Suspense>
  );
}
