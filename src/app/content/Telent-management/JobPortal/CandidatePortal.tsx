// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import ResumeUpload from "../Recruitment-management/components/ResumeUpload";
// import { 
//   Search, 
//   MapPin, 
//   Building, 
//   Clock, 
//   IndianRupee,
//   Briefcase,
//   Users,
//   Calendar,
//   Heart,
//   Share2,
//   Upload,
//   Loader2
// } from "lucide-react";
// import { useState, useEffect } from "react";

// interface JobPosting {
//   id: number;
//   title: string;
//   company: string;
//   department_id: number;
//   department: string;
//   location: string;
//   employment_type: string;
//   min_salary: string;
//   max_salary: string;
//   salary_range: string;
//   posted_date: string;
//   applicants_count: number;
//   positions: number;
//   description: string;
//   requirements: string[];
//   benefits: string;
//   skills: string;
//   certifications: string;
//   experience: string;
//   education: string;
//   status: string;
//   deadline: string;
//   created_at: string;
// }

// interface Department {
//   id: number;
//   industries: string;
//   department: string;
//   sub_department: string;
// }

// interface ApiResponse {
//   data?: JobPosting[];
//   job_postings?: JobPosting[];
//   jobs?: JobPosting[];
//   success?: boolean;
//   message?: string;
// }

// interface DepartmentApiResponse {
//   data?: Department[];
//   departments?: Department[];
//   success?: boolean;
//   message?: string;
// }

// interface ApplicationResponse {
//   status: number;
//   message: string;
//   data?: any;
// }

// const CandidatePortal = () => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
//   const [sessionData, setSessionData] = useState<any>(null);
//   const [jobListings, setJobListings] = useState<JobPosting[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
  
//   const [formData, setFormData] = useState({
//     first_name: "",
//     middle_name: "",
//     last_name: "",
//     email: "",
//     mobile: "",
//     current_location: "",
//     employment_type: "",
//     experience: "",
//     education: "",
//     expected_salary: "",
//     skills: "",
//     certifications: "",
//     resume: null as File | null
//   });

//   // Fetch departments from API
//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         const userData = localStorage.getItem("userData");
//         let parsedData = null;
        
//         if (userData) {
//           try {
//             parsedData = JSON.parse(userData);
//             setSessionData(parsedData);
//           } catch (err) {
//             console.error("Failed to parse userData from localStorage:", err);
//           }
//         }

//         const departmentsUrl = parsedData 
//           ? `${parsedData.APP_URL}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${parsedData.sub_institute_id}&group_by=department&order_by[column]=department&order_by[direction]=asc`
//           : "http://127.0.0.1:8000/table_data?table=s_user_jobrole&filters[sub_institute_id]=3&group_by=department&order_by[column]=department&order_by[direction]=asc";

//         console.log("Fetching departments from:", departmentsUrl);
        
//         const response = await fetch(departmentsUrl);
        
//         if (!response.ok) {
//           throw new Error(`Failed to fetch departments: ${response.status}`);
//         }

//         const result: DepartmentApiResponse = await response.json();
//         console.log("Departments API Response:", result);
        
//         let departmentData: Department[] = [];
        
//         if (Array.isArray(result)) {
//           departmentData = result;
//         } else if (Array.isArray(result.data)) {
//           departmentData = result.data;
//         } else if (Array.isArray(result.departments)) {
//           departmentData = result.departments;
//         } else {
//           console.warn("Unexpected departments API response format:", result);
//         }
        
//         setDepartments(departmentData);
        
//       } catch (err) {
//         console.error("Error fetching departments:", err);
//         // Continue even if departments fail to load
//       }
//     };

//     fetchDepartments();
//   }, []);

//   // Fetch job postings from API
//   useEffect(() => {
//     const fetchJobPostings = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const userData = localStorage.getItem("userData");
//         let parsedData = null;
        
//         if (userData) {
//           try {
//             parsedData = JSON.parse(userData);
//             setSessionData(parsedData);
//           } catch (err) {
//             console.error("Failed to parse userData from localStorage:", err);
//           }
//         }

//         // Use provided API URL or fallback to local storage data
//         const apiUrl = parsedData 
//           ? `${parsedData.APP_URL}/api/job-postings?type=API&token=${parsedData.token}&sub_institute_id=${parsedData.sub_institute_id}`
//           : "http://127.0.0.1:8000/api/job-postings?type=API&token=1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5&sub_institute_id=1";

//         console.log("Fetching job postings from:", apiUrl);
        
//         const response = await fetch(apiUrl);
        
//         if (!response.ok) {
//           throw new Error(`Failed to fetch job postings: ${response.status}`);
//         }

//         const result: ApiResponse = await response.json();
//         console.log("Job Postings API Response:", result);
        
//         // Handle different possible response structures
//         let jobData: JobPosting[] = [];
        
//         if (Array.isArray(result)) {
//           jobData = result;
//         } else if (Array.isArray(result.data)) {
//           jobData = result.data;
//         } else if (Array.isArray(result.job_postings)) {
//           jobData = result.job_postings;
//         } else if (Array.isArray(result.jobs)) {
//           jobData = result.jobs;
//         } else {
//           console.warn("Unexpected API response format:", result);
//           setError("No job postings found in the response.");
//         }
        
//         // Filter only active jobs and ensure each job has the required properties with fallbacks
//         const processedJobs = jobData
//           .filter(job => job.status === 'active') // Only show active jobs
//           .map(job => {
//             // Find department name by matching department_id
//             const departmentInfo = departments.find(dept => dept.id === job.department_id);
//             const departmentName = departmentInfo ? departmentInfo.department : `Department ${job.department_id}`;

//             // Format salary range
//             const salaryRange = job.min_salary && job.max_salary 
//               ? `₹${parseInt(job.min_salary).toLocaleString()} - ₹${parseInt(job.max_salary).toLocaleString()}`
//               : "Competitive Salary";

//             // Format requirements from skills and experience
//             const requirements = [];
//             if (job.skills) requirements.push(...job.skills.split(',').map(skill => skill.trim()));
//             if (job.experience) requirements.push(job.experience);
//             if (job.education) requirements.push(job.education);

//             // Format benefits
//             const benefitsList = job.benefits ? [job.benefits] : ["Not specified"];

//             return {
//               id: job.id || 0,
//               title: job.title || "Untitled Position",
//               company: "Your Company", // You might want to add company field to your API
//               department_id: job.department_id || 0,
//               department: departmentName,
//               location: job.location || "Remote",
//               employment_type: job.employment_type || "Full-time",
//               min_salary: job.min_salary || "0",
//               max_salary: job.max_salary || "0",
//               salary_range: salaryRange,
//               posted_date: job.created_at || new Date().toISOString(),
//               applicants_count: 0, // You might want to add this to your API
//               positions: job.positions || 1,
//               description: job.description || "No description available.",
//               requirements: requirements.length > 0 ? requirements : ["Not specified"],
//               benefits: job.benefits || "Not specified",
//               benefitsList: benefitsList,
//               skills: job.skills || "",
//               certifications: job.certifications || "",
//               experience: job.experience || "",
//               education: job.education || "",
//               status: job.status || "active",
//               deadline: job.deadline || ""
//             };
//           });
        
//         setJobListings(processedJobs);
        
//       } catch (err) {
//         console.error("Error fetching job postings:", err);
//         setError("Failed to load job postings. Please try again later.");
//         setJobListings([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Only fetch job postings after departments are loaded
//     if (departments.length > 0 || loading) {
//       fetchJobPostings();
//     }
//   }, [departments]);

//   // Filter job listings based on search term
//   const filteredJobListings = jobListings.filter(job =>
//     job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     job.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (Array.isArray(job.requirements) && job.requirements.some(req => 
//       req.toLowerCase().includes(searchTerm.toLowerCase())
//     ))
//   );

//   const getJobTypeBadge = (type: string) => {
//     switch (type) {
//       case "Full-time":
//         return <Badge className="bg-green-100 text-green-800">Full-time</Badge>;
//       case "Contract":
//         return <Badge variant="outline">Contract</Badge>;
//       case "Part-time":
//         return <Badge variant="secondary">Part-time</Badge>;
//       case "Internship":
//         return <Badge className="bg-blue-100 text-blue-800">Internship</Badge>;
//       default:
//         return <Badge variant="secondary">{type}</Badge>;
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "active":
//         return <Badge className="bg-green-100 text-green-800">Active</Badge>;
//       case "inactive":
//         return <Badge variant="secondary">Inactive</Badge>;
//       case "draft":
//         return <Badge variant="outline">Draft</Badge>;
//       case "closed":
//         return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) {
//         return "Recently";
//       }
//       const now = new Date();
//       const diffTime = Math.abs(now.getTime() - date.getTime());
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
//       if (diffDays === 1) return "1 day ago";
//       if (diffDays < 7) return `${diffDays} days ago`;
//       if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
//       return `${Math.ceil(diffDays / 30)} months ago`;
//     } catch {
//       return "Recently";
//     }
//   };

//   const handleApplyClick = (job: JobPosting) => {
//     setSelectedJob(job);
//     setIsDialogOpen(true);
//     setFormData({
//       first_name: "",
//       middle_name: "",
//       last_name: "",
//       email: "",
//       mobile: "",
//       current_location: "",
//       employment_type: "",
//       experience: "",
//       education: "",
//       expected_salary: "",
//       skills: "",
//       certifications: "",
//       resume: null
//     });
//   };

//   const handleInputChange = (field: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0] || null;
//     setFormData(prev => ({
//       ...prev,
//       resume: file
//     }));
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!selectedJob) return;

//     setIsSubmitting(true);
    
//     try {
//       const submitData = new FormData();
      
//       // Add all form fields to FormData
//       Object.keys(formData).forEach(key => {
//         if (key === 'resume' && formData.resume) {
//           submitData.append('resume', formData.resume);
//         } else {
//           submitData.append(key, (formData as any)[key] || '');
//         }
//       });

//       // Add additional required parameters - use only 'active' status
//       submitData.append('job_id', selectedJob.id.toString());
//       submitData.append('applied_date', new Date().toISOString().split('T')[0]);
//       submitData.append('status', 'active'); // Use only 'active' status
//       submitData.append('user_id', '1');

//       // API endpoint
//       const apiUrl = sessionData 
//         ? `${sessionData.APP_URL}/api/job-applications?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`
//         : "http://127.0.0.1:8000/api/job-applications?type=API&token=1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5&sub_institute_id=1";

//       console.log("Submitting application to:", apiUrl);
      
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         body: submitData,
//       });

//       const result: ApplicationResponse = await response.json();
//       console.log("Application submission response:", result);

//       if (!response.ok || result.status === 0) {
//         throw new Error(result.message || 'Failed to submit application');
//       }

//       // Success
//       alert(`Application submitted successfully for ${selectedJob.title}!`);
//       setIsDialogOpen(false);

//     } catch (error) {
//       console.error('Error submitting application:', error);
//       alert(`Failed to submit application. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-8 h-8 animate-spin" />
//           <p className="text-muted-foreground">Loading job opportunities...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-background rounded-xl flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-destructive mb-4">{error}</p>
//           <Button onClick={() => window.location.reload()}>Try Again</Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background rounded-xl">
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-4">Find Your Next Opportunity</h1>
//           <p className="text-muted-foreground mb-6">
//             Discover exciting career opportunities and join our growing team
//           </p>
//         </div>

//         <Tabs defaultValue="jobs" className="space-y-6">
//           <TabsList className="bg-[#EFF4FF]">
//             <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
//             <TabsTrigger value="upload">Upload Resume</TabsTrigger>
//           </TabsList>

//           <TabsContent value="jobs" className="space-y-6">
//             {/* Search Bar */}
//             <div className="flex flex-col sm:flex-row gap-4 mb-6">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//                 <Input 
//                   placeholder="Search jobs by title, skills, or department..." 
//                   className="pl-10"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <Button className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors">
//                 Search Jobs
//               </Button>
//             </div>

//             {/* Job Count */}
//             <div className="text-sm text-muted-foreground">
//               Showing {filteredJobListings.length} active job{filteredJobListings.length !== 1 ? 's' : ''}
//             </div>

//             {/* Quick Stats and Job Listings */}
//             <div className="space-y-6">
//               {filteredJobListings.length === 0 ? (
//                 <Card>
//                   <CardContent className="py-8 text-center">
//                     <p className="text-muted-foreground">
//                       {jobListings.length === 0 ? "No active job postings available at the moment." : "No active jobs found matching your criteria."}
//                     </p>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 filteredJobListings.map((job) => (
//                   <Card key={job.id} className="hover:shadow-lg transition-shadow">
//                     <CardHeader>
//                       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
//                         <div className="flex-1">
//                           <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
//                             <CardTitle className="text-xl">{job.title}</CardTitle>
//                             <div className="flex flex-wrap gap-2">
//                               {getJobTypeBadge(job.employment_type)}
//                               {getStatusBadge(job.status)}
//                             </div>
//                           </div>
//                           <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
//                             <div className="flex items-center gap-1">
//                               <Building className="w-4 h-4" />
//                               <span>{job.company}</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <MapPin className="w-4 h-4" />
//                               <span>{job.location}</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <IndianRupee className="w-4 h-4" />
//                               <span>{job.salary_range}</span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Button variant="outline" size="sm">
//                             <Heart className="w-4 h-4" />
//                           </Button>
//                           <Button variant="outline" size="sm">
//                             <Share2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </CardHeader>
                    
//                     <CardContent>
//                       <p className="text-muted-foreground mb-4">{job.description}</p>
                      
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                         <div>
//                           <h4 className="font-semibold text-sm mb-2">Requirements</h4>
//                           <ul className="text-sm text-muted-foreground space-y-1">
//                             {job.requirements.map((req, index) => (
//                               <li key={index}>• {req}</li>
//                             ))}
//                           </ul>
//                         </div>
                        
//                         <div>
//                           <h4 className="font-semibold text-sm mb-2">Benefits</h4>
//                           <ul className="text-sm text-muted-foreground space-y-1">
//                             {(job as any).benefitsList.map((benefit: string, index: number) => (
//                               <li key={index}>• {benefit}</li>
//                             ))}
//                           </ul>
//                         </div>
                        
//                         <div>
//                           <h4 className="font-semibold text-sm mb-2">Job Info</h4>
//                           <div className="text-sm text-muted-foreground space-y-1">
//                             <div className="flex items-center gap-1">
//                               <Clock className="w-3 h-3" />
//                               <span>Posted {formatDate(job.posted_date)}</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Users className="w-3 h-3" />
//                               <span>{job.positions} position(s) available</span>
//                             </div>
//                             {job.deadline && (
//                               <div className="flex items-center gap-1">
//                                 <Calendar className="w-3 h-3" />
//                                 <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                         <Badge variant="outline">{job.department}</Badge>
//                         <div className="flex gap-2">
//                           <Button variant="outline">Learn More</Button>
                          
//                           <Dialog open={isDialogOpen && selectedJob?.id === job.id} onOpenChange={setIsDialogOpen}>
//                             <DialogTrigger asChild>
//                               <Button onClick={() => handleApplyClick(job)}>Apply Now</Button>
//                             </DialogTrigger>
//                             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//                               <DialogHeader>
//                                 <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
//                                 <DialogDescription>
//                                   Fill out the form below to apply for this position. We'll review your application and get back to you soon.
//                                 </DialogDescription>
//                               </DialogHeader>
                              
//                               <form onSubmit={handleSubmit} className="space-y-6">
//                                 {/* Form content remains the same */}
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                   <div className="space-y-2">
//                                     <label htmlFor="first_name" className="text-sm font-medium">First Name *</label>
//                                     <Input
//                                       id="first_name"
//                                       value={formData.first_name}
//                                       onChange={(e) => handleInputChange('first_name', e.target.value)}
//                                       placeholder="John"
//                                       required
//                                     />
//                                   </div>

//                                   <div className="space-y-2">
//                                     <label htmlFor="middle_name" className="text-sm font-medium">Middle Name</label>
//                                     <Input
//                                       id="middle_name"
//                                       value={formData.middle_name}
//                                       onChange={(e) => handleInputChange('middle_name', e.target.value)}
//                                       placeholder="Michael"
//                                     />
//                                   </div>

//                                   <div className="space-y-2">
//                                     <label htmlFor="last_name" className="text-sm font-medium">Last Name *</label>
//                                     <Input
//                                       id="last_name"
//                                       value={formData.last_name}
//                                       onChange={(e) => handleInputChange('last_name', e.target.value)}
//                                       placeholder="Doe"
//                                       required
//                                     />
//                                   </div>
//                                 </div>
//                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                   <label htmlFor="email" className="text-sm font-medium">Email *</label>
//                                   <Input
//                                     id="email"
//                                     type="email"
//                                     value={formData.email}
//                                     onChange={(e) => handleInputChange('email', e.target.value)}
//                                     placeholder="john.doe@example.com"
//                                     required
//                                   />
//                                 </div>

//                                 <div className="space-y-2">
//                                   <label htmlFor="mobile" className="text-sm font-medium">Mobile *</label>
//                                   <Input
//                                     id="mobile"
//                                     value={formData.mobile}
//                                     onChange={(e) => handleInputChange('mobile', e.target.value)}
//                                     placeholder="+1 (555) 123-4567"
//                                     required
//                                   />
//                                 </div>
//                               </div>

//                               <div className="space-y-2">
//                                 <label htmlFor="current_location" className="text-sm font-medium">Current Location *</label>
//                                 <Input
//                                   id="current_location"
//                                   value={formData.current_location}
//                                   onChange={(e) => handleInputChange('current_location', e.target.value)}
//                                   placeholder="New York, NY"
//                                   required
//                                 />
//                               </div>

//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                   <label htmlFor="employment_type" className="text-sm font-medium">Employment Type *</label>
//                                   <select
//                                     id="employment_type"
//                                     value={formData.employment_type}
//                                     onChange={(e) => handleInputChange('employment_type', e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     required
//                                   >
//                                     <option value="">Select employment type</option>
//                                     <option value="full-time">Full Time</option>
//                                     <option value="part-time">Part Time</option>
//                                     <option value="contract">Contract</option>
//                                     <option value="internship">Internship</option>
//                                   </select>
//                                 </div>

//                                 <div className="space-y-2">
//                                   <label htmlFor="experience" className="text-sm font-medium">Experience *</label>
//                                   <Input
//                                     id="experience"
//                                     value={formData.experience}
//                                     onChange={(e) => handleInputChange('experience', e.target.value)}
//                                     placeholder="5 years"
//                                     required
//                                   />
//                                 </div>
//                               </div>

//                               <div className="space-y-2">
//                                 <label htmlFor="education" className="text-sm font-medium">Education *</label>
//                                 <Input
//                                   id="education"
//                                   value={formData.education}
//                                   onChange={(e) => handleInputChange('education', e.target.value)}
//                                   placeholder="Bachelor's Degree in Computer Science"
//                                   required
//                                 />
//                               </div>

//                               <div className="space-y-2">
//                                 <label htmlFor="expected_salary" className="text-sm font-medium">Expected Salary *</label>
//                                 <Input
//                                   id="expected_salary"
//                                   value={formData.expected_salary}
//                                   onChange={(e) => handleInputChange('expected_salary', e.target.value)}
//                                   placeholder="₹80,000 - ₹100,000"
//                                   required
//                                 />
//                               </div>

//                               <div className="space-y-2">
//                                 <label htmlFor="skills" className="text-sm font-medium">Skills *</label>
//                                 <Input
//                                   id="skills"
//                                   value={formData.skills}
//                                   onChange={(e) => handleInputChange('skills', e.target.value)}
//                                   placeholder="JavaScript, React, Node.js, Python"
//                                   required
//                                 />
//                                 <p className="text-xs text-muted-foreground">List your key skills separated by commas</p>
//                               </div>

//                               <div className="space-y-2">
//                                 <label htmlFor="certifications" className="text-sm font-medium">Certifications</label>
//                                 <Input
//                                   id="certifications"
//                                   value={formData.certifications}
//                                   onChange={(e) => handleInputChange('certifications', e.target.value)}
//                                   placeholder="AWS Certified, PMP, Scrum Master"
//                                 />
//                                 <p className="text-xs text-muted-foreground">List any relevant certifications</p>
//                               </div>

//                               <div className="space-y-2">
//                                 <label htmlFor="resume" className="text-sm font-medium">Resume</label>
//                                 <div className="flex items-center gap-2">
//                                   <Input 
//                                     type="file" 
//                                     id="resume"
//                                     accept=".pdf,.doc,.docx" 
//                                     onChange={handleFileChange}
//                                   />
//                                   <Upload className="w-4 h-4" />
//                                 </div>
//                                 <p className="text-xs text-muted-foreground">Upload your resume (PDF, DOC, DOCX)</p>
//                               </div>


//                                 {/* Rest of the form remains the same */}
//                                 <div className="flex justify-end gap-4 pt-4">
//                                   <Button 
//                                     type="button" 
//                                     variant="outline" 
//                                     onClick={() => setIsDialogOpen(false)}
//                                     disabled={isSubmitting}
//                                   >
//                                     Cancel
//                                   </Button>
//                                   <Button type="submit" disabled={isSubmitting}>
//                                     {isSubmitting && (
//                                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     )}
//                                     {isSubmitting ? "Submitting..." : "Submit Application"}
//                                   </Button>
//                                 </div>
//                               </form>
//                             </DialogContent>
//                           </Dialog>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))
//               )}
//             </div>

//             {/* Load More */}
//             {filteredJobListings.length > 0 && (
//               <div className="text-center mt-8">
//                 <Button variant="outline" size="lg">
//                   Load More Jobs
//                 </Button>
//               </div>
//             )}
//           </TabsContent>

//           <TabsContent value="upload">
//             <ResumeUpload />
//           </TabsContent>
//         </Tabs>
//       </main>
//     </div>
//   );
// };

// export default CandidatePortal;

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

// Form data interface matching the JobPostingForm structure
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

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsUrl = sessionData 
          ? `${sessionData.APP_URL}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&group_by=department&order_by[column]=department&order_by[direction]=asc`
          : "http://127.0.0.1:8000/table_data?table=s_user_jobrole&filters[sub_institute_id]=3&group_by=department&order_by[column]=department&order_by[direction]=asc";

        console.log("Fetching departments from:", departmentsUrl);
        
        const response = await fetch(departmentsUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch departments: ${response.status}`);
        }

        const result: DepartmentApiResponse = await response.json();
        console.log("Departments API Response:", result);
        
        let departmentData: Department[] = [];
        
        if (Array.isArray(result)) {
          departmentData = result;
        } else if (Array.isArray(result.data)) {
          departmentData = result.data;
        } else if (Array.isArray(result.departments)) {
          departmentData = result.departments;
        } else {
          console.warn("Unexpected departments API response format:", result);
        }
        
        setDepartments(departmentData);
        
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    if (sessionData) {
      fetchDepartments();
    }
  }, [sessionData]);

  // Fetch job postings from API
  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use provided API URL or fallback to local storage data
        const apiUrl = sessionData 
          ? `${sessionData.APP_URL}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`
          : "http://127.0.0.1:8000/api/job-postings?type=API&token=1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5&sub_institute_id=1";

        console.log("Fetching job postings from:", apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch job postings: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        console.log("Job Postings API Response:", result);
        
        // Handle different possible response structures
        let jobData: JobPosting[] = [];
        
        if (Array.isArray(result)) {
          jobData = result;
        } else if (Array.isArray(result.data)) {
          jobData = result.data;
        } else if (Array.isArray(result.job_postings)) {
          jobData = result.job_postings;
        } else if (Array.isArray(result.jobs)) {
          jobData = result.jobs;
        } else {
          console.warn("Unexpected API response format:", result);
          setError("No job postings found in the response.");
        }
        
        // Filter only active jobs and ensure each job has the required properties with fallbacks
        const processedJobs = jobData
          .filter(job => job.status === 'active')
          .map(job => {
            const departmentInfo = departments.find(dept => dept.id === job.department_id);
            const departmentName = departmentInfo ? departmentInfo.department : `Department ${job.department_id}`;

            const salaryRange = job.min_salary && job.max_salary 
              ? `₹${parseInt(job.min_salary).toLocaleString()} - ₹${parseInt(job.max_salary).toLocaleString()}`
              : "Competitive Salary";

            const requirements = [];
            if (job.skills) requirements.push(...job.skills.split(',').map(skill => skill.trim()));
            if (job.experience) requirements.push(job.experience);
            if (job.education) requirements.push(job.education);

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
        
        setJobListings(processedJobs);
        
      } catch (err) {
        console.error("Error fetching job postings:", err);
        setError("Failed to load job postings. Please try again later.");
        setJobListings([]);
      } finally {
        setLoading(false);
      }
    };

    if (sessionData) {
      fetchJobPostings();
    }
  }, [sessionData, departments]);

  // Filter job listings based on search term
  const filteredJobListings = jobListings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(job.requirements) && job.requirements.some(req => 
      req.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

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
    
    // Reset form but keep pre-filled user data
    setFormData(prev => ({
      ...prev,
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
    }));
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
  };

  // Build form data for API submission - similar to JobPostingForm approach
  const buildFormData = (): FormData => {
    const formDataToSend = new FormData();

    // Add session data if available
    if (sessionData) {
      formDataToSend.append("type", "API");
      formDataToSend.append("token", sessionData.token || "");
      formDataToSend.append("sub_institute_id", sessionData.sub_institute_id || "");
      formDataToSend.append("user_id", sessionData.user_id || "");
    }

    // Add job application data
    if (selectedJob) {
      formDataToSend.append("job_id", selectedJob.id.toString());
      formDataToSend.append("job_title", selectedJob.title);
      formDataToSend.append("department_id", selectedJob.department_id.toString());
    }

    // Add all form fields
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
    
    // Add optional fields if they have values
    if (formData.cover_letter) formDataToSend.append("cover_letter", formData.cover_letter);
    if (formData.portfolio_url) formDataToSend.append("portfolio_url", formData.portfolio_url);
    if (formData.linkedin_url) formDataToSend.append("linkedin_url", formData.linkedin_url);
    if (formData.notice_period) formDataToSend.append("notice_period", formData.notice_period);
    if (formData.current_company) formDataToSend.append("current_company", formData.current_company);
    if (formData.current_role) formDataToSend.append("current_role", formData.current_role);

    // Add file if present
    if (formData.resume) {
      formDataToSend.append("resume", formData.resume);
    }

    // Add metadata
    formDataToSend.append("applied_date", new Date().toISOString().split('T')[0]);
    formDataToSend.append("status", "active");
    formDataToSend.append("application_source", "candidate_portal");

    return formDataToSend;
  };

  // Form validation
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  };

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
      const formDataToSend = buildFormData();
      
      // Debug: log form data
      console.log("📦 Application FormData Preview:");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // API endpoint
      const apiUrl = `${sessionData.APP_URL}/api/job-applications`
    

      console.log("Submitting application to:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
      });

      const result: ApplicationResponse = await response.json();
      console.log("Application submission response:", result);

      if (!response.ok || result.status === 0) {
        throw new Error(result.message || 'Failed to submit application');
      }

      // Success
      const successMessage = `✅ Application submitted successfully for ${selectedJob.title}!`;
      alert(successMessage);
      setIsDialogOpen(false);

    } catch (error) {
      console.error('Error submitting application:', error);
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
          <TabsList className="bg-[#EFF4FF]">
            <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
            <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          </TabsList>

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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Requirements</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {job.requirements.map((req, index) => (
                              <li key={index}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Benefits</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {(job as any).benefitsList.map((benefit: string, index: number) => (
                              <li key={index}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
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
                                <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
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
                                  <label htmlFor="current_location" className="text-sm font-medium">Current Location *</label>
                                  <Input
                                    id="current_location"
                                    value={formData.current_location}
                                    onChange={(e) => handleInputChange('current_location', e.target.value)}
                                    placeholder="New York, NY"
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
                                  <label htmlFor="resume" className="text-sm font-medium">Resume</label>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type="file" 
                                      id="resume"
                                      accept=".pdf,.doc,.docx" 
                                      onChange={handleFileChange}
                                    />
                                    <Upload className="w-4 h-4" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">Upload your resume (PDF, DOC, DOCX)</p>
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
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