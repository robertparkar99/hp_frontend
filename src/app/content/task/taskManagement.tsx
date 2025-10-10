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
  DialogFooter,
} from "@/components/ui/dialog";
import { h1 } from "framer-motion/m";
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
    skill_required: [];
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
  const [selTask, setSelTask] = useState<string>("");
  const [skillList, setSkillList] = useState<Skill[]>([]);
  const [selSkill, setSelSkill] = useState<string[]>([]);
  const [ObserverList, setObserverList] = useState<any[]>([]);
  const [selObserver, setSelObserver] = useState<string>("");
  const [taskType, setTaskType] = useState<string>(""); // 'daily', 'weekly', 'monthly'
  const [repeatDays, setRepeatDays] = useState<string>("");
  const [repeatUntil, setRepeatUntil] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(0);
  const [isjobroleList, setIsJobroleList] = useState(false);
  const [isjobroleModel, setIsJobroleModel] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      fetchJobroles();
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

  const fetchEmployeeDetails = async (userId: string) => {
    if (userId === "") {
      setSkillList([]);
      setTaskList([]);
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
      } catch (error) {
        console.error("Error fetching employee details:", error);
        alert("Failed to load employee details");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a preview URL and revoke the previous one if it exists
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
    // Clear the file input value
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleTaskTypeSelect = (type: string) => {
    setTaskType(type);
  };

  // In TaskManagement.tsx - add this function
const handleBulkTaskSuccess = () => {
  setIsEditModalOpen(false);
  setIsJobroleModel(false);
  
  // Optional: Refresh data or show success message
  alert("Bulk tasks created successfully!");
  setSelEmployee([]);
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selEmployee || !selTask || !taskType) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add all form fields to formData
      formData.append("TASK_ALLOCATED_TO", selEmployee.join(","));
      formData.append("task_title", selTask);
      formData.append(
        "task_description",
        (document.getElementById("task_description") as HTMLTextAreaElement)
          .value
      );
      formData.append("skills", selSkill.join(","));
      formData.append("manageby", selObserver);
      formData.append(
        "observation_point",
        (document.getElementById("observation_point") as HTMLTextAreaElement)
          .value
      );
      formData.append(
        "KRA",
        (document.getElementById("kras") as HTMLInputElement).value
      );
      formData.append(
        "KPA",
        (document.getElementById("kpis") as HTMLInputElement).value
      );
      formData.append("selType", taskType);
      formData.append("repeat_days", repeatDays);
      formData.append("repeat_until", repeatUntil);

      if (file) {
        formData.append("TASK_ATTACHMENT", file);
      }

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
      // console.log('Result:', result);
      if (response.ok) {
        alert("Task created successfully!");
        // Reset form
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
        (
          document.getElementById("task_description") as HTMLTextAreaElement
        ).value = "";
        (
          document.getElementById("observation_point") as HTMLTextAreaElement
        ).value = "";
        (document.getElementById("kras") as HTMLInputElement).value = "";
        (document.getElementById("kpis") as HTMLInputElement).value = "";
        // Clear file input
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } else {
        throw new Error(result.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Something went wrong"
        }`
      );
    } finally {
      setIsSubmitting(false);
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
        prompt: prompt + ` for jobrole ${selJobroleText}, Generate a single JSON object with the following fields: task_description, repeat_once_in_every, repeat_until_date (${new Date().toISOString().split('T')[0]} to ${new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split('T')[0]}), observation_point, kras (only 1), kpis(only 1), monitoring_point, task_type(High,Medium,Low), skill_required return in array and select from givien list ${skillsData}. Return as a single-element array containing only this object.`
      })
    })

    const data = await response.json();

    if (data[0]) {
      setMessage(2);
      const geminiData = data[0] as GeminiResponse;
      
      // Update form fields with Gemini response
      (document.getElementById("task_description") as HTMLTextAreaElement).value = geminiData.task_description;
      
      // Convert repeat_once_in_every from text to number (e.g., "Month" -> "30")
      const repeatMapping: { [key: string]: string } = {
        "Day": "1",
        "Week": "7", 
        "Month": "30",
        "Year": "365"
      };
      setRepeatDays(repeatMapping[geminiData.repeat_once_in_every] || "1");
      
      setRepeatUntil(geminiData.repeat_until_date);
      (document.getElementById("observation_point") as HTMLTextAreaElement).value = geminiData.observation_point;
      (document.getElementById("kras") as HTMLInputElement).value = geminiData.kras;
      (document.getElementById("kpis") as HTMLInputElement).value = geminiData.kpis;
      setSelSkill(geminiData.skill_required);
      // Map task_type to UI values (High, Medium, Low)
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
            <hr className="my-6" />
            {/* Single Form with 3 columns per row */}
            <form className="space-y-6" onSubmit={handleSubmit} ref={formRef}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Role */}
                <div>
                  <label
                    htmlFor="jobRole"
                    className="block mb-1 text-sm text-gray-900"
                  >
                    Job role{" "}
                    <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                  </label>
                  <select
                    id="jobRole"
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                    value={selJobrole}
                    onChange={(e) => {
                      const selectedJobRole = e.target.value;
                      setSelJobrole(selectedJobRole);
                      setSelJobroleText(e.target.options[e.target.selectedIndex].text);
                      getEmployeeList(selectedJobRole);
                    }}
                    required
                  >
                    <option value="">Select Job Role</option>
                    {jobroleList.map((jobrole, index) => (
                      <option key={index} value={jobrole.allocated_standards}>
                        {jobrole.jobrole}
                      </option>
                    ))}
                  </select>
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
                      // Only fetch details for the last selected employee
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
                  <span className="mdi mdi-creation text-[20px] text-yellow-400" onClick={()=>geminiChat(selTask)} title="Generate Task with the help of AI"></span>
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
                    {taskList.map((task, index) => (
                      <option key={index} value={task.task}>
                        {task.task}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Task Description - Full width */}
                <div>
                  <label
                    htmlFor="taskTitle"
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
                  >
                    <option value="">Select Days</option>
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day} {day === 1 ? "day" : "days"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Repeat Until */}
                <div>
                  <label
                    htmlFor="Date"
                    className="block mb-1 text-sm text-gray-900"
                  >
                    Repeat until{" "}
                    <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                  </label>
                  <input
                    id="Date"
                    type="date"
                    placeholder="Type Repeat until Date"
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                    value={repeatUntil}
                    onChange={(e) => setRepeatUntil(e.target.value)}
                  />
                </div>
              </div>

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
                  />
                </div>
                {/* Monitoring Points - Full width */}
                <div>
                  <label
                    htmlFor="kpis"
                    className="block mb-1 text-sm text-gray-900"
                  >
                    Monitoring Points
                  </label>
                  <textarea
                    name="observation_point"
                    id="observation_point"
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                    placeholder="Add monitoring points.."
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
                    Task Type{" "}
                    <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                  </label>
                  <div className="flex space-x-4 mt-2 justify-around">
                    <button
                      type="button"
                      className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${
                        taskType === "High"
                          ? "border-red-600 text-red-700 bg-[#fbeded]"
                          : "border-red-400 text-red-700 bg-white"
                      }`}
                      onClick={() => handleTaskTypeSelect("High")}
                    >
                      <span className="w-4 h-4 bg-red-600 rounded-full mb-1"></span>
                      <span className="font-semibold text-sm">High</span>
                      {/* <span className="text-xs text-gray-500">Task</span> */}
                    </button>
                    <button
                      type="button"
                      className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${
                        taskType === "Medium"
                          ? "border-yellow-600 text-yellow-700 bg-[#FEF6E9]"
                          : "border-yellow-400 text-yellow-700 bg-white"
                      }`}
                      onClick={() => handleTaskTypeSelect("Medium")}
                    >
                      <span className="w-4 h-4 bg-yellow-500 rounded-full mb-1"></span>
                      <span className="font-semibold text-sm">Medium</span>
                      {/* <span className="text-xs text-gray-500">Task</span> */}
                    </button>
                    <button
                      type="button"
                      className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${
                        taskType === "Low"
                          ? "border-teal-600 text-teal-700 bg-[#EBF9F4]"
                          : "border-teal-400 text-teal-700 bg-white"
                      }`}
                      onClick={() => handleTaskTypeSelect("Low")}
                    >
                      <span className="w-4 h-4 bg-teal-500 rounded-full mb-1"></span>
                      <span className="font-semibold text-sm">Low</span>
                      {/* <span className="text-xs text-gray-500">Task</span> */}
                    </button>
                  </div>
                </div>
              </div>
              {/* Hidden input for task type */}
              <input type="hidden" name="task_type" value={taskType} />

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
            <TaskListModel taskListArr={taskListArr} ObserverList={ObserverList} sessionData={sessionData} selectedEmployees={selEmployee.join(",")}  onSuccess={handleBulkTaskSuccess} />
        </DialogContent>
      </Dialog>
    )}
   </>
  );
};

export default TaskManagement;
