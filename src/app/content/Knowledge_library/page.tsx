"use client";

import React, { useState, useEffect } from "react";
import { Funnel, Circle, Table as TableIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Atom } from "react-loading-indicators";
import { Button } from "@/components/ui/button";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

interface SkillItem {
  id: number;
  skill_id: number;
  proficiency_level: string;
  proficiency_description: string;
  classification: string;
  classification_category: string;
  classification_sub_category: string;
  classification_item: string;
}

const Honeycomb: React.FC = () => {
  const [data, setData] = useState<SkillItem[]>([]);
  const [filteredData, setFilteredData] = useState<SkillItem[]>([]);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Dropdown state
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [proficiency, setProficiency] = useState<string>("");

  // Column filter state
  const [filters, setFilters] = useState({
    item: "",
    category: "",
    subCategory: "",
    proficiency: "",
    description: "",
  });

  // 🔑 View toggle state
  const [viewMode, setViewMode] = useState<"circle" | "table">("circle");

  // Circle layout
  const size = 160;
  const horizontalGap = 10;
  const verticalGap = 20;
  const verticalSpacing = Math.floor(size * 0.85) + verticalGap;
  const horizontalShift = Math.floor((size + horizontalGap) / 2);

  // Load session data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_id } =
          JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: sub_institute_id,
          orgType: org_type,
          userId: user_id,
        });
      }
    }
  }, []);

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      if (!sessionData.subInstituteId || !sessionData.url) return;

      setIsLoading(true);
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[classification]=knowledge&order_by[id]=desc&group_by=classification_item`
        );
        const json = await res.json();
        setData(json);
        setFilteredData(json);
      } catch (err) {
        console.error("Error fetching API data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionData]);

  // Apply dropdown filters
  useEffect(() => {
    let temp = data;

    if (category) {
      temp = temp.filter((item) => item.classification_category === category);
    }
    if (subCategory) {
      temp = temp.filter(
        (item) => item.classification_sub_category === subCategory
      );
    }
    if (proficiency) {
      temp = temp.filter((item) => item.proficiency_level === proficiency);
    }

    setFilteredData(temp);
  }, [category, subCategory, proficiency, data]);

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

  // Apply column filters
  const columnFilteredData = filteredData.filter((item) =>
    item.classification_item.toLowerCase().includes(filters.item.toLowerCase()) &&
    item.classification_category.toLowerCase().includes(filters.category.toLowerCase()) &&
    item.classification_sub_category.toLowerCase().includes(filters.subCategory.toLowerCase()) &&
    item.proficiency_level.toLowerCase().includes(filters.proficiency.toLowerCase()) &&
    item.proficiency_description.toLowerCase().includes(filters.description.toLowerCase())
  );

  // Unique options
  const uniqueCategories = Array.from(
    new Set(data.map((item) => item.classification_category))
  );

  const filteredSubCategories = category
    ? Array.from(
      new Set(
        data
          .filter((item) => item.classification_category === category)
          .map((item) => item.classification_sub_category)
      )
    )
    : [];

  const uniqueProficiency = Array.from(
    new Set(data.map((item) => item.proficiency_level))
  ).sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return a.localeCompare(b);
  });

  // DataTable columns with search inputs
  const columns: TableColumn<SkillItem>[] = [
    {
      name: (
        <div className="flex flex-col">
          <span>Item</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, item: e.target.value })}
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
          <span>Category</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.classification_category,
      sortable: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Sub Category</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.classification_sub_category,
      sortable: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Proficiency</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, proficiency: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.proficiency_level,
      sortable: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Description</span>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setFilters({ ...filters, description: e.target.value })}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.proficiency_description,
      sortable: true,
    },
  ];

  return (
    <>
      {/* 🔽 Top bar: Toggle + Filters */}
      <div className="flex p-4 justify-between items-center mb-6">
        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={viewMode === "circle" ? "bg-blue-200 text-black" : "bg-white"}
            onClick={() => setViewMode("circle")}
          >
            <Circle className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            className={viewMode === "table" ? "bg-blue-200 text-black" : "bg-white"}
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-3 rounded-lg hover:bg-gray-100">
              <Funnel className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4 space-y-4" align="end">
            {/* Category Filter */}
            <Select
              value={category || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setCategory("");
                  setSubCategory("");
                } else {
                  setCategory(value);
                  setSubCategory("");
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subcategory Filter */}
            <Select
              value={subCategory || "all"}
              onValueChange={(value) =>
                setSubCategory(value === "all" ? "" : value)
              }
              disabled={!category}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Sub Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub Categories</SelectItem>
                {filteredSubCategories.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Proficiency Filter */}
            <Select
              value={proficiency || "all"}
              onValueChange={(value) =>
                setProficiency(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Proficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proficiency Levels</SelectItem>
                {uniqueProficiency.map((prof) => (
                  <SelectItem key={prof} value={prof}>
                    {prof}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>
      </div>

      {/* 🔽 Content */}
      <div className="w-full flex justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <Atom color="#525ceaff" size="medium" text="" textColor="" />
          </div>
        ) : columnFilteredData.length === 0 ? (
          <p className="text-gray-500 text-sm">No skills found</p>
        ) : viewMode === "circle" ? (
          // Round / Circle View
          <div className="relative flex justify-center ml-50 mr-50 w-full h-full pl-40">
            {columnFilteredData.map((item, index) => {
              const row = Math.floor(index / 4);
              const col = index % 4;

              const x =
                col * (size + horizontalGap) +
                (row % 2 === 1 ? horizontalShift : 0);
              const y = row * verticalSpacing;

              return (
                <div
                  key={item.id}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${x}px`,
                    top: `${y}px`,
                  }}
                  className="absolute rounded-full bg-gradient-to-b from-[#9FD0FF] to-[#50A8FF] border border-[#50A8FF] flex items-center justify-center text-center text-[11px] font-medium text-black p-3 hover:bg-[#f67232] hover:scale-110 transition duration-300"
                >
                  {item.classification_item}
                </div>
              );
            })}
          </div>
        ) : (
          // 📋 DataTable View with filters
          <div className="w-full">
            <DataTable
              columns={columns}
              data={columnFilteredData}
              customStyles={customStyles}
              pagination
              highlightOnHover
              striped
              responsive
              persistTableHead
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Honeycomb;
