// Mock data for the Employee Directory Analytics Dashboard

export const departments = [
 
  "Engineering",
  "Sales",
  "Marketing",
  "Operations",
  "HR",
  "Finance",
];

export const jobRoles = [
 
  "Software Engineer",
  "Senior Engineer",
  "Product Manager",
  "Sales Representative",
  "Marketing Manager",
  "Operations Specialist",
  "HR Manager",
  "Financial Analyst",
];

export const skills = [
 
  "Python",
  "JavaScript",
  "React",
  "SQL",
  "Data Analysis",
  "Presentation Skills",
  "Project Management",
  "Leadership",
  "Communication",
  "Process Automation",
];

export const locations = [ "New York", "San Francisco", "London", "Singapore", "Remote"];

export const employmentStatus = ["Active", "On Leave", "Resigned"];

// KPI Data
export const kpiData = {
  totalEmployees: 1247,
  totalEmployeesTrend: 8.2,
  newHires: 89,
  newHiresTrend: 12.5,
  attritionRate: 6.8,
  attritionRateTrend: -2.3,
  growthRate: 14.2,
  growthRateTrend: 5.1,
  avgSkillCoverage: 78.5,
  avgSkillCoverageTrend: 3.2,
  avgProficiencyDelta: -0.12,
  avgProficiencyDeltaTrend: 0.05,
};

// Growth data over time
export const growthData = [
  { month: "Jan", headcount: 1050, hires: 45, attrition: 28 },
  { month: "Feb", headcount: 1067, hires: 38, attrition: 21 },
  { month: "Mar", headcount: 1089, hires: 42, attrition: 20 },
  { month: "Apr", headcount: 1115, hires: 48, attrition: 22 },
  { month: "May", headcount: 1143, hires: 52, attrition: 24 },
  { month: "Jun", headcount: 1175, hires: 58, attrition: 26 },
  { month: "Jul", headcount: 1201, hires: 55, attrition: 29 },
  { month: "Aug", headcount: 1227, hires: 61, attrition: 35 },
  { month: "Sep", headcount: 1247, hires: 59, attrition: 39 },
];

// Department distribution
export const departmentData = [
  { department: "Engineering", count: 487, change: 12.3 },
  { department: "Sales", count: 298, change: 8.7 },
  { department: "Marketing", count: 156, change: 15.2 },
  { department: "Operations", count: 134, change: 5.4 },
  { department: "HR", count: 89, change: 3.1 },
  { department: "Finance", count: 83, change: 7.8 },
];

// Stacked department growth
export const stackedGrowthData = [
  { month: "Jan", Engineering: 420, Sales: 260, Marketing: 130, Operations: 120, HR: 65, Finance: 55 },
  { month: "Feb", Engineering: 428, Sales: 265, Marketing: 133, Operations: 122, HR: 68, Finance: 51 },
  { month: "Mar", Engineering: 438, Sales: 272, Marketing: 138, Operations: 123, HR: 70, Finance: 48 },
  { month: "Apr", Engineering: 448, Sales: 280, Marketing: 142, Operations: 125, HR: 72, Finance: 48 },
  { month: "May", Engineering: 458, Sales: 285, Marketing: 148, Operations: 128, HR: 75, Finance: 49 },
  { month: "Jun", Engineering: 468, Sales: 290, Marketing: 152, Operations: 130, HR: 80, Finance: 55 },
  { month: "Jul", Engineering: 475, Sales: 293, Marketing: 154, Operations: 132, HR: 85, Finance: 62 },
  { month: "Aug", Engineering: 482, Sales: 296, Marketing: 155, Operations: 133, HR: 87, Finance: 74 },
  { month: "Sep", Engineering: 487, Sales: 298, Marketing: 156, Operations: 134, HR: 89, Finance: 83 },
];

// Lifecycle funnel
export const lifecycleData = [
  { stage: "Applicants", count: 8450, conversion: 100, trend: 5.2 },
  { stage: "Shortlisted", count: 1690, conversion: 20, trend: 3.8 },
  { stage: "Interviewed", count: 507, conversion: 30, trend: 2.1 },
  { stage: "Offered", count: 203, conversion: 40, trend: -1.2 },
  { stage: "Hired", count: 175, conversion: 86, trend: 8.5 },
  { stage: "Active", count: 1247, conversion: 100, trend: 14.2 },
];

// Attrition by department
export const attritionData = [
  { department: "Engineering", attritionRate: 5.2, count: 25 },
  { department: "Sales", attritionRate: 9.8, count: 29 },
  { department: "Marketing", attritionRate: 7.1, count: 11 },
  { department: "Operations", attritionRate: 4.5, count: 6 },
  { department: "HR", attritionRate: 3.4, count: 3 },
  { department: "Finance", attritionRate: 6.0, count: 5 },
];

// Skills matrix data
export interface SkillMatrixCell {
  department: string;
  skill: string;
  coverage: number; // percentage
  actualProficiency: number; // 1-5 scale
  expectedProficiency: number; // 1-5 scale
  delta: number; // actualProficiency - expectedProficiency
  employeeCount: number;
}

export const skillsMatrixData: SkillMatrixCell[] = [
  // Engineering
  { department: "Engineering", skill: "Python", coverage: 92, actualProficiency: 4.2, expectedProficiency: 4.5, delta: -0.3, employeeCount: 448 },
  { department: "Engineering", skill: "JavaScript", coverage: 88, actualProficiency: 4.0, expectedProficiency: 4.3, delta: -0.3, employeeCount: 428 },
  { department: "Engineering", skill: "React", coverage: 75, actualProficiency: 3.8, expectedProficiency: 4.0, delta: -0.2, employeeCount: 365 },
  { department: "Engineering", skill: "SQL", coverage: 85, actualProficiency: 3.9, expectedProficiency: 4.0, delta: -0.1, employeeCount: 414 },
  { department: "Engineering", skill: "Data Analysis", coverage: 68, actualProficiency: 3.5, expectedProficiency: 3.5, delta: 0.0, employeeCount: 331 },
  { department: "Engineering", skill: "Leadership", coverage: 45, actualProficiency: 3.2, expectedProficiency: 3.8, delta: -0.6, employeeCount: 219 },
  
  // Sales
  { department: "Sales", skill: "Presentation Skills", coverage: 95, actualProficiency: 4.3, expectedProficiency: 4.5, delta: -0.2, employeeCount: 283 },
  { department: "Sales", skill: "Communication", coverage: 98, actualProficiency: 4.5, expectedProficiency: 4.5, delta: 0.0, employeeCount: 292 },
  { department: "Sales", skill: "Data Analysis", coverage: 62, actualProficiency: 3.1, expectedProficiency: 3.5, delta: -0.4, employeeCount: 185 },
  { department: "Sales", skill: "SQL", coverage: 48, actualProficiency: 2.8, expectedProficiency: 3.0, delta: -0.2, employeeCount: 143 },
  { department: "Sales", skill: "Leadership", coverage: 52, actualProficiency: 3.4, expectedProficiency: 3.8, delta: -0.4, employeeCount: 155 },
  
  // Marketing
  { department: "Marketing", skill: "Presentation Skills", coverage: 90, actualProficiency: 4.1, expectedProficiency: 4.3, delta: -0.2, employeeCount: 140 },
  { department: "Marketing", skill: "Communication", coverage: 96, actualProficiency: 4.4, expectedProficiency: 4.5, delta: -0.1, employeeCount: 150 },
  { department: "Marketing", skill: "Data Analysis", coverage: 78, actualProficiency: 3.7, expectedProficiency: 4.0, delta: -0.3, employeeCount: 122 },
  { department: "Marketing", skill: "Project Management", coverage: 72, actualProficiency: 3.6, expectedProficiency: 4.0, delta: -0.4, employeeCount: 112 },
  { department: "Marketing", skill: "JavaScript", coverage: 42, actualProficiency: 2.9, expectedProficiency: 3.0, delta: -0.1, employeeCount: 66 },
  
  // Operations
  { department: "Operations", skill: "Process Automation", coverage: 82, actualProficiency: 3.9, expectedProficiency: 3.8, delta: 0.1, employeeCount: 110 },
  { department: "Operations", skill: "Data Analysis", coverage: 88, actualProficiency: 4.0, expectedProficiency: 4.0, delta: 0.0, employeeCount: 118 },
  { department: "Operations", skill: "SQL", coverage: 76, actualProficiency: 3.6, expectedProficiency: 3.8, delta: -0.2, employeeCount: 102 },
  { department: "Operations", skill: "Project Management", coverage: 85, actualProficiency: 3.8, expectedProficiency: 4.0, delta: -0.2, employeeCount: 114 },
  { department: "Operations", skill: "Python", coverage: 55, actualProficiency: 3.2, expectedProficiency: 3.5, delta: -0.3, employeeCount: 74 },
  
  // HR
  { department: "HR", skill: "Communication", coverage: 100, actualProficiency: 4.6, expectedProficiency: 4.5, delta: 0.1, employeeCount: 89 },
  { department: "HR", skill: "Leadership", coverage: 78, actualProficiency: 4.0, expectedProficiency: 4.2, delta: -0.2, employeeCount: 69 },
  { department: "HR", skill: "Presentation Skills", coverage: 92, actualProficiency: 4.2, expectedProficiency: 4.3, delta: -0.1, employeeCount: 82 },
  { department: "HR", skill: "Data Analysis", coverage: 68, actualProficiency: 3.4, expectedProficiency: 3.8, delta: -0.4, employeeCount: 61 },
  
  // Finance
  { department: "Finance", skill: "Data Analysis", coverage: 95, actualProficiency: 4.4, expectedProficiency: 4.5, delta: -0.1, employeeCount: 79 },
  { department: "Finance", skill: "SQL", coverage: 88, actualProficiency: 4.1, expectedProficiency: 4.2, delta: -0.1, employeeCount: 73 },
  { department: "Finance", skill: "Python", coverage: 72, actualProficiency: 3.5, expectedProficiency: 3.8, delta: -0.3, employeeCount: 60 },
  { department: "Finance", skill: "Communication", coverage: 85, actualProficiency: 3.9, expectedProficiency: 4.0, delta: -0.1, employeeCount: 71 },
];

// AI Insights
export interface AIInsight {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  businessImpact: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  affectedCount: number;
  relatedSkills?: string[];
  relatedDepartments?: string[];
}

export const aiInsights: AIInsight[] = [
  {
    id: "1",
    type: "warning",
    title: "Engineering: Python Proficiency Gap Detected",
    description: "Python proficiency delta = -0.3 vs expected; gap driven by 45 new hires from Q2 and low training completion rate (38%).",
    businessImpact: "This proficiency gap may delay Project Phoenix by 4-6 weeks and affect sprint velocity by ~15%.",
    recommendation: "Deploy targeted Python bootcamp for Q2 hires (est. 3 weeks); pair with senior mentors. Expected improvement: +0.5 proficiency in 8 weeks.",
    priority: "high",
    affectedCount: 45,
    relatedSkills: ["Python"],
    relatedDepartments: ["Engineering"],
  },
  {
    id: "2",
    type: "success",
    title: "Operations: Process Automation Skill Growth",
    description: "Process Automation coverage increased 18% QoQ with +0.1 proficiency delta above target. Driven by internal mentoring program and 4 automation workshops.",
    businessImpact: "Aligns with ops automation KPI; estimated 12% efficiency gain in Q3 vs Q2. Supports automation roadmap objectives.",
    recommendation: "Continue internal mentoring; scale workshop series to Sales and Marketing teams to replicate success.",
    priority: "medium",
    affectedCount: 110,
    relatedSkills: ["Process Automation"],
    relatedDepartments: ["Operations"],
  },
  {
    id: "3",
    type: "warning",
    title: "Sales: Data Analysis Skills Below Target",
    description: "Data Analysis proficiency -0.4 delta in Sales; only 62% coverage. Root cause: limited SQL training and low dashboard adoption (34%).",
    businessImpact: "Sales team spending 8-10 hrs/week on manual reporting; reduces time for customer engagement by ~20%.",
    recommendation: "Implement bi-weekly SQL + analytics workshops; deploy interactive dashboards with training. Target: 80% coverage, +0.3 proficiency in 10 weeks.",
    priority: "high",
    affectedCount: 113,
    relatedSkills: ["Data Analysis", "SQL"],
    relatedDepartments: ["Sales"],
  },
  {
    id: "4",
    type: "info",
    title: "Leadership Skills Gap Across Departments",
    description: "Average leadership proficiency -0.4 delta across Engineering, Sales, and Marketing. Only 45-52% coverage in mid-level roles.",
    businessImpact: "Succession planning at risk; limited bench strength for 23 open senior positions. May impact promotion velocity and retention.",
    recommendation: "Launch leadership development program targeting high-performers with 2+ years tenure. Include coaching, mentorship, and cross-functional projects.",
    priority: "medium",
    affectedCount: 187,
    relatedSkills: ["Leadership"],
    relatedDepartments: ["Engineering", "Sales", "Marketing"],
  },
  {
    id: "5",
    type: "warning",
    title: "Marketing: Project Management Proficiency Gap",
    description: "Project Management at -0.4 delta with 72% coverage. Linked to 3 delayed campaigns in Q2 and increased cross-team friction.",
    businessImpact: "Campaign delays averaging 2.5 weeks; estimated revenue impact of $180K in Q2. Team satisfaction scores down 12%.",
    recommendation: "Enroll Marketing managers in certified PM training (PMP/Agile); establish PM guild for knowledge sharing. Timeline: 12 weeks.",
    priority: "high",
    affectedCount: 44,
    relatedSkills: ["Project Management"],
    relatedDepartments: ["Marketing"],
  },
];

// Skill time-series trends
export const skillTrendsData = [
  { quarter: "Q1", Python: 3.9, JavaScript: 3.7, DataAnalysis: 3.4, Leadership: 3.0 },
  { quarter: "Q2", Python: 4.0, JavaScript: 3.8, DataAnalysis: 3.5, Leadership: 3.1 },
  { quarter: "Q3", Python: 4.2, JavaScript: 4.0, DataAnalysis: 3.7, Leadership: 3.2 },
];
