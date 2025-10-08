
"use client";

import React, { useState, useEffect } from "react";
import Icon from '@/components/AppIcon';
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PayrollTypeDialog from "../PayrollTypeDialog";

// ✅ Row Type
interface PayrollType {
  srno: number; // Added srno property
  id: number;
  type: string;
  name: string;
  amountType: string;
  amount?: number | null;
  payroll_percentage: number | null;
  status: "Active" | "Inactive";
  day_count: boolean; // ✅ boolean mapping from API
}

export default function PayrollTypes() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dataList, setDataList] = useState<PayrollType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollType | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setSessionData(parsed);
    }
  }, []);

  const fetchPayrollTypes = async () => {
    if (!sessionData) return;
    try {
      const url = `${sessionData.APP_URL}/payroll-type?token=${sessionData.token}&type=API&sub_institute_id=${sessionData.sub_institute_id}&status=1`;

      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch payroll types");

      const result = await res.json();

      // Map API response
      const mapped: PayrollType[] = result.data.map((item: any, index: number) => ({
        srno: index + 1,
        id: item.id,
        type: item.payroll_type === 1 ? "Earning" : "Deduction",
        name: item.payroll_name,
        amountType: item.amount_type === 1 ? "Fixed" : "Percentage",
        amount: item.amount || null,
        payroll_percentage: item.payroll_percentage || null,
        status: item.status === 1 ? "Active" : "Inactive",
        day_count: item.day_count == 1,
        sort_order: item.sort_order,
      }));

      setDataList(mapped);
    } catch (err) {
      console.error("❌ Error fetching payroll types:", err);
    }
  };

  useEffect(() => {
    if (sessionData) fetchPayrollTypes();
  }, [sessionData]);

  const handleAddClick = () => {
    setEditingPayroll(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!sessionData) {
      alert("Session not found. Please login again.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this payroll type?");
    if (!confirmDelete) return;

    try {
      const url = `${sessionData.APP_URL}/payroll-type/destroy/${id}`;
      const formData = new FormData();
      formData.append("type", "API");
      formData.append("sub_institute_id", String(sessionData.sub_institute_id));
      formData.append("token", sessionData.token);
      formData.append("user_id", String(sessionData.user_id));

      const res = await fetch(url, { method: "POST", body: formData });
      const text = await res.text();

      fetchPayrollTypes();

      let success = false;
      try {
        const json = JSON.parse(text);
        success = !!json.success;
      } catch {
        if (text.toLowerCase().includes("deleted")) success = true;
      }

      if (success) {
        setDataList((prev) => prev.filter((item) => item.id !== id));
        // alert("Payroll type deleted successfully.");
      } else {
        alert("Deleting payroll type ");
      }
    } catch (err: any) {
      console.error("❌ Error deleting payroll type:", err);
      // alert(" " + (err.message || "Something went wrong"));
    }
  };

  const handleEditClick = (id: number) => {
    const payroll = dataList.find((item) => item.id === id);
    if (payroll) {
      fetchPayrollTypes();
      setEditingPayroll(payroll);
      setIsDialogOpen(true);
    }
  };

  const handleSave = () => {
    fetchPayrollTypes();
    setIsDialogOpen(false);
    setEditingPayroll(null);
  };

  // ✅ Column-wise filtering handler
  const handleColumnFilter = (key: keyof PayrollType | "srno", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value.toLowerCase(),
    }));
  };

  // ✅ Filtering logic
  const filteredData = (() => {
    const srnoRaw = (filters.srno || "").trim();
    const otherKeys = Object.keys(filters).filter((k) => k !== "srno");

    let interim = dataList.filter((row) => {
      // Global search
      const globalMatch =
        row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.amountType?.toLowerCase().includes(searchTerm.toLowerCase());

      // Column search
      const columnMatch = otherKeys.every((key) => {
        const val = filters[key];
        if (!val) return true;

        // Special handling for day_count column
        if (key === "day_count") {
          const searchTermLower = val.toLowerCase();
          const rowValue = row.day_count ? "yes" : "no";
          return rowValue.includes(searchTermLower);
        }

        return String((row as any)[key] || "").toLowerCase().includes(val);
      });

      return globalMatch && columnMatch;
    });

    if (!srnoRaw) return interim;

    const srnoNum = parseInt(srnoRaw, 10);
    if (!isNaN(srnoNum)) {
      interim = interim.filter((_row, idx) => idx + 1 === srnoNum);
    } else {
      interim = interim.filter((_row, idx) => String(idx + 1).includes(srnoRaw));
    }

    return interim;
  })();

  const handleViewClick = (id: number) => {
    alert("View row with ID: " + id);
  };




  // ✅ Columns
  const columns: TableColumn<PayrollType>[] = [
    {
      name: (
        <div>
          <div>Sr.No</div>
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
      selector: (row) => row.srno,
      sortable: false,
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
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === "Earning"
            ? "bg-success/10 text-success"
            : "bg-warning/10 text-warning"
            }`}
        >
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
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              
              marginTop: "5px"
            }}
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
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => row.amountType,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Amount / Percentage</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("payroll_percentage", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
            
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => {
        if (row.payroll_percentage === null || row.payroll_percentage === undefined) {
          return "-";
        }
        return row.amountType === "Fixed"
          ? row.payroll_percentage.toString()
          : `${row.payroll_percentage}`;
      },
      sortable: true,
      cell: (row) => (
        <span>
          {row.payroll_percentage === null || row.payroll_percentage === undefined
            ? "-"
            : row.amountType === "Fixed"
              ? row.payroll_percentage
              : `${row.payroll_percentage}%`}
        </span>
      ),
    },
    {
      name: (
        <div>
          <div>Day Wise Count</div>
          <input
            type="text"
            placeholder="Search Yes/No"
            onChange={(e) => handleColumnFilter("day_count", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
          
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => (row.day_count ? "Yes" : "No"),
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.day_count ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            }`}
        >
          {row.day_count ? "Yes" : "No"}
        </span>
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
          // style={{ width: "100%", padding: "4px", fontSize: "12px", marginTop: "4px" }}
          />
        </div>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Active"
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {/* <Button variant="ghost" size="sm" onClick={() => handleViewClick(row.id)}>
            <Eye className="w-4 h-4" />
          </Button> */}
          {/* <Button variant="ghost" size="sm" onClick={() => handleEditClick(row.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs rounded">
          
            <span className="mdi mdi-pencil"></span>
          </Button> */}
          <Button
            variant="ghost"
            onClick={() => handleEditClick(row.id)}
            className="bg-blue-500 hover:bg-blue-700 hover:text-white text-white text-[10px] px-1.5 py-0.5 rounded-sm h-6 min-w-6"
          >
           
            <Icon name="Edit" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            // className="text-destructive"
            onClick={() => handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 hover:text-white text-white text-[10px] px-1.5 py-0.5 rounded-sm h-6 min-w-6"
          >
<Icon name="Trash2" size={14} />
            {/* <Trash2  /> */}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      width: "120px",
    },
  ];



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
      },
    },
    table: {
      style: {
        border: "1px solid #ddd",
        borderRadius: "20px",
        overflow: "hidden",
      },
    },
  };
  return (
    <div className="space-y-6 p-6 bg-background rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">HRMS Payroll Type</h1>
          <p className="text-muted-foreground mt-1">
            Manage payroll components and their configurations
          </p>
        </div>
        <Button
          className="bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
          onClick={handleAddClick}
        >
          <Plus className="w-4 h-4 mr-2 " />
          Add Payroll Type
        </Button>
      </div>

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
                  {dataList.filter((t) => t.status === "Active").length}
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
                  {dataList.filter((t) => t.type === "Earning").length} :{" "}
                  {dataList.filter((t) => t.type === "Deduction").length}
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
            data={filteredData}
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
        onSave={handleSave}
        sessionInfo={sessionData}
      />
    </div>
  );
}