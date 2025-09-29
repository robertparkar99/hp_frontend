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
import { Funnel, LayoutGrid, Table, TriangleDashed } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  // Column-wise filter for DataTable
  const filteredItems = items.filter((item) => {
  return (
    (item.classification_item?.toLowerCase() || "").includes(columnFilters.classification_item?.toLowerCase() || "") &&
    (item.proficiency_level?.toLowerCase() || "").includes(columnFilters.proficiency_level?.toLowerCase() || "") &&
    (item.classification_category?.toLowerCase() || "").includes(columnFilters.classification_category?.toLowerCase() || "") &&
    (item.classification_sub_category?.toLowerCase() || "").includes(columnFilters.classification_sub_category?.toLowerCase() || "")
  );
});

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
  const rows = chunk(items, 5);

  return (
    <div className="p-4">
      {/* Toggle buttons and filters */}
      <div className="flex justify-end items-center mb-4">

        {/* Funnel Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-3">
              <Funnel className="w-5 h-5" />
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

        <div className="flex items-center gap-3">
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("triangle")}
              className={`px-3 py-2 flex items-center justify-center ${
                viewMode === "triangle"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
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
            >
              <Table className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* View */}
      {viewMode === "triangle" ? (
        <TriangleGrid rows={rows} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
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
                >
                  <Triangle text={item.classification_item} rotate={shouldRotate} />
                </motion.div>
              );
            })}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No items match your filters.</p>
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
