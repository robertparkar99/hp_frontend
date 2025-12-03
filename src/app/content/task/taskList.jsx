import React, { useState } from 'react';
import TaskManagement from '../../content/task/taskManagement';
import AssignmentPreview from './components/AssignmentPreview';
import ProgressDashboard from './components/ProgressDashboard';
import CalendarIntegration from './components/CalendarIntegration';
import Icon from '../../../components/AppIcon';
import Button from '@/components/taskComponent/ui/Button';

const TaskAssignment = () => {
  const [activeView, setActiveView] = useState('progress');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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

  return (
    <div className="min-h-screen bg-background rounded-xl">
      <main className="p-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
              <h1 className="text-2xl font-bold text-foreground">Task Progress Assignment</h1>
                <p className="text-muted-foreground text-sm">
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
            <div className="flex space-x-1 bg-[#EFF4FF] p-1 rounded-lg w-fit">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-smooth ${
                    activeView === view.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[##EAF7FF]'
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
            <div className="flex">
              {/* Task Creation Panel */}
                <TaskManagement />
            </div>
          )}

          {activeView === 'progress' && (
            <ProgressDashboard />
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

     
    </div>
  );
};

export default TaskAssignment;