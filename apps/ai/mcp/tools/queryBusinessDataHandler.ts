import { queryPlanner } from "../planners/queryPlanner";
import { executionRouter } from "../services/executionRouter";
import type { LeaveAnalysisType } from "./queryBusinessData";

export interface QueryBusinessDataToolInput {
  analysisType: LeaveAnalysisType;
  fromDate?: string;
  toDate?: string;
  start_date?: string;
  end_date?: string;
}

export type QueryBusinessDataToolPayload = Record<string, unknown> | string;

function toJsonSafe<T>(value: T): T {
  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return (Number.isSafeInteger(asNumber) ? asNumber : value.toString()) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item)) as T;
  }

  if (value && typeof value === "object") {
    if (value instanceof Date) {
      return value.toISOString() as T;
    }

    const output: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      output[key] = toJsonSafe(item);
    }

    return output as T;
  }

  return value;
}

export function createQueryBusinessDataToolResult(
  payload: QueryBusinessDataToolPayload
) {
  if (typeof payload === "string") {
    return {
      content: [
        {
          type: "text" as const,
          text: payload,
        },
      ],
    };
  }

  const safePayload = toJsonSafe(payload);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(safePayload),
      },
    ],
    structuredContent: safePayload,
  };
}

export async function handleQueryBusinessData(input: QueryBusinessDataToolInput) {
  const analysisType = input.analysisType;
  const startDate = input.fromDate || input.start_date;
  const endDate = input.toDate || input.end_date;

  if (!startDate || !endDate) {
    throw new Error("fromDate/toDate (or start_date/end_date) are required");
  }

  const resolvedIntent = "leave_pattern_anomaly";

  console.log("[queryBusinessDataHandler] received input", {
    resolvedIntent,
    analysisType,
    startDate,
    endDate,
  });

  const plan = await queryPlanner(resolvedIntent as any, analysisType);

  const executablePlan = {
    ...plan,
    analysisType,
    start_date: startDate,
    end_date: endDate,
  };

  console.log("[queryBusinessDataHandler] executable plan", {
    intent: executablePlan.intent,
    flow: executablePlan.flow,
    analysisType: executablePlan.analysisType,
    startDate: executablePlan.start_date,
    endDate: executablePlan.end_date,
  });

  const result = await executionRouter(executablePlan);

  return createQueryBusinessDataToolResult(
    result as QueryBusinessDataToolPayload
  );
}
