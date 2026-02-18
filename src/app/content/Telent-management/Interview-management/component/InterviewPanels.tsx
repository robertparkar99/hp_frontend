
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

interface Panel {
  id: number;
  panel_name: string;
  target_positions: string;
  description: string;
  available_interviewers: string;
  status: string;
  upcoming_interviews: number;
  total_interviews: number;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
  department: string;
}

const POSITIONS = [
  "Senior Software Engineer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "DevOps Engineer",
  "QA Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "Engineering Manager",
  "Technical Lead"
];

export default function InterviewPanels() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sessionData, setSessionData] = useState<{ url?: string; token?: string; sub_institute_id?: string | number }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [panelName, setPanelName] = useState("");
  const [panelDescription, setPanelDescription] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState<number[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchPanels();
      fetchEmployees();
    }
  }, [sessionData.url, sessionData.token, sessionData.sub_institute_id]);

  const fetchPanels = async () => {
    setLoading(true);
    try {
          const response = await fetch(`${sessionData.url}/api/interview-panel/list?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}`);
          const data = await response.json();
          if (data.status && data.data) {
              const formattedPanels: Panel[] = data.data.map((panel: any) => ({
                id: panel.id,
                panel_name: panel.panel_name,
                target_positions: panel.target_positions,
                description: panel.description,
                available_interviewers: panel.available_interviewers,
                status: panel.status,
                upcoming_interviews: Math.floor(Math.random() * 5), // Mock data
                total_interviews: Math.floor(Math.random() * 20) + 5 // Mock data
              }));
            setPanels(formattedPanels);
          }
        } catch (error) {
          console.error("Error fetching panels:", error);
        } finally {
          setLoading(false);
        }
    };

  const fetchEmployees = async () => {
    try {
          const response = await fetch(`${sessionData.url}/api/employee/list?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}`);
          const data = await response.json();
          if (data.data) {
            const formattedEmployees: Employee[] = data.data.map((emp: any) => ({
              id: emp.id,
              name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
              role: emp.role || "Team Member",
              email: emp.email || "",
              department: emp.department || ""
            }));
            setEmployees(formattedEmployees);
            setAvailableEmployees(formattedEmployees);
          }
        } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

  const handleCreatePanel = async () => {
    if (!panelName.trim()) {
      toast({
        title: "Error",
        description: "Panel name is required",
        variant: "destructive"
      });
      return;
    }

      if (selectedPositions.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one target position",
          variant: "destructive"
        });
        return;
        }

      if (selectedInterviewers.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one interviewer",
          variant: "destructive"
        });
        return;
        }

      const payload = {
          panel_name: panelName,
          target_positions: selectedPositions.join(","),
          description: panelDescription,
          available_interviewers: JSON.stringify(selectedInterviewers),
          status: "available",
          sub_institute_id: sessionData.sub_institute_id,
          user_id: sessionData.sub_institute_id
        };

      try {
          const response = await fetch(`${sessionData.url}/api/interview-panel?type=API&token=${sessionData.token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
              toast({
                title: "Success",
                description: "Panel created successfully"
              });
              fetchPanels();
              resetForm();
            } else {
            throw new Error("Failed to create panel");
          }
        } catch (error) {
        console.error("Error creating panel:", error);
        toast({
          title: "Error",
          description: "Failed to create panel",
          variant: "destructive"
        });
      }
    };

  const handleDeletePanel = async (panelId: number) => {
    if (!confirm("Are you sure you want to delete this panel?")) return;

    try {
      const response = await fetch(`${sessionData.url}/api/interview-panel/${panelId}?type=API&token=${sessionData.token}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Panel deleted successfully"
        });
        fetchPanels();
      } else {
        throw new Error("Failed to delete panel");
      }
    } catch (error) {
      console.error("Error deleting panel:", error);
      toast({
        title: "Error",
        description: "Failed to delete panel",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setPanelName("");
    setPanelDescription("");
    setSelectedPositions([]);
    setSelectedInterviewers([]);
    setEditingPanel(null);
    setIsDialogOpen(false);
  };

  const handleEditPanel = (panel: Panel) => {
      setEditingPanel(panel);
      setPanelName(panel.panel_name);
      setPanelDescription(panel.description);
      setSelectedPositions(panel.target_positions.split(","));
      setSelectedInterviewers(JSON.parse(panel.available_interviewers || "[]"));
      setIsDialogOpen(true);
    };

  const handleUpdatePanel = async () => {
    if (!editingPanel) return;

    const payload = {
      panel_name: panelName,
      target_positions: selectedPositions.join(","),
      description: panelDescription,
      available_interviewers: JSON.stringify(selectedInterviewers),
      status: editingPanel.status,
      sub_institute_id: sessionData.sub_institute_id
    };

    try {
          const response = await fetch(`${sessionData.url}/api/interview-panel/${editingPanel.id}?type=API&token=${sessionData.token}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
              toast({
                title: "Success",
                description: "Panel updated successfully"
              });
              fetchPanels();
              resetForm();
            } else {
            throw new Error("Failed to update panel");
          }
        } catch (error) {
        console.error("Error updating panel:", error);
        toast({
          title: "Error",
          description: "Failed to update panel",
          variant: "destructive"
        });
      }
    };

  const togglePosition = (position: string) => {
    setSelectedPositions(prev =>
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const toggleInterviewer = (employeeId: number) => {
    setSelectedInterviewers(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const filteredPanels = panels.filter(panel => {
    const matchesSearch = panel.panel_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || panel.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
      <div className="space-y-6" id="tour-panel-members">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Interview Panels</h1>
            <p className="text-muted-foreground text-sm">
              Manage interview panels and assign team members
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" id="tour-create-panel-button" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Panel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPanel ? "Edit Panel" : "Create New Panel"}</DialogTitle>
                <DialogDescription>
                  {editingPanel ? "Update the panel details below" : "Fill in the details to create a new interview panel"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="panel-name">Panel Name *</Label>
                  <Input
                    id="panel-name"
                    placeholder="e.g., Senior Engineering Panel"
                    value={panelName}
                    onChange={(e) => setPanelName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-md min-h-[80px]"
                    placeholder="Describe the purpose of this panel..."
                    value={panelDescription}
                    onChange={(e) => setPanelDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Positions *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {POSITIONS.map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={selectedPositions.includes(position)}
                          onCheckedChange={() => togglePosition(position)}
                        />
                                        <label
                                          htmlFor={`position-${position}`}
                                          className="text-sm cursor-pointer"
                                        >
                                          {position}
                                        </label>
                                      </div>
                                    ))}
                  </div>
                            </div>
                <div className="space-y-2">
                  <Label>Available Interviewers *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`employee-${employee.id}`}
                          checked={selectedInterviewers.includes(employee.id)}
                          onCheckedChange={() => toggleInterviewer(employee.id)}
                        />
                        <label
                          htmlFor={`employee-${employee.id}`}
                          className="text-sm cursor-pointer"
                        >
                                          {employee.name} ({employee.role})
                                        </label>
                                      </div>
                                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingPanel ? handleUpdatePanel : handleCreatePanel}>
                  {editingPanel ? "Update Panel" : "Create Panel"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search and Filters */}
          <Card className="lg:col-span-1 h-fit widget-card">
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2" id="tour-panel-search">
                <label className="text-sm font-medium">Search Panels</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="panel-search-input"
                    placeholder="Search by name..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2" id="tour-panel-filter">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Panels</option>
                  <option value="available">Active</option>
                  <option value="unavailable">Inactive</option>
                </select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Panels List */}
          <Card className="lg:col-span-3 widget-card" id="tour-panel-cards">
            <CardHeader>
              <CardTitle className="text-lg">Panels List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredPanels.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No panels found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by creating a new panel"}
                    </p>
                  </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="tour-panel-cards-grid">
                      {filteredPanels.map((panel) => (
                                  <div
                                    key={panel.id}
                                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-medium">{panel.panel_name}</h3>
                                          <Badge
                                            variant={panel.status === "available" ? "default" : "secondary"}
                                            className={panel.status === "available" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}
                                          >
                                            {panel.status === "available" ? "Active" : "Inactive"}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {panel.description || "No description"}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1 tour-panel-actions">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleEditPanel(panel)}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => handleDeletePanel(panel.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-muted-foreground">Target Positions</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {panel.target_positions.split(",").slice(0, 2).map((pos, idx) => (
                                              <Badge key={idx} variant="outline" className="text-xs">
                                                {pos}
                                              </Badge>
                                            ))}
                                            {panel.target_positions.split(",").length > 2 && (
                                              <Badge variant="outline" className="text-xs">
                                                +{panel.target_positions.split(",").length - 2}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Interviewers</p>
                                          <div className="flex items-center gap-1 mt-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                              {JSON.parse(panel.available_interviewers || "[]").length}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                        <div>
                                          <p className="text-muted-foreground">Upcoming</p>
                                          <p className="font-medium">{panel.upcoming_interviews}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Total</p>
                                          <p className="font-medium">{panel.total_interviews}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                    </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
}
