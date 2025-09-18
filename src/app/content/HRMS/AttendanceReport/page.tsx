"use client";
import React, { useState, useEffect, use } from "react";
import EmployeeSelector from "@/app/content/User-Attendance/components/EmployeeSelector";
import { Employee } from "@/app/content/User-Attendance/types/attendance";
import { Search } from "lucide-react";

type AttendanceRow = {
  id: number;
  date: string;
  empNo: string;
  department: string;
  name: string;
  inTime: string;
  outTime: string;
  duration: string;
  selfie: string;
  status:
    | "Absent"
    | "Latecomer"
    | "HalfDay"
    | "Weekend"
    | "Holiday"
    | "SameInOut"
    | "Present";
};

export default function DemoMulti() {
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [tableData, setTableData] = useState<AttendanceRow[]>([]);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    userId: "",
    syear: "",
    user_profile_name: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, user_id, syear, user_profile_name } =
        JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        syear: syear,
        userId: user_id,
        user_profile_name: user_profile_name,
      });
    }
  }, []);

  // 🔹 Helper: calculate duration
  const getDuration = (inTime: string, outTime: string): string => {
    if (!inTime || !outTime || inTime === "-" || outTime === "-") return "-";
    const [inH, inM, inS] = inTime.split(":").map(Number);
    const [outH, outM, outS] = outTime.split(":").map(Number);
    const inDate = new Date(2000, 0, 1, inH, inM, inS || 0);
    const outDate = new Date(2000, 0, 1, outH, outM, outS || 0);
    let diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs < 0) return "-";
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffH.toString().padStart(2, "0")}:${diffM
      .toString()
      .padStart(2, "0")}`;
  };

  // 🔹 Search button handler
  const handleSearch = async () => {
    try {
      const params = new URLSearchParams({
        token: sessionData.token,
        from_date: fromDate,
        to_date: toDate,
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        syear: sessionData.syear,
        user_id: sessionData.userId,
        user_profile_name: sessionData.user_profile_name,
      });

      selectedDepartments.forEach((deptId, idx) => {
        params.append(`department_id[${idx}]`, deptId);
      });
      selectedEmployees.forEach((emp, idx) => {
        params.append(`employee_id[${idx}]`, emp.id.toString());
      });

      const res = await fetch(
        `${sessionData.url}/hrms/multiple_attendance_report/create?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      console.log("API Response:", data);

      const getDateRange = (start: string, end: string) => {
        const result: string[] = [];
        let current = new Date(start);
        const last = new Date(end);
        while (current <= last) {
          result.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
        return result;
      };

      const dateRange = getDateRange(fromDate, toDate);
      const formatted: AttendanceRow[] = [];

      if (data.users && data.users.length > 0) {
        data.users.forEach((u: any) => {
          dateRange.forEach((date) => {
            let status: AttendanceRow["status"] = "Absent";
            let inTime = "-";
            let outTime = "-";

            // 🔹 Check holiday
            if (data.holidayData && data.holidayData.includes(date)) {
              status = "Holiday";
            }
            // 🔹 Check attendance logs from allData
            else if (data.allData && data.allData[date] && data.allData[date][u.id]) {
              const dayData = data.allData[date][u.id];
              inTime = dayData.att_punch_in || "-";
              outTime = dayData.att_punch_out || "-";

              if (!inTime || !outTime || inTime === "-" || outTime === "-") {
                status = "Absent";
              } else if (inTime === outTime) {
                status = "SameInOut";
              } else {
                // compare employee in_time vs punch in
                const empIn = dayData.in_time || "";
                const empOut = dayData.out_time || "";
                if (empIn && inTime > empIn) {
                  status = "Latecomer";
                } else if (empOut && outTime < empOut) {
                  status = "HalfDay";
                } else {
                  status = "Present";
                }
              }
            }
            // 🔹 Weekend check from user weekly off
            else {
              const day = new Date(date).getDay(); // 0=Sun, 1=Mon
              const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
              const key = dayMap[day];
              if (u[key] === 0) {
                status = "Weekend";
              }
            }

            formatted.push({
              id: Math.random(),
              date,
              empNo: u.employee_no || "-",
              department: u.depName || "-",
              name: u.full_name || `${u.first_name} ${u.last_name}`,
              inTime,
              outTime,
              duration: getDuration(inTime, outTime),
              selfie: u.image
                ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${u.image}`
                : "-",
              status,
            });
          });
        });
      }

      setTableData(formatted);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setTableData([]);
    }
  };

  const legendItems = [
    { label: "Absent", color: "bg-pink-300" },
    { label: "Latecomer", color: "bg-orange-500" },
    { label: "HalfDay", color: "bg-yellow-300" },
    { label: "Weekend", color: "bg-green-300" },
    { label: "Holiday", color: "bg-green-500" },
    { label: "Punch-in and Punch-out same", color: "bg-red-500" },
    { label: "Present", color: "bg-white border" },
  ];

  const getRowColor = (status: AttendanceRow["status"]) => {
    switch (status) {
      case "Absent":
        return "bg-pink-300";
      case "Latecomer":
        return "bg-orange-200";
      case "HalfDay":
        return "bg-yellow-200";
      case "Weekend":
        return "bg-green-200";
      case "Holiday":
        return "bg-green-400";
      case "SameInOut":
        return "bg-red-300";
      case "Present":
        return "bg-white";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <EmployeeSelector
            multiSelect
            empMultiSelect={true}
            selectedEmployee={selectedEmployees}
            selectedDepartment={selectedDepartments}
            onSelectEmployee={setSelectedEmployees}
            onSelectDepartment={setSelectedDepartments}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block px-4 py-3 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div
          onClick={handleSearch}
          className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </div>
      </div>

      {/* Legend Section */}
      <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-700">
        <span className="mr-2">Colours Description =&gt;</span>
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      {tableData.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-sm font-medium">
              <tr>
                <th className="border px-3 py-2">Sr No.</th>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Emp No</th>
                <th className="border px-3 py-2">Department</th>
                <th className="border px-3 py-2">Employee Name</th>
                <th className="border px-3 py-2">In Time</th>
                <th className="border px-3 py-2">Out Time</th>
                <th className="border px-3 py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={row.id} className={`${getRowColor(row.status)} text-sm`}>
                  <td className="border px-3 py-2">{idx + 1}</td>
                  <td className="border px-3 py-2">{row.date}</td>
                  <td className="border px-3 py-2">{row.empNo}</td>
                  <td className="border px-3 py-2">{row.department}</td>
                  <td className="border px-3 py-2">{row.name}</td>
                  <td className="border px-3 py-2">{row.inTime}</td>
                  <td className="border px-3 py-2">{row.outTime}</td>
                  <td className="border px-3 py-2">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
