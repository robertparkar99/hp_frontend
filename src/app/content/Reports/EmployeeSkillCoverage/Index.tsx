import { useState, useEffect } from "react";
import { KPICard } from "./components/KPICard";
import { SkillCoverageMatrix } from "./components/SkillCoverageMatrix";
import { SkillGapChart } from "./components/SkillGapChart";
import { TrendlineChart } from "./components/TrendlineChart";
import { FilterPanel } from "./components/FilterPanel";
import { InsightPanel } from "./components/InsightPanel";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingDown,
  AlertCircle,
  Activity,
  Download,
  Calendar,
  HelpCircle
} from "lucide-react";

interface Metrics {
  overallSkillCoverage: number;
  avgSkillGap: number;
  criticalDeficiencies: number;
  trainingUrgencyIndex: number;
}

interface SkillGapData {
  skill: string;
  gap: number;
  expectedScore: number;
  actualScore: number;
}

const Index = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("all");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillGapData, setSkillGapData] = useState<SkillGapData[]>([]);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // ✅ Load session data
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

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/kpis?department=all&sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`);
        const data = await response.json();
        if (data.status) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [sessionData]);

  useEffect(() => {
    if (!sessionData.url) return;

    const fetchSkillGaps = async () => {
      try {
        const response = await fetch(`${sessionData.url}/api/skill-gaps?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&department=all&role=all&skillCategory=all&sort=gap&order=desc`);
        const result = await response.json();
        if (result.success) {
          const mappedData = result.data.map((item: any) => ({
            skill: item.skill,
            gap: item.gap,
            expectedScore: parseFloat(item.expectedScore),
            actualScore: item.actualScore
          }));
          setSkillGapData(mappedData);
        }
      } catch (error) {
        console.error('Error fetching skill gaps:', error);
      }
    };

    fetchSkillGaps();
  }, [sessionData]);

  // Mock data for time-series trend analysis
  const trendData = [
    { period: "Q1 2025", coverage: 65, avgGap: 2.1 },
    { period: "Q2 2025", coverage: 68, avgGap: 1.9 },
    { period: "Q3 2025", coverage: 72, avgGap: 1.8 },
    { period: "Q4 2025", coverage: 75, avgGap: 1.6 }
  ];

  const handleClearFilters = () => {
    setSelectedDepartment("all");
    setSelectedRole("all");
    setSelectedSkillCategory("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Employee Skill Coverage Matrix</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Measure alignment of workforce skills with organizational competency expectations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Q3 2025
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* KPI Summary */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 border rounded-lg">Loading...</div>
            <div className="p-6 border rounded-lg">Loading...</div>
            <div className="p-6 border rounded-lg">Loading...</div>
            <div className="p-6 border rounded-lg">Loading...</div>
          </div>
        ) : metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Overall Skill Coverage"
                value={`${metrics.overallSkillCoverage}%`}
                subtitle="of skills meeting proficiency"
                icon={Target}
                trend={{ value: 5, label: "vs last quarter" }}
                status="warning"
              />
              <KPICard
                title="Avg Skill Gap"
                value={metrics.avgSkillGap.toString()}
                subtitle="points below expected"
                icon={TrendingDown}
                trend={{ value: -3, label: "improvement" }}
                status="good"
              />
              <KPICard
                title="Critical Deficiencies"
                value={metrics.criticalDeficiencies.toString()}
                subtitle="high-priority skills"
                icon={AlertCircle}
                status="critical"
              />
              <KPICard
                title="Training Urgency Index"
                value={metrics.trainingUrgencyIndex.toString()}
                subtitle="out of 100"
                icon={Activity}
                status="warning"
              />
            </div>
        ) : (
          <div className="mb-8">Error loading metrics</div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              selectedDepartment={selectedDepartment}
              selectedRole={selectedRole}
              selectedSkillCategory={selectedSkillCategory}
              onDepartmentChange={setSelectedDepartment}
              onRoleChange={setSelectedRole}
              onSkillCategoryChange={setSelectedSkillCategory}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Visualizations */}
          <div className="lg:col-span-3 space-y-6">
            <SkillCoverageMatrix />
            <SkillGapChart data={skillGapData} />
            <TrendlineChart data={trendData} />
            <InsightPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
