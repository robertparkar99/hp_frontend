//
"use client"
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Users, Database, Loader2, ThumbsUp, ThumbsDown, X, MessageSquare, Maximize2, Minimize2, Trash2, Mic, MicOff, ChevronDown, FileText, Target, Wrench, BookOpen, Zap, Heart, Smile, CheckCircle, Save, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { submitFeedback } from "@/lib1/feedback-service";
import SkillGapReport from "@/components/users/SkillGapReport";
import { v4 as uuidv4 } from 'uuid';

// Question suggestions for different LMS modules (based on URL path)
const moduleSuggestions: Record<string, string[]> = {
  'course': [
    "How do I create a new course?",
    "What are the best practices for course design?",
    "How can I track Employee progress?",
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

// Get module key from current URL path
const getModuleFromURL = (): string | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('/lms') || path.includes('/course') || path.includes('courses')) return 'course';
  if (path.includes('/assessment') || path.includes('/quiz')) return 'assessment';
  if (path.includes('/my-learning') || path.includes('/mylearning')) return 'learning';
  if (path.includes('/question')) return 'question-bank';
  
  return null;
};


interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  conversationId?: string;
  timestamp: Date;
  feedback?: {
    rating: 1 | -1;
    text?: string;
  };
  metadata?: {
    sql?: string;
    tablesUsed?: string[];
    insights?: string;
    canEscalate?: boolean;
    intent?: string;
    action?: string;
    missingFields?: string[];
    entities?: {
      industry?: string;
      jobRole?: string;
      department?: string;
      departmentId?: number | null;
    };
    // Skill Gap Analysis metadata
    selectionOptions?: Array<{ 
      id: number; 
      name: string; 
      expectedProficiency?: number;
      category?: string;
      subCategory?: string;
      description?: string;
      proficiencyLevel?: number;
    }>;
    stepLabel?: string;
    currentStep?: 'industry' | 'department' | 'jobRole' | 'tasks' | 'skills' | 'rating_prompt' | 'skill_rating' | 'complete';
    nextStep?: string;
    showRatingPrompt?: boolean; // Flag to show rating prompt inline with skills
    // Job role info for API calls
    jobRole?: string;
    jobRoleId?: number | null;
    // Skill Gap Report data
    skillGapReportData?: {
      avgUserRating: number;
      avgExpectedProficiency: number;
      overallSkillIndex: number;
      skillGap: number;
      skillGapPercentage: number;
      skillGapCategory: string;
      skillGapEmoji: string;
      performanceLabel: string;
      topPrioritySkills: Array<{ name: string; rated: number; expected: number; gap: number }>;
      totalSkills: number;
    };
    // CWFKT (Critical Work Functions & Key Tasks) data
    cwfktData?: Array<{ id: number; function: string; tasks: string[] }>;
    // Generated Profile data for display
    generatedProfile?: any;
    // Structured competency data from LLM (Job Role Competency)
    competencyData?: {
      cwf_items?: Array<{ critical_work_function: string; key_tasks: string[] }>;
      skills?: Array<{ title: string; description?: string; category: string; sub_category: string; level: number }>;
      knowledge?: Array<{ title: string; description?: string; category: string; sub_category: string; level: number }>;
      ability?: Array<{ title: string; description?: string; category: string; sub_category: string; level: number }>;
      attitude?: Array<{ title: string; description?: string; category: string; sub_category: string; level: number }>;
      behavior?: Array<{ title: string; description?: string; category: string; sub_category: string; level: number }>;
      department?: string;
      description?: string;
    };
    courseRecommendations?: Array<{
      courseName: string;
      courseId: string | number;
      courseDescription?: string;
      courseLink?: string;
      reasonForRecommendation?: string;
      createdBy?: string;
      similarUsers?: string[];
    }>;
  };
}

function CourseRecommendationCards({
  courses
}: {
  courses: Array<{
    courseName: string;
    courseId: string | number;
    createdBy?: string;
    similarUsers?: string[];
  }>;
}) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
      {courses.map((course) => (
        <div
          key={course.courseId}
          className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-slate-50 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold leading-6 text-gray-900">
                {course.courseName}
              </h4>
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                  <span>
                    <span className="font-medium text-gray-700">Created By:</span>{' '}
                    {course.createdBy || 'N/A'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                  <span>
                    <span className="font-medium text-gray-700">Similar Users:</span>{' '}
                    {course.similarUsers?.length ? course.similarUsers.join(', ') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ChatbotCopilotProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  userId?: string;
  apiEndpoint?: string;

}

export default function ChatbotCopilot({
  position = 'bottom-right',
  apiEndpoint = '/api/chat',
  userId,
}: ChatbotCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I am Conversational AI, your assistant to help you with your queries. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>();
  const [conversationId, setConversationId] = useState<string>();
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{ messageId: string; rating: 1 | -1 } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const originalInputRef = useRef<string>(''); // specific for keeping track of text before voice started

  // State for contextual suggestions (LMS)
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  // Voice to text logic
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition. Please try Chrome.');
      return;
    }

    // @ts-ignore - SpeechRecognition is not standard in all browsers yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // "More accurate and perfect" settings
    recognition.continuous = true; // Keep listening even if user pauses
    recognition.interimResults = true; // Show results in real-time
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      originalInputRef.current = input; // Store current text so we append to it
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';

      // Combine all results (both final and interim)
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }

      // Update state with: what we had before + what we just heard
      // We use the Ref to ensure smooth appending without duplication
      const prefix = originalInputRef.current;
      const spacing = prefix && !prefix.endsWith(' ') ? ' ' : '';
      setInput(prefix + spacing + currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // NOTE: If you want it to restart automatically (always listening), put recognition.start() here.
      // But for a chatbot input, "click to speak" is usually better UX than "always on".
    };

    recognition.start();
  };

  // Phase 3: Genkit Form State
  const [formData, setFormData] = useState<{
    industry: string;
    department: string;
    jobRole: string;
    description: string;
  }>({
    industry: '',
    department: '',
    jobRole: '',
    description: ''
  });
  const [pendingFormMessageId, setPendingFormMessageId] = useState<string | null>(null);
const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    departmentId: '',
    orgType: '',
    userId: '',
  });

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

  // Phase 4: Skill Gap Analysis Flow State
  // Data flow:
  // - industry: User selected industry (from industries list)
  // - department: User selected department (from departments list)
  // - jobRole: User selected job role name (from job roles list)
  // - jobRoleId: User selected job role ID (from job roles API - see src/app/api/get-job-roles/route.ts)
  // - options: Array of options for current step (industries/departments/job roles/skills)
  // - skillRatings: User's ratings for each skill (keyed by skill name)
  const [skillGapFlow, setSkillGapFlow] = useState<{
    active: boolean;
    currentStep: 'industry' | 'department' | 'jobRole' | 'tasks' | 'skills' | 'rating_prompt' | 'skill_rating' | 'complete' | null;
    industry: string;
    department: string;
    departmentId: number | null; // Department ID from departments API
    jobRole: string;         // Job role name (e.g., "Content Strategist")
    jobRoleId: number | null; // Job role ID from get-job-roles API (e.g., 3172)
    options: Array<{ 
      id: number; 
      name: string; 
      expectedProficiency?: number;
      proficiencyLevel?: number;
      category?: string;
      subCategory?: string;
      description?: string;
    }>;
    selectedValue: string;
    skillRatings: Record<string, number>; // User's ratings for each skill
    ratingsSubmitted: boolean; // Track if ratings have been submitted
    expandedSkill: string | null; // Track which skill is expanded for details
  }>({
    active: false,
    currentStep: null,
    industry: '',
    department: '',
    departmentId: null,
    jobRole: '',
    jobRoleId: null,
    options: [],
    selectedValue: '',
    skillRatings: {},
    ratingsSubmitted: false,
    expandedSkill: null
  });

  // Phase 5: Job Description Form State (moved from CWFKTInput to preserve data across re-renders)
  const [jdFormData, setJdFormData] = useState<{
    selectedDepartment: string;
    selectedDepartmentId: number | null;
    jobRoleText: string;
    cwfList: Array<{id: number; function: string; tasks: string}>;
    generatedProfile: any;
    stepsCompleted: {
      department: boolean;
      jobrole: boolean;
      cwfkt: boolean;
    };
    saveSuccess: boolean;
  }>({
    selectedDepartment: '',
    selectedDepartmentId: null,
    jobRoleText: '',
    cwfList: [],
    generatedProfile: null,
    stepsCompleted: {
      department: false,
      jobrole: false,
      cwfkt: false
    },
    saveSuccess: false
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleOpenChatbot = (e: any) => {
      // Calculate origin relative to the panel (responsive width, aligned right)
      if (e.detail && typeof window !== 'undefined') {
        // Get the panel width based on screen size
        let panelWidth = 420; // default xl width
        if (window.innerWidth < 640) {
          panelWidth = 280;
        } else if (window.innerWidth < 768) {
          panelWidth = 320;
        } else if (window.innerWidth < 1024) {
          panelWidth = 360;
        } else if (window.innerWidth < 1280) {
          panelWidth = 400;
        }
        
        const panelTop = 64;
        // fixed: right-0 aligns to clientWidth (excluding scrollbar), not innerWidth
        const panelLeft = document.documentElement.clientWidth - panelWidth;

        setOrigin({
          x: e.detail.x - panelLeft + 7, // Adjusted offset for perfect center
          y: e.detail.y - panelTop
        });
      }
      setIsOpen(prev => !prev);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);

    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
    };
  }, []);
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Detect module and set contextual suggestions when chatbot opens
  useEffect(() => {
    const moduleKey = getModuleFromURL();
    if (moduleKey && moduleSuggestions[moduleKey]) {
      setCurrentModule(moduleKey);
      setContextualSuggestions(moduleSuggestions[moduleKey]);
    } else {
      setCurrentModule(null);
      setContextualSuggestions([]);
    }
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const handleFeedback = async (messageId: string, rating: 1 | -1) => {
    setFeedbackMessage(messageId);
    setFeedbackState({ messageId, rating });
    try {
      const feedback = await submitFeedback(messageId, conversationId!, rating);
      if (!feedback) {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Phase 3: Form handling functions
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (messageId: string) => {
    setIsLoading(true);
    setPendingFormMessageId(messageId);
    console.log('Form Data:', formData);

    // Get user session data from localStorage
    let userId: string | null = null;
    let subInstituteId: string | null = null;
    
    if (typeof window !== 'undefined') {
      try {
        const sessionData = localStorage.getItem('userData');
        console.log('[ChatbotCopilot] handleFormSubmit - sessionData from localStorage:', sessionData);
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          console.log('[ChatbotCopilot] handleFormSubmit - parsed session data:', parsed);
          userId = parsed.user_id || null;
          subInstituteId = parsed.sub_institute_id || null;
          console.log('[ChatbotCopilot] handleFormSubmit - userId:', userId, 'subInstituteId:', subInstituteId);
        }
      } catch (e) {
        console.error('[ChatbotCopilot] handleFormSubmit - Error reading session data from localStorage:', e);
      }
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `Generate competency profile for ${formData.jobRole} in ${formData.department} department of ${formData.industry} industry with skills, knowledge, and abilities.`,
          sessionId,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          formData, // Pass form data to backend
          userId,
          subInstituteId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: data.id || uuidv4(),
        type: 'bot',
        content: data.answer || 'I couldn\'t process that request.',
        timestamp: new Date(),
        conversationId: data.conversationId,
        metadata: {
          sql: data.sql,
          tablesUsed: data.tables_used,
          insights: data.insights,
          canEscalate: data.canEscalate,
          action: data.action,
          missingFields: data.missingFields,
          entities: data.entities,
          // Skill Gap Analysis fields
          selectionOptions: data.selectionOptions,
          stepLabel: data.stepLabel,
          currentStep: data.currentStep,
          nextStep: data.nextStep,
          // Job Role Competency - Structured JSON Data
          competencyData: data.competencyData,
          courseRecommendations: data.courseRecommendations
        }
      };

      setConversationId(data.conversationId);
      setMessages(prev => [...prev, botMessage]);
      console.log('formData', formData);
      if (formData.jobRole !== '') {
        // Reset form
        setFormData({
          industry: '',
          department: '',
          jobRole: '',
          description: ''
        });
      }
      setPendingFormMessageId(null);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
        metadata: {
          canEscalate: true
        }
      };
      setMessages(prev => [...prev, errorMessage]);
      setPendingFormMessageId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSkip = () => {
    setFormData({
      industry: '',
      department: '',
      jobRole: '',
      description: ''
    });
    setPendingFormMessageId(null);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Get user session data from localStorage
    let userId: string | null = null;
    let subInstituteId: string | null = null;
    
    if (typeof window !== 'undefined') {
      try {
        const sessionData = localStorage.getItem('userData');
        console.log('[ChatbotCopilot] handleSend - sessionData from localStorage:', sessionData);
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          console.log('[ChatbotCopilot] handleSend - parsed session data:', parsed);
          userId = parsed.user_id || null;
          subInstituteId = parsed.sub_institute_id || null;
          console.log('[ChatbotCopilot] handleSend - userId:', userId, 'subInstituteId:', subInstituteId);
        }
      } catch (e) {
        console.error('[ChatbotCopilot] handleSend - Error reading session data from localStorage:', e);
      }
    }

    const userInput = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check if user sent the job role prompt message - if so, show job role input instead of API call
    if (userInput.match(/^You selected .+\. Please enter the job role for this department\.$/)) {
      console.log('[ChatbotCopilot] User acknowledged job role prompt - showing input field');
      
      // Extract department name from the message
      const deptMatch = userInput.match(/^You selected (.+)\. Please enter the job role for this department\.$/);
      const selectedDept = deptMatch ? deptMatch[1] : '';
      
      // Show the job role input field directly in the chat
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Enter the job role for the ${selectedDept} department:`,
        timestamp: new Date(),
        metadata: {
          currentStep: 'jobRole',
          nextStep: 'jobRole',
          action: 'SHOW_JOBROLE_INPUT'
        }
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      return;
    }

    // Check if user typed "yes" or "proceed" to generate skill gap report
    const normalizedInput = userInput.toLowerCase();
    if (normalizedInput === 'yes' || normalizedInput === 'proceed') {
      console.log('[ChatbotCopilot] User wants to generate skill gap report');
      
      try {
        // Get skill data from localStorage first (for previously stored data)
        let skillData: any = null;
        
        if (typeof window !== 'undefined') {
          const storedData = localStorage.getItem('skillGapRatings');
          if (storedData) {
            skillData = JSON.parse(storedData);
            console.log('[ChatbotCopilot] Found skill data in localStorage:', skillData);
          }
        }
        
        // Fallback to skillGapFlow state if no localStorage data
        if (!skillData && skillGapFlow.options.length > 0 && Object.keys(skillGapFlow.skillRatings).length > 0) {
          skillData = {
            jobRole: skillGapFlow.jobRole,
            jobRoleId: skillGapFlow.jobRoleId,
            industry: skillGapFlow.industry,
            department: skillGapFlow.department,
            skills: skillGapFlow.options.map((opt: any) => ({
              id: opt.id,
              name: opt.name,
              expectedProficiency: opt.expectedProficiency || 3,
              userRating: skillGapFlow.skillRatings[opt.name] || 0
            }))
          };
        }
        
        if (!skillData || !skillData.skills || skillData.skills.length === 0) {
          throw new Error('No skill data available');
        }
        
        // Calculate skill gap metrics
        const skills = skillData.skills;
        const totalSkills = skills.length;
        
        // Calculate average user rating
        const totalUserRating = skills.reduce((sum: number, s: any) => sum + (s.userRating || 0), 0);
        const avgUserRating = totalSkills > 0 ? totalUserRating / totalSkills : 0;
        
        // Calculate average expected proficiency (scale 1-6)
        const totalExpectedProficiency = skills.reduce((sum: number, s: any) => sum + (s.expectedProficiency || 3), 0);
        const avgExpectedProficiency = totalSkills > 0 ? totalExpectedProficiency / totalSkills : 3;
        
        // Overall Skill Index: (Employee Avg / Expected Avg) × 100
        // Using average expected proficiency as the denominator (dynamic, not static)
        const overallSkillIndex = avgExpectedProficiency > 0 ? (avgUserRating / avgExpectedProficiency) * 100 : 0;
        
        // Performance Change: Employee Avg - Expected Avg
        const performanceChange = avgUserRating - avgExpectedProficiency;
        
        
        // Skill Gap: Expected Avg - Employee Avg
        const skillGap = avgExpectedProficiency - avgUserRating;
        const skillGapPercentage = avgExpectedProficiency > 0 ? Math.round((skillGap / avgExpectedProficiency) * 100) : 0;
        
        // Performance Label & Skill Gap Category - both based on skill gap percentage for consistency
        // The lower the gap percentage, the better the performance
        let performanceLabel = '';
        let skillGapCategory = '';
        let skillGapEmoji = '';
        
        // Using skill gap percentage to determine both category and performance level
        // This ensures consistency between both values
        if (skillGapPercentage <= 0) {
          // At or above expected (no gap)
          skillGapCategory = 'Strong';
          skillGapEmoji = '✅';
          performanceLabel = 'Excellent';
        } else if (skillGapPercentage <= 20) {
          // Slightly below target (0-20% gap)
          skillGapCategory = 'Strong';
          skillGapEmoji = '✅';
          performanceLabel = 'Excellent';
        } else if (skillGapPercentage <= 40) {
          // Moderate gap (20-40%)
          skillGapCategory = 'Moderate';
          skillGapEmoji = '⚠️';
          performanceLabel = 'Good';
        } else if (skillGapPercentage <= 60) {
          // Significant gap (40-60%)
          skillGapCategory = 'Moderate';
          skillGapEmoji = '⚠️';
          performanceLabel = 'Average';
        } else {
          // Large gap (>60%)
          skillGapCategory = 'Critical';
          skillGapEmoji = '❌';
          performanceLabel = 'Needs Improvement';
        }
        
        // Calculate gap for each skill and find top priority skills (highest gap)
        const skillGaps = skills.map((s: any) => ({
          name: s.name,
          userRating: s.userRating || 0,
          expectedProficiency: s.expectedProficiency || 3,
          gap: (s.expectedProficiency || 3) - (s.userRating || 0)
        }));
        
        // Sort by gap (highest first) and take top 5
        const topPrioritySkills = skillGaps
          .sort((a: any, b: any) => b.gap - a.gap)
          .slice(0, 5)
          .filter((s: any) => s.gap > 0);
        
        console.log('[ChatbotCopilot] Skill gap report:', {
          overallSkillIndex,
          performanceChange,
          skillGap,
          skillGapPercentage,
          skillGapCategory,
          performanceLabel,
          topPrioritySkills,
          totalSkills
        });
        
        // Generate report message
        const reportContent = `📊 **Skill Gap Report**

**1. Overall Skill Index (Performance Score):** ${avgUserRating.toFixed(1)} / ${avgExpectedProficiency.toFixed(1)} (${Math.round(overallSkillIndex)}%)

**2. Overall Skill Gap:**
   • Gap: ${skillGap.toFixed(1)} points (${skillGapPercentage}% below target)
   • Status: ${skillGapCategory} ${skillGapEmoji}

**3. Performance Level:** ${performanceLabel}

**4. Top Improvement Areas:**
${topPrioritySkills.length > 0 ? topPrioritySkills.map((s: any, i: number) => `   ${i + 1}. ${s.name} (Gap: ${s.gap.toFixed(1)})`).join('\n') : '   All skills meet or exceed expectations! 🎉'}

---
*Based on: ${totalSkills} skills*`;
        
        // Create report data object for the component - transform topPrioritySkills to include rated and expected
        const transformedTopPrioritySkills = topPrioritySkills.map((s: any) => ({
          name: s.name,
          rated: s.userRating,
          expected: s.expectedProficiency,
          gap: s.gap
        }));
        
        const reportData = {
          avgUserRating,
          avgExpectedProficiency,
          overallSkillIndex,
          skillGap,
          skillGapPercentage,
          skillGapCategory,
          skillGapEmoji,
          performanceLabel,
          topPrioritySkills: transformedTopPrioritySkills,
          totalSkills
        };
        
        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: reportContent,
          timestamp: new Date(),
          metadata: {
            currentStep: 'complete' as const,
            nextStep: 'complete',
            action: 'SHOW_SKILL_GAP_REPORT',
            skillGapReportData: reportData
          }
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        return;
        
      } catch (error) {
        console.error('[ChatbotCopilot] Error generating skill gap report:', error);
        const errorBotMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Sorry, I couldn\'t generate the skill gap report. Please try submitting your ratings again.',
          timestamp: new Date(),
          metadata: {
            canEscalate: true,
            currentStep: 'complete'
          }
        };
        setMessages(prev => [...prev, errorBotMessage]);
        setIsLoading(false);
        return;
      }
    }

    try {
      console.log('[ChatbotCopilot] Sending request with userId:', userId, 'subInstituteId:', subInstituteId);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          sessionId,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          userId,
          subInstituteId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: data.id || uuidv4(),
        type: 'bot',
        content: data.answer || 'I couldn\'t process that request. Please try rephrasing your question.',
        timestamp: new Date(),
        conversationId: data.conversationId,
        metadata: {
          sql: data.sql,
          tablesUsed: data.tables_used,
          insights: data.insights,
          canEscalate: data.canEscalate,
          action: data.action,
          missingFields: data.missingFields,
          entities: data.entities,
          // Skill Gap Analysis fields
          selectionOptions: data.selectionOptions,
          stepLabel: data.stepLabel,
          currentStep: data.currentStep,
          nextStep: data.nextStep,
          // Include job role info from API response metadata
          jobRole: data.metadata?.jobRole || data.jobRole,
          jobRoleId: data.metadata?.jobRoleId || data.jobRoleId,
          courseRecommendations: data.courseRecommendations
        }
      };

      setConversationId(data.conversationId);
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please check your connection and try again.',
        timestamp: new Date(),
        metadata: {
          canEscalate: true
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: 'Hello! I am Conversational AI, your assistant to help you with your queries. How can I assist you today?',
        timestamp: new Date(),
        metadata: {
          canEscalate: false
        }
      }
    ]);
    setShowEscalationModal(false);
  };

  const formatSQL = (sql: string) => {
    // Simple SQL formatting
    return sql
      .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|LIMIT)\b/gi, '\n$1')
      .replace(/,/g, ',\n  ')
      .trim();
  };
  // Phase NEW: Job Role Input Component (text input for job role name)
  const JobRoleInput = ({ messageId }: { messageId: string }) => {
    const message = messages.find(m => m.id === messageId);
    const [jobRoleText, setJobRoleText] = useState('');
    
    const handleSubmitJobRole = () => {
      if (!jobRoleText.trim()) return;
      setInput(`job role: ${jobRoleText.trim()}`);
      handleSend();
    };
    
    return (
      <div className="mt-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl border border-indigo-200 shadow-sm">
        <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-600" />
          Enter Job Role
        </h4>
        <input
          type="text"
          value={jobRoleText}
          onChange={(e) => setJobRoleText(e.target.value)}
          placeholder="e.g., Software Engineer, HR Manager"
          className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitJobRole()}
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmitJobRole}
            disabled={!jobRoleText.trim()}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Phase NEW: CWFKT Input Component - Conversational Form Format
  // 10 Common Industries for dropdown
  const COMMON_INDUSTRIES = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Healthcare' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Education' },
    { id: 5, name: 'Retail' },
    { id: 6, name: 'Manufacturing' },
    { id: 7, name: 'Consulting' },
    { id: 8, name: 'Media & Entertainment' },
    { id: 9, name: 'Real Estate' },
    { id: 10, name: 'Transportation' }
  ];

  const CWFKTInput = ({ messageId, jdFormData, setJdFormData }: { messageId: string; jdFormData?: any; setJdFormData?: any }) => {
    const message = messages.find(m => m.id === messageId);
    const jobRoleFromAPI = message?.metadata?.jobRole || '';
    
    // Get industry from message metadata or from session data
    const industryFromMessage = (message?.metadata as any)?.industry || '';
    
    // State for tracking conversational step
    const [currentFlowStep, setCurrentFlowStep] = useState<'department' | 'jobrole' | 'cwfkt' | 'generated'>(() => {
      // Determine initial step based on message metadata - use any string type
      const step = message?.metadata?.currentStep as string;
      if (step === 'enter_cwfkt') return 'cwfkt';
      if (step === 'enter_jobrole') return 'jobrole';
      return 'department';
    });
    
    // State for dynamically fetched departments based on industry
    const [departmentOptions, setDepartmentOptions] = useState<{ id: number; name: string }[]>([]);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    
    // State for the complete conversational form
    // Auto-fill Industry from user session (localStorage) - using sessionData.orgType as primary source
    const [selectedIndustry, setSelectedIndustry] = useState<string>(() => {
      // Use sessionData.orgType as the primary source (set from localStorage in useEffect above)
      return sessionData?.orgType || '';
    });
    
    // Use parent jdFormData state if available (persists across re-renders), otherwise use local state
    const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
      return jdFormData?.selectedDepartment || '';
    });
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(() => {
      return jdFormData?.selectedDepartmentId || null;
    });
    const [jobRoleText, setJobRoleText] = useState<string>(() => {
      return jdFormData?.jobRoleText || jobRoleFromAPI || '';
    });
    const [cwfList, setCwfList] = useState<Array<{id: number; function: string; tasks: string}>>(() => {
      return jdFormData?.cwfList || [];
    });
    
    // State for generated profile data and save status
    const [generatedProfile, setGeneratedProfile] = useState<any>(() => {
      return jdFormData?.generatedProfile || null;
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(() => {
      return jdFormData?.saveSuccess || false;
    });
    
    // Step tracking - which steps are completed
    const [stepsCompleted, setStepsCompleted] = useState(() => {
      return jdFormData?.stepsCompleted || {
        department: false,
        jobrole: false,
        cwfkt: false
      };
    });
    
    // Sync with parent state when jdFormData changes (e.g., after profile generation)
    useEffect(() => {
      if (jdFormData) {
        if (jdFormData.selectedDepartment) setSelectedDepartment(jdFormData.selectedDepartment);
        if (jdFormData.selectedDepartmentId !== undefined && jdFormData.selectedDepartmentId !== null) setSelectedDepartmentId(jdFormData.selectedDepartmentId);
        if (jdFormData.jobRoleText) setJobRoleText(jdFormData.jobRoleText);
        if (jdFormData.cwfList && jdFormData.cwfList.length > 0) setCwfList(jdFormData.cwfList);
        if (jdFormData.generatedProfile) setGeneratedProfile(jdFormData.generatedProfile);
        if (jdFormData.saveSuccess !== undefined) setSaveSuccess(jdFormData.saveSuccess);
        if (jdFormData.stepsCompleted) setStepsCompleted(jdFormData.stepsCompleted);
      }
    }, [jdFormData]);
    
    // Fetch departments on initial load when industry is available
    // This useEffect runs when selectedIndustry changes (including on initial load)
    useEffect(() => {
  const fetchDepartments = async () => {
    if (!sessionData?.orgType) {
      setDepartmentOptions([]);
      return;
    }

    setIsLoadingDepartments(true);
    try {
      // JD Flow: Use hrms_departments API with sub_institute_id=3 and parent_id != 0 filter
      const apiUrl = `https://hp.triz.co.in/table_data?table=hrms_departments&filters[sub_institute_id]=3&filters[groupby]=department&filters[parent_id]!=0`;
      
      console.log('[CWFKTInput] Fetching departments from:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      console.log('[CWFKTInput] Departments API response:', data);

      let departmentsArray: { id: number; name: string }[] = [];

      if (Array.isArray(data)) {
        departmentsArray = data
          .map((dept: any) => ({
            id: dept.id || 0,
            name: dept.department || dept.name || ''
          }))
          .filter((d: any) => d.name && d.id);
      } else if (data.data && Array.isArray(data.data)) {
        departmentsArray = data.data
          .map((dept: any) => ({
            id: dept.id || 0,
            name: dept.department || dept.name || ''
          }))
          .filter((d: any) => d.name && d.id);
      }

      console.log('[CWFKTInput] Transformed departments:', departmentsArray);
      setDepartmentOptions(departmentsArray);

    } catch (error) {
      console.error('[CWFKTInput] Error fetching departments:', error);
      setDepartmentOptions([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  fetchDepartments();
}, [sessionData?.orgType]); // ✅ CHANGED HERE
    
    // Add new CWF row
    const addCWF = () => {
      const newId = Date.now();
      setCwfList([...cwfList, { id: newId, function: '', tasks: '' }]);
    };
    
    // Remove CWF row
    const removeCWF = (id: number) => {
      setCwfList(cwfList.filter(cwf => cwf.id !== id));
    };
    
    // Update CWF function text
    const updateCWF = (id: number, field: 'function' | 'tasks', value: string) => {
      setCwfList(cwfList.map(cwf => 
        cwf.id === id ? { ...cwf, [field]: value } : cwf
      ));
    };
    
    // Handle Generate Profile - Generate JD with Skills + KAAB + CWF & Tasks
    const handleGenerateProfile = async () => {
      // Validate required fields
      if (!selectedIndustry) {
        alert('Please select an industry');
        return;
      }
      if (!selectedDepartment) {
        alert('Please select a department');
        return;
      }
      if (!jobRoleText.trim()) {
        alert('Please enter a job role');
        return;
      }
      
      // Filter out empty CWFs (with null checks)
      let validCWFList = cwfList.filter(c => c.function && c.function.trim());
      
      if (validCWFList.length === 0) {
        alert('Please add at least one Critical Work Function');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Get session data
        const subInstituteId = sessionData?.subInstituteId || '3';
        const token = sessionData?.token || '';
        
        console.log('[CWFKTInput] Starting profile generation with:', {
          industry: selectedIndustry,
          department: selectedDepartment,
          jobRole: jobRoleText,
          subInstituteId,
          token: token ? 'present' : 'missing'
        });
        
        // ================ GENERATE COMPETENCY PROFILE VIA LLM (GENKIT) ================
        // This includes Skills + KAAB (Knowledge, Ability, Attitude, Behaviour) - all from LLM
        console.log('[CWFKTInput] Generating competency profile (Skills + KAAB) via LLM...');
        
        let competencyData: any = {
          skills: [],
          knowledge: [],
          ability: [],
          attitude: [],
          behavior: []
        };
        
        try {
          // Create structured payload matching dummy JSON format - send CWF tasks to LLM for context
          const payload = {
            industry: selectedIndustry,
            department: selectedDepartment,
            department_id: selectedDepartmentId, // Include department ID
            jobRole: jobRoleText,
            cwf_items: validCWFList.map(c => ({
              critical_work_function: c.function,
              tasks: (c.tasks || '').split('\n').filter(t => t.trim()).map(t => t.trim())
            })),
            description: `Competency framework for a ${jobRoleText} professional in the ${selectedIndustry} industry, focusing on ${validCWFList.map(c => c.function).join(', ')}.`
          };

          console.log('[CWFKTInput] 📤 Sending structured payload to Genkit API:', JSON.stringify(payload, null, 2));

          // Call Genkit API to generate complete competency profile with all details
          const genkitResponse = await fetch('/api/genkit-job-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (genkitResponse.ok) {
            const genkitResult = await genkitResponse.json();
            console.log('[CWFKTInput] 📥 Genkit response received:', JSON.stringify(genkitResult, null, 2));
            
            // Extract Skills from Genkit response - map to exact format matching dummy JSON
            if (genkitResult.skills && Array.isArray(genkitResult.skills)) {
              competencyData.skills = genkitResult.skills.map((s: any) => ({
                title: s.title || s.name || '',
                category: s.category || 'Technical',
                sub_category: s.sub_category || s.subCategory || 'Job Role-Specific',
                description: s.description || `Proficiency level ${s.level || 3} for ${s.title || 'this skill'}`,
                proficiency_level: s.level || s.proficiency_level || 3
              })).filter((s: any) => s.title);
            }
            
            // Extract Knowledge from Genkit response - exact format matching dummy JSON
            if (genkitResult.knowledge && Array.isArray(genkitResult.knowledge)) {
              competencyData.knowledge = genkitResult.knowledge.map((k: any) => ({
                title: k.title || k.name || '',
                description: k.description || '',
                category: k.category || 'Domain',
                sub_category: k.sub_category || k.subCategory || '',
                proficiency_level: k.level || 3
              })).filter((k: any) => k.title);
            }
            
            // Extract Ability from Genkit response - exact format matching dummy JSON
            if (genkitResult.ability && Array.isArray(genkitResult.ability)) {
              competencyData.ability = genkitResult.ability.map((a: any) => ({
                title: a.title || a.name || '',
                description: a.description || '',
                category: a.category || 'Cognitive',
                sub_category: a.sub_category || a.subCategory || '',
                proficiency_level: a.level || 3
              })).filter((a: any) => a.title);
            }
            
            // Extract Attitude from Genkit response - exact format matching dummy JSON
            if (genkitResult.attitude && Array.isArray(genkitResult.attitude)) {
              competencyData.attitude = genkitResult.attitude.map((a: any) => ({
                title: a.title || a.name || '',
                description: a.description || '',
                category: a.category || 'Behavioral',
                sub_category: a.sub_category || a.subCategory || '',
                proficiency_level: a.level || 3
              })).filter((a: any) => a.title);
            }
            
            // Extract Behavior from Genkit response - exact format matching dummy JSON
            if (genkitResult.behavior && Array.isArray(genkitResult.behavior)) {
              competencyData.behavior = genkitResult.behavior.map((b: any) => ({
                title: b.title || b.name || '',
                description: b.description || '',
                category: b.category || 'Operational',
                sub_category: b.sub_category || b.subCategory || '',
                proficiency_level: b.level || 3
              })).filter((b: any) => b.title);
            }
            
            console.log('[CWFKTInput] ✅ Skills from Genkit:', competencyData.skills.length);
            console.log('[CWFKTInput] ✅ Knowledge from Genkit:', competencyData.knowledge.length);
            console.log('[CWFKTInput] ✅ Ability from Genkit:', competencyData.ability.length);
            console.log('[CWFKTInput] ✅ Attitude from Genkit:', competencyData.attitude.length);
            console.log('[CWFKTInput] ✅ Behavior from Genkit:', competencyData.behavior.length);
            
            // ALWAYS use user's input CWF - do not replace with LLM-generated data
            // Transform user's CWF to the required format
            validCWFList = validCWFList.map((c: any) => ({
              critical_work_function: c.function,
              tasks: (c.tasks || '').split('\n').filter((t: string) => t.trim()).map((t: string) => t.trim())
            }));
            
          } else {
            console.log('[CWFKTInput] Genkit API failed with status:', genkitResponse.status);
          }
        } catch (genkitError) {
          console.log('[CWFKTInput] Genkit API error:', genkitError);
        }
        
        // Build the complete profile data in EXACT format matching dummy JSON
        const profileData = {
          job_role_name: jobRoleText,
          department: selectedDepartment,
          department_id: selectedDepartmentId, // Include department ID
          industry: selectedIndustry,
          description: `Competency framework for a ${jobRoleText} professional in the ${selectedDepartment} department of the ${selectedIndustry} industry, focusing on essential skills, knowledge, abilities, attitudes, and behaviors required for the role.`,
          cwf_items: validCWFList.map((c: any, index: number) => ({
            critical_work_function: c.critical_work_function || '',
            tasks: Array.isArray(c.tasks) ? c.tasks : []
          })),
          skills: competencyData.skills,
          knowledge: competencyData.knowledge,
          ability: competencyData.ability,
          attitude: competencyData.attitude,
          behavior: competencyData.behavior
        };
        
        console.log('[CWFKTInput] 📋 Generated Profile Data (Structured JSON):', JSON.stringify(profileData, null, 2));
        
        // Store for save functionality
        setGeneratedProfile(profileData);
        
        // Sync with parent state to preserve data across re-renders
        if (setJdFormData) {
          setJdFormData((prev: any) => ({
            ...prev,
            selectedDepartment,
            selectedDepartmentId,
            jobRoleText,
            cwfList: validCWFList,
            generatedProfile: profileData,
            stepsCompleted: { ...prev?.stepsCompleted || {}, cwfkt: true }
          }));
        }
        
        // Mark all steps as complete
        setStepsCompleted((prev: any) => ({ ...prev, cwfkt: true }));
        setCurrentFlowStep('generated');
        
        // Create a structured summary message - use profileData for display
        const displaySkills = profileData.skills || [];
        const skillsList = displaySkills.length > 0 
          ? displaySkills.map((s: any, i: number) => `   ${i + 1}. ${s.skillName}${s.category ? ` (${s.category})` : ''}`).join('\n')
          : '   No skills data available';
        
        const kabaList = `
**Knowledge:**
${profileData.knowledge && profileData.knowledge.length > 0 ? profileData.knowledge.map((k: any, i: number) => `   ${i + 1}. ${k.title || k.name || ''}`).join('\n') : '   No knowledge items found'}

**Ability:**
${profileData.ability && profileData.ability.length > 0 ? profileData.ability.map((a: any, i: number) => `   ${i + 1}. ${a.title || a.name || ''}`).join('\n') : '   No ability items found'}

**Attitude:**
${profileData.attitude && profileData.attitude.length > 0 ? profileData.attitude.map((a: any, i: number) => `   ${i + 1}. ${a.title || a.name || ''}`).join('\n') : '   No attitude items found'}

**Behaviour:**
${profileData.behaviour && profileData.behaviour.length > 0 ? profileData.behaviour.map((b: any, i: number) => `   ${i + 1}. ${b.title || b.name || ''}`).join('\n') : '   No behaviour items found'}`;
        
// Create Job Description based on Industry, Department, Job Role and Critical Work Functions
      const jobDescription = `The ${jobRoleText} role in the ${selectedDepartment} department of the ${selectedIndustry} industry is responsible for handling clinical procedures, patient care, and healthcare delivery. Staff Nurses provide direct patient care, assist physicians, and ensure compliance with hospital protocols and procedures.

**📌 Critical Work Functions & Tasks:**
${validCWFList.map((c: any, index) => `
${index + 1}. **${c.critical_work_function || c.function || ''}**
${(c.tasks || []).map((t: string, i: number) => `   • ${t}`).join('\n')}`).join('\n')}

---

**🛠️ Skills:**
${skillsList}

---

**🎯 KAAB (Knowledge, Ability, Attitude, Behaviour):**${kabaList}

---
*Profile generated successfully! Click "Save JD" to save to database.*`;
        
        // Remove duplicate jobDescription variable
        // eslint-disable-next-line no-unused-vars
        
        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: jobDescription,
          timestamp: new Date(),
          metadata: {
            currentStep: 'complete' as const,
            action: 'SHOW_GENERATED_PROFILE',
            cwfktData: validCWFList.map((c: any, i: number) => ({ id: i + 1, function: c.critical_work_function, tasks: Array.isArray(c.tasks) ? c.tasks : (c.tasks || '').split('\n').filter((t: string) => t && t.length > 0) })),
            generatedProfile: profileData
          }
        };
        setMessages(prev => [...prev, botMessage]);
        
      } catch (error) {
        console.error('[CWFKTInput] Error generating profile:', error);
        alert('Error generating profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Handle Save JD - save to database
    const handleSaveJD = async () => {
      if (!generatedProfile) {
        alert('Please generate profile first');
        return;
      }
      
      setIsSaving(true);
      setSaveSuccess(false);
      
      try {
        const subInstituteId = sessionData?.subInstituteId || '1';
        const userId = sessionData?.userId || '1';
        
        const savePayload = {
          sub_institute_id: parseInt(subInstituteId, 10) || 1,
          user_id: parseInt(userId, 10) || 1,
          job_role_name: generatedProfile.job_role_name || generatedProfile.jobRole || '',
          department: generatedProfile.department || '',
          industry: generatedProfile.industry || '',
          description: generatedProfile.description || '',
          cwf_items: generatedProfile.cwf_items || [],
          skills: generatedProfile.skills || [],
          knowledge: generatedProfile.knowledge || [],
          ability: generatedProfile.ability || [],
          attitude: generatedProfile.attitude || [],
          behavior: generatedProfile.behavior || generatedProfile.behaviour || []
        };
        
        console.log('[CWFKTInput] 📤 Calling API: http://127.0.0.1:8000/api/gemini/save-jd');
        console.log('[CWFKTInput] 📤 Full Payload:', JSON.stringify(savePayload, null, 2));
        
        const saveResponse = await fetch('http://127.0.0.1:8000/api/gemini/save-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload)
        });
        
        if (saveResponse.ok) {
          const responseData = await saveResponse.json();
          console.log('[CWFKTInput] 📥 API Response:', JSON.stringify(responseData, null, 2));
          setSaveSuccess(true);
          if (setJdFormData) {
            setJdFormData({
              selectedDepartment: '',
              selectedDepartmentId: null,
              jobRoleText: '',
              cwfList: [],
              generatedProfile: null,
              stepsCompleted: {
                department: false,
                jobrole: false,
                cwfkt: false
              },
              saveSuccess: true
            });
          }
          alert('Job Description saved successfully! ✅');
        } else {
          throw new Error('Failed to save');
        }
        
      } catch (error) {
        console.error('[CWFKTInput] Error saving JD:', error);
        alert('Error saving Job Description. Please try again.');
      } finally {
        setIsSaving(false);
      }
    };
    
    // Get the step message based on current flow step
    const getStepMessage = () => {
      switch (currentFlowStep) {
        case 'department':
          return "Your industry is set to " + (selectedIndustry || sessionData?.orgType || 'your organization') + ". Please select your department.";
        case 'jobrole':
          return "You have selected " + selectedDepartment + ". Please enter the job role for this department.";
        case 'cwfkt':
          return "Got it. Now, please add Critical Work Functions and Tasks for the role " + jobRoleText + ".";
        case 'generated':
          return "Great! Once you have added all functions and tasks, click on Generate Profile.";
        default:
          return "Let's create a job description!";
      }
    };
    
    // Handle department selection - move to next step
    const handleDepartmentSelect = (deptValue: string) => {
      // Parse department name and ID from value (format: "name|id" or just "name")
      const parts = deptValue.split('|');
      const deptName = parts[0];
      const deptId = parts[1] ? parseInt(parts[1], 10) : null;
      
      setSelectedDepartment(deptName);
      setSelectedDepartmentId(deptId);
      setCurrentFlowStep('jobrole');
      setStepsCompleted((prev: any) => ({ ...prev, department: true }));
      // Sync with parent state
      if (setJdFormData) {
        setJdFormData((prev: any) => ({
          ...prev,
          selectedDepartment: deptName,
          selectedDepartmentId: deptId,
          stepsCompleted: { ...prev?.stepsCompleted || {}, department: true }
        }));
      }
    };
    
    // Handle job role submission - move to next step
    const handleJobRoleSubmit = () => {
      if (!jobRoleText.trim()) return;
      setCurrentFlowStep('cwfkt');
      setStepsCompleted((prev: any) => ({ ...prev, jobrole: true }));
      // Sync with parent state
      if (setJdFormData) {
        setJdFormData((prev: any) => ({
          ...prev,
          jobRoleText: jobRoleText,
          stepsCompleted: { ...prev?.stepsCompleted || {}, jobrole: true }
        }));
      }
    };
    
    // Handle CWF completion - move to generate step
    const handleCWFComplete = () => {
      setCurrentFlowStep('generated');
      setStepsCompleted((prev: any) => ({ ...prev, cwfkt: true }));
    };
    
    // Render Step 1: Industry & Department
    const renderStep1Department = () => (
      <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <span className="text-sm font-semibold text-indigo-900">Industry & Department</span>
        </div>
        
        {/* Industry - Read Only */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Industry (auto-filled)</label>
          <input
            type="text"
            value={sessionData?.orgType || ''}
            disabled
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        
        {/* Department Dropdown */}
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Select Department</label>
          <select
            value={selectedDepartmentId ? `${selectedDepartment}|${selectedDepartmentId}` : selectedDepartment}
            onChange={(e) => handleDepartmentSelect(e.target.value)}
            disabled={isLoadingDepartments}
            className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
          >
            <option value="">— Choose department —</option>
            {isLoadingDepartments ? (
              <option value="" disabled>Loading...</option>
            ) : departmentOptions.length > 0 ? (
              departmentOptions.map((dept) => (
                <option key={dept.id} value={`${dept.name}|${dept.id}`}>{dept.name}</option>
              ))
            ) : (
              <option value="" disabled>No departments found</option>
            )}
          </select>
        </div>
        
        {/* Bot Message for Step 1 */}
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-indigo-800">
            <Bot className="w-3 h-3 inline mr-1" />
            Your industry is set to {sessionData?.orgType || 'your organization'}. Please select your department.
          </p>
        </div>
      </div>
    );
    
    // Render Step 2: Job Role
    const renderStep2JobRole = () => (
      <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
          <span className="text-sm font-semibold text-indigo-900">Job Role</span>
        </div>
        
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Enter Job Role</label>
          <input
            type="text"
            value={jobRoleText}
            onChange={(e) => setJobRoleText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJobRoleSubmit()}
            placeholder="e.g., HR Manager, Staff Nurse"
            className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        
        <button
          onClick={handleJobRoleSubmit}
          disabled={!jobRoleText.trim()}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Continue
        </button>
        
        {/* Bot Message for Step 2 */}
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-indigo-800">
            <Bot className="w-3 h-3 inline mr-1" />
            {selectedDepartment ? `You selected ${selectedDepartment}.` : ''} Please enter the job role for this department.
          </p>
        </div>
      </div>
    );
    
    // Render Step 3: CWF & Tasks
    const renderStep3CWF = () => (
      <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
          <span className="text-sm font-semibold text-indigo-900">Critical Work Functions & Tasks</span>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          Add Critical Work Functions and their Key Tasks for {jobRoleText || 'the role'}.
        </p>
        
        {/* CWF Rows */}
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-3">
          {cwfList.length === 0 && (
            <div className="text-center py-3 text-indigo-600 text-xs bg-indigo-50 rounded-lg border border-indigo-200">
              Click "+ Add Function" to add your first CWF
            </div>
          )}
          
          {cwfList.map((cwf, index) => (
            <div key={cwf.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  CWF {index + 1}
                </span>
                <button
                  onClick={() => removeCWF(cwf.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <input
                type="text"
                value={cwf.function}
                onChange={(e) => updateCWF(cwf.id, 'function', e.target.value)}
                placeholder="Function name..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded mb-2"
              />
              
              <textarea
                value={cwf.tasks}
                onChange={(e) => updateCWF(cwf.id, 'tasks', e.target.value)}
                placeholder="Tasks (one per line)..."
                rows={2}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded resize-none"
              />
            </div>
          ))}
        </div>
        
        <button
          onClick={addCWF}
          className="w-full px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
        >
          + Add Function
        </button>
        
        {/* Bot Message for Step 3 */}
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-indigo-800">
            <Bot className="w-3 h-3 inline mr-1" />
            Got it. Now, please add Critical Work Functions and Tasks for the role {jobRoleText}.
          </p>
        </div>
      </div>
    );
    
    // Render Step 4: Generate Profile Button
    const renderStep4Generate = () => {
      const validCWFList = cwfList.filter(c => c.function && c.function.trim());
      
      return (
        <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm mb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">4</span>
            <span className="text-sm font-semibold text-green-900">Generate Profile</span>
          </div>
          
          {/* Live Preview of CWFs */}
          {validCWFList.length > 0 && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">{validCWFList.length} CWF(s) added:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                {validCWFList.map((c, i) => (
                  <li key={c.id} className="truncate">• {c.function}</li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={handleGenerateProfile}
            disabled={isLoading || validCWFList.length === 0}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <>Generate Profile</>
            )}
          </button>
          
          {/* Bot Message for Step 4 */}
          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-800">
              <Bot className="w-3 h-3 inline mr-1" />
              Great! Once you have added all functions and tasks, click on Generate Profile.
            </p>
          </div>
        </div>
      );
    };
    
    // Main render - step by step based on currentFlowStep
    return (
      <div className="mt-3 p-2">
        {/* Step Indicator Header */}
        <div className="mb-4 px-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Job Description Creation</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${stepsCompleted.department ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className={`w-2 h-2 rounded-full ${stepsCompleted.jobrole ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className={`w-2 h-2 rounded-full ${stepsCompleted.cwfkt ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className={`w-2 h-2 rounded-full ${generatedProfile ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
          </div>
        </div>
        
        {/* Step 1: Department - Always shown */}
        {renderStep1Department()}
        
        {/* Step 2: Job Role - Shown after department selected (always visible once selected) */}
        {(stepsCompleted.department || selectedDepartment) && renderStep2JobRole()}
        
        {/* Step 3: CWF & Tasks - Shown after job role Continue button is clicked */}
        {stepsCompleted.jobrole && renderStep3CWF()}
        
        {/* Step 4: Generate - Shown when CWFs are added (always visible once CWFs exist) */}
        {(cwfList.filter(c => c && c.function && c.function.trim()).length > 0 || generatedProfile) && renderStep4Generate()}
        
        {/* Save JD Button - shows after profile is generated */}
        {/* {generatedProfile && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
            <button
              onClick={handleSaveJD}
              disabled={isSaving || saveSuccess}
              className={`w-full px-4 py-3 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                saveSuccess ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><span>✓</span> Saved Successfully</>
              ) : (
                <><span>💾</span> Save JD</>
              )}
            </button>
          </div>
        )} */}
      </div>
    );
  };

  // Phase 3: Generated Profile UI - Modern Card-Based Layout with Collapsible Sections
  const GeneratedProfileUI = ({ profileData, onSave }: { profileData: any; onSave?: () => void }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      cwf: true,
      skills: true,
      knowledge: true,
      ability: true,
      attitude: true,
      behaviour: true
    });

    const toggleSection = (section: string) => {
      setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSave = async () => {
      setIsSaving(true);
      
      try {
        const subInstituteId = sessionData?.subInstituteId || '1';
        const userId = sessionData?.userId || '1';
        
        const savePayload = {
          sub_institute_id: parseInt(subInstituteId, 10) || 1,
          user_id: parseInt(userId, 10) || 1,
          job_role_name: profileData.job_role_name || profileData.jobRole || '',
          department: profileData.department || '',
          industry: profileData.industry || '',
          description: profileData.description || '',
          cwf_items: profileData.cwf_items || [],
          skills: profileData.skills || [],
          knowledge: profileData.knowledge || [],
          ability: profileData.ability || [],
          attitude: profileData.attitude || [],
          behavior: profileData.behavior || profileData.behaviour || []
        };
        
        console.log('💾 [Save JD] 📤 Calling API: http://127.0.0.1:8000/api/gemini/save-jd');
        console.log('💾 [Save JD] 📤 Full Payload:', JSON.stringify(savePayload, null, 2));
        
        const saveResponse = await fetch('http://127.0.0.1:8000/api/gemini/save-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload)
        });
        
        if (saveResponse.ok) {
          const responseData = await saveResponse.json();
          console.log('💾 [Save JD] 📥 API Response:', JSON.stringify(responseData, null, 2));
          setSaveSuccess(true);
        } else {
          throw new Error('Failed to save JD');
        }
      } catch (error) {
        console.error('Error saving JD:', error);
      } finally {
        setIsSaving(false);
      }
    };
    
    const SectionCard = ({ title, icon, children, color }: { title: string; icon: React.ReactNode; children: React.ReactNode; color: string }) => (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className={`px-4 py-2.5 bg-gradient-to-r ${color} flex items-center gap-2`}>
          {icon}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    );
    
    return (
      <div className="mt-3 space-y-4">
        {/* Header Card - Industry, Department, Job Role */}
        <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">Job Description Generated</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <h2 className="text-white font-bold text-lg mb-2">{profileData.job_role_name}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                {profileData.industry}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                {profileData.department}
              </span>
            </div>
          </div>
        </div>

        {/* Job Description Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-800">Job Description</h4>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {profileData.description}
            </p>
          </div>
        </div>

        {/* Critical Work Functions & Tasks Card - Collapsible */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div 
            className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('cwf')}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-800">Critical Work Functions & Tasks</h4>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {profileData.cwf_items?.length || 0}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.cwf ? 'rotate-180' : ''}`} />
          </div>
          
          {expandedSections.cwf && (
            <div className="p-4 space-y-3">
              {profileData.cwf_items && profileData.cwf_items.length > 0 ? (
                profileData.cwf_items.map((cwf: any, i: number) => (
                  <div key={i} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-semibold text-gray-800 mb-1">{cwf.critical_work_function}</h5>
                        {cwf.tasks && cwf.tasks.length > 0 && (
                          <ul className="text-xs text-gray-600 space-y-1">
                            {cwf.tasks.map((task: string, j: number) => (
                              <li key={j} className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No critical work functions added</p>
              )}
            </div>
          )}
        </div>

        {/* Skills Card - Collapsible */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div 
            className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('skills')}
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-800">Skills</h4>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                {profileData.skills?.length || 0}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`} />
          </div>
          
          {expandedSections.skills && (
            <div className="p-4 space-y-3">
              {profileData.skills && profileData.skills.length > 0 ? (
                profileData.skills.map((skill: any, i: number) => (
                  <div key={i} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className={`text-sm font-semibold text-green-800`}>{skill.title}</h5>
                      {skill.proficiency_level && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Level {skill.proficiency_level}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {skill.category && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Category:</span> {skill.category}
                          {skill.sub_category && <span className="text-gray-400">Sub Category: {skill.sub_category}</span>}
                        </p>
                      )}
                      {skill.description && (
                        <p className="text-xs text-gray-500">Description: {skill.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No skills data available</p>
              )}
            </div>
          )}
        </div>

        {/* KAAB Cards - Grid of Collapsible Sections */}
        <div className="grid grid-cols-2 gap-3">
          {/* Knowledge */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
              className="bg-amber-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('knowledge')}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <h4 className="text-xs font-semibold text-gray-800">Knowledge</h4>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.knowledge ? 'rotate-180' : ''}`} />
            </div>
            {expandedSections.knowledge && (
              <div className="p-3 space-y-2">
                {profileData.knowledge && profileData.knowledge.length > 0 ? (
                  profileData.knowledge.map((item: any, i: number) => (
                    <div key={i} className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-xs font-semibold text-amber-800">{item.title || item.name || ''}</h5>
                        {(item.proficiency_level || item.level) && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                            Level {item.proficiency_level || item.level}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {item.category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Category:</span> {item.category}
                          </p>
                        )}
                        {item.sub_category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Sub Category:</span> {item.sub_category}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No knowledge items</p>
                )}
              </div>
            )}
          </div>

          {/* Ability */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
              className="bg-blue-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('ability')}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <h4 className="text-xs font-semibold text-gray-800">Ability</h4>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.ability ? 'rotate-180' : ''}`} />
            </div>
            {expandedSections.ability && (
              <div className="p-3 space-y-2">
                {profileData.ability && profileData.ability.length > 0 ? (
                  profileData.ability.map((item: any, i: number) => (
                    <div key={i} className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-xs font-semibold text-blue-800">{item.title || item.name || ''}</h5>
                        {(item.proficiency_level || item.level) && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Level {item.proficiency_level || item.level}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {item.category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Category:</span> {item.category}
                          </p>
                        )}
                        {item.sub_category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Sub Category:</span> {item.sub_category}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No ability items</p>
                )}
              </div>
            )}
          </div>

          {/* Attitude */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
              className="bg-rose-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('attitude')}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <h4 className="text-xs font-semibold text-gray-800">Attitude</h4>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.attitude ? 'rotate-180' : ''}`} />
            </div>
            {expandedSections.attitude && (
              <div className="p-3 space-y-2">
                {profileData.attitude && profileData.attitude.length > 0 ? (
                  profileData.attitude.map((item: any, i: number) => (
                    <div key={i} className="p-2 bg-rose-50 rounded-lg border border-rose-100">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-xs font-semibold text-rose-800">{item.title || item.name || ''}</h5>
                        {(item.proficiency_level || item.level) && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded">
                            Level {item.proficiency_level || item.level}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {item.category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Category:</span> {item.category}
                          </p>
                        )}
                        {item.sub_category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Sub Category:</span> {item.sub_category}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No attitude items</p>
                )}
              </div>
            )}
          </div>

          {/* Behaviour */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
              className="bg-violet-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('behaviour')}
            >
              <div className="flex items-center gap-2">
                <Smile className="w-3.5 h-3.5 text-violet-600" />
                <h4 className="text-xs font-semibold text-gray-800">Behaviour</h4>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.behaviour ? 'rotate-180' : ''}`} />
            </div>
            {expandedSections.behaviour && (
              <div className="p-3 space-y-2">
                {profileData.behavior && profileData.behavior.length > 0 ? (
                  profileData.behavior.map((item: any, i: number) => (
                    <div key={i} className="p-2 bg-violet-50 rounded-lg border border-violet-100">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-xs font-semibold text-violet-800">{item.title || item.name || ''}</h5>
                        {(item.proficiency_level || item.level) && (
                          <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                            Level {item.proficiency_level || item.level}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {item.category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Category:</span> {item.category}
                          </p>
                        )}
                        {item.sub_category && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Sub Category:</span> {item.sub_category}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No behaviour items</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save JD Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || saveSuccess}
          className={`w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
            saveSuccess 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
              : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
          }`}
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : saveSuccess ? (
            <><CheckCircle className="w-4 h-4" /> Saved Successfully</>
          ) : (
            <><Save className="w-4 h-4" /> Save Job Description</>
          )}
        </button>
      </div>
    );
  };

  // Phase 3: Genkit Form Component
  const GenkitForm = ({ messageId }: { messageId: string }) => {
    const missingFields = messages.find(m => m.id === messageId)?.metadata?.missingFields || [];

    return (
      <div className="mt-3 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          Complete Competency Profile
        </h4>

        <div className="space-y-3">
          {missingFields.includes('Industry') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleFormChange('industry', e.target.value)}
                placeholder="e.g., Healthcare, Technology"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {missingFields.includes('Department') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleFormChange('department', e.target.value)}
                placeholder="e.g., Nursing, IT, Operations"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {missingFields.includes('Job Role') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Job Role</label>
              <input
                type="text"
                value={formData.jobRole}
                onChange={(e) => handleFormChange('jobRole', e.target.value)}
                placeholder="e.g., Charge Nurse, Software Engineer"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {missingFields.includes('Description') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Brief description of the role..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          )}
        </div>

       <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFormSubmit(messageId)}
            disabled={isLoading || pendingFormMessageId !== null}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && pendingFormMessageId === messageId ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Profile'
            )}
          </button>
          <button
            onClick={handleFormSkip}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Phase 4: Skill Gap Selection Component
  const SkillGapSelection = ({ messageId }: { messageId: string }) => {
    const message = messages.find(m => m.id === messageId);
    const options = message?.metadata?.selectionOptions || [];
    const stepLabel = message?.metadata?.stepLabel || 'Select an option';
    const currentStep = message?.metadata?.currentStep;
    const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
    
    console.log('[SkillGapSelection] Rendering - messageId:', messageId);
    console.log('[SkillGapSelection] options:', options);
    console.log('[SkillGapSelection] currentStep:', currentStep);
    console.log('[SkillGapSelection] skillGapFlow state:', skillGapFlow);

    const handleSelect = async (selectedOption: { id: number; name: string }) => {
      console.log('[SkillGapSelection] Selected:', selectedOption, 'currentStep:', currentStep);
      
      // Update skill gap flow state FIRST before API call
      let nextStep: string = '';
      
      // Create updated state
      const updatedState = { ...skillGapFlow, selectedValue: selectedOption.name };
      
      switch (currentStep) {
        case 'industry':
          updatedState.industry = selectedOption.name;
          updatedState.currentStep = 'department';
          nextStep = 'department';
          break;
        case 'department':
          updatedState.department = selectedOption.name;
          updatedState.departmentId = selectedOption.id; // Store department ID
          updatedState.currentStep = 'jobRole';
          nextStep = 'jobRole';
          break;
        case 'jobRole':
          // selectedOption.id comes from the API response from get-job-roles API
          // See: src/app/api/get-job-roles/route.ts - returns { id, name } from s_user_jobrole table
          updatedState.jobRole = selectedOption.name; // Job role name (e.g., "Content Strategist")
          updatedState.jobRoleId = selectedOption.id;  // Job role ID (e.g., 3172) - used for get-kaba API
          updatedState.currentStep = 'skills';
          nextStep = 'tasks';
          break;
        case 'tasks':
          updatedState.currentStep = 'skills';
          nextStep = 'skills';
          break;
        case 'skills':
          updatedState.currentStep = 'rating_prompt';
          nextStep = 'rating_prompt';
          break;
      }
      
      // Update state immediately
      setSkillGapFlow(updatedState);

      // REMOVED: Auto API call for industry selection
      // Now user must explicitly ask for department list by sending a message
      // For industry step: just set input text, user presses Enter to get departments
      if (currentStep === 'industry') {
        setInput(`Select my department as ${selectedOption.name}`);
        return;
      }
      
      // For department step: call API to get job roles for the selected department
      if (currentStep === 'department') {
        // Update state with department info
        setSkillGapFlow(updatedState);
        setIsLoading(true);
        
        // Call API to get job roles for the selected department
        try {
          const apiEndpoint = '/api/skill-gap-analysis';
          const requestBody = {
            currentStep: 'jobRole',
            industry: updatedState.industry,
            department: selectedOption.name,
            departmentId: updatedState.departmentId
          };
          
          console.log('[SkillGapSelection] Calling job roles API for department:', requestBody);
          
          fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })
          .then(res => res.json())
          .then(data => {
            console.log('[SkillGapSelection] Job roles API response:', data);
            
            const botMessage: Message = {
              id: Date.now().toString(),
              type: 'bot',
              content: `You selected ${selectedOption.name} department. Now select your job role:`,
              timestamp: new Date(),
              metadata: {
                action: 'SHOW_SKILL_GAP_OPTIONS',
                selectionOptions: data.data || [],
                stepLabel: `Job Roles in ${selectedOption.name}`,
                currentStep: 'jobRole',
                nextStep: 'jobRole',
                entities: {
                  industry: updatedState.industry,
                  department: selectedOption.name,
                  departmentId: updatedState.departmentId
                }
              }
            };
            
            setMessages(prev => [...prev, botMessage]);
          })
          .catch(err => {
            console.error('[SkillGapSelection] Error fetching job roles:', err);
          })
          .finally(() => {
            setIsLoading(false);
          });
        } catch (error) {
          console.error('[SkillGapSelection] Error:', error);
          setIsLoading(false);
        }
        return;
      }
      
      // For other steps (jobRole, skills, tasks), call the API
      // Call the appropriate API based on current step
      try {
        setIsLoading(true);
        
        // Call skill-gap-analysis API for all steps (industry, department, jobRole, skills)
        const apiEndpoint = '/api/skill-gap-analysis';
        let requestBody: any = {
          currentStep: nextStep,
        };
        
        // Add the appropriate data based on current step
        // Skip for department - already handled above with async fetch
        if (currentStep === 'jobRole') {
          requestBody.industry = updatedState.industry;
          requestBody.department = updatedState.department;
          requestBody.departmentId = updatedState.departmentId; // Include department ID
          requestBody.jobRole = selectedOption.name;
        } else if (currentStep === 'skills') {
          requestBody.currentStep = 'skills';
          requestBody.jobRole = updatedState.jobRole;
        } else if (currentStep === 'tasks') {
          requestBody.industry = updatedState.industry;
          requestBody.department = updatedState.department;
          requestBody.jobRole = updatedState.jobRole;
        }
        
        console.log('[SkillGapSelection] Calling API:', apiEndpoint, 'with:', requestBody);
        
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Failed to get response from ${apiEndpoint}`);
        }

        const data = await response.json();
        console.log('[SkillGapSelection] API response:', data);

        // Determine the step label based on current step
        let stepLabelText = '';
        let contentMessage = '';
        
        if (currentStep === 'department') {
          stepLabelText = 'Department selected';
          contentMessage = `You selected ${updatedState.industry} industry and ${selectedOption.name} department. Loading job roles...`;
        } else if (currentStep === 'jobRole') {
          stepLabelText = `Select job role in ${updatedState.department}`;
          contentMessage = `You selected ${updatedState.department} department. Now select your job role:`;
        } else if (currentStep === 'tasks') {
          stepLabelText = `Tasks for ${updatedState.jobRole}`;
          contentMessage = `You selected ${updatedState.jobRole} job role. Here are the key tasks:`;
        } else if (currentStep === 'skills') {
          stepLabelText = `Skills for ${updatedState.jobRole}`;
          contentMessage = `Now let's assess your skills for ${updatedState.jobRole}. Rate your proficiency (1-5):`;
        } else if (currentStep === 'rating_prompt') {
          // After skills are shown, display the rating prompt
          stepLabelText = 'Skill Rating';
          contentMessage = 'Would you like to rate your skills? This will help us analyze your skill gap.';
        } else {
          stepLabelText = 'Complete';
          contentMessage = 'What would you like to do next?';
        }

        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: contentMessage,
          timestamp: new Date(),
          metadata: {
            action: 'SHOW_SKILL_GAP_OPTIONS',
            selectionOptions: data.data || [],
            stepLabel: stepLabelText,
            currentStep: data.nextStep,
            nextStep: data.nextStep,
            // Store job role info for API calls
            jobRole: updatedState.jobRole,
            jobRoleId: updatedState.jobRoleId
          }
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('[SkillGapSelection] Error calling API:', error);
        // Show error message in chat instead of falling back to chat handler
        const errorBotMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: `Sorry, I encountered an error while fetching ${currentStep || 'options'}. Please try again or contact support if the issue persists.`,
          timestamp: new Date(),
          metadata: {
            canEscalate: true,
            action: 'SHOW_SKILL_GAP_OPTIONS',
            currentStep: currentStep,
            selectionOptions: options,
            stepLabel: stepLabel
          }
        };
        setMessages(prev => [...prev, errorBotMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm">
        <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-green-600" />
          {stepLabel}
        </h4>

        {currentStep === 'skills' ? (
          <div className="space-y-3">
            {options.map((option: any, index: number) => {
              const isExpanded = expandedSkill === option.name;
              const skillCategory = option.category || option.Category || option.skill_category || '';
              const skillSubCategory = option.subCategory || option.sub_category || option.subCategoryName || '';
              const skillDescription = option.description || option.Description || option.skill_description || '';
              return (
                <div 
                  key={index} 
                  className="p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-all shadow-sm cursor-pointer"
                  onClick={() => setExpandedSkill(isExpanded ? null : option.name)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-sm font-semibold text-green-800">{option.name}</h5>
                    {(option.proficiencyLevel || option.proficiency_level) && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Level {option.proficiencyLevel || option.proficiency_level}
                      </span>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="space-y-1 mt-2 pt-2 border-t border-green-100">
                      {skillCategory && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Category:</span> {skillCategory}
                        </p>
                      )}
                      {skillSubCategory && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Sub-category:</span> {skillSubCategory}
                        </p>
                      )}
                      {skillDescription && (
                        <p className="text-xs text-gray-500">{skillDescription}</p>
                      )}
                      {(option.expectedProficiency || option.expected_proficiency) && (
                        <p className="text-xs text-green-600">
                          <span className="font-medium">Expected Proficiency:</span> {option.expectedProficiency || option.expected_proficiency}/6
                        </p>
                      )}
                    </div>
                  )}
                  {!isExpanded && (
                    <p className="text-xs text-gray-400 italic">Click to see details</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((option: any, index: number) => (
              <button
                key={index}
                onClick={async (e) => {
                  // Prevent any default form behavior
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const selectedName = option.name;
                  console.log('[SkillGapSelection] Button clicked - option:', selectedName, 'currentStep:', currentStep);
                  
                  // CRITICAL FIX: Only handle industry and department steps here
                  // REMOVED: Job role step - flow is now Industry → Department only
                  // REMOVED: Auto-fetching departments on industry selection
                  // Now user must explicitly ask for department list by sending a message
                  if (currentStep === 'industry') {
                    console.log('[SkillGapSelection] Handling INDUSTRY selection');
                    setSkillGapFlow(prev => ({
                      ...prev,
                      industry: selectedName,
                      currentStep: 'department',
                      selectedValue: selectedName
                    }));
                    // Just set the input text - user must send the message to get departments
                    setInput(`Selected Industry as ${selectedName}`);
                    
                    // SECURITY FIX: Explicitly do NOT call any APIs here
                    // User must press Enter to send the message and trigger department list
                  } else if (currentStep === 'department') {
                    console.log('[SkillGapSelection] Department selected - fetching job roles');
                    
                    // Update skill gap flow state
                    const updatedState = {
                      ...skillGapFlow,
                      department: selectedName,
                      departmentId: option.id,
                      currentStep: 'jobRole' as const,
                      selectedValue: selectedName
                    };
                    setSkillGapFlow(updatedState);
                    
                    // Call API to get job roles for the selected department
                    setIsLoading(true);
                    
                    const apiEndpoint = '/api/skill-gap-analysis';
                    const requestBody = {
                      currentStep: 'jobRole',
                      industry: skillGapFlow.industry,
                      department: selectedName,
                      departmentId: option.id
                    };
                    
                    console.log('[SkillGapSelection] Calling job roles API:', requestBody);
                    
                    fetch(apiEndpoint, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(requestBody)
                    })
                    .then(res => res.json())
                    .then(data => {
                      console.log('[SkillGapSelection] Job roles API response:', data);
                      
                      const botMessage: Message = {
                        id: Date.now().toString(),
                        type: 'bot',
                        content: `You selected ${selectedName} department. Now select your job role:`,
                        timestamp: new Date(),
                        metadata: {
                          action: 'SHOW_SKILL_GAP_OPTIONS',
                          selectionOptions: data.data || [],
                          stepLabel: `Job Roles in ${selectedName}`,
                          currentStep: 'jobRole',
                          nextStep: 'jobRole',
                          entities: {
                            industry: skillGapFlow.industry,
                            department: selectedName,
                            departmentId: option.id
                          }
                        }
                      };
                      
                      setMessages(prev => [...prev, botMessage]);
                    })
                    .catch(err => {
                      console.error('[SkillGapSelection] Error fetching job roles:', err);
                    })
                    .finally(() => {
                      setIsLoading(false);
                    });
                  } else if (currentStep === 'skills') {
                    // When user selects a skill, trigger the rating prompt flow
                    console.log('[SkillGapSelection] Skills selected - triggering rating prompt');
                    // Update state and call API
                    handleSelect({ id: option.id, name: option.name });
                  } else if (currentStep === 'rating_prompt') {
                    // Rating prompt is handled by RatingPrompt component, not here
                    console.log('[SkillGapSelection] Rating prompt - handled by RatingPrompt component');
                  } else {
                    // For other steps, just put text in input box
                    setInput(`Select my ${currentStep} as ${selectedName}`);
                  }
                }}
                className="w-full px-4 py-3 text-left text-sm bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all shadow-sm"
              >
                <span className="font-medium text-green-800">{option.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Show rating prompt inline after skills list when currentStep is 'skills' AND no rating_prompt message exists yet */}
        {currentStep === 'skills' && !messages.some(m => m.metadata?.currentStep === 'rating_prompt') && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm text-green-800 mb-3">
              Would you like to rate your skills? This will help us analyze your skill gap.
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  console.log('[SkillGapSelection] User clicked YES to rate skills');
                  // Get job role info from skillGapFlow state first, then fallback to message metadata
                  let jobRole = skillGapFlow.jobRole || message?.metadata?.jobRole;
                  let jobRoleId = skillGapFlow.jobRoleId || message?.metadata?.jobRoleId;
                  console.log('[SkillGapSelection] Job role info from state:', { jobRole, jobRoleId });

                  // If jobRoleId is not available, try to fetch it from the API
                  if (!jobRoleId && jobRole) {
                    console.log('[SkillGapSelection] jobRoleId not found, attempting to fetch from API');
                    try {
                      // Get sub_institute_id from localStorage
                      let subInstituteId = '1'; // default value
                      if (typeof window !== 'undefined') {
                        try {
                          const sessionData = localStorage.getItem('userData');
                          if (sessionData) {
                            const parsed = JSON.parse(sessionData);
                            subInstituteId = parsed.sub_institute_id || '1';
                          }
                        } catch (e) {
                          console.error('[SkillGapSelection] Error reading session data:', e);
                        }
                      }

                      // Try to get industry and department from skillGapFlow or message metadata
                      const industry = skillGapFlow.industry || (message?.metadata as any)?.industry || '';
                      const department = skillGapFlow.department || (message?.metadata as any)?.department || '';

                      // Call get-job-roles API to find the job role ID
                      let apiUrl = '';
                      if (industry && department) {
                        apiUrl = `https://hp.triz.co.in/table_data?table=s_user_jobrole&filters[sub_institute_id]=${subInstituteId}&filters[industries]=${encodeURIComponent(industry)}&filters[department]=${encodeURIComponent(department)}&group_by=jobrole`;
                      } else {
                        // If no industry/department, try to get all job roles and find matching one
                        apiUrl = `https://hp.triz.co.in/table_data?table=s_user_jobrole&filters[sub_institute_id]=${subInstituteId}&group_by=jobrole`;
                      }

                      console.log('[SkillGapSelection] Fetching job roles from:', apiUrl);
                      const jobRolesResponse = await fetch(apiUrl);

                      if (jobRolesResponse.ok) {
                        const jobRolesData = await jobRolesResponse.json();
                        let jobRolesList = [];

                        if (Array.isArray(jobRolesData)) {
                          jobRolesList = jobRolesData;
                        } else if (jobRolesData.data && Array.isArray(jobRolesData.data)) {
                          jobRolesList = jobRolesData.data;
                        } else if (jobRolesData.result && Array.isArray(jobRolesData.result)) {
                          jobRolesList = jobRolesData.result;
                        }

                        // Find the matching job role by name (case-insensitive)
                        const matchedJobRole = jobRolesList.find((jr: any) =>
                          (jr.jobrole || jr.job_role || jr.jobRoleName || '').toLowerCase() === jobRole.toLowerCase()
                        );

                        if (matchedJobRole && matchedJobRole.id) {
                          jobRoleId = matchedJobRole.id;
                          console.log('[SkillGapSelection] Found jobRoleId:', jobRoleId);
                        }
                      }
                    } catch (e) {
                      console.error('[SkillGapSelection] Error fetching job role ID:', e);
                    }
                  }

                  // Validate that job role is selected
                  if (!jobRoleId || !jobRole) {
                    console.error('[SkillGapSelection] Job role not selected. jobRoleId:', jobRoleId, 'jobRoleName:', jobRole);
                    const errorBotMessage: Message = {
                      id: Date.now().toString(),
                      type: 'bot',
                      content: 'Please select a job role first before rating your skills.',
                      timestamp: new Date(),
                      metadata: {
                        canEscalate: true,
                        currentStep: 'complete'
                      }
                    };
                    setMessages(prev => [...prev, errorBotMessage]);
                    return;
                  }

                  // Show loading state
                  setIsLoading(true);

                  try {
                    // Get sub_institute_id from localStorage
                    let subInstituteId = '1'; // default value
                    if (typeof window !== 'undefined') {
                      try {
                        const sessionData = localStorage.getItem('userData');
                        if (sessionData) {
                          const parsed = JSON.parse(sessionData);
                          subInstituteId = parsed.sub_institute_id || '1';
                        }
                      } catch (e) {
                        console.error('[SkillGapSelection] Error reading session data:', e);
                      }
                    }

                    // Call the API to get skills with proficiency levels
                    const apiUrl = `https://hp.triz.co.in/get-kaba?sub_institute_id=${subInstituteId}&type=jobrole&type_id=${jobRoleId}&title=${encodeURIComponent(jobRole)}`;

                    console.log('[SkillGapSelection] Calling API:', apiUrl);

                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                      throw new Error(`Failed to get response from ${apiUrl}`);
                    }

                    const data = await response.json();
                    console.log('[SkillGapSelection] API response:', data);

                    // Transform API response to expected format
                    const skillsData = data.skill || [];
                    const transformedSkills = skillsData.map((skill: any) => ({
                      id: skill.id,
                      name: skill.title,
                      expectedProficiency: parseInt(skill.proficiency_level) || 3,
                      proficiencyLevel: parseInt(skill.proficiency_level) || 3,
                      description: skill.description || '',
                      category: skill.category || '',
                      subCategory: skill.sub_category || ''
                    }));

                    console.log('[SkillGapSelection] Transformed skills:', transformedSkills);

                    // Update skill gap flow with options that include expected proficiency
                    setSkillGapFlow(prev => ({
                      ...prev,
                      currentStep: 'skill_rating',
                      options: transformedSkills,
                      skillRatings: {}
                    }));

                    // Create message to show skills with proficiency levels directly
                    const botMessage: Message = {
                      id: Date.now().toString(),
                      type: 'bot',
                      content: 'Please rate your skills:',
                      timestamp: new Date(),
                      metadata: {
                        selectionOptions: transformedSkills,
                        stepLabel: 'Rate Your Skills',
                        currentStep: 'skill_rating',
                        nextStep: 'complete',
                        action: 'SHOW_SKILL_RATING',
                        jobRole: jobRole,
                        jobRoleId: jobRoleId
                      }
                    };

                    setMessages(prev => [...prev, botMessage]);
                  } catch (error) {
                    console.error('[SkillGapSelection] Error calling API:', error);
                    const errorBotMessage: Message = {
                      id: Date.now().toString(),
                      type: 'bot',
                      content: 'Sorry, I encountered an error while loading your skills. Please try again.',
                      timestamp: new Date(),
                      metadata: {
                        canEscalate: true,
                        currentStep: 'rating_prompt'
                      }
                    };
                    setMessages(prev => [...prev, errorBotMessage]);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Yes, rate now'
                )}
              </button>
              <button
                onClick={() => {
                  console.log('[SkillGapSelection] User clicked SKIP');
                  // Show polite skip message
                  const botMessage: Message = {
                    id: Date.now().toString(),
                    type: 'bot',
                    content: 'No problem! You can rate your skills anytime later. Thank you!',
                    timestamp: new Date(),
                    metadata: {
                      currentStep: 'complete',
                      nextStep: 'complete',
                      action: 'FLOW_COMPLETE'
                    }
                  };
                  setMessages(prev => [...prev, botMessage]);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-all"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Phase 5: Rating Prompt Component (Yes/No)
  // This component is triggered when user clicks "Yes, rate now" after seeing the skill list
  // 
  // API Call Details:
  // URL: https://hp.triz.co.in/get-kaba
  // Parameters:
  //   - sub_institute_id: From localStorage (userData.sub_institute_id) - defaults to '3'
  //   - type: "jobrole" (fixed value)
  //   - type_id: jobRoleId from skillGapFlow state (set when user selected job role)
  //   - title: jobRole from skillGapFlow state (user selected job role name)
  //
  // Data Sources:
  //   - jobRoleId: Set in handleSelect when currentStep === 'jobRole' (line ~680)
  //     - Comes from: selectedOption.id (from get-job-roles API response)
  //     - API: src/app/api/get-job-roles/route.ts returns { id, name }
  //   - jobRole: Set in handleSelect when currentStep === 'jobRole' (line ~680)
  //     - Comes from: selectedOption.name (from get-job-roles API response)
  //   - subInstituteId: From localStorage userData.sub_institute_id
  //
  const RatingPrompt = ({ messageId }: { messageId: string }) => {
    const message = messages.find(m => m.id === messageId);
    const currentStep = message?.metadata?.currentStep;
    
    console.log('[RatingPrompt] Rendering - messageId:', messageId);
    console.log('[RatingPrompt] currentStep:', currentStep);

    const handleRatingResponse = async (response: 'yes' | 'no') => {
      console.log('[RatingPrompt] User responded:', response);
      
      if (response === 'no') {
        // User selected "Skip for now" - show polite message
        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: 'No problem! You can rate your skills anytime later. Thank you!',
          timestamp: new Date(),
          metadata: {
            currentStep: 'complete',
            nextStep: 'complete',
            action: 'FLOW_COMPLETE'
          }
        };
        setMessages(prev => [...prev, botMessage]);
        return;
      }
      
      // User selected "Yes, rate now" - fetch skills with proficiency levels
      try {
        setIsLoading(true);
        
        // Get sub_institute_id from localStorage
        let subInstituteId = '1'; // default value
        if (typeof window !== 'undefined') {
          try {
            const sessionData = localStorage.getItem('userData');
            if (sessionData) {
              const parsed = JSON.parse(sessionData);
              subInstituteId = parsed.sub_institute_id || '1';
            }
          } catch (e) {
            console.error('[RatingPrompt] Error reading session data:', e);
          }
        }
        
        // Call the new API endpoint: https://hp.triz.co.in/get-kaba
        // API Parameters:
        // - subInstituteId: from localStorage userData.sub_institute_id (default '3')
        // - type: 'jobrole' (indicates we want job role competency data)
        // - type_id: jobRoleId - the ID of the selected job role
        //   * From skillGapFlow.jobRoleId (set when job role is selected via dropdown - see line ~695)
        //   * From message.metadata.jobRoleId (set when user types "select my jobrole as X" - see route.ts)
        // - title: jobRoleName - the name of the selected job role
        //   * From skillGapFlow.jobRole (set when job role is selected via dropdown - see line ~695)
        //   * From message.metadata.jobRole (set when user types "select my jobrole as X" or "select my skills for X" - see route.ts)
        //
        // Data Flow:
        // 1. When user selects job role from dropdown -> handleSelect sets skillGapFlow.jobRoleId and skillGapFlow.jobRole
        // 2. When user types "select my jobrole as X" or "select my skills for X" -> route.ts searches for job role ID and includes in metadata
        // 3. The inline rating prompt (Yes button) creates a message with jobRole/jobRoleId from either source
        // 4. RatingPrompt reads from message.metadata or skillGapFlow state
        
        // Get job role info from message metadata (set in inline prompt) or fallback to skillGapFlow state
        // The inline prompt's Yes button stores jobRole and jobRoleId in the message metadata
        const messageJobRoleId = message?.metadata?.jobRoleId;
        const messageJobRole = message?.metadata?.jobRole;
        
        // Use message metadata first, then fallback to skillGapFlow state
        const jobRoleId = messageJobRoleId ?? 0;
        const jobRoleName = messageJobRole ?? skillGapFlow.jobRole;
        
        console.log('[RatingPrompt] Job role info:', {
          fromMessage: { jobRoleId: messageJobRoleId, jobRole: messageJobRole },
          fromState: { jobRoleId: skillGapFlow.jobRoleId, jobRole: skillGapFlow.jobRole },
          final: { jobRoleId, jobRoleName }
        });
        
        // Validate that job role is selected
        if (!jobRoleId || !jobRoleName) {
          console.error('[RatingPrompt] Job role not selected. jobRoleId:', jobRoleId, 'jobRoleName:', jobRoleName);
          const errorBotMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            content: 'Please select a job role first before rating your skills.',
            timestamp: new Date(),
            metadata: {
              canEscalate: true,
              currentStep: 'complete'
            }
          };
          setMessages(prev => [...prev, errorBotMessage]);
          setIsLoading(false);
          return;
        }
        
        const apiUrl = `https://hp.triz.co.in/get-kaba?sub_institute_id=${subInstituteId}&type=jobrole&type_id=${jobRoleId}&title=${encodeURIComponent(jobRoleName)}`;
        
        console.log('[RatingPrompt] Calling API:', apiUrl);
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to get response from ${apiUrl}`);
        }

        const data = await response.json();
        console.log('[RatingPrompt] API response:', data);
        
        // Transform API response to expected format
        // API returns: { skill: [{ id, category, sub_category, title, description, proficiency_level }] }
        const skillsData = data.skill || [];
        const transformedSkills = skillsData.map((skill: any) => ({
          id: skill.id,
          name: skill.title,
          expectedProficiency: parseInt(skill.proficiency_level) || 3,
          proficiencyLevel: parseInt(skill.proficiency_level) || 3,
          description: skill.description || '',
          category: skill.category || '',
          subCategory: skill.sub_category || ''
        }));
        
        console.log('[RatingPrompt] Transformed skills:', transformedSkills);

        // Update skill gap flow with options that include expected proficiency
        setSkillGapFlow(prev => ({
          ...prev,
          currentStep: 'skill_rating',
          options: transformedSkills,
          skillRatings: {}
        }));

        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Please rate your skills:',
          timestamp: new Date(),
          metadata: {
            selectionOptions: transformedSkills,
            stepLabel: 'Rate Your Skills',
            currentStep: 'skill_rating',
            nextStep: 'complete',
            action: 'SHOW_SKILL_RATING'
          }
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('[RatingPrompt] Error calling API:', error);
        const errorBotMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Sorry, I encountered an error while loading your skills. Please try again.',
          timestamp: new Date(),
          metadata: {
            canEscalate: true,
            currentStep: 'rating_prompt'
          }
        };
        setMessages(prev => [...prev, errorBotMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="mt-3 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl border border-purple-200 shadow-sm">
        <h4 className="text-sm sm:text-base font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          Skill Rating
        </h4>
        
        <p className="text-sm sm:text-base text-purple-800 mb-4 sm:mb-5">
          Would you like to rate your skills? This will help us analyze your skill gap.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => handleRatingResponse('yes')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Yes, rate now'
            )}
          </button>
          <button
            onClick={() => handleRatingResponse('no')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  };

  // Phase 6: Skill Rating Component (with proficiency levels)
  const SkillRating = ({ messageId }: { messageId: string }) => {
    const message = messages.find(m => m.id === messageId);
    const options = message?.metadata?.selectionOptions || [];
    
    // Use local state to track ratings for each skill
    const [localRatings, setLocalRatings] = useState<Record<string, number>>({});
    const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
    
    console.log('[SkillRating] Rendering - messageId:', messageId);
    console.log('[SkillRating] options:', options);

    const handleRatingSelect = (skillName: string, rating: number) => {
      console.log('[SkillRating] Rating selected:', skillName, '=', rating);
      setLocalRatings(prev => ({ ...prev, [skillName]: rating }));
    };

    const handleSubmitRatings = async () => {
      console.log('[SkillRating] Submitting ratings:', localRatings);
      
      // Check if all skills are rated
      const allSkillsRated = options.every((opt: any) => localRatings[opt.name]);
      if (!allSkillsRated) {
        alert('Please rate all skills before submitting.');
        return;
      }

      try {
        setIsLoading(true);
        
        // Prepare ratings data
        const ratingsData = options.map((opt: any) => ({
          skill: opt.name,
          expectedProficiency: opt.expectedProficiency || 3,
          userRating: localRatings[opt.name]
        }));
        
        console.log('[SkillRating] Submitting ratings data:', ratingsData);

        // Show success message
        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Thank you! Your skill ratings have been submitted successfully.\n\nIf you want to proceed to skill gap calculation and report generation, type "proceed"?',
          timestamp: new Date(),
          metadata: {
            currentStep: 'complete',
            nextStep: 'complete',
            action: 'FLOW_COMPLETE'
          }
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Update skill gap flow state
        setSkillGapFlow(prev => ({
          ...prev,
          currentStep: 'complete',
          skillRatings: localRatings,
          ratingsSubmitted: true
        }));
        
        // Store skills and ratings in localStorage
        if (typeof window !== 'undefined') {
          try {
            const skillData = {
              jobRole: skillGapFlow.jobRole,
              jobRoleId: skillGapFlow.jobRoleId,
              industry: skillGapFlow.industry,
              department: skillGapFlow.department,
              skills: options.map((opt: any) => ({
                id: opt.id,
                name: opt.name,
                expectedProficiency: opt.expectedProficiency || 3,
                userRating: localRatings[opt.name]
              })),
              submittedAt: new Date().toISOString()
            };
            localStorage.setItem('skillGapRatings', JSON.stringify(skillData));
            console.log('[SkillRating] Stored skill data in localStorage:', skillData);
          } catch (e) {
            console.error('[SkillRating] Error storing skill data in localStorage:', e);
          }
        }
        
      } catch (error) {
        console.error('[SkillRating] Error submitting ratings:', error);
        const errorBotMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Sorry, I encountered an error while submitting your ratings. Please try again.',
          timestamp: new Date(),
          metadata: {
            canEscalate: true,
            currentStep: 'skill_rating'
          }
        };
        setMessages(prev => [...prev, errorBotMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    const allRated = options.length > 0 && options.every((opt: any) => localRatings[opt.name]);

    return (
      <div className="mt-3 box-border w-full max-w-full">
        <div className="w-full max-w-full overflow-hidden p-4 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl border border-indigo-200 shadow-sm">
                        
          <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            Please rate your skills
          </h4>

          <div className="space-y-2 sm:space-y-3 max-h-56 sm:max-h-72 md:max-h-80 lg:max-h-96 max-w-full overflow-x-hidden overflow-y-auto pr-1 sm:pr-2">
            {options.map((option: any, index: number) => {
              const expectedLevel = option.expectedProficiency || 3;
              const ratingOptions = Array.from({ length: expectedLevel }, (_, i) => i + 1);
              
              return (
                <div key={index} className="flex flex-col items-start justify-between gap-2 sm:gap-3 md:gap-4 bg-white p-2 sm:p-2.5 md:p-3 rounded-lg border border-indigo-100">
                  <div className="flex flex-col gap-0.5 min-w-0 w-full">
                    <span className="text-xs font-medium text-gray-800 break-words" title={option.name}>
                      {option.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Level: {expectedLevel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 w-full">
                    {ratingOptions.map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingSelect(option.name, rating)}
                        className={`flex-1 sm:flex-none min-w-[32px] sm:min-w-[36px] md:min-w-[40px] h-7 sm:h-8 md:h-9 px-2 text-xs sm:text-sm font-medium rounded transition-all ${
                          localRatings[option.name] === rating
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSubmitRatings}
            disabled={!allRated || isLoading}
            className="w-full mt-3 sm:mt-4 px-3 py-2 sm:px-4 sm:py-2.5 md:py-3 text-sm sm:text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Ratings'
            )}
          </button>
        </div>
      </div>
    );
  };

  //   if (!isOpen) {
  //   return (
  //     <button
  //       onClick={() => setIsOpen(true)}
  //       className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all"
  //     >
  //       <Bot className="w-6 h-6 text-blue-600" />
  //     </button>
  //   );
  // }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 sm:bg-black/10 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Right Wall Panel */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              closed: {
                opacity: 0,
                scaleX: 0,
                scaleY: 0,
                y: 0,
                zIndex: 30, // Below button
                borderRadius: "50%",
                transition: {
                  type: "spring", damping: 25, stiffness: 140, mass: 1,
                  staggerChildren: 0.05, staggerDirection: -1
                }
              },
              open: {
                opacity: 1,
                scaleX: 1,
                scaleY: 1,
                y: 0,
                zIndex: 50, // Above everything
                borderRadius: "24px",
                transition: {
                  type: "spring", damping: 25, stiffness: 140, mass: 1,
                  staggerChildren: 0.1, delayChildren: 0.1
                }
              }
            }}

            style={{
              transformOrigin: `${origin.x}px ${origin.y}px`,
              willChange: "transform, border-radius",
              overflow: "hidden"
            }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 260,
              mass: 1,
              staggerChildren: 0.1,
              delayChildren: 0.2
            }}
            className={`fixed right-0 flex flex-col bg-white shadow-2xl border-l border-gray-200
                 top-16 sm:top-16 md:top-16 lg:top-16 xl:top-16 h-[calc(100vh-4rem)] 
                 ${isFullscreen 
                   ? 'w-screen max-w-screen left-0 border-l-0' 
                   : isPanelExpanded 
                     ? 'w-[90vw] max-w-[90vw]' 
                     : 'w-[360px] sm:w-[420px] md:w-[480px] lg:w-[520px] xl:w-[560px] max-w-[560px]'}
                 mx-2 sm:mx-0 overflow-hidden transition-all duration-300`}
          >
            {/* Header - Wrap in motion for stagger */}
            <motion.div
              variants={{
                closed: { opacity: 0, y: 10 },
                open: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0" // Ensure header doesn't shrink
            >
              <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-t-3xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base md:text-lg leading-tight">Conversational AI</h3>
                    {/* <p className="text-[10px] sm:text-xs text-white/90 hidden sm:block">Hello! I am Conversational AI, your assistant to help you with...</p> */}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  
                  <button
                    onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                    className="p-2 hover:bg-white/20 rounded-full text-white/90 transition-colors"
                    title={isPanelExpanded ? "Restore" : "Expand"}
                  >
                    {isPanelExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setShowNewConversationModal(true)}
                    className="p-2 hover:bg-white/20 rounded-full text-white/90 transition-colors"
                    title="New Conversation"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full text-white/90 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Messages */}
            <motion.div
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 bg-gray-50/50 flex flex-col"
              variants={{
                closed: { opacity: 0 },
                open: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              style={{ flexDirection: 'column' }}
            >
              {/* Logo/Branding Section - Welcome Message */}
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800">Conversational AI</h4>
                  {/* <p className="text-sm text-gray-500 mt-1 max-w-[200px] sm:max-w-[240px] md:max-w-[260px]">
                    Hello! I am Conversational AI, your assistant to help you with your queries. How can I assist you today?
                  </p> */}
                </div>
              </div>

              {/* Contextual Question Suggestions - Below Welcome Message */}
              {contextualSuggestions.length > 0 && messages.length <= 1 && (
                <div className="flex flex-col items-center justify-center py-4 space-y-3 px-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Suggested questions for {currentModule}
                  </p>
                  <div className="flex flex-col gap-2 w-full max-w-[220px] sm:max-w-[260px] md:max-w-[300px]">
                    {contextualSuggestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(question)}
                        className="px-4 py-3 text-sm text-left bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-gray-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex min-w-0 gap-3 ${message.type === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user"
                      ? "bg-gray-200"
                      : "bg-blue-100"
                      }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex min-w-0 flex-col gap-1 ${message.type === "user"
                      ? "items-end max-w-[75%] sm:max-w-[80%] md:max-w-[85%]"
                      : "flex-1 items-start max-w-full"
                      }`}
                  >
                    <div
                      className={`max-w-full px-4 py-3 text-sm shadow-sm ${message.type === "user"
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm break-words"
                      }`}
                    >
                      {message.type === 'bot' && message.metadata?.action === 'SHOW_SKILL_GAP_REPORT' && message.metadata?.skillGapReportData ? (
                        <SkillGapReport {...message.metadata.skillGapReportData} />
                      ) : message.type === 'bot' && message.metadata?.action === 'SHOW_COURSE_RECOMMENDATIONS' && message.metadata?.courseRecommendations?.length ? (
                        <div className="w-full min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                            <TrendingUp className="h-4 w-4" />
                            <span>{message.content}</span>
                          </div>
                          <CourseRecommendationCards courses={message.metadata.courseRecommendations} />
                        </div>
                      ) : message.type === 'bot' && message.metadata?.action === 'SHOW_GENERATED_PROFILE' && message.metadata?.generatedProfile ? (
                        <span></span>
                      ) : (
                        message.content
                      )}
                    </div>

                    {/* Metadata */}
                    {message.metadata?.tablesUsed && message.metadata.tablesUsed.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {message.metadata.tablesUsed.map((table, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium shadow-sm"
                          >
                            <Database className="w-3 h-3" />
                            <span>{table}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.metadata?.sql && (
                      <details className="w-full text-sm cursor-pointer group">
                        <summary className="hover:text-blue-600 font-medium text-gray-600 list-none flex items-center gap-2 transition-colors">
                          <Database className="w-4 h-4" />
                          View SQL Query
                          <span className="text-xs text-gray-400 group-hover:text-blue-400">▾</span>
                        </summary>
                        <div className="mt-3 p-4 bg-gray-900 text-green-400 rounded-xl overflow-x-auto border border-gray-700 shadow-lg">
                          <pre className="text-xs font-mono leading-relaxed">
                            {formatSQL(message.metadata.sql)}
                          </pre>
                        </div>
                      </details>
                    )}


                    {message.type === 'bot' && message.metadata?.canEscalate && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleFeedback(message.id, 1)}
                          className="p-1.5 rounded-full hover:bg-green-100 transition-colors"
                          title="Helpful"
                        >
                          <ThumbsUp className={`w-4 h-4 ${feedbackMessage === message.id && feedbackState?.rating === 1 ? 'text-green-600' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, -1)}
                          className="p-1.5 rounded-full hover:bg-red-100 transition-colors"
                          title="Not helpful"
                        >
                          <ThumbsDown className={`w-4 h-4 ${feedbackMessage === message.id && feedbackState?.rating === -1 ? 'text-red-600' : 'text-gray-400'}`} />
                        </button>
                        {!conversationId && userId && (
                          <button
                            onClick={() => setShowEscalationModal(true)}
                            className="ml-auto px-2 py-1 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                          >
                            Escalate
                          </button>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="text-xs text-gray-400 px-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {/* Phase 3: New CWFKT Form (replaces old Genkit Form) */}
                    {message.type === 'bot' && message.metadata?.action === 'SHOW_CWFKT_INPUT' && (
                      <CWFKTInput messageId={message.id} jdFormData={jdFormData} setJdFormData={setJdFormData} />
                    )}

                    {/* Phase 4: Skill Gap Selection */}
                    {message.type === 'bot' && message.metadata?.action === 'SHOW_SKILL_GAP_OPTIONS' && (
                      <SkillGapSelection messageId={message.id} />
                    )}

                    {/* NEW: Department Selection for Job Description */}
                    {message.type === 'bot' && message.metadata?.action === 'SHOW_DEPARTMENT_SELECTION' && (
                      <SkillGapSelection messageId={message.id} />
                    )}

                    {/* NEW: Job Role Input */}
                    {message.type === 'bot' && message.metadata?.action === 'SHOW_JOBROLE_INPUT' && (
                      <JobRoleInput messageId={message.id} />
                    )}


                    {/* Phase 5: Rating Prompt (Yes/No) */}
                    {message.type === 'bot' && message.metadata?.currentStep === 'rating_prompt' && (
                      <RatingPrompt messageId={message.id} />
                    )}

                    {/* Phase 6: Skill Rating (with proficiency levels) */}
                    {message.type === 'bot' && message.metadata?.action === 'SHOW_SKILL_RATING' && (
                      <SkillRating messageId={message.id} />
                    )}

                    {/* NEW: Generated Profile with Save JD Button */}
                    {message.type === 'bot' && message.metadata?.action === 'SHOW_GENERATED_PROFILE' && message.metadata?.generatedProfile && (
                     <div className="mt-3 max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1">
                        <GeneratedProfileUI 
                          profileData={message.metadata.generatedProfile} 
                          onSave={() => {}}
                        />
                      </div>
                    )}

                    {/* Phase 6: Contextual Follow-ups */}
                    {message.type === 'bot' && message.metadata?.intent === 'JOB_ROLE_COMPETENCY' && message.metadata?.action === 'SHOW_GENKIT_RESPONSE' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.metadata?.entities?.jobRole && (
                          <>
                            <button
                              onClick={() => setInput(`Compare ${message.metadata?.entities?.jobRole} with similar roles`)}
                              className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              Compare with similar roles
                            </button>
                            <button
                              onClick={() => setInput(`What are the critical skills for ${message.metadata?.entities?.jobRole}?`)}
                              className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              Show critical skills
                            </button>
                            <button
                              onClick={() => setInput(`What about a senior version of ${message.metadata?.entities?.jobRole}?`)}
                              className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              Senior version
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="message-enter flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600 text-white shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-200/80 flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Analyzing your data...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />

              {/* New Conversation Modal */}
              <AnimatePresence>
                {showNewConversationModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={() => setShowNewConversationModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: 20 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full border border-gray-100"
                    >
                      {/* Header with gradient */}
                      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Create New Conversation</h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-6 py-6">
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                          Are you sure you want to start a new conversation? This will clear the current chat history.
                        </p>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => {
                              clearChat();
                              setShowNewConversationModal(false);
                            }}
                            className="w-full px-5 py-3.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                          >
                            <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            New conversation
                          </button>
                          <button
                            onClick={() => setShowNewConversationModal(false)}
                            className="w-full px-5 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                          >
                            <X className="w-5 h-5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Input - Wrap in motion */}
            <motion.div
              variants={{
                closed: { opacity: 0, y: 20 },
                open: { opacity: 1, y: 0 }
              }}
              className="p-4 bg-white border-t border-gray-100"
            >
              {/* Save JD Button */}
              {/* <div className="flex justify-end mb-2">
            <button
              onClick={() => {
                console.log("Save JD clicked");
                // future: save JD logic here
              }}
              className="px-4 py-1.5 text-sm font-medium
             rounded-lg
             bg-blue-600 text-white
             hover:bg-blue-700
             transition-all
             shadow-sm"
>
              Save JD
            </button>
          </div> */}

              <div className="relative flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 sm:p-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full px-1 py-1 text-sm bg-transparent border-none focus:outline-none resize-none min-h-[40px] text-gray-700 placeholder-gray-400"
                />

                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1">
                    {/* Placeholder for future attachments or other icons */}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition-all duration-150
                    ${isListening
                          ? 'bg-red-50 text-red-600 animate-pulse border border-red-200 ring-2 ring-red-100'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      title="Voice Input"
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="p-2 rounded-lg
                          text-blue-600
                          hover:bg-blue-50
                          disabled:text-gray-300
                          transition-all duration-150"
                      title="Send Message"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )
      }
    </AnimatePresence >
  )
};
