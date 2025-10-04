// "use client";
// import React, { useState, useEffect, useMemo } from "react";
// import EmployeeSelector from "@/app/content/User-Attendance/components/EmployeeSelector";
// import { Employee } from "@/app/content/User-Attendance/types/attendance";
// import { Search } from "lucide-react";
// import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

// type AttendanceRow = {
//   id: number;
//   date: string;
//   empNo: string;
//   department: string;
//   name: string;
//   inTime: string;
//   outTime: string;
//   duration: string;
//   selfie: string;
//   status:
//     | "Absent"
//     | "Latecomer"
//     | "HalfDay"
//     | "Weekend"
//     | "Holiday"
//     | "SameInOut"
//     | "Present";
// };

// export default function DemoMulti() {
//   const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
//   const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
//   const [fromDate, setFromDate] = useState<string>("");
//   const [toDate, setToDate] = useState<string>("");
//   const [tableData, setTableData] = useState<AttendanceRow[]>([]);
//   const [sessionData, setSessionData] = useState({
//     url: "",
//     token: "",
//     subInstituteId: "",
//     userId: "",
//     syear: "",
//     user_profile_name: "",
//   });
//   const [filterText, setFilterText] = useState("");
//   const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       const { APP_URL, token, sub_institute_id, user_id, syear, user_profile_name } =
//         JSON.parse(userData);
//       setSessionData({
//         url: APP_URL,
//         token,
//         subInstituteId: sub_institute_id,
//         syear: syear,
//         userId: user_id,
//         user_profile_name: user_profile_name,
//       });
//     }
//   }, []);

//   // 🔹 Helper: calculate duration
//   const getDuration = (inTime: string, outTime: string): string => {
//     if (!inTime || !outTime || inTime === "-" || outTime === "-") return "-";
//     const [inH, inM, inS] = inTime.split(":").map(Number);
//     const [outH, outM, outS] = outTime.split(":").map(Number);
//     const inDate = new Date(2000, 0, 1, inH, inM, inS || 0);
//     const outDate = new Date(2000, 0, 1, outH, outM, outS || 0);
//     let diffMs = outDate.getTime() - inDate.getTime();
//     if (diffMs < 0) return "-";
//     const diffH = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//     return `${diffH.toString().padStart(2, "0")}:${diffM
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   // 🔹 Search button handler - COMPLETELY REWRITTEN
//   const handleSearch = async () => {
//     try {
//       setLoading(true);

//       // Validate dates
//       if (!fromDate || !toDate) {
//         alert("Please select both From Date and To Date");
//         setLoading(false);
//         return;
//       }

//       // Validate date range
//       if (fromDate > toDate) {
//         alert("From Date cannot be greater than To Date");
//         setLoading(false);
//         return;
//       }

//       const params = new URLSearchParams({
//         token: sessionData.token,
//         from_date: fromDate,
//         to_date: toDate,
//         type: "API",
//         sub_institute_id: sessionData.subInstituteId,
//         syear: sessionData.syear,
//         user_id: sessionData.userId,
//         user_profile_name: sessionData.user_profile_name,
//       });

//       selectedDepartments.forEach((deptId, idx) => {
//         params.append(`department_id[${idx}]`, deptId);
//       });
//       selectedEmployees.forEach((emp, idx) => {
//         params.append(`employee_id[${idx}]`, emp.id.toString());
//       });

//       console.log("API Request URL:", `${sessionData.url}/hrms/multiple_attendance_report/create?${params.toString()}`);
//       console.log("Fetching attendance data for:", fromDate, "to", toDate);

//       const res = await fetch(
//         `${sessionData.url}/hrms/multiple_attendance_report/create?${params.toString()}`
//       );

//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("Full API Response:", data);

//       // 🔹 DEBUG: Check what data we're getting
//       if (!data) {
//         console.error("No data received from API");
//         setTableData([]);
//         return;
//       }

//       console.log("Users data:", data.users);
//       console.log("AllData:", data.allData);
//       console.log("Holiday data:", data.holidayData);

//       const formatted: AttendanceRow[] = [];

//       // If no users data, return empty array
//       if (!data.users || !Array.isArray(data.users) || data.users.length === 0) {
//         console.log("No users data found in API response");
//         setTableData([]);
//         return;
//       }

//       // Generate date range for the selected period
//       const generateDateRange = (start: string, end: string): string[] => {
//         const dates: string[] = [];
//         const current = new Date(start);
//         const last = new Date(end);

//         while (current <= last) {
//           dates.push(current.toISOString().split('T')[0]);
//           current.setDate(current.getDate() + 1);
//         }
//         return dates;
//       };

//       const dateRange = generateDateRange(fromDate, toDate);
//       console.log("Date range to process:", dateRange);

//       // Process each user and each date in the range
//       data.users.forEach((user: any) => {
//         dateRange.forEach((date) => {
//           let status: AttendanceRow["status"] = "Absent";
//           let inTime = "-";
//           let outTime = "-";

//           // 🔹 1. First check if it's a holiday
//           if (data.holidayData && Array.isArray(data.holidayData) && data.holidayData.includes(date)) {
//             status = "Holiday";
//           }
//           // 🔹 2. Check if it's weekend from user's weekly off
//           else if (user) {
//             const day = new Date(date).getDay();
//             const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
//             const dayKey = dayMap[day];

//             // Check if user has weekly off for this day
//             if (user[dayKey] === 0 || user[dayKey] === "0") {
//               status = "Weekend";
//             }
//             // 🔹 3. Check attendance data
//             else if (data.allData && data.allData[date] && data.allData[date][user.id]) {
//               const dayData = data.allData[date][user.id];
//               console.log(`Attendance data for ${user.name} on ${date}:`, dayData);

//               inTime = dayData.att_punch_in || "-";
//               outTime = dayData.att_punch_out || "-";

//               // Determine status based on attendance data
//               if (!inTime || inTime === "-" || !outTime || outTime === "-") {
//                 status = "Absent";
//               } else if (inTime === outTime) {
//                 status = "SameInOut";
//               } else {
//                 // Compare with expected in/out times
//                 const empIn = dayData.in_time || "";
//                 const empOut = dayData.out_time || "";

//                 if (empIn && inTime > empIn) {
//                   status = "Latecomer";
//                 } else if (empOut && outTime < empOut) {
//                   status = "HalfDay";
//                 } else {
//                   status = "Present";
//                 }
//               }
//             }
//             // 🔹 4. If no attendance data and not weekend/holiday, it's Absent
//             else {
//               status = "Absent";
//             }
//           }

//           // Create the attendance record
//           formatted.push({
//             id: Math.random(),
//             date: date,
//             empNo: user.employee_no || user.emp_no || "-",
//             department: user.depName || user.department || "-",
//             name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",
//             inTime,
//             outTime,
//             duration: getDuration(inTime, outTime),
//             selfie: user.image
//               ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${user.image}`
//               : "-",
//             status,
//           });
//         });
//       });

//       console.log("Final formatted data count:", formatted.length);
//       console.log("Sample formatted data:", formatted.slice(0, 3));

//       if (formatted.length === 0) {
//         console.warn("No attendance records were generated. Check API response structure.");
//       }

//       setTableData(formatted);

//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//       alert(`Error fetching attendance data: ${err instanceof Error ? err.message : 'Unknown error'}`);
//       setTableData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Handle column filtering
//   const handleColumnFilter = (columnName: string, value: string) => {
//     setColumnFilters(prev => ({
//       ...prev,
//       [columnName]: value.toLowerCase()
//     }));
//   };

//   // 🔹 Filter data based on column filters and global search
//   const filteredItems = useMemo(() => {
//     if (!tableData || tableData.length === 0) return [];

//     return tableData.filter(item => {
//       // Global search
//       if (filterText) {
//         const searchText = filterText.toLowerCase();
//         const searchableFields = [
//           item.date,
//           item.empNo,
//           item.department,
//           item.name,
//           item.inTime,
//           item.outTime,
//           item.duration,
//           item.status
//         ];

//         if (!searchableFields.some(field => 
//           field && field.toString().toLowerCase().includes(searchText)
//         )) {
//           return false;
//         }
//       }

//       // Column-specific filters
//       return Object.entries(columnFilters).every(([column, filterValue]) => {
//         if (!filterValue) return true;

//         const columnValue = String(item[column as keyof AttendanceRow] || "").toLowerCase();
//         return columnValue.includes(filterValue);
//       });
//     });
//   }, [tableData, filterText, columnFilters]);

//   // 🔹 Custom styles for DataTable
//   const customStyles: TableStyles = {
//     headCells: {
//       style: {
//         fontSize: "14px",
//         backgroundColor: "#D1E7FF",
//         color: "black",
//         whiteSpace: "nowrap",
//         textAlign: "left",
//       },
//     },
//     cells: { style: { fontSize: "13px", textAlign: "left" } },
//     table: {
//       style: { border: "1px solid #ddd", borderRadius: "20px", overflow: "hidden" },
//     },
//   };

//   // 🔹 Get status color for the circle
//   const getStatusColor = (status: AttendanceRow["status"]) => {
//     switch (status) {
//       case "Absent":
//         return "bg-red-500";
//       case "Latecomer":
//         return "bg-orange-500";
//       case "HalfDay":
//         return "bg-yellow-300";
//       case "Weekend":
//         return "bg-green-300";
//       case "Holiday":
//         return "bg-green-500";
//       case "SameInOut":
//         return "bg-pink-300";
//       case "Present":
//         return "bg-white border border-gray-300";
//       default:
//         return "bg-gray-300";
//     }
//   };

//   // 🔹 DataTable columns configuration
//   const columns: TableColumn<AttendanceRow>[] = [
//     {
//       name: "Sr No.",
//       cell: (row: AttendanceRow, index?: number) => (index !== undefined ? index + 1 : 0),
//       sortable: true,
//       width: "80px"
//     },
//     {
//       name: "Date",
//       selector: (row: AttendanceRow) => row.date,
//       sortable: true,
//     },
//     {
//       name: "Emp No",
//       selector: (row: AttendanceRow) => row.empNo,
//       sortable: true,
//     },
//     {
//       name: "Department",
//       selector: (row: AttendanceRow) => row.department,
//       sortable: true,
//     },
//     {
//       name: "Employee Name",
//       selector: (row: AttendanceRow) => row.name,
//       sortable: true,
//     },
//     {
//       name: "In Time",
//       selector: (row: AttendanceRow) => row.inTime,
//       sortable: true,
//     },
//     {
//       name: "Out Time",
//       selector: (row: AttendanceRow) => row.outTime,
//       sortable: true,
//     },
//     {
//       name: "Duration",
//       selector: (row: AttendanceRow) => row.duration,
//       sortable: true,
//     },
//     {
//       name: "Status",
//       selector: (row: AttendanceRow) => row.status,
//       sortable: true,
//       cell: (row: AttendanceRow) => (
//         <div className="flex items-center gap-2">
//           <span className={`w-3 h-3 rounded-full ${getStatusColor(row.status)}`} />
//           <span>{row.status}</span>
//         </div>
//       ),
//     }
//   ];

//   const legendItems = [
//     { label: "Absent", color: "bg-red-500" },
//     { label: "Latecomer", color: "bg-orange-500" },
//     { label: "HalfDay", color: "bg-yellow-300" },
//     { label: "Weekend", color: "bg-green-300" },
//     { label: "Holiday", color: "bg-green-500" },
//     { label: "Punch-in and Punch-out same", color: "bg-pink-300" },
//     { label: "Present", color: "bg-white border border-gray-300" },
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Attendance Report</h1>
//         </div>
//       </div>

//       {/* Filters Section */}
//       <div className="flex items-end gap-4 flex-wrap">
//         <div className="flex-1 min-w-[250px]">
//           <EmployeeSelector
//             multiSelect
//             empMultiSelect={true}
//             selectedEmployee={selectedEmployees}
//             selectedDepartment={selectedDepartments}
//             onSelectEmployee={setSelectedEmployees}
//             onSelectDepartment={setSelectedDepartments}
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             From Date
//           </label>
//           <input
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             className="mt-1 block px-4 py-3 w-full border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">
//             To Date
//           </label>
//           <input
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             className="mt-1 block w-full px-4 py-3 border-gray-300 rounded-md shadow-sm"
//           />
//         </div>

//         <div
//           onClick={handleSearch}
//           className="flex items-center mb-4 justify-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-colors"
//         >
//           <Search className="w-4 h-4" />
//           <span>{loading ? "Searching..." : "Search"}</span>
//         </div>
//       </div>

//       {/* Debug Info */}
//       {tableData.length > 0 && (
//         <div className="bg-blue-50 p-3 rounded-lg">
//           <p className="text-sm text-blue-800">
//             Showing {tableData.length} records from {fromDate} to {toDate}
//           </p>
//         </div>
//       )}

//       {/* Legend Section */}
//       <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-700">
//         <span className="mr-2">Colours Description =&gt;</span>
//         {legendItems.map((item, index) => (
//           <div key={index} className="flex items-center gap-2">
//             <span className={`w-4 h-4 rounded-full ${item.color}`} />
//             <span>{item.label}</span>
//           </div>
//         ))}
//       </div>

//       {/* DataTable */}
//       {loading ? (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading attendance data...</p>
//         </div>
//       ) : tableData.length > 0 ? (
//         <div>
//           <DataTable
//             columns={columns}
//             data={filteredItems}
//             customStyles={customStyles}
//             pagination
//             highlightOnHover
//             responsive
//             noDataComponent={<div className="p-4 text-center">No data available</div>}
//             persistTableHead
//           />
//         </div>
//       ) : (
//         <div className="text-center py-8 bg-gray-50 rounded-lg">
//           <p className="text-gray-600">No attendance records found. Please select dates and click Search.</p>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";
import React, { useState, useEffect, useMemo } from "react";
import EmployeeSelector from "@/app/content/User-Attendance/components/EmployeeSelector";
import { Employee } from "@/app/content/User-Attendance/types/attendance";
import { Search } from "lucide-react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

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
  const [filterText, setFilterText] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    // if (!inTime || !outTime || inTime === "-" || outTime === "-") return "-";
    if (!inTime || !outTime || inTime === "-" || outTime === "-" || inTime === "null" || outTime === "null") return "-";
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

  // 🔹 Search button handler - FIXED DATE VALIDATION
  const handleSearch = async () => {
    try {
      setLoading(true);

      // Validate dates
      if (!fromDate || !toDate) {
        alert("Please select both From Date and To Date");
        setLoading(false);
        return;
      }

      // Validate date range - allow current date but not future dates
      const today = new Date().toISOString().split('T')[0];
      if (fromDate > today) {
        alert("From Date cannot be greater than current date");
        setLoading(false);
        return;
      }

      if (toDate > today) {
        alert("To Date cannot be greater than current date");
        setLoading(false);
        return;
      }

      // Validate fromDate <= toDate
      if (fromDate > toDate) {
        alert("From Date cannot be greater than To Date");
        setLoading(false);
        return;
      }

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

      console.log("API Request URL:", `${sessionData.url}/hrms/multiple_attendance_report/create?${params.toString()}`);
      console.log("Fetching attendance data for:", fromDate, "to", toDate);

      const res = await fetch(
        `${sessionData.url}/hrms/multiple_attendance_report/create?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Full API Response:", data);

      // 🔹 DEBUG: Check what data we're getting
      if (!data) {
        console.error("No data received from API");
        setTableData([]);
        return;
      }

      console.log("Users data:", data.users);
      console.log("AllData:", data.allData);
      console.log("Holiday data:", data.holidayData);

      const formatted: AttendanceRow[] = [];

      // If no users data, return empty array
      if (!data.users || !Array.isArray(data.users) || data.users.length === 0) {
        console.log("No users data found in API response");
        setTableData([]);
        return;
      }

      // Generate date range for the selected period
      const generateDateRange = (start: string, end: string): string[] => {
        const dates: string[] = [];
        const current = new Date(start);
        const last = new Date(end);

        while (current <= last) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
        return dates;
      };

      const dateRange = generateDateRange(fromDate, toDate);
      console.log("Date range to process:", dateRange);

      // Process each user and each date in the range
      data.users.forEach((user: any) => {
        dateRange.forEach((date) => {
          let status: AttendanceRow["status"] = "Absent";
          let inTime = "-";
          let outTime = "-";

          // 🔹 1. First check if it's a holiday
          if (data.holidayData && Array.isArray(data.holidayData) && data.holidayData.includes(date)) {
            status = "Holiday";
          }
          // 🔹 2. Check if it's weekend from user's weekly off
          else if (user) {
            const day = new Date(date).getDay();
            const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const dayKey = dayMap[day];

            // Check if user has weekly off for this day
            if (user[dayKey] === 0 || user[dayKey] === "0") {
              status = "Weekend";
            }
            // 🔹 3. Check attendance data
            else if (data.allData && data.allData[date] && data.allData[date][user.id]) {
              const dayData = data.allData[date][user.id];
              console.log(`Attendance data for ${user.name} on ${date}:`, dayData);

              // inTime = dayData.att_punch_in || "-";
              // outTime = dayData.att_punch_out || "-";
              inTime = dayData.att_punch_in === null ? "-" : dayData.att_punch_in;
              outTime = dayData.att_punch_out === null ? "-" : dayData.att_punch_out;

              // Determine status based on attendance data
              if (!inTime || inTime === "-" || !outTime || outTime === "-") {
                status = "Absent";
              } else if (inTime === outTime) {
                status = "SameInOut";
              } else {
                // Compare with expected in/out times
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
            // 🔹 4. If no attendance data and not weekend/holiday, it's Absent
            else {
              status = "Absent";
            }
          }

          // Create the attendance record
          formatted.push({
            id: Math.random(),
            date: date,
            empNo: user.employee_no || user.emp_no || "-",
            department: user.depName || user.department || "-",
            name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",
            inTime,
            outTime,
            duration: getDuration(inTime, outTime),
            selfie: user.image
              ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${user.image}`
              : "-",
            status,
          });
        });
      });

      console.log("Final formatted data count:", formatted.length);
      console.log("Sample formatted data:", formatted.slice(0, 3));

      if (formatted.length === 0) {
        console.warn("No attendance records were generated. Check API response structure.");
      }

      setTableData(formatted);

    } catch (err) {
      console.error("Error fetching attendance:", err);
      alert(`Error fetching attendance data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle column filtering
  const handleColumnFilter = (columnName: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value.toLowerCase()
    }));
  };

  // 🔹 Filter data based on column filters and global search
  const filteredItems = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];

    return tableData.filter(item => {
      // Global search
      if (filterText) {
        const searchText = filterText.toLowerCase();
        const searchableFields = [
          item.date,
          item.empNo,
          item.department,
          item.name,
          item.inTime,
          item.outTime,
          item.duration,
          item.status
        ];

        if (!searchableFields.some(field =>
          field && field.toString().toLowerCase().includes(searchText)
        )) {
          return false;
        }
      }

      // Column-specific filters
      return Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true;

        const columnValue = String(item[column as keyof AttendanceRow] || "").toLowerCase();
        return columnValue.includes(filterValue);
      });
    });
  }, [tableData, filterText, columnFilters]);

  // 🔹 Custom styles for DataTable
  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
    },
    cells: { style: { fontSize: "13px", textAlign: "left" } },
    table: {
      style: { border: "1px solid #ddd", borderRadius: "20px", overflow: "hidden" },
    },
  };

  // 🔹 Get status color for the circle
  const getStatusColor = (status: AttendanceRow["status"]) => {
    switch (status) {
      case "Absent":
        return "bg-red-500";
      case "Latecomer":
        return "bg-orange-500";
      case "HalfDay":
        return "bg-yellow-300";
      case "Weekend":
        return "bg-green-300";
      case "Holiday":
        return "bg-green-500";
      case "SameInOut":
        return "bg-pink-300";
      case "Present":
        return "bg-white border border-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  // 🔹 DataTable columns configuration
  const columns: TableColumn<AttendanceRow>[] = [
    {
      name: (
        <div>
          <div>Sr No.</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("id", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      cell: (row: AttendanceRow, index?: number) => (index !== undefined ? index + 1 : 0),
      sortable: true,
      width: "80px"
    },
    {
      name: (
        <div>
          <div>Date</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("date", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.date,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Emp No</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("empNo", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.empNo,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("department", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.department,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Employee Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("name", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.name,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>In Time</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("inTime", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.inTime,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Out Time</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("outTime", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.outTime,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Duration</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("duration", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.duration,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Status</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("status", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: AttendanceRow) => row.status,
      sortable: true,
      cell: (row: AttendanceRow) => (
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor(row.status)}`} />
          <span>{row.status}</span>
        </div>
      ),
    }
  ];

  const legendItems = [
    { label: "Absent", color: "bg-red-500" },
    { label: "Latecomer", color: "bg-orange-500" },
    { label: "HalfDay", color: "bg-yellow-300" },
    { label: "Weekend", color: "bg-green-300" },
    { label: "Holiday", color: "bg-green-500" },
    { label: "Punch-in and Punch-out same", color: "bg-pink-300" },
    { label: "Present", color: "bg-white border border-gray-300" },
  ];

  // 🔹 Get today's date for setting max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Report</h1>
        </div>
      </div>


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

        <div className="mb-28">
          <label className="block text-sm font-medium text-gray-700">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            max={today} // Allow current date but not future dates
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block px-4 py-3 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="mb-28">
          <label className="block text-sm font-medium text-gray-700">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            max={today} // Allow current date but not future dates
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div
          onClick={handleSearch}
          className="flex items-center mb-28 justify-center space-x-2 px-4 py-3 text-sm font-medium  rounded-lg cursor-pointer mb-28 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
        >
          <Search className="w-4 h-4 text-black" />
          <span className="text-black">Search</span>
        </div>
      </div>

      {/* Debug Info
      {tableData.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing {tableData.length} records from {fromDate} to {toDate}
          </p>
        </div>
      )} */}

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

      {/* DataTable */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      ) : tableData.length > 0 ? (
        <div>
          <DataTable
            columns={columns}
            data={filteredItems}
            customStyles={customStyles}
            pagination
            highlightOnHover
            responsive
            noDataComponent={<div className="p-4 text-center">No data available</div>}
            persistTableHead
          />
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No attendance records found. Please select dates and click Search.</p>
        </div>
      )}
    </div>
  );
}