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

const HolidayMaster = () => {
  const [activeTab, setActiveTab] = useState("holidays");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // NEW: state for weekly selections
  const [dayOffSelections, setDayOffSelections] = useState<Record<string, string>>({
    Monday: "full",
    Tuesday: "full",
    Wednesday: "full",
    Thursday: "full",
    Friday: "full",
    Saturday: "full",
    Sunday: "weekend",
  });

  const holidays = [
    { id: 1, name: "New Year's Day", date: "2024-01-01", type: "National Holiday", description: "Start of the new year" },
    { id: 2, name: "Republic Day", date: "2024-01-26", type: "National Holiday", description: "India's Republic Day celebration" },
    { id: 3, name: "Holi", date: "2024-03-13", type: "Festival", description: "Festival of colors" },
    { id: 4, name: "Good Friday", date: "2024-03-29", type: "Religious", description: "Christian holiday" },
    { id: 5, name: "Eid al-Fitr", date: "2024-04-10", type: "Religious", description: "End of Ramadan" },
  ];

  const dayOffs = [
    { id: 1, name: "Company Foundation Day", date: "2024-02-15", type: "Company Event", description: "Annual celebration" },
    { id: 2, name: "Team Building Day", date: "2024-03-20", type: "Company Event", description: "Quarterly team activity" },
    { id: 3, name: "Annual Maintenance", date: "2024-04-05", type: "Maintenance", description: "System maintenance day" },
  ];

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
      case "National Holiday": return "bg-primary text-primary-foreground shadow-sm";
      case "Festival": return "bg-gradient-to-r from-warning to-warning/80 text-warning-foreground shadow-sm";
      case "Religious": return "bg-success text-success-foreground shadow-sm";
      case "Company Event": return "bg-gradient-to-r from-secondary to-muted text-foreground shadow-sm";
      case "Maintenance": return "bg-muted text-muted-foreground border border-border";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "National Holiday": return <Star className="h-4 w-4" />;
      case "Festival": return <Sparkles className="h-4 w-4" />;
      case "Religious": return <Calendar className="h-4 w-4" />;
      case "Company Event": return <MapPin className="h-4 w-4" />;
      case "Maintenance": return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const AddHolidayForm = () => {
    useEffect(() => {
      const select = document.getElementById("department") as HTMLSelectElement | null;
      if (!select) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          e.preventDefault();
          for (let i = 0; i < select.options.length; i++) {
            select.options[i].selected = true;
          }
        }
      };

      select.addEventListener("keydown", handleKeyDown);
      return () => select.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
      <div className="bg-gradient-to-br from-background to-muted/30 p-6 border border-border/50">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Holiday Name
            </Label>
            <Input
              id="name"
              placeholder="Enter holiday name"
              className="border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-foreground">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              className="border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Department Multi-Select */}
          <div className="space-y-2">
            <Label htmlFor="department" className="text-md font-medium text-foreground">
              Department
            </Label>
            <select
              id="department"
              multiple
              className="w-full border border-border/50 rounded-md p-2 text-sm focus:border-primary focus:ring-primary/20 transition-all h-30"
            >
              <option value="academic">Academic Division</option>
              <option value="finance">Accounts & Finance Department</option>
              <option value="assistant">Accounts Assistant Team</option>
              <option value="accounts">Accounts Department</option>
              <option value="team">Accounts Team</option>
            </select>
          </div>

          {/* Removed Description field */}

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/30">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="hover:bg-muted/50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab === "holidays" ? "Holiday" : "Day Off"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const renderList = (items: any[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group bg-gradient-to-br from-card to-card/80 border-border/30 hover:border-primary/40 hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header with icon and badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {getTypeIcon(item.type)}
                  </div>
                  <Badge className={`${getTypeColor(item.type)} text-xs font-medium px-2 py-0.5`}>
                    {item.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive-light/50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Title */}
              <div>
                <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-2">{item.name}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>

              {/* Date */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-xs font-medium text-primary">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
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
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
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
              </div>

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
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total {activeTab === "holidays" ? "Holidays" : "Day Offs"}</p>
                  <p className="text-xl font-bold text-foreground">
                    {activeTab === "holidays" ? holidays.length : dayOffs.length}
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
                    {(activeTab === "holidays" ? holidays : dayOffs).filter(
                      (item) =>
                        new Date(item.date).getMonth() === new Date(selectedMonth + "-01").getMonth()
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
                    {(activeTab === "holidays" ? holidays : dayOffs).filter((item) => new Date(item.date) > new Date()).length}
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
                    {(activeTab === "holidays" ? holidays : dayOffs).filter((item) => new Date(item.date) < new Date()).length}
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
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/30 p-0.5 h-10">
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

              {/* NEW Day Offs UI */}
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

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => console.log("Day Offs Saved:", dayOffSelections)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Save changes
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
