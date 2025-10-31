import React, { useState } from 'react';
import { Button } from "./../../../../components/ui/button";
import { 
  Bookmark, 
  FileText, 
  Bell, 
  Award, 
  Zap, 
  X, 
  Plus, 
  MoreHorizontal,
  Clock,
  BookOpen,
  AlertCircle
} from "lucide-react";

interface QuickAction {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'warning' | 'success';
  count: number;
  action: () => void;
}

interface Note {
  id: number;
  title: string;
  course: string;
  date: string;
  preview: string;
}

interface Reminder {
  id: number;
  title: string;
  course: string;
  time: string;
  type: 'deadline' | 'assessment' | 'study';
}

// Icon mapper component
const IconMapper = ({ name, size = 20, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
  const iconProps = { size, color, style: { minWidth: size, minHeight: size } };
  
  switch (name.toLowerCase()) {
    case 'bookmark':
      return <Bookmark {...iconProps} />;
    case 'file-text':
    case 'filetext':
      return <FileText {...iconProps} />;
    case 'bell':
      return <Bell {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'x':
      return <X {...iconProps} />;
    case 'plus':
      return <Plus {...iconProps} />;
    case 'more-horizontal':
    case 'morehorizontal':
      return <MoreHorizontal {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    case 'book-open':
    case 'bookopen':
      return <BookOpen {...iconProps} />;
    case 'alert-circle':
    case 'alertcircle':
      return <AlertCircle {...iconProps} />;
    default:
      return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.6, fontWeight: 'bold', color }}>{name.charAt(0)}</div>;
  }
};

const QuickActions: React.FC = () => {
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);

  const quickActions: QuickAction[] = [
    {
      id: 1,
      title: "My Bookmarks",
      description: "Access saved courses and lessons",
      icon: "bookmark",
      color: "primary",
      count: 12,
      action: () => console.log("Navigate to bookmarks")
    },
    {
      id: 2,
      title: "Learning Notes",
      description: "Review your course notes",
      icon: "file-text",
      color: "secondary",
      count: 28,
      action: () => setShowNoteModal(true)
    },
    {
      id: 3,
      title: "Set Reminders",
      description: "Schedule learning sessions",
      icon: "bell",
      color: "warning",
      count: 5,
      action: () => setShowReminderModal(true)
    },
    {
      id: 4,
      title: "Download Certificates",
      description: "Get your completion certificates",
      icon: "award",
      color: "success",
      count: 3,
      action: () => console.log("Navigate to certificates")
    }
  ];

  const recentNotes: Note[] = [
    {
      id: 1,
      title: "React Hooks Best Practices",
      course: "Advanced React Development",
      date: "2025-07-27",
      preview: "Key takeaways from useEffect optimization and custom hooks implementation..."
    },
    {
      id: 2,
      title: "Data Visualization Principles",
      course: "Data Analysis Fundamentals",
      date: "2025-07-25",
      preview: "Important concepts about choosing the right chart types and color schemes..."
    },
    {
      id: 3,
      title: "Agile Methodology Notes",
      course: "Project Management Essentials",
      date: "2025-07-23",
      preview: "Sprint planning, daily standups, and retrospective meeting guidelines..."
    }
  ];

  const upcomingReminders: Reminder[] = [
    {
      id: 1,
      title: "Complete React Assignment",
      course: "Advanced React Development",
      time: "Today, 6:00 PM",
      type: "deadline"
    },
    {
      id: 2,
      title: "Data Analysis Quiz",
      course: "Data Analysis Fundamentals",
      time: "Tomorrow, 2:00 PM",
      type: "assessment"
    },
    {
      id: 3,
      title: "Weekly Learning Session",
      course: "Machine Learning Basics",
      time: "Friday, 10:00 AM",
      type: "study"
    }
  ];

  const getIconColor = (color: QuickAction['color']): string => {
    switch (color) {
      case 'primary': return '#3b82f6'; // blue-500
      case 'secondary': return '#6b7280'; // gray-500
      case 'success': return '#10b981'; // emerald-500
      case 'warning': return '#f59e0b'; // amber-500
      default: return '#3b82f6';
    }
  };

  const getReminderIcon = (type: Reminder['type']): { name: string; color: string } => {
    switch (type) {
      case 'deadline':
        return { name: 'alert-circle', color: '#ef4444' }; // red-500
      case 'assessment':
        return { name: 'file-text', color: '#f59e0b' }; // amber-500
      case 'study':
        return { name: 'book-open', color: '#10b981' }; // emerald-500
      default:
        return { name: 'book-open', color: '#10b981' };
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <Zap size={20} className="text-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 bg-muted/50 hover:bg-muted/70 rounded-xl transition-colors text-left group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  action.color === 'primary' ? 'bg-blue-100 group-hover:bg-blue-200' :
                  action.color === 'secondary' ? 'bg-gray-100 group-hover:bg-gray-200' :
                  action.color === 'success' ? 'bg-emerald-100 group-hover:bg-emerald-200' :
                  action.color === 'warning' ? 'bg-amber-100 group-hover:bg-amber-200' : 'bg-blue-100'
                }`}>
                  <IconMapper 
                    name={action.icon} 
                    size={18} 
                    color={getIconColor(action.color)}
                  />
                </div>
                {action.count > 0 && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium min-w-[24px] text-center ${
                    action.color === 'primary' ? 'bg-blue-100 text-blue-700' :
                    action.color === 'secondary' ? 'bg-gray-100 text-gray-700' :
                    action.color === 'success' ? 'bg-emerald-100 text-emerald-700' :
                    action.color === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {action.count}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Learning Notes</h2>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">{note.title}</h3>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm text-primary mb-2">{note.course}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.preview}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <Button variant="default" className="w-full">
                <Plus size={16} className="mr-2" />
                Add New Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Learning Reminders</h2>
              <button
                onClick={() => setShowReminderModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {upcomingReminders.map((reminder) => {
                  const reminderIcon = getReminderIcon(reminder.type);
                  return (
                    <div key={reminder.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reminder.type === 'deadline' ? 'bg-red-100' :
                        reminder.type === 'assessment'? 'bg-amber-100' : 'bg-emerald-100'
                      }`}>
                        <IconMapper 
                          name={reminderIcon.name} 
                          size={18} 
                          color={reminderIcon.color}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{reminder.title}</h3>
                        <p className="text-sm text-muted-foreground">{reminder.course}</p>
                        <p className="text-sm text-primary">{reminder.time}</p>
                      </div>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <Button variant="default" className="w-full">
                <Plus size={16} className="mr-2" />
                Set New Reminder
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;