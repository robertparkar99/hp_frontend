"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { MetricCard } from "./MetricCard";
import Icon from "@/components/AppIcon"
import { OrganizationTree } from "./OrganizationTree";
import { RecentActivity } from "./RecentActivity";
import OrganizationInfoForm from "@/app/content/organization-profile-management/components/OrganizationInfoForm";
import UserManagement from "@/app/content/user";
import DepartmentStructure from "@/app/content/organization-profile-management/components/DepartmentStructure";
import {
  Users,
  Building2,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  AudioLines,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logUserJourney, getPageInfo } from "../../../../utils/journeyLogger";

type DisciplinaryItem = {
  id: number;
  department_id: number;
  employee_id: number;
  incident_datetime: string;
  location: string;
  misconduct_type: string;
  description: string;
  witness_id: number;
  action_taken: string;
  remarks: string;
  reported_by: number;
  date_of_report: string;
  sub_institute_id: number;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  department_name: string;
  employee_name: string;
  witness_name: string;
  reported_by_name: string;
};

// Type for API tour steps
type TourStepAPI = {
  id: number;
  menu_id: number;
  access_link: string;
  event_type: string;
  title: string;
  description: string;
  on_click: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string | null;
};

type DashboardData = {
  status: number;
  message: string;
  total_employees: number;
  total_departments: number;
  total_complainces: number;
  total_disciplinary: number;
  departments: Record<string, unknown>;
  complainceData: any[];
  discliplinaryManagement: DisciplinaryItem[];
  org_data?: Array<{
    id: number;
    legal_name: string;
    cin: string;
    gstin: string;
    pan: string;
    registered_address: string;
    industry: string;
    employee_count: string;
    work_week: string;
    logo: string;
    sub_institute_id: number;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
  }>;
};

export function Dashboard() {
  // 🔹 Inject tour styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .shepherd-theme-custom.dashboard-tour {
        --shepherd-theme-primary: #007BE5;
        --shepherd-theme-secondary: #6c757d;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-header {
        background: var(--shepherd-theme-primary);
        color: white;
        border-radius: 8px 8px 0 0;
        padding: 12px 16px;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: white;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-text {
        font-size: 14px;
        line-height: 1.6;
        color: #333333;
        padding: 16px;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-button {
        background: var(--shepherd-theme-primary);
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 500;
        color: white;
        transition: all 0.2s ease;
        margin-left: 8px;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-button:hover {
        background: #0056b3;
        transform: translateY(-1px);
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-button-secondary {
        background: transparent !important;
        border: 1px solid #6c757d;
        color: #6c757d;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-button-secondary:hover {
        background: #6c757d !important;
        color: white !important;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-cancel-icon {
        color: white;
        font-size: 20px;
        opacity: 0.8;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-cancel-icon:hover {
        opacity: 1;
      }
      
      .shepherd-has-title .shepherd-content .shepherd-header {
        background: var(--shepherd-theme-primary);
        padding: 12px 16px;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-element {
        box-shadow: 0 8px 32px rgba(0, 123, 229, 0.25);
        border-radius: 12px;
        max-width: 400px;
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-footer {
        padding: 0 16px 16px;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      
      .shepherd-theme-custom.dashboard-tour .shepherd-element {
        animation: pulse 2s infinite;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const tourRef = useRef<Tour | null>(null);

  // State for storing tour steps from API
  const [tourStepsFromAPI, setTourStepsFromAPI] = useState<TourStepAPI[]>([]);

  const [sessionData, setSessionData] = useState<{
    url: string;
    token: string;
    subInstituteId: string;
    orgType: string;
    userId: string;
  } | null>(null);

  // 🔹 current view state
  const [activeView, setActiveView] = useState<"dashboard" | "organizationInfo" | "userManagement" | "departmentStructure">(
    "dashboard"
  );

  // 🔹 Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id, org_type, user_id } =
          JSON.parse(userData);

        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: String(sub_institute_id),
          orgType: org_type,
          userId: String(user_id),
        });
      } catch (e) {
        console.error("Invalid userData in localStorage", e);
      }
    }
  }, []);

  // 🔹 Fetch tour steps from API
  useEffect(() => {
    async function fetchTourSteps() {
      if (!sessionData) return;

      try {
        // Get menuId from page info
        const { menuId } = getPageInfo();
        console.log('Current page menuId:', menuId);

        // Fetch tour steps with proper authentication and filtering
        const res = await fetch(
          `${sessionData.url}/table_data?table=Onboarding_tour_details&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
        );

        // Clone response before reading to handle errors properly
        if (!res.ok) {
          const errorRes = res.clone();
          try {
            const errorText = await errorRes.text();
            console.error('Tour steps API error:', res.status, errorText);
          } catch (e) {
            console.error('Tour steps API error:', res.status);
          }
          throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();

        // The API returns data in a specific format, extract the data array
        console.log('Tour steps API response:', json);

        // Handle different response formats
        let tourData: TourStepAPI[] = [];
        if (Array.isArray(json)) {
          tourData = json;
        } else if (json.data && Array.isArray(json.data)) {
          tourData = json.data;
        } else if (json.result && Array.isArray(json.result)) {
          tourData = json.result;
        }

        console.log('Parsed tour data:', tourData);

        // Filter by menu_id from getPageInfo and access_link on client side
        const filteredData = tourData.filter((step: TourStepAPI) =>
          step.menu_id === menuId && step.access_link === 'content/organization-dashboard'
        );

        console.log('Filtered tour data:', filteredData);

        setTourStepsFromAPI(filteredData.length > 0 ? filteredData : tourData);
      } catch (error) {
        console.error("Error fetching tour steps:", error);
      }
    }

    fetchTourSteps();
  }, [sessionData]);

  // 🔹 Fetch dashboard when sessionData is ready
  useEffect(() => {
    async function fetchDashboard() {
      if (!sessionData) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${sessionData.url}/organization_dashboard?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&user_id=${sessionData.userId}&user_profile_id=1&user_profile_name=admin&org_type=${sessionData.orgType}&syear=2025`
        );

        if (!res.ok) throw new Error("Failed to fetch dashboard");

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [sessionData]);

  // 🔹 Tour initialization function
  const initializeTour = useCallback((forceStart = false) => {
    // Check if tour was already completed (only if not forcing start)
    if (!forceStart) {
      const tourCompleted = localStorage.getItem('dashboardTourCompleted');
      if (tourCompleted) {
        console.log('Dashboard tour already completed');
        return;
      }
    }

    // Check if API data is available
    if (tourStepsFromAPI.length === 0) {
      console.log('No tour steps available from API');
      return;
    }

    // Wait for DOM to be ready
    setTimeout(() => {
      // Log tour started journey event
      const { menuId, accessLink } = getPageInfo();
      logUserJourney({
        eventType: "tour_started",
        stepKey: "welcome",
        accessLink: accessLink,
        menuId: menuId,
      }).catch(console.error);

      const tour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: {
            enabled: true
          },
          classes: 'shepherd-theme-custom dashboard-tour',
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

      tourRef.current = tour;

      // Define all tour steps with proper typing
      interface TourStep {
        id: string;
        title: string;
        text: string;
        attachTo: {
          element: string;
          on: string;
        };
        buttons: {
          text: string;
          action: () => void;
          classes?: string;
        }[];
      }

      // Define attachTo configuration for each step
      const getAttachToConfig = (stepId: string) => {
        const configs: Record<string, { element: string; on: string }> = {
          'welcome': { element: '#tour-header', on: 'bottom' },
          'header-org': { element: '#tour-header-org', on: 'bottom' },
          'edit-org-btn': { element: '#tour-edit-org-btn', on: 'bottom' },
          'metric-employees': { element: '#tour-metric-employees', on: 'bottom' },
          'metric-departments': { element: '#tour-metric-departments', on: 'bottom' },
          'metric-compliance': { element: '#tour-metric-compliance', on: 'bottom' },
          'metric-disciplinary': { element: '#tour-metric-disciplinary', on: 'bottom' },
          'org-tree': { element: '#tour-org-tree', on: 'top' },
          'recent-activity': { element: '#tour-recent-activity', on: 'top' },
          'quick-actions': { element: '#tour-quick-actions', on: 'top' },
          'btn-manage-org': { element: '#tour-btn-manage-org', on: 'top' },
          'btn-manage-dept': { element: '#tour-btn-manage-dept', on: 'top' },
          'btn-manage-users': { element: '#tour-btn-manage-users', on: 'top' },
          'btn-view-analytics': { element: '#tour-btn-view-analytics', on: 'top' },
          'disciplinary-section': { element: '#tour-disciplinary-section', on: 'top' },
          'disciplinary-items': { element: '#tour-disciplinary-items', on: 'top' },
          'tour-complete': { element: '#tour-header', on: 'bottom' },
        };
        return configs[stepId] || { element: '#tour-header', on: 'bottom' };
      };

      // Map API data to TourStep format
      const mappedSteps = tourStepsFromAPI.map((apiStep, index) => {
        const isFirst = index === 0;
        const isLast = index === tourStepsFromAPI.length - 1;
        const attachTo = getAttachToConfig(apiStep.on_click);

        return {
          id: apiStep.on_click,
          title: apiStep.title,
          text: apiStep.description,
          attachTo,
          originalIndex: index,
          buttons: [
            {
              text: 'Skip Tour',
              action: () => {
                localStorage.setItem('dashboardTourCompleted', 'true');
                tour.cancel();
              },
              classes: 'shepherd-button-secondary'
            },
            {
              text: isLast ? 'Finish' : 'Next',
              action: () => {
                if (isLast) {
                  localStorage.setItem('dashboardTourCompleted', 'true');
                  tour.complete();
                } else {
                  tour.next();
                }
              }
            }
          ]
        };
      });

      // Filter out steps where the target element doesn't exist in the DOM
      const steps: TourStep[] = mappedSteps
        .filter(step => {
          const elementExists = document.querySelector(step.attachTo.element) !== null;
          if (!elementExists) {
            console.log(`Skipping tour step '${step.id}' - element '${step.attachTo.element}' not found in DOM`);
          }
          return elementExists;
        })
        .map((step, index, filteredArray) => {
          const isLast = index === filteredArray.length - 1;
          return {
            ...step,
            buttons: [
              {
                text: 'Skip Tour',
                action: () => {
                  localStorage.setItem('dashboardTourCompleted', 'true');
                  tour.cancel();
                },
                classes: 'shepherd-button-secondary'
              },
              {
                text: isLast ? 'Finish' : 'Next',
                action: () => {
                  if (isLast) {
                    localStorage.setItem('dashboardTourCompleted', 'true');
                    tour.complete();
                  } else {
                    tour.next();
                  }
                }
              }
            ]
          };
        });

      // Add steps to tour
      if (steps.length === 0) {
        console.log('No valid tour steps found - all elements missing from DOM');
        return;
      }

      steps.forEach(step => tour.addStep(step));

      // Handle tour step shown
      tour.on('show', (event) => {
        const currentStep = event.step;
        const { menuId, accessLink } = getPageInfo();
        const stepId = currentStep.id || 'unknown';

        logUserJourney({
          eventType: "tour_step_view",
          stepKey: stepId,
          accessLink: accessLink,
          menuId: menuId,
        }).catch(console.error);
      });

      // Handle tour completion
      tour.on('complete', () => {
        console.log('Dashboard tour completed');
        localStorage.setItem('dashboardTourCompleted', 'true');

        // Log tour completed journey event
        const { menuId, accessLink } = getPageInfo();
        logUserJourney({
          eventType: "tour_step_complete",
          stepKey: "tour-complete",
          accessLink: accessLink,
          menuId: menuId,
        }).catch(console.error);

        // Dispatch event for sidebar tour to resume
        window.dispatchEvent(new CustomEvent('detailTourComplete'));

        // Check if we should return to sidebar tour
        const returnToSidebar = localStorage.getItem('returnToSidebarTour');
        if (returnToSidebar === 'true') {
          // Clear the flag
          localStorage.removeItem('returnToSidebarTour');
          // Store the paused step index for resuming
          const pausedStep = localStorage.getItem('sidebarTourPausedStep') || '0';
          localStorage.setItem('sidebarTourPausedStep', pausedStep);
          // Navigate back to main page to resume sidebar tour
          window.location.href = '/?resumeSidebarTour=true';
        }
      });

      // Handle tour cancellation
      tour.on('cancel', () => {
        console.log('Dashboard tour cancelled');

        // Log tour skipped journey event
        const { menuId, accessLink } = getPageInfo();
        logUserJourney({
          eventType: "tour_skipped",
          stepKey: "cancelled",
          accessLink: accessLink,
          menuId: menuId,
        }).catch(console.error);

        // Dispatch event for sidebar tour to resume
        window.dispatchEvent(new CustomEvent('detailTourComplete'));

        // Also redirect if returning to sidebar tour (in case user cancels instead of finishing)
        const returnToSidebar = localStorage.getItem('returnToSidebarTour');
        if (returnToSidebar === 'true') {
          // Clear the flag
          localStorage.removeItem('returnToSidebarTour');
          // Store the paused step index for resuming
          const pausedStep = localStorage.getItem('sidebarTourPausedStep') || '0';
          localStorage.setItem('sidebarTourPausedStep', pausedStep);
          // Navigate back to main page to resume sidebar tour
          window.location.href = '/?resumeSidebarTour=true';
        }
      });

      // Start tour after a short delay
      setTimeout(() => {
        tour.start();
      }, 500);
    }, 100);
  }, [loading, data, tourStepsFromAPI]);

  // 🔹 Initialize Tour when data is loaded (from sidebar navigation)
  useEffect(() => {
    // Wait for tour steps to be loaded before checking trigger
    if (tourStepsFromAPI.length === 0) {
      return; // Tour steps not loaded yet
    }

    // Check if we should trigger the tour (from sidebar tour navigation)
    const triggerTour = sessionStorage.getItem('triggerPageTour');
    console.log('Tour trigger check - triggerTour:', triggerTour);

    if (!triggerTour) {
      return; // No trigger, don't start tour
    }

    const shouldStartTour = triggerTour === 'organization-dashboard';
    console.log('Tour trigger check - shouldStartTour:', shouldStartTour);

    // Clear the trigger flag immediately
    sessionStorage.removeItem('triggerPageTour');
    console.log('Triggering organization dashboard tour from navigation...');

    // Start tour if triggered from sidebar
    if (shouldStartTour) {
      console.log('Starting organization dashboard tour...');
      // Use a timeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        try {
          // Force reset tour completion flag when triggered from sidebar navigation
          localStorage.removeItem('dashboardTourCompleted');
          initializeTour(true); // true = force start
          console.log('Organization dashboard tour initialized and started');
        } catch (error) {
          console.error('Error starting organization dashboard tour:', error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [initializeTour, tourStepsFromAPI]);

  // 🔹 Cleanup tour when component unmounts
  useEffect(() => {
    return () => {
      if (tourRef.current) {
        tourRef.current.cancel();
        tourRef.current = null;
      }
    };
  }, []);

  // 🔹 Function to restart tour
  const restartTour = () => {
    localStorage.removeItem('dashboardTourCompleted');
    if (tourRef.current) {
      tourRef.current.cancel();
      tourRef.current = null;
    }
    initializeTour(true);
  };

  // 🔹 Map API disciplinary data → department overview cards
  const departmentOverview =
    data?.discliplinaryManagement?.map((item) => ({
      name: item.employee_name,
      employees: item.department_name,
      change: item.misconduct_type,
      status: item.action_taken,
      positive: item.action_taken
        ? item.action_taken.toLowerCase().includes("counseling")
        : false,
    })) || [];

  const getOrganizationName = () => {
    try {
      // Check if org_data exists and has at least one item with legal_name
      if (data?.org_data && data.org_data.length > 0 && data.org_data[0].legal_name) {
        return data.org_data[0].legal_name;
      }

      // Fallback to message or default
      return data?.message || "Organization Name";
    } catch (error) {
      console.error("Error getting organization name:", error);
      return data?.message || "Organization Name";
    }
  };

  // 🔹 Responsive layout states
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔹 switch view rendering
  if (activeView === "organizationInfo") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveView("dashboard")}
            className="mr-4"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Organization Information</h1>
        </div>
        <OrganizationInfoForm
          onSave={() => {
            setActiveView("dashboard");
          }}
        />
      </div>
    );
  }

  // 🔹 Render User Management view
  if (activeView === "userManagement") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveView("dashboard")}
            className="mr-4"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">User Management</h1>
        </div>
        <UserManagement />
      </div>
    );
  }

  if (activeView === "departmentStructure") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveView("dashboard")}
            className="mr-4"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Department Structure</h1>
        </div>
        <DepartmentStructure onSave="" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-xl">
      <div className="flex">
        <main className="flex-1 p-4 md:p-6 rounded-xl space-y-4 md:space-y-6 overflow-x-hidden max-w-full">
          {/* Header - Fixed alignment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"  id="tour-header">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              Organization Dashboard
            </h1>
            
            {/* Organization Name - Responsive positioning */}
            <div className="flex items-center gap-2 self-end sm:self-center" id="tour-header-org">
              <span className="text-sm sm:text-lg font-semibold text-primary truncate max-w-[180px] sm:max-w-none" >
                {loading ? "Loading..." : getOrganizationName()}
              </span>

              {/* Edit Button */}
              <button
                onClick={() => setActiveView("organizationInfo")}
                className="bg-blue-500 hover:bg-blue-700 text-white text-xs p-1.5 sm:py-1 sm:px-2 rounded flex-shrink-0" id="tour-edit-org-btn"
              >
                <span className="mdi mdi-pencil text-sm"></span>
              </button>
            </div>
          </div>

          {/* Metrics Grid - Responsive and equal heights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            <div className="relative" id="tour-metric-employees" >
              <MetricCard
                title="Total Employees"
                value={loading ? "..." : data?.total_employees?.toString() || "0"}
                // change={{ value: "+12 this month", type: "positive" }}
                  description="Active users in the organization"
                icon={Users}
              />
              <button
                onClick={() => setActiveView("userManagement")}
                className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
                aria-label="View user management"
              >
                <Icon name="Eye" size={20} />
              </button>
            </div>

            <div className="relative" id="tour-metric-departments">
              <MetricCard
                title="Departments"
                value={loading ? "..." : data?.total_departments?.toString() || "0"}
                icon={Building2}
                description="Active departments and teams"
              />
              <button
                onClick={() => setActiveView("departmentStructure")}
                className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
                aria-label="View department structure"
              >
                <Icon name="Eye" size={20} />
              </button>
            </div>
 <div id="tour-metric-compliance">
            <MetricCard
            
              title="Compliance"
              value={loading ? "..." : data?.total_complainces?.toString() || "0"}
              icon={ShieldCheck}
               description="Awaiting management approval"
            />
            </div>
    <div id="tour-metric-disciplinary">
            <MetricCard 
              title="Disciplinary"
              value={loading ? "..." : data?.total_disciplinary?.toString() || "0"}
              icon={AudioLines}
              description="Active disciplinary actions"
              
            />
            </div>
          </div>

          {/* Organization + Activity - Responsive grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 w-full overflow-hidden" id="tour-org-tree">
              <OrganizationTree departments={data?.departments || {}} />
            </div>
            <div className="lg:col-span-1 w-full" id="tour-recent-activity">
              <RecentActivity activities={data?.complainceData || []} />
            </div>
          </div>

          {/* Quick Actions & Department Performance - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Quick Actions Card */}
            <Card className="w-full overflow-hidden" id="tour-quick-actions">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Activity className="text-blue-400 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                   id="tour-btn-manage-org"
                  onClick={() => setActiveView("organizationInfo")}
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">Manage Organization</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                  onClick={() => setActiveView("departmentStructure")}
                  id="tour-btn-manage-dept"
                >
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">Manage Departments</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                   id="tour-btn-manage-users"
                  onClick={() => setActiveView("userManagement")}
                >
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">Manage Users</span>
                </Button>

                {/* <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                   id="tour-btn-view-analytics"
                >
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">View Analytics</span>
                </Button> */}
              </CardContent>
            </Card>

            {/* Disciplinary Card */}
            <Card className="w-full h-auto sm:h-70 overflow-hidden" id="tour-disciplinary-section">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <AudioLines className="text-blue-400 h-5 w-5" />
                  Disciplinary
                </CardTitle>
              </CardHeader>
              <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[300px] sm:max-h-[280px] pr-2 scrollbar-hide p-4" id="tour-disciplinary-items">
                {departmentOverview.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent disciplinary data
                  </p>
                ) : (
                  departmentOverview.map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg min-h-[70px]"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-sm sm:text-base truncate">{dept.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {dept.employees}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-xs sm:text-sm font-medium ${
                            dept.positive ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          {dept.change}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {dept.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
