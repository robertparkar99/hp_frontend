

"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import "./triangle.css"; // custom CSS
import { Atom } from "react-loading-indicators";
import { 
  Funnel, 
  LayoutGrid, 
  Table, 
  TriangleDashed,
  Search,
  Plus,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Download,
  Upload,
  Sparkles,
  BarChart3,
  Tag,
  HelpCircle,
  ListChecks,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

type ApiItem = {
  id: number;
  classification_item: string;
  proficiency_level: string;
  classification_category: string;
  classification_sub_category: string;
};

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
}

const safeArray = (data: any): ApiItem[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function Page() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData>({});

  // Toggle view: triangle or table
  const [viewMode, setViewMode] = useState<"triangle" | "table">("triangle");

  // Column search state for DataTable
  const [columnFilters, setColumnFilters] = useState<{
    [key: string]: string;
  }>({
    classification_item: "",
    proficiency_level: "",
    classification_category: "",
    classification_sub_category: "",
  });

  // Search state for triangle view
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type });
      }
    }
  }, []);

  // Fetch dropdown options
  useEffect(() => {
    if (!sessionData.sub_institute_id || !sessionData.url) return;
    const fetchDropdowns = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=ability&order_by[column]=proficiency_level&order_by[direction]=asc&group_by=proficiency_level`,
          { cache: "no-store" }
        );
        const json = await res.json();
        const data = safeArray(json);

        setSkills([...new Set(data.map((item) => item.proficiency_level))].filter(Boolean));
        setCategories([...new Set(data.map((item) => item.classification_category))].filter(Boolean));
        setSubCategories([...new Set(data.map((item) => item.classification_sub_category))].filter(Boolean));
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchDropdowns();
  }, [sessionData.sub_institute_id, sessionData.url]);

  // Update subcategories when category changes
  useEffect(() => {
    if (!selectedCategory || !sessionData.sub_institute_id || !sessionData.url) return;

    const fetchSubCats = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=ability&filters[classification_category]=${selectedCategory}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        const data = safeArray(json);

        setSubCategories([...new Set(data.map((item) => item.classification_sub_category))].filter(Boolean));
        setSelectedSubCategory(null);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };

    fetchSubCats();
  }, [selectedCategory, sessionData]);

  // Fetch items with filters applied
  useEffect(() => {
    if (!sessionData.sub_institute_id || !sessionData.url) return;

    const fetchItems = async () => {
      try {
        setLoading(true);

        let url = `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=ability&order_by[id]=desc`;

        if (selectedLevel) url += `&filters[proficiency_level]=${selectedLevel}`;
        if (selectedCategory) url += `&filters[classification_category]=${selectedCategory}`;
        if (selectedSubCategory) url += `&filters[classification_sub_category]=${selectedSubCategory}`;

        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        const data = safeArray(json);

        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [sessionData, selectedLevel, selectedCategory, selectedSubCategory]);

  // Filter items for triangle view based on search
  const filteredTriangleItems = items.filter(item =>
    item.classification_item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classification_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classification_sub_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.proficiency_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Column-wise filter for DataTable
  const filteredTableItems = items.filter((item) => {
    return (
      (item.classification_item?.toLowerCase() || "").includes(columnFilters.classification_item?.toLowerCase() || "") &&
      (item.proficiency_level?.toLowerCase() || "").includes(columnFilters.proficiency_level?.toLowerCase() || "") &&
      (item.classification_category?.toLowerCase() || "").includes(columnFilters.classification_category?.toLowerCase() || "") &&
      (item.classification_sub_category?.toLowerCase() || "").includes(columnFilters.classification_sub_category?.toLowerCase() || "")
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  // DataTable columns
  const columns: TableColumn<ApiItem>[] = [
    {
      name: (
        <div className="flex flex-col">
          <span>Item</span>
          <input
            value={columnFilters.classification_item}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, classification_item: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.classification_item,
      sortable: true, 
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Proficiency</span>
          <input
            value={columnFilters.proficiency_level}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, proficiency_level: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.proficiency_level,
      sortable: true,
      width: "100px"
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Category</span>
          <input
            value={columnFilters.classification_category}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, classification_category: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.classification_category,
      sortable: true,
      width: "160px"
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Sub Category</span>
          <input
            value={columnFilters.classification_sub_category}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, classification_sub_category: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.classification_sub_category,
      sortable: true,
      width: "200px"
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button 
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: "120px"
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

  // Group items into rows of 5 for triangle view
  const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  const rows = chunk(filteredTriangleItems, 5);

  return (
    <div className="p-4">
      {/* Header with Title and Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ability Library</h1>
        
     
      </div>

      {/* Search Bar and Filters */}
      <div className="flex justify-between items-center mb-4">
        {/* Search Bar */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search abilities, categories, or proficiency levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
              <div className="flex items-center gap-1">
                       <Popover>
                            <PopoverTrigger asChild>
                              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              className="w-auto p-4 bg-white shadow-xl rounded-xl"
                            >
   {/* Action Buttons - All in one line */}
        <div className="flex items-center gap-3">
          {/* Bulk Actions */}
          <button className="flex items-center px-2 py-2 hover:bg-gray-200 rounded-md text-sm" title="Bulk Actions">
            <ListChecks className="w-5 h-5 text-gray-600" />
           
          </button>

          {/* Export/Import */}
          <button className="flex items-center px-2 py-2 hover:bg-gray-200 rounded-md text-sm" title="Export">
            <Download className="w-5 h-5 text-gray-600" />

          </button>
          
          <button className="flex items-center px-2 py-2 hover:bg-gray-200 rounded-md text-sm" title="Import">
            <Upload className="w-5 h-5 text-gray-600" />
           
          </button>

          {/* Add New Ability */}
          <button className="flex items-center px-2 py-2 hover:bg-gray-200 rounded-md text-sm" title="Add New Ability">
            <Plus className="w-5 h-5 text-gray-600" />
           
          </button>

          {/* AI Suggestions */}
          <button className="flex items-center px-2 py-2 hover:bg-gray-200 rounded-md text-sm" title="AI Suggestions">
            <Sparkles className="w-5 h-5 text-gray-600" />
           
          </button>

          {/* Analytics */}
          <button className="flex items-center px-2 py-2 hover:bg-gray-200  rounded-md text-sm" title="Analytics">
            <BarChart3 className="w-5 h-5 text-gray-600" />

          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-200 rounded-md" title="Settings">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* Help */}
          <button className="p-2 hover:bg-gray-200 rounded-md" title="Help">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
        </div>
         </PopoverContent>
                  </Popover>
        <div className="flex items-center gap-1">
          {/* Funnel Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center px-2 py-2 hover:bg-gray-200 rounded-md">
                <Funnel className="w-5 h-5 " />
                
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4 space-y-4" align="end">
              <Filters
                categories={categories}
                subCategories={subCategories}
                skills={skills}
                loadingOptions={loadingOptions}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={setSelectedSubCategory}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
              />
            </PopoverContent>
          </Popover>

          {/* View Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("triangle")}
              className={`px-3 py-2 flex items-center justify-center ${
                viewMode === "triangle"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Triangle View"
            >
              <TriangleDashed className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 flex items-center justify-center ${
                viewMode === "table"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Table View"
            >
              <Table className="h-5 w-5" />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* View */}
      {viewMode === "triangle" ? (
        <TriangleGrid rows={rows} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredTableItems}
          customStyles={customStyles}
          pagination
          highlightOnHover
          striped
          responsive
        />
      )}
    </div>
  );
}

type FiltersProps = {
  categories: string[];
  subCategories: string[];
  skills: string[];
  loadingOptions: boolean;
  selectedCategory: string | null;
  setSelectedCategory: (value: string) => void;
  selectedSubCategory: string | null;
  setSelectedSubCategory: (value: string) => void;
  selectedLevel: string | null;
  setSelectedLevel: (value: string) => void;
};

function Filters({
  categories,
  subCategories,
  skills,
  loadingOptions,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  selectedLevel,
  setSelectedLevel,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <Select value={selectedCategory ?? ""} onValueChange={(value) => setSelectedCategory(value)}>
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.length === 0 ? (
            <SelectItem value="loading" disabled>No Categories</SelectItem>
          ) : (
            categories.map((cat, idx) => <SelectItem key={idx} value={cat}>{cat}</SelectItem>)
          )}
        </SelectContent>
      </Select>

      <Select
        value={selectedSubCategory ?? ""}
        onValueChange={(value) => setSelectedSubCategory(value)}
        disabled={!selectedCategory}
      >
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Sub Category" />
        </SelectTrigger>
        <SelectContent>
          {subCategories.length === 0 ? (
            <SelectItem value="loading" disabled>No Sub Categories</SelectItem>
          ) : (
            subCategories.map((sub, idx) => <SelectItem key={idx} value={sub}>{sub}</SelectItem>)
          )}
        </SelectContent>
      </Select>

      <Select value={selectedLevel ?? ""} onValueChange={(value) => setSelectedLevel(value)}>
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Proficiency" />
        </SelectTrigger>
        <SelectContent>
          {loadingOptions ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : (
            skills.map((level, idx) => <SelectItem key={idx} value={level}>{level}</SelectItem>)
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

function TriangleGrid({ rows }: { rows: ApiItem[][] }) {
  return (
    <div className="flex flex-col items-center gap-8">
      {rows.length > 0 ? (
        rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-6 mt-20">
            {row.map((item, colIndex) => {
              const shouldRotate = rowIndex % 2 === 0 ? colIndex % 2 === 1 : colIndex % 2 === 0;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative group"
                >
                  <Triangle text={item.classification_item} rotate={shouldRotate} />
                  {/* Hover Actions */}
                  {/* <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 bg-blue-600 text-white rounded shadow-lg" title="View">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="p-1 bg-green-600 text-white rounded shadow-lg" title="Edit">
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button className="p-1 bg-red-600 text-white rounded shadow-lg" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div> */}
                </motion.div>
              );
            })}
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No abilities match your current filters.</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

type TriangleProps = {
  text: string;
  rotate?: boolean;
};

function Triangle({ text, rotate = false }: TriangleProps) {
  return (
    <div className="triangle-wrapper">
      <div
        className="triangle"
        style={{
          transform: rotate
            ? "rotate(120deg) skewX(-30deg) scale(1,.866)"
            : "rotate(-60deg) skewX(-30deg) scale(1,.866)",
        }}
      />
      <div
        className="triangle-text"
        title={text}
        style={{
          transform: rotate ? "translate(0px, -15px)" : "translate(0px, 52px)",
        }}
      >
        {text ? text.slice(0, 50) + (text.length > 50 ? "..." : "") : "-"}
      </div>
    </div>
  );
}