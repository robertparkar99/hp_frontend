// 
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Database, Loader2, ThumbsUp, ThumbsDown, X, MessageSquare, Maximize2, Minimize2, Trash2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { submitFeedback } from "@/lib1/feedback-service";
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
    };
  };
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
          entities: data.entities
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

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
          entities: data.entities
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
  // Phase 3: Genkit Form Component
  const GenkitForm = ({ messageId }: { messageId: string }) => {
    const missingFields = messages.find(m => m.id === messageId)?.metadata?.missingFields || [];

    return (
      <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
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

        <div className="flex gap-2 mt-4">
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
              damping: 28, // Adjusted for smoother motion
              stiffness: 260, // Slower than 400, snappier than 140
              mass: 1,
              staggerChildren: 0.1,
              delayChildren: 0.2
            }}
            className="fixed right-0 flex flex-col bg-white shadow-2xl border-l border-gray-200
                 top-16 sm:top-16 md:top-16 lg:top-16 xl:top-16 h-[calc(100vh-4rem)] 
                 w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] xl:w-[420px] max-w-[420px]
                 mx-2 sm:mx-0 overflow-hidden"
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
                    onClick={() => setShowNewConversationModal(true)}
                    className="p-2 hover:bg-white/20 rounded-full text-white/90 transition-colors"
                    title="New Conversation"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full text-white/90 transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Messages */}
            <motion.div
              className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 flex flex-col"
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
                  className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : "flex-row"
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
                    className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[80%] md:max-w-[85%] ${message.type === "user"
                      ? "items-end"
                      : "items-start"
                      }`}
                  >
                    <div
                      className={`px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${message.type === "user"
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"
                        }`}
                    >
                      {message.content}
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
                    {/* Phase 3: Genkit Form */}
                    {message.type === 'bot' && message.metadata?.action === 'SHOW_GENKIT_FORM' && (
                      <GenkitForm messageId={message.id} />
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
