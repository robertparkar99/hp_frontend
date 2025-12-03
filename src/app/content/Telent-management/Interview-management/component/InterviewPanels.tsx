import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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

// Mock data for interview panels
const mockPanels = [
  {
    id: 1,
    name: "Senior Engineering Panel",
    description: "Panel for senior engineering positions including architects and lead developers",
    members: [
      { id: 1, name: "John Smith", role: "Engineering Manager", expertise: ["Technical Architecture", "Leadership"] },
      { id: 2, name: "Emily Chen", role: "Senior Developer", expertise: ["React", "Node.js", "System Design"] },
      { id: 3, name: "David Wilson", role: "Technical Lead", expertise: ["DevOps", "Cloud Architecture"] }
    ],
    positions: ["Senior Software Engineer", "Technical Lead", "Engineering Manager"],
    status: "active",
    upcomingInterviews: 3,
    totalInterviews: 25
  },
  {
    id: 2,
    name: "Product Management Panel", 
    description: "Cross-functional panel for product management roles",
    members: [
      { id: 4, name: "Sarah Johnson", role: "Product Director", expertise: ["Strategy", "Roadmapping"] },
      { id: 5, name: "Michael Rodriguez", role: "UX Lead", expertise: ["User Research", "Design Systems"] },
      { id: 1, name: "John Smith", role: "Engineering Manager", expertise: ["Technical Feasibility"] }
    ],
    positions: ["Product Manager", "Senior Product Manager", "Product Owner"],
    status: "active",
    upcomingInterviews: 1,
    totalInterviews: 18
  },
  {
    id: 3,
    name: "Design Panel",
    description: "Creative panel for design and user experience roles",
    members: [
      { id: 6, name: "Anna Taylor", role: "Design Director", expertise: ["Design Leadership", "Brand"] },
      { id: 5, name: "Michael Rodriguez", role: "UX Lead", expertise: ["User Research", "Prototyping"] }
    ],
    positions: ["UX Designer", "Visual Designer", "Design Lead"],
    status: "inactive",
    upcomingInterviews: 0,
    totalInterviews: 12
  }
];

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
  const [newPanel, setNewPanel] = useState({
    name: "",
    description: "",
    positions: [] as string[],
    members: [] as any[]
  });

  const filteredPanels = mockPanels.filter(panel => {
    const matchesSearch = panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         panel.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || panel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePanel = () => {
    console.log("Creating panel:", newPanel);
    setIsCreateDialogOpen(false);
    // Reset form
    setNewPanel({ name: "", description: "", positions: [], members: [] });
  };

  const handleAddMemberToPanel = (interviewer: any) => {
    if (!newPanel.members.find(m => m.id === interviewer.id)) {
      setNewPanel(prev => ({
        ...prev,
        members: [...prev.members, interviewer]
      }));
    }
  };

  const handleRemoveMemberFromPanel = (memberId: number) => {
    setNewPanel(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-professional flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors">
              <Plus className="mr-2  h-4 w-4" />
              Create Panel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Interview Panel</DialogTitle>
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
                  <Label htmlFor="positions">Target Positions</Label>
                  <Input
                    id="positions"
                    placeholder="e.g., Senior Developer, Tech Lead"
                  />
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
                  Submit
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
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
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