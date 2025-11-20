import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SkillGapData {
  skill: string;
  gap: number;
  expectedScore: number;
  actualScore: number;
}

interface SkillGapChartProps {
  data: SkillGapData[];
}

export const SkillGapChart = ({ data }: SkillGapChartProps) => {
  const getBarColor = (gap: number) => {
    if (gap >= 2) return "#dc2626"; // destructive - red
    if (gap >= 1) return "#d97706"; // warning - amber
    return "#16a34a"; // success - green
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white text-gray-900 p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-sm mb-2">{data.skill}</p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600">Gap: <span className="font-bold text-gray-900">{data.gap.toFixed(1)} points</span></p>
            <p className="text-gray-600">Expected: <span className="font-medium">{data.expectedScore.toFixed(1)}</span></p>
            <p className="text-gray-600">Actual: <span className="font-medium">{data.actualScore.toFixed(1)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Skill Deficiencies</h3>
        <p className="text-sm text-gray-600">Ranked by average gap (Expected - Actual proficiency)</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis 
            dataKey="skill" 
            type="category" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.gap)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};