"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import CompetencyDashboard from "./stakeholder-lenses";
import AlignmentWidget from "./Alignment-Standardization";
import CombinedDashboard from "./Competency-HealthRadar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Calendar, Target, ChevronDown, TrendingDown, Minus, Filter, Briefcase } from "lucide-react";
import { initializeTour, isTourCompleted, resetTour } from "./CompetencyDashboardTour";

// UI Components
const Badge = ({ className, variant, children, ...props }: any) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`} {...props}>
    {children}
  </span>
);

const Button = ({ className, variant, children, ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Select = ({ value, onValueChange, children }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  
  const handleSelect = (val: string) => {
    setSelectedValue(val);
    onValueChange(val);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValue === "all" ? "All Categories" : selectedValue}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
          <div className="p-1">
            {children.map((child: any) =>
              React.cloneElement(child, {
                onClick: () => handleSelect(child.props.value)
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectItem = ({ children, ...props }: any) => (
  <div className="relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground" {...props}>
    {children}
  </div>
);

// Navigation tabs
const NAVIGATION_TABS = [
  { id: "balance-equity", name: "Role–Task–Skill Balance & Equity" },
  { id: "health-completeness", name: "Competency Health & Completeness" },
  { id: "alignment-standardization", name: "Alignment & Standardization" },
  { id: "stakeholder-lenses", name: "Stakeholder-Specific Lenses" },
];

const ROLES = [
  { id: "operations-manager", name: "Operations Manager", department: "operations", x: 50, y: 50, size: 1.3 },
  { id: "financial-analyst", name: "Financial Analyst", department: "finance", x: 65, y: 30, size: 1.0 },
  { id: "business-analyst", name: "Business Analyst", department: "product", x: 35, y: 35, size: 1.0 },
  { id: "finance-manager", name: "Finance Manager", department: "finance", x: 70, y: 45, size: 1.1 },
  { id: "hr-coordinator", name: "HR Coordinator", department: "hr", x: 75, y: 65, size: 0.9 },
  { id: "hr-manager", name: "HR Manager", department: "hr", x: 60, y: 70, size: 1.1 },
  { id: "recruiter", name: "Recruiter", department: "hr", x: 80, y: 75, size: 0.8 },
  { id: "sales-manager", name: "Sales Manager", department: "sales", x: 30, y: 65, size: 1.1 },
  { id: "product-engineering-manager", name: "Product Engineering Manager", department: "engineering", x: 20, y: 45, size: 1.2 },
  { id: "design-lead", name: "Design Lead", department: "design", x: 25, y: 25, size: 1.0 },
  { id: "product-manager", name: "Product Manager", department: "product", x: 40, y: 40, size: 1.1 },
  { id: "marketing-manager", name: "Marketing Manager", department: "marketing", x: 35, y: 75, size: 1.0 },
  { id: "product-owner", name: "Product Owner", department: "product", x: 45, y: 30, size: 1.0 },
  { id: "ux-designer", name: "UX Designer", department: "design", x: 30, y: 20, size: 0.9 },
  { id: "senior-software-engineer", name: "Senior Software Engineer", department: "engineering", x: 15, y: 35, size: 1.1 },
  { id: "software-engineer", name: "Software Engineer", department: "engineering", x: 10, y: 50, size: 1.0 },
  { id: "server-developer", name: "Server Developer", department: "engineering", x: 5, y: 40, size: 0.9 },
  { id: "devops-engineer", name: "DevOps Engineer", department: "engineering", x: 8, y: 60, size: 0.9 },
];

const CONNECTIONS = [
  { source: "operations-manager", target: "financial-analyst", strength: 0.7 },
  { source: "operations-manager", target: "business-analyst", strength: 0.8 },
  { source: "operations-manager", target: "finance-manager", strength: 0.75 },
  { source: "operations-manager", target: "hr-coordinator", strength: 0.6 },
  { source: "operations-manager", target: "hr-manager", strength: 0.8 },
  { source: "operations-manager", target: "recruiter", strength: 0.5 },
  { source: "operations-manager", target: "sales-manager", strength: 0.7 },
  { source: "operations-manager", target: "product-engineering-manager", strength: 0.8 },
  { source: "operations-manager", target: "design-lead", strength: 0.6 },
  { source: "operations-manager", target: "product-manager", strength: 0.9 },
  { source: "operations-manager", target: "marketing-manager", strength: 0.7 },
  { source: "operations-manager", target: "product-owner", strength: 0.8 },
  { source: "operations-manager", target: "ux-designer", strength: 0.5 },
  { source: "operations-manager", target: "senior-software-engineer", strength: 0.6 },
  { source: "operations-manager", target: "software-engineer", strength: 0.5 },
  { source: "operations-manager", target: "server-developer", strength: 0.4 },
  { source: "operations-manager", target: "devops-engineer", strength: 0.5 },
];

const DEPARTMENT_COLORS: Record<string, string> = {
  hr: "#EF4444",
  finance: "#10B981",
  sales: "#3B82F6",
  product: "#8B5CF6",
  engineering: "#F59E0B",
  marketing: "#EC4899",
  operations: "#64748B",
  design: "#06B6D4",
};

const DEPARTMENTS = [
  { id: "hr", name: "HR", color: DEPARTMENT_COLORS.hr },
  { id: "finance", name: "Finance", color: DEPARTMENT_COLORS.finance },
  { id: "sales", name: "Sales", color: DEPARTMENT_COLORS.sales },
  { id: "product", name: "Product", color: DEPARTMENT_COLORS.product },
  { id: "engineering", name: "Engineering", color: DEPARTMENT_COLORS.engineering },
  { id: "marketing", name: "Marketing", color: DEPARTMENT_COLORS.marketing },
  { id: "operations", name: "Operations", color: DEPARTMENT_COLORS.operations },
  { id: "design", name: "Design", color: DEPARTMENT_COLORS.design },
];

const KPIS = [
  { title: "Total Roles", value: "247", subtitle: "Across 12 departments", delta: "+4% vs last month" },
  { title: "Mapped Tasks", value: "1,834", subtitle: "87% completion rate", delta: "+3% vs last month" },
  { title: "Skill Coverage", value: "92%", subtitle: "2.1k skills mapped", delta: "+2% vs last month" },
  { title: "Risk Score", value: "68", subtitle: "Medium risk level", delta: "-1% vs last month" },
  { title: "Future Ready", value: "74%", subtitle: "AI adaptation prepared", delta: "+5% vs last quarter" },
  { title: "Active Reviews", value: "23", subtitle: "Pending approvals" },
];

const HEATMAP = [
  { label: "Senior Developer", value: 92, color: "bg-red-500", tasks: 45 },
  { label: "DevOps Engineer", value: 84, color: "bg-red-600", tasks: 41 },
  { label: "Product Manager", value: 78, color: "bg-amber-500", tasks: 32 },
  { label: "UX Designer", value: 71, color: "bg-amber-400", tasks: 28 },
  { label: "Data Analyst", value: 62, color: "bg-amber-400", tasks: 25 },
  { label: "Marketing Lead", value: 68, color: "bg-amber-400", tasks: 30 },
  { label: "HR Specialist", value: 48, color: "bg-purple-500", tasks: 20 },
  { label: "Finance Manager", value: 54, color: "bg-amber-400", tasks: 21 },
];

const SCORECARD = [
  { title: "Roles with Mapped Tasks", current: 87, target: 95 },
  { title: "Tasks with Mapped Skills", current: 92, target: 95 },
  { title: "Skills with Proficiency Levels", current: 74, target: 85 },
  { title: "Attitudes/Behavior Mapped", current: 45, target: 70 },
  { title: "External Framework Alignment", current: 89, target: 90 },
  { title: "Competency Documentation", current: 91, target: 95 },
];

const roleData = [
  { rank: 1, name: "Data Scientist", growth: 45.2, trend: "up", category: "Technology", density: 262 },
  { rank: 2, name: "Product Manager", growth: 18.7, trend: "up", category: "Business", density: 166 },
  { rank: 3, name: "Software Engineer", growth: 12.4, trend: "up", category: "Technology", density: 167 },
  { rank: 4, name: "UX Designer", growth: 8.9, trend: "up", category: "Design", density: 148 },
  { rank: 5, name: "DevOps Engineer", growth: 7.3, trend: "up", category: "Technology", density: 148 },
  { rank: 6, name: "Business Analyst", growth: 3.2, trend: "stable", category: "Business", density: 134 },
  { rank: 7, name: "Marketing Manager", growth: 2.1, trend: "stable", category: "Marketing", density: 128 },
  { rank: 8, name: "HR Business Partner", growth: 0.8, trend: "stable", category: "HR", density: 122 },
  { rank: 9, name: "Finance Analyst", growth: -1.2, trend: "down", category: "Finance", density: 115 },
  { rank: 10, name: "Operations Manager", growth: -2.8, trend: "down", category: "Operations", density: 110 },
];

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState("balance-equity");

  useEffect(() => {
    setActiveTab("balance-equity");
  }, []);

  // Initialize tour only when triggered via sidebar tour flow
  useEffect(() => {
    // Check if tour was triggered via sidebar tour flow
    const triggerTour = sessionStorage.getItem('triggerPageTour');

    if (triggerTour && !isTourCompleted()) {
      // Clear the trigger flag immediately to prevent re-triggering
      sessionStorage.removeItem('triggerPageTour');

      const timer = setTimeout(() => {
        // Pass setActiveTab as tab switcher callback
        const tour = initializeTour((tabId: string) => {
          setActiveTab(tabId);
        });
        tour.start();
      }, 1000); // Delay to allow elements to render
      return () => clearTimeout(timer);
    }
  }, [setActiveTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "balance-equity":
        return <BalanceEquityView />;
      case "health-completeness":
        return <CombinedDashboard />;
      case "alignment-standardization":
        return <AlignmentWidget />;
      case "stakeholder-lenses":
        return <CompetencyDashboard />;
      default:
        return <BalanceEquityView />;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen" id="tour-dashboard-container">
      
      {/* Tour Controls */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            resetTour();
            const tour = initializeTour((tabId: string) => {
              setActiveTab(tabId);
            });
            tour.start();
          }}
          className="text-xs text-blue-500 hover:text-blue-700 underline"
        >
          Restart Tour
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6" id="tour-kpi-cards">
        {KPIS.map((kpi, i) => (
          <Card key={i} className="shadow-sm border rounded-xl bg-white/90">
            <CardContent className="p-4 flex flex-col justify-between">
              <div className="text-xs text-slate-500">{kpi.title}</div>
              <div className="text-2xl font-semibold mt-2">{kpi.value}</div>
              <div className="text-xs text-slate-400 mt-1">{kpi.subtitle}</div>
              {kpi.delta && <div className="text-xs text-green-500 mt-2">{kpi.delta}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6" id="tour-navigation-tabs">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          {NAVIGATION_TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tour-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}

// Role–Task–Skill Balance & Equity View
function BalanceEquityView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border rounded-xl" id="tour-workload-heatmap">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-1">Workload Equity Heatmap</h3>
            <p className="text-xs text-slate-400 mb-4">Task volume vs skill requirement</p>

            <div className="space-y-3">
              {HEATMAP.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-40 text-xs text-slate-600">{row.label}</div>
                  <div className="flex-1 bg-slate-100 h-5 rounded-full overflow-hidden relative">
                    <div className={`h-full ${row.color}`} style={{ width: `${row.value}%` }}></div>
                  </div>
                  <div className="w-10 text-xs text-slate-500 text-right">{row.value}</div>
                  <div className="text-xs text-slate-400">{row.tasks} tasks</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-400 flex justify-between">
              <div>
                <span className="inline-flex items-center mr-3">
                  <span className="w-3 h-3 bg-green-400 rounded mr-1"></span>Low (0-25)
                </span>
                <span className="inline-flex items-center mr-3">
                  <span className="w-3 h-3 bg-amber-400 rounded mr-1"></span>Medium (26-60)
                </span>
                <span className="inline-flex items-center mr-3">
                  <span className="w-3 h-3 bg-red-500 rounded mr-1"></span>High (61-80)
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-gray-300 rounded mr-1"></span>Critical (80+)
                </span>
              </div>
              <div>Workload Index</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl" id="tour-task-risk-analysis">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-1">Task Risk Analysis</h3>
            <p className="text-xs text-slate-400 mb-4">Task-wise coverage (bubble size = criticality)</p>

            <div className="w-full h-52 bg-white border rounded-md">
              <svg viewBox="0 0 600 220" className="w-full h-full">
                <line x1="40" y1="200" x2="560" y2="200" stroke="#e7e7e7" />
                <line x1="40" y1="200" x2="40" y2="20" stroke="#e7e7e7" />
                <circle cx="120" cy="80" r="7" fill="#3b82f6" />
                <circle cx="200" cy="100" r="6" fill="#10b981" />
                <circle cx="280" cy="60" r="8" fill="#f59e0b" />
                <circle cx="380" cy="120" r="7" fill="#ef4444" />
                <circle cx="460" cy="150" r="6" fill="#8b5cf6" />
              </svg>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              High risk, low coverage tasks require immediate attention. Bubble size indicates task criticality.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm border rounded-xl" id="tour-role-similarity-network">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Role Similarity Network</h3>
                <p className="text-xs text-slate-400">Visualize overlaps between roles based on skill/task similarity</p>
              </div>
              <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Similarity ≥ 50%
              </div>
            </div>

            <div className="w-full h-64 bg-white border rounded-md relative mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {CONNECTIONS.map((conn, i) => {
                  const source = ROLES.find(r => r.id === conn.source);
                  const target = ROLES.find(r => r.id === conn.target);
                  if (!source || !target) return null;

                  return (
                    <line
                      key={i}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={DEPARTMENT_COLORS[source.department]}
                      strokeWidth={conn.strength * 3}
                      strokeOpacity={0.4}
                      className="transition-all duration-200"
                    />
                  );
                })}

                {ROLES.map((role) => (
                  <g key={role.id} className="cursor-pointer transition-all duration-200">
                    <circle
                      cx={role.x}
                      cy={role.y}
                      r={role.size * 2}
                      fill={DEPARTMENT_COLORS[role.department]}
                      stroke="#fff"
                      strokeWidth="1"
                      className="transition-all duration-200"
                    />
                    <text
                      x={role.x}
                      y={role.y + 0.8}
                      textAnchor="middle"
                      fontSize="2.5"
                      fill="white"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {role.name.split(' ').map(word => word[0]).join('')}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-600 font-medium">Similarity Threshold</label>
                  <span className="text-xs text-slate-500">50%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={50}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-slate-400 mt-1">
                  Show connections with similarity ≥ 50%
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium mb-2 block">Department Filter</label>
                <select
                  defaultValue="all"
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium mb-2 block">Department Colors</label>
                <div className="grid grid-cols-2 gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept.id} className="flex items-center text-xs">
                      <div
                        className="w-3 h-3 rounded mr-2 flex-shrink-0"
                        style={{ backgroundColor: dept.color }}
                      ></div>
                      <span className="text-slate-700 truncate">{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500 border-t pt-3">
                <div className="flex justify-between">
                  <span>Node size: Role importance</span>
                  <span>Edge thickness: Similarity strength</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl" id="tour-coverage-scorecards">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Coverage Scorecards</h3>
                <p className="text-xs text-slate-400">Completeness metrics</p>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                80% <span className="text-xs text-slate-400">Overall</span>
              </div>
            </div>

            <div className="space-y-3">
              {SCORECARD.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">{item.title}</span>
                    <span className="text-slate-500">
                      {item.current}% / {item.target}%
                    </span>
                  </div>
                  <Progress value={(item.current / item.target) * 100} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-400 flex justify-between">
              <div>2 On Track • 3 At Risk • 1 Critical</div>
              <div>Target: Improve to 90%</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
