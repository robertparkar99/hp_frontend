import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import {Button} from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';

const FilterSidebar = ({ filters, onFilterChange, onClearAll }) => {
  const [expandedSections, setExpandedSections] = useState(['contentType', 'categories', 'skillLevel']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const contentTypes = [
    { id: 'video', label: 'Video Courses', count: 45 },
    { id: 'ppt', label: 'PPT/Documents', count: 32 },
    { id: 'mixed', label: 'Mixed Content', count: 18 }
  ];

  const categories = [
    { id: 'leadership', label: 'Leadership & Management', count: 28 },
    { id: 'technical', label: 'Technical Skills', count: 35 },
    { id: 'compliance', label: 'Compliance & Safety', count: 22 },
    { id: 'soft-skills', label: 'Soft Skills', count: 19 },
    { id: 'sales', label: 'Sales & Marketing', count: 16 },
    { id: 'finance', label: 'Finance & Accounting', count: 12 }
  ];

  const skillLevels = [
    { id: 'beginner', label: 'Beginner', count: 42 },
    { id: 'intermediate', label: 'Intermediate', count: 38 },
    { id: 'advanced', label: 'Advanced', count: 25 }
  ];

  const durations = [
    { id: 'short', label: 'Under 1 hour', count: 28 },
    { id: 'medium', label: '1-3 hours', count: 45 },
    { id: 'long', label: '3-6 hours', count: 22 },
    { id: 'extended', label: '6+ hours', count: 15 }
  ];

  const completionStatus = [
    { id: 'not-started', label: 'Not Started', count: 67 },
    { id: 'in-progress', label: 'In Progress', count: 23 },
    { id: 'completed', label: 'Completed', count: 15 }
  ];

  const FilterSection = ({ title, sectionId, items, filterKey }) => {
    const isExpanded = expandedSections.includes(sectionId);
    
    return (
      <div className="border-b border-border pb-4 mb-4">
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium text-foreground hover:bg-transparent"
          onClick={() => toggleSection(sectionId)}
        >
          <span>{title}</span>
          <Icon 
            name="ChevronDown" 
            size={16} 
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </Button>
        
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <Checkbox
                  label={item.label}
                  checked={filters[filterKey]?.includes(item.id) || false}
                  onChange={(e) => {
                    const currentValues = filters[filterKey] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, item.id]
                      : currentValues.filter(id => id !== item.id);
                    onFilterChange(filterKey, newValues);
                  }}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground ml-2">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const activeFilterCount = Object.values(filters).reduce((count, filterArray) => {
    return count + (Array.isArray(filterArray) ? filterArray.length : 0);
  }, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-fit sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-primary hover:text-primary/80"
          >
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="space-y-0">
        <FilterSection
          title="Content Type"
          sectionId="contentType"
          items={contentTypes}
          filterKey="contentType"
        />
        
        <FilterSection
          title="Categories"
          sectionId="categories"
          items={categories}
          filterKey="categories"
        />
        
        <FilterSection
          title="Skill Level"
          sectionId="skillLevel"  
          items={skillLevels}
          filterKey="skillLevel"
        />
        
        <FilterSection
          title="Duration"
          sectionId="duration"
          items={durations}
          filterKey="duration"
        />
        
        <FilterSection
          title="Completion Status"
          sectionId="completionStatus"
          items={completionStatus}
          filterKey="completionStatus"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onFilterChange('categories', ['compliance'])}
          >
            <Icon name="Shield" size={14} className="mr-2" />
            Mandatory Training
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onFilterChange('completionStatus', ['not-started'])}
          >
            <Icon name="BookOpen" size={14} className="mr-2" />
            New Courses
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onFilterChange('duration', ['short'])}
          >
            <Icon name="Clock" size={14} className="mr-2" />
            Quick Learning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;