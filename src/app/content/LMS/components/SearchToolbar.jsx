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
  const [categories, setCategories] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [skillCategories, setSkillCategories] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    sub_institute_id: '',
    user_id: '',
    syear: '',
    user_profile_name: '',
    org_type: '',
  });

  const advancedRef = useRef(null);
  const moreFilterRef = useRef(null);

  // Load session info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const {
        APP_URL,
        token,
        sub_institute_id,
        user_id,
        syear,
        user_profile_name,
        org_type,
      } = JSON.parse(userData);

      let formattedUrl = APP_URL || '';
      if (formattedUrl && !formattedUrl.endsWith('/')) {
        formattedUrl += '/';
      }

      setSessionData({
        url: formattedUrl,
        token,
        sub_institute_id,
        user_id,
        syear: syear || '',
        user_profile_name: user_profile_name || '',
        org_type: org_type || '',
      });
    }
  }, []);

  // API URLs
  const SKILL_API_URL =
    sessionData.url && sessionData.token
      ? `${sessionData.url}search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&org_type=${encodeURIComponent(
          sessionData.org_type
        )}&searchType=skillTaxonomy&searchWord=skillTaxonomy`
      : null;

  const TASK_API_URL =
    sessionData.url && sessionData.token
      ? `${sessionData.url}api/job-role-tasks?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}`
      : null;

  // Fetch skill categories
  const fetchSkillCategories = async () => {
    if (!SKILL_API_URL) {
      setApiError('Skill API URL not available');
      return;
    }

    try {
      setLoading(true);
      setApiError(null);

      if (!SKILL_API_URL.startsWith('http')) {
        throw new Error(`Invalid API URL: ${SKILL_API_URL}`);
      }

      const response = await fetch(SKILL_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const categories = data.map((item) => item.category_name).filter(Boolean);
        setSkillCategories(categories);
      } else {
        console.warn('Unexpected API response format for skills:', data);
        setSkillCategories([]);
      }
    } catch (err) {
      console.error('Error fetching skill categories:', err);
      setApiError('Failed to load skill categories: ' + err.message);
      setSkillCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch task categories
  const fetchTaskCategories = async () => {
    if (!TASK_API_URL) {
      setApiError('Task API URL not available');
      return;
    }

    try {
      setLoading(true);
      setApiError(null);

      if (!TASK_API_URL.startsWith('http')) {
        throw new Error(`Invalid API URL: ${TASK_API_URL}`);
      }

      const response = await fetch(TASK_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        const categories = data.data.map((item) => item.task_category).filter(Boolean);
        const uniqueCategories = [...new Set(categories)];
        setTaskCategories(uniqueCategories);
      } else {
        console.warn('Unexpected API response format for tasks:', data);
        setTaskCategories([]);
      }
    } catch (err) {
      console.error('Error fetching task categories:', err);
      setApiError('Failed to load task categories: ' + err.message);
      setTaskCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Load filters on level change
  useEffect(() => {
    if (!sessionData.token || !sessionData.url) return;

    if (selectedLevel1 === 'Skill' && skillCategories.length === 0) {
      fetchSkillCategories();
    } else if (selectedLevel1 === 'Task' && taskCategories.length === 0) {
      fetchTaskCategories();
    } else if (
      selectedLevel1 === 'All' &&
      (skillCategories.length === 0 || taskCategories.length === 0)
    ) {
      Promise.all([fetchSkillCategories(), fetchTaskCategories()]);
    }
  }, [selectedLevel1, sessionData]);

  // Fetch course filters
  const fetchCourseFilters = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}`
      );
      const data = await res.json();

      if (data?.lms_subject) {
        const allSubjects = Object.values(data.lms_subject).flat();

        const categoryMap = {};
        allSubjects.forEach((item) => {
          if (!item.content_category) return;
          const key = item.content_category.toLowerCase().trim();
          if (!categoryMap[key]) {
            categoryMap[key] = {
              id: key.replace(/\s+/g, '-'),
              label: item.content_category,
              count: 1,
            };
          } else {
            categoryMap[key].count++;
          }
        });
        const uniqueCategories = Object.values(categoryMap);

        const subjectTypeMap = {};
        allSubjects.forEach((item) => {
          if (!item.subject_type) return;
          const key = item.subject_type.toLowerCase().trim();
          if (!subjectTypeMap[key]) {
            subjectTypeMap[key] = {
              id: key.replace(/\s+/g, '-'),
              label: item.subject_type,
              count: 1,
            };
          } else {
            subjectTypeMap[key].count++;
          }
        });
        const uniqueSubjectTypes = Object.values(subjectTypeMap);

        setCategories(uniqueCategories);
        setSubjectTypes(uniqueSubjectTypes);
      }
    } catch (err) {
      console.error('Failed to fetch course filters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionData.sub_institute_id && sessionData.url) {
      fetchCourseFilters();
    }
  }, [sessionData]);

  const handleLevel1Select = (level) => {
    if (selectedLevel1 === level) {
      setSelectedLevel1('');
      setSelectedCategory('');
    } else {
      setSelectedLevel1(level);
      setSelectedCategory('');
    }
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
  };

  const renderLevel2Buttons = () => {
    if (!selectedLevel1) return null;

    let categories = [];
    if (selectedLevel1 === 'Skill') categories = skillCategories;
    else if (selectedLevel1 === 'Task') categories = taskCategories;
    else if (selectedLevel1 === 'All') categories = [...skillCategories, ...taskCategories];

    if (loading) {
      return (
        <div className="flex justify-center mt-4">
          <div className="text-muted-foreground flex items-center">
            <Icon name="Loader" size={16} className="mr-2 animate-spin" />
            Loading categories...
          </div>
        </div>
      );
    }

    if (apiError) {
      return (
        <div className="flex justify-center mt-4">
          <div className="text-destructive text-sm flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-2" />
            {apiError}
          </div>
        </div>
      );
    }

    if (categories.length === 0 && !loading) {
      return (
        <div className="flex justify-center mt-4">
          <div className="text-muted-foreground text-sm">No categories available</div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {categories.map((cat, index) => (
          <Button
            key={index}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => handleCategorySelect(cat)}
            className={`rounded-full text-sm transition px-4 py-2 border ${
              selectedCategory === cat
                ? 'bg-blue-300 text-white hover:bg-blue-400'
                : 'bg-transparent text-foreground border-border hover:border-blue-400 hover:text-blue-400'
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>
    );
  };

  // Checkbox filter group
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

  const filtersList = [
    {
      title: 'Categories',
      key: 'categories',
      options: categories.map((cat) => ({
        id: cat.id,
        label: `${cat.label} (${cat.count})`,
      })),
    },
    {
      title: 'Course Types',
      key: 'subjectTypes',
      options: subjectTypes.map((type) => ({
        id: type.id,
        label: `${type.label} (${type.count})`,
      })),
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 relative">
      {/* Search + Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search box */}
        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search courses by title, department, shortname, course type.."
              value={searchQuery || ''}
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

        {/* Toolbar actions */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center gap-1 relative">
            <div className="relative" ref={advancedRef}>
              <Button variant="ghost" size="icon" title="Settings / Manage Fields">
                <Icon name="Settings" size={18} />
              </Button>

              <Button variant="ghost" size="icon" title="Refresh Catalog">
                <Icon name="RotateCcw" size={18} />
              </Button>

              <Button variant="ghost" size="icon" title="AI Insights / Reports">
                <Icon name="BarChart3" size={18} />
              </Button>

              <Button variant="ghost" size="icon" title="Share / Publish Module">
                <Icon name="Share2" size={18} />
              </Button>

              <Button variant="ghost" size="icon" title="Help / Info">
                <Icon name="CircleHelp" size={18} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdvancedOpen(!isAdvancedOpen);
                  setShowMoreFilters(false);
                }}
                className={isAdvancedOpen ? 'bg-primary/10 text-primary' : ''}
                disabled={loading}
              >
                <Icon name="Filter" size={14} className="mr-2" />
                Filters
                {loading && <span className="ml-2">...</span>}
              </Button>

              {isAdvancedOpen && (
                <div className="absolute mt-2 left-0 z-50 w-[360px] bg-background border border-border shadow-lg rounded-md p-4 flex flex-col gap-6 max-h-96 overflow-y-auto">
                  {filtersList.map((section) =>
                    section.options.length > 0
                      ? renderFilterGroup(section.title, section.key, section.options)
                      : null
                  )}
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
              className={`rounded-r-none border-r border-border ${
                viewMode === 'grid'
                  ? 'bg-blue-400 text-white hover:bg-blue-500'
                  : 'bg-transparent'
              }`}
            >
              <Icon name="Grid3X3" size={16} />
            </Button>

            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`rounded-l-none ${
                viewMode === 'list'
                  ? 'bg-blue-400 text-white hover:bg-blue-500'
                  : 'bg-transparent'
              }`}
            >
              <Icon name="List" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Level 1 Buttons */}
      <div className="flex justify-center flex-wrap gap-4 mt-4">
        {['All', 'Skill', 'Task'].map((level) => (
          <Button
            key={level}
            variant={selectedLevel1 === level ? 'default' : 'outline'}
            onClick={() => handleLevel1Select(level)}
            className={`rounded-full text-sm px-6 py-2 transition border ${
              selectedLevel1 === level
                ? 'bg-blue-300 text-white hover:bg-blue-400'
                : 'bg-transparent text-foreground border-border hover:border-blue-400 hover:text-blue-400'
            }`}
            disabled={loading || !sessionData.token}
          >
            {level}
            {loading && selectedLevel1 === level && (
              <Icon name="Loader" size={14} className="ml-2 animate-spin" />
            )}
          </Button>
        ))}
      </div>

      {/* Level 2 Buttons */}
      {renderLevel2Buttons()}

      {/* Results count */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {resultsCount > 0 ? (
            <>
              Showing{' '}
              <span className="font-medium text-foreground">{resultsCount}</span> courses
              {searchQuery && (
                <>
                  {' '}
                  for "<span className="font-medium text-foreground">{searchQuery}</span>"
                </>
              )}
            </>
          ) : (
            'No courses found'
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchToolbar;
