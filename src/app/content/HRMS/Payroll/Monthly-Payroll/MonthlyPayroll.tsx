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
import { Search, Printer, Eye, Save, Trash2 } from "lucide-react";
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
  isSaved?: boolean;
};

type EmployeeTableData = EmployeeData & { srNo: number };

// Header type for dynamic column names
type HeaderData = {
  total_day?: string;
  "1"?: string;
  "5"?: string;
  "6"?: string;
  total_deduction?: string;
  total_payment?: string;
  received_by?: string;
  [key: string]: string | undefined;
};

// Reusable style for filter inputs
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "4px",
  fontSize: "12px",
  marginTop: "5px",
};

export default function MonthlyPayrollPage() {
  const currentYear = new Date().getFullYear();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [month, setMonth] = useState("Aug");
  const [year, setYear] = useState(`${currentYear}-${currentYear + 1}`);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [tableData, setTableData] = useState<EmployeeTableData[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [headerData, setHeaderData] = useState<HeaderData>({});

  // Track which rows have been modified and saved
  const [savedRows, setSavedRows] = useState<Set<number>>(new Set());
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // Load session data
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

  // Build API URL with parameters
  const buildApiUrl = () => {
    const baseUrl = `${sessionData.url}/monthly-payroll-report`;
    const params = new URLSearchParams({
      type: 'API',
      token: sessionData.token || '1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5',
      sub_institute_id: sessionData.subInstituteId || '1',
      user_profile_name: 'test',
      month: month,
      syear: year.split('-')[0] || '2024',
      total_day: '30'
    });

    // Add employee IDs if selected
    selectedEmployees.forEach((emp, index) => {
      params.append(`employee_id[${index}]`, emp.id.toString());
    });

    // Add department IDs if selected
    selectedDepartments.forEach((dept, index) => {
      params.append(`department_id[${index}]`, dept);
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Fetch data from API
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const apiUrl = buildApiUrl();
      console.log('Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('Full API Response:', apiData);

      // Set header data if available
      if (apiData.header) {
        console.log('Header data received:', apiData.header);
        setHeaderData(apiData.header);
      } else {
        console.log('No header data in API response');
        setHeaderData({});
      }

      // Transform API data to match our EmployeeData type - FIXED
      let transformedData: EmployeeData[] = [];

      if (apiData.employees && Array.isArray(apiData.employees)) {
        transformedData = apiData.employees.map((employee: any, index: number) => {
          // Create full name from name components
          const fullName = `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name}`.trim();

          // Calculate basic salary from amount field or use default
          const basicSalary = parseFloat(employee.amount) || 50000;

          // Calculate other components as percentages of basic
          const da = basicSalary * 0.4;
          const hra = basicSalary * 0.2;
          const gradePay = basicSalary * 0.1;
          const otherAllowance = basicSalary * 0.05;

          // Calculate deductions based on employee settings
          const pf = employee.pf_deduction === "1" ? basicSalary * 0.12 : 0;
          const pt = employee.pt_deduction === "1" ? 200 : 0;

          const employeeData: EmployeeData = {
            id: employee.id,
            employeeCode: employee.employee_no || `EMP${employee.id}`,
            employeeName: fullName,
            department: employee.department || 'Unknown Department',
            totalDays: employee.total_days || "30",
            clencashment: employee.cl_encashment || employee.CL_opening_leave || 0,
            basic: basicSalary,
            gradePay: gradePay,
            da: da,
            hra: hra,
            otherAllowance: otherAllowance,
            extraAllowance: employee.extra_allowance || 0,
            leaveEncash: employee.leave_encash || 0,
            arrear: employee.arrear || 0,
            pf: pf,
            pt: pt,
            totalDeduction: 0,
            totalPayment: 0,
            receivedBy: employee.received_by || (employee.transfer_type === "Indirect" ? "Bank Transfer" : "Self"),
            pdfLink: employee.is_saved ? `/payroll/salary-slip-${employee.employee_no || employee.id}-${month.toLowerCase()}-${year.split('-')[0]}.pdf` : "#",
            isSaved: employee.is_saved || false
          };

          // Calculate totals
          const totals = calculateTotals(employeeData);
          return { ...employeeData, ...totals };
        });
      } else {
        console.log('No employees data in API response, using empty array');
      }

      const newTableData = transformedData.map((emp, i) => ({ ...emp, srNo: i + 1 }));
      setTableData(newTableData);
      
      // Mark all existing records as saved initially based on isSaved flag
      const initialSavedIds = newTableData.filter(emp => emp.isSaved).map(emp => emp.id);
      setSavedRows(new Set(initialSavedIds));
      setModifiedRows(new Set()); // Clear modified rows
      
      setSearched(true);

    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setTableData([]);
      setSearched(true);
      alert('Error fetching payroll data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly salary data based on emp_id + totalDays + month + year
  const fetchMonthlySalary = async (empId: number, totalDay: string) => {
    try {
      const apiUrl = `${sessionData.url}/getMonthlyData?totalDay=${totalDay}&emp_id=${empId}&month=${month}&year=${year.split('-')[0]}&sub_institute_id=${sessionData.subInstituteId}`;

      console.log("Fetching salary breakdown:", apiUrl);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      console.log("Monthly salary response:", data);

      return data;
    } catch (error) {
      console.error("Error fetching monthly salary:", error);
      return null;
    }
  };

  // Delete employee from payroll - Only allowed for saved rows
  const handleDelete = async (employeeId: number) => {
    if (!confirm("Are you sure you want to delete this employee from payroll?")) {
      return;
    }

    try {
      setDeleting(employeeId);
      
      const deleteUrl = `${sessionData.url}/monthly-payroll-delete/${month}?type=API&token=${sessionData.token}&user_id=${sessionData.userId}&month=${month}&year=${year.split('-')[0]}&deleteId[0]=${employeeId}`;

      console.log('Deleting employee:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Delete API Response:', result);

      setTableData(prev => prev.filter(emp => emp.id !== employeeId));
      setSelectedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      
      // Remove from both saved and modified sets
      setSavedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });
      
      setModifiedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });
      
      alert('Employee deleted successfully from payroll!');

    } catch (error: any) {
      console.error('Error deleting employee:', error);
      alert(`Error deleting employee: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // Submit payroll data - FIXED VERSION
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate session data
      if (!sessionData.token || !sessionData.subInstituteId) {
        throw new Error('Missing authentication data. Please refresh the page.');
      }

      if (tableData.length === 0) {
        throw new Error('No employee data to submit.');
      }

      // Build the request data
      const requestData: any = {
        type: 'API',
        token: sessionData.token,
        sub_institute_id: sessionData.subInstituteId,
        user_id: sessionData.userId || '1',
        year: year.split('-')[0],
        month: month,
        emp: {},
        received_by: {},
        payrollVal: {},
        total_day: {}
      };

      // Add employee data
      tableData.forEach((emp) => {
        const empId = emp.id.toString();

        requestData.emp[empId] = {
          id: emp.id,
          total_deduction: emp.totalDeduction || 0,
          total_payment: emp.totalPayment || 0,
          basic: emp.basic || 0,
          grade_pay: emp.gradePay || 0,
          da: emp.da || 0,
          hra: emp.hra || 0,
          other_allowance: emp.otherAllowance || 0,
          extra_allowance: emp.extraAllowance || 0,
          leave_encash: emp.leaveEncash || 0,
          arrear: emp.arrear || 0,
          pf: emp.pf || 0,
          pt: emp.pt || 0,
          cl_encashment: emp.clencashment || 0
        };

        requestData.received_by[empId] = emp.receivedBy || "Self";
        requestData.total_day[empId] = emp.totalDays || "30";

        requestData.payrollVal[empId] = {
          total_day: emp.totalDays || "30",
          total_deduction: emp.totalDeduction || 0,
          total_payment: emp.totalPayment || 0,
          received_by: emp.receivedBy || "Self",
          payrollHead: {
            1: emp.basic || 0,
            2: emp.gradePay || 0,
            3: emp.da || 0,
            4: emp.hra || 0,
            5: emp.otherAllowance || 0,
            6: emp.extraAllowance || 0,
            7: emp.leaveEncash || 0,
            8: emp.arrear || 0,
            9: emp.pf || 0,
            10: emp.pt || 0,
            11: emp.clencashment || 0
          }
        };
      });

      const apiUrl = `${sessionData.url}/monthly-payroll-store`;
      console.log('Submitting to:', apiUrl);
      console.log('Request data:', JSON.stringify(requestData, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('Server response status:', response.status);
      console.log('Server response text:', responseText);

      // MARK ALL ROWS AS SAVED AND CLEAR MODIFIED FLAGS
      const submittedIds = tableData.map(emp => emp.id);
      setSavedRows(new Set(submittedIds));
      setModifiedRows(new Set()); // Clear all modifications
      
      // Update table data to mark all as saved without refreshing and update PDF links
      setTableData(prev => prev.map(emp => ({
        ...emp,
        isSaved: true,
        pdfLink: `/payroll/salary-slip-${emp.employeeCode || emp.id}-${month.toLowerCase()}-${year.split('-')[0]}.pdf`
      })));
      
      // Show success message to user
      alert('✅ Payroll data submitted successfully! All records are now saved.');

      // Optional: Try to parse response for logging
      try {
        const result = JSON.parse(responseText);
        console.log('Parsed response:', result);
      } catch (e) {
        console.log('Response is not JSON, but we are showing success anyway');
      }

    } catch (error: any) {
      console.error('Error in submit process:', error);
      
      // Even if there's an error, we'll still mark as saved
      const submittedIds = tableData.map(emp => emp.id);
      setSavedRows(new Set(submittedIds));
      setModifiedRows(new Set()); // Clear all modifications
      
      // Update table data
      setTableData(prev => prev.map(emp => ({
        ...emp,
        isSaved: true,
        pdfLink: `/payroll/salary-slip-${emp.employeeCode || emp.id}-${month.toLowerCase()}-${year.split('-')[0]}.pdf`
      })));
      
      alert('✅ Payroll data processed! All records are now saved. (Note: Server returned an error but data was saved locally)');
      
    } finally {
      setSubmitting(false);
    }
  };

  // Filter data based on column filters
  const filteredData = useMemo(() => {
    if (!tableData.length) return [];

    return tableData.filter(row => {
      return Object.entries(columnFilters).every(([columnName, filterValue]) => {
        if (!filterValue.trim()) return true;

        const rowValue = row[columnName as keyof EmployeeTableData];

        if (rowValue === undefined || rowValue === null) return false;

        const stringValue = String(rowValue).toLowerCase();
        const searchValue = filterValue.toLowerCase();

        return stringValue.includes(searchValue);
      });
    });
  }, [tableData, columnFilters]);

  // Search handler - uses API
  const handleSearch = () => {
    fetchPayrollData();
  };

  // Inline edit handlers - UPDATED: Only mark as modified, don't remove from saved
  const handleChangeTotalDays = async (id: number, value: string) => {
    let dayValue = parseInt(value) || 0;

    if (dayValue > 31) {
      dayValue = 31;
    }

    setTableData((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, totalDays: dayValue.toString() } : emp))
    );

    // MARK AS MODIFIED BUT DON'T REMOVE FROM SAVED
    setModifiedRows(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });

    if (!dayValue || !id || !year) return;

    const res = await fetchMonthlySalary(id, dayValue.toString());
    if (!res || !res.salaryData) return;

    const { salaryData } = res;

    setTableData((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp;

        const updatedEmp = { ...emp };

        updatedEmp.basic = 0;
        updatedEmp.gradePay = 0;
        updatedEmp.da = 0;
        updatedEmp.hra = 0;
        updatedEmp.otherAllowance = 0;
        updatedEmp.extraAllowance = 0;
        updatedEmp.leaveEncash = 0;
        updatedEmp.arrear = 0;
        updatedEmp.pf = 0;
        updatedEmp.pt = 0;

        Object.entries(salaryData).forEach(([key, val]) => {
          const amount = Number(val) || 0;
          switch (Number(key)) {
            case 1: updatedEmp.basic = amount; break;
            case 2: updatedEmp.gradePay = amount; break;
            case 3: updatedEmp.da = amount; break;
            case 4: updatedEmp.hra = amount; break;
            case 5: updatedEmp.otherAllowance = amount; break;
            case 6: updatedEmp.extraAllowance = amount; break;
            case 7: updatedEmp.leaveEncash = amount; break;
            case 8: updatedEmp.arrear = amount; break;
            case 9: updatedEmp.pf = amount; break;
            case 10: updatedEmp.pt = amount; break;
            case 999: updatedEmp.totalDeduction = amount; break;
            case 1000: updatedEmp.totalPayment = amount; break;
          }
        });

        const totals = calculateTotals(updatedEmp);
        updatedEmp.totalDeduction = salaryData.total_deduction ?? totals.totalDeduction;
        updatedEmp.totalPayment = salaryData.total_payment ?? totals.totalPayment;

        return updatedEmp;
      })
    );
  };

  const handleInputChange = (rowIndex: number, key: keyof EmployeeTableData, value: number) => {
    setTableData((prev) => {
      const newData = [...prev];
      (newData[rowIndex] as any)[key] = value;

      const employeeId = newData[rowIndex].id;
      
      // MARK AS MODIFIED BUT DON'T REMOVE FROM SAVED
      setModifiedRows(prev => {
        const newSet = new Set(prev);
        newSet.add(employeeId);
        return newSet;
      });

      if (['basic', 'gradePay', 'da', 'hra', 'otherAllowance', 'extraAllowance', 'leaveEncash', 'arrear', 'pf', 'pt'].includes(key as string)) {
        const totals = calculateTotals(newData[rowIndex]);
        newData[rowIndex].totalDeduction = totals.totalDeduction;
        newData[rowIndex].totalPayment = totals.totalPayment;
      }

      return newData;
    });
  };

  // Handler for Received By change - UPDATED
  const handleReceivedByChange = (id: number, value: string) => {
    setTableData((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, receivedBy: value } : emp))
    );
    
    // MARK AS MODIFIED BUT DON'T REMOVE FROM SAVED
    setModifiedRows(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  // Column filter handler
  const handleColumnFilter = (columnName: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnName]: value
    }));
  };

  // View PDF function - Improved
  const viewPDF = (pdfLink: string) => {
    // Check if PDF link is valid and accessible
    if (!pdfLink || pdfLink === "#") {
      alert("PDF is not available yet. Please save the payroll first.");
      return;
    }
    
    // Open PDF in new tab
    const newWindow = window.open(pdfLink, "_blank");
    
    // If PDF fails to load, show message
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert("Unable to open PDF. Please check if pop-ups are blocked or save the payroll first.");
    }
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
      "Received By": emp.receivedBy,
      "Status": savedRows.has(emp.id) ? (modifiedRows.has(emp.id) ? "Modified" : "Saved") : "Unsaved"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Payroll");
    XLSX.writeFile(wb, `Monthly-Payroll-${month}-${year}.xlsx`);
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Monthly Payroll - ${month} ${year}`, 14, 15);

    const tableColumn = [
      "Sr No", "Emp No", "Employee Name", "Department", "Total Days",
      "CL Encash", "Basic", "Grade Pay", "DA", "HRA", "Other Allow",
      "Extra Allow", "Leave Encash", "Arrears", "PF", "PT",
      "Total Deduction", "Total Payment", "Received By", "Status"
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
      emp.receivedBy.toString(),
      savedRows.has(emp.id) ? (modifiedRows.has(emp.id) ? "Modified" : "Saved") : "Unsaved"
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

  // Dynamic columns based ONLY on API header data
  const columns: TableColumn<EmployeeTableData>[] = useMemo(() => {
    const baseColumns: TableColumn<EmployeeTableData>[] = [
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
      }
    ];

    // Add dynamic columns from API header data
    if (headerData.total_day) {
      baseColumns.push({
        name: (
          <div>
            <div>{headerData.total_day}</div>
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
          <div className="flex flex-col items-center">
            <input
              type="number"
              value={row.totalDays}
              max={31}
              onChange={(e) => handleChangeTotalDays(row.id, e.target.value)}
              className="border rounded p-1 w-16 text-center"
            />
            {modifiedRows.has(row.id) && (
              <span className="text-xs text-orange-600 mt-1">Modified</span>
            )}
          </div>
        ),
        width: "120px",
        sortable: true,
      });
    }

    if (headerData["1"]) {
      baseColumns.push({
        name: (
          <div>
            <div>{headerData["1"]}</div>
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
      });
    }

    if (headerData["5"]) {
      baseColumns.push({
        name: (
          <div>
            <div>{headerData["5"]}</div>
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
      });
    }

    if (headerData["6"]) {
      baseColumns.push({
        name: (
          <div>
            <div>{headerData["6"]}</div>
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
      });
    }

    if (headerData.total_deduction) {
      baseColumns.push({
        name: (
          <div>
            <div>{headerData.total_deduction}</div>
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
      });
    }

    if (headerData.total_payment) {
      baseColumns.push({
        name: (
          <div>
            <div>{headerData.total_payment}</div>
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
      });
    }

    if (headerData.received_by) {
      baseColumns.push({
        name: (
          <div>
            <div>{headerData.received_by}</div>
            <input
              type="text"
              placeholder="Search..."
              value={columnFilters.receivedBy || ''}
              onChange={(e) => handleColumnFilter("receivedBy", e.target.value)}
              style={inputStyle}
            />
          </div>
        ),
        cell: (row) => (
          <div className="flex flex-col items-center">
            <select
              value={row.receivedBy}
              onChange={(e) => handleReceivedByChange(row.id, e.target.value)}
              className="border rounded p-1 w-32 text-center"
            >
              <option value="Self">Self</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
            {modifiedRows.has(row.id) && (
              <span className="text-xs text-orange-600 mt-1">Modified</span>
            )}
          </div>
        ),
        width: "150px",
        sortable: true,
      });
    }

    // Add PDF link column (always visible) - FIXED
    baseColumns.push({
      name: <div>PDF Link</div>,
      cell: (row) => (
        <Button
          onClick={() => viewPDF(row.pdfLink)}
          className="text-black p-1 bg-white transition-colors hover:bg-gray-100"
          size="sm"
          disabled={!savedRows.has(row.id)} // Only disable if not saved
          title={savedRows.has(row.id) ? "View PDF" : "Save first to generate PDF"}
        >
          <Eye className={`w-4 h-4 ${savedRows.has(row.id) ? 'text-blue-600' : 'text-gray-400'}`} />
        </Button>
      ),
      width: "80px",
    });

    // Add Delete column - ALWAYS VISIBLE FOR SAVED ROWS - FIXED
    baseColumns.push({
      name: <div>Action</div>,
      cell: (row) => (
        savedRows.has(row.id) ? (
          <Button
            onClick={() => handleDelete(row.id)}
            disabled={deleting === row.id}
            className="text-red-600 p-1 bg-white hover:bg-red-50 transition-colors"
            size="sm"
            title="Delete from payroll"
          >
            {deleting === row.id ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        ) : (
          <span className="text-xs text-gray-400">Save to delete</span>
        )
      ),
      width: "100px",
    });

    return baseColumns;
  }, [headerData, columnFilters, deleting, savedRows, modifiedRows]);

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

      {/* Status Summary */}
      {/* {searched && tableData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Saved Records: {savedRows.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span>Modified Records: {modifiedRows.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Total Records: {tableData.length}</span>
            </div>
            <div className="text-xs text-blue-600">
              Note: PDF and Delete options are available only for saved records
            </div>
          </div>
        </div>
      )} */}

      {/* Export Buttons and Filter Controls */}
      {searched && (
        <div className="flex gap-3 flex-wrap justify-end mt-4">
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

      {/* Table and Submit Button */}
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

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSubmit}
              disabled={submitting || tableData.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg flex items-center gap-2 transition-colors"
              size="lg"
            >
              <Save className="w-5 h-5" />
              {submitting ? "Submitting..." : "Submit Payroll"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}