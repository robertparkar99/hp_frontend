import React, { useEffect, useMemo } from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button } from '../../../../../components/ui/button';
import Select from '../../../../../components/ui/Select';
import AssessmentCard from './AssessmentCard';

const FilterPanel = ({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
  isMobile,
  assessments,
  onStartAssessment,
  onViewDetails
}) => {
  useEffect(() => {
    console.log("Assessments data received:", assessments);
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(item => {
      return (
        (!filters.deadline || item.deadline === filters.deadline) &&
        (!filters.subject || item.subject === filters.subject) &&
        (!filters.category || item.category === filters.category) &&
        (!filters.status || item.status?.toLowerCase() === filters.status?.toLowerCase())
      );
    });
  }, [assessments, filters]);


  const getDueDateOptions = () =>
    [...new Set(assessments.map(a => a.deadline))].filter(Boolean)
      .map(d => ({ value: d, label: new Date(d).toLocaleDateString() }));

  const getCourseOptions = () =>
    [...new Set(assessments.map(a => a.subject))].filter(Boolean)
      .map(s => ({ value: s, label: s }));

  const getIndustryOptions = () =>
    [...new Set(assessments.map(a => a.category))].filter(Boolean)
      .map(c => ({ value: c, label: c }));

  const getStatusOptions = () =>
    [...new Set(assessments.map(a => a.status))].filter(Boolean)
      .map(s => ({ value: s.toLowerCase(), label: s }));

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      deadline: '',
      subject: '',
      category: '',
      status: ''
    });
  };

  const panelContent = (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-base">Filters</h3>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={18} />
          </Button>
        )}
      </div>

      <Select
        label="Due Date"
        options={getDueDateOptions()}
        value={filters.deadline}
        onChange={(value) => handleFilterChange('deadline', value)}
      />
      <Select
        label="Course"
        options={getCourseOptions()}
        value={filters.subject}
        onChange={(value) => handleFilterChange('subject', value)}
      />
      <Select
        label="Industry"
        options={getIndustryOptions()}
        value={filters.category}
        onChange={(value) => handleFilterChange('category', value)}
      />
      <Select
        label="Status"
        options={getStatusOptions()}
        value={filters.status}
        onChange={(value) => handleFilterChange('status', value)}
      />

      <Button
        variant="outline"
        fullWidth
        size="sm"
        onClick={() => {
          // Reset filters to defaults
          onFiltersChange({
            category: 'all',
            difficulty: 'all',
            status: 'all',
            sortBy: 'deadline',
            showAvailableOnly: false,
          });

          // Optional: if you want to reset search query
          if (typeof onClearSearch === 'function') {
            onClearSearch();
          }
        }}
      >
        Clear All
      </Button>

    </div>
  );

  return isMobile ? (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6 h-full overflow-y-auto">{panelContent}</div>
      </div>
    </>
  ) : isOpen ? (
    <div className="absolute right-4 mt-2 w-64 bg-background border border-border shadow-lg rounded-md p-4 z-50">
      {panelContent}
    </div>
  ) : null;
};

export default FilterPanel;
