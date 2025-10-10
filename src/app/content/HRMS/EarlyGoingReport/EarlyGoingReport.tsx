"use client";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import DatePicker from "react-datepicker";
import { Search, FileSpreadsheet,Table,Printer } from "lucide-react";
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
  const [userHasSearched, setUserHasSearched] = useState(false);
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
      const { APP_URL, token, sub_institute_id, org_type, user_id } =
        JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // ✅ Reset employees when departments change
  useEffect(() => {
    setSelectedEmployees([]);
  }, [selectedDepartments]);

  const fetchData = async () => {
    setUserHasSearched(true);
    if (!sessionData.url || !sessionData.token || !sessionData.subInstituteId) {
      console.error("❌ Missing session data", sessionData);
      return;
    }

    try {
      setLoading(true);

      const formattedDate = date
        ? date.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // Build department query string
      const deptParams = selectedDepartments
        .map((deptId, i) => `department_id[${i}]=${deptId}`)
        .join("&");

      // Build employee query string
      const empParams = selectedEmployees
        .map((emp, i) => `user_id[${i}]=${emp.id}`)
        .join("&");

      const url = `${sessionData.url}/show-early-going-hrms-attendance-report?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&date=${formattedDate}${deptParams ? "&" + deptParams : ""
        }${empParams ? "&" + empParams : ""}`;

      console.log("📡 Fetching:", url);

      const res = await fetch(url);
      const json = await res.json();

      if (json?.hrmsList && Array.isArray(json.hrmsList)) {
        const mapped: AttendanceRow[] = json.hrmsList.map(
          (item: any, index: number) => {
            const fullName = `${item.first_name ?? ""} ${item.middle_name ?? ""
              } ${item.last_name ?? ""}`.trim();

            const departmentName =
              json?.departments?.[item.department_id] ?? "Unknown";

            const outTime = item.punchout_time
              ? item.punchout_time.split(" ")[1]?.slice(0, 5)
              : "-";

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
      console.error("❌ Error fetching API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const columns: TableColumn<AttendanceRow>[] = [
    { name: "Sr No.", selector: (row) => row.srNo, sortable: true, width: "80px" },
    { name: "Emp ID", selector: (row) => row.id, sortable: true, width: "100px" },
    { name: "Employee Name", selector: (row) => row.name, sortable: true, width: "200px" },
    { name: "Department Name", selector: (row) => row.department, sortable: true, width: "150px" },
    { name: "Out Time", selector: (row) => row.outTime, sortable: true, width: "120px" },
    {
      name: "Expected Out Time",
      selector: (row) => row.expectedOutTime,
      sortable: true,
      width: "150px"
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
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "report.csv");
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
    cells: {
      style: {
        fontSize: "13px",
      },
    },
  };

  return (
    <div className="p-6 min-h-screen bg-background rounded-xl space-y-6">
      <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Earlygoing Report</h1>
              {/* <p className="text-sm text-muted-foreground mt-1">
                Manage your organization's information, Department structure.
              </p> */}
            </div>
          </div>
      {/* Filters */}

      <div className="flex flex-col md:flex-row gap-6 ">
        {/* Department Selector */}
        <div className="flex flex-col flex-1">
          {/* <label className="block font-semibold mb-2">Department & Employee</label> */}
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

        {/* Date */}
        <div className="flex flex-col ">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            className="border p-2 rounded w-full"
            dateFormat="dd-MM-yyyy"
          />
        </div>

        {/* Search Button */}
        <div className="flex flex-col mt-7">
          <Button
            onClick={fetchData}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-bold flex items-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
          >
            {/* <Search className="w-5 h-5 mr-2 text-black" /> */}
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>


      {/* Export Buttons */}

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
      {/* Data Table */}
      <div className="rounded-2xl overflow-hidden shadow">
        <DataTable
          columns={columns}
          data={data}
          pagination
          progressPending={loading}
          highlightOnHover
          noDataComponent={
            loading ? (
              "Loading..."
            ) : userHasSearched && data.length === 0 ? (
              "No data available in table"
            ) : (
              <div className="p-4 text-center text-gray-500">
                Please click Search to load data
              </div>
            )
          }
          customStyles={customStyles}
        />
      </div>
    </div>
  );
}