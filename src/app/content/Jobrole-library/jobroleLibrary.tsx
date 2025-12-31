//
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import AddDialog from "@/components/jobroleComponent/addDialougeOld";
import EditDialog from "@/components/jobroleComponent/editDialouge";
import { Atom } from "react-loading-indicators";
import {
  Funnel,
  Edit,
  Trash,
  Eye,
  Square,
  Table,
  Plus,
  Search,
  SlidersHorizontal,
  Settings,
  Sparkles,
  Upload,
  Download,
  Layers,
  FileText,
  GitMerge,
  PauseCircle,
  AlertCircle,
  Bot,
  Filter,
  MoreVertical
} from "lucide-react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import JobDescriptionModal from "./JobDescriptionModal";
import ConfigurationModal from "./ConfigurationModal";
import GenerateAssessmentModal from "./GenerateAssessmentModal";

import ShepherdTour from "../Onboarding/Competency-Management/ShepherdTour";
import { generateDetailTourSteps } from "../../../lib/tourSteps";

type JobRole = {
  id: number;
  industries: string;
  department: string;
  sub_department: string;
  jobrole: string;
  description: string;
  jobrole_category: string;
  performance_expectation: string;
  status: string;
  related_jobrole: string;
};


interface PageProps {
  showDetailTour?: boolean | { show: boolean; onComplete?: () => void };
}

export default function HomePage({ showDetailTour }: PageProps) {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");
  const [viewMode, setViewMode] = useState<"myview" | "table">("myview");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Detail tour state
  const [showTour, setShowTour] = useState(false);

  // State for modals
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
    settings: false,
    import: false,
    export: false,
  });

  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);
  const [jobDescriptionModalOpen, setJobDescriptionModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [configJsonObject, setConfigJsonObject] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  // ✅ New state for dropdown menu
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // ✅ Load session data
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



    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  // ✅ Fetch job roles
  const fetchData = async () => {
    if (!sessionData.url || !sessionData.subInstituteId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}`
      );
      const json = await res.json();

      let data: JobRole[] = [];
      if (Array.isArray(json)) {
        data = json;
      } else if (json?.data) {
        data = json.data;
      }

      setRoles(data);

      // const uniqueDepts = Array.from(
      //   new Set(data.map((r) => r.department).filter(Boolean))
      // ).sort((a, b) => a.localeCompare(b));

      // setDepartments(["All Departments", ...uniqueDepts]);
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch department list from new API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
        );
        const json = await res.json();

        console.log("Fetched departments:", json);

        if (json?.data && typeof json.data === "object") {
          const deptList = Object.keys(json.data).filter(dept => dept.trim() !== ""); // Filter out empty department names

          setDepartments(["All Departments", ...deptList]);
        }
      } catch (error) {
        console.error("❌ Department fetch error:", error);
      }
    };

    if (sessionData.subInstituteId) fetchDepartments();
  }, [sessionData.subInstituteId]);




  useEffect(() => {
    fetchData();
  }, [sessionData]);


  useEffect(() => {
    const shouldShow = typeof showDetailTour === 'object' ? showDetailTour.show : showDetailTour;
    if (shouldShow) {
      setShowTour(true);
    }
  }, [showDetailTour]);
  // ✅ Delete role
  const handleDeleteClick = async (id: number) => {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/jobrole_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=user`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);

        await fetchData();
        setSelectedJobRole(null);
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  // ✅ Handlers
  const handleEdit = (id: number) => {
    setSelectedJobRole(id);
    setDialogOpen({ ...dialogOpen, edit: true });
  };

  const handleView = (id: number) => {
    setSelectedJobRole(id);
    setJobDescriptionModalOpen(true);
  };

  const handleCloseModel = () => {
    setDialogOpen({ view: false, add: false, edit: false, settings: false, import: false, export: false });
    setSelectedJobRole(null);
  };

  const handleCloseJobDescriptionModal = () => {
    setJobDescriptionModalOpen(false);
    setSelectedJobRole(null);
  };

  // ✅ Toggle actions menu
  const toggleActionsMenu = () => {
    setIsActionsMenuOpen(!isActionsMenuOpen);
  };

  // ✅ Get selected job role data for modal
  const getSelectedJobRoleData = () => {
    if (!selectedJobRole) return null;
    return roles.find(role => role.id === selectedJobRole) || null;
  };

  // ✅ Filtered roles
  const filteredRoles =
    selectedDept === "All Departments"
      ? roles
      : roles.filter((role) => role.department === selectedDept);

  // ✅ Apply search on filtered roles
  const searchedRoles = filteredRoles.filter(
    (role) =>
      (role.jobrole || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );


  // ✅ Column search state
  const [columnFilters, setColumnFilters] = useState<{
    [key: string]: string;
  }>({ jobrole: "", department: "", description: "", performance_expectation: "" });

  // ✅ Filter data based on column search
  const columnFilteredRoles = searchedRoles.filter((role) => {
    return (
      (role.jobrole || "").toLowerCase().includes((columnFilters.jobrole || "").toLowerCase()) &&
      (role.department || "").toLowerCase().includes((columnFilters.department || "").toLowerCase()) &&
      (role.description || "").toLowerCase().includes((columnFilters.description || "").toLowerCase()) &&
      (role.performance_expectation || "").toLowerCase().includes((columnFilters.performance_expectation || "").toLowerCase())
    );
  });


  // ✅ DataTable columns with column search inputs
  const columns: TableColumn<JobRole>[] = [
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
            placeholder="Search.."
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
      selector: (row) => row.department,
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
              setColumnFilters({ ...columnFilters, description: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.description,
      sortable: false,
      wrap: true,
      width: "320px",
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
      selector: (row) => row.performance_expectation,
      sortable: false,
      wrap: true,
      width: "170px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          {/* View Button */}
          <button
            onClick={() => handleView(row.id)}
            className="bg-green-500 hover:bg-green-700 text-white text-xs p-1.5 rounded transition-colors"
            title="View Job Role Details"
          >
            <Eye size={14} />
          </button>
          {/* Edit Button */}
          <button
            onClick={() => handleEdit(row.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs p-1.5 rounded transition-colors"
            title="Edit Job Role"
          >
            <Edit size={14} />
          </button>
          {/* Skill Mapping Button */}
          <button
            onClick={() => {/* Add skill mapping functionality */ }}
            className="bg-purple-500 hover:bg-purple-700 text-white text-xs p-1.5 rounded transition-colors"
            title="View Skill Mapping"
          >
            <GitMerge size={14} />
          </button>
          {/* JD Preview Button */}

          {/* Delete Button */}
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs p-1.5 rounded transition-colors"
            title="Delete Job Role"
          >
            <Trash size={14} />
          </button>
        </div>
      ),
      width: "170px"
    },
  ];

  // ✅ Custom styles for DataTable
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

  return (
    <div className="pt-6 sm:px-4 px-2 bg-background rounded-xl ">
      {/* 🔝 Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex-1 max-w-md">
        

          {/* Search Bar */}
          <div className="relative ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search job roles.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 hover:rounded-md hover:bg-gray-100 transition-colors" title="Filter">
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
                    onValueChange={(val) => {
                      setSelectedDept(val);
                      setSelected(null);
                    }}
                    defaultValue="All Departments"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>

                    <SelectContent className="max-h-60 w-70 overflow-y-auto">
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
              </div>
            </PopoverContent>
          </Popover>



          {/* ✅ View Mode Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("myview")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "myview"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              title="Card View"
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "table"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>
          {/* Global Actions - Horizontal dropdown */}
          <div className="relative">
            <button
              onClick={toggleActionsMenu}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="More Actions"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>

            {/* Horizontal Dropdown Menu */}
            <AnimatePresence>
              {isActionsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-1">
                    {/* Add New Jobrole */}
                    <button
                      className="hover:bg-gray-100 px-2 py-2 flex items-center justify-center transition-colors rounded-md "
                      onClick={() => setDialogOpen({ ...dialogOpen, add: true })}
                      title="Add New Job Role"
                    >
                      <Plus className="h-5 w-5 text-gray-600" />
                    </button>

                    <button
                      onClick={() => {
                        setDialogOpen({ ...dialogOpen, import: true });
                        setIsActionsMenuOpen(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Import Job Roles "
                    >
                      <Upload className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        setDialogOpen({ ...dialogOpen, export: true });
                        setIsActionsMenuOpen(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Export Job Roles"
                    >
                      <Download className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        setDialogOpen({ ...dialogOpen, settings: true });
                        setIsActionsMenuOpen(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Settings"
                    >
                      <Settings className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        /* Add custom fields functionality */
                        setIsActionsMenuOpen(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Configure Custom Fields"
                    >
                      <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      {dialogOpen.add && (
        <AddDialog
          skillId={null}
          isOpen={dialogOpen.add}
          onClose={handleCloseModel}
          onSuccess={() => {
            handleCloseModel();
            fetchData();
          }}
        />
      )}

      {/* Edit Dialog */}
      {dialogOpen.edit && selectedJobRole && (
        <EditDialog
          jobRoleId={selectedJobRole}
          onClose={handleCloseModel}
          onSuccess={() => {
            handleCloseModel();
            fetchData();
          }}
        />
      )}

      {/* Job Description Modal */}
      {jobDescriptionModalOpen && (
        <JobDescriptionModal
          isOpen={jobDescriptionModalOpen}
          onClose={handleCloseJobDescriptionModal}
          onConfig={(jsonObject) => {
            setJobDescriptionModalOpen(false);
            setConfigJsonObject(jsonObject);
            setIsConfigModalOpen(true);
          }}
          onGenerateAssessment={(data) => {
            setJobDescriptionModalOpen(false);
            setAssessmentData(data);
            setIsAssessmentModalOpen(true);
          }}
          jobRole={getSelectedJobRoleData()}
        />
      )}

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        jsonObject={configJsonObject}
      />

      {/* Generate Assessment Modal */}
      <GenerateAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        data={assessmentData}
      />

      {/* Loader / No Data */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Atom color="#525ceaff" size="medium" text="" textColor="" />
        </div>
      ) : searchedRoles.length === 0 ? (
        <div className="text-center text-gray-600">No job roles found.</div>
      ) : viewMode === "myview" ? (
        // ✅ My View (cards)
        <div
              className="jobrolecard-wrapper
            grid gap-2.5 min-h-40 w-full
            sm:grid-cols-6 grid-cols-2 grid-flow-dense
            auto-rows-[110px]
          "

        >
          {searchedRoles.map((role) => {
            const isSelected = selected === role.id;
            const isInactive = role.status === "inactive";
            const isAIGenerated = role.related_jobrole?.includes("ai") || role.jobrole_category?.includes("ai");

            return (
              <motion.div
                key={role.id}
                layout
                transition={{
                  layout: { duration: 0.4, ease: "easeInOut" },
                }}
                onClick={() => setSelected(isSelected ? null : role.id)}
                className={`relative cursor-pointer 
                  bg-[#5E9DFF] rounded-[5px] hover:rounded-[20px] 
                  flex flex-col items-center justify-center text-center p-3
                  text-white
                  ${isSelected
                    ? "sm:col-span-2 sm:row-span-2 col-span-2 row-span-2"
                    : ""
                  }
                  ${isInactive ? "opacity-70" : ""}
                `}
              >
                {/* Conditional Icons */}
                {isInactive && (
                  <div className="absolute top-1 left-1" title="Job Role is Inactive">
                    <PauseCircle className="w-4 h-4 text-yellow-300" />
                  </div>
                )}
                {isAIGenerated && (
                  <div className="absolute top-1 right-1" title="AI-Generated Job Role">
                    <Bot className="w-4 h-4 text-green-300" />
                  </div>
                )}

                {!isSelected && (
                  <>
                    <motion.span
                      layout
                      className="text-[14px] font-semibold mb-2 line-clamp-3 overflow-hidden text-ellipsis w-full px-1"
                    >
                      {role.jobrole}
                    </motion.span>
                    <div
                      className="flex justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View Button */}
                      <button
                        onClick={() => handleView(role.id)}
                        title="View Job Role Details"
                      >
                        <Eye className="text-white hover:text-gray-200" size={14} />
                      </button>
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(role.id)}
                        title="Edit Job Role"
                      >
                        <Edit className="text-white hover:text-gray-200" size={14} />
                      </button>
                      {/* Skill Mapping Button */}
                      <button
                        onClick={() => {/* Add skill mapping functionality */ }}
                        title="View Skill Mapping"
                      >
                        <GitMerge className="text-white hover:text-gray-200" size={14} />
                      </button>
                      {/* JD Preview Button */}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteClick(role.id)}
                        title="Delete Job Role"
                      >
                        <Trash className="text-white hover:text-gray-200" size={14} />
                      </button>
                    </div>
                  </>
                )}

                {isSelected && (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-10 flex items-center justify-center"
                  >
                    <div className="bg-white text-black rounded-md border border-gray-300 w-full h-full flex">
                      <div className="w-1 bg-[#5E9DFF] rounded-l-md"></div>
                      <div className="flex-1 p-4 flex flex-col">
                        <h3 className="text-base font-semibold text-center mb-2">
                          {role.jobrole}
                        </h3>
                        <div className="border-t border-gray-600 mb-3"></div>
                        <p
                          className="mb-3 line-clamp-3 overflow-hidden text-ellipsis"
                          title={role.description}
                        >
                          <span className="font-bold">Description:</span>{" "}
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        // ✅ DataTable View
        <div>
          <DataTable
            columns={columns}
            data={columnFilteredRoles}
            customStyles={customStyles}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </div>
      )}

      {/* Detail Tour */}
      {showTour && (
        <ShepherdTour
          steps={generateDetailTourSteps("Jobrole")}
          onComplete={() => {
            setShowTour(false);
            if (typeof showDetailTour === 'object' && showDetailTour.onComplete) {
              showDetailTour.onComplete();
            }
          }}
        />
      )}

    </div>
  );
}