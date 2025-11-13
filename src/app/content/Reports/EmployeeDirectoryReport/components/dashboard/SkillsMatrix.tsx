


import { Card } from "@/components/ui/card";
import { skillsMatrixData, type SkillMatrixCell } from "../../data/mockData";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SkillsMatrix = () => {
  const [selectedCell, setSelectedCell] = useState<SkillMatrixCell | null>(null);

  // Unique departments and skills
  const departments = Array.from(new Set(skillsMatrixData.map((d) => d.department)));
  const skills = Array.from(new Set(skillsMatrixData.map((d) => d.skill)));

  const getCellData = (dept: string, skill: string): SkillMatrixCell | undefined => {
    return skillsMatrixData.find((d) => d.department === dept && d.skill === skill);
  };

  // 🎨 Fixed Color Codes
  // Excellent = Green, Good = Blue, Warning = Yellow, Danger = Red
  const getCellColor = (delta: number): string => {
    if (delta >= 0) return "bg-[#16a34a]"; // ✅ Green (#16a34a)
    if (delta >= -0.2) return "bg-[#1fe066]"; // ✅ Blue (#1fe066)
    if (delta >= -0.4) return "bg-[#f59f0a]"; // ✅ Yellow (#f59f0a)
    return "bg-[#ef4343]"; // ✅ Red (#ef4343)
  };

  const getCellTextColor = (delta: number): string => {
    return "text-white";
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Skills & Proficiency Matrix</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Coverage % and proficiency delta (Actual - Expected) by department and skill
        </p>

        {/* Legend */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#16a34a]"></div>
            <span>Meets/Exceeds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#1fe066]"></div>
            <span>Minor Gap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#f59f0a]"></div>
            <span>Moderate Gap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#ef4343]"></div>
            <span>Significant Gap</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <TooltipProvider>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm font-semibold bg-muted sticky left-0 z-10">
                  Department
                </th>
                {skills.map((skill) => (
                  <th
                    key={skill}
                    className="p-2 text-center text-sm font-semibold bg-muted min-w-[120px]"
                  >
                    {skill}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept} className="border-t border-border">
                  <td className="p-2 text-sm font-medium bg-card sticky left-0 z-10">{dept}</td>
                  {skills.map((skill) => {
                    const cellData = getCellData(dept, skill);
                    if (!cellData) {
                      return (
                        <td key={`${dept}-${skill}`} className="p-2 text-center bg-muted/30">
                          <span className="text-xs text-muted-foreground">N/A</span>
                        </td>
                      );
                    }

                    return (
                      <Tooltip key={`${dept}-${skill}`}>
                        <TooltipTrigger asChild>
                          <td
                            className={`p-2 cursor-pointer transition-all hover:scale-105 ${getCellColor(
                              cellData.delta
                            )}`}
                            onClick={() => setSelectedCell(cellData)}
                          >
                            <div className={`text-center ${getCellTextColor(cellData.delta)}`}>
                              <div className="text-sm font-semibold">{cellData.coverage}%</div>
                              <div className="text-xs">
                                Δ {cellData.delta > 0 ? "+" : ""}
                                {cellData.delta.toFixed(1)}
                              </div>
                              <div className="text-xs opacity-90">
                                {cellData.actualProficiency.toFixed(1)} /{" "}
                                {cellData.expectedProficiency.toFixed(1)}
                              </div>
                            </div>
                          </td>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-semibold">
                              {dept} - {skill}
                            </p>
                            <div className="text-sm space-y-1">
                              <p>Coverage: {cellData.coverage}%</p>
                              <p>Employees with skill: {cellData.employeeCount}</p>
                              <p>
                                Actual Proficiency: {cellData.actualProficiency.toFixed(2)} / 5.0
                              </p>
                              <p>
                                Expected Proficiency: {cellData.expectedProficiency.toFixed(2)} / 5.0
                              </p>
                              <p className="font-medium">
                                Delta: {cellData.delta > 0 ? "+" : ""}
                                {cellData.delta.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TooltipProvider>
      </div>

      {/* Selected Cell Info */}
      {selectedCell && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">
            Selected: {selectedCell.department} - {selectedCell.skill}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Coverage</p>
              <p className="font-medium">{selectedCell.coverage}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Employee Count</p>
              <p className="font-medium">{selectedCell.employeeCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Actual Proficiency</p>
              <p className="font-medium">{selectedCell.actualProficiency.toFixed(2)} / 5.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expected Proficiency</p>
              <p className="font-medium">{selectedCell.expectedProficiency.toFixed(2)} / 5.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Proficiency Delta</p>
              <p
                className={`font-medium ${
                  selectedCell.delta >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                }`}
              >
                {selectedCell.delta > 0 ? "+" : ""}
                {selectedCell.delta.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
