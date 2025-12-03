import { Card } from "@/components/ui/card";
import { attritionData } from "../../data/mockData";
import { AlertCircle } from "lucide-react";

export const AttritionBreakdown = () => {
  const avgAttrition = attritionData.reduce((acc, d) => acc + d.attritionRate, 0) / attritionData.length;
  
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Attrition Analysis by Department</h3>
        <p className="text-sm text-gray-600">Identify high-risk departments and turnover patterns</p>
      </div>
      <div className="space-y-3">
        {attritionData.map((dept) => {
          const isHighRisk = dept.attritionRate > avgAttrition + 2;
          const isMediumRisk = dept.attritionRate > avgAttrition && !isHighRisk;
          
          let bgColor = "bg-green-100";
          let barColor = "#16a249"; // success - green

          
          if (isHighRisk) {
            bgColor = "bg-red-100";
            barColor = "#ef4444";
          } else if (isMediumRisk) {
            bgColor = "bg-amber-100";
            barColor = "#f59e0b";
          }
          
          return (
            <div key={dept.department} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                  {isHighRisk && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{dept.count} exits</span>
                  <span className="text-sm font-semibold text-gray-900">{dept.attritionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className={`relative h-8 rounded overflow-hidden ${bgColor}`}>
                <div 
                  className="absolute h-full transition-all duration-500 rounded"
                  style={{ 
                    width: `${(dept.attritionRate / 12) * 100}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Average Attrition Rate</span>
          <span className="font-semibold text-gray-900">{avgAttrition.toFixed(1)}%</span>
        </div>
      </div>
    </Card>
  );
};