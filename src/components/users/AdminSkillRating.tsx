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
  proficiency_level: string;
  skill: string;
  skill_id: number;
  sub_category: string;
  title: string;
}

interface RatedSkill {
  id: number;
  skill_level: string;
  title?: string;
  category?: string;
  sub_category?: string;
  created_at?: string;
  proficiency_level?: string;
  self_rating?: number;
  SkillLevels?: string[];
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

interface JobroleSkilladd1Props {
  skills: Skill[];
  userRatedSkills: RatedSkill[];
  parentSetUserRatedSkills: React.Dispatch<React.SetStateAction<RatedSkill[]>>;
  SkillLevels: any[];
  userJobroleSkills: any[];
}

// ✅ Tooltip Component for Chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-3 rounded shadow-md">
        <p className="font-semibold text-gray-800">{data.skill}</p>
        <p className="text-sm text-gray-600">
          Rating: {data.rating}/{data.max}
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

// Detailed Ratings Component
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
    const yesCount = Object.values(ratings).filter(val => val === "yes").length;
    const totalCount = Object.keys(ratings).length;
    return { yesCount, totalCount, percentage: totalCount > 0 ? Math.round((yesCount / totalCount) * 100) : 0 };
  };

  return (
    <div className="mt-4 border-t pt-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <span className="mdi mdi-chart-bar mr-1"></span>
        Detailed Ratings:
      </h4>

      {/* Expandable Detailed View */}
      <details className="group">
        <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800 list-none flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
          <span>View Individual Attribute Ratings</span>
          <span className="mdi mdi-chevron-down group-open:mdi-chevron-up transition-transform"></span>
        </summary>
        {/* Compact View */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {attrArray.map((attr) => {
            const ratings = detailedRatings[attr.title as keyof typeof detailedRatings] || {};
            const { yesCount, totalCount, percentage } = getScore(ratings);

            return (
              <div key={attr.title} className={`bg-${attr.color}-50 border border-${attr.color}-200 rounded-lg p-2`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium capitalize flex items-center">
                    <span className={`mdi ${attr.icon} mr-1 text-${attr.color}-600`}></span>
                    {attr.title}:
                  </span>
                  <span className={`text-xs font-bold text-${attr.color}-700`}>
                    {yesCount}/{totalCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`bg-${attr.color}-500 h-1.5 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">{percentage}%</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 space-y-3">
          {attrArray.map((attr) => {
            const ratings = detailedRatings[attr.title as keyof typeof detailedRatings] || {};
            const { yesCount, totalCount, percentage } = getScore(ratings);

            return (
              <div key={attr.title} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold capitalize flex items-center">
                    <span className={`mdi ${attr.icon} mr-2 text-${attr.color}-600`}></span>
                    {attr.title} ({yesCount}/{totalCount} - {percentage}%)
                  </h5>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(ratings).map(([attribute, value]) => (
                    <div key={attribute} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 flex-1 truncate mr-2">{attribute}</span>
                      <span className={`flex items-center ${value === "yes" ? "text-green-600" : "text-red-600"
                        }`}>
                        {value === "yes" ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">No</span>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
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
            data={chartData.map((entry) => ({
              ...entry,
              remaining: entry.max - entry.rating,
            }))}
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
            <YAxis
              type="number"
              allowDecimals={false}
              domain={[0, max]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rating" stackId="a" name="Current Rating">
              {chartData.map((_, index) => (
                <Cell key={`cell-rating-${index}`} fill="#3B82F6" />
              ))}
            </Bar>
            <Bar dataKey="remaining" stackId="a" name="Remaining">
              {chartData.map((entry, index) => {
                const color = entry.remaining === 0 ? "#3B82F6" : "#1E40AF";
                return <Cell key={`cell-remaining-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center pt-4 border-t">
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: "#3B82F6", width: 20, height: 20 }}></div>
          <span className="text-sm">Current Rating</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ backgroundColor: "#1E40AF", width: 20, height: 20 }}></div>
          <span className="text-sm">Highest Rating Possible</span>
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
  skills: initialSkills,
  userRatedSkills: initialUserRatedSkills,
  parentSetUserRatedSkills,
  SkillLevels,
  userJobroleSkills,
}: JobroleSkilladd1Props) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills || []);
  const [userRatedSkills, setUserRatedSkills] = useState<RatedSkill[]>(initialUserRatedSkills || []);

  // Compute un-rated skills
  const unRatedSkills = skills.filter(
    skill =>
      !userRatedSkills.some(
        rated =>
          rated.id === skill.skill_id || rated.title === skill.skill
      )
  );
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selfRating, setSelfRating] = useState<any>(0);
  const [expected, setEexpected] = useState<any>(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showFullscreenChart, setShowFullscreenChart] = useState(false);

  // Check if chart data is empty
  useEffect(() => {
    const hasChartData = userRatedSkills && userRatedSkills.length > 0;
    setShowEmptyState(!hasChartData);
  }, [userRatedSkills]);

  // Fetch rated skills with self_rating and proficiency_level
  // useEffect(() => {
  //   const fetchUserRatedSkills = async () => {
  //     try {
  //       const userData = localStorage.getItem("userData");
  //       if (!userData) return;

  //       const { APP_URL, token, user_id } = JSON.parse(userData);
  //       const response = await fetch(
  //         `${APP_URL}/user-rated-skills?user_id=${user_id}&token=${token}&include_proficiency=true`
  //       );

  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log("Fetched rated skills:", data.userRatedSkills);
  //         setUserRatedSkills(data.userRatedSkills || []);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user rated skills:", error);
  //     }
  //   };

  //   if (!initialUserRatedSkills || initialUserRatedSkills.length === 0) {
  //     fetchUserRatedSkills();
  //   }
  // }, [initialUserRatedSkills]);

  const calculateOverallSkillIndex = () => {
    if (!userRatedSkills || userRatedSkills.length === 0) return "0.0";
    const totalRating = userRatedSkills.reduce((sum: number, skill: RatedSkill) => {
      const rating = parseInt(skill.skill_level) || 0;
      return sum + rating;
    }, 0);
    return (totalRating / userRatedSkills.length).toFixed(1);
  };

  const overallSkillIndex = calculateOverallSkillIndex();
  const percentage = Math.round((parseFloat(overallSkillIndex) / 5) * 100);
  const improvement = "+0.3";

  const totalLevels = SkillLevels.length;

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

  const attrArray = [
    { title: "knowledge", icon: "mdi-book-open-page-variant" },
    { title: "ability", icon: "mdi-lightbulb-on" },
    { title: "behaviour", icon: "mdi-account-group" },
    { title: "attitude", icon: "mdi-emoticon-happy-outline" },
  ];

  // Prepare chart data
  const fullChartData = userRatedSkills.map((s: RatedSkill) => {
    const rating = parseInt(s.skill_level) || 0;
    const max = SkillLevels.length;

    const remaining = max - rating;
    const level =
      s.proficiency_level ||
      (rating >= 6
        ? "Advanced"
        : rating >= 4
          ? "Intermediate"
          : rating >= 2
            ? "Beginner"
            : "Novice");

    return {
      skill: s.title || "Unknown",
      rating,
      remaining,
      max,
      level,
      proficiency_level: s.proficiency_level,
    };
  });

  // Limited chart data for main view (first 6 items)
  const limitedChartData = fullChartData.slice(0, 6);

  if (showEmptyState) {
    return (
      <main className="p-6">
        <EmptyChartState />
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      {/* Fullscreen Chart Modal */}
      {showFullscreenChart && (
        <FullscreenChart
          chartData={fullChartData}
          SkillLevels={SkillLevels}
          onClose={() => setShowFullscreenChart(false)}
        />
      )}

      {/* 🔥 Chart Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
        <div className={showEmptyState ? "filter blur-sm pointer-events-none" : ""}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mdi mdi-chart-line text-green-600 mr-2"></span>
              Skill Ratings
              {fullChartData.length > 6 && (
                <span className="text-sm text-gray-500 ml-2">
                  (Showing {Math.min(6, fullChartData.length)} of {fullChartData.length})
                </span>
              )}
            </h2>

            {fullChartData.length > 6 && (
              <button
                onClick={() => setShowFullscreenChart(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <span className="mdi mdi-fullscreen"></span>
                View Full Chart
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart */}
            <div className="lg:col-span-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={limitedChartData.map((entry) => ({
                    ...entry,
                    remaining: entry.max - entry.rating,
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis type="number" allowDecimals={false} domain={[0, totalLevels]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rating" stackId="a" name="Current Rating">
                    {limitedChartData.map((_, index) => (
                      <Cell key={`cell-rating-${index}`} fill="#3B82F6" />
                    ))}
                  </Bar>
                  <Bar dataKey="remaining" stackId="a" name="Remaining">
                    {limitedChartData.map((entry, index) => {
                      const color = entry.remaining === 0 ? "#3B82F6" : "#1E40AF";
                      return <Cell key={`cell-remaining-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: "#3B82F6", width: 20, height: 20 }}></div>
                  <span className="text-sm">Current Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: "#1E40AF", width: 20, height: 20 }}></div>
                  <span className="text-sm">Highest Rating Possible</span>
                </div>
              </div>
            </div>

            {/* Overall Skill Index */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <h3 className="text-md font-semibold text-gray-700 mb-4">
                  Overall Skill Index
                </h3>

                {(() => {
                  const totalRating = userRatedSkills.reduce((sum: number, skill: RatedSkill) => {
                    const rating = parseInt(skill.skill_level) || 0;
                    return sum + rating;
                  }, 0);

                  const averageRating = userRatedSkills.length > 0 ? totalRating / userRatedSkills.length : 0;
                  const maxRating = SkillLevels.length;
                  const percentage = Math.round((averageRating / maxRating) * 100);

                  const improvement = userRatedSkills.length > 0 ?
                    (averageRating - (maxRating / 2)).toFixed(1) : "0.0";
                  const improvementValue = parseFloat(improvement);
                  const improvementSign = improvementValue >= 0 ? "+" : "";

                  const proficiencyCounts = {
                    advanced: userRatedSkills.filter(skill => {
                      const rating = parseInt(skill.skill_level) || 0;
                      return rating >= 5;
                    }).length,
                    intermediate: userRatedSkills.filter(skill => {
                      const rating = parseInt(skill.skill_level) || 0;
                      return rating >= 3 && rating < 5;
                    }).length,
                    beginner: userRatedSkills.filter(skill => {
                      const rating = parseInt(skill.skill_level) || 0;
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
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded border ${overallStatusColor}`}>
                          {overallStatus}
                        </span>
                      </div>

                      <div className="mb-2">
                        <div className="text-xs text-gray-600 mb-1">
                          Skill Gap: {skillGap.toFixed(1)} points ({gapPercentage}% below target)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-red-500 h-1 rounded-full"
                            style={{ width: `${Math.min(gapPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
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
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-12rem)] ">
          {/* Skill List */}
          <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 h-[calc(100vh-12rem)] overflow-y-auto hide-scroll">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">🚨 Un-Rated Skills</h2>

            <div className="space-y-4 h-[calc(100%-3rem)] overflow-y-auto hide-scroll">
              {unRatedSkills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="mb-6">
                    <img
                      src="/assets/image/rated.jpeg"
                      alt="All Skills Rated"
                      className="w-110 h-70 mx-auto full object-cover shadow-lg border-4 "
                    />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">All Skills Rated!</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Great job! You've successfully rated all your skills.
                    Your development plan will now be more personalized and effective.
                  </p>
                </div>
              ) : (
                unRatedSkills.map(skill => (
                  <div
                    key={skill.jobrole_skill_id}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">{skill.title || skill.skill}</h3>
                      <span className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                        {skill.proficiency_level}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">{skill.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border border-blue-200">{skill.category}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">{skill.sub_category}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Job Role: {skill.jobrole}</p>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => {
                          setSelectedSkill(skill);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View More
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Rated Skills */}
          <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 h-[calc(100vh-12rem)] overflow-y-auto hide-scroll">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">📅 Rated Skills</h2>
              <button
                onClick={() => setShowRecommendations(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                View Actions
              </button>
            </div>

            <div className="space-y-5 h-[calc(100%-3rem)] overflow-y-auto hide-scroll">
              {userRatedSkills && userRatedSkills.length > 0 ? (
                userRatedSkills.map((ratedSkill: RatedSkill) => {
                  const totalLevels = SkillLevels.length;
                  const currentLevel = ratedSkill.skill_level
                    ? parseInt(ratedSkill.skill_level)
                    : 1;
                  const completionPercentage = Math.round((currentLevel / totalLevels) * 100);
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
                    parseFloat(ratedSkill.skill_level) || 0 : 0;
                  const expected = ratedSkill.proficiency_level !== undefined ?
                    parseFloat(ratedSkill.proficiency_level) || 0 : 0;

                  return (
                    <div
                      key={ratedSkill.id}
                      className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800 text-base">
                          {ratedSkill.title || "Untitled Skill"}
                        </h3>
                        <span className="font-medium text-gray-500 flex items-center space-x-1 text-xs">
                          Gap:{(() => {
                            const gap = selfRating - expected;
                            if (gap > 0) {
                              return (
                                <div className="flex items-center space-x-1 text-green-600 font-medium text-xs">
                                  <span className="mdi mdi-trending-up text-sm"></span>
                                  <span>+{gap.toFixed(1)}</span>
                                </div>
                              );
                            } else if (gap < 0) {
                              return (
                                <div className="flex items-center space-x-1 text-red-600 font-medium text-xs">
                                  <span className="mdi mdi-alert-circle text-sm"></span>
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
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {created_at}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        {ratedSkill.category || "General"} •{" "}
                        {ratedSkill.sub_category || "Uncategorized"}
                      </p>

                      <div className="w-full bg-gray-300 rounded h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 text-sm font-semibold text-gray-700 border-b pb-1 mt-4">
                        <p>Self Rating</p>
                        <p>Expected</p>
                      </div>

                  <div className="grid grid-cols-2 gap-4 mt-2 text-xs items-center">
  {/* Self Rating */}
  <div className="flex items-center space-x-2">
    {renderCircles(selfRating, SkillLevels.length)}
    <span className="ml-2 text-sm font-medium">{selfRating}/{SkillLevels.length}</span>
  </div>

  {/* Expected Rating */}
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center space-x-2">
      {renderCircles(expected, SkillLevels.length)}
      <span className="ml-2 text-sm font-medium">{expected}/{SkillLevels.length}</span>
    </div>

    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors 
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-red-50 text-red-700 border-red-200
        hover:bg-primary/80 bg-success-light text-excellent border-excellent/20 ${statusColor}`}
    >
      {status}
    </span>
  </div>
</div>

                      {/* Add detailed ratings here */}
                      {renderDetailedRatings(ratedSkill)}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No user rated skills found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations Modal */}
        {showRecommendations && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl p-6 relative">
              <button
                onClick={() => setShowRecommendations(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>

              <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                <span className="mdi mdi-lightbulb-on-outline mr-2 text-blue-500"></span>
                Development Recommendations
              </h2>

              <div className="flex flex-col gap-6">
                <div className="p-4 rounded-lg border transition-all duration-300 transform cursor-pointer animate-slide-up border-error/30 bg-error-bg/50 hover:shadow-md hover:scale-[1.01]">
                  <h3 className="font-semibold text-blue-700 flex items-center">
                    <span className="mdi mdi-book-open-page-variant mr-2"></span>
                    Excel Advanced Training
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Improve reporting efficiency and data analysis capabilities
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    High
                  </span>
                  <button className="mt-3 w-full px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
                    <span className="mdi mdi-open-in-new mr-1"></span> Learn More
                  </button>
                </div>

                <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 shadow hover:shadow-lg transition-all duration-300">
                  <h3 className="font-semibold text-yellow-700 flex items-center">
                    <span className="mdi mdi-account-group mr-2"></span>
                    Leadership Workshop
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Build project management and team leadership skills
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                    Medium
                  </span>
                  <button className="mt-3 w-full px-3 py-2 rounded bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition-colors">
                    <span className="mdi mdi-open-in-new mr-1"></span> Learn More
                  </button>
                </div>

                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 shadow hover:shadow-lg transition-all duration-300">
                  <h3 className="font-semibold text-blue-700 flex items-center">
                    <span className="mdi mdi-presentation mr-2"></span>
                    Public Speaking Seminar
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Strengthen presentation impact and confidence
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    Low
                  </span>
                  <button className="mt-3 w-full px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
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