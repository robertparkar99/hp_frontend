"use client";

import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Clock, Search } from "lucide-react";
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
type AttendanceRow = Employee & {
  srNo: number;
  empCode: string | number;
  department: string;
  totalDays: number;
  weekOff: number;
  holiday: number;
  totalWorking: number;
  totalPresent: number;
  absentDays: number;
  halfDays: number;
  lateComes: number;
  avatar: string;
};

export default function Home() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  // Mock Data (replace with API call)
  const [data] = useState<AttendanceRow[]>([
  {
    id: 1,
    srNo: 1,
    empCode: "353",
    name: "Abhi d. Raval",
    avatar: "https://via.placeholder.com/40", // 👈 added
    department: "Primary Teacher Other",
    totalDays: 16,
    weekOff: 2,
    holiday: 0,
    totalWorking: 14,
    totalPresent: 0,
    absentDays: 14,
    halfDays: 0,
    lateComes: 0,
  },
  {
    id: 2,
    srNo: 2,
    empCode: "354",
    name: "AKSHAT - SAH",
    avatar: "https://via.placeholder.com/40", // 👈 added
    department: "Clerk Team",
    totalDays: 16,
    weekOff: 2,
    holiday: 0,
    totalWorking: 14,
    totalPresent: 0,
    absentDays: 14,
    halfDays: 0,
    lateComes: 0,
  },
]);

  // Columns
  const columns: TableColumn<AttendanceRow>[] = [
    { name: "Sr No.", selector: (row) => row.srNo, sortable: true },
    { name: "Emp Code", selector: (row) => row.empCode, sortable: true },
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

  // Export Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  };

  // Export CSV
  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const csvData = XLSX.write(wb, { bookType: "csv", type: "array" });
    saveAs(new Blob([csvData]), "report.csv");
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
        row.empCode,
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

  // Table styles
  const customStyles = {
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
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        {/* From Date */}
        <div className="flex flex-col w-full">
          <label className="block mb-1 font-semibold">From Date</label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            className="border p-2 rounded w-full"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        {/* To Date */}
        <div className="flex flex-col w-full">
          <label className="block mb-1 font-semibold">To Date</label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            className="border p-2 rounded w-full"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        {/* Department + Employee Selector */}
        <div className="col-span-2 flex flex-col gap-4">
          <EmployeeSelector
            multiSelect
            empMultiSelect={false}
            selectedDepartment={selectedDepartments}
            onSelectDepartment={setSelectedDepartments}
            selectedEmployee={selectedEmployees}
            onSelectEmployee={setSelectedEmployees}
            className="w-full"
          />
        </div>
        <div className="flex items-center pl-120 w-full">
          <Button className="text-xl px-4 py-6 rounded-xl font-bold transform transition-all duration-300 h-10">
            <Search className="w-6 h-6 mr-3" />
            Search
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={exportToPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          PDF
        </button>
        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          CSV
        </button>
        <button
          onClick={exportToExcel}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          EXCEL
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          PRINT
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Show 100 rows
        </button>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl overflow-hidden shadow">
        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          noDataComponent="No data available in table"
          customStyles={customStyles}
          fixedHeader={false}
          persistTableHead={false}
        />
      </div>
    </div>
  );
}
