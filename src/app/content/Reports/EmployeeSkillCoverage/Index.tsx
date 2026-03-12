import { useState } from "react";
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

const Index = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("all");

  // Mock data for skill coverage matrix
  const skillData = [
    {
      skill: "Data Analysis",
      roles: { 
        Analyst: { coverage: 85, expected: 4.5, actual: 4.2 },
        Manager: { coverage: 72, expected: 4.2, actual: 3.9 },
        Engineer: { coverage: 68, expected: 4.3, actual: 3.8 },
        Specialist: { coverage: 55, expected: 4.0, actual: 3.2 },
        Director: { coverage: 90, expected: 4.8, actual: 4.7 }
      }
    },
    {
      skill: "Project Leadership",
      roles: { 
        Analyst: { coverage: 45, expected: 3.5, actual: 2.8 },
        Manager: { coverage: 78, expected: 4.5, actual: 4.1 },
        Engineer: { coverage: 52, expected: 3.8, actual: 3.1 },
        Specialist: { coverage: 60, expected: 4.0, actual: 3.5 },
        Director: { coverage: 92, expected: 4.9, actual: 4.8 }
      }
    },
    {
      skill: "Technical Writing",
      roles: { 
        Analyst: { coverage: 70, expected: 4.0, actual: 3.7 },
        Manager: { coverage: 65, expected: 3.8, actual: 3.4 },
        Engineer: { coverage: 88, expected: 4.5, actual: 4.3 },
        Specialist: { coverage: 75, expected: 4.2, actual: 3.9 },
        Director: { coverage: 80, expected: 4.3, actual: 4.0 }
      }
    },
    {
      skill: "Communication",
      roles: { 
        Analyst: { coverage: 82, expected: 4.2, actual: 4.0 },
        Manager: { coverage: 90, expected: 4.8, actual: 4.6 },
        Engineer: { coverage: 70, expected: 4.0, actual: 3.6 },
        Specialist: { coverage: 78, expected: 4.3, actual: 4.0 },
        Director: { coverage: 95, expected: 4.9, actual: 4.8 }
      }
    },
    {
      skill: "Problem Solving",
      roles: { 
        Analyst: { coverage: 75, expected: 4.1, actual: 3.8 },
        Manager: { coverage: 85, expected: 4.5, actual: 4.2 },
        Engineer: { coverage: 92, expected: 4.7, actual: 4.6 },
        Specialist: { coverage: 68, expected: 4.0, actual: 3.5 },
        Director: { coverage: 88, expected: 4.6, actual: 4.4 }
      }
    },
    {
      skill: "Strategic Planning",
      roles: { 
        Analyst: { coverage: 40, expected: 3.2, actual: 2.4 },
        Manager: { coverage: 70, expected: 4.3, actual: 3.7 },
        Engineer: { coverage: 45, expected: 3.5, actual: 2.7 },
        Specialist: { coverage: 55, expected: 3.8, actual: 3.1 },
        Director: { coverage: 92, expected: 4.9, actual: 4.8 }
      }
    }
  ];

  const roles = ["Analyst", "Manager", "Engineer", "Specialist", "Director"];

  // Mock data for skill gap chart
  const skillGapData = [
    { skill: "Data Analysis", gap: 2.3, expectedScore: 4.5, actualScore: 2.2 },
    { skill: "Project Leadership", gap: 2.1, expectedScore: 4.2, actualScore: 2.1 },
    { skill: "Strategic Planning", gap: 1.9, expectedScore: 4.0, actualScore: 2.1 },
    { skill: "Analytical Thinking", gap: 1.5, expectedScore: 4.3, actualScore: 2.8 },
    { skill: "Change Management", gap: 1.2, expectedScore: 3.8, actualScore: 2.6 }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Overall Skill Coverage"
            value="72%"
            subtitle="of skills meeting proficiency"
            icon={Target}
            trend={{ value: 5, label: "vs last quarter" }}
            status="warning"
          />
          <KPICard
            title="Avg Skill Gap"
            value="1.8"
            subtitle="points below expected"
            icon={TrendingDown}
            trend={{ value: -3, label: "improvement" }}
            status="good"
          />
          <KPICard
            title="Critical Deficiencies"
            value="12"
            subtitle="high-priority skills"
            icon={AlertCircle}
            status="critical"
          />
          <KPICard
            title="Training Urgency Index"
            value="68"
            subtitle="out of 100"
            icon={Activity}
            status="warning"
          />
        </div>

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
            <SkillCoverageMatrix data={skillData} roles={roles} />
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
