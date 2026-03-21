"use client";

import React from 'react';

interface SkillGapReportProps {
  avgUserRating: number;
  avgExpectedProficiency: number;
  overallSkillIndex: number;
  skillGap: number;
  skillGapPercentage: number;
  skillGapCategory: string;
  skillGapEmoji: string;
  performanceLabel: string;
  topPrioritySkills: Array<{
    name: string;
    gap: number;
  }>;
  totalSkills: number;
}

const SkillGapReport: React.FC<SkillGapReportProps> = ({
  avgUserRating,
  avgExpectedProficiency,
  overallSkillIndex,
  skillGap,
  skillGapPercentage,
  skillGapCategory,
  skillGapEmoji,
  performanceLabel,
  topPrioritySkills,
  totalSkills,
}) => {
  // Determine color based on performance
  const getPerformanceColor = () => {
    if (performanceLabel === 'Excellent') return 'text-green-600';
    if (performanceLabel === 'Good') return 'text-blue-600';
    if (performanceLabel === 'Average') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBgColor = () => {
    if (performanceLabel === 'Excellent') return 'bg-green-50';
    if (performanceLabel === 'Good') return 'bg-blue-50';
    if (performanceLabel === 'Average') return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getCategoryColor = () => {
    if (skillGapCategory === 'Strong') return 'text-green-700';
    if (skillGapCategory === 'Moderate') return 'text-yellow-700';
    return 'text-red-700';
  };

  const getCategoryBgColor = () => {
    if (skillGapCategory === 'Strong') return 'bg-green-100';
    if (skillGapCategory === 'Moderate') return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800">Skill Gap Report</h3>
      </div>

      {/* Section 1: Overall Skill Index */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Overall Skill Index</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPerformanceBgColor()} ${getPerformanceColor()}`}>
            {performanceLabel}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">
            {avgUserRating.toFixed(1)}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-xl font-semibold text-slate-600">
            {avgExpectedProficiency.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500 ml-2">
            ({Math.round(overallSkillIndex)}%)
          </span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(overallSkillIndex, 100)}%` }}
          />
        </div>
      </div>

      {/* Section 2: Skill Gap */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
        <span className="text-sm font-medium text-slate-600 block mb-2">Skill Gap Analysis</span>
        
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-semibold text-slate-800">
              {skillGap.toFixed(1)} points
            </span>
            <span className="text-sm text-slate-500 ml-2">
              ({skillGapPercentage}% below target)
            </span>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getCategoryBgColor()} ${getCategoryColor()}`}>
            {skillGapCategory} {skillGapEmoji}
          </span>
        </div>
        
        {/* Gap Bar */}
        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              skillGapCategory === 'Strong' ? 'bg-green-500' : 
              skillGapCategory === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(100 - skillGapPercentage, 0)}%` }}
          />
        </div>
      </div>

      {/* Section 3: Priority Skills */}
      <div className="p-3 bg-white rounded-lg border border-slate-200">
        <span className="text-sm font-medium text-slate-600 block mb-3">Top Improvement Areas</span>
        
        {topPrioritySkills.length > 0 ? (
          <div className="space-y-2">
            {topPrioritySkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                  Gap: {skill.gap.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
            <span className="text-green-700 font-medium">🎉 All skills meet or exceed expectations!</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-200 text-center">
        <span className="text-xs text-slate-400">Based on: {totalSkills} skills</span>
      </div>
    </div>
  );
};

export default SkillGapReport;
