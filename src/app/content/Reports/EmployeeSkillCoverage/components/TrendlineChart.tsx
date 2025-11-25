import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TrendData {
  period: string;
  coverage: number;
  avgGap: number;
}

interface TrendlineChartProps {
  data: TrendData[];
}

export const TrendlineChart = ({ data }: TrendlineChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white text-gray-900 p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.period}</p>
          <div className="space-y-1 text-xs">
            <p className="text-green-600">Coverage: <span className="font-bold">{payload[0].value}%</span></p>
            <p className="text-amber-500">Avg Gap: <span className="font-bold">{payload[1].value.toFixed(1)} pts</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Skill Performance Trends</h3>
        <p className="text-sm text-gray-600">Track coverage % and average gap evolution over time</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="period" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            label={{ value: 'Coverage %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            label={{ value: 'Avg Gap (pts)', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="coverage" 
            stroke="#16a34a" 
            strokeWidth={2}
            name="Coverage %"
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="avgGap" 
            stroke="#d97706" 
            strokeWidth={2}
            name="Avg Gap"
            dot={{ fill: '#d97706', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-900">
          <span className="font-semibold">AI Insight:</span> Technical competency improved by <span className="font-bold text-green-700">+0.8 points</span> after Q2 training initiative. Coverage increased <span className="font-bold text-green-700">+5%</span> quarter-over-quarter.
        </p>
      </div>
    </Card>
  );
};