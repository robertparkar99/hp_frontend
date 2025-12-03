import React from 'react';
import { Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { AttendanceRecord, Employee } from '../types/attendance';
import { format, isToday, parseISO } from 'date-fns';

interface StatsCardsProps {
  employees: Employee[];
  records: AttendanceRecord[];
  selectedEmployee: Employee | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ employees, records, selectedEmployee }) => {
  const todayRecords = records.filter(record => isToday(parseISO(record.date)));
  
  const getStats = () => {
    if (selectedEmployee) {
      const employeeRecords = records.filter(r => r.employeeId === selectedEmployee.id);
      const employeeTodayRecord = todayRecords.find(r => r.employeeId === selectedEmployee.id);
      const presentDays = employeeRecords.filter(r => r.status === 'present').length;
      const lateDays = employeeRecords.filter(r => r.status === 'late').length;
      const avgHours = employeeRecords
        .filter(r => r.totalHours)
        .reduce((sum, r) => sum + (r.totalHours || 0), 0) / employeeRecords.filter(r => r.totalHours).length || 0;

      return {
        totalEmployees: 1,
        presentToday: employeeTodayRecord?.status === 'present' || employeeTodayRecord?.status === 'late' ? 1 : 0,
        avgHours: avgHours.toFixed(1),
        lateToday: lateDays
      };
    } else {
      const presentToday = todayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const lateToday = todayRecords.filter(r => r.status === 'late').length;
      const allRecordsWithHours = records.filter(r => r.totalHours);
      const avgHours = allRecordsWithHours.length > 0 
        ? allRecordsWithHours.reduce((sum, r) => sum + (r.totalHours || 0), 0) / allRecordsWithHours.length 
        : 0;

      return {
        totalEmployees: employees.length,
        presentToday,
        avgHours: avgHours.toFixed(1),
        lateToday
      };
    }
  };

  const stats = getStats();

  const cards = [
    {
      title: selectedEmployee ? 'Selected Employee' : 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-400'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: Clock,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Avg Hours/Day',
      value: `${stats.avgHours}h`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: selectedEmployee ? 'Late Days' : 'Late Today',
      value: stats.lateToday,
      icon: AlertCircle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
