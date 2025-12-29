
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ResumeUpload from "../Recruitment-management/components/ResumeUpload";
import {
  Search,
  MapPin,
  Building,
  Clock,
  IndianRupee,
  Briefcase,
  Users,
  Calendar,
  Heart,
  Share2,
  Upload,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";

interface JobPosting {
  id: number;
  title: string;
  company: string;
  department_id: number;
  department: string;
  location: string;
  employment_type: string;
  min_salary: string;
  max_salary: string;
  salary_range: string;
  posted_date: string;
  applicants_count: number;
  positions: number;
  description: string;
  requirements: string[];
  benefits: string;
  skills: string;
  certifications: string;
  experience: string;
  education: string;
  status: string;
  deadline: string;
  created_at: string;
}

interface Department {
  id: number;
  industries: string;
  department: string;
  sub_department: string;
}

interface ApiResponse {
  data?: JobPosting[];
  job_postings?: JobPosting[];
  jobs?: JobPosting[];
  success?: boolean;
  message?: string;
}

interface DepartmentApiResponse {
  data?: Department[];
  departments?: Department[];
  success?: boolean;
  message?: string;
}

interface ApplicationResponse {
  status: number;
  message: string;
  data?: any;
}

// Form data interface matching your API structure
interface ApplicationFormData {
  first_name: string;
  middle_name: string;
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
  resume: File | null;
  cover_letter?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  notice_period?: string;
  current_company?: string;
  current_role?: string;
}

const CandidatePortal = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [jobListings, setJobListings] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedResumePath, setUploadedResumePath] = useState<string>("");

  // Enhanced form data structure
  const [formData, setFormData] = useState<ApplicationFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    mobile: "",
    current_location: "",
    employment_type: "",
    experience: "",
    education: "",
    expected_salary: "",
    skills: "",
    certifications: "",
    resume: null,
    cover_letter: "",
    portfolio_url: "",
    linkedin_url: "",
    notice_period: "",
    current_company: "",
    current_role: ""
  });

  // Fetch session data on component mount
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setSessionData(parsed);

        // Pre-fill form with user data if available
        if (parsed.user_name || parsed.email) {
          setFormData(prev => ({
            ...prev,
            first_name: parsed.user_name?.split(' ')[0] || "",
            last_name: parsed.user_name?.split(' ').slice(1).join(' ') || "",
            email: parsed.email || "",
            mobile: parsed.phone || parsed.mobile || ""
          }));
        }
      } catch (err) {
        console.error("Failed to parse userData from localStorage:", err);
      }
    }
  }, []);

  // Combined data fetching - departments and jobs in sequence
  useEffect(() => {
    const fetchAllData = async () => {
      if (!sessionData) return;

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Starting data fetch...");

        // 1. First fetch departments
        console.log("📋 Fetching departments...");
        const departmentsUrl = `${sessionData.APP_URL}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&group_by=department&order_by[column]=department&order_by[direction]=asc`;

        const deptResponse = await fetch(departmentsUrl);

        if (!deptResponse.ok) {
          throw new Error(`Failed to fetch departments: ${deptResponse.status}`);
        }

        const deptResult: DepartmentApiResponse = await deptResponse.json();
        console.log("📋 Departments API Response:", deptResult);

        let departmentData: Department[] = [];

        if (Array.isArray(deptResult)) {
          departmentData = deptResult;
        } else if (Array.isArray(deptResult.data)) {
          departmentData = deptResult.data;
        } else if (Array.isArray(deptResult.departments)) {
          departmentData = deptResult.departments;
        } else {
          console.warn("Unexpected departments API response format:", deptResult);
        }

        setDepartments(departmentData);
        console.log(`📋 Loaded ${departmentData.length} departments`);

        // 2. Then fetch job postings (after departments are loaded)
        console.log("💼 Fetching job postings...");
        const jobsUrl = `${sessionData.APP_URL}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`;

        const jobsResponse = await fetch(jobsUrl);

        if (!jobsResponse.ok) {
          throw new Error(`Failed to fetch job postings: ${jobsResponse.status}`);
        }

        const jobsResult: ApiResponse = await jobsResponse.json();
        console.log("💼 Job Postings API Response:", jobsResult);

        // Handle different possible response structures
        let jobData: JobPosting[] = [];

        if (Array.isArray(jobsResult)) {
          jobData = jobsResult;
        } else if (Array.isArray(jobsResult.data)) {
          jobData = jobsResult.data;
        } else if (Array.isArray(jobsResult.job_postings)) {
          jobData = jobsResult.job_postings;
        } else if (Array.isArray(jobsResult.jobs)) {
          jobData = jobsResult.jobs;
        } else {
          console.warn("Unexpected job postings API response format:", jobsResult);
          setError("No job postings found in the response.");
          setJobListings([]);
          return;
        }

        console.log(`💼 Raw job data: ${jobData.length} jobs`);
        
        // DEBUG: Log all jobs to see their status
        console.log("🔍 ALL JOBS WITH STATUS:");
        jobData.forEach((job, index) => {
          console.log(`Job ${index + 1}:`, {
            id: job.id,
            title: job.title,
            status: job.status,
            hasTitle: !!job.title,
            hasStatus: !!job.status
          });
        });

        // Process jobs with departments data - FIXED STATUS FILTERING
        const processedJobs = jobData
          .filter(job => {
            // Check if job has status and it's active (case insensitive)
            const hasStatus = job.status && typeof job.status === 'string';
            const isActive = hasStatus && job.status.toLowerCase() === 'active';
            console.log(`Job ${job.id} (${job.title}): status="${job.status}", active=${isActive}`);
            return isActive;
          })
          .map(job => {
            const departmentInfo = departmentData.find(dept => dept.id === job.department_id);
            const departmentName = departmentInfo ? departmentInfo.department : `Department ${job.department_id}`;

            const salaryRange = job.min_salary && job.max_salary
              ? `₹${parseInt(job.min_salary).toLocaleString()} - ₹${parseInt(job.max_salary).toLocaleString()}`
              : "Competitive Salary";

            // Create requirements array (skills only)
            const requirements = [];
            if (job.skills) requirements.push(...job.skills.split(',').map(skill => skill.trim()));

            const benefitsList = job.benefits ? [job.benefits] : ["Not specified"];

            return {
              id: job.id || 0,
              title: job.title || "Untitled Position",
              company: "Your Company",
              department_id: job.department_id || 0,
              department: departmentName,
              location: job.location || "Remote",
              employment_type: job.employment_type || "Full-time",
              min_salary: job.min_salary || "0",
              max_salary: job.max_salary || "0",
              salary_range: salaryRange,
              posted_date: job.created_at || new Date().toISOString(),
              applicants_count: 0,
              positions: job.positions || 1,
              description: job.description || "No description available.",
              requirements: requirements.length > 0 ? requirements : ["Not specified"],
              benefits: job.benefits || "Not specified",
              benefitsList: benefitsList,
              skills: job.skills || "",
              certifications: job.certifications || "",
              experience: job.experience || "",
              education: job.education || "",
              status: job.status || "active",
              deadline: job.deadline || "",
              created_at: job.created_at || new Date().toISOString()
            };
          });

        console.log(`✅ Processed ${processedJobs.length} active jobs`);
        setJobListings(processedJobs);

      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to load job postings. Please try again later.");
        setJobListings([]);
      } finally {
        setLoading(false);
      }
    };

    if (sessionData) {
      fetchAllData();
    }
  }, [sessionData]);

  // Filter job listings based on search term
  const filteredJobListings = jobListings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.education.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(job.requirements) && job.requirements.some(req =>
      req.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("🔍 DEBUG STATE:", {
      sessionData: !!sessionData,
      departments: departments.length,
      jobListings: jobListings.length,
      filteredJobListings: filteredJobListings.length,
      loading,
      error
    });
  }, [sessionData, departments, jobListings, filteredJobListings, loading, error]);

  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case "Full-time":
        return <Badge className="bg-green-100 text-green-800">Full-time</Badge>;
      case "Contract":
        return <Badge variant="outline">Contract</Badge>;
      case "Part-time":
        return <Badge variant="secondary">Part-time</Badge>;
      case "Internship":
        return <Badge className="bg-blue-100 text-blue-800">Internship</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "closed":
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Recently";
      }
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch {
      return "Recently";
    }
  };

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
    setUploadedResumePath("");

    // Reset form but keep pre-filled user data
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setFormData({
          first_name: "",
          last_name: "",
          email: parsed.email || "",
          mobile: parsed.phone || parsed.mobile || "",
          middle_name: "",
          current_location: "",
          employment_type: "",
          experience: "",
          education: "",
          expected_salary: "",
          skills: "",
          certifications: "",
          resume: null,
          cover_letter: "",
          portfolio_url: "",
          linkedin_url: "",
          notice_period: "",
          current_company: "",
          current_role: ""
        });
      } catch (err) {
        console.error("Failed to parse userData:", err);
        // Fallback reset
        setFormData({
          first_name: "",
          middle_name: "",
          last_name: "",
          email: "",
          mobile: "",
          current_location: "",
          employment_type: "",
          experience: "",
          education: "",
          expected_salary: "",
          skills: "",
          certifications: "",
          resume: null,
          cover_letter: "",
          portfolio_url: "",
          linkedin_url: "",
          notice_period: "",
          current_company: "",
          current_role: ""
        });
      }
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      resume: file
    }));
    setUploadedResumePath("");
  };

  // Utility function to display file links in S3 format
  const renderFileLink = (filePath: string, fileName: string) => {
    if (!filePath) return null;
    
    return (
      <p className="text-xs text-gray-500 mt-1">
        Uploaded file:{" "}
        <a
          href={filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          {fileName}
        </a>
      </p>
    );
  };

  // Enhanced form validation
  const validateForm = (): boolean => {
    const requiredFields: (keyof ApplicationFormData)[] = [
      'first_name', 'last_name', 'email', 'mobile', 'current_location',
      'employment_type', 'experience', 'education', 'expected_salary', 'skills'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return false;
      }
    }

    // Validate resume file
    if (!formData.resume) {
      alert("Please upload your resume.");
      return false;
    }

    // Validate file type and size
    const allowedTypes = ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileExtension = formData.resume.name.toLowerCase().slice(formData.resume.name.lastIndexOf('.'));
    const fileType = formData.resume.type.toLowerCase();

    if (!allowedTypes.includes(fileExtension) && !allowedTypes.includes(fileType)) {
      alert("Please upload a valid resume file (PDF, DOC, or DOCX).");
      return false;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (formData.resume.size > maxSize) {
      alert("Resume file size should be less than 5MB.");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  };


  const buildResumeJSONText = (formData: ApplicationFormData) => {
    return `
Candidate Name: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Mobile: ${formData.mobile}
Location: ${formData.current_location}

Experience:
${formData.experience}

Education:
${formData.education}

Skills:
${formData.skills}

Certifications:
${formData.certifications || "Not provided"}

Current Company:
${formData.current_company || "Not provided"}

Current Role:
${formData.current_role || "Not provided"}
  `.trim();
  };

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



  // FIXED: handleSubmit function using FormData to send file properly
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedJob) {
      alert("No job selected. Please try again.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormData to handle file upload properly
      const formDataToSend = new FormData();

      // Add session data
      formDataToSend.append("type", "API");
      formDataToSend.append("token", sessionData?.token || "");
      formDataToSend.append("sub_institute_id", sessionData?.sub_institute_id?.toString() || "");

      // Add job application data
      formDataToSend.append("job_id", selectedJob.id.toString());

      // Add all required form fields
      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("middle_name", formData.middle_name);
      formDataToSend.append("last_name", formData.last_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("current_location", formData.current_location);
      formDataToSend.append("employment_type", formData.employment_type);
      formDataToSend.append("experience", formData.experience);
      formDataToSend.append("education", formData.education);
      formDataToSend.append("expected_salary", formData.expected_salary);
      formDataToSend.append("skills", formData.skills);
      formDataToSend.append("certifications", formData.certifications);

      // Add resume file - this is the key fix
      if (formData.resume) {
        formDataToSend.append("resume_path", formData.resume); // Send the actual file
      }

      // Add optional fields if they exist
      if (formData.cover_letter) formDataToSend.append("cover_letter", formData.cover_letter);
      if (formData.portfolio_url) formDataToSend.append("portfolio_url", formData.portfolio_url);
      if (formData.linkedin_url) formDataToSend.append("linkedin_url", formData.linkedin_url);
      if (formData.notice_period) formDataToSend.append("notice_period", formData.notice_period);
      if (formData.current_company) formDataToSend.append("current_company", formData.current_company);
      if (formData.current_role) formDataToSend.append("current_role", formData.current_role);

      // Add metadata
      formDataToSend.append("applied_date", new Date().toISOString().split('T')[0]);
      formDataToSend.append("status", "Pending Review"); // ✅ CORRECT STATUS VALUE
      formDataToSend.append("user_id", sessionData?.user_id?.toString() || "");

      // Step 3: Submit the application using FormData
      const apiUrl = `${sessionData.APP_URL}/api/job-applications`;

      console.log("=== SUBMISSION DEBUG ===");
      console.log("API URL:", apiUrl);
      console.log("Status being sent:", "Pending Review");
      console.log("Resume file:", formData.resume?.name);
      console.log("FormData entries:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      console.log("=== END DEBUG ===");

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend, // Send as FormData, not URL params
        // Don't set Content-Type header - let browser set it with boundary
      });

      console.log("Response status:", response.status);

      let result: any;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = { status: 0, message: "Empty response from server" };
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        result = { status: 0, message: "Invalid JSON response from server" };
      }

      console.log("Application submission response:", result);

      if (response.ok) {
        // Success - check both possible success indicators
        if (result.status !== 0 || result.message?.includes('successfully') || result.success) {
          const successMessage = `✅ Application submitted successfully for ${selectedJob.title}!`;
          alert(successMessage);

          // ===============================
          // AI SCREENING (JSON ONLY)
          // ===============================
          try {
            const screeningPayload = {
              resume: buildResumeJSONText(formData),
              jdData: buildJDData(selectedJob),
              candidateEmail: formData.email,
              candidateName: `${formData.first_name} ${formData.last_name}`
            };

            const screeningResult = await screenCandidate(screeningPayload);

            console.log("🧠 Screening Result:", screeningResult);

            alert(
              `AI Recommendation: ${screeningResult.recommendation}
Fit Score: ${screeningResult.competency_match}%
Cultural Fit: ${screeningResult.cultural_fit}`
            );

          } catch (error) {
            console.warn("⚠️ Screening failed but application saved", error);
          }

          setIsDialogOpen(false);

          // Reset form
          setFormData({
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            mobile: "",
            current_location: "",
            employment_type: "",
            experience: "",
            education: "",
            expected_salary: "",
            skills: "",
            certifications: "",
            resume: null,
            cover_letter: "",
            portfolio_url: "",
            linkedin_url: "",
            notice_period: "",
            current_company: "",
            current_role: ""
          });
          setUploadedResumePath("");
        } else {
          throw new Error(result.message || "Application submission failed");
        }
      } else {
        throw new Error(result.message || `HTTP ${response.status}: Failed to submit application`);
      }

    } catch (error) {
      console.error('❌ Error submitting application:', error);
      alert(`Failed to submit application. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };




  if (loading) {
    return (
      <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-xl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground mb-6">
            Discover exciting career opportunities and join our growing team
          </p>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          {/* <TabsList className="bg-[#EFF4FF]">
            <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
            <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          </TabsList> */}

          <TabsContent value="jobs" className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search jobs by title, skills, or department..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors">
                Search Jobs
              </Button>
            </div>

            {/* Job Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredJobListings.length} active job{filteredJobListings.length !== 1 ? 's' : ''}
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobListings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      {jobListings.length === 0 ? "No active job postings available at the moment." : "No active jobs found matching your criteria."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredJobListings.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                              {getJobTypeBadge(job.employment_type)}
                              {getStatusBadge(job.status)}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              <span>{job.salary_range}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-muted-foreground mb-4">{job.description}</p>

                      {/* Updated Grid Layout with Separate Sections */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* Skills Section */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Skills Required</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {job.skills ? (
                              job.skills.split(',').map((skill, index) => (
                                <li key={index}>• {skill.trim()}</li>
                              ))
                            ) : (
                              <li>• Not specified</li>
                            )}
                          </ul>
                        </div>

                        {/* Experience Section */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Experience</h4>
                          <div className="text-sm text-muted-foreground">
                            {job.experience ? `• ${job.experience}` : "• Not specified"}
                          </div>
                        </div>

                        {/* Education Section */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Education</h4>
                          <div className="text-sm text-muted-foreground">
                            {job.education ? `• ${job.education}` : "• Not specified"}
                          </div>
                        </div>

                        {/* Job Info Section */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Job Info</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Posted {formatDate(job.posted_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{job.positions} position(s) available</span>
                            </div>
                            {job.deadline && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Application Closing On {new Date(job.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Benefits Section */}
                      {job.benefits && job.benefits !== "Not specified" && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">Benefits & Perks</h4>
                          <p className="text-sm text-muted-foreground">{job.benefits}</p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <Badge variant="outline">{job.department}</Badge>
                        <div className="flex gap-2">
                          <Button variant="outline">Learn More</Button>

                          <Dialog open={isDialogOpen && selectedJob?.id === job.id} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button onClick={() => handleApplyClick(job)}>Apply Now</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                                <DialogDescription>
                                  Fill out the form below to apply for this position. We'll review your application and get back to you soon.
                                </DialogDescription>
                              </DialogHeader>

                              <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <label htmlFor="first_name" className="text-sm font-medium">First Name *</label>
                                    <Input
                                      id="first_name"
                                      value={formData.first_name}
                                      onChange={(e) => handleInputChange('first_name', e.target.value)} 
                                      placeholder="John"
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label htmlFor="middle_name" className="text-sm font-medium">Middle Name</label>
                                    <Input
                                      id="middle_name"
                                      value={formData.middle_name}
                                      onChange={(e) => handleInputChange('middle_name', e.target.value)}
                                      placeholder="Michael"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label htmlFor="last_name" className="text-sm font-medium">Last Name *</label>
                                    <Input
                                      id="last_name"
                                      value={formData.last_name}
                                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                                      placeholder="Doe"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email *</label>
                                    <Input
                                      id="email"
                                      type="email"
                                      value={formData.email}
                                      onChange={(e) => handleInputChange('email', e.target.value)}
                                      placeholder="john.doe@example.com"
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label htmlFor="mobile" className="text-sm font-medium">Mobile *</label>
                                    <Input
                                      id="mobile"
                                      value={formData.mobile}
                                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                                      placeholder="+1 (555) 123-4567"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label htmlFor="current_location" className="text-sm font-medium">Preferred Location *</label>
                                  <Input
                                    id="current_location"
                                    value={formData.current_location}
                                    onChange={(e) => handleInputChange('current_location', e.target.value)}
                                    placeholder="Surat, Mumbai"
                                    required
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label htmlFor="employment_type" className="text-sm font-medium">Employment Type *</label>
                                    <select
                                      id="employment_type"
                                      value={formData.employment_type}
                                      onChange={(e) => handleInputChange('employment_type', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                    >
                                      <option value="">Select employment type</option>
                                      <option value="full-time">Full Time</option>
                                      <option value="part-time">Part Time</option>
                                      <option value="contract">Contract</option>
                                      <option value="internship">Internship</option>
                                    </select>
                                  </div>

                                  <div className="space-y-2">
                                    <label htmlFor="experience" className="text-sm font-medium">Experience *</label>
                                    <Input
                                      id="experience"
                                      value={formData.experience}
                                      onChange={(e) => handleInputChange('experience', e.target.value)}
                                      placeholder="5 years"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label htmlFor="education" className="text-sm font-medium">Education *</label>
                                  <Input
                                    id="education"
                                    value={formData.education}
                                    onChange={(e) => handleInputChange('education', e.target.value)}
                                    placeholder="Bachelor's Degree in Computer Science"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label htmlFor="expected_salary" className="text-sm font-medium">Expected Salary *</label>
                                  <Input
                                    id="expected_salary"
                                    value={formData.expected_salary}
                                    onChange={(e) => handleInputChange('expected_salary', e.target.value)}
                                    placeholder="₹80,000 - ₹100,000"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label htmlFor="skills" className="text-sm font-medium">Skills *</label>
                                  <Input
                                    id="skills"
                                    value={formData.skills}
                                    onChange={(e) => handleInputChange('skills', e.target.value)}
                                    placeholder="JavaScript, React, Node.js, Python"
                                    required
                                  />
                                  <p className="text-xs text-muted-foreground">List your key skills separated by commas</p>
                                </div>

                                <div className="space-y-2">
                                  <label htmlFor="certifications" className="text-sm font-medium">Certifications</label>
                                  <Input
                                    id="certifications"
                                    value={formData.certifications}
                                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                                    placeholder="AWS Certified, PMP, Scrum Master"
                                  />
                                  <p className="text-xs text-muted-foreground">List any relevant certifications</p>
                                </div>

                                <div className="space-y-2">
                                  <label htmlFor="resume" className="text-sm font-medium">Resume *</label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      id="resume"
                                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                      onChange={handleFileChange}
                                      required
                                    />
                                    <Upload className="w-4 h-4" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {formData.resume
                                      ? `Selected: ${formData.resume.name} (${(formData.resume.size / 1024 / 1024).toFixed(2)} MB)`
                                      : "Upload your resume (PDF, DOC, DOCX, max 5MB) *"
                                    }
                                  </p>
                                </div>

                                <div className="flex justify-center space-x-4 sm:flex-row sm:justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
                                    {isSubmitting && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isSubmitting ? "Submitting..." : "Submit "}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            {filteredJobListings.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Jobs
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <ResumeUpload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CandidatePortal;