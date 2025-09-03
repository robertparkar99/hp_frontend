"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./triangle.css"; // custom CSS
import { Atom } from "react-loading-indicators";

type ApiItem = {
  id: number;
  classification_item: string;
  proficiency_level: string;
  classification_category: string;
  classification_sub_category: string;
};

interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string;
  org_type?: string;
}

// 🔹 Utility to safely extract array from API response
const safeArray = (data: any): ApiItem[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function Page() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dropdown states
  const [skills, setSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );

  const [loadingOptions, setLoadingOptions] = useState(true);
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

  // Fetch dropdown options
  useEffect(() => {
    if (!sessionData.sub_institute_id || !sessionData.url) return;

    const fetchDropdowns = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=ability`,
          { cache: "no-store" }
        );
        const json = await res.json();
        const data = safeArray(json);

        setSkills(
          [...new Set(data.map((item) => item.proficiency_level))].filter(
            Boolean
          )
        );
        setCategories(
          [...new Set(data.map((item) => item.classification_category))].filter(
            Boolean
          )
        );
        setSubCategories(
          [
            ...new Set(
              data.map((item) => item.classification_sub_category)
            ),
          ].filter(Boolean)
        );
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchDropdowns();
  }, [sessionData.sub_institute_id, sessionData.url]);

  // Update subcategories when category changes
  useEffect(() => {
    if (!selectedCategory || !sessionData.sub_institute_id || !sessionData.url)
      return;

    const fetchSubCats = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=ability&filters[classification_category]=${selectedCategory}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        const data = safeArray(json);

        setSubCategories(
          [
            ...new Set(
              data.map((item) => item.classification_sub_category)
            ),
          ].filter(Boolean)
        );
        setSelectedSubCategory(null);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };

    fetchSubCats();
  }, [selectedCategory, sessionData]);

  // Fetch triangles with filters applied
  useEffect(() => {
    if (!sessionData.sub_institute_id || !sessionData.url) return;

    const fetchTriangles = async () => {
      try {
        setLoading(true);

        let url = `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=ability&order_by[id]=desc`;

        if (selectedLevel) {
          url += `&filters[proficiency_level]=${selectedLevel}`;
        }
        if (selectedCategory) {
          url += `&filters[classification_category]=${selectedCategory}`;
        }
        if (selectedSubCategory) {
          url += `&filters[classification_sub_category]=${selectedSubCategory}`;
        }

        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        const data = safeArray(json);

        setItems(data);
      } catch (err) {
        console.error("Error fetching triangles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTriangles();
  }, [sessionData, selectedLevel, selectedCategory, selectedSubCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  // Group into rows of 5
  const chunk = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  const rows = chunk(items, 5);

  return (
    <div className="flex flex-col items-center gap-8 p-10">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {/* Proficiency */}
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

        {/* Category */}
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

        {/* Sub Category */}
        <Select
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
      </div>

      {/* Triangles Grid */}
      {rows.length > 0 ? (
        rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-6 mt-23">
            {row.map((item, colIndex) => {
              const shouldRotate =
                rowIndex % 2 === 0 ? colIndex % 2 === 1 : colIndex % 2 === 0;

              return (
                <Triangle
                  key={item.id}
                  text={item.classification_item}
                  rotate={shouldRotate}
                />
              );
            })}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No items match your filters.</p>
      )}
    </div>
  );
}

type TriangleProps = {
  text: string;
  rotate?: boolean;
};

function Triangle({ text, rotate = false }: TriangleProps) {
  return (
    <div className="triangle-wrapper">
      <div
        className="triangle"
        style={{
          transform: rotate
            ? "rotate(120deg) skewX(-30deg) scale(1,.866)"
            : "rotate(-60deg) skewX(-30deg) scale(1,.866)",
        }}
      />
      <div
        className="triangle-text"
        title={text}
        style={{
          transform: rotate ? "translate(0px, -15px)" : "translate(0px, 52px)",
        }}
      >
        {text ? text.slice(0, 50) + (text.length > 50 ? "..." : "") : "-"}
      </div>
    </div>
  );
}
