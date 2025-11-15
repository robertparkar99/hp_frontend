


import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { growthData } from "../../data/mockData";

export const HiringVsAttritionChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Hiring vs Attrition Trends</h3>
        <p className="text-sm text-gray-600">Monthly comparison of new hires and employee attrition</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={growthData}>
          <defs>
            <linearGradient id="hiresGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="attritionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: any, name: string) => {
              const label = name === "hires" ? "New Hires" : "Attrition";
              return [value, label];
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="hires"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#hiresGradient)"
            name="New Hires"
          />
          <Area
            type="monotone"
            dataKey="attrition"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#attritionGradient)"
            name="Attrition"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};