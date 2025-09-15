"use client";

import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PayrollTypeDialog } from "./PayrollTypeDialog";

// ✅ Row Type
interface PayrollType {
  id: number;
  type: string;
  name: string;
  amountType: string;
  amount?: number | null;
  percentage: number | null;
  status: "Active" | "Inactive";
  dayWiseCount: boolean;
}

// ✅ Sample Payroll Data
const initialPayrollTypes: PayrollType[] = [
  {
    id: 1,
    type: "Earning",
    name: "Basic Salary",
    amountType: "Fixed",
    amount: 1250,
    percentage: null,
    status: "Active",
    dayWiseCount: false,
  },
  {
    id: 2,
    type: "Earning",
    name: "House Rent Allowance",
    amountType: "Percentage",
    amount: null,
    percentage: 40,
    status: "Active",
    dayWiseCount: false,
  },
  {
    id: 3,
    type: "Deduction",
    name: "Professional Tax",
    amountType: "Fixed",
    amount: 1250,
    percentage: null,
    status: "Active",
    dayWiseCount: false,
  },
  {
    id: 4,
    type: "Deduction",
    name: "Provident Fund",
    amountType: "Percentage",
    amount: null,
    percentage: 12,
    status: "Active",
    dayWiseCount: false,
  },
  {
    id: 5,
    type: "Earning",
    name: "Medical Allowance",
    amountType: "Fixed",
    amount: 1250,
    percentage: null,
    status: "Inactive",
    dayWiseCount: true,
  },
];

export default function PayrollTypes() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dataList, setDataList] = useState<PayrollType[]>(initialPayrollTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollType | null>(null);
  const [formData, setFormData] = useState<Omit<PayrollType, "id">>({
    type: "Earning",
    name: "",
    amountType: "Fixed",
    amount: null,
    percentage: null,
    status: "Active",
    dayWiseCount: false,
  });

  // ✅ Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Open dialog for adding new payroll type
  const handleAddClick = () => {
    setFormData({
      type: "Earning",
      name: "",
      amountType: "Fixed",
      amount: null,
      percentage: null,
      status: "Active",
      dayWiseCount: false,
    });
    setEditingPayroll(null);
    setIsDialogOpen(true);
  };

  // ✅ Open dialog for editing payroll type
  const handleEditClick = (id: number) => {
    const payroll = dataList.find(item => item.id === id);
    if (payroll) {
      const { id: _, ...rest } = payroll;
      setFormData(rest);
      setEditingPayroll(payroll);
      setIsDialogOpen(true);
    }
  };

  // ✅ Save payroll type (both add and edit)
  const handleSave = (formData: Omit<PayrollType, "id">) => {
    if (editingPayroll) {
      // Update existing payroll type
      setDataList(prev => 
        prev.map(item => 
          item.id === editingPayroll.id 
            ? { ...formData, id: editingPayroll.id } 
            : item
        )
      );
    } else {
      // Add new payroll type
      const newId = Math.max(...dataList.map(item => item.id), 0) + 1;
      setDataList(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsDialogOpen(false);
    setEditingPayroll(null);
  };

  // ✅ Column-wise filtering
  const handleColumnFilter = (key: keyof PayrollType | "srno", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value.toLowerCase(),
    }));
  };

  // ✅ Row Filtering Logic
  const filteredData = dataList.filter((row) => {
    // global search
    const globalMatch =
      row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.amountType?.toLowerCase().includes(searchTerm.toLowerCase());

    // column search
    const columnMatch = Object.keys(filters).every((key) => {
      const val = filters[key];
      if (!val) return true;
      
      if (key === "srno") return true; // Skip serial number filter
      
      return String((row as any)[key] || "")
        .toLowerCase()
        .includes(val);
    });

    return globalMatch && columnMatch;
  });

  // ✅ Action Handlers
  const handleDeleteClick = (id: number) => {
    alert("Delete row with ID: " + id);
  };

  const handleViewClick = (id: number) => {
    alert("View row with ID: " + id);
  };

  // ✅ Custom Table Styles
  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#f8fafc",
        color: "black",
        fontWeight: "bold",
        whiteSpace: "nowrap",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
      },
    },
  };

  // ✅ Columns Config
  const columns: TableColumn<PayrollType>[] = [
    {
      name: (
        <div>
          <div>Sr.ID</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("id", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: (
        <div>
          <div>Type</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("type", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.type === 'Earning' 
            ? 'bg-success/10 text-success' 
            : 'bg-warning/10 text-warning'
        }`}>
          {row.type}
        </span>
      ),
    },
    {
      name: (
        <div>
          <div>Payroll Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Amount Type</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("amountType", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.amountType,
      sortable: true,
    },
    // {
    //   name: (
    //     <div>
    //       <div>Percentage (%)</div>
    //       <input
    //         type="text"
    //         placeholder="Search..."
    //         onChange={(e) => handleColumnFilter("percentage", e.target.value)}
    //         style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
    //       />
    //     </div>
    //   ),
    //   selector: (row) => row.percentage || "-",
    //   sortable: true,
    // },
        {
      name: (
        <div>
          <div>Amount / Percentage</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("amount", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.amountType === "Fixed" 
        ? (row.amount || "-") 
        : (row.percentage ? `${row.percentage}%` : "-"),
      sortable: true,
      cell: (row) => (
        <span>
          {row.amountType === "Fixed" 
            ? (row.amount ? `${row.amount}` : "-") 
            : (row.percentage ? `${row.percentage}%` : "-")}
        </span>
      ),
    },
    {
      name: (
        <div>
          <div>Day Wise Count</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("dayWiseCount", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.dayWiseCount ? "Yes" : "No",
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
            style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Active' 
            ? 'bg-success/10 text-success' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleViewClick(row.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditClick(row.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive"
            onClick={() => handleDeleteClick(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      width: "180px",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            HRMS Payroll Type
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage payroll components and their configurations
          </p>
        </div>
        <Button 
          className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleAddClick}
        >
          <Plus className="w-4 h-4 mr-2 "/>
          Add Payroll Type
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search payroll types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 ">
              <Button variant="outline" className="border border-input bg-background hover:bg-[#00ace6] hover:text-white">Filter by Type</Button>
              <Button variant="outline" className="border border-input bg-background hover:bg-[#00ace6] hover:text-white ">Filter by Status</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Types</p>
                <p className="text-2xl font-bold">{dataList.length}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Types</p>
                <p className="text-2xl font-bold">
                  {dataList.filter(t => t.status === 'Active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Earnings vs Deductions</p>
                <p className="text-sm font-medium">
                  {dataList.filter(t => t.type === 'Earning').length} : {dataList.filter(t => t.type === 'Deduction').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-[#00ace6]/10 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-[#00ace6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Types ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData.length > 0 ? filteredData : dataList}
            customStyles={customStyles}
            pagination
            highlightOnHover
            responsive
            noDataComponent={
              <div className="p-4 text-center">No payroll types found</div>
            }
            persistTableHead
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <PayrollTypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPayroll={editingPayroll}
        formData={formData}
        onFormChange={handleFormChange}
        onSave={handleSave}
      />
    </div>
  );
}

