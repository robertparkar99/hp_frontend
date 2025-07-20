"use client";

import { Employee } from './types/task';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Mail, User, Building, CheckCircle, Circle, Clock } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const totalTasks = employee.tasksCompleted + employee.tasksInProgress + employee.tasksPending;
  const completionRate = totalTasks > 0 ? (employee.tasksCompleted / totalTasks) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="text-lg font-semibold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-xl text-gray-900">{employee.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              <span>{employee.department}</span>
              <span>•</span>
              <span>{employee.role}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Mail className="w-4 h-4" />
              <span>{employee.email}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Task Completion Rate</span>
              <span className="text-sm font-semibold text-gray-900">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <div className="text-xl font-bold text-green-600">{employee.tasksCompleted}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Circle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">In Progress</span>
              </div>
              <div className="text-xl font-bold text-blue-600">{employee.tasksInProgress}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <div className="text-xl font-bold text-gray-600">{employee.tasksPending}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}