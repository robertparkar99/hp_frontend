"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, Building, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DataTable, { TableColumn, TableStyles } from 'react-data-table-component';
import Icon from '@/components/AppIcon';
import Shepherd from 'shepherd.js';
import { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface DepartmentAllocation {
  id: number;
  department: string;
  leaveType: string;
  year: number;
  days: number;
  status: "active" | "inactive";
}

interface EmployeeAllocation {
  id: number;
  department: string;
  employee: string;
  leaveType: string;
  year: number;
  days: number;
  status: "active" | "inactive";
}

const initialDepartmentAllocations: DepartmentAllocation[] = [
  {
    id: 1,
    department: "Engineering",
    leaveType: "Annual Leave",
    year: 2024,
    days: 25,
    status: "active",
  },
  {
    id: 2,
    department: "Marketing",
    leaveType: "Annual Leave",
    year: 2024,
    days: 22,
    status: "active",
  },
  {
    id: 3,
    department: "HR",
    leaveType: "Sick Leave",
    year: 2024,
    days: 12,
    status: "active",
  },
];

const initialEmployeeAllocations: EmployeeAllocation[] = [
  {
    id: 1,
    department: "Engineering",
    employee: "John Doe",
    leaveType: "Annual Leave",
    year: 2024,
    days: 28,
    status: "active",
  },
  {
    id: 2,
    department: "Marketing",
    employee: "Sarah Johnson",
    leaveType: "Emergency Leave",
    year: 2024,
    days: 7,
    status: "active",
  },
];

const departments = ["Engineering", "Marketing", "HR", "Finance", "Operations"];
const employees = ["John Doe", "Sarah Johnson", "Mike Chen", "Emma Wilson", "David Brown"];
const leaveTypes = ["Annual Leave", "Sick Leave", "Emergency Leave", "Maternity Leave"];

export default function LeaveAllocation() {
  const [isDepartmentWise, setIsDepartmentWise] = useState(true);
  const [departmentAllocations, setDepartmentAllocations] = useState<DepartmentAllocation[]>(initialDepartmentAllocations);
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>(initialEmployeeAllocations);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const { toast } = useToast();
  const [filterText, setFilterText] = useState('');
  const [isTourActive, setIsTourActive] = useState(false);
  const tourRef = useRef<Tour | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const [deptFormData, setDeptFormData] = useState({
    department: "",
    leaveType: "",
    year: new Date().getFullYear().toString(),
    days: "",
  });

  const [empFormData, setEmpFormData] = useState({
    department: "",
    employee: "",
    leaveType: "",
    year: new Date().getFullYear().toString(),
    days: "",
  });
  // State for search text per column
  const [columnFilters, setColumnFilters] = useState({
    srno: "",
    department: "",
    employee: "",
    leaveType: "",
    year: "",
    days: "",
    status: ""
  });

  // Handle column filter
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Auto-open add form when tour reaches that step
  const handleAddButtonClick = () => {
    if (isTourActive) {
      // Auto-open the appropriate form during tour
      if (isDepartmentWise) {
        setShowDeptForm(true);
      } else {
        setShowEmpForm(true);
      }
    } else {
      // Normal behavior
      if (isDepartmentWise) {
        setShowDeptForm(true);
      } else {
        setShowEmpForm(true);
      }
    }
  };

  // Define tour steps
  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Leave Allocation!',
      text: 'This page allows you to manage leave allocations for departments and employees. Let\'s explore all features.',
      attachTo: { element: '#tour-header', on: 'bottom' as const },
      buttons: [
        {
          text: 'Skip Tour',
          action: function (this: Tour) {
            setIsTourActive(false);
            this.cancel();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Start Tour',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'toggle-section',
      title: '🔄 Allocation Type Toggle',
      text: 'Switch between Department-Wise and Employee-Wise allocation. Department-Wise allocates to entire departments. Employee-Wise allocates to individual employees.',
      attachTo: { element: '#tour-allocation-type-toggle', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'employee-wise-toggle',
      title: '👤 Employee-Wise Allocation',
      text: 'Click this toggle to switch to Employee-Wise allocation mode. This shows employee column in the table.',
      attachTo: { element: '#tour-employee-wise', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next & Switch',
          action: function (this: Tour) {
            setIsDepartmentWise(false);
            this.next();
          }
        }
      ]
    },
    {
      id: 'add-employee-allocation',
      title: '➕ Add Employee Leave',
      text: 'Click this button to open the employee leave allocation form.',
      attachTo: { element: '#tour-add-leave-allocation', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next & Open Form',
          action: function (this: Tour) {
            setShowEmpForm(true);
            this.next();
          }
        }
      ]
    },
    {
      id: 'employee-form',
      title: '📝 Employee Leave Form',
      text: 'This form allows you to allocate leave to individual employees. Fill in all required fields.',
      attachTo: { element: '#tour-leave-allocation-form', on: 'top' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) {
            setShowEmpForm(false);
            this.back();
          }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'employee-select',
      title: '👤 Select Employee',
      text: 'Choose the employee who will receive the leave allocation.',
      attachTo: { element: '#tour-emp-employee', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'department-select',
      title: '🏢 Select Department',
      text: 'Choose the department for this employee.',
      attachTo: { element: '#tour-dept-department', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'leave-type-select',
      title: '📋 Select Leave Type',
      text: 'Choose the type of leave (Annual, Sick, Emergency, Maternity, etc.).',
      attachTo: { element: '#tour-leave-type-select', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'year-input',
      title: '📅 Year',
      text: 'Enter the year for this allocation (default is current year).',
      attachTo: { element: '#tour-year-input', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'days-input',
      title: '🔢 Number of Days',
      text: 'Enter the number of leave days to allocate.',
      attachTo: { element: '#tour-days-input', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'save-button',
      title: '💾 Save Allocation',
      text: 'Click Save to create the leave allocation.',
      attachTo: { element: '#tour-save-allocation', on: 'top' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'cancel-button',
      title: '❌ Cancel',
      text: 'Click Cancel to close the form without saving.',
      attachTo: { element: '#tour-cancel-allocation', on: 'top' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) {
            setShowEmpForm(false);
            this.next();
          }
        }
      ]
    },
    {
      id: 'table-employee-column',
      title: '👤 Employee Column',
      text: 'This column shows the employee name for each allocation.',
      attachTo: { element: '#tour-employee-column', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'table-department-column',
      title: '🏢 Department Column',
      text: 'This column shows the department for each allocation.',
      attachTo: { element: '#tour-department-column', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'table-leave-type-column',
      title: '📋 Leave Type Column',
      text: 'This column shows the type of leave allocated.',
      attachTo: { element: '#tour-leavetype-column', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'table-days-column',
      title: '🔢 Days Column',
      text: 'This column shows the number of days allocated.',
      attachTo: { element: '#tour-days-column', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'table-status-column',
      title: '🔘 Status Column',
      text: 'This column shows the status (Active/Inactive) of each allocation.',
      attachTo: { element: '#tour-status-column', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'table-actions-column',
      title: '⚡ Actions Column',
      text: 'Use Edit and Delete buttons to manage allocations.',
      attachTo: { element: '#tour-actions-column', on: 'left' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'switch-department-wise',
      title: '🔄 Switch to Department Mode',
      text: 'Click this toggle to switch back to Department-Wise allocation.',
      attachTo: { element: '#tour-department-wise', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next & Switch',
          action: function (this: Tour) {
            setIsDepartmentWise(true);
            this.next();
          }
        }
      ]
    },
    {
      id: 'add-department-allocation',
      title: '➕ Add Department Leave',
      text: 'Click this button to open the department leave allocation form.',
      attachTo: { element: '#tour-add-leave-allocation', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next & Open Form',
          action: function (this: Tour) {
            setShowDeptForm(true);
            this.next();
          }
        }
      ]
    },
    {
      id: 'dept-form',
      title: '📝 Department Leave Form',
      text: 'This form allows you to allocate leave to entire departments.',
      attachTo: { element: '#tour-leave-allocation-form', on: 'top' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) {
            setShowDeptForm(false);
            this.back();
          }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'dept-department-select',
      title: '🏢 Select Department',
      text: 'Choose the department to allocate leave to.',
      attachTo: { element: '#tour-dept-department', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'dept-leave-type',
      title: '📋 Leave Type',
      text: 'Choose the type of leave to allocate.',
      attachTo: { element: '#tour-leave-type-select', on: 'bottom' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'dept-save',
      title: '💾 Save',
      text: 'Click Save to create the department allocation.',
      attachTo: { element: '#tour-save-allocation', on: 'top' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Next',
          action: function (this: Tour) { this.next(); }
        }
      ]
    },
    {
      id: 'dept-cancel',
      title: '❌ Cancel',
      text: 'Click Cancel to close the form.',
      attachTo: { element: '#tour-cancel-allocation', on: 'top' as const },
      buttons: [
        {
          text: 'Previous',
          action: function (this: Tour) { this.back(); }
        },
        {
          text: 'Finish',
          action: function (this: Tour) {
            setShowDeptForm(false);
            setIsTourActive(false);
            sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
            sessionStorage.removeItem('triggerPageTour');
            this.complete();
          }
        }
      ]
    }
  ];

  // Initialize tour
  useEffect(() => {
    const triggerValue = sessionStorage.getItem('triggerPageTour');
    const isTriggered = triggerValue === 'leave-allocation' || triggerValue === 'true';
    const isCompleted = sessionStorage.getItem('leaveAllocationTourCompleted') === 'true';

    if (isTriggered && !isCompleted) {
      setIsTourActive(true);

      // Auto-switch to Employee-Wise mode for tour
      setIsDepartmentWise(false);

      const tour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: { enabled: true },
          classes: 'shepherd-theme-custom',
          scrollTo: { behavior: 'smooth' as const, block: 'center' as const },
          modalOverlayOpeningPadding: 10,
          modalOverlayOpeningRadius: 8
        },
        useModalOverlay: true,
        exitOnEsc: true,
        keyboardNavigation: true
      });

      tour.addSteps(tourSteps);
      tourRef.current = tour;

      tour.on('complete', () => {
        setIsTourActive(false);
        sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
        sessionStorage.removeItem('triggerPageTour');
      });

      tour.on('cancel', () => {
        setIsTourActive(false);
        sessionStorage.setItem('leaveAllocationTourCompleted', 'true');
        sessionStorage.removeItem('triggerPageTour');
      });

      // Start tour after a delay
      setTimeout(() => {
        tour.start();
      }, 1000);
    }

    return () => {
      if (tourRef.current) {
        tourRef.current.cancel();
        tourRef.current = null;
      }
    };
  }, []);

  const filteredDeptAllocations = departmentAllocations.filter((item, index) => {
    return (
      (columnFilters.srno === "" || (index + 1).toString().includes(columnFilters.srno)) &&
      (columnFilters.department === "" || item.department.toLowerCase().includes(columnFilters.department.toLowerCase())) &&
      (columnFilters.leaveType === "" || item.leaveType.toLowerCase().includes(columnFilters.leaveType.toLowerCase())) &&
      (columnFilters.year === "" || item.year.toString().includes(columnFilters.year)) &&
      (columnFilters.days === "" || item.days.toString().includes(columnFilters.days)) &&
      (columnFilters.status === "" || item.status.toLowerCase().includes(columnFilters.status.toLowerCase()))
    );
  });

  const filteredEmpAllocations = employeeAllocations.filter((item, index) => {
    return (
      (columnFilters.srno === "" || (index + 1).toString().includes(columnFilters.srno)) &&
      (columnFilters.department === "" || item.department.toLowerCase().includes(columnFilters.department.toLowerCase())) &&
      (columnFilters.employee === "" || item.employee.toLowerCase().includes(columnFilters.employee.toLowerCase())) &&
      (columnFilters.leaveType === "" || item.leaveType.toLowerCase().includes(columnFilters.leaveType.toLowerCase())) &&
      (columnFilters.year === "" || item.year.toString().includes(columnFilters.year)) &&
      (columnFilters.days === "" || item.days.toString().includes(columnFilters.days)) &&
      (columnFilters.status === "" || item.status.toLowerCase().includes(columnFilters.status.toLowerCase()))
    );
  });

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deptFormData.department || !deptFormData.leaveType || !deptFormData.days) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newAllocation: DepartmentAllocation = {
      id: Date.now(),
      department: deptFormData.department,
      leaveType: deptFormData.leaveType,
      year: parseInt(deptFormData.year),
      days: parseInt(deptFormData.days),
      status: "active",
    };

    setDepartmentAllocations(prev => [...prev, newAllocation]);
    toast({
      title: "Success",
      description: "Department leave allocation created successfully.",
    });

    setDeptFormData({
      department: "",
      leaveType: "",
      year: new Date().getFullYear().toString(),
      days: "",
    });
    setShowDeptForm(false);
  };

  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!empFormData.department || !empFormData.employee || !empFormData.leaveType || !empFormData.days) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newAllocation: EmployeeAllocation = {
      id: Date.now(),
      department: empFormData.department,
      employee: empFormData.employee,
      leaveType: empFormData.leaveType,
      year: parseInt(empFormData.year),
      days: parseInt(empFormData.days),
      status: "active",
    };

    setEmployeeAllocations(prev => [...prev, newAllocation]);
    toast({
      title: "Success",
      description: "Employee leave allocation created successfully.",
    });

    setEmpFormData({
      department: "",
      employee: "",
      leaveType: "",
      year: new Date().getFullYear().toString(),
      days: "",
    });
    setShowEmpForm(false);
  };

  const handleDeleteDept = (id: number) => {
    setDepartmentAllocations(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Department allocation deleted successfully.",
    });
  };

  const handleDeleteEmp = (id: number) => {
    setEmployeeAllocations(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Employee allocation deleted successfully.",
    });
  };

  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
    },
    cells: { style: { fontSize: "13px", textAlign: "left" } },
    table: {
      style: { border: "1px solid #ddd",
        borderRadius: "20px", overflow: "hidden" },
    },
  };

  const deptColumns: TableColumn<DepartmentAllocation>[] = [
    {
      name: <div id="tour-srno-column"><div>Sr No.</div></div>,
      selector: (row: DepartmentAllocation, index?: number) => (index !== undefined ? index + 1 : 0),
      sortable: true,
      width: "120px"
    },
    {
      name: <div id="tour-department-column"><div>Department</div></div>,
      selector: (row: DepartmentAllocation) => row.department,
      sortable: true,
    },
    {
      name: <div id="tour-leavetype-column"><div>Leave Type</div></div>,
      selector: (row: DepartmentAllocation) => row.leaveType,
      sortable: true,
    },
    {
      name: <div id="tour-year-column"><div>Year</div></div>,
      selector: (row: DepartmentAllocation) => row.year,
      sortable: true,
    },
    {
      name: <div id="tour-days-column"><div>Days Allocated</div></div>,
      selector: (row: DepartmentAllocation) => `${row.days} days`,
      sortable: true,
    },
    {
      name: <div id="tour-status-column"><div>Status</div></div>,
      cell: (row: DepartmentAllocation) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      id: "tour-actions-column",
      cell: (row: DepartmentAllocation) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="bg-blue-500 hover:bg-blue-700 text-white text-xs h-7 py-1 px-2 rounded hover:text-white">
            <Icon name="Edit" size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteDept(row.id)} className="bg-red-500 hover:bg-red-700 text-white text-xs h-7 py-1 px-2 rounded hover:text-white">
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "120px"
    },
  ];

  const empColumns: TableColumn<EmployeeAllocation>[] = [
    {
      name: <div id="tour-srno-column"><div>Sr No.</div></div>,
      selector: (row: EmployeeAllocation, index?: number) => (index !== undefined ? index + 1 : 0),
      sortable: true,
      width: "120px"
    },
    {
      name: <div id="tour-employee-column"><div>Employee</div></div>,
      selector: (row: EmployeeAllocation) => row.employee,
      sortable: true,
    },
    {
      name: <div id="tour-department-column"><div>Department</div></div>,
      selector: (row: EmployeeAllocation) => row.department,
      sortable: true,
    },
    {
      name: <div id="tour-leavetype-column"><div>Leave Type</div></div>,
      selector: (row: EmployeeAllocation) => row.leaveType,
      sortable: true,
    },
    {
      name: <div id="tour-year-column"><div>Year</div></div>,
      selector: (row: EmployeeAllocation) => row.year,
      sortable: true,
    },
    {
      name: <div id="tour-days-column"><div>Days Allocated</div></div>,
      selector: (row: EmployeeAllocation) => `${row.days} days`,
      sortable: true,
    },
    {
      name: <div id="tour-status-column"><div>Status</div></div>,
      cell: (row: EmployeeAllocation) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      id: "tour-actions-column",
      cell: (row: EmployeeAllocation) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="bg-blue-500 hover:bg-blue-700 text-white text-xs h-7 py-1 px-2 rounded hover:text-white">
            <Icon name="Edit" size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteEmp(row.id)} className="bg-red-500 hover:bg-red-700 text-white text-xs h-7 py-1 px-2 rounded hover:text-white">
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "120px"
    },
  ];

  return (
    <div className="space-y-8 bg-background rounded-xl" id="tour-header">
      <Card className="bg-gradient-card shadow-card" id="tour-allocation-type-toggle">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Allocation Type</CardTitle>
          <CardDescription>Choose between department-wise or employee-wise leave allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-3" id="tour-department-wise">
              <Switch id="department-wise" checked={isDepartmentWise} onCheckedChange={setIsDepartmentWise} />
              <Label htmlFor="department-wise" className="flex items-center gap-2 text-base font-medium">
                <Building className="w-4 h-4" />Department-Wise Leave
              </Label>
            </div>
            <div className="flex items-center space-x-3" id="tour-employee-wise">
              <Switch id="employee-wise" checked={!isDepartmentWise} onCheckedChange={(checked) => setIsDepartmentWise(!checked)} />
              <Label htmlFor="employee-wise" className="flex items-center gap-2 text-base font-medium">
                <User className="w-4 h-4" />Employee-Wise Leave
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDepartmentWise ? (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Building className="w-5 h-5" />Department-Wise Leave Allocation
                </CardTitle>
                <CardDescription>Allocate leave days to entire departments</CardDescription>
              </div>
              <Button onClick={handleAddButtonClick} className="bg-gradient-primary hover:shadow-glow transition-all" id="tour-add-leave-allocation">
                <Plus className="w-4 h-4 mr-2" />Add Department Leave
              </Button>
            </div>
          </CardHeader>
          <CardContent id="tour-leave-allocation-form">
            {showDeptForm && (
              <Card className="mb-6 bg-accent/20 border-primary/20">
                <CardHeader><CardTitle className="text-lg">Add Department Leave Allocation</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleDeptSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div id="tour-dept-department">
                        <Label htmlFor="dept-department">Select Department *</Label>
                        <Select value={deptFormData.department} onValueChange={(value) => setDeptFormData(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger><SelectValue placeholder="Choose department" /></SelectTrigger>
                          <SelectContent>{departments.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div id="tour-leave-type-select">
                        <Label htmlFor="dept-leave-type">Select Leave Type *</Label>
                        <Select value={deptFormData.leaveType} onValueChange={(value) => setDeptFormData(prev => ({ ...prev, leaveType: value }))}>
                          <SelectTrigger><SelectValue placeholder="Choose leave type" /></SelectTrigger>
                          <SelectContent>{leaveTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div id="tour-year-input">
                        <Label htmlFor="dept-year">Select Year *</Label>
                        <Input id="dept-year" type="number" value={deptFormData.year} onChange={(e) => setDeptFormData(prev => ({ ...prev, year: e.target.value }))} />
                      </div>
                      <div id="tour-days-input">
                        <Label htmlFor="dept-days">Number of Days *</Label>
                        <Input id="dept-days" type="number" value={deptFormData.days} onChange={(e) => setDeptFormData(prev => ({ ...prev, days: e.target.value }))} placeholder="e.g., 25" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="bg-gradient-primary hover:shadow-glow transition-all" id="tour-save-allocation"><Save className="w-4 h-4 mr-2" />Save Allocation</Button>
                      <Button type="button" variant="outline" onClick={() => setShowDeptForm(false)} id="tour-cancel-allocation"><X className="w-4 h-4 mr-2" />Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <div id="tour-allocations-table" suppressHydrationWarning>
              <DataTable columns={deptColumns} data={filteredDeptAllocations} customStyles={customStyles} pagination highlightOnHover responsive noDataComponent={<div className="p-4 text-center">No department allocations available</div>} persistTableHead />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />Employee-Wise Leave Allocation
                </CardTitle>
                  <CardDescription>Allocate leave days to individual employees</CardDescription>
              </div>
                <Button onClick={handleAddButtonClick} className="bg-gradient-primary hover:shadow-glow transition-all" id="tour-add-leave-allocation">
                  <Plus className="w-4 h-4 mr-2" />Add Employee Leave
              </Button>
            </div>
          </CardHeader>
            <CardContent id="tour-leave-allocation-form">
            {showEmpForm && (
              <Card className="mb-6 bg-accent/20 border-primary/20">
                  <CardHeader><CardTitle className="text-lg">Add Employee Leave Allocation</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleEmpSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div id="tour-dept-department">
                        <Label htmlFor="emp-department">Select Department *</Label>
                        <Select value={empFormData.department} onValueChange={(value) => setEmpFormData(prev => ({ ...prev, department: value }))}>
                            <SelectTrigger><SelectValue placeholder="Choose department" /></SelectTrigger>
                            <SelectContent>{departments.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                        <div id="tour-emp-employee">
                        <Label htmlFor="emp-employee">Select Employee *</Label>
                        <Select value={empFormData.employee} onValueChange={(value) => setEmpFormData(prev => ({ ...prev, employee: value }))}>
                            <SelectTrigger><SelectValue placeholder="Choose employee" /></SelectTrigger>
                            <SelectContent>{employees.map(emp => (<SelectItem key={emp} value={emp}>{emp}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                        <div id="tour-leave-type-select">
                        <Label htmlFor="emp-leave-type">Select Leave Type *</Label>
                        <Select value={empFormData.leaveType} onValueChange={(value) => setEmpFormData(prev => ({ ...prev, leaveType: value }))}>
                            <SelectTrigger><SelectValue placeholder="Choose leave type" /></SelectTrigger>
                            <SelectContent>{leaveTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                        <div id="tour-year-input">
                        <Label htmlFor="emp-year">Select Year *</Label>
                          <Input id="emp-year" type="number" value={empFormData.year} onChange={(e) => setEmpFormData(prev => ({ ...prev, year: e.target.value }))} />
                      </div>
                        <div className="md:col-span-2" id="tour-days-input">
                        <Label htmlFor="emp-days">Number of Days *</Label>
                          <Input id="emp-days" type="number" value={empFormData.days} onChange={(e) => setEmpFormData(prev => ({ ...prev, days: e.target.value }))} placeholder="e.g., 25" />
                      </div>
                      </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="bg-gradient-primary hover:shadow-glow transition-all" id="tour-save-allocation"><Save className="w-4 h-4 mr-2" />Save Allocation</Button>
                        <Button type="button" variant="outline" onClick={() => setShowEmpForm(false)} id="tour-cancel-allocation"><X className="w-4 h-4 mr-2" />Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
              <div id="tour-allocations-table" suppressHydrationWarning>
                <DataTable columns={empColumns} data={filteredEmpAllocations} customStyles={customStyles} pagination highlightOnHover responsive noDataComponent={<div className="p-4 text-center">No employee allocations available</div>} persistTableHead />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
