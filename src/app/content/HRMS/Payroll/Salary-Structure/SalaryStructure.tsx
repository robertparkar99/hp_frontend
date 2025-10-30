// "use client";
// import React, { useState, useEffect, useMemo ,useRef} from 'react';
// import EmployeeSelector from "../../../User-Attendance/components/EmployeeSelector";
// import "react-datepicker/dist/react-datepicker.css";
// import DatePicker from "react-datepicker";
// import { Search, FileSpreadsheet, Table, Printer } from "lucide-react";
// import { Employee } from "../../../User-Attendance/types/attendance";
// import { Button } from "@/components/ui/button";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import DataTable, { TableStyles, TableColumn } from 'react-data-table-component';

// interface SalaryData {
//   srNo: number;
//   empNo: number;
//   empName: string;
//   department: string;
//   gender: string;
//   basic: number;
//   gradePa: number;
//   da: number;
//   hra: number;
//   otherAllowances: number;
//   grossTotal: number;
//   status: string;
// }

// interface Option {
//   value: string;
//   label: string;
// }

// interface EmployeeStatusDropdownProps {
//   value: string;
//   onChange: (value: string) => void;
// }

// const EmployeeStatusDropdown: React.FC<EmployeeStatusDropdownProps> = ({ value, onChange }) => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const options: Option[] = [
//     { value: 'All', label: 'All Status' },
//     { value: 'Active', label: 'Active' },
//     { value: 'Inactive', label: 'Inactive' }
//   ];

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const selectedOption = options.find(opt => opt.value === value);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Select Box */}
//       <div
//         className="border border-gray-300 p-2 rounded-md w-full cursor-pointer bg-white hover:bg-gray-50"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {selectedOption?.label || 'Select Status'}
//       </div>

//       {/* Dropdown Options */}
//       {isOpen && (
//         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
//           {options.map((option) => (
//             <div
//               key={option.value}
//               className={`p-2 cursor-pointer ${
//                 value === option.value 
//                   ? 'bg-blue-400 text-white' 
//                   : 'bg-white text-black hover:bg-blue-400 hover:text-white pb-2'
//               }`}
//               onClick={() => {
//                 onChange(option.value);
//                 setIsOpen(false);
//               }}
//             >
//               {option.label}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Editable Input Component
// interface EditableInputProps {
//   value: number;
//   onChange: (value: number) => void;
//   type?: string;
//   disabled?: boolean;
// }

// const EditableInput: React.FC<EditableInputProps> = ({ value, onChange, type = "number", disabled = false }) => {
//   const [inputValue, setInputValue] = useState(value.toString());

//   useEffect(() => {
//     setInputValue(value.toString());
//   }, [value]);

//   const handleBlur = () => {
//     const numValue = parseFloat(inputValue) || 0;
//     onChange(numValue);
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(e.target.value);
//   };

//   return (
//     <input
//       type={type}
//       value={inputValue}
//       onChange={handleChange}
//       onBlur={handleBlur}
//       disabled={disabled}
//       className="w-full p-1 border rounded text-right"
//       style={{ minWidth: "80px" }}
//     />
//   );
// };

// const SalaryStructure: React.FC = () => {
//   // State for filters
//   const [date, setDate] = useState<Date | null>(new Date());
//   const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
//   const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
//   const [data, setData] = useState<SalaryData[]>([]);
//   const [filteredData, setFilteredData] = useState<SalaryData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [userHasSearched, setUserHasSearched] = useState(false);
//   const [employeeStatus, setEmployeeStatus] = useState<string>('Active');
//   const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});


//   const [sessionData, setSessionData] = useState({
//     url: "",
//     token: "",
//     subInstituteId: "",
//     orgType: "",
//     userId: "",
//   });

//   // Load session data from localStorage
//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
//       setSessionData({
//         url: APP_URL,
//         token,
//         subInstituteId: sub_institute_id,
//         orgType: org_type,
//         userId: user_id,
//       });
//     }
//   }, []);

//   // ✅ Reset employees when departments change
//   useEffect(() => {
//     setSelectedEmployees([]);
//   }, [selectedDepartments]);

//   // Apply column filters
//   useEffect(() => {
//     let result = data;

//     // Apply column filters
//     Object.keys(columnFilters).forEach(key => {
//       const filterValue = columnFilters[key].toLowerCase();
//       if (filterValue) {
//         result = result.filter(item => {
//           const cellValue = String(item[key as keyof SalaryData] || '').toLowerCase();
//           return cellValue.includes(filterValue);
//         });
//       }
//     });

//     setFilteredData(result);
//   }, [data, columnFilters]);

//   const handleColumnFilter = (columnName: string, value: string) => {
//     setColumnFilters(prev => ({
//       ...prev,
//       [columnName]: value
//     }));
//   };

//   // Handle input changes and recalculate gross total
//   const handleInputChange = (index: number, field: keyof SalaryData, value: number) => {
//     setData(prevData => {
//       const newData = [...prevData];
//       newData[index] = {
//         ...newData[index],
//         [field]: value
//       };

//       // Recalculate gross total when any salary component changes
//       if (['basic', 'gradePa', 'da', 'hra', 'otherAllowances'].includes(field)) {
//         const { basic, gradePa, da, hra, otherAllowances } = newData[index];
//         newData[index].grossTotal = basic + gradePa + da + hra + otherAllowances;
//       }

//       return newData;
//     });
//   };

//   // Sample data for demonstration
//   const sampleSalaryData: SalaryData[] = [
//     {
//       srNo: 1,
//       empNo: 433,
//       empName: 'Admin MM User',
//       department: 'Accounts Department',
//       gender: 'M',
//       basic: 10000,
//       gradePa: 1000,
//       da: 200,
//       hra: 100,
//       otherAllowances: 500,
//       grossTotal: 11800,
//       status: 'Active'
//     },
//     {
//       srNo: 2,
//       empNo: 400,
//       empName: 'admin admin admin',
//       department: 'Accounts Department',
//       gender: 'M',
//       basic: 12000,
//       gradePa: 1200,
//       da: 240,
//       hra: 120,
//       otherAllowances: 600,
//       grossTotal: 14160,
//       status: 'Active'
//     },
//     {
//       srNo: 3,
//       empNo: 401,
//       empName: 'John Doe',
//       department: 'IT Department',
//       gender: 'M',
//       basic: 15000,
//       gradePa: 1500,
//       da: 300,
//       hra: 150,
//       otherAllowances: 750,
//       grossTotal: 17700,
//       status: 'Inactive'
//     },
//     {
//       srNo: 4,
//       empNo: 402,
//       empName: 'Jane Smith',
//       department: 'HR Department',
//       gender: 'F',
//       basic: 13000,
//       gradePa: 1300,
//       da: 260,
//       hra: 130,
//       otherAllowances: 650,
//       grossTotal: 15340,
//       status: 'Active'
//     }
//   ];

//   const fetchData = async () => {
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

//   // Status badge component
//   const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
//     const statusColors = {
//       Active: 'bg-green-100 text-green-800',
//       Inactive: 'bg-red-100 text-red-800',
//       Pending: 'bg-yellow-100 text-yellow-800',
//       Suspended: 'bg-orange-100 text-orange-800'
//     };

//     const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
//         {status}
//       </span>
//     );
//   };

//   // DataTable columns configuration
//   const columns: TableColumn<SalaryData>[] = [
//     {
//       name: (
//         <div>
//           <div>Sr No.</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srNo", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       selector: (row: SalaryData) => row.srNo,
//       sortable: true,
//       width: "100px"
//     },
//     {
//       name: (
//         <div>
//           <div>Emp No</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("empNo", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       selector: (row: SalaryData) => row.empNo,
//       sortable: true,
//       width: "100px"
//     },
//     {
//       name: (
//         <div>
//           <div>Employee Name</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("empName", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       selector: (row: SalaryData) => row.empName,
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: (
//         <div>
//           <div>Department</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("department", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       selector: (row: SalaryData) => row.department,
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: (
//         <div>
//           <div>Gender</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("gender", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       selector: (row: SalaryData) => row.gender,
//       sortable: true,
//       width: "100px"
//     },
//     {
//       name: (
//         <div>
//           <div>Basic</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("basic", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
//         <EditableInput
//           value={row.basic}
//           onChange={(value) => handleInputChange(rowIndex, 'basic', value)}
//           type="number"
//         />
//       ),
//       selector: (row: SalaryData) => row.basic,
//       sortable: true,
//       format: (row: SalaryData) => row.basic.toLocaleString(),
//       width: "120px"
//     },
//     {
//       name: (
//         <div>
//           <div>Grade PA</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("gradePa", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
//         <EditableInput
//           value={row.gradePa}
//           onChange={(value) => handleInputChange(rowIndex, 'gradePa', value)}
//           type="number"
//         />
//       ),
//       selector: (row: SalaryData) => row.gradePa,
//       sortable: true,
//       format: (row: SalaryData) => row.gradePa.toLocaleString(),
//       width: "120px"
//     },
//     {
//       name: (
//         <div>
//           <div>DA</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("da", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
//         <EditableInput
//           value={row.da}
//           onChange={(value) => handleInputChange(rowIndex, 'da', value)}
//           type="number"
//         />
//       ),
//       selector: (row: SalaryData) => row.da,
//       sortable: true,
//       format: (row: SalaryData) => row.da.toLocaleString(),
//       width: "100px"
//     },
//     {
//       name: (
//         <div>
//           <div>HRA</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("hra", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
//         <EditableInput
//           value={row.hra}
//           onChange={(value) => handleInputChange(rowIndex, 'hra', value)}
//           type="number"
//         />
//       ),
//       selector: (row: SalaryData) => row.hra,
//       sortable: true,
//       format: (row: SalaryData) => row.hra.toLocaleString(),
//       width: "100px"
//     },
//     {
//       name: (
//         <div>
//           <div>Other Allowances</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("otherAllowances", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",

//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
//         <EditableInput
//           value={row.otherAllowances}
//           onChange={(value) => handleInputChange(rowIndex, 'otherAllowances', value)}
//           type="number"
//         />
//       ),
//       selector: (row: SalaryData) => row.otherAllowances,
//       sortable: true,
//       format: (row: SalaryData) => row.otherAllowances.toLocaleString(),
//       width: "150px"
//     },
//     {
//       name: (
//         <div>
//           <div>Gross Total</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("grossTotal", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "4px",
//               fontSize: "12px",
//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
//         <EditableInput
//           value={row.grossTotal}
//           onChange={(value) => handleInputChange(rowIndex, 'grossTotal', value)}
//           type="number"
//           disabled={true} // Gross Total is auto-calculated
//         />
//       ),
//       selector: (row: SalaryData) => row.grossTotal,
//       sortable: true,
//       format: (row: SalaryData) => row.grossTotal.toLocaleString(),
//       width: "130px"
//     },

//   ];

//   // Custom styles for DataTable
//   const customStyles: TableStyles = {
//     headCells: {
//       style: {
//         fontSize: "14px",
//         backgroundColor: "#D1E7FF",
//         color: "black",
//         whiteSpace: "nowrap",
//         textAlign: "left",
//       },
//     },
//     cells: {
//       style: {
//         fontSize: "13px",
//         textAlign: "left",
//         padding: "8px"
//       }
//     },
//     table: {
//       style: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" },
//     },
//   };

//   // Export functions
//   const exportToExcel = () => {
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Salary Structure");
//     XLSX.writeFile(wb, "salary-structure.xlsx");
//   };

//   const exportToCSV = () => {
//     const ws = XLSX.utils.json_to_sheet(data);
//     const csv = XLSX.utils.sheet_to_csv(ws);
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     saveAs(blob, "salary-structure.csv");
//   };

//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Employee Salary Structure Report", 14, 16);
//     autoTable(doc, {
//       head: [
//         ["Sr No.", "Emp No", "Employee Name", "Department", "Gender", "Status", "Basic", "Grade PA", "DA", "HRA", "Other Allowances", "Gross Total"]
//       ],
//       body: data.map((row) => [
//         row.srNo,
//         row.empNo,
//         row.empName,
//         row.department,
//         row.gender,
//         row.status,
//         row.basic.toLocaleString(),
//         row.gradePa.toLocaleString(),
//         row.da.toLocaleString(),
//         row.hra.toLocaleString(),
//         row.otherAllowances.toLocaleString(),
//         row.grossTotal.toLocaleString()
//       ]),
//       startY: 20,
//     });
//     doc.save("salary-structure.pdf");
//   };

//   return (
//     <div className="p-6 space-y-6 bg-background rounded-xl">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Salary Structure Management</h1>
//           {/* <p className="text-sm text-muted-foreground mt-1">
//                 Manage your organization's information, Department structure.
//               </p> */}
//         </div>
//       </div>
//       {/* Filters Section */}
//       <div className="flex flex-col lg:flex-row gap-6 w-full">
//         {/* Department Selector - Takes majority space */}
//         <div className="flex-1">
//           <label className="block font-semibold mb-2">Select Department</label>
//           <EmployeeSelector
//             multiSelect
//             empMultiSelect
//             selectedDepartment={selectedDepartments}
//             onSelectDepartment={setSelectedDepartments}
//             selectedEmployee={selectedEmployees}
//             onSelectEmployee={setSelectedEmployees}
//             className="w-full"
//           />
//         </div>

//         {/* Status and Search - Side by side on desktop, stacked on mobile */}
//         <div className="flex flex-col sm:flex-row gap-4 items-start w-full lg:w-auto">
//           <div className="flex flex-col w-full sm:w-48 mt-8">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Employee Status</label>
//              <EmployeeStatusDropdown
//     value={employeeStatus}
//     onChange={setEmployeeStatus}
//   />

//           </div>

//           <Button
//             onClick={fetchData}
//             disabled={loading}
//             className="px-6 py-2 rounded-lg flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-14"
//           >
//             {/* <Search className="w-5 h-5 mr-2 text-black" /> */}
//             {loading ? "Searching..." : "Search"}
//           </Button>
//         </div>
//       </div>

//       {/* Export Buttons */}
//       <div className="flex gap-3 flex-wrap justify-end">

//         <Button
//           onClick={() => window.print()}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           <Printer className="w-5 h-5" />
//         </Button>
//         <Button
//           onClick={exportToPDF}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
//         >
//           <span className="mdi mdi-file-pdf-box text-xl"></span>
//         </Button>


//         <Button
//           onClick={exportToExcel}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
//         >
//           <span className="mdi mdi-file-excel-outline text-xl"></span>
//         </Button>

//       </div>

//       {/* Data Table */}
//       <div >
//         {/* Table Header */}
//         <div className="px-6 py-4">
//           <h2 className="text-lg font-semibold">Employee Salary Structure</h2>
//         </div>

//         {/* DataTable Component */}
//         <DataTable
//           columns={columns}
//           data={filteredData}
//           customStyles={customStyles}
//           pagination
//           highlightOnHover
//           responsive
//           progressPending={loading}
//           noDataComponent={
//             <div className="p-4 text-center">
//               {userHasSearched ? 'No data found' : 'Click Search to load data'}
//             </div>
//           }
//           persistTableHead
//         />
//       </div>
//     </div>
//   );
// };

// export default SalaryStructure;


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

  const handleRollover = async () => {
    try {
      // Get current year and next year
      const currentYear = date?.getFullYear() || new Date().getFullYear();
      const nextYear = currentYear + 1;

      // Create base URL with session data
      const baseParams = new URLSearchParams({
        token: sessionData.token,
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
      });

      // Add employee data for rollover
      // Use the existing data from state to create rollover structure
      const rolloverParams = new URLSearchParams(baseParams);

      // Add year parameter
      rolloverParams.append(`emp[1][year]`, String(nextYear));

      // Add payroll data from current structure
      // Using the first employee as template (you might want to adjust this logic)
      if (data.length > 0 && payrollTypes.length > 0) {
        const firstEmployee = data[0];

        payrollTypes.forEach((payrollType, index) => {
          const payrollValue = firstEmployee.payrollValues[payrollType.id] || 0;

          // Add payroll structure data
          rolloverParams.append(`emp[1][${payrollType.id}][0]`, String(payrollType.id));
          rolloverParams.append(`emp[1][${payrollType.id}][1]`, String(payrollValue));
          rolloverParams.append(`emp[1][${payrollType.id}][2]`, payrollType.payroll_name);
          rolloverParams.append(`emp[1][${payrollType.id}][3]`, String(payrollType.payroll_type));
        });

        // Add employee IDs
        data.forEach((employee, index) => {
          if (employee.employeeId) {
            rolloverParams.append(`employee_id[${index}]`, String(employee.employeeId));
          }
        });

        // Add departments
        selectedDepartments.forEach((dept, index) => {
          rolloverParams.append(`department_id[${index}]`, dept);
        });
      }

      const url = `${sessionData.url}/rollover-employee-salary-structure/store?${rolloverParams.toString()}`;

      console.log("Rollover API URL:", url); // Debug log

      const confirmRollover = confirm(
        `Are you sure you want to roll over salary from ${currentYear} to ${nextYear}?`
      );

      if (!confirmRollover) return;

      const response = await fetch(url, {
        method: "POST",
      });

      const result = await response.json();
      console.log("Rollover API Response:", result);

      if (response.ok && result.status === "1") {
        alert(`Salary rollover to ${nextYear} successful!`);

        // Optionally refresh the data after successful rollover
        // fetchData();
      } else {
        alert(`Rollover failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error during rollover:", error);
      alert("Error occurred while rolling over salary. Check console for details.");
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
    <div className="p-6 space-y-6 bg-background rounded-xl">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Salary Structure Management</h1>
        {date && date.getFullYear() !== 2026 && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRollover}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              Roll Over Salary
            </Button>
          </div>
        )}
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