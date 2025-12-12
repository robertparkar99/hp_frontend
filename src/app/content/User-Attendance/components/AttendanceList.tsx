"use client";
import React, { useState, useMemo, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Clock, Calendar, AlertCircle, User, ChevronUp, ChevronDown, Search } from "lucide-react";
import { AttendanceRecord, Employee } from "../types/attendance";
import { format, parseISO } from "date-fns";

interface AttendanceListProps {
  records: AttendanceRecord[];
  employees: Employee[];
  selectedEmployee: Employee | null;
  onUpdateRecords?: (updated: AttendanceRecord[]) => void;
  fromDate?: string;
  toDate?: string;
}

const fallbackImg =
  "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

const getAvatarUrl = (image?: string): string => {
  if (image && image.trim()) {
    return image.startsWith("http")
      ? image
      : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
          image
        )}`;
  }
  return fallbackImg;
};

const AttendanceList: React.FC<AttendanceListProps> = ({
  records,
  employees,
  selectedEmployee,
  onUpdateRecords,
  fromDate,
  toDate,
}) => {
  const [selectedRows, setSelectedRows] = useState<AttendanceRecord[]>([]);
  const [editedRecords, setEditedRecords] = useState<Record<string, AttendanceRecord>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

const handleColumnFilter = (columnKey: string, value: string) => {
  setColumnFilters(prev => ({
    ...prev,
    [columnKey]: value
  }));
};



  // const getEmployee = (employeeId: string): Employee | undefined => {
  //   return employees.find((emp) => emp.id === employeeId);
  // };
   const getEmployee = (employeeId: string): Employee | undefined => {
     return employees.find((emp) => emp.id === employeeId);
   };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "early-leave":
        return "bg-orange-100 text-orange-800";
      case "absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <Clock className="w-3 h-3" />;
      case "late":
      case "early-leave":
        return <AlertCircle className="w-3 h-3" />;
      case "absent":
        return <User className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

// Then update your filteredRecords logic to include column filtering
 const filteredRecords = useMemo(() => {
   let result = selectedEmployee
     ? records.filter((record) => record.employeeId === selectedEmployee.id.toString())
     : records;

   if (fromDate) {
     result = result.filter(
       (rec) => new Date(rec.date) >= new Date(fromDate)
     );
   }
   if (toDate) {
     result = result.filter(
       (rec) => new Date(rec.date) <= new Date(toDate)
     );
   }

   // Apply search filter
   if (searchTerm) {
     result = result.filter(record => {
       const employee = getEmployee(record.employeeId);
       return (
         employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.punchIn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.punchOut?.toLowerCase().includes(searchTerm.toLowerCase())
       );
     });
   }

   // Apply column filters
   if (Object.keys(columnFilters).length > 0) {
     result = result.filter(record => {
       const employee = getEmployee(record.employeeId);

       return Object.entries(columnFilters).every(([key, filterValue]) => {
         if (!filterValue) return true;

         switch (key) {
           case 'srno':
             // This would need to be handled differently as it's based on index
             return true;
           case 'employee':
             return employee?.name?.toLowerCase().includes(filterValue.toLowerCase()) || false;
           case 'date':
             return format(parseISO(record.date), "MMM dd, yyyy").toLowerCase().includes(filterValue.toLowerCase());
           case 'punchIn':
             return record.punchIn?.toLowerCase().includes(filterValue.toLowerCase()) || false;
           case 'punchOut':
             return record.punchOut?.toLowerCase().includes(filterValue.toLowerCase()) || false;
           case 'totalHours':
             return record.totalHours?.toString().includes(filterValue) || false;
           case 'status':
             return record.status.toLowerCase().includes(filterValue.toLowerCase());
           default:
             return true;
         }
       });
     });
   }

   return result;
 }, [records, employees, selectedEmployee, fromDate, toDate, searchTerm, columnFilters]);

  // Filter records based on selected employee and date range
  // useMemo(() => {
  //   let result = selectedEmployee
  //     ? records.filter((record) => record?.employeeId === selectedEmployee?.id)
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

  //   setFilteredRecords(result);
  // }, [records, employees, selectedEmployee, fromDate, toDate, searchTerm]);

  const handleCheckboxChange = (record: AttendanceRecord) => {
    setSelectedRows((prev) =>
      prev.some(r => r.id === record.id)
        ? prev.filter((r) => r.id !== record.id)
        : [...prev, record]
    );
    setEditedRecords((prev) => ({
      ...prev,
      [record.id]: { ...record },
    }));
  };

  const handleFieldChange = (
    recordId: string,
    field: "punchIn" | "punchOut",
    value: string
  ) => {
    setEditedRecords((prev) => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [field]: value,
      },
    }));
  };

  const handleUpdate = () => {
    const updated = selectedRows.map((record) => editedRecords[record.id] || record);
    if (onUpdateRecords) onUpdateRecords(updated);
    setSelectedRows([]);
    setEditedRecords({});
  };

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

  // const columns = [
  //   {
  //     name: "Sr. No",
  //     selector: (row: AttendanceRecord, index: number) => index + 1,
  //     width: "80px",
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
  //   },
  //   {
  //     name: "Employee",
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
  //     name: "Date",
  //     selector: (row: AttendanceRecord) => row.date,
  //     sortable: true,
  //     cell: (row: AttendanceRecord) => (
  //       <div className="text-sm text-gray-900">
  //         {format(parseISO(row.date), "MMM dd, yyyy")}
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "Punch In",
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
  //     name: "Punch Out",
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
  //     name: "Total Hours",
  //     selector: (row: AttendanceRecord) => row.totalHours || 0,
  //     sortable: true,
  //     cell: (row: AttendanceRecord) => (
  //       <div className="text-sm text-gray-900">
  //         {row.totalHours ? `${row.totalHours}h` : "-"}
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "Status",
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

  const columns = [
  {
    name: (
      <div>
        <div>Sr No.</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("srno", e.target.value)}
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
    selector: (row: AttendanceRecord, index: number) => index + 1,
    width: "120px",
    cell: (row: AttendanceRecord, index: number) => {
      const isSelected = selectedRows.some(r => r.id === row.id);
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCheckboxChange(row)}
            className="mr-2"
          />
          {index + 1}
        </div>
      );
    },
    sortable: true,
  },
  {
    name: (
      <div>
        <div>Employee</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("employee", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
        
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: AttendanceRecord) => getEmployee(row.employeeId)?.name || "Unknown Employee",
    sortable: true,
    cell: (row: AttendanceRecord) => {
      const employee = getEmployee(row.employeeId);
      return (
        <div className="flex items-center">
          <img
            className="h-8 w-8 rounded-full"
            src={getAvatarUrl(employee?.avatar)}
            alt={employee?.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImg;
            }}
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {employee?.name || "Unknown Employee"}
            </div>
          </div>
        </div>
      );
    },
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
           
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: AttendanceRecord) => row.date,
    sortable: true,
    cell: (row: AttendanceRecord) => (
      <div className="text-sm text-gray-900">
        {format(parseISO(row.date), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    name: (
      <div>
        <div>Punch In</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("punchIn", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
           
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: AttendanceRecord) => row.punchIn || "-",
    sortable: true,
    cell: (row: AttendanceRecord) => {
      const isSelected = selectedRows.some(r => r.id === row.id);
      const edited = editedRecords[row.id] || row;
      
      return isSelected ? (
        <input
          type="time"
          value={edited.punchIn || ""}
          onChange={(e) =>
            handleFieldChange(row.id, "punchIn", e.target.value)
          }
          className="border rounded px-2 py-1 text-sm"
        />
      ) : (
        <span className="text-sm text-gray-900">{row.punchIn || "-"}</span>
      );
    },
  },
  {
    name: (
      <div>
        <div>Punch Out</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("punchOut", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
          
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: AttendanceRecord) => row.punchOut || "-",
    sortable: true,
    cell: (row: AttendanceRecord) => {
      const isSelected = selectedRows.some(r => r.id === row.id);
      const edited = editedRecords[row.id] || row;
      
      return isSelected ? (
        <input
          type="time"
          value={edited.punchOut || ""}
          onChange={(e) =>
            handleFieldChange(row.id, "punchOut", e.target.value)
          }
          className="border rounded px-2 py-1 text-sm"
        />
      ) : (
        <span className="text-sm text-gray-900">{row.punchOut || "-"}</span>
      );
    },
  },
  {
    name: (
      <div>
        <div>Total Hours</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("totalHours", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
            
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: AttendanceRecord) => row.totalHours || 0,
    sortable: true,
    cell: (row: AttendanceRecord) => (
      <div className="text-sm text-gray-900">
        {row.totalHours ? `${row.totalHours}h` : "-"}
      </div>
    ),
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
            
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: AttendanceRecord) => row.status,
    sortable: true,
    cell: (row: AttendanceRecord) => (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
          row.status
        )}`}
      >
        {getStatusIcon(row.status)}
        <span className="capitalize">
          {row.status.replace("-", " ")}
        </span>
      </span>
    ),
  },
];

  return (
    <div className=" h-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 ">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedEmployee
                ? `${selectedEmployee.name}'s Attendance`
                : "All Employee Attendance"}
            </h3>
          </div>
        </div>
        
        {/* Search */}
        {/* <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div> */}
      </div>

      {/* DataTable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <DataTable
          columns={columns}
          data={filteredRecords}
          customStyles={customStyles}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
          highlightOnHover
          responsive
          noDataComponent={
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No attendance records
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedEmployee
                  ? `No records found for ${selectedEmployee.name}`
                  : "No attendance records available"}
              </p>
            </div>
          }
          persistTableHead
        />
      </div>

      {/* Update Button */}
      {selectedRows.length > 0 && (
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Update Selected ({selectedRows.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;