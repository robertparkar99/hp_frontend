import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const positions = [
  "Senior Software Engineer",
  "Product Manager", 
  "UX Designer",
  "Data Scientist",
  "Marketing Manager"
];

const interviewers = [
  { id: 1, name: "John Smith", role: "Engineering Manager", available: true },
  { id: 2, name: "Emily Chen", role: "Senior Developer", available: true },
  { id: 3, name: "David Wilson", role: "Product Lead", available: false },
  { id: 4, name: "Anna Taylor", role: "Design Director", available: true },
  { id: 5, name: "Mark Brown", role: "HR Manager", available: true },
];

const candidates = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com" },
  { id: 2, name: "Michael Rodriguez", email: "m.rodriguez@email.com" },
  { id: 3, name: "Lisa Zhang", email: "lisa.zhang@email.com" },
];

export default function ScheduleInterview() {
  const [date, setDate] = useState<string>("");
  const [selectedInterviewers, setSelectedInterviewers] = useState<number[]>([]);
  
  const toggleInterviewer = (id: number) => {
    setSelectedInterviewers(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="candidate">Candidate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id.toString()}>
                          {candidate.name}
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
                    <Select>
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
                  <Select>
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
                    placeholder="Conference Room A, Video Call, etc." 
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
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
              {interviewers.map((interviewer) => (
                <div
                  key={interviewer.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all",
                    selectedInterviewers.includes(interviewer.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                    !interviewer.available && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => interviewer.available && toggleInterviewer(interviewer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{interviewer.name}</p>
                      <p className="text-xs text-muted-foreground">{interviewer.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedInterviewers.includes(interviewer.id) && (
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                      )}
                     <Badge
  variant={interviewer.available ? "default" : "secondary"}
  className={cn(
    "text-xs",
    interviewer.available 
      ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800" 
      : "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800"
  )}
>
  {interviewer.available ? "Available" : "Busy"}
</Badge>

                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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