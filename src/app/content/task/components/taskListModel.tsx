"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DataTable from "react-data-table-component";

type Props = {
  taskListArr: any;
  ObserverList: any;
  sessionData: any;
  selectedEmployees: any;
};

const taskListData: React.FC<Props> = ({ taskListArr, ObserverList, sessionData, selectedEmployees }) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState<{
    [task_title: string]: {
      task_description: string;
      repeat_days: string;
      TASK_DATE: string;
      task_allocated: string;
      task_type: string;
    };
  }>({});

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
        task_description: field === "description" ? value : formData[taskTitle]?.task_description || "",
        repeat_days: field === "repeat" ? value : formData[taskTitle]?.repeat_days || "",
        TASK_DATE: field === "date" ? value : formData[taskTitle]?.TASK_DATE || "",
        task_allocated: field === "observer" ? value : formData[taskTitle]?.task_allocated || "",
        task_type: field === "taskType" ? value : formData[taskTitle]?.task_type || "",
      },
    });
  };

  const handleSubmit = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one task");
      return;
    }

    const payload = selectedRows.map((index) => {
      const taskTitle = taskListArr[index].task;
      const taskData = formData[taskTitle] || {
        task_description: "",
        repeat_days: "",
        TASK_DATE: "",
        task_allocated: "",
        task_type: ""
      };
      
      return {
        task_title: taskTitle,
        task_description: taskData.task_description,
        repeat_days: taskData.repeat_days,
        TASK_DATE: taskData.TASK_DATE,
        task_allocated: taskData.task_allocated,
        task_type: taskData.task_type
      };
    });

    try {
      const response = await fetch(
        `${sessionData.url}/task?type=API&token=${sessionData.token}` +
        `&sub_institute_id=${sessionData.subInstituteId}` +
        `&org_type=${sessionData.orgType}&syear=${sessionData.syear}&user_id=${sessionData.userId}&TASK_ALLOCATED_TO=${selectedEmployees}&formType=BulkTask`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task_details: JSON.stringify(payload) }),
        }
      );

      const result = await response.json();
      console.log('Result:', result);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Something went wrong"
        }`
      );
    }
  };

  return (
    <div className="w-full">
      {taskListArr && taskListArr.length > 0 ? (
        <div className="w-full h-full">
          <table className="w-full border-collapse border rounded-t-full">
            <thead>
              <tr className="bg-[#ddd] rounded-t-full">
                <th className="border p-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  Sr No
                </th>
                <th className="border p-2">Task</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Repeat Once in every</th>
                <th className="border p-2">Repeat until</th>
                <th className="border p-2">Observer</th>
                <th className="border p-2">Task Type</th>
              </tr>
            </thead>
            <tbody>
              {taskListArr.map((task: any, index: number) => (
                <tr key={index}>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(index)}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    {index + 1}
                  </td>
                  <td className="border p-2">{task.task}</td>
                  <td className="border p-2">
                    <textarea
                      name="description"
                      id="task_description"
                      rows={3}
                      className="w-full border border-gray-200 rounded-md p-2 text-gray-400 text-sm focus:ring-2 focus:ring-[#D0E7FF] focus:outline-none"
                      placeholder="Add Task Description.."
                      disabled={!selectedRows.includes(index)}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                    ></textarea>
                  </td>
                  <td className="border p-2">
                    <select
                      disabled={!selectedRows.includes(index)}
                      onChange={(e) =>
                        handleInputChange(index, "repeat", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded p-1"
                    >
                      {[...Array(14)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="date"
                      disabled={!selectedRows.includes(index)}
                      onChange={(e) =>
                        handleInputChange(index, "date", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <select
                      disabled={!selectedRows.includes(index)}
                      onChange={(e) =>
                        handleInputChange(index, "observer", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded p-1"
                    >
                      {ObserverList.map((observer: any, index: number) => (
                        <option key={index} value={observer.id}>
                          {observer.first_name} {observer.middle_name}{" "}
                          {observer.last_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <select
                      disabled={!selectedRows.includes(index)}
                      onChange={(e) =>
                        handleInputChange(index, "taskType", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded p-1"
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
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <h1>No Task Found</h1>
        </div>
      )}
    </div>
  );
};

export default taskListData;
