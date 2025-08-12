'use client';
import React from 'react';
import Icon from '../../../../components/AppIcon';
import {Button} from '../../../../components/ui/button';

const StatsSidebar = ({ 
  stats, 
  onBulkAssignTask, 
  onBulkExport, 
  selectedCount,
  onBulkSkillAssessment
}) => {
  const departmentData = [
    { name: 'Engineering', count: 45, percentage: 35 },
    { name: 'Marketing', count: 28, percentage: 22 },
    { name: 'Sales', count: 32, percentage: 25 },
    { name: 'HR', count: 12, percentage: 9 },
    { name: 'Finance', count: 8, percentage: 6 },
    { name: 'Operations', count: 4, percentage: 3 }
  ];

  const skillLevelData = [
    { level: 'Expert', count: 23, color: 'bg-success' },
    { level: 'Advanced', count: 45, color: 'bg-primary' },
    { level: 'Intermediate', count: 67, color: 'bg-warning' },
    { level: 'Beginner', count: 34, color: 'bg-muted' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} className="text-primary" />
              <span className="text-sm text-foreground">Total Employees</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{stats.totalEmployees}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="UserCheck" size={16} className="text-success" />
              <span className="text-sm text-foreground">Active</span>
            </div>
            <span className="text-sm font-medium text-success">{stats.activeEmployees}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-warning" />
              <span className="text-sm text-foreground">In Active</span>
            </div>
            <span className="text-sm font-medium text-warning">{stats.awayEmployees}</span>
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      {/* <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Department Distribution</h3>
        <div className="space-y-3">
          {departmentData.map((dept, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{dept.name}</span>
                <span className="text-sm font-medium text-foreground">{dept.count}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${dept.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Skill Level Distribution */}
      {/* <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Skill Levels</h3>
        <div className="space-y-3">
          {skillLevelData.map((skill, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${skill.color}`} />
                <span className="text-sm text-foreground">{skill.level}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{skill.count}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            iconName="UserPlus"
            iconPosition="left"
            onClick={() => console.log('Add employee')}
          >
            Add Employee
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            iconName="Upload"
            iconPosition="left"
            onClick={() => console.log('Bulk import')}
          >
            Bulk Import
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            iconName="BarChart3"
            iconPosition="left"
            onClick={() => console.log('View analytics')}
          >
            View Analytics
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Bulk Actions ({selectedCount} selected)
          </h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              iconName="CheckSquare"
              iconPosition="left"
              onClick={onBulkAssignTask}
            >
              Assign Task
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              iconName="Target"
              iconPosition="left"
              onClick={onBulkSkillAssessment}
            >
              Skill Assessment
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              iconName="Download"
              iconPosition="left"
              onClick={onBulkExport}
            >
              Export Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSidebar;