

'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import QuickActionMenu from '../../../components/ui/QuickActionMenu';
import SearchAndFilters from './components/SearchAndFilters';
import EmployeeTable from './components/EmployeeTable';
import EmployeeCard from './components/EmployeeCard';
import StatsSidebar from './components/StatsSidebar';
import EmployeeProfileModal from './components/EmployeeProfileModal';
import PaginationControls from './components/PaginationControls';
import { Button } from '../../../components/ui/button';
import dynamic from 'next/dynamic';
  const AddUserModal = dynamic(() => import('./AddUserModal'), {
    ssr: false,
    loading: () => <p>Loading...</p>
  });

const EmployeeDirectory = () => {
  const [sessionData, setSessionData] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    jobRole: '',
    location: '',
    skill: '',
    status: '',
  });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState(null);
  const [userJobroleLists, setUserJobroleLists] = useState([]);
  const [userDepartmentLists, setUserDepartmentLists] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [userLOR, setUserLOR] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userProfiles, setUserProfiles] = useState([]);


  // Load session data once from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_id, user_profile_name, syear } = JSON.parse(userData);
        setSessionData({ APP_URL, token, sub_institute_id, org_type, user_id, user_profile_name, syear });
      }
    }
  }, []);

  // Build API URL from session data
  const apiUrl = useMemo(() => {
    if (!sessionData) return null;
    const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name } = sessionData;
    if (!APP_URL || !token || !user_id) return null;
    return `${APP_URL}/user/add_user?type=API&token=${token}&sub_institute_id=${sub_institute_id || 1}&org_type=${encodeURIComponent(org_type || 'Financial Services')}&user_id=${user_id}&user_profile_name=${encodeURIComponent(user_profile_name || 'Admin')}&syear=2025`;
  }, [sessionData]);

  useEffect(() => {
    if (sessionData.APP_URL && sessionData.token) {
      fetchAllData();
    }
  }, [sessionData.APP_URL, sessionData.token]);

  const fetchAllData = async () => {
    try {
      const response = await fetch(
        `${sessionData.APP_URL}/user/add_user?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id || 1}&org_type=${encodeURIComponent(sessionData.org_type || 'Financial Services')}&user_id=${sessionData.user_id}&user_profile_name=${encodeURIComponent(sessionData.user_profile_name || 'Admin')}&syear=${sessionData.syear}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUserJobroleLists(data.jobroleList || []);
      setUserLOR(data.levelOfResponsibility || data.levelOfResponsbility || []);
      setUserLists(data.data || []);
      setUserDepartmentLists(data.departments || []);
      setUserProfiles(data.userProfiles || []);
    } catch (err) {
      console.error('Error fetching industries:', err);
    }
  };

  const fetchEmployees = useCallback(async () => {
    if (!apiUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!isMounted) return;

      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : data
            ? [data]
            : [];

      const transformed = raw.map((item) => ({
        id: item.id || 0,
        full_name: item.full_name || 'N/A',
        email: item.email || 'N/A',
        mobile: item.mobile || 'N/A',
        department_name: item.department_name || 'N/A',
        jobRole: item.designation || 'N/A',
        address: item.address || 'N/A',
        image: item.image?.trim()
          ? item.image
          : `https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39`,
        occupation: item.occupation || 'N/A',
        status: item.status || 'Active',
        lastActivity: item.last_activity || 'Unknown',
        join_Date: item.join_date || 'Unknown',
        profile_name: item.profile_name || 'Unknown',
        skills: item.skills || [],
      }));

      setEmployees(transformed);
      setLoading(false);

    } catch (err) {
      if (isMounted) {
        console.error('Error fetching employees:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  // Fetch employees only when apiUrl is ready
  useEffect(() => {
    if (apiUrl) {
      fetchEmployees();
    }
  }, [apiUrl, fetchEmployees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        searchTerm === '' ||
        employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.skills || []).some((skill) =>
          skill.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDepartment = !filters.department || employee.department_name === filters.department;
      const matchesJobRole = !filters.jobRole || employee.jobRole === filters.jobRole;
      const matchesLocation = !filters.location || employee.profile_name === filters.location;
      const matchesSkill = !filters.skill || (employee.skills || []).some((skill) => skill.name === filters.skill);
      const matchesStatus = !filters.status || employee.status === filters.status;

      return matchesSearch && matchesDepartment && matchesJobRole && matchesLocation && matchesSkill && matchesStatus;
    });
  }, [employees, searchTerm, filters]);

  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees];
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'name') {
        aValue = a.full_name;
        bValue = b.full_name;
      } else if (sortConfig.key === 'profile') {
        aValue = a.profile_name;
        bValue = b.profile_name;
      }

      if (sortConfig.key === 'lastActivity') {
        const toMinutes = (str) => {
          if (!str) return 0;
          if (str.includes('minute')) return parseInt(str);
          if (str.includes('hour')) return parseInt(str) * 60;
          if (str.includes('day')) return parseInt(str) * 1440;
          return 0;
        };
        aValue = toMinutes(aValue);
        bValue = toMinutes(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredEmployees, sortConfig]);

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    return sortedEmployees.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedEmployees, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'Active').length;
    const away = employees.filter((e) => e.status === 'Away').length;
    const offline = employees.filter((e) => e.status === 'Offline').length;

    return {
      totalEmployees: total,
      activeEmployees: active,
      awayEmployees: away,
      offlineEmployees: offline,
    };
  }, [employees]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      department: '',
      jobRole: '',
      location: '',
      skill: '',
      status: '',
    });
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleSelectEmployee = useCallback((id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = paginatedEmployees.map((e) => e.id);
    setSelectedEmployees(
      selectedEmployees.length === paginatedEmployees.length ? [] : allIds
    );
  }, [paginatedEmployees, selectedEmployees.length]);

  const handleViewProfile = useCallback((emp) => {
    setSelectedEmployee(emp);
    setShowProfileModal(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfileModal(false);
    setSelectedEmployee(null);
  }, []);

  const handleAssignTask = useCallback((emp) => {
    console.log('Assign task to', emp.full_name);
  }, []);

  const handleEdit = useCallback((emp) => {
    console.log('Edit', emp.full_name);
  }, []);

  const handleExport = useCallback(() => {
    console.log('Export employees');
  }, []);

  const handleBulkAssignTask = useCallback(() => {
    console.log('Bulk assign to', selectedEmployees.length, 'employees');
  }, [selectedEmployees.length]);

  const handleBulkExport = useCallback(() => {
    console.log('Bulk export:', selectedEmployees.length);
  }, [selectedEmployees.length]);

  const handleBulkSkillAssessment = useCallback(() => {
    console.log('Skill assessment for:', selectedEmployees.length);
  }, [selectedEmployees.length]);

  const handlePageChange = useCallback((page) => setCurrentPage(page), []);

  const handleItemsPerPageChange = useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen rounded-xl bg-background flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={fetchEmployees}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-dark transition-colors"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
 
    <div className="min-h-screen bg-background rounded-xl">
  <main className="pb-16">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employee Directory</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Search, filter, and manage workforce information efficiently
            </p>
          </div>
          {sessionData.user_profile_name !== 'Employee' && (
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => setIsAddUserModalOpen(true)}
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          setIsOpen={setIsAddUserModalOpen}
          sessionData={sessionData}
          userJobroleLists={userJobroleLists}
          userLOR={userLOR}
          userDepartmentLists={userDepartmentLists}
          userProfiles={userProfiles}
          userLists={userLists}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-3">
        <div className="xl:hidden">
          <StatsSidebar
            stats={stats}
            sessionData={sessionData}
            userJobroleLists={userJobroleLists}
            userLOR={userLOR}
            userDepartmentLists={userDepartmentLists}
            userLists={userLists}
            selectedCount={selectedEmployees.length}
            onBulkAssignTask={handleBulkAssignTask}
            onBulkExport={handleBulkExport}
            onBulkSkillAssessment={handleBulkSkillAssessment}
          />
        </div>

        <div className="xl:col-span-3 space-y-6">
          <SearchAndFilters
            searchTerm={searchTerm}
            sessionData={sessionData}
            onSearchChange={handleSearchChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onExport={handleExport}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
          />

          {!loading && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>
                Showing {paginatedEmployees.length} of {sortedEmployees.length} employees
                {selectedEmployees.length > 0 && (
                  <span className="ml-2 text-primary">({selectedEmployees.length} selected)</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-smooth ${viewMode === 'table' ? 'bg-blue-400 text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-smooth ${viewMode === 'cards' ? 'bg-blue-400 text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

        
        </div>

        <div className="hidden xl:block">
          <StatsSidebar
            stats={stats}
            sessionData={sessionData}
            userJobroleLists={userJobroleLists}
            userLOR={userLOR}
            userLists={userLists}
            userDepartmentLists={userDepartmentLists}
            selectedCount={selectedEmployees.length}
            onBulkAssignTask={handleBulkAssignTask}
            onBulkExport={handleBulkExport}
            onBulkSkillAssessment={handleBulkSkillAssessment}
          />
        </div>
      </div>
        {/* Loading and content moved INSIDE the grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading employees...</span>
            </div>
          ) : viewMode === 'table' ? (
            <EmployeeTable
              employees={paginatedEmployees}
              selectedEmployees={selectedEmployees}
              onSelectEmployee={handleSelectEmployee}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              sortConfig={sortConfig}
              onViewProfile={handleViewProfile}
              onAssignTask={handleAssignTask}
              onEdit={handleEdit}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
              {paginatedEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onViewProfile={handleViewProfile}
                  onAssignTask={handleAssignTask}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}

          {/* Pagination moved INSIDE the grid */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedEmployees.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
    </div>
  </main>

  <EmployeeProfileModal
    employee={selectedEmployee}
    isOpen={showProfileModal}
    onClose={handleCloseProfile}
    onAssignTask={handleAssignTask}
    onEdit={handleEdit}
  />

  {/* <QuickActionMenu /> */}
</div>
  );
};

export default EmployeeDirectory;