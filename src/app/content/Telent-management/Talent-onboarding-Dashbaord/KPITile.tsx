import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPITileProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  status?: "success" | "warning" | "danger";
  description?: string;
}

export function KPITile({ title, value, trend, trendValue, status, description }: KPITileProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-success border-success/20 bg-success-light";
      case "warning":
        return "text-warning border-warning/20 bg-warning-light";
      case "danger":
        return "text-destructive border-destructive/20 bg-destructive-light";
      default:
        return "text-muted-foreground border-border bg-muted";
    }
  };

  return (
    <Card className="hover:shadow-card-hover transition-all duration-200">
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {trendValue && (
              <div className={cn("flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md border", getStatusColor())}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
