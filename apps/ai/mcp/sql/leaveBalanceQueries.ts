import { executeQuery } from "../services/queryExecutor";
import {
  buildEmployeeNameExpression,
  buildNotRejectedClause,
  buildWeightedLeaveDaysExpression,
  getYearFromDate,
} from "./leaveSqlUtils";

export function buildLeaveBalanceRiskQuery(
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
      ) AS leave_consumption_percentage,
      CASE
        WHEN ROUND((et.used_leave_days / NULLIF(et.allocated_leave_days, 0)) * 100, 2) >= 80 THEN 'Risk'
        WHEN ROUND((et.used_leave_days / NULLIF(et.allocated_leave_days, 0)) * 100, 2) >= 60 THEN 'Watch'
        ELSE 'Normal'
      END AS risk_bucket,
      CASE
        WHEN ROUND((et.used_leave_days / NULLIF(et.allocated_leave_days, 0)) * 100, 2) >= 80 THEN 100
        WHEN ROUND((et.used_leave_days / NULLIF(et.allocated_leave_days, 0)) * 100, 2) >= 60 THEN 60
        ELSE 30
      END AS leave_balance_risk_score
    FROM employee_totals et
    LEFT JOIN tbluser u ON u.id = et.user_id
    WHERE et.allocated_leave_days > 0
    ORDER BY leave_balance_risk_score DESC, leave_consumption_percentage DESC
    LIMIT 20
  `;
}

export function buildLeaveTypeExhaustionQuery(
  startDate: string,
  endDate: string
): string {
  const year = getYearFromDate(startDate);
  const weightedDays = buildWeightedLeaveDaysExpression("el");

  return `
    WITH allocation AS (
      SELECT
        leave_type_id,
        SUM(CAST(value AS DECIMAL(10,2))) AS allocated_leave_days
      FROM hrms_leave_allocation
      WHERE year = ${year}
      GROUP BY leave_type_id
    ),
    usage_data AS (
      SELECT
        el.leave_type_id,
        SUM(${weightedDays}) AS used_leave_days
      FROM hrms_emp_leaves el
      WHERE 1 = 1
        AND DATE(el.from_date) <= '${endDate}'
        AND DATE(el.to_date) >= '${startDate}'
        ${buildNotRejectedClause("el")}
      GROUP BY el.leave_type_id
    )
    SELECT
      a.leave_type_id,
      lt.leave_type,
      ROUND(a.allocated_leave_days, 2) AS allocated_leave_days,
      ROUND(COALESCE(ud.used_leave_days, 0), 2) AS used_leave_days,
      ROUND(a.allocated_leave_days - COALESCE(ud.used_leave_days, 0), 2) AS remaining_leave_days,
      ROUND(
        (COALESCE(ud.used_leave_days, 0) / NULLIF(a.allocated_leave_days, 0)) * 100,
        2
      ) AS leave_consumption_percentage,
      CASE
        WHEN ROUND((COALESCE(ud.used_leave_days, 0) / NULLIF(a.allocated_leave_days, 0)) * 100, 2) >= 80 THEN 'Risk'
        WHEN ROUND((COALESCE(ud.used_leave_days, 0) / NULLIF(a.allocated_leave_days, 0)) * 100, 2) >= 60 THEN 'Watch'
        ELSE 'Normal'
      END AS risk_bucket
    FROM allocation a
    LEFT JOIN usage_data ud ON ud.leave_type_id = a.leave_type_id
    LEFT JOIN hrms_leave_types lt ON lt.id = a.leave_type_id
    WHERE a.allocated_leave_days > 0
    ORDER BY leave_consumption_percentage DESC, used_leave_days DESC
    LIMIT 20
  `;
}

export async function executeLeaveBalanceAnalysis(params: {
  startDate: string;
  endDate: string;
  analysisType: "leave_balance_risk" | "leave_type_exhaustion";
}): Promise<any[]> {
  const query =
    params.analysisType === "leave_balance_risk"
      ? buildLeaveBalanceRiskQuery(params.startDate, params.endDate)
      : buildLeaveTypeExhaustionQuery(params.startDate, params.endDate);

  const result = await executeQuery(query);
  return Array.isArray(result) ? result : [];
}