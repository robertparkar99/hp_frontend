export const LEAVE_PATTERN_WEIGHTS = {
  monday: 20,
  friday: 20,
  unplanned: 20,
  clustering: 10,
};

export type LeaveRiskLevel = "Low" | "Medium" | "High";

function toSafeNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);

  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getRiskLevel(score: number): LeaveRiskLevel {
  if (score <= 30) return "Low";
  if (score <= 60) return "Medium";
  return "High";
}

export function getLeaveBalanceRiskBucket(
  leaveConsumptionPercentage: number
): "Normal" | "Watch" | "Risk" {
  if (leaveConsumptionPercentage >= 80) return "Risk";
  if (leaveConsumptionPercentage >= 60) return "Watch";
  return "Normal";
}

export function computeRiskScore(result: {
  mondayLeaves?: number;
  fridayLeaves?: number;
  unplannedLeaves?: number;
  leaveClusters?: number;
}): {
  score: number;
  findings: string[];
  level: LeaveRiskLevel;
} {
  const mondayLeaves = toSafeNumber(result.mondayLeaves);
  const fridayLeaves = toSafeNumber(result.fridayLeaves);
  const unplannedLeaves = toSafeNumber(result.unplannedLeaves);
  const leaveClusters = toSafeNumber(result.leaveClusters);

  let score = 0;
  const findings: string[] = [];

  if (mondayLeaves >= 3) {
    score += LEAVE_PATTERN_WEIGHTS.monday;
    findings.push("Repeated Monday leave pattern detected");
  }

  if (fridayLeaves >= 3) {
    score += LEAVE_PATTERN_WEIGHTS.friday;
    findings.push("Repeated Friday leave pattern detected");
  }

  if (unplannedLeaves >= 3) {
    score += LEAVE_PATTERN_WEIGHTS.unplanned;
    findings.push("Frequent unplanned leave pattern detected");
  }

  if (leaveClusters >= 1) {
    score += LEAVE_PATTERN_WEIGHTS.clustering;
    findings.push("Leave clustering detected");
  }

  return {
    score,
    findings,
    level: getRiskLevel(score),
  };
}

export function generateRecommendation(
  level: LeaveRiskLevel | string,
  findings: string[]
): string {
  if (level === "Low") {
    return "No significant leave anomaly detected. Continue normal monitoring.";
  }

  if (level === "Medium") {
    return "Moderate leave risk detected. Manager awareness and contextual review are recommended.";
  }

  if (findings.length > 0) {
    return "High leave risk detected. Manager review is recommended.";
  }

  return "High leave risk detected. Review leave behavior and entitlement usage.";
}
