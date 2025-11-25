
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';

// Custom Select Component
const CustomSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">{label}</label>
      <div className="relative" ref={dropdownRef}>
        {/* Select Box */}
        <div
          className="border border-border rounded-md px-3 py-2 cursor-pointer bg-white hover:border-blue-400 transition-colors flex justify-between items-center "
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption?.label || 'Select...'}</span>
          <Icon name="ChevronDown" size={16} className="text-gray-500" />
        </div>
        
        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded shadow-lg max-h-60 overflow-y-auto">
            {options
              .filter(opt => opt && opt.value != null)
              .map((opt, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 cursor-pointer ${
                    value === opt.value 
                      ? 'bg-blue-400 text-white' 
                      : 'bg-white text-black hover:bg-blue-400 hover:text-white'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onExport,
  sessionData
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Job Roles from API
  const [jobRoleOptions, setJobRoleOptions] = useState([
    { value: '', label: 'All Job Roles' }
  ]);

  // Roles (user_profiles) from API
  const [roleOptions, setRoleOptions] = useState([
    { value: '', label: 'All Roles' }
  ]);

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

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'In Active' },
    { value: 'Offline', label: 'Offline' }
  ];

  // 🔹 Fetch Job Roles
  useEffect(() => {
    if (!sessionData?.APP_URL || !sessionData?.token || !sessionData?.user_id) return;

    const fetchJobRoles = async () => {
      try {
        const url = `${sessionData.APP_URL}/user/add_user?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id || 1}&org_type=${encodeURIComponent(sessionData.org_type || '')}&user_id=${sessionData.user_id}&user_profile_name=${encodeURIComponent(sessionData.user_profile_name || '')}&syear=2025`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error fetching job roles: ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data.jobroleList)) {
          setJobRoleOptions([
            { value: '', label: 'All Job Roles' },
            ...data.jobroleList
              .filter(role => role?.jobrole)
              .map(role => ({
                value: role.jobrole,
                label: role.jobrole
              }))
          ]);
        } else {
          console.warn('Unexpected Job Role API format:', data);
        }
      } catch (error) {
        console.error('Failed to fetch job roles:', error);
      }
    };

    fetchJobRoles();
  }, [sessionData]);

  // 🔹 Fetch Roles (user_profiles)
  useEffect(() => {
    if (!sessionData?.APP_URL || !sessionData?.token) return;

    const fetchRoles = async () => {
      try {
        const url = `${sessionData.APP_URL}/user/add_user?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id || 1}&org_type=${encodeURIComponent(sessionData.org_type || '')}&user_id=${sessionData.user_id}&user_profile_name=${encodeURIComponent(sessionData.user_profile_name || '')}&syear=2025`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error fetching roles: ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data.user_profiles)) {
          setRoleOptions([
            { value: '', label: 'All Roles' },
            ...data.user_profiles
              .filter(role => role?.name)
              .map(role => ({
                value: role.name,
                label: role.name
              }))
          ]);
        } else {
          console.warn('Unexpected Roles API format:', data);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    fetchRoles();
  }, [sessionData]);

  // 🔹 Helpers
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
      location: roleOptions,
      status: statusOptions
    };

    const options = optionMaps[key];
    const option = options?.find(opt => opt.value === value);
    return option?.label || value;
  };

  const renderSelect = (label, options, value, keyName) => (
    <CustomSelect
      label={label}
      options={options}
      value={value}
      onChange={(newValue) => onFilterChange(keyName, newValue)}
    />
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Search Bar and Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <Input
          type="search"
          placeholder="Search employees by name, email, or skills..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
        <div className="flex space-x-2">
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
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 border-t border-border pt-4">
          {renderSelect('Department', departmentOptions, filters.department || '', 'department')}
          {renderSelect('Job Role', jobRoleOptions, filters.jobRole || '', 'jobRole')}
          {renderSelect('Role', roleOptions, filters.location || '', 'location')}
          {renderSelect('Status', statusOptions, filters.status || '', 'status')}
        </div>
      )}

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center space-x-2 pt-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === '') return null;
              return (
                <div
                  key={key}
                  className="flex items-center space-x-2 bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full text-sm"
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
