"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  trend?: "up" | "down";
}

export const KPICard = ({ title, value, change, changeLabel, trend }: KPICardProps) => {
  const isPositive = change > 0;
  const trendDirection = trend || (isPositive ? "up" : "down");
  
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
        <p className="text-3xl font-bold mb-2">{value}</p>
        <div className="flex items-center gap-1">
          {trendDirection === "up" ? (
            <ArrowUp className={cn("h-4 w-4", isPositive ? "text-green-600" : "text-red-600")} />
          ) : (
            <ArrowDown className={cn("h-4 w-4", isPositive ? "text-red-600" : "text-green-600")} />
          )}
          <span className={cn(
            "text-sm font-medium",
            trendDirection === "up" && isPositive && "text-green-600",
            trendDirection === "down" && !isPositive && "text-red-600",
            trendDirection === "up" && !isPositive && "text-red-600",
            trendDirection === "down" && isPositive && "text-green-600"
          )}>
            {Math.abs(change)}% {changeLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
