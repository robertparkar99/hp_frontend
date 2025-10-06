"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TrendingUp
} from "lucide-react";

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
  score: number;
  status: 'shortlisted' | 'rejected' | 'pending' | 'under_review';
  appliedDate: string;
  resumeUrl: string;
  matchDetails: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    locationMatch: number;
  };
}

const CandidateScreening = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const candidates: Candidate[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Full-Stack Developer",
      experience: "5+ years",
      education: "MS Computer Science",
      location: "New York, NY",
      skills: ["React", "Node.js", "TypeScript", "AWS", "MongoDB", "GraphQL"],
      score: 92,
      status: "shortlisted",
      appliedDate: "2024-01-18",
      resumeUrl: "/resumes/sarah-johnson.pdf",
      matchDetails: {
        skillsMatch: 95,
        experienceMatch: 90,
        educationMatch: 88,
        locationMatch: 100
      }
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      position: "Senior Full-Stack Developer",
      experience: "7+ years",
      education: "BS Computer Engineering",
      location: "San Francisco, CA",
      skills: ["Vue.js", "Python", "Docker", "PostgreSQL", "Redis"],
      score: 88,
      status: "under_review",
      appliedDate: "2024-01-17",
      resumeUrl: "/resumes/michael-chen.pdf",
      matchDetails: {
        skillsMatch: 85,
        experienceMatch: 95,
        educationMatch: 80,
        locationMatch: 85
      }
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 345-6789",
      position: "Senior Full-Stack Developer",
      experience: "4+ years",
      education: "BS Information Systems",
      location: "Austin, TX",
      skills: ["Angular", "Java", "Spring Boot", "MySQL", "Kubernetes"],
      score: 75,
      status: "pending",
      appliedDate: "2024-01-16",
      resumeUrl: "/resumes/emily-rodriguez.pdf",
      matchDetails: {
        skillsMatch: 70,
        experienceMatch: 75,
        educationMatch: 85,
        locationMatch: 70
      }
    },
    {
      id: "4",
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890",
      position: "Senior Full-Stack Developer",
      experience: "3+ years",
      education: "Bootcamp Graduate",
      location: "Seattle, WA",
      skills: ["React", "Express", "JavaScript", "MongoDB"],
      score: 58,
      status: "rejected",
      appliedDate: "2024-01-15",
      resumeUrl: "/resumes/david-kim.pdf",
      matchDetails: {
        skillsMatch: 60,
        experienceMatch: 50,
        educationMatch: 45,
        locationMatch: 75
      }
    }
  ];

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

  const getScoreBadge = (score: number) => {
    if (score >= 85) return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-warning text-warning-foreground">Good</Badge>;
    if (score >= 60) return <Badge variant="outline">Fair</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Poor</Badge>;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "shortlisted" && candidate.status === "shortlisted") ||
                      (selectedTab === "pending" && (candidate.status === "pending" || candidate.status === "under_review")) ||
                      (selectedTab === "rejected" && candidate.status === "rejected");
    
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
    pending: candidates.filter(c => c.status === 'pending' || c.status === 'under_review').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
    avgScore: Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
  };

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
          <div className="flex justify-between items-center">
            <CardTitle>Candidate Screening Results</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search candidates..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.id} className="border border-border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{candidate.name}</h3>
                            {getStatusBadge(candidate.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied for {candidate.position}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{candidate.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-3 h-3" />
                              <span>{candidate.experience}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GraduationCap className="w-3 h-3" />
                              <span>{candidate.education}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-bold text-primary">{candidate.score}%</span>
                        </div>
                        {getScoreBadge(candidate.score)}
                      </div>
                    </div>

                    {/* Match Details */}
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
                        <div className="text-lg font-semibold">{candidate.matchDetails.locationMatch}%</div>
                        <div className="text-xs text-muted-foreground">Location</div>
                      </div>
                    </div>

                    {/* Skills */}
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

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Applied {candidate.appliedDate}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                        <Button variant="outline" size="sm">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateScreening;