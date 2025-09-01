"use client";

import React, { useState, useEffect } from "react";

interface KnowledgeItem {
  proficiency_level: string | null;
}

interface BehaviourItem {
  id: number;
  proficiency_level: string | null;
  classification_category: string;
  classification_sub_category: string;
  classification_item: string;
}

const BehaviourGrid = () => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [cardData, setCardData] = useState<BehaviourItem[]>([]);

  // Fetch dropdown options (knowledge API)
  useEffect(() => {
    async function fetchDropdownOptions() {
      const res = await fetch(
        "https://hp.triz.co.in/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=3&filters[classification]=behaviour&group_by=proficiency_level",
        { cache: "no-store" }
      );
      let result = await res.json();

      // Ensure it's an array
      if (!Array.isArray(result)) {
        console.error("Dropdown API returned non-array:", result);
        result = [];
      }

      const uniqueLevels = Array.from(
        new Set(
          result
            .map((item: KnowledgeItem) => item.proficiency_level)
            .filter((lvl: string | null): lvl is string => lvl !== null && lvl.trim() !== "")
        )
      );

      const options = [
        { value: "", label: "Select Proficiency Level" },
        ...uniqueLevels.map((lvl) => ({
          value: String(lvl),
          label: `${lvl}`,
        })),
      ];

      setDropdownOptions(options);
    }

    fetchDropdownOptions();
  }, []);

  // Fetch card data (behaviour API)
  useEffect(() => {
    if (!selectedLevel) return;

    async function fetchCardData() {
      const res = await fetch(
        `https://hp.triz.co.in/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=3&filters[classification]=behaviour&filters[proficiency_level]=${selectedLevel}&order_by[id]=desc&group_by=classification_item`,
        { cache: "no-store" }
      );
      let result = await res.json();

      // Ensure it's an array
      if (!Array.isArray(result)) {
        console.error("Card API returned non-array:", result);
        result = [];
      }

      setCardData(result);
    }

    fetchCardData();
  }, [selectedLevel]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Dropdown */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label
            htmlFor="proficiency-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Proficiency Level:
          </label>
          <select
            id="proficiency-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {cardData.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No data found for this level
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
