import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import {Button} from '../../../components/ui/button';

type Department = 'engineering' | 'marketing';

interface CompetencyHeatMapProps {
  selectedDepartment: Department;
  onDepartmentChange: (department: Department) => void;
}

const CompetencyHeatMap: React.FC<CompetencyHeatMapProps> = ({ selectedDepartment, onDepartmentChange }) => {
  const [selectedMetric, setSelectedMetric] = useState('proficiency');

  // Mock competency data
  const competencyData: Record<Department, {
    employees: string[];
    skills: string[];
    data: number[][];
  }> = {
    'engineering': {
      employees: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'],
      data: [
        [85, 90, 75, 70, 80, 65, 70, 95], // John Doe
        [92, 88, 85, 80, 90, 75, 80, 90], // Jane Smith
        [78, 82, 90, 85, 75, 80, 85, 88], // Mike Johnson
        [88, 85, 70, 75, 85, 70, 75, 92], // Sarah Wilson
        [82, 80, 88, 90, 78, 85, 90, 85]  // David Brown
      ]
    },
    'marketing': {
      employees: ['Alice Cooper', 'Bob Martin', 'Carol Davis', 'Dan Wilson', 'Eva Garcia'],
      skills: ['SEO', 'Content Marketing', 'Social Media', 'Analytics', 'Design', 'Email Marketing', 'PPC', 'Strategy'],
      data: [
        [90, 85, 88, 82, 75, 80, 70, 85], // Alice Cooper
        [75, 90, 92, 85, 70, 85, 88, 80], // Bob Martin
        [82, 78, 95, 80, 85, 75, 65, 88], // Carol Davis
        [88, 82, 85, 90, 80, 88, 85, 92], // Dan Wilson
        [85, 88, 80, 85, 90, 82, 78, 85]  // Eva Garcia
      ]
    }
  };

  const currentData = competencyData[selectedDepartment] || competencyData['engineering'];

  const getHeatMapColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 80) return 'bg-green-400';
    if (value >= 70) return 'bg-yellow-400';
    if (value >= 60) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getHeatMapIntensity = (value: number) => {
    const intensity = Math.min(value / 100, 1);
    return {
      backgroundColor: `rgba(30, 77, 183, ${intensity})`,
      color: intensity > 0.5 ? 'white' : 'var(--color-foreground)'
    };
  };

  const departments = [
    { value: 'engineering', label: 'Engineering', icon: 'Code' },
    { value: 'marketing', label: 'Marketing', icon: 'Megaphone' },
    { value: 'sales', label: 'Sales', icon: 'TrendingUp' },
    { value: 'hr', label: 'Human Resources', icon: 'Users' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Grid3X3" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Skill Matrix </h3>
            <p className="text-sm text-text-secondary">Team skill proficiency visualization</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value as Department)}
            className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {departments.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
          >
            <Icon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-9 gap-1 mb-2">
            <div className="p-2 text-sm font-medium text-foreground">Employee</div>
            {currentData.skills.map((skill, index) => (
              <div key={index} className="p-2 text-xs font-medium text-center text-foreground bg-muted rounded">
                {skill}
              </div>
            ))}
          </div>

          {/* Heat Map Grid */}
          {currentData.employees.map((employee, empIndex) => (
            <div key={empIndex} className="grid grid-cols-9 gap-1 mb-1">
              <div className="p-3 text-sm font-medium text-foreground bg-muted rounded flex items-center">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs text-white font-medium">
                    {employee.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="truncate">{employee}</span>
              </div>
              {currentData.data[empIndex].map((value, skillIndex) => (
                <div
                  key={skillIndex}
                  className="p-3 text-xs font-medium text-center rounded cursor-pointer hover:scale-105 transition-transform"
                  style={getHeatMapIntensity(value)}
                  title={`${employee} - ${currentData.skills[skillIndex]}: ${value}%`}
                >
                  {value}%
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-foreground">Proficiency Level:</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-xs text-text-secondary">&lt;60%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-xs text-text-secondary">60-69%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-xs text-text-secondary">70-79%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-xs text-text-secondary">80-89%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-text-secondary">90%+</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-text-secondary">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-sm font-medium text-foreground">Top Performer</span>
          </div>
          <p className="text-lg font-bold text-success">Jane Smith</p>
          <p className="text-xs text-text-secondary">87% avg proficiency</p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Target" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Strongest Skill</span>
          </div>
          <p className="text-lg font-bold text-primary">React</p>
          <p className="text-xs text-text-secondary">87% team average</p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span className="text-sm font-medium text-foreground">Needs Focus</span>
          </div>
          <p className="text-lg font-bold text-warning">AWS</p>
          <p className="text-xs text-text-secondary">75% team average</p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Users" size={16} className="text-accent" />
            <span className="text-sm font-medium text-foreground">Team Size</span>
          </div>
          <p className="text-lg font-bold text-accent">{currentData.employees.length}</p>
          <p className="text-xs text-text-secondary">Active members</p>
        </div>
      </div>
    </div>
  );
};

export default CompetencyHeatMap;