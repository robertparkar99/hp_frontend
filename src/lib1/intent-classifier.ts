// ================= TYPES =================

export type QueryIntent =
  | 'data_retrieval'
  | 'action'
  | 'support'
  | 'CREATE_JOB_DESCRIPTION'
  | 'JOB_ROLE_COMPETENCY'
  | 'Course_Recommendation'
  | 'SKILL_GAP_ANALYSIS'
  // HRMS intents
  | 'HRMS_USERS_FETCH'
  | 'HRMS_PROFILE_FETCH'
  | 'HRMS_DEPARTMENTS_FETCH'
  | 'HRMS_ATTENDANCE_FETCH'
  | 'HRMS_ATTENDANCE_UPDATE'
  | 'HRMS_ATTENDANCE_PUNCH_OUT'
  | 'HRMS_LEAVE_TYPES_FETCH'
  | 'HRMS_LEAVE_TYPE_CREATE'
  | 'HRMS_LEAVE_APPLY'
  | 'HRMS_LEAVE_SUMMARY_FETCH'
  | 'HRMS_LEAVE_AUTHORIZE'
  | 'HRMS_HOLIDAYS_FETCH'
  | 'HRMS_HOLIDAY_CREATE'
  | 'HRMS_SALARY_STRUCTURE_FETCH'
  | 'HRMS_PAYROLL_DEDUCTIONS_FETCH'
  | 'HRMS_PAYROLL_MONTHLY_FETCH'
  | 'HRMS_PAYROLL_GENERATE'
  // LMS intents
  | 'LMS_COURSES_FETCH'
  | 'LMS_MODULES_FETCH'
  | 'LMS_CONTENT_FETCH'
  | 'LMS_CONTENT_CREATE'
  | 'LMS_QUESTION_CHAPTERS_FETCH'
  | 'LMS_QUESTION_ADD'
  | 'LMS_QUESTION_PAPERS_SEARCH'
  | 'LMS_QUESTION_PAPER_STORE'
  | 'LMS_EXAMS_FETCH'
  | 'LMS_EXAM_SUBMIT'
  // Skills and Job Roles intents
  | 'SKILLS_FETCH'
  | 'SKILL_CREATE'
  | 'SKILL_CATEGORIES_FETCH'
  | 'SKILL_KNOWLEDGE_ABILITIES_FETCH'
  | 'SKILL_PROFICIENCY_LEVELS_FETCH'
  | 'SKILL_ATTRIBUTES_ADD'
  | 'JOB_ROLES_FETCH'
  | 'JOB_ROLE_CREATE'
  | 'JOB_ROLE_UPDATE'
  | 'JOB_ROLE_DELETE'
  | 'JOB_ROLE_SKILLS_FETCH'
  | 'JOB_ROLE_SKILL_CREATE'
  | 'JOB_ROLE_TASKS_FETCH'
  | 'JOB_ROLE_TASK_CREATE'
  // Organization and Industries intents
  | 'USER_JOB_ROLES_FETCH'
  | 'INDUSTRIES_FETCH'
  | 'DEPARTMENT_MASTER_FETCH'
  | 'NEO_INDUSTRIES_FETCH'
  | 'DEPARTMENTS_FOR_INDUSTRY_FETCH'
  | 'JOB_ROLES_FOR_DEPARTMENT_FETCH'
  | 'SKILLS_FOR_JOB_ROLE_FETCH'
  // Reports and Misc intents
  | 'TASK_ANALYSIS_REPORT_FETCH'
  | 'EMPLOYEE_REPORT_FETCH'
  | 'ORGANIZATION_DASHBOARD_FETCH'
  | 'DASHBOARD_FETCH'
  | 'COMPLIANCE_LIST_FETCH'
  | 'COMPLIANCE_CREATE'
  | 'COMPLIANCE_UPDATE'
  | 'COMPLIANCE_DELETE'
  | 'JOB_POSTINGS_FETCH'
  | 'JOB_POSTING_CREATE'
  | 'JOB_POSTING_UPDATE'
  // General/Academic intents
  | 'STANDARDS_FETCH'
  | 'SECTIONS_FETCH'
  | 'SUBJECTS_FETCH'
  | 'QUESTIONS_FETCH'
  | 'MENUS_FETCH'
  // AI and Auth intents
  | 'GEMINI_CHAT'
  | 'AI_COURSE_GENERATE'
  | 'GAMMA_CONTENT_FETCH'
  | 'FORGET_PASSWORD'
  | 'RESET_PASSWORD'
  | 'unclear';

  export interface ExtractedEntities {
  industry?: string;
  jobRole?: string;
  department?: string;
  description?: string;
  month?: string;
  year?: string;
}

interface IntentClassificationResult {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
  entities?: ExtractedEntities;
}

// ================= INTENT PATTERNS =================
// ⚠️ Order matters: specific intents FIRST

const intentPatterns: Record<QueryIntent, string[]> = {
  CREATE_JOB_DESCRIPTION: [
    'create jd',
    'create job description',
    'generate jd',
    'job description',
    'role description',
    'jd for',
    'jd of'
  ],

  JOB_ROLE_COMPETENCY: [
    // Primary triggers - competency framework
    'generate competency profile',
    'competency profile for',
    'job role responsibilities',
    'skills for',
    'competency framework',
    'CWFKT',
    'critical work function',
    'key tasks',
    // Role exploration patterns
    'what does a',
    'what are the responsibilities of',
    'role requirements',
    // Proficiency and skills
    'proficiency level',
    'skill proficiency',
    'competency levels',
    // Skills mapping
    'skills required for',
    'required skills for',
    // Follow-up patterns
    'senior version of',
    'compare this with',
    'similar roles',
    'advanced role'
  ],

  Course_Recommendation: [
    'recommend course',
    'course recommendation',
    'suggest course',
    'suggest me a course',
    'suggest a course',
    'recommend me a course',
    'recommend a course',
    'course suggestion',
    'course suggest',  // Added: "course suggest" pattern
    'recommended course',
    'recommended courses',
    'best course',
    'best courses',
    'which course',
    'what course',
    'what courses',
    'course for me',
    'courses for me',
    'recommend learning path',
    'learning path recommendation',
    'suggest learning path',
    'learning path suggestion',
    'learning path for me'
  ],

  SKILL_GAP_ANALYSIS: [
    // Skill gap analysis patterns - ordered by specificity
    // MUST contain "skill gap" or "gap analysis" to trigger this intent
    'skill gap analysis',
    'skill gap for',
    'skill gap report',
    'my skill gap',
    'employee skill gap',
    'team skill gap',
    // These require explicit skill gap context
    'skill gap',
    'gap analysis',
    'competency gap'
  ],

  data_retrieval: [
    'how many', 'show me', 'list', 'get', 'count', 'report',
    'analytics', 'statistics', 'summary', 'find', 'search', 'retrieve',
    'display', 'view', 'check', 'fetch', 'what', 'available',
    'show me all', 'list all', 'get my profile', 'show departments',
    'show attendance', 'show leave types', 'show leave summary',
    'show holidays', 'show salary structures', 'show payroll',
    'show question chapters', 'search question papers',
    'show department master', 'get neo4j industries', 'show departments for',
    'show job roles for', 'show skills for', 'show task analysis',
    'show employee report', 'show organization dashboard', 'show dashboard',
    'show compliance list', 'show job postings', 'show standards',
    'show sections', 'show subjects', 'show questions', 'show menus',
    'get gamma content'
  ],

  action: [
    'reset', 'update', 'delete', 'remove', 'change', 'modify', 'create',
    'add', 'execute', 'run', 'perform', 'set', 'assign', 'revoke',
    'update my attendance', 'punch out', 'add a new leave type', 'apply for leave',
    'authorize leave', 'add a holiday', 'generate monthly payroll',
    'create new content', 'add a question', 'store a question paper',
    'submit online exam', 'create a new skill', 'add skill attributes',
    'create a job role', 'update job role', 'delete job role',
    'create job role skill', 'create job role task', 'create compliance',
    'update compliance', 'delete compliance', 'create job posting',
    'update job posting', 'chat with gemini', 'generate ai course',
    'forget password', 'reset password'
  ],

  support: [
    'help', 'issue', 'problem', 'bug', 'error', 'broken', 'not working',
    'crash', 'stuck', 'feedback', 'complaint', 'support', 'escalate',
    'urgent', 'critical', 'need assistance'
  ],

   // HRMS intents
   HRMS_USERS_FETCH: [
     'show me all users', 'list all users', 'get all users', 'fetch users',
     'show users', 'list users', 'get users', 'fetch user list'
   ],
   HRMS_PROFILE_FETCH: [
     'get my profile', 'show my profile', 'fetch my profile', 'my profile details',
     'profile information', 'user profile'
   ],
   HRMS_DEPARTMENTS_FETCH: [
     'show departments', 'list departments', 'get departments', 'fetch departments',
     'department list', 'all departments'
   ],
    HRMS_ATTENDANCE_FETCH: [
      'show attendance records', 'get attendance', 'fetch attendance', 'attendance records',
      'my attendance', 'attendance history', 'show attendance for', 'attendance for month',
      'monthly attendance', 'attendance in', 'current month attendance'
    ],
   HRMS_ATTENDANCE_UPDATE: [
     'update my attendance', 'mark attendance', 'punch in', 'clock in',
     'attendance update', 'update attendance for today'
   ],
   HRMS_ATTENDANCE_PUNCH_OUT: [
     'punch out', 'clock out', 'punch out for the day', 'end attendance'
   ],
   HRMS_LEAVE_TYPES_FETCH: [
     'show leave types', 'list leave types', 'get leave types', 'leave types available',
     'types of leave', 'leave categories'
   ],
   HRMS_LEAVE_TYPE_CREATE: [
     'add a new leave type', 'create leave type', 'new leave type', 'add leave type'
   ],
   HRMS_LEAVE_APPLY: [
     'apply for leave', 'request leave', 'submit leave application', 'leave application'
   ],
   HRMS_LEAVE_SUMMARY_FETCH: [
     'show leave summary', 'leave summary report', 'my leave balance', 'leave status'
   ],
   HRMS_LEAVE_AUTHORIZE: [
     'authorize leave', 'approve leave', 'leave authorization', 'authorize leave for'
   ],
   HRMS_HOLIDAYS_FETCH: [
     'show holidays', 'list holidays', 'get holidays', 'holiday list', 'upcoming holidays'
   ],
   HRMS_HOLIDAY_CREATE: [
     'add a holiday', 'create holiday', 'new holiday', 'add holiday'
   ],
   HRMS_SALARY_STRUCTURE_FETCH: [
     'show salary structures', 'salary structure', 'salary details', 'pay structure'
   ],
   HRMS_PAYROLL_DEDUCTIONS_FETCH: [
     'show payroll deductions', 'payroll deductions', 'deductions list'
   ],
   HRMS_PAYROLL_MONTHLY_FETCH: [
     'show monthly payroll', 'monthly payroll report', 'payroll report'
   ],
   HRMS_PAYROLL_GENERATE: [
     'generate monthly payroll', 'create payroll', 'run payroll'
   ],

   // LMS intents
   LMS_COURSES_FETCH: [
     'show all courses', 'list courses', 'get courses', 'fetch courses',
     'available courses', 'course list'
   ],
   LMS_MODULES_FETCH: [
     'list modules for', 'show modules', 'get modules', 'modules for course',
     'course modules'
   ],
   LMS_CONTENT_FETCH: [
     'show content for', 'get content', 'fetch content', 'content for module'
   ],
   LMS_CONTENT_CREATE: [
     'create new content', 'add content', 'new content', 'add new content'
   ],
   LMS_QUESTION_CHAPTERS_FETCH: [
     'show question chapters', 'question chapters', 'chapters for questions'
   ],
   LMS_QUESTION_ADD: [
     'add a question', 'create question', 'new question', 'add question'
   ],
   LMS_QUESTION_PAPERS_SEARCH: [
     'search question papers', 'find question papers', 'question paper search'
   ],
   LMS_QUESTION_PAPER_STORE: [
     'store a question paper', 'save question paper', 'create question paper'
   ],
   LMS_EXAMS_FETCH: [
     'show online exams', 'list exams', 'get exams', 'available exams', 'online exams'
   ],
   LMS_EXAM_SUBMIT: [
     'submit online exam', 'submit exam', 'complete exam'
   ],

   // Skills and Job Roles intents
   SKILLS_FETCH: [
     'show all skills', 'list skills', 'get skills', 'fetch skills', 'skill list'
   ],
   SKILL_CREATE: [
     'create a new skill', 'add skill', 'new skill', 'add new skill'
   ],
   SKILL_CATEGORIES_FETCH: [
     'show skill categories', 'skill categories', 'skill category list'
   ],
   SKILL_KNOWLEDGE_ABILITIES_FETCH: [
     'show skill knowledge abilities', 'knowledge abilities', 'skill abilities'
   ],
   SKILL_PROFICIENCY_LEVELS_FETCH: [
     'show proficiency levels', 'proficiency levels', 'skill levels'
   ],
   SKILL_ATTRIBUTES_ADD: [
     'add skill attributes', 'add attributes', 'skill attributes'
   ],
   JOB_ROLES_FETCH: [
     'show job roles', 'list job roles', 'get job roles', 'job role list'
   ],
   JOB_ROLE_CREATE: [
     'create a job role', 'add job role', 'new job role'
   ],
   JOB_ROLE_UPDATE: [
     'update job role', 'edit job role', 'modify job role'
   ],
   JOB_ROLE_DELETE: [
     'delete job role', 'remove job role'
   ],
   JOB_ROLE_SKILLS_FETCH: [
     'show job role skills', 'job role skills', 'skills for job role'
   ],
   JOB_ROLE_SKILL_CREATE: [
     'create job role skill', 'add job role skill'
   ],
   JOB_ROLE_TASKS_FETCH: [
     'show job role tasks', 'job role tasks', 'tasks for job role'
   ],
   JOB_ROLE_TASK_CREATE: [
     'create job role task', 'add job role task'
   ],

   // Organization and Industries intents
   USER_JOB_ROLES_FETCH: [
     'show user job roles', 'my job roles', 'user job roles'
   ],
   INDUSTRIES_FETCH: [
     'show industries', 'list industries', 'get industries', 'industry list'
   ],
   DEPARTMENT_MASTER_FETCH: [
     'show department master', 'department master', 'master departments'
   ],
   NEO_INDUSTRIES_FETCH: [
     'get neo4j industries', 'neo industries', 'neo4j industries'
   ],
   DEPARTMENTS_FOR_INDUSTRY_FETCH: [
     'show departments for', 'departments in industry', 'industry departments'
   ],
   JOB_ROLES_FOR_DEPARTMENT_FETCH: [
     'show job roles for', 'job roles in department', 'department job roles'
   ],
   SKILLS_FOR_JOB_ROLE_FETCH: [
     'show skills for', 'skills in job role', 'job role skills'
   ],

   // Reports and Misc intents
   TASK_ANALYSIS_REPORT_FETCH: [
     'show task analysis report', 'task analysis', 'analysis report'
   ],
   EMPLOYEE_REPORT_FETCH: [
     'show employee report', 'employee report', 'staff report'
   ],
   ORGANIZATION_DASHBOARD_FETCH: [
     'show organization dashboard', 'organization dashboard', 'org dashboard'
   ],
   DASHBOARD_FETCH: [
     'show dashboard', 'dashboard view', 'main dashboard'
   ],
   COMPLIANCE_LIST_FETCH: [
     'show compliance list', 'compliance list', 'compliance items'
   ],
   COMPLIANCE_CREATE: [
     'create compliance', 'add compliance', 'new compliance'
   ],
   COMPLIANCE_UPDATE: [
     'update compliance', 'edit compliance', 'modify compliance'
   ],
   COMPLIANCE_DELETE: [
     'delete compliance', 'remove compliance'
   ],
   JOB_POSTINGS_FETCH: [
     'show job postings', 'job postings', 'available jobs'
   ],
   JOB_POSTING_CREATE: [
     'create job posting', 'add job posting', 'new job posting'
   ],
   JOB_POSTING_UPDATE: [
     'update job posting', 'edit job posting'
   ],

   // General/Academic intents
   STANDARDS_FETCH: [
     'show standards', 'list standards', 'get standards', 'academic standards'
   ],
   SECTIONS_FETCH: [
     'show sections', 'list sections', 'get sections', 'academic sections'
   ],
   SUBJECTS_FETCH: [
     'show subjects', 'list subjects', 'get subjects', 'academic subjects'
   ],
   QUESTIONS_FETCH: [
     'show questions', 'list questions', 'get questions', 'question bank'
   ],
   MENUS_FETCH: [
     'show menus', 'list menus', 'get menus', 'menu items'
   ],

   // AI and Auth intents
   GEMINI_CHAT: [
     'chat with gemini', 'talk to gemini', 'gemini chat', 'ask gemini'
   ],
   AI_COURSE_GENERATE: [
     'generate ai course', 'create ai course', 'ai course generation'
   ],
   GAMMA_CONTENT_FETCH: [
     'get gamma content', 'show gamma content', 'gamma content'
   ],
   FORGET_PASSWORD: [
     'forget password', 'forgot password', 'reset my password'
   ],
   RESET_PASSWORD: [
     'reset password', 'change password', 'update password'
   ],

   unclear: []
};
// ================= ENTITY EXTRACTION =================

export function extractEntities(query: string): ExtractedEntities {
  if (!query || typeof query !== 'string') {
    return {};
  }

  const entities: ExtractedEntities = {};
  const lowerQuery = query.toLowerCase();
  const normalizedQuery = lowerQuery.replace(/[^\w\s]/g, ' ');

  // Extract job role
  const jobRolePatterns = [
    /job[\s-]?role[:\s]+([a-zA-Z ]+)/i,
    /role[:\s]+([a-zA-Z ]+)/i,
    /what does a ([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(?:do|handle|manage)/i,
    /for (?:a )?([a-zA-Z]+(?:\s+[a-zA-Z]+)*) (?:role|position)/i,
    // Handle "competency profile for [job role]" pattern
    /competency[\s-]?profile[\s-]?for[\s-]?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i,
    // Handle "for [job role] in" pattern
    /for[\s-]?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+in[\s-]/i,
  ];

  for (const pattern of jobRolePatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      entities.jobRole = match[1].trim();
      break;
    }
  }

  // Extract industry
  const industryPatterns = [
    /industry[:\s]+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i,
    /(?:in|for|within) the ([a-zA-Z]+(?:\s+[a-zA-Z]+)*) (?:sector|industry|field)/i,
    // Handle "Selected [value] for industry" pattern
    /selected[:\s]+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+for\s+industry/i,
    // Handle "[value] industry" pattern
    /^([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+industry/i,
  ];

  for (const pattern of industryPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      entities.industry = match[1].trim();
      break;
    }
  }

  // Extract department
  const departmentPatterns = [
    /department[:\s]+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i,
    /(?:in|for|within) ([a-zA-Z]+(?:\s+[a-zA-Z]+)*) department/i,
    // Handle "Selected [value] for department" pattern
    /selected[:\s]+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+for\s+department/i,
    // Handle "[value] department" pattern
    /^([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+department/i,
  ];

  for (const pattern of departmentPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      entities.department = match[1].trim();
      break;
    }
  }

  // Extract month
  const monthPatterns = [
    /(?:for|in)\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(?:for|in)\s+(\w+)\s+(\d{4})/i, // "month year" format
    /(\d{4})[-\s](\w+)/i, // "year-month" format
    /(?:month[:\s]+)(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  ];

  for (const pattern of monthPatterns) {
    const match = query.match(pattern);
    if (match) {
      if (match[1] && ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].includes(match[1].toLowerCase())) {
        entities.month = match[1].toLowerCase();
        if (match[2]) entities.year = match[2];
      }
      break;
    }
  }

  // Extract year if not already extracted
  if (!entities.year) {
    const yearPattern = /(\d{4})/;
    const yearMatch = query.match(yearPattern);
    if (yearMatch) {
      entities.year = yearMatch[1];
    }
  }

  return entities;
}

// ================= ENHANCED CLASSIFIER =================

export function classifyIntent(
  query: string,
  conversationHistory?: Array<{ role: string; content: string }>
): IntentClassificationResult {
  if (!query || typeof query !== 'string') {
    return {
      intent: 'unclear',
      confidence: 0.1,
      reasoning: 'No query provided or query is not a valid string'
    };
  }

  const lowerQuery = query.toLowerCase();
  const normalizedQuery = lowerQuery.replace(/[^\w\s]/g, ' ');

  // First check for JOB_ROLE_COMPETENCY patterns (high specificity)
  const competencyPatterns = intentPatterns.JOB_ROLE_COMPETENCY.map(p => p.toLowerCase());
  const competencyMatches = competencyPatterns.filter(pattern =>
    lowerQuery.includes(pattern)
  ).length;

  // Check for follow-up patterns (comparing with previous context)
  const isFollowUpQuery = [
    'senior version',
    'compare this',
    'similar to',
    'what about',
    'instead of',
    'other role',
    'different role'
  ].some(pattern => lowerQuery.includes(pattern));

  // If it's a competency-related query or follow-up
  if (competencyMatches > 0 || (isFollowUpQuery && conversationHistory)) {
    const entities = extractEntities(query);

    // Calculate confidence - start higher for better matching
    let confidence = 0.7 + competencyMatches * 0.15;
    if (isFollowUpQuery) confidence += 0.2;
    confidence = Math.min(confidence, 0.98);

    const reasoning = competencyMatches > 0
      ? `Detected ${competencyMatches} competency pattern(s) matching "JOB_ROLE_COMPETENCY" intent`
      : 'Follow-up query related to job role competencies';

    return {
      intent: 'JOB_ROLE_COMPETENCY',
      confidence,
      reasoning,
      entities
    };
  }

  // Check for Course_Recommendation patterns
  const coursePatterns = intentPatterns.Course_Recommendation.map(p => p.toLowerCase());
  const courseMatches = coursePatterns.filter(pattern =>
    lowerQuery.includes(pattern)
  ).length;

  const hasCourseKeyword = /(course|courses|learning path)/i.test(normalizedQuery);
  const hasRecommendationKeyword = /(recommend|recommended|suggest|suggestion|best|which|what)/i.test(normalizedQuery);

  if (courseMatches > 0 || (hasCourseKeyword && hasRecommendationKeyword)) {
    const entities = extractEntities(query);

    let confidence = 0.7 + courseMatches * 0.15;
    if (courseMatches === 0 && hasCourseKeyword && hasRecommendationKeyword) {
      confidence = 0.75;
    }
    confidence = Math.min(confidence, 0.98);

    return {
      intent: 'Course_Recommendation',
      confidence,
      reasoning: courseMatches > 0
        ? `Detected ${courseMatches} course recommendation pattern(s)`
        : 'Detected course-related recommendation language',
      entities
    };
  }

  // Check for SKILL_GAP_ANALYSIS patterns (similar to Course_Recommendation flow)
  const skillGapPatterns = intentPatterns.SKILL_GAP_ANALYSIS.map(p => p.toLowerCase());
  const skillGapMatches = skillGapPatterns.filter(pattern =>
    lowerQuery.includes(pattern)
  ).length;
  
    // console.log('[classifyIntent] SKILL_GAP_ANALYSIS check - query:', lowerQuery, 'patterns:', skillGapPatterns, 'matches:', skillGapMatches);

  if (skillGapMatches > 0) {
    const entities = extractEntities(query);

    let confidence = 0.7 + skillGapMatches * 0.15;
    confidence = Math.min(confidence, 0.98);

    return {
      intent: 'SKILL_GAP_ANALYSIS',
      confidence,
      reasoning: `Detected ${skillGapMatches} skill gap analysis pattern(s)`,
      entities
    };
  }

  // Prioritize specific intents over generic data_retrieval
  const intentPriority: Record<QueryIntent, number> = {
    // High priority: specific HRMS intents
    'HRMS_USERS_FETCH': 10,
    'HRMS_PROFILE_FETCH': 10,
    'HRMS_DEPARTMENTS_FETCH': 10,
    'HRMS_ATTENDANCE_FETCH': 10,
    'HRMS_ATTENDANCE_UPDATE': 10,
    'HRMS_ATTENDANCE_PUNCH_OUT': 10,
    'HRMS_LEAVE_TYPES_FETCH': 10,
    'HRMS_LEAVE_TYPE_CREATE': 10,
    'HRMS_LEAVE_APPLY': 10,
    'HRMS_LEAVE_SUMMARY_FETCH': 10,
    'HRMS_LEAVE_AUTHORIZE': 10,
    'HRMS_HOLIDAYS_FETCH': 10,
    'HRMS_HOLIDAY_CREATE': 10,
    'HRMS_SALARY_STRUCTURE_FETCH': 10,
    'HRMS_PAYROLL_DEDUCTIONS_FETCH': 10,
    'HRMS_PAYROLL_MONTHLY_FETCH': 10,
    'HRMS_PAYROLL_GENERATE': 10,

    // High priority: specific LMS intents
    'LMS_COURSES_FETCH': 10,
    'LMS_MODULES_FETCH': 10,
    'LMS_CONTENT_FETCH': 10,
    'LMS_CONTENT_CREATE': 10,
    'LMS_QUESTION_CHAPTERS_FETCH': 10,
    'LMS_QUESTION_ADD': 10,
    'LMS_QUESTION_PAPERS_SEARCH': 10,
    'LMS_QUESTION_PAPER_STORE': 10,
    'LMS_EXAMS_FETCH': 10,
    'LMS_EXAM_SUBMIT': 10,

    // High priority: specific skills/job roles intents
    'SKILLS_FETCH': 10,
    'SKILL_CREATE': 10,
    'SKILL_CATEGORIES_FETCH': 10,
    'SKILL_KNOWLEDGE_ABILITIES_FETCH': 10,
    'SKILL_PROFICIENCY_LEVELS_FETCH': 10,
    'SKILL_ATTRIBUTES_ADD': 10,
    'JOB_ROLES_FETCH': 10,
    'JOB_ROLE_CREATE': 10,
    'JOB_ROLE_UPDATE': 10,
    'JOB_ROLE_DELETE': 10,
    'JOB_ROLE_SKILLS_FETCH': 10,
    'JOB_ROLE_SKILL_CREATE': 10,
    'JOB_ROLE_TASKS_FETCH': 10,
    'JOB_ROLE_TASK_CREATE': 10,

    // High priority: specific organization/industries intents
    'USER_JOB_ROLES_FETCH': 10,
    'INDUSTRIES_FETCH': 10,
    'DEPARTMENT_MASTER_FETCH': 10,
    'NEO_INDUSTRIES_FETCH': 10,
    'DEPARTMENTS_FOR_INDUSTRY_FETCH': 10,
    'JOB_ROLES_FOR_DEPARTMENT_FETCH': 10,
    'SKILLS_FOR_JOB_ROLE_FETCH': 10,

    // High priority: specific reports/misc intents
    'TASK_ANALYSIS_REPORT_FETCH': 10,
    'EMPLOYEE_REPORT_FETCH': 10,
    'ORGANIZATION_DASHBOARD_FETCH': 10,
    'DASHBOARD_FETCH': 10,
    'COMPLIANCE_LIST_FETCH': 10,
    'COMPLIANCE_CREATE': 10,
    'COMPLIANCE_UPDATE': 10,
    'COMPLIANCE_DELETE': 10,
    'JOB_POSTINGS_FETCH': 10,
    'JOB_POSTING_CREATE': 10,
    'JOB_POSTING_UPDATE': 10,

    // High priority: specific general/academic intents
    'STANDARDS_FETCH': 10,
    'SECTIONS_FETCH': 10,
    'SUBJECTS_FETCH': 10,
    'QUESTIONS_FETCH': 10,
    'MENUS_FETCH': 10,

    // High priority: specific AI/auth intents
    'GEMINI_CHAT': 10,
    'AI_COURSE_GENERATE': 10,
    'GAMMA_CONTENT_FETCH': 10,
    'FORGET_PASSWORD': 10,
    'RESET_PASSWORD': 10,

    // Special intents with higher priority
    'JOB_ROLE_COMPETENCY': 8,
    'Course_Recommendation': 8,
    'SKILL_GAP_ANALYSIS': 8,
    'CREATE_JOB_DESCRIPTION': 8,

    // Medium priority: action intents
    'action': 5,
    'support': 5,

    // Low priority: generic data retrieval (fallback)
    'data_retrieval': 1,

    // Lowest priority: unclear
    'unclear': 0
  };

  // Original pattern matching for other intents with priority weighting
  const intents = Object.entries(intentPatterns) as [QueryIntent, string[]][];
  let bestScore = 0;
  let detectedIntent: QueryIntent = 'unclear';

  for (const [intent, patterns] of intents) {
    if (intent === 'JOB_ROLE_COMPETENCY' || intent === 'Course_Recommendation' || intent === 'SKILL_GAP_ANALYSIS') continue; // Skip already handled

    const matches = patterns.filter(pattern =>
      lowerQuery.includes(pattern.toLowerCase())
    ).length;

    if (matches > 0) {
      const priority = intentPriority[intent] || 1;
      const score = matches * priority;

      if (score > bestScore) {
        bestScore = score;
        detectedIntent = intent;
      }
    }
  }

  const maxMatches = bestScore > 0 ? Math.ceil(bestScore / (intentPriority[detectedIntent] || 1)) : 0;
  const confidence =
    maxMatches > 0
      ? Math.min(0.3 + maxMatches * 0.2, 0.95)
      : 0.1;

  const reasoning =
    maxMatches > 0
      ? `Detected ${maxMatches} pattern(s) matching "${detectedIntent}" intent`
      : 'No clear intent patterns detected; requires context';

  return {
    intent: detectedIntent,
    confidence,
    reasoning
  };
}

// ================= CLASSIFIER =================

// export function classifyIntent(query: string): IntentClassificationResult {
//   const lowerQuery = query.toLowerCase();

//   const intents = Object.entries(intentPatterns) as [QueryIntent, string[]][];
//   let maxMatches = 0;
//   let detectedIntent: QueryIntent = 'unclear';

//   for (const [intent, patterns] of intents) {
//     const matches = patterns.filter(pattern =>
//       lowerQuery.includes(pattern.toLowerCase())
//     ).length;

//     if (matches > maxMatches) {
//       maxMatches = matches;
//       detectedIntent = intent;
//     }
//   }

//   const confidence =
//     maxMatches > 0
//       ? Math.min(0.3 + maxMatches * 0.2, 0.95)
//       : 0.1;

//   const reasoning =
//     maxMatches > 0
//       ? `Detected ${maxMatches} pattern(s) matching "${detectedIntent}" intent`
//       : 'No clear intent patterns detected; requires context';

//   return {
//     intent: detectedIntent,
//     confidence,
//     reasoning
//   };
// }

// ================= ROUTING HELPERS =================

export function shouldRouteToAction(intent: QueryIntent): boolean {
  // ✅ Explicit handling for JD creation
  if (intent === 'CREATE_JOB_DESCRIPTION') return true;
  // SKILL_GAP_ANALYSIS is handled by its own dedicated handler in api-handler.ts
  // Do NOT route it to generic action handler

  // HRMS action intents
  if (intent === 'HRMS_ATTENDANCE_UPDATE' ||
      intent === 'HRMS_ATTENDANCE_PUNCH_OUT' ||
      intent === 'HRMS_LEAVE_TYPE_CREATE' ||
      intent === 'HRMS_LEAVE_APPLY' ||
      intent === 'HRMS_LEAVE_AUTHORIZE' ||
      intent === 'HRMS_HOLIDAY_CREATE' ||
      intent === 'HRMS_PAYROLL_GENERATE') return true;

  // LMS action intents
  if (intent === 'LMS_CONTENT_CREATE' ||
      intent === 'LMS_QUESTION_ADD' ||
      intent === 'LMS_QUESTION_PAPER_STORE' ||
      intent === 'LMS_EXAM_SUBMIT') return true;

  // Skills and Job Roles action intents
  if (intent === 'SKILL_CREATE' ||
      intent === 'SKILL_ATTRIBUTES_ADD' ||
      intent === 'JOB_ROLE_CREATE' ||
      intent === 'JOB_ROLE_UPDATE' ||
      intent === 'JOB_ROLE_DELETE' ||
      intent === 'JOB_ROLE_SKILL_CREATE' ||
      intent === 'JOB_ROLE_TASK_CREATE') return true;

  // Reports and Misc action intents
  if (intent === 'COMPLIANCE_CREATE' ||
      intent === 'COMPLIANCE_UPDATE' ||
      intent === 'COMPLIANCE_DELETE' ||
      intent === 'JOB_POSTING_CREATE' ||
      intent === 'JOB_POSTING_UPDATE') return true;

  // AI and Auth action intents
  if (intent === 'GEMINI_CHAT' ||
      intent === 'AI_COURSE_GENERATE' ||
      intent === 'FORGET_PASSWORD' ||
      intent === 'RESET_PASSWORD') return true;

  return intent === 'action' || intent === 'support';
}

export function shouldUseFallback(intent: QueryIntent): boolean {
  return intent === 'support' || intent === 'unclear' || intent === 'data_retrieval';
}
