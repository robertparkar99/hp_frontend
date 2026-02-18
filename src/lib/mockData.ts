export type AgentStatus = 'active' | 'idle' | 'error' | 'training';
export type RunStatus = 'success' | 'failed' | 'running' | 'pending';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  createdAt: string;
  lastRun: string;
  totalRuns: number;
  successRate: number;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  status: RunStatus;
  startTime: string;
  endTime?: string;
  duration: number;
  tokensUsed: number;
  cost: number;
  input: string;
  output: string;
}

export interface LogEntry {
  id: string;
  runId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  date: string;
  successRate: number;
  avgDuration: number;
  totalRuns: number;
  totalCost: number;
}

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and provides support',
    status: 'active',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are a helpful customer support assistant.',
    tools: ['knowledge_base', 'ticket_system', 'email'],
    createdAt: '2024-01-15T10:00:00Z',
    lastRun: '2024-03-20T14:30:00Z',
    totalRuns: 1247,
    successRate: 94.5,
  },
  {
    id: '2',
    name: 'Data Analyst Agent',
    description: 'Analyzes data and generates insights',
    status: 'idle',
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 4000,
    systemPrompt: 'You are a data analysis expert.',
    tools: ['sql_query', 'data_viz', 'statistics'],
    createdAt: '2024-02-01T09:00:00Z',
    lastRun: '2024-03-19T11:20:00Z',
    totalRuns: 532,
    successRate: 98.2,
  },
  {
    id: '3',
    name: 'Content Writer Agent',
    description: 'Creates and optimizes content',
    status: 'active',
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    maxTokens: 3000,
    systemPrompt: 'You are a creative content writer.',
    tools: ['grammar_check', 'seo_optimizer', 'plagiarism_check'],
    createdAt: '2024-01-20T12:00:00Z',
    lastRun: '2024-03-20T15:45:00Z',
    totalRuns: 892,
    successRate: 91.8,
  },
  {
    id: '4',
    name: 'Code Review Agent',
    description: 'Reviews code and suggests improvements',
    status: 'error',
    model: 'gpt-4',
    temperature: 0.2,
    maxTokens: 8000,
    systemPrompt: 'You are an expert code reviewer.',
    tools: ['linter', 'security_scanner', 'performance_analyzer'],
    createdAt: '2024-02-10T08:00:00Z',
    lastRun: '2024-03-20T16:00:00Z',
    totalRuns: 234,
    successRate: 88.5,
  },
];

export const mockRuns: AgentRun[] = [
  {
    id: 'run-1',
    agentId: '1',
    agentName: 'Customer Support Agent',
    status: 'success',
    startTime: '2024-03-20T14:30:00Z',
    endTime: '2024-03-20T14:30:12Z',
    duration: 12,
    tokensUsed: 450,
    cost: 0.009,
    input: 'How do I reset my password?',
    output: 'To reset your password, please follow these steps...',
  },
  {
    id: 'run-2',
    agentId: '2',
    agentName: 'Data Analyst Agent',
    status: 'success',
    startTime: '2024-03-19T11:20:00Z',
    endTime: '2024-03-19T11:21:45Z',
    duration: 105,
    tokensUsed: 2340,
    cost: 0.047,
    input: 'Analyze sales trends for Q1 2024',
    output: 'Based on the data analysis...',
  },
  {
    id: 'run-3',
    agentId: '3',
    agentName: 'Content Writer Agent',
    status: 'running',
    startTime: '2024-03-20T15:45:00Z',
    duration: 0,
    tokensUsed: 0,
    cost: 0,
    input: 'Write a blog post about AI trends',
    output: '',
  },
  {
    id: 'run-4',
    agentId: '4',
    agentName: 'Code Review Agent',
    status: 'failed',
    startTime: '2024-03-20T16:00:00Z',
    endTime: '2024-03-20T16:00:05Z',
    duration: 5,
    tokensUsed: 120,
    cost: 0.002,
    input: 'Review authentication.ts',
    output: 'Error: Unable to parse file',
  },
];

export const mockLogs: LogEntry[] = [
  {
    id: 'log-1',
    runId: 'run-1',
    timestamp: '2024-03-20T14:30:01Z',
    level: 'info',
    message: 'Agent initialized successfully',
  },
  {
    id: 'log-2',
    runId: 'run-1',
    timestamp: '2024-03-20T14:30:03Z',
    level: 'info',
    message: 'Processing user input',
  },
  {
    id: 'log-3',
    runId: 'run-1',
    timestamp: '2024-03-20T14:30:08Z',
    level: 'info',
    message: 'Tool: knowledge_base executed',
    metadata: { tool: 'knowledge_base', duration: 3.2 },
  },
  {
    id: 'log-4',
    runId: 'run-4',
    timestamp: '2024-03-20T16:00:03Z',
    level: 'error',
    message: 'File parsing failed',
    metadata: { error: 'SyntaxError', file: 'authentication.ts' },
  },
];

export const mockPerformanceData: PerformanceMetric[] = [
  { date: '2024-03-14', successRate: 92, avgDuration: 15, totalRuns: 120, totalCost: 2.45 },
  { date: '2024-03-15', successRate: 94, avgDuration: 14, totalRuns: 135, totalCost: 2.78 },
  { date: '2024-03-16', successRate: 91, avgDuration: 16, totalRuns: 142, totalCost: 2.91 },
  { date: '2024-03-17', successRate: 95, avgDuration: 13, totalRuns: 128, totalCost: 2.62 },
  { date: '2024-03-18', successRate: 93, avgDuration: 15, totalRuns: 151, totalCost: 3.12 },
  { date: '2024-03-19', successRate: 96, avgDuration: 12, totalRuns: 138, totalCost: 2.84 },
  { date: '2024-03-20', successRate: 94, avgDuration: 14, totalRuns: 145, totalCost: 2.98 },
];

export interface FailurePattern {
  id: string;
  pattern: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  affectedAgents: string[];
  examples: string[];
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'cost' | 'reliability' | 'accuracy';
  estimatedImpact: string;
  implementationComplexity: 'easy' | 'moderate' | 'complex';
  affectedAgents: string[];
}

export interface ReflectionInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  insight: string;
}

export const mockFailurePatterns: FailurePattern[] = [
  {
    id: 'fp-1',
    pattern: 'API Rate Limiting',
    frequency: 23,
    impact: 'high',
    affectedAgents: ['Customer Support Agent', 'Data Analyst Agent'],
    examples: [
      'Failed to complete search due to rate limit (429 error)',
      'API quota exceeded during peak hours',
      'Too many requests in short timeframe'
    ]
  },
  {
    id: 'fp-2',
    pattern: 'Context Length Exceeded',
    frequency: 15,
    impact: 'medium',
    affectedAgents: ['Content Writer Agent'],
    examples: [
      'Input prompt exceeded 8k token limit',
      'Combined context too large for model processing',
      'Long conversation history causing overflow'
    ]
  },
  {
    id: 'fp-3',
    pattern: 'Tool Selection Errors',
    frequency: 12,
    impact: 'medium',
    affectedAgents: ['Customer Support Agent', 'Email Marketing Agent'],
    examples: [
      'Selected wrong tool for task (used Calculator instead of Search)',
      'Failed to recognize need for database query',
      'Attempted to use unavailable tool'
    ]
  },
  {
    id: 'fp-4',
    pattern: 'Timeout Issues',
    frequency: 8,
    impact: 'low',
    affectedAgents: ['Data Analyst Agent'],
    examples: [
      'Query processing exceeded 30s timeout',
      'Large dataset analysis taking too long',
      'External API response delayed'
    ]
  }
];

export const mockOptimizations: OptimizationSuggestion[] = [
  {
    id: 'opt-1',
    title: 'Implement Request Rate Limiting',
    description: 'Add exponential backoff and request queuing to handle API rate limits gracefully. This will reduce failures by 85% based on pattern analysis.',
    priority: 'high',
    category: 'reliability',
    estimatedImpact: '+8% success rate, -23 failures/week',
    implementationComplexity: 'moderate',
    affectedAgents: ['Customer Support Agent', 'Data Analyst Agent']
  },
  {
    id: 'opt-2',
    title: 'Switch to GPT-4 Turbo for Long Context',
    description: 'Upgrade Content Writer Agent to GPT-4 Turbo which supports 128k tokens. This eliminates context length errors entirely.',
    priority: 'high',
    category: 'reliability',
    estimatedImpact: '+5% success rate, -15 failures/week',
    implementationComplexity: 'easy',
    affectedAgents: ['Content Writer Agent']
  },
  {
    id: 'opt-3',
    title: 'Improve Tool Selection Prompts',
    description: 'Refine system prompts with explicit tool usage examples and decision trees. Add tool selection validation step.',
    priority: 'medium',
    category: 'accuracy',
    estimatedImpact: '+3% success rate, better tool usage',
    implementationComplexity: 'moderate',
    affectedAgents: ['Customer Support Agent', 'Email Marketing Agent']
  },
  {
    id: 'opt-4',
    title: 'Optimize Database Query Performance',
    description: 'Add query result caching and pagination for large datasets. Implement incremental processing for data analysis tasks.',
    priority: 'medium',
    category: 'performance',
    estimatedImpact: '-1.2s avg duration, -$0.45/day cost',
    implementationComplexity: 'complex',
    affectedAgents: ['Data Analyst Agent']
  },
  {
    id: 'opt-5',
    title: 'Reduce Token Usage with Summarization',
    description: 'Implement conversation history summarization to keep context under control while preserving important details.',
    priority: 'low',
    category: 'cost',
    estimatedImpact: '-15% token usage, -$1.20/day cost',
    implementationComplexity: 'moderate',
    affectedAgents: ['Customer Support Agent', 'Content Writer Agent']
  }
];

export const mockReflectionInsights: ReflectionInsight[] = [
  {
    id: 'ins-1',
    type: 'success',
    metric: 'Overall Success Rate',
    value: '95.2%',
    trend: 'up',
    insight: 'Success rate improved by 2.5% over the last 7 days. The optimization to GPT-4 for Customer Support Agent is showing positive results.'
  },
  {
    id: 'ins-2',
    type: 'warning',
    metric: 'Peak Hour Failures',
    value: '23 failures',
    trend: 'up',
    insight: 'API rate limiting issues spike during 2-4 PM EST. Consider implementing request queuing or upgrading API tier.'
  },
  {
    id: 'ins-3',
    type: 'info',
    metric: 'Average Cost per Run',
    value: '$0.023',
    trend: 'stable',
    insight: 'Cost efficiency remains consistent. GPT-3.5 Turbo usage balances performance and cost effectively for most tasks.'
  },
  {
    id: 'ins-4',
    type: 'success',
    metric: 'Agent Response Time',
    value: '2.1s',
    trend: 'down',
    insight: 'Response times decreased by 15% after implementing caching strategy. User experience significantly improved.'
  },
  {
    id: 'ins-5',
    type: 'info',
    metric: 'Tool Selection Accuracy',
    value: '88%',
    trend: 'stable',
    insight: 'Agents are selecting appropriate tools in most cases. Remaining errors are edge cases that require prompt refinement.'
  }
];

// Agent-specific performance data for comparison
export const mockAgentPerformanceData = {
  'Customer Support Agent': [
    { date: '2024-03-14', successRate: 94, avgDuration: 12, totalRuns: 45, totalCost: 0.92 },
    { date: '2024-03-15', successRate: 95, avgDuration: 11, totalRuns: 52, totalCost: 1.05 },
    { date: '2024-03-16', successRate: 93, avgDuration: 13, totalRuns: 48, totalCost: 0.98 },
    { date: '2024-03-17', successRate: 96, avgDuration: 10, totalRuns: 50, totalCost: 1.02 },
    { date: '2024-03-18', successRate: 94, avgDuration: 12, totalRuns: 55, totalCost: 1.12 },
    { date: '2024-03-19', successRate: 97, avgDuration: 9, totalRuns: 51, totalCost: 1.04 },
    { date: '2024-03-20', successRate: 95, avgDuration: 11, totalRuns: 53, totalCost: 1.08 },
  ],
  'Data Analyst Agent': [
    { date: '2024-03-14', successRate: 98, avgDuration: 35, totalRuns: 22, totalCost: 0.68 },
    { date: '2024-03-15', successRate: 97, avgDuration: 38, totalRuns: 25, totalCost: 0.78 },
    { date: '2024-03-16', successRate: 98, avgDuration: 34, totalRuns: 28, totalCost: 0.86 },
    { date: '2024-03-17', successRate: 99, avgDuration: 32, totalRuns: 23, totalCost: 0.71 },
    { date: '2024-03-18', successRate: 98, avgDuration: 36, totalRuns: 30, totalCost: 0.93 },
    { date: '2024-03-19', successRate: 99, avgDuration: 31, totalRuns: 26, totalCost: 0.80 },
    { date: '2024-03-20', successRate: 98, avgDuration: 33, totalRuns: 27, totalCost: 0.83 },
  ],
  'Content Writer Agent': [
    { date: '2024-03-14', successRate: 90, avgDuration: 18, totalRuns: 38, totalCost: 0.62 },
    { date: '2024-03-15', successRate: 92, avgDuration: 17, totalRuns: 42, totalCost: 0.69 },
    { date: '2024-03-16', successRate: 89, avgDuration: 19, totalRuns: 45, totalCost: 0.74 },
    { date: '2024-03-17', successRate: 93, avgDuration: 16, totalRuns: 40, totalCost: 0.65 },
    { date: '2024-03-18', successRate: 91, avgDuration: 18, totalRuns: 48, totalCost: 0.79 },
    { date: '2024-03-19', successRate: 94, avgDuration: 15, totalRuns: 43, totalCost: 0.71 },
    { date: '2024-03-20', successRate: 92, avgDuration: 17, totalRuns: 46, totalCost: 0.76 },
  ],
  'Code Review Agent': [
    { date: '2024-03-14', successRate: 86, avgDuration: 45, totalRuns: 15, totalCost: 0.23 },
    { date: '2024-03-15', successRate: 89, avgDuration: 42, totalRuns: 16, totalCost: 0.26 },
    { date: '2024-03-16', successRate: 85, avgDuration: 48, totalRuns: 21, totalCost: 0.33 },
    { date: '2024-03-17', successRate: 91, avgDuration: 40, totalRuns: 15, totalCost: 0.24 },
    { date: '2024-03-18', successRate: 88, avgDuration: 43, totalRuns: 18, totalCost: 0.28 },
    { date: '2024-03-19', successRate: 92, avgDuration: 38, totalRuns: 18, totalCost: 0.29 },
    { date: '2024-03-20', successRate: 89, avgDuration: 41, totalRuns: 19, totalCost: 0.31 },
  ],
};
