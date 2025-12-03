import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Employee {
  name: string;
  role: string;
}

const matrixData: (Employee[] | null)[][] = [
  [
    [{ name: "Sarah Chen", role: "Senior Dev" }],
    [{ name: "Mike Ross", role: "Tech Lead" }, { name: "Lisa Wang", role: "Architect" }],
    [{ name: "John Smith", role: "VP Engineering" }],
  ],
  [
    [{ name: "Alex Kim", role: "Developer" }],
    [{ name: "Emma Davis", role: "Senior Dev" }, { name: "Tom Brown", role: "Senior Dev" }],
    [{ name: "Rachel Green", role: "Director" }],
  ],
  [
    null,
    [{ name: "Chris Lee", role: "Junior Dev" }],
    [{ name: "Nina Patel", role: "Manager" }],
  ],
];

const performanceLabels = ["Low", "Medium", "High"];
const potentialLabels = ["Low", "Medium", "High"];

export function SuccessionMatrix() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Succession Planning Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">9-Box Grid: Performance vs. Potential</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="flex items-end justify-center pb-2">
              <span className="text-xs font-medium text-muted-foreground -rotate-90 origin-center">
                Potential →
              </span>
            </div>
            {performanceLabels.map((label) => (
              <div key={label} className="text-center text-xs font-medium text-muted-foreground pb-2">
                {label}
              </div>
            ))}
          </div>

          {[...matrixData].reverse().map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-3">
              <div className="flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {potentialLabels[2 - rowIndex]}
                </span>
              </div>
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={cn(
                    "min-h-[120px] rounded-lg border-2 p-3 transition-all duration-200 hover:shadow-card-hover",
                    rowIndex === 0 && colIndex === 2 && "bg-success/10 border-success/30",
                    rowIndex === 0 && colIndex === 1 && "bg-primary/10 border-primary/30",
                    rowIndex === 1 && colIndex === 2 && "bg-primary/10 border-primary/30",
                    (!cell || (rowIndex === 2 || colIndex === 0)) && "bg-muted border-border"
                  )}
                >
                  {cell && (
                    <div className="space-y-2">
                      {cell.map((employee, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="w-full justify-start text-xs font-normal"
                        >
                          <div className="truncate">
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-[10px] text-muted-foreground">{employee.role}</div>
                          </div>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="text-center pt-2">
            <span className="text-xs font-medium text-muted-foreground">← Performance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
