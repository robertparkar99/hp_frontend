"use client";
import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

// Colors for departments
const departmentColors = ["#0da2e7", "#10b77f", "#fb923c", "#7c3bed", "#e92063", "#f59e0b", "#ef4444"];

interface DepartmentSize {
  name: string;
  value: number;
  color: string;
}

interface DepartmentDistribution {
  month: string;
  Applicants: number;
  Shortlisted: number;
  Hired: number;
}

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
  const [departmentDistribution, setDepartmentDistribution] = useState<DepartmentDistribution[]>([]);
  const [departmentSizes, setDepartmentSizes] = useState<DepartmentSize[]>([]);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
      });
    }
  }, []);

  useEffect(() => {
    if (!sessionData.url) return;

    const fetchDepartmentData = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/reports/departments/distribution?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`);
        const result = await response.json();
        if (result.status) {
          const mappedData = result.data.map((item: any) => ({
            month: item.month,
            Applicants: item.applicants,
            Shortlisted: parseInt(item.shortlisted),
            Hired: parseInt(item.hired)
          }));
          setDepartmentDistribution(mappedData);
        }
      } catch (error) {
        console.error('Error fetching department data:', error);
      }
    };

    fetchDepartmentData();
  }, [sessionData]);

  useEffect(() => {
    if (!sessionData.url) return;

    const fetchDepartmentSizes = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/reports/departments/sizes?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`);
        const result = await response.json();
        if (result.status) {
          const mappedData = result.data.map((item: any, index: number) => ({
            name: item.name,
            value: item.value,
            color: departmentColors[index % departmentColors.length]
          }));
          setDepartmentSizes(mappedData);
        }
      } catch (error) {
        console.error('Error fetching department sizes:', error);
      }
    };

    fetchDepartmentSizes();
  }, [sessionData]);

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