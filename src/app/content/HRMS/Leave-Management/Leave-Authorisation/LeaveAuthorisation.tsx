"use client";
import { useState, useEffect } from "react";
import { Users, Search, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const LeaveAuthorization = () => {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 🔹 Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveStatus, setLeaveStatus] = useState<string[]>([]);
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

  // 🔹 Leave Status Options
  const statusOptions = ["Approved", "Rejected", "Pending"];

  // 🔹 Handle keyboard (Ctrl + A for select all)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setLeaveStatus((prev) =>
        prev.length === statusOptions.length ? [] : [...statusOptions]
      );
    }
  };

  // ✅ Fetch API Data
  const fetchData = async () => {
    try {
      setLoading(true);

      let url = `${sessionData.url}/show-leave-authorisation?type=API&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`;

      if (fromDate) url += `&from_date=${fromDate}`;
      if (toDate) url += `&to_date=${toDate}`;
      leaveStatus.forEach((status, i) => {
        url += `&leave_status[${i}]=${status}`;
      });

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      const mapped =
        data.get_employee_leave_lists?.map((item: any) => ({
          id: item.id,
          employeeName: item.employee_name,
          employeeId: `EMP${item.user_id}`,
          leaveType: item.leave_type,
          startDate: item.from_date,
          endDate: item.to_date,
          days:
            (new Date(item.to_date).getTime() -
              new Date(item.from_date).getTime()) /
            (1000 * 60 * 60 * 24) +
            1,
          reason: item.comment ?? "No reason provided",
          appliedOn: item.created_at,
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          hodComment: item.hod_comment ?? "",
          hrRemarks: item.hr_remarks ?? "",
          // 🔹 local editable values
          updatedStatus: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          updatedHodComment: item.hod_comment ?? "",
          updatedHrRemarks: item.hr_remarks ?? "",
        })) ?? [];

      setLeaveRequests(mapped);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leave requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve button will update DB with dropdown + remarks
  const handleUpdate = async (request: any) => {
    try {
      const formData = new FormData();

      formData.append(`hod_comment[${request.id}]`, request.updatedHodComment || "");
      formData.append(`hr_remarks[${request.id}]`, request.updatedHrRemarks || "");

      // 🔹 send status as string
      formData.append(`single_leave_status[${request.id}]`, request.updatedStatus);

      formData.append(`checkedEmp[${request.id}]`, request.id.toString());
      formData.append("type", "API");

      const res = await fetch(
        `${sessionData.url}/leave-authorisation-store?type=API&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: `${request.employeeName}'s leave updated to ${request.updatedStatus}.`,
      });

      fetchData();
    } catch (error) {
      console.error("Error updating leave:", error);
      toast({
        title: "Error",
        description: "Failed to update leave request.",
        variant: "destructive",
      });
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-success text-success-foreground";
      case "Rejected":
        return "bg-destructive text-destructive-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-background rounded-xl">
      {/* 🔹 Filter Section */}
      <Card className="card-simple">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {/* From Date */}
            <div>
              <label className="block text-sm font-medium mb-1">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium mb-1">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Leave Status Multi-select */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Status
              </label>
              <div
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="border rounded-md p-2 w-full max-h-40 overflow-y-auto focus:outline-none"
              >
                {statusOptions.map((status) => {
                  const isSelected = leaveStatus.includes(status);
                  return (
                    <div
                      key={status}
                      onClick={() =>
                        setLeaveStatus((prev) =>
                          isSelected
                            ? prev.filter((s) => s !== status)
                            : [...prev, status]
                        )
                      }
                      className={`cursor-pointer px-2 py-1  ${isSelected
                        ? "bg-blue-400 text-primary-foreground"
                        : "hover:bg-muted"
                        }`}
                    >
                      {status}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex ml-7 mt-7">
              <Button
                onClick={() => {
                  if (leaveStatus.length === 0) {
                    alert("Please select at least one leave status before searching.");
                    return;
                  }
                  setHasSearched(true);
                  fetchData();
                }}
                  className="px-6 py-2 rounded-lg  flex items-center bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
              >
             
                   {loading ? "Searching..." : "Search"}
                {/* <Search className="h-4 w-4" /> Search */}
              </Button>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      {!loading && hasSearched && leaveRequests.length > 0 && (
        <Card className="card-elevated mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leave Requests ({leaveRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request, index) => (
                <Card key={request.id} className="card-simple">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {request.employeeName}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>

                        {/* Editable Fields */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">ID:</span>{" "}
                            {request.employeeId}
                          </p>

                          {/* HOD Comment */}
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-muted-foreground">
                              HOD's Comment
                            </label>
                            <Input
                              type="text"
                              value={request.updatedHodComment}
                              onChange={(e) => {
                                const newRequests = [...leaveRequests];
                                newRequests[index].updatedHodComment = e.target.value;
                                setLeaveRequests(newRequests);
                              }}
                              className="mt-1 h-8 w-50 text-foreground"
                            />
                          </div>

                          {/* HR Remarks */}
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-muted-foreground">
                              HR Remarks
                            </label>
                            <Input
                              type="text"
                              value={request.updatedHrRemarks}
                              onChange={(e) => {
                                const newRequests = [...leaveRequests];
                                newRequests[index].updatedHrRemarks = e.target.value;
                                setLeaveRequests(newRequests);
                              }}
                              className="mt-1 h-8 w-50 text-foreground"
                            />
                          </div>

                          {/* Status Dropdown */}
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-muted-foreground">
                              Status
                            </label>
                            <select
                              value={request.updatedStatus}
                              onChange={(e) => {
                                const newRequests = [...leaveRequests];
                                newRequests[index].updatedStatus = e.target.value;
                                setLeaveRequests(newRequests);
                              }}
                              className="border rounded-md mt-1 h-8 px-2 w-50 text-sm text-foreground"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          {`${new Date(request.startDate).getDate().toString().padStart(2, "0")}-${(
                            new Date(request.startDate).getMonth() + 1
                          )
                            .toString()
                            .padStart(2, "0")}-${new Date(request.startDate).getFullYear()}`}{" "}
                          -{" "}
                          {`${new Date(request.endDate).getDate().toString().padStart(2, "0")}-${(
                            new Date(request.endDate).getMonth() + 1
                          )
                            .toString()
                            .padStart(2, "0")}-${new Date(request.endDate).getFullYear()}`}
                        </p>

                      </div>

                      {/* 🔹 Approve button = Update trigger */}
                      <div className="flex items-center gap-2">
                        <div className="mt-8">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdate(request)}
                            className="p-2 hover:bg-transparent text-gray-500 hover:text-green-600 focus:text-green-600"
                          >
                            <CheckCircle className="h-8 w-8" />
                          </Button>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="mt-8 h-8" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>
                                Leave Application Details
                              </DialogTitle>
                            </DialogHeader>
                            {/* More modal content here */}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveAuthorization;
