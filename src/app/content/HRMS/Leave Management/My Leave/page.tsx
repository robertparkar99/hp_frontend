"use client";
import { useState } from "react";
import { Calendar, Clock, Filter, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MyLeave = () => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const leaveBalance = {
    annual: { used: 8, total: 24, remaining: 16 },
    sick: { used: 3, total: 12, remaining: 9 },
    personal: { used: 2, total: 6, remaining: 4 },
  };

  const myLeaves = [
    {
      id: 1,
      leaveType: "Annual Leave",
      startDate: "2024-01-15",
      endDate: "2024-01-17",
      days: 3,
      reason: "Family vacation",
      appliedOn: "2024-01-05",
      status: "Approved",
      approvedBy: "John Manager",
      approvedOn: "2024-01-06",
    },
    {
      id: 2,
      leaveType: "Sick Leave",
      startDate: "2024-02-20",
      endDate: "2024-02-21",
      days: 2,
      reason: "Fever and cold",
      appliedOn: "2024-02-19",
      status: "Approved",
      approvedBy: "John Manager",
      approvedOn: "2024-02-19",
    },
    {
      id: 3,
      leaveType: "Personal Leave",
      startDate: "2024-03-10",
      endDate: "2024-03-12",
      days: 3,
      reason: "Personal work",
      appliedOn: "2024-03-01",
      status: "Pending",
      approvedBy: null,
      approvedOn: null,
    },
    {
      id: 4,
      leaveType: "Annual Leave",
      startDate: "2024-02-05",
      endDate: "2024-02-07",
      days: 3,
      reason: "Short vacation",
      appliedOn: "2024-01-25",
      status: "Rejected",
      approvedBy: "John Manager",
      approvedOn: "2024-01-26",
      rejectionReason: "Insufficient notice period",
    },
    {
      id: 5,
      leaveType: "Annual Leave",
      startDate: "2024-04-15",
      endDate: "2024-04-19",
      days: 5,
      reason: "Spring vacation",
      appliedOn: "2024-04-01",
      status: "Approved",
      approvedBy: "John Manager",
      approvedOn: "2024-04-02",
    },
  ];

  const years = ["2024", "2023", "2022"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-success text-success-foreground";
      case "Rejected": return "bg-destructive text-destructive-foreground";
      case "Pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredLeaves = myLeaves.filter(leave => {
    const matchesStatus = selectedStatus === "all" || leave.status === selectedStatus;
    const leaveYear = new Date(leave.startDate).getFullYear().toString();
    const matchesYear = selectedYear === "all" || leaveYear === selectedYear;
    
    return matchesStatus && matchesYear;
  });

  const getBalancePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const LeaveDetailsModal = ({ leave }: { leave: any }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
          <p className="text-foreground">{leave.leaveType}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <Badge className={getStatusColor(leave.status)}>
            {leave.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Start Date</p>
          <p className="text-foreground">{new Date(leave.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">End Date</p>
          <p className="text-foreground">{new Date(leave.endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Duration</p>
          <p className="text-foreground">{leave.days} {leave.days === 1 ? 'day' : 'days'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Applied On</p>
          <p className="text-foreground">{new Date(leave.appliedOn).toLocaleDateString()}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
        <p className="text-foreground">{leave.reason}</p>
      </div>
      {leave.status === "Approved" && leave.approvedBy && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Approved By</p>
            <p className="text-foreground">{leave.approvedBy}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Approved On</p>
            <p className="text-foreground">{new Date(leave.approvedOn).toLocaleDateString()}</p>
          </div>
        </div>
      )}
      {leave.status === "Rejected" && leave.rejectionReason && (
        <div className="pt-4 border-t">
          <p className="text-sm font-medium text-muted-foreground mb-2">Rejection Reason</p>
          <p className="text-destructive">{leave.rejectionReason}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-simple">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Annual Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {leaveBalance.annual.used}</span>
                <span>Remaining: {leaveBalance.annual.remaining}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${getBalancePercentage(leaveBalance.annual.used, leaveBalance.annual.total)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {leaveBalance.annual.used} of {leaveBalance.annual.total} days used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-simple">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sick Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {leaveBalance.sick.used}</span>
                <span>Remaining: {leaveBalance.sick.remaining}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-warning h-2 rounded-full transition-all"
                  style={{ width: `${getBalancePercentage(leaveBalance.sick.used, leaveBalance.sick.total)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {leaveBalance.sick.used} of {leaveBalance.sick.total} days used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-simple">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Personal Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {leaveBalance.personal.used}</span>
                <span>Remaining: {leaveBalance.personal.remaining}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all"
                  style={{ width: `${getBalancePercentage(leaveBalance.personal.used, leaveBalance.personal.total)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {leaveBalance.personal.used} of {leaveBalance.personal.total} days used
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-simple">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
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

      {/* Leave History */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave History ({filteredLeaves.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <Card key={leave.id} className="card-simple">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{leave.leaveType}</h3>
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <p><span className="font-medium">Duration:</span> {leave.days} days</p>
                        <p><span className="font-medium">Applied:</span> {new Date(leave.appliedOn).toLocaleDateString()}</p>
                        <p><span className="font-medium">Period:</span> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Leave Details</DialogTitle>
                        </DialogHeader>
                        <LeaveDetailsModal leave={leave} />
                      </DialogContent>
                    </Dialog>
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

export default MyLeave;
