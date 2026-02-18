

"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const growthData = [
  { month: "Apr", Engineering: 120, Sales: 80, Marketing: 60, Operations: 90, HR: 30 },
  { month: "May", Engineering: 150, Sales: 95, Marketing: 75, Operations: 105, HR: 35 },
  { month: "Jun", Engineering: 180, Sales: 110, Marketing: 90, Operations: 120, HR: 40 },
  { month: "Jul", Engineering: 210, Sales: 130, Marketing: 105, Operations: 140, HR: 45 },
  { month: "Aug", Engineering: 245, Sales: 150, Marketing: 125, Operations: 160, HR: 50 },
  { month: "Sep", Engineering: 280, Sales: 170, Marketing: 145, Operations: 185, HR: 55 },
  { month: "Oct", Engineering: 320, Sales: 195, Marketing: 165, Operations: 210, HR: 62 },
];

const hiringData = [
  { month: "Apr", hires: 45, attrition: 38 },
  { month: "May", hires: 58, attrition: 40 },
  { month: "Jun", hires: 62, attrition: 39 },
  { month: "Jul", hires: 75, attrition: 42 },
  { month: "Aug", hires: 88, attrition: 44 },
  { month: "Sep", hires: 102, attrition: 48 },
  { month: "Oct", hires: 115, attrition: 46 },
];

// Custom Tooltip Component for Growth Chart
const CustomGrowthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.dataKey}</span>
              </div>
              <span className="font-medium text-gray-800">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip Component for Hiring Chart
const CustomHiringTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
              <span className="font-medium text-gray-800">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const OrganizationalGrowth = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Organizational Growth</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomGrowthTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="Engineering" 
                  stackId="1" 
                  stroke="#0da2e7" 
                  fill="#0da2e7"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Sales" 
                  stackId="1" 
                  stroke="#10b77f" 
                  fill="#10b77f"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Marketing" 
                  stackId="1" 
                  stroke="#fb923c" 
                  fill="#fb923c"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Operations" 
                  stackId="1" 
                  stroke="#7c3bed" 
                  fill="#7c3bed"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="HR" 
                  stackId="1" 
                  stroke="#e92063" 
                  fill="#e92063"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0da2e7]"></div>
                <span>Engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b77f]"></div>
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#fb923c]"></div>
                <span>Marketing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#7c3bed]"></div>
                <span>Operations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e92063]"></div>
                <span>HR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring vs Attrition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hiringData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomHiringTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="hires" 
                  stroke="#10b77f" 
                  strokeWidth={3}
                  name="New Hires"
                  dot={{ fill: '#10b77f', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attrition" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  name="Attrition"
                  dot={{ fill: '#dc2626', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b77f]"></div>
                <span>New Hires</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
                <span>Attrition</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};