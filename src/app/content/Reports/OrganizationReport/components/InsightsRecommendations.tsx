import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, BookOpen, Star } from "lucide-react";

const insights = [
  {
    type: "danger",
    icon: AlertTriangle,
    title: "Attrition Alert",
    description: "Attrition in Engineering rose 13% in Q3",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-900",
    iconColor: "text-[#f87171]",
  },
  {
    type: "success",
    icon: TrendingUp,
    title: "Growth Missions",
    description: "Operations department exceeded hiring targets by 16%",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-900",
    iconColor: "text-[#4ade80]",
  },
  {
    type: "warning",
    icon: BookOpen,
    title: "Training Gap",
    description: "Sales department shows lowest compliance with onboarding",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-900",
    iconColor: "text-[#fbbf24]",
  },
  {
    type: "info",
    icon: Star,
    title: "Top Performer",
    description: "Operations team achieved 98% satisfaction score in Q3",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900",
    iconColor: "text-[#3b82f6]",
  },
];

export const InsightsRecommendations = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Insights & Recommendations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card 
              key={index}
              className={`${insight.bgColor} ${insight.borderColor} border-2 transition-all duration-300 hover:shadow-lg`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-white dark:bg-gray-800 ${insight.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
