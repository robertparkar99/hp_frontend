'use client';
import React, { useState } from 'react';
import Image from '../../../../components/AppImage';
import Icon from '../../../../components/AppIcon';
import {Button} from '../../../../components/ui/button';

const EmployeeProfileModal = ({ employee, isOpen, onClose, onAssignTask, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !employee) return null;

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-success text-success-foreground';
      case 'Advanced': return 'bg-primary text-primary-foreground';
      case 'Intermediate': return 'bg-warning text-warning-foreground';
      case 'Beginner': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'Away': return 'bg-warning';
      case 'Offline': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const learningHistory = [
    {
      id: 1,
      course: "Advanced React Development",
      completedDate: "2024-06-15",
      score: 95,
      status: "Completed"
    },
    {
      id: 2,
      course: "Project Management Fundamentals",
      completedDate: "2024-05-20",
      score: 88,
      status: "Completed"
    },
    {
      id: 3,
      course: "Data Analysis with Python",
      completedDate: null,
      score: null,
      status: "In Progress"
    }
  ];

  const performanceMetrics = [
    { label: "Task Completion Rate", value: "94%", trend: "up" },
    { label: "Average Score", value: "91.5", trend: "up" },
    { label: "Skills Acquired", value: "12", trend: "up" },
    { label: "Courses Completed", value: "8", trend: "stable" }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'skills', label: 'Skills Matrix', icon: 'Target' },
    { id: 'learning', label: 'Learning History', icon: 'BookOpen' },
    { id: 'performance', label: 'Performance', icon: 'BarChart3' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-500 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={employee.image}
                alt={employee.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(employee.status)}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{employee.full_name}</h2>
              <p className="text-muted-foreground">{employee.profile_name}</p>
              {/* <p className="text-sm text-muted-foreground">{employee.occupation}</p> */}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(employee)}
              iconName="Edit"
              iconPosition="left"
            >
              Edit
            </Button>
            <Button
              variant="default"
              onClick={() => onAssignTask(employee)}
              iconName="Plus"
              iconPosition="left"
            >
              Assign Task
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-smooth ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="Mail" size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{employee.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Phone" size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{employee.mobile || '+1 (555) 123-4567'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="MapPin" size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{employee.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    <span className="text-foreground">Joined: {employee.join_date || 'Jan 15, 2023'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-sm text-muted-foreground">Skills</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-success">8</div>
                    <div className="text-sm text-muted-foreground">Courses</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-warning">5</div>
                    <div className="text-sm text-muted-foreground">Active Tasks</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">94%</div>
                    <div className="text-sm text-muted-foreground">Completion</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Skills Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.skills.map((skill, index) => (
                  <div key={index} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.proficiency || 75}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Last assessed: {skill.lastAssessed || '2 weeks ago'}</span>
                      <span>{skill.proficiency || 75}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Learning History</h3>
              <div className="space-y-4">
                {learningHistory.map((course) => (
                  <div key={course.id} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{course.course}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.status === 'Completed' 
                            ? `Completed on ${course.completedDate}` 
                            : 'In Progress'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        {course.score && (
                          <div className="text-lg font-semibold text-success">{course.score}%</div>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'Completed' 
                            ? 'bg-success text-success-foreground' :'bg-warning text-warning-foreground'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <Icon 
                        name={metric.trend === 'up' ? 'TrendingUp' : metric.trend === 'down' ? 'TrendingDown' : 'Minus'} 
                        size={16} 
                        className={
                          metric.trend === 'up' ? 'text-success' : 
                          metric.trend === 'down' ? 'text-error' : 'text-muted-foreground'
                        } 
                      />
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-1">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;