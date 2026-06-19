import { generateRecommendation } from "../core/riskScore";
import type { LeaveAnalysisType } from "../sql/leavePatternQueries";

function getTopRecordLabel(analysisType: LeaveAnalysisType, record: any): string {
  switch (analysisType) {
    case "department_leave_burden":
    case "department_leave_risk":
    case "department_unplanned_leave":
      return record.department || "Unassigned";

    case "leave_type_utilization":
    case "leave_type_exhaustion":
      return record.leave_type || "Unknown leave type";

    default:
      return record.employee_name || `User ${record.user_id ?? "N/A"}`;
  }
}

function getRiskLevelValue(item: any): string {
  return String(
    item?.riskLevel ||
      item?.risk_level ||
      item?.risk_level_label ||
      item?.risk_bucket ||
      ""
  ).toLowerCase();
}

export function buildLeaveAnalyticsSummary(params: {
  analysisType: LeaveAnalysisType;
  records: any[];
  riskScores?: any[];
  startDate: string;
  endDate: string;
}) {
  const { analysisType, records, riskScores = [], startDate, endDate } = params;

  const totalRecords = records.length;
  const topRecord = records[0];

  let message = `${totalRecords} records returned for ${analysisType}.`;

  switch (analysisType) {
    case "total_leave_risk": {
      const highRiskCount = riskScores.filter(
        (item) => getRiskLevelValue(item) === "high"
      ).length;

      message = `${totalRecords} employees ranked by leave risk. ${highRiskCount} employees are in the high-risk band.`;
      break;
    }

    case "monday_leave_pattern":
      message = `${totalRecords} employees have leave records overlapping Mondays.`;
      break;

    case "friday_leave_pattern":
      message = `${totalRecords} employees have leave records overlapping Fridays.`;
      break;

    case "unplanned_leave_pattern":
      message = `${totalRecords} employees have Sick, Medical, or Casual Leave usage.`;
      break;

    case "leave_clustering":
      message = `${totalRecords} employees have 3 or more leave requests within a rolling 30-day window.`;
      break;

    case "employee_leave_frequency":
      message = `${totalRecords} employees ranked by leave application count.`;
      break;

    case "employee_leave_days_consumed":
      message = `${totalRecords} employees ranked by weighted leave days consumed.`;
      break;

    case "department_leave_burden":
      message = `${totalRecords} departments ranked by working days lost due to leave.`;
      break;

    case "leave_type_utilization":
      message = `${totalRecords} leave types ranked by usage volume.`;
      break;

    case "leave_consumption_percentage":
      message = `${totalRecords} employees consumed at least 80% of allocated leave.`;
      break;

    case "leave_balance_risk": {
      const riskCount = records.filter((item) => item.risk_bucket === "Risk")
        .length;
      const watchCount = records.filter((item) => item.risk_bucket === "Watch")
        .length;

      message = `${riskCount} employees are in Risk bucket and ${watchCount} employees are in Watch bucket.`;
      break;
    }

    case "leave_type_exhaustion": {
      const riskCount = records.filter((item) => item.risk_bucket === "Risk")
        .length;

      message = `${riskCount} leave types are near or above 80% consumption.`;
      break;
    }

    case "department_leave_risk":
      message = `${totalRecords} departments ranked by aggregated leave risk score.`;
      break;

    case "department_unplanned_leave":
      message = `${totalRecords} departments ranked by unplanned leave volume.`;
      break;
  }

  const topEntity = topRecord ? getTopRecordLabel(analysisType, topRecord) : null;

  const summary = {
    analysisType,
    analysisPeriod: {
      from: startDate,
      to: endDate,
    },
    totalRecords,
    topEntity,
    message,
    riskAssessment:
      riskScores.some((item) => getRiskLevelValue(item) === "high") ||
      records.some((item) => item.risk_bucket === "Risk")
        ? "Risk Level: High"
        : riskScores.some((item) => getRiskLevelValue(item) === "medium") ||
            records.some((item) => item.risk_bucket === "Watch")
          ? "Risk Level: Medium"
          : "Risk Level: Low",
    recommendation:
      riskScores.length > 0
        ? generateRecommendation(
            riskScores.some((item) => getRiskLevelValue(item) === "high")
              ? "High"
              : riskScores.some((item) => getRiskLevelValue(item) === "medium")
                ? "Medium"
                : "Low",
            riskScores.flatMap((item) => item.findings || [])
          )
        : "Review returned records in business context before taking action.",
  };

  return summary;
}

export async function leavePatternSummary(result: any): Promise<string> {
  if (!result) return "Unable to generate leave analysis summary.";

  const summary = result.summary || {};
  const records = Array.isArray(result.records) ? result.records : [];

  let text = "Leave Management BI Analysis\n\n";

  text += `Analysis Type: ${result.analysisType || "N/A"}\n`;
  text += `Analysis Period: ${summary.analysisPeriod?.from || "N/A"} to ${
    summary.analysisPeriod?.to || "N/A"
  }\n\n`;

  text += `${summary.message || `${records.length} records returned.`}\n\n`;

  if (summary.topEntity) {
    text += `Top Result: ${summary.topEntity}\n`;
  }

  text += `${summary.riskAssessment || "Risk Level: N/A"}\n`;
  text += `Recommendation: ${
    summary.recommendation || "Review returned records."
  }\n`;

  return text;
}
