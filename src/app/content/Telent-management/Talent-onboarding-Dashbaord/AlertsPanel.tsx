import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, Users, AlertCircle } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: "warning",
    icon: TrendingDown,
    title: "Diversity Decline Alert",
    message: "Engineering diversity ratio dropped 6% quarter-over-quarter",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    type: "danger",
    icon: AlertTriangle,
    title: "Onboarding Delay",
    message: "Sales department onboarding completion at 78% (target: 85%)",
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    type: "info",
    icon: Users,
    title: "Succession Gap",
    message: "VP of Operations role lacks a ready successor",
    timestamp: "1 day ago",
  },
  {
    id: 4,
    type: "warning",
    icon: AlertCircle,
    title: "Time-to-Hire Increase",
    message: "Average time-to-hire increased to 42 days (target: 35 days)",
    timestamp: "2 days ago",
  },
];

export function AlertsPanel() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Automated Insights & Alerts</CardTitle>
        <p className="text-sm text-muted-foreground">Real-time notifications for critical metrics</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            const variantMap = {
              danger: "destructive",
              warning: "default",
              info: "default",
            } as const;

            return (
              <Alert key={alert.id} variant={variantMap[alert.type as keyof typeof variantMap]} className="transition-all duration-200 hover:shadow-md">
                <Icon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
