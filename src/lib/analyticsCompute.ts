// Simulates server-side cached computations for analytics
// In production, these would be computed on the backend and cached

export interface DailySummary {
  date: string;
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  totalCost: number;
  failureCount: number;
  successCount: number;
}

export interface AgentComparison {
  date: string;
  [agentId: string]: number | string; // Dynamic keys for agent IDs
}

// Cache simulation
const summaryCache = new Map<string, DailySummary[]>();
const comparisonCache = new Map<string, AgentComparison[]>();

/**
 * Compute daily summaries with caching
 * Simulates server-side computation with 24h cache TTL
 */
export function computeDailySummaries(rawData: any[]): DailySummary[] {
  const cacheKey = 'daily-summaries';
  
  // Check cache
  if (summaryCache.has(cacheKey)) {
    return summaryCache.get(cacheKey)!;
  }

  // Compute summaries
  const summaries = rawData.map(day => ({
    date: day.date,
    totalRuns: day.totalRuns,
    successRate: day.successRate,
    avgDuration: day.avgDuration,
    totalCost: day.totalCost,
    failureCount: Math.round(day.totalRuns * (1 - day.successRate / 100)),
    successCount: Math.round(day.totalRuns * (day.successRate / 100)),
  }));

  // Cache result
  summaryCache.set(cacheKey, summaries);

  return summaries;
}

/**
 * Compute agent comparison data with caching
 * Aggregates metrics across multiple agents for comparison
 */
export function computeAgentComparison(
  agentData: Array<{ agentId: string; agentName: string; data: any[] }>
): AgentComparison[] {
  const cacheKey = `comparison-${agentData.map(a => a.agentId).join('-')}`;

  // Check cache
  if (comparisonCache.has(cacheKey)) {
    return comparisonCache.get(cacheKey)!;
  }

  // Get all unique dates
  const allDates = new Set<string>();
  agentData.forEach(agent => {
    agent.data.forEach(d => allDates.add(d.date));
  });

  // Compute comparison data
  const comparison: AgentComparison[] = Array.from(allDates)
    .sort()
    .map(date => {
      const entry: AgentComparison = { date };
      
      agentData.forEach(agent => {
        const dayData = agent.data.find(d => d.date === date);
        entry[agent.agentName] = dayData ? dayData.successRate : 0;
      });

      return entry;
    });

  // Cache result
  comparisonCache.set(cacheKey, comparison);

  return comparison;
}

/**
 * Clear analytics cache (simulates cache invalidation)
 */
export function clearAnalyticsCache() {
  summaryCache.clear();
  comparisonCache.clear();
}

/**
 * Compute aggregated statistics
 */
export function computeAggregateStats(data: DailySummary[]) {
  const totalRuns = data.reduce((sum, d) => sum + d.totalRuns, 0);
  const avgSuccessRate = data.reduce((sum, d) => sum + d.successRate, 0) / data.length;
  const totalCost = data.reduce((sum, d) => sum + d.totalCost, 0);
  const avgDuration = data.reduce((sum, d) => sum + d.avgDuration, 0) / data.length;

  return {
    totalRuns,
    avgSuccessRate: Number(avgSuccessRate.toFixed(1)),
    totalCost: Number(totalCost.toFixed(2)),
    avgDuration: Number(avgDuration.toFixed(2)),
  };
}
