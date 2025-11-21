import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Filter, ArrowUpDown, X, TrendingUp, Users, BookOpen, Calendar, 
  LucideIcon, Target, ChevronDown, TrendingDown, Minus, Briefcase, 
  Download, RotateCcw, AlertCircle, Globe, Layers 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ========== SHARED UI COMPONENTS ==========

// KPI Chip Component
interface KPIChipProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: "default" | "warning" | "critical" | "success";
  className?: string;
}

export const KPIChip = ({ icon: Icon, label, value, variant = "default", className }: KPIChipProps) => {
  const variants = {
    default: "bg-card border-border",
    warning: "bg-warning-light border-warning",
    critical: "bg-destructive-light border-destructive",
    success: "bg-success-light border-success",
  };

  const iconVariants = {
    default: "text-primary",
    warning: "text-warning",
    critical: "text-destructive",
    success: "text-success",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-all hover:shadow-md",
        variants[variant],
        className
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-background/50", iconVariants[variant])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-lg font-bold text-foreground">{value}</span>
      </div>
    </div>
  );
};

// Progress Component
const Progress = ({ value, className }: any) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div 
      className="h-full bg-primary transition-all" 
      style={{ width: `${value}%` }}
    />
  </div>
);

// View Toggle Component
const ViewToggle = ({ currentView, onViewChange }: any) => {
  return (
    <div className="flex bg-muted/50 rounded-lg p-1 w-fit">
      <Button
        variant={currentView === "competency-density" ? "default" : "ghost"}
        className={`px-4 py-2 text-sm ${currentView === "competency-density" ? "shadow-sm" : ""}`}
        onClick={() => onViewChange("competency-density")}
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Competency Density
      </Button>
      <Button
        variant={currentView === "skills-heatmap" ? "default" : "ghost"}
        className={`px-4 py-2 text-sm ${currentView === "skills-heatmap" ? "shadow-sm" : ""}`}
        onClick={() => onViewChange("skills-heatmap")}
      >
        <Layers className="h-4 w-4 mr-2" />
        Skills Heatmap
      </Button>
      <Button
        variant={currentView === "skills-gap" ? "default" : "ghost"}
        className={`px-4 py-2 text-sm ${currentView === "skills-gap" ? "shadow-sm" : ""}`}
        onClick={() => onViewChange("skills-gap")}
      >
        <Globe className="h-4 w-4 mr-2" />
        Skills Gap
      </Button>
    </div>
  );
};

// ========== SKILLS GAP DASHBOARD COMPONENTS ==========

// Filter Controls Component
interface FilterControlsProps {
  onSortChange?: (value: string) => void;
  onThresholdChange?: (value: number[]) => void;
  onCategoryChange?: (value: string) => void;
}

export const FilterControls = ({
  onSortChange,
  onThresholdChange,
  onCategoryChange,
}: FilterControlsProps) => {
  const [threshold, setThreshold] = useState([0]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleThresholdChange = (value: number[]) => {
    setThreshold(value);
    onThresholdChange?.(value);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters & Controls</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="sort" className="text-xs text-muted-foreground">
              Sort by
            </Label>
            <Select defaultValue="gap-desc" onValueChange={onSortChange}>
              <SelectTrigger id="sort" className="h-9">
                <ArrowUpDown className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gap-desc">Gap (Largest first)</SelectItem>
                <SelectItem value="gap-asc">Gap (Smallest first)</SelectItem>
                <SelectItem value="skill-name">Skill Name</SelectItem>
                <SelectItem value="avg-prof">Avg Proficiency</SelectItem>
                <SelectItem value="required">Required Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs text-muted-foreground">
              Category
            </Label>
            <Select defaultValue="all" onValueChange={onCategoryChange}>
              <SelectTrigger id="category" className="h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical Skills</SelectItem>
                <SelectItem value="soft">Soft Skills</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="threshold" className="text-xs text-muted-foreground">
                Show gaps greater than
              </Label>
              <span className="text-sm font-semibold text-foreground">{threshold[0]}%</span>
            </div>
            <Slider
              id="threshold"
              min={0}
              max={50}
              step={5}
              value={threshold}
              onValueChange={handleThresholdChange}
              className="w-full"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

// Gap Chart Component
interface SkillData {
  skill_name: string;
  required: number;
  avg: number;
  gap: number;
  n: number;
  category?: string;
  trend?: Array<{ date: string; avg: number }>;
}

interface GapChartProps {
  data: SkillData[];
  onSkillClick?: (skill: SkillData) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const gapPercentage = data.gap;
  
  let gapColor = "text-success";
  let gapBg = "bg-success-light";
  let recommendation = "Monitor / Microlearning";
  
  if (gapPercentage >= 25) {
    gapColor = "text-destructive";
    gapBg = "bg-destructive-light";
    recommendation = "Urgent: Design Bootcamp";
  } else if (gapPercentage >= 10) {
    gapColor = "text-warning";
    gapBg = "bg-warning-light";
    recommendation = "Recommend E-learning";
  }

  return (
    <Card className="border-2 p-4 shadow-xl">
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-foreground">{data.skill_name}</h3>
          {data.category && (
            <p className="text-xs text-muted-foreground">{data.category}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Current Avg</p>
            <p className="font-semibold text-secondary">{data.avg}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Required</p>
            <p className="font-semibold text-accent">{data.required}%</p>
          </div>
        </div>

        <div className={`rounded-lg p-2 ${gapBg}`}>
          <p className="text-xs font-medium text-muted-foreground">Gap</p>
          <p className={`text-lg font-bold ${gapColor}`}>{gapPercentage}%</p>
        </div>

        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground">Employees assessed</p>
          <p className="font-medium text-foreground">{data.n}</p>
        </div>

        <div className="rounded-lg bg-primary-light p-2">
          <p className="text-xs font-semibold text-primary">{recommendation}</p>
        </div>
      </div>
    </Card>
  );
};

export const GapChart = ({ data, onSkillClick }: GapChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Card className="p-6">
      <ResponsiveContainer width="100%" height={480}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          onMouseMove={(state: any) => {
            if (state.isTooltipActive) {
              setActiveIndex(state.activeTooltipIndex);
            } else {
              setActiveIndex(null);
            }
          }}
          onClick={(state: any) => {
            if (state && state.activePayload && state.activePayload[0]) {
              onSkillClick?.(state.activePayload[0].payload);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
          <XAxis
            dataKey="skill_name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: "hsl(var(--chart-axis))", fontSize: 12 }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            label={{ value: "Proficiency (%)", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--chart-axis))" } }}
            tick={{ fill: "hsl(var(--chart-axis))", fontSize: 12 }}
            stroke="hsl(var(--border))"
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.2)" }} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
          />
          
          <Bar
            dataKey="avg"
            name="Average Proficiency"
            fill="hsl(var(--secondary))"
            radius={[8, 8, 0, 0]}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === activeIndex ? "hsl(var(--secondary) / 0.8)" : "hsl(var(--secondary))"}
              />
            ))}
          </Bar>
          
          <Line
            type="monotone"
            dataKey="required"
            name="Required Proficiency"
            stroke="hsl(var(--accent))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--accent))", r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }}
            activeDot={{ r: 7, cursor: "pointer" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};

// Skill Drill Panel Component
interface SkillDrillPanelProps {
  skill: {
    skill_name: string;
    required: number;
    avg: number;
    gap: number;
    n: number;
    category?: string;
    trend?: Array<{ date: string; avg: number }>;
  } | null;
  onClose: () => void;
}

export const SkillDrillPanel = ({ skill, onClose }: SkillDrillPanelProps) => {
  if (!skill) return null;

  const getGapSeverity = (gap: number) => {
    if (gap >= 25) return { label: "Critical", variant: "destructive" as const, color: "text-destructive" };
    if (gap >= 10) return { label: "Moderate", variant: "default" as const, color: "text-warning" };
    return { label: "Low", variant: "secondary" as const, color: "text-success" };
  };

  const severity = getGapSeverity(skill.gap);

  const mockRoleBreakdown = [
    { role: "Junior Analyst", avg: 45, n: 42 },
    { role: "Senior Analyst", avg: 58, n: 52 },
    { role: "Team Lead", avg: 67, n: 28 },
    { role: "Manager", avg: 71, n: 20 },
  ];

  const mockModules = [
    { title: "Advanced Excel Fundamentals", duration: "4 hours", enrolled: 0 },
    { title: "Data Analysis Mastery", duration: "6 hours", enrolled: 23 },
    { title: "Excel for Business Intelligence", duration: "3 hours", enrolled: 12 },
  ];

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-card shadow-2xl sm:w-[480px]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card p-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{skill.skill_name}</h2>
          {skill.category && (
            <p className="text-sm text-muted-foreground">{skill.category}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6 p-6">
        {/* Gap Overview */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Gap Severity</span>
            <Badge variant={severity.variant}>{severity.label}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-2xl font-bold text-secondary">{skill.avg}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Required</p>
              <p className="text-2xl font-bold text-accent">{skill.required}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gap</p>
              <p className={`text-2xl font-bold ${severity.color}`}>{skill.gap}%</p>
            </div>
          </div>
        </Card>

        {/* Role Breakdown */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Breakdown by Role</h3>
          </div>
          <Card className="divide-y">
            {mockRoleBreakdown.map((role, idx) => (
              <div key={idx} className="flex items-center justify-between p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{role.role}</p>
                  <p className="text-xs text-muted-foreground">{role.n} employees</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{ width: `${role.avg}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-foreground">
                    {role.avg}%
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Trend */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">6-Month Trend</h3>
          </div>
          <Card className="p-4">
            <div className="flex h-20 items-end justify-between gap-1">
              {[48, 49, 50, 51, 51, 52].map((value, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-secondary transition-all hover:bg-secondary/80"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Last 6 months • Gradual improvement observed
            </p>
          </Card>
        </div>

        {/* Suggested Training */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Suggested Training</h3>
          </div>
          <div className="space-y-2">
            {mockModules.map((module, idx) => (
              <Card key={idx} className="p-3">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-sm font-medium text-foreground">{module.title}</h4>
                  {module.enrolled > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {module.enrolled} enrolled
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{module.duration}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Assign
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <Separator />
        <div className="space-y-2">
          <Button className="w-full bg-gradient-primary">
            Create Learning Campaign
          </Button>
          <Button variant="outline" className="w-full">
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};

// ========== COMPETENCY DENSITY DASHBOARD COMPONENTS ==========

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
  "Data Scientist": "#8884d8",
  "Software Engineer": "#82ca9d",
  "Product Manager": "#ffc658",
  "UX Designer": "#ff8042",
  "DevOps Engineer": "#0088fe",
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
  }
};

// KPI Card Component for Competency Density
const CompetencyKPICard = ({ label, value, trend, trendValue, icon }: any) => {
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-yellow-600";
  
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-none shadow-sm hover:shadow-md transition-shadow">
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

// Competency Dashboard Header Component
const CompetencyDashboardHeader = () => {
  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CompetencyKPICard
          label="Fastest Growing Role"
          value="Data Scientist"
          trend="up"
          trendValue="+45% growth"
          icon={<Target className="h-8 w-8" />}
        />
        <CompetencyKPICard
          label="Average Growth (Top 10)"
          value="+12%"
          trend="up"
          trendValue="YoY increase"
          icon={<TrendingUp className="h-8 w-8" />}
        />
        <CompetencyKPICard
          label="Total Roles Analyzed"
          value="127"
          trend="stable"
          trendValue="Active roles"
          icon={<Users className="h-8 w-8" />}
        />
        <CompetencyKPICard
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

// Trend Chart Component for Competency Density
const CompetencyTrendChart = ({ selectedRole }: any) => {
  return (
    <Card className="p-6 border-none shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Competency Density Trends</h3>
        <p className="text-sm text-muted-foreground">Historical data (solid) and projections (dashed) for top roles</p>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="year" 
              className="text-sm"
            />
            <YAxis 
              className="text-sm"
              label={{ value: 'Competency Density Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Projections for 2025-2026 are based on historical trends and market analysis. 
          Actual values may vary based on industry changes and organizational needs.
        </p>
      </div>
    </Card>
  );
};

// Role Sidebar Component for Competency Density
const CompetencyRoleSidebar = ({ selectedRole, onRoleSelect }: any) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const categories = ["all", "Technology", "Business", "Design", "Marketing", "HR", "Finance", "Operations"];

  const filteredRoles = roleData.filter(role => 
    selectedCategory === "all" || role.category === selectedCategory
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <Card className="p-6 border-none shadow-sm h-fit">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Role Rankings</h3>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Job Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
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
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span>Rising (&gt;5% growth)</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-3 w-3 text-yellow-600" />
              <span>Stable (-5% to +5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span>Declining (&lt;-5% growth)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Drill Down Panel Component for Competency Density
const CompetencyDrillDownPanel = ({ selectedRole }: any) => {
  if (!selectedRole || !roleDetails[selectedRole as keyof typeof roleDetails]) {
    return (
      <Card className="p-6 bg-muted/30 border-dashed">
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
    <Card className="p-6 border-none shadow-sm">
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
            <p className="text-2xl font-bold text-primary">{role.densityScore}</p>
            <p className="text-sm text-muted-foreground">Density Score</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Projected Growth</span>
            </div>
            <p className="text-lg font-bold text-green-600">{role.projectedGrowth}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Current Score</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{role.densityScore}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-purple-600" />
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
                        competency.trend === "up" ? "text-green-600" : "text-yellow-600"
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

// ========== SKILLS HEATMAP COMPONENTS ==========

// FilterBar Component for Heatmap
const FilterBar = ({ onExport, onReset }: any) => {
  const [department, setDepartment] = useState("all-depts");
  const [level, setLevel] = useState("all-levels");
  const [location, setLocation] = useState("all-locations");
  const [period, setPeriod] = useState("1year");

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border-b border-border">
      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-depts">All Departments</SelectItem>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="hr">Human Resources</SelectItem>
        </SelectContent>
      </Select>

      <Select value={level} onValueChange={setLevel}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-levels">All Levels</SelectItem>
          <SelectItem value="entry">Entry Level</SelectItem>
          <SelectItem value="mid">Mid Level</SelectItem>
          <SelectItem value="senior">Senior Level</SelectItem>
        </SelectContent>
      </Select>

      <Select value={location} onValueChange={setLocation}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-locations">All Locations</SelectItem>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="eu">Europe</SelectItem>
          <SelectItem value="asia">Asia Pacific</SelectItem>
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="6months">Last 6 Months</SelectItem>
          <SelectItem value="1year">Last Year</SelectItem>
          <SelectItem value="3years">Last 3 Years</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button variant="default" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

// HeatmapLegend Component
const HeatmapLegend = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
      <span className="text-sm font-medium text-foreground">Gap Severity:</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-8 h-4 bg-green-200 rounded"></div>
          <span className="text-xs text-muted-foreground">Low (&lt;10%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-4 bg-yellow-200 rounded"></div>
          <span className="text-xs text-muted-foreground">Moderate (10-25%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-4 bg-red-200 rounded"></div>
          <span className="text-xs text-muted-foreground">Critical (&gt;25%)</span>
        </div>
      </div>
    </div>
  );
};

// InsightCards Component for Heatmap
const InsightCards = () => {
  const insights = [
    {
      title: "Largest Skill Gap",
      value: "Python Programming",
      icon: AlertCircle,
      trend: "37% gap",
      variant: "critical"
    },
    {
      title: "Most Critical Role",
      value: "Data Scientist",
      icon: Target,
      trend: "28% avg gap",
      variant: "critical"
    },
    {
      title: "Best Performing Skill",
      value: "Communication",
      icon: TrendingUp,
      trend: "7% gap",
      variant: "success"
    },
    {
      title: "Training Coverage",
      value: "68%",
      icon: BookOpen,
      trend: "of critical gaps",
      variant: "warning"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {insights.map((insight) => (
        <Card key={insight.title} className="hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <insight.icon className={`h-4 w-4 ${
                insight.variant === "critical" ? "text-destructive" :
                insight.variant === "success" ? "text-success" : "text-warning"
              }`} />
              <h3 className="text-sm font-medium text-muted-foreground">{insight.title}</h3>
            </div>
            <div className="text-lg font-semibold">{insight.value}</div>
            <div className={`text-xs mt-1 ${
              insight.variant === "critical" ? "text-destructive" :
              insight.variant === "success" ? "text-success" : "text-warning"
            }`}>{insight.trend}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// SidePanel Component for Heatmap
const SidePanel = ({ isOpen, onClose, selectedCell }: any) => {
  if (!isOpen || !selectedCell) return null;

  const coOccurringSkills = [
    { name: "Python", percentage: 85 },
    { name: "SQL", percentage: 78 },
    { name: "Machine Learning", percentage: 72 },
    { name: "Data Visualization", percentage: 65 },
  ];

  const dependentRoles = [
    { name: "Data Scientist", percentage: 92 },
    { name: "ML Engineer", percentage: 88 },
    { name: "Data Analyst", percentage: 75 },
  ];

  const trainingPrograms = [
    { name: "Advanced Data Analytics", skills: 5, impact: 45, priority: "Critical" },
    { name: "Python for Data Science", skills: 3, impact: 38, priority: "Emerging" },
    { name: "Statistical Methods", skills: 4, impact: 28, priority: "Optional" },
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skill Gap Insights</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Cluster Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Skill Summary
          </h4>
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="ml-2 font-medium">{selectedCell.role}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Skill:</span>
              <span className="ml-2 font-medium">{selectedCell.skill}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Gap:</span>
              <span className="ml-2 font-semibold text-primary">{selectedCell.gap}%</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Current Proficiency:</span>
              <span className="ml-2 font-medium">{selectedCell.current}%</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Required:</span>
              <span className="ml-2 font-medium">{selectedCell.required}%</span>
            </div>
          </div>
        </div>

        {/* Top Co-Occurring Skills */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Related Skill Gaps
          </h4>
          <div className="space-y-2">
            {coOccurringSkills.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                <span className="text-sm font-medium">{skill.name}</span>
                <span className="text-sm text-muted-foreground">{skill.percentage}% gap</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roles Most Affected */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Roles Most Affected by This Gap
          </h4>
          <div className="space-y-2">
            {dependentRoles.map((role) => (
              <div key={role.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                <span className="text-sm font-medium">{role.name}</span>
                <span className="text-sm text-muted-foreground">{role.percentage}% impact</span>
              </div>
            ))}
          </div>
        </div>

        {/* Training Program Suggestions */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Training Program Suggestions</h4>
          <div className="space-y-3">
            {trainingPrograms.map((program) => (
              <div key={program.name} className="p-4 bg-secondary/30 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">{program.name}</span>
                  <Badge
                    variant={
                      program.priority === "Critical"
                        ? "destructive"
                        : program.priority === "Emerging"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {program.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{program.skills} skills covered</span>
                  <span>•</span>
                  <span>{program.impact}% workforce impact</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// HeatmapGrid Component
const HeatmapGrid = ({ data, roles, skills, onCellClick }: any) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const getCellValue = (role: string, skill: string): any => {
    const cell = data.find((d: any) => d.role === role && d.skill === skill);
    return cell || { gap: 0, current: 0, required: 0 };
  };

  const getIntensityClass = (gap: number): string => {
    if (gap === 0) return "bg-gray-100";
    if (gap < 10) return "bg-green-200";
    if (gap < 25) return "bg-yellow-200";
    return "bg-red-200";
  };

  const getGapSeverity = (gap: number): string => {
    if (gap === 0) return "No Gap";
    if (gap < 10) return "Low";
    if (gap < 25) return "Moderate";
    return "Critical";
  };

  return (
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `150px repeat(${skills.length}, 100px)` }}>
          {/* Header Row */}
          <div className="sticky top-0 left-0 z-20 bg-card border-b border-r border-border p-3 font-semibold">
            Role / Skill
          </div>
          {skills.map((skill: string) => (
            <div
              key={skill}
              className="sticky top-0 z-10 bg-card border-b border-border p-3 text-xs font-medium text-center"
            >
              <div className="transform -rotate-45 origin-left whitespace-nowrap">{skill}</div>
            </div>
          ))}

          {/* Data Rows */}
          {roles.map((role: string) => (
            <React.Fragment key={role}>
              <div
                className="sticky left-0 z-10 bg-card border-r border-b border-border p-3 text-sm font-medium"
              >
                {role}
              </div>
              {skills.map((skill: string) => {
                const cellData = getCellValue(role, skill);
                const cellKey = `${role}-${skill}`;
                const gap = cellData.gap || 0;
                
                return (
                  <div
                    key={cellKey}
                    className={`relative border-b border-r border-border p-3 cursor-pointer transition-all duration-200 ${getIntensityClass(gap)} ${hoveredCell === cellKey ? "ring-2 ring-primary ring-inset scale-105" : ""}`}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => onCellClick?.({ 
                      role, 
                      skill, 
                      gap,
                      current: cellData.current || 0,
                      required: cellData.required || 0
                    })}
                  >
                    <div className="text-xs text-center font-medium">
                      {gap > 0 ? `${gap}%` : ""}
                    </div>
                    {hoveredCell === cellKey && (
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-30 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg text-xs whitespace-nowrap border border-border">
                        <div className="font-semibold">{role}</div>
                        <div className="text-muted-foreground">{skill}</div>
                        <div className="text-primary font-semibold mt-1">{gap}% gap</div>
                        <div className="text-muted-foreground mt-1">
                          {cellData.current}% current vs {cellData.required}% required
                        </div>
                        <div className={`mt-1 ${
                          gap >= 25 ? "text-destructive" :
                          gap >= 10 ? "text-warning" : "text-success"
                        }`}>
                          {getGapSeverity(gap)} Priority
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skills Heatmap View Component
const SkillsHeatmapView = () => {
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Sample data with gap values
  const sampleData = [
    { role: "Data Scientist", skill: "Python", gap: 37, current: 48, required: 85 },
    { role: "Data Scientist", skill: "SQL", gap: 22, current: 56, required: 78 },
    { role: "Data Scientist", skill: "Machine Learning", gap: 28, current: 64, required: 92 },
    { role: "Data Analyst", skill: "Python", gap: 25, current: 40, required: 65 },
    { role: "Data Analyst", skill: "SQL", gap: 12, current: 76, required: 88 },
    { role: "Data Analyst", skill: "Data Visualization", gap: 15, current: 60, required: 75 },
    { role: "ML Engineer", skill: "Python", gap: 20, current: 70, required: 90 },
    { role: "ML Engineer", skill: "Machine Learning", gap: 15, current: 70, required: 85 },
    { role: "ML Engineer", skill: "Cloud Computing", gap: 30, current: 40, required: 70 },
    { role: "Software Engineer", skill: "Python", gap: 18, current: 67, required: 85 },
    { role: "Software Engineer", skill: "Cloud Computing", gap: 22, current: 58, required: 80 },
    { role: "Product Manager", skill: "Strategic Planning", gap: 8, current: 67, required: 75 },
    { role: "Product Manager", skill: "User Research", gap: 12, current: 63, required: 75 },
  ];

  const roles = ["Data Scientist", "Data Analyst", "ML Engineer", "Software Engineer", "Product Manager"];
  const skills = ["Python", "SQL", "Machine Learning", "Data Visualization", "Cloud Computing", "Strategic Planning", "User Research"];

  const handleCellClick = (cell: any) => {
    setSelectedCell(cell);
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedCell(null);
  };

  const handleExport = () => {
    console.log("Exporting heatmap data...");
  };

  const handleReset = () => {
    console.log("Resetting heatmap filters...");
  };

  return (
    <div className="min-h-screen bg-background">
      <FilterBar onExport={handleExport} onReset={handleReset} />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <HeatmapLegend />
          <HeatmapGrid 
            data={sampleData} 
            roles={roles} 
            skills={skills} 
            onCellClick={handleCellClick}
          />
        </div>
        <InsightCards />
      </div>

      <SidePanel 
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        selectedCell={selectedCell}
      />
    </div>
  );
};

// ========== MAIN DASHBOARD COMPONENTS ==========

// Skills Gap Dashboard Component
const SkillsGapDashboard = () => {
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [filteredData, setFilteredData] = useState<SkillData[]>([]);
  const [sortBy, setSortBy] = useState("gap-desc");
  const [threshold, setThreshold] = useState([0]);
  const [category, setCategory] = useState("all");

  // Mock data - replace with your actual data
  const mockData: SkillData[] = [
    {
      skill_name: "Data Analysis",
      required: 80,
      avg: 52,
      gap: 28,
      n: 142,
      category: "technical",
    },
    {
      skill_name: "Communication",
      required: 75,
      avg: 68,
      gap: 7,
      n: 156,
      category: "soft",
    },
    {
      skill_name: "Project Management",
      required: 70,
      avg: 45,
      gap: 25,
      n: 89,
      category: "leadership",
    },
    {
      skill_name: "Python Programming",
      required: 85,
      avg: 48,
      gap: 37,
      n: 76,
      category: "technical",
    },
    {
      skill_name: "Team Leadership",
      required: 75,
      avg: 58,
      gap: 17,
      n: 67,
      category: "leadership",
    },
  ];

  // Apply filters and sorting
  const applyFiltersAndSorting = () => {
    let filtered = mockData.filter(skill => skill.gap >= threshold[0]);
    
    if (category !== "all") {
      filtered = filtered.filter(skill => skill.category === category);
    }

    // Apply sorting
    switch (sortBy) {
      case "gap-desc":
        filtered.sort((a, b) => b.gap - a.gap);
        break;
      case "gap-asc":
        filtered.sort((a, b) => a.gap - b.gap);
        break;
      case "skill-name":
        filtered.sort((a, b) => a.skill_name.localeCompare(b.skill_name));
        break;
      case "avg-prof":
        filtered.sort((a, b) => b.avg - a.avg);
        break;
      case "required":
        filtered.sort((a, b) => b.required - a.required);
        break;
    }

    return filtered;
  };

  // Update filtered data when filters change
  React.useEffect(() => {
    setFilteredData(applyFiltersAndSorting());
  }, [sortBy, threshold, category]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleThresholdChange = (value: number[]) => {
    setThreshold(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleSkillClick = (skill: SkillData) => {
    setSelectedSkill(skill);
  };

  const handleClosePanel = () => {
    setSelectedSkill(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* KPI Chips */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPIChip
            icon={Users}
            label="Total Employees"
            value="1,247"
            variant="default"
          />
          <KPIChip
            icon={TrendingUp}
            label="Avg Gap"
            value="18.2%"
            variant="warning"
          />
          <KPIChip
            icon={BookOpen}
            label="Critical Skills"
            value="12"
            variant="critical"
          />
          <KPIChip
            icon={Calendar}
            label="Training Assigned"
            value="347"
            variant="success"
          />
        </div>

        {/* Filter Controls */}
        <FilterControls
          onSortChange={handleSortChange}
          onThresholdChange={handleThresholdChange}
          onCategoryChange={handleCategoryChange}
        />

        {/* Gap Chart */}
        <GapChart
          data={filteredData}
          onSkillClick={handleSkillClick}
        />

        {/* Skill Drill Panel */}
        <SkillDrillPanel
          skill={selectedSkill}
          onClose={handleClosePanel}
        />
      </div>
    </div>
  );
};

// Competency Density Dashboard Component
const CompetencyDensityDashboard = () => {
  const [selectedRole, setSelectedRole] = useState<string | undefined>();

  return (
    <div className="p-6 space-y-6">
      <CompetencyDashboardHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <CompetencyRoleSidebar 
            selectedRole={selectedRole} 
            onRoleSelect={setSelectedRole} 
          />
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <CompetencyTrendChart selectedRole={selectedRole} />
          <CompetencyDrillDownPanel selectedRole={selectedRole} />
        </div>
      </div>
    </div>
  );
};

// Main Combined Dashboard Component
export const CombinedDashboard = () => {
  const [currentView, setCurrentView] = useState<"competency-density" | "skills-heatmap" | "skills-gap">("competency-density");

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            {currentView === "skills-gap" ? "Skills Gap Analysis" : 
             currentView === "competency-density" ? "Competency Density Dashboard" : 
             "Skills Heatmap Analysis"}
          </h1>
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>
      </div>

      {currentView === "competency-density" ? (
        <CompetencyDensityDashboard />
      ) : currentView === "skills-heatmap" ? (
        <SkillsHeatmapView />
      ) : (
        <SkillsGapDashboard />
      )}
    </div>
  );
};

export default CombinedDashboard;