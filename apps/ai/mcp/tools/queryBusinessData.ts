import { z } from "zod";

export const leaveAnalysisTypeSchema = z.enum([
  "total_leave_risk",
  "monday_leave_pattern",
  "friday_leave_pattern",
  "unplanned_leave_pattern",
  "leave_clustering",

  "employee_leave_frequency",
  "employee_leave_days_consumed",

  "department_leave_burden",
  "leave_type_utilization",
  "leave_consumption_percentage",
  "leave_balance_risk",
  "leave_type_exhaustion",
  "department_leave_risk",
  "department_unplanned_leave",
]);

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const queryBusinessDataSchema = z.object({
  analysisType: leaveAnalysisTypeSchema.describe(
    "Leave management BI analysis type"
  ),
  fromDate: dateSchema.optional().describe("Analysis start date in YYYY-MM-DD format"),
  toDate: dateSchema.optional().describe("Analysis end date in YYYY-MM-DD format"),
  start_date: dateSchema.optional().describe("Analysis start date in YYYY-MM-DD format"),
  end_date: dateSchema.optional().describe("Analysis end date in YYYY-MM-DD format"),
});

export type QueryBusinessDataToolInput = z.infer<
  typeof queryBusinessDataSchema
>;

export type LeaveAnalysisType = z.infer<typeof leaveAnalysisTypeSchema>;
