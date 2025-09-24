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
} from "@/components/ui/popover"; // ✅ popover
import { Funnel } from "lucide-react"; // ✅ filter icon
import { Atom } from "react-loading-indicators";
import { motion } from "framer-motion"; // ✅ hover animation

// ---------- Types ----------
type CardData = {
  id: number;
  classification_item: string;
  classification_category: string;
  classification_sub_category: string;
};

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
}

// ---------- Main Page ----------
export default function Index() {
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
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=attitude`,
          { cache: "no-store" }
        );
        const data: CardData[] = await res.json();

        // Deduplicate
        const levels = [
          ...new Set(
            data
              .map((item: any) => item.proficiency_level)
              .filter((lvl) => typeof lvl === "string")
          ),
        ].sort((a, b) => a.localeCompare(b));
        setSkills(levels);

        const cats = [
          ...new Set(
            data
              .map((item) => item.classification_category)
              .filter((c) => typeof c === "string")
          ),
        ];
        setCategories(cats);

        const subs = [
          ...new Set(
            data
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
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=attitude&filters[classification_category]=${selectedCategory}`,
          { cache: "no-store" }
        );
        const data: CardData[] = await res.json();

        const subs = [
          ...new Set(
            data
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
        let query = `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=attitude`;

        if (selectedLevel)
          query += `&filters[proficiency_level]=${selectedLevel}`;
        if (selectedCategory)
          query += `&filters[classification_category]=${selectedCategory}`;
        if (selectedSubCategory)
          query += `&filters[classification_sub_category]=${selectedSubCategory}`;

        query += "&order_by[id]=desc&group_by=classification_item";

        const res = await fetch(query, { cache: "no-store" });
        const data = await res.json();

        const normalized = Array.isArray(data) ? data : data?.data || [];
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
    sessionData.url,
  ]);

  return (
    <>
      {/* 🔽 Funnel + Filters in Popover */}
      <div className="flex p-4 justify-end items-center gap-3 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-3">
              <Funnel />
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
      </div>

      {/* 🔽 Cards */}
      <CardGrid cards={cards} loadingCards={loadingCards} />
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

// ---------- Cards Grid ----------
function CardGrid({
  cards,
  loadingCards,
}: {
  cards: CardData[];
  loadingCards: boolean;
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
            className={`w-full h-[180px] bg-white border-2 border-[#C5DFFF] shadow-md shadow-black/20 p-5 flex flex-col ${borderRadius}`}
          >
            {/* Title with Modern Hover */}
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
          </motion.div>
        );
      })}
    </div>
  );
}
