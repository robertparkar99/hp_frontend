"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Funnel, LayoutGrid, Table, Square } from "lucide-react";
import { Atom } from "react-loading-indicators";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

interface BehaviourItem {
  id: number;
  proficiency_level: string | null;
  classification_category: string;
  classification_sub_category: string;
  classification_item: string;
}

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
}

const BehaviourGrid = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardData, setCardData] = useState<BehaviourItem[]>([]);
  const [allData, setAllData] = useState<BehaviourItem[]>([]);

  const [sessionData, setSessionData] = useState<SessionData>({});
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const [columnFilters, setColumnFilters] = useState({
    classification_item: "",
    classification_category: "",
    classification_sub_category: "",
    proficiency_level: "",
  });

  // ---------- Load session ----------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type } =
          JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type });
      }
    }
  }, []);

  // ---------- Fetch dropdown options ----------
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;

    const fetchDropdowns = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=behaviour`,
          { cache: "no-store" }
        );
        const data: BehaviourItem[] = await res.json();

        setAllData(data);

        const skillLevels = [
          ...new Set(
            data
              .filter((item) => typeof item.proficiency_level === "string")
              .map((item) => item.proficiency_level as string)
          ),
        ].sort((a, b) => a.localeCompare(b));
        setSkills(skillLevels);

        const categorySet = new Set(
          data
            .map((item) => item.classification_category)
            .filter((cat) => typeof cat === "string")
        );
        setCategories([...categorySet]);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchDropdowns();
  }, [sessionData.sub_institute_id]);

  // ---------- Update subcategories when category changes ----------
  useEffect(() => {
    if (!selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategory("");
      return;
    }

    const filteredSubs = [
      ...new Set(
        allData
          .filter((item) => item.classification_category === selectedCategory)
          .map((item) => item.classification_sub_category)
      ),
    ];
    setSubCategories(filteredSubs);
    setSelectedSubCategory("");
  }, [selectedCategory, allData]);

  // ---------- Fetch cards ----------
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;

    async function fetchCardData() {
      setLoadingCards(true);

      let query = `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=behaviour`;

      if (selectedLevel) query += `&filters[proficiency_level]=${selectedLevel}`;
      if (selectedCategory)
        query += `&filters[classification_category]=${selectedCategory}`;
      if (selectedSubCategory)
        query += `&filters[classification_sub_category]=${selectedSubCategory}`;

      query += "&order_by[id]=desc&group_by=classification_item";

      try {
        const res = await fetch(query, { cache: "no-store" });
        let result = await res.json();
        setCardData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Error fetching card data:", err);
        setCardData([]);
      } finally {
        setLoadingCards(false);
      }
    }

    fetchCardData();
  }, [
    selectedLevel,
    selectedCategory,
    selectedSubCategory,
    sessionData.sub_institute_id,
  ]);

  // ---------- Table columns ----------
  const columns: TableColumn<BehaviourItem>[] = [
    {
      name: (
        <div className="flex flex-col">
          <span>Item</span>
          <input
            type="text"
            value={columnFilters.classification_item}
            onChange={(e) =>
              setColumnFilters({
                ...columnFilters,
                classification_item: e.target.value,
              })
            }
            placeholder="Search..."
            className="border px-1 text-xs"
          />
        </div>
      ),
      selector: (row) => row.classification_item,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Category</span>
          <input
            type="text"
            value={columnFilters.classification_category}
            onChange={(e) =>
              setColumnFilters({
                ...columnFilters,
                classification_category: e.target.value,
              })
            }
            placeholder="Search..."
            className="border px-1 text-xs"
          />
        </div>
      ),
      selector: (row) => row.classification_category,
      sortable: true,
      wrap: true,
      width: "250px"
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Sub Category</span>
          <input
            type="text"
            value={columnFilters.classification_sub_category}
            onChange={(e) =>
              setColumnFilters({
                ...columnFilters,
                classification_sub_category: e.target.value,
              })
            }
            placeholder="Search..."
            className="border px-1 text-xs"
          />
        </div>
      ),
      selector: (row) => row.classification_sub_category,
      sortable: true,
      wrap: true,
      width: "150px"
    },
    {
      name: "Proficiency",
      selector: (row) => row.proficiency_level ?? "-",
      sortable: true,
      width: "130px"
    },
  ];

  // ---------- Table styles ----------
  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
      },
    },
  };

  const filteredData = cardData.filter(
    (row) =>
      row.classification_item
        .toLowerCase()
        .includes(columnFilters.classification_item.toLowerCase()) &&
      row.classification_category
        .toLowerCase()
        .includes(columnFilters.classification_category.toLowerCase()) &&
      row.classification_sub_category
        .toLowerCase()
        .includes(columnFilters.classification_sub_category.toLowerCase())
  );

  return (
    <>
      {/* 🔽 Filters + Toggle */}
      <div className="flex p-4 justify-end items-center gap-3 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-3">
              <Funnel className="w-5 h-5" />
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-[280px] p-6 bg-white shadow-xl rounded-xl flex flex-col gap-4"
          >
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

        {/* Toggle switch */}
        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-2 flex items-center justify-center ${
              viewMode === "cards"
                ? "bg-blue-100 text-blue-600"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Square className="h-5 w-5" />
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 flex items-center justify-center ${
              viewMode === "table"
                ? "bg-blue-100 text-blue-600"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Table className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 🔽 Switch View */}
      {viewMode === "cards" ? (
        loadingCards ? (
          <div className="flex justify-center items-center h-screen">
            <Atom color="#525ceaff" size="medium" text="" textColor="" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto mt-5">
            {cardData.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">
                No data found for this filter
              </p>
            ) : (
              cardData.map((card) => (
                <motion.div
                  key={card.id}
                  className="group bg-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-sm min-h-[180px]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <h3
                    className="text-blue-800 font-bold text-[16px] mb-3 truncate"
                    title={card.classification_item}
                  >
                    {card.classification_item}
                  </h3>

                  <div className="relative mb-3 h-[2px] bg-gray-300 overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-0 bg-blue-500 transition-all duration-500 group-hover:w-full"></div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-blue-800 font-semibold text-sm">
                        Category :{" "}
                      </span>
                      <span className="text-gray-700 text-sm">
                        {card.classification_category}
                      </span>
                    </div>

                    <div>
                      <span className="text-blue-800 font-semibold text-sm">
                        Sub Category :{" "}
                      </span>
                      <span className="text-gray-700 text-sm">
                        {card.classification_sub_category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          customStyles={customStyles}
          progressPending={loadingCards}
          highlightOnHover
          pagination
          dense
        />
      )}
    </>
  );
};

export default BehaviourGrid;

/* 🔽 Filters Component */
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
}: {
  categories: string[];
  subCategories: string[];
  skills: string[];
  loadingOptions: boolean;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (val: string) => void;
  selectedLevel: string;
  setSelectedLevel: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Category Dropdown */}
      <Select
        value={selectedCategory || "all"}
        onValueChange={(value) =>
          setSelectedCategory(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Filter by Category</SelectItem>
          {categories.length === 0 ? (
            <SelectItem value="loading" disabled>
              No Categories
            </SelectItem>
          ) : (
            categories.map((cat, idx) => (
              <SelectItem key={idx} value={cat}>
                {cat}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Sub Category Dropdown */}
      <Select
        value={selectedSubCategory || "all"}
        onValueChange={(value) =>
          setSelectedSubCategory(value === "all" ? "" : value)
        }
        disabled={subCategories.length === 0}
      >
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white disabled:bg-gray-100 disabled:text-gray-400">
          <SelectValue placeholder="Filter by Sub Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Filter by Sub Category</SelectItem>
          {subCategories.length === 0 ? (
            <SelectItem value="loading" disabled>
              No Sub Categories
            </SelectItem>
          ) : (
            subCategories.map((sub, idx) => (
              <SelectItem key={idx} value={sub}>
                {sub}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Proficiency Dropdown */}
      <Select
        value={selectedLevel || "all"}
        onValueChange={(value) =>
          setSelectedLevel(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Proficiency Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Filter by Proficiency Level</SelectItem>
          {loadingOptions ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : (
            skills.map((level, idx) => (
              <SelectItem key={idx} value={level}>
                {level}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
