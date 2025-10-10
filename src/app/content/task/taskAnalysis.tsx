"use client";
declare global {
  interface Window {
    __currentMenuItem?: string;
  }
}

import React, { useState, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import DataTable from "react-data-table-component";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

// const DEFAULT_IMAGE =
//   "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

const fallbackImg =
  "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

type Employee = {
  color?: string;
  image?: string;
  allocated_to?: string;
};

interface TaskData {
  id: string;
  tasks: { type: string }[];
  description: { description: string }[];
  employees: { color?: string; image?: string; allocated_to?: string }[];
  deadline: string;
  priority: "Easy" | "Medium" | "Hard";
  statuses: ("COMPLETED" | "IN-PROGRESS" | "PENDING")[];
  approve_status: "approved" | "rejected" | "pending" | null;
  approved_by: { type: string }[];
  ALLOCATOR: { type: string }[];
  kra: { type: string }[];
  kpa: { type: string }[];
  task_type: { type: string };
  reply: { type: string }[];
  task_attachment: { type: string }[];
}

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    task: "",
    description: "",
    employee: "",
    deadline: "",
    priority: "",
    status: "",
    approve_status: "",
  });

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    syear: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

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
        syear: syear || "2025",
      });
    }
  }, []);

  useEffect(() => {
    async function fetchTasks() {
      if (!sessionData.url || !sessionData.token) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${sessionData.url}/task_analysis_report?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&syear=${sessionData.syear}`
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        // Group multiple employees under the same task
        const groupedTasks: { [key: string]: any[] } = {};
        data.taskData.forEach((item: any) => {
          if (!groupedTasks[item.id]) groupedTasks[item.id] = [];
          groupedTasks[item.id].push(item);
        });

        const mappedTasks: TaskData[] = Object.keys(groupedTasks).map(
          (taskId) => {
            const taskGroup = groupedTasks[taskId];
            return {
              id: String(taskId),
              tasks: [{ type: taskGroup[0].task_title || "Task" }],
              description: [
                { description: taskGroup[0].task_description || "" },
              ],
              employees: taskGroup.map((emp) => ({
                image: emp.employee_image || "",
                allocated_to: emp.ALLOCATED_TO || "",
                color: "#E5E7EB",
              })),
              deadline: taskGroup[0].task_date || "",
              priority: "Medium",
              statuses: [
                taskGroup[0].status === "IN-PROGRESS"
                  ? "IN-PROGRESS"
                  : taskGroup[0].status || "PENDING",
              ],
              approve_status: taskGroup[0].approve_status
                ? taskGroup[0].approve_status.toLowerCase()
                : null,
              approved_by: [{ type: taskGroup[0].approved_by || "" }],
              ALLOCATOR: [{ type: taskGroup[0].ALLOCATOR || "" }],
              kra: [{ type: taskGroup[0].kra || "" }],
              kpa: [{ type: taskGroup[0].kpa || "" }],
              task_type: { type: taskGroup[0].task_type || "" },
              reply: [{ type: taskGroup[0].reply || "" }],
              task_attachment: [{ type: taskGroup[0].task_attachment || "" }],
            };
          }
        );

        setTasks(mappedTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [sessionData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskTypes = task.tasks.map((t) => t.type).join(" ").toLowerCase();
      const descriptions = task.description
        .map((d) => d.description)
        .join(" ")
        .toLowerCase();
      const employees = task.employees
        .map((e) => e.allocated_to?.toLowerCase() || "")
        .join(" ");
      const statuses = task.statuses.join(" ").toLowerCase();

      return (
        taskTypes.includes(filters.task.toLowerCase()) &&
        descriptions.includes(filters.description.toLowerCase()) &&
        employees.includes(filters.employee.toLowerCase()) &&
        task.deadline.toLowerCase().includes(filters.deadline.toLowerCase()) &&
        task.priority.toLowerCase().includes(filters.priority.toLowerCase()) &&
        statuses.includes(filters.status.toLowerCase()) &&
        (task.approve_status
          ? task.approve_status
            .toLowerCase()
            .includes(filters.approve_status.toLowerCase())
          : filters.approve_status === "")
      );
    });
  }, [tasks, filters]);

  const columns = [
 {
    name: (
      <div>
        <div>Task</div>
        <input
          type="text"
          placeholder="Search Task..."
          className="w-full text-[10px] sm:text-xs p-1"
          value={filters.task}
          onChange={(e) => setFilters({ ...filters, task: e.target.value })}
        />
      </div>
    ),
    selector: (row: TaskData) => row.tasks[0].type,
    sortable: true,
    wrap: true,
     minWidth: "180px",
  },
    {
      name: (
        <div>
          <div>Description</div>
          <input
            type="text"
            placeholder="Search Description..."
            className="w-full text-[10px] sm:text-xs p-1"
            value={filters.description}
            onChange={(e) =>
              setFilters({ ...filters, description: e.target.value })
            }
          />
        </div>
      ),
      selector: (row: TaskData) => row.description[0].description,
      sortable: true,
      wrap: true,
       minWidth: "180px",
    },
    {
      name: (
        <div>
          <div>Employee</div>
          <input
            type="text"
            placeholder="Search Employee..."
            className="w-full text-[10px] sm:text-xs p-1"
            value={filters.employee}
            onChange={(e) =>
              setFilters({ ...filters, employee: e.target.value })
            }
          />
        </div>
      ),
      cell: (row: TaskData) => <EmployeeAvatars employees={row.employees} />,
      //  sortable: true,
      // wrap: true,
      minWidth: "160px",
    },
    {
      name: (
        <div>
          <div>Deadline</div>
          <input
            type="text"
            placeholder="Search Deadline..."
            className="w-full text-[10px] sm:text-xs p-1"
            value={filters.deadline}
            onChange={(e) =>
              setFilters({ ...filters, deadline: e.target.value })
            }
          />
        </div>
      ),
      selector: (row: TaskData) => row.deadline,
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Priority</div>
          <input
            type="text"
            placeholder="Search Priority..."
            className="w-full text-[10px] sm:text-xs p-1"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          />
        </div>
      ),
      cell: (row: TaskData) => <PriorityBadge priority={row.priority} />,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: (
        <div>
          <div>Status</div>
          <input
            type="text"
            placeholder="Search Status..."
            className="w-full text-[10px] sm:text-xs p-1"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          />
        </div>
      ),
      cell: (row: TaskData) => (
        <div className="flex flex-wrap gap-1">
          {row.statuses.map(
            (s, idx) => s && <StatusBadge key={idx} status={s} />
          )}
        </div>
      ),
    },
    {
      name: (
        <div>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
            Approve Status
          </div>
          <input
            type="text"
            placeholder="Search Approve Status..."
            className="w-full text-[10px] sm:text-xs p-1"
            value={filters.approve_status}
            onChange={(e) =>
              setFilters({ ...filters, approve_status: e.target.value })
            }
          />
        </div>
      ),
      cell: (row: TaskData) => (
        <ApproveStatusBadge status={row.approve_status} />
      ),
      sortable: true,
      minWidth: "150px",
    },
    {
    name: "Actions",
    cell: (row: TaskData) => (
      <button
        onClick={() => {
          setSelectedTask(row);
          setIsEditModalOpen(true);
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4 text-blue-400" />
      </button>
    ),
    width: "100px",
    ignoreRowClick: true,
    allowOverflow: false,
  },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "#c7dfff",
        color: "black",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        textAlign: "left" as const,
      },
    },
  };

  const triggerMenuNavigation = (menu: string) => {
    localStorage.setItem("clickedUser", "");
    window.__currentMenuItem = menu;
    window.dispatchEvent(
      new CustomEvent("menuSelected", {
        detail: {
          menu,
          pageType: "page",
          access: menu,
          pageProps: null,
        },
      })
    );
  };

  return (
    <div className="w-full max-w-[1560px] mx-auto bg-white relative min-h-screen rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-gray-50 rounded-lg">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </button>
          <h1 className="text-sm sm:text-lg font-medium text-black">
            Task Analysis Report
          </h1>
        </div>
      </div>

      {/* DataTable */}
      <div className="p-2 sm:p-4 overflow-x-auto rounded-t-md">
        <DataTable
          columns={columns}
          data={filteredTasks}
          pagination
          highlightOnHover
          responsive
          striped
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          customStyles={customStyles}
          progressPending={loading}
          noDataComponent={<div className="p-4">No records found</div>}
          persistTableHead
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
          <DialogHeader>
            <DialogTitle>Task Assignment</DialogTitle>
          </DialogHeader>
          {selectedTask ? (
            <div className="bg-gray-50 text-gray-900 min-h-screen">
              <div className="container mx-auto px-4 py-10 max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Profile Section */}
                  <div className="md:col-span-1">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                      <div className="flex flex-col items-center">
                        {/* Profile Image with Fallback */}
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-5 shadow-lg border-2 border-gray-200">
                          {/* <img
                            src={
                              selectedTask.employees[0]?.image || DEFAULT_IMAGE
                            }
                            alt={
                              selectedTask.employees[0]?.allocated_to ||
                              "Employee"
                            }
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                DEFAULT_IMAGE;
                            }}
                            className="w-full h-full object-cover"
                          /> */}
                          <EmployeeImage
                            image={selectedTask.employees[0]?.image}
                            fullName={selectedTask.employees[0]?.allocated_to}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Employee Name */}
                        {selectedTask.employees[0]?.allocated_to && (
                          <h2 className="text-xl font-bold mb-2 text-blue-600">
                            {selectedTask.employees[0]?.allocated_to}
                          </h2>
                        )}

                        <div className="grid grid-cols-2 gap-4 w-full mt-6">
                          {selectedTask.task_type?.type && (
                            <InfoCard
                              title="Task Type"
                              value={selectedTask.task_type.type}
                              icon="mdi mdi-calendar-check text-blue-500"
                            />
                          )}
                          {selectedTask.statuses.length > 0 && (
                            <InfoCard
                              title="Status"
                              value={selectedTask.statuses.join(", ")}
                              icon="mdi mdi-progress-check text-green-500"
                            />
                          )}
                          {selectedTask.approve_status && (
                            <InfoCard
                              title="Approval"
                              value={selectedTask.approve_status}
                              icon="mdi mdi-check-decagram text-purple-500"
                            />
                          )}
                          {selectedTask.deadline && (
                            <InfoCard
                              title="Deadline"
                              value={selectedTask.deadline}
                              icon="mdi mdi-calendar-clock text-pink-500"
                            />
                          )}
                        </div>

                        {selectedTask.approved_by[0]?.type && (
                          <div className="mt-6 bg-gray-50 rounded-lg p-4 w-full border hover:shadow transition">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <span className="mdi mdi-account-check text-yellow-600 text-xl"></span>
                                <span>Approved By</span>
                              </div>
                              <span className="text-base font-bold text-yellow-600">
                                {selectedTask.approved_by[0].type}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div className="md:col-span-2">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                      <div className="flex justify-between items-center mb-8">
                        {selectedTask.tasks[0]?.type && (
                          <h2 className="flex-grow text-base font-bold text-gray-800 break-words">
                            {selectedTask.tasks[0].type}
                          </h2>
                        )}
                        {/* <button
                          onClick={() =>
                            triggerMenuNavigation("task/taskManagement.jsx")
                          }
                          className="flex-shrink-0 flex items-center justify-center gap-2 w-40 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
                        >
                          <span className="mdi mdi-plus text-lg"></span>
                          <span>New Task</span>
                        </button> */}
                      </div>
                      <div className="space-y-6">
                        {selectedTask.description[0]?.description && (
                          <DetailCard
                            title="Description"
                            value={selectedTask.description[0].description}
                          />
                        )}
                        <div className="grid grid-cols-2 gap-6">
                          {selectedTask.kra[0]?.type && (
                            <DetailCard
                              title="KRA"
                              value={selectedTask.kra[0].type}
                            />
                          )}
                          {selectedTask.kpa[0]?.type && (
                            <DetailCard
                              title="KPA"
                              value={selectedTask.kpa[0].type}
                            />
                          )}
                        </div>
                        {selectedTask.ALLOCATOR[0]?.type && (
                          <DetailCard
                            title="Assigned By"
                            value={selectedTask.ALLOCATOR[0].type}
                          />
                        )}
                        {selectedTask.reply[0]?.type && (
                          <DetailCard
                            title="Reply"
                            value={selectedTask.reply[0].type}
                          />
                        )}
                        {selectedTask.task_attachment[0]?.type && (
                          <DetailCard
                            title="Attachment"
                            value={
                              <a
                                href={`https://s3-triz.fra1.digitaloceanspaces.com/public/hp_task/${selectedTask.task_attachment[0].type}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {selectedTask.task_attachment[0].type}
                              </a>
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="p-6 text-gray-400">No task selected</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function EmployeeImage({
  image,
  fullName,
  className,
}: {
  image?: string;
  fullName?: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (image && image.trim()) {
      return image.startsWith("http")
        ? image
        : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
            image
          )}`;
    }
    return fallbackImg;
  });

  return (
    <img
      src={imgSrc}
      alt={fullName || "Employee"}
      title={fullName}
      onError={() => setImgSrc(fallbackImg)}
      className={className || "w-8 h-8 rounded-full border-2 border-white object-cover"}
    />
  );
}
function EmployeeAvatars({ employees }: { employees: Employee[] }) {
  return (
    <div className="flex -space-x-2 items-center">
      {employees.map((emp, idx) => (
        <EmployeeImage
          key={idx}
          image={emp.image}
          fullName={emp.allocated_to}
        />
      ))}
      <span
        className="text-xs text-gray-700 ml-2"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {employees[0]?.allocated_to}
      </span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    Easy: "border border-green-400 bg-green-100 text-green-700",
    Medium: "border border-blue-400 bg-blue-100 text-blue-700",
    Hard: "border border-red-400 bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: "border border-green-400 bg-green-100 text-green-700",
    "IN-PROGRESS": "border border-yellow-400 bg-yellow-100 text-yellow-700",
    PENDING: "border border-gray-400 bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {status}
    </span>
  );
}

function ApproveStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="item-center inline-block min-w-[50px] h-[5px] rounded-full bg-gray-400" />
    );
  }

  const colors: Record<string, string> = {
    approved: "border border-green-400 bg-green-100 text-green-700",
    rejected: "border border-red-400 bg-red-100 text-red-700",
    pending: "border border-gray-400 bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`min-w-[80px] font-semibold text-center px-2 py-1 text-xs sm:text-xs font-medium rounded-full ${colors[status]}`}
    >
      {status}
    </span>
  );
}

// Card Components
function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-4 border hover:shadow transition">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className={`${icon} text-xl`}></span>
        <span>{title}</span>
      </div>
      <div className="text-gray-600 text-sm mt-2">{value}</div>
    </div>
  );
}

function DetailCard({ title, value }: { title: string; value: ReactNode }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 p-5 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm mt-2">{value}</p>
    </div>
  );
}
