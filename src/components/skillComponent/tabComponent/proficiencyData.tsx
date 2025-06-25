import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import dynamic from 'next/dynamic';

// Dynamic imports for export buttons
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

// Updated type definitions based on API response
type ProficiencyLevel = {
  id?: number;
  proficiency_level: string;
  description: string;
  proficiency_type?: string;
  type_description?: string;
  skill_id?: number | null;
  sub_institute_id?: number | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SubmittedProficiency = {
  id: number;
  proficiency_level: string;
  description: string;
  proficiency_type?: string;
  type_description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  sub_institute_id?: number | null;
};

type ApiResponse = {
  proficiency_levels: ProficiencyLevel[];
  userproficiency_levelData: any[];
};

const ProficiencyLevelData: React.FC<{ editData: any }> = ({ editData }) => {
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

  const defaultProficiencyLevel = {
    proficiency_level: "",
    description: "",
    proficiency_type: "Autonomy", // Default value
    type_description: ""
  };

  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([defaultProficiencyLevel]);
  const [submittedData, setSubmittedData] = useState<SubmittedProficiency[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      if (editData?.id) {
        fetchInitialData();
      } else {
        fetchSubmittedData();
      }
    }

    if (editData?.proficiency_level_data) {
      try {
        const parsedData = JSON.parse(editData.proficiency_level_data);
        if (Array.isArray(parsedData)) {
          const typedParsedData: ProficiencyLevel[] = parsedData.map((item: any) => ({
            ...defaultProficiencyLevel,
            ...item,
            proficiency_level: item.proficiency_level || "",
            description: item.description || "",
          }));
          setProficiencyLevels(typedParsedData.length ? typedParsedData : [defaultProficiencyLevel]);
        }
      } catch (error) {
        console.error("Error parsing proficiency_level_data:", error);
        setProficiencyLevels([defaultProficiencyLevel]);
      }
    }
  }, [sessionData, editData]);

  const transformData = (item: ProficiencyLevel): SubmittedProficiency => ({
    id: item.id || 0,
    proficiency_level: item.proficiency_level,
    description: item.description,
    proficiency_type: item.proficiency_type,
    type_description: item.type_description,
    created_by: item.created_by || undefined,
    created_at: item.created_at,
    updated_at: item.updated_at
  });

  const fetchInitialData = async () => {
    setTableLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&skill_id=${editData?.id}&formType=proficiency_level`
      );

      if (!res.ok) throw new Error('Failed to fetch data');

      const data: ApiResponse = await res.json();
      const transformedData = data.proficiency_levels.map(transformData);
      setSubmittedData(transformedData);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      // setMessage({ type: 'error', text: 'Failed to fetch initial data.' });
      setSubmittedData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchSubmittedData = async () => {
    setTableLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=proficiency_level`,
        { headers: { Authorization: `Bearer ${sessionData.token}` } }
      );

      if (!res.ok) throw new Error('Failed to fetch data');

      const data: ApiResponse = await res.json();
      const transformedData = data.proficiency_levels.map(transformData);
      setSubmittedData(transformedData);
    } catch (error) {
      console.error("Error fetching submitted data:", error);
      // setMessage({ type: 'error', text: 'Failed to fetch submitted data.' });
      setSubmittedData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleAddProficiencyLevel = () => {
    setProficiencyLevels([...proficiencyLevels, { ...defaultProficiencyLevel }]);
  };

  const handleRemoveProficiencyLevel = (index: number) => {
    if (proficiencyLevels.length > 1) {
      setProficiencyLevels(proficiencyLevels.filter((_, i) => i !== index));
    }
  };

  const handleProficiencyLevelChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProficiencyLevels(proficiencyLevels.map((level, i) =>
      i === index ? { ...level, [e.target.name]: e.target.value } : level
    ));
  };

  const validateForm = () => {
    for (const level of proficiencyLevels) {
      if (!level.proficiency_level.trim() || !level.description.trim()) {
        // setMessage({ type: 'error', text: 'Please fill in all required fields.' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    const payload = {
      type: "API",
      method_field: "PUT",
      proficiency_level: proficiencyLevels.map(level => level.proficiency_level),
      description: proficiencyLevels.map(level => level.description),
      proficiency_type: proficiencyLevels.map(level => level.proficiency_type),
      type_description: proficiencyLevels.map(level => level.type_description),
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "proficiency_level",
      proficiency_level_data: JSON.stringify(proficiencyLevels),
      ...(editingId && { id: editingId }),
    };

    try {
      const url = `${sessionData.url}/skill_library/${editingId || editData?.id || ''}`;
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

      if (res.ok) {
        // setMessage({ type: 'success', text: data.message || 'Successfully submitted.' });
        setProficiencyLevels([defaultProficiencyLevel]);
        setEditingId(null);
        fetchSubmittedData();
      } else {
        // setMessage({ type: 'error', text: data.message || 'Failed to submit proficiency level.' });
        console.log('Failed to submit proficiency level.');
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: SubmittedProficiency) => {
    setEditingId(row.id);
    setProficiencyLevels([{
      proficiency_level: row.proficiency_level,
      description: row.description,
      proficiency_type: row.proficiency_type || defaultProficiencyLevel.proficiency_type,
      type_description: row.type_description || ""
    }]);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this proficiency level?")) return;

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
      // setMessage({ type: res.ok ? 'success' : 'error', text: data.message });
      if (res.ok) {
        fetchSubmittedData();
      }
    } catch (error) {
      console.error("Error deleting proficiency level:", error);
      // setMessage({ type: 'error', text: 'Error deleting proficiency level' });
    }
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredData = submittedData.filter(item =>
    Object.entries(columnFilters).every(([column, value]) =>
      !value || String(item[column as keyof SubmittedProficiency] || "").toLowerCase().includes(value.toLowerCase())
    )
  );

  // Column definitions remain the same...
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
          <div>Proficiency Description</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("description", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) =>
        row.description
          ? (row.description.length > 100
            ? `${row.description.substring(0, 100)}...`
            : row.description)
          : "N/A",
      sortable: true,
      wrap: true,
      cell: (row: SubmittedProficiency) => (
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
      name: (
        <div>
          <div>Proficiency Type</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("proficiency_type", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.proficiency_type || "N/A",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Type Description</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("type_description", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedProficiency) => row.type_description || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row: SubmittedProficiency) => (
        <div className="flex space-x-2">

          {row.created_by != null && (<><button

            onClick={() => handleEdit(row)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-pencil"></span>
          </button><button
            onClick={() => row.id && handleDelete(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
              <span className="mdi mdi-trash-can"></span>
            </button></>
          )}
        </div>
      ),
      ignoreRowClick: true,
      // allowOverflow: true,
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
          <div key={index} className="grid md:grid-cols-3 md:gap-4 bg-[#fff] border-b-1 border-[#ddd] shadow-xl p-4 rounded-lg mt-2">
            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`proficiency_level-${index}`} className="block mb-2">
                Proficiency Level*
              </label>
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
              <label htmlFor={`description-${index}`} className="block mb-2">
                Proficiency Description*
              </label>
              <textarea
                name="description"
                id={`description-${index}`}
                rows={2}
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                placeholder="Describe this proficiency level..."
                value={level.description}
                onChange={(e) => handleProficiencyLevelChange(index, e)}
                required
              />
            </div>

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`proficiency_type-${index}`} className="block mb-2">
                Proficiency Type
              </label>
              <select
                name="proficiency_type"
                id={`proficiency_type-${index}`}
                className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                value={level.proficiency_type}
                onChange={(e) => handleProficiencyLevelChange(index, e)}
              >
                <option value="Autonomy">Autonomy</option>
                <option value="Influence">Influence</option>
                <option value="Complexity">Complexity</option>
                <option value="Business Skills">Business Skills</option>
                <option value="Knowledge">Knowledge</option>
              </select>
            </div>

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`type_description-${index}`} className="block mb-2">
                Type Description
              </label>
              <input
                type="text"
                name="type_description"
                id={`type_description-${index}`}
                className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                placeholder="Description for type"
                value={level.type_description || ""}
                onChange={(e) => handleProficiencyLevelChange(index, e)}
              />
            </div>

            <div className="flex items-center justify-end">
              {proficiencyLevels.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProficiencyLevel(index)}
                  className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full ml-2"
                >
                  -
                </button>
              )}
              {index === proficiencyLevels.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddProficiencyLevel}
                  className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-full ml-2"
                >
                  +
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="text-white mt-2 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          disabled={loading}
        >
          {loading ? "Submitting..." : editingId ? "Update" : "Submit"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setProficiencyLevels([defaultProficiencyLevel]);
              setMessage(null);
            }}
            className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
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