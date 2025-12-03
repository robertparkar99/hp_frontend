"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const departmentDistribution = [
  { month: "Apr", Applicants: 120, Shortlisted: 80, Hired: 50 },
  { month: "May", Applicants: 145, Shortlisted: 95, Hired: 60 },
  { month: "Jun", Applicants: 165, Shortlisted: 110, Hired: 75 },
  { month: "Jul", Applicants: 190, Shortlisted: 130, Hired: 88 },
  { month: "Aug", Applicants: 220, Shortlisted: 155, Hired: 105 },
  { month: "Sep", Applicants: 250, Shortlisted: 180, Hired: 125 },
];

const departmentSizes = [
  { name: "Engineering", value: 18, color: "#0da2e7" },
  { name: "Sales", value: 12, color: "#10b77f" },
  { name: "Marketing", value: 18, color: "#fb923c" },
  { name: "Operations", value: 22, color: "#7c3bed" },
  { name: "HR", value: 8, color: "#e92063" },
];

// Custom Tooltip Component for Department Distribution matching the image
const CustomDepartmentTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[180px]">
        <p className="font-semibold text-gray-800 text-center mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#0da2e7]">Applicants</span>
            <span className="font-medium text-[#0da2e7]">{payload[0].value}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#10b77f]">Shortlisted</span>
            <span className="font-medium text-[#10b77f]">{payload[1].value}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#fb923c]">Hired</span>
            <span className="font-medium text-[#fb923c]">{payload[2].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].payload.color }}
          />
          <span className="text-sm font-medium text-gray-800">{payload[0].name}</span>
        </div>
        <div className="text-sm text-gray-600">{payload[0].value}%</div>
      </div>
    );
  }
  return null;
};

export const DepartmentalInsights = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Departmental Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomDepartmentTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="Applicants" 
                  stackId="1" 
                  stroke="#0da2e7" 
                  fill="#0da2e7"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Shortlisted" 
                  stackId="1" 
                  stroke="#10b77f" 
                  fill="#10b77f"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Hired" 
                  stackId="1" 
                  stroke="#fb923c" 
                  fill="#fb923c"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 justify-center text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0da2e7]"></div>
                <span>Applicants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b77f]"></div>
                <span>Shortlisted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#fb923c]"></div>
                <span>Hired</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Size Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={departmentSizes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentSizes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center space-y-3">
                {departmentSizes.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="text-sm">{dept.name}</span>
                    </div>
                    <span className="text-sm font-medium">{dept.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};