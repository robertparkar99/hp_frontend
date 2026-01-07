import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PipelineStage {
  stage: string;
  count: number;
  change: string;
}

interface PipelineData {
  pipeline: PipelineStage[];
  conversion_rate: string;
  average_time_to_hire: string;
}

export function CandidatePipeline() {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/candidate-pipeline?sub_institute_id=3&type=API&token=1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5');
        const result = await response.json();
        if (result.data) {
          setPipelineData(result.data);
        }
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPipelineData();
  }, []);

  if (loading) {
    return (
      <Card className="widget-card">
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!pipelineData) {
    return (
      <Card className="widget-card">
        <CardContent className="flex justify-center items-center h-32">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages based on the first stage count
  const maxCount = pipelineData.pipeline[0]?.count || 1;
  const stagesWithPercentage = pipelineData.pipeline.map((stage) => ({
    ...stage,
    percentage: maxCount > 0 ? (stage.count / maxCount) * 100 : 0,
    trend: stage.change.startsWith('+') ? 'up' : 'down',
  }));

  return (
    <Card className="widget-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Candidate Pipeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current hiring funnel overview
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {stagesWithPercentage.map((stage) => (
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
            <span className="font-medium text-foreground">{pipelineData.conversion_rate}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Average Time to Hire</span>
            <span className="font-medium text-foreground">{pipelineData.average_time_to_hire}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}