"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import CompetencyDashboard from "./stakeholder-lenses";
import AlignmentWidget from "./Alignment-Standardization";
import CombinedDashboard from "./Competency-HealthRadar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Calendar, Target, ChevronDown, TrendingDown, Minus, Filter, Briefcase } from "lucide-react";

// UI Components (simplified versions for single file)
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
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        {selectedValue === "all" ? "All Categories" : selectedValue}
      </SelectTrigger>
      {isOpen && (
        <SelectContent>
          {children.map((child: any) => 
            React.cloneElement(child, {
              onClick: () => handleSelect(child.props.value)
            })
          )}
        </SelectContent>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, ...props }: any) => (
  <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" {...props}>
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
);

const SelectContent = ({ children }: any) => (
  <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
    <div className="p-1">
      {children}
    </div>
  </div>
);

const SelectItem = ({ children, ...props }: any) => (
  <div className="relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground" {...props}>
    {children}
  </div>
);

// Navigation tabs
const NAVIGATION_TABS = [
  { id: "balance-equity", name: "Role–Task–Skill Balance & Equity" },
  { id: "stakeholder-lenses", name: "Stakeholder-Specific Lenses" },
];

// Radar chart data from the image
const RADAR_METRICS = [
  { name: "Task Mapping", current: 85, target: 95 },
  { name: "Future Readiness", current: 74, target: 90, delta: -16 },
  { name: "External Alignment", current: 89, target: 90, delta: 91 },
  { name: "Skill Coverage", current: 74, target: 85, delta: -18 },
  { name: "Behavior Mapping", current: 45, target: 70 },
  { name: "Risk Assessment", current: 68, target: 80 },
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

// Skills pipeline data for funnel view
const SKILLS_PIPELINE = [
  {
    stage: "Identified Orphans",
    count: "10,000",
    percentageText: "100% of total",
    filtered: "-3,000 (30%) entities filtered",
    description: "Unmapped skills/entities detected",
    start: "#ffecee",
    end: "#fcd5d5",
    textColor: "#111827"
  },
  {
    stage: "In Review",
    count: "7,000",
    percentageText: "70% of total",
    filtered: "-4,000 (57%) entities filtered",
    description: "Entities currently under review by SME",
    start: "#fff8e6",
    end: "#fff1c7",
    textColor: "#111827"
  },
  {
    stage: "Mapped Candidates",
    count: "3,000",
    percentageText: "30% of total",
    filtered: "-1,000 (33%) entities filtered",
    description: "Skills/entities with proposed links—pending approval",
    start: "#eef2ff",
    end: "#dbeafe",
    textColor: "#0f172a"
  },
  {
    stage: "Approved & Integrated",
    count: "2,000",
    percentageText: "20% of total",
    filtered: "",
    description: "Skills/entities fully vetted and integrated",
    start: "#ecfdf5",
    end: "#bbf7d0",
    textColor: "#0f172a"
  },
];

// Sample data for the trend chart
const trendData = [
  { year: "2021", "Data Scientist": 145, "Software Engineer": 132, "Product Manager": 128, "UX Designer": 118, "DevOps Engineer": 115 },
  { year: "2022", "Data Scientist": 167, "Software Engineer": 139, "Product Manager": 135, "UX Designer": 124, "DevOps Engineer": 122 },
  { year: "2023", "Data Scientist": 189, "Software Engineer": 145, "Product Manager": 142, "UX Designer": 129, "DevOps Engineer": 128 },
  { year: "2024", "Data Scientist": 210, "Software Engineer": 152, "Product Manager": 149, "UX Designer": 135, "DevOps Engineer": 134 },
  { year: "2025", "Data Scientist": 235, "Software Engineer": 159, "Product Manager": 157, "UX Designer": 142, "DevOps Engineer": 141 },
  { year: "2026", "Data Scientist": 262, "Software Engineer": 167, "Product Manager": 166, "UX Designer": 148, "DevOps Engineer": 148 },
];

const roleColors = {
  "Data Scientist": "hsl(var(--chart-1))",
  "Software Engineer": "hsl(var(--chart-2))",
  "Product Manager": "hsl(var(--chart-3))",
  "UX Designer": "hsl(var(--chart-4))",
  "DevOps Engineer": "hsl(var(--chart-5))",
};

// Role data for sidebar
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

// Role details for drill down panel
const roleDetails = {
  "Data Scientist": {
    rank: 1,
    densityScore: 262,
    projectedGrowth: "+18% by 2026",
    description: "Expected to grow significantly due to AI/ML skill requirements and data-driven decision making",
    topCompetencies: [
      { name: "Machine Learning", weight: 95, trend: "up" },
      { name: "Statistical Analysis", weight: 88, trend: "up" },
      { name: "Python Programming", weight: 82, trend: "stable" }
    ],
    departments: ["Technology", "Analytics", "R&D"],
    sparklineData: [145, 167, 189, 210, 235, 262]
  },
  "Product Manager": {
    rank: 2,
    densityScore: 166,
    projectedGrowth: "+12% by 2026",
    description: "Growing complexity in product strategy and cross-functional leadership requirements",
    topCompetencies: [
      { name: "Strategic Planning", weight: 92, trend: "up" },
      { name: "User Research", weight: 85, trend: "up" },
      { name: "Agile Methodology", weight: 78, trend: "stable" }
    ],
    departments: ["Product", "Technology", "Strategy"],
    sparklineData: [128, 135, 142, 149, 157, 166]
  },
  "Software Engineer": {
    rank: 3,
    densityScore: 167,
    projectedGrowth: "+10% by 2026",
    description: "Steady growth driven by cloud technologies and DevOps integration",
    topCompetencies: [
      { name: "Cloud Architecture", weight: 89, trend: "up" },
      { name: "Full-Stack Development", weight: 85, trend: "stable" },
      { name: "System Design", weight: 80, trend: "up" }
    ],
    departments: ["Technology", "Engineering", "Infrastructure"],
    sparklineData: [132, 139, 145, 152, 159, 167]
  },
  "UX Designer": {
    rank: 4,
    densityScore: 148,
    projectedGrowth: "+8% by 2026",
    description: "Increasing focus on user experience across digital products",
    topCompetencies: [
      { name: "User Research", weight: 88, trend: "up" },
      { name: "Wireframing", weight: 82, trend: "stable" },
      { name: "Prototyping", weight: 78, trend: "up" }
    ],
    departments: ["Design", "Product", "Technology"],
    sparklineData: [118, 124, 129, 135, 142, 148]
  },
  "DevOps Engineer": {
    rank: 5,
    densityScore: 148,
    projectedGrowth: "+7% by 2026",
    description: "Continued importance in cloud infrastructure and automation",
    topCompetencies: [
      { name: "CI/CD", weight: 90, trend: "up" },
      { name: "Cloud Platforms", weight: 85, trend: "up" },
      { name: "Containerization", weight: 80, trend: "stable" }
    ],
    departments: ["Technology", "Infrastructure", "Engineering"],
    sparklineData: [115, 122, 128, 134, 141, 148]
  }
};

// KPI Card Component
const KPICard = ({ label, value, trend, trendValue, icon }: any) => {
  const trendColor = trend === "up" ? "text-trend-up" : trend === "down" ? "text-trend-down" : "text-trend-stable";
  
  return (
    <Card className="p-6 bg-gradient-subtle border-none shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${trendColor}`}>
              <TrendingUp className="h-3 w-3" />
              {trendValue}
            </p>
          )}
        </div>
        <div className="text-primary/70">
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Dashboard Header Component
const DashboardHeader = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Fastest Growing Role"
          value="Data Scientist"
          trend="up"
          trendValue="+45% growth"
          icon={<Target className="h-8 w-8" />}
        />
        <KPICard
          label="Average Growth (Top 10)"
          value="+12%"
          trend="up"
          trendValue="YoY increase"
          icon={<TrendingUp className="h-8 w-8" />}
        />
        <KPICard
          label="Total Roles Analyzed"
          value="127"
          trend="stable"
          trendValue="Active roles"
          icon={<Users className="h-8 w-8" />}
        />
        <KPICard
          label="Projection Horizon"
          value="2026"
          trend="stable"
          trendValue="3 years ahead"
          icon={<Calendar className="h-8 w-8" />}
        />
      </div>
    </div>
  );
};

// Trend Chart Component
const TrendChart = ({ selectedRole }: any) => {
  return (
    <Card className="p-6 bg-gradient-chart border-none shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Competency Density Trends</h3>
        <p className="text-sm text-muted-foreground">Historical data (solid) and projections (dashed) for top roles</p>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
            <XAxis 
              dataKey="year" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Competency Density Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            />
            <Legend />
            
            {Object.entries(roleColors).map(([role, color]) => (
              <Line
                key={role}
                type="monotone"
                dataKey={role}
                stroke={color}
                strokeWidth={selectedRole === role ? 3 : 2}
                strokeDasharray={role === selectedRole ? "0" : ""}
                opacity={selectedRole && selectedRole !== role ? 0.3 : 1}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-3 bg-accent/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Projections for 2025-2026 are based on historical trends and market analysis. 
          Actual values may vary based on industry changes and organizational needs.
        </p>
      </div>
    </Card>
  );
};

// Role Sidebar Component
const RoleSidebar = ({ selectedRole, onRoleSelect }: any) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const categories = ["all", "Technology", "Business", "Design", "Marketing", "HR", "Finance", "Operations"];
  
  const filteredRoles = roleData.filter(role => 
    selectedCategory === "all" || role.category === selectedCategory
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-trend-up" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-trend-down" />;
      default:
        return <Minus className="h-4 w-4 text-trend-stable" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-trend-up";
      case "down":
        return "text-trend-down";
      default:
        return "text-trend-stable";
    }
  };

  return (
    <Card className="p-6 bg-gradient-subtle border-none shadow-sm h-fit animate-fade-in">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Role Rankings</h3>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Job Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Role List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Top Roles by Growth</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredRoles.map((role) => (
              <Button
                key={role.name}
                variant={selectedRole === role.name ? "default" : "ghost"}
                className="w-full justify-start p-3 h-auto text-left hover:bg-accent/50"
                onClick={() => onRoleSelect(role.name)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded">#{role.rank}</span>
                      <span className="font-medium text-sm">{role.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {role.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Density: {role.density}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(role.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(role.trend)}`}>
                      {role.growth > 0 ? "+" : ""}{role.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Trend Indicators</p>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-trend-up" />
              <span>Rising (&gt;5% growth)</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-3 w-3 text-trend-stable" />
              <span>Stable (-5% to +5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-trend-down" />
              <span>Declining (&lt;-5% growth)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Drill Down Panel Component
const DrillDownPanel = ({ selectedRole }: any) => {
  if (!selectedRole || !roleDetails[selectedRole as keyof typeof roleDetails]) {
    return (
      <Card className="p-6 bg-muted/30 border-dashed animate-fade-in">
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Select a Role</h3>
          <p className="text-sm text-muted-foreground">
            Click on a role from the sidebar to view detailed insights and projections
          </p>
        </div>
      </Card>
    );
  }

  const role = roleDetails[selectedRole as keyof typeof roleDetails];

  return (
    <Card className="p-6 bg-gradient-subtle border-none shadow-sm animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary text-primary-foreground">
                Rank #{role.rank}
              </Badge>
              <h3 className="text-xl font-bold text-foreground">{selectedRole}</h3>
            </div>
            <p className="text-muted-foreground">{role.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-kpi-highlight">{role.densityScore}</p>
            <p className="text-sm text-muted-foreground">Density Score</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-success-light/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Projected Growth</span>
            </div>
            <p className="text-lg font-bold text-success">{role.projectedGrowth}</p>
          </div>
          
          <div className="bg-primary-light/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Current Score</span>
            </div>
            <p className="text-lg font-bold text-primary">{role.densityScore}</p>
          </div>
          
          <div className="bg-accent/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-accent-foreground" />
              <span className="text-sm font-medium">Departments</span>
            </div>
            <p className="text-sm font-medium">{role.departments.length} Active</p>
          </div>
        </div>

        {/* Top Competencies */}
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Top Driving Competencies
          </h4>
          <div className="space-y-3">
            {role.topCompetencies.map((competency, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{competency.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{competency.weight}%</span>
                    <TrendingUp 
                      className={`h-3 w-3 ${
                        competency.trend === "up" ? "text-trend-up" : "text-trend-stable"
                      }`} 
                    />
                  </div>
                </div>
                <Progress 
                  value={competency.weight} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Department Tags */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Active Departments</h4>
          <div className="flex flex-wrap gap-2">
            {role.departments.map((dept) => (
              <Badge key={dept} variant="secondary" className="text-xs">
                {dept}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState("balance-equity");

  useEffect(() => {
    setActiveTab("balance-equity");
  }, []);

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
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          {NAVIGATION_TABS.map((tab) => (
            <button
              key={tab.id}
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

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

// Role–Task–Skill Balance & Equity View
function BalanceEquityView() {
  const [similarityThreshold, setSimilarityThreshold] = useState(63);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [scorecardData, setScorecardData] = useState<any>(null);
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });

  const getColor = (value: number) => {
    if (value <= 25) return "bg-green-400";
    if (value <= 60) return "bg-amber-400";
    if (value <= 80) return "bg-red-500";
    return "bg-gray-300";
  };

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token && sessionData.subInstituteId) {
      // Fetch heatmap data
      fetch(`${sessionData.url}/api/competency/workload-heatmap?sub_institute_id=${sessionData.subInstituteId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          const mapped = data.map((item: any) => ({
            label: item.role,
            value: item.workloadIndex,
            tasks: item.tasks,
            color: getColor(item.workloadIndex)
          }));
          setHeatmapData(mapped);
        })
        .catch(err => console.error('Error fetching heatmap data:', err));

      // Fetch role similarity data
      fetch(`${sessionData.url}/api/competency/role-similarity?threshold=${similarityThreshold}&sub_institute_id=${sessionData.subInstituteId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          console.log('API Response:', data);
          console.log('Nodes count:', data.nodes?.length);
          console.log('Edges count:', data.edges?.length);
          console.log('Sample edge:', data.edges?.[0]);
          // Map nodes with positions in a circular layout
          const centerX = 250;
          const centerY = 250;

          // Dynamic radius based on node count
          const baseRadius = 100;
          const radius = Math.max(baseRadius, data.nodes.length * 8);
          const mappedNodes = data.nodes.map((node: any, index: number) => {
            const angle = (index / data.nodes.length) * 2 * Math.PI;
            const x = node.x ?? centerX + radius * Math.cos(angle);
            const y = node.y ?? centerY + radius * Math.sin(angle);
            // Scale node size: importance * 10 for larger nodes
            const size = node.importance * 8;
            return { 
              ...node, 
              x, 
              y, 
              size, 
              uniqueKey: `${node.id}-${index}`,
              label: node.label || node.name || node.id
            };
          });
          setNodes(mappedNodes);
          setEdges(data.edges);
        })
        .catch(err => console.error('Error fetching role similarity data:', err));

      // Fetch coverage scorecards data
      fetch(`${sessionData.url}/api/competency/coverage-scorecards?sub_institute_id=${sessionData.subInstituteId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setScorecardData(data);
        })
        .catch(err => console.error('Error fetching scorecard data:', err));
    }
  }, [sessionData, similarityThreshold]);



  // ID and similarity helpers with normalization
  const toId = (val: any): string => {
    if (val && typeof val === 'object') {
      const candidate = val.id ?? val.nodeId ?? val.roleId ?? val.value ?? val.key;
      return candidate !== undefined && candidate !== null ? String(candidate) : '';
    }
    return val !== undefined && val !== null ? String(val) : '';
  };

  // Helper function to get node ID (string) with fallback for different field names
  const getNodeId = (node: any): string => {
    return toId(node?.id ?? node?.roleId ?? node?.nodeId);
  };

  const filteredRoles = selectedDepartment === "all"
    ? nodes
    : nodes.filter((node: any) => node.department === selectedDepartment);

  // Helper function to get similarity percentage (0–100), handling 0–1 and string values
  const getSimilarity = (edge: any): number => {
    let raw: any = edge?.similarity ?? edge?.score ?? edge?.weight ?? edge?.percentage ?? 0;
    if (typeof raw === 'string') {
      const parsed = parseFloat(raw);
      raw = isNaN(parsed) ? 0 : parsed;
    }
    // If API returns 0–1, convert to percentage; clamp to [0,100]
    if (raw > 0 && raw <= 1) raw = raw * 100;
    if (raw < 0) raw = 0;
    if (raw > 100) raw = 100;
    return Number(raw);
  };

  // Helper to get edge source/target with fallback for different field names
  const getEdgeSource = (edge: any): string => {
    return toId(edge?.source ?? edge?.sourceId ?? edge?.from ?? edge?.sourceNode);
  };
  const getEdgeTarget = (edge: any): string => {
    return toId(edge?.target ?? edge?.targetId ?? edge?.to ?? edge?.targetNode);
  };

  const filteredConnections = edges.filter((edge: any) => {
    const sourceId: string = getEdgeSource(edge);
    const targetId: string = getEdgeTarget(edge);
    const similarity = getSimilarity(edge);
    return (
      similarity >= similarityThreshold &&
      filteredRoles.some((node: any) => getNodeId(node) === String(sourceId)) &&
      filteredRoles.some((node: any) => getNodeId(node) === String(targetId))
    );
  });

  // If no edges pass the threshold filter, show all edges between visible nodes
  const displayConnections = filteredConnections.length > 0 ? filteredConnections : edges.filter((edge: any) => {
    const sourceId: string = getEdgeSource(edge);
    const targetId: string = getEdgeTarget(edge);
    return (
      filteredRoles.some((node: any) => getNodeId(node) === String(sourceId)) &&
      filteredRoles.some((node: any) => getNodeId(node) === String(targetId))
    );
  });

  console.log('Debug - Edges:', edges.length, 'Filtered connections:', filteredConnections.length, 'Display connections:', displayConnections.length);
  console.log('Debug - similarityThreshold:', similarityThreshold);

  const uniqueDepartments = Array.from(new Set(nodes.map((node: any) => node.department)));

  // Get department colors for legend
  const departmentColorMap = nodes.reduce((acc: any, node: any) => {
    if (node.department && !acc[node.department]) {
      acc[node.department] = node.color || DEPARTMENT_COLORS[node.department] || '#64748B';
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* First Row: Side by Side Layout (60-40 ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        {/* Workload Heatmap */}
        <Card className="shadow-sm border rounded-xl">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-1">Workload Equity Heatmap</h3>
            <p className="text-xs text-slate-400 mb-4">Task volume vs skill requirement</p>

            <div className="space-y-3">
              {heatmapData.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-40 text-xs text-slate-600 truncate" title={row.label}>{row.label}</div>
                  <div className="flex-1 bg-slate-100 h-5 rounded-full overflow-hidden relative">
                    <div className={`h-full ${row.color}`} style={{ width: `${row.value}%` }}></div>
                  </div>
                  <div className="w-10 text-xs text-slate-500 text-right">{row.value}</div>
                  <div className="text-xs text-slate-400">{row.tasks} tasks</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-400 flex flex-wrap justify-between">
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-green-400 rounded mr-1"></span>Low (0–25)
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-amber-400 rounded mr-1"></span>Medium (26–60)
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded mr-1"></span>High (61–80)
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-gray-300 rounded mr-1"></span>Critical (80+)
                </span>
              </div>
              <div>Workload Index</div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Scorecards */}
        <Card className="shadow-sm border rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Coverage Scorecards</h3>
                <p className="text-xs text-slate-400">Completeness metrics</p>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {scorecardData?.overall || 80}% <span className="text-xs text-slate-400">Overall</span>
              </div>
            </div>

            <div className="space-y-3">
              {(scorecardData?.metrics || []).map((item: { name?: string; title?: string; display?: string; current?: number; target?: number }, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">{item.name || item.title}</span>
                    <span className="text-slate-500">
                      {item.display || `${item.current || 0}% / ${item.target || 0}%`}
                    </span>
                  </div>
                  <Progress 
                    value={item.current && item.target ? (item.current / item.target) * 100 : 0} 
                    className="h-2" 
                  />
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

      {/* Second Row: Role Similarity Network (Full Width) */}
      <Card className="shadow-sm border rounded-xl">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Role Similarity Network</h3>
              <p className="text-xs text-slate-400">Visualize overlaps between roles based on skill/task similarity</p>
            </div>
            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Similarity ≥ {similarityThreshold}%
            </div>
          </div>

          {/* Network Visualization - Fixed with larger circles */}
          <div className="w-full h-[400px] bg-white border rounded-md relative overflow-hidden mb-4">
            <svg viewBox="0 0 500 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* Draw connections first so they appear behind nodes */}
              {displayConnections.map((conn, i) => {
                const sourceId = getEdgeSource(conn);
                const targetId = getEdgeTarget(conn);
                const source = filteredRoles.find((n: any) => getNodeId(n) === sourceId);
                const target = filteredRoles.find((n: any) => getNodeId(n) === targetId);
                if (!source || !target) return null;

                return (
                  <line
                    key={`${sourceId}-${targetId}-${i}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={source.color || DEPARTMENT_COLORS[source.department] || '#64748B'}
                    strokeWidth={Math.max(1.5, (getSimilarity(conn) / 100) * 6)}
                    strokeOpacity={0.5}
                    className="transition-all duration-200"
                  />
                );
              })}

              {/* Draw nodes with larger circles */}
              {filteredRoles.map((role: any) => {
                const isHovered = hoveredRole === role.id;
                
                return (
                  <g
                    key={role.uniqueKey || role.id}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredRole(role.id)}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    {/* Glow effect on hover */}
                    {isHovered && (
                      <circle
                        cx={role.x}
                        cy={role.y}
                        r={role.size * 1.2}
                        fill="none"
                        stroke={role.color || DEPARTMENT_COLORS[role.department] || '#64748B'}
                        strokeWidth="3"
                        strokeOpacity="0.3"
                      />
                    )}
                    
                    {/* Main circle - LARGER SIZE */}
                    <circle
                      cx={role.x}
                      cy={role.y}
                      r={role.size} // Size is already multiplied by 12 in the node mapping
                      fill={role.color || DEPARTMENT_COLORS[role.department] || '#64748B'}
                      stroke="#fff"
                      strokeWidth="2"
                      className="transition-all duration-200"
                      style={{
                        filter: isHovered ? 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' : 'none',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        transformOrigin: `${role.x}px ${role.y}px`
                      }}
                    />
                    
                    {/* Role initials - LARGER FONT */}
                    <text
                      x={role.x}
                      y={role.y + 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={role.size * 0.6}
                      fill="white"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {role.label.split(' ').map((word: string) => word[0]).join('').substring(0, 3)}
                    </text>
                    
                    {/* Role label on hover */}
                    {isHovered && (
                      <text
                        x={role.x}
                        y={role.y - role.size - 5}
                        textAnchor="middle"
                        fontSize="6"
                        fill="#1e293b"
                        fontWeight="bold"
                        className="pointer-events-none select-none bg-white bg-opacity-75 px-1 py-0.5 rounded"
                      >
                        {role.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Filters & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-600 font-medium">Similarity Threshold</label>
                <span className="text-xs text-slate-500">{similarityThreshold}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-slate-400 mt-1">
                Show connections with similarity ≥ {similarityThreshold}%
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium mb-2 block">Department Filter</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept: string) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Color Legend */}
            <div>
              <label className="text-xs text-slate-600 font-medium mb-2 block">Role Colors</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(departmentColorMap).slice(0, 6).map(([dept, color]: [string, any]) => (
                  <div key={dept} className="flex items-center text-xs">
                    <div
                      className="w-3 h-3 rounded-full mr-1 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-slate-700 truncate capitalize">{dept}</span>
                  </div>
                ))}
                {Object.keys(departmentColorMap).length > 6 && (
                  <span className="text-xs text-slate-400">+{Object.keys(departmentColorMap).length - 6} more</span>
                )}
              </div>
            </div>
          </div>

          {/* Node size and edge thickness info */}
          <div className="mt-4 text-xs text-slate-500 border-t pt-3 flex justify-between">
            <span>⚪ Node size: Role importance (larger = more critical)</span>
            <span>📊 Edge thickness: Similarity strength (thicker = more overlap)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default View for other tabs
function DefaultView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <Card className="shadow-sm border rounded-xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">View Coming Soon</h3>
            <p className="text-sm text-slate-500">This section is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
