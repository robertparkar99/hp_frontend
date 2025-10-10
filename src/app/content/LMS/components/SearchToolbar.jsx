

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
  const advancedRef = useRef(null);
  const moreFilterRef = useRef(null);

  // Session data
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    sub_institute_id: "",
    user_id: "",
    syear: "",
    user_profile_name: ""
  });

  // Load session info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, user_id, syear, user_profile_name } =
        JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        sub_institute_id,
        user_id,
        syear: syear || "",
        user_profile_name: user_profile_name || ""
      });
    }
  }, []);

  // Fetch filters from API
const fetchFilters = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `${sessionData.url}/lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}`
    );
    const data = await res.json();

    if (data?.lms_subject) {
      const allSubjects = Object.values(data.lms_subject).flat();

      // DEBUG: Check what we're getting
      console.log('All subject types raw:', allSubjects.map(item => item.subject_type));
      console.log('All content categories raw:', allSubjects.map(item => item.content_category));

      // Fix for categories - SIMPLE and GUARANTEED to work
      const categoryMap = {};
      allSubjects.forEach(item => {
        if (!item.content_category) return;
        const key = item.content_category.toLowerCase().trim();
        if (!categoryMap[key]) {
          categoryMap[key] = {
            id: key.replace(/\s+/g, '-'),
            label: item.content_category,
            count: 1
          };
        } else {
          categoryMap[key].count++;
        }
      });
      const uniqueCategories = Object.values(categoryMap);
      console.log('Unique categories:', uniqueCategories);

      // Fix for subject types - SIMPLE and GUARANTEED to work
      const subjectTypeMap = {};
      allSubjects.forEach(item => {
        if (!item.subject_type) return;
        const key = item.subject_type.toLowerCase().trim();
        if (!subjectTypeMap[key]) {
          subjectTypeMap[key] = {
            id: key.replace(/\s+/g, '-'),
            label: item.subject_type,
            count: 1
          };
        } else {
          subjectTypeMap[key].count++;
        }
      });
      const uniqueSubjectTypes = Object.values(subjectTypeMap);
      console.log('Unique subject types:', uniqueSubjectTypes);

      setCategories(uniqueCategories);
      setSubjectTypes(uniqueSubjectTypes);
    }
  } catch (err) {
    console.error('Failed to fetch filters:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (sessionData.sub_institute_id && sessionData.url) {
      fetchFilters();
    }
  }, [sessionData]);

  // Dynamic filters based on API data
  const filtersList = [
    {
      title: 'Categories',
      key: 'categories',
      options: categories.map(cat => ({
        id: cat.id,
        label: `${cat.label} (${cat.count})`
      }))
    },
    {
      title: 'Course Types',
      key: 'subjectTypes',
      options: subjectTypes.map(type => ({
        id: type.id,
        label: `${type.label} (${type.count})`
      }))
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
              placeholder="Search courses by title,department,shortname,course type..."
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
                disabled={loading}
              >
                <Icon name="Filter" size={14} className="mr-2" />
                Filters
                {loading && <span className="ml-2">...</span>}
              </Button>

              {isAdvancedOpen && (
                <div className="absolute mt-2 left-0 z-50 w-[360px] bg-background border border-border shadow-lg rounded-md p-4 flex flex-col gap-6 max-h-96 overflow-y-auto">
                  {filtersList.map((section) =>
                    section.options.length > 0 ? (
                      renderFilterGroup(section.title, section.key, section.options)
                    ) : null
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
              className={`rounded-r-none border-r border-border ${viewMode === "grid" ? "bg-blue-400 text-white hover:bg-blue-500" : "bg-transparent"
                }`}
            >
              <Icon name="Grid3X3" size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`rounded-l-none ${viewMode === "list" ? "bg-blue-400 text-white hover:bg-blue-500" : "bg-transparent"
                }`}
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

        {/* <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm text-muted-foreground mr-2">Quick:</span>
          {categories.slice(0, 4).map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              onClick={() => onSearchChange(category.label)}
              className="h-7 px-3 text-xs"
            >
              {category.label}
            </Button>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default SearchToolbar;