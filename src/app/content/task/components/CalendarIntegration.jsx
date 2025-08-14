import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '@/components/taskComponent/ui/Button';

const CalendarIntegration = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const assignments = [
    {
      id: 1,
      title: "JavaScript Assessment",
      date: "2025-07-18",
      assignee: "Sarah Chen",
      priority: "high",
      type: "skill-assessment"
    },
    {
      id: 2,
      title: "React Course",
      date: "2025-07-20",
      assignee: "Emily Johnson",
      priority: "medium",
      type: "course-assignment"
    },
    {
      id: 3,
      title: "Leadership Training",
      date: "2025-07-22",
      assignee: "Lisa Wang",
      priority: "high",
      type: "training-module"
    },
    {
      id: 4,
      title: "Security Training",
      date: "2025-07-15",
      assignee: "James Thompson",
      priority: "urgent",
      type: "compliance"
    },
    {
      id: 5,
      title: "Project Management",
      date: "2025-07-25",
      assignee: "Anna Martinez",
      priority: "medium",
      type: "certification"
    }
  ];

  const getAssignmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return assignments.filter(assignment => assignment.date === dateString);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-error';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-primary';
      case 'low': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const workloadData = [
    { date: '2025-07-15', count: 3, level: 'high' },
    { date: '2025-07-16', count: 1, level: 'low' },
    { date: '2025-07-17', count: 2, level: 'medium' },
    { date: '2025-07-18', count: 4, level: 'high' },
    { date: '2025-07-19', count: 1, level: 'low' },
    { date: '2025-07-20', count: 2, level: 'medium' },
    { date: '2025-07-21', count: 0, level: 'none' },
    { date: '2025-07-22', count: 3, level: 'high' },
    { date: '2025-07-23', count: 1, level: 'low' },
    { date: '2025-07-24', count: 2, level: 'medium' },
    { date: '2025-07-25', count: 5, level: 'very-high' }
  ];

  const getWorkloadForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return workloadData.find(item => item.date === dateString);
  };

  const getWorkloadColor = (level) => {
    switch (level) {
      case 'very-high': return 'bg-error';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-primary';
      case 'low': return 'bg-success';
      case 'none': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const dayAssignments = getAssignmentsForDate(date);
      const workload = getWorkloadForDate(date);

      days.push(
        <div
          key={day}
          className={`h-24 p-1 border border-border cursor-pointer transition-smooth ${
            isToday ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
          } ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${
                isToday ? 'text-primary' : 'text-foreground'
              }`}>
                {day}
              </span>
              {workload && workload.level !== 'none' && (
                <div className={`w-2 h-2 rounded-full ${getWorkloadColor(workload.level)}`} />
              )}
            </div>
            
            <div className="flex-1 space-y-1 overflow-hidden">
              {dayAssignments.slice(0, 2).map((assignment) => (
                <div
                  key={assignment.id}
                  className={`text-xs px-1 py-0.5 rounded text-white truncate ${getPriorityColor(assignment.priority)}`}
                  title={`${assignment.title} - ${assignment.assignee}`}
                >
                  {assignment.title}
                </div>
              ))}
              {dayAssignments.length > 2 && (
                <div className="text-xs text-muted-foreground px-1">
                  +{dayAssignments.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Assignment Calendar</h2>
          <p className="text-muted-foreground">View deadlines and workload distribution</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Calendar"
            iconPosition="left"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {formatDate(currentDate)}
              </h3>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth(-1)}
                >
                  <Icon name="ChevronLeft" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth(1)}
                >
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 border-b border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workload Legend */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Workload Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm text-foreground">Light (1-2 tasks)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-foreground">Medium (3-4 tasks)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-sm text-foreground">Heavy (5-6 tasks)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-sm text-foreground">Overloaded (7+ tasks)</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              
              <div className="space-y-3">
                {getAssignmentsForDate(selectedDate).map((assignment) => (
                  <div key={assignment.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(assignment.priority)}`} />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground text-sm">{assignment.title}</h5>
                      <p className="text-xs text-muted-foreground">{assignment.assignee}</p>
                    </div>
                  </div>
                ))}
                
                {getAssignmentsForDate(selectedDate).length === 0 && (
                  <p className="text-sm text-muted-foreground">No assignments for this date</p>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">This Month</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Assignments</span>
                <span className="text-sm font-medium text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due This Week</span>
                <span className="text-sm font-medium text-warning">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overdue</span>
                <span className="text-sm font-medium text-error">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-medium text-success">13</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarIntegration;