import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MessageSquare, Star } from "lucide-react";

interface InterviewFeedback {
  id: any;
  candidate: string;
  position: string;
  interviewer: string;
  date: any;
  status: string;
  overallRating: number;
  notes: string;
}

interface ViewFullProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: InterviewFeedback | null;
}

const ViewFullProfileDialog = ({ open, onOpenChange, interview }: ViewFullProfileDialogProps) => {
  if (!interview) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Full Profile - {interview.candidate}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{interview.candidate}</h3>
              <p className="text-muted-foreground">Applied for {interview.position}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{interview.date}</span>
                </div>
                <span>Status: {getStatusBadge(interview.status)}</span>
              </div>
            </div>
          </div>

          {/* Interview Panel */}
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Interview Panel
            </h4>
            <p className="text-muted-foreground">{interview.interviewer}</p>
          </div>

      

          {/* Overall Rating */}
          {interview.overallRating && (
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Overall Rating
              </h4>
              <div className="text-2xl font-bold text-primary">
                {interview.overallRating}/10
              </div>
            </div>
          )}

          {/* Interview Notes */}
          {interview.notes && (
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Interview Notes
              </h4>
              <p className="text-muted-foreground whitespace-pre-line">{interview.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFullProfileDialog;