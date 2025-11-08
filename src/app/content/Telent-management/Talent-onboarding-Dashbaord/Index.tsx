import { KPITile } from './KPITile';
// import { RecruitmentFunnel } from './RecruitmentFunnel';
import { DiversityTrend } from './DiversityTrend';
import { OnboardingHeatmap } from './OnboardingHeatmap';
import { PerformanceTrend } from './PerformanceTrend';
import { SuccessionMatrix } from './SuccessionMatrix';
import { AlertsPanel } from './AlertsPanel';
import { GlobalFilters } from './GlobalFilters';
import { Users, TrendingUp, Target, Award, UserCheck, Briefcase } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Talent Onboarding Dashboard</h1>
              {/* <p className="text-sm text-muted-foreground">Strategic insights into organizational talent health</p> */}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Q2 2024</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Global Filters - Moved to top */}
        <GlobalFilters />

        {/* KPI Tiles */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Performance Indicators
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            <KPITile
              title="Time-to-Hire"
              value="35 days"
              trend="down"
              trendValue="8%"
              status="success"
              description="Average days to fill a position"
            />
            <KPITile
              title="Diversity Ratio"
              value="42%"
              trend="up"
              trendValue="5%"
              status="success"
              description="Underrepresented hires"
            />
            <KPITile
              title="Onboarding Rate"
              value="89%"
              trend="up"
              trendValue="3%"
              status="success"
              description="Completed within 30 days"
            />
            <KPITile
              title="Internal Mobility"
              value="18%"
              trend="up"
              trendValue="2%"
              status="success"
              description="Promoted or transferred"
            />
            <KPITile
              title="Succession Readiness"
              value="76%"
              trend="down"
              trendValue="4%"
              status="warning"
              description="Key roles with successors"
            />
            <KPITile
              title="Retention Rate"
              value="91%"
              trend="neutral"
              trendValue="0%"
              status="success"
              description="Annual employee retention"
            />
          </div>
        </section>

        {/* Charts Row 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Each takes 50% width on large screens */}
          <div className="col-span-1">
            <DiversityTrend />
          </div>
          <div className="col-span-1">
            <PerformanceTrend />
          </div>
        </section>

        {/* Heatmap */}
        <section>
          <OnboardingHeatmap />
        </section>

        {/* Charts Row 2 */}
        <section className="grid grid-cols-1 lg:grid-cols gap-6">

          <SuccessionMatrix />
        </section>

        {/* Alerts */}
        <section>
          <AlertsPanel />
        </section>
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Talent Management Dashboard © 2024 • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;