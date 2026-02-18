"use client";
import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAgents, mockPerformanceData } from '@/lib/mockData';
import StatusBadge from '../Component/StatusBadge';
import { Plus, Search, TrendingUp, Activity, Zap, Users } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Line, LineChart } from 'recharts';

// Generate sparkline data
const runsSparkline = mockPerformanceData.map(d => ({ value: d.totalRuns }));
const successSparkline = mockPerformanceData.map(d => ({ value: d.successRate }));
const costSparkline = mockPerformanceData.map(d => ({ value: d.totalCost }));

interface SparklineProps {
  data: { value: number }[];
  color: string;
  type?: 'area' | 'line';
}

function Sparkline({ data, color, type = 'area' }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      {type === 'area' ? (
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
          />
        </AreaChart>
      ) : (
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  // const navigate = useNavigate();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = mockAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalAgents: mockAgents.length,
    activeAgents: mockAgents.filter((a) => a.status === 'active').length,
    totalRuns: mockAgents.reduce((sum, a) => sum + a.totalRuns, 0),
    avgSuccessRate: (mockAgents.reduce((sum, a) => sum + a.successRate, 0) / mockAgents.length).toFixed(1),
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor your AI agents</p>
        </div>
        <Button onClick={() => router.push('/content/AgenticAI/CreateAgent')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-0">
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground mb-2">{stats.activeAgents} active</p>
            <div className="h-10 -mx-6 -mb-1">
              <Sparkline 
                data={[{ value: 2 }, { value: 3 }, { value: 3 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 4 }]} 
                color="hsl(var(--primary))" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-0">
            <div className="text-2xl font-bold">{stats.totalRuns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mb-2">Across all agents</p>
            <div className="h-10 -mx-6 -mb-1">
              <Sparkline data={runsSparkline} color="hsl(var(--chart-1))" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-0">
            <div className="text-2xl font-bold">{stats.avgSuccessRate}%</div>
            <p className="text-xs text-success mb-2">+2.5% from last week</p>
            <div className="h-10 -mx-6 -mb-1">
              <Sparkline data={successSparkline} color="hsl(var(--success))" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-0">
            <div className="text-2xl font-bold">${costSparkline[costSparkline.length - 1]?.value.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mb-2">7-day trend</p>
            <div className="h-10 -mx-6 -mb-1">
              <Sparkline data={costSparkline} color="hsl(var(--chart-4))" type="line" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>View and manage your AI agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredAgents.map((agent, index) => (
              <div
                key={agent.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:bg-accent hover:shadow-md cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/content/AgenticAI/AgentDetail?id=${agent.id}`)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                    <StatusBadge status={agent.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Model: {agent.model}</span>
                    <span>•</span>
                    <span>{agent.totalRuns} runs</span>
                    <span>•</span>
                    <span>{agent.successRate}% success</span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Last run</p>
                  <p className="font-medium text-foreground">
                    {/* {new Date(agent.lastRun).toLocaleDateString()} */}
                    {new Date(agent.lastRun).toLocaleDateString('en-US')}

                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}