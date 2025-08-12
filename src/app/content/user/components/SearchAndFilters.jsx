'use client';
import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import {Button} from '../../../../components/ui/button';
import {Input} from '../../../../components/ui/input';
import {Select} from '../../../../components/ui/select';

const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  onClearFilters,
  onExport
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Design', label: 'Design' }
  ];

  const jobRoleOptions = [
    { value: '', label: 'All Job Roles' },
    { value: 'Senior Software Engineer', label: 'Senior Software Engineer' },
    { value: 'Marketing Manager', label: 'Marketing Manager' },
    { value: 'Sales Representative', label: 'Sales Representative' },
    { value: 'HR Specialist', label: 'HR Specialist' },
    { value: 'Financial Analyst', label: 'Financial Analyst' },
    { value: 'Operations Manager', label: 'Operations Manager' },
    { value: 'UX Designer', label: 'UX Designer' },
    { value: 'Data Scientist', label: 'Data Scientist' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'New York', label: 'New York' },
    { value: 'San Francisco', label: 'San Francisco' },
    { value: 'London', label: 'London' },
    { value: 'Toronto', label: 'Toronto' },
    { value: 'Remote', label: 'Remote' }
  ];

  const skillOptions = [
    { value: '', label: 'All Skills' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'React', label: 'React' },
    { value: 'Python', label: 'Python' },
    { value: 'Project Management', label: 'Project Management' },
    { value: 'Data Analysis', label: 'Data Analysis' },
    { value: 'Digital Marketing', label: 'Digital Marketing' },
    { value: 'UI/UX Design', label: 'UI/UX Design' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Away', label: 'Away' },
    { value: 'Offline', label: 'Offline' }
  ];

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  const removeFilter = (filterKey) => {
    onFilterChange(filterKey, '');
  };

  const getFilterLabel = (key, value) => {
    const optionMaps = {
      department: departmentOptions,
      jobRole: jobRoleOptions,
      location: locationOptions,
      skill: skillOptions,
      status: statusOptions
    };
    
    const options = optionMaps[key];
    const option = options?.find(opt => opt.value === value);
    return option?.label || value;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search employees by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          iconName="Filter"
          iconPosition="left"
        >
          Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>
        
        <Button
          variant="outline"
          onClick={onExport}
          iconName="Download"
          iconPosition="left"
        >
          Export
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4 border-t border-border">
          <Select
            label="Department"
            options={departmentOptions}
            value={filters.department || ''}
            onChange={(value) => onFilterChange('department', value)}
          />
          
          <Select
            label="Job Role"
            options={jobRoleOptions}
            value={filters.jobRole || ''}
            onChange={(value) => onFilterChange('jobRole', value)}
          />
          
          <Select
            label="Location"
            options={locationOptions}
            value={filters.location || ''}
            onChange={(value) => onFilterChange('location', value)}
          />
          
          <Select
            label="Skill"
            options={skillOptions}
            value={filters.skill || ''}
            onChange={(value) => onFilterChange('skill', value)}
          />
          
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status || ''}
            onChange={(value) => onFilterChange('status', value)}
          />
        </div>
      )}

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center space-x-2 pt-2">
          <span className="text-sm font-medium text-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === '') return null;
              
              return (
                <div
                  key={key}
                  className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  <span>{getFilterLabel(key, value)}</span>
                  <button
                    onClick={() => removeFilter(key)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-smooth"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;