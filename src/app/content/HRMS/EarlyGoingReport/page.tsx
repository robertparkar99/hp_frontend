"use client";

import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import DatePicker from "react-datepicker";
import { Search } from "lucide-react";
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
  id: number;
  name: string;
  department: string;
  outTime: string;
  expectedOutTime: string;
};

export default function Home() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [data, setData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Reset employees when departments change
  useEffect(() => {
    setSelectedEmployees([]);
  }, [selectedDepartments]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const formattedDate = date
        ? date.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // Build department query string
      const deptParams = selectedDepartments
        .map((deptId, i) => `department_id[${i}]=${deptId}`)
        .join("&");

      // Build employee query string (optional if API supports)
      const empParams = selectedEmployees
        .map((emp, i) => `user_id[${i}]=${emp.id}`)
        .join("&");

      const url = `https://hp.triz.co.in/show-early-going-hrms-attendance-report?type=API&sub_institute_id=1&token=1311|nXR4PqkYoK9lBQ6KweI7i8n5uSHnui2l7hsw5EjV13f37e8c&date=${formattedDate}${
        deptParams ? "&" + deptParams : ""
      }${empParams ? "&" + empParams : ""}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json?.hrmsList && Array.isArray(json.hrmsList)) {
        const mapped: AttendanceRow[] = json.hrmsList.map(
          (item: any, index: number) => {
            const fullName = `${item.first_name ?? ""} ${
              item.middle_name ?? ""
            } ${item.last_name ?? ""}`.trim();

            // Department from departments map
            const departmentName =
              json?.departments?.[item.department_id] ?? "Unknown";

            // Punch out time
            const outTime = item.punchout_time
              ? item.punchout_time.split(" ")[1]?.slice(0, 5)
              : "-";

            // Expected out time (based on weekday)
            const dayOfWeek = new Date(item.day).toLocaleString("en-US", {
              weekday: "long",
            });
            const expectedOutTime =
              item[`${dayOfWeek.toLowerCase()}_out_date`] ?? "-";

            return {
              srNo: index + 1,
              id: item.user_id,
              name: fullName,
              department: departmentName,
              outTime,
              expectedOutTime,
            };
          }
        );

        setData(mapped);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const columns: TableColumn<AttendanceRow>[] = [
    { name: "Sr No.", selector: (row) => row.srNo, sortable: true },
    { name: "Emp ID", selector: (row) => row.id, sortable: true },
    { name: "Employee Name", selector: (row) => row.name, sortable: true },
    { name: "Department Name", selector: (row) => row.department, sortable: true },
    { name: "Out Time", selector: (row) => row.outTime, sortable: true },
    {
      name: "Expected Out Time",
      selector: (row) => row.expectedOutTime,
      sortable: true,
    },
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
      head: [
        [
          "Sr No.",
          "Emp ID",
          "Employee Name",
          "Department",
          "Out Time",
          "Expected Out Time",
        ],
      ],
      body: data.map((row) => [
        row.srNo,
        row.id,
        row.name,
        row.department,
        row.outTime,
        row.expectedOutTime,
      ]),
    });
    doc.save("report.pdf");
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
        {/* Department + Employee Selector */}
        <div className="col-span-2 flex flex-col gap-4">
          <EmployeeSelector
            multiSelect
            empMultiSelect
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

        <Button
          onClick={fetchData}
          className="text-lg mt-7 rounded-lg font-bold h-10 flex items-center"
        >
          <Search className="w-6 h-6 mr-3" />
          Search
        </Button>
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
          noDataComponent={loading ? "Loading..." : "No data available in table"}
          customStyles={customStyles}
        />
      </div>
    </div>
  );
}
