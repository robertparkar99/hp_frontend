"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DataTable from "react-data-table-component";

// Dynamic imports (SSR disabled)
const ExcelExportButton = dynamic(
  () =>
    import("../../exportButtons/excelExportButton").then(
      (mod) => mod.ExcelExportButton
    ),
  { ssr: false }
);
const PdfExportButton = dynamic(
  () =>
    import("../../exportButtons/PdfExportButton").then(
      (mod) => mod.PdfExportButton
    ),
  { ssr: false }
);
const PrintButton = dynamic(
  () =>
    import("../../exportButtons/printExportButton").then(
      (mod) => mod.PrintButton
    ),
  { ssr: false }
);

type Props = { editData: any };

// Type for table display data
type SubmittedAbility = {
  id: number;
  proficiency_level?: string;
  classification_item?: string;
  category?: string;
  sub_category?: string;
  skillTitle?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
};

// Type for form entry
type AbilityEntry = {
  id?: number;
  proficiency_level?: string;
  classification_category?: string;
  classification_sub_category?: string;
  classification_item?: string;
};

const EMPTY_ENTRY: AbilityEntry = {
  proficiency_level: "",
  classification_category: "",
  classification_sub_category: "",
  classification_item: "",
};

const AbilityData: React.FC<Props> = ({ editData }) => {
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });

  const [proficiencyLevel, setProficiencyLevel] = useState<any[]>([]);
  const [submittedData, setSubmittedData] = useState<SubmittedAbility[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([]);
  const [abilityAbilities, setAbilityAbilities] = useState<AbilityEntry[]>([
    { ...EMPTY_ENTRY },
  ]);

  // Load user session data from localStorage
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

  // Fetch initial data once session is ready
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
      fetchCategoryData();
      fetchProficiencyLevels();
    }
  }, [sessionData]);

  // ✅ Using session for proficiency levels
  const fetchProficiencyLevels = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=proficiency_level`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      const levels = Array.from(
        new Set(
          data.map((item: any) => item.proficiency_level).filter(Boolean)
        )
      ).map((level) => ({ proficiency_level: level }));
      setProficiencyLevel(levels);
    } catch (error) {
      console.error("Error fetching proficiency levels:", error);
    }
  };

  // ✅ Using session for category/subcategory
  const fetchCategoryData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[classification]=ability`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      const categories = Array.from(
        new Set(
          data.map((item: any) => item.classification_category).filter(Boolean)
        )
      ) as string[];
      const subCategories = Array.from(
        new Set(
          data
            .map((item: any) => item.classification_sub_category)
            .filter(Boolean)
        )
      ) as string[];
      setCategoryOptions(categories);
      setSubCategoryOptions(subCategories);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  // ✅ Using session for initial data
  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&skill_id=${editData?.id}&formType=ability`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      setSubmittedData(data.userabilityData || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleAddRow = () => {
    setAbilityAbilities((prev) => [...prev, { ...EMPTY_ENTRY }]);
  };

  const handleRemoveRow = (index: number) => {
    setAbilityAbilities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAbilityAbilities((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [name]: value } : item))
    );
  };

  // ✅ Using session for submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: "API",
      method_field: "PUT",
      ability_data: JSON.stringify(abilityAbilities),
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "ability",
    };

    try {
      const res = await fetch(
        `${sessionData.url}/skill_library/${editData?.id || 0}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      alert(data.message);
      setAbilityAbilities([{ ...EMPTY_ENTRY }]);
      setSubmittedData(data.userabilityData || []);
      setEditingId(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: AbilityEntry) => {
    setEditingId(row?.id || null);
    setAbilityAbilities([
      {
        proficiency_level: row.proficiency_level || "",
        classification_category: row.classification_category || "",
        classification_sub_category: row.classification_sub_category || "",
        classification_item: row.classification_item || "",
      },
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Using session for delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this job role?"))
      return;

    try {
      const res = await fetch(
        `${sessionData.url}/skill_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=ability`,
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
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const filteredData = submittedData.filter((item) =>
    Object.entries(columnFilters).every(([column, filterValue]) => {
      if (!filterValue) return true;
      const columnValue = String(
        item[column as keyof SubmittedAbility] || ""
      ).toLowerCase();
      return columnValue.includes(filterValue.toLowerCase());
    })
  );

  const columns = [
    {
      name: (
        <div>
          <div>Attitude Proficiency Level</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) =>
              handleColumnFilter("proficiency_level", e.target.value)
            }
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: AbilityEntry) => row.proficiency_level ?? "",
      sortable: true,
      wrap: true,
    },
    {
      name:  (
        <div>
          <div>Attitude Category</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) =>
              handleColumnFilter("classification_category", e.target.value)
            }
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: AbilityEntry) =>
        row.classification_category || "N/A",
      sortable: true,
      wrap: true,
      cell: (row: AbilityEntry) => (
        <span title={row.classification_category || "N/A"}>
          {row.classification_category || "N/A"}
        </span>
      ),
    },
    {
      name:  (
        <div>
          <div> Attitude Sub Category</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) =>
              handleColumnFilter("classification_sub_category", e.target.value)
            }
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: AbilityEntry) =>
        row.classification_sub_category || "N/A",
      sortable: true,
      wrap: true,
      cell: (row: AbilityEntry) => (
        <span title={row.classification_sub_category || "N/A"}>
          {row.classification_sub_category || "N/A"}
        </span>
      ),
    },
    {
      name: (
        <div>
          <div>Attitude Skill</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) =>
              handleColumnFilter("classification_item", e.target.value)
            }
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: AbilityEntry) =>
        row.classification_item || "N/A",
      sortable: true,
      wrap: true,
      cell: (row: AbilityEntry) => (
        <span title={row.classification_item || "N/A"}>
          {row.classification_item || "N/A"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row: AbilityEntry) => (
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
    <>
      {/* Form Section */}
      <div className="w-full">
        <form className="w-full" onSubmit={handleSubmit}>
          {abilityAbilities.map((entry, index) => (
            <div
              key={index}
              className="grid md:grid-cols-3 md:gap-6 bg-white border-b border-gray-300 shadow-xl p-4 rounded-lg mt-2"
            >
              {/* Proficiency Level */}
              <div className="relative z-0 w-full group text-left">
                <label>Attitude Proficiency Level</label>
                <select
                  name="proficiency_level"
                  value={entry.proficiency_level || ""}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-blue-100 h-[38px] bg-white text-black"
                >
                  <option value="">Select Proficiency Level</option>
                  {proficiencyLevel.map((d) => (
                    <option
                      key={d.proficiency_level}
                      value={d.proficiency_level}
                    >
                      {d.proficiency_level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="relative z-0 w-full group text-left">
                <label>Attitude Category</label>
                <select
                  name="classification_category"
                  value={entry.classification_category || ""}
                  onChange={(e) => handleInputChange(index, e)}
                  className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-blue-100 h-[38px] bg-white text-black"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div className="relative z-0 w-full group text-left">
                <label>Attitude Sub Category</label>
                <select
                  name="classification_sub_category"
                  value={entry.classification_sub_category || ""}
                  onChange={(e) => handleInputChange(index, e)}
                  className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-blue-100 h-[38px] bg-white text-black"
                >
                  <option value="">Select Sub Category</option>
                  {subCategoryOptions.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ability */}
              <div className="relative z-0 w-full group text-left">
                <label>Attitude Skill</label>
                <textarea
                  name="classification_item"
                  rows={2}
                  value={entry.classification_item || ""}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Describe specific items..."
                  className="w-full p-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                />
              </div>

              {/* Add/Remove Buttons */}
              <div className="flex items-center mt-2 md:mt-0">
                {abilityAbilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full mt-6 ml-2"
                  >
                    -
                  </button>
                )}
                {index === abilityAbilities.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAddRow}
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
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 mt-2"
          >
            {loading ? "Submitting..." : editingId ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="w-full">
        {submittedData.length > 0 && (
          <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Attitude</h2>
              <div className="space-x-2">
                <PrintButton
                  data={submittedData}
                  title="Job Roles Report"
                  excludedFields={["id", "internal_id"]}
                  buttonText={<span className="mdi mdi-printer-outline"></span>}
                />
                <ExcelExportButton
                  sheets={[{ data: submittedData, sheetName: "Submissions" }]}
                  fileName="Skills Jobrole"
                  buttonText={<span className="mdi mdi-file-excel"></span>}
                />
                <PdfExportButton
                  data={submittedData}
                  fileName="Skills Jobrole"
                  buttonText={<span className="mdi mdi-file-pdf-box"></span>}
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
        )}
      </div>
    </>
  );
};

export default AbilityData;
