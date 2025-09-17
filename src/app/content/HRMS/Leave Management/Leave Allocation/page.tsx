"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, Building, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DepartmentAllocation {
  id: number;
  department: string;
  leaveType: string;
  year: number;
  days: number;
  status: "active" | "inactive";
}

interface EmployeeAllocation {
  id: number;
  department: string;
  employee: string;
  leaveType: string;
  year: number;
  days: number;
  status: "active" | "inactive";
}

const initialDepartmentAllocations: DepartmentAllocation[] = [
  {
    id: 1,
    department: "Engineering",
    leaveType: "Annual Leave",
    year: 2024,
    days: 25,
    status: "active",
  },
  {
    id: 2,
    department: "Marketing",
    leaveType: "Annual Leave",
    year: 2024,
    days: 22,
    status: "active",
  },
  {
    id: 3,
    department: "HR",
    leaveType: "Sick Leave",
    year: 2024,
    days: 12,
    status: "active",
  },
];

const initialEmployeeAllocations: EmployeeAllocation[] = [
  {
    id: 1,
    department: "Engineering",
    employee: "John Doe",
    leaveType: "Annual Leave",
    year: 2024,
    days: 28,
    status: "active",
  },
  {
    id: 2,
    department: "Marketing",
    employee: "Sarah Johnson",
    leaveType: "Emergency Leave",
    year: 2024,
    days: 7,
    status: "active",
  },
];

const departments = ["Engineering", "Marketing", "HR", "Finance", "Operations"];
const employees = ["John Doe", "Sarah Johnson", "Mike Chen", "Emma Wilson", "David Brown"];
const leaveTypes = ["Annual Leave", "Sick Leave", "Emergency Leave", "Maternity Leave"];

export default function LeaveAllocation() {
  const [isDepartmentWise, setIsDepartmentWise] = useState(true);
  const [departmentAllocations, setDepartmentAllocations] = useState<DepartmentAllocation[]>(initialDepartmentAllocations);
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>(initialEmployeeAllocations);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const { toast } = useToast();

  const [deptFormData, setDeptFormData] = useState({
    department: "",
    leaveType: "",
    year: new Date().getFullYear().toString(),
    days: "",
  });

  const [empFormData, setEmpFormData] = useState({
    department: "",
    employee: "",
    leaveType: "",
    year: new Date().getFullYear().toString(),
    days: "",
  });

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deptFormData.department || !deptFormData.leaveType || !deptFormData.days) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newAllocation: DepartmentAllocation = {
      id: Date.now(),
      department: deptFormData.department,
      leaveType: deptFormData.leaveType,
      year: parseInt(deptFormData.year),
      days: parseInt(deptFormData.days),
      status: "active",
    };

    setDepartmentAllocations(prev => [...prev, newAllocation]);
    toast({
      title: "Success",
      description: "Department leave allocation created successfully.",
    });

    setDeptFormData({
      department: "",
      leaveType: "",
      year: new Date().getFullYear().toString(),
      days: "",
    });
    setShowDeptForm(false);
  };

  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empFormData.department || !empFormData.employee || !empFormData.leaveType || !empFormData.days) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newAllocation: EmployeeAllocation = {
      id: Date.now(),
      department: empFormData.department,
      employee: empFormData.employee,
      leaveType: empFormData.leaveType,
      year: parseInt(empFormData.year),
      days: parseInt(empFormData.days),
      status: "active",
    };

    setEmployeeAllocations(prev => [...prev, newAllocation]);
    toast({
      title: "Success",
      description: "Employee leave allocation created successfully.",
    });

    setEmpFormData({
      department: "",
      employee: "",
      leaveType: "",
      year: new Date().getFullYear().toString(),
      days: "",
    });
    setShowEmpForm(false);
  };

  const handleDeleteDept = (id: number) => {
    setDepartmentAllocations(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Department allocation deleted successfully.",
    });
  };

  const handleDeleteEmp = (id: number) => {
    setEmployeeAllocations(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Employee allocation deleted successfully.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Toggle Between Department and Employee */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Allocation Type</CardTitle>
          <CardDescription>
            Choose between department-wise or employee-wise leave allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-3">
              <Switch
                id="department-wise"
                checked={isDepartmentWise}
                onCheckedChange={setIsDepartmentWise}
              />
              <Label htmlFor="department-wise" className="flex items-center gap-2 text-base font-medium">
                <Building className="w-4 h-4" />
                Department-Wise Leave
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="employee-wise"
                checked={!isDepartmentWise}
                onCheckedChange={(checked) => setIsDepartmentWise(!checked)}
              />
              <Label htmlFor="employee-wise" className="flex items-center gap-2 text-base font-medium">
                <User className="w-4 h-4" />
                Employee-Wise Leave
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department-Wise Allocation */}
      {isDepartmentWise && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Department-Wise Leave Allocation
                </CardTitle>
                <CardDescription>
                  Allocate leave days to entire departments
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowDeptForm(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Department Leave
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showDeptForm && (
              <Card className="mb-6 bg-accent/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Add Department Leave Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDeptSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dept-department">Select Department *</Label>
                        <Select value={deptFormData.department} onValueChange={(value) => setDeptFormData(prev => ({...prev, department: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dept-leave-type">Select Leave Type *</Label>
                        <Select value={deptFormData.leaveType} onValueChange={(value) => setDeptFormData(prev => ({...prev, leaveType: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dept-year">Select Year *</Label>
                        <Input
                          id="dept-year"
                          type="number"
                          value={deptFormData.year}
                          onChange={(e) => setDeptFormData(prev => ({...prev, year: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dept-days">Number of Days *</Label>
                        <Input
                          id="dept-days"
                          type="number"
                          value={deptFormData.days}
                          onChange={(e) => setDeptFormData(prev => ({...prev, days: e.target.value}))}
                          placeholder="e.g., 25"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="bg-gradient-primary hover:shadow-glow transition-all">
                        <Save className="w-4 h-4 mr-2" />
                        Save Allocation
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowDeptForm(false)}>
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
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Days Allocated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">{allocation.department}</TableCell>
                      <TableCell>{allocation.leaveType}</TableCell>
                      <TableCell>{allocation.year}</TableCell>
                      <TableCell>{allocation.days} days</TableCell>
                      <TableCell>
                        <Badge variant={allocation.status === "active" ? "default" : "secondary"}>
                          {allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDept(allocation.id)}
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
      )}

      {/* Employee-Wise Allocation */}
      {!isDepartmentWise && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Employee-Wise Leave Allocation
                </CardTitle>
                <CardDescription>
                  Allocate leave days to individual employees
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowEmpForm(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Employee Leave
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showEmpForm && (
              <Card className="mb-6 bg-accent/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Add Employee Leave Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmpSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emp-department">Select Department *</Label>
                        <Select value={empFormData.department} onValueChange={(value) => setEmpFormData(prev => ({...prev, department: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emp-employee">Select Employee *</Label>
                        <Select value={empFormData.employee} onValueChange={(value) => setEmpFormData(prev => ({...prev, employee: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map(emp => (
                              <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emp-leave-type">Select Leave Type *</Label>
                        <Select value={empFormData.leaveType} onValueChange={(value) => setEmpFormData(prev => ({...prev, leaveType: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emp-year">Select Year *</Label>
                        <Input
                          id="emp-year"
                          type="number"
                          value={empFormData.year}
                          onChange={(e) => setEmpFormData(prev => ({...prev, year: e.target.value}))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="emp-days">Number of Days *</Label>
                        <Input
                          id="emp-days"
                          type="number"
                          value={empFormData.days}
                          onChange={(e) => setEmpFormData(prev => ({...prev, days: e.target.value}))}
                          placeholder="e.g., 25"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="bg-gradient-primary hover:shadow-glow transition-all">
                        <Save className="w-4 h-4 mr-2" />
                        Save Allocation
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowEmpForm(false)}>
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
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Days Allocated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">{allocation.employee}</TableCell>
                      <TableCell>{allocation.department}</TableCell>
                      <TableCell>{allocation.leaveType}</TableCell>
                      <TableCell>{allocation.year}</TableCell>
                      <TableCell>{allocation.days} days</TableCell>
                      <TableCell>
                        <Badge variant={allocation.status === "active" ? "default" : "secondary"}>
                          {allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEmp(allocation.id)}
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
      )}
    </div>
  );
}