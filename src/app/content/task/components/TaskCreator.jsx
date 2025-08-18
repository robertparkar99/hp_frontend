import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Input from '@/components/taskComponent/ui/Input';
import Select from '@/components/taskComponent/ui/Select';
import Button from '@/components/taskComponent/ui/Button';
import { Checkbox } from '@/components/taskComponent/ui/Checkbox';

const TaskCreator = ({ selectedEmployees, onTaskCreate, onPreview }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: '',
    category: '',
    skills: [],
    completionCriteria: '',
    notifyOnStart: true,
    notifyOnCompletion: true,
    allowExtensions: false,
    requireApproval: false
  });

  const [activeTab, setActiveTab] = useState('basic');

  const taskTypes = [
    { value: 'skill-assessment', label: 'Skill Assessment' },
    { value: 'course-assignment', label: 'Course Assignment' },
    { value: 'project-task', label: 'Project Task' },
    { value: 'training-module', label: 'Training Module' },
    { value: 'certification', label: 'Certification' },
    { value: 'mentoring', label: 'Mentoring Session' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const categoryOptions = [
    { value: 'technical', label: 'Technical Skills' },
    { value: 'soft-skills', label: 'Soft Skills' },
    { value: 'compliance', label: 'Compliance Training' },
    { value: 'leadership', label: 'Leadership Development' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'professional', label: 'Professional Development' }
  ];

  const skillOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'python', label: 'Python' },
    { value: 'communication', label: 'Communication' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'data-analysis', label: 'Data Analysis' },
    { value: 'design-thinking', label: 'Design Thinking' }
  ];

  const templates = [
    {
      id: 1,
      name: 'New Employee Onboarding',
      description: 'Complete onboarding checklist for new hires',
      type: 'onboarding',
      estimatedHours: '8',
      tasks: ['Company Overview', 'Security Training', 'Tool Setup']
    },
    {
      id: 2,
      name: 'JavaScript Skill Assessment',
      description: 'Evaluate JavaScript programming skills',
      type: 'skill-assessment',
      estimatedHours: '2',
      tasks: ['Coding Challenge', 'Technical Interview', 'Code Review']
    },
    {
      id: 3,
      name: 'Leadership Development Program',
      description: 'Comprehensive leadership training program',
      type: 'training-module',
      estimatedHours: '16',
      tasks: ['Leadership Fundamentals', 'Team Management', 'Strategic Thinking']
    },
    {
      id: 4,
      name: 'Quarterly Performance Review',
      description: 'Complete quarterly performance evaluation',
      type: 'project-task',
      estimatedHours: '4',
      tasks: ['Self Assessment', 'Goal Setting', 'Feedback Session']
    }
  ];

  const handleInputChange = (field, value) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setTaskData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      type: template.type,
      estimatedHours: template.estimatedHours,
      category: template.type
    }));
  };

  const handleSubmit = () => {
    if (!taskData.title || !taskData.type || !taskData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    onTaskCreate({
      ...taskData,
      assignedTo: selectedEmployees,
      createdAt: new Date().toISOString(),
      status: 'draft'
    });
  };

  const handlePreview = () => {
    onPreview({
      ...taskData,
      assignedTo: selectedEmployees
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-error bg-error/10';
      case 'high': return 'text-warning bg-warning/10';
      case 'medium': return 'text-primary bg-primary/10';
      case 'low': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'FileText' },
    { id: 'details', label: 'Details', icon: 'Settings' },
    { id: 'templates', label: 'Templates', icon: 'Layout' }
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Create Task Assignment</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              iconName="Eye"
              iconPosition="left"
              disabled={!taskData.title}
            >
              Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSubmit}
              iconName="Send"
              iconPosition="left"
              disabled={!taskData.title || !taskData.type || !taskData.dueDate}
            >
              Assign Task
            </Button>
          </div>
        </div>

        {/* Assignment Summary */}
        {selectedEmployees.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Users" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                Assigning to {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.slice(0, 3).map((employee) => (
                <span
                  key={employee.id}
                  className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {employee.name}
                </span>
              ))}
              {selectedEmployees.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{selectedEmployees.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-smooth ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <Input
              label="Task Title"
              type="text"
              placeholder="Enter task title..."
              value={taskData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Task Type"
                placeholder="Select task type"
                options={taskTypes}
                value={taskData.type}
                onChange={(value) => handleInputChange('type', value)}
                required
              />

              <Select
                label="Priority"
                options={priorityOptions}
                value={taskData.priority}
                onChange={(value) => handleInputChange('priority', value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={taskData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />

              <Input
                label="Estimated Hours"
                type="number"
                placeholder="0"
                value={taskData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="Describe the task requirements, objectives, and any specific instructions..."
                value={taskData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <Select
              label="Category"
              placeholder="Select category"
              options={categoryOptions}
              value={taskData.category}
              onChange={(value) => handleInputChange('category', value)}
            />

            <Select
              label="Related Skills"
              placeholder="Select skills"
              options={skillOptions}
              value={taskData.skills}
              onChange={(value) => handleInputChange('skills', value)}
              multiple
              searchable
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Completion Criteria
              </label>
              <textarea
                className="w-full h-24 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="Define what constitutes successful completion of this task..."
                value={taskData.completionCriteria}
                onChange={(e) => handleInputChange('completionCriteria', e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Notification Settings</h3>
              
              <Checkbox
                label="Notify employees when task is assigned"
                checked={taskData.notifyOnStart}
                onChange={(e) => handleInputChange('notifyOnStart', e.target.checked)}
              />

              <Checkbox
                label="Notify when task is completed"
                checked={taskData.notifyOnCompletion}
                onChange={(e) => handleInputChange('notifyOnCompletion', e.target.checked)}
              />

              <Checkbox
                label="Allow deadline extensions"
                checked={taskData.allowExtensions}
                onChange={(e) => handleInputChange('allowExtensions', e.target.checked)}
              />

              <Checkbox
                label="Require manager approval"
                checked={taskData.requireApproval}
                onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
              />
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Task Templates</h3>
              <Button
                variant="outline"
                size="sm"
                iconName="Plus"
                iconPosition="left"
              >
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 transition-smooth cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-foreground">{template.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor('medium')}`}>
                      {template.estimatedHours}h
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icon name="List" size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {template.tasks.length} tasks included
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tasks.slice(0, 2).map((task, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                        >
                          {task}
                        </span>
                      ))}
                      {template.tasks.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                          +{template.tasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCreator;