"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search } from "lucide-react";
import EmployeeSelector from "./components/EmployeeSelector";
import AttendanceList from "./components/AttendanceList";
import AttendanceForm from "./components/AttendanceForm";
import StatsCards from "./components/StatsCards";
import {
  Employee,
  AttendanceRecord,
  AttendanceFormData,
} from "./types/attendance";
import { parse, format } from "date-fns";

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Multi-select states
  const [multiEmployees, setMultiEmployees] = useState<Employee[]>([]);
  const [multiDepartments, setMultiDepartments] = useState<string[]>([]);

  // Date filters
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Session Data from localStorage
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // ✅ Fetch Employees from API
  useEffect(() => {
    if (!sessionData.url || !sessionData.subInstituteId) return;

    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[status]=1`
        );
        const json = await res.json();
        console.log("Employees API raw response:", json);

        let arr = [];
        if (Array.isArray(json)) arr = json;
        else if (json?.data && Array.isArray(json.data)) arr = json.data;
        else if (json?.records && Array.isArray(json.records)) arr = json.records;

        const formatted = arr.map((emp: any) => ({
          id: emp.id?.toString() || emp.user_id?.toString() || "",
          name: `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`.trim(),
          avatar: emp.image
            ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
                emp.image
              )}`
            : "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39",
          department: emp.department_id?.toString() || emp.department?.toString() || "",
        }));

        setEmployees(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch employees", err);
      }
    };

    fetchEmployees();
  }, [sessionData]);

  // ✅ Fetch Attendance Records
  useEffect(() => {
    if (!sessionData.url || !sessionData.token) return;

    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("type", "API");
        params.append("token", sessionData.token);
        params.append("sub_institute_id", sessionData.subInstituteId);
        params.append("user_id", sessionData.userId);
        params.append("formType", "UserAttendance");

        const url = `${sessionData.url}/hrms-attendance?${params.toString()}`;
        console.log("📡 Fetching initial attendance:", url);

        const res = await fetch(url);
        const json = await res.json();
        console.log("✅ Initial Attendance API response:", json);

        if (json.attendanceData && Array.isArray(json.attendanceData)) {
          const formatted = json.attendanceData.map((rec: any) => ({
            id: rec.id?.toString() || "",
            employeeId: rec.user_id?.toString() || "",
            date: rec.day || "",
            punchIn: rec.punchin_time
              ? format(parse(rec.punchin_time.split(" ")[1], "HH:mm:ss", new Date()), "hh:mm a")
              : null,
            punchOut: rec.punchout_time
              ? format(parse(rec.punchout_time.split(" ")[1], "HH:mm:ss", new Date()), "hh:mm a")
              : null,
            totalHours: rec.timestamp_diff
              ? (() => {
                  const [h, m, s] = rec.timestamp_diff.split(":").map(Number);
                  return parseFloat((h + m / 60 + s / 3600).toFixed(2));
                })()
              : undefined,
            status: rec.status === 1 ? "present" : rec.status === 0 ? "absent" : "other",
            notes: `${rec.in_note || ""} ${rec.out_note || ""}`.trim(),
          }));

          setAttendanceRecords(formatted);
        } else {
          setAttendanceRecords([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch attendance", err);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [sessionData]);

  // ✅ Handle Search
  const handleSearch = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("type", "API");
      params.append("token", sessionData.token);
      params.append("sub_institute_id", sessionData.subInstituteId);
      params.append("user_id", sessionData.userId);
      params.append("formType", "UserAttendance");

      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      multiDepartments.forEach((deptId, idx) =>
        params.append(`department_id[${idx}]`, deptId)
      );
      multiEmployees.forEach((emp, idx) =>
        params.append(`employee_id[${idx}]`, emp.id)
      );

      const url = `${sessionData.url}/hrms-attendance?${params.toString()}`;
      console.log("📡 Fetching filtered attendance:", url);

      const res = await fetch(url);
      const json = await res.json();
      console.log("✅ Attendance API response:", json);

      if (json.attendanceData && Array.isArray(json.attendanceData)) {
        const formatted = json.attendanceData.map((rec: any) => ({
          id: rec.id?.toString() || "",
          employeeId: rec.user_id?.toString() || "",
          date: rec.day || "",
          punchIn: rec.punchin_time
            ? format(parse(rec.punchin_time.split(" ")[1], "HH:mm:ss", new Date()), "hh:mm a")
            : null,
          punchOut: rec.punchout_time
            ? format(parse(rec.punchout_time.split(" ")[1], "HH:mm:ss", new Date()), "hh:mm a")
            : null,
          totalHours: rec.timestamp_diff
            ? (() => {
                const [h, m, s] = rec.timestamp_diff.split(":").map(Number);
                return parseFloat((h + m / 60 + s / 3600).toFixed(2));
              })()
            : undefined,
          status: rec.status === 1 ? "present" : rec.status === 0 ? "absent" : "other",
          notes: `${rec.in_note || ""} ${rec.out_note || ""}`.trim(),
        }));

        setAttendanceRecords(formatted);
        setSelectedEmployee(multiEmployees.length === 1 ? multiEmployees[0] : null);
      } else {
        setAttendanceRecords([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch HRMS attendance", err);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get Public IP
  const getPublicIp = async (): Promise<string> => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip || "0.0.0.0";
    } catch {
      return "0.0.0.0";
    }
  };

  // ✅ Submit Attendance (Add New)
  const handleSubmitAttendance = async (data: AttendanceFormData) => {
    try {
      const employee = employees.find((emp) => emp.id === data.employeeId);
      if (!employee) return;

      const ip = await getPublicIp();

      const formData = new FormData();
      formData.append("type", "API");
      formData.append("token", sessionData.token);
      formData.append("sub_institute_id", sessionData.subInstituteId);
      formData.append("user_id", sessionData.userId);
      formData.append("department_id", employee.department || "");
      formData.append("employee_id", employee.id);
      formData.append("day", data.date);
      formData.append("punch_in", data.time || "");
      formData.append("address", ip);
      formData.append("formType", "add");

      const res = await fetch(`${sessionData.url}/hrms/update_user_att`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json?.status === "1") {
        alert("✅ Attendance saved successfully!");
        setShowForm(false);
        setEditingRecord(null);
        handleSearch();
      } else {
        alert(json.message || "❌ Failed to save attendance");
      }
    } catch (err) {
      console.error("❌ Error saving attendance", err);
    }
  };

  // ✅ Update Attendance (Edit)
  const handleUpdateRecords = async (updated: AttendanceRecord[]) => {
    try {
      const formData = new FormData();
      formData.append("formType", "update");
      formData.append("type", "API");
      formData.append("token", sessionData.token);
      formData.append("sub_institute_id", sessionData.subInstituteId);
      formData.append("user_id", sessionData.userId);

      updated.forEach((rec) => {
        if (rec.punchIn) {
          const inTime = rec.punchIn.length === 5 ? rec.punchIn + ":00" : rec.punchIn;
          formData.append(`in_time[${rec.date}][${rec.employeeId}]`, inTime);
        }
        if (rec.punchOut) {
          const outTime = rec.punchOut.length === 5 ? rec.punchOut + ":00" : rec.punchOut;
          formData.append(`out_time[${rec.date}][${rec.employeeId}]`, outTime);
        }
      });

      const res = await fetch(`${sessionData.url}/hrms/update_user_att`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json?.status === "1") {
        alert("✅ Attendance updated successfully!");
        handleSearch();
      } else {
        alert(json.message || "❌ Failed to update attendance");
      }
    } catch (err) {
      console.error("❌ Error updating attendance", err);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-background rounded-xl ">
      <div className="flex items-center  justify-between mb-6">
            <div >
              <h1 className="text-2xl font-bold text-foreground">User Attendance</h1>
            </div>
          </div>


      {/* <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
        <div className="flex flex-col gap-8">
          {/* Controls Row */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <EmployeeSelector
                multiSelect
                empMultiSelect={true}
                selectedEmployee={multiEmployees}
                selectedDepartment={multiDepartments}
                onSelectEmployee={setMultiEmployees}
                onSelectDepartment={setMultiDepartments}
              />
            </div>

            {/* From Date */}
            <div className="mb-28">
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 block px-4 py-3 w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* To Date */}
            <div className="mb-28">
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white rounded-lg  mb-28 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4 text-black" />
              <span className="text-black">Search</span>
            </motion.button>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border border-transparent rounded-lg  mb-28 rounded-lg bg-gray-100 "
            >
              <Plus className="w-4 h-4 " />
              <span>Add</span>
            </motion.button>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            <StatsCards
              employees={employees}
              records={attendanceRecords}
              selectedEmployee={selectedEmployee}
            />

            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <p className="mt-4 text-gray-500">Loading attendance records...</p>
              </div>
            ) : (
              <AttendanceList
                records={attendanceRecords}
                employees={employees}
                selectedEmployee={selectedEmployee}
                onUpdateRecords={handleUpdateRecords}
              />
            )}
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingRecord ? "Edit Attendance" : "Add Attendance Record"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingRecord(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6">
                  <AttendanceForm
                    employees={employees}
                    selectedEmployee={selectedEmployee}
                    onSubmit={handleSubmitAttendance}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingRecord(null);
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      {/* </main> */}
    </div>
  );
}

export default App;
