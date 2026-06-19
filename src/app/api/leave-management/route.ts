import { NextResponse } from "next/server";

import { handleQueryBusinessData } from "../../../../apps/ai/mcp/tools/queryBusinessDataHandler";

import type {
QueryBusinessDataToolInput,
} from "../../../../apps/ai/mcp/tools/queryBusinessDataHandler";

const SUPPORTED_ANALYSIS_TYPES = [
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
] as const;

function isValidDate(value: unknown): boolean {
if (typeof value !== "string") {
return false;
}

return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(req: Request) {
try {
const rawBody = await req.json();
const body = { ...(rawBody || {}) } as Record<string, unknown>;

// Leave pattern analysis is organization-wide. Remove any session-scoped
// employee identifiers if a caller sends them accidentally.
delete body.userId;
delete body.employeeId;
delete body.employee_id;

const {
  analysisType,
  fromDate,
  toDate,
  start_date,
  end_date,
} = body || {};
const effectiveStartDate = start_date || fromDate;
const effectiveEndDate = end_date || toDate;

if (!analysisType) {
  return NextResponse.json(
    {
      error: "analysisType is required",
    },
    {
      status: 400,
    }
  );
}

if (
  !SUPPORTED_ANALYSIS_TYPES.includes(
    analysisType as (typeof SUPPORTED_ANALYSIS_TYPES)[number]
  )
) {
  return NextResponse.json(
    {
      error: "Unsupported analysisType",
      supportedAnalysisTypes: SUPPORTED_ANALYSIS_TYPES,
    },
    {
      status: 400,
    }
  );
}

if (!effectiveStartDate || !effectiveEndDate) {
  return NextResponse.json(
    {
      error: "fromDate and toDate are required",
    },
    {
      status: 400,
    }
  );
}

if (
  !isValidDate(effectiveStartDate) ||
  !isValidDate(effectiveEndDate)
) {
  return NextResponse.json(
    {
      error: "fromDate and toDate must be in YYYY-MM-DD format",
    },
    {
      status: 400,
    }
  );
}

const payload: QueryBusinessDataToolInput = {
  analysisType,
  fromDate,
  toDate,
  start_date: effectiveStartDate,
  end_date: effectiveEndDate,
};

console.log(
  "[leave-management-api] request",
  payload
);

const result =
  await handleQueryBusinessData(payload);

const responseBody =
  "structuredContent" in result &&
  result.structuredContent
    ? result.structuredContent
    : result;

console.log(
  "[leave-management-api] response",
  responseBody
);

return NextResponse.json(responseBody);


} catch (error) {
console.error(
"[leave-management-api] error",
error
);


return NextResponse.json(
  {
    error: "Leave management analysis failed",
    details:
      error instanceof Error
        ? error.message
        : String(error),
  },
  {
    status: 500,
  }
);


}
}
