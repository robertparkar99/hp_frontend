
import React, { useEffect, useState, useMemo } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/taskComponent/ui/Button';
import Select from '@/components/taskComponent/ui/Select';
import Input from '@/components/taskComponent/ui/Input';
import DataTable from 'react-data-table-component';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ProgressDashboard = () => {
  const [sessionData, setSessionData] = useState({});
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [jobroleFilter, setJobroleFilter] = useState('all');
  const [allData, setAllData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, sub_institute_id, user_id, syear, user_profile_name } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, user_id, syear, user_profile_name });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchAllData();
      fetchEmployees();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchAllData = async () => {
    try {
      const response = await fetch(
        `${sessionData.url}/task?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}&user_id=${sessionData.user_id}&syear=${sessionData.syear}&user_profile_name=${sessionData.user_profile_name}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAllData(data.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1&token=${sessionData.token}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `${sessionData.url}/task/${taskId}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&user_id=${sessionData.user_id}&formType=ability`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete task');
      
      const result = await response.json();
      alert(result.message || 'Task deleted successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.message || 'Failed to delete task');
    }
  };

  const timeOptions = [
    { value: 'all', label: 'priority' },
    { value: 'High', label: 'High' },
    {value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'PENDING' },
    { value: 'IN-PROGRESS', label: 'IN-PROGRESS' },
    { value: 'COMPLETED', label: 'COMPLETED' },
  ];

  // Get unique departments and job roles for filter options
  const departmentOptions = useMemo(() => {
    // Extract department names from allData, handling both string and object formats
    const departments = [...new Set(
      allData
        .map(task => {
          if (typeof task.department === 'string') {
            return task.department;
          } else if (task.department && typeof task.department === 'object') {
            return task.department.department_name || task.department.name || '';
          }
          return '';
        })
        .filter(Boolean)
    )];
    return [
      { value: 'all', label: 'All Departments' },
      ...departments.map(dept => ({ value: dept, label: dept }))
    ];
  }, [allData]);

  const jobroleOptions = useMemo(() => {
    const jobroles = [...new Set(allData.map(task => task.jobrole).filter(Boolean))];
    return [
      { value: 'all', label: 'All Job Roles' },
      ...jobroles.map(jobrole => ({ value: jobrole, label: jobrole }))
    ];
  }, [allData]);

  const taskTypeOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
  ];

  const statusEditOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN-PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const approveStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Filter data based on all active filters
  const filteredData = useMemo(() => {
    return allData.filter(task => {
      // Apply column filters first
      const matchesColumnFilters = Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        
        // Handle department filtering for both string and object formats
        let cellValue = '';
        if (key === 'department') {
          if (typeof task.department === 'string') {
            cellValue = task.department;
          } else if (task.department && typeof task.department === 'object') {
            cellValue = task.department.department_name || task.department.name || '';
          }
        } else {
          cellValue = task[key] ? task[key].toString().toLowerCase() : '';
        }
        
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });

      // Then apply the existing filters
      const matchesTime = timeFilter === 'all'
        ? true
        : timeFilter === 'High'
          ? task.task_type === 'High'
          : timeFilter === 'Medium'
            ? task.task_type === 'Medium'
            : timeFilter === 'Low'
              ? task.task_type === 'Low'
              : true;

      // const matchesStatus = statusFilter === 'all' || task.status.toUpperCase() === statusFilter;
      const matchesStatus =
    statusFilter === 'all' ||
    (task.status && task.status.toUpperCase() === statusFilter);

      // Handle department filtering for both string and object formats
      let taskDepartment = '';
      if (typeof task.department === 'string') {
        taskDepartment = task.department;
      } else if (task.department && typeof task.department === 'object') {
        taskDepartment = task.department.department_name || task.department.name || '';
      }
      const matchesDepartment = departmentFilter === 'all' || taskDepartment === departmentFilter;
      
      const matchesJobrole = jobroleFilter === 'all' || task.jobrole === jobroleFilter;

      return matchesColumnFilters && matchesTime && matchesStatus && matchesDepartment && matchesJobrole;
    });
  }, [allData, timeFilter, statusFilter, departmentFilter, jobroleFilter, filters]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(t => t.status === 'COMPLETED').length;
    const inProgress = filteredData.filter(t => t.status === 'IN-PROGRESS').length;
    const pending = filteredData.filter(t => t.status === 'PENDING').length;

    return [
      {
        label: 'Total Assignments',
        value: total,
        change: '',
        trend: 'up',
        icon: 'FileText',
        color: 'text-blue-400 bg-[#e9e9e9]',
        digit : 'text-blue-400',
      },
      {
        label: 'Completed',
        value: completed,
        change: '',
        trend: 'up',
        icon: 'CheckCircle',
        color: 'text-success bg-[#e9e9e9]',
        digit : 'text-success',
      },
      {
        label: 'In Progress',
        value: inProgress,
        change: '',
        trend: 'up',
        icon: 'Clock',
        color: 'text-warning bg-[#e9e9e9]',
        digit : 'text-warning',
      },
      {
        label: 'Overdue',
        value: pending,
        change: '',
        trend: 'down',
        icon: 'AlertTriangle',
        color: 'text-danger bg-[#e9e9e9]',
        digit : 'text-danger',
      }
    ];
  }, [filteredData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-success bg-success/10 border-success/20';
      case 'IN-PROGRESS': return 'text-warning bg-warning/10 border-warning/20';
      case 'PENDING': return 'text-muted-foreground bg-muted border-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getApproveStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-success bg-success/10 border-success/20';
      case 'rejected': return 'text-danger bg-error/10 border-error/20';
      case 'pending':
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-danger';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'skill-assessment': return 'Target';
      case 'course-assignment': return 'BookOpen';
      case 'training-module': return 'GraduationCap';
      case 'certification': return 'Award';
      case 'compliance': return 'Shield';
      default: return 'FileText';
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleEditClick = (task) => {
    setCurrentTask(task);
    setFilePreview(task.task_attachment ? `https://s3-triz.fra1.digitaloceanspaces.com/hp_task/${task.task_attachment}` : null);
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append all task data
      Object.keys(currentTask).forEach(key => {
        if (key !== 'task_attachment') {
          formData.append(key, currentTask[key]);
        }
      });
      
      // Append new file if selected
      if (selectedFile) {
        formData.append('task_attachment', selectedFile);
      }
      
      // Add required fields
      formData.append('type', 'API');
      formData.append('token', sessionData.token);
      formData.append('sub_institute_id', sessionData.sub_institute_id);
      formData.append('formType', 'approveStatus');
      formData.append('method_field', 'PUT');
      formData.append('syear', sessionData.syear);

      const response = await fetch(`${sessionData.url}/task/${currentTask.id}`, {
        method: "POST",
        headers: {
          "X-HTTP-Method-Override": "PUT",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const result = await response.json();
      alert(result.message || 'Task updated successfully');
      fetchAllData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.message || 'Failed to update task');
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColumnFilter = (columnKey, value) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  // Define DataTable columns
  const columns = [
    {
      name: (
        <div>
          <div>Task</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("task_title", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.task_title,
      sortable: true,
      cell: row => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Icon name={getTypeIcon(row.type)} size={20} className="text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{row.task_title}</h4>
            <p className="text-xs text-muted-foreground">by {row.ALLOCATOR}</p>
          </div>
        </div>
      ),
      minWidth: "250px"
    },
    {
      name: (
        <div>
          <div>Assigned To</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("ALLOCATED_TO", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.ALLOCATED_TO,
      sortable: true,
      minWidth: "150px"
    },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("department", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => {
        if (typeof row.department === 'string') {
          return row.department;
        } else if (row.department && typeof row.department === 'object') {
          return row.department.department_name || row.department.name || '';
        }
        return '';
      },
      sortable: true,
      minWidth: "150px"
    },
    {
      name: (
        <div>
          <div>Jobrole</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("jobrole", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.jobrole,
      sortable: true,
      minWidth: "150px"
    },
    {
      name: (
        <div>
          <div>Due Date</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("task_date", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.task_date,
      sortable: true,
      minWidth: "120px"
    },
    {
      name: (
        <div>
          <div>Progress</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("status", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
      minWidth: "140px"
    },
    {
      name: (
        <div>
          <div>Task Priority</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("task_type", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.task_type,
      sortable: true,
      cell: row => (
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(row.task_type).replace('text-', 'bg-')}`} />
          <span className={`text-xs font-medium ${getPriorityColor(row.task_type)}`}>
            {row.task_type.charAt(0).toUpperCase() + row.task_type.slice(1)}
          </span>
        </div>
      ),
      minWidth: "120px"
    },
    {
      name: (
        <div>
          <div>Approve Status</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("approve_status", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "3px",
              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.approve_status,
      sortable: true,
      cell: row => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getApproveStatusColor(row.approve_status)}`}>
          {row.approve_status ? row.approve_status.charAt(0).toUpperCase() + row.approve_status.slice(1).toUpperCase() : 'PENDING'}
        </span>
      ),
      minWidth: "150px"
    },
    {
      name: "Actions",
      cell: row => (
        <div className="flex items-center space-x-2" id="task-table-actions">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
            onClick={() => handleEditClick(row)}
          >
            <Icon name="Edit" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 text-xs py-1 px-2 rounded ${
              sessionData.user_profile_name?.toLowerCase().includes('employee')
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-700 text-white'
            }`}
            onClick={() => {
              if (!sessionData.user_profile_name?.toLowerCase().includes('employee') && window.confirm('Are you sure you want to delete this task?')) {
                handleDeleteTask(row.id);
              }
            }}
            disabled={sessionData.user_profile_name?.toLowerCase().includes('employee')}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      minWidth: "100px"
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
    },
    cells: { 
      style: { 
        fontSize: "13px", 
        textAlign: "left",
        padding: "16px",
      } 
    },
    table: {
      style: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* <div>
          <h2 className="text-xl font-semibold text-foreground">Assignment Progress</h2>
          <p className="text-muted-foreground text-sm">Track and monitor task assignment progress</p>
        </div> */}

        <div className="flex items-center space-x-3" id="task-filters">
          <Select
            options={departmentOptions}
            value={departmentFilter}
            onChange={setDepartmentFilter}
            className="w-40"
          />

          <Select
            options={jobroleOptions}
            value={jobroleFilter}
            onChange={setJobroleFilter}
            className="w-40"
          />

          <Select
            options={timeOptions}
            value={timeFilter}
            onChange={setTimeFilter}
            className="w-40"
          />

          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-40"
          />

          <Button variant="outline" size="sm" iconName="Download" iconPosition="left" id="task-export">
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="task-dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-left space-x-10">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-around ${stat.color}`}>
                <Icon name={stat.icon} size={24} />
              </div>
              <div className={`flex items-center`}>
               <h3 className={`text-2xl font-bold ${stat.digit}`}>{stat.value}</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card " id="task-data-table">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Task Assignments</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            customStyles={customStyles}
            pagination
            highlightOnHover
            responsive
            noDataComponent={<div className="p-4 text-center text-muted-foreground">No tasks found for selected filters.</div>}
            persistTableHead
          />
        </div>
      </div>

      {/* Edit Dialog - remains the same */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
          <DialogHeader>
            <DialogTitle>Edit Task Assignment</DialogTitle>
          </DialogHeader>

          {currentTask && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* ... rest of the edit form remains the same ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Task Title"
                    value={currentTask.task_title}
                    onChange={(e) => handleInputChange('task_title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Observer"
                    value={currentTask.ALLOCATOR}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Task Description
                    </label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentTask.task_description || ''}
                      onChange={(e) => handleInputChange('task_description', e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Monitoring Points
                    </label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentTask.observation_point || ''}
                      onChange={(e) => handleInputChange('observation_point', e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Key Result Area (KRAs)"
                    value={currentTask.kra}
                    onChange={(e) => handleInputChange('kra', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Performance Indicator (KPIs)"
                    value={currentTask.kpa}
                    onChange={(e) => handleInputChange('kpa', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Assigned To"
                    options={employees.map(emp => ({
                      value: emp.id,
                      label: `${emp.first_name} ${emp.last_name}`
                    }))}
                    value={currentTask.task_allocated_to || ''}
                    onChange={(value) => handleInputChange('ALLOCATED_TO_ID', value)}
                    required
                    disabled
                  />
                </div>
                <div>
                  <Input
                    label="Due Date"
                    type="date"
                    value={currentTask.task_date}
                    onChange={(e) => handleInputChange('task_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Task Priority"
                    options={taskTypeOptions}
                    value={currentTask.task_type}
                    onChange={(value) => handleInputChange('task_type', value)}
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Task Status"
                    options={statusEditOptions}
                    value={currentTask.status}
                    onChange={(value) => handleInputChange('status', value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Approve Status"
                    options={approveStatusOptions}
                    value={currentTask.approve_status?.toLowerCase() || 'pending'}
                    onChange={(value) => handleInputChange('approve_status', value)}
                    disabled={sessionData.user_profile_name?.toLowerCase().includes('employee')}
                  />
                </div>
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Approve Remarks
                    </label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={currentTask.approve_remarks || ''}
                      onChange={(e) => handleInputChange('approve_remarks', e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Attachment
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {filePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                        {filePreview.startsWith('data:image/') ||
                          filePreview.includes('digitaloceanspaces.com') ? (
                          <img
                            src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_task/${currentTask.task_attachment}`}
                            alt="Attachment preview"
                            className="max-h-40 rounded-md border border-border"
                          />
                        ) : (
                          <a
                            href={filePreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline flex items-center"
                          >
                            <Icon name="File" className="mr-1" />
                            View attached file
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                <Input
                    label="Repeat Once in every "
                    value={currentTask.repeat_days}
                    onChange={(e) => handleInputChange('repeat_days', e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-center space-x-4" style={{ display: 'flex', justifyContent: "center"}}>
                <Button id="cancel" variant="outline" onClick={() => setIsEditModalOpen(false)} > 
                  Cancel
                </Button>
                <Button id="update" type="submit"  className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60">
                  Update
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressDashboard;