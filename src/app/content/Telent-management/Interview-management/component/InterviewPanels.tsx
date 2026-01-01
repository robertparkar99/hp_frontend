import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string | number;
  org_type?: string;
}

interface Panel {
  id: number;
  name: string;
  description: string;
  positions: string[];
  members: any[];
  status: string;
  upcomingInterviews: number;
  totalInterviews: number;
}

interface Interviewer {
  id: number;
  name: string;
  role: string;
  expertise: string[];
  department?: string;
}

// Available interviewers pool
const availableInterviewers = [
  { id: 1, name: "John Smith", role: "Engineering Manager", department: "Engineering", expertise: ["Technical Architecture", "Leadership"] },
  { id: 2, name: "Emily Chen", role: "Senior Developer", department: "Engineering", expertise: ["React", "Node.js", "System Design"] },
  { id: 3, name: "David Wilson", role: "Technical Lead", department: "Engineering", expertise: ["DevOps", "Cloud Architecture"] },
  { id: 4, name: "Sarah Johnson", role: "Product Director", department: "Product", expertise: ["Strategy", "Roadmapping"] },
  { id: 5, name: "Michael Rodriguez", role: "UX Lead", department: "Design", expertise: ["User Research", "Design Systems"] },
  { id: 6, name: "Anna Taylor", role: "Design Director", department: "Design", expertise: ["Design Leadership", "Brand"] },
  { id: 7, name: "Mark Brown", role: "HR Manager", department: "HR", expertise: ["Behavioral Assessment", "Culture Fit"] },
  { id: 8, name: "Lisa Zhang", role: "Data Scientist", department: "Analytics", expertise: ["Machine Learning", "Statistics"] }
];


export default function InterviewPanels() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPanel, setSelectedPanel] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [newPanel, setNewPanel] = useState({
    name: "",
    description: "",
    positions: [] as number[],
    members: [] as any[]
  });

  const [availableInterviewers, setAvailableInterviewers] = useState<Interviewer[]>([]);
  const [availablePositions, setAvailablePositions] = useState<{id: number, title: string}[]>([]);

  const [panels, setPanels] = useState<Panel[]>([]);
  const [positionsOpen, setPositionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<number | null>(null);

  const fetchInterviewers = async () => {
    try {
      const response = await fetch(`${sessionData.url}/api/interview-panel/users?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
      const data = await response.json();
      if (data.status && data.data) {
        const mappedData = data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.job_role,
          expertise: item.skills,
          department: ''
        }));
        setAvailableInterviewers(mappedData);
        return mappedData;
      }
    } catch (error) {
      console.error('Error fetching interviewers:', error);
    }
    return [];
  };

  const fetchPanels = async (interviewers: Interviewer[], positions: {id: number, title: string}[]) => {
    try {
      const response = await fetch(`${sessionData.url}/api/interview-panel/list?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}`);
      const data = await response.json();
      if (data.status && data.data) {
        const mappedPanels = data.data.map((item: any) => {
          let panelInterviewers: any[] = [];
          try {
            const interviewerIds = JSON.parse(item.available_interviewers);
            panelInterviewers = interviewerIds.map((id: string | number) => {
              const interviewer = interviewers.find(i => i.id.toString() === id.toString());
              return interviewer || { id: parseInt(id.toString()), name: id.toString(), role: '', expertise: [] };
            });
          } catch (e) {
            panelInterviewers = [];
          }
          const positionTitles = item.target_positions.split(',').map((s: string) => {
            const trimmed = s.trim();
            const pos = positions.find(p => p.id.toString() === trimmed);
            return pos ? pos.title : trimmed;
          });
          return {
            id: item.id,
            name: item.panel_name,
            description: item.description,
            positions: positionTitles,
            members: panelInterviewers,
            status: item.status,
            upcomingInterviews: 0,
            totalInterviews: 0
          };
        });
        setPanels(mappedPanels);
      }
    } catch (error) {
      console.error('Error fetching panels:', error);
    }
  };

  // ---------- Load session ----------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type } =
          JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type });
      }
    }
  }, []);

  useEffect(() => {
    if (!sessionData.sub_institute_id) return;
    const fetchData = async () => {
      try {
        // Fetch interviewers
        const interviewersResponse = await fetch(`${sessionData.url}/api/interview-panel/users?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
        const interviewersData = await interviewersResponse.json();
        let interviewers: Interviewer[] = [];
        if (interviewersData.status && interviewersData.data) {
          interviewers = interviewersData.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            role: item.job_role,
            expertise: item.skills,
            department: ''
          }));
          setAvailableInterviewers(interviewers);
        }

        // Fetch positions
        const positionsResponse = await fetch(`${sessionData.url}/api/job-postings?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
        const positionsData = await positionsResponse.json();
        let positions: {id: number, title: string}[] = [];
        if (positionsData.data) {
          positions = positionsData.data.map((item: any) => ({ id: item.id, title: item.title }));
          setAvailablePositions(positions);
        }

        // Fetch panels
        await fetchPanels(interviewers, positions);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [sessionData.sub_institute_id, sessionData.url, sessionData.token]);

  const filteredPanels = panels.filter(panel => {
    const matchesSearch = panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panel.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || panel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePanel = async () => {
    const payload = {
      sub_institute_id: sessionData.sub_institute_id,
      panel_name: newPanel.name,
      target_positions: newPanel.positions.join(','),
      description: newPanel.description,
      available_interviewers: newPanel.members.map(m => m.id.toString()),
      status: "available"
    };

    try {
      const url = isEditing && editingPanelId
        ? `${sessionData.url}/api/interview-panel/update/${editingPanelId}`
        : `${sessionData.url}/api/interview-panel/store`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Assuming success, close dialog and reset
        setIsCreateDialogOpen(false);
        setNewPanel({ name: "", description: "", positions: [], members: [] });
        setIsEditing(false);
        setEditingPanelId(null);
        // Refresh interviewers and panels list
        const interviewers = await fetchInterviewers();
        await fetchPanels(interviewers, availablePositions);
      } else {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} panel`);
        // Handle error, maybe show message
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} panel:`, error);
    }
  };

  const handleAddMemberToPanel = (interviewer: any) => {
    if (!newPanel.members.find(m => m.id === interviewer.id)) {
      setNewPanel(prev => ({
        ...prev,
        members: [...prev.members, interviewer]
      }));
      setAvailableInterviewers(prev => prev.filter(i => i.id !== interviewer.id));
    }
  };

  const handleRemoveMemberFromPanel = (memberId: number) => {
    const memberToRemove = newPanel.members.find(m => m.id === memberId);
    setNewPanel(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
    if (memberToRemove) {
      setAvailableInterviewers(prev => [...prev, memberToRemove]);
    }
  };

  const handleEditPanel = (panel: Panel) => {
    setIsEditing(true);
    setEditingPanelId(panel.id);
    // Prefill form
    setNewPanel({
      name: panel.name,
      description: panel.description,
      positions: panel.positions.map(p => {
        const pos = availablePositions.find(ap => ap.title === p);
        return pos ? pos.id : 0;
      }).filter(id => id !== 0),
      members: [...panel.members]
    });
    // Remove panel members from available interviewers
    setAvailableInterviewers(prev => prev.filter(i => !panel.members.find(m => m.id === i.id)));
    setIsCreateDialogOpen(true);
  };

  const handleDeletePanel = async (panelId: number) => {
    if (!window.confirm('Are you sure you want to delete this panel?')) return;
    try {
      const response = await fetch(`${sessionData.url}/api/interview-panel/delete/${panelId}?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Refresh panels list
        const interviewers = await fetchInterviewers();
        await fetchPanels(interviewers, availablePositions);
      } else {
        console.error('Failed to delete panel');
      }
    } catch (error) {
      console.error('Error deleting panel:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Interview Panels</h1>
          <p className="text-muted-foreground text-sm">
            Manage interview panels and assign expert interviewers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={async (open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setIsEditing(false);
            setEditingPanelId(null);
            setNewPanel({ name: "", description: "", positions: [], members: [] });
            // Reset available interviewers
            await fetchInterviewers();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-professional flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors" onClick={() => setIsEditing(false)}>
              <Plus className="mr-2  h-4 w-4" />
              Create Panel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Interview Panel" : "Create New Interview Panel"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="panel-name">Panel Name</Label>
                  <Input
                    id="panel-name"
                    placeholder="e.g., Senior Engineering Panel"
                    value={newPanel.name}
                    onChange={(e) => setNewPanel(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Positions</Label>
                  <Popover open={positionsOpen} onOpenChange={setPositionsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={positionsOpen}
                        className="w-full justify-between"
                      >
                        {newPanel.positions.length > 0
                          ? `${newPanel.positions.length} selected`
                          : "Select positions..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search positions..." />
                        <CommandEmpty>No positions found.</CommandEmpty>
                        <CommandGroup>
                          {availablePositions.map((position) => (
                            <CommandItem
                              key={position.id}
                              onSelect={() => {
                                setNewPanel(prev => ({
                                  ...prev,
                                  positions: prev.positions.includes(position.id)
                                    ? prev.positions.filter(p => p !== position.id)
                                    : [...prev.positions, position.id]
                                }));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newPanel.positions.includes(position.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {position.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {newPanel.positions.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                       {newPanel.positions.map((posId) => {
                         const position = availablePositions.find(p => p.id === posId);
                         return (
                           <Badge key={posId} variant="secondary" className="text-xs">
                             {position ? position.title : posId}
                             <button
                               className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                               onClick={() => setNewPanel(prev => ({
                                 ...prev,
                                 positions: prev.positions.filter(p => p !== posId)
                               }))}
                             >
                               ×
                             </button>
                           </Badge>
                         );
                       })}
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="panel-description">Description</Label>
                <Textarea
                  id="panel-description"
                  placeholder="Describe the panel's purpose and expertise..."
                  value={newPanel.description}
                  onChange={(e) => setNewPanel(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Interviewers */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Available Interviewers
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableInterviewers.map((interviewer) => (
                      <div
                        key={interviewer.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleAddMemberToPanel(interviewer)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{interviewer.name}</p>
                            <p className="text-xs text-muted-foreground">{interviewer.role}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {interviewer.expertise.slice(0, 2).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Panel Members */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Panel Members ({newPanel.members.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {newPanel.members.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No members added yet</p>
                      </div>
                    ) : (
                      newPanel.members.map((member) => (
                        <div
                          key={member.id}
                          className="p-3 bg-primary-light border border-primary/20 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.expertise.slice(0, 2).map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMemberFromPanel(member.id)}
                            >
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button id="submit" onClick={handleCreatePanel} className="px-4 py-2 text-sm rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
                  {isEditing ? "Update" : "Submit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search panels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Panels</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPanels.map((panel) => (
          <Card key={panel.id} className="widget-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{panel.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      className={cn(
                        "text-xs",
                        panel.status === "active" ? "status-completed" : "status-pending"
                      )}
                    >
                      {panel.status.charAt(0).toUpperCase() + panel.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {panel.members.length} Members
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditPanel(panel)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePanel(panel.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {panel.description}
              </p>

              {/* Panel Stats */}
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="text-center">
                  <p className="text-lg font-semibold text-primary">{panel.upcomingInterviews}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-primary">{panel.totalInterviews}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              <Separator />

              {/* Panel Members */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Users className="mr-2 h-3 w-3" />
                  Panel Members
                </h4>
                <div className="space-y-2">
                  {panel.members.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  {panel.members.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{panel.members.length - 3} more members
                    </p>
                  )}
                </div>
              </div>

              {/* Target Positions */}
              <div>
                <h4 className="text-sm font-medium mb-2">Target Positions</h4>
                <div className="flex flex-wrap gap-1">
                  {panel.positions.slice(0, 2).map((position) => (
                    <Badge key={position} variant="outline" className="text-xs">
                      {position}
                    </Badge>
                  ))}
                  {panel.positions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{panel.positions.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPanels.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mt-4">No panels found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Create your first interview panel to get started"
            }
          </p>
        </div>
      )}
    </div>
  );
}