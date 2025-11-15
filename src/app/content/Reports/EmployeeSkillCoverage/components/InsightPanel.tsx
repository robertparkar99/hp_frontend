import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export const InsightPanel = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">AI-Driven Insights</h3>
          <p className="text-sm text-muted-foreground">Actionable recommendations based on current data</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Executive Summary */}
        <div className="p-4 bg-background rounded-lg border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">📊 Executive Summary</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Overall skill coverage is <span className="font-bold text-warning">72%</span>. Major gaps found in 
            <span className="font-medium text-foreground"> Analytical Thinking and Data Literacy</span> across Sales and Finance departments. 
            Average gap improved by <span className="font-bold text-success">0.2 points</span> since last quarter.
          </p>
        </div>

        {/* Root Cause Analysis */}
        <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">Critical Skill Gap Identified</p>
            <p className="text-xs text-muted-foreground mb-2">
              Data Analysis shows 45% deficiency across Sales and Finance departments.
            </p>
            <div className="pl-3 border-l-2 border-destructive/30 mb-2">
              <p className="text-xs font-medium text-foreground mb-1">Root Causes:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Recent wave of new hires lacking foundational training (60% hired in Q1-Q2)</li>
                <li>Low completion rate (35%) of existing Data Literacy program</li>
                <li>Outdated curriculum not aligned with new analytics tools</li>
              </ul>
            </div>
            <p className="text-xs text-foreground font-medium">
              💼 Business Impact: May delay Q3 sales forecasting accuracy and financial reporting compliance.
            </p>
          </div>
        </div>

        {/* Positive Trend */}
        <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
          <TrendingUp className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">Positive Trend Detected</p>
            <p className="text-xs text-muted-foreground mb-2">
              Leadership competency improved by <span className="font-bold text-success">+12%</span> since Q2 review.
            </p>
            <p className="text-xs text-foreground font-medium">
              💡 Success Factor: Peer mentorship program showing strong ROI. Continue investment.
            </p>
          </div>
        </div>

        {/* Strategic Hiring Recommendation */}
        <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">Strategic Hiring Recommendation</p>
            <p className="text-xs text-muted-foreground mb-2">
              Consider hiring 2 Senior Data Analysts to address persistent gap in IT department.
            </p>
            <p className="text-xs text-foreground font-medium">
              🎯 Strategic Alignment: Supports Q4 goal of improving cross-functional analytics capabilities. 
              Project completion rate could improve by <span className="font-bold text-success">25%</span>.
            </p>
          </div>
        </div>

        {/* Business Objective Linkage */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs font-semibold text-foreground mb-2">🎯 Strategic Goal Alignment</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Leadership gap may delay Q4 project delivery timelines. 
            Addressing it aligns with organizational priority of <span className="font-medium text-foreground">improving cross-functional agility</span> and 
            <span className="font-medium text-foreground"> accelerating digital transformation initiatives</span>.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button size="sm" className="flex-1">
          Assign Training
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Export Report
        </Button>
      </div>
    </Card>
  );
};
