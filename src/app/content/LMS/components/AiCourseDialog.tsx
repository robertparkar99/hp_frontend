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
import { buildDynamicPrompt } from "./CoursePromptBuilder";

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
  SlidersHorizontal,
  Cpu,
  AlertCircle,
  Loader2
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

// AI Models data
const aiModels = [
  // 🔹 Tier 1: Best for structured instructional generation
  { id: "deepseek/deepseek-chat-v3.1", name: "DeepSeek Chat v3.1", contextWindow: 32768, price: "FREE", type: "structured-output", notes: "Low hallucination. Great for JSON output." },
  { id: "mistralai/mistral-small-3.2-24b-instruct", name: "Mistral Small 3.2", contextWindow: 32000, price: "FREE", type: "high-accuracy", notes: "Stable format and fast response." },
  { id: "tngtech/deepseek-r1t2-chimera", name: "DeepSeek R1T2 Chimera", contextWindow: 32768, price: "FREE", type: "balanced", notes: "Capable of complex instructional tasks." },
  { id: "z-ai/glm-4.5-air", name: "GLM-4.5-Air", contextWindow: 128000, price: "FREE", type: "general", notes: "Multilingual support, structured friendly." },
  { id: "meta-llama/llama-3.3-8b-instruct", name: "LLaMA 3.3", contextWindow: 8192, price: "FREE", type: "lightweight", notes: "Fast instruction-focused model." },

  // 🔸 Tier 2: Acceptable fallbacks
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", contextWindow: 8192, price: "FREE", type: "fallback", notes: "Low cost, mixed consistency." },
  { id: "meituan/longcat-flash-chat", name: "LongCat Flash Chat", contextWindow: 32000, price: "FREE", type: "fallback", notes: "May hallucinate formatting." },
  { id: "alibaba/tongyi-deepresearch-30b-a3b", name: "Tongyi DeepResearch", contextWindow: 32768, price: "FREE", type: "experimental", notes: "Unstable output." },
  { id: "nousresearch/deephermes-3-llama-3-8b-preview", name: "DeepHermes-3", contextWindow: 8192, price: "FREE", type: "preview", notes: "Emerging, inconsistent." },
  { id: "mistralai/mistral-nemo", name: "Mistral-NeMo", contextWindow: 8192, price: "FREE", type: "fallback", notes: "Use for small requests." },

  // 🟡 Tier 3: Optional exploration
  { id: "moonshotai/kimi-dev-72b", name: "Kimi Dev 72B", contextWindow: 128000, price: "FREE", type: "experimental", notes: "High context. Slower latency." },
  { id: "meta-llama/llama-3.2-3b-instruct", name: "LLaMA 3.2", contextWindow: 8192, price: "FREE", type: "lightweight", notes: "Fast but low quality." },
  { id: "nvidia/nemotron-nano-9b-v2", name: "Nemotron 9B", contextWindow: 8192, price: "FREE", type: "low-tier", notes: "Avoid unless fallback." },
  { id: "microsoft/mai-ds-r1", name: "MAI-DS R1", contextWindow: 8192, price: "FREE", type: "experimental", notes: "Experimental model." },
  { id: "qwen/qwen3-235b-a22b", name: "Qwen 3 235B", contextWindow: 131072, price: "FREE", type: "massive", notes: "Very high context." },
  { id: "qwen/qwen2.5-vl-72b-instruct", name: "Qwen VL 72B", contextWindow: 128000, price: "FREE", type: "text-only", notes: "Vision model. Use for text only." },
  { id: "meta-llama/llama-4-maverick", name: "LLaMA 4 Maverick", contextWindow: 8192, price: "FREE", type: "experimental", notes: "Unstable, early release." }
];

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
  proficiencyTarget: number;
  modality: { selfPaced: boolean; instructorLed: boolean; };
  aiModel: string;
};

const SEED_TEMPLATES: Template[] = [
  {
    id: "t1",
    title: "Job Role → Critical Work Function",
    jobRole: "Physiotherapist",
    criticalWorkFunction: "Manage risk and quality",
    tasks: ["Deliver training"],
    skills: ["Strategy Development"],
  },
  {
    id: "t2",
    title: "Job Role → Key Task",
    jobRole: "Physiotherapist",
    criticalWorkFunction: "",
    tasks: ["Deliver training"],
    skills: ["Strategy Development"],
  },
  {
    id: "t3",
    title: "Job Role → Skill",
    jobRole: "Physiotherapist",
    criticalWorkFunction: "",
    tasks: [""],
    skills: ["Strategy Development"],
  },
];

const DEFAULT_CONFIG: Config = {
  department: "",
  jobRole: "",
  criticalWorkFunction: "",
  tasks: [],
  skills: [],
  proficiencyTarget: 3,
  modality: { selfPaced: true, instructorLed: false },
  aiModel: "deepseek/deepseek-chat-v3.1",
};

// Enhanced prompt builder that creates a structured JSON object
function buildPrompt(cfg: Config, industry: string) {
  const modality = [
    cfg.modality.selfPaced && "Self-paced",
    cfg.modality.instructorLed && "Instructor-led",
  ]
    .filter(Boolean)
    .join(", ");

  const keyTask = cfg.tasks.length > 0 ? cfg.tasks[0] : " - ";
  const primarySkill = cfg.skills.length > 0 ? cfg.skills[0] : " - ";

  // Create a structured course prompt object
  const coursePromptObject = {
    instruction: "You are an expert L&D Manager. Design a complete 10-slide instructional training course that provides a guide to complete the Key Task successfully.",
    input_variables: {
      industry: industry || " - ",
      department: cfg.department || " - ",
      job_role: cfg.jobRole || " - ",
      critical_work_function: cfg.criticalWorkFunction || " - ",
      key_task: cfg.tasks || " - ",
      modality: modality || " - "
    },
    output_format: {
      total_slides: 10,
      slide_structure: "Each slide = 1 instructional unit",
      bullet_points_per_slide: "3–5 (under 40 words each)",
      language: "Instructional, practical, professional",
      style: "Formal, structured, competency-based",
      visuals: "No visuals or design styling",
      repetition: "No repetition — ensure uniqueness per slide",
      tone: modality.includes("Self-paced") ? "Direct, learner-led tone; emphasis on individual reflection" : "Include facilitator cues, group discussion prompts"
    },
    slide_structure: [
      {
        slide: 1,
        title: "Title Slide",
        content: [
          `Industry: ${industry || " - "}`,
          `Department: ${cfg.department || " - "}`,
          `Job role: ${cfg.jobRole || " - "}`,
          `Key Task: ${cfg.tasks || " - "}`,
          `Critical Work Function: ${cfg.criticalWorkFunction || " - "}`,
          `Modality: ${modality || " - "}`
        ]
      },
      {
        slide: 2,
        title: "Learning Objectives & Modality Instructions",
        content: [
          `Targeted outcomes for mastering this Key task: ${cfg.tasks || " - "}`,
          "Importance of monitoring and evaluation",
          modality.includes("Self-paced") ? "Tips for self-driven navigation and checks" : "Facilitator guidance and session flow overview"
        ]
      },
      {
        slide: 3,
        title: "Task Contextualization",
        content: [
          `Role of the Key Task: ${cfg.tasks} within the Critical Work Function: ${cfg.criticalWorkFunction || " - "}`,
          `Industry Context: ${industry || " - "}`,
          "Dependencies and prerequisites",
          "Stakeholders or systems involved"
        ]
      },
      {
        slide: 4,
        title: "Performance Expectations",
        content: [
          "Key success indicators",
          "Task standards and KPIs",
          "Timeliness and quality dimensions"
        ]
      },
      {
        slide: 5,
        title: "Monitoring Indicators",
        content: [
          "Observable checkpoints",
          "Red flags to watch for",
          "Sample field-level evidence"
        ]
      },
      {
        slide: 6,
        title: "Tools & Methods for Monitoring",
        content: [
          "Digital or manual tools",
          "Logging and feedback techniques",
          "Real-time vs retrospective tracking"
        ]
      },
      {
        slide: 7,
        title: "Data Capture & Reporting",
        content: [
          "How to document outcomes",
          "Structured logs or templates",
          "Communicating progress or deviations"
        ]
      },
      {
        slide: 8,
        title: "Common Pitfalls & Risk Management",
        content: [
          `Frequent errors during task: ${cfg.tasks || " - "} execution`,
          "Preventive and corrective strategies",
          "Escalation criteria"
        ]
      },
      {
        slide: 9,
        title: "Best Practice Walkthrough",
        content: [
          `Example scenario of successful task: ${cfg.tasks || " - "} monitoring`,
          "Highlighting decision points",
          modality.includes("Instructor-led") ? "Facilitator questions for discussion" : "Reflection prompts for learner"
        ]
      },
      {
        slide: 10,
        title: "Completion Criteria & Evaluation",
        content: [
          `Final checks for task: ${cfg.tasks || " - "} closure`,
          "Quality assurance checkpoints",
          modality.includes("Self-paced") ? "Self-assessment checklist" : "Facilitator sign-off checklist"
        ]
      }
    ],
    requirements: [
      "Ensure each slide has 3-5 bullet points with clear, actionable content under 40 words each",
      "Focus on practical successful task completion strategies",
      "Maintain professional instructional tone throughout"
    ]
  };

  return JSON.stringify(coursePromptObject, null, 2);
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
    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:bg-slate-50"
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
        className={`mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
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
            className={`min-h-[64px] flex-1 resize-y rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"
              }`}
            placeholder={disabled ? "Select a template first" : "Describe an outcome in measurable terms…"}
          />
          <button
            onClick={() => removeAt(i)}
            disabled={disabled}
            className={`mt-1 rounded-lg border border-gray-300 px-2 py-1 text-xs transition-colors ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:bg-red-50 hover:text-red-600"
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
        className={`flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm transition-colors w-full justify-center ${disabled
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
  console.log("Openrouter Key by AJ : ", process.env.OPENROUTER_API_KEY);
  if (template.jobRole && template.jobRole !== "") {
    fields.push(`Job Role: ${template.jobRole}`);
  }

  if (template.id === "t2" && template.tasks.length > 0 && template.tasks[0] !== "") {
    fields.push(`Tasks: ${template.tasks.join(", ")}`);
  }

  return fields;
}

// AI Model Dropdown Component
function AiModelDropdown({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = aiModels.find(model => model.id === value);

  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Cpu className="h-4 w-4" />
        AI Model
      </label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white hover:border-gray-400"
          }`}
      >
        <div className="flex justify-between items-center">
          <span className="truncate">
            {selectedModel ? selectedModel.name : "Select AI Model"}
          </span>
          <ChevronRight
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""
              }`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 space-y-1">
            {/* Tier 1 Models */}
            <div className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded">
              🟢 Tier 1 - Recommended
            </div>
            {aiModels.filter(model => model.type === "structured-output" || model.type === "high-accuracy" || model.type === "balanced" || model.type === "general" || model.type === "lightweight").map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${value === model.id
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
                  }`}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>{model.contextWindow.toLocaleString()} context</span>
                  <span>{model.price}</span>
                </div>
              </button>
            ))}

            {/* Tier 2 Models */}
            <div className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded mt-2">
              🟡 Tier 2 - Fallback Options
            </div>
            {aiModels.filter(model => model.type === "fallback" || model.type === "experimental" || model.type === "preview").map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${value === model.id
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
                  }`}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>{model.contextWindow.toLocaleString()} context</span>
                  <span>{model.price}</span>
                </div>
              </button>
            ))}

            {/* Tier 3 Models */}
            <div className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-50 rounded mt-2">
              🔴 Tier 3 - Experimental
            </div>
            {aiModels.filter(model => model.type === "low-tier" || model.type === "massive" || model.type === "text-only").map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${value === model.id
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
                  }`}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>{model.contextWindow.toLocaleString()} context</span>
                  <span>{model.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Model details tooltip */}
      {selectedModel && !disabled && (
        <div className="mt-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Context: {selectedModel.contextWindow.toLocaleString()} tokens</span>
            <span className={`${selectedModel.type === "structured-output" || selectedModel.type === "high-accuracy"
              ? "text-green-600"
              : selectedModel.type === "fallback"
                ? "text-amber-600"
                : "text-red-600"
              }`}>
              {selectedModel.price}
            </span>
          </div>
          <div className="text-gray-400 mt-1">{selectedModel.notes}</div>
        </div>
      )}
    </div>
  );
}

// Configuration Toggle Component
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
    <div className={`flex border-b rounded-t-lg mx-4 mt-2 ${disabled ? "bg-gray-100" : "bg-blue-50"
      }`}>
      <nav className="flex w-full rounded-md overflow-hidden">
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => !disabled && onSectionChange(item.id)}
            disabled={disabled}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors flex-1 justify-center ${disabled
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

// Model Information Display Component
function ModelInfoDisplay({ modelId }: { modelId: string }) {
  const model = aiModels.find(m => m.id === modelId);

  if (!model) return null;

  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-blue-900">{model.name}</h4>
          <div className="text-xs text-blue-700 mt-1 space-y-1">
            <div>Context: {model.contextWindow.toLocaleString()} tokens</div>
            <div>Type: {model.type}</div>
            <div>Price: {model.price}</div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${model.type === "structured-output" || model.type === "high-accuracy"
          ? "bg-green-100 text-green-800"
          : model.type === "fallback"
            ? "bg-amber-100 text-amber-800"
            : "bg-red-100 text-red-800"
          }`}>
          {model.type === "structured-output" || model.type === "high-accuracy" ? "Recommended" :
            model.type === "fallback" ? "Fallback" : "Experimental"}
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-2">{model.notes}</p>
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

// Error Display Component
function ErrorDisplay({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">Error</h4>
          <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Success Display Component  
function SuccessDisplay({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="rounded-lg bg-green-50 p-4 border border-green-200">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-green-800">Success</h4>
          <p className="text-sm text-green-700 mt-1">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-green-500 hover:text-green-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Loading Spinner Component
function LoadingSpinner({ size = "sm", text = "Loading..." }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <span>{text}</span>
    </div>
  );
}

// API Monitor Function
const monitorAPICall = async (url: string, options: any) => {
  console.group('🚀 API Call Debug');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', options.headers);
  console.log('Body:', options.body);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();

  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    const endTime = Date.now();

    console.group('📡 API Response Debug');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Duration:', endTime - startTime + 'ms');
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.groupEnd();

    return response;
  } catch (error) {
    const endTime = Date.now();
    console.group('❌ API Error Debug');
    console.log('Error:', error);
    console.log('Duration:', endTime - startTime + 'ms');
    console.groupEnd();
    throw error;
  }
};

// Main AiCourseDialog Component
const AiCourseDialog = ({ open, onOpenChange, onGenerate }: AiCourseDialogProps) => {
  const [templates] = React.useState<Template[]>(SEED_TEMPLATES);
  const [query, setQuery] = React.useState("");
  const [cfg, setCfg] = React.useState<Config>(DEFAULT_CONFIG);
  const [preview, setPreview] = React.useState("Select a template and click 'Generate Course Outline with AI' to create slides.");
  const [diverged, setDiverged] = React.useState(false);
  const [manualPreview, setManualPreview] = React.useState("Select a template and click 'Generate Course Outline with AI' to create slides.");
  const [loading, setLoading] = useState(false);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastUsedModel, setLastUsedModel] = useState<string>("");
  const [apiPayload, setApiPayload] = useState<string>("");

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

  // NEW: State to store all CWF tasks for template t1
  const [allCwfTasks, setAllCwfTasks] = useState<string[]>([]);

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

  // Function to check and auto-switch to course parameters for all templates
  const checkAndSwitchToParameters = (field: string, value: string) => {
    if (!isTemplateSelected || !activeTemplate) return;

    let shouldSwitch = false;

    if (activeTemplate === "t1") {
      // For t1 template: Department + Job Role + Critical Work Function
      shouldSwitch =
        Boolean(cfg.department) &&
        Boolean(cfg.jobRole) &&
        Boolean(value) && // This is the critical work function value
        field === "criticalWorkFunction";
    } else if (activeTemplate === "t2") {
      // For t2 template: Department + Job Role + Critical Work Function + Task
      shouldSwitch =
        Boolean(cfg.department) &&
        Boolean(cfg.jobRole) &&
        Boolean(cfg.criticalWorkFunction) &&
        Boolean(value) &&
        field === "tasks";
    } else if (activeTemplate === "t3") {
      // For t3 template: Department + Job Role + Skill
      shouldSwitch =
        Boolean(cfg.department) &&
        Boolean(cfg.jobRole) &&
        Boolean(value) &&
        field === "skills";
    }

    console.log(`Auto-switch check: Template=${activeTemplate}, Field=${field}, Value=${value}, ShouldSwitch=${shouldSwitch}`);

    if (shouldSwitch) {
      // Switch to course parameters after a small delay for better UX
      setTimeout(() => {
        setConfigSection("course-parameters");
        console.log(`Auto-switched to course parameters for template ${activeTemplate}`);
      }, 500);
    }
  };

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
        console.log("Critical Work Functions response:", data);

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

  // Fetch tasks when job role OR critical work function changes - UPDATED to store all CWF tasks
 // Add this useEffect to debug allCwfTasks state changes
useEffect(() => {
  console.log("🔄 allCwfTasks state changed:", allCwfTasks);
}, [allCwfTasks]);

// Update the task fetching useEffect
useEffect(() => {
  const fetchTasks = async () => {
    if (!cfg.jobRole || !cfg.criticalWorkFunction || !sessionData?.APP_URL) {
      setAvailableTasks([]);
      setAllCwfTasks([]);
      console.log("❌ fetchTasks: Missing required fields");
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

      // ✅ Extract all task names and store in allCwfTasks
      const taskNames = data.map((task: any) => task.task).filter((task: string) => task && task.trim() !== "");
      console.log("✅ Fetched tasks for allCwfTasks:", taskNames);
      setAllCwfTasks(taskNames);

      // Auto-refresh preview when tasks are loaded
      if (isTemplateSelected && activeTemplate === "t1" && taskNames.length > 0) {
        console.log("🔄 Auto-refreshing preview with new tasks");
        setTimeout(() => {
          const p = buildDynamicPrompt(cfg, industry, activeTemplate, taskNames);
          setPreview(p);
          setManualPreview(p);
        }, 100);
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

// Update handleResync function
// function handleResync() {
//   if (!isTemplateSelected) return;
  
//   console.log("🔄 handleResync - allCwfTasks:", allCwfTasks);
//   console.log("🔄 handleResync - activeTemplate:", activeTemplate);
  
//   // Small delay to ensure state is updated
//   setTimeout(() => {
//     const p = buildDynamicPrompt(cfg, industry, activeTemplate || undefined, allCwfTasks);
//     setPreview(p);
//     setManualPreview(p);
//     setDiverged(false);
//   }, 100);
// }

// Add this useEffect to auto-refresh preview when allCwfTasks changes
// Add this useEffect to auto-refresh preview when allCwfTasks changes
useEffect(() => {
  if (isTemplateSelected && activeTemplate === "t1" && allCwfTasks.length > 0) {
    console.log("🔄 Auto-refreshing preview with allCwfTasks:", allCwfTasks);
    console.log("🔄 Auto-refreshing preview - allCwfTasks length:", allCwfTasks.length);
    
    // Small delay to ensure state is properly updated
    setTimeout(() => {
      const p = buildDynamicPrompt(cfg, industry, activeTemplate, allCwfTasks);
      console.log("🔄 Generated preview with tasks:", p.includes("Key Tasks:") ? "YES" : "NO");
      setPreview(p);
      setManualPreview(p);
    }, 100);
  }
}, [allCwfTasks, isTemplateSelected, activeTemplate, cfg, industry]);

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

  // OpenRouter API Integration - UPDATED to use environment variable
  const handleGenerateCourseOutline = async () => {
    if (!isTemplateSelected) {
      setError("⚠️ Please select a template first!");
      return;
    }

    setOutlineLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedModel = aiModels.find(model => model.id === cfg.aiModel);
      if (!selectedModel) throw new Error("Selected AI model not found");

      // ✅ FIX: Use all CWF tasks for template t1, selected task for other templates
      let tasksToUse: string[];
      if (activeTemplate === "t1") {
        
        // For template t1, use all tasks from the selected CWF
        tasksToUse = allCwfTasks.length > 0 ? allCwfTasks : cfg.tasks;
        console.log("Using all CWF tasks for template t1:", tasksToUse);
      } else {
        // For other templates, use the selected task
        tasksToUse = cfg.tasks;
      }

      // Create a new config with the appropriate tasks
      const cfgWithTasks = {
        ...cfg,
        tasks: tasksToUse
      };

      console.log("🔧 Task Debug in Generation:", {
        activeTemplate,
        allCwfTasks: allCwfTasks,
        originalCfgTasks: cfg.tasks,
        finalTasks: cfgWithTasks.tasks
      });

      const response = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cfg: cfgWithTasks,
          industry, 
          aiModel: cfg.aiModel 
        }),
      });

      // ✅ Read response only once
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Course generation failed");
      }

      const generatedContent = data.content;
      if (!generatedContent) {
        throw new Error("No content generated by AI model");
      }

      console.log("✅ AI Course Outline Generated:", generatedContent);

      setManualPreview(generatedContent);
      setPreview(generatedContent);
      setDiverged(true);
      setLastUsedModel(selectedModel.name);

      // Call parent onGenerate callback with the updated config
      if (onGenerate) {
        onGenerate({
          topic: cfg.jobRole,
          description: generatedContent,
          apiResponse: {
            openRouterResponse: data,
            configuration: {
              template: activeTemplate,
              department: cfg.department,
              jobRole: cfg.jobRole,
              criticalWorkFunction: cfg.criticalWorkFunction,
              tasks: cfgWithTasks.tasks, // Use the appropriate tasks
              skills: cfg.skills,
              modality: cfg.modality,
              proficiencyTarget: cfg.proficiencyTarget,
              aiModel: {
                id: cfg.aiModel,
                name: selectedModel.name,
                contextWindow: selectedModel.contextWindow,
                price: selectedModel.price
              }
            },
            apiPayload: {
              model: cfg.aiModel,
              prompt: manualPreview,
              configuration: {
                department: cfg.department,
                jobRole: cfg.jobRole,
                criticalWorkFunction: cfg.criticalWorkFunction,
                tasks: cfgWithTasks.tasks, // Use the appropriate tasks
                skills: cfg.skills,
                modality: cfg.modality
              }
            }
          }
        });
      }

      setSuccess(`✅ Course outline generated successfully using ${selectedModel.name}!`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error generating course outline:", err);

      if (errorMessage.includes("API key not configured") || errorMessage.includes("401")) {
        setError("❌ Invalid API key. Please check your OpenRouter API key configuration.");
      } else if (errorMessage.includes("429")) {
        setError("⏳ Too many requests. Please try again later.");
      } else if (errorMessage.includes("402")) {
        setError("💳 Out of credits. Please add credits to your OpenRouter account.");
      } else if (errorMessage.includes("No content generated")) {
        setError("🤖 AI model didn't generate any content. Try again with a different model.");
      } else {
        setError("❌ Failed to generate course outline. Please try again.");
      }
    } finally {
      setOutlineLoading(false);
    }
  };

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
    // Set preview to empty instead of buildPrompt
    setPreview("Select a template and click 'Generate Course Outline with AI' to create slides.");
    setManualPreview("Select a template and click 'Generate Course Outline with AI' to create slides.");
    setLastUsedModel("");
    // Clear all CWF tasks when switching templates
    setAllCwfTasks([]);
  }

  function handleResync() {
    if (!isTemplateSelected) return;
    const p = buildDynamicPrompt(cfg, industry, activeTemplate || undefined);
    setPreview(p);
    setManualPreview(p);
    setDiverged(false);
  }

  const handleGenerateCourse = async () => {
    if (!isTemplateSelected) {
      setError("⚠️ Please select a template first!");
      return;
    }

    const missing: string[] = [];
    if (!cfg.department) missing.push("Department");
    if (!cfg.jobRole) missing.push("Job Role");

    if ((cfg.tasks.length === 0 || !cfg.tasks[0]) && activeTemplate === "t2") {
      missing.push("Task");
    }

    if (missing.length) {
      setError(`Please fill: ${missing.join(", ")}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ FIX: Use all CWF tasks for template t1, selected task for other templates
      let finalTasks: string[];
      if (activeTemplate === "t1") {
        // For template t1, use all tasks from the selected CWF
        finalTasks = allCwfTasks.length > 0 ? allCwfTasks : cfg.tasks;
        console.log("Using all CWF tasks for template t1 in course generation:", finalTasks);
      } else {
        // For other templates, use the selected task
        finalTasks = cfg.tasks;
      }

      const params = new URLSearchParams({
        sub_institute_id: sessionData.sub_institute_id,
        token: sessionData.token,
        user_id: sessionData.user_id,
        user_profile_name: sessionData.user_profile_name,
        syear: sessionData.syear,
        industry: sessionData.org_type,
        department: cfg.department,
        job_role: cfg.jobRole,
        prompt: manualPreview,
        ai_model: cfg.aiModel
      });

      // Add conditional parameters based on template type
      if (cfg.criticalWorkFunction) {
        params.append("critical_work_function", cfg.criticalWorkFunction);
      }

      // ✅ FIX: Add appropriate tasks based on template type
      if (activeTemplate === "t1" && finalTasks.length > 0) {
        // For t1, add all CWF tasks
        params.append("key_task", finalTasks.join(", "));
      } else if (activeTemplate === "t2" && finalTasks.length > 0) {
        // For t2, add selected task
        params.append("key_task", finalTasks[0]);
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
      console.log("Selected AI Model:", cfg.aiModel);
      console.log("Tasks being sent:", finalTasks); // Debug log

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

      setSuccess("✅ Course generated successfully!");
      // Close the dialog after a delay
      setTimeout(() => onOpenChange(false), 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Error generating course:", err);
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

  const filteredTemplates = templates.filter((t) =>
    [t.title, t.jobRole, t.criticalWorkFunction, ...t.tasks, ...t.skills]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  // Calculate completion progress for current template
  const getCompletionProgress = () => {
    if (!activeTemplate) return { completed: 0, total: 0, percentage: 0 };

    let totalFields = 0;
    let completedFields = 0;

    if (activeTemplate === "t2") {
      totalFields = 4; // Department, Job Role, Critical Work Function, Task
      completedFields = [
        cfg.department,
        cfg.jobRole,
        cfg.criticalWorkFunction,
        cfg.tasks[0]
      ].filter(Boolean).length;
    }

    return {
      completed: completedFields,
      total: totalFields,
      percentage: totalFields > 0 ? (completedFields / totalFields) * 100 : 0
    };
  };

  const progress = getCompletionProgress();

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
                {isTemplateSelected && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Fill all fields to continue
                  </span>
                )}
              </legend>

              {/* Department Dropdown */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4" />
                  Department
                </label>
                <select
                  value={cfg.department}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setCfg({ ...cfg, department: newValue });
                  }}
                  disabled={!isTemplateSelected || loadingDepartments}
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${!isTemplateSelected ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
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
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setCfg({ ...cfg, jobRole: newValue });
                  }}
                  disabled={!isTemplateSelected || !cfg.department || loadingJobRoles || !enabledDropdowns.jobRole}
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${!isTemplateSelected || !enabledDropdowns.jobRole ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
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
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setCfg({ ...cfg, criticalWorkFunction: newValue });
                    checkAndSwitchToParameters("criticalWorkFunction", newValue);
                  }}
                  disabled={!isTemplateSelected || !cfg.jobRole || loadingCWF || !enabledDropdowns.criticalWorkFunction}
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${!isTemplateSelected || !enabledDropdowns.criticalWorkFunction ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
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

              {/* Tasks Dropdown - Only for template t2 */}
              {activeTemplate === "t2" && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Tasks
                  </label>
                  <select
                    value={cfg.tasks[0] || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log("Selected task:", newValue); // Debug log
                      setCfg({ ...cfg, tasks: [newValue] });
                      checkAndSwitchToParameters("tasks", newValue);
                    }}
                    disabled={!isTemplateSelected || !cfg.jobRole || !cfg.criticalWorkFunction || loadingTasks || !enabledDropdowns.tasks}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${!isTemplateSelected || !enabledDropdowns.tasks ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
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
              )}

              {/* Skills Dropdown - Only for template t3 */}
              {activeTemplate === "t3" && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Target className="h-4 w-4" />
                    Skills
                  </label>
                  <select
                    value={cfg.skills[0] || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setCfg({ ...cfg, skills: [newValue] });
                      checkAndSwitchToParameters("skills", newValue);
                    }}
                    disabled={!isTemplateSelected || !cfg.jobRole || loadingSkills || !enabledDropdowns.skills}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${!isTemplateSelected || !enabledDropdowns.skills ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
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
              )}

              {/* Display all CWF tasks for template t1 */}
              {activeTemplate === "t1" && allCwfTasks.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    All Tasks for Selected Critical Work Function:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allCwfTasks.map((task, index) => (
                      <span 
                        key={index} 
                        className="inline-block bg-white px-2 py-1 rounded text-xs text-blue-700 border border-blue-300"
                      >
                        {task}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Total: {allCwfTasks.length} task(s) found - These will be used in course generation
                  </p>
                </div>
              )}
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
                    className={`w-full accent-blue-600 transition-all duration-200 ${!isTemplateSelected ? "opacity-60 cursor-not-allowed" : ""
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

              {/* AI Model Dropdown */}
              <div className="mt-4">
                <AiModelDropdown
                  value={cfg.aiModel}
                  onChange={(model) => setCfg({ ...cfg, aiModel: model })}
                  disabled={!isTemplateSelected}
                />
              </div>

              {/* Model Information Display */}
              <ModelInfoDisplay modelId={cfg.aiModel} />

              {/* Generate Course Outline Button with OpenRouter API */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleGenerateCourseOutline}
                  disabled={!isTemplateSelected || outlineLoading}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-semibold flex items-center gap-2 justify-center transition-all duration-200 ${!isTemplateSelected || outlineLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                    }`}
                >
                  {outlineLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating with {aiModels.find(m => m.id === cfg.aiModel)?.name}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Course Outline with AI
                      {cfg.aiModel && (
                        <span className="text-xs bg-green-500 px-2 py-1 rounded-full ml-2">
                          {aiModels.find(m => m.id === cfg.aiModel)?.name}
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Helper text */}
                <div className="text-xs text-gray-500 text-center mt-2 space-y-1">
                  <p>This will generate a 10-slide course outline using {aiModels.find(m => m.id === cfg.aiModel)?.name}</p>
                  <p className="text-green-600 font-medium">Uses OpenRouter API with selected model</p>
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

        {/* Status Messages */}
        {(error || success) && (
          <div className="px-6 py-2">
            {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}
            {success && <SuccessDisplay message={success} onDismiss={() => setSuccess(null)} />}
          </div>
        )}

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
                            className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer ${isActive
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
                              className={`mt-3 w-full rounded-lg border text-xs px-2 py-1 transition-all duration-200 ${isActive
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
            <section className={`flex flex-col rounded-2xl border overflow-hidden ${!isTemplateSelected ? "bg-gray-50" : "bg-white"
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
                    setPreview("Select a template and click 'Generate Course Outline with AI' to create slides.");
                    setManualPreview("Select a template and click 'Generate Course Outline with AI' to create slides.");
                    setLastUsedModel("");
                    setApiPayload("");
                    setAllCwfTasks([]); // Clear all CWF tasks
                  }}
                  disabled={!isTemplateSelected}
                  className={`text-sm flex items-center gap-1 transition-all duration-200 ${!isTemplateSelected
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

            {/* Right: Course Outline Preview - UPDATED */}
            <section className={`flex flex-col rounded-2xl border overflow-hidden ${!isTemplateSelected ? "bg-gray-50" : "bg-white"
              }`}>
              <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Course Outline Preview
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  {/* Action buttons */}
                  {diverged && (
                    <button
                      onClick={handleResync}
                      disabled={!isTemplateSelected || outlineLoading}
                      className={`rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 ${!isTemplateSelected || outlineLoading
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
                    disabled={!isTemplateSelected || outlineLoading}
                    className={`rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 ${!isTemplateSelected || outlineLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:bg-slate-50"
                      }`}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-hidden">
                <div className={`h-full w-full p-3 font-mono text-sm leading-6 overflow-auto smooth-scrollbar ${!isTemplateSelected ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-slate-50"
                  }`}>
                  {outlineLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Generating course outline with {aiModels.find(m => m.id === cfg.aiModel)?.name}...</p>
                        <p className="text-xs mt-1">This may take a few seconds</p>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={manualPreview}
                      onChange={(e) => {
                        if (!isTemplateSelected) return;
                        setManualPreview(e.target.value);
                        setDiverged(e.target.value !== preview);
                      }}
                      disabled={!isTemplateSelected || outlineLoading}
                      className="h-full w-full resize-none rounded-lg border border-gray-300 p-3 font-mono text-sm leading-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-transparent"
                      aria-label="Course outline editor"
                    />
                  )}
                </div>
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
                className={`rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${!isTemplateSelected || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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