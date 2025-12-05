"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockFailurePatterns, mockOptimizations, mockReflectionInsights } from '@/lib/mockData';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Lightbulb, Target, Zap, DollarSign, Shield, Brain } from 'lucide-react';

const categoryIcons = {
  performance: Zap,
  cost: DollarSign,
  reliability: Shield,
  accuracy: Target,
};

const impactColors = {
  high: 'bg-destructive text-destructive-foreground',
  medium: 'bg-warning text-warning-foreground',
  low: 'bg-info text-info-foreground',
};

const priorityColors = {
  high: 'border-destructive text-destructive',
  medium: 'border-warning text-warning',
  low: 'border-info text-info',
};

export default function Reflection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reflection System</h1>
          <p className="text-muted-foreground">AI-powered performance analysis and optimization recommendations</p>
        </div>
        <Button className="gap-2">
          <Brain className="h-4 w-4" />
          Run New Analysis
        </Button>
      </div>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockReflectionInsights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{insight.metric}</CardTitle>
              {insight.trend === 'up' && <TrendingUp className="h-4 w-4 text-success" />}
              {insight.trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
              {insight.trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{insight.value}</div>
              <p className="text-xs text-muted-foreground mt-2">{insight.insight}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Failure Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Identified Failure Patterns
          </CardTitle>
          <CardDescription>
            Common failure patterns detected across agent runs with frequency analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockFailurePatterns.map((pattern) => (
            <div
              key={pattern.id}
              className="rounded-lg border border-border p-4 space-y-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{pattern.pattern}</h3>
                    <Badge className={impactColors[pattern.impact]}>
                      {pattern.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Occurred {pattern.frequency} times in the last 7 days
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Affected Agents:</p>
                <div className="flex flex-wrap gap-1">
                  {pattern.affectedAgents.map((agent) => (
                    <Badge key={agent} variant="secondary" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Example Failures:</p>
                <ul className="space-y-1">
                  {pattern.examples.slice(0, 2).map((example, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Optimization Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated suggestions to improve agent performance, reliability, and cost efficiency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockOptimizations.map((opt) => {
            const CategoryIcon = categoryIcons[opt.category];
            return (
              <div
                key={opt.id}
                className={`rounded-lg border-2 ${priorityColors[opt.priority]} p-4 space-y-3`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{opt.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {opt.priority} priority
                      </Badge>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        {opt.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Apply
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Estimated Impact</p>
                    <p className="font-medium text-success">{opt.estimatedImpact}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Implementation</p>
                    <p className="font-medium text-foreground capitalize">{opt.implementationComplexity}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Affected Agents:</p>
                  <div className="flex flex-wrap gap-1">
                    {opt.affectedAgents.map((agent) => (
                      <Badge key={agent} variant="secondary" className="text-xs">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Key Findings:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                <strong className="text-foreground">58 total failures</strong> analyzed across all agents in the past 7 days
              </li>
              <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                <strong className="text-foreground">4 distinct failure patterns</strong> identified with API rate limiting being the most critical
              </li>
              <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                <strong className="text-foreground">5 optimization opportunities</strong> discovered with potential to improve success rate by up to 16%
              </li>
              <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                Implementing high-priority optimizations could save <strong className="text-foreground">~$2.10/day</strong> in operational costs
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Next analysis scheduled: Tomorrow at 9:00 AM
            </p>
            <Button variant="ghost" size="sm">
              View Full Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
