import { executeQuery } from "../services/queryExecutor";
import {
  buildEmployeeNameExpression,
  buildNotRejectedClause,
  buildWeightedLeaveDaysExpression,
  getYearFromDate,
} from "./leaveSqlUtils";

export function buildLeaveConsumptionPercentageQuery(
  startDate: string,
  endDate: string
): string {
  const year = getYearFromDate(startDate);
  const weightedDays = buildWeightedLeaveDaysExpression("el");

  return `
    WITH allocation AS (
      SELECT
        employee_id AS user_id,
        leave_type_id,
        SUM(CAST(value AS DECIMAL(10,2))) AS allocated_leave_days
      FROM hrms_leave_allocation
      WHERE year = ${year}
      GROUP BY employee_id, leave_type_id
    ),
    usage_data AS (
      SELECT
        el.user_id,
        el.leave_type_id,
        SUM(${weightedDays}) AS used_leave_days
      FROM hrms_emp_leaves el
      WHERE 1 = 1
        AND DATE(el.from_date) <= '${endDate}'
        AND DATE(el.to_date) >= '${startDate}'
        ${buildNotRejectedClause("el")}
      GROUP BY el.user_id, el.leave_type_id
    ),
    employee_totals AS (
      SELECT
        a.user_id,
        SUM(a.allocated_leave_days) AS allocated_leave_days,
        SUM(COALESCE(ud.used_leave_days, 0)) AS used_leave_days
      FROM allocation a
      LEFT JOIN usage_data ud
        ON ud.user_id = a.user_id
        AND ud.leave_type_id = a.leave_type_id
      GROUP BY a.user_id
    )
    SELECT
      et.user_id,
      ${buildEmployeeNameExpression("u")} AS employee_name,
      ROUND(et.allocated_leave_days, 2) AS allocated_leave_days,
      ROUND(et.used_leave_days, 2) AS used_leave_days,
      ROUND(et.allocated_leave_days - et.used_leave_days, 2) AS remaining_leave_days,
      ROUND(
        (et.used_leave_days / NULLIF(et.allocated_leave_days, 0)) * 100,
        2
      ) AS leave_consumption_percentage
    FROM employee_totals et
    LEFT JOIN tbluser u ON u.id = et.user_id
    WHERE et.allocated_leave_days > 0
    HAVING leave_consumption_percentage >= 80
    ORDER BY leave_consumption_percentage DESC, used_leave_days DESC
    LIMIT 20
  `;
}

export async function executeLeaveConsumptionAnalysis(params: {
  startDate: string;
  endDate: string;
  analysisType: "leave_consumption_percentage";
}): Promise<any[]> {
  const query = buildLeaveConsumptionPercentageQuery(
    params.startDate,
    params.endDate
  );

  const result = await executeQuery(query);
  return Array.isArray(result) ? result : [];
}