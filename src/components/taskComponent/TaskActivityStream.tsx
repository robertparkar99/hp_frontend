"use client";

import { useState, useMemo } from 'react';
import { Task, Employee, TaskReply } from './types/task';
import { TaskCard } from './TaskCard';
import { EmployeeCard } from './EmployeeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { 
  isToday, 
  isThisWeek, 
  isPast, 
  isFuture, 
  startOfWeek, 
  endOfWeek,
  format,
  subDays
} from 'date-fns';

// Mock data - replace with your actual data source
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    department: 'Development',
    role: 'Senior Developer',
    tasksCompleted: 24,
    tasksInProgress: 5,
    tasksPending: 3
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    department: 'Design',
    role: 'UI/UX Designer',
    tasksCompleted: 18,
    tasksInProgress: 4,
    tasksPending: 2
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.wilson@company.com',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    department: 'Marketing',
    role: 'Marketing Manager',
    tasksCompleted: 31,
    tasksInProgress: 7,
    tasksPending: 4
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication system',
    description: 'Create secure login/logout functionality with JWT tokens and password hashing',
    status: 'in-progress',
    priority: 'high',
    assignedTo: '1',
    assignedBy: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Development',
    tags: ['backend', 'security', 'authentication'],
    replies: [
      {
        id: '1',
        taskId: '1',
        message: 'Started working on the JWT implementation. Should have initial version ready by tomorrow.',
        author: '1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        statusUpdate: 'in-progress'
      }
    ]
  },
  {
    id: '2',
    title: 'Design mobile app wireframes',
    description: 'Create wireframes for the mobile application focusing on user experience',
    status: 'completed',
    priority: 'medium',
    assignedTo: '2',
    assignedBy: '3',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date().toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Design',
    tags: ['mobile', 'wireframes', 'ux'],
    replies: [
      {
        id: '2',
        taskId: '2',
        message: 'Wireframes completed and shared with the team. Ready for review.',
        author: '2',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        statusUpdate: 'completed'
      }
    ]
  },
  {
    id: '3',
    title: 'Prepare Q4 marketing campaign',
    description: 'Plan and execute marketing strategies for the fourth quarter',
    status: 'pending',
    priority: 'high',
    assignedTo: '3',
    assignedBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Marketing',
    tags: ['campaign', 'q4', 'strategy'],
    replies: []
  },
  {
    id: '4',
    title: 'Update API documentation',
    description: 'Review and update all API endpoints documentation with latest changes',
    status: 'overdue',
    priority: 'medium',
    assignedTo: '1',
    assignedBy: '2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Documentation',
    tags: ['api', 'documentation', 'backend'],
    replies: []
  }
];

export function TaskActivityStream() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const handleStatusUpdate = (taskId: string, newStatus: Task['status'], replyMessage?: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            ...(newStatus === 'completed' && { completedAt: new Date().toISOString() })
          };

          if (replyMessage) {
            const newReply: TaskReply = {
              id: Date.now().toString(),
              taskId,
              message: replyMessage,
              author: '1', // Current user ID
              createdAt: new Date().toISOString(),
              statusUpdate: newStatus
            };
            updatedTask.replies = [...task.replies, newReply];
          }

          return updatedTask;
        }
        return task;
      })
    );
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesEmployee = selectedEmployee === 'all' || task.assignedTo === selectedEmployee;
      
      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [tasks, searchQuery, filterStatus, selectedEmployee]);

  const todayTasks = filteredTasks.filter(task => isToday(new Date(task.dueDate)));
  const upcomingTasks = filteredTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return isThisWeek(dueDate) && isFuture(dueDate) && !isToday(dueDate);
  });
  const recentTasks = filteredTasks.filter(task => {
    const updatedDate = new Date(task.updatedAt);
    return isPast(updatedDate) && updatedDate >= subDays(new Date(), 7);
  });

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length;
    const overdue = filteredTasks.filter(t => t.status === 'overdue').length;
    
    return { total, completed, inProgress, overdue };
  }, [filteredTasks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Activity Stream</h1>
          <p className="text-gray-600">Manage and track task progress across your team</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Tabs */}
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Today ({todayTasks.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Upcoming ({upcomingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Recent ({recentTasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                {todayTasks.length > 0 ? (
                  todayTasks.map(task => (
                    <TaskCard
                    sessionData={null}
                      key={task.id}
                      task={task}
                      onStatusUpdate={handleStatusUpdate}
                      employees={employees}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks for today</h3>
                    <p className="text-gray-600">You're all caught up for today!</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map(task => (
                    <TaskCard
                    sessionData={null}
                      key={task.id}
                      task={task}
                      onStatusUpdate={handleStatusUpdate}
                      employees={employees}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming tasks</h3>
                    <p className="text-gray-600">No tasks scheduled for this week.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                {recentTasks.length > 0 ? (
                  recentTasks.map(task => (
                    <TaskCard
                      sessionData={null} // Add missing required prop
                      key={task.id}
                      task={task}
                      onStatusUpdate={handleStatusUpdate}
                      employees={employees}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-gray-600">No tasks have been updated recently.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map(employee => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}