import React from 'react';
import Icon from '../../../AppIcon';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const SkillCard = ({ skill, onSkillClick, viewMode = 'grid' }) => {
  const proficiencyData = [
    { name: 'Beginner', value: skill.proficiencyDistribution?.beginner || 0, color: '#EF4444' },
    { name: 'Intermediate', value: skill.proficiencyDistribution?.intermediate || 0, color: '#F59E0B' },
    { name: 'Advanced', value: skill.proficiencyDistribution?.advanced || 0, color: '#10B981' },
    { name: 'Expert', value: skill.proficiencyDistribution?.expert || 0, color: '#1E40AF' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error/10';
      case 'medium': return 'bg-warning/10';
      case 'low': return 'bg-success/10';
      default: return 'bg-muted';
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:shadow-card transition-smooth cursor-pointer"
      onClick={() => onSkillClick?.(skill)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name={skill.icon || 'Code'} size={24} className="text-primary" />
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBg(skill.priority)} ${getPriorityColor(skill.priority)}`}>
          {skill.priority || 'low'}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{skill.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{skill.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={proficiencyData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                dataKey="value"
              >
                {proficiencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{skill.totalEmployees || 0}</div>
          <div className="text-xs text-muted-foreground">employees</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Avg Proficiency</span>
          <span className="font-medium text-foreground">{skill.averageProficiency || 0}/5</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((skill.averageProficiency || 0) / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{skill.jobRoles?.length || 0} job roles</span>
        <span>{skill.courses || 0} courses</span>
      </div>

      {skill.skillGap > 0 && (
        <div className="mt-3 p-2 bg-warning/10 rounded-md">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={14} className="text-warning" />
            <span className="text-xs text-warning font-medium">
              {skill.skillGap}% skill gap identified
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
