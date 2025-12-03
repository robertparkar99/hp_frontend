import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { quarter: "Q1 2023", engineering: 4.2, sales: 3.8, hr: 4.5, operations: 4.0 },
  { quarter: "Q2 2023", engineering: 4.3, sales: 4.0, hr: 4.6, operations: 4.1 },
  { quarter: "Q3 2023", engineering: 4.4, sales: 4.2, hr: 4.7, operations: 4.3 },
  { quarter: "Q4 2023", engineering: 4.5, sales: 4.3, hr: 4.8, operations: 4.4 },
  { quarter: "Q1 2024", engineering: 4.6, sales: 4.5, hr: 4.9, operations: 4.5 },
];

export function PerformanceTrend() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Performance Trend by Department</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average performance ratings over time (out of 5)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] -ml-2 pr-2"> {/* 👈 Adjusted for tight alignment */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }} // 👈 removes extra chart padding
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="quarter"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 5]}
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

              <Area
                type="monotone"
                dataKey="engineering"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="hr"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="operations"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
