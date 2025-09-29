"use client";

import React, { useState, useEffect } from "react";
import EmployeeSelector from "../../../User-Attendance/components/EmployeeSelector";
import "react-datepicker/dist/react-datepicker.css";
import { Search, Printer } from "lucide-react";
import { Employee } from "../../../User-Attendance/types/attendance";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DataTable, { TableStyles, TableColumn } from "react-data-table-component";

// ------------------ TYPES ------------------
interface PayrollType {
  id: number;
  payroll_name: string;
  payroll_type: number;
  amount_type: number;
  payroll_percentage: string;
  status: number;
}

interface SalaryData {
  srNo: number;
  empNo: number;
  empName: string;
  department: string;
  gender: string;
  status: string;
  payrollValues: Record<number, number>;
  grossTotal: number;
  employeeId?: number;
}

interface EditableInputProps {
  value: number;
  onChange: (value: number) => void;
  type?: string;
  disabled?: boolean;
}

interface EmployeeApiResponse {
  id: number;
  employee_no: string;
  first_name: string;
  last_name: string;
  department: string;
  gender: string;
  amount: string;
  status: number;
  [key: string]: any;
}

interface EmployeeSalaryStructures {
  [employeeId: string]: {
    [payrollId: string]: number;
  };
}

// ------------------ EDITABLE INPUT ------------------
const EditableInput: React.FC<EditableInputProps> = ({
  value,
  onChange,
  type = "number",
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const numValue = parseFloat(inputValue) || 0;
    onChange(numValue);
  };

  return (
    <input
      type={type}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled}
      className="w-full p-1 border rounded text-right"
      style={{ minWidth: "80px" }}
    />
  );
};

// ------------------ MAIN COMPONENT ------------------
const SalaryStructure: React.FC = () => {
  const [date] = useState<Date | null>(new Date());
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [data, setData] = useState<SalaryData[]>([]);
  const [filteredData, setFilteredData] = useState<SalaryData[]>([]);
  const [payrollTypes, setPayrollTypes] = useState<PayrollType[]>([]);
  const [loading, setLoading] = useState(false);
  const [userHasSearched, setUserHasSearched] = useState(false);
  const [employeeStatus, setEmployeeStatus] = useState<string>("Active");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

  // Reset employees when departments change
  useEffect(() => {
    setSelectedEmployees([]);
  }, [selectedDepartments]);

  // Column filter logic
  useEffect(() => {
    let result = data;
    Object.keys(columnFilters).forEach((key) => {
      const filterValue = columnFilters[key].toLowerCase();
      if (filterValue) {
        result = result.filter((item) => {
          const cellValue = String(item[key as keyof SalaryData] || "").toLowerCase();
          return cellValue.includes(filterValue);
        });
      }
    });
    setFilteredData(result);
  }, [data, columnFilters]);

  const handleColumnFilter = (columnName: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  // FIXED: Proper payroll change handler
  const handlePayrollChange = (rowIndex: number, payrollId: number, value: number) => {
    setData((prevData) => {
      return prevData.map((row, index) => {
        if (index === rowIndex) {
          const newPayrollValues = {
            ...row.payrollValues,
            [payrollId]: value
          };

          const newGrossTotal = payrollTypes.reduce((sum, pt) => {
            const val = Number(newPayrollValues[pt.id]) || 0;
            if (pt.payroll_type === 1) return sum + val;
            if (pt.payroll_type === 2) return sum - val;
            return sum;
          }, 0);

          return {
            ...row,
            payrollValues: newPayrollValues,
            grossTotal: newGrossTotal
          };
        }
        return row;
      });
    });
  };

  // ------------------ FETCH DATA ------------------
  const fetchData = async () => {
    setUserHasSearched(true);
    setLoading(true);

    try {
      const year = date?.getFullYear() || new Date().getFullYear();
      const statusParam = employeeStatus === "All" ? "" : employeeStatus === "Active" ? "1" : "0";

      const params = new URLSearchParams();
      params.append("token", sessionData.token);
      params.append("type", "API");
      params.append("sub_institute_id", sessionData.subInstituteId);
      params.append("syear", String(year));
      if (statusParam) params.append("status", statusParam);

      selectedEmployees.forEach((emp, idx) => {
        params.append(`employee_id[${idx}]`, String(emp.id));
      });
      selectedDepartments.forEach((dep, idx) => {
        params.append(`department_id[${idx}]`, String(dep));
      });

      const response = await fetch(
        `${sessionData.url}/employee-salary-structure?${params.toString()}`
      );
      const result = await response.json();

      console.log('Full API Response:', result); // Debug log

      if (Array.isArray(result.payrollTypes)) {
        setPayrollTypes(result.payrollTypes);
      }

      if (Array.isArray(result.employeeLists)) {
        const mappedData: SalaryData[] = result.employeeLists.map(
          (emp: EmployeeApiResponse, idx: number) => {
            // Create payrollValues with existing data from employeeSalaryStructures
            const payrollValues: Record<number, number> = {};
            
            // Initialize all payroll types with 0
            result.payrollTypes.forEach((pt: PayrollType) => {
              payrollValues[pt.id] = 0;
            });

            // Check if we have existing salary data for this employee
            if (result.employeeSalaryStructures) {
              // Find matching employee ID in the salary structures
              const employeeIdStr = String(emp.id);
              
              if (result.employeeSalaryStructures[employeeIdStr]) {
                const employeeSalaryData = result.employeeSalaryStructures[employeeIdStr];
                
                console.log(`Employee ${emp.id} (${emp.first_name} ${emp.last_name}) existing salary data:`, employeeSalaryData); // Debug log
                
                // Populate payrollValues with existing data where payroll IDs match
                Object.entries(employeeSalaryData).forEach(([payrollId, amount]) => {
                  const payrollIdNum = parseInt(payrollId);
                  
                  // Check if this payroll ID exists in our payroll types
                  const payrollTypeExists = result.payrollTypes.some((pt: PayrollType) => pt.id === payrollIdNum);
                  
                  if (!isNaN(payrollIdNum) && payrollTypeExists) {
                    payrollValues[payrollIdNum] = Number(amount) || 0;
                    console.log(`  - Payroll ID ${payrollIdNum}: ${amount}`); // Debug log
                  }
                });
              } else {
                console.log(`No existing salary data found for employee ${emp.id}`); // Debug log
              }
            }

            // Calculate gross total based on actual values
            const grossTotal = result.payrollTypes.reduce((sum: number, pt: PayrollType) => {
              const val = Number(payrollValues[pt.id]) || 0;
              if (pt.payroll_type === 1) return sum + val;
              if (pt.payroll_type === 2) return sum - val;
              return sum;
            }, 0);

            console.log(`Employee ${emp.id} final payroll values:`, payrollValues); // Debug log

            return {
              srNo: idx + 1,
              empNo: emp.employee_no || emp.id,
              empName: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
              department: emp.department || "",
              gender: emp.gender || "",
              status: emp.status === 1 ? "Active" : "Inactive",
              payrollValues,
              grossTotal,
              employeeId: emp.id,
            };
          }
        );

        setData(mappedData);
        setFilteredData(mappedData);
      } else {
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------ SUBMIT SALARY STRUCTURE ------------------
  const handleSubmitSalaryStructure = async () => {
    if (data.length === 0) {
      alert("No data to submit!");
      return;
    }

    setSubmitting(true);
    try {
      const year = date?.getFullYear() || new Date().getFullYear();
      
      console.log('Submitting data for employees:', data.map(emp => ({
        employeeId: emp.employeeId,
        empName: emp.empName,
        payrollValues: emp.payrollValues
      })));

      // FORMAT 1: Exact match to your API example structure
      try {
        console.log('Trying Format 1 (Exact API structure)...');
        
        const formData = new FormData();
        formData.append('token', sessionData.token);
        formData.append('type', 'API');
        formData.append('sub_institute_id', sessionData.subInstituteId);
        formData.append('syear', String(year));

        // Add employee IDs
        data.forEach((employee, index) => {
          if (employee.employeeId) {
            formData.append(`employee_id[${index}]`, String(employee.employeeId));
          }
        });

        // Add departments
        selectedDepartments.forEach((dept, index) => {
          formData.append(`department_id[${index}]`, dept);
        });

        // Add employee data in the EXACT format from your API example
        data.forEach((employee, empIndex) => {
          if (employee.employeeId) {
            // emp[1][0] = "F" (gender) - using actual employee ID instead of index
            formData.append(`emp[${employee.employeeId}][0]`, employee.gender || '');
            
            // Add payroll data for each payroll type
            payrollTypes.forEach((payrollType) => {
              const value = employee.payrollValues[payrollType.id] || 0;
              
              // emp[1][6][0] = "6" (payroll id)
              formData.append(`emp[${employee.employeeId}][${payrollType.id}][0]`, String(payrollType.id));
              
              // emp[1][6][1] = "200" (amount)
              formData.append(`emp[${employee.employeeId}][${payrollType.id}][1]`, String(value));
              
              // emp[1][6][2] = "test" (payroll name)
              formData.append(`emp[${employee.employeeId}][${payrollType.id}][2]`, payrollType.payroll_name);
              
              // emp[1][6][3] = "1" (payroll type)
              formData.append(`emp[${employee.employeeId}][${payrollType.id}][3]`, String(payrollType.payroll_type));
            });
          }
        });

        console.log('Format 1 FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        const response = await fetch(`${sessionData.url}/employee-salary-structure/store`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        console.log('Format 1 response:', result);

        if (response.ok && result.status === "1") {
          alert("Salary structure submitted successfully!");
          return;
        } else {
          throw new Error(result.message || 'Format 1 failed');
        }
      } catch (error) {
        console.log('Format 1 error:', error);
        
        // FORMAT 2: Simplified version without extra metadata
        try {
          console.log('Trying Format 2 (Simplified structure)...');
          
          const formData = new FormData();
          formData.append('token', sessionData.token);
          formData.append('type', 'API');
          formData.append('sub_institute_id', sessionData.subInstituteId);
          formData.append('syear', String(year));

          // Add employee IDs
          data.forEach((employee, index) => {
            if (employee.employeeId) {
              formData.append(`employee_id[${index}]`, String(employee.employeeId));
            }
          });

          // Add departments
          selectedDepartments.forEach((dept, index) => {
            formData.append(`department_id[${index}]`, dept);
          });

          // Simplified: Only send the amount values
          data.forEach((employee) => {
            if (employee.employeeId) {
              Object.entries(employee.payrollValues).forEach(([payrollId, value]) => {
                formData.append(`emp[${employee.employeeId}][${payrollId}]`, String(value));
              });
            }
          });

          console.log('Format 2 FormData entries:');
          for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
          }

          const response = await fetch(`${sessionData.url}/employee-salary-structure/store`, {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          console.log('Format 2 response:', result);

          if (response.ok && result.status === "1") {
            alert("Salary structure submitted successfully!");
            return;
          } else {
            throw new Error(result.message || 'Format 2 failed');
          }
        } catch (error2) {
          console.log('Format 2 error:', error2);
          throw new Error(`Both formats failed. Last error: ${error2}`);
        }
      }

    } catch (error) {
      console.error("Error submitting salary structure:", error);
      alert(`Error submitting salary structure: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the browser console for details and contact support.`);
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------ EXPORTS ------------------
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary Structure");
    XLSX.writeFile(wb, "salary-structure.xlsx");
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "salary-structure.csv");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Employee Salary Structure Report", 14, 16);
    
    const headers = ["Sr No.", "Emp No", "Employee Name", "Department", "Gender", "Status"];
    
    payrollTypes.forEach((pt) => {
      const indicator = pt.payroll_type === 1 ? "+1" : pt.payroll_type === 2 ? "-1" : "";
      headers.push(`${pt.payroll_name} ${indicator}`);
    });
    
    headers.push("Gross Total");

    autoTable(doc, {
      head: [headers],
      body: data.map((row) => {
        const rowData = [
          row.srNo,
          row.empNo,
          row.empName,
          row.department,
          row.gender,
          row.status,
        ];
        
        payrollTypes.forEach((pt) => {
          rowData.push(Number(row.payrollValues[pt.id] || 0).toLocaleString());
        });
        
        rowData.push(row.grossTotal.toLocaleString());
        return rowData;
      }),
      startY: 20,
    });
    doc.save("salary-structure.pdf");
  };

  // ------------------ DATATABLE COLUMNS ------------------
  const baseColumns: TableColumn<SalaryData>[] = [
    { 
      name: (
        <div>
          <div>Sr No.</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("srNo", e.target.value)}
            className="w-full p-1 border rounded text-sm mt-1"
          />
        </div>
      ), 
      selector: (row) => row.srNo, 
      sortable: true, 
      width: "100px" 
    },
    { 
      name: (
        <div>
          <div>Emp No</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("empNo", e.target.value)}
            className="w-full p-1 border rounded text-sm mt-1"
          />
        </div>
      ), 
      selector: (row) => row.empNo, 
      sortable: true, 
      width: "120px" 
    },
    { 
      name: (
        <div>
          <div>Employee Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("empName", e.target.value)}
            className="w-full p-1 border rounded text-sm mt-1"
          />
        </div>
      ), 
      selector: (row) => row.empName, 
      sortable: true, 
      wrap: true 
    },
    { 
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("department", e.target.value)}
            className="w-full p-1 border rounded text-sm mt-1"
          />
        </div>
      ), 
      selector: (row) => row.department, 
      sortable: true, 
      wrap: true 
    },
    { 
      name: (
        <div>
          <div>Gender</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("gender", e.target.value)}
            className="w-full p-1 border rounded text-sm mt-1"
          />
        </div>
      ), 
      selector: (row) => row.gender, 
      sortable: true, 
      width: "100px" 
    },
    { 
      name: (
        <div>
          <div>Status</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("status", e.target.value)}
            className="w-full p-1 border rounded text-sm mt-1"
          />
        </div>
      ), 
      selector: (row) => row.status, 
      sortable: true, 
      width: "120px" 
    },
  ];

  const payrollColumns: TableColumn<SalaryData>[] = payrollTypes.map((pt) => {
    const indicator = pt.payroll_type === 1 ? "+1" : pt.payroll_type === 2 ? "-1" : "";
    
    return {
      name: (
        <div className="text-center">
          <div>{pt.payroll_name}</div>
          <div className="text-xs text-gray-500">{indicator}</div>
        </div>
      ),
      cell: (row, rowIndex) => (
        <EditableInput
          value={row.payrollValues[pt.id] || 0}
          onChange={(value) => handlePayrollChange(rowIndex, pt.id, value)}
        />
      ),
      sortable: true,
      width: "130px",
      center: true,
    };
  });

  const grossColumn: TableColumn<SalaryData> = {
    name: "Gross Total",
    selector: (row) => row.grossTotal,
    sortable: true,
    width: "150px",
  };

  const columns = [...baseColumns, ...payrollColumns, grossColumn];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "center",
        fontWeight: "bold",
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
      style: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Salary Structure Management</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex-1">
          <label className="block font-semibold mb-2">Select Department</label>
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

        <div className="flex flex-col sm:flex-row gap-4 items-start w-full lg:w-auto">
          <div className="flex flex-col w-full sm:w-48 mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Status
            </label>
            <select
              value={employeeStatus}
              onChange={(e) => setEmployeeStatus(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <Button
            onClick={fetchData}
            disabled={loading}
            className="px-6 py-2 rounded-lg flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-14"
          >
            <Search className="w-5 h-5 mr-2 text-black" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Export buttons */}
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
          PDF
        </Button>
        <Button
          onClick={exportToExcel}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
        >
          Excel
        </Button>
        <Button
          onClick={exportToCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
        >
          CSV
        </Button>
      </div>

      {/* Table */}
      <div>
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold">Employee Salary Structure</h2>
          <p className="text-sm text-gray-600">
            Existing salary values will be loaded automatically. You can edit them as needed.
          </p>
        </div>
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
              {userHasSearched ? "No data found" : "Click Search to load data"}
            </div>
          }
          persistTableHead
        />
        
        {/* Submit Button below DataTable */}
        {data.length > 0 && (
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSubmitSalaryStructure}
              disabled={submitting}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Salary Structure"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryStructure;