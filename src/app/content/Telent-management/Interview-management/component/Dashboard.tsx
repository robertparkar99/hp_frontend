"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Calendar, Users, UserCheck, MessageSquare } from "lucide-react";

// ✅ Loader Component
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// ✅ Dynamic imports with loader
const DynamicCandidates = dynamic(() => import("./Candidates"), {
  ssr: false,
  loading: Loader,
});

const DynamicFeedback = dynamic(() => import("./Feedback"), {
  ssr: false,
  loading: Loader,
});

const DynamicInterviewPanels = dynamic(() => import("./InterviewPanels"), {
  ssr: false,
  loading: Loader,
});

const DynamicScheduleInterview = dynamic(() => import("./ScheduleInterview"), {
  ssr: false,
  loading: Loader,
});

// Import the existing components
import { DashboardStats } from "./DashboardStats";
import { UpcomingInterviews } from "./UpcomingInterviews";
import { CandidatePipeline } from "./CandidatePipeline";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openPage, setOpenPage] = useState<string | null>(null);

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: UserCheck },
    { key: "schedule", label: "Schedule Interview", icon: Calendar },
    { key: "candidates", label: "Candidates", icon: Users },
    { key: "interview-panel", label: "Interview Panel", icon: UserCheck },
    { key: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setOpenPage(null);
  };

  return (
    <div className="space-y-6 p-4 bg-background rounded-xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Interview Management Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening with your interviews today.
        </p>
      </div>

      {/* Navigation Menu Toggle */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4">
        <div className="flex space-x-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key && !openPage;
            
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<Loader />}>
        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <DashboardStats />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingInterviews />
              <CandidatePipeline />
            </div>
          </>
        )}
        {activeTab === "schedule" && <DynamicScheduleInterview />}
        {activeTab === "candidates" && <DynamicCandidates />}
        {activeTab === "interview-panel" && <DynamicInterviewPanels />}
        {activeTab === "feedback" && <DynamicFeedback />}
      </Suspense>
    </div>
  );
}