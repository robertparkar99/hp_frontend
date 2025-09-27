"use client";
import React, { useEffect, useState } from "react";
import { Atom } from "react-loading-indicators";
import { Funnel, Square, Table } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TaskData from "@/components/jobroleComponent/tabComponent/taskData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

type JobRoleTask = {
  id: number;
  sector: string;
  track: string;
  jobrole: string;
  critical_work_function: string;
  task: string;
  task_type: string;
  sub_institute_id: number;
};

const CriticalWorkFunctionGrid = () => {
  const [data, setData] = useState<JobRoleTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<any>({});
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedJobrole, setSelectedJobrole] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isView, setView] = useState(false);
  const [viewData, setViewData] = useState<any>({});
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);

  // ✅ View toggle state
  const [viewMode, setViewMode] = useState<"myview" | "table">("myview");

  // ✅ Column filters for DataTable
  const [columnFilters, setColumnFilters] = useState({
    jobrole: "",
    department: "",
    description: "",
    performance_expectation: "",
  });

  // Load session data
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

  // Fetch data after sessionData is ready
  useEffect(() => {
    if (!sessionData.url || !sessionData.subInstituteId) return;
    fetchData();
  }, [sessionData]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[sector]=${sessionData.orgType}&order_by[direction]=desc&group_by=task`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        }
      );
      const json: JobRoleTask[] = await res.json();
      setData(json);

      if (json.length > 0) {
        const depts = Array.from(new Set(json.map((d) => d.track || "")))
          .filter(Boolean)
          .sort();
        const defaultDept = depts[0] || "";

        const jobroles = Array.from(
          new Set(
            json
              .filter((d) => d.track === defaultDept)
              .map((d) => d.jobrole || "")
          )
        )
          .filter(Boolean)
          .sort();
        const defaultJobrole = jobroles[0] || "";

        const functions = Array.from(
          new Set(
            json
              .filter(
                (d) => d.track === defaultDept && d.jobrole === defaultJobrole
              )
              .map((d) => d.critical_work_function || "")
          )
        )
          .filter(Boolean)
          .sort();
        const defaultFunc = functions[0] || "";

        setSelectedDept(defaultDept);
        setSelectedJobrole(defaultJobrole);
        setSelectedFunction(defaultFunc);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  // Unique filters
  const uniqueDepartments = Array.from(
    new Set(data.map((d) => d.track || ""))
  )
    .filter(Boolean)
    .sort();

  const uniqueJobroles = Array.from(
    new Set(
      data.filter((d) => d.track === selectedDept).map((d) => d.jobrole || "")
    )
  )
    .filter(Boolean)
    .sort();

  const uniqueFunctions = Array.from(
    new Set(
      data
        .filter(
          (d) => d.track === selectedDept && d.jobrole === selectedJobrole
        )
        .map((d) => d.critical_work_function || "")
    )
  )
    .filter(Boolean)
    .sort();

  // Filtered grid data
  const filteredData = data.filter(
    (item) =>
      item.track === selectedDept &&
      item.jobrole === selectedJobrole &&
      item.critical_work_function === selectedFunction
  );

  // Handle select changes
  const handleDepartmentChange = (val: string) => {
    setSelectedDept(val);
    const jobroles = Array.from(
      new Set(data.filter((d) => d.track === val).map((d) => d.jobrole || ""))
    )
      .filter(Boolean)
      .sort();
    const firstJobrole = jobroles[0] || "";
    setSelectedJobrole(firstJobrole);

    const functions = Array.from(
      new Set(
        data
          .filter((d) => d.track === val && d.jobrole === firstJobrole)
          .map((d) => d.critical_work_function || "")
      )
    )
      .filter(Boolean)
      .sort();
    setSelectedFunction(functions[0] || "");
  };

  const handleJobroleChange = (val: string) => {
    setSelectedJobrole(val);
    const functions = Array.from(
      new Set(
        data
          .filter((d) => d.track === selectedDept && d.jobrole === val)
          .map((d) => d.critical_work_function || "")
      )
    )
      .filter(Boolean)
      .sort();
    setSelectedFunction(functions[0] || "");
  };

  // Edit/Delete functions
  const handleEditClick = (id: number, jobrole: string) => {
    console.log("Edit clicked:", id, jobrole);
    setSelectedJobRole(id);
    setIsEditModalOpen(true);
    fetchEditData(id, jobrole);
  };

  const fetchEditData = async (id: number, jobrole: string) => {
    try {
      const jobroleRes = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[jobrole]=${jobrole}&filters[sub_institute_id]=${sessionData.subInstituteId}`
      );
      const jobroleData = await jobroleRes.json();
      if (jobroleData[0]?.id) {
        const res = await fetch(
          `${sessionData.url}/jobrole_library/${jobroleData[0].id}/edit?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&formType=user`
        );
        const data = await res.json();
        setEditData(data.editData || {});
      }
    } catch (error) {
      console.error("Error fetching edit data:", error);
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(
        `${sessionData.url}/jobrole_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=tasks`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${sessionData.token}` },
        }
      );
      const data = await res.json();
      alert(data.message);
      fetchData();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task");
    }
  };

  // ✅ DataTable Columns
  const columns: TableColumn<JobRoleTask>[] = [
    {
      name: (
        <div className="flex flex-col">
          <span>Job Role</span>
          <input
            type="text"
            value={columnFilters.jobrole}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, jobrole: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.jobrole,
      sortable: true,
      wrap: true,
      width: "160px",
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Department</span>
          <input
            type="text"
            value={columnFilters.department}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, department: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.track,
      sortable: true,
      wrap: true,
      width: "140px",
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Description</span>
          <input
            type="text"
            value={columnFilters.description}
            onChange={(e) =>
              setColumnFilters({
                ...columnFilters,
                description: e.target.value,
              })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.task,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Performance Expectation</span>
          <input
            type="text"
            value={columnFilters.performance_expectation}
            onChange={(e) =>
              setColumnFilters({
                ...columnFilters,
                performance_expectation: e.target.value,
              })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.task_type,
      sortable: false,
      wrap: true,
      width: "160px",
    },
    {
      name: "Actions",
      cell: (row) => (
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditClick(row.id, row.jobrole)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-pencil"></span>
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-delete"></span>
          </button>
        </div>
      ),
      width: "120px",
    },
  ];

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        textAlign: "left",
      },
    },
    table: {
      style: {
        borderRadius: "20px",
        overflow: "hidden",
      },
    },
  };

  // ✅ Apply column filters
  const filteredTableData = filteredData.filter((row) =>
    Object.entries(columnFilters).every(([key, val]) =>
      val ? String(row[key as keyof JobRoleTask] || "").toLowerCase().includes(val.toLowerCase()) : true
    )
  );

  return (
    <>
      <div className="min-h-screen p-4">
        {/* Top filter + Toggle */}
        <div className="flex justify-end mb-6">
          {/* Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-3">
                <Funnel className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 mr-10 p-6 bg-white shadow-xl border border-gray-200 rounded-xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Department
                  </label>
                  <Select
                    value={selectedDept}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueDepartments.map((dept, idx) => (
                        <SelectItem key={idx} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Role
                  </label>
                  <Select
                    value={selectedJobrole}
                    onValueChange={handleJobroleChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Jobrole" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueJobroles.map((role, idx) => (
                        <SelectItem key={idx} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Work Function
                  </label>
                  <Select
                    value={selectedFunction}
                    onValueChange={setSelectedFunction}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Function" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueFunctions.map((func, idx) => (
                        <SelectItem key={idx} value={func}>
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* ✅ Icon Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("myview")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${
                viewMode === "myview"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Square className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${
                viewMode === "table"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Table className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ✅ Toggle between Card View and Table View */}
        {viewMode === "myview" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="relative group overflow-hidden rounded-3xl shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 flex flex-col"
              >
                <div className="absolute z-[10] right-0 bottom-0 w-[1px] h-[1px] bg-[#B7DAFF] rounded-[0px_50px_0px_15px] transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:rounded-[15px] group-hover:opacity-[0.5] pointer-events-none"></div>

                <div className="relative z-10 p-6 flex-1">
                  <h3
                    className="text-lg font-bold text-gray-900 mb-2 leading-tight truncate cursor-pointer hover:text-blue-600 transition-colors"
                    title={item.critical_work_function}
                    onClick={() => {
                      setViewData(item);
                      setView(true);
                      setIsViewModalOpen(true);
                    }}
                  >
                    {item.critical_work_function}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="flex-1 h-0.5 bg-gray-300"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.task}
                  </p>
                </div>

                <div className="flex justify-end p-2 mt-[-6]">
                  <button
                    className="p-2 hover:text-blue-600"
                    onClick={() => handleEditClick(item.id, item.jobrole)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="p-2 hover:text-red-600"
                    onClick={() => handleDeleteClick(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTableData}
            customStyles={customStyles}
            pagination
            highlightOnHover
            striped
          />
        )}
      </div>

      {/* Edit Modal */}
      {selectedJobRole && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] bg-[#f1fbff] overflow-y-auto hide-scroll">
            <DialogHeader>
              <DialogTitle>Edit Task Assignment</DialogTitle>
            </DialogHeader>
            <TaskData
              editData={editData}
              selectedDept={selectedDept}
              selectedJobrole={selectedJobrole}
              selectedFunction={selectedFunction}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Modal */}
      {isView && viewData && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[95vh] bg-[#f1fbff] overflow-y-auto hide-scroll">
            <DialogHeader>
              <DialogTitle className="border-b-2 pb-2">
                {viewData?.task}
              </DialogTitle>
            </DialogHeader>
            <ul className="p-2">
              <li className="my-2 py-1">
                <span className="bg-[#6fc7ff] p-2 rounded-full">
                  Critical Work Function
                </span>{" "}
                <span className="p-1">
                  {viewData?.critical_work_function}
                </span>
              </li>
              <li className="my-2 py-1">
                <span className="bg-[#fcf38d] p-2 rounded-full">
                  Department
                </span>{" "}
                <span className="p-1">{viewData?.track}</span>
              </li>
              <li className="my-2 py-1">
                <span className="bg-[#8dd39c] p-2 rounded-full">Jobrole</span>{" "}
                <span className="p-1">{viewData?.jobrole}</span>
              </li>
            </ul>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CriticalWorkFunctionGrid;
