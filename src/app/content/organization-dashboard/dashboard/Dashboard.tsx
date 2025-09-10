"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import { OrganizationTree } from "./OrganizationTree";
import { RecentActivity } from "./RecentActivity";
import {
  Users,
  Building2,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  AudioLines,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DisciplinaryItem = {
  id: number;
  department_id: number;
  employee_id: number;
  incident_datetime: string;
  location: string;
  misconduct_type: string;
  description: string;
  witness_id: number;
  action_taken: string;
  remarks: string;
  reported_by: number;
  date_of_report: string;
  sub_institute_id: number;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  department_name: string;
  employee_name: string;
  witness_name: string;
  reported_by_name: string;
};

type DashboardData = {
  status: number;
  message: string;
  total_employees: number;
  total_departments: number;
  total_complainces: number;
  total_disciplinary: number;
  departments: Record<string, unknown>;
  complainceData: any[];
  discliplinaryManagement: DisciplinaryItem[];
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [sessionData, setSessionData] = useState<{
    url: string;
    token: string;
    subInstituteId: string;
    orgType: string;
    userId: string;
  } | null>(null);

  // 🔹 Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id, org_type, user_id } =
          JSON.parse(userData);

        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: String(sub_institute_id),
          orgType: org_type,
          userId: String(user_id),
        });
      } catch (e) {
        console.error("Invalid userData in localStorage", e);
      }
    }
  }, []);

  // 🔹 Fetch dashboard when sessionData is ready
  useEffect(() => {
    async function fetchDashboard() {
      if (!sessionData) return; // wait until session data is ready

      setLoading(true);
      try {
        const res = await fetch(
          `${sessionData.url}/organization_dashboard?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&user_id=${sessionData.userId}&user_profile_id=1&user_profile_name=admin&org_type=${sessionData.orgType}&syear=2025`
        );

        if (!res.ok) throw new Error("Failed to fetch dashboard");

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [sessionData]);

  // 🔹 Map API disciplinary data → department overview cards
  const departmentOverview =
    data?.discliplinaryManagement?.map((item) => ({
      name: item.employee_name,
      employees: item.department_name,
      change: item.misconduct_type,
      status: item.action_taken,
      positive: item.action_taken
        ? item.action_taken.toLowerCase().includes("counseling")
        : false,
    })) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Organization Dashboard
            </h1>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Employees"
              value={loading ? "..." : data?.total_employees?.toString() || "0"}
              change={{ value: "+12 this month", type: "positive" }}
              icon={Users}
              description="Active users in the organization"
            />
            <MetricCard
              title="Departments"
              value={loading ? "..." : data?.total_departments?.toString() || "0"}
              change={{ value: "+1 this month", type: "positive" }}
              icon={Building2}
              description="Active departments and teams"
            />
            <MetricCard
              title="Compliance"
              value={loading ? "..." : data?.total_complainces?.toString() || "0"}
              change={{ value: "-3 from last week", type: "negative" }}
              icon={ShieldCheck}
              description="Awaiting management approval"
            />
            <MetricCard
              title="Disciplinary"
              value={loading ? "..." : data?.total_disciplinary?.toString() || "0"}
              change={{ value: "+2 vs last quarter", type: "positive" }}
              icon={AudioLines}
              description="Active disciplinary actions"
            />
          </div>

          {/* Organization + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OrganizationTree departments={data?.departments || {}} />
            </div>
            <div className="lg:col-span-1 ">
              <RecentActivity activities={data?.complainceData || []} />
            </div>
          </div>

          {/* Quick Actions & Department Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <span className="text-sm">Edit Structure</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <span className="text-sm">Assign Roles</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span className="text-sm">View Analytics</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="h-70 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AudioLines className="text-primary" />
                  Diciplinary
                </CardTitle>
              </CardHeader>
              <div className="space-y-4 overflow-y-auto h-[280px] pr-2 scrollbar-hide p-4">
                {departmentOverview.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dept.employees}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          dept.positive ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {dept.change}
                      </p>
                      <p className="text-xs text-muted-foreground">{dept.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
