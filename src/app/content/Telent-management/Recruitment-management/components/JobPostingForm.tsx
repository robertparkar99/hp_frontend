"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { CalendarIcon, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddDialog from "@/components/jobroleComponent/addDialouge";

interface JobFormData {
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
  benefits?: string;
}

interface Department {
  id: string;
  department: string;
}

interface JobRole {
  id: string;
  jobrole: string;
  department: string;
  description?: string;
}

interface JobRoleSkill {
  id: string;
  SkillName: string;
  description: string;
  proficiency_level: string;
  category: string;
  sub_category: string;
  skill_id: string;
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

interface JobPostingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (result: any) => void;
  editingJob?: EditJobData | null;
}

const JobPostingForm = ({ open, onOpenChange, onSave, editingJob }: JobPostingFormProps) => {
   const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [jobRoleSkills, setJobRoleSkills] = useState<JobRoleSkill[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string>("");
  const [sessionData, setSessionData] = useState<any>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showAddJobRole, setShowAddJobRole] = useState(false);
  const [newJobRole, setNewJobRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);
  const [openJobroleModal, setOpenJobroleModal] = useState(false);
  const [roles, setRoles] = useState<JobRole[]>([]);

  const [jdAnalysis, setJdAnalysis] = useState<any>(null);


  const [formData, setFormData] = useState<JobFormData>({
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
    benefits: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Errors>({});

  // Handle opening AddDialog
  const handleAddNewJobRole = () => {
    // Close the job posting form and open the AddDialog
    onOpenChange(false);
    // setOpenJobroleModal(true);
     router.push("/content/Jobrole-library");
    
  };

  // Handle AddDialog close
  const handleAddDialogClose = () => {
    setOpenJobroleModal(false);
    // Re-open the job posting form when AddDialog is closed
    onOpenChange(true);
  };

  // Handle AddDialog success
  const handleAddDialogSuccess = () => {
    setOpenJobroleModal(false);
    fetchData();
    // Optionally re-open the job posting form after success
    onOpenChange(true);
  };

  const fetchData = async () => {
    if (!sessionData?.url || !sessionData?.subInstituteId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}`
      );
      const json = await res.json();

      let data: JobRole[] = [];
      if (Array.isArray(json)) {
        data = json;
      } else if (json?.data) {
        data = json.data;
      }

      setRoles(data);

      const uniqueDepts = Array.from(
        new Set(data.map((r) => r.department).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b));

      setDepartments([
        { id: "all", department: "All Departments" },
        ...uniqueDepts.map((dept, idx) => ({ id: String(idx), department: dept }))
      ]);
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for the min attribute
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Session data initialization
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setSessionData(parsed);
        if (parsed.org_type) {
          setIndustry(parsed.org_type);
        }
      } catch (err) {
        console.error("Failed to parse userData from localStorage:", err);
      }
    }
  }, []);

  // Fetch departments when dialog opens
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!sessionData || !sessionData.APP_URL || !sessionData.sub_institute_id || !sessionData.org_type) return;

      setLoadingDepartments(true);
      setError(null);

      try {
        const apiUrl = `${sessionData.APP_URL}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[industries]=${sessionData.org_type}&group_by=department&order_by[column]=department&order_by[direction]=asc`;
        console.log("Fetching departments from:", apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch departments: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("Departments response:", data);

        const transformedDepartments = Array.isArray(data)
          ? data.map((dept: any, index: number) => ({
            id: dept.id ? String(dept.id) : String(index + 1),
            department: dept.department
          }))
          : [];

        setDepartments(transformedDepartments);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching departments:", err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    if (open) {
      fetchDepartments();
    }
  }, [sessionData, open]);

  // Fetch job roles when department changes
  useEffect(() => {
    const fetchJobRoles = async () => {
      if (!formData.department || !sessionData || !sessionData.APP_URL || !sessionData.sub_institute_id) {
        setJobRoles([]);
        return;
      }

      setLoadingJobRoles(true);
      setError(null);

      try {
        const selectedDepartment = departments.find(dept => dept.id === formData.department);
        if (!selectedDepartment) {
          setJobRoles([]);
          return;
        }

        const apiUrl = `${sessionData.APP_URL}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[industries]=${sessionData.org_type}&filters[department]=${encodeURIComponent(selectedDepartment.department)}&group_by=jobrole&order_by[column]=jobrole&order_by[direction]=asc`;
        console.log("Fetching job roles from:", apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch job roles: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("Job roles response:", data);

        const transformedJobRoles = Array.isArray(data)
          ? data.map((role: any, index: number) => ({
            id: role.id ? String(role.id) : String(index + 1),
            jobrole: role.jobrole,
            department: role.department || selectedDepartment.department,
            description: role.description || ""
          }))
          : [];

        setJobRoles(transformedJobRoles);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching job roles:", err);
      } finally {
        setLoadingJobRoles(false);
      }
    };

    if (open && formData.department && departments.length > 0) {
      fetchJobRoles();
    }
  }, [formData.department, sessionData, open, departments]);

  // Add this useEffect to auto-fill job description when a job role is selected
  useEffect(() => {
    if (formData.title && jobRoles.length > 0 && !editingJob) {
      const selectedJobRole = jobRoles.find(role => role.id === formData.title);

      if (selectedJobRole?.description) {
        setFormData(prev => ({
          ...prev,
          jobDescription: selectedJobRole.description ?? ""
        }));
      }
    }
  }, [formData.title, jobRoles, editingJob]);

  // Fetch job role skills when job title changes
  useEffect(() => {
    const fetchJobRoleSkills = async () => {
      if (!formData.title || !sessionData || !sessionData.APP_URL || !sessionData.sub_institute_id) {
        setJobRoleSkills([]);
        return;
      }

      setLoadingSkills(true);
      setError(null);

      try {
        const selectedJobRole = jobRoles.find(role => role.id === formData.title);

        if (!selectedJobRole) {
          setJobRoleSkills([]);
          return;
        }

        const apiUrl = `${sessionData.APP_URL}/jobrole_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&org_type=${sessionData.org_type}&jobrole=${encodeURIComponent(selectedJobRole.jobrole)}&formType=skills`;
        console.log("Fetching job role skills from:", apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch job role skills: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("Job role skills response:", data);

        let transformedSkills: JobRoleSkill[] = [];

        if (data?.userskillData) {
          transformedSkills = Array.isArray(data.userskillData)
            ? data.userskillData.map((item: any) => ({
              id: item.id ? String(item.id) : String(Math.random()),
              SkillName:
                typeof item.skillTitle === "object" && item.skillTitle !== null
                  ? item.skillTitle.title || item.skillTitle.name || String(item.skillTitle)
                  : String(item.skillTitle || ""),
              description: String(item.description || item.skillDescription || ""),
              proficiency_level: String(item.proficiency_level) || "",
              category: String(item.category || ""),
              sub_category: String(item.sub_category || ""),
              skill_id: String(item.skill_id || ""),
            }))
            : [];
        }

        transformedSkills = transformedSkills.filter(skill => skill.SkillName && skill.SkillName.trim().length > 0);

        setJobRoleSkills(transformedSkills);

        // Auto-fill skills if available
        if (transformedSkills.length > 0 && !editingJob && selectedSkills.length === 0) {
          const skillsString = transformedSkills.map(skill => skill.SkillName).filter(skill => skill).join(", ");
          if (skillsString) {
            setFormData(prev => ({
              ...prev,
              skillsRequired: skillsString
            }));
            setSelectedSkills(skillsString.split(", ").filter(skill => skill.trim()));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching job role skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };

    if (open && formData.title && jobRoles.length > 0) {
      fetchJobRoleSkills();
    }
  }, [formData.title, sessionData, open, jobRoles, editingJob, selectedSkills]);

  // Reset form when editingJob changes or dialog opens/closes
  useEffect(() => {
    if (open && editingJob) {
      console.log("Editing job data:", editingJob);

      const initialFormData = {
        title: editingJob.title || "",
        department: editingJob.department || "",
        location: editingJob.location || "",
        employmentType: editingJob.employmentType || "",
        experienceRequired: editingJob.experienceRequired || "",
        skillsRequired: editingJob.skillsRequired || "",
        educationRequirement: editingJob.educationRequirement || "",
        certifications: editingJob.certifications || "",
        jobDescription: editingJob.jobDescription || "",
        salaryRangeMin: editingJob.salaryRangeMin || "",
        salaryRangeMax: editingJob.salaryRangeMax || "",
        numberOfPositions: editingJob.numberOfPositions || "1",
        applicationDeadline: editingJob.applicationDeadline || "",
        urgency: editingJob.urgency || "",
        benefits: editingJob.benefits || "",
        status: editingJob.status || "active",
      };

      console.log("Setting initial form data:", initialFormData);
      setFormData(initialFormData);

      if (editingJob.skillsRequired) {
        const skillsArray = editingJob.skillsRequired.split(",").map(skill => skill.trim()).filter(skill => skill);
        setSelectedSkills(skillsArray);
      }

    } else if (open && !editingJob) {
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
        benefits: "",
        status: "active",
      });
      setJobRoleSkills([]);
      setSelectedSkills([]);
      setShowAddJobRole(false);
      setNewJobRole("");
    }
    setErrors({});
  }, [open, editingJob]);

  // Handle department selection for editing job
  useEffect(() => {
    if (editingJob && open && departments.length > 0) {
      const matchingDepartment = departments.find(
        dept => dept.department === editingJob.department
      );

      if (matchingDepartment && formData.department !== matchingDepartment.id) {
        console.log("Setting department from editing job:", matchingDepartment.department, "ID:", matchingDepartment.id);
        setFormData(prev => ({
          ...prev,
          department: matchingDepartment.id
        }));
      } else if (!matchingDepartment && editingJob.department) {
        console.warn("No matching department found for:", editingJob.department);
      }
    }
  }, [editingJob, departments, open, formData.department]);

  // Handle job title selection for editing job after job roles are loaded
  useEffect(() => {
    if (editingJob && open && jobRoles.length > 0 && formData.department) {
      console.log("Looking for job role matching:", editingJob.title);
      console.log("Available job roles:", jobRoles);

      const matchingJobRole = jobRoles.find(
        role => role.jobrole === editingJob.title
      );

      if (matchingJobRole && formData.title !== matchingJobRole.id) {
        console.log("Found matching job role:", matchingJobRole.jobrole, "ID:", matchingJobRole.id);
        console.log("Setting job title from editing job:", matchingJobRole.jobrole);
        setFormData(prev => ({
          ...prev,
          title: matchingJobRole.id
        }));
      } else if (!matchingJobRole) {
        console.warn("No matching job role found for:", editingJob.title);
      }
    }
  }, [editingJob, jobRoles, open, formData.department, formData.title]);

  // Handle skill selection
  const handleSkillSelect = (skillName: string) => {
    if (!selectedSkills.includes(skillName)) {
      const newSelectedSkills = [...selectedSkills, skillName];
      setSelectedSkills(newSelectedSkills);
      setFormData(prev => ({
        ...prev,
        skillsRequired: newSelectedSkills.join(", ")
      }));
    }
  };

  // Handle skill removal
  const handleSkillRemove = (skillToRemove: string) => {
    const newSelectedSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSelectedSkills);
    setFormData(prev => ({
      ...prev,
      skillsRequired: newSelectedSkills.join(", ")
    }));
  };

  // Get department name for display
  const getSelectedDepartmentName = () => {
    if (!formData.department) return "";
    const selectedDept = departments.find(dept => dept.id === formData.department);
    return selectedDept ? selectedDept.department : "";
  };

  // Get job role name for display
  const getSelectedJobRoleName = () => {
    if (!formData.title) return "";

    const selectedRole = jobRoles.find(role => role.id === formData.title);
    if (selectedRole) {
      return selectedRole.jobrole;
    }

    return formData.title;
  };

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
    if (selectedSkills.length === 0) {
      newErrors.skillsRequired = "At least one skill is required";
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
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.applicationDeadline = "Application deadline must be in the future";
      }
    }

    // Urgency validation
    if (!formData.urgency) {
      newErrors.urgency = "Priority level is required";
    }

    // Benefits validation
    if (!formData.benefits.trim()) {
      newErrors.benefits = "Benefits are required";
    } else if (formData.benefits.length < 10) {
      newErrors.benefits = "Benefits must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof JobFormData, value: string) => {
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

    // Reset skills when department or title changes
    if (field === 'department' || field === 'title') {
      setSelectedSkills([]);
      setFormData(prev => ({
        ...prev,
        skillsRequired: ""
      }));
    }
  };

  // Build form data for API submission
  const buildFormData = (): FormData => {
    const formDataToSend = new FormData();

    // Add session data
    formDataToSend.append("type", "API");
    formDataToSend.append("token", sessionData?.token || "");
    formDataToSend.append("sub_institute_id", sessionData?.sub_institute_id || "");

    // Add form fields
    formDataToSend.append("department_id", formData.department);
    formDataToSend.append("user_id", sessionData?.user_id || "");
    formDataToSend.append("location", formData.location);
    formDataToSend.append("employment_type", formData.employmentType);

    // Use the selected job role as title
    let jobTitle = formData.title;
    const selectedJobRole = jobRoles.find(role => role.id === formData.title);
    if (selectedJobRole) {
      jobTitle = selectedJobRole.jobrole;
    }
    formDataToSend.append("title", jobTitle);

    formDataToSend.append("experience", formData.experienceRequired);
    formDataToSend.append("education", formData.educationRequirement);
    formDataToSend.append("priority_level", formData.urgency);
    formDataToSend.append("positions", formData.numberOfPositions);
    formDataToSend.append("min_salary", formData.salaryRangeMin);
    formDataToSend.append("max_salary", formData.salaryRangeMax);
    formDataToSend.append("deadline", formData.applicationDeadline);
    formDataToSend.append("skills", formData.skillsRequired);
    formDataToSend.append("certifications", formData.certifications);
    formDataToSend.append("benefits", formData.benefits);
    formDataToSend.append("description", formData.jobDescription);
    formDataToSend.append("status", formData.status);

    // For new records
    if (!editingJob) {
      formDataToSend.append("created_by", sessionData?.user_id || "1");
      formDataToSend.append("updated_at", "");
      formDataToSend.append("skip_updated_at", "true");
    } else {
      // For updates
      formDataToSend.append("updated_by", sessionData?.user_id || "1");
    }

    return formDataToSend;
  };

  // Debug: log all formData
  const logFormData = (formDataToSend: FormData) => {
    console.log("📦 FormData Preview:");
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }
  };



  const analyzeJobDescription = async (jdText: string) => {
    const res = await fetch("/api/analyzeJD", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jd: jdText,
        sub_institute_id: sessionData.sub_institute_id,
      }),
    });

    if (!res.ok) {
      throw new Error("JD analysis failed");
    }

    return await res.json();
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

    if (!sessionData) {
      toast({
        title: "Error",
        description: "Session data not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {

      const jdAnalysisResult = await analyzeJobDescription(formData.jobDescription);

      console.log("✅ JD Analysis Result:", jdAnalysisResult);
      setJdAnalysis(jdAnalysisResult);


      const formDataToSend = buildFormData();

      let apiUrl, method;

      if (editingJob) {
        console.log("Editing job with ID:", editingJob.id);
        apiUrl = `${sessionData.APP_URL}/api/job-postings/${editingJob.id}`;
        method = "POST";
        formDataToSend.append("_method", "PUT");
      } else {
        apiUrl = `${sessionData.APP_URL}/api/job-postings`;
        method = "POST";
      }

      logFormData(formDataToSend);

      console.log("Submitting to API:", apiUrl);
      console.log("Method:", method);
      console.log("Department ID being sent:", formData.department);
      console.log("Job Title being sent:", formData.title);

      const res = await fetch(apiUrl, {
        method: method,
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to ${editingJob ? 'update' : 'create'} job posting: ${res.status} - ${errorText}`);
      }

      const result = await res.json();

      toast({
        title: editingJob ? "Job Updated Successfully" : "Job Posted Successfully",
        description: `${formData.title} has been ${editingJob ? 'updated' : 'created and is now active'}.`,
      });

      if (onSave) onSave(result);
      onOpenChange(false);

      // Reset form only for new job creation
      if (!editingJob) {
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
          benefits: "",
          status: "active",
        });
        setErrors({});
        setJobRoleSkills([]);
        setSelectedSkills([]);
        setShowAddJobRole(false);
        setNewJobRole("");
      }

    } catch (err) {
      console.error("❌ Error creating job posting:", err);

      let errorMessage = `Failed to ${editingJob ? 'update' : 'create'} job posting`;

      if (err instanceof Error) {
        if (err.message.includes('No talent records found for this department')) {
          errorMessage = "Department validation failed. The selected department doesn't have any talent records. Please contact support.";
        } else if (err.message.includes('404')) {
          errorMessage = "API endpoint not found. Please check if the job posting exists.";
        } else {
          errorMessage = err.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };





  const handleCancel = () => {
    onOpenChange(false);
    setErrors({});
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? `Edit Job Posting: ${editingJob.title}` : "Create New Job Posting"}
            </DialogTitle>
            <DialogDescription>
              {editingJob
                ? "Update the job posting details below."
                : "Fill in the details to create a new job posting. All fields marked with * are required."
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Department {" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                </label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department">
                      {formData.department ? getSelectedDepartmentName() : "Select department"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDepartments ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : departments.length > 0 ? (
                      departments.map((dept: Department) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.department}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-departments" disabled>
                        No departments available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm font-medium text-destructive">{errors.department}</p>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Job Title {" "}
                    <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                  </label>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewJobRole}
                    disabled={!formData.department}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add New
                  </Button>
                </div>

                {showAddJobRole ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new job role name"
                        value={newJobRole}
                        onChange={(e) => setNewJobRole(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add a new job role to the selected department
                    </p>
                  </div>
                ) : (
                  <>
                    <Select
                      value={formData.title}
                      onValueChange={(value) => handleInputChange('title', value)}
                      disabled={!formData.department || loadingJobRoles}
                    >
                      <SelectTrigger className={errors.title ? "border-red-500" : ""}>
                        <SelectValue placeholder={loadingJobRoles ? "Loading job titles..." : "Select job title"}>
                          {formData.title ? getSelectedJobRoleName() : "Select job title"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {loadingJobRoles ? (
                          <SelectItem value="loading" disabled>
                            Loading job titles...
                          </SelectItem>
                        ) : jobRoles.length > 0 ? (
                          jobRoles.map((role: JobRole) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.jobrole}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-roles" disabled>
                            {formData.department ? "No job titles available for this department" : "Select a department first"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.title && (
                      <p className="text-sm font-medium text-destructive">{errors.title}</p>
                    )}
                    {!formData.department && (
                      <p className="text-sm text-muted-foreground">
                        Please select a department first to see available job titles
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Location {" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                </label>
                <Input
                  placeholder="e.g., Surat, Mumbai"
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
                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                    <SelectItem value="Part-Time">Part-Time</SelectItem>
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

              {/* Status (only show when editing) */}
              {editingJob && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Status {" "}
                    <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                  </label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Skills Required */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Required Skills {" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                </label>

                {/* Selected Skills Display as Tags */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 border rounded-md bg-gray-50">
                    {selectedSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Skills Dropdown */}
                <div className="relative">
                  <select
                    multiple
                    value={[]}
                    onChange={(e) => {
                      const selectedOption = e.target.options[e.target.selectedIndex];
                      if (selectedOption.value) {
                        handleSkillSelect(selectedOption.value);
                      }
                      e.target.value = "";
                    }}
                    className={`w-full min-h-[100px] p-2 border rounded-md bg-white ${errors.skillsRequired ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="" disabled>
                      {loadingSkills
                        ? "Loading skills..."
                        : jobRoleSkills.length > 0
                          ? "Select skills from the list below"
                          : formData.title
                            ? "No skills found for this job role"
                            : "Select a job title first"
                      }
                    </option>
                    {jobRoleSkills.map((skill) => (
                      <option
                        key={skill.id}
                        value={skill.SkillName}
                        disabled={selectedSkills.includes(skill.SkillName)}
                        className={`p-2 hover:bg-blue-50 ${selectedSkills.includes(skill.SkillName) ? 'bg-gray-100 text-gray-400' : ''
                          }`}
                      >
                        {skill.SkillName}
                        {selectedSkills.includes(skill.SkillName) ? ' (selected)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Selected count indicator */}
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {selectedSkills.length} selected
                    </span>
                  </div>
                </div>

                {/* Helper text */}
                <p className="text-sm text-muted-foreground">
                  Click on skills to select them. Selected skills will appear as tags above.
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

              {/* Benefits */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Benefits {" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                </label>
                <Textarea
                  placeholder="e.g., Health insurance, Remote work, Flexible hours, Professional development"
                  className={`min-h-[80px] ${errors.benefits ? "border-red-500" : ""}`}
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  List the benefits and perks offered with this position
                </p>
                {errors.benefits && (
                  <p className="text-sm font-medium text-destructive">{errors.benefits}</p>
                )}
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
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Minimum 50 characters - Include responsibilities, qualifications, and what makes this role exciting
                  </p>
                </div>
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
                {isSubmitting
                  ? (editingJob ? "Updating Job..." : "Creating Job...")
                  : (editingJob ? "Update Job" : "Submit")
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


    </>
  );
};

export default JobPostingForm;