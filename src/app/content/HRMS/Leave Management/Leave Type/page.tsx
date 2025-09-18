'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeaveType {
  id: number;
  leaveTypeId: string;
  name: string;
  maxDays: number;
  status: "active" | "inactive";
}

interface SessionData {
  url: string;
  token: string;
  subInstituteId: string;
  orgType: string;
  userId: string;
}

export default function LeaveType() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [assignedLeave, setAssignedLeave] = useState(true);
  const [assignmentType, setAssignmentType] = useState("designation");
  const [allocationPeriod, setAllocationPeriod] = useState("yearly");
  const { toast } = useToast();

  const [sessionData, setSessionData] = useState<SessionData>({
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
      try {
        const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
        setSessionData({
          url: APP_URL?.replace(/\/$/, "") || "",
          token: token || "",
          subInstituteId: sub_institute_id?.toString() || "",
          orgType: org_type?.toString() || "",
          userId: user_id?.toString() || "",
        });
      } catch (error) {
        console.error("Error parsing userData from localStorage", error);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    name: "",
    maxDays: "",
    status: "active" as "active" | "inactive",
  });

  // Fetch leave types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      if (!sessionData.url || !sessionData.subInstituteId || !sessionData.token) return;
      try {
        const params = new URLSearchParams({
          type: "API",
          sub_institute_id: sessionData.subInstituteId,
          token: sessionData.token,
        });

        const response = await fetch(`${sessionData.url}/leave-type?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch leave types");

        const data = await response.json();
        if (data.LeaveTypeLists) {
          const mapped: LeaveType[] = data.LeaveTypeLists.map((item: any) => ({
            id: item.id,
            leaveTypeId: item.leave_type_id,
            name: item.leave_type,
            maxDays: item.sort_order,
            status: item.status === 1 ? "active" : "inactive",
          }));
          setLeaveTypes(mapped);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast({
          title: "Error",
          description: "Failed to load leave types",
          variant: "destructive",
        });
      }
    };

    fetchLeaveTypes();
  }, [sessionData]);

  // Create/Update API
  const saveLeaveTypeAPI = async (leaveType: LeaveType, isUpdate: boolean) => {
    if (!sessionData.url || !sessionData.subInstituteId || !sessionData.token || !sessionData.userId) return;

    try {
      const params = new URLSearchParams({
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        token: sessionData.token,
        user_id: sessionData.userId,
        leave_type_id: leaveType.leaveTypeId,
        leave_type_name: leaveType.name,
        sort_order: leaveType.maxDays.toString(),
        status: leaveType.status === "active" ? "1" : "0",
      });

      if (isUpdate) {
        params.append("leave_id", leaveType.id.toString());
      }

      const response = await fetch(`${sessionData.url}/leave-type?${params.toString()}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to save leave type");

      await response.json();
      toast({
        title: "Success",
        description: isUpdate ? "Leave type updated." : "Leave type created.",
      });
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "API Error",
        description: "Could not save leave type.",
        variant: "destructive",
      });
    }
  };

  // Delete API
  const deleteLeaveTypeAPI = async (id: number) => {
    if (!sessionData.url || !sessionData.subInstituteId || !sessionData.token || !sessionData.userId) return;

    try {
      const params = new URLSearchParams({
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        token: sessionData.token,
        user_id: sessionData.userId,
      });

      const response = await fetch(`${sessionData.url}/leave-type/${id}?${params.toString()}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete leave type");

      await response.json();
      setLeaveTypes(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Deleted",
        description: "Leave type deleted successfully.",
      });
    } catch (error) {
      console.error("Delete API Error:", error);
      toast({
        title: "API Error",
        description: "Could not delete leave type.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaveTypeId || !formData.name || !formData.maxDays) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newLeaveType: LeaveType = {
      id: editingId || Date.now(),
      leaveTypeId: formData.leaveTypeId,
      name: formData.name,
      maxDays: parseInt(formData.maxDays),
      status: formData.status,
    };

    if (editingId) {
      setLeaveTypes(prev => prev.map(item =>
        item.id === editingId ? newLeaveType : item
      ));
      saveLeaveTypeAPI(newLeaveType, true);
    } else {
      setLeaveTypes(prev => [...prev, newLeaveType]);
      saveLeaveTypeAPI(newLeaveType, false);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      leaveTypeId: "",
      name: "",
      maxDays: "",
      status: "active",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (leaveType: LeaveType) => {
    setFormData({
      leaveTypeId: leaveType.leaveTypeId,
      name: leaveType.name,
      maxDays: leaveType.maxDays.toString(),
      status: leaveType.status,
    });
    setEditingId(leaveType.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    deleteLeaveTypeAPI(id);
  };

  return (
    <div className="space-y-8">
      
      {/* Leave Types Management */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Leave Types</CardTitle>
              <CardDescription>
                Manage available leave types and their configurations
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#5091fa] hover:shadow-glow transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6 bg-accent/20 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? "Edit Leave Type" : "Create New Leave Type"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="leaveTypeId">Leave Type ID *</Label>
                      <Input
                        id="leaveTypeId"
                        type="text"
                        value={formData.leaveTypeId}
                        onChange={(e) => setFormData(prev => ({ ...prev, leaveTypeId: e.target.value }))}
                        placeholder="e.g., LTY001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Leave Type Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Annual Leave"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDays">Sort Order *</Label>
                      <Input
                        id="maxDays"
                        type="number"
                        value={formData.maxDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxDays: e.target.value }))}
                        placeholder="e.g., 1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "active" | "inactive") =>
                          setFormData(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-[#5091fa] hover:shadow-glow transition-all">
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? "Update" : "Create"} Leave Type
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type ID</TableHead>
                  <TableHead>Leave Type Name</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((leaveType) => (
                  <TableRow key={leaveType.id}>
                    <TableCell className="font-medium">{leaveType.leaveTypeId}</TableCell>
                    <TableCell>{leaveType.name}</TableCell>
                    <TableCell>{leaveType.maxDays}</TableCell>
                    <TableCell>
                      <Badge variant={leaveType.status === "active" ? "default" : "secondary"}>
                        {leaveType.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(leaveType)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(leaveType.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
