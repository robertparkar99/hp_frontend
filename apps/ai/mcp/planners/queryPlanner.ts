import { intentRegistry } from "../registries/intentRegistry";
import {
  getLeavePatternSelectionOptions,
  type LeaveAnalysisType,
} from "../sql/leavePatternQueries";

export type BusinessIntent = "leave_pattern_anomaly";

export interface QueryPlan {
  intent: BusinessIntent | string;
  datasource: string;
  database?: string;
  flow: string;
  type: "selection_required" | "execute";
  tables: string[];
  monthStart: string;
  monthEnd: string;
  analysisType?: string;
  start_date?: string;
  end_date?: string;
  selectionOptions?: Array<{ id: string; label: string }>;
  requiredFilters?: Record<string, string[]>;
}

const LEAVE_TABLES = [
  "hrms_emp_leaves",
  "hrms_leave_types",
  "tbluser",
  "hrms_departments",
  "hrms_leave_allocation",
];

function getMonthBounds() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    monthStart: startOfMonth.toISOString().slice(0, 10),
    monthEnd: endOfMonth.toISOString().slice(0, 10),
  };
}

export async function queryPlanner(
  intent: BusinessIntent,
  analysisType?: string
): Promise<QueryPlan> {
  const config = intentRegistry[intent as keyof typeof intentRegistry] as
    | {
        datasource?: string;
        database?: string;
        flow?: string;
        requiresSelection?: boolean;
        options?: Array<{ id: string; label: string }>;
        requiredFilters?: Record<string, string[]>;
      }
    | undefined;

  const { monthStart, monthEnd } = getMonthBounds();

  if (intent === "leave_pattern_anomaly" && !analysisType) {
    return {
      intent,
      datasource: config?.datasource || "hr",
      database: config?.database || "hp_erp",
      flow: config?.flow || "leavePatternAnomaly",
      type: "selection_required",
      tables: LEAVE_TABLES,
      monthStart,
      monthEnd,
      selectionOptions: config?.options ?? getLeavePatternSelectionOptions(),
      requiredFilters: config?.requiredFilters,
    };
  }

  return {
    intent,
    datasource: config?.datasource || "hr",
    database: config?.database || "hp_erp",
    flow: config?.flow || "leavePatternAnomaly",
    type: "execute",
    tables: intent === "leave_pattern_anomaly" ? LEAVE_TABLES : [],
    monthStart,
    monthEnd,
    analysisType,
    requiredFilters: config?.requiredFilters,
  };
}

const ANALYSIS_TYPE_KEYWORDS: Array<{
  analysisType: LeaveAnalysisType;
  keywords: string[];
}> = [
  {
    analysisType: "total_leave_risk",
    keywords: [
      "highest leave risk",
      "leave abuse risk",
      "rank employees by leave risk",
      "employee leave risk",
    ],
  },
  {
    analysisType: "monday_leave_pattern",
    keywords: ["monday leave", "leave on mondays", "repeated monday"],
  },
  {
    analysisType: "friday_leave_pattern",
    keywords: ["friday leave", "leave on fridays", "repeated friday"],
  },
  {
    analysisType: "unplanned_leave_pattern",
    keywords: [
      "unplanned leave",
      "emergency leave",
      "sick leave",
      "medical leave",
      "casual leave",
    ],
  },
  {
    analysisType: "leave_clustering",
    keywords: [
      "leave clustering",
      "multiple leaves close together",
      "clustered leave",
    ],
  },
  {
    analysisType: "employee_leave_frequency",
    keywords: [
      "leave requests most frequently",
      "applied for the most leaves",
      "most leave applications",
    ],
  },
  {
    analysisType: "employee_leave_days_consumed",
    keywords: [
      "consumed the most leave days",
      "highest leave duration",
      "used the highest leave",
    ],
  },
  {
    analysisType: "department_leave_burden",
    keywords: [
      "departments lose the most working days",
      "department has the highest leave burden",
      "department leave burden",
    ],
  },
  {
    analysisType: "leave_type_utilization",
    keywords: [
      "leave types are used most",
      "leave type-wise usage",
      "leave type utilization",
    ],
  },
  {
    analysisType: "leave_consumption_percentage",
    keywords: [
      "consumed more than 80",
      "leave entitlement utilization",
      "leave consumption percentage",
    ],
  },
  {
    analysisType: "leave_balance_risk",
    keywords: [
      "exhaust leave balance",
      "low remaining leave balance",
      "leave balance risk",
    ],
  },
  {
    analysisType: "leave_type_exhaustion",
    keywords: [
      "leave types are nearly exhausted",
      "leave type-wise balance risk",
      "leave type exhaustion",
    ],
  },
  {
    analysisType: "department_leave_risk",
    keywords: [
      "departments have highest leave risk",
      "rank departments by leave risk",
      "department leave risk",
    ],
  },
  {
    analysisType: "department_unplanned_leave",
    keywords: [
      "departments generate most emergency leave",
      "departments have highest unplanned leave",
      "department unplanned leave",
    ],
  },
];

export function detectLeaveAnalysisType(query: string): LeaveAnalysisType | null {
  const lowerQuery = query.toLowerCase();

  for (const item of ANALYSIS_TYPE_KEYWORDS) {
    if (item.keywords.some((keyword) => lowerQuery.includes(keyword))) {
      return item.analysisType;
    }
  }

  return null;
}

export function detectIntent(query: string): string | null {
  const lowerQuery = query.toLowerCase();

  for (const intent of Object.values(intentRegistry) as any[]) {
    const synonyms = Array.isArray(intent.synonyms) ? intent.synonyms : [];

    if (
      synonyms.some((phrase: string) =>
        lowerQuery.includes(phrase.toLowerCase())
      )
    ) {
      return intent.intentId;
    }
  }

  return null;
}
