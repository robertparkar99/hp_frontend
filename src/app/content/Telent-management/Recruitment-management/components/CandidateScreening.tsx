
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
  status: 'shortlisted' | 'rejected' | 'pending' | 'under_review' | 'hired';
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
  jobPostings: JobPosting[];
  onRefresh: () => void;
}

const EXPERIENCE_LEVELS: Record<string, number> = {
  "Entry Level (0-2 years)": 1,
  "Mid Level (3-5 years)": 2,
  "Senior Level (6-10 years)": 3,
  "Lead Level (10+ years)": 4
};

const calculateExperienceMatch = (
  jobExperience: string,
  candidateExperience: string
): number => {
  if (!jobExperience || !candidateExperience) return 0;

  const jobLevel = EXPERIENCE_LEVELS[jobExperience];
  const candLevel = EXPERIENCE_LEVELS[candidateExperience];

  if (!jobLevel || !candLevel) return 0;

  if (candLevel >= jobLevel) return 100;
  if (candLevel === jobLevel - 1) return 70;
  return 30;
};


const EDUCATION_LEVELS: Record<string, number> = {
  "Not Required": 0,
  "High School Diploma": 1,
  "Associate Degree": 2,
  "Bachelor's Degree": 3,
  "Master's Degree": 4,
  "PhD": 5
};
const calculateEducationMatch = (
  jobEducation: string,
  candidateEducation: string
): number => {
  if (!jobEducation || !candidateEducation) return 0;

  if (jobEducation === "Not Required") return 100;

  const jobLevel = EDUCATION_LEVELS[jobEducation];
  const candLevel = EDUCATION_LEVELS[candidateEducation];

  if (jobLevel === undefined || candLevel === undefined) return 0;

  if (candLevel >= jobLevel) return 100;
  if (candLevel === jobLevel - 1) return 70;
  return 30;
};

const calculateSkillMatch = (
  jobSkills: string,
  candidateSkills: string
): number => {
  if (!jobSkills || !candidateSkills) return 0;

  const jobSkillArr = jobSkills
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const candSkillArr = candidateSkills
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (jobSkillArr.length === 0) return 0;

  const matched = jobSkillArr.filter(skill =>
    candSkillArr.some(c => c.includes(skill) || skill.includes(c))
  );

  return Math.round((matched.length / jobSkillArr.length) * 100);
};



const CandidateScreening = ({ jobPostings, onRefresh }: CandidateScreeningProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [jobPostingsApi, setJobPostingsApi] = useState<JobPosting[]>([]);

  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
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
    if (!sessionData) return;

    const fetchJobPostings = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job postings");
        }

        const result = await response.json();

        let postings: JobPosting[] = [];
        if (Array.isArray(result.data)) {
          postings = result.data;
        } else if (Array.isArray(result)) {
          postings = result;
        }

        setJobPostingsApi(postings);
      } catch (error) {
        console.error("Error fetching job postings:", error);
        setJobPostingsApi([]);
      }
    };

    fetchJobPostings();
  }, [sessionData]);

  // Fetch job applications from API
  useEffect(() => {
    const fetchJobApplications = async () => {
      if (!sessionData) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${sessionData.url}/api/job-applications?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch job applications: ${response.status}`);
        }

        const result = await response.json();
        console.log("Job applications API response:", result);

        // Handle different possible response structures
        let applications: JobApplication[] = [];
        if (Array.isArray(result.data)) {
          applications = result.data;
        } else if (Array.isArray(result)) {
          applications = result;
        }

        setJobApplications(applications);
        console.log(`Fetched ${applications.length} job applications`);
      } catch (error) {
        console.error("Error fetching job applications:", error);
        setJobApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobApplications();
  }, [sessionData]);

  // const calculateEducationMatch = (
  //   jobEducation: string,
  //   candidateEducation: string
  // ): number => {
  //   if (!jobEducation || !candidateEducation) return 0;

  //   const jobEdu = jobEducation.toLowerCase();
  //   const candEdu = candidateEducation.toLowerCase();

  //   if (candEdu.includes(jobEdu)) return 100;
  //   if (jobEdu.includes(candEdu)) return 80;

  //   const jobParts = jobEdu.split(/[,/]/);
  //   const matched = jobParts.filter(p => candEdu.includes(p.trim()));

  //   return Math.round((matched.length / jobParts.length) * 100);
  // };
  // const extractYears = (text: string): number => {
  //   const match = text.match(/(\d+(\.\d+)?)/);
  //   return match ? parseFloat(match[1]) : 0;
  // };

  // const calculateExperienceMatch = (
  //   jobExp: string,
  //   candidateExp: string
  // ): number => {
  //   if (!jobExp || !candidateExp) return 0;

  //   const jobYears = extractYears(jobExp);
  //   const candYears = extractYears(candidateExp);

  //   if (jobYears === 0 || candYears === 0) return 0;
  //   if (candYears >= jobYears) return 100;

  //   return Math.round((candYears / jobYears) * 100);
  // };



  // Convert JobApplications to Candidate format
  useEffect(() => {
    if (jobApplications.length === 0 || jobPostingsApi.length === 0) {
      return;
    }

    if (jobApplications.length > 0) {
      const convertedCandidates = jobApplications.map((application): Candidate => {
        // Find the job title for this application
        // const job = jobPostings.find(j => j.id === application.job_id);

        const job = jobPostingsApi.find(j => j.id === application.job_id);

        const experienceMatch = job
          ? calculateExperienceMatch(job.experience, application.experience)
          : null;

        const educationMatch = job
          ? calculateEducationMatch(job.education, application.education)
          : null;

        // Log education and experience calculations for debugging
        const FullName = `${application.first_name || ''} ${application.middle_name || ''} ${application.last_name || ''}`.trim();
        console.log(`Candidate: ${FullName}, Job Experience: ${job?.experience}, Candidate Experience: ${application.experience}, Experience Match: ${experienceMatch}%`);
        console.log(`Candidate: ${FullName}, Job Education: ${job?.education}, Candidate Education: ${application.education}, Education Match: ${educationMatch}%`);

        const skillMatch = job
          ? calculateSkillMatch(job.skills, application.skills)
          : null;

        const missingSkills = job
          ? job.skills
            .split(',')
            .map(s => s.trim())
            .filter(js =>
              !application.skills
                ?.toLowerCase()
                .includes(js.toLowerCase())
            )
          : [];

        const jobTitle = job ? job.title : `Job ID: ${application.job_id}`;

        // Parse skills from string to array
        const skillsArray = application.skills ? application.skills.split(',').map(skill => skill.trim()) : [];

        // Determine status based on application status
        const getCandidateStatus = (appStatus: string): Candidate['status'] => {
          const normalizedStatus = appStatus.toLowerCase();
          switch (normalizedStatus) {
            case 'shortlisted': return 'shortlisted';
            case 'rejected': return 'rejected';
            case 'under_review': return 'under_review';
            case 'hired': return 'hired';
            default: return 'pending';
          }
        };

        return {
          id: application.id.toString(),
          name: FullName || 'Unknown Applicant',
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
          // matchDetails: {
          //   skillsMatch: null,
          //   experienceMatch: null,
          //   educationMatch: null,
          //   cultural_fit: null
          // },

          matchDetails: {
            skillsMatch: skillMatch,
            experienceMatch,
            educationMatch,
            cultural_fit: null
          },


          originalApplication: application,
          isScreened: false
        };
      });

      setCandidates(convertedCandidates);

      // After setting candidates, fetch screening results for each
      fetchScreeningResults(convertedCandidates);
    } else {
      setCandidates([]);
    }
  }, [jobApplications, jobPostingsApi]);

  // Function to fetch screening results for all candidates
  const fetchScreeningResults = async (candidatesList: Candidate[]) => {
    const updatedCandidates = await Promise.all(
      candidatesList.map(async (candidate) => {
        try {
          // Fetch screening results from API
          const screeningResponse = await fetch(
            `${sessionData.url}/api/talent-screening-results/candidate/${candidate.id}?type=API&token=${sessionData.token}`
          );

          if (!screeningResponse.ok) {
            console.warn(`No screening data found for candidate ${candidate.id}`);
            return candidate; // Return candidate without screening data
          }

          const screeningData = await screeningResponse.json();

          if (!screeningData.success) {
            console.warn(`Invalid screening data for candidate ${candidate.id}`);
            return candidate;
          }

          // Update candidate with fetched screening data
          return {
            ...candidate,
            score: screeningData.competency_match,
            matchDetails: {
              // skillsMatch: screeningData.competency_match,
              // experienceMatch: screeningData.scoringPipeline?.competency_scoring?.overallFitScore || screeningData.competency_match,
              // educationMatch: screeningData.competency_match,
              skillsMatch: candidate.matchDetails.skillsMatch,
              experienceMatch: candidate.matchDetails.experienceMatch,
              educationMatch: candidate.matchDetails.educationMatch,

              cultural_fit: screeningData.cultural_fit
            },
            aiRecommendation: screeningData.recommendation,
            culturalFit: screeningData.cultural_fit,
            reasoning: screeningData.summary,
            isScreened: true,
            predictedSuccess: screeningData.predicted_success,
            rankingScore: screeningData.ranking_score,
            skillMatchDetails: screeningData.skill_match_details,
            skillGaps: screeningData.skill_gaps,
            strengths: screeningData.strengths
          };
        } catch (error) {
          console.warn(`Failed to fetch screening data for candidate ${candidate.id}:`, error);
          // Return candidate with existing data if fetch fails
          return candidate;
        }
      })
    );

    setCandidates(updatedCandidates);
  };


  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'shortlisted':
        return <Badge className="bg-success text-success-foreground">Shortlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-white-foreground">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending Review</Badge>;
      case 'under_review':
        return <Badge variant="outline">Under Review</Badge>;
      case 'hired':
        return <Badge className="bg-purple-100 text-purple-800">Hired</Badge>;
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
      (selectedTab === "rejected" && candidate.status === "rejected") ||
      (selectedTab === "hired" && candidate.status === "hired");

    return matchesSearch && matchesTab;
  });

  const screenedCandidates = candidates.filter(c => c.isScreened && c.score !== null);
  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
    pending: candidates.filter(c => c.status === 'pending' || c.status === 'under_review').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    avgScore: screenedCandidates.length > 0 ? Math.round(screenedCandidates.reduce((sum, c) => sum + (c.score || 0), 0) / screenedCandidates.length) : 0
  };

  const handleViewApplication = (candidate: Candidate) => {
    setSelectedApplication(candidate.originalApplication);
    setSelectedCandidate(candidate);
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

  const handleShortlist = async (candidate: Candidate) => {
    if (!sessionData) return;
    try {
      const updateData = {
        type: "API",
        token: sessionData.token,
        sub_institute_id: sessionData.sub_institute_id,
        job_id: candidate.originalApplication.job_id,
        first_name: candidate.originalApplication.first_name,
        middle_name: candidate.originalApplication.middle_name || "",
        last_name: candidate.originalApplication.last_name,
        email: candidate.originalApplication.email,
        mobile: candidate.originalApplication.mobile,
        current_location: candidate.originalApplication.current_location,
        employment_type: candidate.originalApplication.employment_type,
        experience: candidate.originalApplication.experience,
        education: candidate.originalApplication.education,
        expected_salary: candidate.originalApplication.expected_salary,
        skills: candidate.originalApplication.skills,
        certifications: candidate.originalApplication.certifications || "",
        applied_date: candidate.originalApplication.applied_date,
        status: "shortlisted",
        user_id: sessionData.user_id || 1
      };

      const response = await fetch(`${sessionData.url}/api/job-applications/${candidate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('Candidate shortlisted successfully');
        // Update local state immediately
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'shortlisted' } : c));
        onRefresh(); // Refresh the data
      } else {
        alert('Failed to shortlist candidate');
      }
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
      alert('Error shortlisting candidate');
    }
  };

  const handleReject = async (candidate: Candidate) => {
    if (!sessionData) return;
    try {
      const updateData = {
        type: "API",
        token: sessionData.token,
        sub_institute_id: sessionData.sub_institute_id,
        job_id: candidate.originalApplication.job_id,
        first_name: candidate.originalApplication.first_name,
        middle_name: candidate.originalApplication.middle_name || "",
        last_name: candidate.originalApplication.last_name,
        email: candidate.originalApplication.email,
        mobile: candidate.originalApplication.mobile,
        current_location: candidate.originalApplication.current_location,
        employment_type: candidate.originalApplication.employment_type,
        experience: candidate.originalApplication.experience,
        education: candidate.originalApplication.education,
        expected_salary: candidate.originalApplication.expected_salary,
        skills: candidate.originalApplication.skills,
        certifications: candidate.originalApplication.certifications || "",
        applied_date: candidate.originalApplication.applied_date,
        status: "rejected",
        user_id: sessionData.user_id || 1
      };

      const response = await fetch(`${sessionData.url}/api/job-applications/${candidate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('Candidate rejected successfully');
        // Update local state immediately
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'rejected' } : c));
        onRefresh(); // Refresh the data
      } else {
        alert('Failed to reject candidate');
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      alert('Error rejecting candidate');
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Candidate Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.hired}</div>
                  <div className="text-xs text-muted-foreground">Hired</div>
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
              <Button variant="outline" size="sm" onClick={() => {
                // Refetch job applications
                if (sessionData) {
                  fetch(`${sessionData.url}/api/job-applications?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`)
                    .then(response => response.json())
                    .then(result => {
                      let applications: JobApplication[] = [];
                      if (Array.isArray(result.data)) {
                        applications = result.data;
                      } else if (Array.isArray(result)) {
                        applications = result;
                      }
                      setJobApplications(applications);
                      console.log(`Refetched ${applications.length} job applications`);
                    })
                    .catch(error => {
                      console.error("Error refetching job applications:", error);
                    });
                }
                onRefresh();
              }}>
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
              <TabsTrigger value="hired">Hired ({stats.hired})</TabsTrigger>
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
                              <span className="text-2xl font-bold text-primary" title={candidate.isScreened && candidate.score !== null ? `AI Screening Score: ${candidate.score}%` : 'Screening in progress'}>
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
                                Cultural Fit: {candidate.culturalFit}
                              </div>
                            )} */}
                        </div>
                      </div>

                      {/* Match Details */}
                        {candidate.isScreened ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.skillsMatch || 0}%</div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${candidate.matchDetails.skillsMatch || 0}%` }}></div>
                              </div>
                              <div className="text-xs text-muted-foreground">Skills Match</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.experienceMatch || 0}%</div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${candidate.matchDetails.experienceMatch || 0}%` }}></div>
                              </div>
                              <div className="text-xs text-muted-foreground">Experience</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.educationMatch || 0}%</div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${candidate.matchDetails.educationMatch || 0}%` }}></div>
                              </div>
                              <div className="text-xs text-muted-foreground">Education</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">{candidate.matchDetails.cultural_fit || 0}</div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${candidate.matchDetails.cultural_fit || 0}%` }}></div>
                              </div>
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
                            {(candidate.predictedSuccess || candidate.rankingScore !== undefined) && (
                              <div className="flex items-center gap-4">
                                {candidate.predictedSuccess && (
                                  <div className="flex flex-col gap-1">
                                    <Badge
                                      className="w-fit px-3 py-1 text-sm font-semibold"
                                      variant={
                                        candidate.predictedSuccess === "Highly Likely"
                                          ? "default"
                                          : candidate.predictedSuccess === "Likely"
                                            ? "secondary"
                                            : candidate.predictedSuccess === "Possible"
                                              ? "outline"
                                              : "destructive"
                                      }
                                    >
                                      {candidate.predictedSuccess}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      Predicted Success
                                    </span>


                                  </div>

                                )}
                                {candidate.rankingScore !== undefined && (
                                  <div className="flex flex-col gap-1">

                                    <span className="text-sm font-semibold">{candidate.rankingScore}/100</span>
                                    <span className="text-sm text-muted-foreground">Ranking Score</span>
                                  </div>
                                )}
                            </div>
                          )}

                            {/* {candidate.skillMatchDetails && candidate.skillMatchDetails.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Skill Match Details</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {candidate.skillMatchDetails.map((skill: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50  rounded">
                                    <span className="text-sm">{skill.name || skill.skill}</span>
                                    <Badge variant={skill.present ? "default" : "destructive"} className="text-xs">
                                      {skill.present ? "Present" : "Missing"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )} */}

                          {candidate.skillGaps && candidate.skillGaps.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Skill Gaps</h4>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skillGaps.map((gap, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs bg-red-100 text-red-800 hover:bg-red-200">
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
                            <h4 className="font-medium text-sm mb-2">Candidate Key Skills</h4>
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
                              <Eye className="w-4 h-4 mr-2" />
                              View Resume
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResume(candidate)}
                            disabled={!candidate.resumeUrl}
                          >
                            <Download className="w-4 h-4 mr-2" />
                              Download Resume
                          </Button>
                          {candidate.status === 'pending' && (
                            <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive hover:bg-red-100 hover:text-red-800"
                                  onClick={() => handleReject(candidate)}
                                >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                                <Button
                                  size="sm"
                                  className="bg-success hover:bg-success/90 text-success-foreground"
                                  onClick={() => handleShortlist(candidate)}
                                >
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
        candidate={selectedCandidate}
        jobPostings={jobPostings}
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
        showScreeningScores={true}
      />
    </div>
  );
};

export default CandidateScreening;