import React, { useState, useEffect } from 'react';
import TaskManagement from '../../content/task/taskManagement';
import AssignmentPreview from './components/AssignmentPreview';
import ProgressDashboard from './components/ProgressDashboard';
import TaskAssignmentTour from './components/TaskAssignmentTour';
import CalendarIntegration from './components/CalendarIntegration';
import Icon from '../../../components/AppIcon';
import Button from '@/components/taskComponent/ui/Button';

const TaskAssignment = () => {
  const [activeView, setActiveView] = useState('progress');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check if tour should start (only when navigated from sidebar tour)
  useEffect(() => {
    const triggerTour = sessionStorage.getItem('triggerPageTour');
    console.log('[TaskList] triggerPageTour value:', triggerTour);

    if (triggerTour === 'task-list') {
      console.log('[TaskList] Starting page tour automatically');
      setShowTour(true);
      // Clean up the flag
      sessionStorage.removeItem('triggerPageTour');
    }
  }, []);

  const views = [
    { id: 'progress', label: 'Progress Dashboard', icon: 'BarChart3' },
    { id: 'assignment', label: 'New Assignment', icon: 'Plus' },
    // { id: 'calendar', label: 'Calendar View', icon: 'Calendar' }
  ];

  const handleTaskCreate = (taskData) => {
    console.log('Creating task:', taskData);
    // Here you would typically send the data to your backend
    alert('Task assignment created successfully!');
    setSelectedEmployees([]);
    setShowPreview(false);
  };

  const handlePreview = (taskData) => {
    setPreviewData(taskData);
    setShowPreview(true);
  };

  const handleConfirmAssignment = () => {
    if (previewData) {
      handleTaskCreate(previewData);
    }
  };

  // Handle view switching from tour
  const handleSwitchView = (view) => {
    setActiveView(view);
  };

  return (
    <div className="w-full bg-background">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6 md:mb-8" id="task-assignment-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Task Progress Assignment</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Assign learning tasks, assessments, and development activities to employees
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export Data
                </Button> */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  iconName="Settings"
                  iconPosition="left"
                >
                  Settings
                </Button> */}
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex flex-wrap gap-1 bg-[#EFF4FF] p-1 rounded-lg w-full sm:w-fit" id="task-assignment-tabs">
              {views.map((view) => (
                <button
                  id={view.id === 'assignment' ? 'tab-assignment' : `tab-${view.id}`}
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-smooth whitespace-nowrap ${
                    activeView === view.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#EAF7FF]'
                  }`}
                >
                  <Icon name={view.icon} size={16} />
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeView === 'assignment' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Task Creation Panel */}
              <TaskManagement />
            </div>
          )}

          {activeView === 'progress' && (
<div id="task-dashboard-section">
<ProgressDashboard />
</div>
          )}

          {/* {activeView === 'calendar' && (
            <CalendarIntegration />
          )} */}
        </main>

      {/* Assignment Preview Modal */}
      {showPreview && (
        <AssignmentPreview
          taskData={previewData}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmAssignment}
        />
      )}

      {/* Task Assignment Tour */}
      {showTour && <TaskAssignmentTour onComplete={() => { setShowTour(false); }} onSwitchView={handleSwitchView} />}

    </div>
  );
};

export default TaskAssignment;