'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/AppIcon';
import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';

const FilterSidebar = ({ filters, onFilterChange, onClearAll }) => {
  const [expandedSections, setExpandedSections] = useState(['contentCategory', 'subjectType']);
  const [categories, setCategories] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Session data state
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    sub_institute_id: '',
    syear: '',
    user_id: '',
    user_profile_name: '',
  });

  // Load session info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const {
        APP_URL,
        token,
        sub_institute_id,
        syear,
        user_profile_name,
        user_id,
      } = JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        sub_institute_id,
        syear,
        user_profile_name,
        user_id,
      });
    }
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // 🔹 Fetch data from API
  

//     const fetchFilters = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${sessionData.url}/lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}`
//         );
//         const data = await res.json();

//         if (data?.lms_subject) {
//           const allSubjects = Object.values(data.lms_subject).flat();

//           // Unique categories
//           // const uniqueCategories = Array.from(
//           //   new Set(allSubjects.map((item) => item.content_category).filter(Boolean))
//           // ).map((category) => ({
//           //   id: category.toLowerCase().replace(/\s+/g, '-'),
//           //   label: category,
//           //   count: allSubjects.filter((i) => i.content_category === category).length,
//           // }));
//           const categoryMap = {};

// allSubjects.forEach((item) => {
//   if (!item.content_category) return;
  
//   const normalizedKey = item.content_category.toLowerCase().trim();
  
//   if (!categoryMap[normalizedKey]) {
//     categoryMap[normalizedKey] = {
//       id: normalizedKey.replace(/\s+/g, '-'),
//       label: item.content_category, // Keep original case
//       count: 0,
//     };
//   }
  
//   categoryMap[normalizedKey].count++;
// });

// const uniqueCategories = Object.values(categoryMap);

//           // Unique subject types
//   const uniqueSubjectTypes = Array.from(
//   new Set(
//     allSubjects
//       .map((item) => {
//         if (!item.subject_type) return null;
//         return item.subject_type.toLowerCase().trim();
//       })
//       .filter(Boolean)
//   )
// ).map((lowerCaseType) => {
//   const matchingItems = allSubjects.filter((item) => {
//     if (!item.subject_type) return false;
//     return item.subject_type.toLowerCase().trim() === lowerCaseType;
//   });
  
//   return {
//     id: lowerCaseType.replace(/\s+/g, '-'),
//     label: matchingItems[0]?.subject_type, // Use original case from first item
//     count: matchingItems.length,
//   };
// });

//           setCategories(uniqueCategories);
//           setSubjectTypes(uniqueSubjectTypes);
//         }
//       } catch (err) {
//         console.error('Failed to fetch filters:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
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
    if (!sessionData.url) return; // Prevent fetch before session data is set
       fetchFilters();
  }, [sessionData]);

  // 🔹 Filter section component
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
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <label className="flex items-center flex-1 gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters[filterKey]?.includes(item.id) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = filters[filterKey] || [];
                      const newValues = checked
                        ? [...currentValues, item.id]
                        : currentValues.filter((id) => id !== item.id);
                      onFilterChange(filterKey, newValues);
                    }}
                  />
                  <span className="text-sm text-foreground">{item.label || 'Unnamed'}</span>
                </label>
                <span className="text-xs text-muted-foreground ml-2">{item.count}</span>
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
      {/* Header */}
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

      {/* Filters */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading filters...</p>
      ) : (
        <div className="space-y-0">
          <FilterSection
            title="Content Category"
            sectionId="contentCategory"
            items={categories}
            filterKey="contentCategory"
          />
          <FilterSection
            title="Subject Type"
            sectionId="subjectType"
            items={subjectTypes}
            filterKey="subjectType"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onFilterChange('contentCategory', ['technical'])}
          >
            <Icon name="Shield" size={14} className="mr-2" />
            Technical Courses
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onFilterChange('subjectType', ['sub-type'])}
          >
            <Icon name="BookOpen" size={14} className="mr-2" />
            Subject Type: Sub Type
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
