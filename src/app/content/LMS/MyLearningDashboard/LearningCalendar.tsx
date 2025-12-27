import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, FileText, Video, Calendar } from "lucide-react";

interface Event {
  id: number;
  title: string;
  type: 'deadline' | 'assessment' | 'live_session';
  date: string; // ISO date string
  time: string;
  course: string;
  priority: 'high' | 'medium' | 'low';
}

const LearningCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 6, 28)); // July 28, 2025

  const upcomingEvents: Event[] = [
    {
      id: 1,
      title: "React Advanced Patterns",
      type: "deadline",
      date: "2025-07-30",
      time: "11:59 PM",
      course: "Advanced React Development",
      priority: "high"
    },
    {
      id: 2,
      title: "Data Visualization Quiz",
      type: "assessment",
      date: "2025-08-02",
      time: "2:00 PM",
      course: "Data Analysis Fundamentals",
      priority: "medium"
    },
    {
      id: 3,
      title: "Project Management Workshop",
      type: "live_session",
      date: "2025-08-05",
      time: "10:00 AM",
      course: "Leadership Essentials",
      priority: "high"
    },
    {
      id: 4,
      title: "ML Algorithm Assignment",
      type: "deadline",
      date: "2025-08-08",
      time: "11:59 PM",
      course: "Machine Learning Basics",
      priority: "low"
    }
  ];

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getEventIcon = (type: Event['type']) => {
    const iconProps = { size: 14 };
    
    switch (type) {
      case 'deadline': return <Clock {...iconProps} />;
      case 'assessment': return <FileText {...iconProps} />;
      case 'live_session': return <Video {...iconProps} />;
      default: return <Calendar {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: Event['priority']): string => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  const getEventIconColor = (type: Event['type']): string => {
    switch (type) {
      case 'deadline': return 'text-red-500';
      case 'assessment': return 'text-amber-500';
      case 'live_session': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  const getEventBackgroundColor = (type: Event['type']): string => {
    switch (type) {
      case 'deadline': return 'bg-red-100';
      case 'assessment': return 'bg-amber-100';
      case 'live_session': return 'bg-emerald-100';
      default: return 'bg-gray-100';
    }
  };

  const daysInMonth: number = getDaysInMonth(currentDate);
  const firstDay: number = getFirstDayOfMonth(currentDate);
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays: number[] = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames: string[] = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number): void => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Learning Calendar</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-8"></div>
          ))}
          {days.map((day) => {
            const hasEvent = upcomingEvents.some(event => {
              const eventDate = new Date(event.date);
              return eventDate.getDate() === day && 
                     eventDate.getMonth() === currentDate.getMonth() &&
                     eventDate.getFullYear() === currentDate.getFullYear();
            });
            const isToday = day === 28 && currentDate.getMonth() === 6; // July 28, 2025

            return (
              <div
                key={day}
                className={`h-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
                  isToday 
                    ? 'bg-blue-500 text-white font-medium' 
                    : hasEvent 
                      ? 'bg-purple-100 text-purple-700 font-medium hover:bg-purple-200' 
                      : 'hover:bg-gray-100'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventBackgroundColor(event.type)}`}>
                <div className={getEventIconColor(event.type)}>
                  {getEventIcon(event.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground truncate">{event.course}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.date)} at {event.time}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(event.priority)}`}>
                    {event.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {upcomingEvents.length > 3 && (
          <button className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium">
            View All Events ({upcomingEvents.length - 3} more)
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningCalendar;