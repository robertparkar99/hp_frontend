"use client";

import { useState, useEffect } from "react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import { Search, Printer } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EmployeeSelector from "../../User-Attendance/components/EmployeeSelector";
import { Employee } from "../../User-Attendance/types/attendance";
import { Button } from "@/components/ui/button";

// Extend Employee with attendance row fields
type AttendanceRow = {
  srNo: number;
  department: string;
  name: string;
  date?: string; // ✅ new Date field
  totalDays: number;
  weekOff: number;
  holiday: number;
  totalWorking: number;
  totalPresent: number;
  absentDays: number;
  halfDays: number;
  lateComes: number;
  avatar?: string;
};

export default function Home() {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [data, setData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setSessionData({
        url: parsedData.APP_URL || "",
        token: parsedData.token || "",
        subInstituteId: parsedData.sub_institute_id || "",
        orgType: parsedData.org_type || "",
        userId: parsedData.user_id || "",
      });
    }
  }, []);

  // ✅ Department selection handler
  const handleDepartmentSelect = (val: string | string[] | null) => {
    if (!val) {
      setSelectedDepartments([]);
    } else if (Array.isArray(val)) {
      setSelectedDepartments(val);
    } else {
      setSelectedDepartments([val]);
    }
  };

  // ✅ Employee selection handler (single select enforced)
  const handleEmployeeSelect = (val: Employee | Employee[] | null) => {
    if (!val) {
      setSelectedEmployees([]);
    } else if (Array.isArray(val)) {
      setSelectedEmployees(val.slice(0, 1)); // only first employee
    } else {
      setSelectedEmployees([val]);
    }
  };

  // Columns
  const columns: TableColumn<AttendanceRow>[] = [
    { name: "Sr No.", selector: (row) => row.srNo, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Employee Name", selector: (row) => row.name, sortable: true },
    { name: "Total Days", selector: (row) => row.totalDays, sortable: true },
    { name: "Week off", selector: (row) => row.weekOff, sortable: true },
    { name: "Holiday", selector: (row) => row.holiday, sortable: true },
    { name: "Total Working", selector: (row) => row.totalWorking, sortable: true },
    { name: "Total Present", selector: (row) => row.totalPresent, sortable: true },
    { name: "Absent Days", selector: (row) => row.absentDays, sortable: true },
    { name: "Half Days", selector: (row) => row.halfDays, sortable: true },
    { name: "Late Comes", selector: (row) => row.lateComes, sortable: true },
  ];

  // API Fetch
  const handleSearch = async () => {
    if (!fromDate || !toDate || !sessionData.token || !sessionData.subInstituteId) {
      console.error("Missing required data:", {
        fromDate,
        toDate,
        token: sessionData.token,
        subInstituteId: sessionData.subInstituteId,
      });
      return;
    }

    setLoading(true);

    const query = new URLSearchParams();
    query.append("type", "API");
    query.append("sub_institute_id", sessionData.subInstituteId);
    query.append("token", sessionData.token);

    // Department filters
    selectedDepartments.forEach((d, i) =>
      query.append(`department_id[${i}]`, d)
    );

    // Employee filter (single select only)
    if (selectedEmployees.length > 0) {
      query.append("employee_id[0]", String(selectedEmployees[0].id));
    }

    query.append("from_date", fromDate.toISOString().split("T")[0]);
    query.append("to_date", toDate.toISOString().split("T")[0]);

    try {
      const apiUrl = sessionData.url
        ? `${sessionData.url}/departmentwise-attendance-report/create`
        : `https://hp.triz.co.in/departmentwise-attendance-report/create`;

      const res = await fetch(`${apiUrl}?${query.toString()}`);
      const json = await res.json();

      console.log("API Response:", json);

      if (json?.status === "1" && Array.isArray(json.empData)) {
        const mapped: AttendanceRow[] = json.empData.map(
          (emp: any, idx: number) => ({
            srNo: idx + 1,
            name: emp.full_name,
            department: emp.department,
            totalDays: emp.totalDays ?? 0,
            weekOff: emp.weekday_off ?? 0,
            holiday: emp.total_holidays ?? 0,
            totalWorking: emp.workingDays ?? 0,
            totalPresent: emp.total_att_day ?? 0,
            absentDays: emp.total_ab_day ?? 0,
            halfDays: emp.half_day ?? 0,
            lateComes: emp.late ?? 0,
            avatar: "https://via.placeholder.com/40",
          })
        );
        setData(mapped);
      } else {
        console.error("API returned error or no data:", json);
        setData([]);
      }
    } catch (err) {
      console.error("API error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  };


  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Employee Attendance Report", 14, 16);
    autoTable(doc, {
      head: [
        [
          "Sr No.",
          "Emp Code",
          "Department",
          "Employee Name",
          "Total Days",
          "Week Off",
          "Holiday",
          "Total Working",
          "Total Present",
          "Absent Days",
          "Half Days",
          "Late Comes",
        ],
      ],
      body: data.map((row) => [
        row.srNo,
        row.department,
        row.name,
        row.totalDays,
        row.weekOff,
        row.holiday,
        row.totalWorking,
        row.totalPresent,
        row.absentDays,
        row.halfDays,
        row.lateComes,
      ]),
    });
    doc.save("attendance_report.pdf");
  };

  const customStyles: TableStyles = {
    headCells: {
      style: {
        backgroundColor: "#e3f1ff",
        color: "#374151",
        fontWeight: "600",
        fontSize: "14px",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#e3f1ff",
      },
    },
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Wise Report</h1>
          {/* <p className="text-sm text-muted-foreground mt-1">
                Manage your organization's information, Department structure.
              </p> */}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        <div className="flex flex-col w-full">
          <label className="block mb-1 font-semibold">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={(d) => setFromDate(d)}
            className="border p-2 rounded w-full"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="block mb-1 font-semibold">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={(d) => setToDate(d)}
            className="border p-2 rounded w-full"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <EmployeeSelector
            multiSelect
            empMultiSelect={true}
            selectedDepartment={selectedDepartments}
            onSelectDepartment={handleDepartmentSelect}
            selectedEmployee={selectedEmployees}
            onSelectEmployee={handleEmployeeSelect}
            className="w-full"
          />
        </div>
        <div className="flex justify-center w-full col-span-4">
          <Button
            onClick={handleSearch}
            disabled={loading || !sessionData.token}
            className="px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 h-9 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
          >
            {/* <Search className="w-4 h-4 text-black" /> */}
            {loading ? "Loading..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      {data.length > 0 && (
        <div className="flex gap-3 flex-wrap justify-end">

          <Button
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <Printer className="w-5 h-5" />
          </Button>
          <Button
            onClick={exportToPDF}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
          >
            <span className="mdi mdi-file-pdf-box text-xl"></span>
          </Button>

          <Button
            onClick={exportToExcel}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
          >
            <span className="mdi mdi-file-excel-outline text-xl"></span>
          </Button>

        </div>
      )}

      {/* Data Table */}
      <div className="rounded-2xl overflow-hidden shadow">
        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          noDataComponent={loading ? "Loading..." : "No data available"}
          customStyles={customStyles}
        />
      </div>
    </div >
  );
}
