import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin } from "lucide-react";

const upcomingInterviews = [
  {
    id: 1,
    candidateName: "Sarah Johnson",
    position: "Senior Software Engineer",
    time: "10:00 AM",
    duration: "60 min",
    interviewers: ["John Smith", "Emily Chen"],
    location: "Conference Room A",
    status: "scheduled",
  },
  {
    id: 2,
    candidateName: "Michael Rodriguez",
    position: "Product Manager",
    time: "2:30 PM",
    duration: "45 min",
    interviewers: ["David Wilson"],
    location: "Video Call",
    status: "scheduled",
  },
  {
    id: 3,
    candidateName: "Lisa Zhang",
    position: "UX Designer",
    time: "4:00 PM",
    duration: "45 min",
    interviewers: ["Anna Taylor", "Mark Brown"],
    location: "Conference Room B",
    status: "scheduled",
  },
];

export function UpcomingInterviews() {
  return (
    <Card className="widget-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Today's Interviews</CardTitle>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingInterviews.map((interview) => (
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
              Interviewers: {interview.interviewers.join(", ")}
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <Button size="sm" variant="outline">
                Reschedule
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}