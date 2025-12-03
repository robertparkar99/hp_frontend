import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Star, User, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const interviewData = {
  candidate: "Sarah Johnson",
  position: "Senior Software Engineer",
  date: "January 20, 2024",
  time: "10:00 AM - 11:00 AM",
  interviewer: "John Smith",
  type: "Technical Interview"
};

const evaluationCriteria = [
  { id: 1, name: "Technical Skills", description: "Programming knowledge and problem-solving abilities" },
  { id: 2, name: "Communication", description: "Clarity of explanation and interpersonal skills" },
  { id: 3, name: "Problem Solving", description: "Analytical thinking and approach to challenges" },
  { id: 4, name: "Cultural Fit", description: "Alignment with company values and team dynamics" },
  { id: 5, name: "Experience Relevance", description: "How well their background matches the role" },
];

export default function Feedback() {
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [overallRating, setOverallRating] = useState([7]);
  const [recommendation, setRecommendation] = useState("");

  const updateRating = (criteriaId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [criteriaId]: rating }));
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "hire": return "status-completed";
      case "maybe": return "status-pending";
      case "no-hire": return "status-pending";
      default: return "status-pending";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Interview Feedback</h1>
        <p className="text-muted-foreground text-sm">
          Provide detailed feedback for the completed interview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interview Summary */}
        <div>
          <Card className="widget-card">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="mr-2 h-5 w-5" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Candidate</Label>
                <p className="text-lg font-semibold">{interviewData.candidate}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Position</Label>
                <p className="text-sm text-muted-foreground">{interviewData.position}</p>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <div>
                  <p>{interviewData.date}</p>
                  <p>{interviewData.time}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Interview Type</Label>
                <Badge className="status-scheduled mt-1">{interviewData.type}</Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Interviewer</Label>
                <p className="text-sm">{interviewData.interviewer}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form */}
        <div className="lg:col-span-2">
          <Card className="widget-card">
            <CardHeader>
              <CardTitle className="flex items-center te">
                <MessageSquare className="mr-2 h-5 w-5" />
                Evaluation Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Evaluation Criteria */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Evaluation Criteria</h3>
                {evaluationCriteria.map((criteria) => (
                  <div key={criteria.id} className="space-y-3">
                    <div>
                      <Label className="font-medium">{criteria.name}</Label>
                      <p className="text-sm text-muted-foreground">{criteria.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Slider
                          value={[ratings[criteria.id] || 5]}
                          onValueChange={(value) => updateRating(criteria.id, value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="w-16 text-center">
                        <span className="text-lg font-semibold">
                          {ratings[criteria.id] || 5}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Rating */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label className="text-lg font-medium">Overall Rating</Label>
                  <p className="text-sm text-muted-foreground">
                    Based on all evaluation criteria
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Slider
                      value={overallRating}
                      onValueChange={setOverallRating}
                      max={10}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="w-16 text-center">
                    <span className="text-xl font-bold text-primary">
                      {overallRating[0]}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Recommendation</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "hire", label: "Hire", color: "status-completed" },
                    { value: "maybe", label: "Maybe", color: "status-pending" },
                    { value: "no-hire", label: "No Hire", color: "status-pending" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={recommendation === option.value ? "default" : "outline"}
                      onClick={() => setRecommendation(option.value)}
                      className={cn(
                        "h-12",
                        recommendation === option.value && "bg-primary text-primary-foreground"
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="strengths">Key Strengths</Label>
                  <Textarea 
                    id="strengths"
                    placeholder="What impressed you most about this candidate?"
                    className="min-h-[100px] mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="concerns">Areas of Concern</Label>
                  <Textarea 
                    id="concerns"
                    placeholder="Any concerns or areas for improvement?"
                    className="min-h-[100px] mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="additional">Additional Comments</Label>
                  <Textarea 
                    id="additional"
                    placeholder="Any other observations or notes?"
                    className="min-h-[100px] mt-2"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button className="flex-1 btn-professional">
                  Submit Feedback
                </Button>
                <Button variant="outline" className="flex-1">
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}