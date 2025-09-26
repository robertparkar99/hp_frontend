"use client";

import { useState } from "react";
import { Search, FileSpreadsheet, Table, Printer } from "lucide-react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Employee = {
  id: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  deductionAmount: string;
};

type EmployeeTableData = Employee & {
  srNo: number;
};

export default function PayrollDeductionsPage() {
  const [deductionType, setDeductionType] = useState("Allowance");
  const [payrollName, setPayrollName] = useState("GRADE PAY");
  const [month, setMonth] = useState("Aug");
  const [year, setYear] = useState("2025");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Search (dummy for now)
  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const data: Employee[] = [
        {
          id: 1,
          employeeCode: "433",
          employeeName: "Admin MM User",
          department: "Accounts Department",
          deductionAmount: "",
        },
        {
          id: 2,
          employeeCode: "419",
          employeeName: "admin admin admin",
          department: "-",
          deductionAmount: "",
        },
      ];
      setEmployees(data);
      setSearched(true);
      setLoading(false);
    }, 500);
  };

  // Update Deduction Amount
  const handleChange = (id: number, value: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, deductionAmount: value } : emp
      )
    );
  };

  // Column Filter
  const handleColumnFilter = (columnName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnName]: value.toLowerCase() }));
  };

  // Add Sr No.
  const tableData: EmployeeTableData[] = employees.map((emp, index) => ({
    ...emp,
    srNo: index + 1,
  }));

  // Apply Filters
  const filteredData = tableData.filter((row) =>
    Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      const rowValue = String(
        row[key as keyof EmployeeTableData] || ""
      ).toLowerCase();
      return rowValue.includes(filterValue);
    })
  );

  // Table Columns
  const columns: TableColumn<EmployeeTableData>[] = [
    {
      name: (
        <div>
          <div>Sr No.</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("srNo", e.target.value)}
            className="w-full text-xs p-1 mt-1"
          />
        </div>
      ),
      selector: (row) => row.srNo,
      sortable: true,
      width: "140px",
    },
    {
      name: (
        <div>
          <div>Employee Code</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("employeeCode", e.target.value)}
            className="w-full text-xs p-1 mt-1"
          />
        </div>
      ),
      selector: (row) => row.employeeCode,
      sortable: true,
      width: "216px",
    },
    {
      name: (
        <div>
          <div>Employee Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("employeeName", e.target.value)}
            className="w-full text-xs p-1 mt-1"
          />
        </div>
      ),
      selector: (row) => row.employeeName,
      sortable: true,
      width: "240px",
    },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("department", e.target.value)}
            className="w-full  text-xs  p-1 mt-1"
          />
        </div>
      ),
      selector: (row) => row.department,
      sortable: true,
      width: "240px",
    },
    {
      name: (
        <div>
          <div>Deduction Amount</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) =>
              handleColumnFilter("deductionAmount", e.target.value)
            }
            className="w-full text-xs p-1 mt-1"
          />
        </div>
      ),
      cell: (row) => (
        <input
          type="number"
          value={row.deductionAmount}
          onChange={(e) => handleChange(row.id, e.target.value)}
          className=" p-1 w-full text-center"
        />
      ),
      selector: (row) => row.deductionAmount,
      sortable: true,
      width: "200px",
    },
  ];

  // DataTable Styles
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
    cells: {
      style: {
        fontSize: "13px",
        textAlign: "left",
        padding: "8px",
      },
    },
    table: {
      style: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
      },
    },
  };

  // Export: Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Deductions");
    XLSX.writeFile(wb, "payroll-deductions.xlsx");
  };

  // Export: CSV
  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "payroll-deductions.csv");
  };

  // Export: PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Payroll Deduction Report", 14, 15);
    (doc as any).autoTable({
      startY: 25,
      head: [["Sr No", "Employee Code", "Employee Name", "Department", "Deduction Amount"]],
      body: filteredData.map((row) => [
        row.srNo,
        row.employeeCode,
        row.employeeName,
        row.department,
        row.deductionAmount,
      ]),
    });
    doc.save("payroll-deductions.pdf");
  };

  // Years dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2000 + 11 }, (_, i) => 2000 + i);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground"> Payroll Deduction Management</h1>
          {/* <p className="text-sm text-muted-foreground mt-1">
                Manage your organization's information, Department structure.
              </p> */}
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-5 gap-4 items-end mb-6">
        {/* Deduction Type */}
        <div>
          <Label>Deduction Type</Label>
          <Select value={deductionType} onValueChange={setDeductionType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Deduction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Allowance">Allowance</SelectItem>
              <SelectItem value="Deduction">Deduction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payroll Name */}
        <div>
          <Label>Payroll Name</Label>
          <Select value={payrollName} onValueChange={setPayrollName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Payroll Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GRADE PAY">GRADE PAY</SelectItem>
              <SelectItem value="BASIC PAY">BASIC PAY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Month */}
        <div>
          <Label>Select Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent className="max-h-40 overflow-y-auto">
              {[
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
              ].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div>
          <Label>Select Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="max-h-40 overflow-y-auto">
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div>
          {/* <button
            onClick={handleSearch}
            className="px-6 py-2 rounded-lg flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-8"
          >
            <Search className="w-5 h-5 mr-2" /> Search
          </button> */}
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 rounded-lg flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-14"
          >
            <Search className="w-5 h-5 mr-2 text-black" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      {searched && (
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

      {/* DataTable */}
      {searched && (
        <div className="mt-6">
          <h1 className="text-xl font-bold mb-4">Payroll Deduction</h1>
          <DataTable
            columns={columns}
            data={filteredData}
            customStyles={customStyles}
            pagination
            highlightOnHover
            responsive
            progressPending={loading}
            noDataComponent={
              <div className="p-4 text-center">
                {employees.length === 0
                  ? "No records found"
                  : "No data matches your filters"}
              </div>
            }
            persistTableHead
          />
        </div>
      )}
    </div>
  );
}