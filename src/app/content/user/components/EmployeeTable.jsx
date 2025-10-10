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

    // Map menu paths to their corresponding routes
    const menuRoutes = {
      'user/viewProfile.tsx': `/content/user/profile/`,
      'user/usersTabs.tsx': `/content/user/edit/`,
      'task/taskManagement.tsx': `/content/task/assign/`
    };

    // Get the corresponding route path
    const routePath = menuRoutes[menu];

    if (routePath) {
      // Use router.push to navigate
      window.location.href = routePath;
    }
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
            {/* <button
              onClick={() => handleViewProfileMenu(row)}
              className="font-medium text-foreground hover:text-primary transition-smooth block truncate pt-3"
            > */}
              {row.full_name}
            {/* </button> */}
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