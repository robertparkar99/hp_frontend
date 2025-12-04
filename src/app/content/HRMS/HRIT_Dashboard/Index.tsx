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
    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <main className="container mx-auto px-6 py-8">
                {/* KPI Overview Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <KPICard
                            title="Present Today"
                            value="92.3%"
                            change={3.2}
                            icon={UserCheck}
                            trend="up"
                            iconColor="text-blue-400"
                        />

                        <KPICard
                            title="Leave Utilization"
                            value="68.5%"
                            change={-2.1}
                            icon={Calendar}
                            trend="down"
                             iconColor="text-blue-400"
                        />
                        <KPICard
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
                        />
                        {/* <KPICard
              title="Processing Time"
              value="3.2 hrs"
              change={-12.3}
              icon={Clock}
              trend="up"
            /> */}
                        <KPICard
                            title="Active Employees"
                            value="1,247"
                            change={2.8}
                            icon={Users}
                            trend="up"
                             iconColor="text-blue-400"
                        />
                    </div>
                </section>

                {/* Attendance Module */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Attendance</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3">
                            <AttendanceChart />
                        </div>
                        <div className="lg:col-span-2">
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
                <section className="mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <PayrollChart />
                        </div>
                        <div className="lg:col-span-1">
                            <InsightsCard />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Index;