"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Funnel } from "lucide-react";
import { Atom } from "react-loading-indicators";

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
  const [showFilters, setShowFilters] = useState(false);

  const [sessionData, setSessionData] = useState<SessionData>({});

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

  return (
    <>
      {/* 🔽 Filters + Funnel aligned in one row */}
      <div className="flex p-4 justify-end items-center gap-3 mb-4">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
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
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="p-3"
        >
          <Funnel />
        </button>
      </div>

      {/* 🔽 Card Grid */}
      {loadingCards ? (
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
                className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-sm min-h-[180px]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3
                  className="text-blue-800 font-bold text-[16px] mb-3 truncate"
                  title={card.classification_item}
                >
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
              </motion.div>
            ))
          )}
        </div>
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
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Category Dropdown */}
      <Select
        value={selectedCategory || "all"}
        onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Filter by Category</SelectItem>
          {categories.length === 0 ? (
            <SelectItem value="loading" disabled>No Categories</SelectItem>
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
        <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Sub Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Filter by Sub Category</SelectItem>
          {subCategories.length === 0 ? (
            <SelectItem value="loading" disabled>No Sub Categories</SelectItem>
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
        onValueChange={(value) => setSelectedLevel(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
          <SelectValue placeholder="Filter by Proficiency Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Filter by Proficiency Level</SelectItem>
          {loadingOptions ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
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
