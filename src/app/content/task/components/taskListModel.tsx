


"use client";

import React, { useEffect, useState, FormEvent } from "react";

type Task = {
  task: string;
};

type Observer = {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
};

type SessionData = {
  url: string;
  token: string;
  subInstituteId: string;
  orgType: string;
  syear: string;
  userId: string;
};

type Props = {
  taskListArr: Task[];
  ObserverList: Observer[];
  sessionData: SessionData;
  selectedEmployees: any;
     onSuccess?: (createdCount: number) => void;
  
};

type FormDataItem = {
  task_description: string;
  repeat_days: string;
  TASK_DATE: string;
  task_allocated: string;
  task_type: string;
};

const TaskListData: React.FC<Props> = ({ 
  taskListArr, 
  ObserverList, 
  sessionData, 
  selectedEmployees,
  onSuccess // Destructure the new prop
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState<{
    [task_title: string]: FormDataItem;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeesArray, setEmployeesArray] = useState<string[]>([]);

  // Initialize form data with default values and process employees
  useEffect(() => {
    const initialFormData: typeof formData = {};
    taskListArr.forEach((task: Task, index: number) => {
      const taskTitle = task.task;
      initialFormData[taskTitle] = {
        task_description: "",
        repeat_days: "1",
        TASK_DATE: "",
        task_allocated: ObserverList[0]?.id || "",
        task_type: "Medium"
      };
    });
    setFormData(initialFormData);

    // Process selected employees
    const processedEmployees = getSelectedEmployeesArray();
    setEmployeesArray(processedEmployees);
    
    console.log('Original selectedEmployees:', selectedEmployees);
    console.log('Processed employees array:', processedEmployees);
  }, [taskListArr, ObserverList, selectedEmployees]);

  // Helper function to normalize selectedEmployees to array
  const getSelectedEmployeesArray = (): string[] => {
    if (!selectedEmployees) {
      console.log('selectedEmployees is null or undefined');
      return [];
    }
    
    console.log('Type of selectedEmployees:', typeof selectedEmployees);
    console.log('Value of selectedEmployees:', selectedEmployees);

    if (Array.isArray(selectedEmployees)) {
      if (selectedEmployees.length === 0) {
        console.log('selectedEmployees is an empty array');
        return [];
      }
      
      // Check if it's an array of objects with id properties or just strings
      const firstItem = selectedEmployees[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        // Array of objects - extract IDs
        const ids = selectedEmployees.map((emp: any) => {
          if (emp.id) return emp.id.toString();
          if (emp.user_id) return emp.user_id.toString();
          if (emp.value) return emp.value.toString();
          return emp.toString();
        }).filter(id => id && id !== '');
        console.log('Extracted IDs from object array:', ids);
        return ids;
      } else {
        // Array of strings or numbers
        const strings = selectedEmployees.map((emp: any) => emp.toString()).filter(emp => emp !== '');
        console.log('String array:', strings);
        return strings;
      }
    }
    
    if (typeof selectedEmployees === 'string') {
      if (selectedEmployees.trim() === '') {
        console.log('selectedEmployees is an empty string');
        return [];
      }
      const splitArray = selectedEmployees.split(',').filter(item => item.trim() !== '');
      console.log('Split string array:', splitArray);
      return splitArray;
    }
    
    if (typeof selectedEmployees === 'object' && selectedEmployees !== null) {
      // Single object
      if (selectedEmployees.id) {
        console.log('Single object with id:', selectedEmployees.id);
        return [selectedEmployees.id.toString()];
      }
      if (selectedEmployees.user_id) {
        console.log('Single object with user_id:', selectedEmployees.user_id);
        return [selectedEmployees.user_id.toString()];
      }
      console.log('Single object without id:', selectedEmployees);
      return [selectedEmployees.toString()];
    }
    
    // Single value (number, boolean, etc.)
    console.log('Single value:', selectedEmployees);
    return [selectedEmployees.toString()];
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows([...Array(taskListArr.length).keys()]);
    } else {
      setSelectedRows([]);
    }
  };

  const handleCheckboxChange = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, index]);
      if (selectedRows.length + 1 === taskListArr.length) {
        setSelectAll(true);
      }
    }
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const taskTitle = taskListArr[index].task;
    setFormData({
      ...formData,
      [taskTitle]: {
        ...formData[taskTitle],
        task_description: field === "description" ? value : (formData[taskTitle]?.task_description || ""),
        repeat_days: field === "repeat" ? value : (formData[taskTitle]?.repeat_days || "1"),
        TASK_DATE: field === "date" ? value : (formData[taskTitle]?.TASK_DATE || ""),
        task_allocated: field === "observer" ? value : (formData[taskTitle]?.task_allocated || ObserverList[0]?.id || ""),
        task_type: field === "taskType" ? value : (formData[taskTitle]?.task_type || "Medium"),
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate if any tasks are selected
    if (selectedRows.length === 0) {
      alert("Please select at least one task to save");
      return;
    }

    // Validate if employees are selected
    if (employeesArray.length === 0) {
      alert("Please select at least one employee");
      return;
    }

    console.log('Submitting with employees:', employeesArray);
    console.log('Selected tasks count:', selectedRows.length);

    setIsSubmitting(true);

    try {
      // Process each selected task
      const submissionPromises = selectedRows.map(async (index) => {
        const task = taskListArr[index];
        const taskData = formData[task.task];
        
        if (!taskData) {
          throw new Error(`No data found for task: ${task.task}`);
        }

        const formDataObj = new FormData();

        // Add all form fields to formData
        formDataObj.append("TASK_ALLOCATED_TO", employeesArray.join(","));
        formDataObj.append("task_title", task.task);
        formDataObj.append("task_description", taskData.task_description);
        formDataObj.append("manageby", taskData.task_allocated);
        formDataObj.append("selType", taskData.task_type);
        formDataObj.append("repeat_days", taskData.repeat_days);
        formDataObj.append("repeat_until", taskData.TASK_DATE);

        // Add empty values for optional fields to match your original form structure
        formDataObj.append("skills", "");
        formDataObj.append("observation_point", "");
        formDataObj.append("KRA", "");
        formDataObj.append("KPA", "");

        console.log('Submitting task:', task.task);
        console.log('FormData entries:');
        for (let [key, value] of formDataObj.entries()) {
          console.log(key + ': ' + value);
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
            body: formDataObj,
          }
        );

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || `Failed to create task: ${task.task}`);
        }

        return result;
      });

      // Wait for all tasks to be submitted
      const results = await Promise.all(submissionPromises);
      
      alert(`Successfully created ${results.length} tasks!`);
      
      // Reset form after successful submission
      setSelectedRows([]);
      setSelectAll(false);
       if (onSuccess) {
        onSuccess(results.length);
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

  return (
    <div className="w-full">
      {/* Debug information - you can remove this in production */}
      {/* <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
        <p><strong>Selected Employees Raw:</strong> {JSON.stringify(selectedEmployees)}</p>
        <p><strong>Processed Employees:</strong> {employeesArray.join(', ') || 'None'}</p>
        <p><strong>Employee Count:</strong> {employeesArray.length}</p>
        <p><strong>Selected Tasks:</strong> {selectedRows.length}</p>
      </div> */}

      {taskListArr && taskListArr.length > 0 ? (
        <div className="w-full h-full">
          <form onSubmit={handleSubmit}>
            <table className="w-full border-collapse border rounded-t-lg overflow-hidden">
              <thead>
                <tr className="bg-[#ddd]">
                  <th className="border p-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="mr-2"
                    />
                    Sr No
                  </th>
                  <th className="border p-2 w-100">Task</th>
                  <th className="border p-2 w-40">Description</th>
                  <th className="border p-2 w-30">Repeat Once in every</th>
                  <th className="border p-2">Repeat until</th>
                  <th className="border p-2 w-30">Observer</th>
                  <th className="border p-2 w-40">Task Type</th>
                </tr>
              </thead>
              <tbody>
                {taskListArr.map((task: Task, index: number) => (
                  <tr key={index} className={selectedRows.includes(index) ? "bg-blue-50" : ""}>
                    <td className="border p-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(index)}
                        onChange={() => handleCheckboxChange(index)}
                        className="mr-2"
                      />
                      {index + 1}
                    </td>
                    <td className="border p-2 font-medium">{task.task}</td>
                    <td className="border p-2">
                      <textarea
                        rows={3}
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-700 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:border-transparent focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="Add Task Description.."
                        disabled={!selectedRows.includes(index)}
                        value={formData[task.task]?.task_description || ""}
                        onChange={(e) =>
                          handleInputChange(index, "description", e.target.value)
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        disabled={!selectedRows.includes(index)}
                        value={formData[task.task]?.repeat_days || "1"}
                        onChange={(e) =>
                          handleInputChange(index, "repeat", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:border-transparent focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {[...Array(14)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1} day{i !== 0 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2">
                      <input
                        type="date"
                        disabled={!selectedRows.includes(index)}
                        value={formData[task.task]?.TASK_DATE || ""}
                        onChange={(e) =>
                          handleInputChange(index, "date", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:border-transparent focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        disabled={!selectedRows.includes(index)}
                        value={formData[task.task]?.task_allocated || ObserverList[0]?.id || ""}
                        onChange={(e) =>
                          handleInputChange(index, "observer", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:border-transparent focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {ObserverList.map((observer: Observer, obsIndex: number) => (
                          <option key={obsIndex} value={observer.id}>
                            {observer.first_name} {observer.middle_name} {observer.last_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2">
                      <select
                        disabled={!selectedRows.includes(index)}
                        value={formData[task.task]?.task_type || "Medium"}
                        onChange={(e) =>
                          handleInputChange(index, "taskType", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:border-transparent focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Employee selection warning */}
            {employeesArray.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-semibold">
                  ⚠️ No employees selected. Please go back and select at least one employee before saving tasks.
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting || selectedRows.length === 0 || employeesArray.length === 0}
                className="px-8 py-3 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  `Save ${selectedRows.length} Task${selectedRows.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="w-full h-full flex justify-center items-center py-8">
          <h1 className="text-gray-500 text-lg">No Task Found</h1>
        </div>
      )}
    </div>
  );
};

export default TaskListData;
