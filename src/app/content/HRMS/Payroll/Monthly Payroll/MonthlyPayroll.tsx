"use client";

import { useState, useEffect, useMemo } from "react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import EmployeeSelector from "../../../User-Attendance/components/EmployeeSelector";
import { Employee } from "../../../User-Attendance/types/attendance";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Printer, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Employee Data Type
type EmployeeData = {
  id: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  totalDays: string;
  clencashment: number;
  basic: number;
  gradePay: number;
  da: number;
  hra: number;
  otherAllowance: number;
  extraAllowance: number;
  leaveEncash: number;
  arrear: number;
  pf: number;
  pt: number;
  totalDeduction: number;
  totalPayment: number;
  receivedBy: string;
  pdfLink: string;
};

type EmployeeTableData = EmployeeData & { srNo: number };

// Reusable style for filter inputs
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "4px",
  fontSize: "12px",
  marginTop: "5px",
  
};

// Editable Input Component
interface EditableInputProps {
  value: number;
  onChange: (value: number) => void;
  type?: string;
  disabled?: boolean;
}

const EditableInput: React.FC<EditableInputProps> = ({ value, onChange, type = "number", disabled = false }) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const numValue = parseFloat(inputValue) || 0;
    onChange(numValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <input
      type={type}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className="border rounded p-1 w-20 text-center"
    />
  );
};

export default function MonthlyPayrollPage() {
  const currentYear = new Date().getFullYear();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [month, setMonth] = useState("Aug");
  const [year, setYear] = useState(`${currentYear}-${currentYear + 1}`);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<EmployeeTableData[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Generate financial years
  const years = Array.from({ length: (currentYear + 5) - 2000 }, (_, i) => `${2000 + i}-${2001 + i}`);

  // Calculate totals based on other fields
  const calculateTotals = (employee: EmployeeData): { totalDeduction: number; totalPayment: number } => {
    const totalDeduction = employee.pf + employee.pt;
    const totalPayment = employee.basic + employee.gradePay + employee.da + employee.hra +
      employee.otherAllowance + employee.extraAllowance +
      employee.leaveEncash + employee.arrear - totalDeduction;

    return { totalDeduction, totalPayment: Math.max(0, totalPayment) };
  };

  // Filter data based on column filters
  const filteredData = useMemo(() => {
    if (!tableData.length) return [];

    return tableData.filter(row => {
      return Object.entries(columnFilters).every(([columnName, filterValue]) => {
        if (!filterValue.trim()) return true;

        const rowValue = row[columnName as keyof EmployeeTableData];

        if (rowValue === undefined || rowValue === null) return false;

        // Convert to string for case-insensitive comparison
        const stringValue = String(rowValue).toLowerCase();
        const searchValue = filterValue.toLowerCase();

        return stringValue.includes(searchValue);
      });
    });
  }, [tableData, columnFilters]);

  // Mock API call
  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData: EmployeeData[] = [
        {
          id: 1,
          employeeCode: "433",
          employeeName: "Admin MM User",
          department: "Accounts Department",
          totalDays: "30",
          clencashment: 2,
          basic: 10000,
          gradePay: 2000,
          da: 3000,
          hra: 2500,
          otherAllowance: 500,
          extraAllowance: 200,
          leaveEncash: 0,
          arrear: 0,
          pf: 1200,
          pt: 200,
          totalDeduction: 1400,
          totalPayment: 16100,
          receivedBy: "Self",
          pdfLink: "/payroll/salary-slip-433-aug-2024.pdf"
        },
        {
          id: 2,
          employeeCode: "419",
          employeeName: "Admin Admin Admin",
          department: "HR",
          totalDays: "28",
          clencashment: 1,
          basic: 12000,
          gradePay: 2500,
          da: 3500,
          hra: 3000,
          otherAllowance: 800,
          extraAllowance: 300,
          leaveEncash: 0,
          arrear: 0,
          pf: 1500,
          pt: 250,
          totalDeduction: 1750,
          totalPayment: 19850,
          receivedBy: "Bank Transfer",
          pdfLink: "/payroll/salary-slip-419-aug-2024.pdf"
        },
        {
          id: 3,
          employeeCode: "501",
          employeeName: "John Doe",
          department: "IT Department",
          totalDays: "31",
          clencashment: 3,
          basic: 15000,
          gradePay: 3000,
          da: 4000,
          hra: 3500,
          otherAllowance: 1000,
          extraAllowance: 500,
          leaveEncash: 200,
          arrear: 300,
          pf: 1800,
          pt: 300,
          totalDeduction: 2100,
          totalPayment: 23400,
          receivedBy: "Bank Transfer",
          pdfLink: "/payroll/salary-slip-501-aug-2024.pdf"
        },
        {
          id: 4,
          employeeCode: "502",
          employeeName: "Jane Smith",
          department: "Finance Department",
          totalDays: "29",
          clencashment: 0,
          basic: 14000,
          gradePay: 2800,
          da: 3800,
          hra: 3200,
          otherAllowance: 900,
          extraAllowance: 400,
          leaveEncash: 0,
          arrear: 150,
          pf: 1700,
          pt: 280,
          totalDeduction: 1980,
          totalPayment: 22370,
          receivedBy: "Cheque",
          pdfLink: "/payroll/salary-slip-502-aug-2024.pdf"
        }
      ];

      // Calculate totals for each employee
      const dataWithCalculatedTotals = mockData.map(emp => {
        const totals = calculateTotals(emp);
        return { ...emp, ...totals };
      });

      setTableData(dataWithCalculatedTotals.map((emp, i) => ({ ...emp, srNo: i + 1 })));
      setSearched(true);
      setLoading(false);
    }, 800);
  };

  // Inline edit handlers
  const handleChangeTotalDays = (id: number, value: string) => {
    setTableData((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, totalDays: value } : emp))
    );
  };

  const handleInputChange = (rowIndex: number, key: keyof EmployeeTableData, value: number) => {
    setTableData((prev) => {
      const newData = [...prev];
      (newData[rowIndex] as any)[key] = value;

      // Recalculate totals when relevant fields change
      if (['basic', 'gradePay', 'da', 'hra', 'otherAllowance', 'extraAllowance', 'leaveEncash', 'arrear', 'pf', 'pt'].includes(key as string)) {
        const totals = calculateTotals(newData[rowIndex]);
        newData[rowIndex].totalDeduction = totals.totalDeduction;
        newData[rowIndex].totalPayment = totals.totalPayment;
      }

      return newData;
    });
  };

  // Handler for Received By change
  const handleReceivedByChange = (id: number, value: string) => {
    setTableData((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, receivedBy: value } : emp))
    );
  };

  // Column filter handler
  const handleColumnFilter = (columnName: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnName]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters({});
  };

  // View PDF function
  const viewPDF = (pdfLink: string) => {
    window.open(pdfLink, "_blank");
  };

  // Export to Excel function
  const exportToExcel = () => {
    const dataToExport = filteredData.map(emp => ({
      "Sr No": emp.srNo,
      "Emp No": emp.employeeCode,
      "Employee Name": emp.employeeName,
      "Department": emp.department,
      "Total Days": emp.totalDays,
      "CL Encashment": emp.clencashment,
      "Basic": emp.basic,
      "Grade Pay": emp.gradePay,
      "DA": emp.da,
      "HRA": emp.hra,
      "Other Allowance": emp.otherAllowance,
      "Extra Allowance": emp.extraAllowance,
      "Leave Encash": emp.leaveEncash,
      "Arrears": emp.arrear,
      "PF": emp.pf,
      "PT": emp.pt,
      "Total Deduction": emp.totalDeduction,
      "Total Payment": emp.totalPayment,
      "Received By": emp.receivedBy
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Payroll");
    XLSX.writeFile(wb, `Monthly-Payroll-${month}-${year}.xlsx`);
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(`Monthly Payroll - ${month} ${year}`, 14, 15);

    const tableColumn = [
      "Sr No", "Emp No", "Employee Name", "Department", "Total Days",
      "CL Encash", "Basic", "Grade Pay", "DA", "HRA", "Other Allow",
      "Extra Allow", "Leave Encash", "Arrears", "PF", "PT",
      "Total Deduction", "Total Payment", "Received By"
    ];

    const tableRows = filteredData.map(emp => [
      emp.srNo.toString(),
      emp.employeeCode,
      emp.employeeName,
      emp.department,
      emp.totalDays,
      emp.clencashment.toString(),
      emp.basic.toString(),
      emp.gradePay.toString(),
      emp.da.toString(),
      emp.hra.toString(),
      emp.otherAllowance.toString(),
      emp.extraAllowance.toString(),
      emp.leaveEncash.toString(),
      emp.arrear.toString(),
      emp.pf.toString(),
      emp.pt.toString(),
      emp.totalDeduction.toString(),
      emp.totalPayment.toString(),
      emp.receivedBy.toString()
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: "grid",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [209, 231, 255] }
    });

    doc.save(`Monthly-Payroll-${month}-${year}.pdf`);
  };

  // Table columns
  const columns: TableColumn<EmployeeTableData>[] = [
    {
      name: (
        <div>
          <div>Sr No</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.srNo || ''}
            onChange={(e) => handleColumnFilter("srNo", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.srNo,
      width: "80px",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Emp No</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.employeeCode || ''}
            onChange={(e) => handleColumnFilter("employeeCode", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.employeeCode,
      width: "100px",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Employee Name</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.employeeName || ''}
            onChange={(e) => handleColumnFilter("employeeName", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.employeeName,
      sortable: true,
      wrap: true,
      width: "180px",
    },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.department || ''}
            onChange={(e) => handleColumnFilter("department", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.department,
      sortable: true,
      wrap: true,
      width: "180px",
    },
    {
      name: (
        <div>
          <div>Total Days</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.totalDays || ''}
            onChange={(e) => handleColumnFilter("totalDays", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      cell: (row) => (
        <input
          type="number"
          value={row.totalDays}
          onChange={(e) => handleChangeTotalDays(row.id, e.target.value)}
          className="border rounded p-1 w-16 text-center"
        />
      ),
      width: "120px",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>CL Encashment</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.clencashment || ''}
            onChange={(e) => handleColumnFilter("clencashment", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.clencashment,
      sortable: true,
      width: "120px",
    },
    {
      name: (
        <div>
          <div>Basic</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.basic || ''}
            onChange={(e) => handleColumnFilter("basic", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.basic,
      sortable: true,
      width: "120px",
    },
    {
      name: (
        <div>
          <div>Grade Pay</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.gradePay || ''}
            onChange={(e) => handleColumnFilter("gradePay", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.gradePay,
      sortable: true,
      width: "120px",
    },
    {
      name: (
        <div>
          <div>DA</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.da || ''}
            onChange={(e) => handleColumnFilter("da", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.da,
      sortable: true,
      width: "120px",
    },
    {
      name: (
        <div>
          <div>HRA</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.hra || ''}
            onChange={(e) => handleColumnFilter("hra", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.hra,
      sortable: true,
      width: "120px",
    },
    {
      name: (
        <div>
          <div>Other Allow.</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.otherAllowance || ''}
            onChange={(e) => handleColumnFilter("otherAllowance", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.otherAllowance,
      sortable: true,
      width: "140px",
    },
    {
      name: (
        <div>
          <div>Extra Allow.</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.extraAllowance || ''}
            onChange={(e) => handleColumnFilter("extraAllowance", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.extraAllowance,
      sortable: true,
      width: "140px",
    },
    {
      name: (
        <div>
          <div>Leave Encash</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.leaveEncash || ''}
            onChange={(e) => handleColumnFilter("leaveEncash", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.leaveEncash,
      sortable: true,
      width: "140px",
    },
    {
      name: (
        <div>
          <div>Arrears</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.arrear || ''}
            onChange={(e) => handleColumnFilter("arrear", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.arrear,
      sortable: true,
      width: "120px",
    },
    {
      name: (
        <div>
          <div>PF</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.pf || ''}
            onChange={(e) => handleColumnFilter("pf", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.pf,
      sortable: true,
      width: "100px",
    },
    {
      name: (
        <div>
          <div>PT</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.pt || ''}
            onChange={(e) => handleColumnFilter("pt", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.pt,
      sortable: true,
      width: "100px",
    },
    {
      name: (
        <div>
          <div>Total Deduction</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.totalDeduction || ''}
            onChange={(e) => handleColumnFilter("totalDeduction", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.totalDeduction,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span className="font-semibold text-red-600">{row.totalDeduction}</span>
      ),
    },
    {
      name: (
        <div>
          <div>Total Payment</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.totalPayment || ''}
            onChange={(e) => handleColumnFilter("totalPayment", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.totalPayment,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span className="font-semibold text-green-600">{row.totalPayment}</span>
      ),
    },
    {
      name: (
        <div>
          <div>Received By</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters.receivedBy || ''}
            onChange={(e) => handleColumnFilter("receivedBy", e.target.value)}
            style={inputStyle}
          />
        </div>
      ),
      selector: (row) => row.receivedBy,
      // cell: (row) => (
      //   <select
      //     value={row.receivedBy}
      //     onChange={(e) => handleReceivedByChange(row.id, e.target.value)}
      //     className="border rounded p-1 w-28 text-center"
      //   >
      //     <option value="Self">Self</option>
      //     <option value="Bank Transfer">Bank Transfer</option>
      //     <option value="Cheque">Cheque</option>
      //     <option value="Other">Other</option>
      //   </select>
      // ),
      width: "130px",
      sortable: true,
    },
    {
      name: <div>PDF Link</div>,
      cell: (row) => (
        <Button
          onClick={() => viewPDF(row.pdfLink)}
          className="text-black p-1 bg-white transition-colors"
          size="sm"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
      width: "80px",
    },
  ];

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
        padding: "8px"
      }
    },
    table: {
      style: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" },
    },
  };

  return (
    <div className="p-6">
       <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Monthly Payroll Management</h1>
              {/* <p className="text-sm text-muted-foreground mt-1">
                Manage your organization's information, Department structure.
              </p> */}
            </div>
          </div>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="flex-1">
            <EmployeeSelector
              multiSelect
              empMultiSelect
              selectedDepartment={selectedDepartments}
              onSelectDepartment={setSelectedDepartments}
              selectedEmployee={selectedEmployees}
              onSelectEmployee={setSelectedEmployees}
              className="w-150"
            />
          </div>

          <div className="w-35 mt-1">
            <Label className="mb-2">Select Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent className="max-h-40 overflow-y-auto">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-1">
          <div className="w-35">
            <Label className="mb-2">Select Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="max-h-40 overflow-y-auto">
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 rounded-lg flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-5"
          >
            <Search className="w-5 h-5 mr-2 text-black" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Export Buttons and Filter Controls */}
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

      {/* Table */}
      {searched && (
        <div className="mt-6">
          <h1 className="text-xl font-bold mb-4">
            Monthly Payroll - {month} {year}
            {Object.values(columnFilters).some(filter => filter.trim() !== '') && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (Filtered: {filteredData.length} of {tableData.length} records)
              </span>
            )}
          </h1>
          <DataTable
            columns={columns} 
            data={filteredData}
            customStyles={customStyles}
            pagination
            highlightOnHover
            progressPending={loading}
            persistTableHead
          />
        </div>
      )}
    </div>
  );
}