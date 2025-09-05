"use client";

import React, { useState, useEffect, Suspense} from "react";
import { Funnel } from "lucide-react"; // filter icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Atom } from "react-loading-indicators";

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
            <SelectTrigger className="w-56 border rounded-md px-3 py-2 text-sm bg-white shadow">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by Category</SelectItem>
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
            <SelectTrigger className="w-56 border rounded-md px-3 py-2 text-sm bg-white shadow disabled:bg-gray-100 disabled:text-gray-400">
              <SelectValue placeholder="Filter by Sub Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by Sub Category</SelectItem>
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
            <SelectTrigger className="w-56 border rounded-md px-3 py-2 text-sm bg-white shadow">
              <SelectValue placeholder="Filter by Proficiency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by Proficiency</SelectItem>
              {uniqueProficiency.map((prof) => (
                <SelectItem key={prof} value={prof}>
                  {prof}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Honeycomb Grid */}
      <div className="flex pl-40">
        <div className="relative">
          {isLoading ? (
            <Suspense fallback={<div className="flex justify-center items-center h-screen">
                                    <Atom color="#525ceaff" size="medium" text="" textColor="" />
                                  </div>
                                  }>
                                  </Suspense>
          ) : filteredData.length === 0 ? (
            <p className="text-gray-500 text-sm">No skills found</p>
          ) : (
            filteredData.map((item, index) => {
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
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Honeycomb;
