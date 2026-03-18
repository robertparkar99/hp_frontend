"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  Settings,
  Eye,
  RotateCcw,
  ChevronRight,
  Sparkles,
  X,
  CheckCircle2,
  Cpu,
  AlertCircle,
  Loader2,
  Play
} from "lucide-react";

interface ConfigurationModelBehaviourProps {
  isOpen: boolean;
  onClose: () => void;
  jsonObject?: any;
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
  behaviours: string[];
  proficiencyTarget: number;
  proficiencyLevel: string;
  proficiencyDescriptor: string;
  proficiencyIndicators: string;
  description: string;
  modality: { selfPaced: boolean; instructorLed: boolean; };
  mappingType: string;
  mappingValue: string;
  mappingReason: string;
  slideCount: number;
  presentationStyle: string;
  language: string;
  aiModel: string;
};

const DEFAULT_CONFIG: Config = {
  department: "",
  jobRole: "",
  behaviours: [],
  proficiencyTarget: 3,
  proficiencyLevel: "",
  proficiencyDescriptor: "",
  proficiencyIndicators: "",
  description: "",
  modality: { selfPaced: true, instructorLed: false },
  mappingType: "",
  mappingValue: "",
  mappingReason: "",
  slideCount: 15,
  presentationStyle: "Modern",
  language: "English",
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

// Custom scrollbar styles
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

export default function ConfigurationModelBehaviour({ isOpen, onClose, jsonObject }: ConfigurationModelBehaviourProps) {
  // Log jsonObject when modal opens or jsonObject changes
  useEffect(() => {
    if (isOpen && jsonObject) {
      console.log("ConfigurationModelBehaviour Modal Data:", JSON.stringify(jsonObject, null, 2));
      console.log("Type: Behaviour Selection Only");
    }
  }, [isOpen, jsonObject]);

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
  const [isMounted, setIsMounted] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<{ exportUrl?: string; gammaUrl?: string; contentLink?: string } | null>(null);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [currentStandardId, setCurrentStandardId] = useState<number | null>(null);
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
  const [taskBehaviourId, setTaskBehaviourId] = useState<number | null>(null);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [mappingTypes, setMappingTypes] = useState<any[]>([]);
  const [mappingValues, setMappingValues] = useState<any[]>([]);
  const [mappingTypesLoading, setMappingTypesLoading] = useState(true);
  const [mappingValuesLoading, setMappingValuesLoading] = useState(true);
  const [selectedMappingTypeId, setSelectedMappingTypeId] = useState<number | null>(null);
  const [selectedMappingValueId, setSelectedMappingValueId] = useState<number | null>(null);
  const [proficiencyLevels, setProficiencyLevels] = useState<any[]>([]);
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [proficiencyLevelsLoading, setProficiencyLevelsLoading] = useState(true);
  const [descriptionsLoading, setDescriptionsLoading] = useState(true);
  const [generatedCourseId, setGeneratedCourseId] = useState<number | null>(null);
  const [subStdMapId, setSubStdMapId] = useState<number | null>(null);

  // Add smooth scrollbar styles to document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = scrollbarStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load sessionData from localStorage once
  useEffect(() => {
    if (!isMounted) return;
    
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        const { APP_URL, token, sub_institute_id, department_id, org_type, user_id } = parsed;
        setSessionData({
          url: APP_URL || '',
          token: token || '',
          subInstituteId: sub_institute_id || '',
          departmentId: department_id || '',
          orgType: org_type || '',
          userId: user_id || '',
        });
      }
    }
    setIsLoading(false);
  }, [isMounted]);

  // Fetch mapping types and values from API
  useEffect(() => {
    // Skip if not mounted or missing required data
    if (!isMounted || !sessionData.url || !sessionData.token) {
      setMappingTypesLoading(false);
      return;
    }
    
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
          const types = (data.data || data || []).map((type: any) => ({
            ...type,
            reason: type.reason || `The ${type.name} category encompasses various pedagogical approaches for effective learning and behaviour development.`
          }));
          setMappingTypes(types);
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
  }, [sessionData.url, sessionData.token, isMounted]);

  // Fetch mapping values when selectedMappingTypeId changes
  useEffect(() => {
    console.log('useEffect for mapping values triggered, selectedMappingTypeId:', selectedMappingTypeId);
    
    // Skip if not mounted or missing required data
    if (!isMounted || !selectedMappingTypeId || !sessionData.url || !sessionData.token) {
      setMappingValues([]);
      setMappingValuesLoading(false);
      return;
    }
    
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
          const values = (data.data || data || []).map((value: any) => ({
            ...value
          }));
          setMappingValues(values);
          setSelectedMappingValueId(null);
          setCfg(prev => ({ ...prev, mappingValue: "", mappingReason: "" }));
        } else {
          console.error('Failed to fetch mapping values:', response.statusText);
          setMappingValues([]);
        }
      } catch (error) {
        console.error('Error fetching mapping values:', error);
        setMappingValues([]);
      } finally {
        setMappingValuesLoading(false);
      }
    };
    fetchMappingValues();
  }, [selectedMappingTypeId, sessionData.url, sessionData.token, isMounted]);

  // Fetch mapping reasons when selectedMappingValueId changes
  useEffect(() => {
    if (selectedMappingValueId && cfg.mappingValue) {
      const selectedValue = mappingValues.find(v => v.id === selectedMappingValueId);
      if (selectedValue && selectedValue.reason) {
        setCfg(prev => ({ ...prev, mappingReason: selectedValue.reason }));
      }
    }
  }, [selectedMappingValueId, cfg.mappingValue, mappingValues]);

  // Fetch proficiency levels from API - Behaviour version
  useEffect(() => {
    // Skip if not mounted or missing required data
    if (!isMounted || !sessionData.url || !sessionData.token || !sessionData.subInstituteId) {
      setProficiencyLevelsLoading(false);
      return;
    }
    
    const fetchProficiencyLevels = async () => {
      try {
        setProficiencyLevelsLoading(true);
        const url = `${sessionData.url}/table_data?table=s_proficiency_behaviour&filters[sub_institute_id]=${sessionData.subInstituteId}`;
        console.log('Fetching behaviour proficiency levels from:', url);
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${sessionData.token}`
          }
        });
        console.log('Proficiency levels response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Proficiency levels data:', data);
          const levels = (data.data || data || []).map((level: any) => ({
            ...level,
            displayName: level.level || level.id,
            level: level.level || '',
            descriptor: level.descriptor || '',
            indicators: level.indicators || ''
          }));
          setProficiencyLevels(levels);
        } else {
          console.error('Failed to fetch proficiency levels:', response.statusText);
          setProficiencyLevels([]);
        }
      } catch (error) {
        console.error('Error fetching proficiency levels:', error);
        setProficiencyLevels([]);
      } finally {
        setProficiencyLevelsLoading(false);
      }
    };

    fetchProficiencyLevels();
  }, [sessionData.url, sessionData.token, sessionData.subInstituteId, isMounted]);

  // Fetch descriptions from API
  useEffect(() => {
    // Skip if not mounted or missing required data
    if (!isMounted || !sessionData.url || !sessionData.token) {
      setDescriptionsLoading(false);
      return;
    }
    
    const fetchDescriptions = async () => {
      try {
        setDescriptionsLoading(true);
        const url = `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[item_type]=description`;
        console.log('Fetching descriptions from:', url);
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${sessionData.token}`
          }
        });
        console.log('Descriptions response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Descriptions data:', data);
          const descs = (data.data || data || []).map((desc: any) => ({
            ...desc
          }));
          setDescriptions(descs);
        } else {
          console.error('Failed to fetch descriptions:', response.statusText);
          setDescriptions([]);
        }
      } catch (error) {
        console.error('Error fetching descriptions:', error);
        setDescriptions([]);
      } finally {
        setDescriptionsLoading(false);
      }
    };

    fetchDescriptions();
  }, [sessionData.url, sessionData.token, isMounted]);

  // Fetch modules when dropdown is shown
  useEffect(() => {
    // Skip if not mounted or missing required data
    if (!isMounted || !showDropdownModal || !currentStandardId || !currentSubjectId || !sessionData.url || !sessionData.token) {
      return;
    }
    
    const fetchModules = async () => {
      const chapterApiUrl = `${sessionData.url}/lms/chapter_master?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}&standard_id=${currentStandardId}&subject_id=${currentSubjectId}`;
      console.log('Fetching modules from:', chapterApiUrl);
      const response = await fetch(chapterApiUrl, {
        headers: {
          'Authorization': `Bearer ${sessionData.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const fetchedModules = data.data || [];
        console.log('Fetched modules:', fetchedModules);
        setModules(fetchedModules);
        if (fetchedModules.length > 0) {
          setCurrentChapterId(fetchedModules[0].id);
        }
      } else {
        console.error('Failed to fetch modules:', response.status);
        setModules([]);
      }
    };
    fetchModules();
  }, [showDropdownModal, currentStandardId, currentSubjectId, sessionData, isMounted]);

  // Ensure chapter_id is set when modules are available
  useEffect(() => {
    if (modules.length > 0 && !currentChapterId) {
      setCurrentChapterId(modules[0].id);
    }
  }, [modules, currentChapterId]);

  // OpenRouter API Integration - Behaviour Only Version
  const handleGenerateCourseOutline = async () => {
    // Check if session data is available
    if (!sessionData.url || !sessionData.token || !sessionData.subInstituteId) {
      setError("⚠️ Session data not loaded. Please refresh the page and try again.");
      console.error('Session data not available:', sessionData);
      return;
    }
    
    const createModule = async (standardId: number, subjectId: number, displayName: string) => {
      try {
        const chapterApiUrl = `${sessionData.url}/lms/chapter_master?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}&standard_id=${standardId}&subject_id=${subjectId}`;
        console.log('🔍 Fetching existing modules from:', chapterApiUrl);
        
        const chapterResponse = await fetch(chapterApiUrl, {
          headers: {
            'Authorization': `Bearer ${sessionData.token}`
          }
        });
        
        if (chapterResponse.ok) {
          const chapterData = await chapterResponse.json();
          const existingModules = chapterData.data || [];
          
          if (existingModules.length > 0) {
            console.log('✅ Existing modules found:', existingModules);
            setCurrentChapterId(existingModules[0].id);
            setModules(existingModules);
            return existingModules[0].id;
          }
          
          const nextModuleNumber = existingModules.length + 1;
          const chapterName = displayName || `Module ${nextModuleNumber}`;
          const chapterCode = `MOD${nextModuleNumber}`;
          const chapterDesc = `Module for ${displayName}`;
          
          const storeChapterApiUrl = `${sessionData.url}/lms/chapter_master/store`;
          console.log('📝 Creating new module at:', storeChapterApiUrl);
          
          const formData = new FormData();
          formData.append('type', 'API');
          formData.append('sub_institute_id', sessionData.subInstituteId.toString());
          formData.append('standard', standardId.toString());
          formData.append('subject', subjectId.toString());
          formData.append('chapter_name', chapterName);
          formData.append('chapter_code', chapterCode);
          formData.append('chapter_desc', chapterDesc);
          formData.append('availability', '1');
          formData.append('show_hide', '1');
          formData.append('sort_order', nextModuleNumber.toString());
          formData.append('syear', new Date().getFullYear().toString());
          formData.append('token', sessionData.token);
          
          console.log('📦 FormData being sent:', {
            type: 'API',
            sub_institute_id: sessionData.subInstituteId,
            standard: standardId,
            subject: subjectId,
            chapter_name: chapterName,
            chapter_code: chapterCode,
            chapter_desc: chapterDesc
          });

          const storeResponse = await fetch(storeChapterApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionData.token}`
            },
            body: formData
          });

          if (storeResponse.ok) {
            const responseData = await storeResponse.json();
            console.log('✅ Module created successfully:', responseData);
            
            if (responseData.data && responseData.data.id) {
              setCurrentChapterId(responseData.data.id);
              
              const refetchResponse = await fetch(chapterApiUrl, {
                headers: {
                  'Authorization': `Bearer ${sessionData.token}`
                }
              });
              if (refetchResponse.ok) {
                const refetchData = await refetchResponse.json();
                setModules(refetchData.data || []);
              }
              
              return responseData.data.id;
            }
          } else {
            const errorText = await storeResponse.text();
            console.error('❌ Failed to create module. Status:', storeResponse.status, 'Response:', errorText);
            throw new Error(`Failed to create module: ${storeResponse.status}`);
          }
        } else {
          console.error('❌ Failed to fetch chapters. Status:', chapterResponse.status);
          throw new Error('Failed to fetch existing modules');
        }
      } catch (error) {
        console.error('❌ Error in createModule:', error);
        throw error;
      }
    };
    
    if (!jsonObject) {
      setError("⚠️ No behaviour data available!");
      return;
    }

    setOutlineLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedModel = aiModels.find(model => model.id === cfg.aiModel);
      if (!selectedModel) throw new Error("Selected AI model not found");

      // Prepare jsonObject for outline generation - Behaviour only
      let outlineJsonObject = { ...jsonObject };
      if (jsonObject.selected_behaviour) {
        outlineJsonObject.critical_work_function = jsonObject.selected_behaviour;
      }

      // Call the outline API - Behaviour version
      const outlineResponse = await fetch("/api/generate-outline-behaviour", {
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
          mappingReason: cfg.mappingReason || undefined,
          proficiencyLevel: cfg.proficiencyLevel || undefined,
          proficiencyDescriptor: cfg.proficiencyDescriptor || undefined,
          proficiencyIndicators: cfg.proficiencyIndicators || undefined,
          description: cfg.proficiencyIndicators || undefined
        }),
      });

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

      // Fetch behaviour and sub_std_map data
      // Use the behaviour ID from the jsonObject directly since we already have it from viewData
      const behaviourId = jsonObject.behaviourId;
      const behaviourName = jsonObject.selected_behaviour || jsonObject.title || '';
      const departmentId = jsonObject.department_id || sessionData.departmentId;
      
      console.log('📡 Behaviour ID:', behaviourId);
      console.log('📡 Behaviour Name:', behaviourName);
      console.log('📡 Department ID:', departmentId);
      
      // Fetch sub_std_map data
      const subStdMapApiUrl = `${sessionData.url}/school_setup/sub_std_map?sub_institute_id=${sessionData.subInstituteId}&type=API`;
      
      console.log('📡 Fetching sub_std_map from:', subStdMapApiUrl);

      const subStdMapResponse = await fetch(subStdMapApiUrl, {
        headers: {
          'Authorization': `Bearer ${sessionData.token}`
        }
      });

      const subStdMapData = await subStdMapResponse.json();

      console.log('📊 SubStdMap data received:', subStdMapData);

      // Handle behaviour selection - create or find mapping
      if (subStdMapResponse.ok && subStdMapData.data && behaviourId && departmentId) {
        console.log('🏢 Department ID:', departmentId);
        console.log('🔍 Looking for behaviour ID:', behaviourId);
        
        // Check if mapping already exists
        const existingMapping = subStdMapData.data.find((item: any) => 
          item.subject_id == behaviourId && item.standard_id == departmentId
        );
        
        if (existingMapping) {
          console.log('✅ Existing mapping found:', existingMapping);
          setSubStdMapId(existingMapping.id);
          setCurrentSubjectId(existingMapping.id);
          setCurrentStandardId(Number(departmentId));
          
          // Create module using the existing mapping
          await createModule(Number(departmentId), existingMapping.id, behaviourName);
          setShowDropdownModal(true);
        } else {
          console.log('🆕 No existing mapping found, creating new mapping');
          const storeApiUrl = `${sessionData.url}/sub_std_map/store?type=API&sub_institute_id=${sessionData.subInstituteId}`;
          console.log('📝 Creating sub_std_map at:', storeApiUrl);
          
          const storeFormData = new FormData();
          storeFormData.append('type', 'API');
          storeFormData.append('sub_institute_id', sessionData.subInstituteId.toString());
          storeFormData.append('standard_id', departmentId.toString());
          storeFormData.append('subject_id', behaviourId.toString());
          storeFormData.append('jobrole', jsonObject.jobrole || '');
          storeFormData.append('display_name', behaviourName);
          storeFormData.append('allow_content', 'Yes');
          storeFormData.append('subject_category', 'Behaviour library');
          storeFormData.append('proficiency', cfg.proficiencyLevel || '');
          storeFormData.append('token', sessionData.token);

          const storeResponse = await fetch(storeApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionData.token}`
            },
            body: storeFormData
          });

          if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            console.log('✅ Store API called successfully for behaviour', storeData);

            const refreshResponse = await fetch(subStdMapApiUrl, {
              headers: {
                'Authorization': `Bearer ${sessionData.token}`
              }
            });

            const refreshData = await refreshResponse.json();

            const newMapping = refreshData.data.find((item: any) =>
              item.subject_id == behaviourId &&
              item.standard_id == departmentId
            );

            if (newMapping) {
              const newMappingId = newMapping.id;

              console.log("🆕 New mapping ID after refresh:", newMappingId);

              setSubStdMapId(newMappingId);
              setCurrentSubjectId(newMappingId);
              setCurrentStandardId(Number(departmentId));

              await createModule(Number(departmentId), newMappingId, behaviourName);

              setShowDropdownModal(true);
            }
          } else {
            const errorText = await storeResponse.text();
            console.error('❌ Error calling store API:', errorText);
            throw new Error('Failed to create subject mapping');
          }
        }
      } else {
        console.error('❌ Failed to fetch sub_std_map data or missing behaviour ID/department ID');
      }

      setSuccess(`✅ Course outline generated successfully using ${selectedModel.name}!`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("❌ Error generating course outline:", err);

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
    // Check if session data is available
    if (!sessionData.url || !sessionData.token || !sessionData.subInstituteId) {
      setError("⚠️ Session data not loaded. Please refresh the page and try again.");
      console.error('Session data not available:', sessionData);
      return;
    }

    if (!manualPreview || manualPreview === "Click 'Generate Course Outline with AI' to create slides.") {
      setError("⚠️ No course outline available! Please generate a course outline first.");
      return;
    }

    if (!currentChapterId && modules.length > 0) {
      setCurrentChapterId(modules[0].id);
    }

    setCourseLoading(true);
    setError(null);
    setSuccess(null);

    try {
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

      const generatedPdfUrl = data.data?.exportUrl || data.data?.gammaUrl || '';

      if (!currentChapterId && modules.length > 0) {
        setCurrentChapterId(modules[0].id);
      }

      if (!currentChapterId) {
        setError("⚠️ Chapter not found. Please select a module first.");
        setCourseLoading(false);
        return;
      }

      if (!currentSubjectId) {
        setError("⚠️ Subject ID not found. Please regenerate the course outline.");
        setCourseLoading(false);
        return;
      }

      const newCourseId = Date.now();
      setGeneratedCourseId(newCourseId);

      const storeContentApiUrl = `${sessionData.url}/lms/store_content_master`;
      const formData = new FormData();

      formData.append('type', 'API');
      formData.append('grade_id', '9');
      formData.append('standard_id', currentStandardId?.toString() || '');
      formData.append('subject_id', currentSubjectId.toString());
      formData.append('chapter_id', currentChapterId?.toString() || '');
      formData.append('title', jsonObject?.selected_behaviour || jsonObject?.jobrole || 'Behaviour Course');
      formData.append('description', manualPreview?.substring(0, 100) || 'Behaviour-based course content');
      formData.append('link', generatedPdfUrl);
      formData.append('contentType', 'link');
      formData.append('show_hide', '1');
      formData.append('content_category', 'PDF');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('syear', new Date().getFullYear().toString());
      console.log('Selected mapping_type ID:', selectedMappingTypeId, 'mapping_value ID:', selectedMappingValueId);
      formData.append('mapping_type[]', selectedMappingTypeId?.toString() || '');
      formData.append('mapping_value[]', selectedMappingValueId?.toString() || '');
      formData.append('proficiency_level', cfg.proficiencyLevel || '');

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
        id: newCourseId,
        subject_id: currentSubjectId,
        standard_id: currentStandardId?.toString() || '',
        title: jsonObject?.selected_behaviour ? `Behaviour: ${jsonObject.jobrole} - ${jsonObject.selected_behaviour}` : jsonObject?.jobrole || "Generated Course",
        description: manualPreview?.substring(0, 100) + "..." || "AI-generated course content",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
        contentType: "presentation",
        category: "AI Generated",
        difficulty: "intermediate",
        short_name: jsonObject?.selected_behaviour ? `Behaviour: ${jsonObject.selected_behaviour}` : "AI Course",
        subject_type: "Training",
        progress: 0,
        instructor: "AI Assistant",
        isNew: true,
        isMandatory: false,
        display_name: jsonObject?.selected_behaviour ? `Behaviour: ${jsonObject.selected_behaviour}` : jsonObject?.jobrole || "Generated Course",
        sort_order: "1",
        status: "1",
        subject_category: "AI Generated",
        external_url: data.data?.exportUrl || data.data?.gammaUrl,
        platform: "Gamma",
        jobrole: jsonObject?.jobrole || "N/A"
      };

      const existingCourses = JSON.parse(localStorage.getItem("generatedCourses") || "[]");
      existingCourses.unshift(generatedCourse);
      localStorage.setItem("generatedCourses", JSON.stringify(existingCourses));

      // Call the save-generated-course API
      const requestData = {
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        user_id: sessionData.userId,
        course_type: jsonObject?.jobrole || "Generated Course",
        input_fields: {
          jobrole: jsonObject?.jobrole || "",
          jobrole_description: jsonObject?.jobrole_description || "",
          selected_behaviour: jsonObject?.selected_behaviour || ""
        },
        configure_fields: {
          modality: cfg.modality.selfPaced ? "self-paced" : "instructor-led",
          "map-type": selectedMappingTypeId?.toString() || "",
          "map-value": selectedMappingValueId?.toString() || "",
          "AI model": cfg.aiModel || ""
        },
        outline: manualPreview ? [manualPreview] : [],
        title: jsonObject?.selected_behaviour ? `Behaviour: ${jsonObject.jobrole} - ${jsonObject.selected_behaviour}` : jsonObject?.jobrole || "Generated Course",
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

  // Show loading state while session data is being loaded
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl max-h-[90vh] p-0 overflow-auto rounded-xl smooth-scrollbar">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Configuration for Behaviour
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-500">Loading configuration...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-full md:max-w-6xl lg:max-w-7xl xl:max-w-7xl max-h-[90vh] p-0 overflow-auto rounded-xl smooth-scrollbar">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Configuration for Behaviour
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

                          {/* Proficiency Level and Description Dropdowns */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Proficiency Level
                              </label>
                              <select
                                value={cfg.proficiencyLevel}
                                onChange={(e) => {
                                  const selectedLevel = proficiencyLevels.find(level => (level.level || level.id) === e.target.value);
                                  setCfg({ 
                                    ...cfg, 
                                    proficiencyLevel: e.target.value,
                                    proficiencyDescriptor: selectedLevel?.descriptor || '',
                                    proficiencyIndicators: selectedLevel?.indicators || '',
                                    description: selectedLevel?.indicators || ''
                                  });
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={proficiencyLevelsLoading || proficiencyLevels.length === 0}
                              >
                                <option value="">Select Proficiency Level</option>
                                {proficiencyLevels.length > 0 ? (
                                  proficiencyLevels.map((level) => (
                                    <option key={level.id} value={level.level || level.id}>
                                      {level.level} - {level.descriptor}
                                    </option>
                                  ))
                                ) : (
                                  <option value="">No proficiency levels available</option>
                                )}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                Description
                              </label>
                              <textarea
                                value={cfg.description}
                                onChange={(e) => {
                                  setCfg({ ...cfg, description: e.target.value });
                                }}
                                rows={6}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                placeholder="Description will appear here based on selected proficiency level..."
                                readOnly
                              />
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
                              disabled={outlineLoading || !sessionData.url || !sessionData.token}
                              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold flex items-center gap-2 justify-center transition-all duration-200 ${outlineLoading || !sessionData.url || !sessionData.token
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

                {/* Module Dropdown */}
                {showDropdownModal && modules.length > 0 && (
                  <select
                    className="px-3 py-2 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={currentChapterId || ''}
                    onChange={(e) => setCurrentChapterId(Number(e.target.value))}
                  >
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
                onClick={onClose}
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
                disabled={!jsonObject || outlineLoading || courseLoading || !sessionData.url || !sessionData.token}
                className={`rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${!jsonObject || outlineLoading || courseLoading || !sessionData.url || !sessionData.token
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
