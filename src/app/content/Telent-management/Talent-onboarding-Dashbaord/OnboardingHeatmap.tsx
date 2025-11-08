import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const departments = ["Engineering", "Sales", "HR", "Operations", "Marketing"];
const milestones = ["Documents", "Training", "System Setup", "Manager Intro", "First Review"];

const heatmapData = [
  [95, 88, 92, 98, 85],
  [78, 92, 85, 90, 88],
  [98, 95, 100, 98, 92],
  [85, 78, 82, 88, 75],
  [90, 85, 88, 95, 82],
];

const getColorClass = (value: number) => {
  if (value >= 90) return "bg-success/20 text-success border-success/30";
  if (value >= 75) return "bg-warning/20 text-warning border-warning/30";
  return "bg-destructive/20 text-destructive border-destructive/30";
};

export function OnboardingHeatmap() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Onboarding Completion Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">Completion rates by department and milestone</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="text-sm font-medium text-muted-foreground"></div>
              {milestones.map((milestone) => (
                <div key={milestone} className="text-xs font-medium text-center text-muted-foreground">
                  {milestone}
                </div>
              ))}
            </div>
            {departments.map((dept, deptIndex) => (
              <div key={dept} className="grid grid-cols-6 gap-2 mb-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center">
                  {dept}
                </div>
                {heatmapData[deptIndex].map((value, milestoneIndex) => (
                  <div
                    key={`${dept}-${milestoneIndex}`}
                    className={cn(
                      "p-3 rounded-md text-center text-sm font-semibold border transition-all duration-200 hover:scale-105 cursor-pointer",
                      getColorClass(value)
                    )}
                  >
                    {value}%
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
