"use client";
import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { Employee } from "../types/attendance";

interface Department {
  id: number;
  department: string;
  parent_id: number;
  status: number;
}

interface EmployeeSelectorPropsBase {
  className?: string;
}

interface SingleSelectProps extends EmployeeSelectorPropsBase {
  multiSelect?: false;
  selectedEmployee: Employee | null;
  selectedDepartment: string | null;
  onSelectEmployee: (employee: Employee | null) => void;
  onSelectDepartment: (department: string | null) => void;
}

interface MultiSelectProps extends EmployeeSelectorPropsBase {
  multiSelect: true;
  selectedEmployee: Employee[];
  selectedDepartment: string[];
  onSelectEmployee: (employee: Employee[]) => void;
  onSelectDepartment: (department: string[]) => void;
}

type EmployeeSelectorProps = SingleSelectProps | MultiSelectProps;

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  selectedEmployee,
  selectedDepartment,
  onSelectEmployee,
  onSelectDepartment,
  className = "",
  multiSelect = false,
}) => {
  const [isEmpOpen, setIsEmpOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const deptRef = useRef<HTMLDivElement>(null);
  const empRef = useRef<HTMLDivElement>(null);

  // ✅ Fallback avatar
  const fallbackImg =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

  const getAvatarUrl = (image?: string): string => {
    if (image && image.trim()) {
      return image.startsWith("http")
        ? image
        : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
          image
        )}`;
    }
    return fallbackImg;
  };

  // ✅ Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/table_data?table=hrms_departments&filters[sub_institute_id]=1&filters[status]=1"
        );
        const data: Department[] = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    fetchDepartments();
  }, []);

  // Normalize selections
  const selectedDepartments: string[] = multiSelect
    ? (selectedDepartment as string[])
    : selectedDepartment
      ? [selectedDepartment as string]
      : [];

  const selectedEmployees: Employee[] = multiSelect
    ? (selectedEmployee as Employee[])
    : selectedEmployee
      ? [selectedEmployee as Employee]
      : [];

  // ✅ Fetch employees whenever departments change
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        let formatted: Employee[] = [];

        // ✅ Case 1: No department selected → get all employees
        if (selectedDepartments.length === 0) {
          const res = await fetch(
            `http://127.0.0.1:8000/table_data?table=tbluser&filters[sub_institute_id]=1&filters[status]=1`
          );
          const data = await res.json();

          formatted = data.map((emp: any) => ({
            id: emp.id,
            name: `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""
              }`.trim(),
            avatar: getAvatarUrl(emp.image),
            department: emp.department_id?.toString() || "",
          }));

          setEmployees(formatted);
          return; // ✅ exit early
        }

        // ✅ Case 2: Multiple departments → fetch each and merge
        const requests = selectedDepartments.map((deptId) =>
          fetch(
            `http://127.0.0.1:8000/table_data?table=tbluser&filters[sub_institute_id]=1&filters[status]=1&filters[department_id]=${deptId}`
          ).then((res) => res.json())
        );

        const results = await Promise.all(requests);

        formatted = results.flat().map((emp: any) => ({
          id: emp.id,
          name: `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""
            }`.trim(),
          avatar: getAvatarUrl(emp.image),
          email: emp.email || "",
          position: emp.position || "",
          departmentId: emp.department_id?.toString() || "",
          department: emp.department_id?.toString() || "",
        }));

        // ✅ Remove duplicates by ID
        const unique = formatted.filter(
          (emp, index, self) => index === self.findIndex((e) => e.id === emp.id)
        );

        setEmployees(unique);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, [selectedDepartments]);

  // Department select
  const handleDepartmentSelect = (dept: string | null) => {
    if (multiSelect) {
      const handler = onSelectDepartment as (department: string[]) => void;

      if (!dept) {
        handler([]);
      } else if (selectedDepartments.includes(dept)) {
        handler(selectedDepartments.filter((d) => d !== dept));
      } else {
        handler([...selectedDepartments, dept]);
      }
    } else {
      const handler = onSelectDepartment as (department: string | null) => void;
      handler(dept);
      setIsDeptOpen(false);
    }
  };

  // Employee select
  const handleEmployeeSelect = (emp: Employee | null) => {
    if (multiSelect) {
      const handler = onSelectEmployee as (employee: Employee[]) => void;

      if (!emp) {
        handler([]);
      } else if (selectedEmployees.some((e) => e.id === emp.id)) {
        handler(selectedEmployees.filter((e) => e.id !== emp.id));
      } else {
        handler([...selectedEmployees, emp]);
      }
    } else {
      const handler = onSelectEmployee as (employee: Employee | null) => void;
      handler(emp);
      setIsEmpOpen(false);
    }
  };

  // Ctrl + A support (select all)
  useEffect(() => {
    if (!multiSelect) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();

        if (isDeptOpen) {
          const handlerDept = onSelectDepartment as (department: string[]) => void;
          handlerDept(departments.map((d) => d.id.toString()));
          setIsDeptOpen(false);
        } else if (isEmpOpen) {
          const handlerEmp = onSelectEmployee as (employee: Employee[]) => void;
          handlerEmp(employees);
          setIsEmpOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    multiSelect,
    employees,
    departments,
    isDeptOpen,
    isEmpOpen,
    onSelectEmployee,
    onSelectDepartment,
  ]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        deptRef.current &&
        !deptRef.current.contains(e.target as Node) &&
        empRef.current &&
        !empRef.current.contains(e.target as Node)
      ) {
        setIsDeptOpen(false);
        setIsEmpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-row gap-4 ${className}`}>
      {/* Department Selector */}
      <div ref={deptRef} className="relative flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Department
        </label>
        <button
          type="button"
          onClick={() => {
            setIsDeptOpen(!isDeptOpen);
            setIsEmpOpen(false);
          }}
          className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
        >
          <div className="flex items-center flex-wrap gap-2">
            {multiSelect ? (
              selectedDepartments.length > 0 ? (
                <span className="text-blue-700">
                  {selectedDepartments.length} Department{selectedDepartments.length !== 1 ? 's' : ''} Selected
                </span>
              ) : (
                <span className="text-gray-500">All Departments</span>
              )
            ) : selectedDepartments.length > 0 ? (
              <span>
                {departments.find((d) => d.id.toString() === selectedDepartments[0])?.department}
              </span>
            ) : (
              <span className="text-gray-500">All Departments</span>
            )}
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </span>
        </button>

        {/* Department dropdown remains the same */}
        {isDeptOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
            <button
              onClick={() => handleDepartmentSelect(null)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50"
            >
              All Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentSelect(dept.id.toString())}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                  multiSelect && selectedDepartments.includes(dept.id.toString())
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                {dept.department}
                {multiSelect && selectedDepartments.includes(dept.id.toString()) && (
                  <span className="ml-2 text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Employee Selector */}
      <div ref={empRef} className="relative flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Employee
        </label>
        <button
          type="button"
          onClick={() => {
            setIsEmpOpen(!isEmpOpen);
            setIsDeptOpen(false);
          }}
          className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
        >
          <div className="flex items-center flex-wrap gap-2">
            {multiSelect ? (
              selectedEmployees.length > 0 ? (
                <span className="text-green-700">
                  {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''} Selected
                </span>
              ) : (
                <span className="text-gray-500">All Employees</span>
              )
            ) : selectedEmployees.length > 0 ? (
              <div className="flex items-center gap-2">
                <img
                  src={selectedEmployees[0].avatar}
                  alt={selectedEmployees[0].name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackImg;
                  }}
                />
                <span>{selectedEmployees[0].name}</span>
              </div>
            ) : (
              <span className="text-gray-500">Select an employee...</span>
            )}
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </span>
        </button>

        {/* Employee dropdown remains the same */}
        {isEmpOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
            <button
              onClick={() => handleEmployeeSelect(null)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50"
            >
              All Employees
            </button>
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => handleEmployeeSelect(emp)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                  multiSelect &&
                  selectedEmployees.some((e) => e.id === emp.id) &&
                  "bg-green-50"
                }`}
              >
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackImg;
                  }}
                />
                <span>{emp.name}</span>
                {multiSelect && selectedEmployees.some((e) => e.id === emp.id) && (
                  <span className="ml-auto text-green-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSelector;
