import { intents } from "../resources/intents";
import {
  getLeavePatternSelectionOptions,
  type LeaveAnalysisType,
} from "../sql/leavePatternQueries";

export const intentRegistry = {
  ...intents,

  leave_pattern_anomaly: {
    intentId: "leave_pattern_anomaly",
    label: "Leave Management BI",
    module: "leave_management",
    datasource: "hr",
    database: "hp_erp",
    flow: "leavePatternAnomaly",
    summary: true,
    requiresSelection: true,
    options: getLeavePatternSelectionOptions(),

    synonyms: [
      ...(intents.leave_pattern_anomaly?.synonyms || []),
      "leave risk",
      "leave abuse",
      "leave anomaly",
      "leave pattern",
      "leave balance",
      "leave utilization",
      "leave consumption",
      "leave burden",
      "department leave risk",
      "unplanned leave",
      "sick leave pattern",
      "medical leave pattern",
      "casual leave pattern",
    ],

    requiredFilters: {
      total_leave_risk: ["fromDate", "toDate"],
      monday_leave_pattern: ["fromDate", "toDate"],
      friday_leave_pattern: ["fromDate", "toDate"],
      unplanned_leave_pattern: ["fromDate", "toDate"],
      leave_clustering: ["fromDate", "toDate"],

      employee_leave_frequency: ["fromDate", "toDate"],
      employee_leave_days_consumed: ["fromDate", "toDate"],

      department_leave_burden: ["fromDate", "toDate"],
      leave_type_utilization: ["fromDate", "toDate"],
      leave_consumption_percentage: ["fromDate", "toDate"],
      leave_balance_risk: ["fromDate", "toDate"],
      leave_type_exhaustion: ["fromDate", "toDate"],
      department_leave_risk: ["fromDate", "toDate"],
      department_unplanned_leave: ["fromDate", "toDate"],
    } satisfies Record<LeaveAnalysisType, string[]>,
  },
};
