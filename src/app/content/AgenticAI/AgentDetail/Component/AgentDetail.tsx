"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '../../AgentDashboard/Component/StatusBadge';
import { ArrowLeft, Settings, Play, Pause } from 'lucide-react';
// Agent Detail Component
export default function AgentDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [runs, setRuns] = useState<any[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const agentRuns = runs.filter((r) => r.agent_id === id);

  const startAgentRun = async (agentId: string) => {
    try {
      const response = await fetch(`https://pariharajit6348-agenticai.hf.space/agents/${agentId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        alert("Agent run started successfully");
        console.log('Agent run started:', data);
        // Refetch runs after starting
        fetchRuns();
      } else {
        console.error('Failed to start agent run');
      }
    } catch (error) {
      alert("Error starting agent run");
      console.error('Error starting agent run:', error);
    }
    fetchRuns()
      ;
  };

  const fetchRuns = async () => {
    try {
      const res = await fetch("https://pariharajit6348-agenticai.hf.space/runs");
      const json = await res.json();
      setRuns(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("❌ Failed to fetch runs", err);
      setRuns([]);
    }
  };

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;
      try {
        const res = await fetch("https://pariharajit6348-agenticai.hf.space/agents");
        const json = await res.json();
        const agents = Array.isArray(json) ? json : [];
        const foundAgent = agents.find((a: any) => a.id?.toString() === id);
        if (foundAgent) {
          setAgent({
            id: foundAgent.id?.toString() || "",
            name: foundAgent.name || " e",
            description: foundAgent.description || "",
            module: foundAgent.module || "",
            submodule: foundAgent.sub_module || "",
            role: "agent",
            status: foundAgent.status as any,
            model: "gpt-4",
            temperature: foundAgent.temperature || 0.7,
            maxTokens: foundAgent.max_tokens || 1024,
            systemPrompt: foundAgent.system_prompt || "",
            tools: [],
            createdAt: foundAgent.created_at || new Date().toISOString(),
            lastRun: foundAgent.created_at || new Date().toISOString(),
            totalRuns: 0,
            successRate: 100,
          });
        }
      } catch (err) {
        console.error("❌ Failed to fetch agent", err);
      }
    };

    const fetchRuns = async () => {
      try {
        const res = await fetch("https://pariharajit6348-agenticai.hf.space/runs");
        const json = await res.json();
        setRuns(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("❌ Failed to fetch runs", err);
        setRuns([]);
      }
    };

    fetchAgent();
    fetchRuns();
  }, [id]);

  if (!agent) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Agent not found</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{agent.name}</h1>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          {agent.status === 'active' ? (
            <Button variant="outline" className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
              <Button className="gap-2" onClick={() => startAgentRun(agent.id)}>
              <Play className="h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{agentRuns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{agent.successRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{new Date(agent.lastRun).toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="runs">Recent Runs</TabsTrigger>
          <TabsTrigger value="reflection">Reflection</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="text-sm font-medium">{agent.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Temperature</span>
                <span className="text-sm font-medium">{agent.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Max Tokens</span>
                <span className="text-sm font-medium">{agent.maxTokens}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{agent.systemPrompt}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {agent.tools.map((tool: string) => (
                  <Badge key={tool} variant="secondary">
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          {agentRuns.length > 0 ? agentRuns.map((run) => (
            <Card key={run.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Run {run.id}</CardTitle>
                  <StatusBadge status={run.status || 'unknown'} />
                </div>
                <CardDescription>{new Date(run.created_at || run.startTime).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {run.input && (
                  <div>
                    <p className="text-sm font-medium">Input:</p>
                    <p className="text-sm text-muted-foreground">{run.input}</p>
                  </div>
                )}
                {run.output && (
                  <div>
                    <p className="text-sm font-medium">Output:</p>
                    <p className="text-sm text-muted-foreground">{run.output}</p>
                  </div>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {run.tool && <span>Tool: {run.tool}</span>}
                  {run.duration && <span>Duration: {run.duration}s</span>}
                  {run.tokensUsed && <span>Tokens: {run.tokensUsed}</span>}
                  {run.cost && <span>Cost: ${run.cost.toFixed(3)}</span>}
                </div>
              </CardContent>
            </Card>
          )) : (
            <p className="text-muted-foreground">No runs available for this agent</p>
          )}
        </TabsContent>

        <TabsContent value="reflection">
          <Card>
            <CardHeader>
              <CardTitle>Agent Reflection & Learning</CardTitle>
              <CardDescription>Self-improvement insights and patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 font-semibold">Performance Insights</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Successfully handles 94% of customer inquiries without escalation</li>
                  <li>• Average response time improved by 15% over the last week</li>
                  <li>• Most common tools used: knowledge_base (65%), email (25%)</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 font-semibold">Areas for Improvement</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Complex technical queries require longer processing time</li>
                  <li>• Consider adding more context to system prompt for edge cases</li>
                  <li>• Token usage could be optimized for shorter responses</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
