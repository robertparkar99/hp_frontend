// import Navigation from "../Recruitment-management/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUpload from "../Recruitment-management/components/ResumeUpload";
import { 
  Search, 
  MapPin, 
  Building, 
  Clock, 
  DollarSign,
  Briefcase,
  Users,
  Calendar,
  Heart,
  Share2,
  Upload
} from "lucide-react";

const CandidatePortal = () => {
  const jobListings = [
    {
      id: 1,
      title: "Senior Full-Stack Developer",
      company: "TalentFlow Corp",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$120,000 - $160,000",
      posted: "2 days ago",
      applicants: 23,
      description: "We're looking for an experienced full-stack developer to join our growing engineering team...",
      requirements: ["5+ years experience", "React/Node.js", "Cloud platforms"],
      benefits: ["Health insurance", "401k matching", "Flexible PTO"]
    },
    {
      id: 2,
      title: "Product Manager",
      company: "TalentFlow Corp",
      department: "Product",
      location: "New York, NY",
      type: "Full-time",
      salary: "$140,000 - $180,000",
      posted: "5 days ago",
      applicants: 18,
      description: "Join our product team to drive strategy and execution for our core recruitment platform...",
      requirements: ["3+ years PM experience", "Technical background", "Agile methodology"],
      benefits: ["Equity package", "Health coverage", "Learning budget"]
    },
    {
      id: 3,
      title: "UX/UI Designer",
      company: "TalentFlow Corp",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$100,000 - $130,000",
      posted: "1 week ago",
      applicants: 31,
      description: "Create beautiful and intuitive user experiences for our recruitment management system...",
      requirements: ["4+ years design experience", "Figma proficiency", "Design systems"],
      benefits: ["Creative freedom", "Top-tier tools", "Conference budget"]
    },
    {
      id: 4,
      title: "Marketing Coordinator",
      company: "TalentFlow Corp",
      department: "Marketing",
      location: "Remote",
      type: "Contract",
      salary: "$60,000 - $75,000",
      posted: "3 days ago",
      applicants: 42,
      description: "Support our marketing initiatives with campaign management and content creation...",
      requirements: ["2+ years marketing", "Content creation", "Analytics tools"],
      benefits: ["Remote work", "Flexible hours", "Growth opportunities"]
    }
  ];

  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case "Full-time":
        return <Badge className="bg-success text-success-foreground">Full-time</Badge>;
      case "Contract":
        return <Badge variant="outline">Contract</Badge>;
      case "Part-time":
        return <Badge variant="secondary">Part-time</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Navigation /> */}
      
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
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search jobs by title, skills, or department..." 
                  className="pl-10"
                />
              </div>
              <Button className="btn-professional flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors">Search Jobs</Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-xs text-muted-foreground">Open Positions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-xs text-muted-foreground">Departments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-xs text-muted-foreground">Applications</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold">18</div>
                      <div className="text-xs text-muted-foreground">Days Avg Hire</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {jobListings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          {getJobTypeBadge(job.type)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
                          {job.benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Job Info</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Posted {job.posted}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{job.applicants} applicants</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{job.department}</Badge>
                      <div className="space-x-2">
                        <Button variant="outline">Learn More</Button>
                        <Button>Apply Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Jobs
              </Button>
            </div>
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