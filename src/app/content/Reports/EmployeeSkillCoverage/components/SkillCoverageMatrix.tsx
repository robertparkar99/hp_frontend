import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SkillData {
  skill: string;
  roles: {
    [role: string]: {
      coverage: number; // percentage coverage
      expected: number; // expected proficiency score
      actual: number; // actual proficiency score
    };
  };
}

interface SkillCoverageMatrixProps {
  data: SkillData[];
  roles: string[];
}

export const SkillCoverageMatrix = ({ data, roles }: SkillCoverageMatrixProps) => {
  const [selectedCell, setSelectedCell] = useState<{ skill: string; role: string } | null>(null);

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return "from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30";
    if (coverage >= 80) return "from-green-500 to-emerald-600 shadow-md shadow-green-500/25";
    if (coverage >= 70) return "from-lime-500 to-green-600 shadow-md shadow-lime-500/20";
    if (coverage >= 60) return "from-amber-500 to-orange-500 shadow-md shadow-amber-500/25";
    if (coverage >= 50) return "from-orange-500 to-red-500 shadow-md shadow-orange-500/25";
    return "from-red-600 to-rose-700 shadow-lg shadow-red-600/30";
  };

  const getGapIndicator = (gap: number) => {
    if (gap === 0) return "→";
    return gap > 0 ? `↓${Math.abs(gap).toFixed(1)}` : `↑${Math.abs(gap).toFixed(1)}`;
  };

  const getCoverageIntensity = (coverage: number) => {
    const baseOpacity = Math.max(0.85, coverage / 100);
    const scale = 0.95 + (coverage / 1000);
    return { 
      opacity: baseOpacity,
      transform: `scale(${scale})`,
    };
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Skill Coverage Matrix</h3>
        <p className="text-sm text-muted-foreground">% of employees meeting or exceeding expected proficiency</p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `200px repeat(${roles.length}, 100px)` }}>
            {/* Header row */}
            <div className="sticky left-0 bg-background z-10"></div>
            {roles.map((role) => (
              <div key={role} className="p-3 text-xs font-semibold text-center text-foreground bg-muted rounded-t">
                {role}
              </div>
            ))}

            {/* Data rows */}
            {data.map((skillData) => (
              <>
                <div className="sticky left-0 bg-background z-10 p-3 text-sm font-medium text-foreground flex items-center">
                  {skillData.skill}
                </div>
                {roles.map((role) => {
                  const roleData = skillData.roles[role] || { coverage: 0, expected: 0, actual: 0 };
                  const { coverage, expected, actual } = roleData;
                  const gap = actual - expected;
                  const isSelected = selectedCell?.skill === skillData.skill && selectedCell?.role === role;
                  
                  return (
                    <button
                      key={`${skillData.skill}-${role}`}
                      className={cn(
                        "p-3 text-xs font-bold text-white rounded-lg transition-all duration-300 relative group bg-gradient-to-br hover:scale-105 active:scale-95",
                        getCoverageColor(coverage),
                        isSelected && "ring-4 ring-primary ring-offset-2 scale-105"
                      )}
                      style={getCoverageIntensity(coverage)}
                      onClick={() => setSelectedCell({ skill: skillData.skill, role })}
                    >
                      <div className="text-base drop-shadow-md">{coverage}%</div>
                      <div className="text-[10px] opacity-90 mt-0.5 font-semibold backdrop-blur-sm">Δ{getGapIndicator(gap)}</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg pointer-events-none"></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 border border-border/20">
                        <div className="font-semibold">{skillData.skill}</div>
                        <div className="text-muted-foreground">{role}</div>
                        <div className="border-t border-border my-2 pt-2 space-y-1">
                          <div><span className="text-muted-foreground">Expected:</span> <span className="font-semibold">{expected.toFixed(1)}</span></div>
                          <div><span className="text-muted-foreground">Actual:</span> <span className="font-semibold">{actual.toFixed(1)}</span></div>
                          <div><span className="text-muted-foreground">Gap:</span> <span className={cn("font-bold", gap < 0 ? "text-destructive" : gap > 0 ? "text-success" : "text-muted-foreground")}>{gap > 0 ? "+" : ""}{gap.toFixed(1)}</span></div>
                        </div>
                        <div className="font-bold mt-2 pt-2 border-t border-border">{coverage}% meeting target</div>
                      </div>
                    </button>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
        <span className="text-xs font-medium text-muted-foreground">Coverage Scale:</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded shadow-md"></div>
          <span className="text-xs text-muted-foreground font-medium">Excellent (≥80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded shadow-md"></div>
          <span className="text-xs text-muted-foreground font-medium">Moderate (60-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-rose-700 rounded shadow-md"></div>
          <span className="text-xs text-muted-foreground font-medium">Critical (&lt;60%)</span>
        </div>
      </div>
    </Card>
  );
};
