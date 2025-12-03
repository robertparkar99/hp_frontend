import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export const InsightsCard = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Attendance has improved by 3%</span> this week compared to last week
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Unplanned leave is 23% higher on Mondays</span> - consider investigating causes
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Engineering department shows highest productivity</span> index at 94.2%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};