"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Clock, Users, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const LeaveAuthorization = () => {
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const departmentStats = [
    { name: "Information Technology", onLeave: 8, pending: 3, total: 45 },
    { name: "Human Resources", onLeave: 2, pending: 1, total: 12 },
    { name: "Finance", onLeave: 4, pending: 2, total: 18 },
    { name: "Marketing", onLeave: 6, pending: 1, total: 22 },
    { name: "Operations", onLeave: 3, pending: 0, total: 28 },
  ];

  const leaveRequests = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      employeeId: "EMP001",
      department: "Information Technology",
      leaveType: "Annual Leave",
      startDate: "2024-01-20",
      endDate: "2024-01-25",
      days: 5,
      reason: "Family vacation",
      appliedOn: "2024-01-10",
      status: "Pending",
    },
    {
      id: 2,
      employeeName: "Mike Chen",
      employeeId: "EMP002",
      department: "Human Resources",
      leaveType: "Sick Leave",
      startDate: "2024-01-15",
      endDate: "2024-01-17",
      days: 3,
      reason: "Medical treatment",
      appliedOn: "2024-01-14",
      status: "Pending",
    },
    {
      id: 3,
      employeeName: "Emma Davis",
      employeeId: "EMP003",
      department: "Finance",
      leaveType: "Personal Leave",
      startDate: "2024-01-22",
      endDate: "2024-01-24",
      days: 3,
      reason: "Personal work",
      appliedOn: "2024-01-12",
      status: "Approved",
    },
    {
      id: 4,
      employeeName: "James Wilson",
      employeeId: "EMP004",
      department: "Marketing",
      leaveType: "Annual Leave",
      startDate: "2024-01-18",
      endDate: "2024-01-19",
      days: 2,
      reason: "Short break",
      appliedOn: "2024-01-11",
      status: "Rejected",
    },
  ];

  const handleApprove = (id: number, name: string) => {
    toast({
      title: "Leave Approved",
      description: `${name}'s leave application has been approved.`,
    });
  };

  const handleReject = (id: number, name: string) => {
    toast({
      title: "Leave Rejected",
      description: `${name}'s leave application has been rejected.`,
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-success text-success-foreground";
      case "Rejected": return "bg-destructive text-destructive-foreground";
      case "Pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesDepartment = selectedDepartment === "all" || request.department === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    const matchesSearch = searchTerm === "" || 
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const LeaveDetailsModal = ({ request }: { request: any }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Employee Name</p>
          <p className="text-foreground">{request.employeeName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
          <p className="text-foreground">{request.employeeId}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Department</p>
          <p className="text-foreground">{request.department}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
          <p className="text-foreground">{request.leaveType}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Start Date</p>
          <p className="text-foreground">{new Date(request.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">End Date</p>
          <p className="text-foreground">{new Date(request.endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Duration</p>
          <p className="text-foreground">{request.days} {request.days === 1 ? 'day' : 'days'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Applied On</p>
          <p className="text-foreground">{new Date(request.appliedOn).toLocaleDateString()}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
        <p className="text-foreground">{request.reason}</p>
      </div>
      {request.status === "Pending" && (
        <div className="flex gap-2 pt-4 border-t">
          <Button className="btn-success flex-1" onClick={() => handleApprove(request.id, request.employeeName)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button className="btn-destructive flex-1" onClick={() => handleReject(request.id, request.employeeName)}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Department Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {departmentStats.map((dept) => (
          <Card key={dept.name} className="card-simple">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-sm text-foreground mb-2">{dept.name}</h3>
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-muted-foreground">On Leave</p>
                    <p className="font-bold text-primary">{dept.onLeave}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending</p>
                    <p className="font-bold text-warning">{dept.pending}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-foreground">{dept.total}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="card-simple">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentStats.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leave Requests ({filteredRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="card-simple">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{request.employeeName}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <p><span className="font-medium">ID:</span> {request.employeeId}</p>
                        <p><span className="font-medium">Department:</span> {request.department}</p>
                        <p><span className="font-medium">Type:</span> {request.leaveType}</p>
                        <p><span className="font-medium">Duration:</span> {request.days} days</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Leave Application Details</DialogTitle>
                          </DialogHeader>
                          <LeaveDetailsModal request={request} />
                        </DialogContent>
                      </Dialog>
                      {request.status === "Pending" && (
                        <>
                          <Button 
                            size="sm" 
                            className="btn-success"
                            onClick={() => handleApprove(request.id, request.employeeName)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            className="btn-destructive"
                            onClick={() => handleReject(request.id, request.employeeName)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveAuthorization;