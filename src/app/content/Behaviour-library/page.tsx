"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface KnowledgeItem {
  proficiency_level: string | null;
}

type Skill = {
  id: number;
  proficiency_level: string | null;
};

interface BehaviourItem {
  id: number;
  proficiency_level: string | null;
  classification_category: string;
  classification_sub_category: string;
  classification_item: string;
}

const BehaviourGrid = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [cardData, setCardData] = useState<BehaviourItem[]>([]);
  interface SessionData {
    url?: string;
    token?: string;
    sub_institute_id?: string;
    org_type?: string;
  }
  
  const [sessionData, setSessionData] = useState<SessionData>({});


  useEffect(() => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const { APP_URL, token, sub_institute_id,org_type } = JSON.parse(userData);
          setSessionData({ url: APP_URL, token, sub_institute_id,org_type });
        }
      }
    }, []);
  // Fetch dropdown options (knowledge API)
  useEffect(() => {
  if (!sessionData.sub_institute_id) return; // ✅ wait until we have it

  const fetchSkills = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=behaviour&group_by=proficiency_level`,
        { cache: "no-store" }
      );
      const data = await res.json();

      const filtered = data.filter(
        (item: Skill) => item.proficiency_level !== null
      );

      setSkills(filtered);
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setLoadingOptions(false);
    }
  };

  fetchSkills();
}, [sessionData.sub_institute_id]);

  // Fetch card data (behaviour API)
  useEffect(() => {
    if (!selectedLevel) return;

    async function fetchCardData() {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=behaviour&filters[proficiency_level]=${selectedLevel}&order_by[id]=desc&group_by=classification_item`,
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
      <div className="flex justify-end mb-2">
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
              skills.map((skill) => (
                <SelectItem
                  key={skill.id}
                  value={skill.proficiency_level as string}
                >
                  {skill.proficiency_level}
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
