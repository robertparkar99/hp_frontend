"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  IndianRupee, 
  CalendarDays,
  Download,
  X,
  Building
} from "lucide-react";

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
}

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

interface ApplicationDetailsDialogProps {
  application: JobApplication | null;
  jobPostings: JobPosting[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadResume?: (application: JobApplication) => void;
}

const ApplicationDetailsDialog = ({
  application,
  jobPostings,
  open,
  onOpenChange,
  onDownloadResume
}: ApplicationDetailsDialogProps) => {
  if (!application) return null;

  // Find the job posting for this application
  const job = jobPostings.find(j => j.id === application.job_id);
  
  // Format the applicant's full name
  const fullName = `${application.first_name || ''} ${application.middle_name || ''} ${application.last_name || ''}`.trim();

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "shortlisted":
        return <Badge className="bg-blue-100 text-blue-800">Shortlisted</Badge>;
      case "interview_scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Interview Scheduled</Badge>;
      case "hired":
        return <Badge className="bg-purple-100 text-purple-800">Hired</Badge>;
      default:
        return <Badge variant="outline">{status || 'Pending'}</Badge>;
    }
  };

  const handleDownloadResume = () => {
    if (onDownloadResume && application.resume_path) {
      onDownloadResume(application);
    } else if (application.resume_path) {
      // Fallback: open resume in new tab if it's a URL
      window.open(application.resume_path, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Application Details
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Basic Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{fullName || 'Unknown Applicant'}</h2>
                  <p className="text-gray-600">{application.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {getStatusBadge(application.status)}
                    <span className="text-sm text-gray-500">
                      Applied on {formatDate(application.applied_date)}
                    </span>
                  </div>
                </div>
              </div>
              
              {application.resume_path && (
                <Button
                  onClick={handleDownloadResume}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resume</span>
                </Button>
              )}
            </div>
          </div>

          {/* Job Information */}
          {job && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Job Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.location}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employment Type:</span>
                    <span className="font-medium">{job.employment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Required:</span>
                    <span className="font-medium">{job.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Education:</span>
                    <span className="font-medium">{job.education}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{application.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-medium">{application.mobile || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Current Location</p>
                    <p className="font-medium">{application.current_location || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                Professional Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Employment Type</p>
                    <p className="font-medium">{application.employment_type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-medium">{application.experience}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Education</p>
                    <p className="font-medium">{application.education}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <IndianRupee className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Expected Salary</p>
                    <p className="font-medium">
                      {application.expected_salary ? `₹${application.expected_salary}` : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {application.skills && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {application.skills.split(',').map((skill, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {application.certifications && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{application.certifications}</p>
            </div>
          )}

          {/* Application Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Schedule Interview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsDialog;