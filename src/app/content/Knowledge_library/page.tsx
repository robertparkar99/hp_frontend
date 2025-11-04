

"use client";

import React, { useState, useEffect } from "react";
import {
  Funnel,
  Circle,
  Table as TableIcon,
  Search,
  Plus,
  Settings,
  Puzzle,
  Sparkles,
  BarChart3,
  Brain,
  Upload,
  Download,
  Folders,
  Eye,
  Edit3,
  Trash2,
  Link,
  Clock,
  Star,
  Share2,
  MessageSquare,
  Tags,
  FileText,
  BookOpen,
  Lightbulb,
  Notebook,
  GraduationCap,
  Target,
  Scale,
  FileCheck,
  TrendingUp,
  MoreVertical
} from "lucide-react";

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

  // Search term state for top-right search input
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 🔑 View toggle state
  const [viewMode, setViewMode] = useState<"circle" | "table">("circle");

  // Circle layout
  const size = 160;
  const horizontalGap = 10;
  const verticalGap = 20;

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

  // Get icon for classification item
  // const getItemIcon = (item: string) => {
  //   const iconProps = { className: "w-4 h-4" };
    
  //   if (item?.toLowerCase().includes("programming") || item?.toLowerCase().includes("code")) {
  //     return <Puzzle {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("analysis") || item?.toLowerCase().includes("analytics")) {
  //     return <BarChart3 {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("communication") || item?.toLowerCase().includes("writing")) {
  //     return <MessageSquare {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("management") || item?.toLowerCase().includes("leadership")) {
  //     return <Target {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("design") || item?.toLowerCase().includes("creative")) {
  //     return <Lightbulb {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("research")) {
  //     return <Search {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("education") || item?.toLowerCase().includes("teaching")) {
  //     return <GraduationCap {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("legal") || item?.toLowerCase().includes("law")) {
  //     return <Scale {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("document") || item?.toLowerCase().includes("report")) {
  //     return <FileText {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("book") || item?.toLowerCase().includes("literature")) {
  //     return <BookOpen {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("note") || item?.toLowerCase().includes("plan")) {
  //     return <Notebook {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("trend") || item?.toLowerCase().includes("market")) {
  //     return <TrendingUp {...iconProps} />;
  //   } else if (item?.toLowerCase().includes("compliance") || item?.toLowerCase().includes("regulation")) {
  //     return <FileCheck {...iconProps} />;
  //   }
    
  //   return <Brain {...iconProps} />;
  // };

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
    (item.classification_item || "").toLowerCase().includes(filters.item.toLowerCase()) &&
    (item.classification_category || "").toLowerCase().includes(filters.category.toLowerCase()) &&
    (item.classification_sub_category || "").toLowerCase().includes(filters.subCategory.toLowerCase()) &&
    (item.proficiency_level || "").toLowerCase().includes(filters.proficiency.toLowerCase()) &&
    (item.proficiency_description || "").toLowerCase().includes(filters.description.toLowerCase())
  );

  // Unique options with proper filtering
  const uniqueCategories = Array.from(
    new Set(data.map((item) => item.classification_category).filter(cat => cat && cat.trim() !== ""))
  );

  const filteredSubCategories = category
    ? Array.from(
      new Set(
        data
          .filter((item) => item.classification_category === category)
          .map((item) => item.classification_sub_category)
          .filter(sub => sub && sub.trim() !== "")
      )
    )
    : [];

  const uniqueProficiency = Array.from(
    new Set(data.map((item) => item.proficiency_level || "").filter(prof => prof !== null && prof !== undefined && prof !== ""))
  ).sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);

    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;

    return (a || "").localeCompare(b || "");
  });

  // DataTable columns with search inputs and icons
  const columns: TableColumn<SkillItem>[] = [
    {
      name: (
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            Item
          </span>
          <div className="relative mt-1">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setFilters({ ...filters, item: e.target.value })}
              style={{ width: "100%", padding: "4px 8px 4px 8px", fontSize: "12px" }}
              className="border rounded"
            />
          </div>
        </div>
      ),
      selector: (row) => row.classification_item,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {/* {getItemIcon(row.classification_item)} */}
          {row.classification_item}
        </div>
      ),
    },
    {
      name: (
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            Category
          </span>
          <div className="relative mt-1">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{ width: "100%", padding: "4px 8px 4px 8px", fontSize: "12px" }}
              className="border rounded"
            />
          </div>
        </div>
      ),
      selector: (row) => row.classification_category,
      sortable: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            Sub Category
          </span>
          <div className="relative mt-1">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
              style={{ width: "100%", padding: "4px 8px 4px 8px", fontSize: "12px" }}
              className="border rounded"
            />
          </div>
        </div>
      ),
      selector: (row) => row.classification_sub_category,
      sortable: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            Proficiency
          </span>
          <div className="relative mt-1">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setFilters({ ...filters, proficiency: e.target.value })}
              style={{ width: "100%", padding: "4px 8px 4px 8px", fontSize: "12px" }}
              className="border rounded"
            />
          </div>
        </div>
      ),
      selector: (row) => row.proficiency_level,
      sortable: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            Description
          </span>
          <div className="relative mt-1">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
              style={{ width: "100%", padding: "4px 8px 4px 8px", fontSize: "12px" }}
              className="border rounded"
            />
          </div>
        </div>
      ),
      selector: (row) => row.proficiency_description,
      sortable: true,
    },
    {
      name: (
        <div className="flex items-center gap-2">
          Actions
        </div>
      ),
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Trash2 className="w-4 h-4 " />
          </Button>
        </div>
      ),
      width: "160px",
    },
  ];

  return (
    <>
      {/* 🔽 Top bar: Toggle + Filters + Action Buttons */}
      <div className="flex p-4 justify-between items-center mb-6">
        {/* Search Bar - Left */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search knowledge, categories, or proficiency levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons - Center */}
        <div className="flex items-center gap-2">
         
          
          {/* Filters and View Toggle - Right */}
          <div className="flex items-center gap-2">
            {/* Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <Funnel className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-4 space-y-4" align="end">
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

                <Select
                  value={subCategory || "all"}
                  onValueChange={(value) => setSubCategory(value === "all" ? "" : value)}
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

                <Select
                  value={proficiency || "all"}
                  onValueChange={(value) => setProficiency(value === "all" ? "" : value)}
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

            {/* View Toggle */}
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("circle")}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${
                  viewMode === "circle"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Circle className="h-5 w-5" />
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <TableIcon className="h-5 w-5" />
              </button>
            </div>

             <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-auto p-2 bg-white shadow-xl rounded-xl"
            >
              <div className="flex items-center gap-2">
                <button className="flex items-center px-2 py-2 hover:bg-gray-100 rounded-md text-sm transition-colors" title="Add Knowledge">
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
                <button className="flex items-center  px-2 py-2 hover:bg-gray-100 rounded-md text-sm transition-colors" title="Import Knowledge">
                  <Upload className="w-5 h-5 text-gray-600" />
                </button>
                <button className="flex items-center px-2 py-2 hover:bg-gray-100 rounded-md text-sm transition-colors" title="Export Knowledge">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
                <button className="flex items-center px-2 py-2 hover:bg-gray-100 rounded-md text-sm transition-colors" title="Knowledge Analytics">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </PopoverContent>
          </Popover>
          </div>
        </div>
      </div>

      {/* 🔽 Content */}
      <div className="w-full flex justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <Atom color="#525ceaff" size="medium" text="" textColor="" />
          </div>
        ) : columnFilteredData.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No knowledge items found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add new knowledge items</p>
          </div>
        ) : viewMode === "circle" ? (
          // Round / Circle View (✅ Fixed honeycomb layout + dynamic height)
          (() => {
            const radius = size / 2;
            const circlesPerRow = 4;
            const rowCount = Math.ceil(columnFilteredData.length / circlesPerRow);
            const containerHeight =
              rowCount * (radius * 1.8 + verticalGap) + radius;

            return (
              <div
                className="relative flex justify-center ml-50 mr-50 w-full h-full pl-40"
                style={{ height: `${containerHeight}px` }}
              >
                {columnFilteredData.map((item, index) => {
                  const row = Math.floor(index / circlesPerRow);
                  const col = index % circlesPerRow;

                  const x =
                    col * (size + horizontalGap) +
                    (row % 2 === 1 ? (size + horizontalGap) / 2 : 0);

                  const y = row * (radius * 1.8 + verticalGap);

                  return (
                    <div
                      key={item.id}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${x}px`,
                        top: `${y}px`,
                      }}
                      className="absolute rounded-full bg-gradient-to-b from-[#9FD0FF] to-[#50A8FF] border border-[#50A8FF] flex flex-col items-center justify-center text-center text-[11px] font-medium text-black p-3 hover:bg-[#f67232] hover:scale-110 transition duration-300"
                    >
                      <div className="mb-2">
                        {/* {getItemIcon(item.classification_item)} */}
                      </div>
                      {item.classification_item}
                    </div>
                  );
                })}
              </div>
            );
          })()
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