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
    <Card className="h-full hover:shadow-dashboard-md transition-shadow duration-200 hover:bg-card-hover">
      <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight whitespace-nowrap">{value}</h3>
            </div>
          </div>

          {change && (
            <div className="text-right flex-shrink-0">
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium",
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
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
