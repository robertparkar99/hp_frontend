"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    rated: number;
    expected: number;
    gap: number;
  }>;
  totalSkills: number;
}

// Circular Progress Component for Overall Skill Index
const CircularProgress: React.FC<{ value: number; max?: number; size?: number | string }> = ({ 
  value, 
  max = 100, 
  size = 100 
}) => {
  // Handle responsive size (e.g., "sm:size-20 size-[80px]")
  const getSize = () => {
    if (typeof size === 'number') return size;
    return 100; // Default fallback
  };
  const sizeNum = getSize();
  const radius = (sizeNum - 12) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value, 100);
  const strokeDashoffset = circumference - (progress / max) * circumference;
  
  const getColor = () => {
    if (progress >= 80) return '#22c55e'; // green
    if (progress >= 60) return '#3b82f6'; // blue
    if (progress >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="6"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color: getColor() }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Custom Tooltip for Bar Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 rounded-lg shadow-lg border border-slate-200">
        <p className="font-medium text-slate-800 text-xs mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-medium text-slate-700">{entry.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
    if (performanceLabel === 'Excellent') return 'bg-green-100 text-green-700';
    if (performanceLabel === 'Good') return 'bg-blue-100 text-blue-700';
    if (performanceLabel === 'Average') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusBadge = () => {
    if (skillGapCategory === 'Strong') {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent', bar: 'bg-green-500' };
    }
    if (skillGapCategory === 'Moderate') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Needs Improvement', bar: 'bg-yellow-500' };
    }
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Requires Attention', bar: 'bg-red-500' };
  };

  const status = getStatusBadge();

  // Prepare chart data
  const chartData = topPrioritySkills.length > 0 
    ? topPrioritySkills.map(skill => ({
        name: skill.name.length > 10 ? skill.name.substring(0, 10) + '..' : skill.name,
        'Rated': skill.rated,
        'Expected': skill.expected,
        fullName: skill.name,
      }))
    : [
        { name: 'Skills', 'Rated': avgUserRating, 'Expected': avgExpectedProficiency }
      ];

  // Calculate gap direction
  const gapDirection = skillGap > 0 ? 'below' : 'above';
  const absGap = Math.abs(skillGap);

  return (
    <div className="mt-3 p-3 sm:p-4 md:p-5 bg-white rounded-xl border border-slate-200 shadow-sm max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Skill Gap Report</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPerformanceBgColor()}`}>
          {performanceLabel}
        </span>
      </div>

      {/* Main Grid Layout - Two Cards Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        
        {/* Card 1: Overall Skill Index */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-xs font-medium text-slate-500 mb-2">Overall Skill Index</div>
          
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="w-[80px] sm:w-[90px] md:w-[100px] h-[80px] sm:h-[90px] md:h-[100px]">
              <CircularProgress value={overallSkillIndex} size={80} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-white rounded border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase">Avg Rated</p>
              <p className="text-base font-bold text-slate-700">{avgUserRating.toFixed(1)}</p>
            </div>
            <div className="text-center p-2 bg-white rounded border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase">Avg Expected</p>
              <p className="text-base font-bold text-slate-700">{avgExpectedProficiency.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Skill Gap Analysis */}
        <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-500">Skill Gap</span>
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>

          {/* Gap Percentage - Large Display */}
          <div className="text-center py-1 sm:py-2 mb-2">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
              {Math.abs(skillGapPercentage)}
            </span>
            <span className="text-sm sm:text-base text-slate-400 ml-1">%</span>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              {gapDirection === 'below' ? 'Below' : 'Above'} Target
            </p>
          </div>

          {/* Gap Indicator Bar */}
          <div className="mb-2">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                style={{ width: `${Math.max(100 - Math.abs(skillGapPercentage), 0)}%` }}
              />
            </div>
          </div>

          {/* Gap Details Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-1.5 bg-white rounded border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase">Gap Points</p>
              <p className={`text-sm font-bold ${skillGap > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {gapDirection === 'below' ? '-' : '+'}{absGap.toFixed(1)}
              </p>
            </div>
            <div className="text-center p-1.5 bg-white rounded border border-slate-100">
              <p className="text-[9px] text-slate-400 uppercase">Total Skills</p>
              <p className="text-sm font-bold text-slate-700">{totalSkills}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart - Rated vs Expected */}
      <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-100 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-2">
          <span className="text-xs sm:text-sm font-medium text-slate-600">Rated vs Expected Skills</span>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-slate-500">Rated</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-500">Expected</span>
            </div>
          </div>
        </div>

        {topPrioritySkills.length > 0 ? (
          <div className="h-32 sm:h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  dy={5}
                />
                <YAxis 
                  domain={[0, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  ticks={[0, 1, 2, 3, 4, 5]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="Rated" radius={[3, 3, 0, 0]} fill="#6366f1" />
                <Bar dataKey="Expected" radius={[3, 3, 0, 0]} fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <p className="text-green-600 font-medium text-sm">🎉 All skills meet expectations!</p>
          </div>
        )}
      </div>

      {/* Priority Skills List */}
      {topPrioritySkills.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Top Improvement Areas</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
              {topPrioritySkills.length}
            </span>
          </div>
          
          <div className="space-y-1.5">
            {topPrioritySkills.map((skill, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-white rounded border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                    skill.gap > 2 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">{skill.name}</p>
                    <p className="text-[9px] text-slate-400">
                      {skill.rated.toFixed(1)} / {skill.expected.toFixed(1)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${
                  skill.gap > 2 ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  -{skill.gap.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
        <span className="text-[10px] text-slate-400">Based on {totalSkills} skills</span>
      </div>
    </div>
  );
};

export default SkillGapReport;
