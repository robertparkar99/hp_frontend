"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationDetailsDialog from "./ApplicationDetailsDialog";
import {
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  X,
  Clock,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  User,
  FileText,
  TrendingUp,
  RefreshCw
} from "lucide-react";

interface JobPosting {
  id: number;
  title: string;
  department_id: number;
  location: string;
  employment_type: string;
  experience: string;
  education: string;
  priority_level: string;
  positions: number;
  min_salary: string;
  max_salary: string;
  deadline: string;
  skills: string;
  certifications: string;
  benefits: string;
  description: string;
  status: string;
  sub_institute_id: number;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface JobApplication {
  id: number;
  job_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  mobile: string;
  current_location: string;
  employment_type: string;
  experience: string;
  education: string;
  expected_salary: string;
  skills: string;
  certifications: string;
  resume_path: string | null;
  applied_date: string;
  status: string;
  sub_institute_id: number;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  current_company?: string;
  current_role?: string;
}

interface Candidate {
   id: string;
   name: string;
   email: string;
   phone: string;
   position: string;
   experience: string;
   education: string;
   location: string;
   skills: string[];
   score: number | null;
   status: 'shortlisted' | 'rejected' | 'pending' | 'under_review';
   appliedDate: string;
   resumeUrl: string;
   matchDetails: {
     skillsMatch: number | null;
     experienceMatch: number | null;
     educationMatch: number | null;
     cultural_fit: number | null;
   };
   originalApplication: JobApplication;
   aiRecommendation?: string;
   culturalFit?: number;
   reasoning?: string;
   isScreened: boolean;
   predictedSuccess?: string;
   rankingScore?: number;
   skillMatchDetails?: any[];
   skillGaps?: string[];
   strengths?: string[];
}

interface CandidateScreeningProps {
  jobApplications: JobApplication[];
  jobPostings: JobPosting[];
  loading: boolean;
  onRefresh: () => void;
}

const CandidateScreening = ({ jobApplications, jobPostings, loading, onRefresh }: CandidateScreeningProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  // Convert JobApplications to Candidate format
  useEffect(() => {
    if (jobApplications && jobApplications.length > 0) {
      const convertedCandidates = jobApplications.map((application): Candidate => {
        // Find the job title for this application
        const job = jobPostings.find(j => j.id === application.job_id);
        const jobTitle = job ? job.title : `Job ID: ${application.job_id}`;

        // Format the applicant's full name
        const fullName = `${application.first_name || ''} ${application.middle_name || ''} ${application.last_name || ''}`.trim();

        // Parse skills from string to array
        const skillsArray = application.skills ? application.skills.split(',').map(skill => skill.trim()) : [];

        // Determine status based on application status
        const getCandidateStatus = (appStatus: string): Candidate['status'] => {
          switch (appStatus) {
            case 'shortlisted': return 'shortlisted';
            case 'rejected': return 'rejected';
            case 'under_review': return 'under_review';
            default: return 'pending';
          }
        };

        return {
          id: application.id.toString(),
          name: fullName || 'Unknown Applicant',
          email: application.email,
          phone: application.mobile,
          position: jobTitle,
          experience: application.experience || 'Not specified',
          education: application.education || 'Not specified',
          location: application.current_location || 'Not specified',
          skills: skillsArray,
          score: null, // Will be set by AI screening
          status: getCandidateStatus(application.status),
          appliedDate: application.applied_date || application.created_at,
          resumeUrl: application.resume_path || '',
          matchDetails: {
            skillsMatch: null,
            experienceMatch: null,
            educationMatch: null,
            cultural_fit: null
          },
          originalApplication: application,
          isScreened: false
        };
      });

      setCandidates(convertedCandidates);

      // After setting candidates, perform AI screening for each
      screenAllCandidates(convertedCandidates);
    } else {
      setCandidates([]);
    }
  }, [jobApplications, jobPostings]);

  // Function to screen all candidates using AI
  const screenAllCandidates = async (candidatesList: Candidate[]) => {
    const updatedCandidates = await Promise.all(
      candidatesList.map(async (candidate) => {
        try {
          const job = jobPostings.find(j => j.id === candidate.originalApplication.job_id);
          if (!job) return candidate;

          // Build resume text from application data
          const resumeText = buildResumeText(candidate.originalApplication);

          // Build JD data from job posting
          const jdData = buildJDData(job);

          // Call screening API
          const screeningResult = await screenCandidate({
            resume: resumeText,
            jdData: jdData,
            candidateEmail: candidate.email,
            candidateName: candidate.name
          });
          

          // Update candidate with real screening data
          return {
            ...candidate,
            score: screeningResult.competency_match,
            matchDetails: {
              skillsMatch: screeningResult.competency_match,
              experienceMatch: screeningResult.competency_match,
              educationMatch: screeningResult.competency_match,
              cultural_fit: screeningResult.cultural_fit
            },
            aiRecommendation: screeningResult.recommendation,
            culturalFit: screeningResult.cultural_fit,
            reasoning: screeningResult.reasoning,
            isScreened: true,
            predictedSuccess: screeningResult.predicted_success,
            rankingScore: screeningResult.competency_match,
            skillMatchDetails: screeningResult.skill_match_details,
            skillGaps: screeningResult.skill_gaps,
            strengths: screeningResult.strengths
          };
        } catch (error) {
          console.warn(`Failed to screen candidate ${candidate.id}:`, error);
          // Return candidate with existing data if screening fails
          return candidate;
        }
      })
    );

    setCandidates(updatedCandidates);
  };

  // Helper function to build resume text from application data
  const buildResumeText = (application: JobApplication) => {
    return `
Candidate Name: ${application.first_name} ${application.last_name}
Email: ${application.email}
Mobile: ${application.mobile}
Location: ${application.current_location}

Experience:
${application.experience}

Education:
${application.education}

Skills:
${application.skills}

Certifications:
${application.certifications || "Not provided"}

Current Company:
${application.current_company || "Not provided"}

Current Role:
${application.current_role || "Not provided"}
    `.trim();
  };

  // Helper function to build JD data from job posting
  const buildJDData = (job: JobPosting) => ({
    core_skills: job.skills
      ? job.skills.split(",").map(s => s.trim())
      : [],

    behavioral_traits: [
      "Problem Solving",
      "Teamwork",
      "Communication"
    ],

    competency_level: job.skills
      ? job.skills.split(",").reduce((acc: any, skill) => {
        acc[skill.trim()] = "Intermediate";
        return acc;
      }, {})
      : {}
  });

  // Function to screen a single candidate
  const screenCandidate = async (payload: any) => {
    const response = await fetch("/api/screenCandidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("ScreenCandidate API failed");
    }

    return response.json();
  };

  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'shortlisted':
        return <Badge className="bg-success text-success-foreground">Shortlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending Review</Badge>;
      case 'under_review':
        return <Badge variant="outline">Under Review</Badge>;
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return null;
    if (score >= 85) return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-warning text-warning-foreground">Good</Badge>;
    if (score >= 60) return <Badge variant="outline">Fair</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Poor</Badge>;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = selectedTab === "all" ||
      (selectedTab === "shortlisted" && candidate.status === "shortlisted") ||
      (selectedTab === "pending" && (candidate.status === "pending" || candidate.status === "under_review")) ||
      (selectedTab === "rejected" && candidate.status === "rejected");

    return matchesSearch && matchesTab;
  });

  const screenedCandidates = candidates.filter(c => c.isScreened && c.score !== null);
  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
    pending: candidates.filter(c => c.status === 'pending' || c.status === 'under_review').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
    avgScore: screenedCandidates.length > 0 ? Math.round(screenedCandidates.reduce((sum, c) => sum + (c.score || 0), 0) / screenedCandidates.length) : 0
  };

  const handleViewApplication = (candidate: Candidate) => {
    setSelectedApplication(candidate.originalApplication);
    setIsApplicationDialogOpen(true);
  };

  const handleDownloadResume = (candidate: Candidate) => {
    if (candidate.resumeUrl) {
      console.log('Downloading resume:', candidate.resumeUrl);
      window.open(candidate.resumeUrl, '_blank');
    } else {
      alert('No resume available for this candidate');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading candidate data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Candidates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">{stats.shortlisted}</div>
                <div className="text-xs text-muted-foreground">Shortlisted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold">{stats.avgScore}%</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>Candidate Screening Results</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-10 w-48 sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <User className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'No candidates match your search criteria.' : 'No candidates available for screening.'}
                  </p>
                </div>
              ) : (
                  <div className="space-y-4">
                    {filteredCandidates.map((candidate) => (
                      <div key={candidate.id} className="border border-border rounded-lg p-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                              <h3 className="text-lg font-semibold truncate">{candidate.name}</h3>
                              {getStatusBadge(candidate.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 truncate">
                              Applied for {candidate.position}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{candidate.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Briefcase className="w-3 h-3" />
                                <span className="truncate">{candidate.experience}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <GraduationCap className="w-3 h-3" />
                                <span className="truncate">{candidate.education}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2 justify-end">
                            <Star className="w-5 h-5 text-primary" />
                              <span className="text-2xl font-bold text-primary">
                                {candidate.isScreened && candidate.score !== null ? `${candidate.score}%` : 'Pending'}
                              </span>
                          </div>
                            {candidate.isScreened && candidate.score !== null ? getScoreBadge(candidate.score) : (
                              <Badge variant="outline">Screening in Progress</Badge>
                            )}
                            {candidate.aiRecommendation && (
                              <div className="text-sm text-muted-foreground mt-1">
                                AI: {candidate.aiRecommendation}
                              </div>
                            )}
                            {/* {candidate.culturalFit && (
                              <div className="text-sm text-muted-foreground">
                                Cultural Fit: {candidate.culturalFit}%
                              </div>
                            )} */}
                        </div>
                      </div>

                      {/* Match Details */}
                        {candidate.isScreened ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.skillsMatch}%</div>
                              <div className="text-xs text-muted-foreground">Skills Match</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.experienceMatch}%</div>
                              <div className="text-xs text-muted-foreground">Experience</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.educationMatch}%</div>
                              <div className="text-xs text-muted-foreground">Education</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.cultural_fit}</div>
                              <div className="text-xs text-muted-foreground">Cultural Fit</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center mb-4">
                            <div className="text-sm text-muted-foreground">AI screening in progress...</div>
                          </div>
                        )}

                      {/* Additional Screening Details */}
                      {candidate.isScreened && (
                        <div className="mb-4 space-y-3">
                          {candidate.predictedSuccess && (
                            <div>
                              <h4 className="font-medium text-sm mb-1">Predicted Success</h4>
                              <Badge variant={
                                candidate.predictedSuccess === 'Highly Likely' ? 'default' :
                                candidate.predictedSuccess === 'Likely' ? 'secondary' :
                                candidate.predictedSuccess === 'Possible' ? 'outline' : 'destructive'
                              }>
                                {candidate.predictedSuccess}
                              </Badge>
                            </div>
                          )}

                          {candidate.rankingScore !== undefined && (
                            <div>
                              <h4 className="font-medium text-sm mb-1">Ranking Score</h4>
                              <div className="text-lg font-semibold">{candidate.rankingScore}/100</div>
                            </div>
                          )}

                          {candidate.skillMatchDetails && candidate.skillMatchDetails.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Skill Match Details</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {candidate.skillMatchDetails.map((skill: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm">{skill.skill}</span>
                                    <Badge variant={skill.present ? "default" : "destructive"} className="text-xs">
                                      {skill.present ? "Present" : "Missing"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {candidate.skillGaps && candidate.skillGaps.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Skill Gaps</h4>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skillGaps.map((gap, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {gap}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {candidate.strengths && candidate.strengths.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Key Strengths</h4>
                              <div className="flex flex-wrap gap-2">
                                {candidate.strengths.map((strength, index) => (
                                  <Badge key={index} variant="default" className="text-xs">
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skills */}
                      {candidate.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Key Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(candidate)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResume(candidate)}
                            disabled={!candidate.resumeUrl}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResume(candidate)}
                            disabled={!candidate.resumeUrl}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          {candidate.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Shortlist
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ApplicationDetailsDialog
        application={selectedApplication}
        jobPostings={jobPostings}
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
      />
    </div>
  );
};

export default CandidateScreening;