"use client";
import { useState, useEffect, useMemo } from "react";
import { Calendar, User, Building2, Send, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DataTable, { TableColumn, TableStyles  } from "react-data-table-component";

const ApplyLeave = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    typeOfLeave: "",
    department_id: "",
    employee_id: "",
    employee: "",
    leaveType: "",
    dayType: "",
    fromDate: "",
    toDate: "",
    date: "",
    slot: "",
    comment: "",
  });

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
const [filters, setFilters] = useState<Record<string, string>>({});

  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [submittedData, setSubmittedData] = useState<any[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingEmps, setLoadingEmps] = useState(false);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [pending, setPending] = useState(true);

  // Helpers
  const normalizeList = (payload: any) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.result)) return payload.result;
    return [];
  };

  const getFullName = (emp: any) => {
    if (!emp) return "";
    const nameParts = [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean);
    const full = nameParts.join(" ").trim();
    if (full) return full;
    if (emp.name) return emp.name;
    if (emp.user_name) return emp.user_name;
    if (emp.email) return emp.email;
    return `ID ${emp.id ?? ""}`;
  };

  const getDeptNameById = (id: any) => {
    if (!id) return "";
    const str = id.toString();
    const found = departments.find((d) => d.id?.toString() === str);
    return found?.department || "";
  };

const handleColumnFilter = (column: string, value: string) => {
  setFilters(prev => ({ ...prev, [column]: value.toLowerCase() }));
};

const filteredData = useMemo(() => {
  if (Object.values(filters).every(filter => !filter)) {
    return submittedData;
  }

  return submittedData.filter((row, index) => {
    return Object.entries(filters).every(([column, filterValue]) => {
      if (!filterValue) return true;

      switch (column) {
        case 'srno':
          return (index + 1).toString().includes(filterValue);
        case 'department':
          return getDeptNameById(row.department_id)?.toLowerCase().includes(filterValue);
        case 'employee':
          return (row.leave_type_name || row.employee || '').toLowerCase().includes(filterValue);
        case 'leaveType':
          const leaveType = leaveTypes.find(lt => lt.id.toString() === row.leave_type_id?.toString());
          return (leaveType?.leave_type || row.leaveType || '').toLowerCase().includes(filterValue);
        case 'dayType':
          return (row.day_type || row.dayType || '').toLowerCase().includes(filterValue);
        case 'fromDate':
          return (row.from_date || row.fromDate || row.date || '').toLowerCase().includes(filterValue);
        case 'toDate':
          return (row.to_date || row.toDate || row.date || '').toLowerCase().includes(filterValue);
        case 'slot':
          return (row.slot || '').toLowerCase().includes(filterValue);
        case 'comment':
          return (row.comment || '').toLowerCase().includes(filterValue);
        default:
          return true;
      }
    });
  });
}, [submittedData, filters, departments, leaveTypes]);
  // DataTable columns configuration
  const columns: TableColumn<any>[] = useMemo(() => [
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
    selector: (row: any) => "", // Not used, but required by type
    cell: (row: any, rowIndex?: number) => (rowIndex !== undefined ? rowIndex + 1 : ""),
    sortable: true,
    width: "120px"
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
            
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: any) => getDeptNameById(row.department_id),
    sortable: true,
    wrap: true,
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
    selector: (row: any) => {
      const leaveType = leaveTypes.find((lt) => lt.id.toString() === row.user_id?.toString());
      return leaveType?.leave_type || row.leaveType || "-";
    },
    sortable: true,
    wrap: true,
  },
  {
    name: (
      <div>
        <div>Leave Type</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("leaveType", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
           
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: any) => {
      const leaveType = leaveTypes.find((lt) => lt.id.toString() === row.leave_type_id?.toString());
      return leaveType?.leave_type || row.leaveType || "-";
    },
    sortable: true,
    wrap: true,
  },
  {
    name: (
      <div>
        <div>Day Type</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("dayType", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
          
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: any) => row.day_type || row.dayType || "-",
    sortable: true,
  },
  {
    name: (
      <div>
        <div>From Date</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("fromDate", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
            
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: any) => row.from_date || row.fromDate || row.date || "-",
    sortable: true,
  },
  {
    name: (
      <div>
        <div>To Date</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("toDate", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
          
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: any) => row.to_date || row.toDate || row.date || "-",
    sortable: true,
  },
  {
    name: (
      <div>
        <div>Slot</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("slot", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
           
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: any) => row.slot || "-",
    sortable: true,
  },
  {
    name: (
      <div>
        <div>Comment</div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleColumnFilter("comment", e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "12px",
          
            marginTop: "5px"
          }}
        />
      </div>
    ),
    selector: (row: any) => row.comment || "-",
    wrap: true,
    cell: (row: any) => (
      <div className="max-w-xs truncate" title={row.comment}>
        {row.comment || "-"}
      </div>
    ),
  },
], [departments, leaveTypes]);
 
  const customStyles : TableStyles  = {
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
      style: {  overflow: "hidden" ,borderRadius: "8px", border: "1px solid #e2e8f0" },
    },
  };

  // Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) return;
    try {
      const { APP_URL, token, sub_institute_id, org_type, user_id } =
        JSON.parse(userData);
      setSessionData({
        url: APP_URL || "",
        token: token || "",
        subInstituteId: sub_institute_id?.toString() || "",
        orgType: org_type || "",
        userId: user_id?.toString() || "",
      });
    } catch (err) {
      console.error("Invalid userData in localStorage", err);
    }
  }, []);

  // Fetch Leave Types
  // useEffect(() => {
  //   if (!sessionData.url || !sessionData.subInstituteId || !sessionData.token) return;

  //   const fetchLeaveTypes = async () => {
  //     setLoadingLeaveTypes(true);
  //     try {
  //       const res = await fetch(
  //         `${sessionData.url}/leave-type?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`
  //       );
  //       if (!res.ok) throw new Error(`Leave types fetch failed: ${res.status}`);
  //       const json = await res.json();
  //       setLeaveTypes(json.LeaveTypeLists || []);
  //     } catch (err) {
  //       console.error("Failed to fetch leave types:", err);
  //       toast({
  //         title: "Error",
  //         description: "Could not load leave types.",
  //         variant: "destructive",
  //       });
  //       setLeaveTypes([]);
  //     } finally {
  //       setLoadingLeaveTypes(false);
  //     }
  //   };

  //   fetchLeaveTypes();
  // }, [sessionData]);

  //   // ✅ Fetch Leave Types
  useEffect(() => {
    if (!sessionData.url || !sessionData.subInstituteId || !sessionData.token) return;

    const fetchLeaveTypes = async () => {
      setLoadingLeaveTypes(true);
      try {
        const res = await fetch(
          `${sessionData.url}/leave-type?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`
        );
        if (!res.ok) throw new Error(`Leave types fetch failed: ${res.status}`);
        const json = await res.json();
        setLeaveTypes(json.LeaveTypeLists || []);
      } catch (err) {
        console.error("Failed to fetch leave types:", err);
        toast({
          title: "Error",
          description: "Could not load leave types.",
          variant: "destructive",
        });
        setLeaveTypes([]);
      } finally {
        setLoadingLeaveTypes(false);
      }
    };

    fetchLeaveTypes();
  }, [sessionData]);

  // Fetch departments
  useEffect(() => {
    if (!sessionData.subInstituteId) return;
    const fetchDepartments = async () => {
      setLoadingDepts(true);
      try {
        const res = await fetch(
          `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
        );
        if (!res.ok) throw new Error(`Depts fetch failed: ${res.status}`);
        const json = await res.json();
        const list = Object.entries(json.data || {}).map(([deptName, jobRoles]) => {
          const deptId = (jobRoles as any[])[0]?.department_id;
          const department = (jobRoles as any[])[0]?.department_name || deptName;
          return { id: deptId, department };
        });
        setDepartments(list);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        toast({
          title: "Error",
          description: "Could not load departments.",
          variant: "destructive",
        });
        setDepartments([]);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, [sessionData]);

  // Fetch employees when department_id changes
  useEffect(() => {
    if (!formData.department_id || !sessionData.url || !sessionData.subInstituteId) {
      setEmployees([]);
      return;
    }
    const fetchEmployees = async () => {
      setLoadingEmps(true);
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[status]=1&filters[department_id]=${formData.department_id}&user_id=${sessionData.userId}`
        );
        if (!res.ok) throw new Error(`Emps fetch failed: ${res.status}`);
        const json = await res.json();
        const list = normalizeList(json);
        setEmployees(list);
        console.log("Employees for department", formData.department_id, list);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast({
          title: "Error",
          description: "Could not load employees.",
          variant: "destructive",
        });
        setEmployees([]);
      } finally {
        setLoadingEmps(false);
      }
    };
    fetchEmployees();
  }, [formData.department_id, sessionData]);

  // Fetch leave applications on page load
  useEffect(() => {
    if (!sessionData.url || !sessionData.token || !sessionData.subInstituteId || !sessionData.userId) return;

    const fetchApplications = async () => {
      setPending(true);
      try {
        const url = new URL(`${sessionData.url}/leave-apply`);
        url.searchParams.append("type", "API");
        url.searchParams.append("sub_institute_id", sessionData.subInstituteId);
        url.searchParams.append("token", sessionData.token);
        url.searchParams.append("user_id", sessionData.userId);
        url.searchParams.append("syear", new Date().getFullYear().toString());

        const res = await fetch(url.toString(), { method: "GET" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const json = await res.json();

        const list = json.leaveHistory || [];
        setSubmittedData(list);
      } catch (err) {
        console.error("Failed to fetch leave applications:", err);
        toast({
          title: "Error",
          description: "Could not load leave applications.",
          variant: "destructive",
        });
      } finally {
        setPending(false);
      }
    };

    fetchApplications();
  }, [sessionData]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    if (field === "department_id") {
      setFormData((prev) => ({
        ...prev,
        department_id: value,
        employee_id: "",
        employee: "",
      }));
    
      return;
    }

    if (field === "employee_id") {
      const selectedEmp = employees.find((e) => e.id?.toString() === value);
      setFormData((prev) => ({
        ...prev,
        employee_id: selectedEmp?.id?.toString() || "",
        employee: getFullName(selectedEmp) || "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit leave
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.typeOfLeave || !formData.leaveType || !formData.dayType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionData.url || !sessionData.token || !sessionData.userId) {
      toast({
        title: "Error",
        description: "Session data missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = new URL(`${sessionData.url}/leave-apply`);
      url.searchParams.append("type", "API");
      url.searchParams.append("sub_institute_id", sessionData.subInstituteId);
      url.searchParams.append("token", sessionData.token);
      url.searchParams.append("leave_type", formData.leaveType);
      url.searchParams.append("day_type", formData.dayType);

      if (formData.dayType === "full") {
        url.searchParams.append("from_date", formData.fromDate);
        url.searchParams.append("to_date", formData.toDate);
      } else if (formData.dayType === "half") {
        url.searchParams.append("from_date", formData.date);
        url.searchParams.append("to_date", formData.date);
        url.searchParams.append("slot", formData.slot);
      }

      url.searchParams.append("comment", formData.comment || "");
      url.searchParams.append("user_id", sessionData.userId);
      url.searchParams.append("leave_type_id", formData.leaveType);

      if (formData.department_id) {
        url.searchParams.append("department_id", formData.department_id);
      }
      if (formData.employee_id) {
        url.searchParams.append("employee_id", formData.employee_id);
      }

      const res = await fetch(url.toString(), { method: "POST" });
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
      const json = await res.json();

      toast({
        title: "Leave Application Submitted",
        description: "Your leave request has been submitted successfully.",
      });

      setSubmittedData((prev) => [...prev, { ...formData, ...json }]);
      handleReset();
    } catch (err) {
      console.error("Submit error:", err);
      toast({
        title: "Error",
        description: "Failed to submit leave application.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setFormData({
      typeOfLeave: "",
      department_id: "",
      employee_id: "",
      employee: "",
      leaveType: "",
      dayType: "",
      fromDate: "",
      toDate: "",
      date: "",
      slot: "",
      comment: "",
    });
    setEmployees([]);
  };

  return (
    <div className="space-y-6">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Leave Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Type of Leave *</Label>
                <Select
                  value={formData.typeOfLeave || undefined}
                  onValueChange={(value) => handleInputChange("typeOfLeave", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Leave Type *</Label>
                <Select
                  value={formData.leaveType || undefined}
                  onValueChange={(value) => handleInputChange("leaveType", value)}
                  disabled={loadingLeaveTypes}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingLeaveTypes ? "Loading..." : "Select leave type"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => (
                      <SelectItem key={lt.id} value={lt.id.toString()}>
                        {lt.leave_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Day Type *</Label>
                <Select
                  value={formData.dayType || undefined}
                  onValueChange={(value) => handleInputChange("dayType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="half">Half</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Comment</Label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => handleInputChange("comment", e.target.value)}
                  placeholder="Add a comment"
                  rows={1}
                />
              </div>
            </div>

            {/* Department + Employee (when employee type selected) */}
            {formData.typeOfLeave === "employee" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Department
                  </Label>
                  <Select
                    value={formData.department_id || undefined}
                    onValueChange={(value) => handleInputChange("department_id", value)}
                    disabled={loadingDepts}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={loadingDepts ? "Loading..." : "Select department"}
                      />
                    </SelectTrigger>
                    <SelectContent className="w-140">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id?.toString()}>
                          {dept.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Employee
                  </Label>
                  <Select
                    value={formData.employee_id || undefined}
                    onValueChange={(value) => handleInputChange("employee_id", value)}
                    disabled={!formData.department_id || loadingEmps}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={loadingEmps ? "Loading..." : "Select employee"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id?.toString()}>
                          {getFullName(emp)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Dates for full/half */}
            {formData.dayType === "full" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>From Date *</Label>
                  <Input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => handleInputChange("fromDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>To Date *</Label>
                  <Input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => handleInputChange("toDate", e.target.value)}
                  />
                </div>
              </div>
            )}

            {formData.dayType === "half" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Slot *</Label>
                  <Select
                    value={formData.slot || undefined}
                    onValueChange={(value) => handleInputChange("slot", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Half</SelectItem>
                      <SelectItem value="second">Second Half</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button type="submit" className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
                <Send className="h-4 w-4 mr-2" /> Submit
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Submitted DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Leave Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={submittedData}
            customStyles={customStyles}
            pagination
            highlightOnHover
            responsive
            progressPending={pending}
            noDataComponent={<div className="p-4 text-center">No data available</div>}
            persistTableHead
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyLeave;
