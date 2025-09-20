import React, { useState } from 'react';
import Icon from '../../../../../components/AppIcon';
import {Button} from '../../../../../components/ui/button';

const SearchBar = ({ searchQuery, onSearchChange, onToggleFilters, isMobile }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Search is handled by onChange, but we can add additional logic here if needed
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="flex items-center space-x-3 mb-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <input
            type="text"
            placeholder="Search assessments by  due date, Course, or Industry..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
              isFocused ? 'shadow-floating' : 'shadow-soft'
            }`}
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted"
            >
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>
      </form>

      {/* Filter Toggle Button - Mobile Only */}
      {isMobile && (
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="flex-shrink-0"
        >
          <Icon name="Filter" size={16} className="mr-2" />
          Filters
        </Button>
      )}
    </div>
  );
};

export default SearchBar;