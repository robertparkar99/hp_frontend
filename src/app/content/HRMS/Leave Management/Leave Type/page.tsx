'use client';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeaveType {
  id: number;
  name: string;
  description: string;
  maxDays: number;
  carryForward: boolean;
  requiresApproval: boolean;
  status: "active" | "inactive";
}

const initialLeaveTypes: LeaveType[] = [
  {
    id: 1,
    name: "Annual Leave",
    description: "Yearly vacation days",
    maxDays: 25,
    carryForward: true,
    requiresApproval: true,
    status: "active",
  },
  {
    id: 2,
    name: "Sick Leave",
    description: "Medical leave for illness",
    maxDays: 10,
    carryForward: false,
    requiresApproval: false,
    status: "active",
  },
  {
    id: 3,
    name: "Emergency Leave",
    description: "Urgent personal matters",
    maxDays: 5,
    carryForward: false,
    requiresApproval: true,
    status: "active",
  },
];

export default function LeaveType() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(initialLeaveTypes);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [assignedLeave, setAssignedLeave] = useState(true);
  const [assignmentType, setAssignmentType] = useState("designation");
  const [allocationPeriod, setAllocationPeriod] = useState("yearly");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxDays: "",
    carryForward: false,
    requiresApproval: true,
    status: "active" as "active" | "inactive",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.maxDays) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newLeaveType: LeaveType = {
      id: editingId || Date.now(),
      name: formData.name,
      description: formData.description,
      maxDays: parseInt(formData.maxDays),
      carryForward: formData.carryForward,
      requiresApproval: formData.requiresApproval,
      status: formData.status,
    };

    if (editingId) {
      setLeaveTypes(prev => prev.map(item => 
        item.id === editingId ? newLeaveType : item
      ));
      toast({
        title: "Success",
        description: "Leave type updated successfully.",
      });
    } else {
      setLeaveTypes(prev => [...prev, newLeaveType]);
      toast({
        title: "Success",
        description: "Leave type created successfully.",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      maxDays: "",
      carryForward: false,
      requiresApproval: true,
      status: "active" as "active" | "inactive",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (leaveType: LeaveType) => {
    setFormData({
      name: leaveType.name,
      description: leaveType.description,
      maxDays: leaveType.maxDays.toString(),
      carryForward: leaveType.carryForward,
      requiresApproval: leaveType.requiresApproval,
      status: leaveType.status,
    });
    setEditingId(leaveType.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setLeaveTypes(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Leave type deleted successfully.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Assignment Settings */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            Leave Assignment Settings
          </CardTitle>
          <CardDescription>
            Configure how leave is assigned to employees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="assigned-leave" className="text-base font-medium">
                Assigned Leave
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic leave assignment
              </p>
            </div>
            <Switch
              id="assigned-leave"
              checked={assignedLeave}
              onCheckedChange={setAssignedLeave}
            />
          </div>

          {assignedLeave && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <Label htmlFor="assignment-type" className="text-base font-medium">
                  Assignment Type
                </Label>
                <Select value={assignmentType} onValueChange={setAssignmentType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designation">Designation-wise</SelectItem>
                    <SelectItem value="employee">Employee-wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allocation-period" className="text-base font-medium">
                  Allocation Period
                </Label>
                <Select value={allocationPeriod} onValueChange={setAllocationPeriod}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Month-wise</SelectItem>
                    <SelectItem value="yearly">Year-wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button className="bg-[#5091fa] hover:shadow-glow transition-all">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Leave Type Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g., Annual Leave"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDays">Maximum Days *</Label>
                      <Input
                        id="maxDays"
                        type="number"
                        value={formData.maxDays}
                        onChange={(e) => setFormData(prev => ({...prev, maxDays: e.target.value}))}
                        placeholder="e.g., 25"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Brief description of this leave type"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="carryForward"
                        checked={formData.carryForward}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, carryForward: checked}))}
                      />
                      <Label htmlFor="carryForward">Allow Carry Forward</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresApproval"
                        checked={formData.requiresApproval}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, requiresApproval: checked}))}
                      />
                      <Label htmlFor="requiresApproval">Requires Approval</Label>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData(prev => ({...prev, status: value}))}>
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

          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Max Days</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((leaveType) => (
                  <TableRow key={leaveType.id}>
                    <TableCell className="font-medium">{leaveType.name}</TableCell>
                    <TableCell className="text-muted-foreground">{leaveType.description}</TableCell>
                    <TableCell>{leaveType.maxDays} days</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {leaveType.carryForward && (
                          <Badge variant="secondary" className="text-xs">Carry Forward</Badge>
                        )}
                        {leaveType.requiresApproval && (
                          <Badge variant="outline" className="text-xs">Approval</Badge>
                        )}
                      </div>
                    </TableCell>
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
