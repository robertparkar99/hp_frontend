import { faker } from '@faker-js/faker';
import { Employee, AttendanceRecord } from '../types/attendance';

// Generate mock employees
export const mockEmployees: Employee[] = Array.from({ length: 15 }, (_, index) => ({
  id: `emp-${index + 1}`,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  department: faker.helpers.arrayElement(['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations']),
  position: faker.person.jobTitle(),
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`
}));

// Generate mock attendance records for the last 30 days
export const mockAttendanceRecords: AttendanceRecord[] = [];

mockEmployees.forEach(employee => {
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Skip weekends for some realism
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const isPresent = faker.datatype.boolean(0.85); // 85% attendance rate
    
    if (isPresent) {
      const punchInHour = faker.number.int({ min: 8, max: 10 });
      const punchInMinute = faker.number.int({ min: 0, max: 59 });
      const punchOutHour = faker.number.int({ min: 17, max: 19 });
      const punchOutMinute = faker.number.int({ min: 0, max: 59 });
      
      const punchIn = `${punchInHour.toString().padStart(2, '0')}:${punchInMinute.toString().padStart(2, '0')}`;
      const punchOut = `${punchOutHour.toString().padStart(2, '0')}:${punchOutMinute.toString().padStart(2, '0')}`;
      
      const totalHours = (punchOutHour - punchInHour) + (punchOutMinute - punchInMinute) / 60;
      
      let status: 'present' | 'late' | 'early-leave' = 'present';
      if (punchInHour > 9 || (punchInHour === 9 && punchInMinute > 15)) {
        status = 'late';
      } else if (punchOutHour < 17 || (punchOutHour === 17 && punchOutMinute < 30)) {
        status = 'early-leave';
      }
      
      mockAttendanceRecords.push({
        id: `att-${employee.id}-${date.toISOString().split('T')[0]}`,
        employeeId: employee.id,
        date: date.toISOString().split('T')[0],
        punchIn,
        punchOut,
        status,
        totalHours: parseFloat(totalHours.toFixed(2)),
        notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : undefined
      });
    } else {
      mockAttendanceRecords.push({
        id: `att-${employee.id}-${date.toISOString().split('T')[0]}`,
        employeeId: employee.id,
        date: date.toISOString().split('T')[0],
        status: 'absent'
      });
    }
  }
});
