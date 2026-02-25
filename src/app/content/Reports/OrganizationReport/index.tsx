"use client";
import { FilterBar } from "./components/FilterBar";
import { KPICard } from "./components/KPICard";
import { OrganizationalGrowth } from "./components/OrganizationalGrowth";
import { DepartmentalInsights } from "./components/DepartmentalInsights";
import { EmployeeLifecycle } from "./components/EmployeeLifecycle";
import { InsightsRecommendations } from "./components/InsightsRecommendations";
import { DepartmentalGapsTable } from "./components/DepartmentalGapsTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Workforce Analytics Report</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into organizational growth and employee lifecycle
          </p>
        </header>
        {/* Filters */}
        <FilterBar />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <KPICard
            title="Total Employees"
            value="1,024"
            change={12.4}
            changeLabel="from last quarter"
            trend="up"
          />
          <KPICard
            title="New Hires"
            value="234"
            change={8.2}
            changeLabel="from last quarter"
            trend="up"
          />
          <KPICard
            title="Attrition Rate"
            value="6.8%"
            change={2.1}
            changeLabel="from last quarter"
            trend="down"
          />
          <KPICard
            title="Growth %"
            value="12.4%"
            change={3.8}
            changeLabel="from last quarter"
            trend="up"
          />
        </div>

        {/* Organizational Growth */}
        <div className="mb-12">
          <OrganizationalGrowth />
        </div>

        {/* Departmental Insights */}
        <div className="mb-12">
          <DepartmentalInsights />
        </div>

        {/* Employee Lifecycle */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Employee Lifecycle</h2>
          <EmployeeLifecycle />
        </div>

        {/* Insights & Recommendations */}
        <div className="mb-12">
          <InsightsRecommendations />
        </div>

        {/* Departmental Gaps Summary */}
        <div className="mb-12">
          <DepartmentalGapsTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
