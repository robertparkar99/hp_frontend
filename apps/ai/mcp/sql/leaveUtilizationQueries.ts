import { executeQuery } from "../services/queryExecutor";
import {
  buildDateOverlapClause,
  buildNotRejectedClause,
  buildWeightedLeaveDaysExpression,
} from "./leaveSqlUtils";

export function buildLeaveTypeUtilizationQuery(
  startDate: string,
  endDate: string
): string {
  const weightedDays = buildWeightedLeaveDaysExpression("el");

  return `
    SELECT
      lt.id AS leave_type_id,
      lt.leave_type,
      COUNT(*) AS total_leave_count,
      ROUND(SUM(${weightedDays}), 2) AS used_leave_days
    FROM hrms_emp_leaves el
    LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
    WHERE 1 = 1
      ${buildDateOverlapClause("el", startDate, endDate)}
      ${buildNotRejectedClause("el")}
    GROUP BY lt.id, lt.leave_type
    ORDER BY total_leave_count DESC, used_leave_days DESC
    LIMIT 20
  `;
}

export async function executeLeaveUtilizationAnalysis(params: {
  startDate: string;
  endDate: string;
  analysisType: "leave_type_utilization";
}): Promise<any[]> {
  const query = buildLeaveTypeUtilizationQuery(params.startDate, params.endDate);

  const result = await executeQuery(query);
  return Array.isArray(result) ? result : [];
}