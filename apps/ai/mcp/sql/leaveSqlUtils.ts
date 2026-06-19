export const UNPLANNED_LEAVE_TYPE_MATCHERS = [
  "LOWER(lt.leave_type) LIKE '%sick leave%'",
  "LOWER(lt.leave_type) LIKE '%medical leave%'",
  "LOWER(lt.leave_type) LIKE '%casual leave%'",
];

export function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

export function buildDateOverlapClause(
  alias: string,
  startDate: string,
  endDate: string
): string {
  return `
    AND DATE(${alias}.from_date) <= '${escapeSql(endDate)}'
    AND DATE(${alias}.to_date) >= '${escapeSql(startDate)}'
  `;
}

export function buildNotRejectedClause(alias: string): string {
  return `
    AND LOWER(COALESCE(${alias}.status, '')) != 'rejected'
  `;
}

export function buildWeightedLeaveDaysExpression(alias = "el"): string {
  return `
    (
      DATEDIFF(DATE(${alias}.to_date), DATE(${alias}.from_date)) + 1
    ) * CAST(COALESCE(${alias}.day_type, 1) AS DECIMAL(5,2))
  `;
}

export function buildEmployeeNameExpression(alias = "u"): string {
  return `
    TRIM(
      CONCAT(
        COALESCE(${alias}.first_name, ''),
        ' ',
        COALESCE(${alias}.last_name, '')
      )
    )
  `;
}

export function buildDepartmentJoin(): string {
  return `
    LEFT JOIN hrms_departments d
      ON d.id = COALESCE(el.department_id, u.department_id)
  `;
}

export function buildDepartmentSelectExpression(): string {
  return `
    COALESCE(d.department, 'Unassigned') AS department
  `;
}

export function buildUnplannedLeaveTypeClause(): string {
  return `AND (${UNPLANNED_LEAVE_TYPE_MATCHERS.join(" OR ")})`;
}

export function parseLocalDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMatchingWeekdayDates(
  fromDate: string,
  toDate: string,
  weekdayIndex: number
): string[] {
  const start = parseLocalDate(fromDate);
  const end = parseLocalDate(toDate);

  if (!start || !end || start > end) return [];

  const dates: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    if (cursor.getDay() === weekdayIndex) {
      dates.push(formatLocalDate(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function buildWeekdayOverlapClause(
  startDate: string,
  endDate: string,
  weekdayIndex: number
): string {
  const matchingDates = getMatchingWeekdayDates(
    startDate,
    endDate,
    weekdayIndex
  );

  if (matchingDates.length === 0) return "AND 1 = 0";

  return `
    AND (
      ${matchingDates
        .map(
          (date) =>
            `(DATE(el.from_date) <= '${date}' AND DATE(el.to_date) >= '${date}')`
        )
        .join(" OR ")}
    )
  `;
}

export function getYearFromDate(date: string): number {
  const parsed = parseLocalDate(date);
  return parsed ? parsed.getFullYear() : new Date().getFullYear();
}
