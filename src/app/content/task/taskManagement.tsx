"use client";

import React, {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";

import {
  Dialog,
  DialogContent,
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
import TaskListModel from "../task/components/taskListModel";

interface SessionData {
  url: string;
  token: string;
  orgType: string;
  subInstituteId: string;
  userId: string;
  userProfile: string;
  syear: string;
}

interface Employee {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  department_id?: string;
}

interface JobRole {
  jobrole: string;
  allocated_standards: string;
}

interface Skill {
  title: string;
}

interface Task {
  task: string;
}

interface GeminiResponse {
  task_description: string;
  repeat_once_in_every: string;
  repeat_until_date: string;
  observation_point: string;
  skill_required: string[];
  kras: string;
  kpis: string;
  monitoring_point: string;
  task_type: string;
}

const TaskManagement = () => {
  const [sessionData, setSessionData] = useState<SessionData>({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    syear: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [jobroleList, setJobroleList] = useState<JobRole[]>([]);
  const [selJobrole, setSelJobrole] = useState<string>("");
  const [selJobroleText, setSelJobroleText] = useState<string>("");
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [selEmployee, setSelEmployee] = useState<string[]>([]);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [taskListArr, setTaskListArr] = useState<any>();
  const [previouslyAllocatedTasks, setPreviouslyAllocatedTasks] = useState<Task[]>([]);
  const [selTask, setSelTask] = useState<string>("");
  const [skillList, setSkillList] = useState<Skill[]>([]);
  const [selSkill, setSelSkill] = useState<string[]>([]);
  const [ObserverList, setObserverList] = useState<any[]>([]);
  const [selObserver, setSelObserver] = useState<string>("");
  const [taskType, setTaskType] = useState<string>("");
  const [repeatDays, setRepeatDays] = useState<string>("");
  const [repeatUntil, setRepeatUntil] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(0);
  const [isjobroleList, setIsJobroleList] = useState(false);
  const [isjobroleModel, setIsJobroleModel] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add state for form fields to better manage them
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [observationPoint, setObservationPoint] = useState<string>("");
  const [kras, setKras] = useState<string>("");
  const [kpis, setKpis] = useState<string>("");

  // Add state for department field
  const [departmentList, setDepartmentList] = useState<{ department_name: string; department_id?: string }[]>([]);
  const [selDepartment, setSelDepartment] = useState<string>("");
  const [selDepartmentId, setSelDepartmentId] = useState<string>("");

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
        syear,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
        syear: syear,
      });
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchDepartments();
      fetchObserver();
    }
  }, [sessionData.url, sessionData.token]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
      );
      const data = await res.json();

      // Extract unique department names and IDs from the API response
      const departments = data.data ?
        Object.keys(data.data).map(deptName => ({
          department_name: deptName,
          department_id: data.data[deptName][0]?.department_id || ''
        })) : [];
      setDepartmentList(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  };

  const fetchJobroles = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=users_jobrole&searchWord=${sessionData.subInstituteId}`
      );
      const data = await res.json();
      setJobroleList(data.searchData || []);
    } catch (error) {
      console.error("Error fetching jobroles:", error);
      alert("Failed to load jobroles");
    }
  };

  const fetchObserver = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=tbluser&filters['status']=1&filters[sub_institute_id]=${sessionData.subInstituteId}`
      );
      const data = await res.json();
      setObserverList(data || []);
    } catch (error) {
      console.error("Error fetching jobroles:", error);
      alert("Failed to load jobroles");
    }
  };

  const getEmployeeList = async (jobRole: string) => {
    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token}` +
        `&sub_institute_id=${sessionData.subInstituteId}` +
        `&org_type=${sessionData.orgType}` +
        `&searchType=jobrole_emp` +
        `&searchWord=${jobRole}`
      );
      const data = await res.json();
      const employees = Array.isArray(data.searchData)
        ? data.searchData
        : Object.values(data.searchData || {});
      setEmployeeList(employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to load employees");
    }
  };

  const fetchDepartmentWiseJobroles = async (departmentName: string) => {
    try {
      const res = await fetch(
        `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
      );
      const data = await res.json();

      // Filter job roles by selected department
      const deptData = data.data || {};
      const jobroles = deptData[departmentName] || [];

      // Transform to match expected JobRole interface
      const transformedJobroles = jobroles.map((jr: any) => ({
        jobrole: jr.jobrole,
        allocated_standards: jr.id.toString()
      }));

      setJobroleList(transformedJobroles);
      setSelJobrole("");
      setEmployeeList([]);
    } catch (error) {
      console.error("Error fetching department-wise jobroles:", error);
      alert("Failed to load department jobroles");
    }
  };

  const fetchDepartmentWiseEmployees = async (departmentName: string) => {
    try {
      const res = await fetch(
        `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
      );
      const data = await res.json();

      // Get all job roles for the selected department
      const deptData = data.data || {};
      const jobroles = deptData[departmentName] || [];

      // Extract unique employees from all job roles in this department
      const employeeMap = new Map<string, Employee>();

      jobroles.forEach((jr: any) => {
        if (jr.employees && Array.isArray(jr.employees)) {
          jr.employees.forEach((emp: any) => {
            if (emp.id && !employeeMap.has(emp.id)) {
              employeeMap.set(emp.id, {
                id: emp.id,
                first_name: emp.first_name || '',
                middle_name: emp.middle_name || '',
                last_name: emp.last_name || '',
                department_id: jr.department_id || ''
              });
            }
          });
        }
      });

      setEmployeeList(Array.from(employeeMap.values()));
    } catch (error) {
      console.error("Error fetching department-wise employees:", error);
      alert("Failed to load department employees");
    }
  };

  const fetchEmployeeDetails = async (userId: string) => {
    if (userId === "") {
      setSkillList([]);
      setTaskList([]);
      setPreviouslyAllocatedTasks([]);
    } else {
      try {
        const response = await fetch(
          `${sessionData.url}/user/add_user/${userId}/edit?type=API&token=${sessionData.token}` +
          `&sub_institute_id=${sessionData.subInstituteId}` +
          `&org_type=${sessionData.orgType}&syear=${sessionData.syear}`
        );

        const data = await response.json();
        setSkillList(data.jobroleSkills || []);
        setTaskList(data.jobroleTasks || []);
        setTaskListArr(data.jobroleTasks || []);
        
        // Fetch previously allocated tasks for this employee
        await fetchPreviouslyAllocatedTasks(userId);
      } catch (error) {
        console.error("Error fetching employee details:", error);
        alert("Failed to load employee details");
      }
    }
  };
  
  const fetchPreviouslyAllocatedTasks = async (userId: string) => {
    try {
      const response = await fetch(
        `${sessionData.url}/api/get-employee-tasks?user_id=${userId}&sub_institute_id=${sessionData.subInstituteId}`
      );
      const data = await response.json();
      
      // Extract unique task titles from previously allocated tasks
      const uniqueTasks = Array.isArray(data)
        ? data.map((task: any) => ({ task: task.task_title || task.task }))
        : [];
      
      setPreviouslyAllocatedTasks(uniqueTasks);
    } catch (error) {
      console.error("Error fetching previously allocated tasks:", error);
      setPreviouslyAllocatedTasks([]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleTaskTypeSelect = (type: string) => {
    setTaskType(type);
  };

  // Fixed date formatting function
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';

    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      // Try to parse the date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return '';
      }

      // Format to YYYY-MM-DD for input field
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Ensure date is properly formatted for API submission
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';

    // If it's already in correct format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Otherwise format it properly
    return formatDateForInput(dateString);
  };

  const handleBulkTaskSuccess = () => {
    setIsEditModalOpen(false);
    setIsJobroleModel(false);
    alert("Bulk tasks created successfully!");
    setSelEmployee([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // If no employees selected but department is selected, allow submission
    if (!selEmployee.length && !selDepartmentId) {
      alert("Please select either employees or a department");
      return;
    }
    
    if (!selTask || !taskType) {
      alert("Please fill all required fields");
      return;
    }

    // Validate repeat until date
    if (!repeatUntil) {
      alert("Please select a repeat until date");
      return;
    }

    const formattedRepeatUntil = formatDateForAPI(repeatUntil);
    if (!formattedRepeatUntil) {
      alert("Please select a valid repeat until date");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add all form fields to formData
      // Include department_id for each employee in TASK_ALLOCATED_TO
      // Use the selected department ID if available, otherwise fall back to employee's department_id
      const employeesWithDept = selEmployee.map(empId => {
        const employee = employeeList.find(e => e.id === empId);
        const deptId = selDepartmentId || employee?.department_id || '';
        return employee ? `${empId}:${deptId}` : empId;
      });
      
      // If no employees are selected but a department is selected, use the department ID
      if (selDepartmentId && selEmployee.length === 0) {
        formData.append("TASK_ALLOCATED_TO", selDepartmentId);
      } else if (employeesWithDept.length > 0) {
        formData.append("TASK_ALLOCATED_TO", employeesWithDept.join(","));
      }
      
      // Also log the formatted data for debugging
      const finalAllocatedTo = selDepartmentId && selEmployee.length === 0
        ? selDepartmentId
        : employeesWithDept.join(",");
      console.log("TASK_ALLOCATED_TO:", finalAllocatedTo);
      formData.append("task_title", selTask);
      formData.append("task_description", taskDescription);
      formData.append("skills", selSkill.join(","));
      formData.append("manageby", selObserver);
      formData.append("observation_point", observationPoint);
      formData.append("KRA", kras);
      formData.append("KPA", kpis);
      formData.append("selType", taskType);
      formData.append("repeat_days", repeatDays);
      formData.append("repeat_until", formattedRepeatUntil); // Use formatted date

      if (file) {
        formData.append("TASK_ATTACHMENT", file);
      }

      console.log("Submitting form data:", {
        task_title: selTask,
        task_description: taskDescription,
        repeat_days: repeatDays,
        repeat_until: formattedRepeatUntil,
        task_type: taskType,
        employees: selEmployee
      });

      const response = await fetch(
        `${sessionData.url}/task?type=API&token=${sessionData.token}` +
        `&sub_institute_id=${sessionData.subInstituteId}` +
        `&org_type=${sessionData.orgType}&syear=${sessionData.syear}&user_id=${sessionData.userId}&formType=multiUser`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Task created successfully for all selected employees!");
        resetForm();
      } else {
        throw new Error(result.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Something went wrong"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelDepartment("");
    setSelDepartmentId("");
    setSelJobrole("");
    setSelEmployee([]);
    setSelTask("");
    setSelSkill([]);
    setSelObserver("");
    setTaskType("");
    setRepeatDays("");
    setRepeatUntil("");
    setFile(null);
    setPreviewUrl(null);
    setMessage(0);
    setTaskDescription("");
    setObservationPoint("");
    setKras("");
    setKpis("");
    setPreviouslyAllocatedTasks([]);
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const geminiChat = async (prompt: string | '') => {
    try {
      if (prompt === '') {
        return;
      }
      setMessage(1);

      const skillsData = '[' + skillList.map(skill => skill.title).join(',') + ']';
      const response = await fetch(`${sessionData.url}/gemini_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt + ` for jobrole ${selJobroleText}, Generate a single JSON object with the following fields: task_description, repeat_once_in_every, repeat_until_date (format: YYYY-MM-DD), observation_point, kras (only 1), kpis(only 1), monitoring_point, task_type(High,Medium,Low), skill_required return in array and select from givien list ${skillsData}. Return as a single-element array containing only this object.`
        })
      })

      const data = await response.json();

      if (data[0]) {
        setMessage(2);
        const geminiData = data[0] as GeminiResponse;

        // Update form fields with Gemini response
        setTaskDescription(geminiData.task_description);

        const repeatMapping: { [key: string]: string } = {
          "Day": "1",
          "Week": "7",
          "Month": "30",
          "Year": "365"
        };
        setRepeatDays(repeatMapping[geminiData.repeat_once_in_every] || "1");

        const formattedDate = formatDateForInput(geminiData.repeat_until_date);
        setRepeatUntil(formattedDate);

        setObservationPoint(geminiData.observation_point);
        setKras(geminiData.kras);
        setKpis(geminiData.kpis);
        setSelSkill(geminiData.skill_required);
        setTaskType(geminiData.task_type || "Medium");
      } else {
        setMessage(3);
      }
    } catch (error) {
      console.error('Error in geminiChat:', error);
      setMessage(3);
    }
  }

  return (
    <>
      <div className="mainDiv bg-background rounded-xl px-5 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg h-[fit-content] mb-6">
            <div className="px-1 mb-2">
              <div className="w-full flex justify-between">
                <div>
                  <h2 className="text-2xl mt-2 text-left font-semibold text-foreground">
                    New Assignment
                  </h2>
                  <p className="text-muted-foreground">
                    Track and monitor task assignment progress
                  </p>
                </div>
                <div>
                  {isjobroleList && (
                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                      onClick={() => {
                        setIsJobroleModel(true);
                        setIsEditModalOpen(true);
                      }}>
                      <span
                        className="mdi mdi-format-list-checks"
                      ></span>
                      &nbsp; Bulk Tasks
                    </button>
                  )}
                </div>
              </div>

              <form className="space-y-6 mt-6" onSubmit={handleSubmit} ref={formRef}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Department */}
                  <div>
                    <label className="block mb-1 text-sm text-gray-900">
                      Department<span className="text-red-500">*</span>
                    </label>

                    <Select
                      value={selDepartment}
                      onValueChange={(value) => {
                        setSelDepartment(value);
                        const dept = departmentList.find(d => d.department_name === value);
                        setSelDepartmentId(dept?.department_id || '');
                        fetchDepartmentWiseJobroles(value);
                        fetchDepartmentWiseEmployees(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>

                      <SelectContent
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        avoidCollisions={false}
                        className="max-w-[350px] overflow-y-auto"
                        onWheel={(e) => e.stopPropagation()}
                      >

                        {departmentList.map((dept, index) => (
                          <SelectItem key={index} value={dept.department_name}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                  {/* Job Role */}
                  <div>
                    <label className="block mb-1 text-sm text-gray-900">
                      Job Role <span className="text-red-500">*</span>
                    </label>

                    <Select
                      value={selJobrole}
                      onValueChange={(value) => {
                        setSelJobrole(value);
                        const role = jobroleList.find(j => j.allocated_standards === value);
                        setSelJobroleText(role?.jobrole || "");
                        getEmployeeList(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Job Role" />
                      </SelectTrigger>

                      <SelectContent className="max-h-[260px] overflow-y-auto">
                        {jobroleList.map((jobrole, index) => (
                          <SelectItem
                            key={index}
                            value={jobrole.allocated_standards}
                          >
                            {jobrole.jobrole}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>

                  {/* Assign To */}
                  <div>
                    <label
                      htmlFor="assignTo"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Assign To{" "}
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                    </label>
                    <select
                      id="assignTo"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none resize"
                      value={selEmployee}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions
                        );
                        const userIds = selectedOptions.map(
                          (option) => option.value
                        );
                        setSelEmployee(userIds);
                        if (userIds.length > 0) {
                          fetchEmployeeDetails(userIds[userIds.length - 1]);
                        }
                        setIsJobroleList(true);
                      }}
                      multiple
                      required
                    >
                      <option value="">Select Employee</option>
                      {employeeList.map((empList, index) => (
                        <option key={index} value={empList.id}>
                          {empList?.first_name} {empList?.middle_name}{" "}
                          {empList?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Task Title */}
                  <div>
                    <label
                      htmlFor="taskTitle"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Task Title{" "}
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                    </label>
                    <div className="flex">
                      <input
                        id="taskTitle"
                        list="taskList"
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                        value={selTask}
                        onChange={(e) => setSelTask(e.target.value)}
                        placeholder="Type or select a task"
                        required
                      />
                      <span className="mdi mdi-creation text-[20px] text-yellow-400" onClick={() => geminiChat(selTask)} title="Generate Task with the help of AI"></span>
                    </div>
                    {message === 1 && (
                      <div className="flex items-center text-yellow-400">
                        <span className="mdi mdi-loading animate-spin mr-2 text-[20px]"></span>
                        <span>Please wait while we generate your task details...</span>
                      </div>
                    )}
                    {message === 2 && (
                      <div className="flex items-center text-green-400">
                        <span className="mdi mdi-check-circle mr-2 text-[20px]"></span>
                        <span>Task details generated successfully! Feel free to customize them as needed.</span>
                      </div>
                    )}
                    {message === 3 && (
                      <div className="flex items-center text-red-400">
                        <span className="mdi mdi-alert-circle mr-2 text-[20px]"></span>
                        <span>Sorry, we encountered an error while generating task details. Please try again.</span>
                      </div>
                    )}
                    <datalist id="taskList">
                      {/* Job-role based tasks (default) */}
                      {taskList.map((task, index) => (
                        <option key={`jobrole-${index}`} value={task.task}>
                          {task.task}
                        </option>
                      ))}
                      
                      {/* Previously allocated tasks */}
                      {previouslyAllocatedTasks.map((task, index) => (
                        <option key={`allocated-${index}`} value={task.task}>
                          {task.task}
                        </option>
                      ))}
                    </datalist>
                    
                    {/* Display task categories info */}
                    {(taskList.length > 0 || previouslyAllocatedTasks.length > 0) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
  <div className="flex flex-col space-y-1 text-sm text-gray-600">

    {/* Previously / Recently Used Tasks */}
    {previouslyAllocatedTasks.length > 0 && (
      <div className="flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        <span>
          {previouslyAllocatedTasks.length} Previously / Recently used task(s)
        </span>
      </div>
    )}

    {/* Job-role Based Tasks */}
    {taskList.length > 0 && (
      <div className="flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        <span>
          {taskList.length} Job-role based task(s)
        </span>
      </div>
    )}

  </div>
</div>

                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Task Description */}
                  <div>
                    <label
                      htmlFor="task_description"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Task Description
                    </label>
                    <textarea
                      name="description"
                      id="task_description"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      placeholder="Add Task Description.."
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Repeat Days */}
                  <div>
                    <label
                      htmlFor="days"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Repeat Once in every{" "}
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                    </label>
                    <select
                      id="days"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      value={repeatDays}
                      onChange={(e) => setRepeatDays(e.target.value)}
                      required
                    >
                      <option value="">Select Days</option>
                      {Array.from({ length: 14 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day} {day === 1 ? "day" : "days"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Repeat Until - FIXED */}
                  <div>
                    <label
                      htmlFor="repeatUntil"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Repeat until{" "}
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                    </label>
                    <input
                      id="repeatUntil"
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      value={repeatUntil}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        console.log("Selected Date for repeat until:", selectedDate);
                        setRepeatUntil(selectedDate);
                      }}
                      required
                      min={new Date().toISOString().split('T')[0]} // Today's date as minimum
                    />
                    {repeatUntil && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selected: {new Date(repeatUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* ... rest of your form fields with controlled components ... */}

                {/* Make sure to update all other form fields to use controlled components */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Skills Required */}
                  <div>
                    <label
                      htmlFor="skillsRequired"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Skills Required
                    </label>
                    <select
                      id="skillsRequired"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none resize"
                      multiple
                      value={selSkill}
                      onChange={(e) => {
                        const options = e.target.options;
                        const selectedValues: string[] = [];
                        for (let i = 0; i < options.length; i++) {
                          if (options[i].selected) {
                            selectedValues.push(options[i].value);
                          }
                        }
                        setSelSkill(selectedValues);
                      }}
                    >
                      <option value="">Select Required Skills</option>
                      {skillList.map((skill, index) => (
                        <option key={index} value={skill.title}>
                          {skill.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Observer */}
                  <div>
                    <label
                      htmlFor="observer"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Observer{" "}
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                    </label>
                    <select
                      id="observer"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      value={selObserver}
                      onChange={(e) => setSelObserver(e.target.value)}
                      required
                    >
                      <option value="">Select Observer</option>
                      {ObserverList.map((observer, index) => (
                        <option key={index} value={observer.id}>
                          {observer.first_name} {observer.middle_name}{" "}
                          {observer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* KRAs */}
                  <div>
                    <label
                      htmlFor="kras"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Key Result Areas (KRAs)
                    </label>
                    <input
                      id="kras"
                      type="text"
                      placeholder="Type KRAS"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      value={kras}
                      onChange={(e) => setKras(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* KPIs */}
                  <div>
                    <label
                      htmlFor="kpis"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Performance Indicators (KPIs)
                    </label>
                    <input
                      id="kpis"
                      type="text"
                      placeholder="Type KPIS"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      value={kpis}
                      onChange={(e) => setKpis(e.target.value)}
                    />
                  </div>

                  {/* Monitoring Points */}
                  <div>
                    <label
                      htmlFor="observation_point"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Monitoring Points
                    </label>
                    <textarea
                      name="observation_point"
                      id="observation_point"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      placeholder="Add monitoring points.."
                      value={observationPoint}
                      onChange={(e) => setObservationPoint(e.target.value)}
                    ></textarea>
                  </div>

                  {/* File Upload with Preview */}
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-900">
                      Attachment
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={handleClick}
                          className="px-4 py-2 text-sm text-gray border-1 border-[#ddd] rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Select File
                        </button>
                        <input
                          type="file"
                          ref={inputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {file && (
                          <span className="text-sm text-gray-600 mt-1 truncate max-w-[150px]">
                            {file.name}
                          </span>
                        )}
                      </div>

                      {previewUrl && (
                        <div className="relative">
                          {file?.type.startsWith("image/") ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-[100px] h-[100px] object-cover rounded border border-gray-300"
                            />
                          ) : (
                            <div className="w-[100px] h-[100px] bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-xs text-center p-1">
                                {file?.name} ({file?.type})
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: JPG, PNG, PDF, DOCX (Max 5MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Task Type Buttons */}
                  <div>
                    <label
                      htmlFor="task_type"
                      className="block mb-1 text-sm text-gray-900"
                    >
                      Task priority {" "}
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                    </label>
                    <div className="flex space-x-4 mt-2 justify-around">
                      <button
                        type="button"
                        className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${taskType === "High"
                          ? "border-red-600 text-red-700 bg-[#fbeded]"
                          : "border-red-400 text-red-700 bg-white"
                          }`}
                        onClick={() => handleTaskTypeSelect("High")}
                      >
                        <span className="w-4 h-4 bg-red-600 rounded-full mb-1"></span>
                        <span className="font-semibold text-sm">High</span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${taskType === "Medium"
                          ? "border-yellow-600 text-yellow-700 bg-[#FEF6E9]"
                          : "border-yellow-400 text-yellow-700 bg-white"
                          }`}
                        onClick={() => handleTaskTypeSelect("Medium")}
                      >
                        <span className="w-4 h-4 bg-yellow-500 rounded-full mb-1"></span>
                        <span className="font-semibold text-sm">Medium</span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${taskType === "Low"
                          ? "border-teal-600 text-teal-700 bg-[#EBF9F4]"
                          : "border-teal-400 text-teal-700 bg-white"
                          }`}
                        onClick={() => handleTaskTypeSelect("Low")}
                      >
                        <span className="w-4 h-4 bg-teal-500 rounded-full mb-1"></span>
                        <span className="font-semibold text-sm">Low</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {isjobroleModel && (
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setIsJobroleModel(false);
          }
        }}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto hide-scroll">
            <DialogHeader>
              <DialogTitle>Bulk Task Assignment</DialogTitle>
            </DialogHeader>
            <TaskListModel
              taskListArr={taskListArr}
              ObserverList={ObserverList}
              sessionData={sessionData}
              selectedEmployees={selEmployee.join(",")}
              onSuccess={handleBulkTaskSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TaskManagement;