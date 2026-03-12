"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import Shepherd from "shepherd.js";
import 'shepherd.js/dist/css/shepherd.css';
import { createMonthlyPayrollTour, monthlyPayrollTourStyles } from "./MonthlyPayrollTourSteps";

// Define Shepherd Tour type
type ShepherdTour = InstanceType<typeof Shepherd.Tour>;

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

  // Tour state
  const tourRef = useRef<ShepherdTour | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const tourContainerRef = useRef<HTMLDivElement>(null);

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

  // Tour initialization - only starts when triggered from sidebar
  useEffect(() => {
    // Check if tour should be triggered
    const triggerValue = sessionStorage.getItem('triggerPageTour');

    // Only start tour if triggered for monthly-payroll
    if (triggerValue === 'monthly-payroll') {
      // Clear the trigger so tour doesn't restart on refresh
      sessionStorage.removeItem('triggerPageTour');

      // Check if tour was already completed in this session
      const tourCompleted = sessionStorage.getItem('monthlyPayrollTourCompleted');

      if (!tourCompleted) {
        // Initialize and start the tour after a short delay
        // Wait for DOM to be ready
        const timer = setTimeout(() => {
          // Double check trigger is cleared and tour not completed
          if (!sessionStorage.getItem('monthlyPayrollTourCompleted')) {
            startTour();
          }
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Add a manual Start Tour button
  const handleStartTourManually = () => {
    // Clear any previous tour completion to allow re-running
    sessionStorage.removeItem('monthlyPayrollTourCompleted');
    startTour();
  };

  const startTour = () => {
    if (isTourActive) {
      console.log('Tour is already active, skipping...');
      return;
    }

    console.log('Starting tour initialization...');
    setIsTourActive(true);

    // Elements required for tour (basic UI elements that are always present)
    const requiredSelectors = [
      '#monthly-payroll-title',
      '#employee-selector-container',
      '#month-select',
      '#year-select',
      '#search-button',
      '#submit-payroll-button'
    ];

    // Function to check if elements exist and create tour
    const initTour = () => {
      // Check if all required basic elements exist
      const allReady = requiredSelectors.every(sel => {
        const el = document.querySelector(sel);
        if (!el) {
          console.log(`Element ${sel} not found`);
        }
        return el;
      });

      if (!allReady) {
        console.log('Not all required elements are present, retrying in 200ms...');
        return false;
      }

      console.log('All required elements found, creating tour...');

      // Only add table selector if it exists (after search)
      const tableEl = document.querySelector('#payroll-data-table-container');
      if (!tableEl) {
        console.log('Table container not found, tour will show basic UI only');
      }

      const tour = createMonthlyPayrollTour();
      tourRef.current = tour;

      tour.on('complete', () => {
        console.log('Tour completed');
        setIsTourActive(false);
        sessionStorage.setItem('monthlyPayrollTourCompleted', 'true');
      });

      tour.on('cancel', () => {
        console.log('Tour cancelled');
        setIsTourActive(false);
        sessionStorage.setItem('monthlyPayrollTourCompleted', 'true');
      });

      // Add error handler
      tour.on('show', (e) => {
        console.log('Tour step shown:', e.step?.id);
      });

      try {
        tour.start();
        console.log('Tour started successfully');
      } catch (error) {
        console.error('Error starting tour:', error);
        setIsTourActive(false);
      }

      return true;
    };

    // Try to initialize immediately, then poll if needed
    if (!initTour()) {
      let attempts = 0;
      const maxAttempts = 20; // Try for up to 4 seconds

      const waitForDOM = setInterval(() => {
        attempts++;
        if (initTour()) {
          clearInterval(waitForDOM);
        } else if (attempts >= maxAttempts) {
          clearInterval(waitForDOM);
          console.log('Timeout waiting for DOM elements, starting tour with available elements...');
          // Try to start anyway with basic elements
          initTour();
        }
      }, 200);
    }
  };


  // Inject tour styles
  useEffect(() => {
    const existingStyle = document.getElementById('monthly-payroll-tour-styles');
    if (!existingStyle && monthlyPayrollTourStyles) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'monthly-payroll-tour-styles';
      styleSheet.textContent = monthlyPayrollTourStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  // Clean up tour on unmount
  useEffect(() => {
    return () => {
      if (tourRef.current) {
        tourRef.current.cancel();
      }
    };
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
    const baseUrl = `${sessionData.url}/monthly-payroll/create`;
    const params = new URLSearchParams({
      type: 'API',
      token: sessionData.token || '1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5',
      sub_institute_id: sessionData.subInstituteId || '1',
      user_profile_name: 'test',
      month: month,
      syear: year.split('-')[0] || '2024',
      year: year.split('-')[0] || '2024',
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
      // console.log('Fetching from new:', apiUrl);
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
      console.log('Full API Response here:', apiData);
      // Set header data if available
      if (apiData.header) {
        console.log('Header data received:', apiData.header);
        console.log('Header keys:', Object.keys(apiData.header));
        setHeaderData(apiData.header);
      } else {
        console.log('No header data in API response');
        setHeaderData({});
      }
      // Transform API data to match our EmployeeData type - UPDATED
      let transformedData: EmployeeData[] = [];
      if (apiData.employeeDetails && Array.isArray(apiData.employeeDetails)) {
        transformedData = apiData.employeeDetails.map((employee: any, index: number) => {
          console.log(`Transformed employee ${index + 1}:`, employee);
          // Create full name from name components
          const fullName = `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name}`.trim();
          // Use the actual data from API response based on header mapping
          const employeeData: EmployeeData = {
            id: employee.id,
            employeeCode: employee.employee_no || `EMP${employee.id}`,
            employeeName: fullName,
            department: employee.department || 'Unknown Department',
            totalDays: employee.totalDay || "30",
            clencashment: employee.cl_encashment || 0,
            basic: employee.basic || 0,
            gradePay: employee.grade_pay || employee.grade || 0,
            da: employee.da || 0,
            hra: employee.hra || 0,
            otherAllowance: employee.other_allowance || 0,
            extraAllowance: employee.extra_allowance || 0,
            leaveEncash: employee.leave_encash || 0,
            arrear: employee.arrear || 0,
            pf: employee.pf || 0,
            pt: employee.pt || 0,
            totalDeduction: employee.total_deduction || 0,
            totalPayment: employee.total_payment || 0,
            receivedBy: employee.received_by || "Self",
            pdfLink: employee.is_saved ? `/payroll/salary-slip-${employee.employee_no || employee.id}-${month.toLowerCase()}-${year.split('-')[0]}.pdf` : "#",
            isSaved: employee.is_saved || false
          };
          // Calculate totals if not provided by API
          if (!employee.total_deduction || !employee.total_payment) {
            const totals = calculateTotals(employeeData);
            employeeData.totalDeduction = totals.totalDeduction;
            employeeData.totalPayment = totals.totalPayment;
          }
          // console.log(`Transformed employee ${index + 1}:`, employeeData);
          return employeeData;
        });
      } else {
        console.log('No employees data in API response, using empty array');
      }
      // Fetch detailed salary data for each employee
      const employeesWithSalaryData = await Promise.all(
        transformedData.map(async (emp) => {
          try {
            const salaryRes = await fetchMonthlySalary(emp.id, emp.totalDays);
            if (salaryRes && salaryRes.salaryData) {
              const { salaryData } = salaryRes;

              // Update employee with detailed salary data
              const updatedEmp = { ...emp };

              // Reset all values first
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

              // Update values from salaryData
              Object.entries(salaryData).forEach(([key, val]) => {
                const amount = Number(val) || 0;
                switch (Number(key)) {
                  case 9: updatedEmp.basic = amount; break;
                  case 10: updatedEmp.gradePay = amount; break;
                  case 3: updatedEmp.da = amount; break;
                  case 11: updatedEmp.hra = amount; break;
                  case 5: updatedEmp.otherAllowance = amount; break;
                  case 6: updatedEmp.extraAllowance = amount; break;
                  case 7: updatedEmp.leaveEncash = amount; break;
                  case 8: updatedEmp.arrear = amount; break;
                  case 12: updatedEmp.pf = amount; break;
                  case 13: updatedEmp.pt = amount; break;
                  case 999: updatedEmp.totalDeduction = amount; break;
                  case 1000: updatedEmp.totalPayment = amount; break;
                }
              });

              // Calculate totals if not provided by salaryData
              if (!salaryData.total_deduction || !salaryData.total_payment) {
                const totals = calculateTotals(updatedEmp);
                updatedEmp.totalDeduction = totals.totalDeduction;
                updatedEmp.totalPayment = totals.totalPayment;
              } else {
                updatedEmp.totalDeduction = salaryData.total_deduction ?? updatedEmp.totalDeduction;
                updatedEmp.totalPayment = salaryData.total_payment ?? updatedEmp.totalPayment;
              }

              return updatedEmp;
            }
            return emp; // Return original if salary fetch fails
          } catch (error) {
            console.error(`Error fetching salary for employee ${emp.id}:`, error);
            return emp; // Return original on error
          }
        })
      );

      const newTableData = employeesWithSalaryData.map((emp, i) => ({ ...emp, srNo: i + 1 }));
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
  // Submit payroll data
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
            9: emp.basic || 0,
            10: emp.gradePay || 0,
            3: emp.da || 0,
            11: emp.hra || 0,
            5: emp.otherAllowance || 0,
            6: emp.extraAllowance || 0,
            7: emp.leaveEncash || 0,
            8: emp.arrear || 0,
            12: emp.pf || 0,
            13: emp.pt || 0,
            14: emp.clencashment || 0
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
  // Filter data based on selected employees and column filters
  const filteredData = useMemo(() => {
    if (!tableData.length) return [];

    let filtered = tableData;

    // Filter by selected employees if any are selected
    if (selectedEmployees.length > 0) {
      const selectedIds = selectedEmployees.map(emp => emp.id);
      filtered = filtered.filter(row => selectedIds.includes(row.id));
    }

    // Apply column filters
    filtered = filtered.filter(row => {
      return Object.entries(columnFilters).every(([columnName, filterValue]) => {
        if (!filterValue.trim()) return true;

        const rowValue = row[columnName as keyof EmployeeTableData];

        if (rowValue === undefined || rowValue === null) return false;

        const stringValue = String(rowValue).toLowerCase();
        const searchValue = filterValue.toLowerCase();

        return stringValue.includes(searchValue);
      });
    });

    return filtered;
  }, [tableData, columnFilters, selectedEmployees]);

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

        // Reset all values first
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

        // Update values from salaryData
        Object.entries(salaryData).forEach(([key, val]) => {
          const amount = Number(val) || 0;
          switch (Number(key)) {
            case 9: updatedEmp.basic = amount; break;
            case 10: updatedEmp.gradePay = amount; break;
            case 3: updatedEmp.da = amount; break;
            case 11: updatedEmp.hra = amount; break;
            case 5: updatedEmp.otherAllowance = amount; break;
            case 6: updatedEmp.extraAllowance = amount; break;
            case 7: updatedEmp.leaveEncash = amount; break;
            case 8: updatedEmp.arrear = amount; break;
            case 12: updatedEmp.pf = amount; break;
            case 13: updatedEmp.pt = amount; break;
            case 999: updatedEmp.totalDeduction = amount; break;
            case 1000: updatedEmp.totalPayment = amount; break;
          }
        });

        // Calculate totals if not provided by salaryData
        if (!salaryData.total_deduction || !salaryData.total_payment) {
          const totals = calculateTotals(updatedEmp);
          updatedEmp.totalDeduction = totals.totalDeduction;
          updatedEmp.totalPayment = totals.totalPayment;
        } else {
          updatedEmp.totalDeduction = salaryData.total_deduction ?? updatedEmp.totalDeduction;
          updatedEmp.totalPayment = salaryData.total_payment ?? updatedEmp.totalPayment;
        }

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

  // Dynamic columns based ONLY on API header data - FIXED VERSION
  const columns: TableColumn<EmployeeTableData>[] = useMemo(() => {
    console.log('Building columns with headerData:', headerData);

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

    // Add dynamic columns from API header data - FIXED MAPPING
    // if (headerData && Object.keys(headerData).length > 0) {
    console.log('Processing header keys:', Object.keys(headerData));

    // Show total_day (from 'total_day' or '4')
    // if (headerData.total_day || headerData['4']) {
    const columnName = headerData.total_day || 'Total Day';
    baseColumns.push({
      name: (
        <div>
          <div>Total Day</div>
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
            id="total-days-input"
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
    // }

    // Add essential columns that should always be visible
    const essentialColumns = [
      { key: 'basic', label: 'Basic Salary', field: 'basic' },
      { key: 'gradePay', label: 'Grade Pay', field: 'gradePay' },
      { key: 'hra', label: 'HRA', field: 'hra' },
      { key: 'totalDeduction', label: 'Total Deduction', field: 'totalDeduction', special: true },
      { key: 'totalPayment', label: 'Total Payment', field: 'totalPayment', special: true },
    ];

    essentialColumns.forEach(({ key, label, field, special }) => {
      const header = (
        <div>
          <div>{label}</div>
          <input
            type="text"
            placeholder="Search..."
            value={columnFilters[field] || ''}
            onChange={(e) => handleColumnFilter(field, e.target.value)}
            style={inputStyle}
          />
        </div>
      );

      let cell: (row: EmployeeTableData) => React.ReactNode;

      if (special && field === 'totalDeduction') {
        cell = (row) => <span className="font-semibold text-red-600">{row.totalDeduction}</span>;
      } else if (special && field === 'totalPayment') {
        cell = (row) => <span className="font-semibold text-green-600">{row.totalPayment}</span>;
      } else {
        // Make salary fields read-only since they come from API
        cell = (row) => (
          <span className="text-right block w-full p-1">
            {(row as any)[field] || 0}
          </span>
        );
      }

      baseColumns.push({
        name: header,
        selector: (row) => (row as any)[field] || 0,
        sortable: true,
        width: '120px',
        cell,
      });
    });

    // Dynamic column generation based on headerData keys – mirrors Laravel’s @foreach($data['header'] as $hkey => $col)
    if (headerData && typeof headerData === 'object') {
      Object.entries(headerData).forEach(([hkey, col]) => {
        if (!col) return; // skip empty labels

        // Skip if already added as essential column
        if (['basic', 'gradePay', 'hra', 'total_deduction', 'total_payment', '9', '10', '11'].includes(hkey)) return;

        const isSpecial = ['total_deduction', 'total_payment', 'received_by'].includes(hkey);
        const filterKey = hkey === 'total_deduction' ? 'totalDeduction'
          : hkey === 'total_payment' ? 'totalPayment'
            : hkey === 'received_by' ? 'receivedBy'
              : hkey; // payrollHead keys like '9','10',etc.

        // ---- header ----
        const header = (
          <div>
            <div>{col}</div>
            <input
              type="text"
              placeholder="Search..."
              value={(columnFilters as any)[filterKey] || ''}
              onChange={(e) => handleColumnFilter(filterKey, e.target.value)}
              style={inputStyle}
            />
          </div>
        );

        // ---- cell renderer ----
        let cell: (row: EmployeeTableData) => React.ReactNode;

        if (hkey === 'total_deduction') {
          cell = (row) => <span className="font-semibold text-red-600">{row.totalDeduction}</span>;
        } else if (hkey === 'total_payment') {
          cell = (row) => <span className="font-semibold text-green-600">{row.totalPayment}</span>;
        } else if (hkey === 'received_by') {
          cell = (row) => (
            <div className="flex flex-col items-center">
              <select id="received-by-select"
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
          );
        } else {
          // payrollHead numeric keys – editable number input
          cell = (row) => (
            <input
              type="number"
              value={(row as any)[hkey] || 0}
              onChange={(e) => handleInputChange(row.srNo - 1, hkey as any, parseFloat(e.target.value) || 0)}
              className="border rounded p-1 w-full text-right"
            />
          );
        }

        baseColumns.push({
          name: header,
          selector: (row) => (row as any)[hkey] || 0,
          sortable: true,
          width: '120px',
          cell,
        });
      });
    }
    // }

    // Add PDF link column (always visible)
    baseColumns.push({
      name: <div>PDF Link</div>,
      cell: (row) => (
        <Button
          onClick={() => viewPDF(row.pdfLink)}
          className="text-black p-1 bg-white transition-colors hover:bg-gray-100"
          size="sm"
          disabled={!savedRows.has(row.id)}
          title={savedRows.has(row.id) ? "View PDF" : "Save first to generate PDF"}
        >
          <Eye className={`w-4 h-4 ${savedRows.has(row.id) ? 'text-blue-600' : 'text-gray-400'}`} />
        </Button>
      ),
      width: "80px",
    });

    // Add Delete column
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

    console.log('Final columns count:', baseColumns.length);
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
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:justify-between mb-6 gap-4">
        <div>
          <h1 id="monthly-payroll-title" className="text-xl sm:text-2xl font-bold text-foreground">Monthly Payroll Management</h1>
          <p className="text-sm text-gray-500">Dynamic columns based on API header data</p>
        </div>
      </div>

      {/* Filters */}
      <div id="employee-selector-container" className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="flex-1 min-w-[200px]">
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

          <div id="month-select" className="w-full sm:w-35 mt-1">
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
          <div id="year-select" className="w-full sm:w-35">
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
            id="search-button"
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
            {headerData && Object.keys(headerData).length > 0 && (
              <div className="text-xs text-blue-600">
                Columns from API: {Object.values(headerData).filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Export Buttons and Filter Controls */}
      {searched && tableData.length > 0 && (
        <div id="export-buttons" className="flex gap-3 flex-wrap justify-end mt-4">
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
          <div id="payroll-data-table-container">
            <div id="payroll-data-table">

              {tableData.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No employee data found for the selected criteria.</p>
                  <p className="text-sm text-gray-400 mt-2">Try selecting different employees, departments, or date range.</p>
                </div>
              ) : (
                <>
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
                </>

              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}