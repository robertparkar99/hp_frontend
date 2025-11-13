

import { Card } from "@/components/ui/card";
import { lifecycleData } from "../../data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

export const LifecycleFunnel = () => {
  const maxCount = Math.max(...lifecycleData.map(d => d.count));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Employee Lifecycle Funnel</h3>
        <p className="text-sm text-gray-600">Conversion rates across recruitment and employment stages</p>
      </div>
      <div className="space-y-3">
        {lifecycleData.map((stage, index) => {
          const widthPercent = (stage.count / maxCount) * 100;
          const isPositiveTrend = stage.trend > 0;
          
          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{stage.count.toLocaleString()}</span>
                  {stage.conversion !== 100 && (
                    <span className="text-xs text-gray-500">({stage.conversion}% conv.)</span>
                  )}
                  <div className={`flex items-center text-xs ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositiveTrend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="ml-1">{Math.abs(stage.trend)}%</span>
                  </div>
                </div>
              </div>
              <div className="relative h-12 bg-gray-100 rounded overflow-hidden">
                <div 
                  className="absolute h-full transition-all duration-500 rounded"
                  style={{ 
                    width: `${widthPercent}%`,
                    background: `linear-gradient(90deg, rgba(0, 128, 255, 0.8), rgba(0, 128, 255, 0.4))`,
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs font-medium text-white/90">{widthPercent.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              {index < lifecycleData.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="text-xs text-gray-500">↓</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
