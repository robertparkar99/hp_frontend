import React, { useState } from 'react';
import FilterSidebar from './FilterSidebar';
import SearchToolbar from './SearchToolbar';
import CourseGrid from './CourseGrid'; // or any content component

const CoursesPage = () => {
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState(null);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar: Only visible on large screens */}
      <div className="hidden lg:block">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Right Side Content: Takes remaining space */}
      <div className="lg:col-span-3 space-y-4">
        {/* Search Toolbar */}
        <SearchToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSortChange={handleSortChange}
        />

        {/* Content based on filters, sorting, etc. */}
        <CourseGrid
          filters={filters}
          sort={sortOption}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default CoursesPage;
