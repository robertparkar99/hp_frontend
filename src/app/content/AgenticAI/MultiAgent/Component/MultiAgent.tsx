"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgents } from '@/lib/mockData';
import { ArrowRight, GitBranch, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simulated workflow states
const workflowStates = ['idle', 'processing', 'completed', 'error'] as const;
type WorkflowState = typeof workflowStates[number];

interface WorkflowNode {
  id: string;
  name: string;
  model: string;
  description: string;
  tools: string[];
  state: WorkflowState;
}

const statusConfig = {
  idle: { icon: null, color: 'border-border', pulse: false },
  processing: { icon: Loader2, color: 'border-primary', pulse: true },
  completed: { icon: CheckCircle2, color: 'border-success', pulse: false },
  error: { icon: AlertCircle, color: 'border-destructive', pulse: false },
};

function FlowConnector({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-1 px-2">
      <div className={cn(
        "h-0.5 w-8 transition-all duration-500",
        isActive ? "bg-primary" : "bg-border"
      )}>
        {isActive && (
          <div className="h-full w-2 bg-primary animate-[slide-in-right_0.5s_ease-out_infinite]" />
        )}
      </div>
      <ArrowRight className={cn(
        "h-5 w-5 transition-colors duration-300",
        isActive ? "text-primary" : "text-muted-foreground"
      )} />
    </div>
  );
}

function WorkflowNodeCard({ node, index }: { node: WorkflowNode; index: number }) {
  const config = statusConfig[node.state];
  const StatusIcon = config.icon;

  return (
    <div 
      className={cn(
        "flex min-w-[260px] flex-col gap-2 rounded-lg border-2 bg-card p-4 transition-all duration-500 animate-fade-in",
        config.color,
        config.pulse && "animate-pulse"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{node.name}</h3>
        <div className="flex items-center gap-2">
          {StatusIcon && (
            <StatusIcon className={cn(
              "h-4 w-4",
              node.state === 'processing' && "animate-spin text-primary",
              node.state === 'completed' && "text-success",
              node.state === 'error' && "text-destructive"
            )} />
          )}
          <Badge variant="outline" className="text-xs">
            {node.model}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{node.description}</p>
      <div className="flex flex-wrap gap-1">
        {node.tools.slice(0, 2).map((tool) => (
          <Badge key={tool} variant="secondary" className="text-xs">
            {tool}
          </Badge>
        ))}
        {node.tools.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{node.tools.length - 2}
          </Badge>
        )}
      </div>
      
      {/* Progress bar for processing state */}
      {node.state === 'processing' && (
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-2">
          <div className="h-full bg-primary animate-[slide-in-right_1s_ease-in-out_infinite] w-1/3" />
        </div>
      )}
    </div>
  );
}

export default function MultiAgent() {
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>(
    mockAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      model: agent.model,
      description: agent.description,
      tools: agent.tools,
      state: 'idle' as WorkflowState,
    }))
  );
  
  const [activeConnection, setActiveConnection] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  // Simulate workflow execution
  useEffect(() => {
    const runWorkflow = async () => {
      setIsRunning(true);
      
      for (let i = 0; i < workflowNodes.length; i++) {
        // Start processing current node
        setWorkflowNodes(prev => prev.map((node, idx) => 
          idx === i ? { ...node, state: 'processing' } : node
        ));
        setActiveConnection(i);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Complete current node (randomly add error for demo)
        const hasError = i === 3 && Math.random() > 0.5;
        setWorkflowNodes(prev => prev.map((node, idx) => 
          idx === i ? { ...node, state: hasError ? 'error' : 'completed' } : node
        ));
      }
      
      setActiveConnection(-1);
      setIsRunning(false);
      
      // Reset after delay
      setTimeout(() => {
        setWorkflowNodes(prev => prev.map(node => ({ ...node, state: 'idle' })));
      }, 3000);
    };

    // Start workflow simulation
    const timer = setTimeout(runWorkflow, 1000);
    
    // Repeat every 15 seconds
    const interval = setInterval(runWorkflow, 15000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const parallelAgents = mockAgents.slice(0, 3);
  const [parallelStates, setParallelStates] = useState<Record<string, WorkflowState>>({});

  // Simulate parallel execution
  useEffect(() => {
    const runParallel = () => {
      parallelAgents.forEach((agent, idx) => {
        setTimeout(() => {
          setParallelStates(prev => ({ ...prev, [agent.id]: 'processing' }));
          
          setTimeout(() => {
            setParallelStates(prev => ({ 
              ...prev, 
              [agent.id]: Math.random() > 0.9 ? 'error' : 'completed' 
            }));
            
            setTimeout(() => {
              setParallelStates(prev => ({ ...prev, [agent.id]: 'idle' }));
            }, 2000);
          }, 1500 + Math.random() * 1000);
        }, idx * 500);
      });
    };

    runParallel();
    const interval = setInterval(runParallel, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Multi-Agent Coordination</h1>
        <p className="text-muted-foreground">Visualize agent interactions and workflows</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent Workflow</CardTitle>
              <CardDescription>Sequential agent execution pipeline</CardDescription>
            </div>
            {isRunning && (
              <Badge variant="outline" className="gap-1 animate-pulse">
                <Zap className="h-3 w-3" />
                Running
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {workflowNodes.map((node, index) => (
              <div key={node.id} className="flex items-center">
                <WorkflowNodeCard node={node} index={index} />
                {index < workflowNodes.length - 1 && (
                  <FlowConnector isActive={activeConnection === index + 1} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parallel Execution</CardTitle>
            <CardDescription>Agents running simultaneously</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <GitBranch className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1 space-y-2">
                  {parallelAgents.map((agent, idx) => {
                    const state = parallelStates[agent.id] || 'idle';
                    const config = statusConfig[state];
                    const StatusIcon = config.icon;
                    
                    return (
                      <div
                        key={agent.id}
                        className={cn(
                          "flex items-center justify-between rounded-md border-2 p-3 transition-all duration-300 animate-fade-in",
                          config.color,
                          state === 'processing' && "bg-primary/5"
                        )}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          {StatusIcon ? (
                            <StatusIcon className={cn(
                              "h-4 w-4",
                              state === 'processing' && "animate-spin text-primary",
                              state === 'completed' && "text-success",
                              state === 'error' && "text-destructive"
                            )} />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span className="text-sm font-medium">{agent.name}</span>
                        </div>
                        <Badge 
                          variant={state === 'processing' ? 'default' : 'outline'} 
                          className={cn(
                            "text-xs capitalize transition-all",
                            state === 'processing' && "animate-pulse"
                          )}
                        >
                          {state}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Communication</CardTitle>
            <CardDescription>Inter-agent message passing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { from: 'Customer Support', to: 'Data Analyst', msg: 'Requesting customer behavior analysis for ticket #1234', time: '2 min ago' },
                { from: 'Data Analyst', to: 'Content Writer', msg: 'Sharing insights for blog post generation', time: '5 min ago' },
                { from: 'Content Writer', to: 'Code Review', msg: 'Documentation draft ready for technical review', time: '8 min ago' },
              ].map((comm, idx) => (
                <div 
                  key={idx} 
                  className="rounded-lg border border-border p-3 hover:bg-accent transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-primary">{comm.from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground">{comm.to}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{comm.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{comm.msg}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}