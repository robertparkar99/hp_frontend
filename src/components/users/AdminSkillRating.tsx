
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { CheckCircle, XCircle } from "lucide-react";

// Interfaces
interface Skill {
  ability: any[];
  category: string;
  description: string;
  jobrole: string;
  jobrole_skill_id: number;
  knowledge: any[];
  behaviour: any[];
  attitude: any[];
  proficiency_level: string | number;
  skill: string;
  skill_id: number;
  sub_category: string;
  title: string;
}

interface RatedSkill {
  id: number;
  skill_level: string;
  title?: string;
  skill?: string;
  category?: string;
  sub_category?: string;
  created_at?: string;
  proficiency_level?: string;
  self_rating?: number;
  SkillLevels?: string[];
  skill_id?: number;
  // Add detailed ratings fields
  detailed_ratings?: {
    knowledge: Record<string, string>;
    ability: Record<string, string>;
    behaviour: Record<string, string>;
    attitude: Record<string, string>;
  };
  knowledge_ratings?: Record<string, string>;
  ability_ratings?: Record<string, string>;
  behaviour_ratings?: Record<string, string>;
  attitude_ratings?: Record<string, string>;
}

interface UserRatingData {
  id: number;
  user_id: number;
  jobrole_id: number;
  skill_ids: string;
  knowledge_ids: string;
  ability_ids: string | null;
  attitude_ids: string | null;
  behavior_ids: string | null;
  sub_institute_id: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

interface JobroleSkilladd1Props {
  sub_institute_id: number;
  type: string;
  type_id: number;
  title: string;
  user_id: number;
  jobrole_id: number;
  SkillLevels: any[];
}

// ✅ Tooltip Component for Chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-3 rounded shadow-md">
        <p className="font-semibold text-gray-800">{data.skill}</p>
        <p className="text-sm text-gray-600">
          Rating: {data.rating}/{data.proficiency_level}
        </p>
        <p className="text-sm text-gray-600">
          proficiency : {data.proficiency_level || "Not Set"}
        </p>
      </div>
    );
  }
  return null;
};

const EmptyChartState = () => (
  <div className="flex flex-col items-center justify-center py-3 px-6 bg-white">
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl w-full">
      <div className="flex-shrink-0">
        <img
          src="/assets/image/unrated.jpeg"
          alt="Awaiting Evaluation"
          className="w-120 h-100 object-cover rounded-2xl shadow-lg border border-gray-300"
        />
      </div>
      <div className="flex flex-col justify-center text-center md:text-left max-w-md">
        <h3 className="text-3xl font-extrabold text-gray-800 mb-4">
          Awaiting Evaluation 🚀
        </h3>
        <h4 className="text-xl font-bold text-blue-600 mb-3">
          No Ratings Yet
        </h4>
        <p className="text-gray-600 text-base mb-6 leading-relaxed">
          User must complete the skill rating process to unlock{" "}
          <span className="font-semibold text-blue-600">
            personalized analytics
          </span> and detailed insights.
        </p>
      </div>
    </div>
  </div>
);

// Fixed renderCircles function
const renderCircles = (value: number, max: number) => {
  // Ensure value is between 0 and max, but show all circles up to max
  const normalizedValue = Math.max(0, Math.min(max, value));
  const full = Math.floor(normalizedValue);
  const half = normalizedValue % 1 !== 0;
  const empty = max - full - (half ? 1 : 0);

  return (
    <div className="flex items-center">
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f-${i}`} className="text-blue-600 text-2xl">●</span>
      ))}
      {half && <span className="text-blue-600 text-2xl">◐</span>}
      {Array.from({ length: Math.max(0, empty) }).map((_, i) => (
        <span key={`e-${i}`} className="text-gray-300 text-2xl">●</span>
      ))}
    </div>
  );
};

// Detailed Ratings Component - Expandable Individual Details
const renderDetailedRatings = (ratedSkill: RatedSkill) => {
  const detailedRatings = ratedSkill.detailed_ratings || {
    knowledge: ratedSkill.knowledge_ratings || {},
    ability: ratedSkill.ability_ratings || {},
    behaviour: ratedSkill.behaviour_ratings || {},
    attitude: ratedSkill.attitude_ratings || {}
  };

  const attrArray = [
    { title: "knowledge", icon: "mdi-book-open-page-variant", color: "blue" },
    { title: "ability", icon: "mdi-lightbulb-on", color: "green" },
    { title: "behaviour", icon: "mdi-account-group", color: "purple" },
    { title: "attitude", icon: "mdi-emoticon-happy-outline", color: "orange" },
  ];

  const getScore = (ratings: Record<string, string>) => {
    const yesCount = Object.values(ratings).filter(val => {
      const v = String(val).toLowerCase();
      return v === "yes" || v === "true" || v === "1";
    }).length;
    const totalCount = Object.keys(ratings).length;
    return { yesCount, totalCount, percentage: totalCount > 0 ? Math.round((yesCount / totalCount) * 100) : 0 };
  };

  // Check if there are any ratings to show
  const hasAnyRatings = attrArray.some(attr => {
    const ratings = detailedRatings[attr.title as keyof typeof detailedRatings] || {};
    return Object.keys(ratings).length > 0;
  });

  if (!hasAnyRatings) {
    return null; // Don't show if no ratings
  }

  return (
    <div className="mt-4 border-t pt-3">
      {/* Expandable Detailed View */}
      <details className="group">
        <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800 list-none flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
          <span>View Individual Attribute Ratings</span>
          <span className="mdi mdi-chevron-down group-open:mdi-chevron-up transition-transform"></span>
        </summary>
        <div className="mt-3 space-y-3">
          {attrArray.map((attr) => {
            const ratings = detailedRatings[attr.title as keyof typeof detailedRatings] || {};
            const { yesCount, totalCount, percentage } = getScore(ratings);

            if (totalCount === 0) return null; // Skip if no attributes

            return (
              <div key={attr.title} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold capitalize flex items-center">
                    <span className={`mdi ${attr.icon} mr-2 text-${attr.color}-600`}></span>
                    {attr.title} ({yesCount}/{totalCount} - {percentage}%)
                  </h5>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(ratings).map(([attribute, value]) => {
                    const v = String(value).toLowerCase();
                    const isYes = v === "yes" || v === "true" || v === "1";
                    const isNo = v === "no" || v === "false" || v === "0";
                    return (
                      <div key={attribute} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600 flex-1 truncate mr-2">{attribute}</span>
                        {isYes ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Yes</span>
                          </span>
                        ) : isNo ? (
                          <span className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">No</span>
                          </span>
                        ) : (
                          <span className="text-gray-700 text-xs font-medium">{String(value)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
};

// Fullscreen Chart Component
const FullscreenChart = ({ chartData, SkillLevels, onClose }: {
  chartData: any[];
  SkillLevels: any[];
  onClose: () => void;
}) => {
  const max = SkillLevels.length;

  return (
    <div className="fixed inset-0 z-50 bg-white p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Skill Ratings - Full View
        </h2>
        <button
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span className="mdi mdi-close"></span>
          Close
        </button>
      </div>

      {/* Chart Container */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
         <BarChart
  data={chartData}
  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
>
  <CartesianGrid strokeDasharray="3 3" />

  <XAxis
    dataKey="skill"
    angle={-45}
    textAnchor="end"
    height={80}
    interval={0}
  />

  <YAxis allowDecimals={false} domain={[0, SkillLevels.length || 5]} />

  <Tooltip />

  {/* Rated */}
  <Bar
    dataKey="rated"
    name="Rated"
    fill="#3B82F6"
    radius={[4, 4, 0, 0]}
  />

  {/* Expected */}
  <Bar
    dataKey="expected"
    name="Expected"
    fill="#22C55E"
    radius={[4, 4, 0, 0]}
  />
</BarChart>

        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center mt-4">
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-blue-500 rounded"></div>
    <span className="text-sm">Rated</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-green-500 rounded"></div>
    <span className="text-sm">Expected</span>
  </div>
</div>


      {/* Skills Count */}
      <div className="text-center mt-2 text-sm text-gray-600">
        Showing {chartData.length} skills
      </div>
    </div>
  );
};

export default function Page({
  sub_institute_id = 3,
  type = "jobrole",
  type_id = 3154,
  title = "Nurse Manager",
  user_id = 6,
  jobrole_id = 3154,
  SkillLevels = [],
}: JobroleSkilladd1Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userRatedSkills, setUserRatedSkills] = useState<RatedSkill[]>([]);
  const [userRatingData, setUserRatingData] = useState<UserRatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selfRating, setSelfRating] = useState<any>(0);
  const [expected, setEexpected] = useState<any>(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showFullscreenChart, setShowFullscreenChart] = useState(false);

  const [sessionData, setSessionData] = useState({
    APP_URL: "",
    token: "",
    sub_institute_id: sub_institute_id,
    org_type: "",
    user_id: user_id,
  });

 useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        APP_URL: APP_URL,
        token,
        sub_institute_id: sub_institute_id,
        org_type: org_type,
        user_id: user_id,
      });
    }
  }, []);

  const parseExpectedLevel = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 5;
    if (typeof value === "number" && !isNaN(value)) return Math.max(1, Math.min(5, value));
    const str = String(value);
    const match = str.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return Math.max(1, Math.min(5, num));
    }
    const lower = str.toLowerCase();
    if (lower.includes("novice")) return 1;
    if (lower.includes("beginner")) return 2;
    if (lower.includes("intermediate")) return 3;
    if (lower.includes("advanced")) return 5;
    return 5;
  };

  // Fetch all skills from first API
  const fetchAllSkills = async () => {
    try {
      const base = sessionData.APP_URL || "https://hp.triz.co.in";
      const response = await fetch(
        `${base}/get-kaba?sub_institute_id=${sessionData.sub_institute_id}&type=${type}&type_id=${type_id}&title=${encodeURIComponent(title)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched skills jobroke data:", data.title);
        
        // Transform the API response to match our Skill interface
        const transformedSkills: Skill[] = (data.skills || data.skill || []).map((skill: any) => ({
          ability: skill.ability || [],
          category: skill.category || "",
          description: skill.description || "",
          jobrole: data.title || "",
          jobrole_skill_id: skill.jobrole_skill_id || 0,
          knowledge: skill.knowledge || [],
          behaviour: skill.behaviour || [],
          attitude: skill.attitude || [],
          proficiency_level: skill.proficiency_level ?? "Level 5",
          skill: skill.title || "",
          skill_id: skill.id || 0,
          sub_category: skill.sub_category || "",
          title: skill.title || skill.skill || ""
        })) || [];
        // console.log('kya hume transfomed skills mil rahe hai??',data.skill);
        setSkills(transformedSkills);
        return transformedSkills;
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
    return [];
  };

  // Fetch user rating data from second API
  const fetchUserRatingData = async () => {
    try {
      const base = sessionData.APP_URL || "https://hp.triz.co.in";
      const response = await fetch(
        `${base}/table_data?table=user_rating_details&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[user_id]=${sessionData.user_id}&filters[jobrole_id]=${jobrole_id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user rating data:", data);
        
        if (data.length > 0) {
          setUserRatingData(data[0]);
          return data[0];
        }
      }
    } catch (error) {
      console.error("Error fetching user rating data:", error);
    }
    return null;
  };

  // Process and combine data from both APIs
  const processSkillsData = (allSkills: Skill[], ratingData: UserRatingData | null) => {
    if (!ratingData) {
      // No rating data, all skills are unrated
      setUserRatedSkills([]);
      return;
    }
    // Parse the JSON strings from the API response
    const skillRatings = JSON.parse(ratingData.skill_ids);
    const knowledgeRatings = JSON.parse(ratingData.knowledge_ids);
    const abilityRatings = ratingData.ability_ids ? JSON.parse(ratingData.ability_ids) : {};
    const behaviorRatings = ratingData.behavior_ids ? JSON.parse(ratingData.behavior_ids) : {};
    const attitudeRatings = ratingData.attitude_ids ? JSON.parse(ratingData.attitude_ids) : {};

    // Create rated skills array
    const ratedSkillsArray: RatedSkill[] = [];
    
    allSkills.forEach(skill => {
      const skillId = skill.skill_id;
      if (skillRatings[skillId]) {
        // Get detailed ratings for this specific skill
        const skillKnowledge = skill.knowledge || [];
        const skillAbility = skill.ability || [];
        const skillBehaviour = skill.behaviour || [];
        const skillAttitude = skill.attitude || [];

        // Create knowledge ratings object for this skill
        const knowledgeRatingObj: Record<string, string> = {};
        skillKnowledge.forEach((knowledgeItem: any) => {
          const knowledgeId = knowledgeItem.knowledge_id?.toString();
          if (knowledgeId && knowledgeRatings[knowledgeId]) {
            knowledgeRatingObj[knowledgeItem.knowledge || "Unknown"] =
              String(knowledgeRatings[knowledgeId]);
          }
        });

        // Create ability ratings object for this skill
        const abilityRatingObj: Record<string, string> = {};
        skillAbility.forEach((abilityItem: any) => {
          const abilityId = abilityItem.ability_id?.toString();
          if (abilityId && abilityRatings[abilityId]) {
            abilityRatingObj[abilityItem.ability || "Unknown"] =
              String(abilityRatings[abilityId]);
          }
        });

        // Create behaviour ratings object for this skill
        const behaviourRatingObj: Record<string, string> = {};
        skillBehaviour.forEach((behaviourItem: any) => {
          const behaviourId = behaviourItem.behaviour_id?.toString();
          if (behaviourId && behaviorRatings[behaviourId]) {
            behaviourRatingObj[behaviourItem.behaviour || "Unknown"] =
              String(behaviorRatings[behaviourId]);
          }
        });

        // Create attitude ratings object for this skill
        const attitudeRatingObj: Record<string, string> = {};
        skillAttitude.forEach((attitudeItem: any) => {
          const attitudeId = attitudeItem.attitude_id?.toString();
          if (attitudeId && attitudeRatings[attitudeId]) {
            attitudeRatingObj[attitudeItem.attitude || "Unknown"] =
              String(attitudeRatings[attitudeId]);
          }
        });

        const ratedSkill: RatedSkill = {
          id: skill.skill_id,
          skill_id: skill.skill_id,
          skill_level: `Level ${skillRatings[skillId]}`,
          title: skill.title || skill.skill,
          skill: skill.skill,
          category: skill.category,
          sub_category: skill.sub_category,
          created_at: ratingData.created_at,
          proficiency_level: String(skill.proficiency_level),
          self_rating: parseInt(skillRatings[skillId]),
          knowledge_ratings: knowledgeRatingObj,
          ability_ratings: abilityRatingObj,
          behaviour_ratings: behaviourRatingObj,
          attitude_ratings: attitudeRatingObj,
          detailed_ratings: {
            knowledge: knowledgeRatingObj,
            ability: abilityRatingObj,
            behaviour: behaviourRatingObj,
            attitude: attitudeRatingObj
          }
        };

        ratedSkillsArray.push(ratedSkill);
      }
    });

    console.log("Processed rated skills:", ratedSkillsArray);
    setUserRatedSkills(ratedSkillsArray);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both APIs in parallel
        const [allSkills, ratingData] = await Promise.all([
          fetchAllSkills(),
          fetchUserRatingData()
        ]);

        // Process the data
        processSkillsData(allSkills, ratingData);

        // Check if we should show empty state
        const hasRatedSkills = ratingData && ratingData.skill_ids && ratingData.skill_ids !== "{}";
        setShowEmptyState(!hasRatedSkills);
      } catch (error) {
        console.error("Error fetching data:", error);
        setShowEmptyState(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sub_institute_id, type_id, user_id, jobrole_id]);

  // Compute un-rated skills
  const unRatedSkills = skills.filter(
    skill => !userRatedSkills.some(rated => rated.skill_id === skill.skill_id)
  );

  const calculateOverallSkillIndex = () => {
    if (!userRatedSkills || userRatedSkills.length === 0) return "0.0";
    const totalRating = userRatedSkills.reduce((sum: number, skill: RatedSkill) => {
      const rating = parseInt(skill.skill_level?.replace("Level ", "") || "0");
      return sum + rating;
    }, 0);
    return (totalRating / userRatedSkills.length).toFixed(1);
  };

  const overallSkillIndex = calculateOverallSkillIndex();
  const percentage = Math.round((parseFloat(overallSkillIndex) / (SkillLevels.length || 5)) * 100);

  const totalLevels = SkillLevels.length || 5;

  const overallStatus =
    percentage >= 80
      ? "On Track"
      : percentage >= 60
        ? "Medium Risk"
        : "At Risk";

  const overallStatusColor =
    percentage >= 80
      ? "bg-green-50 text-green-700 border-green-200"
      : percentage >= 60
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-red-50 text-red-700 border-red-200";

  const overallRingColor =
    percentage >= 80
      ? "#22c55e"
      : percentage >= 60
        ? "#eab308"
        : "#ef4444";

  const overallTextColor =
    percentage >= 80
      ? "text-green-600"
      : percentage >= 60
        ? "text-yellow-600"
        : "text-red-600";

  // Prepare chart data
 const fullChartData = userRatedSkills.map((s: RatedSkill) => {
  const rated = parseInt(s.skill_level?.replace("Level ", "") || "0");
  const expected = parseExpectedLevel(s.proficiency_level);

  return {
    skill: s.title || s.skill || "Unknown",
    rated,
    expected,
  };
});


  // Limited chart data for main view (first 6 items)
  const limitedChartData = fullChartData.slice(0, 6);

  if (loading) {
    return (
      <main className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading skills data...</p>
        </div>
      </main>
    );
  }

  if (showEmptyState) {
    return (
      <main className="p-6">
        <EmptyChartState />
      </main>
    );
  }

  return (
    <main className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Fullscreen Chart Modal */}
      {showFullscreenChart && (
        <FullscreenChart
          chartData={fullChartData}
          SkillLevels={SkillLevels}
          onClose={() => setShowFullscreenChart(false)}
        />
      )}

      {/* 🔥 Chart Section */}
      <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 border border-gray-200">
        <div className={showEmptyState ? "filter blur-sm pointer-events-none" : ""}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
              <span className="mdi mdi-chart-line text-green-600 mr-2"></span>
              Skill Ratings
              {fullChartData.length > 6 && (
                <span className="text-xs sm:text-sm text-gray-500 ml-2">
                  (Showing {Math.min(6, fullChartData.length)} of {fullChartData.length})
                </span>
              )}
            </h2>

            {fullChartData.length > 6 && (
              <button
                onClick={() => setShowFullscreenChart(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm"
              >
                <span className="mdi mdi-fullscreen"></span>
                View Full Chart
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart */}
            <div className="lg:col-span-2 h-56 sm:h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
  data={limitedChartData}
  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
>
  <CartesianGrid strokeDasharray="3 3" />

  <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
  <YAxis allowDecimals={false} domain={[0, totalLevels]} tick={{ fontSize: 10 }} />

  <Tooltip />

  {/* Rated */}
  <Bar
    dataKey="rated"
    name="Rated"
    fill="#3B82F6"
    radius={[4, 4, 0, 0]}
  />

  {/* Expected */}
  <Bar
    dataKey="expected"
    name="Expected"
    fill="#22C55E"
    radius={[4, 4, 0, 0]}
  />
</BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex gap-4 sm:gap-6 justify-center mt-3 sm:mt-4">
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
    <span className="text-xs sm:text-sm">Rated</span>
  </div>
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
    <span className="text-xs sm:text-sm">Expected</span>
  </div>
</div>

            </div>

            {/* Overall Skill Index */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 text-center">
                <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-3 sm:mb-4">
                  Overall Skill Index
                </h3>

                {(() => {
                  const totalRating = userRatedSkills.reduce((sum: number, skill: RatedSkill) => {
                    const rating = parseInt(skill.skill_level?.replace("Level ", "") || "0");
                    return sum + rating;
                  }, 0);

                  const averageRating = userRatedSkills.length > 0 ? totalRating / userRatedSkills.length : 0;
                  const maxRating = totalLevels;
                  const percentage = Math.round((averageRating / maxRating) * 100);

                  const improvement = userRatedSkills.length > 0 ?
                    (averageRating - (maxRating / 2)).toFixed(1) : "0.0";
                  const improvementValue = parseFloat(improvement);
                  const improvementSign = improvementValue >= 0 ? "+" : "";

                  const proficiencyCounts = {
                    advanced: userRatedSkills.filter(skill => {
                      const rating = parseInt(skill.skill_level?.replace("Level ", "") || "0");
                      return rating >= 5;
                    }).length,
                    intermediate: userRatedSkills.filter(skill => {
                      const rating = parseInt(skill.skill_level?.replace("Level ", "") || "0");
                      return rating >= 3 && rating < 5;
                    }).length,
                    beginner: userRatedSkills.filter(skill => {
                      const rating = parseInt(skill.skill_level?.replace("Level ", "") || "0");
                      return rating < 3;
                    }).length
                  };

                  const totalSkills = userRatedSkills.length;
                  const advancedPercentage = totalSkills > 0 ? (proficiencyCounts.advanced / totalSkills) * 100 : 0;
                  const beginnerPercentage = totalSkills > 0 ? (proficiencyCounts.beginner / totalSkills) * 100 : 0;

                  let overallStatus = "Good Performance";
                  let overallStatusColor = "bg-green-50 text-green-700 border-green-200";
                  let overallRingColor = "#22c55e";
                  let overallTextColor = "text-green-600";

                  if (beginnerPercentage > 50) {
                    overallStatus = "Needs Improvement";
                    overallStatusColor = "bg-red-50 text-red-700 border-red-200";
                    overallRingColor = "#ef4444";
                    overallTextColor = "text-red-600";
                  } else if (advancedPercentage < 30) {
                    overallStatus = "Average Performance";
                    overallStatusColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
                    overallRingColor = "#eab308";
                    overallTextColor = "text-yellow-600";
                  }

                  const requiredLevel = maxRating;
                  const skillGap = requiredLevel - averageRating;
                  const gapPercentage = Math.round((skillGap / requiredLevel) * 100);

                  return (
                    <>
                      <div className="relative flex items-center justify-center mb-4 w-40 h-40 mx-auto">
                        <CircularProgressbar
                          value={percentage}
                          strokeWidth={10}
                          styles={buildStyles({
                            textSize: "16px",
                            pathColor: overallRingColor,
                            trailColor: "#f0f0f0",
                          })}
                        />

                        <div className="absolute flex flex-col items-center justify-center">
                          <span className={`text-3xl font-bold ${overallTextColor}`}>
                            {averageRating.toFixed(1)}
                          </span>
                          <span className="text-gray-500">/ {maxRating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center mb-2">
                        <span className={`text-lg font-semibold mr-2 ${percentage >= 80 ? "text-green-600" :
                          percentage >= 60 ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                          {percentage}%
                        </span>
                        <span className={`text-sm font-medium ${improvementValue >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                          {improvementSign}{improvement}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded border ${overallStatusColor}`}>
                          {overallStatus}
                        </span>
                      </div>

                      <div className="mb-2">
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                          Skill Gap: {skillGap.toFixed(1)} points ({gapPercentage}% below target)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-red-500 h-1 rounded-full"
                            style={{ width: `${Math.min(gapPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        Based on {userRatedSkills.length} skills
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-auto min-h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-auto">
          {/* Skill List */}
          <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 border border-gray-200 h-auto max-h-[500px] sm:max-h-[calc(100vh-12rem)] overflow-y-auto hide-scroll">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">🚨 Un-Rated Skills</h2>

            <div className="space-y-3 sm:space-y-4 h-auto overflow-y-auto hide-scroll">
              {unRatedSkills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12">
                  <div className="mb-4 sm:mb-6">
                    <img
                      src="/assets/image/rated.jpeg"
                      alt="All Skills Rated"
                      className="w-full max-w-[280px] sm:max-w-[400px] h-auto mx-auto object-cover shadow-lg border-2 sm:border-4 "
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-green-700 mb-2">All Skills Rated!</h3>
                  <p className="text-gray-600 text-center text-sm sm:text-base max-w-md px-4">
                    Great job! You've successfully rated all your skills.
                    Your development plan will now be more personalized and effective.
                  </p>
                </div>
              ) : (
                unRatedSkills.map(skill => (
                  <div
                    key={skill.jobrole_skill_id}
                    className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-white shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{skill.title || skill.skill}</h3>
                      <span className="text-xs sm:text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                        {skill.proficiency_level}
                      </span>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm mt-1">{skill.description}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                      <span className="px-1.5 sm:px-2 py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs rounded border border-blue-200">{skill.category}</span>
                      <span className="px-1.5 sm:px-2 py-1 bg-green-100 text-green-800 text-[10px] sm:text-xs rounded border border-green-200">{skill.sub_category}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-2">Job Role: {skill.jobrole}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Rated Skills */}
          <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 border border-gray-200 h-auto max-h-[500px] sm:max-h-[calc(100vh-12rem)] overflow-y-auto hide-scroll">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">📅 Rated Skills</h2>
              <button
                onClick={() => setShowRecommendations(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-xs sm:text-sm"
              >
                View Actions
              </button>
            </div>

            <div className="space-y-3 sm:space-y-5 h-auto overflow-y-auto hide-scroll">
              {userRatedSkills && userRatedSkills.length > 0 ? (
                userRatedSkills.map((ratedSkill: RatedSkill) => {
                  const totalLevels = ratedSkill.proficiency_level || 5;
                  const currentLevel = ratedSkill.skill_level
                    ? parseInt(ratedSkill.skill_level.replace("Level ", ""))
                    : 1;
                  const completionPercentage = Math.round((currentLevel / Number(totalLevels)) * 100);
                  const status =
                    completionPercentage >= 80
                      ? "On Track"
                      : completionPercentage >= 60
                        ? "Medium Risk"
                        : "At Risk";
                  const statusColor =
                    completionPercentage >= 80
                      ? "text-green-700"
                      : completionPercentage >= 60
                        ? "text-yellow-700"
                        : "text-red-700";
                  const created_at = ratedSkill.created_at
                    ? new Date(ratedSkill.created_at).toLocaleDateString()
                    : "N/A";

                  const selfRating = ratedSkill.skill_level !== undefined ?
                    parseFloat(ratedSkill.skill_level.replace("Level ", "")) || 0 : 0;
      const expected = parseExpectedLevel(ratedSkill.proficiency_level);

                  return (
                    <div
                      key={ratedSkill.id}
                      className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {ratedSkill.title || ratedSkill.skill || "Untitled Skill"}
                        </h3>
                        <span className="font-medium text-gray-500 flex items-center space-x-1 text-[10px] sm:text-xs">
                          Gap:{(() => {
                            const gap = selfRating - expected;
                            if (gap > 0) {
                              return (
                                <div className="flex items-center space-x-1 text-green-600 font-medium text-[10px] sm:text-xs">
                                  <span className="mdi mdi-trending-up text-xs sm:text-sm"></span>
                                  <span>+{gap.toFixed(1)}</span>
                                </div>
                              );
                            } else if (gap < 0) {
                              return (
                                <div className="flex items-center space-x-1 text-red-600 font-medium text-[10px] sm:text-xs">
                                  <span className="mdi mdi-alert-circle text-xs sm:text-sm"></span>
                                  <span>{gap.toFixed(1)}</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center space-x-1 text-green-600 font-medium text-xs">
                                  <span className="mdi mdi-check-circle text-sm"></span>
                                  <span>0.0</span>
                                </div>
                              );
                            }
                          })()}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {created_at}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600">
                        {ratedSkill.category || "General"} •{" "}
                        {ratedSkill.sub_category || "Uncategorized"}
                      </p>

                      <div className="w-full bg-gray-300 rounded h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 text-xs sm:text-sm font-semibold text-gray-700 border-b pb-1 mt-3 sm:mt-4">
                        <p>Self Rating</p>
                        <p>Expected</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2 text-xs items-center">
                        {/* Self Rating */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {renderCircles(selfRating, totalLevels)}
                          <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">{selfRating}/{totalLevels}</span>
                        </div>

                        {/* Expected Rating */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {renderCircles(expected, totalLevels)}
                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">{expected}/{totalLevels}</span>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full border px-1.5 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold transition-colors
                              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-red-50 text-red-700 border-red-200
                              hover:bg-primary/80 bg-success-light text-excellent border-excellent/20 ${statusColor}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      {/* KAAB Ratings Summary - Always Visible */}
                      <div className="mt-3 sm:mt-4 border-t pt-2 sm:pt-3">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                          <span className="mdi mdi-chart-bar mr-1"></span>
                          KAAB Ratings:
                        </h4>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {(() => {
                            const detailedRatings = ratedSkill.detailed_ratings || {
                              knowledge: ratedSkill.knowledge_ratings || {},
                              ability: ratedSkill.ability_ratings || {},
                              behaviour: ratedSkill.behaviour_ratings || {},
                              attitude: ratedSkill.attitude_ratings || {}
                            };

                            const attrArray = [
                              { title: "knowledge", icon: "mdi-book-open-page-variant", color: "blue" },
                              { title: "ability", icon: "mdi-lightbulb-on", color: "green" },
                              { title: "behaviour", icon: "mdi-account-group", color: "purple" },
                              { title: "attitude", icon: "mdi-emoticon-happy-outline", color: "orange" },
                            ];

                            const getScore = (ratings: Record<string, string>) => {
                              const yesCount = Object.values(ratings).filter(val => {
                                const v = String(val).toLowerCase();
                                return v === "yes" || v === "true" || v === "1";
                              }).length;
                              const totalCount = Object.keys(ratings).length;
                              return { yesCount, totalCount, percentage: totalCount > 0 ? Math.round((yesCount / totalCount) * 100) : 0 };
                            };

                            return attrArray.map((attr) => {
                              const ratings = detailedRatings[attr.title as keyof typeof detailedRatings] || {};
                              const { yesCount, totalCount, percentage } = getScore(ratings);

                              return (
                                <div key={attr.title} className={`bg-${attr.color}-50 border border-${attr.color}-200 rounded-lg p-1.5 sm:p-2`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] sm:text-xs font-medium capitalize flex items-center">
                                      <span className={`mdi ${attr.icon} mr-1 text-${attr.color}-600`}></span>
                                      {attr.title}:
                                    </span>
                                    <span className={`text-[10px] sm:text-xs font-bold text-${attr.color}-700`}>
                                      {yesCount}/{totalCount}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                                    <div
                                      className={`bg-${attr.color}-500 h-1 sm:h-1.5 rounded-full`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-right">{percentage}%</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Add detailed ratings expandable here */}
                      {renderDetailedRatings(ratedSkill)}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">No user rated skills found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations Modal */}
        {showRecommendations && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl p-4 sm:p-6 relative my-4 sm:my-0">
              <button
                onClick={() => setShowRecommendations(false)}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold"
              >
                &times;
              </button>

              <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-3 sm:mb-4 flex items-center">
                <span className="mdi mdi-lightbulb-on-outline mr-2 text-blue-500"></span>
                Development Recommendations
              </h2>

              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 rounded-lg border transition-all duration-300 transform cursor-pointer animate-slide-up border-error/30 bg-error-bg/50 hover:shadow-md hover:scale-[1.01]">
                  <h3 className="font-semibold text-blue-700 flex items-center text-sm sm:text-base">
                    <span className="mdi mdi-book-open-page-variant mr-2"></span>
                    Excel Advanced Training
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Improve reporting efficiency and data analysis capabilities
                  </p>
                  <span className="inline-block mt-2 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-red-100 text-red-700">
                    High
                  </span>
                  <button className="mt-3 w-full px-3 py-2 rounded bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 transition-colors">
                    <span className="mdi mdi-open-in-new mr-1"></span> Learn More
                  </button>
                </div>

                <div className="p-3 sm:p-4 rounded-lg border border-yellow-200 bg-yellow-50 shadow hover:shadow-lg transition-all duration-300">
                  <h3 className="font-semibold text-yellow-700 flex items-center text-sm sm:text-base">
                    <span className="mdi mdi-account-group mr-2"></span>
                    Leadership Workshop
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Build project management and team leadership skills
                  </p>
                  <span className="inline-block mt-2 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                    Medium
                  </span>
                  <button className="mt-3 w-full px-3 py-2 rounded bg-yellow-600 text-white text-xs sm:text-sm hover:bg-yellow-700 transition-colors">
                    <span className="mdi mdi-open-in-new mr-1"></span> Learn More
                  </button>
                </div>

                <div className="p-3 sm:p-4 rounded-lg border border-blue-200 bg-blue-50 shadow hover:shadow-lg transition-all duration-300">
                  <h3 className="font-semibold text-blue-700 flex items-center text-sm sm:text-base">
                    <span className="mdi mdi-presentation mr-2"></span>
                    Public Speaking Seminar
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Strengthen presentation impact and confidence
                  </p>
                  <span className="inline-block mt-2 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    Low
                  </span>
                  <button className="mt-3 w-full px-3 py-2 rounded bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 transition-colors">
                    <span className="mdi mdi-open-in-new mr-1"></span> Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
