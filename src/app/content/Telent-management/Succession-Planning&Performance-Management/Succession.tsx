"use client";

import React, { useState, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { Calendar, Users, UserCheck, MessageSquare, FileText, User } from "lucide-react";

// ✅ Loader Component
const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// ✅ Dynamic imports with loader
const DynamicReviews = dynamic(() => import("./components/Reviews"), {
  ssr: false,
  loading: Loader,
});

const DynamicAppraisals = dynamic(() => import("./components/Appraisals"), {
  ssr: false,
  loading: Loader,
});

const DynamicSuccession = dynamic(() => import("./components/Succession"), {
  ssr: false,
  loading: Loader,
});

const DynamicReports = dynamic(() => import("./components/Reports"), {
  ssr: false,
  loading: Loader,
});

const DynamicProfile = dynamic(() => import("./components/Profile"), {
  ssr: false,
  loading: Loader,
});

// Import components for dashboard content
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// StatCard Component
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, changeType, icon }: StatCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = () => {
    if (changeType === "positive") {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (changeType === "negative") {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-background rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            <div className="flex items-center gap-1">
              {getChangeIcon()}
              <span className={`text-sm ${getChangeColor()}`}>
                {change}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Dashboard Content Component
const DashboardContent = () => {
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'employee';
    setUserRole(role);
    
    // Set demo names based on role
    const names = {
      'hr-manager': 'Sarah Johnson',
      'line-manager': 'Michael Chen', 
      'employee': 'Alex Rodriguez'
    };
    setUserName(names[role as keyof typeof names] || 'User');
  }, []);

  const getKPIs = () => {
    switch (userRole) {
      case 'hr-manager':
        return [
          { title: "Overall Performance Score", value: "8.2/10", change: "+0.3 from last quarter", changeType: "positive" as const, icon: <TrendingUp className="h-4 w-4" /> },
          { title: "Reviews Completed", value: "87%", change: "156 of 180 completed", changeType: "positive" as const, icon: <CheckCircle className="h-4 w-4" /> },
          { title: "High Performers Identified", value: "23", change: "12% of workforce", changeType: "positive" as const, icon: <Star className="h-4 w-4" /> },
          { title: "Pending Approvals", value: "12", change: "Requires attention", changeType: "negative" as const, icon: <AlertCircle className="h-4 w-4" /> }
        ];
      case 'line-manager':
        return [
          { title: "Team Performance", value: "8.5/10", change: "+0.5 from last quarter", changeType: "positive" as const, icon: <TrendingUp className="h-4 w-4" /> },
          { title: "Team Size", value: "8", change: "Active team members", changeType: "neutral" as const, icon: <Users className="h-4 w-4" /> },
          { title: "Reviews Pending", value: "3", change: "Due this week", changeType: "negative" as const, icon: <AlertCircle className="h-4 w-4" /> },
          { title: "Succession Ready", value: "2", change: "Team members ready", changeType: "positive" as const, icon: <Star className="h-4 w-4" /> }
        ];
      default:
        return [
          { title: "Latest Performance", value: "8.7/10", change: "+0.2 from last review", changeType: "positive" as const, icon: <TrendingUp className="h-4 w-4" /> },
          { title: "Goals Completed", value: "85%", change: "17 of 20 goals", changeType: "positive" as const, icon: <CheckCircle className="h-4 w-4" /> },
          { title: "Salary Increase", value: "12%", change: "Effective next month", changeType: "positive" as const, icon: <TrendingUp className="h-4 w-4" /> },
          { title: "Career Progress", value: "75%", change: "Path to Senior", changeType: "positive" as const, icon: <Star className="h-4 w-4" /> }
        ];
    }
  };

  const getDashboardContent = () => {
    switch (userRole) {
      case 'hr-manager':
        return (
          <div className="space-y-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Succession Pipeline Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Critical Roles Covered</span>
                    <span className="text-sm text-gray-500">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">45</div>
                      <div className="text-sm text-gray-500">Ready Now</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">32</div>
                      <div className="text-sm text-gray-500">Ready 1-2 Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">15</div>
                      <div className="text-sm text-gray-500">Not Ready</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700">Performance review completed - John Doe</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">2 hours ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-700">Promotion recommendation pending approval</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">4 hours ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700">New succession candidate identified</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">1 day ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'line-manager':
        return (
          <div className="space-y-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Team Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'].map((name, index) => (
                    <div key={name} className="p-4 rounded-lg border border-gray-200 bg-white">
                      <div className="text-sm font-medium text-gray-900">{name}</div>
                      <div className="text-lg font-bold text-blue-600">{[8.9, 7.8, 9.1, 8.4][index]}/10</div>
                      <Badge variant={index % 2 === 0 ? "secondary" : "outline"} className="text-xs mt-1">
                        {index % 2 === 0 ? "Reviewed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="secondary" className="h-auto p-4 flex flex-col gap-2">
                    <CheckCircle className="h-6 w-6" />
                    <span>Complete Reviews</span>
                    <span className="text-xs text-gray-500">3 pending</span>
                  </Button>
                  <Button className="h-auto p-4 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Star className="h-6 w-6" />
                    <span>Nominate for Succession</span>
                    <span className="text-xs text-blue-100">2 candidates</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span>Team Analytics</span>
                    <span className="text-xs text-gray-500">View detailed</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Your Career Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Progress to Senior Developer</span>
                    <span className="text-sm text-gray-500">75%</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="text-sm font-medium text-green-700">Completed Skills</div>
                      <div className="text-xs text-gray-600 mt-1">React, TypeScript, Node.js</div>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="text-sm font-medium text-yellow-700">Skills in Progress</div>
                      <div className="text-xs text-gray-600 mt-1">System Design, Leadership</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Badge className="bg-green-100 text-green-800">Promotion</Badge>
                    <span className="text-sm text-gray-700">Promoted to Senior Developer</span>
                    <span className="text-xs text-gray-500 ml-auto">Next month</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Badge className="bg-blue-100 text-blue-800">Review</Badge>
                    <span className="text-sm text-gray-700">Excellent performance rating (8.7/10)</span>
                    <span className="text-xs text-gray-500 ml-auto">Last week</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Badge className="bg-purple-100 text-purple-800">Goal</Badge>
                    <span className="text-sm text-gray-700">Q3 project objectives completed</span>
                    <span className="text-xs text-gray-500 ml-auto">2 weeks ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName.split(' ')[0]}!</h1>
        <p className="text-gray-600 text-sm">
          Here's what's happening with your talent management today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {getKPIs().map((kpi, index) => (
          <StatCard key={index} {...kpi} />
        ))}
      </div>

      {getDashboardContent()}
    </div>
  );
};

export default function TalentManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openPage, setOpenPage] = useState<string | null>(null);

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: UserCheck },
    { key: "reviews", label: "Reviews", icon: Calendar },
    { key: "appraisals", label: "Appraisals", icon: FileText },
    { key: "succession", label: "Succession", icon: Users },
    { key: "reports", label: "Reports", icon: MessageSquare },
    { key: "profile", label: "Profile", icon: User },
  ];

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setOpenPage(null);
  };

  return (
    <div className="space-y-6 p-4 bg-background rounded-xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Talent Management Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening with your talent management today.
        </p>
      </div>

      {/* Navigation Menu Toggle */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4">
        <div className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key && !openPage;
            
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors whitespace-nowrap ${
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
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "reviews" && <DynamicReviews />}
        {activeTab === "appraisals" && <DynamicAppraisals />}
        {activeTab === "succession" && <DynamicSuccession />}
        {activeTab === "reports" && <DynamicReports />}
        {activeTab === "profile" && <DynamicProfile />}
      </Suspense>
    </div>
  );
}