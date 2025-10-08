import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

const stats = [
  {
    title: "Interviews Today",
    value: "12",
    change: "+2 from yesterday",
    icon: Calendar,
    color: "text-blue-400",
  },
  {
    title: "Active Candidates",
    value: "48",
    change: "+8 this week",
    icon: Users,
    color: "text-success",
  },
  {
    title: "Pending Feedback",
    value: "6",
    change: "Due within 24h",
    icon: Clock,
    color: "text-warning",
  },
  {
    title: "Completed Interviews",
    value: "156",
    change: "This month",
    icon: CheckCircle,
    color: "text-success",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="widget-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-xl">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}