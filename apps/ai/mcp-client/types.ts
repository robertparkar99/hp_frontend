// apps/ai/mcp-client/types.ts

export type BusinessIntent = "leave_pattern_anomaly";

export type LeaveAnalysisType =
  | "total_leave_risk"
  | "monday_leave_pattern"
  | "friday_leave_pattern"
  | "unplanned_leave_pattern"
  | "leave_clustering";

export interface QueryBusinessDataInput {
  analysisType: LeaveAnalysisType;
  start_date: string;
  end_date: string;
}

export interface McpTextContent {
  type: "text";
  text: string;
}

export interface McpToolResult {
  content: McpTextContent[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}
