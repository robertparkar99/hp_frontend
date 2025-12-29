import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import dynamic from 'next/dynamic';

// Type Definitions
// Dynamically import ExcelExportButton, PdfExportButton, and PrintButton
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

type SkillNameEntry = {
  skillName: string;
  description: string;
  proficiency_level?: string;
  category: string;
  sub_category: string;
  skill_id?: string; // Added to hold the unique ID of the skill for updates
};

type SubmittedSkillName = {
  id?: number; // This might be a primary key from the API
  SkillName: string;
  description: string;
  jobrole?: string;
  proficiency_level?: string;
  created_by_user?: string;
  created_at?: string;
  updated_at?: string;
  category: string;
  sub_category: string;
  skillTitle?: string;
  skill_id?: string; // Added to match the backend's unique skill identifier
};

const SkillData: React.FC<Props> = ({ editData }) => {
  // State Variables
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });
  const [SkillNameSuggestions, setSkillNameSuggestions] = useState<
    Record<number, string[]>
  >({});
  const [SkillNames, setSkillNames] = useState<SkillNameEntry[]>([
    { skillName: "", description: "", proficiency_level: "", category: "", sub_category: "", skill_id: "" }, // Initialize with all fields
  ]);
  const [submittedData, setSubmittedData] = useState<SubmittedSkillName[]>([]);
  const [loading, setLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

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
      fetchCategories();
    }
  }, [sessionData.url, sessionData.token, editData?.id]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/jobrole_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&jobrole=${editData?.jobrole}&formType=skills`
      );
      const data = await res.json();

      if (data?.userskillData) {
        const transformedData = Array.isArray(data.userskillData)
          ? data.userskillData.map((item: any) => ({
            id: item.id,
            SkillName: typeof item.skillTitle === 'object' && item.skillTitle !== null
              ? (item.skillTitle.title || item.skillTitle.name || String(item.skillTitle))
              : String(item.skillTitle || ''),
            description: String(item.description || item.skillDescription || ''),
            jobrole: String(editData?.jobrole || ''),
            proficiency_level: String(item.proficiency_level) || '',
            category: String(item.category || ''),
            sub_category: String(item.sub_category || ''),
            skillTitle: typeof item.skillTitle === 'object' && item.skillTitle !== null
              ? (item.skillTitle.title || item.skillTitle.name || String(item.skillTitle))
              : String(item.skillTitle || ''),
            skill_id: String(item.skill_id || ''),
            created_by_user: item?.first_name && item?.last_name ? `${item.first_name} ${item.last_name}` : "N/A",
            created_at: item.created_at,
            updated_at: item.updated_at,
          }))
          : [
            {
              id: data.userskillData.id,
              SkillName: typeof data.userskillData.skillTitle === 'object' && data.userskillData.skillTitle !== null
                ? (data.userskillData.skillTitle.title || data.userskillData.skillTitle.name || String(data.userskillData.skillTitle))
                : String(data.userskillData.skillTitle || ''),
              description: String(data.userskillData.description || data.userskillData.skillDescription || ''),
              jobrole: String(editData?.jobrole || ''),
              proficiency_level: String(data.userskillData?.proficiency_level) || '',
              category: String(data.userskillData.category || ''),
              sub_category: String(data.userskillData.sub_category || ''),
              skillTitle: typeof data.userskillData.skillTitle === 'object' && data.userskillData.skillTitle !== null
                ? (data.userskillData.skillTitle.title || data.userskillData.skillTitle.name || String(data.userskillData.skillTitle))
                : String(data.userskillData.skillTitle || ''),
              skill_id: String(data.userskillData.skill_id || ''),
              created_by_user: data.userskillData?.first_name && data.userskillData?.last_name ? `${data.userskillData.first_name} ${data.userskillData.last_name}` : "N/A",
              created_at: data.userskillData.created_at,
              updated_at: data.userskillData.updated_at,
            },
          ];

        setSubmittedData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=category&searchWord=${editData?.department}`);
      const data = await res.json();

      setCategories(data.searchData || []);

    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Sub Categories based on selected category
  const fetchSubCategories = async (category: string) => {
    try {
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_category&searchWord=${category}`);
      const data = await res.json();
      setSubCategories(data.searchData || []);

    } catch (error) {
      console.error("Error fetching sub categories:", error);
    }
  };

  // Fetch Skills Suggestions
  const fetchSkillNameSuggestions = async (index: number, keyword: string) => {
    if (!keyword.trim() || !sessionData.url) {
      setSkillNameSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token
        }&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType
        }&searchType=SkillName&searchWord=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();
      const suggestions = (data?.searchData || []).map((s: any) =>
        typeof s === 'string' ? s : (s.name || s.title || String(s))
      ).filter(Boolean);
      setSkillNameSuggestions((prev) => ({ ...prev, [index]: suggestions }));
    } catch (error) {
      console.error("Skills search error:", error);
      setSkillNameSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  // Handle Skills Input Change
  const handleSkillNameChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedSkillNames = SkillNames.map((role, i) =>
      i === index ? { ...role, [name]: value } : role
    );
    setSkillNames(updatedSkillNames);

    if (name === "skillName") {
      fetchSkillNameSuggestions(index, value);
    } else if (name === "category") {
      // When category changes, fetch subcategories and reset sub_category
      fetchSubCategories(value);
      const updatedWithResetSubCategory = SkillNames.map((role, i) =>
        i === index ? { ...role, category: value, sub_category: "" } : role
      );
      setSkillNames(updatedWithResetSubCategory);
    }
  };

  // Handle Selecting a Suggestion
  const handleSelectSuggestion = (index: number, suggestion: string) => {
    const updated = [...SkillNames];
    updated[index].skillName = suggestion;
    setSkillNames(updated);
    setSkillNameSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  // Add New Skills Entry
  const handleAddSkillName = () => {
    setSkillNames([...SkillNames, { skillName: "", description: "", proficiency_level: "", category: "", sub_category: "", skill_id: "" }]);
  };

  // Remove Skills Entry
  const handleRemoveSkillName = (index: number) => {
    const updatedSkillNames = SkillNames.filter((_, i) => i !== index);
    setSkillNames(updatedSkillNames);

    setSkillNameSuggestions((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Prepare SkillNames to ensure skill_id is included in each object
    const skillsToSubmit = SkillNames.map(skill => ({
      skillName: skill.skillName,
      description: skill.description,
      proficiency_level: skill.proficiency_level,
      category: skill.category,
      sub_category: skill.sub_category,
      ...(skill.skill_id && { skill_id: skill.skill_id })
    }));

    const payload = {
      type: "API",
      method_field: "PUT",
      skillName: skillsToSubmit.map((s) => s.skillName),
      description: skillsToSubmit.map((s) => s.description),
      proficiency_level: skillsToSubmit.map((s) => s.proficiency_level),
      category: skillsToSubmit.map((s) => s.category),
      sub_category: skillsToSubmit.map((s) => s.sub_category),
      skill_id: skillsToSubmit.map((s) => s.skill_id),
      jobrole: editData?.jobrole,
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      department: editData?.department,
      sub_department: editData?.sub_department,
      formType: "skills",
      skillName_data: JSON.stringify(skillsToSubmit),
      ...(editingId && { id: editingId }),
    };

    try {
      const url = `${sessionData.url}/jobrole_library/${editingId}`;

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

      setSkillNames([{ skillName: "", description: "", proficiency_level: "", category: "", sub_category: "", skill_id: "" }]);
      setSkillNameSuggestions({});
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
  const handleEdit = (row: SubmittedSkillName) => {
    console.log('editData',row);
    setEditingId(row.id || null);
    setSkillNames([{
      skillName: row.SkillName,
      description: row.description,
      proficiency_level: row.proficiency_level || "",
      category: row.category || "",
      sub_category: row.sub_category || "",
      skill_id: row.skill_id || ""
    }]);
    if (row.category) {
      fetchSubCategories(row.category);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Delete
   const handleDelete = async (id: number) => {
     if (window.confirm("Are you sure you want to delete this Skills?")) {
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
         console.error("Error deleting Skills:", error);
         alert("Error deleting Skills");
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

      const columnValue = String(
        item[column as keyof SubmittedSkillName] || ""
      ).toLowerCase();
      return columnValue.includes(filterValue.toLowerCase());
    });
  });

  // DataTable Columns
  const columns = [
    {
      name: (
        <div>
          <div>Skill Category</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("category", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedSkillName) => row.category || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Skill Sub Category</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("sub_category", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedSkillName) => row.sub_category || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Skills Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("SkillName", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedSkillName) => row.SkillName,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Skill Description</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("description", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedSkillName) => row.description,
      cell: (row: SubmittedSkillName) => (
        <div
          data-titleHead={row.description}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '300px'
          }}
        >
          {row.description.length > 100
            ? `${row.description.substring(0, 100)}...`
            : row.description}
        </div>
      ),
      sortable: true,
      wrap: false,
    },
    {
      name: (
        <div>
          <div>Skill Proficiency Level</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("proficiency_level", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: SubmittedSkillName) => row.proficiency_level || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row: SubmittedSkillName) => (
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
        {SkillNames.map((SkillName, index) => (
          <div
            key={index}
            className="grid md:grid-cols-3 md:gap-6 bg-[#fff] border-b-1 border-[#ddd] shadow-xl p-2 mb-2 rounded-lg relative"
          >
            {/* Hidden input for skill_id */}
            <input type="hidden" name="skill_id" id={`skill_id-${index}`} value={SkillName.skill_id || ''} />

            <div className="relative w-full group text-left">
              <label htmlFor={`category-${index}`} className="text-left">
                Skill Category
              </label>
              <br />
              <input
                list={`category-list-${index}`}
                name="category"
                id={`category-${index}`}
                className="w-full z-10 rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                value={SkillName.category}
                onChange={(e) => handleSkillNameChange(index, e)}
                placeholder="Select or type category"
                autoComplete="off"
              />
              <datalist id={`category-list-${index}`}>
                {categories.map((category, i) => (
                  <option key={i} value={category} />
                ))}
              </datalist>
            </div>

            <div className="relative w-full group text-left">
              <label htmlFor={`sub_category-${index}`} className="text-left">
                Skill Sub Category
              </label>
              <br />
              <input
                list={`sub-category-list-${index}`}
                name="sub_category"
                id={`sub_category-${index}`}
                className="w-full z-10 rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                value={SkillName.sub_category}
                onChange={(e) => handleSkillNameChange(index, e)}
                placeholder="Select or type sub category"
                autoComplete="off"
                disabled={!SkillName.category}
              />
              <datalist id={`sub-category-list-${index}`}>
                {subCategories.map((subCategory, i) => (
                  <option key={i} value={subCategory} />
                ))}
              </datalist>
            </div>
            <div className="relative z-10 w-full group text-left">
              <label htmlFor={`skillName-${index}`} className="text-left">
                Skills Name
              </label>
              <br />
              <div className="relative">
                <input
                  type="text"
                  name="skillName"
                  id={`skillName-${index}`}
                  className="w-full z-10 rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  placeholder="Enter Skills..."
                  value={SkillName.skillName}
                  onChange={(e) => handleSkillNameChange(index, e)}
                  autoComplete="off"
                />

                {SkillNameSuggestions[index]?.length > 0 && (
                  <ul
                    className="relative z-20 w-full max-h-60 overflow-y-auto border border-gray-300 rounded-lg mt-1 shadow-lg bg-white"
                  >
                    {SkillNameSuggestions[index].map((suggestion, sIndex) => (
                      <li
                        key={sIndex}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => handleSelectSuggestion(index, suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="relative z-0 w-full group text-left">
              <label htmlFor={`description-${index}`} className="text-left">
                Skill Description
              </label>
              <br />
              <textarea
                name="description"
                id={`description-${index}`}
                rows={2}
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                placeholder="Enter Description..."
                value={SkillName.description}
                onChange={(e) => handleSkillNameChange(index, e)}
              ></textarea>
            </div>

            <div className="relative w-full group text-left">
              <label htmlFor={`proficiency_level-${index}`} className="text-left">
                Skill Proficiency Level
              </label>
              <br />
              <input
                type="text"
                name="proficiency_level"
                id={`proficiency_level-${index}`}
                className="w-full z-10 rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                placeholder="Enter proficiency level..."
                value={SkillName.proficiency_level}
                onChange={(e) => handleSkillNameChange(index, e)}
                autoComplete="off"
              />
            </div>



            <div className="relative z-0 w-full group text-left">
              {SkillNames.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSkillName(index)}
                  className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full mt-6 ml-2"
                >
                  -
                </button>
              )}
              {index === SkillNames.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddSkillName}
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
              setSkillNames([{ skillName: "", description: "", proficiency_level: "", category: "", sub_category: "", skill_id: "" }]);
            }}
            className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Skills Data</h2>
          <div className="space-x-2">
            <PrintButton
              data={submittedData}
              data-titleHead="Skills Report"
              excludedFields={["id", "internal_id", "skillTitle", "skill_id", "updated_at"]}
              buttonText={
                <>
                  <span className="mdi mdi-printer-outline"></span>
                </>
              }
            />
            <ExcelExportButton
              sheets={[{ data: submittedData, sheetName: "Submissions" }]}
              fileName="Skills Data"
              onClick={() => console.log("Export initiated")}
              buttonText={
                <>
                  <span className="mdi mdi-file-excel"></span>
                </>
              }
            />

            <PdfExportButton
              data={submittedData}
              fileName="Skills Data"
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

export default SkillData;