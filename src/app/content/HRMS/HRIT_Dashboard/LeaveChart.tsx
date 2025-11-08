import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const data = [
  { type: "Sick", planned: 45, unplanned: 32 },
  { type: "Vacation", planned: 78, unplanned: 12 },
  { type: "Personal", planned: 23, unplanned: 18 },
  { type: "Other", planned: 15, unplanned: 8 },
];

export const LeaveChart = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Leave Distribution</CardTitle>
        <CardDescription className="text-sm">Planned vs unplanned leave by type</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart 
            data={data} 
            margin={{ 
              top: 10, 
              right: 10, 
              left: 0,  // Reduced left margin
              bottom: 5 
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              vertical={false} 
            />
            <XAxis 
              dataKey="type" 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              interval={0}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              width={30} // Fixed width for YAxis
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ 
                color: "#111827", 
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "4px"
              }}
              itemStyle={{ 
                color: "#374151",
                fontSize: "11px",
                padding: "2px 0"
              }}
              formatter={(value) => [`${value}`, ""]}
            />
            <Legend 
              verticalAlign="top"
              height={30}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{
                fontSize: "11px",
                color: "#374151",
              }}
            />
            <Bar 
              dataKey="planned" 
              fill="#3b82f6" 
              name="Planned" 
              radius={[2, 2, 0, 0]}
              barSize={24} // Slightly smaller bars
            />
            <Bar 
              dataKey="unplanned" 
              fill="#f59e0b" 
              name="Unplanned" 
              radius={[2, 2, 0, 0]}
              barSize={24} // Slightly smaller bars
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};