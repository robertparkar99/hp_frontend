"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockRuns, mockLogs } from '@/lib/mockData';
import StatusBadge from '../../AgentDashboard/Component/StatusBadge';
import { Search, Clock, DollarSign, Zap } from 'lucide-react';

export default function RunLogs() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRuns = mockRuns.filter(
    (run) =>
      run.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.input.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Agent Runs</TabsTrigger>
          <TabsTrigger value="logs">Detailed Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          {filteredRuns.map((run) => (
            <Card key={run.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{run.agentName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <StatusBadge status={run.status} />
                      <span>•</span>
                      <span>{new Date(run.startTime).toLocaleString()}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {run.duration}s
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {run.tokensUsed}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${run.cost.toFixed(3)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Input:</p>
                  <p className="rounded-md bg-muted p-3 text-sm">{run.input}</p>
                </div>
                {run.output && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Output:</p>
                    <p className="rounded-md bg-muted p-3 text-sm">{run.output}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="space-y-2">
          {mockLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 rounded-lg border border-border p-4 text-sm"
            >
              <div className="min-w-[140px] text-muted-foreground">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <StatusBadge
                status={log.level === 'error' ? 'error' : log.level === 'warning' ? 'training' : 'success'}
                className="uppercase"
              />
              <p className="flex-1 text-foreground">{log.message}</p>
              {log.metadata && (
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {JSON.stringify(log.metadata)}
                </code>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
