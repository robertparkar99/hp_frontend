import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  icon: LucideIcon;
  description?: string;
}

export function MetricCard({ title, value, change, icon: Icon, description }: MetricCardProps) {
  return (
    <Card className="hover:shadow-dashboard-md transition-shadow duration-200 hover:bg-card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            </div>
          </div>
          
          {change && (
            <div className="text-right">
              <span
                className={cn(
                  "text-sm font-medium",
                  change.type === "positive" && "text-success",
                  change.type === "negative" && "text-metric-negative",
                  change.type === "neutral" && "text-metric-neutral"
                )}
              >
                {change.value}
              </span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-3">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}