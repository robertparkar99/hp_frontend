"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BehaviourItem {
  id: number;
  proficiency_level: string | null;
  classification_category: string;
  classification_sub_category: string;
  classification_item: string;
}

const BehaviourGrid = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [cardData, setCardData] = useState<BehaviourItem[]>([]);
  const [allData, setAllData] = useState<BehaviourItem[]>([]); // ✅ keep full dataset for filtering subcategories

  interface SessionData {
    url?: string;
    token?: string;
    sub_institute_id?: string;
    org_type?: string;
  }
  const [sessionData, setSessionData] = useState<SessionData>({});

  // Load session data from localStorage
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

  // Fetch unique skills, categories, subcategories for dropdowns
  useEffect(() => {
    if (!sessionData.sub_institute_id) return;

    const fetchDropdowns = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=behaviour`,
          { cache: "no-store" }
        );
        const data: BehaviourItem[] = await res.json();

        setAllData(data); // ✅ store full dataset for local filtering

        // ✅ Deduplicate proficiency levels
        const skillLevels = [
          ...new Set(
            data
              .filter((item) => typeof item.proficiency_level === "string")
              .map((item) => item.proficiency_level as string)
          ),
        ];
        setSkills(skillLevels);

        // ✅ Deduplicate categories
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

  // ✅ Update subcategories whenever category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategory(""); // ✅ reset
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
    setSelectedSubCategory(""); // ✅ reset old subcategory
  }, [selectedCategory, allData]);

  // Fetch card data (behaviour API)
  useEffect(() => {
    if (!selectedLevel && !selectedCategory && !selectedSubCategory) return;

    async function fetchCardData() {
      let query = `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=behaviour`;

      if (selectedLevel) {
        query += `&filters[proficiency_level]=${selectedLevel}`;
      }
      if (selectedCategory) {
        query += `&filters[classification_category]=${selectedCategory}`;
      }
      if (selectedSubCategory) {
        query += `&filters[classification_sub_category]=${selectedSubCategory}`;
      }

      query += "&order_by[id]=desc&group_by=classification_item";

      const res = await fetch(query, { cache: "no-store" });
      let result = await res.json();

      if (!Array.isArray(result)) {
        console.error("Card API returned non-array:", result);
        result = [];
      }
      setCardData(result);
    }

    fetchCardData();
  }, [selectedLevel, selectedCategory, selectedSubCategory]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mb-4">
        {/* Proficiency Dropdown */}
        <Select onValueChange={(value) => setSelectedLevel(value)}>
          <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
            <SelectValue placeholder="Filter by Proficiency" />
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

        {/* Category Dropdown */}
        <Select onValueChange={(value) => setSelectedCategory(value)}>
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

        {/* Sub Category Dropdown */}
        <Select
          onValueChange={(value) => setSelectedSubCategory(value)}
          disabled={subCategories.length === 0}
          value={selectedSubCategory || undefined} // ✅ keep controlled
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
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto mt-5">
        {cardData.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No data found for this filter
          </p>
        ) : (
          cardData.map((card) => (
            <div
              key={card.id}
              className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[180px]"
            >
              <h3 className="text-blue-800 font-bold text-[16px] mb-3">
                {card.classification_item}
              </h3>

              <div className="border-t border-gray-400 mb-3"></div>

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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BehaviourGrid;
