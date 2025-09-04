"use client";
import React, { useState, useEffect } from "react";
import { Funnel } from "lucide-react"; // ✅ filter icon

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
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown state
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [proficiency, setProficiency] = useState<string>("");

  // Circle layout
  const size = 160;
  const horizontalGap = 10;
  const verticalGap = 20;
  const verticalSpacing = Math.floor(size * 0.85) + verticalGap;
  const horizontalShift = Math.floor((size + horizontalGap) / 2);

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://hp.triz.co.in/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=3&filters[classification]=knowledge&order_by[id]=desc&group_by=classification_item"
        );
        const json = await res.json();
        setData(json);
        setFilteredData(json);
      } catch (err) {
        console.error("Error fetching API data:", err);
      }
    };

    fetchData();
  }, []);

  // Apply filters
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

  // Get unique options
  const uniqueCategories = Array.from(
    new Set(data.map((item) => item.classification_category))
  );

  // Subcategories depend on category
  const filteredSubCategories = category
    ? Array.from(
        new Set(
          data
            .filter((item) => item.classification_category === category)
            .map((item) => item.classification_sub_category)
        )
      )
    : [];

  // Sorted proficiency levels (numeric ascending, then text alphabetically)
  const uniqueProficiency = Array.from(
    new Set(data.map((item) => item.proficiency_level))
  ).sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    if (!isNaN(numA)) return -1; // numbers before text
    if (!isNaN(numB)) return 1;
    return a.localeCompare(b); // text vs text
  });

  return (
    <div className="flex flex-col w-full font-sans">
      {/* 🔽 Filter Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="p-2"
        >
          <Funnel />
        </button>
      </div>

      {showFilters && (
        <div className="flex justify-end gap-4 mb-6 pr-10">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory(""); // reset subcategory when category changes
            }}
            className="w-56 border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Filter by Category</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sub-Category Filter */}
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            disabled={!category}
            className={`w-56 border border-gray-300 rounded-md px-3 py-2 text-sm ${
              !category ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }`}
          >
            <option value="">Filter by Sub Category</option>
            {filteredSubCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Proficiency Filter */}
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="w-56 border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Filter by Proficiency</option>
            {uniqueProficiency.map((prof) => (
              <option key={prof} value={prof}>
                {isNaN(Number(prof)) ? prof : `${prof}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Honeycomb Grid */}
      <div className="flex pl-40">
        <div className="relative">
          {filteredData.map((item, index) => {
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
      </div>
    </div>
  );
};

export default Honeycomb;
