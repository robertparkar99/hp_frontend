
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { departmentData } from "../../data/mockData";

const COLORS = [
  "#3b82f6", // primary - blue
  "#1cd4d4", // secondary - teal
  "#3d99f5", // accent - purple
  "#16a249", // success - green
  "#f59e0b", // warning - amber
  "#65758b", // chart-neutral - slate
];

export const DepartmentChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Workforce Distribution by Department</h3>
        <p className="text-sm text-gray-600">Current headcount and growth percentage</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={departmentData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis dataKey="department" type="category" stroke="#6b7280" width={100} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: any, name: string) => {
              if (name === "count") return [value, "Employees"];
              return [value, name];
            }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {departmentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
