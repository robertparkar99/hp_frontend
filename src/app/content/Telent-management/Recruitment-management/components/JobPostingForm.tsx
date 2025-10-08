"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";

interface FormData {
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
}

interface Errors {
  title?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experienceRequired?: string;
  skillsRequired?: string;
  educationRequirement?: string;
  jobDescription?: string;
  salaryRangeMin?: string;
  salaryRangeMax?: string;
  numberOfPositions?: string;
  applicationDeadline?: string;
  urgency?: string;
}

interface JobPostingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobPostingForm = ({ open, onOpenChange }: JobPostingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    department: "",
    location: "",
    employmentType: "",
    experienceRequired: "",
    skillsRequired: "",
    educationRequirement: "",
    certifications: "",
    jobDescription: "",
    salaryRangeMin: "",
    salaryRangeMax: "",
    numberOfPositions: "1",
    applicationDeadline: "",
    urgency: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Job title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Job title must be less than 100 characters";
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Employment type validation
    if (!formData.employmentType) {
      newErrors.employmentType = "Employment type is required";
    }

    // Experience validation
    if (!formData.experienceRequired) {
      newErrors.experienceRequired = "Experience requirement is required";
    }

    // Skills validation
    if (!formData.skillsRequired.trim()) {
      newErrors.skillsRequired = "Skills are required";
    } else if (formData.skillsRequired.length < 10) {
      newErrors.skillsRequired = "Skills must be at least 10 characters";
    }

    // Education validation
    if (!formData.educationRequirement) {
      newErrors.educationRequirement = "Education requirement is required";
    }

    // Job description validation
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
    } else if (formData.jobDescription.length < 50) {
      newErrors.jobDescription = "Job description must be at least 50 characters";
    } else if (formData.jobDescription.length > 5000) {
      newErrors.jobDescription = "Job description must be less than 5000 characters";
    }

    // Salary validation
    if (!formData.salaryRangeMin.trim()) {
      newErrors.salaryRangeMin = "Minimum salary is required";
    } else if (isNaN(Number(formData.salaryRangeMin)) || Number(formData.salaryRangeMin) < 0) {
      newErrors.salaryRangeMin = "Minimum salary must be a valid number";
    }

    if (!formData.salaryRangeMax.trim()) {
      newErrors.salaryRangeMax = "Maximum salary is required";
    } else if (isNaN(Number(formData.salaryRangeMax)) || Number(formData.salaryRangeMax) < 0) {
      newErrors.salaryRangeMax = "Maximum salary must be a valid number";
    } else if (Number(formData.salaryRangeMin) > Number(formData.salaryRangeMax)) {
      newErrors.salaryRangeMax = "Maximum salary must be greater than minimum salary";
    }

    // Number of positions validation
    if (!formData.numberOfPositions.trim()) {
      newErrors.numberOfPositions = "Number of positions is required";
    } else if (isNaN(Number(formData.numberOfPositions)) || Number(formData.numberOfPositions) < 1) {
      newErrors.numberOfPositions = "Number of positions must be at least 1";
    }

    // Application deadline validation
    if (!formData.applicationDeadline.trim()) {
      newErrors.applicationDeadline = "Application deadline is required";
    } else {
      const selectedDate = new Date(formData.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today for comparison
      
      if (selectedDate < today) {
        newErrors.applicationDeadline = "Application deadline must be in the future";
      }
    }

    // Urgency validation
    if (!formData.urgency) {
      newErrors.urgency = "Priority level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Job Posting Data:", formData);
    
    toast({
      title: "Job Posted Successfully",
      description: `${formData.title} has been created and is now active.`,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    // Reset form
    setFormData({
      title: "",
      department: "",
      location: "",
      employmentType: "",
      experienceRequired: "",
      skillsRequired: "",
      educationRequirement: "",
      certifications: "",
      jobDescription: "",
      salaryRangeMin: "",
      salaryRangeMax: "",
      numberOfPositions: "1",
      applicationDeadline: "",
      urgency: "",
    });
    setErrors({});
  };

  const handleCancel = () => {
    onOpenChange(false);
    setErrors({});
  };

  // Get tomorrow's date for the min attribute (YYYY-MM-DD format)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new job posting. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Job Title {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Input 
                placeholder="e.g., Senior Full-Stack Developer" 
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm font-medium text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Department {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm font-medium text-destructive">{errors.department}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Location {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Input 
                placeholder="e.g., Remote, New York, NY" 
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-sm font-medium text-destructive">{errors.location}</p>
              )}
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Employment Type {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                <SelectTrigger className={errors.employmentType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentType && (
                <p className="text-sm font-medium text-destructive">{errors.employmentType}</p>
              )}
            </div>

            {/* Experience Required */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Experience Required {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Select value={formData.experienceRequired} onValueChange={(value) => handleInputChange('experienceRequired', value)}>
                <SelectTrigger className={errors.experienceRequired ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry Level (0-2 years)">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="Mid Level (3-5 years)">Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="Senior Level (6-10 years)">Senior Level (6-10 years)</SelectItem>
                  <SelectItem value="Lead Level (10+ years)">Lead Level (10+ years)</SelectItem>
                </SelectContent>
              </Select>
              {errors.experienceRequired && (
                <p className="text-sm font-medium text-destructive">{errors.experienceRequired}</p>
              )}
            </div>

            {/* Education Requirement */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Education Requirement {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Select value={formData.educationRequirement} onValueChange={(value) => handleInputChange('educationRequirement', value)}>
                <SelectTrigger className={errors.educationRequirement ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School Diploma">High School Diploma</SelectItem>
                  <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Not Required">Not Required</SelectItem>
                </SelectContent>
              </Select>
              {errors.educationRequirement && (
                <p className="text-sm font-medium text-destructive">{errors.educationRequirement}</p>
              )}
            </div>

            {/* Priority/Urgency */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Priority Level {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger className={errors.urgency ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              {errors.urgency && (
                <p className="text-sm font-medium text-destructive">{errors.urgency}</p>
              )}
            </div>

            {/* Number of Positions */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Number of Positions {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Input 
                type="number" 
                min="1" 
                placeholder="1" 
                value={formData.numberOfPositions}
                onChange={(e) => handleInputChange('numberOfPositions', e.target.value)}
                className={errors.numberOfPositions ? "border-red-500" : ""}
              />
              {errors.numberOfPositions && (
                <p className="text-sm font-medium text-destructive">{errors.numberOfPositions}</p>
              )}
            </div>

            {/* Salary Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Minimum Salary ($) {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Input 
                type="number" 
                placeholder="e.g., 80000" 
                value={formData.salaryRangeMin}
                onChange={(e) => handleInputChange('salaryRangeMin', e.target.value)}
                className={errors.salaryRangeMin ? "border-red-500" : ""}
              />
              {errors.salaryRangeMin && (
                <p className="text-sm font-medium text-destructive">{errors.salaryRangeMin}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Maximum Salary ($) {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Input 
                type="number" 
                placeholder="e.g., 120000" 
                value={formData.salaryRangeMax}
                onChange={(e) => handleInputChange('salaryRangeMax', e.target.value)}
                className={errors.salaryRangeMax ? "border-red-500" : ""}
              />
              {errors.salaryRangeMax && (
                <p className="text-sm font-medium text-destructive">{errors.salaryRangeMax}</p>
              )}
            </div>

            {/* Application Deadline */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Application Deadline {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  type="date"
                  min={getTomorrowDate()}
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  className={`pl-10 ${errors.applicationDeadline ? "border-red-500" : ""}`}
                />
              </div>
              {errors.applicationDeadline && (
                <p className="text-sm font-medium text-destructive">{errors.applicationDeadline}</p>
              )}
            </div>

            {/* Skills Required */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Required Skills {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Textarea 
                placeholder="e.g., React, TypeScript, Node.js, PostgreSQL, AWS (comma-separated)"
                className={`min-h-[80px] ${errors.skillsRequired ? "border-red-500" : ""}`}
                value={formData.skillsRequired}
                onChange={(e) => handleInputChange('skillsRequired', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                List all required skills, separated by commas
              </p>
              {errors.skillsRequired && (
                <p className="text-sm font-medium text-destructive">{errors.skillsRequired}</p>
              )}
            </div>

            {/* Certifications */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Preferred Certifications (Optional)
              </label>
              <Input 
                placeholder="e.g., AWS Certified, PMP, CPA (comma-separated)" 
                value={formData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                List any relevant certifications that would be beneficial
              </p>
            </div>

            {/* Job Description */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Job Description {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <Textarea 
                placeholder="Provide a detailed job description including responsibilities, requirements, and benefits..."
                className={`min-h-[150px] ${errors.jobDescription ? "border-red-500" : ""}`}
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Minimum 50 characters - Include responsibilities, qualifications, and what makes this role exciting
              </p>
              {errors.jobDescription && (
                <p className="text-sm font-medium text-destructive">{errors.jobDescription}</p>
              )}
            </div>
          </div>

         <DialogFooter className="flex justify-center space-x-4 sm:flex-row sm:justify-center">
  <Button 
    type="button" 
    variant="outline" 
    onClick={handleCancel}
    disabled={isSubmitting}
  >
    Cancel
  </Button>
  <Button 
    id="submit" 
    type="submit" 
    disabled={isSubmitting} 
    className="px-4 py-2 text-sm rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
  >
    {isSubmitting ? "Creating Job..." : "Submit"}
  </Button>
</DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingForm;