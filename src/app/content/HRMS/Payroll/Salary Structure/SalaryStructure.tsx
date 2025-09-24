
// import React, { useState, useEffect, useMemo } from 'react';
// import EmployeeSelector from "../../../User-Attendance/components/EmployeeSelector";
// import "react-datepicker/dist/react-datepicker.css";
// import DatePicker from "react-datepicker";
// // import { Search, FileSpreadsheet, Table, Printer, ChevronDown, ChevronUp } from "lucide-react";
// import { Search, FileSpreadsheet, Table, Printer } from "lucide-react";
// import { Employee } from "../../../User-Attendance/types/attendance";
// import { Button } from "@/components/ui/button";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import DataTable, { TableStyles } from 'react-data-table-component';

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
//       const { APP_URL, token, sub_institute_id, org_type, user_id } =
//         JSON.parse(userData);
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
//   const columns = [
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//  cell: (row: SalaryData, index?: number) => (
//         <EditableInput
//           value={row.basic}
//           onChange={(value) => index !== undefined && handleInputChange(index, 'basic', value)}
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//    cell: (row: SalaryData, index?: number) => (
//         <EditableInput
//           value={row.gradePa}
//           onChange={(value) => index !== undefined && handleInputChange(index, 'gradePa', value)}
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//    cell: (row: SalaryData, index?: number) => (
//         <EditableInput
//           value={row.da}
//           onChange={(value) => index !== undefined && handleInputChange(index, 'da', value)}
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//    cell: (row: SalaryData, index?: number) => (
//         <EditableInput
//           value={row.hra}
//           onChange={(value) => index !== undefined && handleInputChange(index, 'hra', value)}
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//       cell: (row: SalaryData, index?: number) => (
//         <EditableInput
//           value={row.otherAllowances}
//           onChange={(value) => index !== undefined && handleInputChange(index, 'otherAllowances', value)}
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
//               border: "1px solid #ddd",
//               borderRadius: "3px",
//               marginTop: "5px"
//             }}
//           />
//         </div>
//       ),
//   cell: (row: SalaryData, index?: number) => (
//         <EditableInput
//           value={row.grossTotal}
//           onChange={(value) => index !== undefined && handleInputChange(index, 'grossTotal', value)}
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
//     cells: { style: { fontSize: "13px", textAlign: "left" } },
//     table: {
//       style: { border: "1px solid #ddd", borderRadius: "20px", overflow: "hidden" },
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
//         row.basic,
//         row.gradePa,
//         row.da,
//         row.hra,
//         row.otherAllowances,
//         row.grossTotal
//       ]),
//     });
//     doc.save("salary-structure.pdf");
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* Filters Section */}
//   <div className="flex flex-col lg:flex-row gap-6 w-full">
//   {/* Department Selector - Takes majority space */}
//   <div className="flex-1">
//     <label className="block font-semibold mb-2">Select Department</label>
//     <EmployeeSelector
//       multiSelect
//       empMultiSelect
//       selectedDepartment={selectedDepartments}
//       onSelectDepartment={setSelectedDepartments}
//       selectedEmployee={selectedEmployees}
//       onSelectEmployee={setSelectedEmployees}
//       className="w-full"
//     />
//   </div>

//   {/* Status and Search - Side by side on desktop, stacked on mobile */}
//   <div className="flex flex-col sm:flex-row gap-4 items-start w-full lg:w-auto">
//     <div className="flex flex-col w-full sm:w-48 mt-8">
//       <label className="block text-sm font-medium text-gray-700 mb-2">Employee Status</label>
//       <select
//         value={employeeStatus}
//         onChange={(e) => setEmployeeStatus(e.target.value)}
//         className="border p-2 rounded w-full"
//       >
//         <option value="All">All Status</option>
//         <option value="Active">Active</option>
//         <option value="Inactive">Inactive</option>

//       </select>
//     </div>

//     <Button
//       onClick={fetchData}
//       disabled={loading}
//       className="px-6 py-2 rounded-lg font-bold flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-14"
//     >
//       <Search className="w-5 h-5 mr-2 text-black" />
//       {loading ? "Searching..." : "Search"}
//     </Button>
//   </div>
// </div>



//       {/* Export Buttons */}
//       <div className="flex gap-3 flex-wrap justify-end">
//         <Button
//           onClick={exportToPDF}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           <span className="mdi mdi-file-pdf-box text-xl"></span>
//         </Button>
//         <Button
//           onClick={exportToCSV}
//           title="Export as CSV"
//           aria-label="Export as CSV"
//           className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           <FileSpreadsheet className="w-7 h-5" />
//         </Button>

//         <Button
//           onClick={exportToExcel}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           <span className="mdi mdi-file-excel-outline text-xl"></span>
//         </Button>
//         <Button
//           onClick={() => window.print()}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           <Printer className="w-5 h-5" />
//           {/* <span className="mdi mdi-printer-outline"></span> */}
//         </Button>
//         <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
//           <Table className="w-5 h-5" />
//         </Button>
//       </div>

//       {/* Data Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {/* Table Header */}
//         <div className="px-6 py-4 ">
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



import React, { useState, useEffect, useMemo } from 'react';
import EmployeeSelector from "../../../User-Attendance/components/EmployeeSelector";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { Search, FileSpreadsheet, Table, Printer } from "lucide-react";
import { Employee } from "../../../User-Attendance/types/attendance";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DataTable, { TableStyles, TableColumn } from 'react-data-table-component';

interface SalaryData {
  srNo: number;
  empNo: number;
  empName: string;
  department: string;
  gender: string;
  basic: number;
  gradePa: number;
  da: number;
  hra: number;
  otherAllowances: number;
  grossTotal: number;
  status: string;
}

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
      className="w-full p-1 border rounded text-right"
      style={{ minWidth: "80px" }}
    />
  );
};

const SalaryStructure: React.FC = () => {
  // State for filters
  const [date, setDate] = useState<Date | null>(new Date());
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [data, setData] = useState<SalaryData[]>([]);
  const [filteredData, setFilteredData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [userHasSearched, setUserHasSearched] = useState(false);
  const [employeeStatus, setEmployeeStatus] = useState<string>('Active');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

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
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
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

  // Apply column filters
  useEffect(() => {
    let result = data;

    // Apply column filters
    Object.keys(columnFilters).forEach(key => {
      const filterValue = columnFilters[key].toLowerCase();
      if (filterValue) {
        result = result.filter(item => {
          const cellValue = String(item[key as keyof SalaryData] || '').toLowerCase();
          return cellValue.includes(filterValue);
        });
      }
    });

    setFilteredData(result);
  }, [data, columnFilters]);

  const handleColumnFilter = (columnName: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  // Handle input changes and recalculate gross total
  const handleInputChange = (index: number, field: keyof SalaryData, value: number) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        [field]: value
      };

      // Recalculate gross total when any salary component changes
      if (['basic', 'gradePa', 'da', 'hra', 'otherAllowances'].includes(field)) {
        const { basic, gradePa, da, hra, otherAllowances } = newData[index];
        newData[index].grossTotal = basic + gradePa + da + hra + otherAllowances;
      }

      return newData;
    });
  };

  // Sample data for demonstration
  const sampleSalaryData: SalaryData[] = [
    {
      srNo: 1,
      empNo: 433,
      empName: 'Admin MM User',
      department: 'Accounts Department',
      gender: 'M',
      basic: 10000,
      gradePa: 1000,
      da: 200,
      hra: 100,
      otherAllowances: 500,
      grossTotal: 11800,
      status: 'Active'
    },
    {
      srNo: 2,
      empNo: 400,
      empName: 'admin admin admin',
      department: 'Accounts Department',
      gender: 'M',
      basic: 12000,
      gradePa: 1200,
      da: 240,
      hra: 120,
      otherAllowances: 600,
      grossTotal: 14160,
      status: 'Active'
    },
    {
      srNo: 3,
      empNo: 401,
      empName: 'John Doe',
      department: 'IT Department',
      gender: 'M',
      basic: 15000,
      gradePa: 1500,
      da: 300,
      hra: 150,
      otherAllowances: 750,
      grossTotal: 17700,
      status: 'Inactive'
    },
    {
      srNo: 4,
      empNo: 402,
      empName: 'Jane Smith',
      department: 'HR Department',
      gender: 'F',
      basic: 13000,
      gradePa: 1300,
      da: 260,
      hra: 130,
      otherAllowances: 650,
      grossTotal: 15340,
      status: 'Active'
    }
  ];

  const fetchData = async () => {
    setUserHasSearched(true);
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Filter data based on employee status
      let filteredData = sampleSalaryData;
      if (employeeStatus !== 'All') {
        filteredData = sampleSalaryData.filter(emp => emp.status === employeeStatus);
      }
      setData(filteredData);
      setFilteredData(filteredData);
      setLoading(false);
    }, 1000);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusColors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Suspended: 'bg-orange-100 text-orange-800'
    };

    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  // DataTable columns configuration
  const columns: TableColumn<SalaryData>[] = [
    {
      name: (
        <div>
          <div>Sr No.</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("srNo", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: SalaryData) => row.srNo,
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
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: SalaryData) => row.empNo,
      sortable: true,
      width: "100px"
    },
    {
      name: (
        <div>
          <div>Employee Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("empName", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: SalaryData) => row.empName,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("department", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: SalaryData) => row.department,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Gender</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("gender", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row: SalaryData) => row.gender,
      sortable: true,
      width: "100px"
    },
    {
      name: (
        <div>
          <div>Basic</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("basic", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
        <EditableInput
          value={row.basic}
          onChange={(value) => handleInputChange(rowIndex, 'basic', value)}
          type="number"
        />
      ),
      selector: (row: SalaryData) => row.basic,
      sortable: true,
      format: (row: SalaryData) => row.basic.toLocaleString(),
      width: "120px"
    },
    {
      name: (
        <div>
          <div>Grade PA</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("gradePa", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
        <EditableInput
          value={row.gradePa}
          onChange={(value) => handleInputChange(rowIndex, 'gradePa', value)}
          type="number"
        />
      ),
      selector: (row: SalaryData) => row.gradePa,
      sortable: true,
      format: (row: SalaryData) => row.gradePa.toLocaleString(),
      width: "120px"
    },
    {
      name: (
        <div>
          <div>DA</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("da", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
        <EditableInput
          value={row.da}
          onChange={(value) => handleInputChange(rowIndex, 'da', value)}
          type="number"
        />
      ),
      selector: (row: SalaryData) => row.da,
      sortable: true,
      format: (row: SalaryData) => row.da.toLocaleString(),
      width: "100px"
    },
    {
      name: (
        <div>
          <div>HRA</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("hra", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
        <EditableInput
          value={row.hra}
          onChange={(value) => handleInputChange(rowIndex, 'hra', value)}
          type="number"
        />
      ),
      selector: (row: SalaryData) => row.hra,
      sortable: true,
      format: (row: SalaryData) => row.hra.toLocaleString(),
      width: "100px"
    },
    {
      name: (
        <div>
          <div>Other Allowances</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("otherAllowances", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
        <EditableInput
          value={row.otherAllowances}
          onChange={(value) => handleInputChange(rowIndex, 'otherAllowances', value)}
          type="number"
        />
      ),
      selector: (row: SalaryData) => row.otherAllowances,
      sortable: true,
      format: (row: SalaryData) => row.otherAllowances.toLocaleString(),
      width: "150px"
    },
    {
      name: (
        <div>
          <div>Gross Total</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("grossTotal", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      cell: (row: SalaryData, rowIndex: number, column: TableColumn<SalaryData>, id: string | number) => (
        <EditableInput
          value={row.grossTotal}
          onChange={(value) => handleInputChange(rowIndex, 'grossTotal', value)}
          type="number"
          disabled={true} // Gross Total is auto-calculated
        />
      ),
      selector: (row: SalaryData) => row.grossTotal,
      sortable: true,
      format: (row: SalaryData) => row.grossTotal.toLocaleString(),
      width: "130px"
    },
  
  ];

  // Custom styles for DataTable
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

  // Export functions
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
    autoTable(doc, {
      head: [
        ["Sr No.", "Emp No", "Employee Name", "Department", "Gender", "Status", "Basic", "Grade PA", "DA", "HRA", "Other Allowances", "Gross Total"]
      ],
      body: data.map((row) => [
        row.srNo,
        row.empNo,
        row.empName,
        row.department,
        row.gender,
        row.status,
        row.basic.toLocaleString(),
        row.gradePa.toLocaleString(),
        row.da.toLocaleString(),
        row.hra.toLocaleString(),
        row.otherAllowances.toLocaleString(),
        row.grossTotal.toLocaleString()
      ]),
      startY: 20,
    });
    doc.save("salary-structure.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Department Selector - Takes majority space */}
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

        {/* Status and Search - Side by side on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-4 items-start w-full lg:w-auto">
          <div className="flex flex-col w-full sm:w-48 mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Status</label>
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
            className="px-6 py-2 rounded-lg font-bold flex items-center justify-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors w-full sm:w-32 h-[42px] mt-14"
          >
            <Search className="w-5 h-5 mr-2 text-black" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 flex-wrap justify-end">
        <Button
          onClick={exportToPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
        >
          <span className="mdi mdi-file-pdf-box text-xl"></span>
        </Button>
        <Button
          onClick={exportToCSV}
          title="Export as CSV"
          aria-label="Export as CSV"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors px-3"
        >
          <FileSpreadsheet className="w-8 h-5" />
        </Button>

        <Button
          onClick={exportToExcel}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors px-3"
        >
          <span className="mdi mdi-file-excel-outline text-xl"></span>
        </Button>
        <Button
          onClick={() => window.print()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          <Printer className="w-5 h-5" />
        </Button>
        <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          <Table className="w-5 h-5" />
        </Button>
      </div>

      {/* Data Table */}
      <div >
        {/* Table Header */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold">Employee Salary Structure</h2>
        </div>

        {/* DataTable Component */}
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
              {userHasSearched ? 'No data found' : 'Click Search to load data'}
            </div>
          }
          persistTableHead
        />
      </div>
    </div>
  );
};

export default SalaryStructure;