import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPerformanceData, mockAgentPerformanceData } from '@/lib/mockData';
import { computeDailySummaries, computeAgentComparison, computeAggregateStats } from '@/lib/analyticsCompute';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, DollarSign, Clock, Activity } from 'lucide-react';

export default function Analytics() {
  const [view, setView] = useState<'overview' | 'compare'>('overview');

  // Compute cached daily summaries
  const dailySummaries = useMemo(() => computeDailySummaries(mockPerformanceData), []);

  // Compute aggregate stats
  const stats = useMemo(() => computeAggregateStats(dailySummaries), [dailySummaries]);

  // Compute agent comparison data
  const comparisonData = useMemo(() => {
    const agentData = Object.entries(mockAgentPerformanceData).map(([agentName, data]) => ({
      agentId: agentName.toLowerCase().replace(/\s+/g, '-'),
      agentName,
      data,
    }));
    return computeAgentComparison(agentData);
  }, []);

  // Prepare stacked data for runs comparison
  const runsComparisonData = useMemo(() => {
    const allDates = Array.from(new Set(Object.values(mockAgentPerformanceData).flat().map(d => d.date))).sort();
    return allDates.map(date => {
      const entry: any = { date };
      Object.entries(mockAgentPerformanceData).forEach(([agentName, data]) => {
        const dayData = data.find(d => d.date === date);
        entry[agentName] = dayData ? dayData.totalRuns : 0;
      });
      return entry;
    });
  }, []);

  const agentColors = {
    'Customer Support Agent': 'hsl(var(--chart-1))',
    'Data Analyst Agent': 'hsl(var(--chart-2))',
    'Content Writer Agent': 'hsl(var(--chart-3))',
    'Code Review Agent': 'hsl(var(--chart-4))',
  };

  const SuccessFailureTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (!active || !payload?.length) return null;

    const success = payload.find((p) => p.dataKey === "successCount");
    const failures = payload.find((p) => p.dataKey === "failureCount");

    return (
      <div className="rounded-lg border bg-white shadow-md px-4 py-2 text-sm">
        <div className="font-medium">{label}</div>

        {success && (
          <div className="text-muted-foreground">
            Success: {success.value}
          </div>
        )}

        {failures && (
          <div className="text-muted-foreground">
            Failures: {failures.value}
          </div>
        )}
      </div>
    );
  };


  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        className="rounded-lg border bg-white shadow-md px-4 py-2 text-sm"
        style={{ pointerEvents: 'none' }}
      >
        <div className="font-medium">{label}</div>
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="text-muted-foreground"
          >
            {entry.dataKey}: {entry.value}
          </div>
        ))}
      </div>
    );
  };
 
const CostTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;

  const cost = payload[0].value;

  return (
    <div className="rounded-lg border bg-white shadow px-4 py-3 text-sm">
      <div className="font-medium">{label}</div>

      <div className="mt-1">
        <div>totalCost : {cost}</div>
      </div>
    </div>
  );
};



  const AgentRunsTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border bg-white shadow-md px-4 py-3 text-sm">
        {/* Date */}
        <div className="font-medium mb-1">{label}</div>

        {/* Each agent’s value */}
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            {/* Color Dot */}
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />

            <span className="text-muted-foreground">
              {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  };


  const AgentSuccessTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border bg-white shadow-md px-4 py-3 text-sm">
        {/* Date */}
        <div className="font-medium mb-1">{label}</div>

        {/* Show each agent line value */}
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            {/* Color dot */}
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />

            <span className="text-muted-foreground">
              {entry.name}: <span className="font-semibold text-foreground">{entry.value}%</span>
            </span>
          </div>
        ))}
      </div>
    );
  };



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performance Analytics</h1>
        <p className="text-muted-foreground">Track agent performance with cached daily summaries</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foregroundfont-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}s</div>
            <p className="text-xs text-muted-foreground">Per execution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'overview' | 'compare')}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compare">Compare Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
                <CardDescription>Daily success rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailySummaries}>
                    <defs>
                      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.12)"   // or hsl(var(--muted-foreground))
                      vertical={true}
                      horizontal={true}
                    />

                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[85, 100]} />
                    <Tooltip content={<CustomTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="successRate"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      fill="url(#successGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Duration</CardTitle>
                <CardDescription>Daily average execution time (seconds)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailySummaries}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.12)"   // or hsl(var(--muted-foreground))
                      vertical={true}
                      horizontal={true}
                    />

                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(v) =>
                        new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />

                    {/* ⭐ Custom Tooltip */}
                    <Tooltip content={<CustomTooltip />} />

                    <Bar dataKey="avgDuration" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success vs Failure Count</CardTitle>
                <CardDescription>Daily execution outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailySummaries}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.12)"   // or hsl(var(--muted-foreground))
                      vertical={true}
                      horizontal={true}
                    />

                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />

                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />

                    <Tooltip content={<SuccessFailureTooltip />} />

                    <Legend />

                    <Bar
                      dataKey="successCount"
                      stackId="a"
                      fill="hsl(var(--success))"
                      name="Success"
                    />

                    <Bar
                      dataKey="failureCount"
                      stackId="a"
                      fill="#ef4444"
                      name="Failures"
                    />
                  </BarChart>
                </ResponsiveContainer>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Daily operational costs ($)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySummaries}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.12)"
                      vertical={true}
                      horizontal={true}
                    />

                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />

                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />

                    {/* ⭐ Custom Tooltip */}
                    <Tooltip content={<CostTooltip />} wrapperStyle={{ zIndex: 9999 }} />

                    <Line
                      type="monotone"
                      dataKey="totalCost"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--warning))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Success Rate Comparison</CardTitle>
                <CardDescription>Compare success rates across all agents over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.12)"
                      vertical={true}
                      horizontal={true}
                    />

                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />

                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />

                    {/* ⭐ Custom Tooltip */}
                    <Tooltip content={<AgentSuccessTooltip />} wrapperStyle={{ zIndex: 9999 }} />

                    <Legend />

                    {Object.keys(mockAgentPerformanceData).map((agentName) => (
                      <Line
                        key={agentName}
                        type="monotone"
                        dataKey={agentName}
                        stroke={agentColors[agentName as keyof typeof agentColors]}
                        strokeWidth={2}
                        dot={{ fill: agentColors[agentName as keyof typeof agentColors] }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Execution Volume</CardTitle>
                <CardDescription>Stacked comparison of daily runs by agent</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={runsComparisonData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.12)"   // or hsl(var(--muted-foreground))
                      vertical={true}
                      horizontal={true}
                    />

                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />

                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />

                    {/* ⭐ Custom Tooltip */}
                    <Tooltip content={<AgentRunsTooltip />} />

                    <Legend />

                    {Object.keys(mockAgentPerformanceData).map((agentName, index) => (
                      <Bar
                        key={agentName}
                        dataKey={agentName}
                        stackId="runs"
                        fill={agentColors[agentName as keyof typeof agentColors]}
                        fillOpacity={1}
                        radius={
                          index === Object.keys(mockAgentPerformanceData).length - 1
                            ? [4, 4, 0, 0]
                            : [0, 0, 0, 0]
                        }
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>

              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(mockAgentPerformanceData).map(([agentName, data]) => {
                const avgSuccessRate = (data.reduce((sum, d) => sum + d.successRate, 0) / data.length).toFixed(1);
                const totalRuns = data.reduce((sum, d) => sum + d.totalRuns, 0);
                const avgDuration = (data.reduce((sum, d) => sum + d.avgDuration, 0) / data.length).toFixed(1);

                return (
                  <Card key={agentName}>
                    <CardHeader>
                      <CardTitle className="text-lg">{agentName}</CardTitle>
                      <CardDescription>7-day performance summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Success Rate</span>
                          <span className="text-sm font-semibold">{avgSuccessRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Runs</span>
                          <span className="text-sm font-semibold">{totalRuns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Duration</span>
                          <span className="text-sm font-semibold">{avgDuration}s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
