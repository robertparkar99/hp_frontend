import { Users, UserPlus, TrendingDown, TrendingUp, Target, Award } from "lucide-react";
import { KPICard } from "./components/dashboard/KPICard";
import { FilterBar, FilterState } from "./components/dashboard/FilterBar";
import { GrowthChart } from "./components/dashboard/GrowthChart";
import { DepartmentChart } from "./components/dashboard/DepartmentChart";
import { StackedAreaChart } from "./components/dashboard/StackedAreaChart";
import { SkillsMatrix } from "./components/dashboard/SkillsMatrix";
import { AIInsightsPanel } from "./components/dashboard/AIInsightsPanel";
import { LifecycleFunnel } from "./components/dashboard/LifecycleFunnel";
import { HiringVsAttritionChart } from "./components/dashboard/HiringVsAttritionChart";
import { JobRoleDistribution } from "./components/dashboard/JobRoleDistribution";
import { AttritionBreakdown } from "./components/dashboard/AttritionBreakdown";
import { kpiData } from "./data/mockData";
import { useState } from "react";

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    department: "all",
    jobRole: "all",
    skill: "all",
    location: "all",
    status: "all",
  });

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
    // In a real app, this would trigger data refetch/filtering
    console.log("Filters changed:", filters);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      department: "all",
      jobRole: "all",
      skill: "all",
      location: "all",
      status: "all",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Employee Directory Analytics Report
          </h1>
          <p className="text-muted-foreground">
            Executive insights into workforce growth, distribution, lifecycle, and skills proficiency
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        {/* Filters */}
        <FilterBar onFilterChange={handleFilterChange} onReset={handleResetFilters} />

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <KPICard
            title="Total Employees"
            value={kpiData.totalEmployees}
            trend={kpiData.totalEmployeesTrend}
            icon={<Users className="h-8 w-8" />}
          />
          <KPICard
            title="New Hires"
            value={kpiData.newHires}
            trend={kpiData.newHiresTrend}
            icon={<UserPlus className="h-8 w-8" />}
          />
          <KPICard
            title="Attrition Rate"
            value={kpiData.attritionRate}
            trend={kpiData.attritionRateTrend}
            suffix="%"
            icon={<TrendingDown className="h-8 w-8" />}
          />
          <KPICard
            title="Growth Rate"
            value={kpiData.growthRate}
            trend={kpiData.growthRateTrend}
            suffix="%"
            icon={<TrendingUp className="h-8 w-8" />}
          />
          <KPICard
            title="Avg Skill Coverage"
            value={kpiData.avgSkillCoverage}
            trend={kpiData.avgSkillCoverageTrend}
            suffix="%"
            icon={<Target className="h-8 w-8" />}
          />
          <KPICard
            title="Avg Proficiency Δ"
            value={kpiData.avgProficiencyDelta.toFixed(2)}
            trend={kpiData.avgProficiencyDeltaTrend}
            icon={<Award className="h-8 w-8" />}
          />
        </div>

        {/* Growth Overview Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Organizational Growth Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <GrowthChart />
            <HiringVsAttritionChart />
          </div>
          <StackedAreaChart />
        </div>

        {/* Workforce Distribution */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Workforce Distribution</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentChart />
            <JobRoleDistribution />
          </div>
        </div>

        {/* Employee Lifecycle */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Employee Lifecycle & Attrition</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LifecycleFunnel />
            <AttritionBreakdown />
          </div>
        </div>

        {/* Skills & Proficiency Layer */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Skills & Proficiency Analysis</h2>
          <SkillsMatrix />
        </div>

        {/* AI Insights Panel */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">AI-Driven Insights</h2>
          <AIInsightsPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
