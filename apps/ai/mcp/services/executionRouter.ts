import { leavePatternAnomalyFlow } from "../flows/leavePatternAnomaly";

type ExecutionPlan = {
  intent?: string;
  flow?: string;
  analysisType?: string;
  start_date?: string;
  fromDate?: string;
  monthStart?: string;
  end_date?: string;
  toDate?: string;
  monthEnd?: string;
};

function isLeavePatternAnomalyPlan(plan: ExecutionPlan) {
  return (
    plan.intent === "leave_pattern_anomaly" ||
    plan.flow === "leavePatternAnomaly"
  );
}

function getLeaveDateRange(plan: ExecutionPlan) {
  return {
    startDate: plan.start_date ?? plan.fromDate ?? plan.monthStart,
    endDate: plan.end_date ?? plan.toDate ?? plan.monthEnd,
  };
}

export async function executionRouter(plan: ExecutionPlan) {
  if (!isLeavePatternAnomalyPlan(plan)) {
    throw new Error(`Unsupported flow: ${plan.flow}`);
  }

  const { startDate, endDate } = getLeaveDateRange(plan);

  return leavePatternAnomalyFlow({
    analysisType: plan.analysisType,
    startDate,
    endDate,
  } as any);
}
