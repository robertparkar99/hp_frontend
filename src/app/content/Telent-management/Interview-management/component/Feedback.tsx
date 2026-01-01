  import { useState, useEffect } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
  import { Badge } from "@/components/ui/badge";
  import { Slider } from "@/components/ui/slider";
  import { Star, User, Clock, MessageSquare, ArrowLeft } from "lucide-react";
  import { cn } from "@/lib/utils";

  export default function Feedback({ candidate, onBack }: { candidate: any; onBack?: () => void }) {
    const [ratings, setRatings] = useState<{ [key: number]: number }>({});
    const [overallRating, setOverallRating] = useState([7]);
    const [recommendation, setRecommendation] = useState("");
    const [keyStrengths, setKeyStrengths] = useState("");
    const [areasOfConcern, setAreasOfConcern] = useState("");
    const [additionalComments, setAdditionalComments] = useState("");

    useEffect(() => {
      const fetchFeedback = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/feedback/${candidate.candidate_id}?sub_institute_id=3&type=API&token=1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer 1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5',
            },
          });
          if (response.ok) {
            const result = await response.json();
            if (result.status && result.data) {
              const feedback = result.data;
              const criteria = JSON.parse(feedback.evaluation_criteria);
              const newRatings: { [key: number]: number } = {};
              let overall = 7;
              criteria.forEach((item: any) => {
                if (item.name === "Overall Rating") {
                  overall = item.score;
                } else {
                  const crit = evaluationCriteria.find(c => c.name === item.name);
                  if (crit) {
                    newRatings[crit.id] = item.score;
                  }
                }
              });
              setRatings(newRatings);
              setOverallRating([overall]);
              setRecommendation(feedback.recommendation === "Recommended for hire" ? "hire" : feedback.recommendation === "Not recommended for hire" ? "no-hire" : "maybe");
              setKeyStrengths(feedback.key_strengths);
              setAreasOfConcern(feedback.areas_of_concern);
              setAdditionalComments(feedback.additional_comments);
            }
          }
        } catch (error) {
          console.error('Error fetching feedback:', error);
        }
      };
      if (candidate.candidate_id) {
        fetchFeedback();
      }
    }, [candidate.candidate_id]);

    const parts = candidate.candidate_name.split(' ');
    const email = parts.pop() || '';
    const name = parts.join(' ');

    const interviewData = {
      candidate: name,
      position: `Position ${candidate.position}`,
      date: candidate.next_interview ? new Date(candidate.next_interview).toLocaleDateString() : new Date(candidate.applied_date).toLocaleDateString(),
      time: candidate.next_interview ? new Date(candidate.next_interview).toLocaleTimeString() : "  ",
      interviewer: candidate.panel_name || "",
      type: candidate.stage || "Interview"
    };

    const evaluationCriteria = [
      { id: 1, name: "Technical Skills", description: "Programming knowledge and problem-solving abilities" },
      { id: 2, name: "Communication", description: "Clarity of explanation and interpersonal skills" },
      { id: 3, name: "Problem Solving", description: "Analytical thinking and approach to challenges" },
      { id: 4, name: "Cultural Fit", description: "Alignment with company values and team dynamics" },
      { id: 5, name: "Experience Relevance", description: "How well their background matches the role" },
    ];

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

    const handleSubmitFeedback = async () => {
      const evaluationData = {
        job_id: candidate.position_id || 1,
        candidate_id: candidate.candidate_id || 1,
        panel_id: candidate.panel_id || 1,
        evaluation_criteria: [
          ...evaluationCriteria.map(criteria => ({
            name: criteria.name,
            score: ratings[criteria.id] || 5
          })),
          {
            name: "Overall Rating",
            score: overallRating[0]
          }
        ],
        recommendation: recommendation === "hire" ? "Recommended for hire" : recommendation === "no-hire" ? "Not recommended for hire" : "Maybe",
        key_strengths: keyStrengths,
        areas_of_concern: areasOfConcern,
        additional_comments: additionalComments
      };

      try {
          const response = await fetch('http://127.0.0.1:8000/api/evaluation?type=API&sub_institute_id=3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer 1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5',
  },
  body: JSON.stringify(evaluationData),
});

        if (response.ok) {
          alert('Feedback submitted successfully!');
          // Optionally reset form or navigate back
        } else {
          alert('Failed to submit feedback.');
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback.');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Candidates
            </Button>
          )}
          
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
                  <p className="text-sm text-muted-foreground">{email}</p>
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
                <CardTitle className="flex items-center">
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
                      value={keyStrengths}
                      onChange={(e) => setKeyStrengths(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="concerns">Areas of Concern</Label>
                    <Textarea
                      id="concerns"
                      placeholder="Any concerns or areas for improvement?"
                      className="min-h-[100px] mt-2"
                      value={areasOfConcern}
                      onChange={(e) => setAreasOfConcern(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional">Additional Comments</Label>
                    <Textarea
                      id="additional"
                      placeholder="Any other observations or notes?"
                      className="min-h-[100px] mt-2"
                      value={additionalComments}
                      onChange={(e) => setAdditionalComments(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button className="flex-1 btn-professional" onClick={handleSubmitFeedback}>
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