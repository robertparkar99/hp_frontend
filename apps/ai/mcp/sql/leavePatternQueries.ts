import { executeQuery } from "../services/queryExecutor";
import { getMatchingWeekdayDates } from "./leaveSqlUtils";

export type LeaveAnalysisType =
  | "total_leave_risk"
  | "monday_leave_pattern"
  | "friday_leave_pattern"
  | "unplanned_leave_pattern"
  | "leave_clustering"
  | "employee_leave_frequency"
  | "employee_leave_days_consumed"
  | "department_leave_burden"
  | "leave_type_utilization"
  | "leave_consumption_percentage"
  | "leave_balance_risk"
  | "leave_type_exhaustion"
  | "department_leave_risk"
  | "department_unplanned_leave";

export interface LeavePatternSelectionOption {
  id: LeaveAnalysisType;
  label: string;
}

export const LEAVE_ANALYSIS_REGISTRY: Record<
  LeaveAnalysisType,
  {
    id: LeaveAnalysisType;
    label: string;
    description: string;
    requiresFilters: boolean;
    filters: string[];
  }
> = {
  total_leave_risk: {
    id: "total_leave_risk",
    label: "Show employees with highest leave risk",
    description:
      "Risk = leave application count + weighted leave days + sick leave count",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  monday_leave_pattern: {
    id: "monday_leave_pattern",
    label: "Show repeated Monday leave patterns",
    description: "Find leave records overlapping Mondays",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  friday_leave_pattern: {
    id: "friday_leave_pattern",
    label: "Show repeated Friday leave patterns",
    description: "Find leave records overlapping Fridays",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  unplanned_leave_pattern: {
    id: "unplanned_leave_pattern",
    label: "Show high unplanned leave behaviour",
    description: "Find Sick Leave, Medical Leave, and Casual Leave usage",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  leave_clustering: {
    id: "leave_clustering",
    label: "Show leave clustering behaviour",
    description: "Detect 3+ leave requests within a rolling 30-day window",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  employee_leave_frequency: {
    id: "employee_leave_frequency",
    label: "Which employees applied for the most leaves?",
    description: "COUNT(*) by employee excluding rejected leaves",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  employee_leave_days_consumed: {
    id: "employee_leave_days_consumed",
    label: "Who consumed the most leave days?",
    description: "SUM weighted leave days by employee",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  department_leave_burden: {
    id: "department_leave_burden",
    label: "Which departments lose the most working days due to leave?",
    description: "SUM weighted leave days grouped by department",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  leave_type_utilization: {
    id: "leave_type_utilization",
    label: "Which leave types are used most?",
    description: "Leave count and weighted leave days by leave type",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  leave_consumption_percentage: {
    id: "leave_consumption_percentage",
    label: "Which employees consumed more than 80% of allocated leave?",
    description: "Used leave days / allocated leave days * 100",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  leave_balance_risk: {
    id: "leave_balance_risk",
    label: "Which employees are likely to exhaust leave balance?",
    description: "Allocated leave days minus used leave days with risk buckets",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  leave_type_exhaustion: {
    id: "leave_type_exhaustion",
    label: "Which leave types are nearly exhausted?",
    description: "Allocated vs used leave days by leave type",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  department_leave_risk: {
    id: "department_leave_risk",
    label: "Which departments have highest leave risk?",
    description: "Aggregate employee leave risk by department",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },

  department_unplanned_leave: {
    id: "department_unplanned_leave",
    label: "Which departments generate most emergency leave?",
    description: "Unplanned leave count grouped by department",
    requiresFilters: true,
    filters: ["fromDate", "toDate"],
  },
};

export const LEAVE_PATTERN_SELECTION_OPTIONS: LeavePatternSelectionOption[] =
  Object.values(LEAVE_ANALYSIS_REGISTRY).map((config) => ({
    id: config.id,
    label: config.label,
  }));

export function getLeavePatternSelectionOptions(): LeavePatternSelectionOption[] {
  return LEAVE_PATTERN_SELECTION_OPTIONS.map((option) => ({ ...option }));
}

export function getLeavePatternOptionsFromRegistry(): LeavePatternSelectionOption[] {
  return getLeavePatternSelectionOptions();
}

export function getLeaveAnalysisConfig(analysisType: string) {
  return LEAVE_ANALYSIS_REGISTRY[analysisType as LeaveAnalysisType];
}

function toSafeNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);

  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function buildLeavePatternQuery(
  analysisType: LeaveAnalysisType,
  startDate: string,
  endDate: string
): string {
  const safeAnalysisType = analysisType.replace(/'/g, "''");
  const safeFromDate = startDate.replace(/'/g, "''");
  const safeToDate = endDate.replace(/'/g, "''");

  return `
    SELECT *
    FROM (
      SELECT
        lb.employee_id,
        lb.employee_name,
        lb.department,
        'total_leave_risk' AS analysis_type,
        COUNT(DISTINCT lb.id) AS total_count,
        SUM(lb.leave_days) AS total_days,
        NULL AS dates,
        ROUND(
          COUNT(DISTINCT lb.id) * 2 +
          SUM(lb.leave_days * CAST(COALESCE(lb.day_type, 1) AS DECIMAL(3,1))) * 1.5 +
          SUM(CASE WHEN LOWER(lb.leave_type) LIKE '%sick%' THEN 1 ELSE 0 END) * 3,
          2
        ) AS risk_score,
        CASE
          WHEN COUNT(DISTINCT lb.id) >= 5 OR SUM(lb.leave_days) >= 6 THEN 'High'
          WHEN COUNT(DISTINCT lb.id) >= 3 OR SUM(lb.leave_days) >= 3 THEN 'Medium'
          ELSE 'Low'
        END AS risk_level
      FROM (
        SELECT
          el.id,
          el.user_id AS employee_id,
          COALESCE(u.first_name, 'Unknown') AS employee_name,
          COALESCE(d.department, 'Unknown') AS department,
          el.from_date,
          el.to_date,
          el.status,
          el.day_type,
          COALESCE(lt.leave_type, 'Unknown') AS leave_type,
          DATEDIFF(DATE(el.to_date), DATE(el.from_date)) + 1 AS leave_days
        FROM hrms_emp_leaves el
        LEFT JOIN tbluser u ON u.id = el.user_id
        LEFT JOIN hrms_departments d ON d.id = u.department_id
        LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
        WHERE DATE(el.from_date) <= '${safeToDate}'
          AND DATE(el.to_date) >= '${safeFromDate}'
          AND LOWER(COALESCE(el.status, '')) != 'rejected'
      ) lb
      WHERE '${safeAnalysisType}' = 'total_leave_risk'
      GROUP BY lb.employee_id, lb.employee_name, lb.department

      UNION ALL

      SELECT
        lb.employee_id,
        lb.employee_name,
        lb.department,
        'monday_leave_pattern' AS analysis_type,
        COUNT(DISTINCT lb.id) AS total_count,
        SUM(lb.leave_days) AS total_days,
        GROUP_CONCAT(DISTINCT DATE(lb.from_date) ORDER BY lb.from_date SEPARATOR ', ') AS dates,
        COUNT(DISTINCT lb.id) * 10 AS risk_score,
        CASE
          WHEN COUNT(DISTINCT lb.id) >= 4 THEN 'High'
          WHEN COUNT(DISTINCT lb.id) >= 2 THEN 'Medium'
          ELSE 'Low'
        END AS risk_level
      FROM (
        SELECT
          el.id,
          el.user_id AS employee_id,
          COALESCE(u.first_name, 'Unknown') AS employee_name,
          COALESCE(d.department, 'Unknown') AS department,
          el.from_date,
          el.to_date,
          el.status,
          el.day_type,
          COALESCE(lt.leave_type, 'Unknown') AS leave_type,
          DATEDIFF(DATE(el.to_date), DATE(el.from_date)) + 1 AS leave_days
        FROM hrms_emp_leaves el
        LEFT JOIN tbluser u ON u.id = el.user_id
        LEFT JOIN hrms_departments d ON d.id = u.department_id
        LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
        WHERE DATE(el.from_date) <= '${safeToDate}'
          AND DATE(el.to_date) >= '${safeFromDate}'
          AND LOWER(COALESCE(el.status, '')) != 'rejected'
      ) lb
      WHERE '${safeAnalysisType}' = 'monday_leave_pattern'
        AND DAYOFWEEK(lb.from_date) = 2
      GROUP BY lb.employee_id, lb.employee_name, lb.department

      UNION ALL

      SELECT
        lb.employee_id,
        lb.employee_name,
        lb.department,
        'friday_leave_pattern' AS analysis_type,
        COUNT(DISTINCT lb.id) AS total_count,
        SUM(lb.leave_days) AS total_days,
        GROUP_CONCAT(DISTINCT DATE(lb.from_date) ORDER BY lb.from_date SEPARATOR ', ') AS dates,
        COUNT(DISTINCT lb.id) * 10 AS risk_score,
        CASE
          WHEN COUNT(DISTINCT lb.id) >= 4 THEN 'High'
          WHEN COUNT(DISTINCT lb.id) >= 2 THEN 'Medium'
          ELSE 'Low'
        END AS risk_level
      FROM (
        SELECT
          el.id,
          el.user_id AS employee_id,
          COALESCE(u.first_name, 'Unknown') AS employee_name,
          COALESCE(d.department, 'Unknown') AS department,
          el.from_date,
          el.to_date,
          el.status,
          el.day_type,
          COALESCE(lt.leave_type, 'Unknown') AS leave_type,
          DATEDIFF(DATE(el.to_date), DATE(el.from_date)) + 1 AS leave_days
        FROM hrms_emp_leaves el
        LEFT JOIN tbluser u ON u.id = el.user_id
        LEFT JOIN hrms_departments d ON d.id = u.department_id
        LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
        WHERE DATE(el.from_date) <= '${safeToDate}'
          AND DATE(el.to_date) >= '${safeFromDate}'
          AND LOWER(COALESCE(el.status, '')) != 'rejected'
      ) lb
      WHERE '${safeAnalysisType}' = 'friday_leave_pattern'
        AND DAYOFWEEK(lb.from_date) = 6
      GROUP BY lb.employee_id, lb.employee_name, lb.department

      UNION ALL

      SELECT
        lb.employee_id,
        lb.employee_name,
        lb.department,
        'unplanned_leave_pattern' AS analysis_type,
        COUNT(DISTINCT lb.id) AS total_count,
        SUM(lb.leave_days) AS total_days,
        GROUP_CONCAT(DISTINCT DATE(lb.from_date) ORDER BY lb.from_date SEPARATOR ', ') AS dates,
        COUNT(DISTINCT lb.id) * 10 AS risk_score,
        CASE
          WHEN COUNT(DISTINCT lb.id) >= 5 THEN 'High'
          WHEN COUNT(DISTINCT lb.id) >= 3 THEN 'Medium'
          ELSE 'Low'
        END AS risk_level
      FROM (
        SELECT
          el.id,
          el.user_id AS employee_id,
          COALESCE(u.first_name, 'Unknown') AS employee_name,
          COALESCE(d.department, 'Unknown') AS department,
          el.from_date,
          el.to_date,
          el.status,
          el.day_type,
          COALESCE(lt.leave_type, 'Unknown') AS leave_type,
          DATEDIFF(DATE(el.to_date), DATE(el.from_date)) + 1 AS leave_days
        FROM hrms_emp_leaves el
        LEFT JOIN tbluser u ON u.id = el.user_id
        LEFT JOIN hrms_departments d ON d.id = u.department_id
        LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
        WHERE DATE(el.from_date) <= '${safeToDate}'
          AND DATE(el.to_date) >= '${safeFromDate}'
          AND LOWER(COALESCE(el.status, '')) != 'rejected'
      ) lb
      WHERE '${safeAnalysisType}' = 'unplanned_leave_pattern'
        AND (
          LOWER(lb.leave_type) LIKE '%sick%'
          OR LOWER(lb.leave_type) LIKE '%emergency%'
          OR LOWER(lb.leave_type) LIKE '%unplanned%'
          OR LOWER(lb.leave_type) LIKE '%short notice%'
        )
      GROUP BY lb.employee_id, lb.employee_name, lb.department

      UNION ALL

      SELECT
        lb.employee_id,
        lb.employee_name,
        lb.department,
        'leave_clustering' AS analysis_type,
        COUNT(DISTINCT lb.id) AS total_count,
        SUM(lb.leave_days) AS total_days,
        GROUP_CONCAT(DISTINCT CONCAT(DATE(lb.from_date), ' to ', DATE(lb.to_date)) ORDER BY lb.from_date SEPARATOR ', ') AS dates,
        SUM(lb.leave_days) * 10 AS risk_score,
        CASE
          WHEN SUM(lb.leave_days) >= 6 THEN 'High'
          WHEN SUM(lb.leave_days) >= 3 THEN 'Medium'
          ELSE 'Low'
        END AS risk_level
      FROM (
        SELECT
          el.id,
          el.user_id AS employee_id,
          COALESCE(u.first_name, 'Unknown') AS employee_name,
          COALESCE(d.department, 'Unknown') AS department,
          el.from_date,
          el.to_date,
          el.status,
          el.day_type,
          COALESCE(lt.leave_type, 'Unknown') AS leave_type,
          DATEDIFF(DATE(el.to_date), DATE(el.from_date)) + 1 AS leave_days
        FROM hrms_emp_leaves el
        LEFT JOIN tbluser u ON u.id = el.user_id
        LEFT JOIN hrms_departments d ON d.id = u.department_id
        LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
        WHERE DATE(el.from_date) <= '${safeToDate}'
          AND DATE(el.to_date) >= '${safeFromDate}'
          AND LOWER(COALESCE(el.status, '')) != 'rejected'
      ) lb
      WHERE '${safeAnalysisType}' = 'leave_clustering'
      GROUP BY lb.employee_id, lb.employee_name, lb.department
    ) AS result
    ORDER BY risk_score DESC, total_count DESC, employee_name ASC
  `;
}

export async function executePatternAnalysis(params: {
  startDate: string;
  endDate: string;
  analysisType: LeaveAnalysisType;
}): Promise<{
  records: any[];
  riskScores: any[];
}> {
  const { startDate, endDate, analysisType } = params;
  const query = buildLeavePatternQuery(analysisType, startDate, endDate);

  const result = await executeQuery(query);
  const records = Array.isArray(result) ? result : [];

  const riskScores = records.map((record: any) => {
    const riskLevel =
      record.risk_level ||
      record.riskLevel ||
      (toSafeNumber(record.risk_score) >= 40
        ? "High"
        : toSafeNumber(record.risk_score) >= 20
          ? "Medium"
          : "Low");

    return {
      userId: record.employee_id ?? record.user_id,
      employeeName: record.employee_name,
      riskScore: toSafeNumber(record.risk_score),
      riskLevel,
      findings: [],
    };
  });

  return {
    records,
    riskScores,
  };
}

export { getMatchingWeekdayDates };
