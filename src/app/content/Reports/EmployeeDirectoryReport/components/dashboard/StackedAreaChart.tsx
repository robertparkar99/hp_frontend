

import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { stackedGrowthData } from "../../data/mockData";

export const StackedAreaChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Department Growth Contribution</h3>
        <p className="text-sm text-gray-600">Stacked view of department headcount over time</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={stackedGrowthData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="Engineering"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Sales"
            stackId="1"
            stroke="#1cd4d4"
            fill="#1cd4d4"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Marketing"
            stackId="1"
            stroke="#3d99f5"
            fill="#3d99f5"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Operations"
            stackId="1"
            stroke="#16a249"
            fill="#16a249"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="HR"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Finance"
            stackId="1"
            stroke="#65758b"
            fill="#65758b"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
