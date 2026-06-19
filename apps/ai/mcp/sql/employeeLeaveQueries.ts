import { executeQuery } from "../services/queryExecutor";
import {
  buildDateOverlapClause,
  buildEmployeeNameExpression,
  buildNotRejectedClause,
  buildWeightedLeaveDaysExpression,
} from "./leaveSqlUtils";

export function buildEmployeeLeaveFrequencyQuery(
  startDate: string,
  endDate: string
): string {
  return `
    SELECT
      el.user_id,
      ${buildEmployeeNameExpression("u")} AS employee_name,
      COUNT(*) AS total_leave_count,
      COUNT(*) AS leave_frequency_score
    FROM hrms_emp_leaves el
    LEFT JOIN tbluser u ON u.id = el.user_id
    WHERE 1 = 1
      ${buildDateOverlapClause("el", startDate, endDate)}
      ${buildNotRejectedClause("el")}
    GROUP BY el.user_id, employee_name
    ORDER BY total_leave_count DESC
    LIMIT 20
  `;
}

export function buildEmployeeLeaveDaysConsumedQuery(
  startDate: string,
  endDate: string
): string {
  const weightedDays = buildWeightedLeaveDaysExpression("el");

  return `
    SELECT
      el.user_id,
      ${buildEmployeeNameExpression("u")} AS employee_name,
      ROUND(SUM(${weightedDays}), 2) AS used_leave_days
    FROM hrms_emp_leaves el
    LEFT JOIN tbluser u ON u.id = el.user_id
    WHERE 1 = 1
      ${buildDateOverlapClause("el", startDate, endDate)}
      ${buildNotRejectedClause("el")}
    GROUP BY el.user_id, employee_name
    ORDER BY used_leave_days DESC
    LIMIT 20
  `;
}

export async function executeEmployeeLeaveAnalysis(params: {
  startDate: string;
  endDate: string;
  analysisType: "employee_leave_frequency" | "employee_leave_days_consumed";
}): Promise<any[]> {
  const { startDate, endDate, analysisType } = params;

  const query =
    analysisType === "employee_leave_frequency"
      ? buildEmployeeLeaveFrequencyQuery(startDate, endDate)
      : buildEmployeeLeaveDaysConsumedQuery(startDate, endDate);

  const result = await executeQuery(query);
  return Array.isArray(result) ? result : [];
}