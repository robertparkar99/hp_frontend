import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "High Performers", value: 28, color: "#10b981" },
  { name: "Average", value: 55, color: "#3b82f6" },
  { name: "Needs Improvement", value: 17, color: "#f59e0b" },
];

export const PerformanceChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Distribution</CardTitle>
        <CardDescription>Employee performance breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${value}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ 
                color: "#111827", 
                fontWeight: "bold",
                marginBottom: "4px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">
                {item.name}: <span className="font-semibold">{item.value}%</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};