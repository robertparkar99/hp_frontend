import React, { useState } from 'react';
import { cn } from "@/components/utils/cn";
import Icon from '@/components/AppIcon';
import Button from './Button';

const QuickActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location ='';
  const navigate = '';

  const getContextualActions = () => {
    const currentPath = location.pathname;
    
    switch (currentPath) {
      case '/dashboard':
        return [
          { label: 'New Assignment', icon: 'Plus', action: () => navigate('/task-assignment') },
          { label: 'Start Assessment', icon: 'Target', action: () => navigate('/skill-assessment') },
          { label: 'Add Employee', icon: 'UserPlus', action: () => navigate('/employee-directory') },
          { label: 'Create Course', icon: 'BookOpen', action: () => navigate('/course-management') }
        ];
      
      case '/employee-directory':
        return [
          { label: 'Add Employee', icon: 'UserPlus', action: () => console.log('Add employee') },
          { label: 'Assign Task', icon: 'CheckSquare', action: () => navigate('/task-assignment') },
          { label: 'Bulk Import', icon: 'Upload', action: () => console.log('Bulk import') },
          { label: 'Export Data', icon: 'Download', action: () => console.log('Export data') }
        ];
      
      case '/skills-library':
        return [
          { label: 'Add Skill', icon: 'Plus', action: () => console.log('Add skill') },
          { label: 'Start Assessment', icon: 'Target', action: () => navigate('/skill-assessment') },
          { label: 'Import Skills', icon: 'Upload', action: () => console.log('Import skills') },
          { label: 'Skill Matrix', icon: 'Grid3X3', action: () => console.log('Skill matrix') }
        ];
      
      case '/course-management':
        return [
          { label: 'Create Course', icon: 'BookOpen', action: () => console.log('Create course') },
          { label: 'Add Module', icon: 'Plus', action: () => console.log('Add module') },
          { label: 'Upload Content', icon: 'Upload', action: () => console.log('Upload content') },
          { label: 'Preview Course', icon: 'Eye', action: () => console.log('Preview course') }
        ];
      
      case '/task-assignment':
        return [
          { label: 'New Assignment', icon: 'Plus', action: () => console.log('New assignment') },
          { label: 'Bulk Assign', icon: 'Users', action: () => console.log('Bulk assign') },
          { label: 'Set Reminder', icon: 'Bell', action: () => console.log('Set reminder') },
          { label: 'View Reports', icon: 'BarChart3', action: () => console.log('View reports') }
        ];
      
      case '/skill-assessment':
        return [
          { label: 'New Assessment', icon: 'Plus', action: () => console.log('New assessment') },
          { label: 'Quick Test', icon: 'Zap', action: () => console.log('Quick test') },
          { label: 'View Results', icon: 'BarChart3', action: () => console.log('View results') },
          { label: 'Schedule Assessment', icon: 'Calendar', action: () => console.log('Schedule assessment') }
        ];
      
      default:
        return [
          { label: 'Go to Dashboard', icon: 'Home', action: () => navigate('/dashboard') },
          { label: 'New Assignment', icon: 'Plus', action: () => navigate('/task-assignment') },
          { label: 'Start Assessment', icon: 'Target', action: () => navigate('/skill-assessment') }
        ];
    }
  };

  const actions = getContextualActions();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Quick Action Button */}
      <div className="fixed bottom-6 right-6 z-400 lg:bottom-8 lg:right-8">
        <div className="relative">
          {/* Action Items */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 space-y-3 mb-2">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="bg-popover text-popover-foreground px-3 py-2 rounded-md text-sm font-medium shadow-modal whitespace-nowrap">
                    {action.label}
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleActionClick(action.action)}
                    className="w-12 h-12 shadow-modal hover:scale-105 transition-all duration-200"
                  >
                    <Icon name={action.icon} size={20} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Main FAB */}
          <Button
            variant="default"
            size="icon"
            onClick={toggleMenu}
            className={`w-14 h-14 shadow-modal hover:scale-105 transition-all duration-200 ${
              isOpen ? 'rotate-45' : 'rotate-0'
            }`}
          >
            <Icon name="Plus" size={24} />
          </Button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Bottom Spacing */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

export default QuickActionMenu;