"use client";
import { useState, useEffect } from "react";
import { Filter, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AcademicYear = {
  id: number;
  syear: string;
  title: string;
};

type Leave = {
  id: number;
  from_date: string;
  to_date: string;
  comment: string | null;
  leave_type_name: string;
  status: string | null;
  created_at: string;
  approved_by: string;
};

type LeaveBalance = {
  [key: string]: { used: number; total: number; remaining: number };
};

const MyLeave = () => {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({});
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });

  // Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // 🔹 Fetch academic years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=academic_year&sub_institute_id=${sessionData.subInstituteId}&group_by=syear`
        );
        const data: AcademicYear[] = await res.json();
        // sort latest first
        const sorted = data.sort((a, b) => b.syear.localeCompare(a.syear));
        setYears(sorted);
        if (sorted.length > 0) {
          setSelectedYear(sorted[0].syear); // default: latest year
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, [sessionData.url, sessionData.subInstituteId]);

  // 🔹 Fetch leaves based on selected year
  useEffect(() => {
    if (!selectedYear) return;
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${sessionData.url}/get-leave?year=${selectedYear}&user_id=${sessionData.userId}&sub_institute_id=${sessionData.subInstituteId}&type=API`
        );
        const data: Leave[] = await res.json();
        setLeaves(data);

        // compute leave balance
        const balance: LeaveBalance = {};
        data.forEach((leave) => {
          const key = leave.leave_type_name;
          const from = new Date(leave.from_date);
          const to = new Date(leave.to_date);
          const days =
            Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) +
            1;

          if (!balance[key]) {
            balance[key] = { used: 0, total: 30, remaining: 30 };
          }
          balance[key].used += days;
          balance[key].remaining = balance[key].total - balance[key].used;
        });
        setLeaveBalance(balance);
      } catch (error) {
        console.error("Error fetching leaves:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [selectedYear, sessionData.url, sessionData.subInstituteId, sessionData.userId]);

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success text-success-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getBalancePercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const getDurationDays = (from_date: string, to_date: string) => {
    const from = new Date(from_date);
    const to = new Date(to_date);
    return (
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  const LeaveDetailsModal = ({ leave }: { leave: Leave }) => (
    <div className="space-y-4 min-h-screen bg-background rounded-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
          <p className="text-foreground">{leave.leave_type_name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <Badge className={getStatusColor(leave.status)}>
            {leave.status ?? "N/A"}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Start Date</p>
          <p className="text-foreground">
            {new Date(leave.from_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">End Date</p>
          <p className="text-foreground">
            {new Date(leave.to_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Duration</p>
          <p className="text-foreground">
            {getDurationDays(leave.from_date, leave.to_date)} days
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Applied On</p>
          <p className="text-foreground">
            {new Date(leave.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      {leave.comment && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Reason
          </p>
          <p className="text-foreground">{leave.comment}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Approved By
          </p>
          <p className="text-foreground">{leave.approved_by}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 min-h-screen bg-background rounded-xl">
      {/* Leave Balance Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(leaveBalance).map((type) => (
          <Card key={type} className="card-simple">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used: {leaveBalance[type].used}</span>
                  <span>Remaining: {leaveBalance[type].remaining}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${getBalancePercentage(
                        leaveBalance[type].used,
                        leaveBalance[type].total
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {leaveBalance[type].used} of {leaveBalance[type].total} days
                  used
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Filters */}
      <Card className="card-simple">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-55">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.syear}>
                      {year.title} {/* 👈 Show full title in dropdown */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card className="card-elevated ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave History ({loading ? "Loading..." : leaves.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!loading && leaves.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No leave records found.
              </p>
            )}
            {leaves.map((leave) => (
              <Card key={leave.id} className="card-simple">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {leave.leave_type_name}
                        </h3>
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status ?? "N/A"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {getDurationDays(leave.from_date, leave.to_date)} days
                        </p>
                        <p>
                          <span className="font-medium">Applied:</span>{" "}
                          {new Date(leave.created_at).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Period:</span>{" "}
                          {new Date(leave.from_date).toLocaleDateString()} -{" "}
                          {new Date(leave.to_date).toLocaleDateString()}
                        </p>
                      </div>
                      {leave.comment && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          <span className="font-medium">Reason:</span>{" "}
                          {leave.comment}
                        </p>
                      )}
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
