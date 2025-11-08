import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", engineering: 32, sales: 28, hr: 45, operations: 38 },
  { month: "Feb", engineering: 35, sales: 30, hr: 48, operations: 40 },
  { month: "Mar", engineering: 38, sales: 33, hr: 50, operations: 42 },
  { month: "Apr", engineering: 40, sales: 35, hr: 52, operations: 45 },
  { month: "May", engineering: 42, sales: 38, hr: 55, operations: 48 },
  { month: "Jun", engineering: 45, sales: 40, hr: 58, operations: 50 },
];

export function DiversityTrend() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Diversity Trend by Department</CardTitle>
        <p className="text-sm text-muted-foreground">
          Percentage of diverse hires over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] -ml-2 pr-2"> {/* 👈 small tweak for full-width balance */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }} // 👈 removes extra left padding
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={30} // 👈 keeps minimal Y-axis width
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  marginTop: "10px",
                  fontWeight: "500",
                }}
              />
              <Line
                type="monotone"
                dataKey="engineering"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#ef4444" }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#06b6d4" }}
              />
              <Line
                type="monotone"
                dataKey="hr"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="operations"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
