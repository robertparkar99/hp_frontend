"use client";
import React, { useState, useEffect, useMemo } from "react";
import Icon from "../../AppIcon";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select } from "@/components/ui/Select";
// import { Select } from "@/components/ui/Select";

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

// Define props interface for the form component
interface JobRoleFormProps {
  role: JobRole | null;
  onSave: (role: JobRole) => void;
  onCancel: () => void;
  isEditing?: boolean;
  jobRoles?: JobRole[];
}

const JobRoleForm: React.FC<JobRoleFormProps> = ({
  role,
  onSave,
  onCancel,
  isEditing = false,
  jobRoles = [],
}) => {
  type FormDataType = {
    title: string;
    department: { value: string; label: string } | null;
    subDepartment: { value: string; label: string } | null;
    level: { value: string; label: string } | null;
    description: string;
    performanceExpectations: string[];
    requiredSkills: string[];
    isActive: boolean;
  };

  type ErrorsType = {
    [key: string]: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    department: null,
    subDepartment: null,
    level: null,
    description: "",
    performanceExpectations: [""],
    requiredSkills: [],
    isActive: true,
  });

  const [errors, setErrors] = useState<ErrorsType>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(jobRoles.map((job) => job.department).filter(Boolean))
    ).map((dep) => ({ value: dep, label: dep }));
  }, [jobRoles]);

  type SubDepartmentOptions = {
    [department: string]: { value: string; label: string }[];
  };

  const subDepartmentOptions: SubDepartmentOptions = useMemo(() => {
    return jobRoles.reduce<SubDepartmentOptions>((acc, job) => {
      if (job.department && job.subDepartment) {
        if (!acc[job.department]) acc[job.department] = [];
        if (!acc[job.department].some((s) => s.value === job.subDepartment)) {
          acc[job.department].push({
            value: job.subDepartment,
            label: job.subDepartment,
          });
        }
      }
      return acc;
    }, {});
  }, [jobRoles]);

  const levelOptions = [
    { value: "Entry", label: "Entry Level" },
    { value: "Mid", label: "Mid Level" },
    { value: "Senior", label: "Senior Level" },
    { value: "Executive", label: "Executive Level" },
  ];

  const skillOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "react", label: "React" },
    { value: "nodejs", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "leadership", label: "Leadership" },
    { value: "communication", label: "Communication" },
    { value: "project-management", label: "Project Management" },
    { value: "data-analysis", label: "Data Analysis" },
    { value: "marketing-strategy", label: "Marketing Strategy" },
    { value: "sales-strategy", label: "Sales Strategy" },
  ];

  useEffect(() => {
    if (role && isEditing && departmentOptions.length > 0) {
      const deptOption =
        departmentOptions.find(
          (opt) => opt.value.toLowerCase() === role.department?.toLowerCase()
        ) || null;

      const subDeptOption =
        (role.department &&
          subDepartmentOptions[role.department] &&
          subDepartmentOptions[role.department].find(
            (opt) =>
              opt.value.toLowerCase() === role.subDepartment?.toLowerCase()
          )) ||
        null;

      const levelOption =
        levelOptions.find(
          (opt) => opt.value.toLowerCase() === role.level?.toLowerCase()
        ) || null;

      setFormData({
        title: role.title || "",
        department: deptOption,
        subDepartment: subDeptOption,
        level: levelOption,
        description: role.description || "",
        performanceExpectations: role.performanceExpectations || [""],
        requiredSkills: role.requiredSkills || [],
        isActive: role.isActive !== undefined ? role.isActive : true,
      });
    }
  }, [role, isEditing, departmentOptions, subDepartmentOptions]);

  const handleInputChange = (field: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDepartmentChange = (
    selected: { value: string; label: string } | string | null
  ) => {
    let departmentObj = selected;
    if (typeof selected === "string") {
      departmentObj = { value: selected, label: selected };
    }
    handleInputChange("department", departmentObj);
    handleInputChange("subDepartment", null);
  };

  const handleSubDepartmentChange = (
    selected: { value: string; label: string } | null
  ) => {
    handleInputChange("subDepartment", selected);
  };

  const handleExpectationChange = (index: number, value: string) => {
    const updated = [...formData.performanceExpectations];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, performanceExpectations: updated }));
  };

  const addExpectation = () =>
    setFormData((prev) => ({
      ...prev,
      performanceExpectations: [...prev.performanceExpectations, ""],
    }));

  const removeExpectation = (index: number) => {
    if (formData.performanceExpectations.length > 1) {
      setFormData((prev) => ({
        ...prev,
        performanceExpectations: prev.performanceExpectations.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorsType = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.subDepartment)
      newErrors.subDepartment = "Sub-Department is required";
    if (!formData.level) newErrors.level = "Level is required";
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    if (
      formData.performanceExpectations.filter((exp) => exp.trim()).length === 0
    )
      newErrors.performanceExpectations =
        "At least one performance expectation is required";
    if (formData.requiredSkills.length === 0)
      newErrors.requiredSkills = "At least one required skill must be selected";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const cleanedData: JobRole = {
      ...(role || {
        id: "",
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        employeeCount: 0,
      }),
      title: formData.title,
      department: formData.department?.value || "",
      subDepartment: formData.subDepartment?.value || "",
      level: formData.level?.value || "",
      description: formData.description,
      performanceExpectations: formData.performanceExpectations.filter((exp) =>
        exp.trim()
      ),
      requiredSkills: formData.requiredSkills,
      isActive: formData.isActive,
      lastUpdated: new Date().toISOString(),
      employeeCount: role?.employeeCount || 0,
      id: role?.id || "",
    };
    onSave(cleanedData);
    setIsLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg h-[80vh] flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
        <h2 className="text-xl font-semibold text-foreground">
          {isEditing ? "Edit Job Role" : "Create New Job Role"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      <div className="overflow-y-auto p-6 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <Select
              value={formData.department?.value ?? undefined}
              onValueChange={(value: string) => {
                const selected = departmentOptions.find(opt => opt.value === value) || null;
                handleDepartmentChange(selected);
              }}
              required
            >
              <option value="" disabled>
                {formData.department ? formData.department.label : "Select a department"}
              </option>
              {departmentOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select> */}
            <select
              value={formData.department?.value ?? ""}
              onChange={(e) => {
                const selected =
                  departmentOptions.find(
                    (opt) => opt.value === e.target.value
                  ) || null;
                handleDepartmentChange(selected);
              }}
              required
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="" disabled>
                {formData.department
                  ? formData.department.label
                  : "Select a department"}
              </option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-error text-sm mt-1">{errors.department}</p>
            )}

            {/* <Select
              value={formData.subDepartment?.value ?? undefined}
              onValueChange={(value: string) => {
                const selected =
                  (formData.department &&
                    subDepartmentOptions[formData.department.value] &&
                    subDepartmentOptions[formData.department.value].find(opt => opt.value === value)) ||
                  null;
                handleSubDepartmentChange(selected);
              }}
              disabled={!formData.department}
              required
            >
              {(formData.department
                ? subDepartmentOptions[formData.department.value] || []
                : []
              ).map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select> */}
            <select
              value={formData.subDepartment?.value ?? ""}
              onChange={(e) => {
                const selected =
                  (formData.department &&
                    subDepartmentOptions[formData.department.value]?.find(
                      (opt) => opt.value === e.target.value
                    )) ||
                  null;
                handleSubDepartmentChange(selected);
              }}
              disabled={!formData.department}
              required
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="" disabled>
                {formData.subDepartment
                  ? formData.subDepartment.label
                  : "Select a sub-department"}
              </option>

              {(formData.department
                ? subDepartmentOptions[formData.department.value] || []
                : []
              ).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter job title"
              required
            />
            {/* <Select
                value={formData.level?.value ?? undefined}
                onValueChange={(value: string) => {
                  const selected = levelOptions.find(opt => opt.value === value) || null;
                  handleInputChange("level", selected);
                }}
                required
              >
                {levelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
            </Select> */}
            {/* <select
  value={formData.level?.value ?? ""}
  onChange={(e) => {
    const selected = levelOptions.find(opt => opt.value === e.target.value) || null;
    handleInputChange("level", selected);
  }}
  required
  className="w-full border px-3 py-2 rounded-md"
>
  <option value="" disabled>Select level...</option>
  {levelOptions.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select> */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Description <span className="text-error">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
              {errors.description && (
                <p className="text-error text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* <div>
     
          </div> */}

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-foreground">
                Performance Expectations <span className="text-error">*</span>
              </label>
              <span className="mdi mdi-plus" onClick={addExpectation}></span>
            </div>
            <div className="space-y-3">
              {formData.performanceExpectations.map((expectation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Input
                    type="text"
                    placeholder={`Performance expectation ${index + 1}`}
                    value={expectation}
                    onChange={(e) =>
                      handleExpectationChange(index, e.target.value)
                    }
                    className="flex-1"
                  />
                  {formData.performanceExpectations.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExpectation(index)}
                      className="text-error hover:text-error/80"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.performanceExpectations && (
              <p className="text-error text-sm mt-1">
                {errors.performanceExpectations}
              </p>
            )}
          </div>

          {/* Replace Select with a native multi-select for requiredSkills */}
          {/* <label className="block text-sm font-medium text-foreground mb-2">
            Required Skills <span className="text-error">*</span>
          </label>
          <select
            multiple
            value={formData.requiredSkills}
            onChange={(e) =>
              handleInputChange(
                "requiredSkills",
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          >
            {skillOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select> */}
          {/* Label */}
          {/* Label */}
          {/* <label className="block text-sm font-medium text-foreground mb-2">
  Required Skills <span className="text-error">*</span>
</label> */}

          {/* Single-Select Dropdown */}
          {/* <select
  value=""
  onChange={(e) => {
    const selectedValue = e.target.value;
    if (
      selectedValue &&
      !formData.requiredSkills.includes(selectedValue)
    ) {
      handleInputChange("requiredSkills", [
        ...formData.requiredSkills,
        selectedValue,
      ]);
    }
  }}
  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
>
  <option value="" disabled>
    Select a skill
  </option>
  {skillOptions.map((opt) => (
    <option
      key={opt.value}
      value={opt.value}
      disabled={formData.requiredSkills.includes(opt.value)}
    >
      {opt.label}
    </option>
  ))}
</select> */}

          {/* Selected Skills Display */}
          {/* {formData.requiredSkills.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-2">
    {formData.requiredSkills.map((skill) => {
      const label =
        skillOptions.find((opt) => opt.value === skill)?.label || skill;
      return (
        <span
          key={skill}
          className="inline-flex items-center bg-muted text-foreground text-sm px-3 py-1 rounded-full"
        >
          {label}
          <button
            type="button"
            onClick={() =>
              handleInputChange(
                "requiredSkills",
                formData.requiredSkills.filter((s) => s !== skill)
              )
            }
            className="ml-2 text-muted-foreground hover:text-error"
          >
            &times;
          </button>
        </span>
      );
    })}
  </div>
)}
          {errors.requiredSkills && (
            <p className="text-error text-sm mt-1">{errors.requiredSkills}</p>
          )} */}

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-foreground"
            >
              Active Role (available for assignment)
            </label>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end space-x-3 p-6 border-t border-border shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          {isEditing ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </div>
  );
};

export default JobRoleForm;
