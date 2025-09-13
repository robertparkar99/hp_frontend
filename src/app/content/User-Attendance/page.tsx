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

  // ✅ Fetch Employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/table_data?table=tbluser&filters[sub_institute_id]=1&filters[status]=1"
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
  }, []);

  // ✅ Fetch Attendance Records on Page Load (HRMS API)
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("type", "API");
        params.append("token", "76|LnoeslSRYnAvDf7kJeg1vif0ylZZsCxNJ2SRKNwX29663c2d");
        params.append("sub_institute_id", "1");
        params.append("user_id", "1");
        params.append("formType", "UserAttendance");

        const url = `http://127.0.0.1:8000/hrms-attendance?${params.toString()}`;
        console.log("📡 Fetching initial attendance:", url);

        const res = await fetch(url);
        const json = await res.json();
        console.log("✅ Initial Attendance API response:", json);

        if (json.attendanceData && Array.isArray(json.attendanceData)) {
          const formatted = json.attendanceData.map((rec: any) => ({
            id: rec.id?.toString() || "",
            employeeId: rec.user_id?.toString() || "",
            date: rec.day || "",
            punchIn: rec.punchin_time ? rec.punchin_time.split(" ")[1] : null,
            punchOut: rec.punchout_time ? rec.punchout_time.split(" ")[1] : null,
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
        console.error("❌ Failed to fetch initial attendance", err);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // ✅ Handle Search (filtered HRMS API)
  const handleSearch = async () => {
    console.log("🔍 Search clicked", multiEmployees, multiDepartments, fromDate, toDate);

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("type", "API");
      params.append("token", "76|LnoeslSRYnAvDf7kJeg1vif0ylZZsCxNJ2SRKNwX29663c2d");
      params.append("sub_institute_id", "1");
      params.append("user_id", "1");
      params.append("formType", "UserAttendance");

      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      multiDepartments.forEach((deptId, idx) =>
        params.append(`department_id[${idx}]`, deptId)
      );
      multiEmployees.forEach((emp, idx) =>
        params.append(`employee_id[${idx}]`, emp.id)
      );

      const url = `http://127.0.0.1:8000/hrms-attendance?${params.toString()}`;
      console.log("📡 Fetching filtered attendance:", url);

      const res = await fetch(url);
      const json = await res.json();
      console.log("✅ Attendance API response:", json);

      if (json.attendanceData && Array.isArray(json.attendanceData)) {
        const formatted = json.attendanceData.map((rec: any) => ({
          id: rec.id?.toString() || "",
          employeeId: rec.user_id?.toString() || "",
          date: rec.day || "",
          punchIn: rec.punchin_time ? rec.punchin_time.split(" ")[1] : null,
          punchOut: rec.punchout_time ? rec.punchout_time.split(" ")[1] : null,
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

        if (multiEmployees.length === 1) {
          setSelectedEmployee(multiEmployees[0]);
        } else {
          setSelectedEmployee(null);
        }
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

  const handleSubmitAttendance = (data: AttendanceFormData) => {
    const employee = employees.find((emp) => emp.id === data.employeeId);
    if (!employee) return;
    // keep your punch in/out logic here...
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Controls Row */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <EmployeeSelector
                multiSelect
                selectedEmployee={multiEmployees}
                selectedDepartment={multiDepartments}
                onSelectEmployee={setMultiEmployees}
                onSelectDepartment={setMultiDepartments}
              />
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 block px-4 py-3 w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* To Date */}
            <div>
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
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </motion.button>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
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
                onEditRecord={handleEditRecord}
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
      </main>
    </div>
  );
}

export default App;
