


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

  // ✅ View profile navigation - UPDATED with better localStorage handling
  const handleViewProfileMenu = (employee) => {
    console.log("👤 Employee ID clicked:", employee.id);
    
    // Store employee data for the report page with timestamp to avoid conflicts
    const employeeData = {
      id: employee.id,
      full_name: employee.full_name,
      timestamp: Date.now()
    };
    
    // Store in multiple places for redundancy
    localStorage.setItem('selectedEmployeeId', employee.id.toString());
    localStorage.setItem('selectedEmployeeData', JSON.stringify(employeeData));
    sessionStorage.setItem('selectedEmployeeId', employee.id.toString());
    
    console.log("💾 Stored employee ID:", employee.id);
    
    // Use setTimeout to ensure localStorage is set before navigation
    setTimeout(() => {
      // Trigger navigation to employee report
      window.dispatchEvent(
        new CustomEvent('menuSelected', {
          detail: { 
            menu: "Reports/employee/EmployeeReport.tsx", 
            pageType: 'page', 
            access: "Reports/employee/EmployeeReport.tsx", 
            pageProps: employee.id || null 
          },
        })
      );
    }, 100);
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
              onClick={() => handleViewProfileMenu(row)}
              className="font-medium text-foreground hover:text-primary transition-smooth block truncate pt-3 cursor-pointer"
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
      style: {
        border: "1px solid #ddd",
        borderRadius: "20px",
        overflow: "hidden",
      },
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