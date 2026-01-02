"use client";
import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agent, AgentStatus, mockPerformanceData } from '@/lib/mockData';
import StatusBadge from '../Component/StatusBadge';
import { Plus, Search, TrendingUp, Activity, Zap, Users, Edit } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<any[]>([]);

  const fetchAgents = useCallback(async () => {
    try {
      // Fetch all agents
      const allRes = await fetch("https://pariharajit6348-agenticai.hf.space/agents");
      const allJson = await allRes.json();
      console.log("All agents API response:", allJson);

      const allFormatted = Array.isArray(allJson) ? allJson.map((agent: any) => ({
        id: agent.id?.toString() || "",
        name: agent.name || "",
        description: agent.description || "",
        module: agent.module || "",
        submodule: agent.sub_module || "",
        role: "agent",
        status: agent.status as AgentStatus,
        model: "gpt-4",
        temperature: agent.temperature || 0.7,
        maxTokens: agent.max_tokens || 1024,
        systemPrompt: agent.system_prompt || "",
        tools: [],
        createdAt: agent.created_at || new Date().toISOString(),
        lastRun: agent.created_at || new Date().toISOString(),
        totalRuns: 0,
        successRate: 100,
      })) : [];

      setAllAgents(allFormatted);
    } catch (err) {
      console.error("❌ Failed to fetch agents", err);
      setAllAgents([]);
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("https://pariharajit6348-agenticai.hf.space/runs");
      const json = await res.json();
      console.log("Runs API response:", json);
      setRuns(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("❌ Failed to fetch runs", err);
      setRuns([]);
    }
  }, []);

  const updateAgentStatus = async (agentId: string, newStatus: 'active' | 'idle') => {
    try {
      const apiStatus = newStatus === 'active' ? 'deployed' : 'draft';
      const response = await fetch(`https://pariharajit6348-agenticai.hf.space/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: apiStatus }),
      });
      if (response.ok) {
        // Refetch all agents to get updated status from API
        await fetchAgents();
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };


  useEffect(() => {
    fetchAgents();
    fetchRuns();
  }, []);

  const getAgentRunsCount = (agentId: string) => {
    return runs.filter(run => run.agent_id === agentId).length;
  };

  useEffect(() => {
    if (statusFilter === 'all') {
      setAgents(allAgents);
    } else if (statusFilter === 'deployed') {
      setAgents(allAgents.filter(agent => agent.status === 'deployed'));
    } else if (statusFilter === 'draft') {
      setAgents(allAgents.filter(agent => agent.status === 'draft'));
    }
  }, [statusFilter, allAgents]);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalAgents: allAgents.length,
    activeAgents: allAgents.filter((a) => a.status === 'deployed').length,
    totalRuns: runs.length,
    avgSuccessRate: allAgents.length > 0 ? (allAgents.reduce((sum, a) => sum + a.successRate, 0) / allAgents.length).toFixed(1) : "0",
  };

  const getAgentName = (agentId: string) => {
    const agent = allAgents.find((a) => a.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
              </SelectContent>
            </Select>
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
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAgentStatus(agent.id, agent.status === 'deployed' ? 'idle' : 'active')}
                    >
                      {agent.status === 'deployed' ? 'Undeploy' : 'Deploy'}
                    </Button> */}
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Model: {agent.model}</span>
                    <span>•</span>
                    <span>{getAgentRunsCount(agent.id)} runs</span>
                    <span>•</span>
                    <span>{agent.successRate}% success</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAgentStatus(agent.id, agent.status === 'deployed' ? 'idle' : 'active');
                    }}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {agent.status === 'deployed' ? 'Undeploy' : 'Deploy'}
                  </Button>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Last run</p>
                    <p className="font-medium text-foreground">
                      {/* {new Date(agent.lastRun).toLocaleDateString()} */}
                      {new Date(agent.lastRun).toLocaleDateString('en-US')}

                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Runs</CardTitle>
          <CardDescription>View recent agent runs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {runs.length > 0 ? runs.map((run, index) => (
              <div
                key={run.id || index}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:bg-accent hover:shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">Run {run.id}</h3>
                    <StatusBadge status={run.status || 'unknown'} />
                  </div>
                  <p className="text-sm text-muted-foreground">Agent: {getAgentName(run.agent_id)}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {new Date(run.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground">No runs available</p>
            )}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}