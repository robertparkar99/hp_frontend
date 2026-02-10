"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import Icon from "@/components/AppIcon"
import { OrganizationTree } from "./OrganizationTree";
import { RecentActivity } from "./RecentActivity";
import OrganizationInfoForm from "@/app/content/organization-profile-management/components/OrganizationInfoForm";
import UserManagement from "@/app/content/user";
import DepartmentStructure from "@/app/content/organization-profile-management/components/DepartmentStructure";
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
  org_data?: Array<{
    id: number;
    legal_name: string;
    cin: string;
    gstin: string;
    pan: string;
    registered_address: string;
    industry: string;
    employee_count: string;
    work_week: string;
    logo: string;
    sub_institute_id: number;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
  }>;
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

  const [activeView, setActiveView] = useState<"dashboard" | "organizationInfo" | "userManagement" | "departmentStructure">(
    "dashboard"
  );

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
      if (!sessionData) return;

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

  const getOrganizationName = () => {
    try {
      if (data?.org_data && data.org_data.length > 0 && data.org_data[0].legal_name) {
        return data.org_data[0].legal_name;
      }
      return data?.message || "Organization Name";
    } catch (error) {
      console.error("Error getting organization name:", error);
      return data?.message || "Organization Name";
    }
  };

  // 🔹 Responsive layout states
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔹 switch view rendering
  if (activeView === "organizationInfo") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveView("dashboard")}
            className="mr-4"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Organization Information</h1>
        </div>
        <OrganizationInfoForm
          onSave={() => {
            setActiveView("dashboard");
          }}
        />
      </div>
    );
  }

  if (activeView === "userManagement") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveView("dashboard")}
            className="mr-4"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">User Management</h1>
        </div>
        <UserManagement />
      </div>
    );
  }

  if (activeView === "departmentStructure") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 rounded-xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setActiveView("dashboard")}
            className="mr-4"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Department Structure</h1>
        </div>
        <DepartmentStructure onSave="" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-xl">
      <div className="flex">
        <main className="flex-1 p-4 md:p-6 rounded-xl space-y-4 md:space-y-6 overflow-x-hidden max-w-full">
          {/* Header - Fixed alignment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              Organization Dashboard
            </h1>
            
            {/* Organization Name - Responsive positioning */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-sm sm:text-lg font-semibold text-primary truncate max-w-[180px] sm:max-w-none">
                {loading ? "Loading..." : getOrganizationName()}
              </span>
              <button
                onClick={() => setActiveView("organizationInfo")}
                className="bg-blue-500 hover:bg-blue-700 text-white text-xs p-1.5 sm:py-1 sm:px-2 rounded flex-shrink-0"
              >
                <span className="mdi mdi-pencil text-sm"></span>
              </button>
            </div>
          </div>

          {/* Metrics Grid - Responsive and equal heights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            <div className="relative">
              <MetricCard
                title="Total Employees"
                value={loading ? "..." : data?.total_employees?.toString() || "0"}
                icon={Users}
              />
              <button
                onClick={() => setActiveView("userManagement")}
                className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
                aria-label="View user management"
              >
                <Icon name="Eye" size={20} />
              </button>
            </div>

            <div className="relative">
              <MetricCard
                title="Departments"
                value={loading ? "..." : data?.total_departments?.toString() || "0"}
                icon={Building2}
              />
              <button
                onClick={() => setActiveView("departmentStructure")}
                className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
                aria-label="View department structure"
              >
                <Icon name="Eye" size={20} />
              </button>
            </div>

            <MetricCard
              title="Compliance"
              value={loading ? "..." : data?.total_complainces?.toString() || "0"}
              icon={ShieldCheck}
            />

            <MetricCard
              title="Disciplinary"
              value={loading ? "..." : data?.total_disciplinary?.toString() || "0"}
              icon={AudioLines}
            />
          </div>

          {/* Organization + Activity - Responsive grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 w-full overflow-hidden">
              <OrganizationTree departments={data?.departments || {}} />
            </div>
            <div className="lg:col-span-1 w-full">
              <RecentActivity activities={data?.complainceData || []} />
            </div>
          </div>

          {/* Quick Actions & Department Performance - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Quick Actions Card */}
            <Card className="w-full overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Activity className="text-blue-400 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                  onClick={() => setActiveView("organizationInfo")}
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">Manage Organization</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                  onClick={() => setActiveView("departmentStructure")}
                >
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">Manage Departments</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                  onClick={() => setActiveView("userManagement")}
                >
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">Manage Users</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 px-2"
                >
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  <span className="text-xs sm:text-sm">View Analytics</span>
                </Button>
              </CardContent>
            </Card>

            {/* Disciplinary Card */}
            <Card className="w-full h-auto sm:h-70 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <AudioLines className="text-blue-400 h-5 w-5" />
                  Disciplinary
                </CardTitle>
              </CardHeader>
              <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[300px] sm:max-h-[280px] pr-2 scrollbar-hide p-4">
                {departmentOverview.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent disciplinary data
                  </p>
                ) : (
                  departmentOverview.map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg min-h-[70px]"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-sm sm:text-base truncate">{dept.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {dept.employees}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-xs sm:text-sm font-medium ${
                            dept.positive ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          {dept.change}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {dept.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
