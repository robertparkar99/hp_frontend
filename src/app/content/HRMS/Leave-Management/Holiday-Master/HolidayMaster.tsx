"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Filter, Clock, MapPin, Star, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Holiday {
  id: number;
  sub_institute_id: number;
  holiday_name: string;
  day_type: string;
  department: string;
  from_date: string;
  to_date: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  department_name: string;
}

interface WeekDay {
  id: number;
  day: string;
  day_type: string;
  sub_institute_id: number;
  created_by: number | null;
  updated_by: number;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Department {
  id: number;
  department: string;
}

interface ApiResponse {
  holidayList: Holiday[];
  weekDayList: WeekDay[];
  status: string;
}

const HolidayMaster = () => {
  const [activeTab, setActiveTab] = useState("holidays");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingDayOffs, setSavingDayOffs] = useState(false);

  // Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
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

  const [dayOffSelections, setDayOffSelections] = useState<Record<string, string>>({
    Monday: "full",
    Tuesday: "full",
    Wednesday: "full",
    Thursday: "full",
    Friday: "full",
    Saturday: "full",
    Sunday: "full",
  });

  // Fetch holidays
  const fetchHolidays = async () => {
    try {
      if (!sessionData.url || !sessionData.subInstituteId || !sessionData.token) return;
      setLoading(true);

      const response = await fetch(
        `${sessionData.url}/hrms/holiday?sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&type=API`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data: ApiResponse = await response.json();

      if (data.status === "1") {
        setHolidays(data.holidayList);
        setWeekDays(data.weekDayList);

        const newSelections: Record<string, string> = { ...dayOffSelections };
        data.weekDayList.forEach((weekDay) => {
          const dayName = weekDay.day.charAt(0).toUpperCase() + weekDay.day.slice(1);
          if (newSelections.hasOwnProperty(dayName)) {
            newSelections[dayName] = weekDay.day_type;
          }
        });
        setDayOffSelections(newSelections);
      } else throw new Error("API returned an error status");
    } catch (err) {
      console.error("Error fetching holidays:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionData.url && sessionData.subInstituteId && sessionData.token) {
      fetchHolidays();
    }
  }, [sessionData]);

  // Fetch departments
  useEffect(() => {
    if (!sessionData.subInstituteId || !sessionData.token) return;

    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
        );

        if (!res.ok) throw new Error(`Department API error! status: ${res.status}`);

        const json = await res.json();
        const list = Object.entries(json.data || {}).map(([deptName, jobRoles]) => {
          const deptId = (jobRoles as any[])[0]?.department_id;
          const department = (jobRoles as any[])[0]?.department_name || deptName;
          return { id: deptId, department };
        });
        setDepartments(list);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };

    fetchDepartments();
  }, [sessionData]);

  // Delete holiday function
  const deleteHoliday = async (holidayId: number) => {
    try {
      setDeletingId(holidayId);

      const response = await fetch(
        `${sessionData.url}/hrms/holiday/${holidayId}?sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&user_id=${sessionData.userId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error(`Failed to delete holiday: ${response.status}`);

      const result = await response.json();
      console.log("Holiday deleted:", result);

      // Refresh the holidays list
      await fetchHolidays();
    } catch (err) {
      console.error("Error deleting holiday:", err);
      alert("Error deleting holiday");
    } finally {
      setDeletingId(null);
    }
  };

  // Save day offs (weekdays) function
  const saveDayOffs = async () => {
    try {
      setSavingDayOffs(true);

      // Convert day names to lowercase for the API
      const params = new URLSearchParams();
      params.append("sub_institute_id", sessionData.subInstituteId);
      params.append("token", sessionData.token);
      params.append("user_id", sessionData.userId);
      // Add each day's selection
      Object.entries(dayOffSelections).forEach(([day, value]) => {
        params.append(day.toLowerCase(), value);
      });

      const response = await fetch(
        `${sessionData.url}/hrms/holiday_weekdays?${params.toString()}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) throw new Error(`Failed to save day offs: ${response.status}`);

      const result = await response.json();
      console.log("Day offs saved:", result);

      alert("Day offs saved successfully!");
    } catch (err) {
      console.error("Error saving day offs:", err);
      alert("Error saving day offs");
    } finally {
      setSavingDayOffs(false);
    }
  };

  // ---------------------------
  // Add Holiday Form Component
  // ---------------------------
  const AddHolidayForm = () => {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const values = Array.from(e.target.selectedOptions, (option) => option.value);
      setSelectedDepartments(values);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !date || selectedDepartments.length === 0) {
        alert("Please fill all fields");
        return;
      }

      try {
        setIsSubmitting(true);
        const params = new URLSearchParams();
        params.append("sub_institute_id", sessionData.subInstituteId);
        params.append("token", sessionData.token);
        params.append("holiday_name", name);
        params.append("from_date", date);
        params.append("to_date", date); // Use the same date for to_date
        selectedDepartments.forEach((deptId, idx) =>
          params.append(`department[${idx}]`, deptId)
        );
        params.append("user_id", sessionData.userId);

        const response = await fetch(`${sessionData.url}/hrms/holiday`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });

        if (!response.ok) throw new Error("Failed to add holiday");

        const result = await response.json();
        console.log("Holiday added:", result);

        // Refresh the holidays list instead of reloading the page
        await fetchHolidays();

        // Reset form and close modal
        setName("");
        setDate("");
        setSelectedDepartments([]);
        setIsAddModalOpen(false);
      } catch (err) {
        console.error("Error adding holiday:", err);
        alert("Error adding holiday");
      } finally {
        setIsSubmitting(false);
      }
    };

    // keyboard select all
    useEffect(() => {
      const select = document.getElementById("department") as HTMLSelectElement | null;
      if (!select) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          e.preventDefault();
          for (let i = 0; i < select.options.length; i++) select.options[i].selected = true;
        }
      };

      select.addEventListener("keydown", handleKeyDown);
      return () => select.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
      <div className="bg-background p-6 border border-border/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Holiday Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter holiday name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              multiple
              value={selectedDepartments}
              onChange={handleDepartmentChange}
              className="w-full border rounded-md p-2"
              required
            >
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department}
                  </option>
                ))
              ) : (
                <option disabled>No departments found</option>
              )}
            </select>
            <p className="text-sm text-muted-foreground">Hold Ctrl/Cmd to select multiple departments</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2 rounded-full text-white font-sem ibold bg-gradient-to-r from-blue-500 to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                    <Plus className="h-4 w-4 mr-2" />
                 Submit
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // ---------------------------
  // Rest of your code unchanged
  // ---------------------------
  const months = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
    { value: "2024-04", label: "April 2024" },
    { value: "2024-05", label: "May 2024" },
    { value: "2024-06", label: "June 2024" },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "National Holiday":
        return "bg-primary text-primary-foreground shadow-sm";
      case "Festival":
        return "bg-gradient-to-r from-warning to-warning/80 text-warning-foreground shadow-sm";
      case "Religious":
        return "bg-success text-success-foreground shadow-sm";
      case "Company Event":
        return "bg-gradient-to-r from-secondary to-muted text-foreground shadow-sm";
      case "Maintenance":
        return "bg-muted text-muted-foreground border border-border";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "National Holiday":
        return <Star className="h-4 w-4" />;
      case "Festival":
        return <Sparkles className="h-4 w-4" />;
      case "Religious":
        return <Calendar className="h-4 w-4" />;
      case "Company Event":
        return <MapPin className="h-4 w-4" />;
      case "Maintenance":
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const renderList = (items: Holiday[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="group bg-gradient-to-br from-card to-card/80 border-border/30 hover:border-primary/40 hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <Badge className={`${getTypeColor("National Holiday")} text-xs font-medium px-2 py-0.5`}>
                    {item.day_type === "full" ? "Full Day" : "Half Day"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive-light/50 transition-all opacity-0 group-hover:opacity-100"
                  onClick={() => deleteHoliday(item.id)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></div>
                  ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-2">{item.holiday_name}</h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">Departments: {item.department_name}</p>

              <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-xs font-medium text-primary">
                  {new Date(item.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {item.from_date !== item.to_date &&
                    ` - ${new Date(item.to_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading holidays...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="p-3 bg-destructive/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-xl">
      {/* Modern Gradient Header */}
      <div className="bg-[#6fb2f2] text-primary-foreground rounded-xl ">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Holiday Master</h1>
                  <p className="text-white/90 text-lg">Manage holidays and day-offs for your organization</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <Filter className="h-5 w-5 text-white/80" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:ring-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-5 w-5 mr-2" />
                    Add {activeTab === "holidays" ? "Holiday" : "Day Off"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-0 shadow-2xl">
                  <DialogHeader className="space-y-3 pb-2">
                    <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Add New {activeTab === "holidays" ? "Holiday" : "Day Off"}
                    </DialogTitle>
                  </DialogHeader>
                  <AddHolidayForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-4 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Holidays</p>
                  <p className="text-xl font-bold text-foreground">
                    {holidays.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Star className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-xl font-bold text-foreground">
                    {holidays.filter(
                      (item) =>
                        new Date(item.from_date).getMonth() === new Date(selectedMonth + "-01").getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                  <p className="text-xl font-bold text-foreground">
                    {holidays.filter((item) => new Date(item.from_date) > new Date()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Past Events</p>
                  <p className="text-xl font-bold text-foreground">
                    {holidays.filter((item) => new Date(item.from_date) < new Date()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="bg-gradient-to-br from-card via-card to-card/50 border-border/30 shadow-lg overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-muted/20 to-transparent">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/30 p-0.5 h-10 bg-[#EFF4FF]">
                <TabsTrigger
                  value="holidays"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm h-8"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Holidays
                </TabsTrigger>
                <TabsTrigger
                  value="dayoffs"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm h-8"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Day Offs
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="holidays" className="mt-0 space-y-4">
                {holidays.length > 0 ? (
                  renderList(holidays)
                ) : (
                  <div className="text-center py-8">
                    <div className="p-3 bg-muted/30 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-base mb-1">No holidays found</p>
                    <p className="text-muted-foreground text-sm">Add your first holiday to get started</p>
                  </div>
                )}
              </TabsContent>

              {/* Day Offs UI */}
              <TabsContent value="dayoffs" className="mt-0 space-y-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <div key={day} className="space-y-2">
                        <Label className="block text-sm font-medium text-foreground">{day}</Label>
                        <Select
                          value={dayOffSelections[day]}
                          onValueChange={(val) =>
                            setDayOffSelections((prev) => ({ ...prev, [day]: val }))
                          }
                        >
                          <SelectTrigger className="w-full border-border/50 focus:border-primary">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Day</SelectItem>
                            <SelectItem value="half">Half Day</SelectItem>
                            <SelectItem value="weekend">Weekend</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                    id="submit"
                      onClick={saveDayOffs}
                      className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
                      disabled={savingDayOffs}
                    >
                      {savingDayOffs ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HolidayMaster;