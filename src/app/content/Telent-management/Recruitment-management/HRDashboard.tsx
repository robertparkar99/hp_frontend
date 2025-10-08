"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Menu
} from "lucide-react";

const HRDashboard = () => {
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const activeJobs = [
    {
      id: 1,
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Remote",
      status: "Active",
      applications: 23,
      posted: "2024-01-15",
      urgency: "High"
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      status: "Active",
      applications: 18,
      posted: "2024-01-12",
      urgency: "Medium"
    },
    {
      id: 3,
      title: "UX/UI Designer",
      department: "Design",
      location: "San Francisco, CA",
      status: "Draft",
      applications: 0,
      posted: "2024-01-20",
      urgency: "Low"
    }
  ];

  const recentApplications = [
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
      case "Active":
        return <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>;
      case "Draft":
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
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
              onClick={() => setIsJobFormOpen(true)} 
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
            onClick={() => setIsJobFormOpen(true)} 
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
                  <CardTitle className="text-lg lg:text-xl">Active Job Postings</CardTitle>
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
                <div className="space-y-3">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="p-3 lg:p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                                {job.title}
                              </h3>
                              <p className="text-xs lg:text-sm text-gray-600 truncate">
                                {job.department} • {job.location}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(job.status)}
                              <span className={`text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                                {job.urgency}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end lg:space-x-6">
                          <div className="flex items-center space-x-4 lg:space-x-6">
                            <div className="text-center">
                              <div className="text-lg lg:text-xl font-bold text-blue-400">{job.applications}</div>
                              <div className="text-xs text-gray-500">Apps</div>
                            </div>
                            <div className="text-center hidden sm:block">
                              <div className="text-sm font-medium">{job.posted}</div>
                              <div className="text-xs text-gray-500">Posted</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="p-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="p-2">
                              <Edit className="w-4 h-4" />
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

      <JobPostingForm open={isJobFormOpen} onOpenChange={setIsJobFormOpen} />
    </div>
  );
};

export default HRDashboard;