import {
  executePatternAnalysis,
  getLeaveAnalysisConfig,
  getLeavePatternOptionsFromRegistry,
  getLeavePatternSelectionOptions,
  type LeaveAnalysisType,
  type LeavePatternSelectionOption,
} from "../sql/leavePatternQueries";
import { executeEmployeeLeaveAnalysis } from "../sql/employeeLeaveQueries";
import { executeDepartmentLeaveAnalysis } from "../sql/departmentLeaveQueries";
import { executeLeaveUtilizationAnalysis } from "../sql/leaveUtilizationQueries";
import { executeLeaveConsumptionAnalysis } from "../sql/leaveConsumptionQueries";
import { executeLeaveBalanceAnalysis } from "../sql/leaveBalanceQueries";
import { buildLeaveAnalyticsSummary } from "../summaries/leaveAnalyticsSummary";

function isPatternAnalysis(analysisType: LeaveAnalysisType): boolean {
  return [
    "total_leave_risk",
    "monday_leave_pattern",
    "friday_leave_pattern",
    "unplanned_leave_pattern",
    "leave_clustering",
  ].includes(analysisType);
}

function isEmployeeAnalysis(analysisType: LeaveAnalysisType): boolean {
  return [
    "employee_leave_frequency",
    "employee_leave_days_consumed",
  ].includes(analysisType);
}

function isDepartmentAnalysis(analysisType: LeaveAnalysisType): boolean {
  return [
    "department_leave_burden",
    "department_leave_risk",
    "department_unplanned_leave",
  ].includes(analysisType);
}

function isUtilizationAnalysis(analysisType: LeaveAnalysisType): boolean {
  return analysisType === "leave_type_utilization";
}

function isConsumptionAnalysis(analysisType: LeaveAnalysisType): boolean {
  return analysisType === "leave_consumption_percentage";
}

function isBalanceAnalysis(analysisType: LeaveAnalysisType): boolean {
  return [
    "leave_balance_risk",
    "leave_type_exhaustion",
  ].includes(analysisType);
}

function toSafeNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);

  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function humanizeRiskLevel(value: unknown) {
  const text = String(value || "Low").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function resolveRiskLevel(record: any, riskScore?: any) {
  return (
    record.risk_level ||
    record.riskLevel ||
    riskScore?.riskLevel ||
    riskScore?.risk_level ||
    record.risk_bucket ||
    "Low"
  );
}

function resolveDepartment(record: any) {
  return (
    record.department ||
    record.department_name ||
    record.departmentName ||
    record.dept ||
    "Unassigned"
  );
}

function resolveDates(record: any) {
  return (
    record.leave_dates ||
    record.leaveDates ||
    record.dates ||
    record.date_list ||
    record.leave_date_range ||
    "-"
  );
}

function buildTableColumns(analysisType: LeaveAnalysisType) {
  switch (analysisType) {
    case "total_leave_risk":
      return [
        "employee_name",
        "department",
        "total_applications",
        "total_leave_days",
        "risk_score",
        "risk_level",
      ];
    case "monday_leave_pattern":
      return [
        "employee_name",
        "department",
        "monday_leave_count",
        "leave_dates",
        "risk_level",
      ];
    case "friday_leave_pattern":
      return [
        "employee_name",
        "department",
        "friday_leave_count",
        "leave_dates",
        "risk_level",
      ];
    case "unplanned_leave_pattern":
      return [
        "employee_name",
        "department",
        "unplanned_leave_count",
        "pending_leave_count",
        "risk_level",
      ];
    case "leave_clustering":
      return [
        "employee_name",
        "department",
        "cluster_count",
        "consecutive_leave_days",
        "risk_level",
      ];
    default:
      return ["employee_name", "department", "risk_level"];
  }
}

function buildDisplayRows(params: {
  analysisType: LeaveAnalysisType;
  records: any[];
  riskScores: any[];
}) {
  const { analysisType, records, riskScores } = params;

  return records.map((record, index) => {
    const riskScore = riskScores[index];
    const department = resolveDepartment(record);
    const riskLevel = humanizeRiskLevel(resolveRiskLevel(record, riskScore));

    switch (analysisType) {
      case "total_leave_risk":
        return {
          employee_name: record.employee_name || `User ${record.user_id ?? record.employee_id ?? "N/A"}`,
          department,
          total_applications: toSafeNumber(record.total_count ?? record.total_leave_count ?? record.total_applications ?? record.total_leave_applications),
          total_leave_days: toSafeNumber(record.total_days ?? record.used_leave_days ?? record.total_leave_days),
          risk_score: toSafeNumber(riskScore?.riskScore ?? riskScore?.risk_score ?? record.anomaly_risk_score ?? record.risk_score),
          risk_level: riskLevel,
        };

      case "monday_leave_pattern":
        return {
          employee_name: record.employee_name || `User ${record.user_id ?? record.employee_id ?? "N/A"}`,
          department,
          monday_leave_count: toSafeNumber(record.total_count ?? record.monday_leave_count),
          leave_dates: resolveDates(record),
          risk_level: riskLevel,
        };

      case "friday_leave_pattern":
        return {
          employee_name: record.employee_name || `User ${record.user_id ?? record.employee_id ?? "N/A"}`,
          department,
          friday_leave_count: toSafeNumber(record.total_count ?? record.friday_leave_count),
          leave_dates: resolveDates(record),
          risk_level: riskLevel,
        };

      case "unplanned_leave_pattern":
        return {
          employee_name: record.employee_name || `User ${record.user_id ?? record.employee_id ?? "N/A"}`,
          department,
          unplanned_leave_count: toSafeNumber(record.total_count ?? record.unplanned_leave_count ?? record.unplanned_count),
          pending_leave_count: toSafeNumber(record.pending_leave_count ?? record.pending_count),
          risk_level: riskLevel,
        };

      case "leave_clustering":
        return {
          employee_name: record.employee_name || `User ${record.user_id ?? record.employee_id ?? "N/A"}`,
          department,
          cluster_count: toSafeNumber(record.total_count ?? record.cluster_count ?? record.leave_cluster_count),
          consecutive_leave_days: toSafeNumber(record.total_days ?? record.consecutive_leave_days ?? record.consecutive_days),
          risk_level: riskLevel,
        };

      default:
        return {
          employee_name: record.employee_name || `User ${record.user_id ?? record.employee_id ?? "N/A"}`,
          department,
          risk_level: riskLevel,
        };
    }
  });
}

function buildSummaryCounts(rows: any[], riskScores: any[]) {
  const normalized = rows.length > 0 ? rows : riskScores;
  const highRisk = normalized.filter((item) => {
    const level = String(item.riskLevel || item.risk_level || item.risk_bucket || "").toLowerCase();
    return level === "high" || level === "risk";
  }).length;
  const mediumRisk = normalized.filter((item) => {
    const level = String(item.riskLevel || item.risk_level || item.risk_bucket || "").toLowerCase();
    return level === "medium" || level === "watch";
  }).length;
  const lowRisk = Math.max(rows.length - highRisk - mediumRisk, 0);

  return {
    totalEmployees: rows.length,
    highRisk,
    mediumRisk,
    lowRisk,
  };
}

export async function leavePatternAnomalyFlow(params: {
  startDate: string;
  endDate: string;
  analysisType?: string;
}): Promise<any> {
  const { startDate, endDate, analysisType } = params;

  if (!analysisType) {
    return {
      intent: "leave_pattern_anomaly",
      requiresSelection: true,
      requiresInput: true,
      selectionOptions: getLeavePatternSelectionOptions(),
      answer: "Please select the type of leave management analysis.",
    };
  }

  const config = getLeaveAnalysisConfig(analysisType);

  if (!config) {
    throw new Error(`Unknown leave analysis type: ${analysisType}`);
  }

  const typedAnalysisType = analysisType as LeaveAnalysisType;

  let records: any[] = [];
  let riskScores: any[] = [];

  if (isPatternAnalysis(typedAnalysisType)) {
    const result = await executePatternAnalysis({
      startDate,
      endDate,
      analysisType: typedAnalysisType,
    });

    records = result.records;
    riskScores = result.riskScores;
  } else if (isEmployeeAnalysis(typedAnalysisType)) {
    records = await executeEmployeeLeaveAnalysis({
      startDate,
      endDate,
      analysisType: typedAnalysisType as
        | "employee_leave_frequency"
        | "employee_leave_days_consumed",
    });
  } else if (isDepartmentAnalysis(typedAnalysisType)) {
    records = await executeDepartmentLeaveAnalysis({
      startDate,
      endDate,
      analysisType: typedAnalysisType as
        | "department_leave_burden"
        | "department_leave_risk"
        | "department_unplanned_leave",
    });
  } else if (isUtilizationAnalysis(typedAnalysisType)) {
    records = await executeLeaveUtilizationAnalysis({
      startDate,
      endDate,
      analysisType: "leave_type_utilization",
    });
  } else if (isConsumptionAnalysis(typedAnalysisType)) {
    records = await executeLeaveConsumptionAnalysis({
      startDate,
      endDate,
      analysisType: "leave_consumption_percentage",
    });
  } else if (isBalanceAnalysis(typedAnalysisType)) {
    records = await executeLeaveBalanceAnalysis({
      startDate,
      endDate,
      analysisType: typedAnalysisType as
        | "leave_balance_risk"
        | "leave_type_exhaustion",
    });
  } else {
    throw new Error(`Unsupported leave analysis type: ${analysisType}`);
  }

  const summary = buildLeaveAnalyticsSummary({
    analysisType: typedAnalysisType,
    records,
    riskScores,
    startDate,
    endDate,
  });

  const rows = buildDisplayRows({
    analysisType: typedAnalysisType,
    records,
    riskScores,
  });
  const summaryCounts = buildSummaryCounts(rows, riskScores);

  return {
    intent: "leave_pattern_anomaly",
    module: "leave_management",
    datasource: "hr",
    database: "hp_erp",
    analysisType: typedAnalysisType,
    summary: {
      ...summary,
      ...summaryCounts,
    },
    dateRange: {
      fromDate: startDate,
      toDate: endDate,
    },
    tableType: typedAnalysisType,
    columns: buildTableColumns(typedAnalysisType),
    rows,
    answer: `${summary.riskAssessment}\n\n${summary.message}`,
    records,
    riskScores,
    selectionOptions: getLeavePatternOptionsFromRegistry(),
  };
}

export {
  getLeaveAnalysisConfig,
  getLeavePatternSelectionOptions,
  getLeavePatternOptionsFromRegistry,
  type LeaveAnalysisType,
  type LeavePatternSelectionOption,
};
