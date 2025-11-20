"use client";

import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
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
  amount: string;
  deductionAmount: string;
};

type EmployeeTableData = Employee & {
  srNo: number;
};

type ApiEmployee = {
  id: number;
  employee_no: string | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  department: string;
  department_id: number;
  amount: string;
  deduction_amount?: string;
};

type PayrollType = {
  id: number;
  payroll_name: string;
};

type PayrollTypesResponse = {
  [key: string]: PayrollType[];
};

export default function PayrollDeductionsPage() {
  const [deductionType, setDeductionType] = useState("Allowance");
  const [payrollName, setPayrollName] = useState("");
  const [month, setMonth] = useState("Aug");
  const [year, setYear] = useState("2025");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollTypes, setPayrollTypes] = useState<PayrollTypesResponse>({});
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // Store all user entered amounts (both submitted and unsaved)
  const [userEnteredAmounts, setUserEnteredAmounts] = useState<Record<string, Record<number, string>>>({});

  // ✅ Load session data from localStorage
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

  // Fetch payroll types on component mount
  useEffect(() => {
    fetchPayrollTypes();
  }, [sessionData.url]);

  // Fetch payroll types from API
  const fetchPayrollTypes = async () => {
    try {
      if (!sessionData.url || !sessionData.token) return;

      // Build URL dynamically based on deductionType
      const deductionTypeId =
        deductionType === "Allowance"
          ? "1"
          : deductionType === "Deduction"
          ? "2"
          : "";

      const url = `${sessionData.url}/payroll-deduction?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&status=1${deductionTypeId ? `&deduction_type=${deductionTypeId}` : ""}&month=${month}&year=${year}&submit=Search`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.payrollTypes) {
        setPayrollTypes(data.payrollTypes);

        const defaultList = data.payrollTypes["1"] || []; // Allowance = "1"
        if (defaultList.length > 0) {
          setPayrollName(defaultList[0].payroll_name);
        }
      }
    } catch (error) {
      console.error("Error fetching payroll types:", error);
    }
  };

  // 🔄 Update payrollName whenever deductionType changes
  useEffect(() => {
    if (payrollTypes) {
      const list =
        deductionType === "Allowance"
          ? payrollTypes["1"] || []
          : payrollTypes["2"] || [];
      if (list.length > 0) {
        setPayrollName(list[0].payroll_name);
      } else {
        setPayrollName("");
      }
    }
  }, [deductionType, payrollTypes]);

  // Generate unique key for current payroll type, month and year combination
  const getCurrentKey = () => {
    return `${payrollName}-${month}-${year}`;
  };

  // Fetch employees from API
  const handleSearch = async () => {
    setLoading(true);
    try {
      const selectedList =
        deductionType === "Allowance"
          ? payrollTypes["1"] || []
          : payrollTypes["2"] || [];

      const selectedPayrollType = selectedList.find(
        (pt) => pt.payroll_name === payrollName
      );
      const deductionTypeId = selectedPayrollType?.id;

      const url = `${sessionData.url}/payroll-deduction?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&status=1&deduction_type=${deductionTypeId}&month=${month}&year=${year}&submit=Search`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.all_emp && Array.isArray(data.all_emp)) {
        const currentKey = getCurrentKey();
        const currentUserAmounts = userEnteredAmounts[currentKey] || {};

        const formattedEmployees: Employee[] = data.all_emp.map(
          (emp: ApiEmployee, index: number) => {
            // Check if user has entered amount for this employee in current combination
            const userEnteredAmount = currentUserAmounts[emp.id];
            
            // Priority: User entered amount > API deduction_amount > API amount
            const displayAmount = userEnteredAmount || 
              (emp.deduction_amount && emp.deduction_amount !== "0" 
                ? emp.deduction_amount 
                : emp.amount || "0");

            return {
              id: emp.id,
              employeeCode: emp.employee_no || `EMP${emp.id}`,
              employeeName: `${emp.first_name} ${
                emp.middle_name !== "-" ? emp.middle_name + " " : ""
              }${emp.last_name}`.trim(),
              department: emp.department || "-",
              amount: displayAmount,
              deductionAmount: emp.deduction_amount || "0",
            };
          }
        );
        setEmployees(formattedEmployees);
      } else {
        console.error("Invalid API response structure:", data);
        setEmployees([]);
      }

      setSearched(true);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      alert("Error fetching employee data. Please try again.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Update Deduction Amount
  const handleChange = (id: number, value: string) => {
    const currentKey = getCurrentKey();
    
    // Update user entered amounts for current payroll type, month, year combination
    setUserEnteredAmounts(prev => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        [id]: value
      }
    }));

    // Update employees state to show immediate change in UI
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, amount: value } : emp))
    );
  };

  // Submit Data to API using POST method
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const selectedList =
        deductionType === "Allowance"
          ? payrollTypes["1"] || []
          : payrollTypes["2"] || [];

      const selectedPayrollType = selectedList.find(
        (pt) => pt.payroll_name === payrollName
      );
      const deductionTypeId = selectedPayrollType?.id || 9;

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthNumber = monthNames.indexOf(month) + 1;

      const formData = new FormData();
      formData.append("type", "API");
      formData.append("token", sessionData.token);
      formData.append("sub_institute_id", sessionData.subInstituteId);
      formData.append("deduction_type_id", deductionTypeId.toString());
      formData.append("payroll_type", deductionType === "Allowance" ? "1" : "2");
      formData.append("month", monthNumber.toString());
      formData.append("year", year);

      employees.forEach((emp) => {
        if (emp.amount && emp.amount !== "0") {
          formData.append(`deductAmt[${emp.id}]`, emp.amount);
        }
      });

      const response = await fetch(
        `${sessionData.url}/payroll-deduction/store`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (
        result.success ||
        result.message?.includes("success") ||
        result.message?.includes("added")
      ) {
        alert("✅ Data submitted successfully!");
        
        // After successful submission, the amounts are already stored in userEnteredAmounts
        // So they will persist automatically
      } else {
        alert(`✅ ${result.message || "Data submitted successfully!"}`);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("❌ Error submitting data. Please check console for details.");
    } finally {
      setSubmitting(false);
    }
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
      const rowValue = String(row[key as keyof EmployeeTableData] || "").toLowerCase();
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
      width: "160px",
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
      width: "240px",
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
            className="w-full text-xs p-1 mt-1"
          />
        </div>
      ),
      selector: (row) => row.department,
      sortable: true,
      width: "260px",
    },
    {
      name: (
        <div>
          <div>{`${payrollName} Amount`}</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("amount", e.target.value)}
            className="w-full text-xs p-1 mt-1"
          />
        </div>
      ),
      cell: (row) => (
        <input
          type="number"
          value={row.amount}
          onChange={(e) => handleChange(row.id, e.target.value)}
          className="p-1 w-full text-center border border-gray-300 rounded"
        />
      ),
      selector: (row) => row.amount,
      sortable: true,
      width: "260px",
    },
  ];

  // DataTable Styles
  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        fontWeight: "bold",
      },
    },
  };

  // Export Functions
  const exportToExcel = () => {
    const exportData = filteredData.map((row) => ({
      "Sr No": row.srNo,
      "Employee Code": row.employeeCode,
      "Employee Name": row.employeeName,
      Department: row.department,
      "Deduction Amount (API)": row.deductionAmount,
      [`${payrollName} Amount`]: row.amount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Deductions");
    XLSX.writeFile(wb, `payroll-${payrollName.toLowerCase()}-deductions.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Payroll ${payrollName} Deduction Report`, 14, 15);
    (doc as any).autoTable({
      startY: 25,
      head: [
        [
          "Sr No",
          "Employee Code",
          "Employee Name",
          "Department",
          "Deduction Amount (API)",
          `${payrollName} Amount`,
        ],
      ],
      body: filteredData.map((row) => [
        row.srNo,
        row.employeeCode,
        row.employeeName,
        row.department,
        row.deductionAmount,
        row.amount,
      ]),
    });
    doc.save(`payroll-${payrollName.toLowerCase()}-deductions.pdf`);
  };

  // Years dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2000 + 11 }, (_, i) => 2000 + i);

  return (
    <div className="p-6 bg-background rounded-xl min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Payroll Deduction Management</h1>

      {/* Filters */}
      <div className="grid grid-cols-5 gap-4 items-end mb-6">
        {/* Deduction Type */}
        <div>
          <Label>Deduction Type</Label>
          <Select value={deductionType} onValueChange={setDeductionType}>
            <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue placeholder="Select Payroll Name" />
            </SelectTrigger>
            <SelectContent>
              {(deductionType === "Allowance"
                ? payrollTypes["1"] || []
                : payrollTypes["2"] || []
              ).map((type) => (
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
            <SelectTrigger>
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
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
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
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
            disabled={loading}
            className="mt-8 bg-gray-200 text-black hover:bg-gray-300 w-full"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      {searched && (
        <div className="flex gap-3 flex-wrap justify-end mb-4">
          <Button
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Printer className="w-5 h-5" />
          </Button>
          <Button
            onClick={exportToPDF}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            PDF
          </Button>
          <Button
            onClick={exportToExcel}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Excel
          </Button>
        </div>
      )}

      {/* DataTable */}
      {searched && (
        <div className="mt-6">
          <h1 className="text-xl font-bold mb-4">
            Payroll Deduction - {payrollName}
          </h1>
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

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSubmit}
              disabled={submitting || employees.length === 0}
              className="px-8 py-2 bg-green-600 text-white hover:bg-green-700 text-lg font-semibold"
            >
              {submitting ? "Submitting..." : "Submit Data"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}