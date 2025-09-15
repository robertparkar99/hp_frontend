export interface Department {
  id: number;
  department: string;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  punchIn?: string;
  punchOut?: string;
  totalHours?: number;
  status: "present" | "late" | "early-leave" | "absent";
  notes?: string;
}

export interface AttendanceFormData {
  employeeId: string;
  date: string;
  time: string;     // punch in time
  notes?: string;
}
