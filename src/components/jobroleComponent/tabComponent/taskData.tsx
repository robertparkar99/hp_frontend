import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import dynamic from 'next/dynamic';

// Dynamically import ExcelExportButton, PdfExportButton, and PrintButton
const ExcelExportButton = dynamic(
  () => import('../../exportButtons/excelExportButton').then(mod => mod.ExcelExportButton),
  { ssr: false }
);

const PdfExportButton = dynamic(
  () => import('../../exportButtons/PdfExportButton').then(mod => mod.PdfExportButton),
  { ssr: false }
);

const PrintButton = dynamic(
  () => import('../../exportButtons/printExportButton').then(mod => mod.PrintButton),
  { ssr: false }
);

type Props = { editData: any, selectedDept: any, selectedJobrole: any, selectedFunction: any };

type TaskNameEntry = {
  taskName: string;
  critical_work_function: string;
  jobrole?: string;
  department?: string;
  subDepartment?: string;
};

type SubmittedTaskName = {
  id?: number;
  taskName: string;
  critical_work_function: string;
  jobrole?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
  sub_category?: string;
  skillTitle?: string;
  department?: string;
  subDepartment?: string;
};

const TaskData: React.FC<Props> = ({ editData, selectedDept, selectedJobrole, selectedFunction }) => {
  // State Variables
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });
  const [taskNameSuggestions, setTaskNameSuggestions] = useState<
    Record<number, string[]>
  >({});
  const [taskNames, setTaskNames] = useState<TaskNameEntry[]>([
    { taskName: "", critical_work_function: "", jobrole: "", department: "", subDepartment: "" },
  ]);
  const [submittedData, setSubmittedData] = useState<SubmittedTaskName[]>([]);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState<string>("");

  // Session Data from Local Storage
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

  // Fetch Departments
  useEffect(() => {
    if (sessionData.url && sessionData.token && sessionData.subInstituteId) {
      fetchDepartments();
    }
  }, [sessionData.url, sessionData.token, sessionData.subInstituteId]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.subInstituteId}&order_by[direction]=desc&group_by=sector`
      );
      const data = await res.json();
      setDepartments(data);

    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch Sub-Departments when department is selected
  useEffect(() => {
    if (sessionData.orgType && sessionData.url && sessionData.token && sessionData.subInstituteId) {
      fetchSubDepartments(sessionData.orgType);
    } else {
      setSubDepartments([]);
    }
  }, [sessionData.orgType, selectedDept, sessionData.url, sessionData.token, sessionData.subInstituteId]);

  const fetchSubDepartments = async (selectedDept: string) => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[sector]=${encodeURIComponent(selectedDept)}&order_by[direction]=desc&group_by=track`
      );
      const data = await res.json();
      setSubDepartments(data);

      // if (data && data.data) {
      //   const subDepartmentList = data.data.map((item: any) => item.track).filter(Boolean);
      //   setSubDepartments(subDepartmentList);
      // }
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
    }
  };

  // Fetch Initial Data
  useEffect(() => {
    if (sessionData.url && sessionData.token && editData?.id) {
      fetchInitialData();
    }
  }, [sessionData.url, sessionData.token, editData?.id]);

  const fetchInitialData = async () => {
    try {
      const params = new URLSearchParams({
        type: "API",
        token: sessionData.token,
        sub_institute_id: sessionData.subInstituteId,
        org_type: sessionData.orgType,
        jobrole: editData?.jobrole,
        formType: "tasks",
      });

      if (selectedDept !== undefined) {
        params.append("sub_department", selectedDept);
      }
      if (selectedFunction !== undefined) {
        params.append("function", selectedFunction);
      }

      const res = await fetch(
        `${sessionData.url}/jobrole_library/create?${params.toString()}`
      );
      const data = await res.json();

      if (data?.usertaskData) {
        const transformedData = Array.isArray(data.usertaskData)
          ? data.usertaskData.map((item: any) => ({
            id: item.id,
            taskName: (typeof item.task === 'object' && item.task !== null)
              ? (item.task.title || item.task.name || '')
              : String(item.task || ''),
            critical_work_function: String(item.critical_work_function || item.taskcritical_work_function || ''),
            jobrole: String(item.jobrole || editData?.jobrole || ''),
            category: String(item.category || ''),
            sub_category: String(item.sub_category || ''),
            department: String(item.department || item.sector || ''),
            subDepartment: String(item.subDepartment || item.track || ''),
            skillTitle: (typeof item.task === 'object' && item.task !== null)
              ? (item.task.title || item.task.name || '')
              : String(item.task || ''),
            created_by_user: item?.first_name && item?.last_name ? `${item.first_name} ${item.last_name}` : "N/A",
            created_at: item.created_at,
            updated_at: item.updated_at,
          }))
          : [
            {
              id: data.usertaskData.id,
              taskName: (typeof data.usertaskData.task === 'object' && data.usertaskData.task !== null)
                ? (data.usertaskData.task.title || data.usertaskData.task.name || '')
                : String(data.usertaskData.task || ''),
              critical_work_function: String(data.usertaskData.critical_work_function || data.usertaskData.taskcritical_work_function || ''),
              jobrole: String(data.usertaskData.jobrole || editData?.jobrole || ''),
              category: String(data.usertaskData.category || ''),
              sub_category: String(data.usertaskData.sub_category || ''),
              department: String(data.usertaskData.department || data.usertaskData.sector || ''),
              subDepartment: String(data.usertaskData.subDepartment || data.usertaskData.track || ''),
              skillTitle: (typeof data.usertaskData.task === 'object' && data.usertaskData.task !== null)
                ? (data.usertaskData.task.title || data.usertaskData.task.name || '')
                : String(data.usertaskData.task || ''),
              created_by_user: data.usertaskData?.first_name && data.usertaskData?.last_name ? `${data.usertaskData.first_name} ${data.usertaskData.last_name}` : "N/A",
              created_at: data.usertaskData.created_at,
              updated_at: data.usertaskData.updated_at,
            },
          ];

        setSubmittedData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };


  // Fetch task Suggestions
  const fetchTaskNameSuggestions = async (index: number, keyword: string) => {
    if (!keyword.trim() || !sessionData.url) {
      setTaskNameSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const res = await fetch(
        `${sessionData.url}/search_task?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=taskName&searchWord=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();
      const suggestions = (data?.searchData || []).map((s: any) =>
        typeof s === 'string' ? s : (s.name || s.title || String(s) || '')
      ).filter(Boolean);
      setTaskNameSuggestions((prev) => ({ ...prev, [index]: suggestions }));
    } catch (error) {
      console.error("Tasks search error:", error);
      setTaskNameSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  // Handle tasks Input Change
  const handleTaskNameChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedTaskNames = taskNames.map((task, i) =>
      i === index ? { ...task, [name]: value } : task
    );
    setTaskNames(updatedTaskNames);

    if (name === "taskName") {
      fetchTaskNameSuggestions(index, value);
    } else if (name === "department") {
      setSelectedDepartment(value);
      // Reset sub-department when department changes
      const updatedWithResetSubDept = taskNames.map((task, i) =>
        i === index ? { ...task, department: value, subDepartment: "" } : task
      );
      setTaskNames(updatedWithResetSubDept);
      setSelectedSubDepartment("");
    }
  };

  // Handle Selecting a Suggestion
  const handleSelectSuggestion = (index: number, suggestion: string) => {
    const updated = [...taskNames];
    updated[index].taskName = suggestion;
    setTaskNames(updated);
    setTaskNameSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  // Add New tasks Entry
  const handleAddTaskName = () => {
    setTaskNames([...taskNames, { taskName: "", critical_work_function: "", jobrole: "", department: "", subDepartment: "" }]);
  };

  // Remove tasks Entry
  const handleRemoveTaskName = (index: number) => {
    const updatedTaskNames = taskNames.filter((_, i) => i !== index);
    setTaskNames(updatedTaskNames);

    setTaskNameSuggestions((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const tasksToSubmit = taskNames.map(task => ({
      taskName: task.taskName,
      critical_work_function: task.critical_work_function,
      department: task.department,
      subDepartment: task.subDepartment,
      ...(task.jobrole && { jobrole: task.jobrole })
    }));

    const payload: Record<string, any> = {
      type: "API",
      method_field: "PUT",
      taskName: tasksToSubmit.map((t) => t.taskName),
      critical_work_function: tasksToSubmit.map((t) => t.critical_work_function),
      sector: tasksToSubmit.map((t) => t.department),
      track: tasksToSubmit.map((t) => t.subDepartment),
      jobrole: editData?.jobrole,
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "tasks",
      taskName_data: JSON.stringify(tasksToSubmit),
      ...(editingId && { id: editingId }),
    };

    if (selectedDept !== undefined) {
      payload.sub_department = selectedDept;
    }
    if (selectedFunction !== undefined) {
      payload.function = selectedFunction;
    }

    try {
      const url = `${sessionData.url}/jobrole_library/${editData?.id}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message);

      setTaskNames([{ taskName: "", critical_work_function: "", jobrole: "", department: "", subDepartment: "" }]);
      setTaskNameSuggestions({});
      setEditingId(null);
      setSelectedDepartment("");
      setSelectedSubDepartment("");

      if (sessionData.url && sessionData.token && editData?.id) {
        await fetchInitialData();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = (row: SubmittedTaskName) => {
    console.log(row);
    setEditingId(row.id || null);
    setTaskNames([{
      taskName: row.taskName,
      critical_work_function: row.critical_work_function,
      jobrole: row.jobrole,
      department: row.department || "",
      subDepartment: row.subDepartment || ""
    }]);

    // Set department and sub-department for dropdowns
    if (row.department) {
      setSelectedDepartment(row.department);
      if (row.subDepartment) {
        setSelectedSubDepartment(row.subDepartment);
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this Task?")) {
      try {
        const userConfirmed = true;

        if (userConfirmed) {
          try {
            const res = await fetch(
              `${sessionData.url}/jobrole_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=tasks`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${sessionData.token}`,
                },
              }
            );

            const data = await res.json();
            console.log("Deletion message:", data.message);
            fetchInitialData();
          } catch (error) {
            console.error("Error deleting tasks:", error);
            console.error("Error deleting tasks");
          }
        }
      } catch (error) {
        console.error("Error deleting Skills:", error);
        alert("Error deleting Skills");
      }
    }
  };

  // Handle Column Filtering
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Filtered Data for DataTable
  const filteredData = submittedData.filter((item) => {
    return Object.entries(columnFilters).every(([column, filterValue]) => {
      if (!filterValue) return true;

      const columnValue = String(
        item[column as keyof SubmittedTaskName] || ""
      ).toLowerCase();
      return columnValue.includes(filterValue.toLowerCase());
    });
  });

  // DataTable Columns
  const columns = [
    // {
    //   name: (
    //     <div>
    //       <div>Industry</div>
    //       <input
    //         type="text"
    //         placeholder="Search..."
    //         onChange={(e) => handleColumnFilter("department", e.target.value)}
    //         style={{ width: "100%", padding: "4px", fontSize: "12px" }}
    //       />
    //     </div>
    //   ),
    //   selector: (row: SubmittedTaskName) => row.department || "N/A",
    //   sortable: true,
    //   wrap: true,
    // },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("subDepartment", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedTaskName) => row.subDepartment || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Critical Work Function</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("critical_work_function", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedTaskName) => row.critical_work_function,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Tasks</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("taskName", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedTaskName) => row.taskName,
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row: SubmittedTaskName) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-pencil"></span>
          </button>
          <button
            onClick={() => row.id && handleDelete(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-trash-can"></span>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  // Custom Styles for DataTable
  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "#c7dfff",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left" as const,
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        textAlign: "left" as const,
      },
    },
  };

  return (
    <div className="w-[100%]">
      <form className="w-[100%]" onSubmit={handleSubmit}>
        {taskNames.map((taskName, index) => (
          <div
            key={index}
            className="grid md:grid-cols-5 md:gap-6 bg-[#fff] border-b-1 border-[#ddd] shadow-xl p-2 mb-2 rounded-lg relative"
          >
            {/* Hidden input for jobrole, used to carry its value on edit */}
            <input type="hidden" name="jobrole" id={`jobrole-${index}`} value={taskName.jobrole || ''} />

            {/* <div className="relative z-0 w-full group text-left">
  <label htmlFor={`department-${index}`} className="text-left">
    Department
  </label>
  <br />
  <select
    name="department"
    id={`department-${index}`}
    className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#f9f9f9] text-black focus:outline-none focus:border-blue-500"
    value={sessionData.orgType || ""}  // always set from sessionData
    disabled
  >
    <option value={sessionData.orgType || ""}>
      {sessionData.orgType || "N/A"}
    </option>
  </select>
</div> */}

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`subDepartment-${index}`} className="text-left">
                Department
              </label>
              <br />
              <select
                name="subDepartment"
                id={`subDepartment-${index}`}
                className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                value={taskName.subDepartment || ""}
                onChange={(e) => handleTaskNameChange(index, e)}
              >
                <option value="">Select Department</option>
                {subDepartments.map((subDept, i) => (
                  <option key={i} value={subDept.track}>
                    {subDept.track}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative z-10 w-full group text-left">
              <label htmlFor={`taskName-${index}`} className="text-left">
                Tasks
              </label>
              <br />
              <div className="relative">
                <input
                  type="text"
                  name="taskName"
                  id={`taskName-${index}`}
                  className="w-full z-10 rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  placeholder="Enter tasks..."
                  value={taskName.taskName}
                  onChange={(e) => handleTaskNameChange(index, e)}
                  autoComplete="off"
                />

                {taskNameSuggestions[index]?.length > 0 && (
                  <ul
                    className="relative z-20 w-full max-h-60 overflow-y-auto border border-gray-300 rounded-lg mt-1 shadow-lg bg-white"
                  >
                    {taskNameSuggestions[index].map((suggestion, sIndex) => (
                      <li
                        key={sIndex}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => handleSelectSuggestion(index, suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`critical_work_function-${index}`} className="text-left">
                Critical Work Function
              </label>
              <br />
              <textarea
                name="critical_work_function"
                id={`critical_work_function-${index}`}
                rows={2}
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                placeholder="Enter Critical Work Function..."
                value={taskName.critical_work_function}
                onChange={(e) => handleTaskNameChange(index, e)}
              ></textarea>
            </div>

            <div className="relative z-0 w-full group text-left flex items-end">
              {taskNames.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTaskName(index)}
                  className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full ml-2"
                >
                  -
                </button>
              )}
              {index === taskNames.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddTaskName}
                  className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-full ml-2"
                >
                  +
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
          disabled={loading}
        >
          {loading ? "Submitting..." : editingId ? "Update" : "Submit"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTaskNames([{ taskName: "", critical_work_function: "", jobrole: "", department: "", subDepartment: "" }]);
              setSelectedDepartment("");
              setSelectedSubDepartment("");
            }}
            className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tasks Data</h2>
          <div className="space-x-2">
            <PrintButton
              data={submittedData}
              title="Tasks Report"
              excludedFields={["id", "internal_id", "category", "sub_category", "skillTitle", "updated_at"]}
              buttonText={
                <>
                  <span className="mdi mdi-printer-outline"></span>
                </>
              }
            />
            <ExcelExportButton
              sheets={[{ data: submittedData, sheetName: "Submissions" }]}
              fileName="Tasks Data"
              onClick={() => console.log("Export initiated")}
              buttonText={
                <>
                  <span className="mdi mdi-file-excel"></span>
                </>
              }
            />

            <PdfExportButton
              data={submittedData}
              fileName="Tasks Data"
              onClick={() => console.log("PDF export initiated")}
              buttonText={
                <>
                  <span className="mdi mdi-file-pdf-box"></span>
                </>
              }
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          responsive
          striped
          paginationPerPage={100}
          paginationRowsPerPageOptions={[100, 500, 1000]}
          customStyles={customStyles}
          progressPending={loading}
          noDataComponent={<div className="p-4">No records found</div>}
        />
      </div>
    </div>
  );
};

export default TaskData;