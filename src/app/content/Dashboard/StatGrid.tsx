//
"use client";
import { useEffect, useState, useRef } from "react";
import { MoreVertical, ChevronDown, MoreHorizontal, Building2Icon, UsersIcon, MapPinIcon, BriefcaseIcon, CreditCardIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "@/hooks/use-toast";
import { Edit, Plus } from "lucide-react";
import icon from '@/components/AppIcon';
import { Atom } from "react-loading-indicators"
import AddUserModal from "@/app/content/Reports/employee/AddUserModal";
import AddCourseDialog from "@/app/content/LMS/components/AddCourseDialog";
import CreateAssessmentModal from "../../content/LMS/Assessment-Library/components/CreateAssessmentModal";
import { UserCircle, Search ,AlertCircle} from "lucide-react";
import Shepherd, { Tour } from "shepherd.js";
import 'shepherd.js/dist/css/shepherd.css';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interfaces
interface Employee {
  id: number | string;
  full_name: string;
  email: string;
  mobile: string;
  jobrole: string;
  profile_name: string;
  status: string;
  department_name: string;
  joined_date?: string;
  image?: string;
  sortConfig?: { key: string; direction: "asc" | "desc" } | null;
}

interface Task {
  id: number | string | null;
  task_title: string;
  task_type: string;
  task_date: string;
  status: string;
  allocatedUser: string;
  allocatedBy: string;
  image?: string;
}

interface Department {
  id: number;
  department: string;
}

// Update the GapAnalysisData interface
interface GapAnalysisData {
  title: string;
  totalLevels: number;
  currentLevel: number;
  gap: number;
  gapText: string;
  upskillingCandidates: {
    name: string;
    role: string;
    totalSkills: number;
    skillList: string;
    image?: string;
    skillLevel?: string; // Add skill level
  }[];
}

interface MySkill {
  jobrole_skill_id: number;
  jobrole: string;
  skill: string;
  skill_id: number;
  title: string;
  category: string;
  sub_category: string;
  description: string;
  proficiency_level: string;
  knowledge: string[];
  ability: string[];
}
interface MyGrowth {
  id: number;
  title: string;
  category: string;
  sub_category: string;
  description: string;
  department: string;
  sub_department: string;
  status: string;
  skill_level: string | null;
}

interface ChartData {
  label: string;
  value: number;
  status: string;
}



interface DashboardResponse {
  employeeList?: Employee[];
  today_task?: Task[];
  week_task?: Task[];
  // Statistics fields
  totle_employees?: number;
  umapped_employees?: number;
  totle_jobroles?: number;
  totle_skills?: number;
  // Widget data for dropdown
  widget?: string[];
  mySKill?: MySkill[];
  myGrowth?: MyGrowth[];
  current_level: number;
  departmentList?: Department[];
  skillHeatmap?: any;
  skillLevels?: any[];
}

// Interface for skills data in the matrix
interface SkillMatrixData {
  name: string;
  impact: number;
  availability: number;
  gap: "critical" | "high" | "medium" | "low";
}

// Interface for Course API Response
interface SuggestedCourseResponse {
  status: number;
  message: string;
  data: SuggestedCourse[];
}

interface SuggestedCourse {
  id: number;
  employee_id: number;
  course_id: number;
  course_name: string;
  task_id: number;
  task_title: string;
  sub_institute_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  create_by: null;
  updated_by: null;
  deleted_by: null;
}

// Task Progress Card API Response Interfaces
interface TaskProgressResponse {
  success: boolean;
  data: {
    daily: TaskPeriodData;
    weekly: TaskPeriodData;
    monthly: MonthlyTaskData;
  };
  message: string;
}

interface TaskPeriodData {
  count: number;
  tasks: TaskItem[];
  date_range?: {
    start: string;
    end: string;
  };
  date_wise_counts: DateWiseCount[];
}

interface MonthlyTaskData {
  count: number;
  tasks: TaskItem[];
  date_range?: {
    start: string;
    end: string;
  };
  month_wise_counts: MonthWiseCount[];
}

interface TaskItem {
  id: number;
  task_title: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

interface DateWiseCount {
  date: string;
  Completed: number;
  Pending: number;
  "In Progress": number;
  total: number;
  PENDING: number;
  COMPLETED?: number;
  IN_PROGRESS?: number;
}

interface MonthWiseCount {
  month: string;
  Completed: number;
  Pending: number;
  "In Progress": number;
  total: number;
  COMPLETED?: number;
  PENDING?: number;
  IN_PROGRESS?: number;
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [mySkills, setMySkills] = useState<MySkill[]>([]);
  const [myGrowth, setMyGrowth] = useState<MyGrowth[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isGapAnalysisOpen, setIsGapAnalysisOpen] = useState(false);
  const [selectedGapAnalysis, setSelectedGapAnalysis] = useState<GapAnalysisData | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [skillHeatmap, setSkillHeatmap] = useState<any>({});
  const [selectedCandidateSkills, setSelectedCandidateSkills] = useState<string[]>([]);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [expandedEmployeeIndex, setExpandedEmployeeIndex] = useState<number | null>(null);
  const [skillLevels, setSkillLevels] = useState([]);

  const [orgData, setOrgData] = useState<any>(null);
  const [sisterConcerns, setSisterConcerns] = useState<any[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssessmentModal, setOpenAssessmentModal] = useState(false);


  const toggleSkills = (index: number) => {
    setExpandedEmployeeIndex(expandedEmployeeIndex === index ? null : index);
  };
  const [searchTerm, setSearchTerm] = useState("");

  // Filter employees based on search term
  const globalFilteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.mobile?.includes(searchTerm) ||
    emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.jobrole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add these state variables to your component
  const [showActions, setShowActions] = useState<number | string | null>(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);


  // Add these handler functions
  const handleActionMenuClick = (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuCoords({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setShowActions(employee.id);
    setSelectedEmployee(employee);
  };

  const handleEditEmployeeMenu = (employee: Employee) => {
    console.log("Edit employee:", employee);
    setShowActions(null);
    // Implement your edit employee logic here
  };
  // Add this function at the top level of your component (with your other functions)
  const triggerMenuNavigation = (employeeId: number | string | null, menu: string) => {
    ;
    window.__currentMenuItem = menu;
    window.dispatchEvent(
      new CustomEvent('menuSelected', {
        detail: { menu, pageType: 'page', access: menu, pageProps: employeeId || null },
      })
    );
  };



  const handleAssignTaskMenu = (employee: Employee) => {
    console.log("Assign task to:", employee);
    setShowActions(null);
    triggerMenuNavigation(employee.id, 'task/taskManagement.tsx');
  };

  // Add useEffect to close menu when clicking outside
  // Add useEffect to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showActions !== null) {
        setShowActions(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActions]);



  const [stats, setStats] = useState({
    totalEmployees: 0,
    unmappedEmployees: 0,
    totalJobRoles: 0,
    totalSkills: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dailyChartData, setDailyChartData] = useState<ChartData[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<ChartData[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [widgetOptions, setWidgetOptions] = useState<string[]>([]);
  const [isWidgetDropdownOpen, setIsWidgetDropdownOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<MySkill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [maxLevel, setMaxLevel] = useState<number>(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  
  // Task Progress Card State
  const [taskProgressData, setTaskProgressData] = useState<TaskProgressResponse | null>(null);
  const [taskProgressLoading, setTaskProgressLoading] = useState<boolean>(true);
  const [taskProgressError, setTaskProgressError] = useState<string | null>(null);
  
  // Tooltip state for chart hover
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: string;
    completed: number;
    pending: number;
    inProgress: number;
    total: number;
  } | null>(null);
// Tour instance ref
  const tourRef = useRef<Tour | null>(null);

  const attrArray = [
    { title: "knowledge", icon: "mdi-book-open-page-variant" },
    { title: "ability", icon: "mdi-lightbulb-on" },
    { title: "behaviour", icon: "mdi-account-group" },
    { title: "attitude", icon: "mdi-emoticon-happy-outline" },
  ];

  const placeholderImage =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

  // Sample data for the Risk & Opportunity Matrix
  const skillsMatrixData: SkillMatrixData[] = [
    { name: "AI/ML", impact: 90, availability: 15, gap: "critical" },
    { name: "Cloud Security", impact: 85, availability: 30, gap: "high" },
    { name: "Data Analytics", impact: 80, availability: 65, gap: "medium" },
    { name: "Python", impact: 75, availability: 70, gap: "medium" },
    { name: "React", impact: 70, availability: 40, gap: "high" },
    { name: "Digital Marketing", impact: 65, availability: 75, gap: "low" },
    { name: "Content Strategy", impact: 60, availability: 80, gap: "low" },
    { name: "SEO/SEM", impact: 55, availability: 60, gap: "medium" },
    { name: "Node.js", impact: 50, availability: 45, gap: "high" },
    { name: "DevOps", impact: 85, availability: 25, gap: "critical" }
  ];

  // Check if sidebar is open
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

  // Initialize Shepherd.js tour
  useEffect(() => {
    // Check if we should trigger the tour (from sidebar tour navigation)
    const triggerTour = sessionStorage.getItem('triggerPageTour');

    // Store whether tour should start
    const shouldStartTour = triggerTour === 'dashboard';

    // Clear the trigger flag
    if (triggerTour) {
      sessionStorage.removeItem('triggerPageTour');
      console.log('Triggering dashboard tour from navigation...');
    }

    // Don't start tour if not triggered from sidebar
    if (!shouldStartTour) {
      console.log('Tour not triggered, skipping...');
      return;
    }

    // Create the tour
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

    // Define tour steps with proper typing
    const steps = [
      {
        id: 'welcome',
        title: 'Welcome to Your Dashboard!',
        text: 'Let\'s take a quick tour to help you navigate through all the amazing features available to you.',
        attachTo: {
          element: '#tour-header',
          on: 'bottom' as const
        },
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
            text: 'Start Tour',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'stats',
        title: 'Key Statistics',
        text: 'Here you can see your key metrics at a glance: Total Employees, Mapped Jobroles, and Total Skills.',
        attachTo: {
          element: '#tour-stats',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'chart',
        title: 'Weekly Task Progress',
        text: 'This chart shows your weekly task progress. Completed tasks appear in dark blue, in-progress in medium blue, and pending in light blue.',
        attachTo: {
          element: '#tour-chart',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'skills-heatmap',
        title: 'Enterprise Skills Heatmap',
        text: 'View skills gaps across departments. Click on any cell to drill down into detailed gap analysis.',
        attachTo: {
          element: '#tour-skills-heatmap',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'attendance-matrix',
        title: 'Employee Attendance Matrix',
        text: 'Track and manage employee attendance efficiently. Click on data points to view skill details.',
        attachTo: {
          element: '#tour-attendance-matrix',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'skill-profile',
        title: 'My Skill Profile',
        text: 'View your skills endorsed by peers and managers. Click "View More" to see detailed skill information.',
        attachTo: {
          element: '#tour-skill-profile',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'growth-opportunities',
        title: 'Growth Opportunities',
        text: 'Track your current role proficiency and view growth opportunities based on your skills.',
        attachTo: {
          element: '#tour-growth-opportunities',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'employee-table',
        title: 'Employee Directory',
        text: 'This table displays all employees. You can search, filter, and view employee details here.',
        attachTo: {
          element: '#tour-employee-table',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'today-tasks',
        title: 'Today\'s Tasks',
        text: 'View and manage your tasks for today. Click the + button to create new tasks.',
        attachTo: {
          element: '#tour-today-tasks',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'weekly-tasks',
        title: 'Weekly Tasks',
        text: 'Switch to this tab to view your weekly task progress and upcoming tasks.',
        attachTo: {
          element: '#tour-weekly-tasks',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'course-list',
        title: 'Course List',
        text: 'Browse available courses. Click the + button to add new courses.',
        attachTo: {
          element: '#tour-course-list',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Next',
            action: () => tour.next()
          }
        ]
      },
      {
        id: 'assessment-list',
        title: 'Assessment List',
        text: 'View and manage assessments. Click the + button to create new assessments.',
        attachTo: {
          element: '#tour-assessment-list',
          on: 'top' as const
        },
        buttons: [
          {
            text: 'Back',
            action: () => tour.back()
          },
          {
            text: 'Finish',
            action: () => {
              localStorage.setItem('dashboardTourCompleted', 'true');
              tour.complete();
            }
          }
        ]
      }
    ];

    // Add steps to tour
    steps.forEach(step => tour.addStep(step));

    // Store tour reference
    tourRef.current = tour;

    // Start tour after a short delay to ensure DOM is ready
    const startTimer = setTimeout(() => {
      console.log('Starting dashboard tour...');
      tour.start();
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      if (tourRef.current) {
        tourRef.current.cancel();
        tourRef.current = null;
      }
    };
  }, []);

  // Load session data once
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        sub_institute_id,
        org_type,
        user_id,
        user_profile_id,
        user_profile_name,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
        userProfileId: user_profile_id,
        userProfileName: user_profile_name,
      });
    }
  }, []);

  // Show today's pending tasks toast when Dashboard page opens
  useEffect(() => {
    if (todayTasks.length > 0) {
      const pendingCount = todayTasks.filter((task: Task) => task.status === "Pending" || task.status === "PENDING").length;
      
      if (pendingCount > 0) {
        toast({
          title: "Today's Pending Tasks",
          description: `You have ${pendingCount} pending task${pendingCount > 1 ? 's' : ''} for today.`,
          variant: "default",
        });
      }
    }
  }, [todayTasks]);

  // Fetch Task Progress Card data
  const fetchTaskProgress = async () => {
    if (!sessionData) return;
    try {
      setTaskProgressLoading(true);
      const apiUrl = `${sessionData.url}/api/tasks/counts?token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TaskProgressResponse = await response.json();
      setTaskProgressData(data);
      
      // Get today's date in consistent format (use local date to avoid UTC issues)
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
      
      // Calculate today's pending tasks only
      let todayPendingCount = 0;
      
      // Count from daily date_wise_counts for today
      if (data.data?.daily?.date_wise_counts) {
        const todayData = data.data.daily.date_wise_counts.find((d: any) => {
          const countDate = new Date(d.date).toLocaleDateString('en-CA');
          return countDate === todayStr;
        });
        if (todayData) {
          todayPendingCount += todayData.Pending || 0;
        }
      }
      
      // Also check weekly date_wise_counts for today
      if (data.data?.weekly?.date_wise_counts) {
        const todayData = data.data.weekly.date_wise_counts.find((d: any) => {
          const countDate = new Date(d.date).toLocaleDateString('en-CA');
          return countDate === todayStr;
        });
        if (todayData) {
          todayPendingCount += todayData.Pending || 0;
        }
      }
      
      localStorage.setItem('pendingTasksCount', todayPendingCount.toString());
      console.log('StatGrid dispatching taskCountUpdated:', todayPendingCount);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('taskCountUpdated', { detail: { count: todayPendingCount } }));
      
      setTaskProgressError(null);
    } catch (err) {
      console.error("Error fetching task progress data:", err);
      setTaskProgressError(err instanceof Error ? err.message : "Failed to fetch task data");
    } finally {
      setTaskProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskProgress();
  }, [sessionData, todayTasks, weekTasks]);

  // Fetch dashboard data
  useEffect(() => {
    if (!sessionData) return;

    async function fetchDashboard() {
      try {
        const res = await fetch(
          `${sessionData.url}/dashboard?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&user_id=${sessionData.userId}&user_profile_id=${sessionData.userProfileId}&user_profile_name=${sessionData.userProfileName}&org_type=${sessionData.orgType}&syear=2025`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        console.log("Dashboard API Response:", data);

        setEmployees(data.employeeList ?? []);
        const currentUser = data.employeeList?.find((emp: any) => emp.id == sessionData.userId);
        const userJobrole = currentUser?.jobrole;

        setTodayTasks(data.today_task ?? []);
        setWeekTasks(data.week_task ?? []);

        // Process daily chart data
        const dailyData: ChartData[] = [];
        const statusCounts = { COMPLETED: 0, IN_PROGRESS: 0, PENDING: 0 };
        data.today_task.forEach((task: any) => {
          if (task.status in statusCounts) {
            statusCounts[task.status as keyof typeof statusCounts]++;
          }
        });
        dailyData.push({ label: 'Completed', value: statusCounts.COMPLETED, status: 'COMPLETED' });
        dailyData.push({ label: 'In Progress', value: statusCounts.IN_PROGRESS, status: 'IN_PROGRESS' });
        dailyData.push({ label: 'Pending', value: statusCounts.PENDING, status: 'PENDING' });
        setDailyChartData(dailyData);
        setWidgetOptions(data.widget ?? []);
        
        // Fetch saved skill ratings and filter mySkills to only show rated skills
        const fetchRatedSkills = async () => {
          try {
            const currentJobroleId = currentUser?.jobrole_id || data.employeeList?.find((emp: any) => emp.id == sessionData.userId)?.jobrole_id;
            
            const ratingsRes = await fetch(
              `${sessionData.url}/table_data/?table=user_rating_details&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[user_id]=${sessionData.userId}&filters[jobrole_id]=${currentJobroleId}`
            );
            
            let ratedSkillIds: string[] = [];
            if (ratingsRes.ok) {
              const ratingsData = await ratingsRes.json();
              if (ratingsData.length > 0 && ratingsData[0].skill_ids) {
                const skillIdsObj = JSON.parse(ratingsData[0].skill_ids);
                ratedSkillIds = Object.keys(skillIdsObj);
              }
            }
            
            // Filter mySkills to only include rated skills
            const allSkills = data.mySKill ?? [];
            const ratedSkills = ratedSkillIds.length > 0 
              ? allSkills.filter((skill: any) => {
                  const skillId = skill.skill_id?.toString() || skill.jobrole_skill_id?.toString();
                  return ratedSkillIds.includes(skillId);
                })
              : allSkills;
            
            setMySkills(ratedSkills);
          } catch (err) {
            console.error("Error fetching rated skills:", err);
            setMySkills(data.mySKill ?? []);
          }
        };
        
        fetchRatedSkills();
        setMyGrowth(data.myGrowth ?? []);
        setDepartments(data.departmentList || []);
        setSkillHeatmap(data.skillHeatmap || {});
        // setSkillLevels(data.SkillLevels || []);


        // Extract unique skills from skillHeatmap
        const allSkills = new Set<string>();
        if (data.skillHeatmap) {
          Object.values(data.skillHeatmap).forEach((deptData: any) => {
            Object.keys(deptData).forEach(skill => {
              allSkills.add(skill);
            });
          });
        }
        setSkills(Array.from(allSkills));
        setSkillLevels(data.SkillLevels || []);
        console.log("Extracted Skills:", Array.from(skillLevels));
        const apiLevel = data.current_level ?? 0;
        setCurrentLevel(apiLevel);

        // update max level dynamically
        setMaxLevel((prevMax) => (apiLevel > prevMax ? apiLevel : prevMax));

        setStats({
          totalEmployees: data.totle_employees ?? 0,
          unmappedEmployees: data.mapped_jobrole ?? 0,
          totalJobRoles: data.totle_jobroles ?? 0,
          totalSkills: data.totle_skills ?? 0,
        });

        // Fetch suggested courses from new API
        try {
          const courseApiUrl = `${sessionData.url}/getSuggestedCoursesByUser?user_id=${sessionData.userId}&sub_institute_id=${sessionData.subInstituteId}`;
          
          const courseRes = await fetch(courseApiUrl);
          if (!courseRes.ok) throw new Error(`Course API error: ${courseRes.status}`);
          
          const courseData: SuggestedCourseResponse = await courseRes.json();
          
          // Map the new API response to the courses state
          const mappedCourses: any[] = courseData.data?.map((item: SuggestedCourse) => ({
            id: item.id,
            title: item.course_name,
            description: '',
            thumbnail: placeholderImage,
            jobrole: '',
            category: 'Suggested Course',
            enrollment_status: null,
            course_id: item.course_id,
            task_id: item.task_id,
            task_title: item.task_title,
            employee_id: item.employee_id,
            sub_institute_id: item.sub_institute_id,
            created_at: item.created_at,
            updated_at: item.updated_at
          })) || [];
          
          setCourses(mappedCourses);
        } catch (err) {
          console.error("Error fetching suggested courses:", err);
          setCourses([]);
        }

        // Fetch assessments
        try {
          const assessmentUrl = sessionData.userProfileName === "Admin"
            ? `${sessionData.url}/lms/assessment_master?type=API&sub_institute_id=${sessionData.subInstituteId}&syear=2025&user_id=${sessionData.userId}&user_profile_name=${sessionData.userProfileName}`
            : `${sessionData.url}/lms/assessment_master?type=API&sub_institute_id=${sessionData.subInstituteId}&syear=2025&user_id=${sessionData.userId}&user_profile_name=${sessionData.userProfileName}&jobrole=${encodeURIComponent(userJobrole)}&department=${encodeURIComponent(currentUser?.department_name || '')}`;

          const assessmentRes = await fetch(assessmentUrl);
          if (!assessmentRes.ok) throw new Error(`Assessment API error: ${assessmentRes.status}`);
          const assessmentData = await assessmentRes.json();
          const mappedAssessments: any[] = [];
          if (assessmentData?.data && Array.isArray(assessmentData.data)) {
            assessmentData.data.forEach((item: any) => {
              const assessment = {
                id: item.id,
                title: item.paper_name,
                description: item.paper_desc,
                thumbnail: placeholderImage, // No image in data
                jobrole: item.jobrole || '', // Not in data, placeholder
                category: item.grade_name || item.standard_name || 'General',
                status: item.status || 'Active', // Add status if needed
                openDate: item.open_date,
                closeDate: item.close_date,
                totalQuestions: item.total_ques,
                totalMarks: item.total_marks,
                duration: item.time_allowed,
                examType: item.exam_type,
              };
              mappedAssessments.push(assessment);
            });
          }
          setAssessments(mappedAssessments);
        } catch (err) {
          console.error("Error fetching assessments:", err);
        }

        // Chart data processing...
        if (data.week_task && data.week_task.length > 0) {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const formatDate = (date: Date) => date.toISOString().split("T")[0];
          const weeklyData: Record<string, { count: number; status: string }> =
            {};
          for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dayKey = formatDate(date);
            weeklyData[dayKey] = { count: 0, status: "NO_TASKS" };
          }
          data.week_task.forEach((task: any) => {
            if (!task.task_date) return;
            const taskDate = new Date(task.task_date);
            const taskDayKey = formatDate(taskDate);
            if (taskDayKey in weeklyData) {
              weeklyData[taskDayKey].count += 1;
              const currentStatus = weeklyData[taskDayKey].status;
              if (task.status === "COMPLETED") {
                weeklyData[taskDayKey].status = "COMPLETED";
              } else if (
                task.status === "IN_PROGRESS" &&
                currentStatus !== "COMPLETED"
              ) {
                weeklyData[taskDayKey].status = "IN_PROGRESS";
              } else if (
                task.status === "PENDING" &&
                currentStatus !== "COMPLETED" &&
                currentStatus !== "IN_PROGRESS"
              ) {
                weeklyData[taskDayKey].status = "PENDING";
              }
            }
          });
          const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const processedChartData = Object.keys(weeklyData)
            .sort()
            .map((date) => {
              const dayDate = new Date(date);
              return {
                label: daysOfWeek[dayDate.getDay()].substring(0, 3),
                value: weeklyData[date].count,
                status: weeklyData[date].status,
              };
            });
          setChartData(processedChartData);
          setWeeklyChartData(processedChartData);
          setMonthlyChartData(processedChartData);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [sessionData]);

  // Update your organization data fetch useEffect
  useEffect(() => {
    if (!sessionData) return;

    const fetchOrgData = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/settings/organization_data?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`
        );

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        console.log("Organization API Response Data:", data);

        // Extract the first organization from the array
        const organization = data.org_data && data.org_data.length > 0 ? data.org_data[0] : null;
        setOrgData(organization);
        // Check both locations
        const sistersFromRoot = data.sisters_org || [];
        const sistersFromOrg = organization?.sisters_org || [];
        const sistersFromOrgData = organization?.org_data?.sisters_org || [];

        console.log("Sisters from root:", sistersFromRoot);
        console.log("Sisters from org:", sistersFromOrg);
        console.log("Sisters from org_data:", sistersFromOrgData);

        // Check if sisters_org exists in the response data
        setSisterConcerns(sistersFromRoot.length > 0 ? sistersFromRoot :
          sistersFromOrg.length > 0 ? sistersFromOrg :
            sistersFromOrgData);
      } catch (err) {
        console.error("Error fetching organization data:", err);
      }
    };

    fetchOrgData();
  }, [sessionData]);

  useEffect(() => {
    console.log("Current orgData state:", orgData);
    console.log("Current sisterConcerns state:", sisterConcerns);

    if (orgData) {
      console.log("Organization fields:", {
        legal_name: orgData.legal_name,
        industry: orgData.industry,
        cin: orgData.cin,
        pan: orgData.pan,
        employee_count: orgData.employee_count,
        registered_address: orgData.registered_address,
        logo: orgData.logo
      });
    }
  }, [orgData, sisterConcerns]);
  // Chart bar color based on task status
  // ✅ Completed → Green line
  // 🔵 In Progress → Blue line
  // 🟡 Pending → Yellow line
  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "COMPLETED":
      case "DONE":
        return "bg-green-500 hover:bg-green-400";
      case "IN_PROGRESS":
      case "INPROGRESS":
      case "PROGRESS":
        return "bg-blue-500 hover:bg-blue-400";
      case "PENDING":
      case "WAITING":
        return "bg-yellow-400 hover:bg-yellow-300";
      default:
        return "bg-gray-300 hover:bg-gray-200";
    }
  };

  // Get bar color based on task counts (for bar chart visualization)
  // Color priority: Completed > In Progress > Pending
  const getBarColor = (completed: number, inProgress: number, pending: number) => {
    if (completed > 0) return "bg-green-500 hover:bg-green-400";
    if (inProgress > 0) return "bg-blue-500 hover:bg-blue-400";
    if (pending > 0) return "bg-yellow-400 hover:bg-yellow-300";
    return "bg-gray-300 hover:bg-gray-200";
  };

  // Get bar color based on task status - returns color based on highest priority status present
  const getTaskBarColor = (Completed: number, InProgress: number, Pending: number) => {
    if (Completed > 0) return "bg-green-500 hover:bg-green-400";
    if (InProgress > 0) return "bg-blue-500 hover:bg-blue-400";
    if (Pending > 0) return "bg-yellow-400 hover:bg-yellow-300";
    return "bg-gray-300 hover:bg-gray-200";
  };

  // Render stacked task bar chart with combined colors in single bar
  const renderTaskBarChart = (data: any[], isMonthly: boolean = false) => {
    const maxValue = Math.max(...data.map(d => d.total), 1);
    const chartHeight = 192; // h-48 = 192px

    return (
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 h-48 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-10 h-48 flex items-end gap-3">
          {data.map((item, i) => {
            const completed = item.COMPLETED ?? item.Completed ?? 0;
            const inProgress = item.IN_PROGRESS ?? item["In Progress"] ?? 0;
            const pending = item.PENDING ?? item.Pending ?? 0;
            const total = item.total;
            
            // Calculate heights for stacked bar
            // Bar height represents the total count
            const barHeight = total > 0 ? (total / maxValue) * chartHeight : 0;
            // Segment heights are proportional to their counts relative to total
            const completedHeight = total > 0 ? (completed / total) * barHeight : 0;
            const inProgressHeight = total > 0 ? (inProgress / total) * barHeight : 0;
            const pendingHeight = total > 0 ? (pending / total) * barHeight : 0;
            
            return (
              <div 
                key={i} 
                className="flex flex-col items-center flex-1 cursor-pointer group"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipData({
                    visible: true,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    date: isMonthly ? item.month : item.date,
                    completed,
                    pending,
                    inProgress,
                    total: item.total
                  });
                }}
                onMouseLeave={() => setTooltipData(null)}
              >
                {/* Stacked bar container */}
                <div className="w-8 h-40 flex flex-col justify-end rounded-t overflow-hidden">
                  {/* Pending bar (bottom) */}
                  <div 
                    className="w-full bg-yellow-400 transition-all duration-200 group-hover:bg-yellow-500"
                    style={{ height: `${pendingHeight}px` }}
                    title={`Pending: ${pending}`}
                  />
                  {/* In Progress bar (middle) */}
                  <div 
                    className="w-full bg-blue-500 transition-all duration-200 group-hover:bg-blue-600"
                    style={{ height: `${inProgressHeight}px` }}
                    title={`In Progress: ${inProgress}`}
                  />
                  {/* Completed bar (top) */}
                  <div 
                    className="w-full bg-green-500 transition-all duration-200 group-hover:bg-green-600"
                    style={{ height: `${completedHeight}px` }}
                    title={`Completed: ${completed}`}
                  />
                </div>
                {/* Total value label */}
                <span className="text-xs text-gray-700 font-medium mt-1">
                  {total > 0 ? total : '-'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {isMonthly ? item.month : item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render proportional task bar with multiple colors (legacy - kept for compatibility)
  const renderProportionalTaskBar = (Completed: number, InProgress: number, Pending: number, total: number) => {
    if (total === 0) {
      return <div className="w-full bg-gray-200 rounded" style={{ height: '4px' }} />;
    }

    const completedPercent = (Completed / total) * 100;
    const inProgressPercent = (InProgress / total) * 100;
    const pendingPercent = (Pending / total) * 100;

    return (
      <div className="w-full flex rounded overflow-hidden" style={{ height: '100%', minHeight: '4px' }}>
        {completedPercent > 0 && (
          <div 
            className="bg-green-500 transition-colors" 
            style={{ width: `${completedPercent}%` }}
            title={`Completed: ${Completed}`}
          />
        )}
        {inProgressPercent > 0 && (
          <div 
            className="bg-blue-500 transition-colors" 
            style={{ width: `${inProgressPercent}%` }}
            title={`In Progress: ${InProgress}`}
          />
        )}
        {pendingPercent > 0 && (
          <div 
            className="bg-yellow-400 transition-colors" 
            style={{ width: `${pendingPercent}%` }}
            title={`Pending: ${Pending}`}
          />
        )}
      </div>
    );
  };

  const renderChart = (data: ChartData[]) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    return (
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 h-48 sm:h-56 md:h-64 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.8)}</span>
          <span>{Math.round(maxValue * 0.6)}</span>
          <span>{Math.round(maxValue * 0.4)}</span>
          <span>{Math.round(maxValue * 0.2)}</span>
          <span>0</span>
        </div>

        {/* Chart content */}
        <div className="ml-6 h-48 sm:h-56 md:h-64 flex justify-between items-end gap-2">
          {data.map((item, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={`w-full rounded-t ${getStatusColor(item.status)}`}
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: item.value > 0 ? '4px' : '0'
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get color for matrix points based on gap level
  const getGapColor = (gap: string) => {
    switch (gap) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-400";
      case "medium":
        return "bg-blue-400";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const handleColumnFilter = (columnKey: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value.toLowerCase()
    }));
  };

  // Update the filteredEmployees to include column filtering
  const filteredEmployees = employees.filter(emp => {
    // Global search
    const globalMatch =
      emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.mobile?.includes(searchTerm) ||
      emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobrole?.toLowerCase().includes(searchTerm.toLowerCase());

    // Column-specific filters
    const columnMatch = Object.entries(columnFilters).every(([key, filterValue]) => {
      if (!filterValue) return true;

      const cellValue = emp[key as keyof Employee];
      if (typeof cellValue === 'string') {
        return cellValue.toLowerCase().includes(filterValue);
      }
      return true;
    });

    return globalMatch && columnMatch;
  });

  // Get color for skill heatmap cells based on gap value
  const getSkillGapColor = (totalEmp: number, requiredEmp: number) => {
    if (totalEmp === 0) return "bg-red-500"; // Critical gap - no employees
    const gapPercentage = (requiredEmp - totalEmp) / requiredEmp;

    if (gapPercentage >= 0.5) return "bg-red-500"; // Critical gap
    if (gapPercentage >= 0.3) return "bg-orange-400"; // High gap
    if (gapPercentage >= 0.1) return "bg-yellow-400"; // Medium gap
    return "bg-green-500"; // Healthy
  };

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  // Check if a widget should be shown based on selection
  const shouldShowWidget = (widgetName: string) => {
    if (!selectedWidget) return true; // Show all if none selected
    return selectedWidget === widgetName;
  };

  // Handle skill selection in the matrix
  const handleSkillSelect = (skillName: string) => {
    // If already selected, deselect
    if (selectedSkill && selectedSkill.skill === skillName) {
      setSelectedSkill(null);
    } else {
      // Find in mySkills if available, else just set a dummy object for matrix
      const foundSkill = mySkills.find(skill => skill.skill === skillName) || null;
      setSelectedSkill(foundSkill);
    }
  };
  //
  // Enhanced function to handle multiple separators
  // More robust function with fallback
  const handleSkillListClick = (skillList: string) => {
    let skills: string[] = [];

    if (skillList && typeof skillList === 'string') {
      // Try multiple separators
      const separators = /[,;|/]/;
      skills = skillList.split(separators)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
    } else {
      skills = ['No skills listed'];
    }

    setSelectedCandidateSkills(skills);
    setIsSkillsModalOpen(true);
  };

  // Add this function to handle cell clicks
  const handleCellClick = (department: string, skill: string, totalEmp: number, requiredEmp: number, skillData: any[]) => {
    // Get levels from API data or use defaults
    const skillLevels = skillData?.find((emp: any) => emp.skill_level)?.skill_level || skill;
    // If your API has max_level field
    const totalLevels = skillData?.find((emp: any) => emp.max_level)?.max_level || 3;
    const currentLevel = parseInt(skillLevels.replace("Level ", ""))
    const gap = (currentLevel) ? totalLevels - currentLevel : 0;


    const gapData: GapAnalysisData = {
      title: `${skill} in ${department}`,
      totalLevels: totalLevels,
      currentLevel: currentLevel,
      gap: gap,
      gapText: gap > 0 ? `${gap} more levels needed` : "Maximum level achieved",
      upskillingCandidates: skillData?.map((employee: any) => ({
        name: employee.user_name || "Unknown Employee",
        role: employee.jobrole || "Unknown Role",
        totalSkills: employee.total_skills || 0,
        skillList: employee.skillList || "No skills listed",
        image: employee.image ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${employee.image}` : placeholderImage,
        skillLevel: employee.skill_level || "Level 1" // Add skill level from API
      })) || []
    };


    setSelectedGapAnalysis(gapData);
    setIsGapAnalysisOpen(true);
  };

  // Convert skill_level to percent
  const getLevelPercent = (level: string | null): number => {
    switch (level) {
      case "Level 1":
        return 25;
      case "Level 2":
        return 50;
      case "Level 3":
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }
  const currentPercent =
    maxLevel > 0 ? Math.min(100, Math.round((currentLevel / maxLevel) * 100)) : 0;


  return (
    <div className={`min-h-[90vh] text-gray-900 transition-all duration-300 ${isSidebarOpen ? "ml-0 md:ml-60" : "ml-0 md:ml-10"}`}>
      {/* 🔹 Header: Welcome + Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow p-4 mb-6 gap-4 " id="tour-header">

        {/* Welcome with icon */}
        <div className="flex items-center gap-2">
          <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">
            Welcome, {sessionData?.userProfileName || "User"}
          </h1>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64" id="tour-search">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Section - Adjust column span based on sidebar state */}
        <div className="col-span-full md:col-span-9 space-y-6">
          {/* Stats + Chart - Always visible */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-y border rounded-lg overflow-hidden flex-1" id="tour-stats">
                <div className="flex items-center gap-3 border-b border-r pb-4 pr-6">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded bg-blue-300 mb-7" />
                    <div>
                      <p className="font-bold text-gray-700">Total Employee</p>
                      <p className="text-2xl font-bold text-center mt-3">{stats.totalEmployees}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b pl-6 pb-4">
                  <div className="flex items-center gap-3 p-1">
                    <div className="w-9 h-9 rounded bg-red-300 mb-7" />
                    <div>
                      <p className="font-bold text-gray-700">Mapped Jobrole</p>
                      <p className="text-2xl font-bold text-center mt-3">{stats.unmappedEmployees}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-r pt-4 pr-6">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded bg-green-300 mb-9" />
                    <div>
                      <p className="font-bold text-gray-700 mb-5">Total Job role</p>
                      <p className="text-2xl font-bold text-center">{stats.totalJobRoles}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 pl-6">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded bg-yellow-300 mb-9" />
                    <div>
                      <p className="font-bold text-gray-700 mb-5">Total Skill</p>
                      <p className="text-2xl font-bold text-center">{stats.totalSkills}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-lg shadow p-4" id="tour-chart">
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <h2 className="font-semibold text-center">Task Progress</h2>
                    <button 
                      onClick={() => {
                        const userData = localStorage.getItem("userData");
                        if (userData) {
                          const { token, sub_institute_id, user_id } = JSON.parse(userData);
                          fetch(`${sessionData.url}/api/tasks/counts?token=${token}&sub_institute_id=${sub_institute_id}&user_id=${user_id}`)
                            .then(res => res.json())
                            .then(data => {
                              setTaskProgressData(data);
                              setTaskProgressError(null);
                            })
                            .catch(err => {
                              console.error("Error refreshing task data:", err);
                              setTaskProgressError(err instanceof Error ? err.message : "Failed to refresh");
                            });
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Refresh task data"
                    >
                      {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={taskProgressLoading ? "animate-spin" : ""}>
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg> */}
                    </button>
                  </div>
                  
                  {taskProgressLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : taskProgressError ? (
                    <div className="flex items-center justify-center h-48 text-red-500">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Error: {taskProgressError}</span>
                    </div>
                  ) : taskProgressData && taskProgressData.success ? (
                    <Tabs defaultValue="weekly" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      </TabsList>
                      
                      {/* Daily */}
                      <TabsContent value="daily">
                        {taskProgressData.data.daily.date_wise_counts.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-0 h-48 flex flex-col justify-between text-xs text-gray-500">
                              <span>{Math.max(...taskProgressData.data.daily.date_wise_counts.map(d => d.total))}</span>
                              <span>{Math.round(Math.max(...taskProgressData.data.daily.date_wise_counts.map(d => d.total)) * 0.8)}</span>
                              <span>{Math.round(Math.max(...taskProgressData.data.daily.date_wise_counts.map(d => d.total)) * 0.6)}</span>
                              <span>{Math.round(Math.max(...taskProgressData.data.daily.date_wise_counts.map(d => d.total)) * 0.4)}</span>
                              <span>{Math.round(Math.max(...taskProgressData.data.daily.date_wise_counts.map(d => d.total)) * 0.2)}</span>
                              <span>0</span>
                            </div>
                            <div className="ml-6 h-48 flex justify-between items-end gap-2">
                              {taskProgressData.data.daily.date_wise_counts.map((item, i) => {
                                return (
                                  <div 
                                    key={i} 
                                    className="flex flex-col items-center flex-1 cursor-pointer"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setTooltipData({
                                        visible: true,
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
                                        date: item.date,
                                        completed: item.COMPLETED ?? item.Completed ?? 0,
                                        pending: item.PENDING ?? item.Pending ?? 0,
                                        inProgress: item.IN_PROGRESS ?? item["In Progress"] ?? 0,
                                        total: item.total
                                      });
                                    }}
                                    onMouseLeave={() => setTooltipData(null)}
                                  >
                                    {renderProportionalTaskBar(item.COMPLETED ?? item.Completed ?? 0, item.IN_PROGRESS ?? item["In Progress"] ?? 0, item.PENDING ?? item.Pending ?? 0, item.total)}
                                    <span className="text-xs text-gray-500 mt-2">
                                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            
                         {tooltipData && tooltipData.visible && (
  <div
   className="fixed z-50 w-52 rounded-lg bg-white text-gray-800 text-xs shadow-lg border border-gray-200 p-3 pointer-events-none transition-opacity duration-150"

    style={{
      left: tooltipData.x,
      top: tooltipData.y - 10,
      transform: "translateX(-50%) translateY(-100%)",
    }}
  >
    {/* Date */}
    <div className="text-sm font-semibold text-center mb-2 text-gray-700">
      {tooltipData.date}
    </div>

    {/* Status rows */}
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-green-500">Completed</span>
        <span className="font-medium">{tooltipData.completed}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-blue-500">In Progress</span>
        <span className="font-medium">{tooltipData.inProgress}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-yellow-400">Pending</span>
        <span className="font-medium">{tooltipData.pending}</span>
      </div>
    </div>

    {/* Total */}
    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-semibold text-gray-700">
      <span>Total</span>
      <span>{tooltipData.total}</span>
    </div>
  </div>
)}

                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">No daily data</p>
                        )}
                      </TabsContent>
                      
                      {/* Weekly */}
                      <TabsContent value="weekly">
                        {taskProgressData.data.weekly.date_wise_counts.length > 0 ? (
                          <div className="py-4">
                            {renderTaskBarChart(taskProgressData.data.weekly.date_wise_counts, false)}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">No weekly data</p>
                        )}
                      </TabsContent>
                      
                      {/* Monthly */}
                      <TabsContent value="monthly">
                        {taskProgressData.data.monthly.month_wise_counts.length > 0 ? (
                          <div className="py-4">
                            {renderTaskBarChart(taskProgressData.data.monthly.month_wise_counts, true)}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">No monthly data</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No task data available</p>
                  )}

                  {/* Chart Legend */}
                  <div className="flex justify-center mt-4 gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>No Tasks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Conditional rendering based on user role */}
          {sessionData?.userProfileName === "Admin" ? (
            // Admin view - Skills Heatmap
            <div className="grid grid-cols-1 gap-4">
              {/* Left: Enterprise Skills Heatmap */}
              <div className="bg-white rounded-xl shadow p-4" id="tour-skills-heatmap">
                <h2 className="font-semibold text-lg mb-2">Department Skills Heatmap</h2>

                {/* Legend */}
                <div className="flex gap-4 text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-red-500" /> Critical Gap
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-orange-400" /> Moderate Gap
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-green-500" /> Healthy
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-gray-300" /> No Data
                  </span>
                </div>

                {/* Heatmap Table */}
                <div className="h-64 sm:h-88 overflow-x-auto scrollbar-hide">
                  <table className="w-full border-separate border-spacing-1 text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="px-3 py-2">Department</th>

                        {skillLevels.map((level: any, key) => (
                          <th key={key} className="px-3 py-2 text-center">
                            {level.proficiency_level}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.id}>
                          <td className="px-3 py-2 font-medium bg-gray-100">
                            {dept.department}
                          </td>

                          {skills.map((skill) => {
                            const deptData = skillHeatmap[dept.department] || {};
                            const skillData = deptData[skill];
                            const totalEmp = skillData?.total_emp || 0;

                            // Get the required number from your data instead of hardcoding
                            const requiredEmp = skillData?.required_level || 0;

                            // Assign colors based on employee count compared to requirement
                            let cellColor = "bg-gray-300"; // default color for missing data
                            let displayValue = "";
                            if (totalEmp === 0) {
                              cellColor = "bg-red-400"; // critical gap 
                            } else if (totalEmp === 1) {
                              cellColor = "bg-orange-400"; // warning 
                            } else if (totalEmp === 2) {
                              cellColor = "bg-green-500"; // good 
                            } else {
                              cellColor = "bg-blue-500"; // optional for >2 
                            }

                            return (
                              <td
                                key={skill}
                                className={`text-white text-center rounded-sm cursor-pointer transition-colors p-2 ${cellColor} hover:opacity-80`}
                                onClick={() => handleCellClick(
                                  dept.department,
                                  skill,
                                  totalEmp,
                                  requiredEmp, // Pass the actual required level
                                  skillData?.skillData || [] // Pass the skillData array
                                )}
                              >
                                {totalEmp}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Click on any cell to drill down into detailed gap analysis
                </p>
              </div>
              {/* Gap Analysis Dialog */}
              <>
                {/* Gap Analysis Dialog */}
                <Dialog open={isGapAnalysisOpen} onOpenChange={setIsGapAnalysisOpen}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 hide-scroll">
                    <DialogHeader>
                      <DialogTitle>Gap Analysis</DialogTitle>
                    </DialogHeader>
                    {selectedGapAnalysis && (
                      <div className="space-y-6">
                        {/* Header */}
                        <div>
                          <h2 className="text-1xl mt-2">{selectedGapAnalysis.title}</h2>
                        </div>

                        {/* Total Levels and Current Level */}
                        <div className="flex justify-between items-center grid-cols-2 border rounded-lg p-4 bg-gray-50">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{selectedGapAnalysis.totalLevels}</div>
                            <div className="text-sm mt-1">Required Level</div>
                          </div>

                          <div className="text-center">
                            <div className="text-3xl font-bold">{selectedGapAnalysis.currentLevel}</div>
                            <div className="text-sm mt-1">Current Level</div>
                          </div>
                        </div>

                        {/* Gap */}
                        <div className="bg-red-200 text-center border-t border-b border-gray-300 py-4">
                          <h3 className="text-red text-xl font-bold ">Gap: {selectedGapAnalysis.gap}</h3>
                          <p className="text-sm mt-1 ">{selectedGapAnalysis.gapText}</p>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-gray-300"></div>

                        {/* Upskilling Candidates with their actual levels */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Upskilling Candidates</h3>
                          <div className="space-y-4">
                            {selectedGapAnalysis.upskillingCandidates.map((candidate, index) => {
                              // Parse the skillList to handle multiple skills separated by commas
                              const skills = candidate.skillList
                                ? candidate.skillList.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
                                : ['No skills listed'];

                              return (
                                <div key={index} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={candidate.image || placeholderImage}
                                        alt={candidate.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = placeholderImage;
                                        }}
                                      />
                                      <div>
                                        <div className="font-medium">{candidate.name}</div>
                                        <div className="text-sm text-gray-600">{candidate.role}</div>
                                      </div>
                                    </div>
                                    <div
                                      className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 cursor-pointer hover:bg-blue-200"
                                      onClick={() => toggleSkills(index)}
                                    >
                                      {candidate.totalSkills} Skills
                                    </div>
                                  </div>

                                  {/* Skills list that appears when clicked */}
                                  {expandedEmployeeIndex === index && (
                                    <div className="mt-3 pl-12">
                                      <h4 className="text-sm font-semibold mb-2">Skills:</h4>
                                      <div className="space-y-2">
                                        {skills && skills.length > 0 ? (
                                          // split skills string if it contains |||
                                          skills
                                            .join("|||") // In case skills is array of strings
                                            .split("|||")
                                            .map((skill, skillIndex) => (
                                              <div
                                                key={skillIndex}
                                                className="flex items-center gap-2 p-2 bg-gray-100 rounded"
                                              >
                                                <span className="mdi mdi-check-circle text-green-500 text-sm"></span>
                                                <span className="text-sm">{skill.trim()}</span>
                                              </div>
                                            ))
                                        ) : (
                                          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                            <span className="mdi mdi-alert-circle text-yellow-500 text-sm"></span>
                                            <span className="text-sm">No skills listed</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            </div>
          ) : (

            // Non-admin view - Skill Profile and Growth Opportunities
            <div className="space-y-6">
              {/* My Skill Profile */}
              <div className="p-4 bg-white rounded-lg shadow min-h-[27.5rem] h-110 md:h-128 overflow-y-auto hide-scroll" id="tour-skill-profile">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-1">
                  <span>🧑‍💻</span> My Skill Profile
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Skills endorsed by peers and managers
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {mySkills.length > 0 ? (
                    mySkills.map((skill) => (
                      <div
                        key={skill.jobrole_skill_id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium">{skill.skill}</p>
                          <p className="flex items-center gap-2 mt-1 text-sm">{skill.jobrole}

                            {/* <div className="flex items-center gap-2 mt-1 text-sm"> */}
                            <span className="mdi mdi-chart-bar"></span>&nbsp;&nbsp;{" "}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${Number(skill.proficiency_level) >= 5
                                ? "bg-green-100 text-green-600"
                                : Number(skill.proficiency_level) >= 3
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-blue-100 text-blue-600"
                                }`}
                            >
                              {skill.proficiency_level}
                            </span>
                          </p>
                          {/* </div> */}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedSkill(skill);
                            setIsEditModalOpen(true);
                          }}
                          className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          View More
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills found</p>
                  )}
                </div>
              </div>

              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
                  <DialogHeader>
                    <DialogTitle>
                      <span className="mdi mdi-brain"></span>{" "}
                      {selectedSkill?.skill ?? "Skill Details"}
                    </DialogTitle>
                  </DialogHeader>
                  <hr className="m-0 mx-2" />

                  {selectedSkill ? (
                    <div className="w-full">
                      {/* Top Info */}
                      <div className="flex gap-4 px-4">
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-briefcase"></span>&nbsp;
                          <label className="text-bold">Jobrole</label>
                          <hr className="my-2" />
                          {selectedSkill.jobrole}
                        </div>
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-tag-multiple"></span>&nbsp;
                          <label className="text-bold">Category</label>
                          <hr className="my-2" />
                          {selectedSkill.category}
                        </div>
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-tag"></span>&nbsp;
                          <label className="text-bold">Sub-Category</label>
                          <hr className="my-2" />
                          {selectedSkill.sub_category}
                        </div>
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-chart-bar"></span>&nbsp;
                          <label className="text-bold">Proficiency</label>
                          <hr className="my-2" />
                          {selectedSkill.proficiency_level}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="px-4 mt-4">
                        <div className="w-full bg-[#eaf7f2] p-2 rounded-md">
                          <span className="mdi mdi-information-variant-circle"></span>
                          &nbsp;
                          <label className="text-bold">Description</label>
                          <hr className="my-2" />
                          {selectedSkill.description}
                        </div>
                      </div>

                      {/* Knowledge & Ability */}
                      <div className="flex gap-4 px-4 mt-4">
                        {attrArray.map((attr, key) => (
                          <div
                            key={key}
                            className="w-1/2 bg-blue-100 flex rounded-2xl shadow p-2"
                          >
                            <div className="py-2 w-full">
                              <h4 className="font-semibold mb-2">
                                <span className={`mdi ${attr.icon} text-xl`}></span>{" "}
                                {attr.title.charAt(0).toUpperCase() +
                                  attr.title.slice(1)}
                              </h4>
                              <hr className="mb-2" />
                              <div className="w-full h-[calc(40vh)] overflow-y-auto hide-scrollbar">
                                {(selectedSkill[attr.title as keyof MySkill] as any[])?.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="w-full bg-white p-2 rounded-lg mb-2"
                                    >
                                      <p className="text-sm">{item}</p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>No Skill details found</p>
                  )}

                  <DialogFooter>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Close
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* My Growth Opportunities */}
              <div className="bg-white border rounded-xl p-5 w-full col-span-12 -mx-1 px-6" id="tour-growth-opportunities">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-2">
                  ⊚ My Growth Opportunities
                </h2>

                {/* Current Role Proficiency - Now calculated as average of all skills */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Current Role Proficiency</p>
                  <p className="text-green-600 font-semibold">
                    {myGrowth.length > 0
                      ? `${Math.round(myGrowth.reduce((sum, item) => sum + getLevelPercent(item.skill_level), 0) / myGrowth.length)}%`
                      : "0%"
                    }
                  </p>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded">
                  <div
                    className="h-3 bg-gray-900 rounded"
                    style={{
                      width: myGrowth.length > 0
                        ? `${Math.round(myGrowth.reduce((sum, item) => sum + getLevelPercent(item.skill_level), 0) / myGrowth.length)}%`
                        : "0%"
                    }}
                  ></div>
                </div>

                {/* Skills List from API */}
                <div className="mt-4 space-y-2">
                  {myGrowth.length > 0 ? (
                    myGrowth.map((item) => {
                      const percent = getLevelPercent(item.skill_level);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{item.title}</span>
                          <div className="flex items-center gap-2 w-40">
                            <div className="flex-1 h-2 bg-gray-100 rounded">
                              <div
                                className="h-2 bg-gray-900 rounded"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-800 font-medium">{percent}%</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No growth opportunities found</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Employee Table - Full width row */}
          <div className="col-span-full md:col-span-9 bg-white rounded-xl shadow min-h-[24rem] h-96 md:h-[28rem] overflow-x-auto md:overflow-x-visible overflow-y-auto hide-scroll mb-15 " id="tour-employee-table">
              {/* <h2 className="font-semibold text-lg p-4 border-b">Employee List</h2> */}

              {/* Table Headers with Search Fields */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] bg-blue-100 px-4 py-2 font-medium text-sm gap-2">
                {/* Employee Column with Search */}
                <div className="flex flex-col">
                  <span className="flex items-center mb-1">Employee</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-1 text-xs"
                    onChange={(e) => handleColumnFilter("full_name", e.target.value)}
                  />
                </div>
                {/* Department Column with Search */}
                <div className="flex flex-col">
                  <span className="flex items-center mb-1">Department</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-1 text-xs"
                    onChange={(e) => handleColumnFilter("department_name", e.target.value)}
                  />
                </div>

                {/* Role Column with Search */}
                <div className="flex flex-col">
                  <span className="flex items-center mb-1">Job Role</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-1 text-xs"
                    onChange={(e) => handleColumnFilter("jobrole", e.target.value)}
                  />
                </div>

                {/* profile Column with Search */}
                <div className="flex flex-col">
                  <span className="flex items-center mb-1">profile</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-1 text-xs"
                    onChange={(e) => handleColumnFilter("profile_name", e.target.value)}
                  />
                </div>


                {/* Status Column with Search */}
                <div className="flex flex-col">
                  <span className="flex items-center mb-1">Status</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-1 text-xs"
                    onChange={(e) => handleColumnFilter("status", e.target.value)}
                  />
                </div>
              </div>

              {/* Employee Rows */}
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-4 py-3 border-t text-sm gap-2 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={
                        emp.image && emp.image !== ""
                          ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${emp.image}`
                          : placeholderImage
                      }
                      alt={emp.full_name || "profile"}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{emp.full_name}</p>
                      <p className="text-gray-500 text-xs truncate">{emp.email}</p>
                    </div>
                  </div>

                  {/* <span className="truncate">{emp.mobile || "-"}</span> */}
                  <span className="truncate">{emp.department_name}</span>
                  <span className="truncate">{emp.jobrole}</span>
                  <span className="truncate">{emp.profile_name}</span>

                  <span
                    className={`px-2 py-1 rounded-md w-fit text-xs ${emp.status === "Active"
                      ? "text-green-600 bg-green-100"
                      : "text-red-600 bg-red-100"
                      }`}
                  >
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
        
        </div>

        {/* Right Section - Adjust column span based on sidebar state */}
        <div className="col-span-full md:col-span-3 space-y-6" id="tour-tasks">
          <div className="bg-white rounded-lg shadow">
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 px-4 text-center font-medium text-sm ${selectedWidget === "Today Task List" || !selectedWidget ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setSelectedWidget("Today Task List")}
              >
                Today's Tasks
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center font-medium text-sm ${selectedWidget === "Week Task List" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setSelectedWidget("Week Task List")}
              >
                Weekly Tasks
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* Today's Tasks */}
              {(selectedWidget === "Today Task List" || !selectedWidget) && (
                <div className="h-48 sm:h-56 md:h-64 overflow-y-auto hide-scroll" id="tour-today-tasks">
                  {/* Header with + button */}
                  <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white dark:bg-gray-900">
                    <h2 className="font-semibold">Today's Task Progress</h2>
                    <button
                      onClick={() => {
                        triggerMenuNavigation(null, 'task/taskManagement.tsx');
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-600"
                    >
                      +
                    </button>
                  </div>

                  {todayTasks.length > 0 ? (
                    todayTasks.map((task, index) => {
                      const badgeColors: Record<string, string> = {
                        Hard: "text-red-700 bg-red-500 border-red-400",
                        Medium: "text-yellow-700 bg-yellow-100 border-yellow-400",
                        Low: "text-green-700 bg-green-500 border-green-400",
                      };

                      return (
                        <div key={index} className={`mb-4 border-l-2 pl-3 ${badgeColors[task.task_type]?.split(" ")[2] || "border-gray-300"
                          }`}>
                          {/* Badge */}
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeColors[task.task_type] || "text-gray-500 bg-gray-100 border-gray-300"
                            }`}>
                            {task.task_type}
                          </span>

                          {/* Title */}
                          <p className="mt-2">{task.task_title}</p>

                          {/* Profile */}
                          <div className="flex items-center gap-2 mt-2">
                            <img
                              src={
                                task.image && task.image !== ""
                                  ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${task.image}`
                                  : placeholderImage
                              }
                              alt={task.allocatedUser}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = placeholderImage;
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium">{task.allocatedUser}</p>
                              <p className="text-xs text-gray-400">
                                {(() => {
                                  if (!task.task_date) return "";
                                  const d = new Date(task.task_date);
                                  const day = String(d.getDate()).padStart(2, "0");
                                  const month = String(d.getMonth() + 1).padStart(2, "0");
                                  const year = d.getFullYear();
                                  return `${day}-${month}-${year}`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No tasks for today</p>
                  )}
                </div>
              )}

              {/* Weekly Tasks */}
              {selectedWidget === "Week Task List" && (
                <div className="h-52 sm:h-60 md:h-72 overflow-y-auto hide-scroll" id="tour-weekly-tasks">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Weekly Task Progress</h2>

                  </div>

                  {weekTasks.length > 0 ? (
                    weekTasks.map((task, index) => {
                      // ✅ Define color mapping
                      const badgeColors: Record<string, string> = {
                        Hard: "text-red-700 bg-red-500 border-red-400",
                        Medium: "text-yellow-700 bg-yellow-100 border-yellow-400",
                        Low: "text-green-700 bg-green-500 border-green-400",
                      };

                      return (
                        <div
                          key={index}
                          className={`mb-4 border-l-2 pl-3 ${badgeColors[task.task_type]?.split(" ")[2] || "border-gray-300"
                            }`}
                        >
                          {/* Badge */}
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${badgeColors[task.task_type] || "text-gray-500 bg-gray-100 border-gray-300"
                              }`}
                          >
                            {task.task_type}
                          </span>

                          {/* Title */}
                          <p className="mt-2">{task.task_title}</p>

                          {/* Profile */}
                          <div className="flex items-center gap-2 mt-2">
                            <img
                              src={
                                task.image && task.image !== ""
                                  ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${task.image}`
                                  : placeholderImage
                              }
                              alt={task.allocatedUser}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = placeholderImage;
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium">{task.allocatedUser}</p>
                              <p className="text-xs text-gray-400">
                                {(() => {
                                  if (!task.task_date) return "";
                                  const d = new Date(task.task_date);
                                  const day = String(d.getDate()).padStart(2, "0");
                                  const month = String(d.getMonth() + 1).padStart(2, "0");
                                  const year = d.getFullYear();
                                  return `${day}-${month}-${year}`;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No tasks for this week</p>
                  )}

                </div>
              )}
            </div>
          </div>
          <div className={`${isSidebarOpen ? "col-span-3" : "col-span-3"} space-y-6`}>
            {/* Course List */}
            <div className=" bg-white rounded-lg shadow h-80 sm:h-125 overflow-y-auto hide-scroll" id="tour-course-list">
              {/* Header with + button */}
              <div className="sticky top-0 z-10 flex items-center justify-between mb-4 px-4 pt-2 pb-1 bg-white shadow-sm">
                <h2 className="font-semibold">Course List</h2>
                <button
                  onClick={() => setOpenDialog(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-600"
                >
                  +
                </button>
              </div>

              {courses.length > 0 ? (
                courses.slice(0, 5).map(course => (
                  <div key={course.id} className="mb-4 border-l-2 pl-3 border-blue-300">
                    <span className="text-xs font-semibold px-2 py-1 rounded text-blue-700 bg-blue-100 border-blue-400">
                      {course.category}
                    </span>
                    <p className="mt-2 font-medium">{course.title}</p>
                    {course.task_title && (
                      <p className="text-xs text-gray-500 mt-1">Task: {course.task_title}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No courses available</p>
              )}
            </div>
               <AddCourseDialog
              open={openDialog}
              onOpenChange={setOpenDialog}
              onSave={() => { /* implement save logic if needed */ }}
              course={null}
            />

            {/* Assessment List */}
            <div className="bg-white rounded-lg shadow h-64 sm:h-95 overflow-y-auto hide-scroll" id="tour-assessment-list">
              {/* Header with + button */}
              <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white px-2 pt-2 pb-1 shadow-sm">
                <h2 className="font-semibold">Assessment List</h2>
                <button
                  onClick={() => setOpenAssessmentModal(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-400"
                >
                  +
                </button>
              </div>

              {weekTasks.length > 0 ? (
                weekTasks.map((task, index) => {
                  // ✅ Define color mapping
                  const badgeColors: Record<string, string> = {
                    Hard: "text-red-700 bg-red-500 border-red-400",
                    Medium: "text-yellow-700 bg-yellow-100 border-yellow-400",
                    Low: "text-green-700 bg-green-500 border-green-400",
                  };

                  return (
                    <div key={index} className={`mb-4 border-l-2 pl-3 ${badgeColors[task.task_type]?.split(" ")[2] || "border-gray-300"
                      }`}>
                      {/* Badge */}
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeColors[task.task_type] || "text-gray-500 bg-gray-100 border-gray-300"
                        }`}>
                        {task.task_type}
                      </span>

                      {/* Title */}
                      <p className="mt-2">{task.task_title}</p>

                      {/* Profile */}
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={
                            task.image && task.image !== ""
                              ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${task.image}`
                              : placeholderImage
                          }
                          alt={task.allocatedUser}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = placeholderImage;
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{task.allocatedUser}</p>
                          <p className="text-xs text-gray-400">
                            {(() => {
                              if (!task.task_date) return "";
                              const d = new Date(task.task_date);
                              const day = String(d.getDate()).padStart(2, "0");
                              const month = String(d.getMonth() + 1).padStart(2, "0");
                              const year = d.getFullYear();
                              return `${day}-${month}-${year}`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-sm">No assessments available</p>
              )}
            </div>
            <CreateAssessmentModal
              isOpen={openAssessmentModal}
              onClose={() => setOpenAssessmentModal(false)}
              onSave={() => { /* implement save logic if needed */ }}
            />
          </div>
        </div>

        {/* Organization Info Card */}
        <div className="col-span-full grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6">
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {
        isWidgetDropdownOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsWidgetDropdownOpen(false)}
          ></div>
        )
      }
    </div >
  );
}
function triggerMenuNavigation(id: string | number, arg1: string) {
  throw new Error("Function not implemented.");
}

// Custom CSS for Shepherd tour
const tourStyles = `
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
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tourStyles;
  document.head.appendChild(styleSheet);
}