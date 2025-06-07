import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import DataTable from "react-data-table-component";

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

// Define the type for the data displayed in the table
type SubmittedKnowledge = {
  id: number;
  proficiency_level?: string;
  classification_item?:string;
  category?: string;
  sub_category?: string;
  skillTitle?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
};

// Define a type for a single knowledge/ability entry
// MODIFIED: Made proficiency_level and classification_item optional
type KnowledgeAbilityEntry = {
  id?: number;
  proficiency_level?: string;
  classification_item?: string;
  category?: string;
  sub_category?: string;
  skillTitle?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
};

const KnowledgeAbilityData: React.FC<Props> = ({ editData }) => {
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });
  const [proficiencyLevel,setProficiencyLevel] = useState<any[]>([]);
  const [submittedData,setSubmittedData] = useState<SubmittedKnowledge[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
      {}
    );

  // State to hold an array of knowledge/ability entries
  const [knowledgeAbilities, setKnowledgeAbilities] = useState<KnowledgeAbilityEntry[]>([
    { proficiency_level: "", classification_item: "" }, // Start with one empty row
  ]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {APP_URL,token,org_type,sub_institute_id,user_id,user_profile_name,} = JSON.parse(userData);
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

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
    }
  }, [sessionData]);

  const fetchInitialData = async () => {
    const res = await fetch( `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&skill_id=${editData?.id}&formType=knowledge`);
    const data = await res.json();
    setProficiencyLevel(data.proficiency_levels || []);
    setSubmittedData(data.userKnowledgeData||[]);
  };

  const handleAddRow = () => {
    setKnowledgeAbilities([...knowledgeAbilities, { proficiency_level: "", classification_item: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    const updatedKnowledgeAbilities = knowledgeAbilities.filter((_, i) => i !== index);
    setKnowledgeAbilities(updatedKnowledgeAbilities);
  };

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedKnowledgeAbilities = knowledgeAbilities.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    );
    setKnowledgeAbilities(updatedKnowledgeAbilities);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      type: "API",
      method_field: "PUT",
      knowledge_ability_data: JSON.stringify(knowledgeAbilities),
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "knowledge",
    };

    console.log("Submitting payload:", payload);

    try {
      const res = await fetch(`${sessionData.url}/skill_library/${editData?.id || 0}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message);
      setKnowledgeAbilities([{ proficiency_level: "", classification_item: "" }]);
      setSubmittedData([]);
      setSubmittedData(data.userKnowledgeData||[]);
      setEditingId(null);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  const handleEdit = (row: KnowledgeAbilityEntry) => {
    setEditingId(row?.id || null);
    setKnowledgeAbilities([{ proficiency_level: row.proficiency_level, classification_item: row.classification_item }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=knowledge`,
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

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const filteredData = submittedData.filter((item) => {
    return Object.entries(columnFilters).every(([column, filterValue]) => {
      if (!filterValue) return true;

      const columnValue = String(
        item[column as keyof SubmittedKnowledge] || "" // Use SubmittedKnowledge for filtering
      ).toLowerCase();
      return columnValue.includes(filterValue.toLowerCase());
    });
  });

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
      selector: (row: KnowledgeAbilityEntry) => row.proficiency_level ?? "",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Classification Items</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("classification_item", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: KnowledgeAbilityEntry) => row.classification_item ?? "",
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
      selector: (row: KnowledgeAbilityEntry) => row.category ?? "N/A",
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
      selector: (row: KnowledgeAbilityEntry) => row.sub_category ?? "N/A",
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
      selector: (row: KnowledgeAbilityEntry) => row.skillTitle ?? "N/A",
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
      selector: (row: KnowledgeAbilityEntry) => row.created_by_user ?? "N/A",
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
      selector: (row: KnowledgeAbilityEntry) =>
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
      selector: (row: KnowledgeAbilityEntry) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: KnowledgeAbilityEntry) => (
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
      allowOverflow: true,
      button: true,
    },
  ];

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

  return ( <>
    <div className="w-[100%]">
      <form className="w-[100%]" onSubmit={handleSubmit}>
        {knowledgeAbilities.map((entry, index) => (
          <div key={index} className="grid md:grid-cols-3 md:gap-6 bg-[#fff] border-b-1 border-[#ddd] shadow-xl p-4 rounded-lg mt-2">
            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`proficiency_level-${index}`} className="text-left">
                Proficiency Level
              </label>
              <br />
              <select
                name="proficiency_level"
                id={`proficiency_level-${index}`}
                className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black"
                value={entry.proficiency_level || ""} // Handle undefined for select
                onChange={(e) => handleInputChange(index, e)}
                required
              >
              <option value="">Select Proficiency Level</option>
              {proficiencyLevel.map(d => <option key={d.proficiency_level} value={d.proficiency_level}>{d.proficiency_level}</option>)}
              </select>
            </div>

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`classification_item-${index}`} className="text-left">
                Classification Item
              </label>
              <br />
              <textarea
                name="classification_item"
                id={`classification_item-${index}`}
                rows={2}
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                placeholder="Describe specific items..."
                value={entry.classification_item || ""} // Handle undefined for textarea
                onChange={(e) => handleInputChange(index, e)}
              ></textarea>
            </div>

            <div className="flex items-center mt-2 md:mt-0">
              {knowledgeAbilities.length > 1 && (
               <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full mt-6 ml-2"
                >
                  -
                </button>
              )}
              {index === knowledgeAbilities.length - 1 && (
               <button
                  type="button"
                  onClick={handleAddRow}
                  className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-full mt-6 ml-2"
                >+
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
        >
          {loading ? "Submitting..." : editingId ? "Update" : "Submit"}
        </button>
      </form>
    </div>
    <div className="w-[100%]">{
      submittedData.length>0 &&
        <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Knowledge</h2>
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
      }</div>
  </>);
};

export default KnowledgeAbilityData;