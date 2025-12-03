

  import { Card } from "@/components/ui/card";
  import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
  import { useState } from "react";

  const roleData = [
    { role: "Software Engineer", count: 285, color: "#0080ff" },
    { role: "Senior Engineer", count: 178, color: "#1cd4d4" },
    { role: "Product Manager", count: 92, color: "#3d99f5" },
    { role: "Sales Representative", count: 156, color: "#16a249" },
    { role: "Marketing Manager", count: 89, color: "#f59e0b" },
    { role: "Operations Specialist", count: 134, color: "#64748b" },
    { role: "HR Manager", count: 67, color: "#000000" },
    { role: "Financial Analyst", count: 83, color: "#000000" },
    { role: "Others", count: 163, color: "#f1f5f9" },
  ];

  export const JobRoleDistribution = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const onPieEnter = (_: any, index: number) => {
      setActiveIndex(index);
    };

    const onPieLeave = () => {
      setActiveIndex(null);
    };

    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Job Role Distribution</h3>
          <p className="text-sm text-gray-600">Current workforce breakdown by job roles</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ role, percent }) => `${role}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {roleData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: any) => [value, "Employees"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };  