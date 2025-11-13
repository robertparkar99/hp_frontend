import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  status?: "good" | "warning" | "critical";
}

export const KPICard = ({ title, value, subtitle, icon: Icon, trend, status = "good" }: KPICardProps) => {
  const statusColors = {
    good: "text-success",
    warning: "text-warning",
    critical: "text-destructive"
  };

  const statusBgs = {
    good: "bg-success/10",
    warning: "bg-warning/10",
    critical: "bg-destructive/10"
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-3xl font-bold", statusColors[status])}>{value}</h3>
            {trend && (
              <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-success" : "text-destructive")}>
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-lg", statusBgs[status])}>
          <Icon className={cn("h-6 w-6", statusColors[status])} />
        </div>
      </div>
    </Card>
  );
};
