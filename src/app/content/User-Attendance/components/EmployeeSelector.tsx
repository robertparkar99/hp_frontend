"use client";
import React, { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Employee } from "../types/attendance";

interface Department {
  id: number;
  department: string;
  parent_id: number;
  status: number;
}

interface EmployeeSelectorPropsBase {
  avatar?: any;
  className?: string;
}

interface SingleSelectProps extends EmployeeSelectorPropsBase {
  multiSelect?: false;
  empMultiSelect?: false;
  selectedEmployee: Employee | null;
  selectedDepartment: string | null;
  onSelectEmployee: (employee: Employee | null) => void;
  onSelectDepartment: (department: string | null) => void;
}

interface MultiSelectProps extends EmployeeSelectorPropsBase {
  multiSelect: true;
  empMultiSelect: true;
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
  empMultiSelect = false,
}) => {
  const [isEmpOpen, setIsEmpOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const deptRef = useRef<HTMLDivElement>(null);
  const empRef = useRef<HTMLDivElement>(null);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

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

  // Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } =
        JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // // ✅ Fetch departments
  // useEffect(() => {
  //   const fetchDepartments = async () => {
  //     try {
  //       if (!sessionData.url || !sessionData.subInstituteId) return;

  //       const res = await fetch(
  //         `${sessionData.url}/table_data?table=hrms_departments&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[status]=1`
  //       );

  //       const json = await res.json();
  //       const deptData: Department[] = Array.isArray(json)
  //         ? json
  //         : json.data ?? [];
  //       setDepartments(deptData);
  //     } catch (err) {
  //       console.error("Failed to fetch departments", err);
  //     }
  //   };

  //   fetchDepartments();
  // }, [sessionData]);

  // ✅ Fetch departments using NEW API (REAL department_id)
useEffect(() => {
  const fetchDepartments = async () => {
    try {
      if (!sessionData.subInstituteId) return;

      const res = await fetch(
        `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
      );

      const json = await res.json();
      if (!json.data) return;

      const deptList: Department[] = Object.entries(json.data).map(
        ([deptName, jobroles]: any, index) => ({
          id: jobroles[0]?.department_id ?? index,  // REAL dept_id
          department: deptName,
          parent_id: 0,
          status: 1,
        })
      );

      setDepartments(deptList);
    } catch (err) {
      console.error("Failed to fetch departments from new API", err);
    }
  };

  fetchDepartments();
}, [sessionData.subInstituteId]);


  // ✅ Get the correct employee value based on selection mode
  const getDisplayEmployee = () => {
    if (empMultiSelect) {
      return Array.isArray(selectedEmployee) ? selectedEmployee : [];
    } else {
      // For single select, ensure we return Employee | null
      return Array.isArray(selectedEmployee) 
        ? selectedEmployee.length > 0 ? selectedEmployee[0] : null 
        : selectedEmployee as Employee | null;
    }
  };

  // ✅ Get the correct department value based on selection mode
  const getDisplayDepartment = () => {
    if (multiSelect) {
      return Array.isArray(selectedDepartment) ? selectedDepartment : [];
    } else {
      // For single select, ensure we return string | null
      return Array.isArray(selectedDepartment) 
        ? selectedDepartment.length > 0 ? selectedDepartment[0] : null 
        : selectedDepartment as string | null;
    }
  };

  const displayEmployee = getDisplayEmployee();
  const displayDepartment = getDisplayDepartment();

  // ✅ Fetch employees whenever departments change
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!sessionData.url || !sessionData.subInstituteId) return;

        let results: any[] = [];

        if (
          (multiSelect && Array.isArray(displayDepartment) && displayDepartment.length === 0) ||
          (!multiSelect && !displayDepartment)
        ) {
          const res = await fetch(
            `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[status]=1`
          );
          const json = await res.json();
          results = Array.isArray(json) ? json : json.data ?? [];
        } else {
          const deptIds = multiSelect && Array.isArray(displayDepartment)
            ? displayDepartment
            : [displayDepartment as string];

          const requests = deptIds.map((deptId) =>
            fetch(
              `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[status]=1&filters[department_id]=${deptId}`
            ).then((res) => res.json())
          );
          const resAll = await Promise.all(requests);
          results = resAll.flatMap((r) => (Array.isArray(r) ? r : r.data ?? []));
        }

        const formatted: Employee[] = results.map((emp: any) => ({
          id: emp.id,
          name: `${emp.first_name || ""} ${emp.middle_name || ""} ${
            emp.last_name || ""
          }`.trim(),
          avatar: getAvatarUrl(emp.image),
          
          department: emp.department_id?.toString() || "",
        }));

        setEmployees(formatted);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };

    fetchEmployees();
  }, [displayDepartment, sessionData, multiSelect]);

  // Department select
  const handleDepartmentSelect = (dept: string | null) => {
    if (multiSelect) {
      const handler = onSelectDepartment as (department: string[]) => void;
      const currentDepts = Array.isArray(selectedDepartment) ? selectedDepartment : [];
      
      if (!dept) {
        handler([]);
      } else if (currentDepts.includes(dept)) {
        handler(currentDepts.filter((d) => d !== dept));
      } else {
        handler([...currentDepts, dept]);
      }
    } else {
      const handler = onSelectDepartment as (department: string | null) => void;
      handler(dept);
      setIsDeptOpen(false);
    }
  };

  // Employee select
  const handleEmployeeSelect = (emp: Employee | null) => {
    if (empMultiSelect) {
      const handler = onSelectEmployee as (employee: Employee[]) => void;
      const currentEmps = Array.isArray(selectedEmployee) ? selectedEmployee : [];
      
      if (!emp) {
        handler([]);
      } else if (currentEmps.some((e) => e.id === emp.id)) {
        handler(currentEmps.filter((e) => e.id !== emp.id));
      } else {
        handler([...currentEmps, emp]);
      }
    } else {
      const handler = onSelectEmployee as (employee: Employee | null) => void;
      handler(emp);
      setIsEmpOpen(false);
    }
  };

  // ✅ Ctrl + A (Select All)
  useEffect(() => {
    if (!multiSelect && !empMultiSelect) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();

        if (
          document.activeElement &&
          deptRef.current?.contains(document.activeElement)
        ) {
          const handlerDept = onSelectDepartment as (
            department: string[]
          ) => void;
          handlerDept(departments.map((d) => d.id.toString()));
        } else if (
          document.activeElement &&
          empRef.current?.contains(document.activeElement)
        ) {
          const handlerEmp = onSelectEmployee as (employee: Employee[]) => void;
          handlerEmp(employees);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [multiSelect, empMultiSelect, departments, employees, onSelectEmployee, onSelectDepartment]);

  return (
    <div className={`flex flex-row gap-4 ${className}`}>
      {/* Department Selector */}
      <div ref={deptRef} tabIndex={0} className="relative flex-1 outline-none">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Department
        </label>

        {multiSelect ? (
          <div
            tabIndex={0}
            className="border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white focus:ring-2 focus:ring-gray-500"
          >
            {departments.map((dept) => {
              const isSelected = Array.isArray(selectedDepartment) && 
                                selectedDepartment.includes(dept.id.toString());
              return (
                <div
                  key={dept.id}
                  onClick={() => handleDepartmentSelect(dept.id.toString())}
                  className={`px-3 py-2 cursor-pointer ${
                    isSelected
                      ? "bg-blue-400 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {dept.department}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setIsDeptOpen(!isDeptOpen);
                setIsEmpOpen(false);
              }}
              className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
            >
              <div className="flex items-center flex-wrap gap-2">
                {displayDepartment ? (
                  <span>
                    {
                      departments.find(
                        (d) => d.id.toString() === displayDepartment
                      )?.department
                    }
                  </span>
                ) : (
                  <span className="text-gray-500">All Departments</span>
                )}
              </div>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </span>
            </button>

            {isDeptOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                <button
                  onClick={() => handleDepartmentSelect(null)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    !displayDepartment ? "bg-blue-100" : ""
                  }`}
                >
                  All Departments
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => handleDepartmentSelect(dept.id.toString())}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                      displayDepartment === dept.id.toString() ? "bg-blue-100" : ""
                    }`}
                  >
                    {dept.department}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Employee Selector */}
      <div ref={empRef} tabIndex={0} className="relative flex-1 outline-none">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Employee
        </label>

        {empMultiSelect ? (
          <div
            tabIndex={0}
            className="border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white focus:ring-2 focus:ring-gray-500"
          >
            {employees.map((emp) => {
              const isSelected = Array.isArray(selectedEmployee) && 
                                selectedEmployee.some((e) => e.id === emp.id);
              return (
                <div
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp)}
                  className={`px-3 py-2 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-blue-400 text-white"
                      : "hover:bg-gray-100"
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
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setIsEmpOpen(!isEmpOpen);
                setIsDeptOpen(false);
              }}
              className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
            >
              <div className="flex items-center flex-wrap gap-2">
                {displayEmployee ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={displayEmployee.avatar}
                      alt={displayEmployee.name}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = fallbackImg;
                      }}
                    />
                    <span>{displayEmployee.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Select an employee...</span>
                )}
              </div>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </span>
            </button>

            {isEmpOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                <button
                  onClick={() => handleEmployeeSelect(null)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    !displayEmployee ? "bg-blue-100" : ""
                  }`}
                >
                  All Employees
                </button>
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleEmployeeSelect(emp)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                      displayEmployee && displayEmployee.id === emp.id
                        ? "bg-blue-100"
                        : ""
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
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeSelector;