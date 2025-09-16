"use client";

import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import DatePicker from "react-datepicker";
import { Clock, Search } from "lucide-react";
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
    outTime: string;
    expectedOutTime: string;
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
            name: "Ankita Sane (Admin)",
            avatar: "https://via.placeholder.com/40",
            department: "IT & Computers Department",
            outTime: "17:00",
            expectedOutTime: "18:00",
        },
        {
            id: 2,
            srNo: 2,
            name: "Basopiya Aditya (Admin)",
            avatar: "https://via.placeholder.com/40",
            department: "Information Technology",
            outTime: "16:30",
            expectedOutTime: "18:00",
        },
        {
            id: 3,
            srNo: 3,
            name: "Ankita Sane (Admin)",
            avatar: "https://via.placeholder.com/40",
            department: "IT & Computers Department",
            outTime: "17:00",
            expectedOutTime: "18:00",
        },
        {
            id: 4,
            srNo: 4,
            name: "Basopiya Aditya (Admin)",
            avatar: "https://via.placeholder.com/40",
            department: "Information Technology",
            outTime: "16:30",
            expectedOutTime: "18:00",
        },
        {
            id: 5,
            srNo: 5,
            name: "Basopiya Aditya (Admin)",
            avatar: "https://via.placeholder.com/40",
            department: "Information Technology",
            outTime: "16:30",
            expectedOutTime: "18:00",
        },
    ]);
    // Columns
    const columns: TableColumn<AttendanceRow>[] = [
        { name: "Sr No.", selector: (row) => row.srNo, sortable: true },
        { name: "Emp ID", selector: (row) => row.id, sortable: true },
        { name: "Employee Name", selector: (row) => row.name, sortable: true },
        { name: "Department Name", selector: (row) => row.department || "", sortable: true },
        { name: "Out Time", selector: (row) => row.outTime, sortable: true },
        { name: "Expected Out Time", selector: (row) => row.expectedOutTime, sortable: true },
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
        doc.text("Employee Report", 14, 16);
        autoTable(doc, {
            head: [["Sr No.", "Emp ID", "Employee Name", "Department", "Out Time", "Expected Out Time"]],
            body: data.map((row) => [
                row.srNo ?? "",
                row.id ?? "",
                row.name ?? "",
                row.department ?? "",
                row.outTime ?? "",
                row.expectedOutTime ?? "",
            ]),
        });
        doc.save("report.pdf");
    };
    // Table styles
    const customStyles = {
        headCells: {
            style: {
                backgroundColor: "#e3f1ff", // Tailwind gray-100
                color: "#374151",          // Tailwind gray-700
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6  w-full">
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
                {/* Date + Search */}
                <div className="flex flex-col w-full">
                    <label className="block mb-1 font-semibold">Date</label>
                    <DatePicker
                        selected={date}
                        onChange={(d) => setDate(d)}
                        className="border p-2 rounded w-full"
                        dateFormat="dd-MM-yyyy"
                    />
                </div>
                <Button className="text-lg  mt-7 rounded-lg font-bold transform transition-all duration-300 h-10">
            <Search className="w-6 h-6 mr-3" />
            Search
          </Button>

            </div>
            {/* Export Buttons */}
            <div className="flex gap-3 flex-wrap">
                <button onClick={exportToPDF} className="bg-blue-500 text-white px-4 py-2 rounded">
                    PDF
                </button>
                <button onClick={exportToCSV} className="bg-blue-500 text-white px-4 py-2 rounded">
                    CSV
                </button>
                <button onClick={exportToExcel} className="bg-blue-500 text-white px-4 py-2 rounded">
                    EXCEL
                </button>
                <button onClick={() => window.print()} className="bg-blue-500 text-white px-4 py-2 rounded">
                    PRINT
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded">Show 100 rows</button>
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
                    fixedHeader={false}       // disable fixed header
                    persistTableHead={false}  // don’t pin the head
                />
            </div>
        </div>
    );
}
