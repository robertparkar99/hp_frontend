

"use client";

import { useEffect, useState } from "react";
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
import {
  Funnel, LayoutGrid, Table, Plus, Download, Upload,
  Sparkles, Settings, Eye, Pencil, Trash2, Copy, Search, MoreVertical
} from "lucide-react";
import { Atom } from "react-loading-indicators";
import { motion } from "framer-motion";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import ViewKnowledge from "@/components/AttitudeComponent/viewDialouge";
import ShepherdTour from "../Onboarding/Competency-Management/ShepherdTour";
import { generateDetailTourSteps } from "@/lib/tourSteps";

// ---------- Types ----------
type CardData = {
  id: number;
  classification_item: string;
  classification_category: string;
  classification_sub_category: string;
  proficiency_level?: string;
};

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
}

// ---------- Main Page ----------
interface PageProps {
  showDetailTour?: boolean | { show: boolean; onComplete?: () => void };
}

export default function Index({ showDetailTour }: PageProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );

  const [cards, setCards] = useState<CardData[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);

  const [sessionData, setSessionData] = useState<SessionData>({});
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // search input state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Dialog state for viewing attitude details
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Detail tour state
  const [showTour, setShowTour] = useState(false);

  // // Detail tour handler
  // useEffect(() => {
  //   (window as any).detailOnboardingHandler = (tab: string) => {
  //     if (tab === 'Attitude') {
  //       setShowTour(true);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    const shouldShow = typeof showDetailTour === 'object' ? showDetailTour.show : showDetailTour;
    if (shouldShow) {
      setShowTour(true);
    }
  }, [showDetailTour]);

  // ✅ Table filters
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
          `${sessionData.url}/table_data?filters[sub_institute_id]=${sessionData.sub_institute_id}&table=s_user_attitude`,
          { cache: "no-store" }
        );
        const data = await res.json();

        // Transform data to match expected structure
        const transformed: CardData[] = data.map((item: any) => ({
          id: item.id,
          classification_item: item.title,
          classification_category: item.category,
          classification_sub_category: item.sub_category,
          proficiency_level: null,
        }));

        // Deduplicate
        const levels = [
          ...new Set(
            transformed
              .map((item: any) => item.proficiency_level)
              .filter((lvl) => typeof lvl === "string")
          ),
        ].sort((a, b) => a.localeCompare(b));
        setSkills(levels);

        const cats = [
          ...new Set(
            transformed
              .map((item) => item.classification_category)
              .filter((c) => typeof c === "string")
          ),
        ];
        setCategories(cats);

        const subs = [
          ...new Set(
            transformed
              .map((item) => item.classification_sub_category)
              .filter((s) => typeof s === "string")
          ),
        ];
        setSubCategories(subs);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchDropdowns();
  }, [sessionData.sub_institute_id]);

  // ---------- Fetch subcategories when category changes ----------
  useEffect(() => {
    if (!selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategory(null);
      return;
    }

    const fetchSubCats = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?filters[sub_institute_id]=${sessionData.sub_institute_id}&table=s_user_attitude&filters[category?.category=${selectedCategory}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        // Transform dataorta
        const transformed: CardData[] = data.map((item: any) => ({
          id: item.id,
          classification_item: item.title,
          classification_category: item.category,
          classification_sub_category: item.sub_category,
          proficiency_level: null,
        }));

        const subs = [
          ...new Set(
            transformed
              .map((item) => item.classification_sub_category)
              .filter((s) => typeof s === "string")
          ),
        ];
        setSubCategories(subs);
        setSelectedSubCategory(null);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };

    fetchSubCats();
  }, [selectedCategory, sessionData.sub_institute_id]);

  // ---------- Fetch cards ----------
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;

    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        let query = `${sessionData.url}/table_data?filters[sub_institute_id]=${sessionData.sub_institute_id}&table=s_user_attitude`;

        if (selectedCategory)
          query += `&filters[category]=${selectedCategory}`;
        if (selectedSubCategory)
          query += `&filters[sub_category]=${selectedSubCategory}`;

        query += "&order_by[id]=desc";

        const res = await fetch(query, { cache: "no-store" });
        const data = await res.json();

        // Transform data
        const transformed: CardData[] = data.map((item: any) => ({
          id: item.id,
          classification_item: item.title,
          classification_category: item.category,
          classification_sub_category: item.sub_category,
          proficiency_level: null,
        }));

        const normalized = Array.isArray(transformed) ? transformed : [];
        setCards(normalized);
      } catch (err) {
        console.error("Error fetching cards:", err);
        setCards([]);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, [
    selectedLevel,
    selectedCategory,
    selectedSubCategory,
    sessionData.sub_institute_id,
  ]);

  // ✅ Table columns
  const columns: TableColumn<CardData>[] = [
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
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
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
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.classification_category,
      sortable: true,
      wrap: true,
      width: "300px"
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
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.classification_sub_category,
      sortable: true,
      wrap: true,
      width: "160px",
    },
    {
      name: "Proficiency",
      selector: (row) => row.proficiency_level ?? "-",
      sortable: true,
      width: "120px",
    },
  ];

  // ✅ Table styles
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

  // ✅ Table filtering
  const filteredData = cards.filter(
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
      {/* 🔽 Enhanced Top Action Bar */}
      <div className="flex p-4 justify-between items-center mb-6">
        {/* Left side - Search Bar */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            id="search-attitude-input"
            type="text"
            placeholder="Search attitude, categories, or proficiency levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Right side - Actions and Controls */}
        <div className="flex items-center gap-1">

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-gray-50" title="Filter">
                <Funnel className="w-5 h-5 text-gray-600" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-[300px] p-6 bg-white shadow-xl rounded-xl flex flex-col gap-4"
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

          {/* View Toggle */}
          <div id="attitude-view-toggle" className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2 flex items-center justify-center ${viewMode === "cards"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 flex items-center justify-center ${viewMode === "table"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Table className="h-5 w-5" />
            </button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="More Actions">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-auto p-4 bg-white shadow-xl rounded-xl"
            >
              <div className="flex items-center gap-3">
                {/* Add New Attitude */}
                <button className="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 transition" title="Add New Attitude">
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>

                {/* AI Suggestions */}
                <button className="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 transition" title="Get AI Suggestions">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                </button>

                {/* Import/Export */}
                <button className="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 transition" title="Import ">
                  <Upload className="w-5 h-5 text-gray-600" />
                </button>
                <button className="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 transition" title="Export ">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>

                {/* Settings */}
                <button className="p-2 rounded-lg hover:bg-gray-100" title="Settings">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>


      {/* 🔽 Switch View */}
      {viewMode === "cards" ? (
        <CardGrid cards={cards} loadingCards={loadingCards} onCardClick={setSelectedCardId} />
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

      {/* Attitude View Dialog */}
      {selectedCardId && (
        <ViewKnowledge
          knowledgeId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
          onSuccess={() => {}}
          classification="attitude"
          typeName="Attitude"
        />
      )}

      {/* Detail Tour */}
      {showTour && (
        <ShepherdTour
          steps={generateDetailTourSteps('Attitude')}
          onComplete={() => {
            setShowTour(false);
            if (typeof showDetailTour === 'object' && showDetailTour.onComplete) {
              showDetailTour.onComplete();
            }
          }}
        />
      )}
    </>
  );
}

// ---------- Filters Component ----------
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
    <div className="flex flex-col gap-4">
      {/* Category */}
      <Select
        value={selectedCategory ?? ""}
        onValueChange={(value) => setSelectedCategory(value)}
      >
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Category" />
        </SelectTrigger>
        <SelectContent>
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

      {/* Sub Category */}
      <Select
        value={selectedSubCategory ?? ""}
        onValueChange={(value) => setSelectedSubCategory(value)}
        disabled={!selectedCategory}
      >
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white disabled:bg-gray-100 disabled:text-gray-400">
          <SelectValue placeholder="Filter by Sub Category" />
        </SelectTrigger>
        <SelectContent>
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

      {/* Proficiency Level */}
      <Select
        value={selectedLevel ?? ""}
        onValueChange={(value) => setSelectedLevel(value)}
      >
        <SelectTrigger className="w-full rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Proficiency Level" />
        </SelectTrigger>
        <SelectContent>
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

// ---------- Enhanced Cards Grid with Action Icons ----------
function CardGrid({
  cards,
  loadingCards,
  onCardClick,
}: {
  cards: CardData[];
  loadingCards: boolean;
  onCardClick: (id: number) => void;
}) {
  if (loadingCards) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <p className="text-center text-gray-600">
        No cards found. Please adjust filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const isType1 = (row + col) % 2 === 0;
        const borderRadius = isType1
          ? "rounded-[60px_5px_60px_5px]"
          : "rounded-[5px_60px_5px_60px]";

        return (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className={`w-full h-[200px] bg-white border-2 border-[#C5DFFF] shadow-md shadow-black/20 p-5 flex flex-col ${borderRadius} relative group cursor-pointer`}
            onClick={() => onCardClick(card.id)}
          >


            {/* Title */}
            <motion.h2
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative text-[#1E3A8A] font-bold text-[18px] text-center mb-3 leading-normal 
                         pb-1 truncate cursor-pointer 
                         hover:text-blue-500 transition-colors duration-300
                         after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[2px] after:bg-blue-500 
                         after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
              title={card.classification_item}
            >
              {card.classification_item}
            </motion.h2>

            {/* Category */}
            <div className="text-[14px] mb-1 mt-2 leading-[1.125]">
              <span className="font-bold text-[#1E3A8A]">Category : </span>
              <span className="font-normal text-[#393939]">
                {card.classification_category}
              </span>
            </div>

            {/* Sub Category */}
            <div className="text-[14px] leading-[22px]">
              <span className="font-bold text-[#1E3A8A]">Sub Category : </span>
              <span className="font-normal text-[#393939]">
                {card.classification_sub_category}
              </span>
            </div>

            {/* Proficiency Level Badge */}
            {card.proficiency_level && (
              <div className="mt-auto pt-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {card.proficiency_level}
                </span>
              </div>
            )}

            {/* Card Actions - Top Right */}
            <div className="absolute bottom-3 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="p-1 hover:bg-gray-100 rounded" title="View Details">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                <Pencil className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="AI Enhance">
                <Sparkles className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Duplicate">
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-red-50 rounded" title="Delete">
                <Trash2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}