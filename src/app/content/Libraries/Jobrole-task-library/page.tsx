//src/app/content/Libraries/Jobrole-task-library/page.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Atom } from "react-loading-indicators";
import {
  Funnel,
  Square,
  Table,
  Copy,
  Edit,
  Trash,
  Sparkles,
  Plus,
  SlidersHorizontal,
  ListChecks,
  Download,
  Settings,
  HelpCircle,
  Search,
  MoreVertical,
  Upload,
} from "lucide-react";
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
import DataTable, {
  TableColumn,
  TableStyles,
} from "react-data-table-component";
import ConfigurationModal from "../../Jobrole-library/ConfigurationModal";
import ShepherdTour from "../../Onboarding/Competency-Management/ShepherdTour";
import { generateDetailTourSteps } from "@/lib/tourSteps";

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

interface CriticalWorkFunctionGridProps {
  showDetailTour?: {
    show: boolean;
    onComplete: () => void;
  };
}

interface PageProps {
  showDetailTour?: boolean | { show: boolean; onComplete?: () => void };
}

const CriticalWorkFunctionGrid: React.FC<CriticalWorkFunctionGridProps> = ({ showDetailTour }: PageProps) => {
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
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRadio, setSelectedRadio] = useState<number | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configJsonObject, setConfigJsonObject] = useState<any>(null);
  const [showRadioButtons, setShowRadioButtons] = useState(false);

  // Header shrinking
  const [headerShrunk, setHeaderShrunk] = useState(false);

  // Content section ref
  const contentRef = useRef<HTMLElement>(null);
  // Detail tour state
  const [showTour, setShowTour] = useState(false);
  // ✅ View toggle state
  const [viewMode, setViewMode] = useState<"myview" | "table">("myview");

  // ✅ Column filters for DataTable
  const [columnFilters, setColumnFilters] = useState({
    jobrole: "",
    department: "",
    description: "",
    performance_expectation: "",
  });

  // ✅ New state for dropdown menu
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

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

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isActionsMenuOpen) {
        setIsActionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  // Header shrinking on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && contentRef.current.scrollTop > 100) {
        setHeaderShrunk(true);
      } else {
        setHeaderShrunk(false);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      return () => contentElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Fetch data after sessionData is ready
  useEffect(() => {
    if (!sessionData.url || !sessionData.subInstituteId) return;
    fetchData();
  }, [sessionData]);


  useEffect(() => {
    const shouldShow = typeof showDetailTour === 'object' ? showDetailTour.show : showDetailTour;
    if (shouldShow) {
      setShowTour(true);
    }
  }, [showDetailTour]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[sector]=${sessionData.orgType}&order_by[direction]=desc`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        }
      );
      const json = await res.json();
      const dataArray = Array.isArray(json) ? json : [];
      setData(dataArray);

      // Don't set any default filters to show all tasks on load
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle select changes
  const handleDepartmentChange = (val: string) => {
    setSelectedDept(val);
    setSelectedJobrole(""); // ❌ do not auto-select jobrole
    setSelectedFunction(""); // reset function filter
  };

  const handleJobroleChange = (val: string) => {
    setSelectedJobrole(val);
    // Don't auto-select function to allow showing all
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

  // Action handlers for new buttons
  const handleAISuggest = () => {
    setIsActionsMenuOpen(false);
    alert("AI Suggestions feature coming soon!");
  };

  const handleAddJobRole = () => {
    setIsActionsMenuOpen(false);
    alert("Add Job Role feature coming soon!");
  };

  const handleCustomFields = () => {
    setIsActionsMenuOpen(false);
    alert("Custom Fields feature coming soon!");
  };

  const handleBulkActions = () => {
    setIsActionsMenuOpen(false);
    alert("Bulk Actions feature coming soon!");
  };

  const handleExport = () => {
    setIsActionsMenuOpen(false);
    alert("Export feature coming soon!");
  };
  const handleImport = () => {
    setIsActionsMenuOpen(false);
    alert("Import feature coming soon!");
  };
  const handleSettings = () => {
    setIsActionsMenuOpen(false);
    setShowSettingsModal(true);
  };

  const handleHelp = () => {
    setIsActionsMenuOpen(false);
    alert("Help feature coming soon!");
  };

  const handleCloneTask = async (id: number) => {
    if (!id) return;
    try {
      // Find the task to clone
      const taskToClone = data.find((item) => item.id === id);
      if (!taskToClone) {
        alert("Task not found!");
        return;
      }

      // Create a clone of the task
      const clonedTask = {
        ...taskToClone,
        task: `${taskToClone.task} (Copy)`,
        id: undefined, // Remove ID to create new record
      };

      // Send POST request to create cloned task
      const res = await fetch(
        `${sessionData.url}/jobrole_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.token}`,
          },
          body: JSON.stringify(clonedTask),
        }
      );

      const result = await res.json();
      if (result.success) {
        alert("Task cloned successfully!");
        fetchData(); // Refresh data
      } else {
        alert("Error cloning task: " + result.message);
      }
    } catch (error) {
      console.error("Error cloning task:", error);
      alert("Error cloning task");
    }
  };

  // Toggle actions menu
  const toggleActionsMenu = () => {
    setIsActionsMenuOpen(!isActionsMenuOpen);
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
    new Set(
      data.map((d) => d.track || "").filter((track) => track.trim() !== "")
    )
  ).sort();

  const uniqueJobroles = Array.from(
    new Set(
      data
        .filter((d) => !selectedDept || d.track === selectedDept)
        .map((d) => d.jobrole || "")
        .filter((jobrole) => jobrole.trim() !== "")
    )
  ).sort();

  const uniqueFunctions =
    selectedDept && selectedJobrole
      ? Array.from(
          new Set(
            data
              .filter(
                (d) => d.track === selectedDept && d.jobrole === selectedJobrole
              )
              .map((d) => d.critical_work_function || "")
              .filter((func) => func.trim() !== "")
          )
        ).sort()
      : Array.from(
          new Set(
            data
              .map((d) => d.critical_work_function || "")
              .filter((func) => func.trim() !== "")
          )
        ).sort();

  // Filtered grid data
  const filteredData = data.filter((item) => {
    if (selectedDept && item.track !== selectedDept) return false;
    if (selectedJobrole && item.jobrole !== selectedJobrole) return false;
    if (selectedFunction && item.critical_work_function !== selectedFunction)
      return false;
    return true;
  });

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
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleCloneTask(row.id)}
            className="bg-green-500 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            <Trash size={14} />
          </button>
        </div>
      ),
      width: "140px",
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
      val
        ? String(row[key as keyof JobRoleTask] || "")
            .toLowerCase()
            .includes(val.toLowerCase())
        : true
    )
  );

  return (
    <>
      <div className="min-h-screen overflow-y-auto scrollbar-hide">
        <div
          className={`p-4 transition-all duration-300 ${
            headerShrunk ? "p-2" : "p-4"
          }`}
        >
          {/* Top filter + Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            {/* Search Bar - Left */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobrole task, categories, or proficiency levels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Section - More Icon + Filter + View Toggle */}
            <div className="flex items-center space-x-2">
              {/* AI Generate Button */}
              <button
                onClick={() => {
                  setShowRadioButtons((prev) => !prev);

                  // Reset selection when hiding radios
                  if (showRadioButtons) {
                    setSelectedRadio(null);
                    setConfigJsonObject(null);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:rounded-md transition-colors"
                title="AI Generate"
              >
                {showRadioButtons ? "Hide selection" : "Generate with AI"}
              </button>

              {/* Consolidated Actions Dropdown */}

              {/* Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 hover:rounded-md hover:bg-gray-100 transition-colors">
                    <Funnel className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6 bg-white shadow-xl border border-gray-200 rounded-xl">
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
                        Critical Work Function
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

              {/* View Toggle */}
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("myview")}
                  className={`px-3 py-2 flex items-center justify-center transition-colors ${
                    viewMode === "myview"
                      ? "bg-blue-100 text-blue-600 border-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Square className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 flex items-center justify-center transition-colors ${
                    viewMode === "table"
                      ? "bg-blue-100 text-blue-600 border-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Table className="h-5 w-5" />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={toggleActionsMenu}
                  className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="More Actions"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {/* Horizontal Dropdown Menu */}
                {isActionsMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-1">
                      {/* Generative AI Assistant */}
                      <button
                        onClick={handleAISuggest}
                        className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="AI Suggestions"
                      >
                        <Sparkles className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Bulk Actions */}
                      {selectedTasks.length > 0 && (
                        <button
                          onClick={handleBulkActions}
                          className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Bulk Actions"
                        >
                          <ListChecks className="w-5 h-5 text-gray-600" />
                        </button>
                      )}

                      <button
                        onClick={handleImport}
                        className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Import jobrole task"
                      >
                        <Upload className="w-5 h-5 text-gray-600" />
                      </button>
                      {/* Export */}
                      <button
                        onClick={handleExport}
                        className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Export jobrole task"
                      >
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Settings */}
                      <button
                        onClick={handleSettings}
                        className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Settings"
                      >
                        <Settings className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Help */}
                      <button
                        onClick={handleHelp}
                        className="p-2 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Help"
                      >
                        <HelpCircle className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Toggle between Card View and Table View */}
        {viewMode === "myview" ? (
          <div id="task-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="relative group overflow-hidden rounded-3xl shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 flex flex-col"
              >
                <div className="absolute z-[10] right-0 bottom-0 w-[1px] h-[1px] bg-[#B7DAFF] rounded-[0px_50px_0px_15px] transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:rounded-[15px] group-hover:opacity-[0.5] pointer-events-none"></div>
                {/* ⭐ Radio Button (Top Right) */}
                {showRadioButtons && (
                  <div className="absolute top-2 right-5 z-20">
                    <input
                      type="radio"
                      name="taskSelection"
                      checked={selectedRadio === item.id}
                      onClick={() => {
                        if (selectedRadio === item.id) {
                          // 🔁 Second click → uncheck
                          setSelectedRadio(null);
                          setConfigJsonObject(null);
                        } else {
                          // ✅ First click → select
                          setSelectedRadio(item.id);
                          setConfigJsonObject({
                            industry: sessionData.orgType,
                            department: item.track,
                            jobrole: item.jobrole,
                            critical_work_function: item.critical_work_function,
                            key_tasks: item.task,
                          });
                        }
                      }}
                      className="h-3 w-3 cursor-pointer"
                    />
                  </div>
                )}
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
                  {/* Configure Button (Only visible if this card is selected by radio) */}
                  {selectedRadio === item.id && (
                    <button
                      className="p-2 text-white bg-blue-400 hover:bg-blue-400 rounded transition-colors text-gray-600"
                      onClick={() => setIsConfigModalOpen(true)}
                    >
                      Configuration
                    </button>
                  )}
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    onClick={() => handleEditClick(item.id, item.jobrole)}
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    onClick={() => handleDeleteClick(item.id)}
                  >
                    <Trash size={16} />
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
                <span className="p-1">{viewData?.critical_work_function}</span>
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600">Settings feature coming soon!</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Configuration Modal */}
      {configJsonObject && (
        <ConfigurationModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          jsonObject={configJsonObject}
        />
      )}

      {/* Detail Tour */}
      {showTour && (
        <ShepherdTour
          steps={generateDetailTourSteps('Jobrole Task')}
          onComplete={() => {
            setShowTour(false);
            if (typeof showDetailTour === 'object' && showDetailTour.onComplete) {
              showDetailTour.onComplete();
            }
          }}
        />
      )}
    </>
  );
};

export default CriticalWorkFunctionGrid;
