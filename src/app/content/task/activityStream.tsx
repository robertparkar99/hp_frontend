//
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Task, Employee, TaskReply } from '@/components/taskComponent/types/task';
import { TaskCard } from '@/components/taskComponent/TaskCard';
import { EmployeeCard } from '@/components/taskComponent/EmployeeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity,
  HelpCircle
} from 'lucide-react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { activityStreamTourSteps, tourStyles } from '@/lib/activityStreamTourSteps';
import {
  isToday,
  isThisWeek,
  isPast,
  isFuture,
  startOfWeek,
  endOfWeek,
  format,
  subDays,
  parseISO
} from 'date-fns';
import { h2 } from 'framer-motion/m';

interface SessionData {
  url: string;
  token: string;
  orgType: string;
  subInstituteId: string;
  userId: string;
  userProfile: string;
  syear: string;
}

const ActivityStream = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [todayTaskList, setTodayTaskList] = useState<any[]>([]);
  const [upcomingTaskList, setUpcomingTaskList] = useState<any[]>([]);
  const [recentTaskLists, setRecentTaskLists] = useState<any[]>([]);
  const [employees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [sessionData, setSessionData] = useState<SessionData>({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    syear: '',
  });
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Check if tour should start (only when navigated from sidebar tour)
  useEffect(() => {
    const triggerTour = sessionStorage.getItem('triggerPageTour');
    console.log('[ActivityStream] triggerPageTour value:', triggerTour);

    if (triggerTour === 'activity-stream') {
      console.log('[ActivityStream] Starting page tour automatically');
      setShowTour(true);
      // Clean up the flag
      sessionStorage.removeItem('triggerPageTour');
    }
  }, []);

  // Initialize Shepherd tour
  useEffect(() => {
    if (showTour) {
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shepherd-theme-custom',
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: {
            enabled: true
          }
        }
      });

      // Add all steps from the tour steps file
      activityStreamTourSteps.forEach((step) => {
        const buttons = step.buttons.map((btn: any) => ({
          text: btn.text,
          action: btn.action === 'finish' ? () => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('activityStreamTourSeen', 'true');
              localStorage.setItem('activityStreamTourCompleted', 'true');
            }
            setShowTour(false);
            tour.complete();
          } : btn.action === 'back' ? tour.back : tour.next
        }));

        tour.addStep({
          id: step.id,
          title: step.title,
          text: step.text,
          attachTo: step.attachTo,
          buttons
        });
      });

      // Start tour after a small delay to ensure UI is ready
      setTimeout(() => {
        tour.start();
      }, 500);

      return () => {
        if (tour) {
          tour.complete();
        }
      };
    }
  }, [showTour]);

  // Start tour manually
  const startTour = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activityStreamTourSeen');
    }
    setShowTour(true);
  };

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, syear } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          orgType: org_type,
          subInstituteId: sub_institute_id,
          userId: user_id,
          userProfile: user_profile_name,
          syear: syear,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchTask();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${sessionData.url}/lms/lmsActivityStream?type=API&token=${sessionData.token}` +
        `&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&user_profile_id=${sessionData.userProfile}` +
        `&org_type=${sessionData.orgType}&syear=${sessionData.syear}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTasks(Array.isArray(data.allTask) ? data.allTask : []);
      setTodayTaskList([
        ...(data.today?.taskAssigned?.map((t: any) => ({...t, is_jobrole_task: false, type: 'task', status: t.status === 'IN-PROGRES' ? 'IN-PROGRESS' : t.status})) || []),
        ...(data.today?.complianceAssigned?.map((t: any) => ({...t, is_jobrole_task: false, type: 'compliance', status: t.status === 'IN-PROGRES' ? 'IN-PROGRESS' : t.status})) || [])
      ]);
      setUpcomingTaskList([
        ...(data.upcoming?.taskAssigned?.map((t: any) => ({...t, is_jobrole_task: false, type: 'task', status: t.status === 'IN-PROGRES' ? 'IN-PROGRESS' : t.status})) || []),
        ...(data.upcoming?.complianceAssigned?.map((t: any) => ({...t, is_jobrole_task: false, type: 'compliance', status: t.status === 'IN-PROGRES' ? 'IN-PROGRESS' : t.status})) || [])
      ]);
      setRecentTaskLists([
        ...(data.recent?.taskAssigned?.map((t: any) => ({...t, is_jobrole_task: false, type: 'task', status: t.status === 'IN-PROGRES' ? 'IN-PROGRESS' : t.status})) || []),
        ...(data.recent?.complianceAssigned?.map((t: any) => ({...t, is_jobrole_task: false, type: 'compliance', status: t.status === 'IN-PROGRES' ? 'IN-PROGRESS' : t.status})) || [])
      ]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

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
            updatedTask.replies = [...(task.replies || []), newReply];
          }

          return updatedTask;
        }
        return task;
      })
    );
  };

  const filteredTodayTasks = useMemo(() => {
    return todayTaskList.filter(task => {
      const matchesSearch =
        (task.task_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (task.task_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesEmployee = selectedEmployee === 'all' || task.allocatedBy === selectedEmployee;
      const matchesTaskType = taskTypeFilter === 'all' ||
        (taskTypeFilter === 'jobrole' && task.is_jobrole_task !== undefined && task.is_jobrole_task) ||
        (taskTypeFilter === 'allocated' && (!task.is_jobrole_task || task.is_jobrole_task === false));

      return matchesSearch && matchesStatus && matchesEmployee && matchesTaskType;
    });
  }, [todayTaskList, searchQuery, filterStatus, selectedEmployee, taskTypeFilter]);

  const filteredUpcomingTasks = useMemo(() => {
    return upcomingTaskList.filter(task => {
      const matchesSearch =
        (task.task_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (task.task_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesEmployee = selectedEmployee === 'all' || task.allocatedBy === selectedEmployee;
      const matchesTaskType = taskTypeFilter === 'all' ||
        (taskTypeFilter === 'jobrole' && task.is_jobrole_task !== undefined && task.is_jobrole_task) ||
        (taskTypeFilter === 'allocated' && (!task.is_jobrole_task || task.is_jobrole_task === false));

      return matchesSearch && matchesStatus && matchesEmployee && matchesTaskType;
    });
  }, [upcomingTaskList, searchQuery, filterStatus, selectedEmployee, taskTypeFilter]);

  const filteredRecentTasks = useMemo(() => {
    return recentTaskLists.filter(task => {
      const matchesSearch =
        (task.task_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (task.task_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesEmployee = selectedEmployee === 'all' || task.allocatedBy === selectedEmployee;
      const matchesTaskType = taskTypeFilter === 'all' ||
        (taskTypeFilter === 'jobrole' && task.is_jobrole_task !== undefined && task.is_jobrole_task) ||
        (taskTypeFilter === 'allocated' && (!task.is_jobrole_task || task.is_jobrole_task === false));

      return matchesSearch && matchesStatus && matchesEmployee && matchesTaskType;
    });
  }, [recentTaskLists, searchQuery, filterStatus, selectedEmployee, taskTypeFilter]);

  const stats = useMemo(() => {
    const allFilteredTasks = [
      ...filteredTodayTasks,
      ...filteredUpcomingTasks,
      ...filteredRecentTasks
    ];
    
    const total = allFilteredTasks.length;
    const completed = allFilteredTasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = allFilteredTasks.filter(t => t.status === 'IN-PROGRESS').length;
    const pending = allFilteredTasks.filter(t => t.status === 'PENDING').length;
  
    return { total, completed, inProgress, pending };
  }, [filteredTodayTasks, filteredUpcomingTasks, filteredRecentTasks]);

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <p>Loading tasks...</p>
        </div>
      </div>
      );

  return (
    <div className="bg-white rounded-xl h-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-4" id="tour-header">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Activity Stream</h1>
          <p className="text-gray-600 text-sm">Track task progress across your team</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shafow-lg shadow-blue-200" id="tour-stats-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shafow-lg shadow-blue-200" id="tour-stats-pending">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="shafow-lg shadow-blue-200" id="tour-stats-completed">
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
          <Card className="shafow-lg shadow-blue-200" id="tour-stats-inprogress">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <Card className="mb-6 shafow-lg shadow-blue-200" id="tour-filters">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-3 gap-4">
                  <div id="tour-filter-search">
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
                  <div id="tour-filter-status">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="IN-PROGRESS">IN-PROGRESS</SelectItem>
                        <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Tabs */}
            <Tabs defaultValue="today" className="w-full " id="tour-tabs">
              <TabsList className="grid w-full grid-cols-3 bg-[#EFF4FF]" id="tour-tabs-list">
                <TabsTrigger value="today" className="flex items-center gap-2" id="tour-tab-today">
                  <Calendar className="w-4 h-4" />
                  Today ({filteredTodayTasks.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center gap-2" id="tour-tab-upcoming">
                  <Clock className="w-4 h-4" />
                  Upcoming ({filteredUpcomingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-2" id="tour-tab-recent">
                  <CheckCircle className="w-4 h-4" />
                  Recent ({filteredRecentTasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                {filteredTodayTasks.length > 0 ? (
                  filteredTodayTasks.map((task, index) => (
                    <TaskCard
                      key={index}
                      task={task}
                      sessionData={sessionData}
                      onStatusUpdate={handleStatusUpdate}
                      onRefetch={fetchTask}
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
                {filteredUpcomingTasks.length > 0 ? (
                  filteredUpcomingTasks.map((task, index) => (
                    <TaskCard
                      key={index}
                      sessionData={sessionData}
                      task={task}
                      onStatusUpdate={handleStatusUpdate}
                      onRefetch={fetchTask}
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
                {filteredRecentTasks.length > 0 ? (
                  filteredRecentTasks.map((task, index) => (
                    <TaskCard
                      key={index}
                      sessionData={sessionData}
                      task={task}
                      onStatusUpdate={handleStatusUpdate}
                      onRefetch={fetchTask}
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
        </div>
      </div>
    </div>
    </div>
  );
}
}

export default ActivityStream;