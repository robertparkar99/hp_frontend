// import { useState, useRef, useEffect } from 'react';
// import { Send, Bot, User, Database, Loader2, X, MessageSquare } from 'lucide-react';

// interface Message {
//   id: string;
//   type: 'user' | 'bot';
//   content: string;
//   timestamp: Date;
//   metadata?: {
//     sql?: string;
//     tablesUsed?: string[];
//     insights?: string;
//   };
// }

// interface ChatbotCopilotProps {
//   position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
//   apiEndpoint?: string;
// }

// export default function ChatbotCopilot({
//   position = 'bottom-right',
//   apiEndpoint = '/api/chat'
// }: ChatbotCopilotProps) {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       type: 'bot',
//       content: 'Hi! I\'m your data assistant. Ask me anything about your data.',
//       timestamp: new Date()
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [sessionId] = useState(() => `session_${Date.now()}`);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const positionClasses = {
//     'bottom-right': 'bottom-6 right-6',
//     'bottom-left': 'bottom-6 left-6',
//     'top-right': 'top-6 right-6',
//     'top-left': 'top-6 left-6'
//   };

//   const handleSend = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       type: 'user',
//       content: input.trim(),
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await fetch(apiEndpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           query: userMessage.content,
//           sessionId,
//           conversationHistory: messages.slice(-6).map(m => ({
//             role: m.type === 'user' ? 'user' : 'assistant',
//             content: m.content
//           }))
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to get response');
//       }

//       const data = await response.json();

//       const botMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         type: 'bot',
//         content: data.answer || 'I couldn\'t process that request.',
//         timestamp: new Date(),
//         metadata: {
//           sql: data.sql,
//           tablesUsed: data.tables_used,
//           insights: data.insights
//         }
//       };

//       setMessages(prev => [...prev, botMessage]);
//     } catch (error) {
//       const errorMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         type: 'bot',
//         content: 'Sorry, I encountered an error. Please try again.',
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   if (!isOpen) {
//     return (
//       <button
//         onClick={() => setIsOpen(true)}
//         className={`fixed ${positionClasses[position]} z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group`}
//         style={{
//           animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
//         }}
//       >
//         <MessageSquare className="w-6 h-6" />
//         <style>{`
//           @keyframes pulse {
//             0%, 100% { opacity: 1; }
//             50% { opacity: 0.8; }
//           }
//         `}</style>
//       </button>
//     );
//   }

//   return (
//     <div
//       className={`fixed ${positionClasses[position]} z-50 w-96 h-[600px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}
//       style={{
//         animation: 'slideIn 0.3s ease-out'
//       }}
//     >
//       <style>{`
//         @keyframes slideIn {
//           from {
//             opacity: 0;
//             transform: translateY(20px) scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0) scale(1);
//           }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .message-enter {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>

//       <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-4 flex items-center justify-between shadow-md">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
//             <Bot className="w-5 h-5" />
//           </div>
//           <div>
//             <h3 className="font-semibold text-sm">Data Copilot</h3>
//             <p className="text-xs text-blue-100">AI Assistant</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setIsOpen(false)}
//           className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`message-enter flex gap-3 ${
//               message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
//             }`}
//           >
//             <div
//               className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
//                 message.type === 'user'
//                   ? 'bg-gradient-to-br from-gray-600 to-gray-700'
//                   : 'bg-gradient-to-br from-blue-500 to-blue-600'
//               } text-white shadow-sm`}
//             >
//               {message.type === 'user' ? (
//                 <User className="w-4 h-4" />
//               ) : (
//                 <Bot className="w-4 h-4" />
//               )}
//             </div>

//             <div
//               className={`flex flex-col gap-2 max-w-[75%] ${
//                 message.type === 'user' ? 'items-end' : 'items-start'
//               }`}
//             >
//               <div
//                 className={`rounded-2xl px-4 py-2.5 shadow-sm ${
//                   message.type === 'user'
//                     ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'
//                     : 'bg-white text-gray-800 border border-gray-200'
//                 }`}
//               >
//                 <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
//                   {message.content}
//                 </p>
//               </div>

//               {message.metadata?.tablesUsed && message.metadata.tablesUsed.length > 0 && (
//                 <div className="flex gap-2 flex-wrap">
//                   {message.metadata.tablesUsed.map((table, idx) => (
//                     <div
//                       key={idx}
//                       className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium"
//                     >
//                       <Database className="w-3 h-3" />
//                       <span>{table}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {message.metadata?.sql && (
//                 <details className="text-xs text-gray-500 cursor-pointer group">
//                   <summary className="hover:text-gray-700 font-medium">
//                     View SQL Query
//                   </summary>
//                   <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs font-mono border border-gray-700">
//                     {message.metadata.sql}
//                   </pre>
//                 </details>
//               )}

//               <span className="text-xs text-gray-400 px-1">
//                 {message.timestamp.toLocaleTimeString([], {
//                   hour: '2-digit',
//                   minute: '2-digit'
//                 })}
//               </span>
//             </div>
//           </div>
//         ))}

//         {isLoading && (
//           <div className="message-enter flex gap-3">
//             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
//               <Bot className="w-4 h-4" />
//             </div>
//             <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-2">
//               <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
//               <span className="text-sm text-gray-600">Thinking...</span>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       <div className="p-4 bg-white border-t border-gray-200">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Ask about your data..."
//             disabled={isLoading}
//             className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm text-gray-800 placeholder-gray-400"
//           />
//           <button
//             onClick={handleSend}
//             disabled={!input.trim() || isLoading}
//             className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
//           >
//             <Send className="w-4 h-4" />
//           </button>
//         </div>
//         <p className="text-xs text-gray-400 mt-2 text-center">
//           Press Enter to send • Shift+Enter for new line
//         </p>
//       </div>
//     </div>
//   );
// }


import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Database, Loader2, X, MessageSquare, Maximize2, Minimize2, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    sql?: string;
    tablesUsed?: string[];
    insights?: string;
  };
}

interface ChatbotCopilotProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  apiEndpoint?: string;
}

export default function ChatbotCopilot({
  position = 'bottom-right',
  apiEndpoint = '/api/chat'
}: ChatbotCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! 👋 I\'m your AI Data Assistant. I can help you analyze data, generate SQL queries, and provide insights. What would you like to know?',
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.answer || 'I couldn\'t process that request. Please try rephrasing your question.',
        timestamp: new Date(),
        metadata: {
          sql: data.sql,
          tablesUsed: data.tables_used,
          insights: data.insights
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please check your connection and try again.',
        timestamp: new Date()
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
        content: 'Hello! 👋 I\'m your AI Data Assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  const formatSQL = (sql: string) => {
    // Simple SQL formatting
    return sql
      .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|LIMIT)\b/gi, '\n$1')
      .replace(/,/g, ',\n  ')
      .trim();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-50 w-13 h-13 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center group backdrop-blur-sm border border-white/20`}
        style={{
          animation: 'float 3s ease-in-out infinite'
        }}
      >
        <MessageSquare className="w-7 h-7" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-5px) scale(1.05); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div
  className={`fixed ${positionClasses[position]} z-50 ${
    isExpanded 
      ? 'w-[95vw] h-[95vh] max-w-7xl max-h-[90vh]' 
      : 'w-[530px] h-[600px]'   // ← increased width only
  } flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden backdrop-blur-sm bg-white/95 transition-all duration-300`}

      style={{
        animation: 'slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.2); }
        }
        .message-enter {
          animation: messageSlide 0.3s ease-out;
        }
        .typing-dots {
          display: inline-block;
        }
        .typing-dots span {
          animation: typing 1.4s infinite;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Data Copilot</h3>
            <p className="text-blue-100 text-sm opacity-90">AI Assistant • Always Learning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`message-enter flex gap-4 ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.type === 'user'
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                  : 'bg-gradient-to-br from-blue-500 to-purple-500'
              } text-white`}
            >
              {message.type === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex flex-col gap-3 max-w-[85%] ${
                message.type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-5 py-3 shadow-sm backdrop-blur-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
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

              {/* Timestamp */}
              <span className="text-xs text-gray-400 px-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="message-enter flex gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-200/80 flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">Analyzing your data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-gray-200/80 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your data..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm text-gray-800 placeholder-gray-400 resize-none bg-white/80 backdrop-blur-sm transition-all duration-200"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
            {/* <div className="absolute bottom-2 right-2">
              <span className={`text-xs ${input.length > 200 ? 'text-red-400' : 'text-gray-400'}`}>
                {input.length}/200
              </span>
            </div> */}
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-medium shadow-md disabled:shadow-none"
            style={{
              animation: !input.trim() || isLoading ? 'none' : 'pulseGlow 2s infinite'
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
         <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
         </p>
          {/* <div className="flex gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 bg-gray-100 rounded-md">SQL</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">Analysis</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md">Insights</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}