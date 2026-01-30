"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockLogs } from '@/lib/mockData';
import StatusBadge from '../../AgentDashboard/Component/StatusBadge';
import { Search, Clock, DollarSign, Zap } from 'lucide-react';
import Loader from '@/components/utils/loading';

type TaskStatus = 'success' | 'error' | 'training' | 'completed' | string;

interface Task {
  created_at: string;
  description?: string;
  error?: any;
  id: string;
  result?: any;
  run_id: string;
  status: TaskStatus;
  runId?: string; // added by code
}

export default function RunLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [runs, setRuns] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [traces, setTraces] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('runs');
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [loadingTraces, setLoadingTraces] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
        const res = await fetch("https://pariharajit6348-agenticai.hf.space/agents");
        const json = await res.json();
        setAgents(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("❌ Failed to fetch agents", err);
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    const fetchRuns = async () => {
      setLoadingRuns(true);
      try {
        const res = await fetch("https://pariharajit6348-agenticai.hf.space/runs");
        const json = await res.json();
        setRuns(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("❌ Failed to fetch runs", err);
        setRuns([]);
      } finally {
        setLoadingRuns(false);
      }
    };

    const fetchTraces = async (runIds: string[]) => {
      const allTraces: any[] = [];
      for (const runId of runIds) {
        try {
          const res = await fetch(`https://pariharajit6348-agenticai.hf.space/runs/${runId}/trace`);
          const json = await res.json();
          if (json?.tasks && Array.isArray(json.tasks)) {
            allTraces.push(
              ...json.tasks.map((task: any) => ({
                ...task,
                runId: runId, // normalize key
                // runId: , // normalize key
              }))
            );
          }
        } catch (err) {
          console.error(`❌ Failed to fetch trace for run ${runId}`, err);
        }
      }
      setTraces(allTraces);
    };

    fetchAgents();
    fetchRuns();
  }, []);

  useEffect(() => {
    const fetchTraces = async () => {
      if (activeTab !== 'logs' || runs.length === 0) return;
      setLoadingTraces(true);
      const tracePromises = runs.map(async (run) => {
        try {
          const res = await fetch(`https://pariharajit6348-agenticai.hf.space/runs/${run.id}/trace`);
          if (res.ok) {
            const json = await res.json();
            console.log(`Trace for run ${run.id}:`, json);
            if (json?.tasks && Array.isArray(json.tasks)) {
              return json.tasks.map((task: any) => ({
                ...task,
                runId: run.id, // normalize key
              }));
            }
          } else {
            console.error(`❌ Failed to fetch trace for run ${run.id}: ${res.status} ${res.statusText}`);
          }
        } catch (err) {
          console.error(`❌ Failed to fetch trace for run ${run.id}`, err);
        }
        return [];
      });
      const traceResults = await Promise.all(tracePromises);
      const allTraces = traceResults.flat();
      console.log('All traces:', allTraces);
      setTraces(allTraces);
      setLoadingTraces(false);
    };
    fetchTraces();
  }, [runs, activeTab]);

  const groupedTraces = traces.reduce((acc, trace) => {
    const rid = trace.run_id;
    if (!acc[rid]) acc[rid] = [];
    acc[rid].push(trace);
    return acc;
  }, {} as Record<string, Task[]>);

  const filteredRuns = runs;

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a) => a.id?.toString() === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };

  const getRunDescription = (runId: string) => {
    const task = traces.find(
      t => t.run_id === runId && t.description
  );
    return task?.description || 'Execute agent run';
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Run Logs & Traces</h1>
        <p className="text-muted-foreground">Monitor agent execution and performance</p>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search runs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Agent Runs</TabsTrigger>
          <TabsTrigger value="logs">Detailed Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          {loadingRuns ? (
            <Loader/>
          ) : filteredRuns.length > 0 ? filteredRuns.map((run) => (
            <Card key={run.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{getAgentName(run.agent_id)}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <StatusBadge status={run.status || 'pending'} />
                      <span>•</span>
                      <span>{new Date(run.created_at || run.startTime).toLocaleString()}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {run.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {run.duration}s
                      </div>
                    )}
                    {run.tokens_used && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        {run.tokens_used}
                      </div>
                    )}
                    {run.cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${run.cost.toFixed(3)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {run.input && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Input:</p>
                    <p className="rounded-md bg-muted p-3 text-sm">{run.input}</p>
                  </div>
                )}
                {run.output && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Output:</p>
                    <p className="rounded-md bg-muted p-3 text-sm">{run.output}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )) : (
            <p className="text-muted-foreground">No runs available</p>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {loadingTraces ? (
            <Loader/>
          ) : filteredRuns.map((run) => {
            const runTasks = groupedTraces[run.id] || [];

            return (
              <div key={run.id} className="space-y-2">

                {/* TASKS */}
                {runTasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="ml-8 flex items-start gap-4 rounded-lg border p-4 text-sm"
                  >
                    <div className="min-w-[160px] text-muted-foreground">
                      {new Date(task.created_at).toLocaleTimeString()}
                    </div>

                    <StatusBadge
                      status={
                        task.status === 'success'
                          ? 'completed'
                          : task.status === 'error'
                            ? 'error'
                            : 'training'
                      }
                    />

                    <p className="flex-1">
                      {task.description || 'Execute agent run tasks'}
                    </p>
                    {task.result && (
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {JSON.stringify(task.result)}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </TabsContent>

      </Tabs>
    </div>
  );
}
