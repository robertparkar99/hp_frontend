import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import Navigation from "../Recruitment-management/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ViewFullProfileDialog from "./ViewFullProfileDialog";
import OfferDashboard from "../Offer-management/OfferDashboard";
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

// ✅ Loader Component
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

interface InterviewFeedback {
  id: any;
  candidateId: number;
  candidate: string;
  position: string;
  interviewer: string;
  date: any;
  status: string;
  overallRating: number;
  notes: string;
}

// Dummy data for demonstration
// const dummyInterviewFeedback: InterviewFeedback[] = [
//   {
//     id: 1,
//     candidate: "John Smith",
//     position: "Senior Software Engineer",
//     interviewer: "Sarah Johnson",
//     date: "2024-01-15",
//     status: "Completed",
//     overallRating: 8.5,
//     notes: "Key Strengths: Strong technical skills, good problem-solving\nConcerns: Limited experience with cloud technologies"
//   },
//   {
//     id: 2,
//     candidate: "Emily Davis",
//     position: "Product Manager",
//     interviewer: "Mike Chen",
//     date: "2024-01-14",
//     status: "Completed",
//     overallRating: 9.2,
//     notes: "Key Strengths: Excellent communication, strategic thinking\nConcerns: Needs more experience in agile methodologies"
//   },
//   {
//     id: 3,
//     candidate: "Robert Kim",
//     position: "UX Designer",
//     interviewer: "Lisa Wong",
//     date: "2024-01-13",
//     status: "Pending Review",
//     overallRating: 7.8,
//     notes: "Key Strengths: Creative portfolio, user research skills\nConcerns: Limited experience with design systems"
//   }
// ];

const ManagerDashboard = () => {
  const router = useRouter();

  const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [teamOverview, setTeamOverview] = useState<any>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewFeedback | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hiringNotes, setHiringNotes] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("interviews");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState(0);

  const handleHired = async (interview: InterviewFeedback) => {
    try {
      const response = await fetch(`${sessionData.url}/api/interviews/${interview.id}/decision?token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&type=API`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Hired',
          notes: hiringNotes[interview.id] || '',
        }),
      });

      if (response.ok) {
        // Switch to offer management tab with candidate data
        setSelectedCandidate(interview.candidate);
        setSelectedPosition(interview.position);
        setSelectedCandidateId(interview.candidateId);
        setActiveTab("offers");
      } else {
        console.error('Failed to hire candidate:', response.statusText);
        alert('Failed to hire candidate. Please try again.');
      }
    } catch (error) {
      console.error('Error hiring candidate:', error);
      alert('Error hiring candidate. Please try again.');
    }
  };

  const handleReject = async (interview: InterviewFeedback) => {
    try {
      const response = await fetch(`${sessionData.url}/api/interviews/${interview.id}/decision?token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&type=API`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          notes: hiringNotes[interview.id] || '',
        }),
      });

      if (response.ok) {
        // Remove from the list
        setInterviewFeedback(prev => prev.filter(item => item.id !== interview.id));
      } else {
        console.error('Failed to reject candidate:', response.statusText);
        alert('Failed to reject candidate. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      alert('Error rejecting candidate. Please try again.');
    }
  };

  // Fetch session data on mount
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
    if (!sessionData) return;
    setLoading(true);
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/feedback?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
        const result = await response.json();
        if (result.status && result.data) {
          const mappedFeedbacks: InterviewFeedback[] = result.data.map((data: any) => {
            const criteria = JSON.parse(data.evaluation_criteria);
            const totalScore = criteria.reduce((sum: number, item: { score: number }) => sum + item.score, 0);
            const averageScore = criteria.length > 0 ? totalScore / criteria.length : 0;
            return {
              id: data.id,
              candidateId: data.candidate_id || data.id,
              candidate: data.candidate_name || '-',
              position: data.job_title || '-',
              interviewer: data.panel_name || '-',
              date: data.created_at.split(' ')[0],
              status: data.status || 'Completed',
              overallRating: Math.round(averageScore * 10) / 10,
              notes: `Key Strengths: ${data.key_strengths || ''}\nConcerns: ${[data.areas_of_concern, data.additional_comments].filter(Boolean).join(' ')}`
            };
          });

          // Combine API data with dummy data
          setInterviewFeedback([...mappedFeedbacks]);
        }
      } catch (error) {
        console.warn('Using dummy data due to API error:', error);
        // setInterviewFeedback(dummyInterviewFeedback);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [sessionData]);

  useEffect(() => {
    if (!sessionData) return;
    const fetchTeamOverview = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/talent/team-overview?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
        const result = await response.json();
        if (result.data) {
          setTeamOverview(result);
        }
      } catch (error) {
        console.error('Error fetching team overview:', error);
      }
    };
    fetchTeamOverview();
  }, [sessionData]);

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
              <div className="text-2xl font-bold text-blue-400">{interviewFeedback.length}</div>
              <p className="text-xs text-muted-foreground">Pending your input</p>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requisitions</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently recruiting</p>
            </CardContent>
          </Card> */}

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#EFF4FF]">
            {/* <TabsTrigger value="requisitions">Pending Requisitions</TabsTrigger> */}
            <TabsTrigger value="interviews">Interview Feedback</TabsTrigger>
            <TabsTrigger value="offers">Offer Management</TabsTrigger>
            <TabsTrigger value="team">Team Overview</TabsTrigger>
          </TabsList>

          {/* <TabsContent value="requisitions" className="space-y-6">
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
                          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/20">
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
          </TabsContent> */}

          <TabsContent value="interviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Feedback Required</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader />
                ) : (
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
                                  {interview.overallRating}/10
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

                        {interview.status === "Completed" && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Hiring Notes:</h4>
                            <Textarea
                              placeholder="Add notes for hiring decision..."
                              value={hiringNotes[interview.id] || ''}
                              onChange={(e) => setHiringNotes(prev => ({ ...prev, [interview.id]: e.target.value }))}
                              className="min-h-[80px]"
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <Button variant="outline" onClick={() => { setSelectedInterview(interview); setDialogOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Profile
                          </Button>
                          {interview.status === "Completed" && (
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive/20"
                                onClick={() => handleReject(interview)}
                              >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                className="bg-success hover:bg-success/90 text-success-foreground"
                                onClick={() => handleHired(interview)}
                              >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Hired
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <OfferDashboard showHeader={false} candidate={selectedCandidate} position={selectedPosition} candidateId={selectedCandidateId} />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Hiring Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamOverview?.data?.map((dept: any) => {
                      const percentage = dept.total_positions > 0 ? (dept.hired / dept.total_positions) * 100 : 0;
                      return (
                        <div key={dept.department_name} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{dept.department_name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">{dept.hired}/{dept.total_positions} filled</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Team Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const updates = teamOverview?.recent_team_updates || [];

                    const grouped = {
                      open: [] as string[],
                      interview: [] as string[],
                    };

                    updates.forEach((update: string) => {
                      if (update.includes("still open")) {
                        grouped.open.push(update);
                      } else if (
                        update.includes("needs attention") ||
                        update.includes("scheduled")
                      ) {
                        grouped.interview.push(update);
                      }
                    });

                    return (
                      <div className="space-y-6">

                        {/* POSITION STILL OPEN */}
                        {grouped.open.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-5 h-5 text-warning" />
                              <p className="text-sm font-medium">Position still open</p>
                            </div>

                            {grouped.open.map((item, index) => (
                              <p
                                key={index}
                                className="text-xs text-muted-foreground ml-7"
                              >
                                {item}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* INTERVIEW SCHEDULED */}
                        {grouped.interview.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                              <p className="text-sm font-medium">Interview scheduled</p>
                            </div>

                            {grouped.interview.map((item, index) => (
                              <p
                                key={index}
                                className="text-xs text-muted-foreground ml-7"
                              >
                                {item}
                              </p>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })()}
                </CardContent>

              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <ViewFullProfileDialog open={dialogOpen} onOpenChange={setDialogOpen} interview={selectedInterview} />
    </div>
  );
};

export default ManagerDashboard;