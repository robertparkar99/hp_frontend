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



export default function ScheduleInterview() {
  const [date, setDate] = useState<string>("");
  const [selectedPanel, setSelectedPanel] = useState<string>("");
  const [selectedInterviewers, setSelectedInterviewers] = useState<number[]>([]);
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Load session data
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
  }, [sessionData.sub_institute_id, sessionData.url, sessionData.token]);

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

    try {
      const response = await fetch(`${sessionData.url}/api/interview-schedules?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Interview scheduled successfully');
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
        alert('Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Error scheduling interview');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Schedule Interview</h1>
        <p className="text-muted-foreground text-sm">
          Set up a new interview with candidates and panel members
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
                  <Select onValueChange={setSelectedPosition}>
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
                  <Select disabled={!selectedPosition} onValueChange={setSelectedCandidate}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedPosition ? "Select candidate" : "Select position first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedPosition ? candidates.filter(candidate => candidate.job_id.toString() === selectedPosition).map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id.toString()}>
                          {`${candidate.first_name} ${candidate.middle_name} ${candidate.last_name}`.trim()}
                        </SelectItem>
                      )) : []}
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
                    <Select onValueChange={setTime}>
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
                  <Select onValueChange={setDuration}>
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
              {panels.filter(panel => panel.status === "available").map((panel) => (
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
              ))}
              
              <div className="pt-4 border-t">
                <Button onClick={handleSchedule} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Schedule Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}