import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, FileText, Video, Calendar } from "lucide-react";

interface Event {
  id: number;
  title: string;
  type: 'deadline' | 'assessment' | 'live_session';
  date: string; // ISO date string
  time: string;
  course: string;
  priority: 'high' | 'medium' | 'low';
  displayDateTime: string;
}

const LearningCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  const mapType = (eventType: string): Event['type'] => {
    switch (eventType.toLowerCase()) {
      case 'high': return 'deadline';
      case 'medium': return 'assessment';
      case 'low': return 'live_session';
      default: return 'deadline';
    }
  };

  const parseCurrentDateTime = (currentDateTime: string, year: string): Date | null => {
    const parts = currentDateTime.split(' at ');
    if (parts.length !== 2) return null;
    const datePart = parts[0]; // "Jan 06"
    const timePart = parts[1]; // "5:56 AM"
    const [monthStr, dayStr] = datePart.split(' ');
    const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
    const day = parseInt(dayStr);
    const timeMatch = timePart.match(/(\d+):(\d+) (\w+)/);
    if (!timeMatch) return null;
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const ampm = timeMatch[3];
    const hour24 = ampm === 'PM' && hour !== 12 ? hour + 12 : hour === 12 && ampm === 'AM' ? 0 : hour;
    return new Date(parseInt(year), monthIndex, day, hour24, minute);
  };

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
});

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
    if (sessionData.url && sessionData.token && sessionData.subInstituteId && sessionData.userId) {
      fetch(`${sessionData.url}/api/skill-development/calendar?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setCurrentDate(new Date(parseInt(data.data.year), parseInt(data.data.month) - 1, 1));
            const mappedEvents = data.data.events.map((item: any, index: number) => {
              const eventDate = parseCurrentDateTime(item.current_datetime, data.data.year);
              return {
                id: index,
                title: item.title,
                type: mapType(item.priority),
                date: eventDate ? eventDate.toISOString().split('T')[0] : '',
                time: eventDate ? eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "All day",
                course: item.description,
                priority: item.priority as 'high' | 'medium' | 'low',
                displayDateTime: item.current_datetime,
              };
            });
            setEvents(mappedEvents);
          }
        })
        .catch(err => console.error('Error fetching calendar data:', err));
    }
  }, [sessionData]);

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
            const hasEvent = events.some(event => {
              const eventDate = new Date(event.date);
              return eventDate.getDate() === day &&
                     eventDate.getMonth() === currentDate.getMonth() &&
                     eventDate.getFullYear() === currentDate.getFullYear();
            });
            const today = new Date();
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

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
          {events.slice(0, 3).map((event) => (
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
  {event.displayDateTime}
</span>

                  <span className={`text-xs font-medium ${getPriorityColor(event.priority)}`}>
                    {event.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {events.length > 3 && (
          <button className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium">
            View All Events ({events.length - 3} more)
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningCalendar;