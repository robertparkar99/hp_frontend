"use client";
import { useState, useEffect } from "react";
import { FilterBar } from "./components/FilterBar";
import { KPICard } from "./components/KPICard";
import { OrganizationalGrowth } from "./components/OrganizationalGrowth";
import { DepartmentalInsights } from "./components/DepartmentalInsights";
import { EmployeeLifecycle } from "./components/EmployeeLifecycle";
import { InsightsRecommendations } from "./components/InsightsRecommendations";
import { DepartmentalGapsTable } from "./components/DepartmentalGapsTable";

const Index = () => {
  const [kpiData, setKpiData] = useState({
    totalEmployees: 0,
    newHires: 0,
    attritionRate: 0,
    growthPercent: 0
  });
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } =
        JSON.parse(userData);
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
    if (!sessionData.url) return;

    const fetchKPI = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/reports/kpi?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`);
        const result = await response.json();
        if (result.success) {
          setKpiData(result.data);
        }
      } catch (error) {
        console.error('Error fetching KPI data:', error);
      }
    };

    fetchKPI();
  }, [sessionData]);

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
            value={kpiData.totalEmployees.toLocaleString()}
          />
          <KPICard
            title="New Hires"
            value={kpiData.newHires}
          />
          <KPICard
            title="Attrition Rate"
            value={`${kpiData.attritionRate}%`}
          />
          <KPICard
            title="Growth %"
            value={`${kpiData.growthPercent}%`}
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
