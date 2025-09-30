"use client";

import { useState, useEffect } from "react";
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

type PayrollType = {
  id: number;
  payroll_type: number;
  payroll_name: string;
  amount_type: number;
  status: number;
  sort_order: number;
  sub_institute_id: number;
  payroll_percentage: number | null;
  day_count: string;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export default function PayrollDeductionsPage() {
  const [deductionType, setDeductionType] = useState("Allowance");
  const [payrollName, setPayrollName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollTypes, setPayrollTypes] = useState<PayrollType[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedPayrollType, setSelectedPayrollType] = useState<PayrollType | null>(null);
  const [payrollTypeValue, setPayrollTypeValue] = useState<number>(9);


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

  // Fetch payroll types based on deduction type
  useEffect(() => {
    const fetchPayrollTypes = async () => {
      try {
        setLoading(true);
        // Convert deduction type to payroll_type value
        const payrollTypeValue = deductionType === "Allowance" ? 1 : 2;

        const response = await fetch(
          `${sessionData.url}/table_data?table=payroll_types&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[status]=1&filters[payroll_type]=${payrollTypeValue}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data); // Debug log

          // If data is directly an array, use it directly
          if (Array.isArray(data)) {
            setPayrollTypes(data);
            // Set default payroll name if available
            if (data.length > 0) {
              setPayrollName(data[0].payroll_name);
              setSelectedPayrollType(data[0]);
            } else {
              setPayrollName("");
              setSelectedPayrollType(null);
            }
          }
          // If data has a data property that's an array
          else if (data.data && Array.isArray(data.data)) {
            setPayrollTypes(data.data);
            if (data.data.length > 0) {
              setPayrollName(data.data[0].payroll_name);
              setSelectedPayrollType(data.data[0]);
            } else {
              setPayrollName("");
              setSelectedPayrollType(null);
            }
          }
          // If no data found
          else {
            console.warn("Unexpected API response format:", data);
            setPayrollTypes([]);
            setPayrollName("");
            setSelectedPayrollType(null);
          }
        } else {
          console.error("Failed to fetch payroll types");
          setPayrollTypes([]);
          setPayrollName("");
          setSelectedPayrollType(null);
        }
      } catch (error) {
        console.error("Error fetching payroll types:", error);
        setPayrollTypes([]);
        setPayrollName("");
        setSelectedPayrollType(null);
      } finally {
        setLoading(false);
      }
    };

    if (sessionData.url) {
      fetchPayrollTypes();
    }
  }, [deductionType, sessionData.url, sessionData.subInstituteId]);

  // Handle payroll name change
  // Update your handlePayrollNameChange function
  const handlePayrollNameChange = (value: string) => {
    setPayrollName(value);
    console.log('payName', value);
    const selected = payrollTypes.find(type => type.payroll_name === value);
    setSelectedPayrollType(selected || null);
    if (selected) {
      setPayrollTypeValue(selected.id); // Set the actual payroll type ID
    }
  };

  // Search function - Preserve existing deduction amounts
// Search function - Preserve existing deduction amounts and use deductionArr from API
// Search function - Clear existing data and show fresh results
const handleSearch = async () => {
  if (!payrollName) {
    alert("Please select a payroll name first");
    return;
  }

  setLoading(true);
  try {
    // Convert deduction type to API value
    const deductionTypeValue = deductionType === "Allowance" ? 1 : 2;
    
    // Build API URL with parameters
    const apiUrl = new URL(`${sessionData.url}/payroll-deduction`);
    apiUrl.searchParams.append('type', 'API');
    apiUrl.searchParams.append('token', sessionData.token);
    apiUrl.searchParams.append('sub_institute_id', sessionData.subInstituteId);
    apiUrl.searchParams.append('status', '1');
    apiUrl.searchParams.append('deduction_type', payrollTypeValue.toString());
    apiUrl.searchParams.append('month', month);
    apiUrl.searchParams.append('year', year);
    apiUrl.searchParams.append('submit', 'Search');

    console.log("Search API URL:", apiUrl.toString());

    const response = await fetch(apiUrl.toString());
    
    if (response.ok) {
      const data = await response.json();
      console.log("Search API Response:", data);

      // Extract deductionArr from API response
      const deductionArr = data.deductionArr || {};
      console.log("Deduction Array from API:", deductionArr);

      let newEmployees: Employee[] = [];

      // Handle the response with all_emp array
      if (data.all_emp && Array.isArray(data.all_emp)) {
        newEmployees = data.all_emp.map((item: any, index: number) => {
          const employeeCode = item.employee_no || "N/A";
          const employeeId = item.id || index + 1;
          
          // Get amount from deductionArr using employee ID
          const apiAmount = deductionArr[employeeId] ? deductionArr[employeeId].toString() : "";
          
          return {
            id: employeeId,
            employeeCode: employeeCode,
            employeeName: `${item.first_name || ""} ${item.middle_name || ""} ${item.last_name || ""}`.trim(),
            department: item.department || "N/A",
            deductionAmount: apiAmount || "", // Always use API data for fresh search
          };
        });
      }
      // Fallback: if data is directly an array
      else if (Array.isArray(data)) {
        newEmployees = data.map((item: any, index: number) => {
          const employeeCode = item.employee_no || item.employeeCode || "N/A";
          const employeeId = item.id || index + 1;
          const apiAmount = deductionArr[employeeId] ? deductionArr[employeeId].toString() : "";

          return {
            id: employeeId,
            employeeCode: employeeCode,
            employeeName: `${item.first_name || ""} ${item.middle_name || ""} ${item.last_name || ""}`.trim() || item.employeeName || "N/A",
            department: item.department || "N/A",
            deductionAmount: apiAmount || "",
          };
        });
      }
      // Fallback: if data has a data property that's an array
      else if (data.data && Array.isArray(data.data)) {
        newEmployees = data.data.map((item: any, index: number) => {
          const employeeCode = item.employee_no || item.employeeCode || "N/A";
          const employeeId = item.id || index + 1;
          const apiAmount = deductionArr[employeeId] ? deductionArr[employeeId].toString() : "";

          return {
            id: employeeId,
            employeeCode: employeeCode,
            employeeName: `${item.first_name || ""} ${item.middle_name || ""} ${item.last_name || ""}`.trim() || item.employeeName || "N/A",
            department: item.department || "N/A",
            deductionAmount: apiAmount || "",
          };
        });
      }
      else {
        console.warn("Unexpected search API response format:", data);
        newEmployees = [];
      }
      
      // Clear existing employees and set fresh data
      setEmployees(newEmployees);
      setSearched(true);
      console.log("Fresh employee data loaded:", newEmployees);
    } else {
      console.error("Failed to fetch employee data");
      // Clear employees on error to show fresh state
      setEmployees([]);
    }
  } catch (error) {
    console.error("Error searching employees:", error);
    // Clear employees on error to show fresh state
    setEmployees([]);
  } finally {
    setLoading(false);
  }
};
  // Submit function to send data to store API
  const handleSubmit = async () => {
    if (employees.length === 0) {
      alert("No employee data to submit");
      return;
    }

    if (!selectedPayrollType) {
      alert("Please select a payroll type");
      return;
    }

    // Check if at least one employee has deduction amount filled
    const hasAmounts = employees.some(emp => emp.deductionAmount && emp.deductionAmount !== '');
    if (!hasAmounts) {
      alert("Please enter deduction amounts for at least one employee");
      return;
    }

    setSubmitLoading(true);

    try {
      const deductionTypeValue = deductionType === "Allowance" ? 1 : 2;

      // Build API URL with parameters - pass month in capital letters as selected
      const apiUrl = new URL(`${sessionData.url}/payroll-deduction/store`);
      apiUrl.searchParams.append('type', 'API');
      apiUrl.searchParams.append('token', sessionData.token);
      apiUrl.searchParams.append('sub_institute_id', sessionData.subInstituteId);
      apiUrl.searchParams.append('deduction_type_id', deductionTypeValue.toString());
      apiUrl.searchParams.append('payroll_type', selectedPayrollType.id.toString());
      apiUrl.searchParams.append('month', month); // Pass month in capital letters as selected
      apiUrl.searchParams.append('year', year);

      // Add deduction amounts for each employee
      employees.forEach(emp => {
        if (emp.deductionAmount && emp.deductionAmount !== '') {
          apiUrl.searchParams.append(`deductAmt[${emp.id}]`, emp.deductionAmount);
        }
      });

      console.log("Submit API URL:", apiUrl.toString());
      console.log("Data being submitted:", {
        employees: employees.filter(emp => emp.deductionAmount && emp.deductionAmount !== ''),
        payrollType: selectedPayrollType.payroll_name,
        deductionType,
        month: month, // Log the month being passed (in capital)
        year
      });

      const response = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Submit API Response:", result);

        // Show success alert
        alert("✅ Data submitted successfully!");

        // Clear deduction amounts after successful submission
        // setEmployees(prev => prev.map(emp => ({...emp, deductionAmount: ""})));

      } else {
        const errorResult = await response.json().catch(() => null);
        console.error("Failed to submit data:", errorResult);
        alert("❌ Failed to submit data. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("❌ Error submitting data. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Submit function to send data to store API
  // Submit function to send data to store API
  // const handleSubmit = async () => {
  //   if (employees.length === 0) {
  //     alert("No employee data to submit");
  //     return;
  //   }

  //   if (!selectedPayrollType) {
  //     alert("Please select a payroll type");
  //     return;
  //   }

  //   // Check if at least one employee has deduction amount filled
  //   const hasAmounts = employees.some(emp => emp.deductionAmount && emp.deductionAmount !== '');
  //   if (!hasAmounts) {
  //     alert("Please enter deduction amounts for at least one employee");
  //     return;
  //   }

  //   setSubmitLoading(true);

  //   try {
  //     const deductionTypeValue = deductionType === "Allowance" ? 1 : 2;

  //     // Build API URL with parameters - pass month name as is (in lowercase)
  //     const apiUrl = new URL(`${sessionData.url}/payroll-deduction/store`);
  //     apiUrl.searchParams.append('type', 'API');
  //     apiUrl.searchParams.append('token', sessionData.token);
  //     apiUrl.searchParams.append('sub_institute_id', sessionData.subInstituteId);
  //     apiUrl.searchParams.append('deduction_type_id', deductionTypeValue.toString());
  //     apiUrl.searchParams.append('payroll_type', selectedPayrollType.id.toString());
  //     apiUrl.searchParams.append('month', month.toLowerCase()); // Pass month name directly
  //     apiUrl.searchParams.append('year', year);

  //     // Add deduction amounts for each employee
  //     employees.forEach(emp => {
  //       if (emp.deductionAmount && emp.deductionAmount !== '') {
  //         apiUrl.searchParams.append(`deductAmt[${emp.id}]`, emp.deductionAmount);
  //       }
  //     });

  //     console.log("Submit API URL:", apiUrl.toString());
  //     console.log("Data being submitted:", {
  //       employees: employees.filter(emp => emp.deductionAmount && emp.deductionAmount !== ''),
  //       payrollType: selectedPayrollType.payroll_name,
  //       deductionType,
  //       month: month.toLowerCase(), // Log the month name being passed
  //       year
  //     });

  //     const response = await fetch(apiUrl.toString(), {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       console.log("Submit API Response:", result);

  //       // Show success alert
  //       alert("✅ Data submitted successfully!");

  //       // Clear deduction amounts after successful submission
  //       // setEmployees(prev => prev.map(emp => ({...emp, deductionAmount: ""})));

  //     } else {
  //       const errorResult = await response.json().catch(() => null);
  //       console.error("Failed to submit data:", errorResult);
  //       alert("❌ Failed to submit data. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting data:", error);
  //     alert("❌ Error submitting data. Please try again.");
  //   } finally {
  //     setSubmitLoading(false);
  //   }
  // };

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
      width: "165px",
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
      width: "250px",
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
      width: "250px",
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
      width: "250px",
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
          placeholder="Enter amount"
        />
      ),
      selector: (row) => row.deductionAmount,
      sortable: true,
      width: "262px",
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
          <Select
            value={payrollName}
            onValueChange={handlePayrollNameChange}
            disabled={payrollTypes.length === 0 || loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                loading ? "Loading..." :
                  payrollTypes.length === 0 ? "No options" : "Select Payroll Name"
              } />
            </SelectTrigger>
            <SelectContent>
              {payrollTypes.map((type) => (
                <SelectItem key={type.id} value={type.payroll_name}>
                  {type.payroll_name}
                </SelectItem>
              ))}
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
          <Button
            onClick={handleSearch}
            disabled={loading || payrollTypes.length === 0}
            className="px-6 py-2 rounded-lg flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-8"
          >
            <Search className="w-5 h-5 mr-2 text-black" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
     


      {/* Action Buttons - Submit button on the right side */}
      {searched && (
        <div className="flex gap-3 flex-wrap justify-end mb-4">
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

          {/* Submit Button below table */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitLoading || employees.length === 0}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            >
              {submitLoading ? "Submitting..." : "Submit Data"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}