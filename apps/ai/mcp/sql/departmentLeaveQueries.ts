import { executeQuery } from "../services/queryExecutor";
import {
  buildDateOverlapClause,
  buildDepartmentJoin,
  buildDepartmentSelectExpression,
  buildNotRejectedClause,
  buildUnplannedLeaveTypeClause,
  buildWeightedLeaveDaysExpression,
} from "./leaveSqlUtils";

export function buildDepartmentLeaveBurdenQuery(
  startDate: string,
  endDate: string
): string {
  const weightedDays = buildWeightedLeaveDaysExpression("el");

  return `
    SELECT
      COALESCE(el.department_id, u.department_id) AS department_id,
      ${buildDepartmentSelectExpression()},
      COUNT(*) AS department_leave_count,
      ROUND(SUM(${weightedDays}), 2) AS department_leave_days
    FROM hrms_emp_leaves el
    LEFT JOIN tbluser u ON u.id = el.user_id
    ${buildDepartmentJoin()}
    WHERE 1 = 1
      ${buildDateOverlapClause("el", startDate, endDate)}
      ${buildNotRejectedClause("el")}
    GROUP BY department_id, department
    ORDER BY department_leave_days DESC, department_leave_count DESC
    LIMIT 20
  `;
}

export function buildDepartmentUnplannedLeaveQuery(
  startDate: string,
  endDate: string
): string {
  const weightedDays = buildWeightedLeaveDaysExpression("el");

  return `
    SELECT
      COALESCE(el.department_id, u.department_id) AS department_id,
      ${buildDepartmentSelectExpression()},
      COUNT(*) AS department_unplanned_leave_count,
      ROUND(SUM(${weightedDays}), 2) AS department_unplanned_leave_days
    FROM hrms_emp_leaves el
    LEFT JOIN tbluser u ON u.id = el.user_id
    LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
    ${buildDepartmentJoin()}
    WHERE 1 = 1
      ${buildDateOverlapClause("el", startDate, endDate)}
      ${buildNotRejectedClause("el")}
      ${buildUnplannedLeaveTypeClause()}
    GROUP BY department_id, department
    ORDER BY department_unplanned_leave_count DESC, department_unplanned_leave_days DESC
    LIMIT 20
  `;
}

export function buildDepartmentLeaveRiskQuery(
  startDate: string,
  endDate: string
): string {
  const weightedDays = buildWeightedLeaveDaysExpression("el");

  return `
    WITH employee_risk AS (
      SELECT
        el.user_id,
        COALESCE(el.department_id, u.department_id) AS department_id,
        COUNT(*) AS total_leave_count,
        SUM(${weightedDays}) AS used_leave_days,
        SUM(
          CASE
            WHEN LOWER(lt.leave_type) LIKE '%sick leave%' THEN 1
            ELSE 0
          END
        ) AS sick_leave_count,
        ROUND(
          (COUNT(*) * 2)
          + (SUM(${weightedDays}) * 1.5)
          + (
            SUM(
              CASE
                WHEN LOWER(lt.leave_type) LIKE '%sick leave%' THEN 1
                ELSE 0
              END
            ) * 3
          ),
          2
        ) AS employee_risk_score
      FROM hrms_emp_leaves el
      LEFT JOIN tbluser u ON u.id = el.user_id
      LEFT JOIN hrms_leave_types lt ON lt.id = el.leave_type_id
      WHERE 1 = 1
        ${buildDateOverlapClause("el", startDate, endDate)}
        ${buildNotRejectedClause("el")}
      GROUP BY el.user_id, department_id
    )
    SELECT
      er.department_id,
      COALESCE(d.department, 'Unassigned') AS department,
      COUNT(er.user_id) AS employee_count,
      ROUND(SUM(er.employee_risk_score), 2) AS department_risk_score,
      ROUND(AVG(er.employee_risk_score), 2) AS average_employee_risk_score
    FROM employee_risk er
    LEFT JOIN hrms_departments d ON d.id = er.department_id
    GROUP BY er.department_id, department
    ORDER BY department_risk_score DESC, average_employee_risk_score DESC
    LIMIT 20
  `;
}

export async function executeDepartmentLeaveAnalysis(params: {
  startDate: string;
  endDate: string;
  analysisType:
    | "department_leave_burden"
    | "department_leave_risk"
    | "department_unplanned_leave";
}): Promise<any[]> {
  const { startDate, endDate, analysisType } = params;

  let query = "";

  switch (analysisType) {
    case "department_leave_burden":
      query = buildDepartmentLeaveBurdenQuery(startDate, endDate);
      break;

    case "department_leave_risk":
      query = buildDepartmentLeaveRiskQuery(startDate, endDate);
      break;

    case "department_unplanned_leave":
      query = buildDepartmentUnplannedLeaveQuery(startDate, endDate);
      break;

    default:
      throw new Error(`Unsupported department analysis type: ${analysisType}`);
  }

  const result = await executeQuery(query);
  return Array.isArray(result) ? result : [];
}
