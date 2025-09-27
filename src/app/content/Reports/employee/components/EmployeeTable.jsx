// 'use client';
// import React, { useState, useEffect } from 'react';
// import Image from '../../../../../components/AppImage';
// import Icon from '../../../../../components/AppIcon';
// import { Button } from '../../../../../components/ui/button';
// import { createPortal } from "react-dom";

// const fallbackImg =
//   'https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39';

// /**
//  * ✅ Reusable avatar with safe fallback
//  */
// const EmployeeAvatar = ({ image, full_name, status }) => {
//   const [imgSrc, setImgSrc] = useState(() => {
//     if (image && image.trim()) {
//       return image.startsWith('http')
//         ? image
//         : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
//             image
//           )}`;
//     }
//     return fallbackImg;
//   });

//   return (
//     <div className="relative flex-shrink-0">
//       <Image
//         src={imgSrc}
//         alt={full_name || 'Employee'}
//         className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
//         onError={() => setImgSrc(fallbackImg)} // 👈 fallback if broken
//       />
//       <div
//         className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-card ${getStatusColor(
//           status
//         )}`}
//       />
//     </div>
//   );
// };

// const getStatusColor = (status) => {
//   switch (status) {
//     case 'Active':
//       return 'bg-success';
//     case 'Inactive':
//       return 'bg-warning';
//     case 'Offline':
//       return 'bg-muted';
//     default:
//       return 'bg-muted';
//   }
// };

// const EmployeeTable = ({
//   employees,
//   selectedEmployees,
//   onSelectEmployee,
//   onSelectAll,
//   onSort,
//   sortConfig
// }) => {
//   const [showActions, setShowActions] = useState(null);
//   const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
//   const [clickedButtonRect, setClickedButtonRect] = useState(null);

//   const safeEmployees = Array.isArray(employees) ? employees : [];

//   // ✅ Calculate menu position
//   useEffect(() => {
//     if (clickedButtonRect) {
//       const dropdownHeight = 150;
//       const dropdownWidth = 192;
//       const spaceBelow = window.innerHeight - clickedButtonRect.bottom;

//       const direction = spaceBelow < dropdownHeight ? "up" : "down";

//       let top =
//         direction === "up"
//           ? clickedButtonRect.top + window.scrollY - dropdownHeight
//           : clickedButtonRect.bottom + window.scrollY;

//       let left = clickedButtonRect.left + window.scrollX;

//       if (left + dropdownWidth > window.innerWidth) {
//         left = window.innerWidth - dropdownWidth - 8;
//       }
//       if (left < 0) left = 8;

//       setMenuCoords({ top, left });
//     }
//   }, [clickedButtonRect]);

//   const getSortIcon = (column) => {
//     if (!sortConfig || sortConfig.key !== column) return 'ArrowUpDown';
//     return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
//   };

//   const handleSort = (column) => {
//     onSort(column);
//   };

//   const triggerMenuNavigation = (employeeId, menu) => {
//     localStorage.setItem('clickedUser', employeeId);
//     window.__currentMenuItem = menu;
//     window.dispatchEvent(
//       new CustomEvent('menuSelected', {
//         detail: { menu, pageType: 'page', access: menu, pageProps: employeeId || null },
//       })
//     );
//   };

//   const handleViewProfileMenu = (employee) => {
//     triggerMenuNavigation(employee.id, 'Reports/employee/EmployeeReport.tsx');
//   };
//   // const handleEditEmployeeMenu = (employee) => {
//   //   triggerMenuNavigation(employee.id, 'user/usersTabs.tsx');
//   // };
//   // const handleAssignTaskMenu = (employee) => {
//   //   triggerMenuNavigation(employee.id, 'task/taskManagement.tsx');
//   // };

//   const handleMenuToggle = (employeeId, e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     setClickedButtonRect(rect);
//     setShowActions(showActions === employeeId ? null : employeeId);
//   };

//   return (
//     <div className="bg-card border border-border rounded-lg overflow-hidden">
//       {/* Desktop Table */}
//       <div className="hidden sm:block overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-muted border-b border-border">
//             <tr>
//               <th className="text-left px-3 lg:px-4 py-3 min-w-[200px]">
//                 <button
//                   onClick={() => handleSort('name')}
//                   className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
//                 >
//                   <span>Employee</span>
//                   <Icon name={getSortIcon('name')} size={14} />
//                 </button>
//               </th>
//               <th className="text-left px-3 lg:px-4 py-3 hidden lg:table-cell">
//                 <button
//                   onClick={() => handleSort('mobile')}
//                   className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
//                 >
//                   <span>Mobile</span>
//                   <Icon name={getSortIcon('mobile')} size={14} />
//                 </button>
//               </th>
//               <th className="text-left px-3 lg:px-4 py-3 hidden xl:table-cell">
//                 <button
//                   onClick={() => handleSort('profile')}
//                   className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
//                 >
//                   <span>Role</span>
//                   <Icon name={getSortIcon('profile')} size={14} />
//                 </button>
//               </th>
//               <th className="text-left px-3 lg:px-4 py-3 hidden lg:table-cell">
//                 <button
//                   onClick={() => handleSort('location')}
//                   className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
//                 >
//                   <span>Status</span>
//                   <Icon name={getSortIcon('location')} size={14} />
//                 </button>
//               </th>
//               {/* <th className="w-12 sm:w-16 px-3 lg:px-4 py-3">
//                 <span className="text-sm font-medium text-foreground">Actions</span>
//               </th> */}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-border">
//             {safeEmployees.map((employee) => (
//               <tr key={employee.id} className="hover:bg-muted/50 transition-smooth">
//                 <td className="px-3 lg:px-4 py-4">
//                   <div className="flex items-center space-x-3">
//                     <EmployeeAvatar
//                       image={employee.image}
//                       full_name={employee.full_name}
//                       status={employee.status}
//                     />
//                     <div className="min-w-0">
//                       <button
//                         onClick={() => handleViewProfileMenu(employee)}
//                         className="font-medium text-foreground hover:text-primary transition-smooth block truncate"
//                       >
//                         {employee.full_name}
//                       </button>
//                       <p className="text-sm text-muted-foreground truncate">
//                         {employee.email}
//                       </p>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="px-3 lg:px-4 py-4 hidden lg:table-cell">
//                   <span className="text-sm text-foreground">{employee.mobile}</span>
//                 </td>

//                 <td className="px-3 lg:px-4 py-4 hidden xl:table-cell">
//                   <span className="text-sm text-foreground">{employee.profile_name}</span>
//                 </td>

//                 <td className="px-3 lg:px-4 py-4 hidden lg:table-cell">
//                   <div className="flex items-center space-x-2 text-sm text-foreground">
//                     <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(employee.status)}`} />
//                     <span>{employee.status}</span>
//                   </div>
//                 </td>

//                 {/* <td className="px-3 lg:px-4 py-4">
//                   <div className="relative">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={(e) => handleMenuToggle(employee.id, e)}
//                       className="h-8 w-8"
//                     >
//                       <Icon name="MoreHorizontal" size={16} />
//                     </Button>

//                     {showActions === employee.id &&
//                       createPortal(
//                         <div
//                           className="absolute w-48 bg-popover border border-border rounded-md shadow-lg z-50"
//                           style={{ top: menuCoords.top, left: menuCoords.left, position: "absolute" }}
//                         >
//                           <div className="py-2">
//                             <button
//                               onClick={() => handleEditEmployeeMenu(employee)}
//                               className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center space-x-2"
//                             >
//                               <Icon name="Edit" size={16} />
//                               <span>Edit Employee</span>
//                             </button>
//                             <button
//                               onClick={() => handleAssignTaskMenu(employee)}
//                               className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center space-x-2"
//                             >
//                               <Icon name="Plus" size={16} />
//                               <span>Assign Task</span>
//                             </button>
//                           </div>
//                         </div>,
//                         document.body
//                       )}
//                   </div>
//                 </td> */}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Overlay to close actions dropdown */}
//       {showActions && (
//         <div className="fixed inset-0 z-40" onClick={() => setShowActions(null)} />
//       )}
//     </div>
//   );
// };

// export default EmployeeTable;


"use client";
import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import Image from "../../../../../components/AppImage";
import Icon from "../../../../../components/AppIcon";

const fallbackImg =
  "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

/**
 * ✅ Reusable avatar with safe fallback
 */
const EmployeeAvatar = ({ image, full_name, status }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    if (image && image.trim()) {
      return image.startsWith("http")
        ? image
        : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
            image
          )}`;
    }
    return fallbackImg;
  });

  return (
    <div className="relative flex-shrink-0">
      <Image
        src={imgSrc}
        alt={full_name || "Employee"}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
        onError={() => setImgSrc(fallbackImg)}
      />
      <div
        className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-card ${getStatusColor(
          status
        )}`}
      />
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "bg-success";
    case "Inactive":
      return "bg-warning";
    case "Offline":
      return "bg-muted";
    default:
      return "bg-muted";
  }
};

const EmployeeTable = ({ employees }) => {
  const [filters, setFilters] = useState({});

  // ✅ Column filter handler
  const handleColumnFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value.toLowerCase() }));
  };

  // ✅ Filtered employees
  const displayData = useMemo(() => {
    return employees.filter((row) => {
      return Object.entries(filters).every(([key, value]) =>
        row[key]?.toString().toLowerCase().includes(value)
      );
    });
  }, [employees, filters]);

  const handleSort = (column, sortDirection) => {
    console.log("Sorting:", column.selector, sortDirection);
    // hook this to server API if needed
  };

  // ✅ Columns config
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
              marginTop: "5px",
            }}
          />
        </div>
      ),
      selector: (_row, index) => index + 1,
      sortable: true,
      width: "70px",
    },
    {
      name: (
        <div>
          <div>Employee</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("full_name", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              marginTop: "5px",
            }}
          />
        </div>
      ),
      selector: (row) => row.full_name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center space-x-5">
          <EmployeeAvatar
            image={row.image}
            full_name={row.full_name}
            status={row.status}
          />
          <div className="min-w-0 space-y-1">
            <button
              onClick={() => console.log("View Profile", row.id)}
              className="font-medium text-foreground hover:text-primary transition-smooth block truncate pt-3"
            >
              {row.full_name}
            </button>
            <p className="text-sm text-muted-foreground truncate pb-3">
              {row.email}
            </p>
          </div>
        </div>
      ),
      minWidth: "220px",
    },
    {
      name: (
        <div>
          <div>Mobile</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("mobile", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              marginTop: "5px",
            }}
          />
        </div>
      ),
      selector: (row) => row.mobile,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Role</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("profile_name", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              marginTop: "5px",
            }}
          />
        </div>
      ),
      selector: (row) => row.profile_name,
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
              marginTop: "5px",
            }}
          />
        </div>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center space-x-2 text-sm text-foreground">
          <span
            className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
              row.status
            )}`}
          />
          <span>{row.status}</span>
        </div>
      ),
    },
  ];

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

  return (
    <DataTable
      columns={columns}
      data={displayData}
      customStyles={customStyles}
      pagination
      highlightOnHover
      responsive
      noDataComponent={
        <div className="p-4 text-center">No employees found</div>
      }
      persistTableHead
      onSort={handleSort}
      sortServer={true}
    />
  );
};

export default EmployeeTable;
