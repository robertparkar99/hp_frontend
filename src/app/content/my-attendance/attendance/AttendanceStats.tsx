'use client';

import { TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceRecord {
  id: string;
  date: string;
  punchIn: string | null;
  punchOut: string | null;
  totalHours: number | null;
  status: 'present' | 'absent' | 'active';
}

interface ApiResponse {
  message: string;
  daysInMonth: number;
  presentDays: number;
  absentDays: number;
  percentege: number;
}

interface AttendanceStatsProps {
  attendanceRecords: AttendanceRecord[];
  apiData?: ApiResponse | null;
}

export function AttendanceStats({ attendanceRecords, apiData }: AttendanceStatsProps) {
  // Fallback calculations (local if API not available)
  const presentDaysLocal = attendanceRecords.filter(
    record => record.status === 'present' || record.status === 'active'
  ).length;

  const totalHoursLocal = attendanceRecords
    .filter(record => record.totalHours !== null)
    .reduce((sum, record) => sum + (record.totalHours || 0), 0);

  const avgHoursLocal = presentDaysLocal > 0 ? totalHoursLocal / presentDaysLocal : 0;
  const workingDaysInMonth = 22;
  const attendancePercentLocal = (presentDaysLocal / workingDaysInMonth) * 100;

  // Use API data if available
  const daysPresent = apiData ? apiData.daysInMonth : presentDaysLocal;
  const totalHours = apiData ? apiData.presentDays : totalHoursLocal;
  const avgHours = apiData ? apiData.absentDays : avgHoursLocal;
  const attendanceRate = apiData ? apiData.percentege : attendancePercentLocal;

  const stats = [
    {
      title: 'Total Days',
      value: daysPresent.toString(),
      icon: Calendar,
      color: 'text-success',
      bgColor: 'bg-success-light'
    },
    {
      title: 'Present Days',
      value: `${Math.round(totalHours * 10) / 10}`,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Absent Days',
      value: `${Math.round(avgHours * 10) / 10}`,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning-light'
    },
    {
      title: 'Attendance Rate',
      value: `${Math.round(attendanceRate)}%`,
      icon: Target,
      color:
        attendanceRate >= 90
          ? 'text-success'
          : attendanceRate >= 80
          ? 'text-warning'
          : 'text-destructive',
      bgColor:
        attendanceRate >= 90
          ? 'bg-success-light'
          : attendanceRate >= 80
          ? 'bg-warning-light'
          : 'bg-destructive/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="attendance-card hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
