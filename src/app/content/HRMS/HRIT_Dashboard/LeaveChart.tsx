"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

/* -----------------------------
   TYPES
------------------------------ */
interface ApiItem {
  leave_type_name: string;
  leave_day_type: string;
  leave_count: number;
}

interface ChartItem {
  type: string;
  [key: string]: number | string;
}
/* -----------------------------
   CUSTOM TOOLTIP
------------------------------ */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        <p className="font-semibold text-gray-900 text-sm mb-2">{label}</p>

        <div className="space-y-1">
          {payload.map((item: any) => (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600"> {item.name}</span>
              </div>
              <span className="text-xs font-medium text-gray-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

/* -----------------------------
   MAIN COMPONENT
------------------------------ */
export const LeaveChart = () => {
  const [data, setData] = useState<ChartItem[]>([]);
  const [dayTypes, setDayTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);


  const [sessionData, setSessionData] = useState<{
    url: string;
    token: string;
    subInstituteId: string;
    orgType: string;
    userId: string;
  } | null>(null);


  // 🔹 Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id, org_type, user_id } =
          JSON.parse(userData);

        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: String(sub_institute_id),
          orgType: org_type,
          userId: String(user_id),
        });
      } catch (e) {
        console.error("Invalid userData in localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!sessionData) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/api/leave-distribution?type=api&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch leave distribution data");
        }

        const json = await res.json();
        const apiData: ApiItem[] = json.data || [];

        const grouped: Record<string, ChartItem> = {};
        const typesSet = new Set<string>();

        apiData.forEach((item) => {
          const leaveType = item.leave_type_name;
          const dayType = item.leave_day_type;

          typesSet.add(dayType);

          if (!grouped[leaveType]) {
            grouped[leaveType] = { type: leaveType };
          }

          grouped[leaveType][dayType] =
            (grouped[leaveType][dayType] as number || 0) +
            item.leave_count;
        });

        setDayTypes(Array.from(typesSet));
        setData(Object.values(grouped));
      } catch (err) {
        console.error("API Error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionData]);


  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Leave Distribution</CardTitle>
        <CardDescription className="text-sm">
          Planned vs unplanned leave by type
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-gray-500">
            Loading chart...
          </div>
        ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />

                <XAxis
                  dataKey="type"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />

                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  width={30}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(243, 244, 246, 0.5)" }}
                />

                <Legend
                  verticalAlign="top"
                  height={30}
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{
                    fontSize: "11px",
                    color: "#374151",
                  }}
                />

                {dayTypes.map((dayType, index) => (
                  <Bar
                    key={dayType}
                    dataKey={dayType}
                    name={dayType} // ✅ API name used
                    fill={index === 0 ? "#3b82f6" : "#f59e0b"}
                    radius={[2, 2, 0, 0]}
                    barSize={24}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
