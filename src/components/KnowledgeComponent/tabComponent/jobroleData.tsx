import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import dynamic from 'next/dynamic';

// Dynamically import export buttons
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

type Props = { editData: any };

type JobRoleEntry = {
  job_role: string;
  description: string;
};

type SubmittedJobRole = {
  id?: number;
  jobrole: string;
  description: string;
  category?: string;
  sub_category?: string | null;
  skillTitle?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
};

const JobroleData: React.FC<Props> = ({ editData }) => {
  // State Variables
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });
  const [jobRoleSuggestions, setJobRoleSuggestions] = useState<Record<number, string[]>>({});
  const [jobRoles, setJobRoles] = useState<JobRoleEntry[]>([
    { job_role: "", description: "" },
  ]);
  const [submittedData, setSubmittedData] = useState<SubmittedJobRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

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

  // Fetch Initial Data
  useEffect(() => {
    if (sessionData.url && sessionData.token && editData?.id) {
      fetchInitialData();
    }
  }, [sessionData.url, sessionData.token, editData?.id]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&skill_id=${editData?.id}&formType=jobrole`
      );
      const data = await res.json();

      if (data?.userJobroleData) {
        const transformedData = Array.isArray(data.userJobroleData)
          ? data.userJobroleData.map((item: any) => ({
            id: item.id,
            jobrole: item.jobrole || item.job_role || "",
            description: item.description || "",
            category: item.category || "N/A",
            sub_category: item.sub_category || "N/A",
            skillTitle: item.skillTitle || "N/A",
            created_by_user: item?.first_name ? `${item.first_name} ${item.last_name || ""}` : "N/A",
            created_at: item.created_at || "N/A",
            updated_at: item.updated_at || "N/A",
          }))
          : [
            {
              id: data.userJobroleData.id,
              jobrole: data.userJobroleData.jobrole || data.userJobroleData.job_role || "",
              description: data.userJobroleData.description || "",
              category: data.userJobroleData.category || "N/A",
              sub_category: data.userJobroleData.sub_category || "N/A",
              skillTitle: data.userJobroleData.skillTitle || "N/A",
              created_by_user: data.userJobroleData?.first_name
                ? `${data.userJobroleData.first_name} ${data.userJobroleData.last_name || ""}`
                : "N/A",
              created_at: data.userJobroleData.created_at || "N/A",
              updated_at: data.userJobroleData.updated_at || "N/A",
            },
          ];

        setSubmittedData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Fetch Job Role Suggestions
  const fetchJobRoleSuggestions = async (index: number, keyword: string) => {
    if (!keyword.trim() || !sessionData.url) {
      setJobRoleSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token
        }&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType
        }&searchType=jobrole&searchWord=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();
      const suggestions = data?.searchData || [];
      setJobRoleSuggestions((prev) => ({ ...prev, [index]: suggestions }));
    } catch (error) {
      console.error("Job role search error:", error);
      setJobRoleSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  // Handle Job Role Input Change
  const handleJobRoleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedJobRoles = jobRoles.map((role, i) =>
      i === index ? { ...role, [name]: value } : role
    );
    setJobRoles(updatedJobRoles);

    if (name === "job_role") {
      fetchJobRoleSuggestions(index, value);
    }
  };

  // Handle Selecting a Suggestion
  const handleSelectSuggestion = (index: number, suggestion: string) => {
    const updated = [...jobRoles];
    updated[index].job_role = suggestion;
    setJobRoles(updated);
    setJobRoleSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  // Add New Job Role Entry
  const handleAddJobRole = () => {
    setJobRoles([...jobRoles, { job_role: "", description: "" }]);
  };

  // Remove Job Role Entry
  const handleRemoveJobRole = (index: number) => {
    const updatedJobRoles = jobRoles.filter((_, i) => i !== index);
    setJobRoles(updatedJobRoles);

    setJobRoleSuggestions((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: "API",
      method_field: "PUT",
      job_role: jobRoles.map((role) => role.job_role),
      description: jobRoles.map((role) => role.description),
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "jobrole",
      job_role_data: JSON.stringify(jobRoles),
      ...(editingId && { id: editingId }),
    };

    try {
      const url = `${sessionData.url}/skill_library/${editData?.id}`;

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

      setJobRoles([{ job_role: "", description: "" }]);
      setJobRoleSuggestions({});
      setEditingId(null);

      if (sessionData.url && sessionData.token && editData?.id) {
        await fetchInitialData();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = (row: SubmittedJobRole) => {
    setEditingId(row.id || null);
    setJobRoles([{ job_role: row.jobrole || "", description: row.description || "" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=jobrole`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);
        fetchInitialData();
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
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

      const columnValue = String(item[column as keyof SubmittedJobRole] || "").toLowerCase();
      return columnValue.includes(filterValue.toLowerCase());
    });
  });

  // DataTable Columns
  const columns = [
    {
      name: (
        <div>
          <div>Job Role</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("jobrole", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedJobRole) => row.jobrole || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Jobrole Description</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("description", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedJobRole) =>
        row.description
          ? (row.description.length > 100
            ? `${row.description.substring(0, 100)}...`
            : row.description)
          : "N/A",
      sortable: true,
      wrap: true,
      cell: (row: SubmittedJobRole) => (
        <span title={row.description || "N/A"}>
          {row.description
            ? row.description.length > 100
              ? `${row.description.substring(0, 100)}...`
              : row.description
            : "N/A"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row: SubmittedJobRole) => (
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
        {jobRoles.map((jobRole, index) => (
          <div
            key={index}
            className="grid md:grid-cols-3 md:gap-6 bg-[#fff] border-b-1 border-[#ddd] shadow-xl p-2 mb-2 rounded-lg relative"
          >
            <div className="relative z-10 w-full group text-left">
              <label htmlFor={`job_role-${index}`} className="text-left">
                Job Role
              </label>
              <br />
              <div className="relative">
                <input
                  type="text"
                  name="job_role"
                  id={`job_role-${index}`}
                  className="w-full z-10 rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  placeholder="Enter Job Role..."
                  value={jobRole.job_role}
                  onChange={(e) => handleJobRoleChange(index, e)}
                  autoComplete="off"
                />

                {(jobRoleSuggestions[index] || []).map((suggestion: any, sIndex) => {
                  const label = typeof suggestion === "string" ? suggestion : suggestion.title || "";
                  return (
                    <li
                      key={sIndex}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(index, label)}
                    >
                      {label}
                    </li>
                  );
                })}

              </div>
            </div>

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`description-${index}`} className="text-left">
                Jobrole Description
              </label>
              <br />
              <textarea
                name="description"
                id={`description-${index}`}
                rows={2}
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                placeholder="Enter Jobrole Description..."
                value={jobRole.description}
                onChange={(e) => handleJobRoleChange(index, e)}
              ></textarea>
            </div>

            <div className="relative z-0 w-full group text-left">
              {jobRoles.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveJobRole(index)}
                  className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full mt-6 ml-2"
                >
                  -
                </button>
              )}
              {index === jobRoles.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddJobRole}
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
          {loading ? "Submitting..." : editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setJobRoles([{ job_role: "", description: "" }]);
            }}
            className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job Roles</h2>
          <div className="space-x-2">
            <PrintButton
              data={submittedData}
              title="Job Roles Report"
              excludedFields={["id", "internal_id"]}
              buttonText={
                <>
                  <span className="mdi mdi-printer-outline"></span>
                </>
              }
            />
            <ExcelExportButton
              sheets={[{ data: submittedData, sheetName: "Submissions" }]}
              fileName="Skills Jobrole"
              onClick={() => console.log("Export initiated")}
              buttonText={
                <>
                  <span className="mdi mdi-file-excel"></span>
                </>
              }
            />

            <PdfExportButton
              data={submittedData}
              fileName="Skills Jobrole"
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

export default JobroleData;