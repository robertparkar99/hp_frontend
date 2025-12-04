
'use client';

import React, { useState, useEffect } from 'react';
import Icon from '../../../AppIcon';
import {Button} from '../../../../components/ui/button';
import {Select} from '../../../../components/ui/select';
import {Input} from '../../../../components/ui/input';

const SkillFilters = ({ onFiltersChange, onViewModeChange, viewMode }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
    proficiencyLevel: '',
    department: '',
    sortBy: 'name',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([{ value: '', label: 'All Categories' }]);
  const [departmentOptions, setDepartmentOptions] = useState([{ value: '', label: 'All Departments' }]);
  const [priorityOptions, setPriorityOptions] = useState([{ value: '', label: 'All Priorities' }]);
  const [proficiencyOptions, setProficiencyOptions] = useState([{ value: '', label: 'All Levels' }]);

  const API_TOKEN = '798|VOTSJFcrJ4kzWcaHLUEfjNxF240rT6RgJ8WbnxeFfd11d2e2';

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(
          `https://hp.triz.co.in/skill_library?type=API&token=${API_TOKEN}&sub_institute_id=1&org_type=Financial%20Services`
        );
        const json = await res.json();

        const skillData = json?.allSkillData || {};
        const categorySet = new Set();
        const prioritySet = new Set();
        const proficiencySet = new Set();

        Object.values(skillData).forEach((subcats) => {
          Object.values(subcats).forEach((skills) => {
            skills.forEach((skill) => {
              if (skill.category) categorySet.add(skill.category.trim());
              if (skill.priority) prioritySet.add(skill.priority.trim().toLowerCase());
              if (skill.proficiency_level) proficiencySet.add(skill.proficiency_level.trim());
            });
          });
        });

        setCategoryOptions([
          { value: '', label: 'All Categories' },
          ...Array.from(categorySet).sort().map((cat) => ({
            value: cat,
            label: cat,
          })),
        ]);

        setPriorityOptions([
          { value: '', label: 'All Priorities' },
          ...Array.from(prioritySet).sort().map((p) => ({
            value: p,
            label: p.charAt(0).toUpperCase() + p.slice(1),
          })),
        ]);

        setProficiencyOptions([
          { value: '', label: 'All Levels' },
          ...Array.from(proficiencySet).sort().map((p) => ({
            value: p,
            label: p,
          })),
        ]);

        const jobroleSkill = json?.jobroleSkill || [];
        const departmentSet = new Set();
        jobroleSkill.forEach((item) => {
          if (item.department) departmentSet.add(item.department.trim());
        });

        setDepartmentOptions([
          { value: '', label: 'All Departments' },
          ...Array.from(departmentSet).sort().map((dept) => ({
            value: dept,
            label: dept,
          })),
        ]);
      } catch (error) {
        console.error('❌ Failed to fetch filters:', error);
      }
    };

    fetchFilters();
  }, []);

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'priority', label: 'Priority' },
    { value: 'employees', label: 'Employee Count' },
    { value: 'proficiency', label: 'Avg Proficiency' },
    { value: 'recent', label: 'Recently Added' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const reset = {
      search: '',
      category: '',
      priority: '',
      proficiencyLevel: '',
      department: '',
      sortBy: 'name',
    };
    setSearchTerm('');
    setFilters(reset);
    setShowAdvancedFilters(false);
    onFiltersChange(reset);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== 'name'
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleFilterChange('search', value);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Top Bar: Search + View Mode + Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filters & Search</h3>
        <div className="flex items-center space-x-2">
          {/* <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="px-3"
            >
              <Icon name="Grid3X3" size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="px-3"
            >
              <Icon name="List" size={16} />
            </Button>
          </div> */}
        </div>
      </div>

      {/* Search Input + Filter Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4 mb-4">
        <div className="xl:col-span-2">
          <Input
            type="search"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full"
        >
          <Icon name="Filter" size={16} className="mr-2" />
          Skill Filtered
        </Button>
      </div>

      {/* ⬇️ Advanced Filters Section (below the search row) */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 border-t pt-4">
          <Select
            placeholder="Category"
            options={categoryOptions}
            value={filters.category}
            onChange={(option) => handleFilterChange('category', option?.value || '')}
          />

          <Select
            placeholder="Priority"
            options={priorityOptions}
            value={filters.priority}
            onChange={(option) => handleFilterChange('priority', option?.value || '')}
          />

          <Select
            placeholder="Proficiency"
            options={proficiencyOptions}
            value={filters.proficiencyLevel}
            onChange={(option) => handleFilterChange('proficiencyLevel', option?.value || '')}
          />

          <Select
            placeholder="Department"
            options={departmentOptions}
            value={filters.department}
            onChange={(option) => handleFilterChange('department', option?.value || '')}
          />
        </div>
      )}

      {/* Sort and Clear Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            placeholder="Sort by"
            options={sortOptions}
            value={filters.sortBy}
            onChange={(option) => handleFilterChange('sortBy', option?.value || '')}
            className="w-48"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear Filters
            </Button>
          )}
        </div>
        {/* 
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Filter" size={16} />
          <span>Skills Filtered</span>
        </div> */}
        <div className="flex items-center bg-muted rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="px-3"
          >
            <Icon name="Grid3X3" size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="px-3"
          >
            <Icon name="List" size={16} />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default SkillFilters;

