"use client";

import React, { useState, useEffect, useMemo } from "react";
import Icon from "@/components/AppIcon";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import DepartmentFilter from "../../../components/jobroleComponentV1/components/DepartmentFilter";
import JobRoleCard from "../../../components/jobroleComponentV1/components/JobRoleCard";
import JobRoleForm from "../../../components/jobroleComponentV1/components/JobRoleForm";
import ResponsibilityLevels from "../../../components/jobroleComponentV1/components/ResponsibilityLevels";
import JobRoleDetails from "../../../components/jobroleComponentV1/components/JobRoleDetails";

type JobRole = {
  id: string;
  title: string;
  department: string;
  subDepartment: string;
  level: string;
  description: string;
  performanceExpectations: string[];
  requiredSkills: string[];
  employeeCount: number;
  lastUpdated: string;
  createdDate: string;
  isActive: boolean;
};

const API_URL =
  "https://hp.triz.co.in/jobrole_library?type=API&token=798|VOTSJFcrJ4kzWcaHLUEfjNxF240rT6RgJ8WbnxeFfd11d2e2&sub_institute_id=1&org_type=Financial%20Services";

const sortOptions = [
  { value: "title", label: "Job Title (A-Z)" },
  { value: "department", label: "Department" },
  { value: "level", label: "Level" },
  { value: "lastUpdated", label: "Last Updated" },
  { value: "employeeCount", label: "Employee Count" },
];

const JobRoleLibrary: React.FC = () => {
  // Move all hooks inside the component

  // Session data from localStorage
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
        user_profile_name,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
      });
    }
  }, []);

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [showResponsibilityLevels, setShowResponsibilityLevels] =
    useState(false);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch job roles from API on component mount
  useEffect(() => {
    const loadJobRoles = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const apiData = await res.json();
        const mappedData: JobRole[] = (apiData?.tableData || []).map(
          (item: any, index: number) => ({
            id: item.id || `JR${index + 1}`,
            title: item.jobrole || "Untitled Role",
            department: item.department || "N/A",
            subDepartment: item.sub_department || "",
            level: item.industries || "N/A",
            description: item.description || "",
            performanceExpectations: item.performance_expectation
              ? item.performance_expectation.split("|")
              : [],
            requiredSkills: item.required_skill_experience
              ? item.required_skill_experience.split(",")
              : [],
            employeeCount: 0,
            lastUpdated: item.updated_at || "-",
            createdDate: item.created_at
              ? new Date(item.created_at).toISOString().slice(0, 10)
              : "",
            isActive: item.status?.toLowerCase() === "active",
          })
        );
        setJobRoles(mappedData);
      } catch (error) {
        console.error("Failed to fetch job roles:", error);
        setFetchError("Failed to fetch job roles.");
      }
      setIsLoading(false);
    };
    loadJobRoles();
  }, []);

  // Filter, search & sort logic
  const filteredRoles = useMemo(() => {
    let filtered = [...jobRoles];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.title.toLowerCase().includes(q) ||
          role.description.toLowerCase().includes(q) ||
          role.requiredSkills.some((skill) => skill.toLowerCase().includes(q))
      );
    }

    if (selectedDepartments.length > 0) {
      filtered = filtered.filter((role) => {
        const deptId = `dept-${role.department}`;
        const subDeptId = role.subDepartment
          ? `sub-${role.department}-${role.subDepartment}`
          : "";
        return (
          selectedDepartments.includes(deptId) ||
          (subDeptId && selectedDepartments.includes(subDeptId))
        );
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "department":
          return a.department.localeCompare(b.department);
        case "level":
          const levelOrder: Record<string, number> = {
            Entry: 1,
            Mid: 2,
            Senior: 3,
            Executive: 4,
          };
          return (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0);
        case "employeeCount":
          return (b.employeeCount || 0) - (a.employeeCount || 0);
        case "lastUpdated":
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobRoles, searchQuery, selectedDepartments, sortBy]);

  // Handlers
  const handleCreateRole = () => {
    setEditingRole(null);
    setShowForm(true);
  };

  const handleEditRole = (role: JobRole) => {
    setEditingRole(role);
    setShowForm(true);
    setSelectedRole(null);
  };

  const handleDeleteRole = async (id: string) => {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/jobrole_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=user`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        alert(data.message || "Job role deleted successfully");

        setJobRoles((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  const handleViewRole = (role: JobRole) => {
    setSelectedRole(role);
  };

  const handleSaveRole = (
    roleData: Omit<
      JobRole,
      "id" | "employeeCount" | "lastUpdated" | "createdDate"
    >
  ) => {
    if (editingRole) {
      setJobRoles((prev) =>
        prev.map((role) =>
          role.id === editingRole.id
            ? { ...role, ...roleData, lastUpdated: "Just now" }
            : role
        )
      );
    } else {
      const newRole: JobRole = {
        ...roleData,
        id: `JR${String(jobRoles.length + 1).padStart(3, "0")}`,
        employeeCount: 0,
        lastUpdated: "Just now",
        createdDate: new Date().toISOString(),
        isActive: true,
      };
      setJobRoles((prev) => [...prev, newRole]);
    }
    setShowForm(false);
    setEditingRole(null);
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (selectedRoles.length === 0) {
      alert("Please select roles to perform bulk actions");
      return;
    }
    switch (action) {
      case "activate":
        setJobRoles((prev) =>
          prev.map((role) =>
            selectedRoles.includes(role.id) ? { ...role, isActive: true } : role
          )
        );
        break;
      case "deactivate":
        setJobRoles((prev) =>
          prev.map((role) =>
            selectedRoles.includes(role.id)
              ? { ...role, isActive: false }
              : role
          )
        );
        break;
      case "delete":
        if (
          window.confirm(
            `Are you sure you want to delete ${selectedRoles.length} selected roles?`
          )
        ) {
          setJobRoles((prev) =>
            prev.filter((role) => !selectedRoles.includes(role.id))
          );
        }
        break;
    }
    setSelectedRoles([]);
  };

  const handleRoleSelection = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRoles.length === filteredRoles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(filteredRoles.map((role) => role.id));
    }
  };

  return (
    <div>
      {/* Uncomment these if you want to use */}
      {/* <GlobalHeader />
      <PrimarySidebar /> */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Job Role Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage organizational positions with comprehensive role
              specifications and requirements
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() =>
                setShowResponsibilityLevels(!showResponsibilityLevels)
              }
            >
              <Icon name="Info" className="mr-2" />
              Responsibility Levels
            </Button>
            <Button onClick={handleCreateRole}>Create Job Role</Button>
          </div>
        </div>

        {showResponsibilityLevels && (
          <div className="mb-6">
            <ResponsibilityLevels />
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <DepartmentFilter
              onFilterChange={setSelectedDepartments}
              selectedDepartments={selectedDepartments}
            />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search by title, description, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="w-full sm:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border px-3 py-2 rounded-md"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRoles.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <span className="text-sm text-primary font-medium">
                    {selectedRoles.length} role(s) selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("activate")}
                    >
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("deactivate")}
                    >
                      Deactivate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkAction("delete")}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>
                    Showing {filteredRoles.length} of {jobRoles.length} roles
                  </span>
                  {selectedDepartments.length > 0 && (
                    <span>• Filtered by {selectedDepartments.length} department(s)</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedRoles.length === filteredRoles.length &&
                      filteredRoles.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
                  />
                  <span>Select All</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Icon
                    name="Loader2"
                    size={32}
                    className="animate-spin text-primary mx-auto mb-4"
                  />
                  <p className="text-muted-foreground">Loading job roles...</p>
                </div>
              </div>
            ) : fetchError ? (
              <div className="text-center py-12 text-error">
                <Icon name="AlertTriangle" size={32} className="mx-auto mb-4" />
                <p>{fetchError}</p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  name="Briefcase"
                  size={48}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No job roles found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedDepartments.length > 0
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by creating your first job role"}
                </p>
                {!searchQuery && selectedDepartments.length === 0 && (
                  <Button onClick={handleCreateRole}>Create Job Role</Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRoles.map((role) => (
                  <div key={role.id} className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleRoleSelection(role.id)}
                        className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
                      />
                    </div>
                    <div className="pl-10">
                      <JobRoleCard
                        role={role}
                        onEdit={handleEditRole}
                        onDelete={handleDeleteRole}
                        onView={handleViewRole}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1100] flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <JobRoleForm
              role={editingRole}
              onSave={handleSaveRole}
              onCancel={() => {
                setShowForm(false);
                setEditingRole(null);
              }}
              isEditing={!!editingRole}
              jobRoles={jobRoles}
            />
          </div>
        </div>
      )}

      {selectedRole && (
        <JobRoleDetails
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
          onEdit={handleEditRole}
        />
      )}
    </div>
  );
};

export default JobRoleLibrary;
