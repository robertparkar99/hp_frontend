
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { growthData } from "../../data/mockData";

export const GrowthChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Headcount Growth Over Time</h3>
        <p className="text-sm text-gray-600">Monthly headcount with hiring and attrition trends</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={growthData}>
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
          <Line
            type="monotone"
            dataKey="headcount"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Headcount"
            dot={{ fill: "#3b82f6", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="hires"
            stroke="#10b981"
            strokeWidth={2}
            name="New Hires"
            dot={{ fill: "#10b981", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="attrition"
            stroke="#ef4444"
            strokeWidth={2}
            name="Attrition"
            dot={{ fill: "#ef4444", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}