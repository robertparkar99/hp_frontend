import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  trend: number;
  suffix?: string;
  icon?: React.ReactNode;
}

export const KPICard = ({ title, value, trend, suffix = "", icon }: KPICardProps) => {
  const isPositive = trend > 0;
  const trendColor = isPositive ? "text-success" : "text-destructive";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">
              {value}
              {suffix && <span className="text-xl ml-1">{suffix}</span>}
            </h3>
          </div>
          <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="font-medium">{Math.abs(trend)}%</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
        {icon && <div className="text-primary opacity-20">{icon}</div>}
      </div>
    </Card>
  );
};
