'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '../../../../components/ui/checkbox';

const SearchToolbar = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  resultsCount,
  filters,
  onFilterChange,
  onClearAll,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const advancedRef = useRef(null);
  const moreFilterRef = useRef(null);

  const [moreFilters, setMoreFilters] = useState({
    department: 'all',
    instructor: '',
    dateAdded: 'any',
    language: 'en',
  });

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
  ];

  const dateAddedOptions = [
    { value: 'any', label: 'Any time' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
    { value: 'quarter', label: 'Past 3 months' },
    { value: 'year', label: 'Past year' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
  ];

  const filtersList = [
    {
      title: 'Content Type',
      key: 'contentType',
      options: [
        { id: 'video', label: 'Video Courses' },
        { id: 'ppt', label: 'PPT/Documents' },
        { id: 'mixed', label: 'Mixed Content' },
      ],
    },
    {
      title: 'Categories',
      key: 'categories',
      options: [
        { id: 'leadership', label: 'Leadership & Management' },
        { id: 'technical', label: 'Technical Skills' },
        { id: 'compliance', label: 'Compliance & Safety' },
        { id: 'soft-skills', label: 'Soft Skills' },
        { id: 'sales', label: 'Sales & Marketing' },
        { id: 'finance', label: 'Finance & Accounting' },
      ],
    },
    {
      title: 'Skill Level',
      key: 'skillLevel',
      options: [
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' },
      ],
    },
    {
      title: 'Duration',
      key: 'duration',
      options: [
        { id: 'short', label: 'Under 1 hour' },
        { id: 'medium', label: '1-3 hours' },
        { id: 'long', label: '3-6 hours' },
        { id: 'extended', label: '6+ hours' },
      ],
    },
    {
      title: 'Completion Status',
      key: 'completionStatus',
      options: [
        { id: 'not-started', label: 'Not Started' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
      ],
    },
  ];

  // ✅ Fixed checkbox render with label text
  const renderFilterGroup = (title, key, options) => (
    <div key={key} className="flex flex-col gap-2">
      <h4 className="font-medium text-foreground">{title}</h4>
      {options.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <Checkbox
            checked={filters[key]?.includes(item.id) || false}
            onCheckedChange={(checked) => {
              const current = filters[key] || [];
              const updated = checked
                ? [...current, item.id]
                : current.filter((id) => id !== item.id);
              onFilterChange(key, updated);
            }}
          />
          <span className="text-sm text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );

  const handleDepartmentChange = (selected) => {
    setMoreFilters((prev) => ({ ...prev, department: selected.value }));
  };

  const handleInstructorChange = (e) => {
    setMoreFilters((prev) => ({ ...prev, instructor: e.target.value }));
  };

  const handleDateAddedChange = (selected) => {
    setMoreFilters((prev) => ({ ...prev, dateAdded: selected.value }));
  };

  const handleLanguageChange = (selected) => {
    setMoreFilters((prev) => ({ ...prev, language: selected.value }));
  };

  const applyMoreFilters = () => {
    console.log('Applying filters:', moreFilters);
    setShowMoreFilters(false);
  };

  const resetMoreFilters = () => {
    setMoreFilters({
      department: 'all',
      instructor: '',
      dateAdded: 'any',
      language: 'en',
    });
  };

  const getSelectedOption = (value, options) => {
    return options.find((option) => option.value === value) || options[0];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        advancedRef.current &&
        !advancedRef.current.contains(event.target) &&
        moreFilterRef.current &&
        !moreFilterRef.current.contains(event.target)
      ) {
        setIsAdvancedOpen(false);
        setShowMoreFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 relative">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search courses, topics, or instructors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSearchChange('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filters Dropdown */}
          <div className="flex items-center gap-3 relative">
            <div className="relative" ref={advancedRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdvancedOpen(!isAdvancedOpen);
                  setShowMoreFilters(false);
                }}
                className={isAdvancedOpen ? 'bg-primary/10 text-primary' : ''}
              >
                <Icon name="Filter" size={14} className="mr-2" />
                Filters
              </Button>

              {isAdvancedOpen && (
                <div className="absolute mt-2 left-0 z-50 w-[360px] bg-background border border-border shadow-lg rounded-md p-4 flex flex-col gap-6">
                  {filtersList.map((section) =>
                    renderFilterGroup(section.title, section.key, section.options)
                  )}
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => setIsAdvancedOpen(false)}>
                      Close
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={onClearAll}>
                        Reset
                      </Button>
                      <Button variant="default" size="sm" onClick={() => setIsAdvancedOpen(false)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* More Filters */}
            <div className="relative" ref={moreFilterRef}>
              <div className="min-w-[160px]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowMoreFilters(!showMoreFilters);
                    setIsAdvancedOpen(false);
                  }}
                  className={showMoreFilters ? 'bg-primary/10 text-primary' : ''}
                >
                  <Icon name="Settings" size={14} className="mr-2" />
                  More Filters
                </Button>
              </div>

              {showMoreFilters && (
                <div className="absolute mt-2 left-0 z-50 w-[360px] bg-background border border-border shadow-lg rounded-md p-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Department
                      </label>
                      <Select
                        value={getSelectedOption(moreFilters.department, departmentOptions)}
                        onChange={handleDepartmentChange}
                        options={departmentOptions}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Instructor
                      </label>
                      <Input
                        type="text"
                        placeholder="Search by instructor name"
                        value={moreFilters.instructor}
                        onChange={handleInstructorChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Date Added
                      </label>
                      <Select
                        value={getSelectedOption(moreFilters.dateAdded, dateAddedOptions)}
                        onChange={handleDateAddedChange}
                        options={dateAddedOptions}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Language
                      </label>
                      <Select
                        value={getSelectedOption(moreFilters.language, languageOptions)}
                        onChange={handleLanguageChange}
                        options={languageOptions}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resetMoreFilters();
                          setShowMoreFilters(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button variant="default" size="sm" onClick={applyMoreFilters}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none border-r border-border"
            >
              <Icon name="Grid3X3" size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <Icon name="List" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {resultsCount > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{resultsCount}</span> courses
              {searchQuery && (
                <>
                  {' '}for "<span className="font-medium text-foreground">{searchQuery}</span>"
                </>
              )}
            </>
          ) : (
            'No courses found'
          )}
        </div>

        <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm text-muted-foreground mr-2">Quick:</span>
          {['Leadership', 'Technical', 'Compliance', 'Soft Skills'].map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => onSearchChange(category)}
              className="h-7 px-3 text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchToolbar;
