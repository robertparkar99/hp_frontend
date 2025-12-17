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
  Settings,
  Eye,
  Copy,
  RotateCcw,
  ChevronRight,
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  Cpu,
  AlertCircle,
  Loader2,
  Play
} from "lucide-react";
import loading from "@/components/utils/loading";

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonObject?: any;
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
  { id: "deepseek/deepseek-chat-v3.1", name: "DeepSeek Chat v3.1", contextWindow: 32768, type: "structured-output", notes: "Low hallucination. Great for JSON output." },
  { id: "mistralai/mistral-small-3.2-24b-instruct", name: "Mistral Small 3.2", contextWindow: 32000, type: "high-accuracy", notes: "Stable format and fast response." },
  { id: "tngtech/deepseek-r1t2-chimera", name: "DeepSeek R1T2 Chimera", contextWindow: 32768, type: "balanced", notes: "Capable of complex instructional tasks." },
  { id: "z-ai/glm-4.5-air", name: "GLM-4.5-Air", contextWindow: 128000, type: "general", notes: "Multilingual support, structured friendly." },
  { id: "meta-llama/llama-3.3-8b-instruct", name: "LLaMA 3.3", contextWindow: 8192, type: "lightweight", notes: "Fast instruction-focused model." },

  // 🔸 Tier 2: Acceptable fallbacks
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", contextWindow: 8192, type: "fallback", notes: "Low cost, mixed consistency." },
  { id: "meituan/longcat-flash-chat", name: "LongCat Flash Chat", contextWindow: 32000, type: "fallback", notes: "May hallucinate formatting." },
  { id: "alibaba/tongyi-deepresearch-30b-a3b", name: "Tongyi DeepResearch", contextWindow: 32768, type: "experimental", notes: "Unstable output." },
  { id: "nousresearch/deephermes-3-llama-3-8b-preview", name: "DeepHermes-3", contextWindow: 8192, type: "preview", notes: "Emerging, inconsistent." },
  { id: "mistralai/mistral-nemo", name: "Mistral-NeMo", contextWindow: 8192, type: "fallback", notes: "Use for small requests." },

  // 🟡 Tier 3: Optional exploration
  { id: "moonshotai/kimi-dev-72b", name: "Kimi Dev 72B", contextWindow: 128000, type: "experimental", notes: "High context. Slower latency." },
  { id: "meta-llama/llama-3.2-3b-instruct", name: "LLaMA 3.2", contextWindow: 8192, type: "lightweight", notes: "Fast but low quality." },
  { id: "nvidia/nemotron-nano-9b-v2", name: "Nemotron 9B", contextWindow: 8192, type: "low-tier", notes: "Avoid unless fallback." },
  { id: "microsoft/mai-ds-r1", name: "MAI-DS R1", contextWindow: 8192, type: "experimental", notes: "Experimental model." },
  { id: "qwen/qwen3-235b-a22b", name: "Qwen 3 235B", contextWindow: 131072, type: "massive", notes: "Very high context." },
  { id: "qwen/qwen2.5-vl-72b-instruct", name: "Qwen VL 72B", contextWindow: 128000, type: "text-only", notes: "Vision model. Use for text only." },
  { id: "meta-llama/llama-4-maverick", name: "LLaMA 4 Maverick", contextWindow: 8192, type: "experimental", notes: "Unstable, early release." }
];

type Config = {
  department: string;
  jobRole: string;
  criticalWorkFunction: string;
  tasks: string[];
  skills: string[];
  proficiencyTarget: number;
  modality: { selfPaced: boolean; instructorLed: boolean; };
  mappingType: string;
  mappingValue: string;
  slideCount: number;
  presentationStyle: string;
  language: string;
  // repetition: boolean;
  aiModel: string;
};

const DEFAULT_CONFIG: Config = {
  department: "",
  jobRole: "",
  criticalWorkFunction: "",
  tasks: [],
  skills: [],
  proficiencyTarget: 3,
  modality: { selfPaced: true, instructorLed: false },
  mappingType: "Direct",
  mappingValue: "Option1",
  slideCount: 15,
  presentationStyle: "Modern",
  language: "English",
  // repetition: false,
  aiModel: "deepseek/deepseek-chat-v3.1",
};


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
                  {/* <span>{model.price}</span> */}
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
                  {/* <span>{model.price}</span> */}
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
                  {/* <span>{model.price}</span> */}
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
              {/* {selectedModel.price} */}
            </span>
          </div>
          <div className="text-gray-400 mt-1">{selectedModel.notes}</div>
        </div>
      )}
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
            {/* <div>Price: {model.price}</div> */}
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

export default function ConfigurationModal({ isOpen, onClose, jsonObject }: ConfigurationModalProps) {
  // Detect the type of jsonObject
  const isCriticalWorkFunction = jsonObject && 'critical_work_function' in jsonObject;
  const isSkillSelection = jsonObject && 'selected_skill' in jsonObject;

  // Log jsonObject when modal opens or jsonObject changes
  useEffect(() => {
    if (isOpen && jsonObject) {
      console.log("Configuration Modal Data:", JSON.stringify(jsonObject, null, 2));
      if (isCriticalWorkFunction) {
        console.log("Type: Critical Work Function Selection");
      } else if (isSkillSelection) {
        console.log("Type: Skill Selection");
      }
    }
  }, [isOpen, jsonObject, isCriticalWorkFunction, isSkillSelection]);
  const [cfg, setCfg] = React.useState<Config>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'courseParams' | 'presentationConfig'>('presentationConfig');
  const [preview, setPreview] = React.useState("Click 'Generate Course Outline with AI' to create slides.");
  const [diverged, setDiverged] = React.useState(false);
  const [manualPreview, setManualPreview] = React.useState("Click 'Generate Course Outline with AI' to create slides.");
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success]);

  const [sessionData, setSessionData] = useState<any>(null);
  const [industry, setIndustry] = useState<string>("");
  const [generatedUrls, setGeneratedUrls] = useState<{ exportUrl?: string; gammaUrl?: string } | null>(null);

  // State for Create Template functionality

  // Template structure options

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

  // Handle tab switching based on repetition checkbox
  // useEffect(() => {
  //   if (!cfg.repetition && activeTab === 'courseParams') {
  //     setActiveTab('presentationConfig');
  //   }
  // }, [cfg.repetition, activeTab]);

  // Update handleResync function



  // OpenRouter API Integration - UPDATED to use jsonObject
  const handleGenerateCourseOutline = async () => {
    if (!jsonObject) {
      setError("⚠️ No job role data available!");
      return;
    }

    setOutlineLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedModel = aiModels.find(model => model.id === cfg.aiModel);
      if (!selectedModel) throw new Error("Selected AI model not found");

      const response = await fetch("/api/generate-outline-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonObject: {
            ...jsonObject,
            slideCount: cfg.slideCount
          },
          modality: cfg.modality,
          aiModel: cfg.aiModel,
          industry
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

  // Generate Course using Gamma API
  const handleGenerateCourse = async () => {
    if (!manualPreview || manualPreview === "Click 'Generate Course Outline with AI' to create slides.") {
      setError("⚠️ No course outline available! Please generate a course outline first.");
      return;
    }

    setCourseLoading(true);
    setError(null);
    setSuccess(null);

  

    try {
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText: manualPreview
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Course generation failed");
      }

      console.log("✅ Course generated successfully:", data);

      // Store the generated URLs
      setGeneratedUrls({
        exportUrl: data.data?.exportUrl,
        gammaUrl: data.data?.gammaUrl
      });

      // Save generated course to Course Library
      const generatedCourse = {
        id: Date.now(), // Use timestamp as unique ID
        subject_id: Date.now(),
        standard_id: Date.now(),
        title: jsonObject?.jobrole || "Generated Course",
        description: manualPreview?.substring(0, 100) + "..." || "AI-generated course content",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop", // Default course image
        contentType: "presentation",
        category: "AI Generated",
        difficulty: "intermediate",
        short_name: "AI Course",
        subject_type: "Training",
        progress: 0,
        instructor: "AI Assistant",
        isNew: true,
        isMandatory: false,
        display_name: jsonObject?.jobrole || "Generated Course",
        sort_order: "1",
        status: "1",
        subject_category: "AI Generated",
        external_url: data.data?.exportUrl || data.data?.gammaUrl,
        platform: "Gamma"
      };

      // Save to localStorage for Course Library
      const existingCourses = JSON.parse(localStorage.getItem("generatedCourses") || "[]");
      existingCourses.push(generatedCourse);
      localStorage.setItem("generatedCourses", JSON.stringify(existingCourses));

      setSuccess("✅ Course presentation generated successfully! Added to Course Library.");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error generating course:", err);

      setError("❌ Failed to generate course presentation. Please try again.");
    } finally {
      setCourseLoading(false);
    }
  };

  function handleResync() {
    setDiverged(false);
  }

  // Handle View Course button
  const handleViewCourse = () => {
    if (generatedUrls?.exportUrl) {
      window.open(generatedUrls.exportUrl, '_blank');
    } else if (generatedUrls?.gammaUrl) {
      window.open(generatedUrls.gammaUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl max-h-[90vh] p-0 overflow-auto rounded-xl smooth-scrollbar">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Configuration {isCriticalWorkFunction ? 'for Critical Work Function' : isSkillSelection ? 'for Skill' : ''}
          </DialogTitle>
        </DialogHeader>

        {/* Status Messages */}
        {(error || success) && (
          <div className="px-6 py-2">
            {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}
            {success && <SuccessDisplay message={success} onDismiss={() => setSuccess(null)} />}
          </div>
        )}

        {/* Middle & Right Panel Layout */}
        <div className="flex flex-col bg-slate-50 max-h-[70vh] overflow-auto">
          <div className="grid flex-1 gap-4 p-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-2 max-h-[70vh] overflow-auto">

            {/* Middle: Configuration with Toggle Menu */}
            <section className="flex flex-col rounded-2xl border overflow-hidden min-h-[200px] md:min-h-[300px] max-h-[70vh] bg-white">
              <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Configuration
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      setCfg(DEFAULT_CONFIG);
                      setActiveTab('presentationConfig');
                      setDiverged(false);
                      setPreview("Click 'Generate Course Outline with AI' to create slides.");
                      setManualPreview("Click 'Generate Course Outline with AI' to create slides.");
                    }}
                    className="rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Configuration Content */}
              <div className="flex-1 gap-4 grid overflow-auto px-1 py-3 scrollbar-hide">
                <div className="pb-1">
                  <div className="pb-4">
                    <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4">
                      {/* Toggle Menu */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setActiveTab('presentationConfig')}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'presentationConfig' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          Presentation Configuration
                        </button>
                        <button
                          onClick={() => setActiveTab('courseParams')}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'courseParams' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          Course Parameters
                        </button>
                      </div>

                      {activeTab === 'courseParams' &&(
                        <fieldset className="space-y-4">
                          <legend className="text-sm font-semibold text-gray-700 mb-4">
                            Course Parameters
                          </legend>

                          {/* Modality */}
                          <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Delivery Mode
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                              <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-gray-50">
                                <input
                                  type="radio"
                                  name="modality"
                                  checked={cfg.modality.selfPaced}
                                  onChange={() =>
                                    setCfg({
                                      ...cfg,
                                      modality: { selfPaced: true, instructorLed: false },
                                    })
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">Self-paced</span>
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-gray-50">
                                <input
                                  type="radio"
                                  name="modality"
                                  checked={cfg.modality.instructorLed}
                                  onChange={() =>
                                    setCfg({
                                      ...cfg,
                                      modality: { selfPaced: false, instructorLed: true },
                                    })
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">Instructor-led</span>
                              </label>
                            </div>
                          </div>

                          {/* Mapping Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Mapping Type
                              </label>
                              <select
                                value={cfg.mappingType}
                                onChange={(e) => setCfg({ ...cfg, mappingType: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="Direct">Direct</option>
                                <option value="Indirect">Indirect</option>
                                <option value="Custom">Custom</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Mapping Value
                              </label>
                              <select
                                value={cfg.mappingValue}
                                onChange={(e) => setCfg({ ...cfg, mappingValue: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="Option1">Option1</option>
                                <option value="Option2">Option2</option>
                                <option value="Option3">Option3</option>
                              </select>
                            </div>
                          </div>

                          {/* AI Model */}
                          <div className="mb-4">
                            <AiModelDropdown
                              value={cfg.aiModel}
                              onChange={(model) => setCfg({ ...cfg, aiModel: model })}
                            />
                          </div>

                          <ModelInfoDisplay modelId={cfg.aiModel} />

                          {/* Generate Button */}
                          <div className="pt-4 border-t border-gray-200">
                            <button
                              onClick={handleGenerateCourseOutline}
                              disabled={outlineLoading}
                              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold flex items-center gap-2 justify-center transition-all duration-200 ${outlineLoading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                                }`}
                            >
                              {outlineLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Generating with AI...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4" />
                                  Generate Course Outline with AI
                                </>
                              )}
                            </button>
                            <div className="text-xs text-gray-500 text-center mt-2">
                              <p>This will generate a {cfg.slideCount}-slide course outline</p>
                            </div>
                          </div>
                        </fieldset>
                      )}

                      {activeTab === 'presentationConfig' && (
                        <fieldset className="space-y-4">
                          <legend className="text-sm font-semibold text-gray-700 mb-4">
                            Presentation Configuration
                          </legend>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Slide Count
                              </label>
                              <input
                                type="number"
                                value={cfg.slideCount}
                                onChange={(e) => setCfg({ ...cfg, slideCount: parseInt(e.target.value) || 10 })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="15"
                              />
                            </div>
                            {/* <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Language
                              </label>
                              <select
                                value={cfg.language}
                                onChange={(e) => setCfg({ ...cfg, language: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Chinese">Chinese</option>
                              </select>
                            </div> */}
                            {/* <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                Style
                                <button
                                  onClick={() => {
                                    setCfg({
                                      ...cfg,
                                      presentationStyle: "Modern"
                                    });
                                  }}
                                  className="ml-2 p-1 text-yellow-500 hover:text-yellow-600"
                                  title="Auto Set Style"
                                >
                                  <Sparkles className="h-4 w-4" />
                                </button>
                              </label>
                              <select
                                value={cfg.presentationStyle}
                                onChange={(e) => setCfg({ ...cfg, presentationStyle: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="Modern">Modern</option>
                                <option value="Classic">Classic</option>
                                <option value="Minimal">Minimal</option>
                              </select>
                            </div> */}
                            {/* <div className="space-y-2 md:col-span-2">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={cfg.repetition}
                                  onChange={(e) => setCfg({ ...cfg, repetition: e.target.checked })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                No repetition of content across slides
                              </label>
                            </div> */}
                          </div>
                        </fieldset>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Right: Course Outline Preview */}
            <section className="flex flex-col rounded-2xl border overflow-hidden min-h-[200px] md:min-h-[300px] max-h-[70vh] bg-white">
              <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Preview
                </h2>
                {/* <div className="flex items-center gap-2 text-xs">
                  {diverged && (
                    <button
                      onClick={handleResync}
                      disabled={outlineLoading}
                      className={`rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 ${outlineLoading
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
                      navigator.clipboard.writeText(manualPreview);
                    }}
                    disabled={outlineLoading}
                    className={`rounded-md border px-2 py-1 flex items-center gap-1 transition-all duration-200 ${outlineLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:bg-slate-50"
                      }`}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div> */}
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full w-full p-3 font-mono text-sm leading-6 overflow-auto smooth-scrollbar bg-slate-50">
                  {outlineLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Generating course outline...</p>
                        <p className="text-xs mt-1">This may take a few seconds</p>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={manualPreview}
                      onChange={(e) => {
                        setManualPreview(e.target.value);
                        setDiverged(e.target.value !== preview);
                      }}
                      disabled={outlineLoading}
                      className="h-full w-full min-h-[150px] md:min-h-[250px] resize-none rounded-lg border border-gray-300 p-3 font-mono text-sm leading-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-transparent"
                      aria-label="Course outline editor"
                    />
                  )}
                </div>
              </div>
            </section>
          </div>

          <footer className="sticky bottom-0 border-t bg-white px-4 py-3 shrink-0">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                // onClick={() => onOpenChange(false)}
                className="transition-all duration-200"
              >
                Cancel
              </Button>
              {generatedUrls && (
                <button
                  onClick={handleViewCourse}
                  className="rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                  View Course
                </button>
              )}
              <button
                onClick={handleGenerateCourse}
                disabled={!jsonObject || outlineLoading || courseLoading}
                className={`rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${!jsonObject || outlineLoading || courseLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {courseLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Course...
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
}