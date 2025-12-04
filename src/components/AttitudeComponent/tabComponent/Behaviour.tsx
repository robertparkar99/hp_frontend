"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DataTable from "react-data-table-component";

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

type SubmittedBehaviour = {
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

type BehaviourEntry = {
  id?: number;
  proficiency_level?: string;
  classification_category?: string;
  classification_sub_category?: string;
  classification_item?: string;
};

const EMPTY_ENTRY: BehaviourEntry = {
  proficiency_level: "",
  classification_category: "",
  classification_sub_category: "",
  classification_item: "",
};

const BehaviourData: React.FC<Props> = ({ editData }) => {
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });

  const [proficiencyLevel, setProficiencyLevel] = useState<any[]>([]);
  const [submittedData, setSubmittedData] = useState<SubmittedBehaviour[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([]);
  const [behaviourAbilities, setBehaviourAbilities] = useState<
    BehaviourEntry[]
  >([{ ...EMPTY_ENTRY }]);

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

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
      fetchProficiencyLevels();
      fetchCategoryData();
    }
  }, [sessionData]);

  const fetchProficiencyLevels = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=proficiency_level`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        }
      );
      const data = await res.json();
      const levels = Array.from(
        new Set(
          data.map((item: any) => item.proficiency_level).filter(Boolean)
        )
      ).map((level) => ({ proficiency_level: String(level) }));
      setProficiencyLevel(levels);
    } catch (error) {
      console.error("Error fetching proficiency levels:", error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[classification]=behaviour&group_by=classification_category`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        }
      );
      const data = await res.json();
      setCategoryOptions(
        Array.from(
          new Set(
            data.map((item: any) => item.classification_category).filter(Boolean)
          )
        )
      );
      setSubCategoryOptions(
        Array.from(
          new Set(
            data
              .map((item: any) => item.classification_sub_category)
              .filter(Boolean)
          )
        )
      );
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&skill_id=${editData?.id}&formType=behaviour`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        }
      );
      const data = await res.json();
      setSubmittedData(data.userBehaviourData || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
    //   setSubmittedData(data.userBehaviourData || []);
    //   if (editData && data.userBehaviourData?.length) {
    //     const first = data.userBehaviourData[0];
    //     setBehaviourAbilities([
    //       {
    //         proficiency_level: first.proficiency_level || "",
    //         classification_category: first.classification_category || "",
    //         classification_sub_category:
    //           first.classification_sub_category || "",
    //         classification_item: first.classification_item || "",
    //       },
    //     ]);
    //   }
    // } catch (error) {
    //   console.error("Error fetching initial data:", error);
    // }
  };

  const handleAddRow = () => {
    setBehaviourAbilities((prev) => [...prev, { ...EMPTY_ENTRY }]);
  };

  const handleRemoveRow = (index: number) => {
    setBehaviourAbilities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setBehaviourAbilities((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [name]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      type: "API",
      method_field: "PUT",
      ability_data: JSON.stringify(behaviourAbilities),
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "behaviour",
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
      if (res.ok) {
        setBehaviourAbilities([{ ...EMPTY_ENTRY }]);
        fetchInitialData();
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: BehaviourEntry) => {
    setEditingId(row?.id || null);
    setBehaviourAbilities([
      {
        proficiency_level: row.proficiency_level || "",
        classification_category: row.classification_category || "",
        classification_sub_category: row.classification_sub_category || "",
        classification_item: row.classification_item || "",
      },
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=behaviour`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${sessionData.token}` },
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
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const filteredData = submittedData.filter((item) => {
    return Object.entries(columnFilters).every(([column, filterValue]) => {
      if (!filterValue) return true;
      const columnValue = String(
        item[column as keyof SubmittedBehaviour] || ""
      ).toLowerCase();
      return columnValue.includes(filterValue.toLowerCase());
    });
  });

  const columns = [
    {
      name: (
        <div>
          <div>Behaviour Category</div>
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
      selector: (row: BehaviourEntry) =>
        row.classification_category
          ? row.classification_category.length > 100
            ? `${row.classification_category.substring(0, 100)}...`
            : row.classification_category
          : "N/A",
      sortable: true,
      wrap: true,
      cell: (row: BehaviourEntry) => (
        <span title={row.classification_category || "N/A"}>
          {row.classification_category
            ? row.classification_category.length > 100
              ? `${row.classification_category.substring(0, 100)}...`
              : row.classification_category
            : "N/A"}
        </span>
      ),
    },
    {
      name: (
              <div>
                <div> Behaviour Sub Category</div>
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
      selector: (row: BehaviourEntry) =>
        row.classification_sub_category
          ? row.classification_sub_category.length > 100
            ? `${row.classification_sub_category.substring(0, 100)}...`
            : row.classification_sub_category
          : "N/A",
      sortable: true,
      wrap: true,
      cell: (row: BehaviourEntry) => (
        <span title={row.classification_sub_category || "N/A"}>
          {row.classification_sub_category
            ? row.classification_sub_category.length > 100
              ? `${row.classification_sub_category.substring(0, 100)}...`
              : row.classification_sub_category
            : "N/A"}
        </span>
      ),
    },
    {
      name: (
        <div>
          <div>Skill Behaviour</div>
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
      selector: (row: BehaviourEntry) =>
        row.classification_item
          ? row.classification_item.length > 100
            ? `${row.classification_item.substring(0, 100)}...`
            : row.classification_item
          : "N/A",
      sortable: true,
      wrap: true,
      cell: (row: BehaviourEntry) => (
        <span title={row.classification_item || "N/A"}>
          {row.classification_item
            ? row.classification_item.length > 100
              ? `${row.classification_item.substring(0, 100)}...`
              : row.classification_item
            : "N/A"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row: BehaviourEntry) => (
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
      <div className="w-full">
        <form className="w-full" onSubmit={handleSubmit}>
          {behaviourAbilities.map((entry, index) => (
            <div
              key={index}
              className="grid md:grid-cols-4 md:gap-6 bg-[#fff] border-b-1 border-[#ddd] shadow-xl p-4 rounded-lg mt-2"
            >
              <div className="relative z-0 w-full group text-left">
                <label>Behaviour Category</label>
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

              <div className="relative z-0 w-full group text-left">
                <label>Behaviour Sub Category</label>
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

              <div className="relative z-0 w-full group text-left">
                <label htmlFor={`classification_item-${index}`}>
                  Behaviour Type
                </label>
                <textarea
                  name="classification_item"
                  id={`classification_item-${index}`}
                  rows={2}
                  className="w-full block p-2 border-2 border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Describe specific items..."
                  value={entry.classification_item || ""}
                  onChange={(e) => handleInputChange(index, e)}
                ></textarea>
              </div>

              <div className="flex items-center mt-2 md:mt-0">
                {behaviourAbilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full mt-6 ml-2"
                  >
                    -
                  </button>
                )}
                {index === behaviourAbilities.length - 1 && (
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
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
          >
            {loading ? "Submitting..." : editingId ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      {submittedData.length > 0 && (
        <div className="w-full mt-8 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Behaviour</h2>
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
    </>
  );
};

export default BehaviourData;
