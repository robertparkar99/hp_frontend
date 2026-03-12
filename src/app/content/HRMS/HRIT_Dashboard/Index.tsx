'use client';

import { useState, useEffect } from 'react';

type KpiData = {
    present_today: string;
    leave_utilization: string;
    active_employees: number;
};
import { DashboardHeader } from '../HRIT_Dashboard/DashboardHeader';
import { KPICard } from '../HRIT_Dashboard/KPICard';
import { AttendanceChart } from '../HRIT_Dashboard/AttendanceChart';
import { LeaveChart } from '../HRIT_Dashboard/LeaveChart';
import { PayrollChart } from '../HRIT_Dashboard/PayrollChart';
import { PerformanceChart } from '../HRIT_Dashboard/PerformanceChart';
import { InsightsCard } from '../HRIT_Dashboard/InsightsCard';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui/card"; // Added missing import

const Index = () => {
    const [sessionData, setSessionData] = useState({
        url: '',
        token: '',
        subInstituteId: '',
        orgType: '',
        userId: '',
      });
    const [kpiData, setKpiData] = useState<KpiData>({
        present_today: '0%',
        leave_utilization: '0%',
        active_employees: 0
    });
    // Load session data from localStorage
      useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
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
        if (sessionData.url) {
            const fetchKpiData = async () => {
                try {
                    const response = await fetch(`${sessionData.url}/api/KPI-HRITDashboard?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`);
                    const data = await response.json();
                    setKpiData(data);
                } catch (error) {
                    console.error('Error fetching KPI data:', error);
                }
            };
            fetchKpiData();
        }
    }, [sessionData]);

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <main className="container mx-auto px-6 py-8">
                {/* KPI Overview Section */}
                <section id="overview-section" className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        
                        <KPICard
id="kpi-present-today"

                            title="Present Today"
                            value={kpiData.present_today}
                            change={3.2}
                            icon={UserCheck}
                            trend="up"
                            iconColor="text-blue-400"
                        />

                        <KPICard
                            id="kpi-leave-utilization"
                            title="Leave Utilization"
                            value={kpiData.leave_utilization}
                            change={-2.1}
                            icon={Calendar}
                            trend="down"
                             iconColor="text-blue-400"
                        />
                        {/* <KPICard
                            title="Payroll Accuracy"
                            value="99.1%"
                            change={0.8}
                            icon={DollarSign}
                            trend="up"
                             iconColor="text-blue-400"
                        />
                        <KPICard
                            title="Productivity Index"
                            value="87.4"
                            change={1.5}
                            icon={TrendingUp}
                            trend="up"
                             iconColor="text-blue-400"
                        /> */}
                        {/* <KPICard
              title="Processing Time"
              value="3.2 hrs"
              change={-12.3}
              icon={Clock}
              trend="up"
            /> */}
                        <KPICard
                            id="kpi-active-employees"
                            title="Active Employees"
                            value={kpiData?.active_employees?.toLocaleString() || '0'}
                            change={2.8}
                            icon={Users}
                            trend="up"
                             iconColor="text-blue-400"
                        />
                    </div>
                </section>

                {/* Attendance Module */}
                <section id="attendance-section" className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Attendance</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div id="attendance-chart" className="lg:col-span-3">
                            <AttendanceChart />
                        </div>
                        <div id="leave-chart" className="lg:col-span-2">
                            <LeaveChart />
                        </div>
                    </div>
                </section>

                {/* Performance Module */}
                {/* <section className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Performance</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PerformanceChart />
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                            <div className="space-y-3">
                                {[
                                    { name: "Sarah Johnson", dept: "Engineering", score: 96 },
                                    { name: "Michael Chen", dept: "Sales", score: 94 },
                                    { name: "Emily Rodriguez", dept: "Marketing", score: 92 },
                                    { name: "David Kim", dept: "Finance", score: 91 },
                                ].map((performer, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div>
                                            <p className="font-medium text-foreground">{performer.name}</p>
                                            <p className="text-sm text-muted-foreground">{performer.dept}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-success">{performer.score}</p>
                                            <p className="text-xs text-muted-foreground">Score</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </section> */}

                {/* Leave & Payroll Module */}
                <section id="payroll-section"  className="mb-8">
                    {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        {/* <div className="lg:col-span-2">
                            <PayrollChart />
                        </div> */}
                        <div id="insights-card"  className="lg:col-span-1">
                            <InsightsCard />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Index;