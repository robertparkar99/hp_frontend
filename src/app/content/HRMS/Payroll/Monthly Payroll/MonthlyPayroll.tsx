// "use client";

// import { useState } from "react";
// import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
// import EmployeeSelector from "../../../User-Attendance/components/EmployeeSelector";
// import { Employee } from "../../../User-Attendance/types/attendance";
// import { Button } from "@/components/ui/button";
// import { Search, FileSpreadsheet, Table, Printer } from "lucide-react";

// type EmployeeData = {
//   id: number;
//   employeeCode: string;
//   employeeName: string;
//   department: string;
//   totalDays: string;
//   basic: number;
//   gradePay: number;
//   da: number;
//   hra: number;
//   otherAllowance: number;
//   extraAllowance: number;
//   leaveEncash: number;
//   arrear: number;
//   pf: number;
//   pt: number;
// };

// type EmployeeTableData = Employee & { srNo: number };

// export default function MonthlyPayrollPage() {

//    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
//     const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
//   const [month, setMonth] = useState("Aug");
//   const [year, setYear] = useState("2025");
//   const [searched, setSearched] = useState(false);
//   const [loading, setLoading] = useState(false);
//     const [employeeStatus, setEmployeeStatus] = useState<string>('Active');

//   const [tableData, setTableData] = useState<EmployeeTableData[]>([]);

//    const fetchData = async () => {
//     setUserHasSearched(true);
//     setLoading(true);

//     // Simulate API call delay
//     setTimeout(() => {
//       // Filter data based on employee status
//       let filteredData = sampleSalaryData;
//       if (employeeStatus !== 'All') {
//         filteredData = sampleSalaryData.filter(emp => emp.status === employeeStatus);
//       }
//       setData(filteredData);
//       setFilteredData(filteredData);
//       setLoading(false);
//     }, 1000);
//   };
//   const handleSearch = () => {
//     setLoading(true);
//     setTimeout(() => {
//       const mockData: EmployeeData[] = [
//         {
//           id: 1,
//           employeeCode: "433",
//           employeeName: "Admin MM User",
//           department: "Accounts Department",
//           totalDays: "0",
//           basic: 0,
//           gradePay: 0,
//           da: 0,
//           hra: 0,
//           otherAllowance: 0,
//           extraAllowance: 0,
//           leaveEncash: 0,
//           arrear: 0,
//           pf: 0,
//           pt: 0,
//         },
//         {
//           id: 2,
//           employeeCode: "419",
//           employeeName: "admin admin admin",
//           department: "-",
//           totalDays: "0",
//           basic: 0,
//           gradePay: 0,
//           da: 0,
//           hra: 0,
//           otherAllowance: 0,
//           extraAllowance: 0,
//           leaveEncash: 0,
//           arrear: 0,
//           pf: 0,
//           pt: 0,
//         },
//       ];
//       setTableData(mockData.map((emp, i) => ({ ...emp, srNo: i + 1 })));
//       setSearched(true);
//       setLoading(false);
//     }, 500);
//   };

//   const handleChangeTotalDays = (id: number, value: string) => {
//     setTableData((prev) =>
//       prev.map((emp) =>
//         emp.id === id ? { ...emp, totalDays: value } : emp
//       )
//     );
//   };

//   const columns: TableColumn<EmployeeTableData>[] = [
//     { name: "Sr No", selector: (row) => row.srNo, width: "80px" },
//     { name: "Emp No", selector: (row) => row.employeeCode, width: "100px" },
//     { name: "Employee Name", selector: (row) => row.employeeName, width: "200px" },
//     { name: "Department", selector: (row) => row.department, width: "200px" },
//     {
//       name: "Total Days",
//       cell: (row) => (
//         <input
//           type="number"
//           value={row.totalDays}
//           onChange={(e) => handleChangeTotalDays(row.id, e.target.value)}
//           className="border rounded p-1 w-16 text-center"
//         />
//       ),
//       width: "120px",
//     },
//     { name: "CL Encash", selector: (row) => row.leaveEncash, width: "120px" },
//     { name: "BASIC", selector: (row) => row.basic, width: "120px" },
//     { name: "GRADE PAY", selector: (row) => row.gradePay, width: "120px" },
//     { name: "DA", selector: (row) => row.da, width: "120px" },
//     { name: "HRA", selector: (row) => row.hra, width: "120px" },
//     { name: "OTHER ALLOW.", selector: (row) => row.otherAllowance, width: "140px" },
//     { name: "Extra Allow.", selector: (row) => row.extraAllowance, width: "140px" },
//     { name: "Leave Encash", selector: (row) => row.leaveEncash, width: "140px" },
//     { name: "Arrears", selector: (row) => row.arrear, width: "120px" },
//     { name: "PF", selector: (row) => row.pf, width: "100px" },
//     { name: "PT", selector: (row) => row.pt, width: "100px" },
//   ];

//   const customStyles: TableStyles = {
//     headCells: {
//       style: {
//         fontSize: "14px",
//         backgroundColor: "#D1E7FF",
//         color: "black",
//         textAlign: "left",
//       },
//     },
//     cells: {
//       style: { fontSize: "13px", padding: "8px" },
//     },
//   };

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: currentYear - 2000 + 11 }, (_, i) => 2000 + i);

//   return (
//     <div className="p-6">
//       {/* Filters */}
//       <div className="flex flex-col lg:flex-row gap-6 w-full">
//             {/* Department Selector - Takes majority space */}
//             <div className="flex-1">
//               <label className="block font-semibold mb-2">Select Department</label>
//               <EmployeeSelector
//                 multiSelect
//                 empMultiSelect
//                 selectedDepartment={selectedDepartments}
//                 onSelectDepartment={setSelectedDepartments}
//                 selectedEmployee={selectedEmployees}
//                 onSelectEmployee={setSelectedEmployees}
//                 className="w-full"
//               />
//             </div>

//             {/* Status and Search - Side by side on desktop, stacked on mobile */}
//             <div className="flex flex-col sm:flex-row gap-4 items-start w-full lg:w-auto">
//               <div className="flex flex-col w-full sm:w-48 mt-8">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Employee Status</label>
//                 <select
//                   value={employeeStatus}
//                   onChange={(e) => setEmployeeStatus(e.target.value)}
//                   className="border p-2 rounded w-full"
//                 >
//                   <option value="All">All Status</option>
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>

//                 </select>
//               </div>

//               <Button
//                 onClick={fetchData}
//                 disabled={loading}
//                 className="px-6 py-2 rounded-lg font-bold flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-14"
//               >
//                 <Search className="w-5 h-5 mr-2 text-black" />
//                 {loading ? "Searching..." : "Search"}
//               </Button>
//             </div>
//           </div>

//       {/* Table */}
//       {searched && (
//         <div>
//           <h1 className="text-xl font-bold mb-4">Monthly Payroll</h1>
//           <DataTable
//             columns={columns}
//             data={tableData}
//             customStyles={customStyles}
//             pagination
//             highlightOnHover
//             progressPending={loading}
//             persistTableHead
//           />
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import EmployeeSelector from "../../../User-Attendance/components/EmployeeSelector";
import { Employee } from "../../../User-Attendance/types/attendance";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type EmployeeData = {
  id: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  totalDays: string;
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
};

type EmployeeTableData = EmployeeData & { srNo: number };

export default function MonthlyPayrollPage() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [month, setMonth] = useState("Aug");
  const [year, setYear] = useState("2025");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeStatus, setEmployeeStatus] = useState<string>("Active");
  const [tableData, setTableData] = useState<EmployeeTableData[]>([]);

  // 🔹 Mock API call
  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData: EmployeeData[] = [
        {
          id: 1,
          employeeCode: "433",
          employeeName: "Admin MM User",
          department: "Accounts Department",
          totalDays: "0",
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
        },
        {
          id: 2,
          employeeCode: "419",
          employeeName: "Admin Admin Admin",
          department: "HR",
          totalDays: "0",
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
        },
      ];
      setTableData(mockData.map((emp, i) => ({ ...emp, srNo: i + 1 })));
      setSearched(true);
      setLoading(false);
    }, 800);
  };

  // 🔹 Handle inline edit of total days
  const handleChangeTotalDays = (id: number, value: string) => {
    setTableData((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, totalDays: value } : emp
      )
    );
  };

  const columns: TableColumn<EmployeeTableData>[] = [
    { name: "Sr No", selector: (row) => row.srNo, width: "80px" },
    { name: "Emp No", selector: (row) => row.employeeCode, width: "100px" },
    { name: "Employee Name", selector: (row) => row.employeeName, width: "200px" },
    { name: "Department", selector: (row) => row.department, width: "200px" },
    {
      name: "Total Days",
      cell: (row) => (
        <input
          type="number"
          value={row.totalDays}
          onChange={(e) => handleChangeTotalDays(row.id, e.target.value)}
          className="border rounded p-1 w-16 text-center"
        />
      ),
      width: "120px",
    },
    { name: "BASIC", selector: (row) => row.basic, width: "120px" },
    { name: "GRADE PAY", selector: (row) => row.gradePay, width: "120px" },
    { name: "DA", selector: (row) => row.da, width: "120px" },
    { name: "HRA", selector: (row) => row.hra, width: "120px" },
    { name: "OTHER ALLOW.", selector: (row) => row.otherAllowance, width: "140px" },
    { name: "Extra Allow.", selector: (row) => row.extraAllowance, width: "140px" },
    { name: "Leave Encash", selector: (row) => row.leaveEncash, width: "140px" },
    { name: "Arrears", selector: (row) => row.arrear, width: "120px" },
    { name: "PF", selector: (row) => row.pf, width: "100px" },
    { name: "PT", selector: (row) => row.pt, width: "100px" },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        textAlign: "left",
      },
    },
    cells: {
      style: { fontSize: "13px", padding: "8px" },
    },
  };

  // Years dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2000 + 11 }, (_, i) => 2000 + i);
  return (
    <div className="p-6">
      {/* 🔹 Filters */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Department + Month Selector */}
        <div className="flex gap-4 w-full lg:w-auto">
          {/* Employee Selector */}
          <div className="flex-1">
            <label className="block font-semibold mb-2">Select Department</label>
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

          {/* Month Selector */}
          <div className="w-48">
            <Label className="block font-semibold mb-2">Select Month</Label>
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
        </div>

        {/* Search Button */}
        <div className="flex items-end">
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
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-bold flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px]"
          >
            <Search className="w-5 h-5 mr-2 text-black" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>


      {/* 🔹 Table */}
      {searched && (
        <div className="mt-6">
          <h1 className="text-xl font-bold mb-4">
            Monthly Payroll - {month} {year}
          </h1>
          <DataTable
            columns={columns}
            data={tableData}
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
