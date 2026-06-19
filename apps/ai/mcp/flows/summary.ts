import { buildLeaveAnalyticsSummary } from "../summaries/leaveAnalyticsSummary";
import type { LeaveAnalysisType } from "../sql/leavePatternQueries";

export async function summaryFlow(
  data: any[],
  type?: string,
  options?: {
    analysisType?: LeaveAnalysisType;
    startDate?: string;
    endDate?: string;
    riskScores?: any[];
  }
) {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      totalRows: 0,
      message: "No leave records found for analysis.",
      riskAssessment: "Risk Level: Low",
      recommendation: "No action required.",
    };
  }

  if (type === "leave_pattern_anomaly" && options?.analysisType) {
    return buildLeaveAnalyticsSummary({
      analysisType: options.analysisType,
      records: data,
      riskScores: options.riskScores || [],
      startDate: options.startDate || "N/A",
      endDate: options.endDate || "N/A",
    });
  }

  return {
    totalRows: data.length,
    message: `Found ${data.length} records.`,
  };
}

export async function summarizeLeaveAnalysis(
  data: any[],
  analysisType: LeaveAnalysisType,
  options?: {
    startDate?: string;
    endDate?: string;
    riskScores?: any[];
  }
) {
  return buildLeaveAnalyticsSummary({
    analysisType,
    records: data,
    riskScores: options?.riskScores || [],
    startDate: options?.startDate || "N/A",
    endDate: options?.endDate || "N/A",
  });
}