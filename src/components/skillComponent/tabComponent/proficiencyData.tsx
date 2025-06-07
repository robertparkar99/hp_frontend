import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering

// Dynamically import ExcelExportButton, PdfExportButton, and PrintButton
// This ensures they are only loaded and rendered on the client side,
// which is crucial for browser-specific APIs like jsPDF and window.open.
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

// Define the type for the form input fields (assuming proficiency_level and description are always strings, even if empty)
type ProficiencyLevel = {
  id?: number;
  proficiency_level: string; // Made required
  description: string; // Made required
  category?: string;
  sub_category?: string;
  skillTitle?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
};

// Define the type for the data displayed in the table
type SubmittedProficiency = {
  id: number;
  proficiency_level: string;
  description: string;
  category?: string;
  sub_category?: string;
  skillTitle?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
};

// Define the props for the ProficiencyLevelData component
const ProficiencyLevelData: React.FC<{ editData: any }> = ({ editData }) => {
  // State for session data, initialized from localStorage
  const [sessionData, setSessionData] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem("userData")) {
      const userData = JSON.parse(localStorage.getItem("userData")!);
      return {
        url: userData.APP_URL || "",
        token: userData.token || "",
        orgType: userData.org_type || "",
        subInstituteId: userData.sub_institute_id || "",
        userId: userData.user_id || "",
        userProfile: userData.user_profile_name || "",
      };
    }
    return { url: "", token: "", orgType: "", subInstituteId: "", userId: "", userProfile: "" };
  });

  // Component states
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([{ proficiency_level: "", description: "" }]);
  const [submittedData, setSubmittedData] = useState<SubmittedProficiency[]>([]);
  const [loading, setLoading] = useState(false); // For form submission loading state
  const [tableLoading, setTableLoading] = useState(false); // For data table loading state
  const [editingId, setEditingId] = useState<number | null>(null); // ID of the item being edited
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({}); // For DataTable column filtering
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null); // For success/error messages

  // Effect to fetch initial data on component mount or when session data/editData changes
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      if (editData?.id) {
        fetchInitialData();
      } else {
        fetchSubmittedData();
      }
    }
    // Parse proficiency_level_data if available in editData (for pre-filling form on edit)
    if (editData?.proficiency_level_data) {
      try {
        const parsedData = JSON.parse(editData.proficiency_level_data);
        if (Array.isArray(parsedData)) {
          // Ensure that parsed data conforms to ProficiencyLevel type
          const typedParsedData: ProficiencyLevel[] = parsedData.map((item: any) => ({
            proficiency_level: item.proficiency_level || "",
            description: item.description || "",
            // Assign other properties if they exist in parsedData
            ...item
          }));
          setProficiencyLevels(typedParsedData.length ? typedParsedData : [{ proficiency_level: "", description: "" }]);
        }
      } catch (error) {
        console.error("Error parsing proficiency_level_data:", error);
      }
    }
  }, [sessionData, editData]);

  // Helper function to transform raw API data into SubmittedProficiency format
  const transformData = (item: any): SubmittedProficiency => ({
    id: item.id,
    proficiency_level: item.proficiency_level || item.job_role || "", // Handle potential different field names and ensure string
    description: item.description || "", // Ensure description is a string
    category: item.category,
    sub_category: item.sub_category,
    skillTitle: item.skillTitle,
    created_by_user: item?.first_name ? `${item.first_name} ${item.last_name}` : undefined,
    created_at: item.created_at,
    updated_at: item.updated_at
  });

  // Function to fetch data for editing a specific skill (initial form load)
  const fetchInitialData = async () => {
    setTableLoading(false);
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&skill_id=${editData?.id}&formType=proficiency_level`
      );
      const data = await res.json();
      setSubmittedData(data.userproficiency_levelData);
      
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setMessage({ type: 'error', text: 'Failed to fetch initial data.' });
      setSubmittedData([]); // Set to empty array on error
    } finally {
      setTableLoading(false);
    }
  };

  // Function to fetch all submitted proficiency levels for the table
  const fetchSubmittedData = async () => {
    setTableLoading(false);
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=proficiency_level`,
        { headers: { Authorization: `Bearer ${sessionData.token}` } }
      );
      const data = await res.json();
      
        setSubmittedData(data.userproficiency_levelData); 
    } catch (error) {
      console.error("Error fetching submitted data:", error);
      setMessage({ type: 'error', text: 'Failed to fetch submitted data.' });
      setSubmittedData([]); // Set to empty array on error
    } finally {
      setTableLoading(false);
    }
  };


  // Form handlers for adding, removing, and changing proficiency level inputs
  const handleAddProficiencyLevel = () =>
    setProficiencyLevels([...proficiencyLevels, { proficiency_level: "", description: "" }]);

  const handleRemoveProficiencyLevel = (index: number) => {
    // Added a check to ensure proficiencyLevels is an array before filtering
    if (proficiencyLevels && Array.isArray(proficiencyLevels)) {
      setProficiencyLevels(proficiencyLevels.filter((_, i) => i !== index));
    } else {
      console.warn("Attempted to remove from an invalid proficiencyLevels state.");
      // Optionally, reset to a default empty array or handle the error
      setProficiencyLevels([{ proficiency_level: "", description: "" }]);
    }
  };


  const handleProficiencyLevelChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProficiencyLevels(proficiencyLevels.map((level, i) =>
      i === index ? { ...level, [e.target.name]: e.target.value } : level
    ));

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null); // Clear previous messages

    const payload = {
      type: "API",
      method_field: "PUT", // Assuming PUT for both create and update based on backend logic
      proficiency_level: proficiencyLevels.map(level => level.proficiency_level),
      description: proficiencyLevels.map(level => level.description),
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "proficiency_level",
      proficiency_level_data: JSON.stringify(proficiencyLevels), // Store as JSON string
      ...(editingId && { id: editingId }), // Include ID if editing
    };

    try {
      // Determine URL based on whether we are editing or creating
      const url = `${sessionData.url}/skill_library/${editingId || editData?.id || ''}`; // Use editingId if present, else editData.id, else empty for new

      const res = await fetch(url, {
        method: "PUT", // Use PUT for update/create for this endpoint based on backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        setProficiencyLevels([{ proficiency_level: "", description: "" }]); // Reset form
        setEditingId(null); // Clear editing state
        fetchInitialData(); // Refresh table data
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to submit proficiency level.' });
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit: Populate the form with data from the selected row
  const handleEdit = (row: SubmittedProficiency) => {
    setEditingId(row.id);
    // Set proficiencyLevels to an array containing the edited row's data
    setProficiencyLevels([{
      proficiency_level: row.proficiency_level,
      description: row.description
    }]);
    setMessage(null); // Clear any previous messages
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top to show the form
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this proficiency level?")) { // Changed job role to proficiency level
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=proficiency_level`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);
        fetchInitialData(); // Changed fetchInitialData to fetchSubmittedData to refresh the table
      } catch (error) {
        console.error("Error deleting proficiency level:", error); // Changed job role to proficiency level
        alert("Error deleting proficiency level");
      }
    }
  };

  // Handler for column filter changes in DataTable
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  // Filtered data for DataTable based on column filters
  const filteredData = submittedData.filter(item =>
    Object.entries(columnFilters).every(([column, value]) =>
      !value || String(item[column as keyof SubmittedProficiency] || "").toLowerCase().includes(value.toLowerCase())
    )
  );

  // DataTable column definitions
  const columns = [
    {
      name: (
        <div>
          <div>Proficiency Level</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("proficiency_level", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.proficiency_level,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Description</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("description", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.description,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Category</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("category", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.category || "N/A",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Sub Category</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("sub_category", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.sub_category || "N/A",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Skill Title</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("skillTitle", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.skillTitle || "N/A",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Created By</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) =>
              handleColumnFilter("created_by_user", e.target.value)
            }
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.created_by_user || "N/A",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Created At</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("created_at", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Updated At</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("updated_at", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: SubmittedProficiency) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-pencil"></span>
          </button>
          <button
            onClick={() => row?.id && handleDelete(row?.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-trash-can"></span>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Define custom styles for DataTable
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
    rows: {
      style: {
        fontSize: '13px',
        minHeight: '48px',
      },
    },
    pagination: {
      style: {
        fontSize: '13px',
      },
    },
  };

  return (
    <div className="w-[100%]">
      {message && (
        <div className={`p-3 mb-4 rounded-md text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {message.text}
        </div>
      )}

      <form className="w-[100%]" onSubmit={handleSubmit}>
        {proficiencyLevels.map((level, index) => (
          <div key={index} className="grid md:grid-cols-3 md:gap-6 bg-[#fff] border-b-1 border-[#ddd] shadow-xl p-4 rounded-lg mt-2">
            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`proficiency_level-${index}`}>Proficiency Level</label>
              <input
                type="text"
                name="proficiency_level"
                id={`proficiency_level-${index}`}
                className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                placeholder="e.g., Beginner, Intermediate"
                value={level.proficiency_level}
                onChange={(e) => handleProficiencyLevelChange(index, e)}
                required
              />
            </div>

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`description-${index}`}>Description</label>
              <textarea
                name="description"
                id={`description-${index}`}
                rows={2}
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                placeholder="Describe this proficiency level..."
                value={level.description}
                onChange={(e) => handleProficiencyLevelChange(index, e)}
              />
            </div>

            <div className="flex items-center mt-2 md:mt-0">
              {proficiencyLevels.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProficiencyLevel(index)}
                  className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full mt-6 ml-2"
                >
                  -
                </button>
              )}
              {index === proficiencyLevels.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddProficiencyLevel}
                  className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-full mt-6 ml-2"
                >
                  +
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
          disabled={loading}
        >
          {loading ? "Submitting..." : editingId ? "Update" : "Submit"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setProficiencyLevels([{ proficiency_level: "", description: "" }]);
            }}
            className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Proficiency Levels</h2>
          <div className="space-x-2">
            <PrintButton data={submittedData} title="Proficiency Levels Report" />
            <ExcelExportButton
              sheets={[{ data: submittedData, sheetName: "Submissions" }]}
              fileName="Skills Proficiency Levels"
              onClick={() => console.log("Export initiated")}
              buttonText={
                <>
                  <span className="mdi mdi-file-excel"></span>
                </>
              }
            />
            <PdfExportButton
              data={submittedData}
              fileName="Skills Proficiency Levels"
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
          progressPending={tableLoading}
          noDataComponent={<div className="p-4">No records found</div>}
        />
      </div>
    </div>
  );
};

export default ProficiencyLevelData;