import { classifyIntent, shouldRouteToAction, shouldUseFallback,extractEntities } from "@/lib1/intent-classifier";
import { sanitizeQuery, validateQuerySafety } from "@/lib1/sanitizer";
import { parseError, formatErrorResponse, shouldRetry } from "@/lib1/error-handler";
import { getRoleContext, canAccessData, getDataAccessFilter } from "@/lib1/role-context";
import { logEvent, logQuery, logLLMCall, formatDebugTrace } from "@/lib1/observability";
import {
  createConversation,
  getConversationBySessionId,
  saveMessage,
  getConversationHistory,
  updateConversationStatus
} from "@/lib1/conversation-persistence";
import { createEscalation } from "@/lib1/escalation-service";
import { v4 as uuidv4 } from 'uuid';

// Check if Supabase is properly configured
const supabaseEnabled = process.env.SUPABASE_URL &&
  process.env.SUPABASE_URL !== 'rlqosgegreuvzwbntflq.supabase.co' &&
  process.env.SUPABASE_ANON_KEY;

// Import course recommendation flow
// @ts-ignore - Flow is a JavaScript module
import { courseRecommendationFlow } from "@/ai/flows/courseRecommendationFlow";

// Import skill gap analysis flow
// @ts-ignore - Flow is a JavaScript module
import { skillGapAnalysisFlow } from "@/ai/flows/skillGapAnalysisFlow";

interface ChatRequest {
  query: string;
  sessionId: string;
  userId?: string;
  subInstituteId?: string;
  role?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  debugMode?: boolean;
  selectedJobRole?: string;
  selectedjobRoleId?: string;
  formData?: {
    industry?: string;
    department?: string;
    jobRole?: string;
    description?: string;
  };
}

interface ChatResponse {
  answer: string;
  conversationId?: string;
  intent?: string;
  confidence?: number;
  entities?: {
    industry?: string;
    jobRole?: string;
    department?: string;
  };
  action?: string;
  missingFields?: string[];
  sql?: string;
  tables_used?: string[];
  insights?: string;
  error?: string;
  recoverable?: boolean;
  suggestion?: string;
  canEscalate?: boolean;
  id?: string;
  // Skill Gap Analysis fields
  selectionOptions?: Array<{ id?: number; name: string }>;
  stepLabel?: string;
  currentStep?: string;
  nextStep?: string;
  // Job Role Competency - Structured JSON Data
  competencyData?: GenkitCompetencyResponse;
  courseRecommendations?: Array<{
    courseName: string;
    courseId: string | number;
    courseDescription?: string;
    courseLink?: string;
    reasonForRecommendation?: string;
    createdBy?: string;
    similarUsers?: string[];
  }>;
  // Additional fields for structured responses
  data?: any;
  blocks?: any[];
  query?: string;
  // Query suggestions for the detected intent
  querySuggestions?: string[];
}

// ================= QUERY SUGGESTIONS MAPPING =================

/**
 * Maps each intent to user-friendly query examples that explain what data will be returned
 */
const intentQuerySuggestions: Record<string, Array<{ text: string; description: string }>> = {
  // HRMS intents
  HRMS_USERS_FETCH: [
    { text: "Show me all users", description: "View complete list of all users in your institute" },
    { text: "List all employees", description: "Get a list of all employee records" },
    { text: "Who are the staff members?", description: "Display all staff and their basic information" },
    { text: "Get user directory", description: "Access the complete user directory" }
  ],
  HRMS_PROFILE_FETCH: [
    { text: "Get my profile details", description: "View your complete profile information including personal details" },
    { text: "Show my profile", description: "Display your user profile with all information" },
    { text: "What are my details?", description: "Access your personal and professional profile data" }
  ],
  HRMS_DEPARTMENTS_FETCH: [
    { text: "Show departments", description: "List all departments in your organization" },
    { text: "What departments exist?", description: "View the complete list of organizational departments" },
    { text: "List all departments", description: "Get department names and their details" }
  ],
  HRMS_ATTENDANCE_FETCH: [
    { text: "Show attendance records", description: "View your attendance history and current status" },
    { text: "My attendance history", description: "Display all your attendance records" },
    { text: "Check my attendance", description: "See your daily attendance log" },
    { text: "Attendance summary", description: "Get overview of your attendance patterns" }
  ],
  HRMS_ATTENDANCE_UPDATE: [
    { text: "Update my attendance for today", description: "Mark your attendance for the current day" },
    { text: "Punch in for today", description: "Record your arrival time" },
    { text: "Clock in", description: "Start your attendance for the day" }
  ],
  HRMS_ATTENDANCE_PUNCH_OUT: [
    { text: "Punch out for the day", description: "Record your departure time and end attendance" },
    { text: "Clock out", description: "End your attendance for today" },
    { text: "Mark end of day", description: "Complete your daily attendance record" }
  ],
  HRMS_LEAVE_TYPES_FETCH: [
    { text: "Show leave types", description: "List all available types of leave (sick, vacation, etc.)" },
    { text: "What leave types are available?", description: "View different categories of leave you can apply for" },
    { text: "List leave categories", description: "Get all leave type options and their details" }
  ],
  HRMS_LEAVE_TYPE_CREATE: [
    { text: "Add a new leave type", description: "Create a new category of leave for the organization" },
    { text: "Create leave category", description: "Add a new type of leave to the system" }
  ],
  HRMS_LEAVE_APPLY: [
    { text: "Apply for leave", description: "Submit a leave application request" },
    { text: "Request time off", description: "Apply for leave from work" }
  ],
  HRMS_LEAVE_SUMMARY_FETCH: [
    { text: "Show leave summary report", description: "View your leave balance and usage history" },
    { text: "My leave balance", description: "Check remaining leave days and taken leave" },
    { text: "Leave status", description: "Get summary of your leave entitlements" }
  ],
  HRMS_LEAVE_AUTHORIZE: [
    { text: "Authorize leave for employee X", description: "Approve or reject a leave application" },
    { text: "Approve leave request", description: "Authorize pending leave applications" }
  ],
  HRMS_HOLIDAYS_FETCH: [
    { text: "Show holidays", description: "List all upcoming and past holidays" },
    { text: "What are the holidays?", description: "View the holiday calendar for your organization" },
    { text: "Holiday list", description: "Get complete list of organizational holidays" }
  ],
  HRMS_HOLIDAY_CREATE: [
    { text: "Add a holiday", description: "Create a new holiday entry in the calendar" },
    { text: "Schedule a holiday", description: "Add a new holiday to the system" }
  ],
  HRMS_SALARY_STRUCTURE_FETCH: [
    { text: "Show salary structures", description: "View salary components and structures" },
    { text: "Salary details", description: "Get information about salary components" },
    { text: "Pay structure", description: "View how salaries are structured" }
  ],
  HRMS_PAYROLL_DEDUCTIONS_FETCH: [
    { text: "Show payroll deductions", description: "List all deductions from payroll" },
    { text: "What deductions are there?", description: "View payroll deduction details" },
    { text: "Payroll deductions list", description: "Get complete list of salary deductions" }
  ],
  HRMS_PAYROLL_MONTHLY_FETCH: [
    { text: "Show monthly payroll", description: "View your monthly payroll report" },
    { text: "Monthly salary report", description: "Get your monthly payroll details" },
    { text: "Payroll report", description: "Access monthly payroll information" }
  ],
  HRMS_PAYROLL_GENERATE: [
    { text: "Generate monthly payroll", description: "Create payroll for the current month" },
    { text: "Run payroll", description: "Process monthly payroll calculations" }
  ],

  // LMS intents
  LMS_COURSES_FETCH: [
    { text: "Show all courses", description: "List all available courses in the LMS" },
    { text: "What courses are available?", description: "View complete course catalog" },
    { text: "List courses", description: "Get all course offerings" },
    { text: "Available courses", description: "Display courses you can enroll in" }
  ],
  LMS_MODULES_FETCH: [
    { text: "List modules for course X", description: "View all modules within a specific course" },
    { text: "What are the modules in this course?", description: "Show course curriculum breakdown" },
    { text: "Course modules", description: "List learning modules for a course" }
  ],
  LMS_CONTENT_FETCH: [
    { text: "Show content for module Y", description: "View learning materials in a specific module" },
    { text: "What content is in this module?", description: "Access module learning resources" },
    { text: "Module materials", description: "Display content items in a module" }
  ],
  LMS_CONTENT_CREATE: [
    { text: "Create new content", description: "Add new learning material to a course" },
    { text: "Add course content", description: "Create new content for a module" }
  ],
  LMS_QUESTION_CHAPTERS_FETCH: [
    { text: "Show question chapters", description: "List chapters containing questions" },
    { text: "Question chapters", description: "View chapters organized by questions" },
    { text: "Chapters with questions", description: "Get question-based chapter structure" }
  ],
  LMS_QUESTION_ADD: [
    { text: "Add a question", description: "Create a new question for assessments" },
    { text: "Create question", description: "Add a question to the question bank" }
  ],
  LMS_QUESTION_PAPERS_SEARCH: [
    { text: "Search question papers", description: "Find question papers by criteria" },
    { text: "Find question papers", description: "Search through available question papers" }
  ],
  LMS_QUESTION_PAPER_STORE: [
    { text: "Store a question paper", description: "Save a new question paper" },
    { text: "Create question paper", description: "Add a new question paper to the system" }
  ],
  LMS_EXAMS_FETCH: [
    { text: "Show online exams", description: "List all available online examinations" },
    { text: "Available exams", description: "View exams you can take" },
    { text: "Online exams list", description: "Get complete list of online assessments" }
  ],
  LMS_EXAM_SUBMIT: [
    { text: "Submit online exam", description: "Complete and submit an online examination" },
    { text: "Finish exam", description: "Submit your exam answers" }
  ],

  // Skills and Job Roles intents
  SKILLS_FETCH: [
    { text: "Show all skills", description: "List all available skills in the system" },
    { text: "What skills are available?", description: "View complete skill catalog" },
    { text: "Skill list", description: "Get all skills and their details" }
  ],
  SKILL_CREATE: [
    { text: "Create a new skill", description: "Add a new skill to the system" },
    { text: "Add skill", description: "Create a new skill entry" }
  ],
  SKILL_CATEGORIES_FETCH: [
    { text: "Show skill categories", description: "List all skill categories and subcategories" },
    { text: "Skill categories", description: "View how skills are organized by category" },
    { text: "What are the skill categories?", description: "Get skill category structure" }
  ],
  SKILL_KNOWLEDGE_ABILITIES_FETCH: [
    { text: "Show skill knowledge abilities", description: "View knowledge and ability components of skills" },
    { text: "Knowledge and abilities", description: "List skill knowledge and ability requirements" }
  ],
  SKILL_PROFICIENCY_LEVELS_FETCH: [
    { text: "Show proficiency levels", description: "List skill proficiency levels and descriptions" },
    { text: "Skill levels", description: "View proficiency level definitions" },
    { text: "What are the proficiency levels?", description: "Get skill proficiency scale" }
  ],
  SKILL_ATTRIBUTES_ADD: [
    { text: "Add skill attributes", description: "Add attributes to an existing skill" },
    { text: "Add skill properties", description: "Enhance skill with additional attributes" }
  ],
  JOB_ROLES_FETCH: [
    { text: "Show job roles", description: "List all available job roles in the organization" },
    { text: "What job roles exist?", description: "View complete job role catalog" },
    { text: "Job role list", description: "Get all job positions and their details" }
  ],
  JOB_ROLE_CREATE: [
    { text: "Create a job role", description: "Add a new job role to the system" },
    { text: "Add job role", description: "Create a new position definition" }
  ],
  JOB_ROLE_UPDATE: [
    { text: "Update job role X", description: "Modify an existing job role" },
    { text: "Edit job role", description: "Change job role details and requirements" }
  ],
  JOB_ROLE_DELETE: [
    { text: "Delete job role Y", description: "Remove a job role from the system" },
    { text: "Remove job role", description: "Delete a job position" }
  ],
  JOB_ROLE_SKILLS_FETCH: [
    { text: "Show job role skills", description: "View skills required for a specific job role" },
    { text: "What skills are needed for this role?", description: "List job role skill requirements" },
    { text: "Job role skill requirements", description: "Get skills associated with a position" }
  ],
  JOB_ROLE_SKILL_CREATE: [
    { text: "Create job role skill", description: "Add a skill requirement to a job role" },
    { text: "Add skill to job role", description: "Associate a skill with a position" }
  ],
  JOB_ROLE_TASKS_FETCH: [
    { text: "Show job role tasks", description: "View tasks and responsibilities for a job role" },
    { text: "What are the job responsibilities?", description: "List job role tasks and duties" },
    { text: "Job role tasks", description: "Get position responsibilities and tasks" }
  ],
  JOB_ROLE_TASK_CREATE: [
    { text: "Create job role task", description: "Add a task or responsibility to a job role" },
    { text: "Add task to job role", description: "Include a new responsibility in a position" }
  ],

  // Organization and Industries intents
  USER_JOB_ROLES_FETCH: [
    { text: "Show user job roles", description: "View job roles assigned to users" },
    { text: "What roles do users have?", description: "List user job role assignments" },
    { text: "User job role assignments", description: "Get mapping of users to their roles" }
  ],
  INDUSTRIES_FETCH: [
    { text: "Show industries", description: "List all industry types in the system" },
    { text: "What industries are available?", description: "View industry classifications" },
    { text: "Industry list", description: "Get complete list of industries" }
  ],
  DEPARTMENT_MASTER_FETCH: [
    { text: "Show department master", description: "View master list of all departments" },
    { text: "Department master data", description: "Get complete department information" }
  ],
  NEO_INDUSTRIES_FETCH: [
    { text: "Get Neo4J industries", description: "View industries from the graph database" },
    { text: "Neo4J industries", description: "Access industry data from Neo4J" }
  ],
  DEPARTMENTS_FOR_INDUSTRY_FETCH: [
    { text: "Show departments for industry X", description: "List departments within a specific industry" },
    { text: "What departments are in this industry?", description: "View industry department structure" },
    { text: "Industry departments", description: "Get departments belonging to an industry" }
  ],
  JOB_ROLES_FOR_DEPARTMENT_FETCH: [
    { text: "Show job roles for department Y", description: "List job roles within a specific department" },
    { text: "What roles are in this department?", description: "View department job role structure" },
    { text: "Department job roles", description: "Get positions available in a department" }
  ],
  SKILLS_FOR_JOB_ROLE_FETCH: [
    { text: "Show skills for job role Z", description: "List skills required for a specific job role" },
    { text: "What skills does this role need?", description: "View skill requirements for a position" },
    { text: "Job role skill requirements", description: "Get skills associated with a role" }
  ],

  // Reports and Misc intents
  TASK_ANALYSIS_REPORT_FETCH: [
    { text: "Show task analysis report", description: "View task analysis and performance metrics" },
    { text: "Task analysis", description: "Get task completion and analysis data" },
    { text: "Analysis report", description: "Access task analysis reports" }
  ],
  EMPLOYEE_REPORT_FETCH: [
    { text: "Show employee report", description: "View employee performance and data reports" },
    { text: "Employee report", description: "Get comprehensive employee information" },
    { text: "Staff report", description: "Access employee directory reports" }
  ],
  ORGANIZATION_DASHBOARD_FETCH: [
    { text: "Show organization dashboard", description: "View organization-wide metrics and KPIs" },
    { text: "Organization dashboard", description: "Access org-level performance dashboard" },
    { text: "Org dashboard", description: "Get organizational overview data" }
  ],
  DASHBOARD_FETCH: [
    { text: "Show dashboard", description: "View main dashboard with key metrics" },
    { text: "Dashboard view", description: "Access primary dashboard interface" },
    { text: "Main dashboard", description: "Get overview dashboard data" }
  ],
  COMPLIANCE_LIST_FETCH: [
    { text: "Show compliance list", description: "List all compliance requirements and status" },
    { text: "Compliance list", description: "View compliance items and their details" },
    { text: "Compliance items", description: "Get complete compliance checklist" }
  ],
  COMPLIANCE_CREATE: [
    { text: "Create compliance", description: "Add a new compliance requirement" },
    { text: "Add compliance item", description: "Create a new compliance entry" }
  ],
  COMPLIANCE_UPDATE: [
    { text: "Update compliance X", description: "Modify an existing compliance requirement" },
    { text: "Edit compliance", description: "Change compliance item details" }
  ],
  COMPLIANCE_DELETE: [
    { text: "Delete compliance Y", description: "Remove a compliance requirement" },
    { text: "Remove compliance item", description: "Delete a compliance entry" }
  ],
  JOB_POSTINGS_FETCH: [
    { text: "Show job postings", description: "List all available job openings" },
    { text: "Job postings", description: "View current job vacancies" },
    { text: "Available jobs", description: "Get list of open positions" }
  ],
  JOB_POSTING_CREATE: [
    { text: "Create job posting", description: "Add a new job opening" },
    { text: "Post a job", description: "Create a new job advertisement" }
  ],
  JOB_POSTING_UPDATE: [
    { text: "Update job posting X", description: "Modify an existing job posting" },
    { text: "Edit job posting", description: "Change job posting details" }
  ],

  // General/Academic intents
  STANDARDS_FETCH: [
    { text: "Show standards", description: "List all academic standards" },
    { text: "What standards are there?", description: "View academic standard definitions" },
    { text: "Academic standards", description: "Get complete standards list" }
  ],
  SECTIONS_FETCH: [
    { text: "Show sections", description: "List all academic sections/classes" },
    { text: "What sections exist?", description: "View available class sections" },
    { text: "Academic sections", description: "Get complete sections list" }
  ],
  SUBJECTS_FETCH: [
    { text: "Show subjects", description: "List all academic subjects" },
    { text: "What subjects are offered?", description: "View available subjects" },
    { text: "Academic subjects", description: "Get complete subjects list" }
  ],
  QUESTIONS_FETCH: [
    { text: "Show questions", description: "List all questions in the question bank" },
    { text: "What questions are available?", description: "View question bank contents" },
    { text: "Question bank", description: "Access all available questions" }
  ],
  MENUS_FETCH: [
    { text: "Show menus", description: "List all menu items and navigation options" },
    { text: "What menus are there?", description: "View application menu structure" },
    { text: "Menu items", description: "Get complete menu navigation" }
  ],

  // AI and Auth intents
  GEMINI_CHAT: [
    { text: "Chat with Gemini", description: "Start a conversation with Gemini AI" },
    { text: "Talk to Gemini", description: "Interact with Google's Gemini AI assistant" },
    { text: "Ask Gemini", description: "Get AI assistance from Gemini" }
  ],
  AI_COURSE_GENERATE: [
    { text: "Generate AI course", description: "Create a new course using AI" },
    { text: "Create AI course", description: "Use AI to generate course content" }
  ],
  GAMMA_CONTENT_FETCH: [
    { text: "Get gamma content", description: "Access Gamma content and materials" },
    { text: "Show gamma content", description: "View Gamma learning resources" }
  ],
  FORGET_PASSWORD: [
    { text: "Forget password", description: "Initiate password reset process" },
    { text: "Forgot password", description: "Reset your account password" }
  ],
  RESET_PASSWORD: [
    { text: "Reset password", description: "Change your account password" },
    { text: "Change password", description: "Update your login credentials" }
  ]
};

/**
 * Get query suggestions for a specific intent
 */
function getIntentQuerySuggestions(intent: string): string[] {
  const suggestions = intentQuerySuggestions[intent] || [];
  return suggestions.map(suggestion => suggestion.text);
}
// ================= NEW INTENT HANDLERS =================

// Helper function to create structured responses for different data types
function createStructuredResponse(intent: string, data: any[], query: string, querySuggestions?: string[]): ChatResponse {
  // Ensure data is an array and handle null/undefined cases
  if (!Array.isArray(data)) {
    data = data ? [data] : [];
  }

  // Determine the best UI format based on data structure
  if (data.length === 0) {
    return {
      answer: 'No data found matching your query.',
      intent,
      data: [],
      query,
      querySuggestions
    };
  }

  const blocks: any[] = [];

  // Special handling for HRMS_PROFILE_FETCH - use card format to show user profile
  if (intent === 'HRMS_PROFILE_FETCH' && data.length > 0) {
    const profile = data[0]; // Assuming single user profile

    // Build metadata dynamically based on available fields
    const metadata: Record<string, any> = {};

    // Always include these core fields
    if (profile.email) metadata['Email'] = profile.email;
    if (profile.joining_date || profile.created_at) metadata['Joining Date'] = profile.joining_date || profile.created_at;
    if (profile.phone || profile.mobile) metadata['Phone'] = profile.phone || profile.mobile;
    if (profile.location) metadata['Location'] = profile.location;

    // Include optional fields if they exist
    if (profile.skills) metadata['Skills'] = profile.skills;
    if (profile.experience_years) metadata['Experience'] = profile.experience_years;
    if (profile.department || profile.department_name) metadata['Department'] = profile.department || profile.department_name;
    if (profile.job_role || profile.role || profile.position) metadata['Job Role'] = profile.job_role || profile.role || profile.position;
    if (profile.tasks || profile.assigned_tasks) metadata['Tasks'] = profile.tasks || profile.assigned_tasks;

    // Add any other relevant fields that might be in the profile
    const relevantFields = ['designation', 'manager', 'team', 'projects', 'certifications'];
    relevantFields.forEach(field => {
      if (profile[field]) metadata[field.charAt(0).toUpperCase() + field.slice(1)] = profile[field];
    });

    blocks.push({
      type: 'cards',
      title: 'Your Profile',
      data: [{
        id: profile.id || profile.user_id,
        title: profile.name || profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
        description: profile.bio || profile.description || 'Employee profile information',
        tag: profile.job_role || profile.role || profile.position || 'Employee',
        metadata
      }]
    });
  }
  // Special handling for HRMS_USERS_FETCH - use table format to show all employee data
  else if (intent === 'HRMS_USERS_FETCH') {
    const processedData = data.map(user => ({
      name: user.name || user.full_name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'N/A'),
      role: user.role || user.job_role || user.position || 'N/A',
      email: user.email || 'N/A',
      department: user.department || user.department_name || 'N/A',
      status: user.status || 'Active'
    }));

    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'email', label: 'Email' },
      { key: 'department', label: 'Department' },
      { key: 'status', label: 'Status' }
    ];

    blocks.push({
      type: 'table',
      title: getIntentTitle(intent),
      data: {
        columns,
        rows: processedData
      }
    });
  }
  // Special handling for HRMS_LEAVE_TYPES_FETCH - use list format to show leave types
  else if (intent === 'HRMS_LEAVE_TYPES_FETCH' && Array.isArray(data)) {
    blocks.push({
      type: 'list',
      title: getIntentTitle(intent),
      data: data.map((leaveType, index) => ({
        id: index,
        label: leaveType.name || leaveType.leave_type || leaveType.leave_type_id || 'N/A'
      }))
    });
  }
  // For table-like data, use table format
  else if (data.length > 0 && data[0] && typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
    const columns = Object.keys(data[0]).map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));

    blocks.push({
      type: 'table',
      title: getIntentTitle(intent),
      data: {
        columns,
        rows: data
      }
    });
  } else {
    // For simple lists, use list format
    blocks.push({
      type: 'list',
      title: getIntentTitle(intent),
      data: data.map((item, index) => ({
        id: index,
        label: item && typeof item === 'string' ? item : (item ? JSON.stringify(item) : 'N/A'),
        value: item
      }))
    });
  }

  // Add query suggestions block if available
  if (querySuggestions && querySuggestions.length > 0) {
    blocks.push({
      type: 'query-suggestions',
      title: 'Related Queries',
      data: querySuggestions
    });
  }

  // Customize answer text based on intent
  let answerText = `Found ${data.length} result(s) for your query.`;
  if (intent === 'HRMS_PROFILE_FETCH') {
    answerText = 'Here are your profile details.';
  }

  return {
    answer: answerText,
    intent,
    data: {
      blocks
    },
    query,
    querySuggestions
  };
}

function getIntentTitle(intent: string): string {
  const titles: Record<string, string> = {
    'HRMS_USERS_FETCH': 'Users',
    'HRMS_PROFILE_FETCH': 'Profile Details',
    'HRMS_DEPARTMENTS_FETCH': 'Departments',
    'HRMS_ATTENDANCE_FETCH': 'Attendance Records',
    'HRMS_LEAVE_TYPES_FETCH': 'Leave Types',
    'HRMS_LEAVE_SUMMARY_FETCH': 'Leave Summary',
    'HRMS_HOLIDAYS_FETCH': 'Holidays',
    'HRMS_SALARY_STRUCTURE_FETCH': 'Salary Structures',
    'HRMS_PAYROLL_DEDUCTIONS_FETCH': 'Payroll Deductions',
    'HRMS_PAYROLL_MONTHLY_FETCH': 'Monthly Payroll',
    'LMS_COURSES_FETCH': 'Courses',
    'LMS_MODULES_FETCH': 'Course Modules',
    'LMS_CONTENT_FETCH': 'Content',
    'LMS_QUESTION_CHAPTERS_FETCH': 'Question Chapters',
    'LMS_EXAMS_FETCH': 'Online Exams',
    'SKILLS_FETCH': 'Skills',
    'SKILL_CATEGORIES_FETCH': 'Skill Categories',
    'JOB_ROLES_FETCH': 'Job Roles',
    'USER_JOB_ROLES_FETCH': 'User Job Roles',
    'INDUSTRIES_FETCH': 'Industries',
    'DEPARTMENT_MASTER_FETCH': 'Department Master',
    'STANDARDS_FETCH': 'Standards',
    'SECTIONS_FETCH': 'Sections',
    'SUBJECTS_FETCH': 'Subjects',
    'QUESTIONS_FETCH': 'Questions',
    'MENUS_FETCH': 'Menus'
  };
  return titles[intent] || intent.replace(/_/g, ' ');
}

// ================= HRMS HANDLER =================
async function handleHRMSRequest(
  request: ChatRequest,
  intent: string,
  conversationId: string,
  entities: any
): Promise<ChatResponse> {
  try {
    let apiKey: string;
    let method: "GET" | "POST" = "GET";
    let body: any = {};
    let params: any = {};

    // Map intents to API endpoints
    const intentToApiMap: Record<string, string> = {
      'HRMS_USERS_FETCH': 'table_data',
      'HRMS_PROFILE_FETCH': 'table_data',
      'HRMS_DEPARTMENTS_FETCH': 'hrms_departments',
      'HRMS_ATTENDANCE_FETCH': 'table_data',
      'HRMS_LEAVE_TYPES_FETCH': 'table_data',
      'HRMS_LEAVE_SUMMARY_FETCH': 'hrms_leave_summary_report',
      'HRMS_HOLIDAYS_FETCH': 'table_data',
      'HRMS_SALARY_STRUCTURE_FETCH': 'employee_salary_structure',
      'HRMS_PAYROLL_DEDUCTIONS_FETCH': 'payroll_deduction',
      'HRMS_PAYROLL_MONTHLY_FETCH': 'monthly_payroll'
    };

    const actionIntentToApiMap: Record<string, { api: string; method: "GET" | "POST" }> = {
      'HRMS_ATTENDANCE_UPDATE': { api: 'hrms_attendance_update', method: 'POST' },
      'HRMS_ATTENDANCE_PUNCH_OUT': { api: 'hrms_punch_out', method: 'POST' },
      'HRMS_LEAVE_TYPE_CREATE': { api: 'hrms_leave_type_add', method: 'POST' },
      'HRMS_LEAVE_APPLY': { api: 'hrms_leave_apply', method: 'POST' },
      'HRMS_LEAVE_AUTHORIZE': { api: 'hrms_leave_authorization', method: 'POST' },
      'HRMS_HOLIDAY_CREATE': { api: 'hrms_holiday_add', method: 'POST' },
      'HRMS_PAYROLL_GENERATE': { api: 'monthly_payroll_store', method: 'POST' }
    };

    if (actionIntentToApiMap[intent]) {
      const config = actionIntentToApiMap[intent];
      apiKey = config.api;
      method = config.method;

      // For actions, we need user input - for now, return a message asking for required fields
      // Special handling for LMS content creation due to image processing limitations
      if (intent === 'LMS_CONTENT_CREATE') {
        return {
          answer: `Content creation in LMS currently has limitations with image processing. For creating content with images, please use the bulk content generation feature instead. For simple text content, please provide the content details.`,
          conversationId,
          intent,
          error: 'LMS_CONTENT_CREATE_LIMITED',
          recoverable: true,
          suggestion: 'Use bulk content generation for content with images, or provide text-only content details.',
          canEscalate: true,
          querySuggestions: getIntentQuerySuggestions(intent)
        };
      }

      return {
        answer: `I need more information to ${intent.replace(/_/g, ' ').toLowerCase()}. Please provide the required details.`,
        conversationId,
        intent,
        error: 'Missing action parameters',
        recoverable: true,
        suggestion: 'Please provide the necessary information to complete this action.',
        canEscalate: true,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    } else {
      apiKey = intentToApiMap[intent] || 'table_data';
    }

    // Set table parameter for table_data endpoint
    if (apiKey === 'table_data') {
      const tableMap: Record<string, string> = {
        'HRMS_USERS_FETCH': 'tbluser',
        'HRMS_PROFILE_FETCH': 'tbluserprofilemaster',
        'HRMS_ATTENDANCE_FETCH': 'hrms_attendances',
        'HRMS_LEAVE_TYPES_FETCH': 'hrms_leave_types',
        'HRMS_HOLIDAYS_FETCH': 'hrms_holidays'
      };
      params.table = tableMap[intent] || 'tbluser';
      // Add sub_institute_id filter for table_data
      params[`filters[sub_institute_id]`] = request.subInstituteId;

      // For profile fetch, also filter by current user
    } else if (apiKey === 'hrms_departments') {
      // Add sub_institute_id filter for hrms_departments endpoint
      params.sub_institute_id = request.subInstituteId;
      if (intent === 'HRMS_PROFILE_FETCH' && request.userId) {
        params[`filters[user_id]`] = request.userId;
      }
      // For attendance fetch, filter by specific user if mentioned, current user for "my" queries, otherwise show all users in sub-institute
      if (intent === 'HRMS_ATTENDANCE_FETCH') {
        // Check if query is about the current user's attendance ("my", "check my", etc.)
        const queryLower = request.query.toLowerCase();
        const myAttendancePatterns = [
          /\bmy\s+attendance/i,
          /check\s+my\s+attendance/i,
          /my\s+attendance\s+history/i,
          /my\s+attendance\s+records/i
        ];

        const isMyAttendance = myAttendancePatterns.some(pattern => pattern.test(queryLower));

        if (isMyAttendance && request.userId) {
          // For "my attendance" queries, always filter by current user
          params[`filters[user_id]`] = request.userId;
        } else {
          // Check if query mentions a specific user (not "my")
          const userMentionPatterns = [
            /attendance\s+(?:for|of)\s+(.+?)(?:\s|$)/i,
            /(.+?)(?:'s|s')\s+attendance/i,
            /attendance\s+records?\s+(?:for|of)\s+(.+?)(?:\s|$)/i
          ];

          let mentionedUserId = null;
          for (const pattern of userMentionPatterns) {
            const match = request.query.match(pattern);
            if (match && !match[1].toLowerCase().includes('my')) { // Exclude "my" matches
              const userName = match[1].trim();
              // Try to find user by name in the system
              try {
                const userSearchParams = {
                  table: 'tbluser',
                  [`filters[sub_institute_id]`]: request.subInstituteId,
                  [`filters[name]`]: userName
                };
                const userData = await callHpApi('GET', hpApiMap['table_data'].url, userSearchParams);
                if (Array.isArray(userData) && userData.length > 0) {
                  mentionedUserId = userData[0].id || userData[0].user_id;
                }
              } catch (error) {
                console.error('Error searching for user:', error);
              }
              break;
            }
          }

          // If a specific user was mentioned, filter by that user
          if (mentionedUserId) {
            params[`filters[user_id]`] = mentionedUserId;
          }
          // If no specific user mentioned and not "my" query, don't filter by user (show all in sub-institute)
        }
      }
    }

    const apiEntry = hpApiMap[apiKey];
    if (!apiEntry) {
      throw new Error(`No API mapping found for intent: ${intent}`);
    }

    let data = await callHpApi(method, apiEntry.url, params, body);

    // Apply client-side filtering for endpoints that don't support server-side filtering
    if (intent === 'HRMS_DEPARTMENTS_FETCH' && Array.isArray(data)) {
      const originalCount = data.length;
      data = data.filter(dept => dept.sub_institute_id == request.subInstituteId);
      console.log(`Filtered departments from ${originalCount} to ${data.length} for sub_institute_id ${request.subInstituteId}`);
    }

    await saveMessage(conversationId, 'bot', `Retrieved ${Array.isArray(data) ? data.length : (data ? 1 : 0)} HRMS record(s)`, intent);

    // Special handling for HRMS_PROFILE_FETCH - fetch comprehensive profile data
    if (intent === 'HRMS_PROFILE_FETCH') {
      let profileData = Array.isArray(data) ? data[0] : data;

      if (!profileData) {
        return {
          answer: 'No profile data found for your account.',
          intent,
          data: [],
          query: request.query,
          querySuggestions: getIntentQuerySuggestions(intent)
        };
      }

      // For now, just use the basic profile data and let the frontend display what it can
      // Additional API calls for departments/job roles/tasks can be added later when endpoints are verified
      return createStructuredResponse(intent, [profileData], request.query, getIntentQuerySuggestions(intent));
    }

    // Special handling for HRMS_USERS_FETCH to ensure name and role are displayed properly
    if (intent === 'HRMS_USERS_FETCH' && Array.isArray(data)) {
      const processedData = data.map(user => {
        // Extract name and role, remove image fields
        const { profile_image, avatar, image, ...userData } = user;
        return {
          name: user.name || user.full_name || user.first_name + ' ' + user.last_name || 'N/A',
          role: user.role || user.job_role || user.position || 'N/A',
          ...userData // Include all other fields
        };
      });
      return createStructuredResponse(intent, processedData, request.query, getIntentQuerySuggestions(intent));
    }

    // Special handling for HRMS_HOLIDAYS_FETCH to show only specific fields
    if (intent === 'HRMS_HOLIDAYS_FETCH' && Array.isArray(data)) {
      const processedData = data.map(holiday => ({
        holiday_name: holiday.holiday_name || holiday.name || 'N/A',
        from_date: holiday.from_date || holiday.start_date || 'N/A',
        to_date: holiday.to_date || holiday.end_date || 'N/A'
      }));

      // Ensure we have valid data for table rendering
      if (processedData.length > 0) {
        const columns = [
          { key: 'holiday_name', label: 'Holiday Name' },
          { key: 'from_date', label: 'From Date' },
          { key: 'to_date', label: 'To Date' }
        ];

        const blocks = [{
          type: 'table',
          title: getIntentTitle(intent),
          data: {
            columns,
            rows: processedData
          }
        }];

        // Add query suggestions block if available
        const querySuggestions = getIntentQuerySuggestions(intent);
        if (querySuggestions && querySuggestions.length > 0) {
          blocks.push({
            type: 'query-suggestions',
            title: 'Related Queries',
            data: querySuggestions
          });
        }

        return {
          answer: `Found ${processedData.length} holiday(s) in the calendar.`,
          intent,
          data: {
            blocks
          },
          query: request.query,
          querySuggestions
        };
      }

      return {
        answer: 'No holidays found in the calendar.',
        intent,
        data: [],
        query: request.query,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    }

    // Special handling for HRMS_ATTENDANCE_FETCH to show specific attendance fields
    if (intent === 'HRMS_ATTENDANCE_FETCH' && Array.isArray(data)) {
      // Check if query is about current user's attendance or mentions another user
      const queryLower = request.query.toLowerCase();
      const myAttendancePatterns = [
        /\bmy\s+attendance/i,
        /check\s+my\s+attendance/i,
        /my\s+attendance\s+history/i,
        /my\s+attendance\s+records/i
      ];

      const isMyAttendance = myAttendancePatterns.some(pattern => pattern.test(queryLower));

      let mentionedUser = null;
      if (isMyAttendance) {
        mentionedUser = 'me'; // Special marker for current user
      } else {
        // Check if query mentions a specific user (not "my")
        const userMentionPatterns = [
          /attendance\s+(?:for|of)\s+(.+?)(?:\s|$)/i,
          /(.+?)(?:'s|s')\s+attendance/i,
          /attendance\s+records?\s+(?:for|of)\s+(.+?)(?:\s|$)/i
        ];

        for (const pattern of userMentionPatterns) {
          const match = request.query.match(pattern);
          if (match && !match[1].toLowerCase().includes('my')) { // Exclude "my" matches
            mentionedUser = match[1].trim();
            break;
          }
        }
      }

      const processedData = data.map(attendance => ({
        date: attendance.day || attendance.date || attendance.attendance_date || 'N/A',
        punch_in_time: attendance.punchin_time || attendance.punch_in || attendance.check_in_time || 'N/A',
        punch_out_time: attendance.punchout_time || attendance.punch_out || attendance.check_out_time || 'N/A',
        duration: attendance.timestamp_diff || attendance.duration || attendance.working_hours || 'N/A',
        user_id: attendance.user_id || attendance.employee_id || 'N/A',
        user_name: attendance.user_name || attendance.employee_name || attendance.name || 'N/A'
      }));

      // Ensure we have valid data for table rendering
      if (processedData.length > 0) {
        const columns = [
          { key: 'date', label: 'Date' },
          { key: 'punch_in_time', label: 'Punch In Time' },
          { key: 'punch_out_time', label: 'Punch Out Time' },
          { key: 'duration', label: 'Duration' },
          { key: 'user_id', label: 'User ID' },
          { key: 'user_name', label: 'User Name' }
        ];

        const blocks = [{
          type: 'table',
          title: getIntentTitle(intent),
          data: {
            columns,
            rows: processedData
          }
        }];

        // Add query suggestions block if available
        const querySuggestions = getIntentQuerySuggestions(intent);
        if (querySuggestions && querySuggestions.length > 0) {
          blocks.push({
            type: 'query-suggestions',
            title: 'Related Queries',
            data: querySuggestions
          });
        }

        const userContext = mentionedUser === 'me' ? ' for you' :
                           mentionedUser ? ` for ${mentionedUser}` : ' for all users';
        return {
          answer: `Found ${processedData.length} attendance record(s)${userContext}.`,
          intent,
          data: {
            blocks
          },
          query: request.query,
          querySuggestions
        };
      }

      const userContext = mentionedUser === 'me' ? ' for you' :
                         mentionedUser ? ` for ${mentionedUser}` : '';
      return {
        answer: `No attendance records found${userContext}.`,
        intent,
        data: [],
        query: request.query,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    }

    // Special handling for HRMS_DEPARTMENTS_FETCH to show only department and status fields
    if (intent === 'HRMS_DEPARTMENTS_FETCH' && Array.isArray(data)) {
      const processedData = data.map(dept => ({
        department: dept.department || dept.departmentName || 'N/A',
        status: dept.status || 'Active'
      }));

      // Ensure we have valid data for table rendering
      if (processedData.length > 0) {
        const columns = [
          { key: 'department', label: 'Department' },
          { key: 'status', label: 'Status' }
        ];

        const blocks = [{
          type: 'table',
          title: getIntentTitle(intent),
          data: {
            columns,
            rows: processedData
          }
        }];

        // Add query suggestions block if available
        const querySuggestions = getIntentQuerySuggestions(intent);
        if (querySuggestions && querySuggestions.length > 0) {
          blocks.push({
            type: 'query-suggestions',
            title: 'Related Queries',
            data: querySuggestions
          });
        }

        return {
          answer: `Found ${processedData.length} department(s).`,
          intent,
          data: {
            blocks
          },
          query: request.query,
          querySuggestions
        };
      }

      return {
        answer: 'No departments found.',
        intent,
        data: [],
        query: request.query,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    }

    return createStructuredResponse(intent, Array.isArray(data) ? data : (data ? [data] : []), request.query, getIntentQuerySuggestions(intent));

  } catch (error) {
    console.error('HRMS Request Error:', error);
    await saveMessage(conversationId, 'bot', `Error processing HRMS request: ${(error as Error).message}`, intent, undefined, undefined, true);
    return {
      answer: `Error processing your HRMS request: ${(error as Error).message}`,
      conversationId,
      intent,
      error: 'HRMS_API_ERROR',
      recoverable: true,
      canEscalate: true
    };
  }
}

// ================= LMS HANDLER =================
async function handleLMSRequest(
  request: ChatRequest,
  intent: string,
  conversationId: string,
  entities: any
): Promise<ChatResponse> {
  try {
    let apiKey: string;
    let method: "GET" | "POST" = "GET";
    let body: any = {};
    let params: any = { sub_institute_id: request.subInstituteId };

    const intentToApiMap: Record<string, string> = {
      'LMS_COURSES_FETCH': 'lms_course_master',
      'LMS_MODULES_FETCH': 'chapter_master',
      'LMS_CONTENT_FETCH': 'content_master',
      'LMS_QUESTION_CHAPTERS_FETCH': 'question_chapter_master',
      'LMS_QUESTION_PAPERS_SEARCH': 'question_paper_search',
      'LMS_EXAMS_FETCH': 'online_exam'
    };

    const actionIntentToApiMap: Record<string, { api: string; method: "GET" | "POST" }> = {
      'LMS_CONTENT_CREATE': { api: 'content_master_create', method: 'GET' },
      'LMS_QUESTION_ADD': { api: 'question_master', method: 'POST' },
      'LMS_QUESTION_PAPER_STORE': { api: 'question_paper_store', method: 'POST' },
      'LMS_EXAM_SUBMIT': { api: 'online_exam_submit', method: 'POST' }
    };

    if (actionIntentToApiMap[intent]) {
      const config = actionIntentToApiMap[intent];
      apiKey = config.api;
      method = config.method;

      return {
        answer: `I need more information to ${intent.replace(/_/g, ' ').toLowerCase()}. Please provide the required details.`,
        conversationId,
        intent,
        error: 'Missing action parameters',
        recoverable: true,
        suggestion: 'Please provide the necessary information to complete this action.',
        canEscalate: true,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    } else {
      apiKey = intentToApiMap[intent] || 'course_master';
    }

    // Add filters based on entities (e.g., course_id, module_id)
    if (entities.courseId) params.course_id = entities.courseId;
    if (entities.moduleId) params.module_id = entities.moduleId;

    const apiEntry = hpApiMap[apiKey];
    if (!apiEntry) {
      throw new Error(`No API mapping found for intent: ${intent}`);
    }

    let data = await callHpApi(method, apiEntry.url, params, body);

    // Apply client-side filtering for LMS endpoints that don't support server-side filtering
    if (intent === 'LMS_COURSES_FETCH' && Array.isArray(data)) {
      const originalCount = data.length;
      data = data.filter(course => course.sub_institute_id == request.subInstituteId);
      console.log(`Filtered courses from ${originalCount} to ${data.length} for sub_institute_id ${request.subInstituteId}`);
    }

    await saveMessage(conversationId, 'bot', `Retrieved ${Array.isArray(data) ? data.length : (data ? 1 : 0)} LMS record(s)`, intent);

    // Special handling for LMS_COURSES_FETCH to show only display_name and subject_category fields
    if (intent === 'LMS_COURSES_FETCH' && Array.isArray(data)) {
      const processedData = data.map(course => ({
        display_name: course.display_name || course.name || course.course_name || 'N/A',
        subject_category: course.subject_category || course.category || course.subject || 'N/A'
      }));

      // Ensure we have valid data for table rendering
      if (processedData.length > 0) {
        const columns = [
          { key: 'display_name', label: 'Course Name' },
          { key: 'subject_category', label: 'Subject Category' }
        ];

        const blocks = [{
          type: 'table',
          title: getIntentTitle(intent),
          data: {
            columns,
            rows: processedData
          }
        }];

        // Add query suggestions block if available
        const querySuggestions = getIntentQuerySuggestions(intent);
        if (querySuggestions && querySuggestions.length > 0) {
          blocks.push({
            type: 'query-suggestions',
            title: 'Related Queries',
            data: querySuggestions
          });
        }

        return {
          answer: `Found ${processedData.length} course(s).`,
          intent,
          data: {
            blocks
          },
          query: request.query,
          querySuggestions
        };
      }

      return {
        answer: 'No courses found.',
        intent,
        data: [],
        query: request.query,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    }

    return createStructuredResponse(intent, Array.isArray(data) ? data : (data ? [data] : []), request.query, getIntentQuerySuggestions(intent));

  } catch (error) {
    console.error('LMS Request Error:', error);
    const errorMessage = (error as Error).message;

    // Handle image processing errors specifically
    if (errorMessage.includes('image') && errorMessage.includes('model does not support')) {
      const fallbackMessage = `I'm sorry, but the LMS content operation requires image processing capabilities that aren't currently available. Please try using the bulk content generation feature instead, which supports image generation.`;
      await saveMessage(conversationId, 'bot', fallbackMessage, intent, undefined, undefined, true);
      return {
        answer: fallbackMessage,
        conversationId,
        intent,
        error: 'LMS_IMAGE_PROCESSING_ERROR',
        recoverable: true,
        canEscalate: true,
        suggestion: 'Try using the bulk content generation feature for content with images.'
      };
    }

    // Handle 500 Internal Server Error specifically
    if (errorMessage.includes('500') && errorMessage.includes('Internal Server Error')) {
      const fallbackMessage = `The LMS service is currently experiencing issues. Please try again later or contact support if the problem persists.`;
      await saveMessage(conversationId, 'bot', fallbackMessage, intent, undefined, undefined, true);
      return {
        answer: fallbackMessage,
        conversationId,
        intent,
        error: 'LMS_SERVICE_UNAVAILABLE',
        recoverable: true,
        canEscalate: true,
        suggestion: 'Try again later or contact support.'
      };
    }

    await saveMessage(conversationId, 'bot', `Error processing LMS request: ${errorMessage}`, intent, undefined, undefined, true);
    return {
      answer: `Error processing your LMS request: ${errorMessage}`,
      conversationId,
      intent,
      error: 'LMS_API_ERROR',
      recoverable: true,
      canEscalate: true
    };
  }
}

// ================= SKILLS AND JOB ROLES HANDLER =================
async function handleSkillsAndJobRolesRequest(
  request: ChatRequest,
  intent: string,
  conversationId: string,
  entities: any
): Promise<ChatResponse> {
  try {
    let apiKey: string;
    let method: "GET" | "POST" = "GET";
    let body: any = {};
    let params: any = { sub_institute_id: request.subInstituteId };

    const intentToApiMap: Record<string, string> = {
      'SKILLS_FETCH': 'skill_library',
      'SKILL_CATEGORIES_FETCH': 'skill_category',
      'SKILL_KNOWLEDGE_ABILITIES_FETCH': 'skill_knowledge_ability',
      'SKILL_PROFICIENCY_LEVELS_FETCH': 'proficiency_levels',
      'JOB_ROLES_FETCH': 'jobroleOccupation',
      'JOB_ROLE_SKILLS_FETCH': 'jobroleSkill',
      'JOB_ROLE_TASKS_FETCH': 'jobroleTask'
    };

    const actionIntentToApiMap: Record<string, { api: string; method: "GET" | "POST" }> = {
      'SKILL_CREATE': { api: 'skill_library_create', method: 'POST' },
      'SKILL_ATTRIBUTES_ADD': { api: 'skill_attribute_taxonomy', method: 'POST' },
      'JOB_ROLE_CREATE': { api: 'jobroleOccupation_create', method: 'POST' },
      'JOB_ROLE_UPDATE': { api: 'jobroleOccupation_update', method: 'POST' },
      'JOB_ROLE_DELETE': { api: 'jobroleOccupation_delete', method: 'POST' },
      'JOB_ROLE_SKILL_CREATE': { api: 'jobroleSkill_create', method: 'POST' },
      'JOB_ROLE_TASK_CREATE': { api: 'jobroleTask_create', method: 'POST' }
    };

    if (actionIntentToApiMap[intent]) {
      const config = actionIntentToApiMap[intent];
      apiKey = config.api;
      method = config.method;

      return {
        answer: `I need more information to ${intent.replace(/_/g, ' ').toLowerCase()}. Please provide the required details.`,
        conversationId,
        intent,
        error: 'Missing action parameters',
        recoverable: true,
        suggestion: 'Please provide the necessary information to complete this action.',
        canEscalate: true,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    } else {
      apiKey = intentToApiMap[intent] || 'skill_library';
    }

    const apiEntry = hpApiMap[apiKey];
    if (!apiEntry) {
      throw new Error(`No API mapping found for intent: ${intent}`);
    }

    const data = await callHpApi(method, apiEntry.url, params, body);

    await saveMessage(conversationId, 'bot', `Retrieved ${Array.isArray(data) ? data.length : (data ? 1 : 0)} skills/job roles record(s)`, intent);

    return createStructuredResponse(intent, Array.isArray(data) ? data : (data ? [data] : []), request.query, getIntentQuerySuggestions(intent));

  } catch (error) {
    console.error('Skills and Job Roles Request Error:', error);
    await saveMessage(conversationId, 'bot', `Error processing skills/job roles request: ${(error as Error).message}`, intent, undefined, undefined, true);
    return {
      answer: `Error processing your skills/job roles request: ${(error as Error).message}`,
      conversationId,
      intent,
      error: 'SKILLS_API_ERROR',
      recoverable: true,
      canEscalate: true
    };
  }
}

// ================= ORGANIZATION AND INDUSTRIES HANDLER =================
async function handleOrganizationAndIndustriesRequest(
  request: ChatRequest,
  intent: string,
  conversationId: string,
  entities: any
): Promise<ChatResponse> {
  try {
    let apiKey: string;
    let params: any = { sub_institute_id: request.subInstituteId };

    const intentToApiMap: Record<string, string> = {
      'USER_JOB_ROLES_FETCH': 's_user_jobrole',
      'INDUSTRIES_FETCH': 's_industries',
      'DEPARTMENT_MASTER_FETCH': 'department_master',
      'NEO_INDUSTRIES_FETCH': 'neo_industries',
      'DEPARTMENTS_FOR_INDUSTRY_FETCH': 'neo_industry_departments',
      'JOB_ROLES_FOR_DEPARTMENT_FETCH': 'neo_jobroles',
      'SKILLS_FOR_JOB_ROLE_FETCH': 'neo_skills'
    };

    apiKey = intentToApiMap[intent] || 's_industries';

    // Add path parameters for Neo4J endpoints
    if (entities.industrySlug && intent === 'DEPARTMENTS_FOR_INDUSTRY_FETCH') {
      apiKey = apiKey.replace('{slug}', entities.industrySlug);
    }
    if (entities.departmentSlug && intent === 'JOB_ROLES_FOR_DEPARTMENT_FETCH') {
      apiKey = apiKey.replace('{slug}', entities.departmentSlug);
    }
    if (entities.jobRoleName && intent === 'SKILLS_FOR_JOB_ROLE_FETCH') {
      params.name = entities.jobRoleName;
    }

    const apiEntry = hpApiMap[apiKey];
    if (!apiEntry) {
      throw new Error(`No API mapping found for intent: ${intent}`);
    }

    const data = await callHpApi('GET', apiEntry.url, params);

    await saveMessage(conversationId, 'bot', `Retrieved ${Array.isArray(data) ? data.length : (data ? 1 : 0)} organization/industries record(s)`, intent);

    return createStructuredResponse(intent, Array.isArray(data) ? data : (data ? [data] : []), request.query, getIntentQuerySuggestions(intent));

  } catch (error) {
    console.error('Organization and Industries Request Error:', error);
    await saveMessage(conversationId, 'bot', `Error processing organization/industries request: ${(error as Error).message}`, intent, undefined, undefined, true);
    return {
      answer: `Error processing your organization/industries request: ${(error as Error).message}`,
      conversationId,
      intent,
      error: 'ORG_API_ERROR',
      recoverable: true,
      canEscalate: true
    };
  }
}

// ================= REPORTS AND MISC HANDLER =================
async function handleReportsAndMiscRequest(
  request: ChatRequest,
  intent: string,
  conversationId: string,
  entities: any
): Promise<ChatResponse> {
  try {
    let apiKey: string;
    let method: "GET" | "POST" = "GET";
    let body: any = {};
    let params: any = { sub_institute_id: request.subInstituteId };

    const intentToApiMap: Record<string, string> = {
      'TASK_ANALYSIS_REPORT_FETCH': 'task_analysis_report',
      'EMPLOYEE_REPORT_FETCH': 'employee_report',
      'ORGANIZATION_DASHBOARD_FETCH': 'organization_dashboard',
      'DASHBOARD_FETCH': 'dashboard',
      'COMPLIANCE_LIST_FETCH': 'compliance_list',
      'JOB_POSTINGS_FETCH': 'job_postings'
    };

    const actionIntentToApiMap: Record<string, { api: string; method: "GET" | "POST" }> = {
      'COMPLIANCE_CREATE': { api: 'compliance_create', method: 'POST' },
      'COMPLIANCE_UPDATE': { api: 'compliance_update', method: 'POST' },
      'COMPLIANCE_DELETE': { api: 'compliance_delete', method: 'POST' },
      'JOB_POSTING_CREATE': { api: 'job_posting_create', method: 'POST' },
      'JOB_POSTING_UPDATE': { api: 'job_posting_update', method: 'POST' }
    };

    if (actionIntentToApiMap[intent]) {
      const config = actionIntentToApiMap[intent];
      apiKey = config.api;
      method = config.method;

      return {
        answer: `I need more information to ${intent.replace(/_/g, ' ').toLowerCase()}. Please provide the required details.`,
        conversationId,
        intent,
        error: 'Missing action parameters',
        recoverable: true,
        suggestion: 'Please provide the necessary information to complete this action.',
        canEscalate: true,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    } else {
      apiKey = intentToApiMap[intent] || 'dashboard';
    }

    const apiEntry = hpApiMap[apiKey];
    if (!apiEntry) {
      throw new Error(`No API mapping found for intent: ${intent}`);
    }

    const data = await callHpApi(method, apiEntry.url, params, body);

    await saveMessage(conversationId, 'bot', `Retrieved ${Array.isArray(data) ? data.length : (data ? 1 : 0)} reports/misc record(s)`, intent);

    return createStructuredResponse(intent, Array.isArray(data) ? data : (data ? [data] : []), request.query, getIntentQuerySuggestions(intent));

  } catch (error) {
    console.error('Reports and Misc Request Error:', error);
    await saveMessage(conversationId, 'bot', `Error processing reports/misc request: ${(error as Error).message}`, intent, undefined, undefined, true);
    return {
      answer: `Error processing your reports/misc request: ${(error as Error).message}`,
      conversationId,
      intent,
      error: 'REPORTS_API_ERROR',
      recoverable: true,
      canEscalate: true
    };
  }
}

// ================= GENERAL AND ACADEMIC HANDLER =================
async function handleGeneralAndAcademicRequest(
  request: ChatRequest,
  intent: string,
  conversationId: string,
  entities: any
): Promise<ChatResponse> {
  try {
    let apiKey: string;
    let params: any = { sub_institute_id: request.subInstituteId };

    const intentToApiMap: Record<string, string> = {
      'STANDARDS_FETCH': 'table_data',
      'SECTIONS_FETCH': 'table_data',
      'SUBJECTS_FETCH': 'table_data',
      'QUESTIONS_FETCH': 'table_data',
      'MENUS_FETCH': 'table_data'
    };

    const tableMap: Record<string, string> = {
      'STANDARDS_FETCH': 'standard',
      'SECTIONS_FETCH': 'academic_section',
      'SUBJECTS_FETCH': 'subject_master',
      'QUESTIONS_FETCH': 'question_master',
      'MENUS_FETCH': 'tblmenumaster'
    };

    apiKey = intentToApiMap[intent] || 'table_data';
    params.table = tableMap[intent] || 'standard';
    // Add sub_institute_id filter for table_data
    params[`filters[sub_institute_id]`] = request.subInstituteId;

    const apiEntry = hpApiMap[apiKey];
    if (!apiEntry) {
      throw new Error(`No API mapping found for intent: ${intent}`);
    }

    const data = await callHpApi('GET', apiEntry.url, params);

    await saveMessage(conversationId, 'bot', `Retrieved ${Array.isArray(data) ? data.length : (data ? 1 : 0)} general/academic record(s)`, intent);

    return createStructuredResponse(intent, Array.isArray(data) ? data : (data ? [data] : []), request.query, getIntentQuerySuggestions(intent));

  } catch (error) {
    console.error('General and Academic Request Error:', error);
    await saveMessage(conversationId, 'bot', `Error processing general/academic request: ${(error as Error).message}`, intent, undefined, undefined, true);
    return {
      answer: `Error processing your general/academic request: ${(error as Error).message}`,
      conversationId,
      intent,
      error: 'GENERAL_API_ERROR',
      recoverable: true,
      canEscalate: true
    };
  }
}

// ================= AI AND AUTH HANDLER =================
async function handleAIAndAuthRequest(
  request: ChatRequest,
  intent: string,
  conversationId: string,
  entities: any
): Promise<ChatResponse> {
  try {
    let apiKey: string;
    let method: "GET" | "POST" = "GET";
    let body: any = {};
    let params: any = { sub_institute_id: request.subInstituteId };

    const intentToApiMap: Record<string, string> = {
      'GAMMA_CONTENT_FETCH': 'gammaContent'
    };

    const actionIntentToApiMap: Record<string, { api: string; method: "GET" | "POST" }> = {
      'GEMINI_CHAT': { api: 'gemini_chat', method: 'POST' },
      'AI_COURSE_GENERATE': { api: 'AICourseGeneration', method: 'GET' },
      'FORGET_PASSWORD': { api: 'forget-password', method: 'POST' },
      'RESET_PASSWORD': { api: 'reset-password', method: 'POST' }
    };

    if (actionIntentToApiMap[intent]) {
      const config = actionIntentToApiMap[intent];
      apiKey = config.api;
      method = config.method;

      return {
        answer: `I need more information to ${intent.replace(/_/g, ' ').toLowerCase()}. Please provide the required details.`,
        conversationId,
        intent,
        error: 'Missing action parameters',
        recoverable: true,
        suggestion: 'Please provide the necessary information to complete this action.',
        canEscalate: true,
        querySuggestions: getIntentQuerySuggestions(intent)
      };
    } else {
      apiKey = intentToApiMap[intent] || 'gammaContent';
    }

    const apiEntry = hpApiMap[apiKey];
    if (!apiEntry) {
      throw new Error(`No API mapping found for intent: ${intent}`);
    }

    const data = await callHpApi(method, apiEntry.url, params, body);

    await saveMessage(conversationId, 'bot', `Retrieved ${Array.isArray(data) ? data.length : (data ? 1 : 0)} AI/auth record(s)`, intent);

    return createStructuredResponse(intent, Array.isArray(data) ? data : (data ? [data] : []), request.query, getIntentQuerySuggestions(intent));

  } catch (error) {
    console.error('AI and Auth Request Error:', error);
    await saveMessage(conversationId, 'bot', `Error processing AI/auth request: ${(error as Error).message}`, intent, undefined, undefined, true);
    return {
      answer: `Error processing your AI/auth request: ${(error as Error).message}`,
      conversationId,
      intent,
      error: 'AI_AUTH_API_ERROR',
      recoverable: true,
      canEscalate: true
    };
  }
}


interface SuggestionRequest {
  module: string; // 'course', 'assessment', 'learning', 'question-bank'
  context?: string; // Additional context about the current page
}

interface JobDescription {
  job_title: string;
  department: string;
  experience_level: string;
  key_responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  education: string;
  employment_type: string;
  location: string;
}

interface JobRoleOutput {
  CWFKT: {
    critical_work_function: string;
    key_tasks: string[];
  }[];
  skills: {
    title: string;
    description: string;
    category: string;
    sub_category: string;
    proficiency_level: number;
  }[];
  knowledge: {
    title: string;
    category: string;
    sub_category: string;
    level: number;
  }[];
  ability: {
    title: string;
    category: string;
    sub_category: string;
    level: number;
  }[];
  attitude: {
    title: string;
    category: string;
    sub_category: string;
    level: number;
  }[];
  behavior: {
    title: string;
    category: string;
    sub_category: string;
    level: number;
  }[];
}

interface ActionResponse {
  type: 'ACTION_RESPONSE';
  module: string;
  action: string;
  data: JobRoleOutput;
}

interface CreateJobDescriptionAction {
  type: 'CREATE_JOB_DESCRIPTION';
  payload: {
    industry: string;
    jobRole: string;
    department: string;
    description: string;
  };
}
// ================= JOB ROLE COMPETENCY TYPES =================

interface JobRoleCompetencyPayload {
  industry: string;
  department: string;
  jobRole: string;
  description: string;
  subInstituteId?: string;
}

interface IntentClassificationResult {
  intent: string;
  confidence: number;
  reasoning: string;
}

interface GenkitCompetencyResponse {
  cwf_items: Array<{
    critical_work_function: string;
    key_tasks: string[];
  }>;
  skills: Array<{
    title: string;
    description: string;
    category: string;
    sub_category: string;
    level: number;
  }>;
  knowledge: Array<{
    title: string;
    description?: string;
    category: string;
    sub_category: string;
    level: number;
  }>;
  ability: Array<{
    title: string;
    description?: string;
    category: string;
    sub_category: string;
    level: number;
  }>;
  attitude: Array<{
    title: string;
    description?: string;
    category: string;
    sub_category: string;
    level: number;
  }>;
  behavior: Array<{
    title: string;
    category: string;
    sub_category: string;
    level: number;
  }>;
  department?: string;
  description?: string;
}

let debugModeEnabled = false;
const OPENROUTER_SQL_MAX_TOKENS = 80;
const OPENROUTER_INSIGHTS_MAX_TOKENS = 120;
const OPENROUTER_FALLBACK_MAX_TOKENS = 100;

// Set to true when credits are critically low to disable AI generation
const DISABLE_AI_LOW_CREDITS = false; // Temporarily disabled due to low credits (134 remaining)
const OPENROUTER_STRUCTURED_MAX_TOKENS = 1200;

function enableDebugMode() {
  debugModeEnabled = true;
}


async function generateSQL(query: string, context: Array<{ role: string; content: string }>, subInstituteId?: string): Promise<string> {
  const contextPrompt = context.length > 0
    ? `Previous conversation:\n${context.map(c => `${c.role}: ${c.content}`).join('\n')}\n\n`
    : '';

  const subInstituteNote = subInstituteId ? `\n\nIMPORTANT: Always include "WHERE sub_institute_id = ${subInstituteId}" in your SQL query if the table has a sub_institute_id column. This ensures users only see data from their institute.` : '';

  const tableAliasesNote = `\n\nAvailable table aliases (use these for table names): ${Object.entries(tableAliasMap).map(([alias, table]) => `${alias} -> ${table}`).join(', ')}`;

  const prompt = `${contextPrompt}Convert the following natural language query to MySQL SQL:
  Query: "${query}"

  Database Schema (example - replace with your actual schema):
  - users (id, name, email, created_at)
  - projects (id, user_id, title, status, updated_at)
  - tasks (id, project_id, title, completed, due_date)${tableAliasesNote}${subInstituteNote}

  Return only the SQL query without explanations.`;

  const startTime = Date.now();
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a SQL expert. Generate only valid MySQL queries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: OPENROUTER_SQL_MAX_TOKENS
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("SQL GENERATION ERROR:", data);
    const providerMessage = data?.error?.message || 'Failed to generate SQL';
    throw new Error(providerMessage);
  }

  const responseTime = Date.now() - startTime;

  if (debugModeEnabled) {
    await logLLMCall('', 'deepseek/deepseek-chat', responseTime, true);
  }

  return data.choices[0].message.content.trim().replace(/```sql\n?|\n?```/g, '');
}

// -----------------------------------------
// REPLACE THE OLD executeSQLQuery FUNCTION
// async function executeSQLQuery(sql: string): Promise<any[]> {
//   const response = await fetch(process.env.DATABASE_API_URL || 'http://localhost:3001/api/query', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${process.env.DATABASE_API_KEY}`
//     },
//     body: JSON.stringify({ query: sql })
//   });

//   if (!response.ok) {
//     throw new Error('Database query failed');
//   }

//   const data = await response.json();
//   return data.results || [];
// }
// -----------------------------------------

// ---------------------------
// BEGIN REPLACEMENT: API LAYER
// ---------------------------

/**
 * Helper: table alias map (common English -> actual DB table)
 * Extend this map as you discover more shorthand words used in NL prompts.
 */
const tableAliasMap: Record<string, string> = {
  // menus
  "menu": "tblmenumaster",
  "menus": "tblmenumaster",

  // hrms leave
  "leave": "hrms_leave_type",
  "leave_type": "hrms_leave_type",
  "leave_types": "hrms_leave_type",

  // hrms attendance and holidays
  "attendance": "hrms_attendance",
  "holiday": "hrms_holiday",
  "holidays": "hrms_holiday",

  // payroll
  "payroll_deduction": "payroll_deduction",

  // lms
  "question_paper": "question_paper",
  "online_exam": "online_exam",

  // skills
  "skill_attribute_taxonomy": "skill_attribute_taxonomy",

  // organization
  "neo_industries": "neo_industries",
  "neo_industry_departments": "neo_industry_departments",
  "neo_jobroles": "neo_jobroles",
  "neo_skills": "neo_skills",

  // reports
  "task_analysis_report": "task_analysis_report",
  "employee_report": "employee_report",
  "organization_dashboard": "organization_dashboard",
  "dashboard": "dashboard",

  // misc
  "compliance": "compliance",
  "job_postings": "job_postings",

  // lms
  "course": "lms_course_master",
  "courses": "lms_course_master",
  "module": "chapter_master",
  "modules": "chapter_master",
  "content": "content_master",
  "questionpaper": "question_paper",

  // hrms / users
  "user": "tbluser",
  "users": "tbluser",
  "staff": "tbluser",
  "employee": "tbluser",
  "profile": "tbluserprofilemaster",
  "department": "hrms_departments",
  "departments": "hrms_departments",

  // standard/common tables found in doc
  "standard": "standard",
  "section": "academic_section",
  "subject": "subject_master",
  "question": "question_master",

  // payroll / salary
  "salary": "employee_salary_structure",
  "payroll": "monthly_payroll",

  // skills / jobrole
  "skill": "s_user_skill",
  "skills": "s_user_skill",
  "skill_category": "skill_category",
  "jobrole": "jobroleOccupation",
  "jobroles": "jobroleOccupation",
  "task": "jobroleTask",
  "tasks": "jobroleTask",

  // neo4j / graph
  "industry": "s_industries",
  "industries": "s_industries",

  // fallback short forms
  "menu_master": "tblmenumaster",
  "chapter": "chapter_master",

  // add more as you discover shorthand words used by users...
};
/**
 * HP API registry (module-wise). These are taken from your HP APIs.docx
 * - Key: logical endpoint / table name
 * - Value: { method, urlTemplate, defaultParams }.
 *
 * NOTE: The doc shows both local (127.0.0.1:8000) and production (hp.triz.co.in / erp.triz.co.in).
 * We will prefer production (hp.triz.co.in) when available; local is kept for dev fallback.
 *
 * Add more endpoints from the doc into this map as you require.
 *
 * (Cited from HP APIs.docx examples / modules). 
 */
const hpApiMap: Record<string, { method: "GET" | "POST"; url: string }> = {
  // -----------------------
  // Existing / previously included endpoints (keep as-is)
  // -----------------------
  "table_data": { method: "GET", url: "https://hp.triz.co.in/table_data" },

  // LMS module (existing)
  "chapter_master": { method: "GET", url: "https://hp.triz.co.in/lms/chapter_master" },
  "chapter_master_create": { method: "POST", url: "https://hp.triz.co.in/lms/chapter_master" },
  "content_master": { method: "POST", url: "https://hp.triz.co.in/lms/content_master" },
  "create_content_master": { method: "GET", url: "https://hp.triz.co.in/lms/create_content_master" },
  "question_chapter_master": { method: "GET", url: "https://hp.triz.co.in/lms/question_chapter_master" },
  "question_master": { method: "POST", url: "https://hp.triz.co.in/lms/question_master" },

  // AI / Gemini (existing)
  "gemini_chat": { method: "POST", url: "https://hp.triz.co.in/gemini_chat" },
  "AICourseGeneration": { method: "GET", url: "https://hp.triz.co.in/AICourseGeneration" },
  "gammaContent": { method: "GET", url: "http://127.0.0.1:8000/gammaContent" },

  // Dashboard / misc (existing)
  "dashboard": { method: "GET", url: "https://hp.triz.co.in/dashboard" },

  // ERP endpoints (existing)
  "lms_data_erp": { method: "GET", url: "https://erp.triz.co.in/lms_data" },

  // Job / Talent (existing)
  "job_applications": { method: "GET", url: "https://hp.triz.co.in/api/job-applications" },

  // Auth (existing)
  "forget-password": { method: "POST", url: "https://hp.triz.co.in/forget-password" },
  "reset-password": { method: "POST", url: "https://hp.triz.co.in/reset-password" },

  // -----------------------
  // MISSING APIs ADDED (from PDF) — group: HRMS
  // -----------------------
  "hrms_departments": { method: "GET", url: "https://hp.triz.co.in/table_data?table=hrms_departments" },
  "hrms_department_add": { method: "POST", url: "https://hp.triz.co.in/hrms/add_department" },

  "hrms_attendances": { method: "GET", url: "https://hp.triz.co.in/hrms/attendances" },
  "hrms_attendance_update": { method: "POST", url: "https://hp.triz.co.in/hrms/update_user_att" },
  "hrms_punch_out": { method: "POST", url: "https://hp.triz.co.in/hrms-out-time/store" },

  "hrms_leave_type": { method: "GET", url: "https://hp.triz.co.in/leave-type" },
  "hrms_leave_type_add": { method: "POST", url: "https://hp.triz.co.in/leave-type" },
  "hrms_leave_apply": { method: "POST", url: "https://hp.triz.co.in/leave-apply" },
  "hrms_leave_summary_report": { method: "GET", url: "https://hp.triz.co.in/leave-summary-report" },
  "hrms_leave_authorization": { method: "POST", url: "https://hp.triz.co.in/leave-authorisation/store" },

  "hrms_holiday_get": { method: "GET", url: "https://hp.triz.co.in/hrms/holiday" },
  "hrms_holiday_add": { method: "POST", url: "https://hp.triz.co.in/hrms/holiday" },

  // Payroll
  "employee_salary_structure": { method: "GET", url: "https://hp.triz.co.in/employee-salary-structure" },
  "employee_salary_structure_store": { method: "POST", url: "https://hp.triz.co.in/employee-salary-structure/store" },
  "payroll_deduction": { method: "GET", url: "https://hp.triz.co.in/payroll-deduction" },
  "monthly_payroll": { method: "GET", url: "https://hp.triz.co.in/monthly-payroll-report" },
  "monthly_payroll_store": { method: "POST", url: "https://hp.triz.co.in/monthly-payroll-store" },

  // -----------------------
  // Skill Library
  // -----------------------
  "skill_library": { method: "GET", url: "https://erp.triz.co.in/lms/skill_library" },
  ";skill_library_create": { method: "POST", url: "https://erp.triz.co.in/lms/skill_library" },
  "skill_category": { method: "GET", url: "https://erp.triz.co.in/lms/skill_library/create" },
  "skill_knowledge_ability": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_skill_knowledge_ability" },
  "proficiency_levels": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_skill_knowledge_ability&group_by=proficiency_level" },
  "skill_attribute_taxonomy": { method: "POST", url: "https://hp.triz.co.in/skill_library/attributes_taxonomy" },

  // -----------------------
  // JobRole & Occupation
  // -----------------------
  "jobroleOccupation": { method: "GET", url: "https://erp.triz.co.in/skill/jobroleOccupation" },
  "jobroleOccupation_create": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleOccupation" },
  "jobroleOccupation_update": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleOccupation/{id}" },
  "jobroleOccupation_delete": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleOccupation/{id}/delete" },

  "jobroleSkill": { method: "GET", url: "https://erp.triz.co.in/skill/jobroleSkill" },
  "jobroleSkill_create": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleSkill" },
  "jobroleSkill_update": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleSkill/{id}" },

  "jobroleTask": { method: "GET", url: "https://erp.triz.co.in/skill/jobroleTask" },
  "jobroleTask_create": { method: "POST", url: "https://erp.triz.co.in/skill/jobroleTask" },

  // -----------------------
  // LMS - other / exam / question paper
  // -----------------------
  "course_master": { method: "GET", url: "https://hp.triz.co.in/lms/course_master" },
  "lms_course_master": { method: "GET", url: "https://hp.triz.co.in/table_data?table=sub_std_map" },
  "question_paper_search": { method: "GET", url: "https://hp.triz.co.in/question_paper/search_question" },
  "question_paper_store": { method: "POST", url: "https://hp.triz.co.in/lms/question_paper/storeData" },
  "online_exam": { method: "GET", url: "https://hp.triz.co.in/lms/online_exam" },
  "online_exam_submit": { method: "POST", url: "https://hp.triz.co.in/lms/online_exam" },

  // -----------------------
  // Compliance
  // -----------------------
  "compliance_list": { method: "GET", url: "https://erp.triz.co.in/api/compliance/list" },
  "compliance_create": { method: "POST", url: "https://erp.triz.co.in/api/compliance/create" },
  "compliance_update": { method: "POST", url: "https://erp.triz.co.in/api/compliance/update/{id}" },
  "compliance_delete": { method: "POST", url: "https://erp.triz.co.in/api/compliance/delete/{id}" },

  // -----------------------
  // Talent / Job Posting
  // -----------------------
  "job_postings": { method: "GET", url: "https://hp.triz.co.in/api/job-postings" },
  "job_posting_create": { method: "POST", url: "https://hp.triz.co.in/api/job-postings" },
  "job_posting_update": { method: "POST", url: "https://hp.triz.co.in/api/job-postings/{id}" },
  // "job_posting_delete": { method: "DELETE", url: "https://hp.triz.co.in/api/job-postings/{id}" },

  // -----------------------
  // Organization / Department
  // -----------------------
  "s_user_jobrole": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_user_jobrole" },
  "s_industries": { method: "GET", url: "https://hp.triz.co.in/table_data?table=s_industries" },
  "department_master": { method: "GET", url: "https://hp.triz.co.in/hrms/add_department" },

  // -----------------------
  // Neo4J / Graph
  // -----------------------
  "neo_industries": { method: "GET", url: "https://hp.triz.co.in/api/industries" },
  "neo_industry_departments": { method: "GET", url: "https://hp.triz.co.in/api/industry/{slug}/departments" },
  "neo_jobroles": { method: "GET", url: "https://hp.triz.co.in/api/department/{slug}/jobroles" },
  "neo_skills": { method: "GET", url: "http://127.0.0.1:8000/api/jobrole/{name}/skills" },

  // -----------------------
  // Reports / misc direct endpoints
  // -----------------------
  "task_analysis_report": { method: "GET", url: "https://hp.triz.co.in/task_analysis_report" },
  "employee_report": { method: "GET", url: "https://hp.triz.co.in/user/employee_report" },
  "organization_dashboard": { method: "GET", url: "https://hp.triz.co.in/organization_dashboard" },

  // -----------------------
  // Fallback Generic endpoints (dev local)
  // -----------------------
  "local_table_data": { method: "GET", url: "http://127.0.0.1:8000/table_data" },
  "local_gammaContent": { method: "GET", url: "http://127.0.0.1:8000/gammaContent" }
};

/**
 * Build a URL with query parameters
 */
function buildUrl(baseUrl: string, params?: Record<string, string | number | undefined>) {
  if (!params) return baseUrl;
  const u = new URL(baseUrl);
  // use provided params; skip undefined
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // If value is an object/array, convert to bracket notation where appropriate
    if (Array.isArray(v)) {
      v.forEach((val, idx) => u.searchParams.append(`${k}[${idx}]`, String(val)));
    } else {
      u.searchParams.append(k, String(v));
    }
  });
  return u.toString();
}

/**
 * Call HP API with appropriate method & headers.
 * Most HP APIs use token as a query param; but we keep Authorization header fallback.
 */


async function callHpApi(method: "GET" | "POST", url: string, params?: Record<string, any>, body?: any) {
  const finalUrl = method === "GET" ? buildUrl(url, params) : buildUrl(url, params);
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Use HP API bearer token for authentication
      "Authorization": `Bearer ${process.env.HP_API_BEARER || process.env.LLM_API_KEY || ''}`
    }
  };

  if (method === "POST") {
    // If caller provides params.body, send it
    if (params?.body) {
      fetchOptions.body = JSON.stringify(params.body);
    } else if (body) {
      fetchOptions.body = JSON.stringify(body);
    } else {
      // send empty body if not provided
      fetchOptions.body = JSON.stringify({});
    }
  }


  const res = await fetch(finalUrl, fetchOptions);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HP API call failed ${res.status} ${res.statusText} - ${text}`);
  }
  // Parse JSON (most endpoints return JSON)
  const data = await res.json().catch(async () => {
    // if not json, try text
    const t = await res.text().catch(() => "");
    return { raw: t };
  });
  return data;
}

/**
 * Very small SQL parser helper: extract SELECT fields, FROM table, WHERE clause, ORDER BY, GROUP BY, LIMIT
 * Returns fragments or null
 */
function parseSQLFragments(sql: string) {
  if (!sql || typeof sql !== "string") return null;
  const rSelect = /SELECT\s+(.+?)\s+FROM\s+/i;
  const rFrom = /FROM\s+`?([\w\.]+)`?/i;
  const rWhere = /WHERE\s+(.+?)(?:ORDER\s+BY|GROUP\s+BY|LIMIT|$)/i;
  const rOrder = /ORDER\s+BY\s+([\w\.\s,]+)(?:\s+(ASC|DESC))?/i;
  const rGroup = /GROUP\s+BY\s+([\w\.\s,]+)/i;
  const rLimit = /LIMIT\s+(\d+)/i;

  const selectMatch = sql.match(rSelect);
  const fromMatch = sql.match(rFrom);
  const whereMatch = sql.match(rWhere);
  const orderMatch = sql.match(rOrder);
  const groupMatch = sql.match(rGroup);
  const limitMatch = sql.match(rLimit);

  return {
    select: selectMatch ? selectMatch[1].trim() : undefined,
    table: fromMatch ? fromMatch[1].trim() : undefined,
    where: whereMatch ? whereMatch[1].trim() : undefined,
    order_by: orderMatch ? orderMatch[1].trim() : undefined,
    order_dir: orderMatch && orderMatch[2] ? orderMatch[2].trim().toUpperCase() : undefined,
    group_by: groupMatch ? groupMatch[1].trim() : undefined,
    limit: limitMatch ? Number(limitMatch[1]) : undefined
  };
}

/**
 * Parse simple WHERE expressions like:
 *  parent_id = 0 AND status = 1
 *  parent_id='0' AND status IN (1,2)
 * Returns { filters: Record<string,string|number|Array<string|number>> }
 */
function parseWhereToFilters(whereClause?: string) {
  if (!whereClause) return {};
  // split by AND for now (doc shows simple filters)
  const parts = whereClause.split(/\s+AND\s+/i).map(p => p.trim()).filter(Boolean);
  const filters: Record<string, any> = {};
  for (const part of parts) {
    // handle IN (...) and = and LIKE
    const inMatch = part.match(/(\w+)\s+IN\s*\((.+)\)/i);
    if (inMatch) {
      const key = inMatch[1];
      const vals = inMatch[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      filters[key] = vals;
      continue;
    }
    const eqMatch = part.match(/(\w+)\s*=\s*('?[^']+'?|\"?[^\"]+\"?|\d+)/i);
    if (eqMatch) {
      const key = eqMatch[1];
      const raw = eqMatch[2].trim().replace(/^['"]|['"]$/g, '');
      // coerce numeric strings to numbers when appropriate
      const num = Number(raw);
      filters[key] = isNaN(num) ? raw : num;
      continue;
    }
    const likeMatch = part.match(/(\w+)\s+LIKE\s+'(.+)'/i);
    if (likeMatch) {
      filters[likeMatch[1]] = likeMatch[2];
      continue;
    }
    // fallback: try to split by space
    const fallback = part.split(/\s+/);
    if (fallback.length >= 3) {
      const key = fallback[0];
      const val = fallback.slice(2).join(' ').replace(/^['"]|['"]$/g, '');
      filters[key] = val;
    }
  }
  return filters;
}

/**
 * Try to infer a table name from natural language if SQL didn't contain FROM
 */
function inferTableFromNL(nl: string): string | undefined {
  if (!nl) return undefined;
  const text = nl.toLowerCase();
  for (const [alias, table] of Object.entries(tableAliasMap)) {
    const pattern = new RegExp(`\\b${alias}\\b`, "i");
    if (pattern.test(text)) return table;
  }
  return undefined;
}

/**
 * Main executeSQLQuery replacement:
 * - Accepts generated SQL and original NL query (for fallback inference).
 * - Determines the correct HP endpoint for the requested table or intent.
 * - Constructs params and calls the endpoint.
 *
 * Note: This function is intentionally conservative: it avoids executing mutating SQL
 * (DROP/DELETE/etc.) — validateSQL() still runs upstream.
 */
async function executeSQLQuery(sql: string, originalQuery?: string): Promise<any[]> {
  // 1) Try to parse SQL fragments
  const fragments = parseSQLFragments(sql || "");
  let table = fragments?.table;

  // ---- FIX: APPLY alias map IMMEDIATELY ----
  if (table && tableAliasMap[table.toLowerCase()]) {
    table = tableAliasMap[table.toLowerCase()];
  }
  const whereClause = fragments?.where;
  const order_by = fragments?.order_by;
  const order_dir = fragments?.order_dir;
  const group_by = fragments?.group_by;
  const limit = fragments?.limit;

  // 2) If no table found in SQL, try to infer from original natural-language query
  // Additional fallback: Use alias map keys
  if (!table && originalQuery) {
    const words = originalQuery.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (tableAliasMap[w]) {
        table = tableAliasMap[w];
        break;
      }
    }
  }


  // 3) If still no table, but SQL contains only a WHERE (LLM might have returned "WHERE ...")
  if (!table && fragments && fragments.where) {
    // attempt to detect table from WHERE keys by checking common table columns
    // basic heuristic: common column names -> table mapping (expandable)
    const heuristicColumnMap: Record<string, string> = {
      parent_id: "tblmenumaster",
      sub_institute_id: "tblmenumaster",
      sort_order: "tblmenumaster",
      status: "tblmenumaster",
      user_id: "tbluser",
      employee_id: "tbluser",
      subject_id: "chapter_master",
      chapter_id: "chapter_master",
      standard_id: "chapter_master",
      // extend this map as needed
    };
    const keys = Object.keys(parseWhereToFilters(fragments.where));
    for (const k of keys) {
      if (heuristicColumnMap[k]) {
        table = heuristicColumnMap[k];
        break;
      }
    }
  }

  // 4) If still no table, throw a helpful error
  if (!table) {
    throw new Error("Could not determine target table for query. Please mention the table name (for example 'tblmenumaster' or say 'menus').");
  }

  // 5) Normalize table name (strip schema if present)
  table = table.split('.').pop() as string;

  // 6) Build filters from WHERE clause
  const filters = parseWhereToFilters(whereClause);

  // 7) Map table -> API endpoint
  // Default: call /table_data?table=<table>&filters[...] (common pattern in doc)
  // But for some tables or intents, call dedicated endpoints (e.g., chapter_master)
  let apiEntry = undefined;

  // exact matches in registry
  if (hpApiMap[table]) {
    apiEntry = hpApiMap[table];
  }
  // Fallback match: remove "-" and "_" from both sides
  if (!apiEntry) {
    const cleanedTable = table.toLowerCase().replace(/[-_]/g, "");
    apiEntry = Object.entries(hpApiMap).find(([key]) =>
      key.toLowerCase().replace(/[-_]/g, "") === cleanedTable
    )?.[1];
  }


  // known special table -> endpoint mapping
  const specialTableToEntryKey: Record<string, string> = {
    "chapter_master": "chapter_master",
    "content_master": "content_master",
    "question_chapter_master": "question_chapter_master",
    "question_master": "question_master",
    "dashboard": "dashboard",
    // add other direct mappings if present in hpApiMap
  };

  if (!apiEntry && specialTableToEntryKey[table] && hpApiMap[specialTableToEntryKey[table]]) {
    apiEntry = hpApiMap[specialTableToEntryKey[table]];
  }

  // Default fallback: generic table_data endpoint
  if (!apiEntry) {
    apiEntry = hpApiMap["table_data"];
  }

  // 8) Construct API params using doc's expected query params style
  const params: Record<string, any> = {};
  // default required common params (the doc uses token, sub_institute_id etc.)
  // prefer passing env vars if available
  if (process.env.HP_API_TOKEN) params["token"] = process.env.HP_API_TOKEN;
  if (process.env.HP_SUB_INSTITUTE_ID) params["sub_institute_id"] = process.env.HP_SUB_INSTITUTE_ID;

  // Always add sub_institute_id as a filter if the table has this column
  const tablesWithSubInstituteId = [
    'tbluser', 'tbluserprofilemaster', 'hrms_departments', 'hrms_attendance',
    'hrms_leave_type', 'hrms_holiday', 'employee_salary_structure', 'payroll_deduction',
    'monthly_payroll', 'lms_course_master', 'chapter_master', 'content_master',
    'question_chapter_master', 'question_master', 'question_paper', 'online_exam',
    'skill_library', 'skill_category', 's_skill_knowledge_ability', 'jobroleOccupation',
    'jobroleSkill', 'jobroleTask', 's_user_jobrole', 's_industries', 'standard',
    'academic_section', 'subject_master', 'tblmenumaster'
  ];

  const hasSubInstituteId = tablesWithSubInstituteId.includes(table);
  if (hasSubInstituteId && process.env.HP_SUB_INSTITUTE_ID) {
    filters['sub_institute_id'] = process.env.HP_SUB_INSTITUTE_ID;
  }

  // incorporate filters from WHERE
  if (Object.keys(filters).length > 0) {
    params["table"] = table; // ensure table param is present for table_data
    for (const [k, v] of Object.entries(filters)) {
      // API expects filters[key]=value
      if (Array.isArray(v)) {
        v.forEach((val, idx) => {
          params[`filters[${k}][${idx}]`] = val;
        });
      } else {
        params[`filters[${k}]`] = v;
      }

    }
  } else {
    // If no filters but SQL had SELECT * FROM table (no where), still pass table
    params["table"] = table;
  }

  // incorporate order_by / group_by / limit if present (many endpoints accept these params)
  if (order_by) {
    params["order_by[column]"] = order_by;
    if (order_dir) params["order_by[direction]"] = order_dir.toLowerCase();
  }
  if (group_by) {
    params["group_by"] = group_by;
  }
  if (typeof limit === "number") {
    params["limit"] = limit;
  }

  // doc examples often include type=API and user context - add if provided in ENV
  params["type"] = params["type"] || "API";
  if (process.env.HP_USER_ID) params["user_id"] = params["user_id"] || process.env.HP_USER_ID;
  if (process.env.HP_SYEAR) params["syear"] = params["syear"] || process.env.HP_SYEAR;
  if (!params["token"] && process.env.HP_API_TOKEN_FALLBACK) params["token"] = process.env.HP_API_TOKEN_FALLBACK;

  // 9) Final call: some hpApiMap entries are POST endpoints expecting query params for create/update
  try {
    // If the API is exactly 'table_data' or similar, call with GET; if special and method POST, call POST
    const method = apiEntry.method;
    // If table_data, use GET with built params as querystring
    if (apiEntry === hpApiMap["table_data"]) {
      // build URL and call
      const data = await callHpApi("GET", apiEntry.url, params);
      // many table_data responses are arrays or {data: ...}; normalize
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      if (data?.data) return data.data;
      return data;
    } else {
      // For special endpoints, we may need to pass specific param names from doc
      // Example: chapter_master expects standard_id, subject_id etc.
      // We'll pass our params and let API handle extras.
      const data = await callHpApi(method, apiEntry.url, params, undefined);
      // Normalize response
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      if (data?.data) return data.data;
      return data;
    }
  } catch (err) {
    // rethrow with additional context so upper layers know which URL failed
    throw new Error(`executeSQLQuery failed for table=${table}: ${(err as Error).message}`);
  }
}

// -------------------------
// END REPLACEMENT: API LAYER
// -------------------------



async function generateInsights(query: string, sql: string, results: any[]): Promise<string> {
  const prompt = `User asked: "${query}"

SQL Query executed:
${sql}

Results (${results.length} rows):
${JSON.stringify(results.slice(0, 5), null, 2)}${results.length > 5 ? '\n...(more rows)' : ''}

Based on these results, provide a clear, conversational answer to the user's question.
Be concise but informative. If the results are empty, explain that no data was found.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful data assistant. Provide clear, conversational insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: OPENROUTER_INSIGHTS_MAX_TOKENS
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Failed to generate insights');
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function extractTablesFromSQL(sql: string): string[] {
  const tableRegex = /FROM\s+`?(\w+)`?|JOIN\s+`?(\w+)`?/gi;
  const tables = new Set<string>();
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1] || match[2];
    if (tableName) {
      tables.add(tableName);
    }
  }

  return Array.from(tables);
}

function validateSQL(sql: string): boolean {
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
  const upperSQL = sql.toUpperCase();

  for (const keyword of dangerousKeywords) {
    if (upperSQL.includes(keyword)) {
      return false;
    }
  }

  return true;
}

function isExplicitMockQuery(query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  const compactQuery = normalizedQuery.replace(/[^\w\s]/g, ' ');
  const tokens = compactQuery.split(/\s+/).filter(Boolean);

  const hasMockKeyword = ['mock', 'test', 'testing', 'sample', 'demo'].some((keyword) =>
    tokens.includes(keyword)
  );
  const hasQueryKeyword = ['query', 'prompt', 'request', 'question'].some((keyword) =>
    tokens.includes(keyword)
  );

  if (hasMockKeyword && hasQueryKeyword) {
    return true;
  }

  return [
    /^mock query$/,
    /^run (a )?mock query$/,
    /^execute (a )?mock query$/,
    /^test (a )?mock query$/,
    /^try (a )?mock query$/,
    /^this is (a )?mock query$/,
    /^use (a )?mock query$/,
    /^run (a )?test query$/,
    /^execute (a )?test query$/,
    /^sample query$/,
    /^demo query$/,
  ].some((pattern) => pattern.test(normalizedQuery));
}

// Define queries that should use direct API endpoints instead of SQL
const apiEndpointQueries: Record<string, { apiKey: string; method?: "GET" | "POST"; params?: any }> = {
  // Courses - use direct API instead of SQL
  'show all courses': { apiKey: 'course_master', method: 'GET' },
  'list courses': { apiKey: 'course_master', method: 'GET' },
  'get courses': { apiKey: 'course_master', method: 'GET' },

  // Modules
  'list modules for course x': { apiKey: 'chapter_master', method: 'GET' },
  'show modules': { apiKey: 'chapter_master', method: 'GET' },
  'get modules': { apiKey: 'chapter_master', method: 'GET' },

  // Content
  'show content for module y': { apiKey: 'content_master', method: 'GET' },
  'get content': { apiKey: 'content_master', method: 'GET' },

  // Question chapters
  'show question chapters': { apiKey: 'question_chapter_master', method: 'GET' },
  'question chapters': { apiKey: 'question_chapter_master', method: 'GET' },

  // Exams
  'show online exams': { apiKey: 'online_exam', method: 'GET' },
  'list exams': { apiKey: 'online_exam', method: 'GET' },
  'available exams': { apiKey: 'online_exam', method: 'GET' },
};

function getPredefinedSQL(query: string, subInstituteId?: string): string | null {
  const lowerQuery = query.toLowerCase().trim();

  // Check if this should use direct API endpoint instead of SQL
  if (apiEndpointQueries[lowerQuery]) {
    return null; // Signal to use API endpoint instead
  }

  // Debug logging for troubleshooting
  console.log(`Checking predefined SQL for query: "${lowerQuery}"`);

  const subInstituteFilter = subInstituteId ? ` WHERE sub_institute_id = ${subInstituteId}` : '';

  // Exact matches for SQL queries (tables that exist)
  const exactMatches: Record<string, string> = {
    'show me all users': `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`,
    'list all users': `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`,
    'get all users': `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`,
    'show users': `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`,
    'list users': `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`,
    'get users': `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`,

    'show departments': `SELECT name, description, status FROM hrms_departments${subInstituteFilter} LIMIT 50`,
    'list departments': `SELECT name, description, status FROM hrms_departments${subInstituteFilter} LIMIT 50`,
    'get departments': `SELECT name, description, status FROM hrms_departments${subInstituteFilter} LIMIT 50`,

    'show all skills': `SELECT name, category FROM skill_library${subInstituteFilter} LIMIT 50`,
    'list skills': `SELECT name, category FROM skill_library${subInstituteFilter} LIMIT 50`,
    'get skills': `SELECT name, category FROM skill_library${subInstituteFilter} LIMIT 50`,

    'show job roles': `SELECT id, name, description FROM jobroleOccupation${subInstituteFilter} LIMIT 50`,
    'list job roles': `SELECT id, name, description FROM jobroleOccupation${subInstituteFilter} LIMIT 50`,
    'get job roles': `SELECT id, name, description FROM jobroleOccupation${subInstituteFilter} LIMIT 50`,

    'show industries': `SELECT id, name FROM s_industries${subInstituteFilter} LIMIT 50`,
    'list industries': `SELECT id, name FROM s_industries${subInstituteFilter} LIMIT 50`,
    'get industries': `SELECT id, name FROM s_industries${subInstituteFilter} LIMIT 50`,

    'show standards': `SELECT id, name FROM standard${subInstituteFilter} LIMIT 50`,
    'list standards': `SELECT id, name FROM standard${subInstituteFilter} LIMIT 50`,
    'get standards': `SELECT id, name FROM standard${subInstituteFilter} LIMIT 50`,

    'show sections': `SELECT id, name FROM academic_section${subInstituteFilter} LIMIT 50`,
    'list sections': `SELECT id, name FROM academic_section${subInstituteFilter} LIMIT 50`,
    'get sections': `SELECT id, name FROM academic_section${subInstituteFilter} LIMIT 50`,

    'show subjects': `SELECT id, name FROM subject_master${subInstituteFilter} LIMIT 50`,
    'list subjects': `SELECT id, name FROM subject_master${subInstituteFilter} LIMIT 50`,
    'get subjects': `SELECT id, name FROM subject_master${subInstituteFilter} LIMIT 50`,

    'show questions': `SELECT id, question_text FROM question_master${subInstituteFilter} LIMIT 50`,
    'list questions': `SELECT id, question_text FROM question_master${subInstituteFilter} LIMIT 50`,
    'get questions': `SELECT id, question_text FROM question_master${subInstituteFilter} LIMIT 50`,

    'show menus': `SELECT id, name FROM tblmenumaster${subInstituteFilter} LIMIT 50`,
    'list menus': `SELECT id, name FROM tblmenumaster${subInstituteFilter} LIMIT 50`,
    'get menus': `SELECT id, name FROM tblmenumaster${subInstituteFilter} LIMIT 50`,

    'show attendance records': `SELECT date, status, check_in_time, check_out_time FROM hrms_attendance WHERE user_id = CURRENT_USER()${subInstituteFilter ? ` AND ${subInstituteFilter.replace('WHERE ', '')}` : ''} LIMIT 50`,
    'my attendance': `SELECT date, status, check_in_time, check_out_time FROM hrms_attendance WHERE user_id = CURRENT_USER()${subInstituteFilter ? ` AND ${subInstituteFilter.replace('WHERE ', '')}` : ''} LIMIT 50`,

    'show leave types': `SELECT id, name, description FROM hrms_leave_type${subInstituteFilter} LIMIT 50`,
    'list leave types': `SELECT id, name, description FROM hrms_leave_type${subInstituteFilter} LIMIT 50`,

    'show holidays': `SELECT date, name, description FROM hrms_holiday${subInstituteFilter} LIMIT 50`,
    'list holidays': `SELECT date, name, description FROM hrms_holiday${subInstituteFilter} LIMIT 50`
  };

  // Check for exact matches first
  if (exactMatches[lowerQuery]) {
    return exactMatches[lowerQuery];
  }

  // Pattern-based matching for flexibility (only for tables that exist)
  // Skills queries
  if (lowerQuery.includes('skill') && (lowerQuery.includes('available') || lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('what'))) {
    return `SELECT name, category FROM skill_library${subInstituteFilter} LIMIT 50`;
  }

  // Users queries
  if (lowerQuery.includes('user') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`;
  }

  // Departments queries
  if (lowerQuery.includes('department') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT name, description, status FROM hrms_departments${subInstituteFilter} LIMIT 50`;
  }

  // Job roles queries
  if (lowerQuery.includes('job role') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name, description FROM jobroleOccupation${subInstituteFilter} LIMIT 50`;
  }

  // Industries queries
  if (lowerQuery.includes('industr') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name FROM s_industries${subInstituteFilter} LIMIT 50`;
  }

  // Standards queries
  if (lowerQuery.includes('standard') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name FROM standard${subInstituteFilter} LIMIT 50`;
  }

  // Sections queries
  if (lowerQuery.includes('section') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name FROM academic_section${subInstituteFilter} LIMIT 50`;
  }

  // Subjects queries
  if (lowerQuery.includes('subject') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name FROM subject_master${subInstituteFilter} LIMIT 50`;
  }

  // Questions queries
  if (lowerQuery.includes('question') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, question_text FROM question_master${subInstituteFilter} LIMIT 50`;
  }

  // Menus queries
  if (lowerQuery.includes('menu') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name FROM tblmenumaster${subInstituteFilter} LIMIT 50`;
  }

  // Attendance queries
  if (lowerQuery.includes('attendance') && (lowerQuery.includes('record') || lowerQuery.includes('show') || lowerQuery.includes('my'))) {
    return `SELECT date, status, check_in_time, check_out_time FROM hrms_attendance WHERE user_id = CURRENT_USER()${subInstituteFilter ? ` AND ${subInstituteFilter.replace('WHERE ', '')}` : ''} LIMIT 50`;
  }

  // Leave types queries
  if (lowerQuery.includes('leave type') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT id, name, description FROM hrms_leave_type${subInstituteFilter} LIMIT 50`;
  }

  // Holidays queries
  if (lowerQuery.includes('holiday') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('all'))) {
    return `SELECT date, name, description FROM hrms_holiday${subInstituteFilter} LIMIT 50`;
  }

  // Final fallback - try to match keywords to working queries
  if (lowerQuery.includes('user') && (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('all'))) {
    console.log('Fallback: matched user query');
    return `SELECT id, name, email FROM tbluser${subInstituteFilter} LIMIT 50`;
  }

  if (lowerQuery.includes('department') && (lowerQuery.includes('show') || lowerQuery.includes('list'))) {
    console.log('Fallback: matched department query');
    return `SELECT name, description, status FROM hrms_departments${subInstituteFilter} LIMIT 50`;
  }

  if (lowerQuery.includes('job role') && (lowerQuery.includes('show') || lowerQuery.includes('list'))) {
    console.log('Fallback: matched job role query');
    return `SELECT id, name, description FROM jobroleOccupation${subInstituteFilter} LIMIT 50`;
  }

  console.log(`No predefined SQL match found for: "${lowerQuery}"`);
  return null;
}

export async function handleChatRequest(request: ChatRequest): Promise<ChatResponse> {
  if (request.debugMode) {
    enableDebugMode();
  }

  // Validate query before proceeding
  if (!request.query || typeof request.query !== 'string') {
    return {
      answer: 'Please provide a valid query.',
      intent: 'unclear',
      confidence: 0.1,
      error: 'Invalid query - missing or not a string'
    };
  }

  const conversationId = await ensureConversation(request);
  const intent = classifyIntent(request.query, request.conversationHistory);
  const entities = extractEntities(request.query);
  let attempt = 0;
  const maxAttempts = 2;

  try {
    if (!request.role) {
      request.role = 'user';
    }

    const anonymousId = request.userId || uuidv4();
    const roleContext = await getRoleContext(anonymousId);

    await saveMessage(conversationId, 'user', request.query, intent.intent);

    const sanitized = sanitizeQuery(request.query);
    if (!sanitized.isClean) {
      const securityError = {
        answer: `Security check flagged concerns: ${sanitized.threats.join(', ')}. Please rephrase your question.`,
        conversationId,
        intent: intent.intent,
        error: 'Security validation failed',
        recoverable: false,
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', securityError.answer, intent.intent, undefined, undefined, true, 'Security validation failed');
      return securityError;
    }

    const safetyCheck = validateQuerySafety(request.query, request.role);
    if (!safetyCheck.safe) {
      const accessError = {
        answer: safetyCheck.reason || 'You do not have permission to access this data.',
        conversationId,
        intent: intent.intent,
        error: 'Access denied',
        recoverable: false,
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', accessError.answer, intent.intent, undefined, undefined, true, 'Access denied');
      return accessError;
    }

    if (isExplicitMockQuery(request.query)) {
      const mockResponse: ChatResponse = {
        answer: 'Mock query executed successfully. The mock pipeline is working as expected.',
        conversationId,
        intent: 'data_retrieval',
        sql: 'SELECT 1 AS mock_result;',
        tables_used: [],
        insights: 'Mock execution completed without calling external services.',
        canEscalate: true
      };

      await saveMessage(conversationId, 'bot', mockResponse.answer, mockResponse.intent, mockResponse.sql, []);
      return mockResponse;
    }

    // === JOB_ROLE_COMPETENCY Routing (Phase 1) ===
    if (intent.intent === 'JOB_ROLE_COMPETENCY') {
      return handleJobRoleCompetencyRequest(
        request,
        { userId: anonymousId, role: request.role },
        conversationId,
        intent,
        entities
      );
    }

    // === Course_Recommendation Routing ===
    if (intent.intent === 'Course_Recommendation') {
      console.log('Course_Recommendation intent detected');
      return handleCourseRecommendationRequest(
        request,
        { userId: anonymousId },
        conversationId,
        intent
      );
    }

    // === SKILL_GAP_ANALYSIS Routing ===
    if (intent.intent === 'SKILL_GAP_ANALYSIS') {
      console.log('SKILL_GAP_ANALYSIS intent detected');
      return handleSkillGapAnalysisRequest(
        request,
        { userId: anonymousId },
        conversationId,
        intent,
        entities
      );
    }

    // === CREATE_JOB_DESCRIPTION Routing ===

    if (intent.intent === 'CREATE_JOB_DESCRIPTION') {
      return handleCreateJobDescriptionAction(request, { userId: anonymousId, role: request.role }, conversationId);
    }

    // === HRMS Routing ===
    if (intent.intent.startsWith('HRMS_')) {
      return handleHRMSRequest(request, intent.intent, conversationId, entities);
    }

    // === LMS Routing ===
    if (intent.intent.startsWith('LMS_')) {
      return handleLMSRequest(request, intent.intent, conversationId, entities);
    }

    // === Skills and Job Roles Routing ===
    if (['SKILLS_FETCH', 'SKILL_CREATE', 'SKILL_CATEGORIES_FETCH', 'SKILL_KNOWLEDGE_ABILITIES_FETCH',
         'SKILL_PROFICIENCY_LEVELS_FETCH', 'SKILL_ATTRIBUTES_ADD', 'JOB_ROLES_FETCH', 'JOB_ROLE_CREATE',
         'JOB_ROLE_UPDATE', 'JOB_ROLE_DELETE', 'JOB_ROLE_SKILLS_FETCH', 'JOB_ROLE_SKILL_CREATE',
         'JOB_ROLE_TASKS_FETCH', 'JOB_ROLE_TASK_CREATE'].includes(intent.intent)) {
      return handleSkillsAndJobRolesRequest(request, intent.intent, conversationId, entities);
    }

    // === Organization and Industries Routing ===
    if (['USER_JOB_ROLES_FETCH', 'INDUSTRIES_FETCH', 'DEPARTMENT_MASTER_FETCH', 'NEO_INDUSTRIES_FETCH',
         'DEPARTMENTS_FOR_INDUSTRY_FETCH', 'JOB_ROLES_FOR_DEPARTMENT_FETCH', 'SKILLS_FOR_JOB_ROLE_FETCH'].includes(intent.intent)) {
      return handleOrganizationAndIndustriesRequest(request, intent.intent, conversationId, entities);
    }

    // === Reports and Misc Routing ===
    if (['TASK_ANALYSIS_REPORT_FETCH', 'EMPLOYEE_REPORT_FETCH', 'ORGANIZATION_DASHBOARD_FETCH',
         'DASHBOARD_FETCH', 'COMPLIANCE_LIST_FETCH', 'COMPLIANCE_CREATE', 'COMPLIANCE_UPDATE',
         'COMPLIANCE_DELETE', 'JOB_POSTINGS_FETCH', 'JOB_POSTING_CREATE', 'JOB_POSTING_UPDATE'].includes(intent.intent)) {
      return handleReportsAndMiscRequest(request, intent.intent, conversationId, entities);
    }

    // === General/Academic Routing ===
    if (['STANDARDS_FETCH', 'SECTIONS_FETCH', 'SUBJECTS_FETCH', 'QUESTIONS_FETCH', 'MENUS_FETCH'].includes(intent.intent)) {
      return handleGeneralAndAcademicRequest(request, intent.intent, conversationId, entities);
    }

    // === AI and Auth Routing ===
    if (['GEMINI_CHAT', 'AI_COURSE_GENERATE', 'GAMMA_CONTENT_FETCH', 'FORGET_PASSWORD', 'RESET_PASSWORD'].includes(intent.intent)) {
      return handleAIAndAuthRequest(request, intent.intent, conversationId, entities);
    }

    if (shouldRouteToAction(intent.intent)) {
      const actionResponse = {
        answer: `I detected this might be a ${intent.intent} request. For actions and support requests, please contact a support representative or escalate this conversation.`,
        conversationId,
        intent: intent.intent,
        error: 'Action routing required',
        recoverable: true,
        suggestion: 'Would you like me to escalate this to a human agent?',
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', actionResponse.answer, intent.intent);
      return actionResponse;
    }

    // Direct fallback for unclear or support intents (no intent matched)
    if (intent.intent === 'unclear' || intent.intent === 'support') {
      try {
        // Limit conversation history to last 5 messages to avoid huge prompts
        const fallbackMessages = request.conversationHistory ?
          request.conversationHistory.slice(-5) : [];
        fallbackMessages.push({ role: 'user', content: request.query });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LLM_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [
              { role: 'system', content: 'You are a friendly assistant like ChatGPT. Answer questions naturally with appropriate emojis. Maintain conversation context. After your answer, provide 2-3 related follow-up questions or suggestions that the user might ask next, each on a new line, starting with "Suggestions:".' },
              ...fallbackMessages
            ],
            max_tokens: OPENROUTER_FALLBACK_MAX_TOKENS
          })
        });

        const data = await response.json();
        let fallbackAnswer = data.choices?.[0]?.message?.content?.trim() || 'I\'m sorry, I couldn\'t generate a response right now.';

        let querySuggestions: Array<{ text: string; description: string; intent: string }> = [];
        if (fallbackAnswer.includes('Suggestions:')) {
          const parts = fallbackAnswer.split('Suggestions:');
          fallbackAnswer = parts[0].trim();
          const suggestionsText = parts[1].trim();
          const suggestions = suggestionsText.split('\n').filter(s => s.trim()).map(s => s.trim());
          querySuggestions = suggestions.map(s => ({ text: s, description: s, intent: 'unclear' }));
        }

        // If no suggestions were generated, add some default relevant ones based on the query
        if (querySuggestions.length === 0) {
          const lowerQuery = request.query.toLowerCase();
          if (lowerQuery.includes('india') || lowerQuery.includes('father') || lowerQuery.includes('nation')) {
            querySuggestions = [
              { text: 'Tell me about Mahatma Gandhi\'s life', description: 'Learn more about his biography and achievements', intent: 'unclear' },
              { text: 'What was India\'s freedom struggle?', description: 'Explore the history of India\'s independence movement', intent: 'unclear' },
              { text: 'Who were other freedom fighters in India?', description: 'Discover key figures in India\'s independence', intent: 'unclear' }
            ];
          } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            querySuggestions = [
              { text: 'What can you help me with?', description: 'Learn about available features and capabilities', intent: 'unclear' },
              { text: 'How do I use this chatbot?', description: 'Get guidance on interacting with the system', intent: 'unclear' },
              { text: 'Show me examples of questions I can ask', description: 'See sample queries and use cases', intent: 'unclear' }
            ];
          } else {
            // Generic suggestions
            querySuggestions = [
              { text: 'Can you explain that in more detail?', description: 'Get deeper insights on the topic', intent: 'unclear' },
              { text: 'What are some related topics?', description: 'Explore connected subjects', intent: 'unclear' },
              { text: 'Give me examples', description: 'See practical examples or applications', intent: 'unclear' }
            ];
          }
        }

        const botMessage = await saveMessage(conversationId, 'bot', fallbackAnswer, intent.intent);
        if (!botMessage) {
          throw new Error('Failed to save bot message');
        }
        return {
          answer: fallbackAnswer,
          conversationId,
          id: botMessage.id,
          intent: intent.intent,
          querySuggestions: querySuggestions.map(s => s.text),
          canEscalate: true
        };
      } catch (fallbackError) {
        console.error('Direct fallback LLM failed:', fallbackError);
        return {
          answer: 'I\'m sorry, I\'m having trouble connecting to my chat service right now. Please try again later or contact support.',
          conversationId,
          intent: intent.intent,
          error: 'FALLBACK_FAILED',
          recoverable: true,
          canEscalate: true
        };
      }
    }

    const history = request.conversationHistory || [];
    let sql = '';
    let results: any[] = [];
    let answer = '';

    // Check for simple predefined queries to avoid AI generation
    const predefinedSQL = getPredefinedSQL(request.query, request.subInstituteId);
    const isPredefined = !!predefinedSQL;

    // Check if this should use direct API endpoint instead of SQL
    const lowerQuery = request.query.toLowerCase().trim();
    const apiEndpointConfig = apiEndpointQueries[lowerQuery];

    if (apiEndpointConfig) {
      // Route to appropriate handler based on API key
      if (apiEndpointConfig.apiKey === 'course_master') {
        return handleLMSRequest(request, 'LMS_COURSES_FETCH', conversationId, {});
      }
      if (apiEndpointConfig.apiKey === 'chapter_master') {
        return handleLMSRequest(request, 'LMS_MODULES_FETCH', conversationId, {});
      }
      if (apiEndpointConfig.apiKey === 'content_master') {
        return handleLMSRequest(request, 'LMS_CONTENT_FETCH', conversationId, {});
      }
      if (apiEndpointConfig.apiKey === 'question_chapter_master') {
        return handleLMSRequest(request, 'LMS_QUESTION_CHAPTERS_FETCH', conversationId, {});
      }
      if (apiEndpointConfig.apiKey === 'online_exam') {
        return handleLMSRequest(request, 'LMS_EXAMS_FETCH', conversationId, {});
      }
    }

    if (predefinedSQL) {
      sql = predefinedSQL;
    }

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const startTime = Date.now();

        if (!sql) {
          // Check if we should disable AI due to low credits
          if (DISABLE_AI_LOW_CREDITS) {
            return {
              answer: `I'm currently operating in low-credit mode and can only process predefined queries. Here are some queries I can help with:

• "show me all users" - View all users
• "show departments" - List departments
• "show job roles" - View job roles
• "show industries" - List industries
• "show standards" - View academic standards
• "show sections" - List academic sections
• "show subjects" - List academic subjects
• "show questions" - View question bank
• "show attendance records" - View your attendance
• "show leave types" - List leave categories

Please try one of these queries, or contact support to restore full AI functionality.`,
              conversationId,
              intent: intent.intent,
              error: 'AI_DISABLED_LOW_CREDITS',
              recoverable: true,
              suggestion: 'Try using one of the predefined queries above.',
              canEscalate: true,
              querySuggestions: getIntentQuerySuggestions(intent.intent)
            };
          }

          try {
            sql = await generateSQL(request.query, history, request.subInstituteId);
          } catch (aiError: any) {
            // If AI generation fails due to credits, provide helpful fallback
            if (aiError.message && aiError.message.includes('credits')) {
              return {
                answer: `I'm sorry, but I don't have enough AI credits to process complex queries right now. However, I can help with these common requests that don't require AI processing:

• "show me all users" - View all users
• "show departments" - List departments
• "show job roles" - View job roles
• "show industries" - List industries
• "show standards" - View academic standards
• "show sections" - List academic sections

Please try one of these queries, or contact support to upgrade your AI credits.`,
                conversationId,
                intent: intent.intent,
                error: 'INSUFFICIENT_AI_CREDITS',
                recoverable: true,
                suggestion: 'Try using one of the predefined queries above, or upgrade AI credits.',
                canEscalate: true,
                querySuggestions: getIntentQuerySuggestions(intent.intent)
              };
            }
            throw aiError;
          }
        }
        const genTime = Date.now() - startTime;

        if (!validateSQL(sql)) {
          throw new Error('SQL validation failed - contains dangerous keywords');
        }

        try {
          results = await executeSQLQuery(sql, request.query);
          const execTime = Date.now() - startTime;

          await logQuery(conversationId, 'data_retrieval', sql, execTime, true);
        } catch (sqlError) {
          console.error('SQL execution failed:', sqlError);
          // If predefined SQL fails, try to generate SQL with AI as fallback
          if (isPredefined) {
            console.log('Predefined SQL failed, trying AI generation as fallback');
            sql = await generateSQL(request.query, history, request.subInstituteId);
            results = await executeSQLQuery(sql, request.query);
            const execTime = Date.now() - startTime;
            await logQuery(conversationId, 'data_retrieval', sql, execTime, true);
          } else {
            throw sqlError;
          }
        }

        if (isPredefined && !sql.includes('generateSQL')) {
          // For predefined queries that didn't fall back to AI, create simple answer
          answer = `Found ${results.length} result(s).`;
        } else {
          try {
            answer = await generateInsights(request.query, sql, results);
          } catch (insightsError: any) {
            console.error('Insights generation failed:', insightsError);
            // Check if it's a credit issue
            if (insightsError.message && insightsError.message.includes('credits')) {
              answer = `Found ${results.length} result(s) matching your query. (Note: AI insights unavailable due to low credits)`;
            } else {
              // Fallback to simple answer if insights generation fails
              answer = `Found ${results.length} result(s) matching your query.`;
            }
          }
        }

        const tables = extractTablesFromSQL(sql);

        await saveMessage(
          conversationId,
          'bot',
          answer,
          intent.intent,
          sql,
          tables,
          false
        );

        if (debugModeEnabled) {
          const trace = formatDebugTrace(intent.intent, sql, genTime, results);
          console.log(trace);
        }

        return {
          answer,
          conversationId,
          intent: intent.intent,
          sql,
          tables_used: tables,
          insights: `Found ${results.length} result(s)`,
          data: results, // Include the actual data for ResponseRenderer
          query: request.query, // Include the original query for ResponseRenderer
          canEscalate: true
        };
      } catch (error) {
        console.error("🔥 RAW ERROR:", error);
        const errorCtx = parseError(error);
        const retryable = shouldRetry(errorCtx);

        if (!retryable || attempt >= maxAttempts) {
          throw error;
        }

        await logEvent({
          conversationId,
          logLevel: 'warning',
          logType: 'query_retry',
          message: `Retrying query (attempt ${attempt}/${maxAttempts}): ${errorCtx.message}`,
          metadata: { error: errorCtx }
        });
      }
    }

    throw new Error('Max retry attempts exceeded');
  } catch (error) {
    console.error("🔥 RAW ERROR:", error);
    const errorCtx = parseError(error);
    const errorMessage = formatErrorResponse(errorCtx, attempt);

    await logEvent({
      conversationId,
      logLevel: 'error',
      logType: 'request_failure',
      message: errorMessage,
      metadata: { error: errorCtx, intent: intent.intent }
    });

    await saveMessage(
      conversationId,
      'bot',
      errorMessage,
      intent.intent,
      undefined,
      undefined,
      true,
      errorCtx.message
    );
    if (!shouldUseFallback(intent.intent)) {
      const errorDetails = `Intent: ${intent.intent}, Confidence: ${intent.confidence}, Reasoning: ${intent.reasoning}`;
      const errorMessage = `I'm sorry, I couldn't process your request right now. Please try rephrasing your question or contact support if the issue persists.`;

      await saveMessage(
        conversationId,
        'bot',
        errorMessage,
        intent.intent,
        undefined,
        undefined,
        true,
        errorDetails
      );

      return {
        answer: errorMessage,
        conversationId,
        intent: intent.intent,
        error: 'UNKNOWN',
        recoverable: true,
        suggestion: 'Please try rephrasing your question in simpler terms.',
        canEscalate: true,
        querySuggestions: getIntentQuerySuggestions(intent.intent)
      };
    }
    if (shouldUseFallback(intent.intent)) {
      try {
        // Limit conversation history to last 5 messages to avoid huge prompts
        const fallbackMessages = request.conversationHistory ?
          request.conversationHistory.slice(-5) : [];
        fallbackMessages.push({ role: 'user', content: request.query });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LLM_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [
              { role: 'system', content: 'You are a friendly assistant like ChatGPT. Answer questions naturally with appropriate emojis. Maintain conversation context. After your answer, provide 2-3 related follow-up questions or suggestions that the user might ask next, each on a new line, starting with "Suggestions:".' },
              ...fallbackMessages
            ],
            max_tokens: OPENROUTER_FALLBACK_MAX_TOKENS
          })
        });

        const data = await response.json();
        let fallbackAnswer = data.choices?.[0]?.message?.content?.trim() || errorMessage;

        let querySuggestions: Array<{ text: string; description: string; intent: string }> = [];
        if (fallbackAnswer.includes('Suggestions:')) {
          const parts = fallbackAnswer.split('Suggestions:');
          fallbackAnswer = parts[0].trim();
          const suggestionsText = parts[1].trim();
          const suggestions = suggestionsText.split('\n').filter(s => s.trim()).map(s => s.trim());
          querySuggestions = suggestions.map(s => ({ text: s, description: s, intent: 'unclear' }));
        }

        // If no suggestions were generated, add some default relevant ones based on the query
        if (querySuggestions.length === 0) {
          const lowerQuery = request.query.toLowerCase();
          if (lowerQuery.includes('india') || lowerQuery.includes('father') || lowerQuery.includes('nation')) {
            querySuggestions = [
              { text: 'Tell me about Mahatma Gandhi\'s life', description: 'Learn more about his biography and achievements', intent: 'unclear' },
              { text: 'What was India\'s freedom struggle?', description: 'Explore the history of India\'s independence movement', intent: 'unclear' },
              { text: 'Who were other freedom fighters in India?', description: 'Discover key figures in India\'s independence', intent: 'unclear' }
            ];
          } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            querySuggestions = [
              { text: 'What can you help me with?', description: 'Learn about available features and capabilities', intent: 'unclear' },
              { text: 'How do I use this chatbot?', description: 'Get guidance on interacting with the system', intent: 'unclear' },
              { text: 'Show me examples of questions I can ask', description: 'See sample queries and use cases', intent: 'unclear' }
            ];
          } else {
            // Generic suggestions
            querySuggestions = [
              { text: 'Can you explain that in more detail?', description: 'Get deeper insights on the topic', intent: 'unclear' },
              { text: 'What are some related topics?', description: 'Explore connected subjects', intent: 'unclear' },
              { text: 'Give me examples', description: 'See practical examples or applications', intent: 'unclear' }
            ];
          }
        }

        const botMessage = await saveMessage(conversationId, 'bot', fallbackAnswer, intent.intent);
        if (!botMessage) {
          throw new Error('Failed to save bot message');
        }
        return {
          answer: fallbackAnswer,
          conversationId,
          id: botMessage.id,
          intent: intent.intent,
          canEscalate: true
        };
      } catch (fallbackError) {
        console.error('Fallback LLM failed:', fallbackError);
        return {
          answer: 'I\'m sorry, I\'m having trouble connecting to my chat service right now. Please try again later or contact support.',
          conversationId,
          intent: intent.intent,
          error: 'FALLBACK_FAILED',
          recoverable: true,
          canEscalate: true
        };
      }
    }

    return {
      answer: errorMessage,
      conversationId,
      intent: intent.intent,
      error: errorCtx.code,
      recoverable: errorCtx.recoverable,
      suggestion: errorMessage,
      canEscalate: true
    };
  }
}

async function ensureConversation(request: ChatRequest): Promise<string> {
  if (!supabaseEnabled) {
    // Return sessionId as fallback when Supabase is not enabled
    return request.sessionId;
  }

  const existingConv = await getConversationBySessionId(request.sessionId);

  if (existingConv) {
    return existingConv.id;
  }

  try {
    const newConv = await createConversation(
      request.sessionId,
      request.userId || uuidv4(),
      request.role || 'user'
    );

    if (!newConv?.id) {
      console.error('[getOrCreateConversation] Failed to create conversation, returning fallback sessionId');
      // Return a session ID based on the request sessionId so the flow can continue
      return request.sessionId;
    }

    return newConv.id;
  } catch (error) {
    console.error('[getOrCreateConversation] Error creating conversation:', error);
    // Return sessionId as fallback so the flow can continue
    return request.sessionId;
  }
}

const getIndustryFromSession = (): string => {
  if (typeof window === "undefined") return "";

  const userData = localStorage.getItem("userData");
  if (!userData) return "";

  try {
    const parsed = JSON.parse(userData);
    return parsed.industry || "";
  } catch {
    return "";
  }
};

// ================= JOB ROLE COMPETENCY HANDLER =================

/**
 * handleJobRoleCompetencyRequest
 * --------------------------------
 * Phase 2: Payload Validation
 * Phase 4: Genkit API Invocation
 * 
 * Handles JOB_ROLE_COMPETENCY intent by:
 * 1. Validating required payload fields
 * 2. Asking conversational follow-ups for missing fields
 * 3. Calling Genkit API when payload is complete
 * 4. Returning normalized response with follow-up suggestions
 */
async function handleJobRoleCompetencyRequest(
  request: ChatRequest,
  userContext: { userId: string; role: string | undefined },
  conversationId: string,
  intent: IntentClassificationResult,
  extractedEntities: { industry?: string; jobRole?: string; department?: string; }
): Promise<ChatResponse> {
  // Use formData if provided (from inline form submission)
  const formData = request.formData;

  // Merge extracted entities with formData (formData takes precedence)
  const payload: JobRoleCompetencyPayload = {
    industry: formData?.industry || extractedEntities.industry || getIndustryFromSession(),
    department: formData?.department || extractedEntities.department || '',
    jobRole: formData?.jobRole || extractedEntities.jobRole || '',
    description: formData?.description || '',
    subInstituteId: process.env.HP_SUB_INSTITUTE_ID
  };

  // Validate payload completeness
  const missingFields: string[] = [];
  if (!payload.industry) missingFields.push('Industry');
  if (!payload.department) missingFields.push('Department');
  if (!payload.jobRole) missingFields.push('Job Role');

  // Phase 2: If missing fields, ask conversational follow-ups
  if (missingFields.length > 0) {
    const conversationalPrompts: Record<string, string> = {
      'Industry': "I can generate a detailed competency map for this role. Just tell me the industry context (e.g., Healthcare, Technology, Finance).",
      'Department': "Which department does this role belong to? (e.g., Nursing, IT, Operations)",
      'Job Role': "What specific job role are you interested in? (e.g., Charge Nurse, Software Engineer)"
    };

    // Generate conversational follow-up based on first missing field
    const firstMissing = missingFields[0];
    const answer = conversationalPrompts[firstMissing] ||
      `Please provide the following information: ${missingFields.join(', ')}.`;

    await saveMessage(conversationId, 'bot', answer, 'JOB_ROLE_COMPETENCY');

    return {
      answer,
      conversationId,
      intent: 'JOB_ROLE_COMPETENCY',
      confidence: intent.confidence,
      entities: extractedEntities,
      action: 'SHOW_CWFKT_INPUT',
      missingFields,
      recoverable: true,
      suggestion: 'Please provide the missing details to generate the competency profile.',
    };
  }

  // Phase 4: Call Genkit API with validated payload
  try {
    const competencyData = await callGenkitCompetencyAPI(payload);

    // Generate human-readable response (for fallback/display)
    const answer = formatCompetencyResponse(competencyData, payload.jobRole);

    // Generate contextual follow-ups (Phase 6)
    const followUps = generateContextualFollowUps(payload.jobRole);

    await saveMessage(
      conversationId,
      'bot',
      answer,
      'JOB_ROLE_COMPETENCY'
    );

    return {
      answer,
      conversationId,
      intent: 'JOB_ROLE_COMPETENCY',
      confidence: intent.confidence,
      entities: {
        industry: payload.industry,
        jobRole: payload.jobRole,
        department: payload.department
      },
      action: 'SHOW_GENKIT_RESPONSE',
      suggestion: followUps.join(' OR '),
      canEscalate: true,
      // Include structured JSON data for UI rendering
      competencyData,
    };
  } catch (error) {
    const errorMessage = `Failed to generate competency profile: ${(error as Error).message}`;
    await saveMessage(
      conversationId,
      'bot',
      errorMessage,
      'JOB_ROLE_COMPETENCY',
      undefined,
      undefined,
      true,
      (error as Error).message
    );

    return {
      answer: errorMessage,
      conversationId,
      intent: 'JOB_ROLE_COMPETENCY',
      confidence: intent.confidence,
      error: 'GENKIT_API_FAILED',
      recoverable: false,
      suggestion: 'Would you like me to try again or escalate to a human agent?',
      canEscalate: true,
    };
  }
}

/**
 * handleCourseRecommendationRequest
 * Handles Course_Recommendation intent by calling the course recommendation flow
 * 
 * @param request - The chat request
 * @param userContext - User context with userId
 * @param conversationId - Conversation ID
 * @param intent - Intent classification result
 * @returns ChatResponse with course recommendations
 */
async function handleCourseRecommendationRequest(
  request: ChatRequest,
  userContext: { userId: string },
  conversationId: string,
  intent: IntentClassificationResult
): Promise<ChatResponse> {
    console.log('[handleCourseRecommendationRequest] Processing course recommendation request');

  try {
    console.log("Darshana");
    console.log(request);
    // Get user session data from request (passed from client via cookies)
    console.log(request.userId);
    const userId = request.userId || '54';
    const subInstituteId = request.subInstituteId || '3';
    
    console.log('[handleCourseRecommendationRequest] Calling flow with userId:', userId, 'subInstituteId:', subInstituteId);
    
    // Call the flow directly with userId and subInstituteId
    const recommendations = await courseRecommendationFlow({ userId, subInstituteId });
    
    // console.log('[handleCourseRecommendationRequest] Got recommendations:', recommendations.length);
    
    // // Format the response in bullet point format
    let answer = '';
    if (recommendations.length > 0) {
      answer = 'Courses:\n';
      recommendations.forEach((course: any, index: number) => {
        // Course name with bullet point
        answer += `• ${course.courseName}\n`;
        
        // Extract created by info and similar users info
        if (course.reasonForRecommendation) {
          // Extract created user name
          const createdByMatch = course.reasonForRecommendation.match(/Created by: ([^\n]+)/);
          if (createdByMatch) {
            answer += `Created by: ${createdByMatch[1]}\n`;
          }
          
          // Extract similar users name
          const similarMatch = course.reasonForRecommendation.match(/User with Similar Role: ([^\n]+)/);
          if (similarMatch) {
            answer += `Similar Users: ${similarMatch[1]}\n`;
          }
        }
        
        // Add blank line between courses (except for last one)
        if (index < recommendations.length - 1) {
          answer += `\n`;
        }
      });
    } else {
      answer = 'No course recommendations found at this time.';
    }
    // let answer = 'Function called successfully';
    // await saveMessage(conversationId, 'bot', answer, 'Course_Recommendation');
    // // const recommendations = await courseRecommendationFlow({ userId, subInstituteId });
    const formattedRecommendations = recommendations.map((course: any) => {
      const createdByMatch = course.reasonForRecommendation?.match(/Created by: ([^\n]+)/);
      const similarMatch = course.reasonForRecommendation?.match(/User with Similar Role: ([^\n]+)/);

      return {
        courseName: course.courseName,
        courseId: course.courseId,
        courseDescription: course.courseDescription,
        courseLink: course.courseLink,
        reasonForRecommendation: course.reasonForRecommendation,
        createdBy: createdByMatch?.[1]?.trim() || 'N/A',
        similarUsers: similarMatch?.[1]
          ? similarMatch[1]
              .split(',')
              .map((name: string) => name.trim())
              .filter(Boolean)
          : []
      };
    });

    return {
      answer: formattedRecommendations.length > 0
        ? 'Here are some recommended courses for you.'
        : answer,
      conversationId,
      intent: 'Course_Recommendation',
      confidence: intent.confidence,
      action: formattedRecommendations.length > 0 ? 'SHOW_COURSE_RECOMMENDATIONS' : undefined,
      courseRecommendations: formattedRecommendations,
    };
    
  } catch (error) {
    const errorMessage = `Failed to get course recommendations: ${(error as Error).message}`;
    console.error('[handleCourseRecommendationRequest] Error:', error);
    
    await saveMessage(
      conversationId,
      'bot',
      errorMessage,
      'Course_Recommendation',
      undefined,
      undefined,
      true,
      (error as Error).message
    );

    return {
      answer: errorMessage,
      conversationId,
      intent: 'Course_Recommendation',
      confidence: intent.confidence,
      error: 'COURSE_RECOMMENDATION_FAILED',
      recoverable: false,
      suggestion: 'Would you like me to try again or escalate to a human agent?',
      canEscalate: true,
    };
  }
}

/**
 * handleSkillGapAnalysisRequest
 * Handles SKILL_GAP_ANALYSIS intent by calling the skill gap analysis flow
 */
async function handleSkillGapAnalysisRequest(
  request: ChatRequest,
  userContext: { userId: string },
  conversationId: string,
  intent: IntentClassificationResult,
  entities: any
): Promise<ChatResponse> {
  console.log('[handleSkillGapAnalysisRequest] Processing skill gap analysis request');

  // Validate that this is actually a skill gap related query
  const lowerQuery = request.query.toLowerCase();
  const hasSkillGapKeywords = lowerQuery.includes('skill gap') ||
                             lowerQuery.includes('gap analysis') ||
                             lowerQuery.includes('competency gap');

  if (!hasSkillGapKeywords) {
    // Not a valid skill gap query, redirect to fallback
    return {
      answer: 'I\'m sorry, I didn\'t understand your request. Could you please rephrase it or provide more details?',
      conversationId,
      intent: 'unclear',
      error: 'INVALID_INTENT',
      recoverable: true,
      canEscalate: true
    };
  }

  try {
    let currentStep = 'industry';
    let industry = '';
    let department = '';
    let jobRole = '';

    const query = request.query.toLowerCase();
    
    // Check for explicit department selection patterns - these should trigger showing the department list
    // regardless of whether an entity is detected
    const departmentSelectPatterns = [
      'select department',
      'choose department',
      'select my department',
      'choose my department',
      'department as',
      'select the department',
      'i want to select department',
      'show me departments',
      'list departments',
      'department list',
      'pick department',
      'selecting department',
      'choosing department',
      'i want department',
      'need department',
      'what departments',
      'department options',
      'department selection'
    ];
    
    const isExplicitDepartmentRequest = departmentSelectPatterns.some(pattern => query.includes(pattern));
    
    // First check for entities - but only if it's NOT an explicit department selection request
    // If user explicitly asks to select department, show them the list even if they mention a department name
    if (!isExplicitDepartmentRequest) {
      if (entities?.industry) {
        industry = entities.industry;
        currentStep = 'department';
      } else if (entities?.department) {
        department = entities.department;
        currentStep = 'jobRole';
      } else if (entities?.jobRole) {
        jobRole = entities.jobRole;
        currentStep = 'tasks';
      }
    }
    
    // Only use keyword detection as fallback when no entities found
    // and when starting fresh (no previous selection)
    // Only show department list when user explicitly asks for department selection
    
    if (!industry && !department && !jobRole) {
      if (query.includes('industry') || query === 'start' || query.includes('skill gap')) {
        currentStep = 'industry';
      } else if (departmentSelectPatterns.some(pattern => query.includes(pattern))) {
        currentStep = 'department';
      } else if (query.includes('role') || query.includes('job')) {
        currentStep = 'jobRole';
      } else if (query.includes('task')) {
        currentStep = 'tasks';
      } else if (query.includes('skill')) {
        currentStep = 'skills';
      }
    }

    console.log('[handleSkillGapAnalysisRequest] Step:', currentStep);
    console.log('[handleSkillGapAnalysisRequest] Industry:', industry);
    console.log('[handleSkillGapAnalysisRequest] Department:', department);
    console.log('[handleSkillGapAnalysisRequest] Query:', request.query);
    console.log('[handleSkillGapAnalysisRequest] Entities:', entities);
    
    const flowResult = await skillGapAnalysisFlow({
      currentStep: currentStep as any,
      industry,
      department,
      jobRole
    });
    
    console.log('[handleSkillGapAnalysisRequest] Flow result:', flowResult);

    let answer = '';
    let stepLabel = '';
    let selectionOptions: Array<{ id?: number; name: string }> = [];

    switch (currentStep) {
      case 'industry':
        stepLabel = 'Select your industry';
        answer = 'Select your industry from the options below:';
        selectionOptions = flowResult.data || [];
        break;
      case 'department':
        stepLabel = `Select department in ${industry}`;
        answer = `Great! You selected **${industry}**. Now select your department:`;
        selectionOptions = flowResult.data || [];
        break;
      case 'jobRole':
        stepLabel = `Select job role in ${department}`;
        answer = `Perfect! You selected **${department}**. Now choose your job role:`;
        selectionOptions = flowResult.data || [];
        break;
      case 'tasks':
        stepLabel = `Tasks for ${jobRole}`;
        answer = `Excellent! Here are the key tasks for **${jobRole}**:`;
        selectionOptions = flowResult.data || [];
        break;
      case 'skills':
        stepLabel = `Skills for ${jobRole}`;
        answer = `Now let's assess your skills for **${jobRole}**. Rate your proficiency (1-5):`;
        selectionOptions = flowResult.data || [];
        break;
      default:
        answer = 'Skill Gap Analysis completed!';
    }

    return {
      answer,
      conversationId,
      intent: 'SKILL_GAP_ANALYSIS',
      confidence: intent.confidence,
      action: 'SHOW_SKILL_GAP_OPTIONS',
      selectionOptions,
      stepLabel,
      // FIX: Use currentStep (not flowResult.nextStep) to correctly represent the current step
      currentStep: currentStep,
      nextStep: flowResult.nextStep
    };

  } catch (error) {
    const errorMessage = `Failed to process skill gap analysis: ${(error as Error).message}`;
    console.error('[handleSkillGapAnalysisRequest] Error:', error);
    
    return {
      answer: errorMessage,
      conversationId,
      intent: 'SKILL_GAP_ANALYSIS',
      error: (error as Error).message,
      recoverable: true,
    };
  }
}

/**
 * callGenkitCompetencyAPI
 * -----------------------
 * Calls the Genkit Job Role Competency Flow API
 */
// async function callGenkitCompetencyAPI(payload: JobRoleCompetencyPayload): Promise<GenkitCompetencyResponse> {
//   const genkitEndpoint = process.env.GENKIT_API_URL || 'no key';

//   const startTime = Date.now();

//   try {
//     const response = await fetch('/api/genkit-job-role', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.GENKIT_API_KEY || ''}`
//       },
//       body: JSON.stringify({
//         industry: payload.industry,
//         department: payload.department,
//         jobRole: payload.jobRole,
//         description: payload.description || `Generate comprehensive competency framework for ${payload.jobRole} in ${payload.department} department of ${payload.industry} industry.`,
//         subInstituteId: payload.subInstituteId
//       })
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Genkit API failed: ${response.status} - ${errorText}`);
//     }

//     const data = await response.json();
//     const responseTime = Date.now() - startTime;

//     console.log(`Genkit API call completed in ${responseTime}ms`);

//     return data;
//   } catch (error) {
//     console.error('Genkit API call failed:', error);
//     throw error;
//   }
// }

// added by darshana on 03-02-26
async function callGenkitCompetencyAPI(payload: JobRoleCompetencyPayload): Promise<GenkitCompetencyResponse> {
  const startTime = Date.now();

  try {
    // Determine base URL for server-side or client-side
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hp.triz.co.in';
    const apiUrl = `/api/genkit-job-role`;
    
    // Use absolute URL for server-side, relative for client-side
    const url = apiUrl.startsWith('http') ? apiUrl : `${baseUrl}${apiUrl}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        industry: payload.industry,
        department: payload.department,
        jobRole: payload.jobRole,
        description: payload.description || `Generate comprehensive competency framework for ${payload.jobRole} in ${payload.department} department of ${payload.industry} industry.`,
        subInstituteId: payload.subInstituteId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    console.log(`Genkit API call completed in ${responseTime}ms`);

    return data;
  } catch (error: any) {
    console.error('Genkit API call failed:', error);
    throw new Error(error.message || 'Something went wrong');
  }
}

/**
 * formatCompetencyResponse
 * ------------------------
 * Converts Genkit output into human-readable format
 */
function formatCompetencyResponse(data: GenkitCompetencyResponse, jobRole: string): string {
  let response = `## Competency Framework for ${jobRole}\n\n`;

  // Critical Work Functions and Key Tasks
  if (data.cwf_items && data.cwf_items.length > 0) {
    response += `### 🔑 Critical Work Functions & Key Tasks\n\n`;
    data.cwf_items.forEach(cwfkt => {
      response += `**${cwfkt.critical_work_function}**\n`;
      cwfkt.key_tasks.forEach(task => {
        response += `- ${task}\n`;
      });
      response += '\n';
    });
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    response += `### 💡 Skills (Proficiency Levels 1-6)\n\n`;
    data.skills.forEach(skill => {
      response += `- **${skill.title}** (${skill.category} → ${skill.sub_category})\n`;
      response += `  Level ${skill.level}: ${skill.description || 'N/A'}\n\n`;
    });
  }

  // Knowledge
  if (data.knowledge && data.knowledge.length > 0) {
    response += `### 📚 Knowledge\n\n`;
    data.knowledge.forEach(k => {
      response += `- **${k.title}** (${k.category} → ${k.sub_category}) - Level ${k.level}\n`;
    });
    response += '\n';
  }

  // Abilities
  if (data.ability && data.ability.length > 0) {
    response += `### 🏋️ Abilities\n\n`;
    data.ability.forEach(a => {
      response += `- **${a.title}** (${a.category} → ${a.sub_category}) - Level ${a.level}\n`;
    });
    response += '\n';
  }

  // Attitudes
  if (data.attitude && data.attitude.length > 0) {
    response += `### 🎯 Attitudes\n\n`;
    data.attitude.forEach(at => {
      response += `- **${at.title}** (${at.category} → ${at.sub_category}) - Level ${at.level}\n`;
    });
    response += '\n';
  }

  // Behaviors
  if (data.behavior && data.behavior.length > 0) {
    response += `### 🤝 Behaviors\n\n`;
    data.behavior.forEach(b => {
      response += `- **${b.title}** (${b.category} → ${b.sub_category}) - Level ${b.level}\n`;
    });
  }

  return response;
}

/**
 * generateContextualFollowUps
 * ---------------------------
 * Phase 6: Contextual Follow-ups
 * Generates intelligent follow-up questions based on the job role
 */
function generateContextualFollowUps(jobRole: string): string[] {
  const baseFollowUps = [
    `Compare ${jobRole} with similar roles`,
    `What skills are most critical for ${jobRole}?`,
    `Show proficiency levels for ${jobRole}`
  ];

  // Role-specific follow-ups
  const seniorPattern = /senior|lead|manager|head/i;
  if (!seniorPattern.test(jobRole)) {
    baseFollowUps.push(`What about a senior version of ${jobRole}?`);
  }

  const juniorPattern = /junior|associate|assistant/i;
  if (!juniorPattern.test(jobRole)) {
    baseFollowUps.push(`Compare with entry-level ${jobRole}`);
  }

  return baseFollowUps;
}

async function handleCreateJobDescriptionAction(
  request: ChatRequest,
  userContext: { userId: string; role: string | undefined },
  conversationId: string
): Promise<ChatResponse> {
  // Basic extraction from the query. 
  //This could be replaced with a more sophisticated NLP entity extraction model.
  const rawQuery = request.query;
  const query = rawQuery.toLowerCase();
  const industryMatch = rawQuery.match(/industry\s*[:\-]?\s*([a-zA-Z ]+)/i)?.[1]?.trim();
  const jobRoleMatch = rawQuery.match(/jobrole\s*[:\-]?\s*([a-zA-Z ]+)/i)?.[1]?.trim();
  const departmentMatch = rawQuery.match(/department\s*[:\-]?\s*([a-zA-Z ]+)/i)?.[1]?.trim();
  const descriptionMatch = rawQuery.match(/description\s*[:\-]?\s*(.+)$/i)?.[1]?.trim();

  const industry = industryMatch ?? null;
  const jobRole = jobRoleMatch ?? null;
  const department = departmentMatch ?? null;
  const description = descriptionMatch ?? null;

  // if (!industry || !jobRole || !department || !description) {
  //   throw new Error('Unreachable: validation failed');
  // }
  const missingFields: string[] = [];
  if (!industry) missingFields.push('Industry');
  if (!jobRole) missingFields.push('Jobrole');
  if (!department) missingFields.push('Department');
  if (!description) missingFields.push('Description');

  if (missingFields.length > 0) {
    const answer = `Please provide the following missing information: ${missingFields.join(', ')}.`;
    await saveMessage(conversationId, 'bot', answer, 'CREATE_JOB_DESCRIPTION');
    return {
      answer,
      conversationId,
      intent: 'CREATE_JOB_DESCRIPTION',
      recoverable: true,
      suggestion: 'Please provide the missing details to proceed.',
    };
  }
  const safeIndustry = industry!;
  const safeJobRole = jobRole!;
  const safeDepartment = department!;
  const safeDescription = description!;
  try {
    const jdResponse = await handleCreateJobDescription({
      industry: safeIndustry,
      jobRole: safeJobRole,
      department: safeDepartment,
      description: safeDescription,
      userContext,
      conversationId,
    });

    const answer = `Job Role Attributes generated:\n\n**Critical Work Functions and Key Tasks:**\n${jdResponse.data.CWFKT.map(c => `**${c.critical_work_function}**\n${c.key_tasks.map(t => `- ${t}`).join('\n')}`).join('\n\n')}\n\n**Skills:**\n${jdResponse.data.skills.map(s => `- ${s.title} (${s.category}, ${s.sub_category}, Level ${s.proficiency_level}): ${s.description}`).join('\n')}\n\n**Knowledge:**\n${jdResponse.data.knowledge.map(k => `- ${k.title} (${k.category}, ${k.sub_category}, Level ${k.level})`).join('\n')}\n\n**Abilities:**\n${jdResponse.data.ability.map(a => `- ${a.title} (${a.category}, ${a.sub_category}, Level ${a.level})`).join('\n')}\n\n**Attitudes:**\n${jdResponse.data.attitude.map(at => `- ${at.title} (${at.category}, ${at.sub_category}, Level ${at.level})`).join('\n')}\n\n**Behaviors:**\n${jdResponse.data.behavior.map(b => `- ${b.title} (${b.category}, ${b.sub_category}, Level ${b.level})`).join('\n')}`;

    await saveMessage(conversationId, 'bot', answer, 'CREATE_JOB_DESCRIPTION');

    return {
      answer,
      conversationId,
      intent: 'CREATE_JOB_DESCRIPTION',
      canEscalate: true,
    };
  } catch (error) {
    const errorMessage = `Failed to create job description: ${(error as Error).message}`;
    await saveMessage(conversationId, 'bot', errorMessage, 'CREATE_JOB_DESCRIPTION', undefined, undefined, true, (error as Error).message);
    return {
      answer: errorMessage,
      conversationId,
      intent: 'CREATE_JOB_DESCRIPTION',
      error: 'JD_CREATION_FAILED',
      recoverable: false,
      canEscalate: true,
    };
  }
}
const JDprompt = (
  Department: string,
  JobRole: string,
  Description: string
): string => {
  const Industry = getIndustryFromSession();

  return `
You are a domain expert in job architecture, workforce design, and competency modeling.

Given the following job context:
- Industry: ${Industry}
- Department: ${Department}
- Job Role: ${JobRole}
- Description: ${Description}

Generate a JSON object that conforms strictly to this TypeScript structure:

interface JobRoleOutput {
  CWFKT: {
    critical_work_function: string;
    key_tasks: string[];
  }[];
  skills: {
    title: string;
    description: string;
    category: SkillCategory;
    sub_category: SkillSubCategory;
    proficiency_level: ProficiencyLevel;
  }[];
  knowledge: {
    title: string;
    category: KnowledgeCategory;
    sub_category: KnowledgeSubCategory;
    level: KnowledgeLevel;
  }[];
  ability: {
    title: string;
    category: AbilityCategory;
    sub_category: AbilitySubCategory;
    level: AbilityLevel;
  }[];
  attitude: {
    title: string;
    category: AttitudeCategory;
    sub_category: AttitudeSubCategory;
    level: AttitudeLevel;
  }[];
  behavior: {
    title: string;
    category: BehaviorCategory;
    sub_category: BehaviorSubCategory;
    level: BehaviorLevel;
  }[];
}

-------------------------------------

✅ SKILLS VALIDATION

SkillCategory must be one of:
- Cognitive & Thinking Skills
- Compliance & Regulatory Skills
- Critical Core Skills
- Digital & Data Skills
- Functional Skills
- Leadership & Management Skills
- Soft Skills
- Technical Skills

SkillSubCategory must be one of:
- Analytical reasoning
- Critical thinking
- Problem-solving
- Industry Compliance Knowledge
- Legal
- Safety
- Interacting with Others
- Thinking Critically
- Data Analytics
- Digital Literacy
- Job Role-Specific
- Decision-Making
- Strategic Thinking
- Team Management
- Communication skills
- Interpersonal
- Leadership
- Domain-Specific
- Industry-specific

proficiency_level must be an integer from 1 to 6

-------------------------------------


✅ KNOWLEDGE VALIDATION

KnowledgeCategory must be one of:
- Conceptual Knowledge
- Metacognitive Knowledge
- Procedural Knowledge
- Factual Knowledge

KnowledgeSubCategory must be one of:
- Knowledge of classifications and categories
- Knowledge of principles and generalizations
- Knowledge of theories, models, and structures
- Knowledge about cognitive tasks, including appropriate contextual and conditional knowledge
- Self-knowledge
- Strategic knowledge
- Knowledge of criteria for determining when to use appropriate procedures
- Knowledge of subject-specific skills and algorithms
- Knowledge of subject-specific techniques and methods
- Knowledge of specific details and elements
- Knowledge of terminology

level must be an integer from 1 to 5

-------------------------------------
✅ ABILITY VALIDATION

AbilityCategory must be one of:
- Cognitive Abilities
- Psychomotor Abilities
- Physical Abilities
- Sensory Abilities
- Social/Interpersonal Abilities

AbilitySubCategory must be one of:
- Visualization
- Verbal comprehension
- Mathematical reasoning
- Deductive reasoning
- Memory (short-term, long-term)
- Information ordering
- Inductive reasoning
- Response orientation
- Multilimb coordination
- Precision control
- Reaction time
- Coordination and dexterity
- Flexibility and stamina
- Manual and finger dexterity
- Strength (static, explosive, dynamic)
- Hearing sensitivity
- Speech clarity
- Team coordination
- Persuasion

level must be an integer from 1 to 5

-------------------------------------
✅ ATTITUDE VALIDATION

AttitudeCategory must be one of:
- Adaptability/Flexibility
- Accountability/Responsibility
- Openness to Feedback
- Commitment to Quality/Quality Focus
- Integrity/Honesty/Ethics
- Growth Mindset/Growth Orientation
- Initiative/Proactiveness/Proactivity

AttitudeSubCategory must be one of:
- Flexibility
- Change Readiness
- Answerability
- Ownership
- Transparency
- Coachability
- Precision
- Diligence
- Excellence
- Integrity
- Psychological Safety
- Learning Hunger
- Curiosity
- Initiative

level must be an integer from 1 to 5

-------------------------------------
✅ BEHAVIOR VALIDATION

BehaviorCategory must be one of:
- Stakeholder Focus
- Commitment to Quality/Quality Focus
- Communication
- Safety-Consciousness/Process Adherence
- Cognitive Agility
- Accountability in Execution
- Problem-Solving in Action
- Collaboration/Teamwork
- Efficiency Drive
- Risk Vigilance
- Digital Fluency

BehaviorSubCategory must be one of:
- Customer Empathy
- Precision
- Active Listening
- Clarity
- Diplomacy
- Compliance
- Following Procedures
- Standardization
- Cognitive Agility
- Task Accountability
- Error Prevention
- Critical Analysis
- Decisiveness
- Cross-Functional Synergy
- Teamwork
- Resource Optimization
- Safety Focus
- Technology Adoption & Integration

level must be an integer from 1 to 5

-------------------------------------
🔒 OUTPUT RULES

- All fields must be filled with role-relevant, realistic content.
- Only use values from the taxonomies above.
- Return ONLY a properly structured JSON object with no comments, no text, no explanation.
- Do not include placeholders or speculative fields.
- Ensure full compliance with the described structure.
`;
};

export async function handleCreateJobDescription({ industry,
  department,
  jobRole,
  description,
  userContext,
  conversationId
}: {
  industry: string;
  department: string;
  jobRole: string;
  description: string;
  userContext: any;
  conversationId: string;
}): Promise<ActionResponse> {
  // Save user message for auditability
  const query = `Generate job role attributes for ${jobRole} in ${department} of ${industry} with the following description: ${description}`;
  await saveMessage(conversationId, 'user', query, 'job_role_attributes_generation');

  // Permission check (mandatory)
  if (!canAccessData(userContext, 'TALENT_DEVELOPMENT')) {
    throw new Error('Access denied for JD creation');
  }

  // Build JD prompt
  const prompt = JDprompt(department, jobRole, description);

  const startTime = Date.now();

  try {
    // Call the LLM
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a domain expert in job architecture, workforce design, and competency modeling. Generate structured job role attributes in JSON format only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: OPENROUTER_STRUCTURED_MAX_TOKENS
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate job description');
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    // Log the LLM call if debug mode is enabled
    if (debugModeEnabled) {
      await logLLMCall(conversationId, 'deepseek/deepseek-chat', responseTime, true);
    }

    // Parse the LLM response as JSON
    const rawContent = data.choices[0].message.content.trim();
    const cleanedContent = rawContent.replace(/```json\n?|\n?```/g, '').trim();
    const jdOutput: JobRoleOutput = JSON.parse(cleanedContent);

    // Validate the structure (basic check)
    if (!jdOutput.CWFKT || !Array.isArray(jdOutput.skills) || !Array.isArray(jdOutput.knowledge) || !Array.isArray(jdOutput.ability) || !Array.isArray(jdOutput.attitude) || !Array.isArray(jdOutput.behavior)) {
      throw new Error('Invalid job role attributes structure returned by LLM');
    }

    // Save the job role attributes result for auditability and conversation history
    await saveMessage(conversationId, 'bot', rawContent, 'job_role_attributes_generation');

    // Log for analytics: who is generating job role attributes, which roles are common
    await logEvent({
      conversationId,
      logLevel: 'info',
      logType: 'JOB_ROLE_ATTRIBUTES_CREATED_FROM_CHAT',
      message: 'Job role attributes created from chat',
      metadata: { userId: userContext?.userId, conversationId }
    });

    // Return tagged response for Talent Development module
    return {
      type: 'ACTION_RESPONSE',
      module: 'TALENT_DEVELOPMENT',
      action: 'CREATE_JOB_DESCRIPTION',
      data: jdOutput
    };
  } catch (error) {
    console.error('Error in handleCreateJobDescription:', error);
    // Log the error
    await logEvent({
      conversationId,
      logLevel: 'error',
      logType: 'jd_generation_failure',
      message: `Failed to generate job description: ${(error as Error).message}`,
      metadata: { query, userContext }
    });
    throw error;  // Re-throw for upstream handling
  }
}


export async function handleEscalation(
  conversationId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; escalationId?: string; message: string }> {
  try {
    const escalation = await createEscalation(conversationId, userId, reason);

    if (!escalation) {
      return {
        success: false,
        message: 'Failed to create escalation. Please try again.'
      };
    }

    await updateConversationStatus(conversationId, 'escalated');

    return {
      success: true,
      escalationId: escalation.id,
      message: 'Your request has been escalated. A support team member will contact you shortly.'
    };
  } catch (err) {
    console.error('Escalation error:', err);
    return {
      success: false,
      message: 'An error occurred during escalation. Please try again.'
    };
  }
}

// ================= CONTEXTUAL SUGGESTIONS HANDLER =================

/**
 * handleContextualSuggestions
 * ----------------------------
 * Generates contextual suggestions for the chatbot based on the current LMS module.
 * Uses Genkit flow server to dynamically generate relevant questions.
 */
export async function handleContextualSuggestions(
  request: SuggestionRequest
): Promise<{ suggestions: string[]; module: string; error?: string }> {
  const { module, context } = request;

  try {
    // Call Genkit flow server to generate suggestions
    const genkitUrl = process.env.GENKIT_SERVER_URL || 'http://localhost:3400';
    
    const response = await fetch(`${genkitUrl}/flow/suggestionFlow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        module,
        context: context || ''
      })
    });

    if (!response.ok) {
      console.warn('Genkit flow not available, using fallback suggestions');
      return getFallbackSuggestions(module);
    }

    const data = await response.json();
    
    if (data.result?.suggestions && Array.isArray(data.result.suggestions)) {
      return {
        suggestions: data.result.suggestions.slice(0, 4),
        module
      };
    }

    // If response format is unexpected, use fallback
    return getFallbackSuggestions(module);

  } catch (error) {
    console.error('Error generating contextual suggestions via Genkit:', error);
    // Fall back to default suggestions if Genkit fails
    return getFallbackSuggestions(module);
  }
}

// Fallback suggestions when Genkit is not available
function getFallbackSuggestions(module: string): { suggestions: string[]; module: string } {
  const fallbackSuggestions: Record<string, string[]> = {
    'course': [
      "How do I create a new course?",
      "What are the best practices for course design?",
      "How can I track employee progress?",
      "How do I add assessments to a course?"
    ],
    'assessment': [
      "How do I create an assessment?",
      "What question types are available?",
      "How do I set assessment deadlines?",
      "How can I view assessment results?"
    ],
    'learning': [
      "How do I enroll in a course?",
      "What courses are available for me?",
      "How do I track my learning progress?",
      "How do I complete a course?"
    ],
    'question-bank': [
      "How do I add questions to the bank?",
      "How do I organize questions by category?",
      "Can I import questions from other sources?",
      "How do I edit existing questions?"
    ]
  };

  return {
    suggestions: fallbackSuggestions[module] || [],
    module
  };
}
