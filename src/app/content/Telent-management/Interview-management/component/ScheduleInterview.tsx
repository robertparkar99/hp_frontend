
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string | number;
  org_type?: string;
}

interface Position {
  id: number;
  title: string;
  department_id: number;
  location: string;
  employment_type: string;
}

interface Candidate {
  id: number;
  job_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  mobile: string;
}

interface Panel {
  id: number;
  sub_institute_id: number;
  panel_name: string;
  target_positions: string;
  description: string;
  available_interviewers: string;
  status: string;
}

interface Interviewer {
  id: number;
  name: string;
  role: string;
  available: boolean;
}

interface Interview {
    id: number;
    candidateName: string;
    position: string;
    positionId: number;
    candidateId: number;
    panelId: number;
    date: string;
    time: string;
    duration: string;
    location: string;
    interviewers: string[];
    status: string;
}

interface ScheduleInterviewProps {
    interview?: Interview | null;
}



export default function ScheduleInterview({ interview }: ScheduleInterviewProps) {
   const [date, setDate] = useState<string>("");
   const [selectedPanel, setSelectedPanel] = useState<string>("");
   const [selectedInterviewers, setSelectedInterviewers] = useState<number[]>([]);
   const [sessionData, setSessionData] = useState<SessionData>({});
   const [positions, setPositions] = useState<Position[]>([]);
   const [candidates, setCandidates] = useState<Candidate[]>([]);
   const [selectedPosition, setSelectedPosition] = useState<string>("");
   const [selectedCandidate, setSelectedCandidate] = useState<string>("");
   const [panels, setPanels] = useState<Panel[]>([]);
   const [loadingPanels, setLoadingPanels] = useState<boolean>(true);
   const [time, setTime] = useState<string>("");
   const [duration, setDuration] = useState<string>("");
   const [location, setLocation] = useState<string>("");
   const [notes, setNotes] = useState<string>("");

  // Load session data
  useEffect(() => {
      console.log("interview prop:", interview);
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type } =
          JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type });
      }
    }
  }, []);

  // Fetch positions
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;
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
  }, [sessionData.sub_institute_id, sessionData.url, sessionData.token]);

  // Fetch candidates
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/job-applications?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`);
        const data = await response.json();
        if (data.data) {
          setCandidates(data.data);
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };
    fetchCandidates();
  }, [sessionData.sub_institute_id, sessionData.url, sessionData.token]);

  // Fetch panels
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;
    const fetchPanels = async () => {
      setLoadingPanels(true);
      try {
        const response = await fetch(`${sessionData.url}/api/interview-panel/list?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}`);
        const data = await response.json();
        if (data.status && data.data) {
          setPanels(data.data);
        }
      } catch (error) {
        console.error('Error fetching panels:', error);
      } finally {
        setLoadingPanels(false);
      }
    };
    fetchPanels();
  }, [sessionData.sub_institute_id, sessionData.url, sessionData.token]);

    // Pre-fill form if interview is provided
    useEffect(() => {
        if (interview && positions.length > 0 && candidates.length > 0 && panels.length > 0) {
            setSelectedPosition(interview.positionId.toString());

            setSelectedCandidate(interview.candidateId.toString());

            // set other fields
            console.log("Prefilling interview data:", interview);
            setDuration(interview.duration);
            console.log("Setting duration to:", interview.duration);
            setDate(interview.date);
            // Set location
            setLocation(interview.location);

            // Set duration (extract number)
            const durationMatch = interview.duration.match(/(\d+)/);
            if (durationMatch) {
                setDuration(durationMatch[1]);
            }

            setTime(interview.time);

            setSelectedPanel(interview.panelId.toString());
            const panel = panels.find(p => p.id.toString() === interview.panelId.toString());
            if (panel) {
                const interviewers = JSON.parse(panel.available_interviewers || '[]');
                setSelectedInterviewers(interviewers);
            }
        }
    }, [interview, positions, candidates, panels]);

  const togglePanel = (id: number) => {
    const isSelecting = selectedPanel !== id.toString();
    setSelectedPanel(isSelecting ? id.toString() : "");
    if (isSelecting) {
      const panel = panels.find(p => p.id === id);
      if (panel) {
        const interviewers = JSON.parse(panel.available_interviewers || '[]');
        setSelectedInterviewers(interviewers);
      }
    } else {
      setSelectedInterviewers([]);
    }
  };

  const handleSchedule = async () => {
    const missingFields = [];
    if (!selectedPosition) missingFields.push('Position');
    if (!selectedCandidate) missingFields.push('Candidate');
    if (!date) missingFields.push('Date');
    if (!time) missingFields.push('Time');
    if (!duration) missingFields.push('Duration');
    if (!location) missingFields.push('Location');
    if (!selectedPanel) missingFields.push('Interview Panel');

    if (missingFields.length > 0) {
      alert(`Please fill the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    const payload = {
      ...(interview && { id: interview.id }),
      job_id: selectedPosition,
      applicant_id: selectedCandidate,
      round_no: "1", // Default
      interview_date: date,
      time,
      duration,
      location,
      interviewer_id: selectedInterviewers,
      panel_id: selectedPanel,
      status: "Scheduled",
      rating: "",
      feedback: "",
      additional_notes: notes.slice(0, 200), // Limit to prevent truncation error
      sub_institute_id: sessionData.sub_institute_id,
      user_id: sessionData.sub_institute_id // Assuming user_id is sub_institute_id
    };

    const isReschedule = !!interview;

    let url: string;
    let method: string;
    let body: string | undefined;

    if (isReschedule) {
      method = 'PUT';
      url = `${sessionData.url}/api/interview-schedules/${interview.id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&round_no=1&interview_date=${date}&time=${time}&duration=${duration}&location=${encodeURIComponent(location)}&interviewer_id=${encodeURIComponent(JSON.stringify(selectedInterviewers))}&panel_id=${selectedPanel}&status=Scheduled&rating=&feedback=&additional_notes=${encodeURIComponent(notes.slice(0, 200))}&user_id=${sessionData.sub_institute_id}&applicant_id=${selectedCandidate}&job_id=${selectedPosition}`;
      body = undefined;
    } else {
      method = 'POST';
      url = `${sessionData.url}/api/interview-schedules?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`;
      body = JSON.stringify(payload);
    }

    try {
      const response = await fetch(url, {
        method,
        headers: body ? {
          'Content-Type': 'application/json',
        } : undefined,
        body
      });

      if (response.ok) {
        alert(isReschedule ? 'Interview rescheduled successfully' : 'Interview scheduled successfully');
        // Reset form
        setSelectedPosition("");
        setSelectedCandidate("");
        setDate("");
        setTime("");
        setDuration("");
        setLocation("");
        setNotes("");
        setSelectedPanel("");
        setSelectedInterviewers([]);
      } else {
        alert(isReschedule ? 'Failed to reschedule interview' : 'Failed to schedule interview');
      }
    } catch (error) {
      console.error(isReschedule ? 'Error rescheduling interview:' : 'Error scheduling interview:', error);
      alert(isReschedule ? 'Error rescheduling interview' : 'Error scheduling interview');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {interview ? `Reschedule Interview for ${interview.candidateName}` : "Schedule Interview"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {interview ? "Modify the existing interview details" : "Set up a new interview with candidates and panel members"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interview Details */}
        <div className="lg:col-span-2">
          <Card className="widget-card">
            <CardHeader >
              <CardTitle className="text-xl">Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                                  <Select onValueChange={setSelectedPosition} value={selectedPosition} disabled={!!interview}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id.toString()}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="candidate">Candidate</Label>
                                  <Select disabled={!selectedPosition || !!interview} onValueChange={setSelectedCandidate} value={selectedCandidate}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedPosition ? "Select candidate" : "Select position first"} />
                    </SelectTrigger>
                    <SelectContent>
                                          {candidates.filter(candidate => candidate.job_id.toString() === selectedPosition).map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id.toString()}>
                                                  {`${candidate.first_name} ${(candidate.middle_name || '').trim()} ${candidate.last_name}`.trim()}
                        </SelectItem>
                                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Select onValueChange={setTime} value={time}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="14:00">02:00 PM</SelectItem>
                        <SelectItem value="15:00">03:00 PM</SelectItem>
                        <SelectItem value="16:00">04:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                                  <Select onValueChange={setDuration} value={duration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Conference Room A, Video Call, etc."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requirements..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview Panel */}
        <div>
          <Card className="widget-card">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="mr-2 h-5 w-5" />
                Interview Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPanels ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="mt-2 text-muted-foreground">Loading interview panels...</div>
                </div>
              ) : (
                panels.filter(panel => panel.status === "available").map((panel) => (
                <div
                  key={panel.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    selectedPanel === panel.id.toString()
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                    panel.status !== "available" && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => panel.status === "available" && togglePanel(panel.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{panel.panel_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {panel.target_positions.split(',').map((s: string) => {
                          const id = s.trim();
                          const pos = positions.find(p => p.id.toString() === id);
                          return pos ? pos.title : id;
                        }).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedPanel === panel.id.toString() && (
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                      )}
                     <Badge
                        variant={panel.status === "available" ? "default" : "secondary"}
  className={cn(
    "text-xs",
    panel.status === "available"
      ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
      : "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800"
  )}
>
                        {panel.status === "available" ? "Available" : "Unavailable"}
</Badge>

                    </div>
                  </div>
                </div>
              )))}
              
              <div className="pt-4 border-t">
                <Button onClick={handleSchedule} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {interview ? "Reschedule Interview" : "Schedule Interview"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
