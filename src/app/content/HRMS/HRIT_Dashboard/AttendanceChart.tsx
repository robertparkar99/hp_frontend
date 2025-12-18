// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

// const data = [
//   { date: "Mon", present: 92, absent: 8, late: 5 },
//   { date: "Tue", present: 95, absent: 5, late: 3 },
//   { date: "Wed", present: 88, absent: 12, late: 7 },
//   { date: "Thu", present: 94, absent: 6, late: 4 },
//   { date: "Fri", present: 90, absent: 10, late: 6 },
// ];

// export const AttendanceChart = () => {
//   return (
//     <Card className="col-span-2">
//       <CardHeader>
//         <CardTitle>Attendance Trends</CardTitle>
//         <CardDescription>Daily attendance patterns for the current week</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//             <XAxis 
//               dataKey="date" 
//               stroke="#6b7280"
//               fontSize={12}
//               tickLine={false}
//               axisLine={{ stroke: "#e5e7eb" }}
//             />
//             <YAxis 
//               stroke="#6b7280"
//               fontSize={12}
//               tickLine={false}
//               axisLine={{ stroke: "#e5e7eb" }}
//               domain={[0, 100]}
//             />
//             <Tooltip 
//               contentStyle={{
//                 backgroundColor: "white",
//                 border: "1px solid #e5e7eb",
//                 borderRadius: "8px",
//                 boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//               }}
//               labelStyle={{ color: "#111827", fontWeight: "bold" }}
//               itemStyle={{ color: "#374151" }}
//             />
//             <Legend 
//               verticalAlign="top"
//               height={36}
//               iconType="circle"
//               iconSize={8}
//               wrapperStyle={{
//                 fontSize: "12px",
//                 color: "#374151",
//               }}
//             />
//             <Line 
//               type="monotone" 
//               dataKey="present" 
//               stroke="#10b981" 
//               strokeWidth={3}
//               dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
//               name="Present (%)"
//             />
//             <Line 
//               type="monotone" 
//               dataKey="absent" 
//               stroke="#ef4444" 
//               strokeWidth={3}
//               dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
//               name="Absent (%)"
//             />
//             <Line 
//               type="monotone" 
//               dataKey="late" 
//               stroke="#f59e0b" 
//               strokeWidth={3}
//               dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
//               name="Late (%)"
//             />
//           </LineChart>
//         </ResponsiveContainer>

//         {/* Weekly Summary */}
//         {/* <div className="mt-6 grid grid-cols-3 gap-4">
//           <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
//             <div className="text-2xl font-bold text-green-700">88%</div>
//             <div className="text-sm text-green-600 font-medium">Present</div>
//           </div>
//           <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
//             <div className="text-2xl font-bold text-red-700">12%</div>
//             <div className="text-sm text-red-600 font-medium">Absent</div>
//           </div>
//           <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
//             <div className="text-2xl font-bold text-amber-700">7%</div>
//             <div className="text-sm text-amber-600 font-medium">Late</div>
//           </div>
//         </div> */}
//       </CardContent>
//     </Card>
//   );
// };


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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface AttendanceItem {
  date: string;
  present: number;
  absent: number;
  late: number;
}


export const AttendanceChart = () => {
  const [data, setData] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const fetchAttendance = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/api/attendance-weekly?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const json = await res.json();

        /**
         * Transform API response to Recharts format
         */
        const transformedData: AttendanceItem[] = json.labels.map(
          (label: string, index: number) => ({
            date: label,
            present: Number(json.present[index] ?? 0),
            absent: Number(json.absent[index] ?? 0),
            late: Number(json.late[index] ?? 0),
          })
        );

        setData(transformedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [sessionData]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>
          Daily attendance patterns for the current week
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Loading attendance data...
          </div>
        )}

        {error && (
          <div className="h-[300px] flex items-center justify-center text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />

              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                domain={[0, 100]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
                labelStyle={{
                  color: "#111827",
                  fontWeight: "bold",
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "12px",
                  color: "#374151",
                }}
              />

              <Line
                type="monotone"
                dataKey="present"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Present (%)"
              />

              <Line
                type="monotone"
                dataKey="absent"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Absent (%)"
              />

              <Line
                type="monotone"
                dataKey="late"
                stroke="#f59e0b"
                strokeDasharray="6 4"   // 👈 KEY FIX
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Late (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

