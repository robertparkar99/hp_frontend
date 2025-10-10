"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Settings,
  LayoutTemplate,
  Eye,
  Copy,
  RotateCcw,
  ClipboardCheck,
  Play,
  ChevronRight,
  Building,
  Users,
  Target,
  Clock,
  BarChart3,
  GraduationCap,
  ListChecks,
  Sparkles,
  X,
  CheckCircle2,
  Search,
  MapPin,
  SlidersHorizontal
} from "lucide-react";

interface AiCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (payload: { topic: string; description: string; apiResponse?: any }) => void;
}

interface JobRole {
  id: string;
  jobrole: string;
}

interface Department {
  id: string;
  department: string;
}

// Types for Course Creator Module
type Template = {
  id: string;
  title: string;
  jobRole: string;
  criticalWorkFunction: string;
  tasks: string[];
  skills: string[];
};

type Config = {
  department: string;
  jobRole: string;
  criticalWorkFunction: string;
  tasks: string[];
  skills: string[];
  audience: "Student" | "Intern" | "Junior" | "Mid" | "Senior" | "";
  proficiencyTarget: number;
  duration: "1h" | "2h" | "Half-day" | "1-day" | "Multi-day" | "";
  modality: { selfPaced: boolean; instructorLed: boolean;};
  outcomes: string[];
};

const SEED_TEMPLATES: Template[] = [
  // {
  //   id: "t1",
  //   title: "Job Role → Critical Work Function",
  //   jobRole: "Physiotherapist",
  //   criticalWorkFunction: "Manage risk and quality",
  //   tasks: ["Deliver training"],
  //   skills: ["Strategy Development"],
  // },
  {
    id: "t2",
    title: "Job Role → Key Task",
    jobRole: "Physiotherapist",
    criticalWorkFunction: "",
    tasks: ["Deliver training"],
    skills: ["Strategy Development"],
  },
  // {
  //   id: "t3",
  //   title: "Job Role → Skill",
  //   jobRole: "Physiotherapist",
  //   criticalWorkFunction: "",
  //   tasks: [""],
  //   skills: ["Strategy Development"],
  // },
];

const DEFAULT_CONFIG: Config = {
  department: "",
  jobRole: "",
  criticalWorkFunction: "",
  tasks: [],
  skills: [],
  audience: "",
  proficiencyTarget: 3,
  duration: "",
  modality: { selfPaced: true, instructorLed: false},
  outcomes: ["Understand context", "Apply skills to task", "Assess mastery"],
};

function buildPrompt(cfg: Config, industry: string) {
  const modality = [
    cfg.modality.selfPaced && "Self-paced",
    cfg.modality.instructorLed && "Instructor-led",
  ]
    .filter(Boolean)
    .join(", ");

  const keyTask = cfg.tasks.length > 0 ? cfg.tasks[0] : " - ";
  const primarySkill = cfg.skills.length > 0 ? cfg.skills[0] : " - ";

  return `You are an expert L&D Manager. Design a complete 10-slide instructional training course that provides a guide to complete the Key Task successfully.

Input Variables:

Industry: ${industry || " - "}
Department: ${cfg.department || " - "}
Job Role: ${cfg.jobRole || " - "}
Critical Work Function: ${cfg.criticalWorkFunction || " - "}
Key Task: ${keyTask || " - "}
Modality: ${modality || " - "}

Output Format:

Total Slides: 10
Each slide = 1 instructional unit
Bullet points per slide: 3–5 (under 40 words each)
Language: Instructional, practical, professional
Style: Formal, structured, competency-based
No visuals or design styling
No repetition — ensure uniqueness per slide
Tone: ${modality.includes("Self-paced") ? "Direct, learner-led tone; emphasis on individual reflection" : "Include facilitator cues, group discussion prompts"} 


Slide Structure Breakdown (10 Slides):

1. Title Slide

Industry: ${industry || " - "}
Department: ${cfg.department || " - "}
Job role: ${cfg.jobRole || " - "} 
Key Task: ${keyTask || " - "}
Critical Work Function: ${cfg.criticalWorkFunction ||  " - " }
Modality: ${modality || " - "}

2. Learning Objectives & Modality Instructions

Targeted outcomes for mastering this Key task: ${keyTask || " - "}
Importance of monitoring and evaluation
${modality.includes("Self-paced") ? "Tips for self-driven navigation and checks" : "Facilitator guidance and session flow overview"}

3. Task Contextualization

Role of the Key Task: ${keyTask} within the Critical Work Function: ${cfg.criticalWorkFunction || " - "}
Industry Context: ${industry || " - "}
Dependencies and prerequisites
Stakeholders or systems involved

4. Performance Expectations

Key success indicators
Task standards and KPIs
Timeliness and quality dimensions

5. Monitoring Indicators

Observable checkpoints
Red flags to watch for
Sample field-level evidence

6. Tools & Methods for Monitoring

Digital or manual tools
Logging and feedback techniques
Real-time vs retrospective tracking

7. Data Capture & Reporting

How to document outcomes
Structured logs or templates
Communicating progress or deviations

8. Common Pitfalls & Risk Management

Frequent errors during task: ${keyTask || " - "} execution
Preventive and corrective strategies
Escalation criteria

9. Best Practice Walkthrough

Example scenario of successful task: ${keyTask || " - "} monitoring
Highlighting decision points
${modality.includes("Instructor-led") ? "Facilitator questions for discussion" : "Reflection prompts for learner"}

10. Completion Criteria & Evaluation

Final checks for task: ${keyTask || " - "} closure
Quality assurance checkpoints
${modality.includes("Self-paced") ? "Self-assessment checklist" : "Facilitator sign-off checklist"}

Ensure each slide has 3-5 bullet points with clear, actionable content under 40 words each. Focus on practical successful task completion strategies.`;
}

// Reusable UI Components
function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
      disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:bg-slate-50"
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
      />
      <span className={`text-sm ${disabled ? "text-gray-500" : ""}`}>{label}</span>
    </label>
  );
}

function TokenInput({
  tokens,
  onAdd,
  onRemove,
  placeholder,
  disabled = false,
}: {
  tokens: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tokens.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800"
          >
            {t}
            <button
              onClick={() => onRemove(t)}
              disabled={disabled}
              className="rounded-full hover:bg-blue-200 px-1 leading-none transition-colors"
              aria-label={`Remove ${t}`}
              title="Remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) {
            e.preventDefault();
            const v = draft.trim();
            if (v) onAdd(v);
            setDraft("");
          }
        }}
        disabled={disabled}
        className={`mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
        }`}
        placeholder={disabled ? "Select a template first" : placeholder}
      />
    </div>
  );
}

function OutcomeList({
  outcomes,
  onChange,
  disabled = false,
}: {
  outcomes: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  function updateAt(i: number, v: string) {
    if (disabled) return;
    const next = outcomes.slice();
    next[i] = v;
    onChange(next);
  }
  function removeAt(i: number) {
    if (disabled) return;
    onChange(outcomes.filter((_, idx) => idx !== i));
  }
  function add() {
    if (disabled) return;
    onChange([...outcomes, ""]);
  }
  return (
    <div className="space-y-2">
      {outcomes.map((o, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="mt-2 text-xs text-blue-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <textarea
            value={o}
            onChange={(e) => updateAt(i, e.target.value)}
            disabled={disabled}
            className={`min-h-[64px] flex-1 resize-y rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"
            }`}
            placeholder={disabled ? "Select a template first" : "Describe an outcome in measurable terms…"}
          />
          <button
            onClick={() => removeAt(i)}
            disabled={disabled}
            className={`mt-1 rounded-lg border border-gray-300 px-2 py-1 text-xs transition-colors ${
              disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:bg-red-50 hover:text-red-600"
            }`}
            title="Remove outcome"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm transition-colors w-full justify-center ${
          disabled 
            ? "bg-gray-100 cursor-not-allowed opacity-60 text-gray-500" 
            : "hover:bg-blue-50 hover:border-blue-300 text-blue-600"
        }`}
      >
        <Plus className="h-4 w-4" />
        Add Outcome
      </button>
    </div>
  );
}

// Helper function to get template display fields
function getTemplateDisplayFields(template: Template) {
  const fields = [];
  
  if (template.jobRole && template.jobRole !== "") {
    fields.push(`Job Role: ${template.jobRole}`);
  }
  
  // if (template.id === "t1" && template.criticalWorkFunction && template.criticalWorkFunction !== "") {
  //   fields.push(`Critical Work Function: ${template.criticalWorkFunction}`);
  // }
  
  if (template.id === "t2" && template.tasks.length > 0 && template.tasks[0] !== "") {
    fields.push(`Tasks: ${template.tasks.join(", ")}`);
  }
  
  // if (template.id === "t3" && template.skills.length > 0 && template.skills[0] !== "") {
  //   fields.push(`Skills: ${template.skills.join(", ")}`);
  // }
  
  return fields;
}

// Configuration Toggle Component - SMALL SIZE with rounded corners and color changes
function ConfigurationToggle({ 
  activeSection, 
  onSectionChange,
  disabled = false,
}: { 
  activeSection: string;
  onSectionChange: (section: string) => void;
  disabled?: boolean;
}) {
  const sections = [
    { id: "course-mapping", label: "Course Mapping", icon: MapPin },
    { id: "course-parameters", label: "Course Parameters", icon: SlidersHorizontal },
  ];

  return (
    <div className={`flex border-b rounded-t-lg mx-4 mt-2 ${
      disabled ? "bg-gray-100" : "bg-blue-50"
    }`}>
      <nav className="flex w-full rounded-md overflow-hidden">
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => !disabled && onSectionChange(item.id)}
            disabled={disabled}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors flex-1 justify-center ${
              disabled
                ? "text-gray-400 cursor-not-allowed"
                : activeSection === item.id
                ? "bg-white text-blue-700 border border-blue-200 shadow-sm rounded-md mx-1 my-1"
                : "text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md mx-1 my-1"
            }`}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// Custom scrollbar styles for smooth scrolling with hidden scrollbars
const scrollbarStyles = `
  .smooth-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .smooth-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .config-scroll-container {
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  .config-scroll-container::-webkit-scrollbar {
    display: none;
  }
  .config-content {
    min-height: min-content;
  }
`;

// Main AiCourseDialog Component
const AiCourseDialog = ({ open, onOpenChange, onGenerate }: AiCourseDialogProps) => {
  const [templates] = React.useState<Template[]>(SEED_TEMPLATES);
  const [query, setQuery] = React.useState("");
  const [cfg, setCfg] = React.useState<Config>(DEFAULT_CONFIG);
  const [preview, setPreview] = React.useState("No template selected. Please select a template to enable configuration.");
  const [diverged, setDiverged] = React.useState(false);
  const [manualPreview, setManualPreview] = React.useState(preview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [criticalWorkFunctions, setCriticalWorkFunctions] = useState<{ id: string; critical_work_function: string }[]>([]);
  const [availableTasks, setAvailableTasks] = useState<{ id: string; task: string }[]>([]);
  const [availableSkills, setAvailableSkills] = useState<{ id: string; skill: string; skill_category?: string }[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);
  const [loadingCWF, setLoadingCWF] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [industry, setIndustry] = useState<string>("");
  const [configSection, setConfigSection] = useState<string>("course-mapping");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  
  // State for dropdown enable/disable functionality and proficiency visibility
  const [enabledDropdowns, setEnabledDropdowns] = React.useState({
    jobRole: false,
    criticalWorkFunction: false,
    tasks: false,
    skills: false
  });
  const [showProficiency, setShowProficiency] = React.useState(false);
  
  // New state to track if template is selected
  const [isTemplateSelected, setIsTemplateSelected] = useState(false);

  // Add smooth scrollbar styles to document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = scrollbarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Load sessionData from localStorage once
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setSessionData(parsed);
        if (parsed.org_type) {
          setIndustry(parsed.org_type);
        }
      } catch (err) {
        console.error("Failed to parse userData from localStorage:", err);
      }
    }
  }, []);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!sessionData || !sessionData.APP_URL || !sessionData.sub_institute_id || !sessionData.org_type) return;

      setLoadingDepartments(true);
      setError(null);

      try {
        const apiUrl = `${sessionData.APP_URL}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[industries]=${sessionData.org_type}&group_by=department&order_by[column]=department&order_by[direction]=asc`;
        console.log("Fetching departments from:", apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch departments: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("Departments response:", data);
        setDepartments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching departments:", err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [sessionData]);

  // Fetch job roles when department changes
  useEffect(() => {
    const fetchJobRoles = async () => {
      if (!cfg.department || !sessionData || !sessionData.APP_URL || !sessionData.sub_institute_id) {
        setJobRoles([]);
        return;
      }

      setLoadingJobRoles(true);
      setError(null);

      try {
        const apiUrl = `${sessionData.APP_URL}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[industries]=${sessionData.org_type}&filters[department]=${encodeURIComponent(cfg.department)}&group_by=jobrole&order_by[column]=jobrole&order_by[direction]=asc`;
        console.log("Fetching job roles from:", apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch job roles: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("Job roles response:", data);
        setJobRoles(data);

        // Only reset job role if it's not from a template
        if (!activeTemplate) {
          setCfg(prev => ({ ...prev, jobRole: '' }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching job roles:", err);
      } finally {
        setLoadingJobRoles(false);
      }
    };

    fetchJobRoles();
  }, [cfg.department, sessionData, activeTemplate]);

  // Sync preview when config changes—unless manually diverged
  React.useEffect(() => {
    if (!diverged && isTemplateSelected) {
      const p = buildPrompt(cfg, industry);
      setPreview(p);
      setManualPreview(p);
    }
  }, [cfg, diverged, industry, isTemplateSelected]);

function applyTemplate(t: Template) {
  // Create a new config with ONLY the template structure, not the values
  const newConfig = {
    ...DEFAULT_CONFIG,
    // Don't pre-fill any values from the template - only set the structure
    jobRole: "", // Empty instead of template value
    criticalWorkFunction: "", // Empty instead of template value
    tasks: [], // Empty instead of template values
    skills: [], // Empty instead of template values
  };
  
  setCfg(newConfig);
  setActiveTemplate(t.id);
  
  // Enable the appropriate dropdowns based on template type
  if (t.id === "t1") {
    setEnabledDropdowns({
      jobRole: true,
      criticalWorkFunction: true,
      tasks: false,
      skills: false
    });
    setShowProficiency(false);
  } else if (t.id === "t2") {
    setEnabledDropdowns({
      jobRole: true,
      criticalWorkFunction: true,
      tasks: true,
      skills: false  // Skills should be disabled for t2 template
    });
    setShowProficiency(false);
  } else if (t.id === "t3") {
    setEnabledDropdowns({
      jobRole: true,
      criticalWorkFunction: false,
      tasks: false,
      skills: true
    });
    setShowProficiency(true);
  }

  // Enable the configuration and preview sections
  setIsTemplateSelected(true);
  setDiverged(false);
  const newPreview = buildPrompt(newConfig, industry);
  setPreview(newPreview);
  setManualPreview(newPreview);
}

  function handleResync() {
    if (!isTemplateSelected) return;
    const p = buildPrompt(cfg, industry);
    setPreview(p);
    setManualPreview(p);
    setDiverged(false);
  }

  // function handleGenerate() {
  //   if (!isTemplateSelected) {
  //     alert("⚠️ Please select a template first!");
  //     return;
  //   }

  //   const missing: string[] = [];
  //   if (!cfg.department) missing.push("Department");
  //   if (!cfg.jobRole) missing.push("Job Role");
  //   if (!cfg.criticalWorkFunction && enabledDropdowns.criticalWorkFunction) missing.push("Critical Work Function");
  //   if (!cfg.duration) missing.push("Duration");
  //   if (!cfg.audience) missing.push("Audience");

  //   if (missing.length) {
  //     alert(`Please fill: ${missing.join(", ")}`);
  //     return;
  //   }

  //   console.log("Generating course with config:", cfg);
  //   console.log("Final prompt:", manualPreview);

  //   if (onGenerate) {
  //     onGenerate({ topic: cfg.jobRole, description: manualPreview });
  //   }
  //   onOpenChange(false);
  // }


// const handleGenerateCourse = async () => {
//    const formData = new FormData();
//   if (!isTemplateSelected) {
//     alert("⚠️ Please select a template first!");
//     return;
//   }

//   const missing: string[] = [];
//   if (!cfg.department) missing.push("Department");
//   if (!cfg.jobRole) missing.push("Job Role");
  
//   // Only require Critical Work Function for templates that use it (t1 and t2)
//   if (!cfg.criticalWorkFunction && (activeTemplate === "t1" || activeTemplate === "t2")) {
//     missing.push("Critical Work Function");
//   }
  
//   // Only require Tasks for template t2
//   if ((cfg.tasks.length === 0 || !cfg.tasks[0]) && activeTemplate === "t2") {
//     missing.push("Task");
//   }
  
//   // Only require Skills for template t3
//   if ((cfg.skills.length === 0 || !cfg.skills[0]) && activeTemplate === "t3") {
//     missing.push("Skill");
//   }

//   if (missing.length) {
//     alert(`Please fill: ${missing.join(", ")}`);
//     return;
//   }

//   setLoading(true);
//   setError(null);

//   try {
//     // Build URL with all parameters as query string
//     // const baseParams = new URLSearchParams({
//     //   sub_institute_id: sessionData.sub_institute_id,
//     //   token: sessionData.token,
//     //   user_id: sessionData.user_id,
//     //   user_profile_name: sessionData.user_profile_name,
//     //   syear: sessionData.syear,
//     //   industry: sessionData.org_type,
//     //   department: cfg.department,
//     // });

//     // Add optional parameters
//     if (cfg.jobRole) formData.append("job_role", cfg.jobRole);
//     if (cfg.criticalWorkFunction) formData.append("critical_work_function", cfg.criticalWorkFunction);
    
//     // Only add task for t2 template
//     if (activeTemplate === "t2" && cfg.tasks.length > 0) {
//       formData.append("key_task", cfg.tasks[0]);
//     }
    
//     // Only add skill for t3 template
//     if (activeTemplate === "t3" && cfg.skills.length > 0) {
//       formData.append("skill", cfg.skills[0]);
//     }
    
//     // Add modality
//     const modality = [
//       cfg.modality.selfPaced && "Self-paced",
//       cfg.modality.instructorLed && "Instructor-led",
//     ].filter(Boolean).join(", ");
//     if (modality) formData.append("modality", modality);

//     // Add proficiency if shown (only for t3 template)
//     if (showProficiency && activeTemplate === "t3") {
//       formData.append("proficiency_target", cfg.proficiencyTarget.toString());
//     }

//     // Add the prompt as a parameter
//     formData.append("prompt", encodeURIComponent(manualPreview));

//     const apiUrl = `${sessionData.APP_URL}/AICourseGeneration?sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}&syear=${sessionData.syear}&industry=${sessionData.org_type}&department=${encodeURIComponent(cfg.department)}`;
   
//     console.log("Calling course generation API:", apiUrl);

//     const response = await fetch(apiUrl, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${sessionData.token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`API call failed: ${response.status} - ${errorText}`);
//     }

//     const result = await response.json();
//     console.log("Course generation successful:", result);

//     // Call the parent onGenerate callback with the result
//     if (onGenerate) {
//       onGenerate({ 
//         topic: cfg.jobRole, 
//         description: manualPreview
//       });
//     }

//     // Close the dialog
//     onOpenChange(false);

//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     setError(errorMessage);
//     console.error("Error generating course:", err);
//     alert(`Failed to generate course: ${errorMessage}`);
//   } finally {
//     setLoading(false);
//   }
// };

const handleGenerateCourse = async () => {
  if (!isTemplateSelected) {
    alert("⚠️ Please select a template first!");
    return;
  }

  const missing: string[] = [];
  if (!cfg.department) missing.push("Department");
  if (!cfg.jobRole) missing.push("Job Role");
  
  // // Only require Critical Work Function for templates that use it (t1 and t2)
  // if (!cfg.criticalWorkFunction && (activeTemplate === "t1" || activeTemplate === "t2")) {
  //   missing.push("Critical Work Function");
  // }
  
  // Only require Tasks for template t2
  if ((cfg.tasks.length === 0 || !cfg.tasks[0]) && activeTemplate === "t2") {
    missing.push("Task");
  }
  
  // // Only require Skills for template t3
  // if ((cfg.skills.length === 0 || !cfg.skills[0]) && activeTemplate === "t3") {
  //   missing.push("Skill");
  // }

  if (missing.length) {
    alert(`Please fill: ${missing.join(", ")}`);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Build all parameters as URLSearchParams for GET request
    const params = new URLSearchParams({
      sub_institute_id: sessionData.sub_institute_id,
      token: sessionData.token,
      user_id: sessionData.user_id,
      user_profile_name: sessionData.user_profile_name,
      syear: sessionData.syear,
      industry: sessionData.org_type,
      department: cfg.department,
      job_role: cfg.jobRole,
      prompt: manualPreview
    });

    // Add conditional parameters based on template type
    if (cfg.criticalWorkFunction) {
      params.append("critical_work_function", cfg.criticalWorkFunction);
    }
    
    // Only add task for t2 template
    if (activeTemplate === "t2" && cfg.tasks.length > 0) {
      params.append("key_task", cfg.tasks[0]);
    }
    
    // Only add skill for t3 template
    if (activeTemplate === "t3" && cfg.skills.length > 0) {
      params.append("skill", cfg.skills[0]);
    }
    
    // Add modality
    const modality = [
      cfg.modality.selfPaced && "Self-paced",
      cfg.modality.instructorLed && "Instructor-led",
    ].filter(Boolean).join(", ");
    if (modality) params.append("modality", modality);

    // Add proficiency if shown (only for t3 template)
    if (showProficiency && activeTemplate === "t3") {
      params.append("proficiency_target", cfg.proficiencyTarget.toString());
    }

    const apiUrl = `${sessionData.APP_URL}/AICourseGeneration?${params.toString()}`;
   
    console.log("Calling course generation API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionData.token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Course generation successful:", result);

    // Call the parent onGenerate callback with the result
    if (onGenerate) {
      onGenerate({ 
        topic: cfg.jobRole, 
        description: manualPreview
      });
    }

          alert("✅ Course generated successfully!");
    // Close the dialog
    onOpenChange(false);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    setError(errorMessage);
    console.error("Error generating course:", err);
    alert(`Failed to generate course: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};
  function addToken(field: "tasks" | "skills", value: string) {
    if (!isTemplateSelected) return;
    setCfg((prev) =>
      value && !prev[field].includes(value)
        ? { ...prev, [field]: [...prev[field], value] }
        : prev
    );
  }

  function removeToken(field: "tasks" | "skills", value: string) {
    if (!isTemplateSelected) return;
    setCfg((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== value),
    }));
  }

  // Fetch critical work functions when job role changes
  useEffect(() => {
    const fetchCriticalWorkFunctions = async () => {
      if (!cfg.jobRole || !sessionData?.APP_URL) {
        setCriticalWorkFunctions([]);
        return;
      }

      setLoadingCWF(true);
      setError(null);

      try {
        const response = await fetch(
          `${sessionData.APP_URL}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[jobrole]=${encodeURIComponent(cfg.jobRole)}&group_by=critical_work_function&order_by[direction]=desc`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch critical work functions');
        }

        const data = await response.json();
        setCriticalWorkFunctions(data);
        
        // Only reset critical work function if it's not from a template
        if (!activeTemplate) {
          setCfg(prev => ({ ...prev, criticalWorkFunction: '' }));
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
        console.error('Error fetching critical work functions:', err);
      } finally {
        setLoadingCWF(false);
      }
    };

    fetchCriticalWorkFunctions();
  }, [cfg.jobRole, sessionData, activeTemplate]);

  // Fetch tasks when job role OR critical work function changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!cfg.jobRole || !cfg.criticalWorkFunction || !sessionData?.APP_URL) {
        setAvailableTasks([]);
        return;
      }

      setLoadingTasks(true);
      setError(null);
      try {
        const response = await fetch(
          `${sessionData.APP_URL}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[jobrole]=${encodeURIComponent(cfg.jobRole)}&filters[critical_work_function]=${encodeURIComponent(cfg.criticalWorkFunction)}&group_by=task&order_by[direction]=desc`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setAvailableTasks(data);
        
        // Only reset tasks if they're not from a template
        if (!activeTemplate && cfg.tasks.length > 0) {
          setCfg(prev => ({ ...prev, tasks: [] }));
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
        console.error('Error fetching tasks:', err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [cfg.jobRole, cfg.criticalWorkFunction, sessionData, activeTemplate]);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!cfg.jobRole || !sessionData?.APP_URL) {
        setAvailableSkills([]);
        return;
      }

      setLoadingSkills(true);
      setError(null);

      try {
        const response = await fetch(
          `${sessionData.APP_URL}/table_data?table=s_user_skill_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[jobrole]=${encodeURIComponent(cfg.jobRole)}&group_by=skill&order_by[direction]=desc`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }

        const data = await response.json();
        setAvailableSkills(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
        console.error('Error fetching skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [cfg.jobRole, sessionData]);
  // Update the fetchSkills function to include skill_category
// useEffect(() => {
//   const fetchSkills = async () => {
//     if (!cfg.jobRole || !sessionData?.APP_URL) {
//       setAvailableSkills([]);
//       return;
//     }

//     setLoadingSkills(true);
//     setError(null);

//     try {
//       const response = await fetch(
//         `${sessionData.APP_URL}/table_data?table=s_user_skill_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[jobrole]=${encodeURIComponent(cfg.jobRole)}&group_by=skill,skill_category&order_by[direction]=desc`,
//         {
//           headers: {
//             Authorization: `Bearer ${sessionData.token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to fetch skills');
//       }

//       const data = await response.json();
//       setAvailableSkills(data);
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError(String(err));
//       }
//       console.error('Error fetching skills:', err);
//     } finally {
//       setLoadingSkills(false);
//     }
//   };

//   fetchSkills();
// }, [cfg.jobRole, sessionData]);

  const filteredTemplates = templates.filter((t) =>
    [t.title, t.jobRole, t.criticalWorkFunction, ...t.tasks, ...t.skills]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  // Render configuration content based on active section
  const renderConfigurationContent = () => {
    switch (configSection) {
      case "course-mapping":
        return (
           <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4">
          <fieldset className="space-y-4 config-content">
            <legend className="px-1 text-sm font-semibold flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-blue-600" />
              Core Course Mapping
            </legend>

            {/* Department Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4" />
                Department
              </label>
              <select
                value={cfg.department}
                onChange={(e) => setCfg({ ...cfg, department: e.target.value })}
                disabled={!isTemplateSelected || loadingDepartments}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isTemplateSelected ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.department}>
                    {dept.department}
                  </option>
                ))}
              </select>
              {loadingDepartments && <p className="mt-1 text-xs text-gray-500">Loading departments...</p>}
            </div>

            {/* Job Role Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4" />
                Job Role
              </label>
              <select
                value={cfg.jobRole}
                onChange={(e) => setCfg({ ...cfg, jobRole: e.target.value })}
                disabled={!isTemplateSelected || !cfg.department || loadingJobRoles || !enabledDropdowns.jobRole}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isTemplateSelected || !enabledDropdowns.jobRole ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              >
                <option value="">Select Job Role</option>
                {jobRoles.map((role) => (
                  <option key={role.id} value={role.jobrole}>
                    {role.jobrole}
                  </option>
                ))}
              </select>
              {loadingJobRoles && <p className="mt-1 text-xs text-gray-500">Loading job roles...</p>}
            </div>

            {/* Critical Work Function Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ListChecks className="h-4 w-4" />
                Critical Work Function
              </label>
              <select
                value={cfg.criticalWorkFunction}
                onChange={(e) => setCfg({ ...cfg, criticalWorkFunction: e.target.value })}
                disabled={!isTemplateSelected || !cfg.jobRole || loadingCWF || !enabledDropdowns.criticalWorkFunction}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isTemplateSelected || !enabledDropdowns.criticalWorkFunction ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              >
                <option value="">Select Critical Work Function</option>
                {criticalWorkFunctions.map((func) => (
                  <option key={func.id} value={func.critical_work_function}>
                    {func.critical_work_function}
                  </option>
                ))}
              </select>
              {loadingCWF && <p className="mt-1 text-xs text-gray-500">Loading critical work functions...</p>}
            </div>

            {/* Tasks Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                Tasks
              </label>
              <select
                value={cfg.tasks[0] || ""}
                onChange={(e) => {
                  setCfg({ ...cfg, tasks: [e.target.value] });
                }}
                disabled={!isTemplateSelected || !cfg.jobRole || !cfg.criticalWorkFunction || loadingTasks || !enabledDropdowns.tasks}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isTemplateSelected || !enabledDropdowns.tasks ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              >
                <option value="">-- Select Task --</option>
                {availableTasks.map((task: any) => (
                  <option key={task.id} value={task.task}>
                    {task.task}
                  </option>
                ))}
              </select>
              {loadingTasks && <p className="mt-1 text-xs text-gray-500">Loading tasks...</p>}
            </div>

            {/* Skills Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Target className="h-4 w-4" />
                Skills
              </label>
              <select
                value={cfg.skills[0] || ""}
                onChange={(e) => {
                  setCfg({ ...cfg, skills: [e.target.value] });
                }}
                disabled={!isTemplateSelected || !cfg.jobRole || loadingSkills || !enabledDropdowns.skills}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isTemplateSelected || !enabledDropdowns.skills ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              >
                <option value="">-- Select Skill --</option>
                {availableSkills.map((skillItem: any) => (
                  <option key={skillItem.id} value={skillItem.skill}>
                    {skillItem.skill}
                  </option>
                ))}
              </select>
              {loadingSkills && <p className="mt-1 text-xs text-gray-500">Loading skills...</p>}
            </div>
          </fieldset>
          </div>
        );

      case "course-parameters":
        return (
           <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4">
          <fieldset className="space-y-4 config-content">
            <legend className="px-1 text-sm font-semibold flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              Course Parameters
            </legend>

            {/* Proficiency - Conditionally rendered */}
            {showProficiency && (
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <BarChart3 className="h-4 w-4" />
                  Proficiency Target: {cfg.proficiencyTarget}/6
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={cfg.proficiencyTarget}
                  onChange={(e) =>
                    setCfg({ ...cfg, proficiencyTarget: Number(e.target.value) })
                  }
                  disabled={!isTemplateSelected}
                  className={`w-full accent-blue-600 transition-all duration-200 ${
                    !isTemplateSelected ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>
            )}

            {/* Modality */}
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="h-4 w-4" />
                Modality
              </label>
              <div className="grid grid-cols-1 gap-2">
                <Checkbox
                  label="Self-paced"
                  checked={cfg.modality.selfPaced}
                  onChange={(v) =>
                    setCfg({
                      ...cfg,
                      modality: { selfPaced: v, instructorLed: !v },
                    })
                  }
                  disabled={!isTemplateSelected}
                />
                <Checkbox
                  label="Instructor-led"
                  checked={cfg.modality.instructorLed}
                  onChange={(v) =>
                    setCfg({
                      ...cfg,
                      modality: { selfPaced: !v, instructorLed: v },
                    })
                  }
                  disabled={!isTemplateSelected}
                />
              </div>
            </div>
          </fieldset>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Build Course with AI
          </DialogTitle>
        </DialogHeader>

        {/* Directly show the CourseCreatorModule interface */}
        <div className="flex flex-col bg-slate-50 max-h-[70vh] overflow-auto">
          {/* Main 3-Panel Layout */}
          <div className="grid flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-3 max-h-[70vh] overflow-auto">
            {/* Left: Templates */}
            <aside className="flex flex-col rounded-2xl border bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-blue-600" />
                  Templates
                </h2>
              </div>
              <div className="p-3 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Search templates by role, function, task, skill…"
                    aria-label="Search templates"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-auto px-3 pb-3 scrollbar-hide">
                <div className="smooth-scrollbar px-3 pb-3 ">
                  {filteredTemplates.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                      No templates match. Adjust filters or clear search.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {filteredTemplates.map((t) => {
                        const displayFields = getTemplateDisplayFields(t);
                        const isActive = activeTemplate === t.id;
                        
                        return (
                          <li 
                            key={t.id} 
                            className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? "border-blue-500 bg-blue-50 shadow-sm" 
                                : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">{t.title}</div>
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                  {displayFields.map((field, index) => (
                                    <div key={index}>{field}</div>
                                  ))}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                            </div>
                            <button
                              onClick={() => applyTemplate(t)}
                              className={`mt-3 w-full rounded-lg border text-xs px-2 py-1 transition-all duration-200 ${
                                isActive
                                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                  : "border-blue-600 text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {isActive ? "✓ Active" : "Use Template"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </aside>

            {/* Middle: Configuration with Toggle Menu - FIXED SCROLLING */}
            <section className={`flex flex-col rounded-2xl border overflow-hidden ${
              !isTemplateSelected ? "bg-gray-50" : "bg-white"
            }`}>
              <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Configuration Options
                </h2>
                <button
                  onClick={() => {
                    if (!isTemplateSelected) return;
                    setCfg(DEFAULT_CONFIG);
                    setDiverged(false);
                    setEnabledDropdowns({
                      jobRole: false,
                      criticalWorkFunction: false,
                      tasks: false,
                      skills: false
                    });
                    setShowProficiency(false);
                    setConfigSection("course-mapping");
                    setActiveTemplate(null);
                    setIsTemplateSelected(false);
                    setPreview("No template selected. Please select a template to enable configuration.");
                    setManualPreview("No template selected. Please select a template to enable configuration.");
                  }}
                  disabled={!isTemplateSelected}
                  className={`text-sm flex items-center gap-1 transition-all duration-200 ${
                    !isTemplateSelected 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {/* Toggle Menu */}
              <ConfigurationToggle 
                activeSection={configSection} 
                onSectionChange={setConfigSection}
                disabled={!isTemplateSelected}
              />

              {/* Configuration Content with PROPER SCROLLING */}
              <div className="flex-1 flex-1 gap-4 xl:grid-cols-3 max-h-[70vh] overflow-auto px-1 py-3 scrollbar-hide">
                <div className="pb-1">
                  <div className="pb-4">
                    {renderConfigurationContent()}
                  </div>
                </div>
              </div>
            </section>

            {/* Right: Prompt Preview */}
            <section className={`flex flex-col rounded-2xl border overflow-hidden ${
              !isTemplateSelected ? "bg-gray-50" : "bg-white"
            }`}>
              <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Course Outline Preview
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={
                      `inline-flex items-center rounded-full px-2 py-1 transition-all duration-200 ${
                        !isTemplateSelected
                          ? "bg-gray-100 text-gray-500"
                          : diverged
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`
                    }
                  >
                    {!isTemplateSelected ? (
                      <>
                        <Settings className="h-3 w-3 mr-1" />
                        Disabled
                      </>
                    ) : diverged ? (
                      <>
                        <Settings className="h-3 w-3 mr-1" />
                        Edited • diverged
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Preview synced
                      </>
                    )}
                  </span>
                  {diverged && (
                    <button
                      onClick={handleResync}
                      disabled={!isTemplateSelected}
                      className={`rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 ${
                        !isTemplateSelected
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Resync
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!isTemplateSelected) return;
                      navigator.clipboard.writeText(manualPreview);
                    }}
                    disabled={!isTemplateSelected}
                    className={`rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 ${
                      !isTemplateSelected
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      if (!isTemplateSelected) return;
                      setManualPreview(preview);
                      setDiverged(false);
                    }}
                    disabled={!isTemplateSelected}
                    className={`rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 ${
                      !isTemplateSelected
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <textarea
                  value={manualPreview}
                  onChange={(e) => {
                    if (!isTemplateSelected) return;
                    setManualPreview(e.target.value);
                    setDiverged(true);
                  }}
                  disabled={!isTemplateSelected}
                  className={`h-full w-full resize-none rounded-lg border border-gray-300 p-3 font-mono text-sm leading-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 smooth-scrollbar ${
                    !isTemplateSelected ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-slate-50"
                  }`}
                  aria-label="Prompt editor"
                />
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="sticky bottom-0 border-t bg-white px-4 py-3 shrink-0">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="transition-all duration-200"
              >
                Cancel
              </Button>
              <button
  onClick={handleGenerateCourse}
  disabled={!isTemplateSelected || loading}
  className={`rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
    !isTemplateSelected || loading
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-blue-600 text-white hover:bg-blue-700"
  }`}
>
  {loading ? (
    <>
      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Play className="h-4 w-4" />
      Generate Course
    </>
  )}
</button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiCourseDialog;
