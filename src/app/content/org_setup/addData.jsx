import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

// ✅ Import Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ✅ Import child forms
import AddAcademic from "../org_setup/component/addAcademic";
import AddStandard from "../org_setup/component/addStandard";
import AddCourse from "../org_setup/component/addCourse";

export default function AddData() {
  const [activeTab, setActiveTab] = useState("industry");
  const [sessionData, setSessionData] = useState({});
  const [loading, setLoading] = useState(true);

  const [IndustryData, setIndustryData] = useState([]);
  const [TypesData, setTypesData] = useState([]);
  const [CourseData, setCourseData] = useState([]);

  const [filters, setFilters] = useState({}); // column filters

  // ✅ Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [tabsData, setTabsData] = useState([
    {
      id: "industry",
      label: "Industry",
      icon: "Building2",
    },
    {
      id: "types",
      label: "Types",
      icon: "mdi mdi-view-list",
    },
    {
      id: "courses",
      label: "Courses",
      icon: "mdi mdi-bookshelf",
    },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_id } =
          JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          sub_institute_id,
          org_type,
          user_id,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchAllData();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${sessionData.url}/school_setup/master_setup?type=API&sub_institute_id=${sessionData.sub_institute_id}&user_id=${sessionData.user_id}&token=${sessionData.token}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setIndustryData(data.grade || []);
      setTypesData(data.standard || []);
      setCourseData(data.subject_data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // column filter handler
  const handleColumnFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toLowerCase(),
    }));
  };

  // Filtered Data
  const getFilteredData = (data, type) => {
    let filtered = data.filter((item, index) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        if (key === "srno") return String(index + 1).includes(filters[key]);
        return String(item[key] || "")
          .toLowerCase()
          .includes(filters[key]);
      });
    });

    // If no match, return all data
    return filtered.length > 0 ? filtered : data;
  };

  // Table Columns
  const getColumns = (type) => {
    if (type === "industry") {
      return [
        {
          name: (
            <div>
              <div>Sr No.</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("srno", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row, i) => i + 1,
          sortable: true,
        },
        {
          name: (
            <div>
              <div>Industry Name</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("title", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row) => row.title,
          sortable: true,
        },
        {
          name: (
            <div>
              <div>Short Name</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("short_name", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row) => row.short_name,
          sortable: true,
        },
      ];
    }

    if (type === "types") {
      return [
        {
          name: (
            <div>
              <div>Sr No.</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("srno", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row, i) => i + 1,
          sortable: true,
        },
        {
          name: (
            <div>
              <div>Type Name</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("name", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row) => row.name,
          sortable: true,
        },
        {
          name: (
            <div>
              <div>Short Name</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("short_name", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row) => row.short_name,
          sortable: true,
        },
        {
          name: (
            <div>
              <div>Industry</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("grade_name", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row) => row.grade_name,
          sortable: true,
        },
      ];
    }

    if (type === "courses") {
      return [
        {
          name: (
            <div>
              <div>Sr No.</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("srno", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row, i) => i + 1,
          sortable: true,
        },
        {
          name: (
            <div>
              <div>Course Name</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleColumnFilter("display_name", e.target.value)}
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row) => row.display_name,
          sortable: true,
        },
        {
          name: (
            <div>
              <div>Type</div>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) =>
                  handleColumnFilter("standard_name", e.target.value)
                }
                style={{ width: "100%", padding: "4px", fontSize: "12px" }}
              />
            </div>
          ),
          selector: (row) => row.standard_name,
          sortable: true,
        },
      ];
    }
  };

  // Custom Styles for table
  const customStyles = {
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
        borderRadius: "10px",
        overflow: "hidden",
      },
    },
  };

  // ✅ Render dialog content based on active tab
  const renderDialogContent = () => {
    if (activeTab === "industry") return <AddAcademic onClose={() => setIsDialogOpen(false)} onSave={fetchAllData} sessionData={sessionData}/>;
    if (activeTab === "types") return <AddStandard onClose={() => setIsDialogOpen(false)} onSave={fetchAllData} sessionData={sessionData}/>;
    if (activeTab === "courses") return <AddCourse onClose={() => setIsDialogOpen(false)} onSave={fetchAllData} sessionData={sessionData}/>;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <main className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Master Setups
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your Master information.
              </p>
            </div>
          </div>
        </main>
      </div>

      <div className="w-full flex gap-2">
        <div className="w-1/4">
          <ul className="bg-card border border-border rounded-lg">
            {tabsData.map((tab, index) => (
              <li
                key={index}
                className={`flex items-center gap-x-3 py-2 px-3 border-b rounded-lg cursor-pointer ${
                  activeTab === tab.id ? "bg-[#51a2ff] text-white" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="text-base">{tab.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4">
          <div className="div bg-card border border-border rounded-lg p-2">
            {activeTab === "industry" && (
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <div className="text-left">Industry</div>
                  <div className="text-right">
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="px-4 py-1 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <DataTable
                  columns={getColumns("industry")}
                  data={getFilteredData(IndustryData, "industry")}
                  customStyles={customStyles}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={
                    <div className="p-4 text-center">No data available</div>
                  }
                  persistTableHead
                />
              </div>
            )}

            {activeTab === "types" && (
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <div className="text-left">Types</div>
                  <div className="text-right">
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="px-4 py-1 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <DataTable
                  columns={getColumns("types")}
                  data={getFilteredData(TypesData, "types")}
                  customStyles={customStyles}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={
                    <div className="p-4 text-center">No data available</div>
                  }
                  persistTableHead
                />
              </div>
            )}

            {activeTab === "courses" && (
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <div className="text-left">Courses</div>
                  <div className="text-right">
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="px-4 py-1 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <DataTable
                  columns={getColumns("courses")}
                  data={getFilteredData(CourseData, "courses")}
                  customStyles={customStyles}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={
                    <div className="p-4 text-center">No data available</div>
                  }
                  persistTableHead
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Common Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeTab === "industry" && "Add Industry"}
              {activeTab === "types" && "Add Type"}
              {activeTab === "courses" && "Add Course"}
            </DialogTitle>
            <hr />
          </DialogHeader>
          {/* Render different forms */}
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
