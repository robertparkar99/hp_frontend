//src/app/content/skill-library/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import ViewSkill from "@/components/skillComponent/viewDialouge";
import EditDialog from "@/components/skillComponent/editDialouge";
import AddDialog from "@/components/skillComponent/addDialouge";
import {
  Trash, Funnel, Hexagon, Table, Plus, Search, Settings,
  Download, Shield, BookOpen, Sparkles, Brain, Bot, Wand2,
  BarChart3, Link2, Compass, RefreshCw, MoreVertical,
  CheckSquare, Edit, Upload
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Atom } from "react-loading-indicators";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import ShepherdTour from "../Onboarding/Competency-Management/ShepherdTour";
import { generateDetailTourSteps } from "../../../lib/tourSteps";

type Skill = {
  id: number;
  title: string;
  description?: string;
  department?: string;
  category?: string;
  sub_category?: string;
  proficiency_level?: string;
  usage_count?: number;
  last_updated?: string;
};

type JobRoleSkill = {
  id: string;
  SkillName: string;
  description: string;
  proficiency_level: string;
  category: string;
  sub_category: string;
  skill_id: string;
};

type SubCategory = {
  name: string;
  skills: Skill[];
};

type Category = {
  name: string;
  subcategories: SubCategory[];
};

type JobRole = {
  id: string;
  jobrole: string;
};

type Department = {
  id: string;
  department: string;
};

interface PageProps {
  showDetailTour?: boolean | { show: boolean; onComplete?: () => void };
}

export default function Page({ showDetailTour = false }: PageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [jobRoleSkills, setJobRoleSkills] = useState<JobRoleSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobRoleSkills, setLoadingJobRoleSkills] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [selectedProficiency, setSelectedProficiency] = useState<string | undefined>(undefined);
  const [selectedJobRole, setSelectedJobRole] = useState<string | undefined>(undefined);

  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]); // Multi-select

  const [deptJobroleMap, setDeptJobroleMap] = useState<Record<string, string[]>>({});


  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
    settings: false,
    permissions: false,
    bulkImport: false,
    import: false,
  });

  const [refreshKey, setRefreshKey] = useState(0);


  // 🔑 View Mode
  const [viewMode, setViewMode] = useState<"hexagon" | "table">("hexagon");

  // 🔎 Row-wise filters
  const [filters, setFilters] = useState({
    title: "",
    description: "",
    department: "",
    category: "",
    sub_category: "",
    proficiency_level: "",
  });

  // Job roles and departments state
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    department: "",
    title: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Combined actions menu state
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Header shrinking state
  const [headerShrunk, setHeaderShrunk] = useState(false);

  // Ref for content section
  const contentRef = useRef<HTMLElement>(null);

  // Detail tour state
  const [showTour, setShowTour] = useState(false);

  // Toggle function for the actions menu
  const toggleActionsMenu = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.actions-menu') && !target.closest('.actions-menu-trigger')) {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
        setSessionData({
          url: APP_URL || "",
          token: token || "",
          subInstituteId: sub_institute_id || "",
          orgType: org_type || "",
          userId: user_id || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Header shrinking on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && contentRef.current.scrollTop > 100) {
        setHeaderShrunk(true);
      } else {
        setHeaderShrunk(false);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDeptAndRoles = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
        );
        const json = await response.json();

        if (!json.status) return;

        const deptNames = Object.keys(json.data);

        // Save department list
        setDepartments(
          deptNames.map((name, index) => ({
            id: String(index),
            department: name,
          }))
        );

        // Save department → job roles mapping
        setDeptJobroleMap(json.data);

      } catch (err) {
        console.error("Error fetching department + jobroles:", err);
      }
    };

    if (sessionData.subInstituteId) fetchDeptAndRoles();
  }, [sessionData]);


  // Fetch job roles based on selected department from filters
  useEffect(() => {
    if (!selectedDepartment) {
      setJobRoles([]);
      return;
    }

    const roles = deptJobroleMap[selectedDepartment] || [];

    // FIX: Convert API objects into dropdown-safe values
    setJobRoles(
      roles.map((roleObj: any, index) => ({
        id: String(roleObj.id || index),
        jobrole: roleObj.jobrole || "",
        description: roleObj.description || "",
        jobrole_category: roleObj.jobrole_category || "",
        department_id: roleObj.department_id || "",
        department_name: roleObj.department_name || ""
      }))
    );
  }, [selectedDepartment, deptJobroleMap]);



  // Fetch job role skills when job role is selected
  useEffect(() => {
    const fetchJobRoleSkills = async () => {
      if (!selectedJobRole || selectedJobRole === "all" || !sessionData.url || !sessionData.subInstituteId) {
        setJobRoleSkills([]);
        return;
      }

      setLoadingJobRoleSkills(true);
      setError(null);

      try {
        // Get the selected job role
        const selectedRole = jobRoles.find(role => role.id === selectedJobRole);

        if (!selectedRole) {
          setJobRoleSkills([]);
          return;
        }

        // Use the correct API endpoint for fetching skills
        const apiUrl = `${sessionData.url}/jobrole_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&jobrole=${encodeURIComponent(selectedRole.jobrole)}&formType=skills`;
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

        // Transform the data according to the API response structure
        let transformedSkills: JobRoleSkill[] = [];

        if (data?.userskillData) {
          transformedSkills = Array.isArray(data.userskillData)
            ? data.userskillData.map((item: any, index: number) => ({
              id: item.id ? String(item.id) : String(Math.random() + index),
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

        // Filter out empty skills
        transformedSkills = transformedSkills.filter(skill => skill.SkillName && skill.SkillName.trim().length > 0);

        setJobRoleSkills(transformedSkills);
        console.log("Transformed job role skills:", transformedSkills);

      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching job role skills:", err);
        setJobRoleSkills([]);
      } finally {
        setLoadingJobRoleSkills(false);
      }
    };

    if (selectedJobRole && jobRoles.length > 0) {
      fetchJobRoleSkills();
    } else {
      setJobRoleSkills([]);
    }
  }, [selectedJobRole, sessionData, jobRoles]);

  // Form input change handler
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Get selected job role name
  const getSelectedJobRoleName = () => {
    if (!selectedJobRole || selectedJobRole === "all") return "";
    const selectedRole = jobRoles.find(role => role.id === selectedJobRole);
    return selectedRole ? selectedRole.jobrole : "";
  };

  // Fetch API Data
  const fetchData = async () => {
    if (!sessionData.url) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&category=&sub_category=`
      );
      const data = await res.json();

      const userTree = data?.userTree || {};
      let userSkillsArr: Skill[] = data?.userSkills || [];

      // Sort skills ascending by title
      userSkillsArr = userSkillsArr.sort((a, b) => a.title.localeCompare(b.title));

      const parsedCategories: Category[] = Object.entries(userTree).map(
        ([categoryName, subCatObj]) => {
          const subcategories: SubCategory[] = Object.entries(
            subCatObj as Record<string, any[]>
          ).map(([subName, skillsArr]) => {
            const skills: Skill[] = (skillsArr as any[]).map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              department: s.department,
              category: s.category,
              sub_category: s.sub_category,
              proficiency_level: s.proficiency_level,
              usage_count: Math.floor(Math.random() * 50), // Mock data
              last_updated: new Date().toISOString().split('T')[0], // Mock data
            }));
            return { name: subName, skills };
          });

          return { name: categoryName, subcategories };
        }
      );

      setCategories(parsedCategories);
      setUserSkills(userSkillsArr);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionData, refreshKey]);

  useEffect(() => {
    const shouldShow = typeof showDetailTour === 'object' ? showDetailTour.show : showDetailTour;
    if (shouldShow) {
      setShowTour(true);
    }
  }, [showDetailTour]);

  // Delete handler
  const handleDelete = async (skillId: number) => {
    if (!skillId) return;
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library/${skillId}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=user`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${sessionData.token}` },
          }
        );
        const data = await res.json();
        alert(data.message);
        setRefreshKey((prev) => prev + 1);
        setSelectedSkillId(null);
      } catch (error) {
        console.error("Error deleting skill:", error);
        alert("Error deleting skill");
      }
    }
  };

  // Edit handler
  const handleEdit = (skill: Skill) => {
    setActiveSkill(skill);
    setSelectedSkillId(skill.id);
    setDialogOpen({ ...dialogOpen, edit: true });
  };

  // Multi-select handlers
  const toggleSkillSelection = (skillId: number) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedSkills.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedSkills.length} skills?`)) {
      // Implement bulk delete logic here
      console.log("Bulk delete:", selectedSkills);
      setSelectedSkills([]);
    }
  };

  // AI Actions
  const handleAISuggest = () => {
    alert("AI Suggestions: This will recommend related skills based on current filters");
    setShowActionsMenu(false);
  };

  const handleSkillGenerator = () => {
    alert("Skill Generator: This will generate new skills using AI");
    setShowActionsMenu(false);
  };

  const handleAIDescriptionFill = () => {
    alert("AI Description Fill: This will autocomplete skill descriptions");
    setShowActionsMenu(false);
  };

  const handleAutoMatch = () => {
    alert("Auto-Match: This will automatically map skills to job roles");
    setShowActionsMenu(false);
  };

  // Dropdown options
  const departmentOptions = Array.from(new Set(userSkills.map((s) => s.department)))
    .filter((dept): dept is string => typeof dept === "string")
    .sort((a, b) => a.localeCompare(b));

  const categoryOptions = Array.from(new Set(userSkills.map((s) => s.category)))
    .filter((cat): cat is string => typeof cat === "string")
    .sort((a, b) => a.localeCompare(b));

  const proficiencyOptions = Array.from(new Set(userSkills.map((s) => s.proficiency_level)))
    .filter(Boolean)
    .map((lvl) => Number(lvl))
    .sort((a, b) => a - b)
    .map(String);

  // Determine which skills to display
  const getDisplaySkills = () => {
    // If job role is selected, show job role skills
    if (selectedJobRole && selectedJobRole !== "all" && jobRoleSkills.length > 0) {
      return jobRoleSkills.map(skill => ({
        id: parseInt(skill.id) || Math.random(), // Ensure numeric ID
        title: skill.SkillName,
        description: skill.description,
        department: selectedDepartment,
        category: skill.category,
        sub_category: skill.sub_category,
        proficiency_level: skill.proficiency_level,
        usage_count: 0, // Default for job role skills
        last_updated: new Date().toISOString().split('T')[0],
      }));
    }

    // Otherwise, show filtered user skills
    let filteredSkills = userSkills.filter((s) => {
      const matchesSearch = searchTerm === "" ||
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      return (
        matchesSearch &&
        (!selectedDepartment || s.department === selectedDepartment) &&
        (!selectedCategory || s.category === selectedCategory) &&
        (!selectedSubcategory || s.sub_category === selectedSubcategory) &&
        (!selectedProficiency || s.proficiency_level === selectedProficiency)
      );
    });


    return filteredSkills;
  };

  const displaySkills = getDisplaySkills();


  // Apply column-wise filters for table view
  const columnFilteredSkills = displaySkills.filter((s) =>
    s.title.toLowerCase().includes(filters.title.toLowerCase()) &&
    (s.description || "").toLowerCase().includes(filters.description.toLowerCase()) &&
    (s.department || "").toLowerCase().includes(filters.department.toLowerCase()) &&
    (s.category || "").toLowerCase().includes(filters.category.toLowerCase()) &&
    (s.sub_category || "").toLowerCase().includes(filters.sub_category.toLowerCase()) &&
    (s.proficiency_level || "").toLowerCase().includes(filters.proficiency_level.toLowerCase())
  );

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        textAlign: "left",
      },
    },
    table: {
      style: {
        borderRadius: "20px",
        overflow: "hidden",
      },
    },
  };

  // DataTable columns with header filters
  const columns: TableColumn<Skill>[] = [
    {
      name: (
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          <div className="flex flex-col">
            <span>Select</span>
          </div>
        </div>
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedSkills.includes(row.id)}
          onChange={() => toggleSkillSelection(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      width: "80px",
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Title</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.title,
      sortable: true,
      width: "170px"
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Description</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, description: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.description || "-",
      sortable: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Department</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.department || "-",
      sortable: true,
      width: "150px"
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Category</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.category || "-",
      sortable: true,
      width: "160px"
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Sub Category</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, sub_category: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.sub_category || "-",
      sortable: true,
      width: "160px"
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Proficiency</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, proficiency_level: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.proficiency_level || "-",
      sortable: true,
      width: "120px"
    },
    {
      name: (
        <div className="flex items-center gap-1">
          <BarChart3 className="w-4 h-4" />
          <span>Usage</span>
        </div>
      ),
      selector: (row) => row.usage_count || 0,
      sortable: true,
      width: "100px"
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* Usage insights logic */ }}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title="Usage Insights"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* Link to task logic */ }}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title="Link to Task"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: "160px"
    },
  ];

  const hexagonItems = columnFilteredSkills.map((skill) => ({
    id: skill.id,
    title: skill.title,
    subtitle: skill.description,
    skillObj: skill,
  }));

  return (
    <>
      {/* Top Bar with Search, Filters, and Action Icons */}
      <div className={`flex flex-col gap-4 mb-6 transition-all duration-300 ${headerShrunk ? 'p-2' : 'p-4'}`}>
        {/* First Row: Search and Main Actions */}
        <div className="flex justify-between items-center">
          {/* Left: Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="search-skills-input"
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right: Main Action Icons */}
          <div className="flex gap-2 items-center">


            {/* Filter Button */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-gray-100" title="Filter">
                  <Funnel className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-4 space-y-4" align="end">
                <h3 className="text-lg font-semibold mb-2">Filter Skills</h3>

                {/* Department Filter */}
                <Select
                  value={selectedDepartment || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedDepartment(undefined);
                      setSelectedCategory(undefined);
                      setSelectedSubcategory(undefined);
                      setSelectedProficiency(undefined);
                      setSelectedJobRole(undefined);
                    } else {
                      setSelectedDepartment(value);
                      setSelectedCategory(undefined);
                      setSelectedSubcategory(undefined);
                      setSelectedProficiency(undefined);
                      setSelectedJobRole(undefined);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 w-73">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments
                      .filter((dept) => dept.department && dept.department.trim() !== "")
                      .map((dept) => (
                        <SelectItem key={dept.id} value={dept.department}>
                          {dept.department}
                        </SelectItem>
                    ))}

                  </SelectContent>
                </Select>

                {/* Job Role Filter */}
                {/* <Select
                  value={selectedJobRole || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedJobRole(undefined);
                    } else {
                      setSelectedJobRole(value);
                    }
                  }}
                  disabled={!selectedDepartment || loadingJobRoles}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingJobRoles ? "Loading job titles..." : "Select job title"}>
                      {selectedJobRole && jobRoles.length > 0
                        ? jobRoles.find(role => role.id === selectedJobRole)?.jobrole || "Select job title"
                        : "Select job title"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {loadingJobRoles ? (
                      <SelectItem value="loading" disabled>Loading job titles...</SelectItem>
                    ) : jobRoles.length > 0 ? (
                      <>
                        <SelectItem value="all">All Job Roles</SelectItem>
                        {jobRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.jobrole}
                          </SelectItem>
                        ))}
                      </>
                    ) : (
                      <SelectItem value="no-roles" disabled>
                        {selectedDepartment ? "No job titles available for this department" : "Select a department first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select> */}

                {/* Category Filter */}
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedCategory(undefined);
                      setSelectedSubcategory(undefined);
                    } else {
                      setSelectedCategory(value);
                      setSelectedSubcategory(undefined);
                    }
                  }}
                  disabled={!!selectedJobRole} // Disable when job role is selected
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions
                      .filter((cat) => cat && cat.trim() !== "")
                      .map((cat, idx) => (
                        <SelectItem key={idx} value={cat}>
                          {cat}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Subcategory Filter */}
                <Select
                  value={selectedSubcategory || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedSubcategory(undefined);
                    } else {
                      setSelectedSubcategory(value);
                    }
                  }}
                  disabled={!selectedCategory || !!selectedJobRole} // Disable when job role is selected
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Sub Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub Categories</SelectItem>
                    {selectedCategory &&
                      Array.from(
                        new Set(
                          userSkills
                            .filter((s) => s.category === selectedCategory)
                            .map((s) => s.sub_category)
                        )
                      )
                        .filter((sub): sub is string => typeof sub === "string" && sub.trim() !== "")
                        .sort((a, b) => a.localeCompare(b))
                        .map((sub, idx) => (
                          <SelectItem key={idx} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>

                {/* Proficiency Filter */}
                <Select
                  value={selectedProficiency || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedProficiency(undefined);
                    } else {
                      setSelectedProficiency(value);
                    }
                  }}
                  disabled={!!selectedJobRole} // Disable when job role is selected
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Proficiency Levels</SelectItem>
                    {proficiencyOptions.map((lvl, idx) => (
                      <SelectItem key={idx} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Buttons */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDepartment(undefined);
                      setSelectedCategory(undefined);
                      setSelectedSubcategory(undefined);
                      setSelectedProficiency(undefined);
                      setSelectedJobRole(undefined);
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* View Toggle */}
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("hexagon")}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "hexagon"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                <Hexagon className="h-5 w-5" />
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "table"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                <Table className="h-5 w-5" />
              </button>
            </div>
            {/* Combined Actions Menu */}
            <div className="relative">
              <button
                onClick={toggleActionsMenu}
                className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="More Actions"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {showActionsMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 actions-menu">
                  {/* AI Tools Section */}
                  <div className="p-3 border-b border-gray-100">
                    {/* Add Options Section */}
                    <button
                      onClick={() => {
                        setDialogOpen({ ...dialogOpen, add: true });
                        setShowActionsMenu(false);
                      }}
                      className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Add New Skill"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />

                    </button>

                    <button
                      onClick={handleAutoMatch}
                      className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Auto-Match"
                    >
                      <Wand2 className="w-5 h-5 text-gray-600" />

                    </button>


                    <button
                      onClick={() => {
                        /* Add from framework logic */
                        setShowActionsMenu(false);
                      }}
                      className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="add from Framework"
                    >
                      <BookOpen className="w-5 h-5 text-gray-600" />

                    </button>


                    <button
                      onClick={() => {
                        setDialogOpen({ ...dialogOpen, import: true });
                        setShowActionsMenu(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Bulk skill Import"
                    >
                      <Upload className="h-5 w-5 text-gray-600" />
                    </button>

                    <button
                      onClick={() => {
                        setDialogOpen({ ...dialogOpen, bulkImport: true });
                        setShowActionsMenu(false);
                      }}
                      className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Bulk skill Export"
                    >
                      <Download className="w-5 h-5 text-gray-600" />

                    </button>
                    <button
                      onClick={() => {
                        setDialogOpen({ ...dialogOpen, settings: true });
                        setShowActionsMenu(false);
                      }}
                      className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Settings"
                    >
                      <Settings className="w-5 h-5 text-gray-600" />

                    </button>

                  </div>
                </div>

              )}
            </div>
          </div>
        </div>

        {/* Second Row: Batch Actions when skills are selected */}
        {selectedSkills.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">
              {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash className="w-4 h-4" />
                Delete Selected
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                <Download className="w-4 h-4" />
                Export Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex gap-6 flex-col">
        <section ref={contentRef} className="w-full h-screen overflow-y-auto scrollbar-hide">
          {loading || (selectedJobRole && loadingJobRoleSkills) ? (
            <div className="flex justify-center items-center h-screen">
              <Atom color="#525ceaff" size="medium" text="" textColor="" />
            </div>
          ) : columnFilteredSkills.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 text-lg font-medium">
                {selectedJobRole ? "No skills found for this job role" : "No skills found"}
              </p>
            </div>
          ) : viewMode === "hexagon" ? (
            // 🔷 Hexagon View
            <div className="honeycomb-container-skill flex flex-wrap gap-6 justify-center pb-4">
              {hexagonItems.map((item, index) => (
                <div
                  key={index}
                  className="hexagon-wrapper-skill relative cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => {
                    if (item.skillObj) {
                      setActiveSkill(item.skillObj);
                      setSelectedSkillId(item.skillObj.id);
                      setDialogOpen({ ...dialogOpen, view: true });
                    }
                  }}
                >
                  <div className="hexagon-inner-skill">
                    <div className="hexagon-content-skill bg-[#9FD0FF] flex flex-col items-center justify-center relative">
                      <p
                        className="hexagon-title-skill text-black font-inter text-center"
                        title={item.subtitle}
                      >
                        {item.title}
                      </p>

                      {item.skillObj && (
                        <div className="flex gap-2 mt-2">
                          {/* Hexagon Tile Actions */}
                          <button
                            className="text-gray-600 hover:bg-gray-100 p-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item.skillObj!);
                            }}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:bg-gray-100 p-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.skillObj!.id);
                            }}
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:bg-gary-100 p-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Usage insights logic
                            }}
                            title="Usage Insights"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:bg-gray-100 p-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Link to task logic
                            }}
                            title="Link to Task"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 📋 DataTable View with column filters
            <div className="w-full">
              <DataTable
                columns={columns}
                data={columnFilteredSkills}
                customStyles={customStyles}
                pagination
                highlightOnHover
                striped
                responsive
                persistTableHead
              />
            </div>
          )}
        </section>

        {/* Floating Action Button for Additional Tools */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 mb-2" align="end">
              <div className="space-y-1">
                <button className="flex items-center gap-2 w-full p-2 text-sm hover:bg-gray-100 rounded">
                  <Compass className="w-4 h-4" />
                  Guided Tour
                </button>
                <button
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  className="flex items-center gap-2 w-full p-2 text-sm hover:bg-gray-100 rounded"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </button>
                <button className="flex items-center gap-2 w-full p-2 text-sm hover:bg-gray-100 rounded">
                  {/* <Heatmap className="w-4 h-4" /> */}
                  Gap Heatmap
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Dialogs */}
        {dialogOpen.view && activeSkill && (
          <ViewSkill
            skillId={activeSkill.id}
            formType="user"
            onClose={() => {
              setDialogOpen({ ...dialogOpen, view: false });
              setSelectedSkillId(null);
            }}
            onSuccess={() => setDialogOpen({ ...dialogOpen, add: false })}
          />
        )}

        {dialogOpen.edit && activeSkill && (
          <EditDialog
            skillId={activeSkill.id}
            onClose={() => {
              setDialogOpen({ ...dialogOpen, edit: false });
              setSelectedSkillId(null);
            }}
            onSuccess={() => {
              setDialogOpen({ ...dialogOpen, edit: false });
              setRefreshKey((prev) => prev + 1);
            }}
          />
        )}

        {dialogOpen.add && (
          <AddDialog
            onClose={() => setDialogOpen({ ...dialogOpen, add: false })}
            onSuccess={() => {
              setDialogOpen({ ...dialogOpen, add: false });
              setRefreshKey((prev) => prev + 1);
            }}
          />
        )}

        {/* Detail Tour */}
        {showTour && (
          <ShepherdTour
            steps={generateDetailTourSteps('Skill')}
            onComplete={() => {
              setShowTour(false);
              if (typeof showDetailTour === 'object' && showDetailTour.onComplete) {
                showDetailTour.onComplete();
              }
            }}
          />
        )}
      </div>
    </>
  );
}