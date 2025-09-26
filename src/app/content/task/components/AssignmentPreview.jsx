import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '@/components/taskComponent/ui/Button';

const AssignmentPreview = ({ taskData, onClose, onConfirm }) => {
  if (!taskData) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-primary bg-primary/10 border-primary/20';
      case 'low': return 'text-muted-foreground bg-muted border-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'skill-assessment': return 'Target';
      case 'course-assignment': return 'BookOpen';
      case 'project-task': return 'Briefcase';
      case 'training-module': return 'GraduationCap';
      case 'certification': return 'Award';
      case 'mentoring': return 'Users';
      default: return 'FileText';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-500 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={getTypeIcon(taskData.type)} size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Assignment Preview</h2>
              <p className="text-sm text-muted-foreground">Review before sending to employees</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              iconName="X"
              iconPosition="left"
            >
              Close
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onConfirm}
              iconName="Send"
              iconPosition="left"
            >
              Confirm & Send
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Task Overview */}
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{taskData.title}</h3>
                  <p className="text-muted-foreground">{taskData.description}</p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(taskData.priority)}`}>
                    {taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1)} Priority
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Calendar" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Due Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(taskData.dueDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Icon name="Clock" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Estimated Time</p>
                    <p className="text-sm text-muted-foreground">{taskData.estimatedHours || 'Not specified'} hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Icon name="Tag" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Category</p>
                    <p className="text-sm text-muted-foreground">{taskData.category || 'General'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Employees */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Assigned to {taskData.assignedTo?.length || 0} Employee{(taskData.assignedTo?.length || 0) !== 1 ? 's' : ''}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskData.assignedTo?.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground">{employee.name}</h5>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Icon name="CheckCircle" size={12} className="text-success" />
                          <span>{employee.completedTasks} completed</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Icon name="Clock" size={12} className="text-warning" />
                          <span>{employee.pendingTasks} pending</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Details */}
            {(taskData.skills?.length > 0 || taskData.completionCriteria) && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Task Details</h4>
                
                {taskData.skills?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Related Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {taskData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {taskData.completionCriteria && (
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Completion Criteria</h5>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-foreground">{taskData.completionCriteria}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${taskData.notifyOnStart ? 'bg-success' : 'bg-muted'}`} />
                  <span className="text-sm text-foreground">Notify on assignment</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${taskData.notifyOnCompletion ? 'bg-success' : 'bg-muted'}`} />
                  <span className="text-sm text-foreground">Notify on completion</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${taskData.allowExtensions ? 'bg-success' : 'bg-muted'}`} />
                  <span className="text-sm text-foreground">Allow extensions</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${taskData.requireApproval ? 'bg-success' : 'bg-muted'}`} />
                  <span className="text-sm text-foreground">Require approval</span>
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Email Preview</h4>
              
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-foreground">Subject:</span>
                    <span className="text-muted-foreground">New Task Assignment: {taskData.title}</span>
                  </div>
                </div>
                
                <div className="p-6 bg-background">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      You have been assigned a new task
                    </h3>
                    
                    <div className="space-y-4 text-sm">
                      <p className="text-foreground">
                        <strong>Task:</strong> {taskData.title}
                      </p>
                      
                      <p className="text-foreground">
                        <strong>Description:</strong> {taskData.description}
                      </p>
                      
                      <p className="text-foreground">
                        <strong>Due Date:</strong> {formatDate(taskData.dueDate)}
                      </p>
                      
                      {taskData.estimatedHours && (
                        <p className="text-foreground">
                          <strong>Estimated Time:</strong> {taskData.estimatedHours} hours
                        </p>
                      )}
                      
                      <div className="mt-6">
                        <Button variant="default" size="sm">
                          View Task Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPreview;