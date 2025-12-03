import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
   iconColor?: string;  
}

export const KPICard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = "neutral", 
  className, 
  iconColor = "text-primary" // default fallback
}: KPICardProps) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-destructive";
    return "text-muted-foreground";
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <p className={cn("mt-2 text-sm font-medium flex items-center gap-1", getTrendColor())}>
            <span>{getTrendIcon()}</span>
            <span>{Math.abs(change)}%</span>
            <span className="text-muted-foreground">vs last period</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

