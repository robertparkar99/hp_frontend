import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const pipelineData = [
  {
    stage: "Application Review",
    count: 24,
    percentage: 75,
    trend: "up",
    change: "+12%",
  },
  {
    stage: "Phone Screening",
    count: 18,
    percentage: 60,
    trend: "up",
    change: "+8%",
  },
  {
    stage: "Technical Interview",
    count: 12,
    percentage: 40,
    trend: "down",
    change: "-3%",
  },
  {
    stage: "Final Interview",
    count: 8,
    percentage: 25,
    trend: "up",
    change: "+5%",
  },
  {
    stage: "Offer Extended",
    count: 3,
    percentage: 10,
    trend: "up",
    change: "+2%",
  },
];

export function CandidatePipeline() {
  return (
    <Card className="widget-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Candidate Pipeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current hiring funnel overview
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {pipelineData.map((stage) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stage.stage}</span>
                <Badge variant="secondary" className="text-xs">
                  {stage.count}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                {stage.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span
                  className={
                    stage.trend === "up" ? "text-success" : "text-destructive"
                  }
                >
                  {stage.change}
                </span>
              </div>
            </div>
            <Progress value={stage.percentage} className="h-2" />
          </div>
        ))}
        
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Conversion Rate</span>
            <span className="font-medium text-foreground">12.5%</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Average Time to Hire</span>
            <span className="font-medium text-foreground">18 days</span>  
          </div>
        </div>
      </CardContent>
    </Card>
  );
}