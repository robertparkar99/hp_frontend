import React, { useState, useMemo } from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Input from '@/components/taskComponent/ui/Input';
import { Checkbox } from '@/components/taskComponent/ui/Checkbox';
import Button from '@/components/taskComponent/ui/Button';

const EmployeeSelector = ({ selectedEmployees, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [expandedDepartments, setExpandedDepartments] = useState(['all']);

  const departments = [
    {
      id: 'all',
      name: 'All Employees',
      count: 156,
      children: []
    },
    {
      id: 'engineering',
      name: 'Engineering',
      count: 45,
      children: [
        { id: 'frontend', name: 'Frontend', count: 18 },
        { id: 'backend', name: 'Backend', count: 15 },
        { id: 'devops', name: 'DevOps', count: 12 }
      ]
    },
    {
      id: 'design',
      name: 'Design',
      count: 22,
      children: [
        { id: 'ux', name: 'UX Design', count: 12 },
        { id: 'visual', name: 'Visual Design', count: 10 }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      count: 28,
      children: [
        { id: 'digital', name: 'Digital Marketing', count: 15 },
        { id: 'content', name: 'Content', count: 13 }
      ]
    },
    {
      id: 'sales',
      name: 'Sales',
      count: 34,
      children: [
        { id: 'inside', name: 'Inside Sales', count: 20 },
        { id: 'enterprise', name: 'Enterprise', count: 14 }
      ]
    },
    {
      id: 'hr',
      name: 'Human Resources',
      count: 12,
      children: []
    },
    {
      id: 'finance',
      name: 'Finance',
      count: 15,
      children: []
    }
  ];

  const employees = [
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
      role: "Senior Frontend Developer",
      department: "frontend",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e0e4b8?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Expert",
      completedTasks: 24,
      pendingTasks: 3,
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      email: "michael.rodriguez@company.com",
      role: "Backend Engineer",
      department: "backend",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Advanced",
      completedTasks: 18,
      pendingTasks: 2,
      lastActive: "1 hour ago"
    },
    {
      id: 3,
      name: "Emily Johnson",
      email: "emily.johnson@company.com",
      role: "UX Designer",
      department: "ux",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Expert",
      completedTasks: 31,
      pendingTasks: 1,
      lastActive: "30 minutes ago"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@company.com",
      role: "DevOps Engineer",
      department: "devops",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Advanced",
      completedTasks: 22,
      pendingTasks: 4,
      lastActive: "4 hours ago"
    },
    {
      id: 5,
      name: "Lisa Wang",
      email: "lisa.wang@company.com",
      role: "Digital Marketing Manager",
      department: "digital",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Expert",
      completedTasks: 28,
      pendingTasks: 2,
      lastActive: "1 hour ago"
    },
    {
      id: 6,
      name: "James Thompson",
      email: "james.thompson@company.com",
      role: "Sales Representative",
      department: "inside",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Intermediate",
      completedTasks: 15,
      pendingTasks: 5,
      lastActive: "6 hours ago"
    },
    {
      id: 7,
      name: "Anna Martinez",
      email: "anna.martinez@company.com",
      role: "Content Strategist",
      department: "content",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Advanced",
      completedTasks: 20,
      pendingTasks: 3,
      lastActive: "2 hours ago"
    },
    {
      id: 8,
      name: "Robert Brown",
      email: "robert.brown@company.com",
      role: "HR Specialist",
      department: "hr",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      skillLevel: "Advanced",
      completedTasks: 19,
      pendingTasks: 2,
      lastActive: "3 hours ago"
    }
  ];

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, selectedDepartment]);

  const toggleDepartment = (deptId) => {
    setExpandedDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const handleEmployeeToggle = (employee) => {
    const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
    if (isSelected) {
      onSelectionChange(selectedEmployees.filter(emp => emp.id !== employee.id));
    } else {
      onSelectionChange([...selectedEmployees, employee]);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredEmployees);
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'text-success bg-success/10';
      case 'Advanced': return 'text-primary bg-primary/10';
      case 'Intermediate': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Select Employees</h2>
          <span className="text-sm text-muted-foreground">
            {selectedEmployees.length} selected
          </span>
        </div>
        
        <Input
          type="search"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            iconName={selectedEmployees.length === filteredEmployees.length ? "Minus" : "Plus"}
            iconPosition="left"
          >
            {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {filteredEmployees.length} employees
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Department Tree */}
        <div className="w-64 border-r border-border bg-muted/30 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Departments</h3>
            <div className="space-y-1">
              {departments.map((dept) => (
                <div key={dept.id}>
                  <button
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      if (dept.children.length > 0) {
                        toggleDepartment(dept.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-smooth ${
                      selectedDepartment === dept.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {dept.children.length > 0 && (
                        <Icon 
                          name={expandedDepartments.includes(dept.id) ? "ChevronDown" : "ChevronRight"} 
                          size={14} 
                        />
                      )}
                      <span>{dept.name}</span>
                    </div>
                    <span className="text-xs opacity-75">{dept.count}</span>
                  </button>
                  
                  {dept.children.length > 0 && expandedDepartments.includes(dept.id) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {dept.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedDepartment(child.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-smooth ${
                            selectedDepartment === child.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          <span>{child.name}</span>
                          <span className="text-xs opacity-75">{child.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredEmployees.map((employee) => {
              const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
              
              return (
                <div
                  key={employee.id}
                  className={`p-4 border rounded-lg transition-smooth cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => handleEmployeeToggle(employee)}
                >
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleEmployeeToggle(employee)}
                      className="mt-1"
                    />
                    
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                          <p className="text-xs text-muted-foreground mt-1">{employee.email}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(employee.skillLevel)}`}>
                            {employee.skillLevel}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Icon name="CheckCircle" size={12} className="text-success" />
                            <span>{employee.completedTasks} completed</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Clock" size={12} className="text-warning" />
                            <span>{employee.pendingTasks} pending</span>
                          </span>
                        </div>
                        <span>Active {employee.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No employees found</h3>
                <p className="text-muted-foreground">Try adjusting your search or department filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelector;