import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

const data = [
  { month: "Jan", accuracy: 96.5 },
  { month: "Feb", accuracy: 97.8 },
  { month: "Mar", accuracy: 98.2 },
  { month: "Apr", accuracy: 97.5 },
  { month: "May", accuracy: 98.8 },
  { month: "Jun", accuracy: 99.1 },
];

export const PayrollChart = () => {
  const avgAccuracy = (data.reduce((sum, d) => sum + d.accuracy, 0) / data.length).toFixed(1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Payroll Accuracy & Processing</CardTitle>
        <CardDescription>Monthly payroll metrics over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              domain={[95, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, "Accuracy"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Area 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#accuracyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-xs text-amber-700 font-medium mb-1">6-Month Average</div>
            <div className="text-lg font-bold text-amber-900">{avgAccuracy}%</div>
            <div className="text-xs text-amber-600 mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Improving trend
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-xs text-green-700 font-medium mb-1">Best Performance</div>
            <div className="text-lg font-bold text-green-900">99.1%</div>
            <div className="text-xs text-green-600 mt-1">Jun 2024</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-xs text-blue-700 font-medium mb-1">Key Improvement Area</div>
            <div className="text-sm font-bold text-blue-900">Data Input Errors</div>
            <div className="text-xs text-blue-600 mt-1">Most common issue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};