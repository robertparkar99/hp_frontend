
// "use client";
// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import CandidateScreening from "./components/CandidateScreening";
// import JobPostingForm from "./components/JobPostingForm";
// import { 
//   Plus, 
//   Search, 
//   Filter, 
//   Eye, 
//   Edit, 
//   Users, 
//   Calendar,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   Target,
//   ChevronDown,
//   Menu
// } from "lucide-react";

// interface JobPosting {
//   id: number;
//   title: string;
//   department_id: number;
//   location: string;
//   employment_type: string;
//   experience: string;
//   education: string;
//   priority_level: string;
//   positions: number;
//   min_salary: string;
//   max_salary: string;
//   deadline: string;
//   skills: string;
//   certifications: string;
//   benefits: string;
//   description: string;
//   status: string;
//   sub_institute_id: number;
//   created_by: number;
//   updated_by: number;
//   deleted_by: number | null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
// }

// interface Application {
//   id: number;
//   name: string;
//   position: string;
//   status: string;
//   appliedDate: string;
//   experience: string;
//   score: number;
// }

// interface EditJobData {
//   id: number;
//   title: string;
//   department: string;
//   location: string;
//   employmentType: string;
//   experienceRequired: string;
//   skillsRequired: string;
//   educationRequirement: string;
//   certifications: string;
//   jobDescription: string;
//   salaryRangeMin: string;
//   salaryRangeMax: string;
//   numberOfPositions: string;
//   applicationDeadline: string;
//   urgency: string;
//   benefits: string;
//   status: string;
// }

// const HRDashboard = () => {
//   const [isJobFormOpen, setIsJobFormOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sessionData, setSessionData] = useState<any>(null);
//   const [editingJob, setEditingJob] = useState<EditJobData | null>(null);

//   // Fetch session data from localStorage
//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       try {
//         const parsed = JSON.parse(userData);
//         setSessionData(parsed);
//       } catch (err) {
//         console.error("Failed to parse userData from localStorage:", err);
//       }
//     }
//   }, []);

//   // Fetch job postings from API
//   const fetchJobPostings = async () => {
//     if (!sessionData) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const apiUrl = `${sessionData.APP_URL}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`;
//       console.log("Fetching job postings from:", apiUrl);

//       const response = await fetch(apiUrl, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         throw new Error(`Failed to fetch job postings: ${response.status} - ${text}`);
//       }

//       const result = await response.json();
//       console.log("Job postings response:", result);
      
//       if (result.data && Array.isArray(result.data)) {
//         setJobPostings(result.data);
//       } else {
//         setJobPostings([]);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : String(err));
//       console.error("Error fetching job postings:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch job postings when session data is available
//   useEffect(() => {
//     if (sessionData) {
//       fetchJobPostings();
//     }
//   }, [sessionData]);

//   // Refresh job postings when job form is closed
//   useEffect(() => {
//     if (!isJobFormOpen && sessionData) {
//       fetchJobPostings();
//       setEditingJob(null);
//     }
//   }, [isJobFormOpen, sessionData]);

//   // Handle edit job
//   const handleEditJob = (job: JobPosting) => {
//     const editJobData: EditJobData = {
//       id: job.id,
//       title: job.title,
//       department: job.department_id.toString(),
//       location: job.location,
//       employmentType: job.employment_type,
//       experienceRequired: job.experience,
//       skillsRequired: job.skills,
//       educationRequirement: job.education,
//       certifications: job.certifications || "",
//       jobDescription: job.description,
//       salaryRangeMin: job.min_salary,
//       salaryRangeMax: job.max_salary,
//       numberOfPositions: job.positions.toString(),
//       applicationDeadline: job.deadline,
//       urgency: job.priority_level,
//       benefits: job.benefits,
//       status: job.status
//     };

//     setEditingJob(editJobData);
//     setIsJobFormOpen(true);
//   };

//   // Handle form save
//   const handleFormSave = (result: any) => {
//     fetchJobPostings();
//     setEditingJob(null);
//   };

//   // Static data for other sections
//   const recentApplications: Application[] = [
//     {
//       id: 1,
//       name: "Sarah Johnson",
//       position: "Senior Full-Stack Developer",
//       status: "Interview Scheduled",
//       appliedDate: "2024-01-18",
//       experience: "5 years",
//       score: 92
//     },
//     {
//       id: 2,
//       name: "Michael Chen",
//       position: "Product Manager",
//       status: "Under Review",
//       appliedDate: "2024-01-17",
//       experience: "7 years",
//       score: 88
//     },
//     {
//       id: 3,
//       name: "Emily Rodriguez",
//       position: "Senior Full-Stack Developer",
//       status: "Shortlisted",
//       appliedDate: "2024-01-16",
//       experience: "6 years",
//       score: 85
//     }
//   ];

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "active":
//         return <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>;
//       case "draft":
//         return <Badge variant="secondary" className="text-xs">Draft</Badge>;
//       case "Interview Scheduled":
//         return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Interview</Badge>;
//       case "Under Review":
//         return <Badge variant="outline" className="text-xs">Review</Badge>;
//       case "Shortlisted":
//         return <Badge className="bg-blue-100 text-blue-800 text-xs">Shortlisted</Badge>;
//       default:
//         return <Badge variant="secondary" className="text-xs">{status}</Badge>;
//     }
//   };

//   const getUrgencyColor = (priority_level: string) => {
//     switch (priority_level) {
//       case "High":
//         return "text-red-600";
//       case "Medium":
//         return "text-yellow-600";
//       case "Low":
//         return "text-gray-500";
//       default:
//         return "text-gray-500";
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getApplicationsCount = (jobId: number) => {
//     return Math.floor(Math.random() * 50);
//   };

//   if (loading && !jobPostings.length) {
//     return (
//       <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading job postings...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error && !jobPostings.length) {
//     return (
//       <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <Button onClick={fetchJobPostings}>Try Again</Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background rounded-xl ">
//       {/* Mobile Header */}
//       <div className="lg:hidden bg-white border-b border-gray-200 p-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">HR Dashboard</h1>
//             <p className="text-sm text-gray-600">Manage job postings</p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <Button 
//               onClick={() => {
//                 setEditingJob(null);
//                 setIsJobFormOpen(true);
//               }} 
//               className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
//               size="sm"
//             >
//               <Plus className="w-4 h-4" />
//             </Button>
//             <Button 
//               variant="outline" 
//               size="sm"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="p-2"
//             >
//               <Menu className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
//         {/* Desktop Header */}
//         <div className="hidden lg:flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">HR Dashboard</h1>
//             <p className="text-gray-600 text-sm lg:text-base">Manage job postings and track candidates</p>
//           </div>
//           <Button 
//             onClick={() => {
//               setEditingJob(null);
//               setIsJobFormOpen(true);
//             }} 
//             className="l flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             <span className="hidden sm:inline">Create New Job</span>
//           </Button>
//         </div>

//         <Tabs defaultValue="jobs" className="space-y-4 lg:space-y-6">
//           {/* Mobile Tabs Dropdown */}
//           <div className="lg:hidden">
//             <select 
//               className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
//               onChange={(e) => {
//                 const tabValue = e.target.value;
//                 (document.querySelector(`[data-value="${tabValue}"]`) as HTMLElement | null)?.click();
//               }}
//             >
//               <option value="jobs">Job Postings</option>
//               <option value="screening">Resume Screening</option>
//               <option value="applications">Applications</option>
//               <option value="analytics">Analytics</option>
//             </select>
//           </div>

//           {/* Desktop Tabs */}
//           <TabsList className="hidden lg:flex bg-blue-50 p-1">
//             <TabsTrigger value="jobs" className="flex-1 data-[state=active]:bg-white">Job Postings</TabsTrigger>
//             <TabsTrigger value="screening" className="flex-1 data-[state=active]:bg-white">Resume Screening</TabsTrigger>
//             <TabsTrigger value="applications" className="flex-1 data-[state=active]:bg-white">Applications</TabsTrigger>
//             <TabsTrigger value="analytics" className="flex-1 data-[state=active]:bg-white">Analytics</TabsTrigger>
//           </TabsList>

//           <TabsContent value="jobs" className="space-y-4 lg:space-y-6">
//             <Card className="border border-gray-200 shadow-sm">
//               <CardHeader className="pb-3">
//                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
//                   <CardTitle className="text-lg lg:text-xl">
//                     Active Job Postings {jobPostings.length > 0 && `(${jobPostings.length})`}
//                   </CardTitle>
//                   <div className="flex space-x-2">
//                     <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-sm">
//                       <Search className="w-4 h-4 mr-2" />
//                       <span className="hidden xs:inline">Search</span>
//                     </Button>
//                     <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-sm">
//                       <Filter className="w-4 h-4 mr-2" />
//                       <span className="hidden xs:inline">Filter</span>
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 {jobPostings.length === 0 ? (
//                   <div className="text-center py-8">
//                     <div className="text-gray-400 mb-4">
//                       <Target className="h-12 w-12 mx-auto" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Postings</h3>
//                     <p className="text-gray-600 mb-4">Get started by creating your first job posting.</p>
//                     <Button onClick={() => setIsJobFormOpen(true)}>
//                       <Plus className="w-4 h-4 mr-2" />
//                       Create Job Posting
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {jobPostings.map((job) => (
//                       <div key={job.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg bg-white">
//                         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
//                           <div className="flex-1">
//                             <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
//                               <div className="flex-1 min-w-0">
//                                 <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
//                                   {job.title}
//                                 </h3>
//                                 <p className="text-xs lg:text-sm text-gray-600 truncate">
//                                   {job.employment_type} • {job.location}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                   Experience: {job.experience} • Education: {job.education}
//                                 </p>
//                               </div>
//                               <div className="flex flex-wrap gap-2">
//                                 {getStatusBadge(job.status)}
//                                 <span className={`text-xs font-medium ${getUrgencyColor(job.priority_level)}`}>
//                                   {job.priority_level}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex items-center justify-between lg:justify-end lg:space-x-6">
//                             <div className="flex items-center space-x-4 lg:space-x-6">
//                               <div className="text-center">
//                                 <div className="text-lg lg:text-xl font-bold text-blue-400">
//                                   {job.positions}
//                                 </div>
//                                 <div className="text-xs text-gray-500">Opnings</div>
//                               </div>
//                               <div className="text-center">
//                                 <div className="text-lg lg:text-xl font-bold text-blue-400">
//                                   {getApplicationsCount(job.id)}
//                                 </div>
//                                 <div className="text-xs text-gray-500">Apps</div>
//                               </div>
//                               <div className="text-center hidden sm:block">
//                                 <div className="text-sm font-medium">{formatDate(job.created_at)}</div>
//                                 <div className="text-xs text-gray-500">Posted</div>
//                               </div>
//                             </div>
//                             <div className="flex space-x-2">
//                               <Button variant="outline" size="sm" className="p-2">
//                                 <Eye className="w-4 h-4" />
//                               </Button>
//                               <Button 
//                                 variant="outline" 
//                                 size="sm" 
//                                 className="p-2"
//                                 onClick={() => handleEditJob(job)}
//                               >
//                                 <Edit className="w-4 h-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="screening">
//             <CandidateScreening />
//           </TabsContent>

//           <TabsContent value="applications" className="space-y-4 lg:space-y-6">
//             <Card className="border border-gray-200 shadow-sm">
//               <CardHeader>
//                 <CardTitle className="text-lg lg:text-xl">Recent Applications</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {recentApplications.map((application) => (
//                     <div key={application.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg bg-white">
//                       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                             <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
//                               {application.name}
//                             </h3>
//                             <p className="text-xs lg:text-sm text-gray-600 truncate">
//                               Applied for {application.position}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between lg:justify-end lg:space-x-6">
//                           <div className="flex items-center space-x-4 lg:space-x-6">
//                             <div className="text-center">
//                               <div className="text-lg font-bold text-blue-400">{application.score}</div>
//                               <div className="text-xs text-gray-500">Score</div>
//                             </div>
//                             <div className="text-center hidden sm:block">
//                               <div className="text-sm font-medium">{application.experience}</div>
//                               <div className="text-xs text-gray-500">Exp</div>
//                             </div>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             {getStatusBadge(application.status)}
//                             <Button variant="outline" size="sm" className="text-sm">
//                               <Eye className="w-4 h-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="analytics" className="space-y-4 lg:space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
//               <Card className="border border-gray-200 shadow-sm">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
//                   <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
//                   <Users className="h-4 w-4 text-gray-500" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-xl lg:text-2xl font-bold">156</div>
//                   <p className="text-xs text-green-600">+12% from last month</p>
//                 </CardContent>
//               </Card>

//               <Card className="border border-gray-200 shadow-sm">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
//                   <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
//                   <Calendar className="h-4 w-4 text-gray-500" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-xl lg:text-2xl font-bold">23</div>
//                   <p className="text-xs text-gray-600">This week</p>
//                 </CardContent>
//               </Card>

//               <Card className="border border-gray-200 shadow-sm">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
//                   <CardTitle className="text-sm font-medium">Offers Sent</CardTitle>
//                   <CheckCircle className="h-4 w-4 text-gray-500" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-xl lg:text-2xl font-bold">8</div>
//                   <p className="text-xs text-green-600">+2 from last week</p>
//                 </CardContent>
//               </Card>
//             </div>

//             <Card className="border border-gray-200 shadow-sm">
//               <CardHeader>
//                 <CardTitle className="text-lg lg:text-xl">Hiring Pipeline Overview</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {[
//                     { label: "Applications Received", value: 156, percentage: 100, color: "bg-blue-600" },
//                     { label: "Initial Screening", value: 89, percentage: 57, color: "bg-blue-500" },
//                     { label: "Interviews", value: 23, percentage: 15, color: "bg-blue-400" },
//                     { label: "Offers", value: 8, percentage: 5, color: "bg-green-500" }
//                   ].map((stage, index) => (
//                     <div key={index} className="space-y-2">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm font-medium text-gray-700">{stage.label}</span>
//                         <span className="text-lg lg:text-xl font-bold text-gray-900">{stage.value}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div 
//                           className={`${stage.color} h-2 rounded-full transition-all duration-500`} 
//                           style={{ width: `${stage.percentage}%` }}
//                         ></div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </main>

//       <JobPostingForm 
//         open={isJobFormOpen} 
//         onOpenChange={setIsJobFormOpen} 
//         onSave={handleFormSave}
//         editingJob={editingJob}
//       />
//     </div>
//   );
// };

// export default HRDashboard;

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CandidateScreening from "./components/CandidateScreening";
import JobPostingForm from "./components/JobPostingForm";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  ChevronDown,
  Menu,
  MapPin,
  Briefcase,
  GraduationCap,
  IndianRupee,
  CalendarDays,
  User,
  Building
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

interface Application {
  id: number;
  name: string;
  position: string;
  status: string;
  appliedDate: string;
  experience: string;
  score: number;
}

interface EditJobData {
  id: number;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceRequired: string;
  skillsRequired: string;
  educationRequirement: string;
  certifications: string;
  jobDescription: string;
  salaryRangeMin: string;
  salaryRangeMax: string;
  numberOfPositions: string;
  applicationDeadline: string;
  urgency: string;
  benefits: string;
  status: string;
}

interface JobDetailsDialogProps {
  job: JobPosting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobDetailsDialog = ({ job, open, onOpenChange }: JobDetailsDialogProps) => {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">{job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Employment Type</p>
                <p className="font-medium">{job.employment_type}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">{job.experience}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Education</p>
                <p className="font-medium">{job.education}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <IndianRupee  className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Salary Range</p>
                <p className="font-medium">₹{job.min_salary} - ₹{job.max_salary}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CalendarDays className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              {job.status === "active" ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : job.status === "draft" ? (
                <Badge variant="secondary">Draft</Badge>
              ) : (
                <Badge variant="outline">{job.status}</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Priority:</span>
              <span className={`font-medium ${
                job.priority_level === "High" ? "text-red-600" :
                job.priority_level === "Medium" ? "text-yellow-600" : "text-gray-600"
              }`}>
                {job.priority_level}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Positions:</span>
              <span className="font-medium">{job.positions}</span>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Skills Required */}
          {job.skills && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.split(',').map((skill, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {job.certifications && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
              <p className="text-gray-700">{job.certifications}</p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
              </div>
            </div>
          )}

          {/* Meta Information */}
          {/* <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>Department ID:</strong> {job.department_id}</p>
                <p><strong>Sub Institute ID:</strong> {job.sub_institute_id}</p>
              </div>
              <div>
                <p><strong>Created:</strong> {new Date(job.created_at).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(job.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HRDashboard = () => {
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<EditJobData | null>(null);
  const [viewingJob, setViewingJob] = useState<JobPosting | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setSessionData(parsed);
      } catch (err) {
        console.error("Failed to parse userData from localStorage:", err);
      }
    }
  }, []);

  // Fetch job postings from API
  const fetchJobPostings = async () => {
    if (!sessionData) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${sessionData.APP_URL}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`;
      console.log("Fetching job postings from:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch job postings: ${response.status} - ${text}`);
      }

      const result = await response.json();
      console.log("Job postings response:", result);
      
      if (result.data && Array.isArray(result.data)) {
        setJobPostings(result.data);
      } else {
        setJobPostings([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching job postings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch job postings when session data is available
  useEffect(() => {
    if (sessionData) {
      fetchJobPostings();
    }
  }, [sessionData]);

  // Refresh job postings when job form is closed
  useEffect(() => {
    if (!isJobFormOpen && sessionData) {
      fetchJobPostings();
      setEditingJob(null);
    }
  }, [isJobFormOpen, sessionData]);

  // Handle edit job
  const handleEditJob = (job: JobPosting) => {
    const editJobData: EditJobData = {
      id: job.id,
      title: job.title,
      department: job.department_id.toString(),
      location: job.location,
      employmentType: job.employment_type,
      experienceRequired: job.experience,
      skillsRequired: job.skills,
      educationRequirement: job.education,
      certifications: job.certifications || "",
      jobDescription: job.description,
      salaryRangeMin: job.min_salary,
      salaryRangeMax: job.max_salary,
      numberOfPositions: job.positions.toString(),
      applicationDeadline: job.deadline,
      urgency: job.priority_level,
      benefits: job.benefits,
      status: job.status
    };

    setEditingJob(editJobData);
    setIsJobFormOpen(true);
  };

  // Handle view job
  const handleViewJob = (job: JobPosting) => {
    setViewingJob(job);
    setIsViewDialogOpen(true);
  };

  // Handle form save
  const handleFormSave = (result: any) => {
    fetchJobPostings();
    setEditingJob(null);
  };

  // Static data for other sections
  const recentApplications: Application[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Full-Stack Developer",
      status: "Interview Scheduled",
      appliedDate: "2024-01-18",
      experience: "5 years",
      score: 92
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Product Manager",
      status: "Under Review",
      appliedDate: "2024-01-17",
      experience: "7 years",
      score: 88
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Senior Full-Stack Developer",
      status: "Shortlisted",
      appliedDate: "2024-01-16",
      experience: "6 years",
      score: 85
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>;
      case "draft":
        return <Badge variant="secondary" className="text-xs">Draft</Badge>;
      case "Interview Scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Interview</Badge>;
      case "Under Review":
        return <Badge variant="outline" className="text-xs">Review</Badge>;
      case "Shortlisted":
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Shortlisted</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getUrgencyColor = (priority_level: string) => {
    switch (priority_level) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApplicationsCount = (jobId: number) => {
    return Math.floor(Math.random() * 50);
  };

  if (loading && !jobPostings.length) {
    return (
      <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job postings...</p>
        </div>
      </div>
    );
  }

  if (error && !jobPostings.length) {
    return (
      <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchJobPostings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-xl ">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-sm text-gray-600">Manage job postings</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => {
                setEditingJob(null);
                setIsJobFormOpen(true);
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage job postings and track candidates</p>
          </div>
          <Button 
            onClick={() => {
              setEditingJob(null);
              setIsJobFormOpen(true);
            }} 
            className="l flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create New Job</span>
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="space-y-4 lg:space-y-6">
          {/* Mobile Tabs Dropdown */}
          <div className="lg:hidden">
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
              onChange={(e) => {
                const tabValue = e.target.value;
                (document.querySelector(`[data-value="${tabValue}"]`) as HTMLElement | null)?.click();
              }}
            >
              <option value="jobs">Job Postings</option>
              <option value="screening">Resume Screening</option>
              <option value="applications">Applications</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>

          {/* Desktop Tabs */}
          <TabsList className="hidden lg:flex bg-blue-50 p-1">
            <TabsTrigger value="jobs" className="flex-1 data-[state=active]:bg-white">Job Postings</TabsTrigger>
            <TabsTrigger value="screening" className="flex-1 data-[state=active]:bg-white">Resume Screening</TabsTrigger>
            <TabsTrigger value="applications" className="flex-1 data-[state=active]:bg-white">Applications</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 data-[state=active]:bg-white">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4 lg:space-y-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <CardTitle className="text-lg lg:text-xl">
                    Active Job Postings {jobPostings.length > 0 && `(${jobPostings.length})`}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-sm">
                      <Search className="w-4 h-4 mr-2" />
                      <span className="hidden xs:inline">Search</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-sm">
                      <Filter className="w-4 h-4 mr-2" />
                      <span className="hidden xs:inline">Filter</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {jobPostings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <Target className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Postings</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first job posting.</p>
                    <Button onClick={() => setIsJobFormOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Job Posting
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobPostings.map((job) => (
                      <div key={job.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                                  {job.title}
                                </h3>
                                <p className="text-xs lg:text-sm text-gray-600 truncate">
                                  {job.employment_type} • {job.location}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Experience: {job.experience} • Education: {job.education}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {getStatusBadge(job.status)}
                                <span className={`text-xs font-medium ${getUrgencyColor(job.priority_level)}`}>
                                  {job.priority_level}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between lg:justify-end lg:space-x-6">
                            <div className="flex items-center space-x-4 lg:space-x-6">
                              <div className="text-center">
                                <div className="text-lg lg:text-xl font-bold text-blue-400">
                                  {job.positions}
                                </div>
                                <div className="text-xs text-gray-500">Openings</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg lg:text-xl font-bold text-blue-400">
                                  {getApplicationsCount(job.id)}
                                </div>
                                <div className="text-xs text-gray-500">Apps</div>
                              </div>
                              <div className="text-center hidden sm:block">
                                <div className="text-sm font-medium">{formatDate(job.created_at)}</div>
                                <div className="text-xs text-gray-500">Posted</div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="p-2"
                                onClick={() => handleViewJob(job)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="p-2"
                                onClick={() => handleEditJob(job)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="screening">
            <CandidateScreening />
          </TabsContent>

          <TabsContent value="applications" className="space-y-4 lg:space-y-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                              {application.name}
                            </h3>
                            <p className="text-xs lg:text-sm text-gray-600 truncate">
                              Applied for {application.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end lg:space-x-6">
                          <div className="flex items-center space-x-4 lg:space-x-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-400">{application.score}</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                            <div className="text-center hidden sm:block">
                              <div className="text-sm font-medium">{application.experience}</div>
                              <div className="text-xs text-gray-500">Exp</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(application.status)}
                            <Button variant="outline" size="sm" className="text-sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold">156</div>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                  <Calendar className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold">23</div>
                  <p className="text-xs text-gray-600">This week</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Offers Sent</CardTitle>
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold">8</div>
                  <p className="text-xs text-green-600">+2 from last week</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Hiring Pipeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Applications Received", value: 156, percentage: 100, color: "bg-blue-600" },
                    { label: "Initial Screening", value: 89, percentage: 57, color: "bg-blue-500" },
                    { label: "Interviews", value: 23, percentage: 15, color: "bg-blue-400" },
                    { label: "Offers", value: 8, percentage: 5, color: "bg-green-500" }
                  ].map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                        <span className="text-lg lg:text-xl font-bold text-gray-900">{stage.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${stage.color} h-2 rounded-full transition-all duration-500`} 
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <JobPostingForm 
        open={isJobFormOpen} 
        onOpenChange={setIsJobFormOpen} 
        onSave={handleFormSave}
        editingJob={editingJob}
      />

      <JobDetailsDialog 
        job={viewingJob}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  );
};

export default HRDashboard;