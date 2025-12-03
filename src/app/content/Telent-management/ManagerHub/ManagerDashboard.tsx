// import Navigation from "../Recruitment-management/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  User,
  Calendar,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const ManagerDashboard = () => {
  const pendingRequisitions = [
    {
      id: 1,
      title: "Senior Backend Engineer",
      department: "Engineering",
      requestedBy: "Sarah Wilson",
      priority: "High",
      budget: "$140,000 - $180,000",
      requestDate: "2024-01-20",
      justification: "Critical role to support our new API platform launch"
    },
    {
      id: 2,
      title: "Product Marketing Manager",
      department: "Marketing",
      requestedBy: "John Davis",
      priority: "Medium",
      budget: "$90,000 - $120,000",
      requestDate: "2024-01-18",
      justification: "Need to drive go-to-market strategy for Q2 product releases"
    },
    {
      id: 3,
      title: "Data Scientist",
      department: "Data & Analytics",
      requestedBy: "Mike Johnson",
      priority: "Low",
      budget: "$110,000 - $150,000",
      requestDate: "2024-01-15",
      justification: "Expand our ML capabilities for predictive analytics"
    }
  ];

  const interviewFeedback = [
    {
      id: 1,
      candidate: "Sarah Johnson",
      position: "Senior Full-Stack Developer",
      interviewer: "Tech Team",
      date: "2024-01-19",
      status: "Pending Review",
      overallRating: null,
      notes: "Strong technical skills, good communication"
    },
    {
      id: 2,
      candidate: "Michael Chen",
      position: "Product Manager",
      interviewer: "Product Team",
      date: "2024-01-18",
      status: "Completed",
      overallRating: 4.5,
      notes: "Excellent strategic thinking, great cultural fit"
    },
    {
      id: 3,
      candidate: "Emily Rodriguez",
      position: "Senior Full-Stack Developer",
      interviewer: "Engineering Team",
      date: "2024-01-17",
      status: "Pending Review",
      overallRating: null,
      notes: "Solid technical background, needs leadership assessment"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-destructive text-destructive-foreground">High Priority</Badge>;
      case "Medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Priority</Badge>;
      case "Low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Review":
        return <Badge className="bg-warning text-warning-foreground">Pending Review</Badge>;
      case "Completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background rounded-xl">
      {/* <Navigation /> */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">Review requisitions and provide interview feedback</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">3</div>
              <p className="text-xs text-muted-foreground">Awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interview Feedback</CardTitle>
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">2</div>
              <p className="text-xs text-muted-foreground">Pending your input</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requisitions</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently recruiting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Hires</CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">5</div>
              <p className="text-xs text-success">+2 from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requisitions" className="space-y-6">
          <TabsList className="bg-[#EFF4FF]">
            <TabsTrigger value="requisitions">Pending Requisitions</TabsTrigger>
            <TabsTrigger value="interviews">Interview Feedback</TabsTrigger>
            <TabsTrigger value="team">Team Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="requisitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Requisitions Awaiting Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pendingRequisitions.map((req) => (
                    <div key={req.id} className="border border-border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{req.title}</h3>
                            {getPriorityBadge(req.priority)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Department: {req.department}</p>
                            <p>Requested by: {req.requestedBy}</p>
                            <p>Budget: {req.budget}</p>
                            <p>Requested: {req.requestDate}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Business Justification:</h4>
                        <p className="text-sm text-muted-foreground">{req.justification}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <div className="space-x-2">
                          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button className="bg-success hover:bg-success/90 text-success-foreground">
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Feedback Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {interviewFeedback.map((interview) => (
                    <div key={interview.id} className="border border-border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{interview.candidate}</h3>
                            <p className="text-sm text-muted-foreground">
                              Applied for {interview.position}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{interview.date}</span>
                              </div>
                              <span>Interviewed by {interview.interviewer}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(interview.status)}
                          {interview.overallRating && (
                            <div className="mt-2">
                              <div className="text-lg font-bold text-primary">
                                {interview.overallRating}/5
                              </div>
                              <div className="text-xs text-muted-foreground">Overall Rating</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {interview.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Interview Notes:</h4>
                          <p className="text-sm text-muted-foreground">{interview.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Profile
                        </Button>
                        {interview.status === "Pending Review" && (
                          <div className="space-x-2">
                            <Button variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Add Feedback
                            </Button>
                            <Button>
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Recommend
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Hiring Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Engineering</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">8/12 filled</span>
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Product</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">5/6 filled</span>
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '83%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Design</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">3/4 filled</span>
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Marketing</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">6/8 filled</span>
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Team Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">New hire onboarded</p>
                        <p className="text-xs text-muted-foreground">Alex Martinez joined Engineering team</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Position still open</p>
                        <p className="text-xs text-muted-foreground">Senior Designer role needs attention</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Interview scheduled</p>
                        <p className="text-xs text-muted-foreground">Product Manager candidate tomorrow</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ManagerDashboard;