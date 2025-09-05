"use client";

import React, { useEffect, useState, useRef, ChangeEvent, DragEvent, FormEvent } from "react";

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

const TaskManagement = () => {
    const [sessionData, setSessionData] = useState<SessionData>({
        url: "",
        token: "",
        orgType: "",
        subInstituteId: "",
        userId: "",
        userProfile: "",
        syear: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [jobroleList, setJobroleList] = useState<JobRole[]>([]);
    const [selJobrole, setSelJobrole] = useState<string>('');
    const [employeeList, setEmployeeList] = useState<Employee[]>([]);
    const [selEmployee, setSelEmployee] = useState<string>('');
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [selTask, setSelTask] = useState<string>('');
    const [skillList, setSkillList] = useState<Skill[]>([]);
    const [selSkill, setSelSkill] = useState<string[]>([]);
    const [ObserverList, setObserverList] = useState<any[]>([]);
    const [selObserver, setSelObserver] = useState<string>('');
    const [taskType, setTaskType] = useState<string>(''); // 'daily', 'weekly', 'monthly'
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, syear } = JSON.parse(userData);
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
            const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=users_jobrole&searchWord=${sessionData.subInstituteId}`);
            const data = await res.json();
            setJobroleList(data.searchData || []);
        } catch (error) {
            console.error("Error fetching jobroles:", error);
            alert("Failed to load jobroles");
        }
    }

    const fetchObserver = async () => {
        try {
            const res = await fetch(`${sessionData.url}/table_data?table=tbluser&filters['status']=1&filters[sub_institute_id]=${sessionData.subInstituteId}`);
            const data = await res.json();
            setObserverList(data || []);
        } catch (error) {
            console.error("Error fetching jobroles:", error);
            alert("Failed to load jobroles");
        }
    }

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
        if (userId === '') {
            setSkillList([]);
            setTaskList([]);
        }
        else {
            try {
                const response = await fetch(`${sessionData.url}/user/add_user/${userId}/edit?type=API&token=${sessionData.token}` +
                    `&sub_institute_id=${sessionData.subInstituteId}` +
                    `&org_type=${sessionData.orgType}&syear=${sessionData.syear}`);

                const data = await response.json();
                setSkillList(data.jobroleSkills || []);
                setTaskList(data.jobroleTasks || []);

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

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            // Create a preview URL and revoke the previous one if it exists
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            const objectUrl = URL.createObjectURL(droppedFile);
            setPreviewUrl(objectUrl);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
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
            inputRef.current.value = '';
        }
    };

    const handleTaskTypeSelect = (type: string) => {
        setTaskType(type);
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
            formData.append('TASK_ALLOCATED_TO', selEmployee);
            formData.append('task_title', selTask);
            formData.append('task_description', (document.getElementById('task_description') as HTMLTextAreaElement).value);
            formData.append('skills', selSkill.join(','));
            formData.append('manageby', selObserver);
            formData.append('observation_point', (document.getElementById('observation_point') as HTMLTextAreaElement).value);
            formData.append('KRA', (document.getElementById('kras') as HTMLInputElement).value);
            formData.append('KPA', (document.getElementById('kpis') as HTMLInputElement).value);
            formData.append('selType', taskType);

            if (file) {
                formData.append('TASK_ATTACHMENT', file);
            }

            const response = await fetch(`${sessionData.url}/task?type=API&token=${sessionData.token}` +
                `&sub_institute_id=${sessionData.subInstituteId}` +
                `&org_type=${sessionData.orgType}&syear=${sessionData.syear}&user_id=${sessionData.userId}&formType=single`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionData.token}`,
                },
                body: formData
            });

            const result = await response.json();
            console.log('Result:', result);
            if (response.ok) {
                alert('Task created successfully!');
                // Reset form
                setSelJobrole('');
                setSelEmployee('');
                setSelTask('');
                setSelSkill([]);
                setSelObserver('');
                setTaskType('');
                setFile(null);
                setPreviewUrl(null);
                (document.getElementById('task_description') as HTMLTextAreaElement).value = '';
                (document.getElementById('observation_point') as HTMLTextAreaElement).value = '';
                (document.getElementById('kras') as HTMLInputElement).value = '';
                (document.getElementById('kpis') as HTMLInputElement).value = '';
                // Clear file input
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            } else {
                throw new Error(result.message || 'Failed to create task');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mainDiv">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-18 p-2">
                {/* Left Card */}
                <div className="pt-1 rounded-lg bg-gradient-to-r from-[#47A0FF] to-[#38C0AA] h-[fit-content]">
                    <div className="bg-[#FAFAFA] border-2 border-[#D0E7FF] rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4 space-x-3">
                            <div className="bg-[#00AF93] p-2 rounded-full">
                                <img src="\assets\task_management\rightside.png" alt="leftImg" className="h-[30px]" />
                            </div>
                            <h2 className="font-bold text-gray-800 text-lg">Organization & Context</h2>
                        </div>
                        <hr className="mb-6 border-gray-300" />

                        {/* Form Fields */}
                        <form className="space-y-6 px-2" onSubmit={handleSubmit} ref={formRef}>
                            <div>
                                <label htmlFor="jobRole" className="block mb-1 text-sm text-gray-900">Job role <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                                </label>
                                <select
                                    id="jobRole"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                    value={selJobrole}
                                    onChange={(e) => {
                                        const selectedJobRole = e.target.value;
                                        setSelJobrole(selectedJobRole);
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

                            <div>
                                <label htmlFor="assignTo" className="block mb-1 text-sm text-gray-900">Assign To <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                                <select
                                    id="assignTo"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                    value={selEmployee}
                                    onChange={(e) => {
                                        const userId = e.target.value;
                                        setSelEmployee(userId);
                                        fetchEmployeeDetails(userId);
                                    }}
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employeeList.map((empList, index) => (
                                        <option key={index} value={empList.id}>
                                            {empList?.first_name} {empList?.middle_name} {empList?.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="taskTitle" className="block mb-1 text-sm text-gray-900">Task Title <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                                <input
                                    id="taskTitle"
                                    list="taskList"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                    value={selTask}
                                    onChange={(e) => setSelTask(e.target.value)}
                                    placeholder="Type or select a task"
                                    required
                                />
                                <datalist id="taskList">
                                    {taskList.map((task, index) => (
                                        <option key={index} value={task.task}>
                                            {task.task}
                                        </option>
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label htmlFor="taskTitle" className="block mb-1 text-sm text-gray-900">Task Description</label>
                                <textarea
                                    name="description"
                                    id="task_description"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                    placeholder="Add Task Description.."
                                ></textarea>
                            </div>
                            {/* added on 20-08-2025 add frequency like CRM  */}
                            <div>
                                <label htmlFor="taskTitle" className="block mb-1 text-sm text-gray-900">Repeat Once in every</label>
                                <input
                                    id="days"
                                    type="number"
                                    placeholder="Type Repeat Days"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="taskTitle" className="block mb-1 text-sm text-gray-900">Repeat until</label>
                                <input
                                    id="Date"
                                    type="date"
                                    placeholder="Type Repeat until Date"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                />
                            </div>
                            {/* end frequency */}
                            {/* File Upload with Preview */}
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-900">Attachment</label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={handleClick}
                                >
                                    <input
                                        type="file"
                                        ref={inputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {previewUrl ? (
                                        <div className="relative">
                                            {file?.type.startsWith('image/') ? (
                                                <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto mb-2 rounded" />
                                            ) : (
                                                <div className="flex items-center justify-center h-40 bg-gray-100 rounded mb-2">
                                                    <span className="text-gray-500">
                                                        {file?.name} ({file?.type})
                                                    </span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile();
                                                }}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                            <p className="text-sm text-gray-600 truncate">{file?.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <svg className="w-8 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                                </svg>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">Supports: JPG, PNG, PDF, DOCX (Max 5MB)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Card */}
                <div className="pt-1 rounded-lg bg-gradient-to-r from-[#47A0FF] to-[#38C0AA] h-[fit-content]">
                    <div className="bg-[#FAFAFA] border-2 border-[#D0E7FF] rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4 space-x-3">
                            <div className="bg-[#00AF93] p-2 rounded-full">
                                <img src="\assets\task_management\rightside.png" alt="rightImg" className="h-[30px]" />
                            </div>
                            <h2 className="font-bold text-gray-800 text-lg">Details & Configuration</h2>
                        </div>
                        <hr className="mb-6 border-gray-300" />

                        {/* Form Fields */}
                        <form className="space-y-6 px-2" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="skillsRequired" className="block mb-1 text-sm text-gray-900">Skills Required</label>
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

                            <div>
                                <label htmlFor="observer" className="block mb-1 text-sm text-gray-900">Observer <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                                <select
                                    id="observer"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                    value={selObserver}
                                    onChange={(e) => setSelObserver(e.target.value)}
                                >
                                    <option value="">Select Observer</option>
                                    {ObserverList.map((observer, index) => (
                                        <option key={index} value={observer.id}>
                                            {observer.first_name} {observer.middle_name} {observer.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="kpis" className="block mb-1 text-sm text-gray-900">Monitoring Points</label>
                                <textarea
                                    name="observation_point"
                                    id="observation_point"
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                    placeholder="Add monitoring points.."
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="kras" className="block mb-1 text-sm text-gray-900">Key Result Areas (KRAs)</label>
                                <input
                                    id="kras"
                                    type="text"
                                    placeholder="Type KRAS"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="kpis" className="block mb-1 text-sm text-gray-900">Performance Indicators (KPIs)</label>
                                <input
                                    id="kpis"
                                    type="text"
                                    placeholder="Type KPIS"
                                    className="w-full border border-gray-300 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                                />
                            </div>

                            {/* Priority Buttons */}
                            <label htmlFor="task_type" className="block mb-1 text-sm text-gray-900">Task Type <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                            <div className="flex space-x-4 mt-6 justify-around">
                                <button
                                    type="button"
                                    className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${taskType === 'High' ? 'border-blue-600 text-blue-700 bg-[#eaf7ff]' : 'border-blue-400 text-blue-700 bg-white'}`}
                                    onClick={() => handleTaskTypeSelect('High')}
                                >
                                    <span className="w-4 h-4 bg-blue-600 rounded-full mb-1"></span>
                                    <span className="font-semibold text-sm">High</span>
                                    {/* <span className="text-xs text-gray-500">Task</span> */}
                                </button>
                                <button
                                    type="button"
                                    className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${taskType === 'Medium' ? 'border-yellow-600 text-yellow-700 bg-[#FEF6E9]' : 'border-yellow-400 text-yellow-700 bg-white'}`}
                                    onClick={() => handleTaskTypeSelect('Medium')}
                                >
                                    <span className="w-4 h-4 bg-yellow-500 rounded-full mb-1"></span>
                                    <span className="font-semibold text-sm">Medium</span>
                                    {/* <span className="text-xs text-gray-500">Task</span> */}
                                </button>
                                <button
                                    type="button"
                                    className={`flex flex-col items-center border-2 rounded-lg py-3 px-4 w-24 transition ${taskType === 'Low' ? 'border-teal-600 text-teal-700 bg-[#EBF9F4]' : 'border-teal-400 text-teal-700 bg-white'}`}
                                    onClick={() => handleTaskTypeSelect('Low')}
                                >
                                    <span className="w-4 h-4 bg-teal-500 rounded-full mb-1"></span>
                                    <span className="font-semibold text-sm">Low</span>
                                    {/* <span className="text-xs text-gray-500">Task</span> */}
                                </button>
                            </div>

                            {/* Hidden input for task type */}
                            <input type="hidden" name="task_type" value={taskType} />
                        </form>
                    </div>
                </div>
            </div>

            {/* Submit Button - Centered between forms */}
            <div className="flex justify-center mt-6 mb-10">
                <button
                    type="submit"
                    onClick={(e) => formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                    className="w-[200px] bg-[#00AF93] text-white py-3 px-6 rounded-md font-medium hover:bg-[#008D75] transition disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </span>
                    ) : 'Submit'}
                </button>
            </div>
        </div>
    );
};

export default TaskManagement;