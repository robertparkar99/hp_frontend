// 'use client';
// import React, { useState, useEffect } from 'react';
// import Image from '../../../../components/AppImage';
// import Icon from '../../../../components/AppIcon';
// import { Button } from '../../../../components/ui/button';
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
//     triggerMenuNavigation(employee.id, 'user/viewProfile.tsx');
//   };
//   const handleEditEmployeeMenu = (employee) => {
//     triggerMenuNavigation(employee.id, 'user/usersTabs.tsx');
//   };
//   const handleAssignTaskMenu = (employee) => {
//     triggerMenuNavigation(employee.id, 'task/taskManagement.tsx');
//   };

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
//               <th className="text-left px-3 lg:px-4 py-3 hidden lg:table-cell">
//                 <button
//                   onClick={() => handleSort('department_name')}
//                   className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
//                 >
//                   <span>Department</span>
//                   <Icon name={getSortIcon('department_name')} size={14} />
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
//               <th className="w-12 sm:w-16 px-3 lg:px-4 py-3">
//                 <span className="text-sm font-medium text-foreground">Actions</span>
//               </th>
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
//                 <td className="px-3 lg:px-4 py-4 hidden lg:table-cell">
//                   <span className="text-sm text-foreground">{employee.department_name}</span>
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

//                 <td className="px-3 lg:px-4 py-4">
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
//                 </td>
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


'use client';
import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Image from '../../../../components/AppImage';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';
import { createPortal } from "react-dom";

const fallbackImg =
  'https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39';

/**
 * ✅ Reusable avatar with safe fallback
 */
const EmployeeAvatar = ({ image, full_name, status }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    if (image && image.trim()) {
      return image.startsWith('http')
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
        alt={full_name || 'Employee'}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
        onError={() => setImgSrc(fallbackImg)} // 👈 fallback if broken
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
    case 'Active':
      return 'bg-success';
    case 'Inactive':
      return 'bg-warning';
    case 'Offline':
      return 'bg-muted';
    default:
      return 'bg-muted';
  }
};

const EmployeeTable = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onSort,
  sortConfig
}) => {
  const [showActions, setShowActions] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [clickedButtonRect, setClickedButtonRect] = useState(null);
  const [filters, setFilters] = useState({});

  const safeEmployees = Array.isArray(employees) ? employees : [];

  // ✅ Calculate menu position
  useEffect(() => {
    if (clickedButtonRect) {
      const dropdownHeight = 150;
      const dropdownWidth = 192;
      const spaceBelow = window.innerHeight - clickedButtonRect.bottom;

      const direction = spaceBelow < dropdownHeight ? "up" : "down";

      let top =
        direction === "up"
          ? clickedButtonRect.top + window.scrollY - dropdownHeight
          : clickedButtonRect.bottom + window.scrollY;

      let left = clickedButtonRect.left + window.scrollX;

      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      if (left < 0) left = 8;

      setMenuCoords({ top, left });
    }
  }, [clickedButtonRect]);

  const getSortIcon = (column) => {
    if (!sortConfig || sortConfig.key !== column) return 'ArrowUpDown';
    return sortConfig.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const handleSort = (column, sortDirection) => {
    onSort(column, sortDirection);
  };

  const triggerMenuNavigation = (employeeId, menu) => {
    localStorage.setItem('clickedUser', employeeId);
    window.__currentMenuItem = menu;
    window.dispatchEvent(
      new CustomEvent('menuSelected', {
        detail: { menu, pageType: 'page', access: menu, pageProps: employeeId || null },
      })
    );
  };

  const handleViewProfileMenu = (employee) => {
    triggerMenuNavigation(employee.id, 'user/viewProfile.tsx');
  };
  const handleEditEmployeeMenu = (employee) => {
    triggerMenuNavigation(employee.id, 'user/usersTabs.tsx');
  };
  const handleAssignTaskMenu = (employee) => {
    triggerMenuNavigation(employee.id, 'task/taskManagement.tsx');
  };

  const handleMenuToggle = (employeeId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickedButtonRect(rect);
    setShowActions(showActions === employeeId ? null : employeeId);
  };

 
  const handleColumnFilter = (columnKey, value) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };


  // Filter data based on all active filters
  const filteredData = safeEmployees.filter((item,index) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      
  // Handle serial number search
      if (key === 'srno') {
        const serialNumber = index + 1;
        return serialNumber.toString().toLowerCase().includes(filterValue.toLowerCase());
      }

      const cellValue = item[key] ? item[key].toString().toLowerCase() : '';
      return cellValue.includes(filterValue.toLowerCase());
    });
  });

  const displayData = filteredData.length > 0 ? filteredData : safeEmployees;

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
              
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row, index) => index + 1,
      sortable: true,
      width: "60px"
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

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.full_name,
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
              onClick={() => handleViewProfileMenu(row)}
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
      minWidth: "200px"
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
             
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.mobile,
      sortable: true,
      omit: window.innerWidth < 1024 // Hide on mobile
    },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("department_name", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
             
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.department_name,
      sortable: true,
      omit: window.innerWidth < 1024 // Hide on mobile
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
              
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.profile_name,
      sortable: true,
      omit: window.innerWidth < 1280 // Hide on smaller screens
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
      selector: row => row.status,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center space-x-2 text-sm text-foreground">
          <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(row.status)}`} />
          <span>{row.status}</span>
        </div>
      ),
      omit: window.innerWidth < 1024 // Hide on mobile
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleMenuToggle(row.id, e)}
            className="h-8 w-8"
          >
            <Icon name="MoreHorizontal" size={16} />
          </Button>

          {showActions === row.id &&
            createPortal(
              <div
                className="absolute w-48 bg-popover border border-border rounded-md shadow-lg z-50"
                style={{ top: menuCoords.top, left: menuCoords.left, position: "absolute" }}
              >
                <div className="py-2">
                  <button
                    onClick={() => handleEditEmployeeMenu(row)}
                    className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center space-x-2"
                  >
                    <Icon name="Edit" size={16} />
                    <span>Edit Employee</span>
                  </button>
                  <button
                    onClick={() => handleAssignTaskMenu(row)}
                    className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center space-x-2"
                  >
                    <Icon name="Plus" size={16} />
                    <span>Assign Task</span>
                  </button>
                </div>
              </div>,
              document.body
            )}
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      width: "80px"
    },
  ];

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <DataTable
        columns={columns}
        data={displayData}
        customStyles={customStyles}
        pagination
        highlightOnHover
        responsive
        noDataComponent={<div className="p-4 text-center">No employees found</div>}
        persistTableHead
        onSort={handleSort}
        sortServer={true}
      />

      {/* Overlay to close actions dropdown */}
      {showActions && (
        <div className="fixed inset-0 z-40" onClick={() => setShowActions(null)} />
      )}
    </div>
  );
};

export default EmployeeTable;