import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GlobalFilters } from "./GlobalFilters";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Target,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const Index = () => {
  // KPI Data
  const kpiData = [
    {
      title: "Open Positions",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Briefcase,
    },
    {
      title: "Interview-to-Offer Ratio",
      value: "68%",
      change: "+5%",
      trend: "up",
      icon: Target,
    },
    {
      title: "Offer Acceptance Rate",
      value: "85%",
      change: "+2%",
      trend: "up",
      icon: Award,
    },
    {
      title: "Candidate Drop-off Rate",
      value: "32%",
      change: "-4%",
      trend: "down",
      icon: Users,
    },
    {
      title: "Team Performance Trend",
      value: "4.2",
      change: "+0.3",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Avg Time-to-Fill",
      value: "28 days",
      change: "-3 days",
      trend: "down",
      icon: Clock,
    },
  ];

  // Funnel Data with specific colors matching the image
  const funnelData = [
    { name: "Applications", value: 1250, fill: "#3b82f6" }, // Blue
    { name: "Shortlisted", value: 450, fill: "#10b981" }, // Green
    { name: "Interviewed", value: 180, fill: "#f59e0b" }, // Amber
    { name: "Offers", value: 85, fill: "#ef4444" }, // Red
    { name: "Hired", value: 72, fill: "#8b5cf6" }, // Purple
  ];

  // Drop-off Analysis Data
  const dropoffData = [
    { stage: "Application", voluntary: 120, involuntary: 680 },
    { stage: "Shortlist", voluntary: 80, involuntary: 190 },
    { stage: "Interview", voluntary: 25, involuntary: 70 },
    { stage: "Offer", voluntary: 8, involuntary: 5 },
  ];

  // Team Performance Trend Data
  const performanceData = [
    { period: "Q1 2024", rating: 3.8 },
    { period: "Q2 2024", rating: 3.9 },
    { period: "Q3 2024", rating: 4.0 },
    { period: "Q4 2024", rating: 4.2 },
  ];

  // Custom Tooltip for Team Performance
  const PerformanceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const currentData = payload[0].payload;
      const currentIndex = performanceData.findIndex(
        (d) => d.period === currentData.period
      );
      const previousData = currentIndex > 0 ? performanceData[currentIndex - 1] : null;
      const change = previousData
        ? ((currentData.rating - previousData.rating) / previousData.rating) * 100
        : null;

      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 transition-all duration-200">
          <p className="text-sm font-semibold text-foreground mb-2">
            {currentData.period}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Average Rating:</span>
              <span className="text-sm font-bold text-primary">
                {currentData.rating.toFixed(1)} / 5.0
              </span>
            </div>
            {change !== null && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Change:</span>
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    change >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(1)}% from previous
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Requisition Table Data
  const requisitionData = [
    {
      title: "Senior React Developer",
      age: 15,
      interviewed: 8,
      offers: 2,
      hires: 1,
      status: "Active",
    },
    {
      title: "Product Manager",
      age: 32,
      interviewed: 12,
      offers: 1,
      hires: 0,
      status: "Active",
    },
    {
      title: "UX Designer",
      age: 8,
      interviewed: 5,
      offers: 1,
      hires: 1,
      status: "Closed",
    },
    {
      title: "Backend Engineer",
      age: 45,
      interviewed: 6,
      offers: 0,
      hires: 0,
      status: "Active",
    },
    {
      title: "DevOps Engineer",
      age: 22,
      interviewed: 9,
      offers: 2,
      hires: 1,
      status: "Active",
    },
  ];

  // Alerts Data
  const alerts = [
    {
      type: "warning",
      title: "Pending Feedback",
      description: "3 interviews from last week are missing feedback",
      icon: AlertCircle,
    },
    {
      type: "error",
      title: "Aging Requisitions",
      description: "2 positions have been open for more than 30 days",
      icon: Clock,
    },
    {
      type: "success",
      title: "Internal Match Found",
      description: "2 internal candidates match the Product Manager role",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Talent Acquisition Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time hiring pipeline and team performance insights
              </p>
            </div>
            {/* <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Export Report
            </Button> */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Global Filters */}
        <div className="mb-8">
          <GlobalFilters />
        </div>

        {/* KPI Tiles */}
        {/* KPI Tiles */}
<section className="mb-8">
  <h2 className="text-lg font-semibold mb-6 text-foreground">
    Key Performance Indicators
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
    {kpiData.map((kpi, index) => (
      <Card
        key={index}
        className="rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-200"
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                {kpi.title}
              </p>
              <p className="text-3xl font-extrabold text-foreground leading-tight">
                {kpi.value}
              </p>

              <div className="flex items-center gap-1 mt-2">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs last period
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-primary/10 rounded-xl">
              <kpi.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</section>


        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recruitment Funnel */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Recruitment Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 1400]}
                    ticks={[0, 350, 700, 1050, 1400]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "2px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value) => [`${value} candidates`, "Count"]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 8, 8, 0]}
                    barSize={40}
                  >
                    {funnelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Candidate Drop-off Analysis */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Candidate Drop-off Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dropoffData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="stage"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "2px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="voluntary"
                    stackId="a"
                    fill="#3b82f6" // Blue
                    name="Voluntary"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="involuntary"
                    stackId="a"
                    fill="#ef4444" // Red
                    name="Involuntary"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Requisition Table */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="text-foreground">
              Requisition Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground border-r">
                      Requisition Title
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground border-r">
                      Age (Days)
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground border-r">
                      Interviewed
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground border-r">
                      Offers
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground border-r">
                      Hires
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requisitionData.map((req, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-medium text-foreground border-r">
                        {req.title}
                      </td>
                      <td className="p-4 text-muted-foreground border-r">{req.age}</td>
                      <td className="p-4 text-muted-foreground border-r">
                        {req.interviewed}
                      </td>
                      <td className="p-4 text-muted-foreground border-r">{req.offers}</td>
                      <td className="p-4 text-muted-foreground border-r">{req.hires}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            req.status === "Active" ? "default" : "secondary"
                          }
                          className={
                            req.status === "Active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Smart Alerts & Automation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                className={
                  alert.type === "error"
                    ? "border-red-200 bg-red-50"
                    : alert.type === "warning"
                    ? "border-amber-200 bg-amber-50"
                    : "border-green-200 bg-green-50"
                }
              >
                <alert.icon
                  className={`h-4 w-4 ${
                    alert.type === "error"
                      ? "text-red-600"
                      : alert.type === "warning"
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}
                />
                <AlertDescription>
                  <p className={`font-semibold mb-1 ${
                    alert.type === "error"
                      ? "text-red-800"
                      : alert.type === "warning"
                      ? "text-amber-800"
                      : "text-green-800"
                  }`}>
                    {alert.title}
                  </p>
                  <p className={`text-sm ${
                    alert.type === "error"
                      ? "text-red-700"
                      : alert.type === "warning"
                      ? "text-amber-700"
                      : "text-green-700"
                  }`}>
                    {alert.description}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;