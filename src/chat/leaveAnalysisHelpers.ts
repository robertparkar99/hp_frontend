export const LEAVE_ANALYSIS_PHRASES = [
  'leave abuse',
  'abnormal leave',
  'leave pattern risk',
  'leave pattern',
  'leave abuse risk',
  'frequent leave',
  'show repeated monday leave patterns',
  'show employees with highest leave risk',
  'show high unplanned leave behaviour',
  'show abnormal leave pattern',
  'show leave abuse or abnormal leave pattern risk',
];

export const LEAVE_ANALYSIS_INPUT_FIELDS = [
  {
    name: "from_date",
    type: "date",
    label: "From Date",
  },
  {
    name: "to_date",
    type: "date",
    label: "To Date",
  },
];

export function hasLeaveAnalysisDateRange(input: {
  start_date?: string;
  end_date?: string;
  startDate?: string;
  endDate?: string;
  params?: {
    startDate?: string;
    endDate?: string;
  };
  filters?: {
    fromDate?: string;
    toDate?: string;
  };
} | undefined): boolean {
  if (!input) return false;

  const fromDate = input.start_date ?? input.startDate ?? input.params?.startDate ?? input.filters?.fromDate;
  const toDate = input.end_date ?? input.endDate ?? input.params?.endDate ?? input.filters?.toDate;

  return Boolean(fromDate && toDate);
}

export function isLeavePatternQuery(value: string): boolean {
  const lower = value.toLowerCase();
  return LEAVE_ANALYSIS_PHRASES.some((phrase) => lower.includes(phrase));
}

export function resolveDefaultLeaveAnalysisType(value: string): string | undefined {
  const lower = value.toLowerCase();

  if (lower.includes("monday")) {
    return "monday_leave_pattern";
  }

  if (lower.includes("friday")) {
    return "friday_leave_pattern";
  }

  if (lower.includes("unplanned")) {
    return "unplanned_leave_pattern";
  }

  if (lower.includes("cluster")) {
    return "leave_clustering";
  }

  if (
    lower.includes("highest leave risk") ||
    lower.includes("employees with highest leave risk") ||
    lower.includes("total leave risk")
  ) {
    return "total_leave_risk";
  }

  if (lower.includes("abuse") || lower.includes("abnormal") || lower.includes("risk")) {
    return "total_leave_risk";
  }

  return undefined;
}

export interface LeaveAnalysisSummary {
  analysisLabel?: string;
  riskAssessment?: string;
  message?: string;
  highRiskEmployees?: number;
  highRiskEmployeeDetails?: Array<{
    userId?: number | null;
    riskScore: number;
    riskLevel?: string;
    findings?: string[];
  }>;
  recommendation?: string;
}

export interface LeaveAnalysisResultPayload {
  id?: string;
  answer?: string;
  conversationId?: string;
  intent?: string;
  action?: string;
  query?: string;
  querySuggestions?: string[];
  selectionOptions?: Array<{ id: string | number; label?: string; name?: string }>;
  requiresInput?: boolean;
  inputFields?: Array<{
    name: string;
    type: string;
    label: string;
  }>;
  stepLabel?: string;
  currentStep?: string;
  nextStep?: string;
  canEscalate?: boolean;
  data?: any;
  entities?: Record<string, unknown>;
  sql?: string;
  tables_used?: string[];
  insights?: string;
  monthStart?: string;
  monthEnd?: string;
  analysisType?: string;
  employee_id?: number | null;
  department_id?: number | null;
  filters?: {
    fromDate?: string;
    toDate?: string;
    employeeId?: number | null;
    departmentId?: number | null;
  };
  summary?: LeaveAnalysisSummary | string;
  records?: any[];
  riskScores?: any[];
}

export interface LeaveAnalysisBotMessage {
  id: string;
  type: 'bot';
  content: string;
  timestamp: Date;
  conversationId?: string;
  metadata: {
    action: 'SHOW_LEAVE_ANALYSIS_OPTIONS' | 'SHOW_LEAVE_ANALYSIS_RESULT';
    selectionOptions?: Array<{ id: string | number; label?: string; name?: string }>;
    requiresInput?: boolean;
    inputFields?: Array<{
      name: string;
      type: string;
      label: string;
    }>;
    stepLabel?: string;
    defaultAnalysisType?: string;
    currentStep?: string;
    intent?: string;
    data?: any;
    query?: string;
    querySuggestions?: string[];
    nextStep?: string;
    canEscalate?: boolean;
    entities?: Record<string, unknown>;
    sql?: string;
    tablesUsed?: string[];
    insights?: string;
    summary?: LeaveAnalysisSummary;
    analysisType?: string;
    monthStart?: string;
    monthEnd?: string;
    employee_id?: number | null;
    department_id?: number | null;
    filters?: {
      fromDate?: string;
      toDate?: string;
      employeeId?: number | null;
      departmentId?: number | null;
    };
  };
}

export function buildLeaveAnalysisSelectionMessage(params: {
  selectionOptions: Array<{ id: string | number; label?: string; name?: string }>;
  message?: string;
  inputFields?: Array<{
    name: string;
    type: string;
    label: string;
  }>;
}): LeaveAnalysisBotMessage {
  return {
    id: Date.now().toString(),
    type: 'bot',
    content: params.message || 'Please select an analysis type.',
    timestamp: new Date(),
  metadata: {
      action: 'SHOW_LEAVE_ANALYSIS_OPTIONS',
      selectionOptions: params.selectionOptions,
      inputFields: params.inputFields || LEAVE_ANALYSIS_INPUT_FIELDS,
      stepLabel: params.message || 'Choose an analysis type',
      defaultAnalysisType: undefined,
      currentStep: 'complete',
      intent: 'leave_pattern_anomaly',
    },
  };
}

export function buildLeaveAnalysisResultMessage(params: {
  result: LeaveAnalysisResultPayload;
  fallbackQuery: string;
  summary?: LeaveAnalysisSummary;
}): LeaveAnalysisBotMessage {
  const { result, fallbackQuery, summary } = params;
  return {
    id: result.id || Date.now().toString(),
    type: 'bot',
    content:
      summary?.riskAssessment
        ? `${summary.riskAssessment}\n\n${summary.message || ''}`
        : result.answer || 'I couldn\'t process that request.',
    timestamp: new Date(),
    conversationId: result.conversationId,
    metadata: {
      action: 'SHOW_LEAVE_ANALYSIS_RESULT',
      data: result.data ?? result,
      query: result.query || fallbackQuery,
      querySuggestions: result.querySuggestions,
      selectionOptions: result.selectionOptions,
      stepLabel: result.stepLabel,
      currentStep: result.currentStep,
      nextStep: result.nextStep,
      canEscalate: result.canEscalate,
      entities: result.entities,
      sql: result.sql,
      tablesUsed: result.tables_used,
      insights: result.insights,
      summary,
      intent: result.intent || 'leave_pattern_anomaly',
      analysisType: result.analysisType || result.data?.analysisType,
      monthStart: result.monthStart,
      monthEnd: result.monthEnd,
    },
  };
}

export function isLeaveAnalysisResultMessage(metadata: {
  action?: string;
  summary?: LeaveAnalysisSummary;
  data?: any;
} | undefined): boolean {
  if (!metadata) return false;
  if (metadata.action === 'SHOW_LEAVE_ANALYSIS_RESULT') return true;
  return Boolean(
    metadata.summary?.riskAssessment &&
      (metadata.data?.riskScores || metadata.data?.records)
  );
}
