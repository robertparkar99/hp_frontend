import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock,  TrendingUp } from "lucide-react";

interface ComplianceItem {
  id: number;
  name: string; // title
  description: string;
  frequency: string; // badge
  created_at: string; // timestamp
  assigned_user: string; // by
}

interface RecentActivityProps {
  activities: ComplianceItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-100 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="h-5 w-5 text-blue-400" />
          Compliance
        </CardTitle>
      </CardHeader>
      <div className="space-y-4 overflow-y-auto h-[280px] pr-2 scrollbar-hide p-2">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent compliance data</p>
        )}

        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-card-hover transition-colors"
          >
            <div className="w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">
                {activity.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>by {activity.assigned_user}</span>
                <span>•</span>
                <span>{new Date(activity.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <Badge className="bg-primary/5 text-blue-400 hover:bg-primary/10">
              {activity.frequency}
            </Badge>
          </div>
        ))}
{/* 
        <div className="pt-2 border-t border-border">
          <button className="text-sm text-primary hover:text-primary-hover font-medium">
            View all activity →
          </button>
        </div> */}
      </div>
    </Card>
  );
}
