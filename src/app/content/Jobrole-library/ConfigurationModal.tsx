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
  mappingReason: string;
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
  mappingType: "",
  mappingValue: "",
  mappingReason: "",
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

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    departmentId: '',
    orgType: '',
    userId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [generatedUrls, setGeneratedUrls] = useState<{ exportUrl?: string; gammaUrl?: string; contentLink?: string } | null>(null);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [currentStandardId, setCurrentStandardId] = useState<number | null>(null);
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [mappingTypes, setMappingTypes] = useState<any[]>([]);
  const [mappingValues, setMappingValues] = useState<any[]>([]);
  const [mappingReasons, setMappingReasons] = useState<any[]>([]);
  const [mappingTypesLoading, setMappingTypesLoading] = useState(true);
  const [mappingValuesLoading, setMappingValuesLoading] = useState(true);
  const [mappingReasonsLoading, setMappingReasonsLoading] = useState(true);
  const [selectedMappingTypeId, setSelectedMappingTypeId] = useState<number | null>(null);
  const [selectedMappingValueId, setSelectedMappingValueId] = useState<number | null>(null);

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
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, department_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        departmentId: department_id || '',
        orgType: org_type,
        userId: user_id,
      });
    }
    setIsLoading(false);
  }, []);

  // Fetch mapping types and values from API
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      // Fetch mapping types
      const fetchMappingTypes = async () => {
        try {
          setMappingTypesLoading(true);
          const url = `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[item_type]=content`;
          console.log('Fetching mapping types from:', url);
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${sessionData.token}`
            }
          });
          console.log('Mapping types response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('Mapping types data:', data);
            // Ensure each mapping type has a reason field
            const types = (data.data || data || []).map((type: any) => ({
              ...type,
              reason: type.reason || `The ${type.name} category encompasses various pedagogical approaches for effective learning and skill development.`
            }));
            setMappingTypes(types);
            // Auto-select the first type and fetch its values
            if (types.length > 0) {
              const firstType = types[0];
              const defaultValue = firstType.name || firstType.id;
              setCfg(prev => ({ ...prev, mappingType: defaultValue }));
              setSelectedMappingTypeId(firstType.id);
            }
          } else {
            console.error('Failed to fetch mapping types:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching mapping types:', error);
        } finally {
          setMappingTypesLoading(false);
        }
      };

      fetchMappingTypes();
      // Don't fetch values initially
    }
  }, [sessionData.url, sessionData.token]);

  // Fetch mapping values when selectedMappingTypeId changes
  useEffect(() => {
    console.log('useEffect for mapping values triggered, selectedMappingTypeId:', selectedMappingTypeId);
    if (selectedMappingTypeId && sessionData.url && sessionData.token) {
      const fetchMappingValues = async () => {
        try {
          setMappingValuesLoading(true);
          const url = `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${selectedMappingTypeId}`;
          console.log('Fetching mapping values from:', url);
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${sessionData.token}`
            }
          });
          console.log('Mapping values response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('Mapping values data:', data);
            // Use the reason field directly from API without fallback
            const values = (data.data || data || []).map((value: any) => ({
              ...value
            }));
            setMappingValues(values);
            // Reset reasons when values change
            setMappingReasons([]);
            setSelectedMappingValueId(null);
            setCfg(prev => ({ ...prev, mappingValue: "", mappingReason: "" }));
          } else {
            console.error('Failed to fetch mapping values:', response.statusText);
            setMappingValues([]);
            setMappingReasons([]);
          }
        } catch (error) {
          console.error('Error fetching mapping values:', error);
          setMappingValues([]);
          setMappingReasons([]);
        } finally {
          setMappingValuesLoading(false);
        }
      };
      fetchMappingValues();
    } else {
      setMappingValues([]);
      setMappingValuesLoading(false);
      setMappingReasons([]);
      setSelectedMappingValueId(null);
    }
  }, [selectedMappingTypeId, sessionData.url, sessionData.token]);

  // Fetch mapping reasons when selectedMappingValueId changes
  // Note: Reasons are now retrieved directly from mappingValues, not from a separate API call
  useEffect(() => {
    if (selectedMappingValueId && cfg.mappingValue) {
      const selectedValue = mappingValues.find(v => v.id === selectedMappingValueId);
      if (selectedValue && selectedValue.reason) {
        setCfg(prev => ({ ...prev, mappingReason: selectedValue.reason }));
      }
    }
  }, [selectedMappingValueId, cfg.mappingValue, mappingValues]);

  // Fetch modules when dropdown is shown
  useEffect(() => {
    if (showDropdownModal && currentStandardId && currentSubjectId) {
      const fetchModules = async () => {
        const chapterApiUrl = `${sessionData.url}/lms/chapter_master?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}&standard_id=${currentStandardId}&subject_id=${currentSubjectId}`;
        const response = await fetch(chapterApiUrl);
        if (response.ok) {
          const data = await response.json();
          const fetchedModules = data.data || [];
          if (fetchedModules.length === 0) {
            // Automatically create Module 1
            const storeChapterApiUrl = `${sessionData.url}/lms/chapter_master/store?type=API&sub_institute_id=${sessionData.subInstituteId}&standard=${currentStandardId}&subject=${currentSubjectId}`;
            const formData = new FormData();
            formData.append('type', 'API');
            formData.append('sub_institute_id', sessionData.subInstituteId.toString());
            // formData.append('grade', '9');
            formData.append('standard', currentStandardId.toString());
            formData.append('subject', currentSubjectId.toString());
            const chapterName = isCriticalWorkFunction ? jsonObject.critical_work_function : isSkillSelection ? (typeof jsonObject.selected_skill === 'object' ? jsonObject.selected_skill.skillName || jsonObject.selected_skill : jsonObject.selected_skill) : 'Module 1';
            formData.append('chapter_name', chapterName);
            formData.append('chapter_code', 'MOD1');
            formData.append('chapter_desc', 'Default module');
            formData.append('availability', '1');
            formData.append('show_hide', '1');
            formData.append('sort_order', '1');
            formData.append('syear', new Date().getFullYear().toString());
            formData.append('token', sessionData.token);

            const storeResponse = await fetch(storeChapterApiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${sessionData.token}`
              },
              body: formData
            });
            if (storeResponse.ok) {
              const responseData = await storeResponse.json();
              // Store the created chapter ID
              if (responseData.data && responseData.data.id) {
                setCurrentChapterId(responseData.data.id);
              }
              // Refetch modules to include the new one
              const refetchResponse = await fetch(chapterApiUrl);
              if (refetchResponse.ok) {
                const refetchData = await refetchResponse.json();
                setModules(refetchData.data || []);
              } else {
                setModules([]);
              }
            } else {
              setModules([]);
            }
          } else {
            setModules(fetchedModules);
            // Set the first module as current chapter ID
            if (fetchedModules.length > 0) {
              setCurrentChapterId(fetchedModules[0].id);
            }
          }
        } else {
          setModules([]);
        }
      };
      fetchModules();
    }
  }, [showDropdownModal, currentStandardId, currentSubjectId, sessionData]);

  // Ensure chapter_id is set when modules are available
  useEffect(() => {
    if (modules.length > 0 && !currentChapterId) {
      setCurrentChapterId(modules[0].id);
    }
  }, [modules, currentChapterId]);

  // Handle tab switching based on repetition checkbox
  // useEffect(() => {
  //   if (!cfg.repetition && activeTab === 'courseParams') {
  //     setActiveTab('presentationConfig');
  //   }
  // }, [cfg.repetition, activeTab]);

  // Update handleResync function



  // OpenRouter API Integration - UPDATED to use jsonObject
  const handleGenerateCourseOutline = async () => {
    const createModule = async (standardId: number, subjectId: number, displayName: string) => {
      // Fetch existing modules
      const chapterApiUrl = `${sessionData.url}/lms/chapter_master?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}&standard_id=${standardId}&subject_id=${subjectId}`;
      const chapterResponse = await fetch(chapterApiUrl);

      if (chapterResponse.ok) {
        const chapterData = await chapterResponse.json();
        const existingModules = chapterData.data || [];
        const nextModuleNumber = existingModules.length + 1;
        const chapterName = `Module ${nextModuleNumber}`;
        const chapterCode = `MOD${nextModuleNumber}`;
        const chapterDesc = `Module for ${displayName}`;

        // Create new module
        const storeChapterApiUrl = `${sessionData.url}/lms/chapter_master/store?type=API&sub_institute_id=${sessionData.subInstituteId}&standard_id=${standardId}&subject_id=${subjectId}`;
        const storeChapterResponse = await fetch(storeChapterApiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.token}`
          },
          body: JSON.stringify({
            type: 'API',
            sub_institute_id: sessionData.subInstituteId,
            grade: 9,
            standard: standardId,
            subject: subjectId,
            chapter_name: chapterName,
            chapter_code: chapterCode,
            chapter_desc: chapterDesc,
            availability: 1,
            show_hide: 1,
            sort_order: 1,
            syear: new Date().getFullYear(),
            token: sessionData.token
          })
        });

        if (storeChapterResponse.ok) {
          console.log('Module created successfully');
        } else {
          console.error('Failed to create module');
        }
      } else {
        console.error('Failed to fetch chapters');
      }
    };
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

      // Prepare jsonObject for outline generation
      let outlineJsonObject = { ...jsonObject };
      if (isSkillSelection) {
        outlineJsonObject.critical_work_function = jsonObject.selected_skill;
      }

      // Call the outline API
      const outlineResponse = await fetch("/api/generate-outline-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonObject: {
            ...outlineJsonObject,
            slideCount: cfg.slideCount
          },
          modality: cfg.modality,
          aiModel: cfg.aiModel,
          industry: sessionData.orgType,
          mappingType: selectedMappingTypeId,
          mappingValue: selectedMappingValueId,
          mappingTypeName: cfg.mappingType,
          mappingValueName: cfg.mappingValue,
          // Include reason if available
          mappingReason: cfg.mappingReason || undefined
        }),
      });

      // Process the outline response
      const outlineData = await outlineResponse.json();

      if (!outlineResponse.ok) {
        throw new Error(outlineData.error || "Course generation failed");
      }

      const generatedContent = outlineData.content;
      if (!generatedContent) {
        throw new Error("No content generated by AI model");
      }

      console.log("✅ AI Course Outline Generated:", generatedContent);

      setManualPreview(generatedContent);
      setPreview(generatedContent);
      setDiverged(true);

      // Fetch the task, skill, and sub_std_map data
      const taskApiUrl = `${sessionData.url}/jobrole_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&jobrole=${encodeURIComponent(jsonObject.jobrole)}&formType=tasks`;
      const skillApiUrl = `${sessionData.url}/jobrole_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&jobrole=${encodeURIComponent(jsonObject.jobrole)}&formType=skills`;
      const subStdMapApiUrl = `${sessionData.url}/school_setup/sub_std_map?sub_institute_id=${sessionData.subInstituteId}&type=API`;

      const [taskResponse, skillResponse, subStdMapResponse] = await Promise.all([
        fetch(taskApiUrl),
        fetch(skillApiUrl),
        fetch(subStdMapApiUrl, {
          headers: {
            'Authorization': `Bearer ${sessionData.token}`
          }
        })
      ]);

      const taskData = await taskResponse.json();
      const skillData = await skillResponse.json();
      const subStdMapData = await subStdMapResponse.json();

      if (skillResponse.ok && skillData.userskillData && skillData.userskillData.length > 0 && subStdMapResponse.ok && subStdMapData.data) {
        const departmentId = skillData.userskillData[0].user_jobrole.department_id;

        if (isCriticalWorkFunction && taskResponse.ok && taskData.usertaskData) {
          const criticalWorkFunctionName = jsonObject.critical_work_function || '';
          const matchingTask = taskData.usertaskData.find((task: any) => task.critical_work_function === criticalWorkFunctionName);

          if (matchingTask && departmentId) {
            const existingMapping = subStdMapData.data.find((item: any) => item.subject_id == matchingTask.id && item.standard_id == departmentId);
            if (existingMapping) {
              setCurrentStandardId(departmentId);
              setCurrentSubjectId(matchingTask.id);
              setShowDropdownModal(true);
            } else {
              // Call the store API for task
              const storeApiUrl = `${sessionData.url}/sub_std_map/store?type=API&sub_institute_id=${sessionData.subInstituteId}&standard_id=${departmentId}&subject_id=${matchingTask.id}&jobrole=${encodeURIComponent(jsonObject.jobrole)}&display_name=${encodeURIComponent(criticalWorkFunctionName)}`;

              const storeResponse = await fetch(storeApiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionData.token}`
                },
                body: JSON.stringify({
                  allow_content: 'Yes',
                  subject_category: 'Task'
                })
              });

              if (!storeResponse.ok) {
                const errorData = await storeResponse.json();
                console.error('Error calling store API:', errorData);
              } else {
                console.log('Store API called successfully for task');
                // Create module
                await createModule(departmentId, matchingTask.id, criticalWorkFunctionName);
                // Show dropdown with the new module
                setCurrentStandardId(departmentId);
                setCurrentSubjectId(matchingTask.id);
                setShowDropdownModal(true);
              }
            }
          } else {
            console.error('Matching task or department_id not found');
          }
        } else if (isSkillSelection) {
          const selectedSkill = jsonObject.selected_skill || '';
          const skillName = typeof selectedSkill === 'object' ? selectedSkill.skillName || selectedSkill : selectedSkill;
          const matchingSkill = skillData.userskillData.find((skill: any) => skill.skill === skillName) || skillData.userskillData[0];

          if (matchingSkill && departmentId) {
            const existingMapping = subStdMapData.data.find((item: any) => item.subject_id == matchingSkill.id && item.standard_id == departmentId);
            if (existingMapping) {
              setCurrentStandardId(departmentId);
              setCurrentSubjectId(matchingSkill.id);
              setShowDropdownModal(true);
            } else {
              // Call the store API for skill
              const storeApiUrl = `${sessionData.url}/sub_std_map/store?type=API&sub_institute_id=${sessionData.subInstituteId}&standard_id=${departmentId}&subject_id=${matchingSkill.id}&jobrole=${encodeURIComponent(jsonObject.jobrole)}&display_name=${encodeURIComponent(skillName)}`;

              const storeResponse = await fetch(storeApiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionData.token}`
                },
                body: JSON.stringify({
                  allow_content: 'Yes',
                  subject_category: 'Skill'
                })
              });

              if (!storeResponse.ok) {
                const errorData = await storeResponse.json();
                console.error('Error calling store API:', errorData);
              } else {
                console.log('Store API called successfully for skill');
                // Create module
                await createModule(departmentId, matchingSkill.id, skillName);
                // Show dropdown with the new module
                setCurrentStandardId(departmentId);
                setCurrentSubjectId(matchingSkill.id);
                setShowDropdownModal(true);
              }
            }
          } else {
            console.error('Matching skill or department_id not found');
          }
        }
      } else {
        console.error('Failed to fetch skill or sub_std_map data');
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

  // Generate Course using Gamma API
  const handleGenerateCourse = async () => {
    if (!manualPreview || manualPreview === "Click 'Generate Course Outline with AI' to create slides.") {
      setError("⚠️ No course outline available! Please generate a course outline first.");
      return;
    }

    // Ensure chapter_id is set before proceeding
    if (!currentChapterId && modules.length > 0) {
      setCurrentChapterId(modules[0].id);
    }

    setCourseLoading(true);
    setError(null);
    setSuccess(null);



    try {
      // Call Gamma API for course generation first
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText: manualPreview,
          slideCount: cfg.slideCount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Course generation failed");
      }

      console.log("✅ Course generated successfully:", data);

      // Store the generated URLs
      const generatedPdfUrl = data.data?.exportUrl || data.data?.gammaUrl || '';

      // Ensure chapter_id is set before proceeding
      if (!currentChapterId && modules.length > 0) {
        setCurrentChapterId(modules[0].id);
      }

      // Validate that chapter_id is set
      if (!currentChapterId) {
        setError("⚠️ Chapter not found. Please select a module first.");
        setCourseLoading(false);
        return;
      }

      // Call store_content_master API with the actual PDF link
      const storeContentApiUrl = `${sessionData.url}/lms/store_content_master`;
      const formData = new FormData();

      // Add form data parameters
      formData.append('type', 'API');
      formData.append('grade_id', '9');
      formData.append('standard_id', currentStandardId?.toString() || '');
      formData.append('subject_id', currentSubjectId?.toString() || '');
      formData.append('chapter_id', currentChapterId?.toString() || '');
      formData.append('title', jsonObject?.critical_work_function || jsonObject?.jobrole || 'Newton Law Video');
      formData.append('description', manualPreview?.substring(0, 100) || 'Explains motion laws');
      formData.append('link', generatedPdfUrl);
      formData.append('contentType', 'link');
      formData.append('show_hide', '1');
      formData.append('content_category', 'PDF');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('syear', new Date().getFullYear().toString());
      console.log('Selected mapping_type ID:', selectedMappingTypeId, 'mapping_value ID:', selectedMappingValueId);
      formData.append('mapping_type[]', selectedMappingTypeId?.toString() || '');
      formData.append('mapping_value[]', selectedMappingValueId?.toString() || '');

      const storeResponse = await fetch(storeContentApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: formData
      });

      if (!storeResponse.ok) {
        const errorData = await storeResponse.json();
        console.error('Error calling store_content_master API:', errorData);
      } else {
        const responseData = await storeResponse.json();
        console.log('store_content_master API called successfully');

        // Store the content link from the response
        if (responseData.data && responseData.data.link) {
          setGeneratedUrls({
            exportUrl: data.data?.exportUrl,
            gammaUrl: data.data?.gammaUrl,
            contentLink: responseData.data.link
          });
        } else {
          setGeneratedUrls({
            exportUrl: data.data?.exportUrl,
            gammaUrl: data.data?.gammaUrl,
            contentLink: generatedPdfUrl
          });
        }
      }

      // Save generated course to Course Library
      const generatedCourse = {
        id: Date.now(), // Use timestamp as unique ID
        subject_id: Date.now(),
        standard_id: Date.now(),
        title: isCriticalWorkFunction ? `CWF: ${jsonObject.jobrole} - ${jsonObject.critical_work_function}` : isSkillSelection ? `Skill: ${jsonObject.jobrole} - ${jsonObject.selected_skill}` : jsonObject?.jobrole || "Generated Course",
        description: manualPreview?.substring(0, 100) + "..." || "AI-generated course content",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop", // Default course image
        contentType: "presentation",
        category: "AI Generated",
        difficulty: "intermediate",
        short_name: isCriticalWorkFunction ? `CWF: ${jsonObject.critical_work_function}` : isSkillSelection ? `Skill: ${jsonObject.selected_skill}` : "AI Course",
        subject_type: "Training",
        progress: 0,
        instructor: "AI Assistant",
        isNew: true,
        isMandatory: false,
        display_name: isCriticalWorkFunction ? `CWF: ${jsonObject.critical_work_function}` : isSkillSelection ? `Skill: ${jsonObject.selected_skill}` : jsonObject?.jobrole || "Generated Course",
        sort_order: "1",
        status: "1",
        subject_category: "AI Generated",
        external_url: data.data?.exportUrl || data.data?.gammaUrl,
        platform: "Gamma",
        jobrole: jsonObject?.jobrole || "N/A"
      };

      // Save to localStorage for Course Library
      const existingCourses = JSON.parse(localStorage.getItem("generatedCourses") || "[]");
      // Unshift to add new course at the beginning of the array
      existingCourses.unshift(generatedCourse);
      localStorage.setItem("generatedCourses", JSON.stringify(existingCourses));

      // Call the save-generated-course API to store all course data
      const requestData = {
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        user_id: sessionData.userId,
        course_type: jsonObject?.jobrole || "Generated Course",
        input_fields: {
          jobrole: jsonObject?.jobrole || "",
          jobrole_description: jsonObject?.jobrole_description || "",
          critical_work_function: isCriticalWorkFunction ? {
            critical_work_function: jsonObject?.critical_work_function || "",
            key_task: jsonObject?.key_task || {}
          } : {}
        },
        configure_fields: {
          modality: cfg.modality.selfPaced ? "self-paced" : "instructor-led",
          "map-type": selectedMappingTypeId?.toString() || "",
          "map-value": selectedMappingValueId?.toString() || "",
          "AI model": cfg.aiModel || ""
        },
        outline: manualPreview ? [manualPreview] : [],
        title: isCriticalWorkFunction ? `CWF: ${jsonObject.jobrole} - ${jsonObject.critical_work_function}` : isSkillSelection ? `Skill: ${jsonObject.jobrole} - ${jsonObject.selected_skill}` : jsonObject?.jobrole || "Generated Course",
        description: manualPreview?.substring(0, 200) || "AI-generated course content",
        export_url: data.data?.exportUrl || "",
        presentation_platform: "Gamma",
        course_pdf: data.data?.exportUrl || "",
        status: "Incompleted"
      };

      console.log('📡 Saving course to backend...');
      console.log('🔗 API URL:', `${sessionData.url}/api/save-generated-course?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`);
      console.log('📋 Request Data:', JSON.stringify(requestData, null, 2));

      const saveCourseResponse = await fetch(`${sessionData.url}/api/save-generated-course?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!saveCourseResponse.ok) {
        const errorData = await saveCourseResponse.json();
        console.error("❌ Error saving generated course:", errorData);
      } else {
        console.log("✅ Course saved successfully to backend");
        const responseData = await saveCourseResponse.json();
        console.log("📥 Response:", responseData);
      }

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
    if (generatedUrls?.contentLink) {
      window.open(generatedUrls.contentLink, '_blank');
    } else if (generatedUrls?.exportUrl) {
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
                      setSelectedMappingTypeId(null);
                      setSelectedMappingValueId(null);
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

                      {activeTab === 'courseParams' && (
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
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Mapping Type
                              </label>
                              <select
                                value={cfg.mappingType}
                                onChange={(e) => {
                                  const selectedValue = e.target.value;
                                  console.log('Selected mapping type value:', selectedValue);
                                  const selectedType = mappingTypes.find(type => type.name === selectedValue || String(type.id) === selectedValue);
                                  console.log('Found selected type:', selectedType);
                                  const typeId = selectedType ? selectedType.id : null;
                                  console.log('Setting selectedMappingTypeId to:', typeId);
                                  setSelectedMappingTypeId(typeId);
                                  setCfg({ ...cfg, mappingType: selectedValue, mappingValue: "", mappingReason: "" });
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={mappingTypesLoading || mappingTypes.length === 0}
                              >
                                {mappingTypes.length > 0 ? (
                                  mappingTypes.map((type) => (
                                    <option key={type.id} value={type.name || type.id}>
                                      {type.name || type.id}
                                    </option>
                                  ))
                                ) : (
                                  <option value="">No mapping types available</option>
                                )}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Mapping Value
                              </label>
                              <select
                                value={cfg.mappingValue}
                                onChange={(e) => {
                                  const selectedValue = e.target.value;

                                  const selectedValueObj = mappingValues.find(
                                    value => value.name === selectedValue || String(value.id) === selectedValue
                                  );

                                  setSelectedMappingValueId(selectedValueObj ? selectedValueObj.id : null);
                                  setCfg({ ...cfg, mappingValue: selectedValue, mappingReason: "" });
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm 
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={mappingValuesLoading || mappingValues.length === 0}
                              >
                                {/* ✅ Placeholder */}
                                <option value="" disabled>
                                  Select Mapping Value
                                </option>

                                {mappingValues.map((value) => (
                                  <option key={value.id} value={value.name || value.id}>
                                    {value.name || value.id}
                                  </option>
                                ))}
                              </select>

                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Reason
                              </label>

                              <textarea
                                value={
                                  cfg.mappingType
                                    ? mappingTypes.find(
                                      t => t.name === cfg.mappingType || String(t.id) === cfg.mappingType
                                    )?.reason || ""
                                    : ""
                                }
                                readOnly
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm bg-gray-50 
             max-h-28 overflow-y-auto whitespace-pre-line focus:outline-none"
                                placeholder="Reason will appear here based on selected mapping type..."
                              />
                            </div>

                          </div>

                          {/* Mapping Type Reason Display */}
                          {/* {cfg.mappingType && mappingTypes.find(t => t.name === cfg.mappingType)?.reason && (
  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium text-green-900">
          Why {cfg.mappingType}?
        </h4>
        <p className="text-xs text-green-600 mt-2">
          {mappingTypes.find(t => t.name === cfg.mappingType)?.reason}
        </p>
      </div>
      <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
        Category Explanation
      </div>
    </div>
  </div>
)} */}

                          {/* AI Model */}
                          <div className="mb-4">
                            <AiModelDropdown
                              value={cfg.aiModel}
                              onChange={(model) => setCfg({ ...cfg, aiModel: model })}
                            />
                          </div>

                          <ModelInfoDisplay modelId={cfg.aiModel} />

                          {/* Mapping Reason Display */}
                          {cfg.mappingValue && mappingValues.find(v => v.name === cfg.mappingValue)?.reason && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-blue-900">Why {cfg.mappingValue}?</h4>
                                  <p className="text-xs text-blue-600 mt-2">
                                    {mappingValues.find(v => v.name === cfg.mappingValue)?.reason}
                                  </p>
                                </div>
                                <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Pedagogical Approach
                                </div>
                              </div>
                            </div>
                          )}

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
            <section className="flex flex-col rounded-2xl border overflow-hidden min-h-[200px] md:min-h-[300px] max-h-[70vh] bg-white relative">
              <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Preview
                </h2>


                {/* ✅ Module Dropdown – RIGHT SIDE */}
                {showDropdownModal && (
                  <select
                    className="px-3 py-2 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={
                      modules.length === 1
                        ? modules[0].id           // ✅ auto-show module name
                        : currentChapterId ?? ""  // ✅ placeholder for multiple modules
                    }
                    onChange={(e) => setCurrentChapterId(Number(e.target.value))}
                  >
                    {/* Show placeholder ONLY if multiple modules */}
                    {modules.length > 1 && (
                      <option value="" disabled>
                        Select Module
                      </option>
                    )}

                    {modules.map((module: any) => (
                      <option key={module.id} value={module.id}>
                        {module.chapter_name}
                      </option>
                    ))}
                  </select>
                )}


              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-hidden relative">
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
