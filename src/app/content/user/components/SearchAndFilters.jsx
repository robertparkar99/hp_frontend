'use client';
import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

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

  // Department from new API
  const [departmentOptions, setDepartmentOptions] = useState([
    { value: '', label: 'All Departments' }
  ]);

  // Job Roles from API - will be updated based on selected department
  const [jobRoleOptions, setJobRoleOptions] = useState([
    { value: '', label: 'All Job Roles' }
  ]);

  // All job roles data from API
  const [allJobRolesData, setAllJobRolesData] = useState(null);

  // Roles (user_profiles) from API
  const [roleOptions, setRoleOptions] = useState([
    { value: '', label: 'All Roles' }
  ]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'In Active' },
    { value: 'Offline', label: 'Offline' }
  ];

  // 🔹 Fetch Departments and Job Roles from new API
  useEffect(() => {
    if (!sessionData?.sub_institute_id) return;

    const fetchDepartmentsAndJobRoles = async () => {
      try {
        const url = `${sessionData.APP_URL}/api/jobroles-by-department?sub_institute_id=${sessionData.sub_institute_id}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error fetching departments: ${res.status}`);

        const data = await res.json();

        console.log('🔍 API Response:', data); // Debug log

        if (data.status && data.data && typeof data.data === 'object') {
          // Extract departments from object keys and filter properly
          const departments = Object.keys(data.data)
            .filter(dept => dept && dept.trim() !== '' && dept !== 'null' && dept !== 'undefined');

          console.log('📋 Extracted Departments:', departments); // Debug log
          console.log('📦 Raw Data Structure:', data.data); // Debug log

          setDepartmentOptions([
            { value: '', label: 'All Departments' },
            ...departments.map(dept => ({
              value: dept,
              label: dept
            }))
          ]);

          // Store all job roles data for department-wise filtering
          setAllJobRolesData(data.data);

          // Set initial job roles (all job roles from all departments)
          updateAllJobRoles(data.data);
        } else {
          console.warn('⚠️ Unexpected Department API format:', data);
          setDepartmentOptions([{ value: '', label: 'All Departments' }]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch departments:', error);
        setDepartmentOptions([{ value: '', label: 'All Departments' }]);
      }
    };

    fetchDepartmentsAndJobRoles();
  }, [sessionData?.sub_institute_id]);

  // Function to update all job roles (when no department selected) - FIXED
  const updateAllJobRoles = (jobRolesData) => {
    const allJobRoles = new Set();
    
    Object.values(jobRolesData).forEach(rolesArray => {
      if (Array.isArray(rolesArray)) {
        rolesArray.forEach(role => {
          // Handle both string and object formats
          if (typeof role === 'string' && role.trim() !== '') {
            allJobRoles.add(role.trim());
          } else if (typeof role === 'object' && role !== null && role.jobrole) {
            allJobRoles.add(role.jobrole.trim());
          }
        });
      }
    });

    const sortedJobRoles = Array.from(allJobRoles).sort();
    
    setJobRoleOptions([
      { value: '', label: 'All Job Roles' },
      ...sortedJobRoles.map(role => ({
        value: role,
        label: role
      }))
    ]);

    console.log('🔄 Updated all job roles:', sortedJobRoles); // Debug log
  };

  // 🔹 Update Job Roles based on selected department - COMPLETELY FIXED
  useEffect(() => {
    if (!allJobRolesData) {
      console.log('❌ No job roles data available');
      return;
    }

    console.log('🎯 Current department filter:', filters.department); // Debug log
    console.log('📊 Available departments in data:', Object.keys(allJobRolesData)); // Debug log

    if (filters.department && filters.department !== '') {
      // Get job roles for selected department
      const departmentJobRoles = allJobRolesData[filters.department];
      
      console.log(`🔍 Looking for job roles in department: "${filters.department}"`); // Debug log
      console.log('📋 Found department job roles:', departmentJobRoles); // Debug log

      if (Array.isArray(departmentJobRoles)) {
        const filteredRoles = departmentJobRoles
          .map(role => {
            // Extract job role name from object or use string directly
            if (typeof role === 'string') {
              return role.trim();
            } else if (typeof role === 'object' && role !== null && role.jobrole) {
              return role.jobrole.trim();
            }
            return null;
          })
          .filter(role => role && role !== '') // Remove null/empty values
          .filter((role, index, self) => self.indexOf(role) === index) // Remove duplicates
          .sort();

        console.log('✅ Filtered job roles for department:', filteredRoles); // Debug log

        setJobRoleOptions([
          { value: '', label: 'All Job Roles' },
          ...filteredRoles.map(role => ({
            value: role,
            label: role
          }))
        ]);
      } else {
        console.warn('⚠️ Department job roles is not an array:', departmentJobRoles);
        // Reset to all job roles if department data is invalid
        updateAllJobRoles(allJobRolesData);
      }
    } else {
      // If no department selected, show all unique job roles from all departments
      console.log('🌐 No department selected, showing all job roles');
      updateAllJobRoles(allJobRolesData);
    }
  }, [filters.department, allJobRolesData]);

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

  const handleDepartmentChange = (value) => {
    console.log('🔄 Department changed to:', value); // Debug log
    // Reset job role when department changes
    onFilterChange('department', value);
    onFilterChange('jobRole', '');
  };

  const renderSelect = (label, options, value, keyName, onChangeHandler = null) => (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={e => onChangeHandler ? onChangeHandler(e.target.value) : onFilterChange(keyName, e.target.value)}
        className="border border-border rounded px-3 py-2"
      >
        {options
          .filter(opt => opt && opt.value != null)
          .map((opt, index) => (
            <option key={index} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Search Bar and Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <Input
          type="search"
          placeholder="Search employees by Name, Department, Job Role, Email, Skills..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 border-t border-border pt-4">
          {renderSelect('Department', departmentOptions, filters.department || '', 'department', handleDepartmentChange)}
          {/* {renderSelect('Job Role', jobRoleOptions, filters.jobRole || '', 'jobRole')} */}
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