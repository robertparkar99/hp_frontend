// // "use client";
// // import React, { useState } from "react";
// // import { Clock, Calendar, AlertCircle, User } from "lucide-react";
// // import { AttendanceRecord, Employee } from "../types/attendance";
// // import { format, parseISO } from "date-fns";

// // interface AttendanceListProps {
// //   records: AttendanceRecord[];
// //   employees: Employee[];
// //   selectedEmployee: Employee | null;
// //   onUpdateRecords?: (updated: AttendanceRecord[]) => void;
// //   fromDate?: string;
// //   toDate?: string;
// // }

// // const fallbackImg =
// //   "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

// // const getAvatarUrl = (image?: string): string => {
// //   if (image && image.trim()) {
// //     return image.startsWith("http")
// //       ? image
// //       : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
// //           image
// //         )}`;
// //   }
// //   return fallbackImg;
// // };

// // const AttendanceList: React.FC<AttendanceListProps> = ({
// //   records,
// //   employees,
// //   selectedEmployee,
// //   onUpdateRecords,
// //   fromDate,
// //   toDate,
// // }) => {
// //   const [selectedRows, setSelectedRows] = useState<string[]>([]);
// //   const [editedRecords, setEditedRecords] = useState<Record<string, AttendanceRecord>>({});

// //   const getEmployee = (employeeId: string): Employee | undefined => {
// //     return employees.find((emp) => emp.id === employeeId);
// //   };

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case "present":
// //         return "bg-green-100 text-green-800";
// //       case "late":
// //         return "bg-yellow-100 text-yellow-800";
// //       case "early-leave":
// //         return "bg-orange-100 text-orange-800";
// //       case "absent":
// //         return "bg-red-100 text-red-800";
// //       default:
// //         return "bg-gray-100 text-gray-800";
// //     }
// //   };

// //   const getStatusIcon = (status: string) => {
// //     switch (status) {
// //       case "present":
// //         return <Clock className="w-3 h-3" />;
// //       case "late":
// //       case "early-leave":
// //         return <AlertCircle className="w-3 h-3" />;
// //       case "absent":
// //         return <User className="w-3 h-3" />;
// //       default:
// //         return <Clock className="w-3 h-3" />;
// //     }
// //   };

// //   let filteredRecords = selectedEmployee
// //     ? records.filter((record) => record.employeeId === selectedEmployee.id)
// //     : records;

// //   if (fromDate) {
// //     filteredRecords = filteredRecords.filter(
// //       (rec) => new Date(rec.date) >= new Date(fromDate)
// //     );
// //   }
// //   if (toDate) {
// //     filteredRecords = filteredRecords.filter(
// //       (rec) => new Date(rec.date) <= new Date(toDate)
// //     );
// //   }

// //   const sortedRecords = filteredRecords.sort(
// //     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
// //   );

// //   const handleCheckboxChange = (record: AttendanceRecord) => {
// //     setSelectedRows((prev) =>
// //       prev.includes(record.id)
// //         ? prev.filter((id) => id !== record.id)
// //         : [...prev, record.id]
// //     );
// //     setEditedRecords((prev) => ({
// //       ...prev,
// //       [record.id]: { ...record },
// //     }));
// //   };

// //   const handleFieldChange = (
// //     recordId: string,
// //     field: "punchIn" | "punchOut",
// //     value: string
// //   ) => {
// //     setEditedRecords((prev) => ({
// //       ...prev,
// //       [recordId]: {
// //         ...prev[recordId],
// //         [field]: value,
// //       },
// //     }));
// //   };

// //   const handleUpdate = () => {
// //     const updated = selectedRows.map((id) => editedRecords[id]);
// //     if (onUpdateRecords) onUpdateRecords(updated);
// //   };

// //   return (
// //     <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-100 flex flex-col">
// //       {/* Header */}
// //       <div className="flex items-center justify-between p-6 border-b border-gray-200">
// //         <div className="flex items-center space-x-3">
// //           <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
// //             <Calendar className="w-5 h-5 text-green-600" />
// //           </div>
// //           <div>
// //             <h3 className="text-lg font-semibold text-gray-900">
// //               {selectedEmployee
// //                 ? `${selectedEmployee.name}'s Attendance`
// //                 : "All Employee Attendance"}
// //             </h3>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Records */}
// //       <div className="flex-1 overflow-y-auto scrollbar-hide">
// //         <table className="min-w-full divide-y divide-gray-200">
// //           <thead className="bg-gray-50 sticky top-0 z-10">
// //             <tr>
// //               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Sr. No
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Employee
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Date
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Punch In
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Punch Out
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Total Hours
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Status
// //               </th>
// //             </tr>
// //           </thead>
// //           <tbody className="bg-white divide-y divide-gray-200">
// //             {sortedRecords.map((record, index) => {
// //               const employee = getEmployee(record.employeeId);
// //               const isSelected = selectedRows.includes(record.id);
// //               const edited = editedRecords[record.id] || record;

// //               return (
// //                 <tr key={record.id} className="hover:bg-gray-50 transition-colors">
// //                   {/* Sr. No + Checkbox */}
// //                   <td className="px-4 py-4 whitespace-nowrap">
// //                     <input
// //                       type="checkbox"
// //                       checked={isSelected}
// //                       onChange={() => handleCheckboxChange(record)}
// //                       className="mr-2"
// //                     />
// //                     {index + 1}
// //                   </td>

// //                   {/* Employee */}
// //                   <td className="px-6 py-4 whitespace-nowrap">
// //                     <div className="flex items-center">
// //                       <img
// //                         className="h-8 w-8 rounded-full"
// //                         src={getAvatarUrl(employee?.avatar)}
// //                         alt={employee?.name}
// //                         onError={(e) => {
// //                           (e.target as HTMLImageElement).src = fallbackImg;
// //                         }}
// //                       />
// //                       <div className="ml-3">
// //                         <div className="text-sm font-medium text-gray-900">
// //                           {employee?.name || "Unknown Employee"}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </td>

// //                   {/* Date */}
// //                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
// //                     {format(parseISO(record.date), "MMM dd, yyyy")}
// //                   </td>

// //                   {/* Punch In */}
// //                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
// //                     {isSelected ? (
// //                       <input
// //                         type="time"
// //                         value={edited.punchIn || ""}
// //                         onChange={(e) =>
// //                           handleFieldChange(record.id, "punchIn", e.target.value)
// //                         }
// //                         className="border rounded px-2 py-1"
// //                       />
// //                     ) : (
// //                       record.punchIn || "-"
// //                     )}
// //                   </td>

// //                   {/* Punch Out */}
// //                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
// //                     {isSelected ? (
// //                       <input
// //                         type="time"
// //                         value={edited.punchOut || ""}
// //                         onChange={(e) =>
// //                           handleFieldChange(record.id, "punchOut", e.target.value)
// //                         }
// //                         className="border rounded px-2 py-1"
// //                       />
// //                     ) : (
// //                       record.punchOut || "-"
// //                     )}
// //                   </td>

// //                   {/* Total Hours */}
// //                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
// //                     {record.totalHours ? `${record.totalHours}h` : "-"}
// //                   </td>

// //                   {/* Status */}
// //                   <td className="px-6 py-4 whitespace-nowrap">
// //                     <span
// //                       className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
// //                         record.status
// //                       )}`}
// //                     >
// //                       {getStatusIcon(record.status)}
// //                       <span className="capitalize">
// //                         {record.status.replace("-", " ")}
// //                       </span>
// //                     </span>
// //                   </td>
// //                 </tr>
// //               );
// //             })}
// //           </tbody>
// //         </table>

// //         {sortedRecords.length === 0 && (
// //           <div className="text-center py-12">
// //             <Calendar className="mx-auto h-12 w-12 text-gray-400" />
// //             <h3 className="mt-2 text-sm font-medium text-gray-900">
// //               No attendance records
// //             </h3>
// //             <p className="mt-1 text-sm text-gray-500">
// //               {selectedEmployee
// //                 ? `No records found for ${selectedEmployee.name}`
// //                 : "No attendance records available"}
// //             </p>
// //           </div>
// //         )}
// //       </div>

// //       {/* Update Button */}
// //       {selectedRows.length > 0 && (
// //         <div className="p-4 border-t border-gray-200 flex justify-end">
// //           <button
// //             onClick={handleUpdate}
// //             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
// //           >
// //             Update Selected
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default AttendanceList;


// "use client";
// import React, { useState, useMemo } from "react";
// import DataTable from "react-data-table-component";
// import { Clock, Calendar, AlertCircle, User, ChevronUp, ChevronDown, Search } from "lucide-react";
// import { AttendanceRecord, Employee } from "../types/attendance";
// import { format, parseISO } from "date-fns";

// interface AttendanceListProps {
//   records: AttendanceRecord[];
//   employees: Employee[];
//   selectedEmployee: Employee | null;
//   onUpdateRecords?: (updated: AttendanceRecord[]) => void;
//   fromDate?: string;
//   toDate?: string;
// }

// const fallbackImg =
//   "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

// const getAvatarUrl = (image?: string): string => {
//   if (image && image.trim()) {
//     return image.startsWith("http")
//       ? image
//       : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
//           image
//         )}`;
//   }
//   return fallbackImg;
// };

// const AttendanceList: React.FC<AttendanceListProps> = ({
//   records,
//   employees,
//   selectedEmployee,
//   onUpdateRecords,
//   fromDate,
//   toDate,
// }) => {
//   const [selectedRows, setSelectedRows] = useState<AttendanceRecord[]>([]);
//   const [editedRecords, setEditedRecords] = useState<Record<string, AttendanceRecord>>({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
//   // const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

//   const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

// const handleColumnFilter = (columnKey: string, value: string) => {
//   setColumnFilters(prev => ({
//     ...prev,
//     [columnKey]: value
//   }));
// };



//   // const getEmployee = (employeeId: string): Employee | undefined => {
//   //   return employees.find((emp) => emp.id === employeeId);
//   // };
//    const getEmployee = (employeeId: string): Employee | undefined => {
//      return employees.find((emp) => emp.id === employeeId);
//    };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "present":
//         return "bg-green-100 text-green-800";
//       case "late":
//         return "bg-yellow-100 text-yellow-800";
//       case "early-leave":
//         return "bg-orange-100 text-orange-800";
//       case "absent":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "present":
//         return <Clock className="w-3 h-3" />;
//       case "late":
//       case "early-leave":
//         return <AlertCircle className="w-3 h-3" />;
//       case "absent":
//         return <User className="w-3 h-3" />;
//       default:
//         return <Clock className="w-3 h-3" />;
//     }
//   };

// // Then update your filteredRecords logic to include column filtering
// useMemo(() => {
//   let result = selectedEmployee
//     ? records.filter((record) => record.employeeId === selectedEmployee.id)
//     : records;

//   if (fromDate) {
//     result = result.filter(
//       (rec) => new Date(rec.date) >= new Date(fromDate)
//     );
//   }
//   if (toDate) {
//     result = result.filter(
//       (rec) => new Date(rec.date) <= new Date(toDate)
//     );
//   }

//   // Apply search filter
//   if (searchTerm) {
//     result = result.filter(record => {
//       const employee = getEmployee(record.employeeId);
//       return (
//         employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         record.punchIn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         record.punchOut?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     });
//   }

//   // Apply column filters
//  if (Object.keys(columnFilters).length > 0) {
//   result = result.filter((record, index) => {
//     const employee = getEmployee(record.employeeId);

//     return Object.entries(columnFilters).every(([key, filterValue]) => {
//       if (!filterValue) return true;

//       switch (key) {
//         case "srno":
//           // Compare against row number (index + 1)
//           return (index + 1).toString().includes(filterValue);
//         case "employee":
//           return (
//             employee?.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
//             false
//           );
//         case "date":
//           return format(parseISO(record.date), "MMM dd, yyyy")
//             .toLowerCase()
//             .includes(filterValue.toLowerCase());
//         case "punchIn":
//           return (
//             record.punchIn?.toLowerCase().includes(filterValue.toLowerCase()) ||
//             false
//           );
//         case "punchOut":
//           return (
//             record.punchOut?.toLowerCase().includes(filterValue.toLowerCase()) ||
//             false
//           );
//         case "totalHours":
//           return (
//             record.totalHours?.toString().includes(filterValue) || false
//           );
//         case "status":
//           return record.status.toLowerCase().includes(filterValue.toLowerCase());
//         default:
//           return true;
//       }
//     });
//   });
// }


//   setFilteredRecords(result);
// }, [records, employees, selectedEmployee, fromDate, toDate, searchTerm, columnFilters]);


//   const handleCheckboxChange = (record: AttendanceRecord) => {
//     setSelectedRows((prev) =>
//       prev.some(r => r.id === record.id)
//         ? prev.filter((r) => r.id !== record.id)
//         : [...prev, record]
//     );
//     setEditedRecords((prev) => ({
//       ...prev,
//       [record.id]: { ...record },
//     }));
//   };

//   const handleFieldChange = (
//     recordId: string,
//     field: "punchIn" | "punchOut",
//     value: string
//   ) => {
//     setEditedRecords((prev) => ({
//       ...prev,
//       [recordId]: {
//         ...prev[recordId],
//         [field]: value,
//       },
//     }));
//   };

//   const handleUpdate = () => {
//     const updated = selectedRows.map((record) => editedRecords[record.id] || record);
//     if (onUpdateRecords) onUpdateRecords(updated);
//     setSelectedRows([]);
//     setEditedRecords({});
//   };

//   const customStyles = {
//       headCells: {
//         style: {
//           fontSize: "14px",
//           backgroundColor: "#D1E7FF",
//           color: "black",
//           whiteSpace: "nowrap",
//           textAlign: "left",
//         },
//       },
//       cells: { style: { fontSize: "13px", textAlign: "left" } },
//       table: {
//         style: { border: "1px solid #ddd", borderRadius: "20px", overflow: "hidden" },
//       },
//   };

 
//   const columns = [
//   {
//     name: (
//       <div>
//         <div>Sr No.</div>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => handleColumnFilter("srno", e.target.value)}
//           style={{
//             width: "100%",
//             padding: "4px",
//             fontSize: "12px",
//             border: "1px solid #ddd",
//             borderRadius: "3px",
//             marginTop: "5px"
//           }}
//         />
//       </div>
//     ),
//     selector: (row: AttendanceRecord, index: number) => index + 1,
//     width: "120px",
//     cell: (row: AttendanceRecord, index: number) => {
//       const isSelected = selectedRows.some(r => r.id === row.id);
//       return (
//         <div className="flex items-center">
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={() => handleCheckboxChange(row)}
//             className="mr-2"
//           />
//           {index + 1}
//         </div>
//       );
//     },
//     sortable: true,
//   },
//   {
//     name: (
//       <div>
//         <div>Employee</div>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => handleColumnFilter("employee", e.target.value)}
//           style={{
//             width: "100%",
//             padding: "4px",
//             fontSize: "12px",
//             border: "1px solid #ddd",
//             borderRadius: "3px",
//             marginTop: "5px"
//           }}
//         />
//       </div>
//     ),
//     selector: (row: AttendanceRecord) => getEmployee(row.employeeId)?.name || "Unknown Employee",
//     sortable: true,
//     cell: (row: AttendanceRecord) => {
//       const employee = getEmployee(row.employeeId);
//       return (
//         <div className="flex items-center">
//           <img
//             className="h-8 w-8 rounded-full"
//             src={getAvatarUrl(employee?.avatar)}
//             alt={employee?.name}
//             onError={(e) => {
//               (e.target as HTMLImageElement).src = fallbackImg;
//             }}
//           />
//           <div className="ml-3">
//             <div className="text-sm font-medium text-gray-900">
//               {employee?.name || "Unknown Employee"}
//             </div>
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     name: (
//       <div>
//         <div>Date</div>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => handleColumnFilter("date", e.target.value)}
//           style={{
//             width: "100%",
//             padding: "4px",
//             fontSize: "12px",
//             border: "1px solid #ddd",
//             borderRadius: "3px",
//             marginTop: "5px"
//           }}
//         />
//       </div>
//     ),
//     selector: (row: AttendanceRecord) => row.date,
//     sortable: true,
//     cell: (row: AttendanceRecord) => (
//       <div className="text-sm text-gray-900">
//         {format(parseISO(row.date), "MMM dd, yyyy")}
//       </div>
//     ),
//   },
//   {
//     name: (
//       <div>
//         <div>Punch In</div>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => handleColumnFilter("punchIn", e.target.value)}
//           style={{
//             width: "100%",
//             padding: "4px",
//             fontSize: "12px",
//             border: "1px solid #ddd",
//             borderRadius: "3px",
//             marginTop: "5px"
//           }}
//         />
//       </div>
//     ),
//     selector: (row: AttendanceRecord) => row.punchIn || "-",
//     sortable: true,
//     cell: (row: AttendanceRecord) => {
//       const isSelected = selectedRows.some(r => r.id === row.id);
//       const edited = editedRecords[row.id] || row;
      
//       return isSelected ? (
//         <input
//           type="time"
//           value={edited.punchIn || ""}
//           onChange={(e) =>
//             handleFieldChange(row.id, "punchIn", e.target.value)
//           }
//           className="border rounded px-2 py-1 text-sm"
//         />
//       ) : (
//         <span className="text-sm text-gray-900">{row.punchIn || "-"}</span>
//       );
//     },
//   },
//   {
//     name: (
//       <div>
//         <div>Punch Out</div>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => handleColumnFilter("punchOut", e.target.value)}
//           style={{
//             width: "100%",
//             padding: "4px",
//             fontSize: "12px",
//             border: "1px solid #ddd",
//             borderRadius: "3px",
//             marginTop: "5px"
//           }}
//         />
//       </div>
//     ),
//     selector: (row: AttendanceRecord) => row.punchOut || "-",
//     sortable: true,
//     cell: (row: AttendanceRecord) => {
//       const isSelected = selectedRows.some(r => r.id === row.id);
//       const edited = editedRecords[row.id] || row;
      
//       return isSelected ? (
//         <input
//           type="time"
//           value={edited.punchOut || ""}
//           onChange={(e) =>
//             handleFieldChange(row.id, "punchOut", e.target.value)
//           }
//           className="border rounded px-2 py-1 text-sm"
//         />
//       ) : (
//         <span className="text-sm text-gray-900">{row.punchOut || "-"}</span>
//       );
//     },
//   },
//   {
//     name: (
//       <div>
//         <div>Total Hours</div>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => handleColumnFilter("totalHours", e.target.value)}
//           style={{
//             width: "100%",
//             padding: "4px",
//             fontSize: "12px",
//             border: "1px solid #ddd",
//             borderRadius: "3px",
//             marginTop: "5px"
//           }}
//         />
//       </div>
//     ),
//     selector: (row: AttendanceRecord) => row.totalHours || 0,
//     sortable: true,
//     cell: (row: AttendanceRecord) => (
//       <div className="text-sm text-gray-900">
//         {row.totalHours ? `${row.totalHours}h` : "-"}
//       </div>
//     ),
//   },
//   {
//     name: (
//       <div>
//         <div>Status</div>
//         <input
//           type="text"
//           placeholder="Search..."
//           onChange={(e) => handleColumnFilter("status", e.target.value)}
//           style={{
//             width: "100%",
//             padding: "4px",
//             fontSize: "12px",
//             border: "1px solid #ddd",
//             borderRadius: "3px",
//             marginTop: "5px"
//           }}
//         />
//       </div>
//     ),
//     selector: (row: AttendanceRecord) => row.status,
//     sortable: true,
//     cell: (row: AttendanceRecord) => (
//       <span
//         className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//           row.status
//         )}`}
//       >
//         {getStatusIcon(row.status)}
//         <span className="capitalize">
//           {row.status.replace("-", " ")}
//         </span>
//       </span>
//     ),
//   },
// ];

//   return (
//     <div className=" h-100 flex flex-col">
//       {/* Header */}
//       <div className="flex items-center justify-between p-6 ">
//         <div className="flex items-center space-x-3">
//           <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
//             <Calendar className="w-5 h-5 text-green-600" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">
//               {selectedEmployee
//                 ? `${selectedEmployee.name}'s Attendance`
//                 : "All Employee Attendance"}
//             </h3>
//           </div>
//         </div>
        
//         {/* Search */}
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-5 w-5 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search records..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>
//       </div>

//       {/* DataTable */}
//       <div className="flex-1 overflow-y-auto scrollbar-hide">
//         <DataTable
//           columns={columns}
//           data={filteredRecords}
//           customStyles={customStyles}
//           pagination
//           paginationPerPage={10}
//           paginationRowsPerPageOptions={[10, 25, 50]}
//           highlightOnHover
//           responsive
//           noDataComponent={
//             <div className="text-center py-12">
//               <Calendar className="mx-auto h-12 w-12 text-gray-400" />
//               <h3 className="mt-2 text-sm font-medium text-gray-900">
//                 No attendance records
//               </h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 {selectedEmployee
//                   ? `No records found for ${selectedEmployee.name}`
//                   : "No attendance records available"}
//               </p>
//             </div>
//           }
//           persistTableHead
//         />
//       </div>

//       {/* Update Button */}
//       {selectedRows.length > 0 && (
//         <div className="p-4 border-t border-gray-200 flex justify-end">
//           <button
//             onClick={handleUpdate}
//             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             Update Selected ({selectedRows.length})
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendanceList;
"use client";
import React, { useState, useEffect, useMemo } from "react";
import EmployeeSelector from "@/app/content/User-Attendance/components/EmployeeSelector";
import { Employee } from "@/app/content/User-Attendance/types/attendance";
import { Search } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";

type AttendanceRow = {
  id: number;
  date: string;
  empNo: string;
  department: string;
  name: string;
  inTime: string;
  outTime: string;
  duration: string;
  selfie: string;
  status:
    | "Absent"
    | "Latecomer"
    | "HalfDay"
    | "Weekend"
    | "Holiday"
    | "SameInOut"
    | "Present";
};

export default function DemoMulti() {
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [tableData, setTableData] = useState<AttendanceRow[]>([]);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    userId: "",
    syear: "",
    user_profile_name: "",
  });
  const [filterText, setFilterText] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, user_id, syear, user_profile_name } =
        JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        syear: syear,
        userId: user_id,
        user_profile_name: user_profile_name,
      });
    }
  }, []);

  // 🔹 Helper: calculate duration
  const getDuration = (inTime: string, outTime: string): string => {
    if (!inTime || !outTime || inTime === "-" || outTime === "-") return "-";
    const [inH, inM, inS] = inTime.split(":").map(Number);
    const [outH, outM, outS] = outTime.split(":").map(Number);
    const inDate = new Date(2000, 0, 1, inH, inM, inS || 0);
    const outDate = new Date(2000, 0, 1, outH, outM, outS || 0);
    let diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs < 0) return "-";
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffH.toString().padStart(2, "0")}:${diffM
      .toString()
      .padStart(2, "0")}`;
  };

  // 🔹 Search button handler
  const handleSearch = async () => {
    try {
      const params = new URLSearchParams({
        token: sessionData.token,
        from_date: fromDate,
        to_date: toDate,
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        syear: sessionData.syear,
        user_id: sessionData.userId,
        user_profile_name: sessionData.user_profile_name,
      });

      selectedDepartments.forEach((deptId, idx) => {
        params.append(`department_id[${idx}]`, deptId);
      });
      selectedEmployees.forEach((emp, idx) => {
        params.append(`employee_id[${idx}]`, emp.id.toString());
      });

      const res = await fetch(
        `${sessionData.url}/hrms/multiple_attendance_report/create?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      console.log("API Response:", data);

      const getDateRange = (start: string, end: string) => {
        const result: string[] = [];
        let current = new Date(start);
        const last = new Date(end);
        while (current <= last) {
          result.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
        return result;
      };

      const dateRange = getDateRange(fromDate, toDate);
      const formatted: AttendanceRow[] = [];

      if (data.users && data.users.length > 0) {
        data.users.forEach((u: any) => {
          dateRange.forEach((date) => {
            let status: AttendanceRow["status"] = "Absent";
            let inTime = "-";
            let outTime = "-";

            // 🔹 Check holiday
            if (data.holidayData && data.holidayData.includes(date)) {
              status = "Holiday";
            }
            // 🔹 Check attendance logs from allData
            else if (data.allData && data.allData[date] && data.allData[date][u.id]) {
              const dayData = data.allData[date][u.id];
              inTime = dayData.att_punch_in || "-";
              outTime = dayData.att_punch_out || "-";

              if (!inTime || !outTime || inTime === "-" || outTime === "-") {
                status = "Absent";
              } else if (inTime === outTime) {
                status = "SameInOut";
              } else {
                // compare employee in_time vs punch in
                const empIn = dayData.in_time || "";
                const empOut = dayData.out_time || "";
                if (empIn && inTime > empIn) {
                  status = "Latecomer";
                } else if (empOut && outTime < empOut) {
                  status = "HalfDay";
                } else {
                  status = "Present";
                }
              }
            }
            // 🔹 Weekend check from user weekly off
            else {
              const day = new Date(date).getDay(); // 0=Sun, 1=Mon
              const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
              const key = dayMap[day];
              if (u[key] === 0) {
                status = "Weekend";
              }
            }

            formatted.push({
              id: Math.random(),
              date,
              empNo: u.employee_no || "-",
              department: u.depName || "-",
              name: u.full_name || `${u.first_name} ${u.last_name}`,
              inTime,
              outTime,
              duration: getDuration(inTime, outTime),
              selfie: u.image
                ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${u.image}`
                : "-",
              status,
            });
          });
        });
      }

      setTableData(formatted);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setTableData([]);
    }
  };

  // 🔹 Handle column filtering
  const handleColumnFilter = (columnName: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value.toLowerCase()
    }));
  };

  // 🔹 Filter data based on column filters and global search
  const filteredItems = useMemo(() => {
    return tableData.filter(item => {
      // Global search
      if (filterText) {
        const searchText = filterText.toLowerCase();
        if (
          !item.date.toLowerCase().includes(searchText) &&
          !item.empNo.toLowerCase().includes(searchText) &&
          !item.department.toLowerCase().includes(searchText) &&
          !item.name.toLowerCase().includes(searchText) &&
          !item.inTime.toLowerCase().includes(searchText) &&
          !item.outTime.toLowerCase().includes(searchText) &&
          !item.duration.toLowerCase().includes(searchText) &&
          !item.status.toLowerCase().includes(searchText)
        ) {
          return false;
        }
      }

      // Column-specific filters
      return Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        
        const columnValue = String(item[column as keyof AttendanceRow] || "").toLowerCase();
        return columnValue.includes(filterValue);
      });
    });
  }, [tableData, filterText, columnFilters]);

  // 🔹 Custom styles for DataTable
  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
    },
    cells: { style: { fontSize: "13px", textAlign: "left" } },
    table: {
      style: { border: "1px solid #ddd", borderRadius: "20px", overflow: "hidden" },
    },
  };

  // 🔹 Get status color for the circle
  const getStatusColor = (status: AttendanceRow["status"]) => {
    switch (status) {
      case "Absent":
        return "bg-red-500";
      case "Latecomer":
        return "bg-orange-500";
      case "HalfDay":
        return "bg-yellow-300";
      case "Weekend":
        return "bg-green-300";
      case "Holiday":
        return "bg-green-500";
      case "SameInOut":
        return "bg-pink-300";
      case "Present":
        return "bg-white border border-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  // 🔹 DataTable columns configuration
  const columns: TableColumn<AttendanceRow>[] = [
    {
      name: (
        <div>
          <div>Sr No.</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("id", e.target.value)}
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
      cell: (row: AttendanceRow, index?: number) => (index !== undefined ? index + 1 : 0),
      sortable: true,
      width: "80px"
    },
    {
      name: (
        <div>
          <div>Date</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("date", e.target.value)}
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
      selector: (row: AttendanceRow) => row.date,
      sortable: true,
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
      selector: (row: AttendanceRow) => row.empNo,
      sortable: true,
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
      selector: (row: AttendanceRow) => row.department,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Employee Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("name", e.target.value)}
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
      selector: (row: AttendanceRow) => row.name,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>In Time</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("inTime", e.target.value)}
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
      selector: (row: AttendanceRow) => row.inTime,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Out Time</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("outTime", e.target.value)}
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
      selector: (row: AttendanceRow) => row.outTime,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Duration</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("duration", e.target.value)}
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
      selector: (row: AttendanceRow) => row.duration,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Status</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("status", e.target.value)}
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
      selector: (row: AttendanceRow) => row.status,
      sortable: true,
      cell: (row: AttendanceRow) => (
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor(row.status)}`} />
          <span>{row.status}</span>
        </div>
      ),
    }
  ];

  const legendItems = [
    { label: "Absent", color: "bg-red-500" },
    { label: "Latecomer", color: "bg-orange-500" },
    { label: "HalfDay", color: "bg-yellow-300" },
    { label: "Weekend", color: "bg-green-300" },
    { label: "Holiday", color: "bg-green-500" },
    { label: "Punch-in and Punch-out same", color: "bg-pink-300" },
    { label: "Present", color: "bg-white border border-gray-300" },
  ];

  // 🔹 Remove customRowStyles since we're not coloring the entire row anymore
  const customRowStyles: any[] = [];

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <EmployeeSelector
            multiSelect
            empMultiSelect={true}
            selectedEmployee={selectedEmployees}
            selectedDepartment={selectedDepartments}
            onSelectEmployee={setSelectedEmployees}
            onSelectDepartment={setSelectedDepartments}
          />
        </div>

        <div className="mb-28">
          <label className="block text-sm font-medium text-gray-700">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block px-4 py-3 w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="mb-28">
          <label className="block text-sm font-medium text-gray-700">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div
          onClick={handleSearch}
          className="flex items-center mb-28 justify-center space-x-2 px-4 py-3 text-sm font-medium  rounded-lg cursor-pointer mb-28 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
        >
          <Search className="w-4 h-4 text-black" />
          <span className="text-black">Search</span>
        </div>
      </div>

      {/* Legend Section */}
      <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-700">
        <span className="mr-2">Colours Description =&gt;</span>
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Global Search */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Global search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          style={{ width: '300px' }}
        />
      </div>

      {/* DataTable */}
      {tableData.length > 0 && (
        <div>
          <DataTable
            columns={columns}
            data={filteredItems}
            customStyles={customStyles}
            conditionalRowStyles={customRowStyles}
            pagination
            highlightOnHover
            responsive
            noDataComponent={<div className="p-4 text-center">No data available</div>}
            persistTableHead
          />
        </div>
      )}
    </div>
  );
}