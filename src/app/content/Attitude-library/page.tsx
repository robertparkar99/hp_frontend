"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Funnel } from "lucide-react"; // ✅ filter icon

type Skill = {
  id: number;
  proficiency_level: string | null;
};

type CardData = {
  id: number;
  classification_item: string; // title
  classification_category: string; // category
  classification_sub_category: string; // subCategory
};

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
  const [showFilters, setShowFilters] = useState(false);

  interface SessionData {
    url?: string;
    token?: string;
    sub_institute_id?: string;
    org_type?: string;
  }

  const [sessionData, setSessionData] = useState<SessionData>({});

  // Get session data
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

  // Fetch unique dropdown values
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;

    const fetchDropdowns = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=attitude`,
          { cache: "no-store" }
        );
        const data: CardData[] = await res.json();

        // ✅ Deduplicate proficiency levels
        const levels = [
          ...new Set(
            data
              .map((item: any) => item.proficiency_level)
              .filter((lvl) => typeof lvl === "string")
          ),
        ];
        setSkills(levels);

        // ✅ Deduplicate categories
        const cats = [
          ...new Set(
            data
              .map((item) => item.classification_category)
              .filter((c) => typeof c === "string")
          ),
        ];
        setCategories(cats);

        // ✅ Deduplicate subcategories
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

  // Update subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategory(null); // ✅ reset subcategory
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
        setSelectedSubCategory(null); // ✅ clear old subcategory selection
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };

    fetchSubCats();
  }, [selectedCategory, sessionData.sub_institute_id]);

  // Fetch cards when any filter changes
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;

    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        let query = `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=attitude`;

        if (selectedLevel) query += `&filters[proficiency_level]=${selectedLevel}`;
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* 🔽 Filter Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="p-2"
        >
          <Funnel />
        </button>
      </div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Dropdown Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            {/* Category */}
            <Select
              value={selectedCategory ?? ""}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
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
              <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
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
              <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
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
        )}


        {/* Cards Grid */}
        {loadingCards ? (
          <p className="text-center text-gray-600">Loading cards...</p>
        ) : cards.length === 0 ? (
          <p className="text-center text-gray-600">
            {selectedLevel || selectedCategory || selectedSubCategory
              ? "No cards found for this filter."
              : "Please select filters."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card, index) => {
              //const index = card.id;
              const row = Math.floor(index / 4);
              const col = index % 4;
              const isType1 = (row + col) % 2 === 0;
              const borderRadius = isType1
                ? "rounded-[60px_5px_60px_5px]"
                : "rounded-[5px_60px_5px_60px]";

              return (
                <div
                  key={card.id}
                  className={`w-full h-[180px] bg-white border-2 border-[#C5DFFF] shadow-md shadow-black/20 p-5 flex flex-col ${borderRadius}`}
                >
                  {/* Title */}
                  <h2
                    className="text-[#1E3A8A] font-bold text-[18px] text-center mb-3 leading-normal border-b border-[#919191] pb-1 truncate"
                    title={card.classification_item}
                  >
                    {card.classification_item}
                  </h2>

                  {/* Category */}
                  <div className="text-[14px] mb-1 mt-2 leading-[1.125]">
                    <span className="font-bold text-[#1E3A8A]">Category : </span>
                    <span className="font-normal text-[#393939]">
                      {card.classification_category}
                    </span>
                  </div>

                  {/* Sub Category */}
                  <div className="text-[14px] leading-[22px]">
                    <span className="font-bold text-[#1E3A8A]">
                      Sub Category :{" "}
                    </span>
                    <span className="font-normal text-[#393939]">
                      {card.classification_sub_category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
