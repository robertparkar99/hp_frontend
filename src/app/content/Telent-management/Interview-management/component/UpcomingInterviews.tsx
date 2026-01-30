import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// ✅ Loader Component
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

interface Panel {
  id: number;
  sub_institute_id: number;
  panel_name: string;
  target_positions: string;
  description: string;
  available_interviewers: string;
  status: string;
}

interface Interview {
  id: number;
  candidateName: string;
  position: string;
  positionId: number;
  candidateId: number;
  panelId: number;
  panelName: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  interviewers: string[];
  status: string;
}

interface UpcomingInterviewsProps {
  onReschedule?: (interview: Interview) => void;
}

export function UpcomingInterviews({ onReschedule }: UpcomingInterviewsProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    if (sessionData) {
      const fetchPositions = async () => {
        try {
          const response = await fetch(`${sessionData.url}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`);
          const data = await response.json();
          if (data.data) {
            setPositions(data.data);
          }
        } catch (error) {
          console.error('Error fetching positions:', error);
        }
      };
      fetchPositions();
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData) {
      const fetchCandidates = async () => {
        try {
          const response = await fetch(`${sessionData.url}/api/job-applications?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
          const data = await response.json();
          if (data.data) {
            setCandidates(data.data);
          }
        } catch (error) {
          console.error('Error fetching candidates:', error);
        }
      };
      fetchCandidates();
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData) {
      const fetchPanels = async () => {
        try {
          const response = await fetch(`${sessionData.url}/api/interview-panel/list?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}`);
          const data = await response.json();
          if (data.status && data.data) {
            setPanels(data.data);
          }
        } catch (error) {
          console.error('Error fetching panels:', error);
        }
      };
      fetchPanels();
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData && positions.length > 0 && candidates.length > 0 && panels.length > 0) {
      fetch(`${sessionData.url}/api/interview-details?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const today = new Date().toDateString();
            const filteredData = data.data.filter((item: any) => {
              if (!item.interview_date) return false;
              return new Date(item.interview_date).toDateString() === today;
            });
            setInterviews(filteredData.map((item: any) => ({
              id: item.id,
              candidateName: (() => {
                // First try to get from candidates list
                const cand = candidates.find(c => c.id.toString() === item.applicant_id.toString());
                if (cand) {
                  return `${cand.first_name} ${(cand.middle_name || '').trim()} ${cand.last_name}`.trim();
                }
                // If not found, try from interview item itself
                if (item.first_name || item.last_name) {
                  return `${item.first_name || ''} ${(item.middle_name || '').trim()} ${item.last_name || ''}`.trim();
                }
                // Fallback to unknown with ID
                return `Unknown (ID: ${item.applicant_id})`;
              })(),
              position: positions.find(p => p.id === item.job_id)?.title || 'Unknown',
              positionId: item.job_id,
              candidateId: item.applicant_id,
              panelId: item.panel_id,
              panelName: panels.find(p => p.id === item.panel_id)?.panel_name || 'Unknown',
              date: item.interview_date,
              time: item.time.slice(0, 5),
              duration: `${item.duration} min`,
              location: item.location || '',
              interviewers: JSON.parse(item.interviewer_id || '[]'),
              status: item.status.toLowerCase()
            })));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching interviews:', err);
          setLoading(false);
        });
    }
  }, [sessionData, positions, candidates, panels]);

  const DynamicScheduleInterview = dynamic(() => import("./ScheduleInterview"), {
    ssr: false,
    loading: Loader,
  });

  return (
    <Card className="widget-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Today's Interviews ({new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })})
        </CardTitle>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader />
        ) : interviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No interview schedule for today.</p>
        ) : (
          interviews.map((interview) => (
            <div
              key={interview.id}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">
                    {interview.candidateName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {interview.position}
                  </p>
                </div>
                <Badge className="status-scheduled">
                  {interview.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {interview.time} ({interview.duration})
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {interview.location}
                </div>
              </div>

              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                Interview Panel: {interview.panelName}
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReschedule?.(interview)}>
                  Reschedule
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}