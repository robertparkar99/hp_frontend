import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const data = [
  { type: "Sick", planned: 45, unplanned: 32 },
  { type: "Vacation", planned: 78, unplanned: 12 },
  { type: "Personal", planned: 23, unplanned: 18 },
  { type: "Other", planned: 15, unplanned: 8 },
];

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        <p className="font-semibold text-gray-900 text-sm mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Planned</span>
            </div>
            <span className="font-medium text-gray-900 text-xs">
              {payload[0].value}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs text-gray-600">Unplanned</span>
            </div>
            <span className="font-medium text-gray-900 text-xs">
              {payload[1].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

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
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
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