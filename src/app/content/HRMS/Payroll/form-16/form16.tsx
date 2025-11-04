import React, { useState, useEffect } from 'react';

interface Employee {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  employee_no: string;
  department: string;
  transfer_type: string;
  pf_deduction: string;
  pt_deduction: string;
  amount: string;
  total_days?: string;
  cl_encashment?: number;
  extra_allowance?: number;
  leave_encash?: number;
  arrear?: number;
  received_by?: string;
  is_saved?: boolean;
  CL_opening_leave?: number;
}

interface Department {
  id: string;
  name: string;
}

interface PayrollItem {
  id: number;
  name: string;
  type: 'allowance' | 'deduction';
}

interface YearData {
  [key: string]: string;
}

const EmployeeDashboard: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [showForm16, setShowForm16] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [years, setYears] = useState<YearData>({});
  const [allowances, setAllowances] = useState<PayrollItem[]>([]);
  const [deductions, setDeductions] = useState<PayrollItem[]>([]);

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token: token,
        subInstituteId: sub_institute_id || "1",
        orgType: org_type || "",
        userId: user_id || "",
      });
    }
  }, []);

  // Fetch departments and employees from payroll API
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      
      // Build API URL similar to MonthlyPayroll
      const apiUrl = `${sessionData.url}/monthly-payroll-report?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&month=4&syear=2024&total_day=30`;
      
      console.log('Fetching payroll data from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payroll API Response:', data);

        // Extract departments from employees data
        if (data.employees && Array.isArray(data.employees)) {
          setEmployees(data.employees);
          setFilteredEmployees(data.employees);
          
          // Extract unique departments
          const uniqueDepartments: Department[] = [];
          const departmentMap = new Map();
          
          data.employees.forEach((emp: any) => {
            if (emp.department && !departmentMap.has(emp.department)) {
              departmentMap.set(emp.department, true);
              uniqueDepartments.push({
                id: emp.department_id?.toString() || Math.random().toString(),
                name: emp.department
              });
            }
          });
          
          setDepartments(uniqueDepartments);
        }

        // Extract years if available
        if (data.years) {
          setYears(data.years);
          // Set default year (first available year)
          const yearKeys = Object.keys(data.years);
          if (yearKeys.length > 0) {
            setSelectedYear(data.years[yearKeys[0]]);
          }
        }

        // Extract payroll headers for allowances and deductions
        if (data.header) {
          const allowanceItems: PayrollItem[] = [];
          const deductionItems: PayrollItem[] = [];
          
          // Map header fields to payroll items
          Object.entries(data.header).forEach(([key, value]) => {
            if (typeof value === 'string') {
              // Assuming numeric keys 1-8 are allowances, 9-10 are deductions
              // Adjust this logic based on your actual payroll structure
              const id = parseInt(key);
              if (!isNaN(id)) {
                if (id >= 1 && id <= 8) {
                  allowanceItems.push({
                    id: id,
                    name: value,
                    type: 'allowance'
                  });
                } else if (id >= 9 && id <= 10) {
                  deductionItems.push({
                    id: id,
                    name: value,
                    type: 'deduction'
                  });
                }
              } else if (key.includes('allowance') || key.includes('Allowance')) {
                allowanceItems.push({
                  id: Math.random(),
                  name: value,
                  type: 'allowance'
                });
              } else if (key.includes('deduction') || key.includes('Deduction')) {
                deductionItems.push({
                  id: Math.random(),
                  name: value,
                  type: 'deduction'
                });
              }
            }
          });

          // Add default items if none found
        //   if (allowanceItems.length === 0) {
        //     allowanceItems.push(
        //       { id: 1, name: 'Basic', type: 'allowance' },
        //       { id: 2, name: 'HRA', type: 'allowance' },
        //       { id: 3, name: 'DA', type: 'allowance' },
        //       { id: 4, name: 'Other Allowance', type: 'allowance' }
        //     );
        //   }

        //   if (deductionItems.length === 0) {
        //     deductionItems.push(
        //       { id: 9, name: 'PF', type: 'deduction' },
        //       { id: 10, name: 'PT', type: 'deduction' },
        //       { id: 11, name: 'Tax', type: 'deduction' }
        //     );
        //   }

          setAllowances(allowanceItems);
          setDeductions(deductionItems);
        }

      } else {
        console.error('Failed to fetch payroll data');
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific payroll items (allowances/deductions) from API
  const fetchPayrollItems = async () => {
    try {
      // You can add a specific API endpoint for payroll items if available
      // For now, we'll use the data from the main payroll API
      const apiUrl = `${sessionData.url}/get-payroll-items?token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.allowances && data.deductions) {
          setAllowances(data.allowances);
          setDeductions(data.deductions);
        }
      }
    } catch (error) {
      console.error('Error fetching payroll items:', error);
      // Use default items if API fails
      setAllowances([
        { id: 1, name: 'Basic', type: 'allowance' },
        { id: 2, name: 'HRA', type: 'allowance' },
        { id: 3, name: 'DA', type: 'allowance' },
        { id: 4, name: 'Other Allowance', type: 'allowance' }
      ]);
      setDeductions([
        { id: 9, name: 'PF', type: 'deduction' },
        { id: 10, name: 'PT', type: 'deduction' },
        { id: 11, name: 'Tax', type: 'deduction' }
      ]);
    }
  };

  // Initialize all data on component mount
  useEffect(() => {
    if (sessionData.token && sessionData.subInstituteId) {
      fetchPayrollData();
      fetchPayrollItems();
    }
  }, [sessionData]);

  // Filter employees when department changes
  useEffect(() => {
    if (selectedDepartment) {
      const filtered = employees.filter(emp => 
        emp.department === selectedDepartment
      );
      setFilteredEmployees(filtered);
      // Reset selected employee when department changes
      setSelectedEmployee('');
    } else {
      setFilteredEmployees(employees);
    }
  }, [selectedDepartment, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm16(true);
  };

  // Get employee full name
  const getEmployeeFullName = (employee: Employee) => {
    return `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name}`.trim();
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  if (showForm16) {
    const selectedEmployeeData = employees.find(emp => 
      getEmployeeFullName(emp) === selectedEmployee
    );

    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto bg-white border border-gray-800 text-sm">
          
          {/* Print Button */}
          {/* <div className="flex justify-end mb-4 no-print">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Form 16
            </button>
          </div> */}

          {/* FORM NO. 16 Header */}
          <div className="border-b-2 border-black p-4 text-center">
            <h1 className="text-xl font-bold uppercase">FORM NO. 16</h1>
            <p className="text-sm mt-1">
              PART A<br/>
              Certificate under section 203 of the income-tax Act, 1961 for tax deducted at source on salary.
            </p>
          </div>

          {/* Employer and Employee Details */}
          <div className="border-b border-black">
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-3">
                <p className="font-semibold">Name and Address of the Employer</p>
                <p className="mt-1">Triz International School</p>
                <p>Adajan-Surat</p>
              </div>
              <div className="p-3">
                <p className="font-semibold">Name and Address of the Employee</p>
                <p className="mt-1">
                  {selectedEmployeeData ? 
                    `${selectedEmployeeData.first_name} ${selectedEmployeeData.last_name}` : 
                    'Employee Name'
                  }
                </p>
                <p>D-91, South Ganesh Nagar</p>
              </div>
            </div>
          </div>

          {/* PAN, TAN and Period Details */}
          <div className="border-b border-black">
            <div className="grid grid-cols-3 border-b border-black">
              <div className="border-r border-black p-2">
                <p className="font-semibold">PAN of the Deductor</p>
                <p>ABCDE1234F</p>
              </div>
              <div className="border-r border-black p-2">
                <p className="font-semibold">TAN of the Deductor</p>
                <p>SURP12345F</p>
              </div>
              <div className="p-2">
                <p className="font-semibold">PAN of the Employee</p>
                <p>TIWAD1234E</p>
              </div>
            </div>
            <div className="grid grid-cols-4">
              <div className="border-r border-black p-2">
                <p className="font-semibold">CIT(TDS)</p>
                <p>Surat</p>
                <p>395009</p>
              </div>
              <div className="border-r border-black p-2">
                <p className="font-semibold">Assessment Year</p>
                <p>{selectedYear}</p>
              </div>
              <div className="border-r border-black p-2">
                <p className="font-semibold">Period</p>
                <p>From</p>
                <p>01/Apr/{selectedYear.split('-')[0]}</p>
              </div>
              <div className="p-2">
                <p className="font-semibold">&nbsp;</p>
                <p>To</p>
                <p>31/Mar/{selectedYear.split('-')[1]}</p>
              </div>
            </div>
          </div>

          {/* PART B Header */}
          <div className="border-b border-black p-3 text-center bg-gray-100">
            <h2 className="font-bold">PART B (Annexure)</h2>
            <p className="text-sm">Details of Salary paid and any other income and tax deducted</p>
          </div>

          {/* Salary Details Table */}
          <div className="border-b border-black">
            {/* Row 1 */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-center">1</div>
              <div className="col-span-8 border-r border-black p-1">Gross Salary</div>
              <div className="col-span-3 p-1 text-right">Rs. 0</div>
            </div>
            
            {/* Row 1a */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-2 border-r border-black p-1 pl-2">(a)</div>
              <div className="col-span-6 border-r border-black p-1">Salary as per provisions contained in sec. 17(1)</div>
              <div className="col-span-3 p-1 text-right">Rs. 0</div>
            </div>

            {/* Row 1b */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-2 border-r border-black p-1 pl-2">(b)</div>
              <div className="col-span-6 border-r border-black p-1">Value of perquisites u/s 17(2) (as per Form No. 12BA, wherever applicable)</div>
              <div className="col-span-3 p-1 text-right">Rs.</div>
            </div>

            {/* Row 1c */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-2 border-r border-black p-1 pl-2">(c)</div>
              <div className="col-span-6 border-r border-black p-1">Profits in lieu of salary under section 17(3) (as per Form No. 12BA, wherever applicable)</div>
              <div className="col-span-3 p-1 text-right">Rs.</div>
            </div>

            {/* Row 1d */}
            <div className="grid grid-cols-12 border-b border-black bg-gray-50">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-2 border-r border-black p-1 pl-2">(d)</div>
              <div className="col-span-6 border-r border-black p-1 font-semibold">Total</div>
              <div className="col-span-3 p-1 text-right font-semibold">Rs. 0</div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-center">2</div>
              <div className="col-span-8 border-r border-black p-1">Less : Allowance to the extent exempt under section 10</div>
              <div className="col-span-3 p-1 text-right">Rs. 0</div>
            </div>

            {/* Allowance details */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 border-r border-black p-1 pl-4">Allowance</div>
              <div className="col-span-6 border-r border-black p-1">u/s, 10</div>
              <div className="col-span-3 p-1 text-right">0</div>
            </div>

            <div className="grid grid-cols-12 border-b border-black bg-gray-50">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-8 border-r border-black p-1"></div>
              <div className="col-span-3 p-1 text-right font-semibold">Rs. 0</div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-center">3</div>
              <div className="col-span-8 border-r border-black p-1">Balance (1 - 2)</div>
              <div className="col-span-3 p-1 text-right font-semibold">Rs. 0</div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-center">4</div>
              <div className="col-span-8 border-r border-black p-1">Deductions :</div>
              <div className="col-span-3 p-1"></div>
            </div>

            {/* Row 4a */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-2 border-r border-black p-1 pl-2">(a)</div>
              <div className="col-span-6 border-r border-black p-1">Entertainment allowance</div>
              <div className="col-span-3 p-1 text-right">Rs.</div>
            </div>

            {/* Row 4b */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-2 border-r border-black p-1 pl-2">(b)</div>
              <div className="col-span-6 border-r border-black p-1">Tax on employment</div>
              <div className="col-span-3 p-1 text-right">Rs.</div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-12 border-b border-black bg-gray-50">
              <div className="col-span-1 border-r border-black p-1 text-center">5</div>
              <div className="col-span-8 border-r border-black p-1">Aggregate of 4 (a) and (b)</div>
              <div className="col-span-3 p-1 text-right font-semibold">Rs. 0</div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-center">6</div>
              <div className="col-span-8 border-r border-black p-1">Income chargeable under the head 'Salaries' (3-5)</div>
              <div className="col-span-3 p-1 text-right font-semibold">Rs. 0</div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-center">7</div>
              <div className="col-span-8 border-r border-black p-1">Add : Any other income reported by the employee</div>
              <div className="col-span-3 p-1 text-right">Rs. 0</div>
            </div>

            {/* Income details */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 border-r border-black p-1 pl-4">Income</div>
              <div className="col-span-6 border-r border-black p-1"></div>
              <div className="col-span-3 p-1 text-right">Rs.</div>
            </div>

            <div className="grid grid-cols-12 border-b border-black bg-gray-50">
              <div className="col-span-1 border-r border-black p-1"></div>
              <div className="col-span-8 border-r border-black p-1"></div>
              <div className="col-span-3 p-1 text-right font-semibold">Rs. 0</div>
            </div>
          </div>

          {/* Chapter VI-A Section */}
          <div className="border-b border-black p-2">
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-center">9</div>
              <div className="col-span-8 border-r border-black p-1">Deductions under Chapter VIA</div>
              <div className="col-span-3 p-1"></div>
            </div>
            
            <div className="p-2">
              <p className="font-semibold mb-2">(A) Sections 80C, 80CCC and 80 CCD</p>
              
              {/* Section headers */}
              <div className="grid grid-cols-12 border-b border-black text-center text-xs">
                <div className="col-span-6 border-r border-black p-1"></div>
                <div className="col-span-3 border-r border-black p-1">Gross Amount</div>
                <div className="col-span-3 p-1">Deductible Amount</div>
              </div>

              {/* Section items */}
              {[1, 2, 3, 4, 5, 6, 7].map(item => (
                <div key={item} className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-1 border-r border-black p-1 text-center">({String.fromCharCode(96 + item)})</div>
                  <div className="col-span-5 border-r border-black p-1"></div>
                  <div className="col-span-3 border-r border-black p-1 text-right">Rs. 0</div>
                  <div className="col-span-3 p-1 text-right">Rs. 0</div>
                </div>
              ))}

              {/* Total Section */}
              <div className="grid grid-cols-12 border-b border-black bg-gray-50">
                <div className="col-span-6 border-r border-black p-1 font-semibold pl-4">Total of Section 80C</div>
                <div className="col-span-3 border-r border-black p-1 text-right font-semibold">Rs. 0</div>
                <div className="col-span-3 p-1 text-right font-semibold">Rs. 0</div>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div className="p-4">
            <h3 className="font-bold text-sm mb-2">Verification</h3>
            <p className="text-sm mb-4 leading-tight">
              I {selectedEmployeeData ? `${selectedEmployeeData.first_name} ${selectedEmployeeData.last_name}` : 'EMPLOYEE NAME'}, son/daughter of working in the capacity of {selectedDepartment} (designation) do hereby certify that the information given above is true, complete and correct and is based on the books of account, documents, and other available records.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm">Place: Surat</p>
                <p className="text-sm mt-8">(Signature of person responsible for deduction of tax)</p>
              </div>
              <div>
                <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm mt-2">Designation: {selectedDepartment}</p>
                <p className="text-sm mt-1">
                  Full Name: {selectedEmployeeData ? `${selectedEmployeeData.first_name} ${selectedEmployeeData.last_name}` : 'EMPLOYEE NAME'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-4 p-4 border-t border-gray-300 no-print">
            <div className="flex justify-center gap-4">
              <button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Form 16
              </button>
              <button
                onClick={() => setShowForm16(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            .min-h-screen {
              min-height: auto;
            }
            .p-4 {
              padding: 0;
            }
            .max-w-4xl {
              max-width: 100%;
              margin: 0;
            }
            .border-gray-800 {
              border-color: black !important;
            }
            .bg-gray-100 {
              background-color: #f8f9fa !important;
            }
            .bg-gray-50 {
              background-color: #f8f9fa !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">Employee Allowance & Deduction</h1>
        </div>

        {/* Main Dashboard Card */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
          
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Department Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-left">
                Select Department
              </label>
              <div className="relative">
                <select 
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white appearance-none cursor-pointer text-gray-700"
                  disabled={loading || departments.length === 0}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {departments.length === 0 && !loading && (
                <p className="text-xs text-red-500">No departments available</p>
              )}
            </div>

            {/* Employee Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-left">
                Select Employee
              </label>
              <div className="relative">
                <select 
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white appearance-none cursor-pointer text-gray-700"
                  disabled={loading || !selectedDepartment || filteredEmployees.length === 0}
                >
                  <option value="">Select Employee</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={getEmployeeFullName(emp)}>
                      {getEmployeeFullName(emp)} ({emp.employee_no})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {!selectedDepartment && (
                <p className="text-xs text-gray-500">Select a department first</p>
              )}
              {selectedDepartment && filteredEmployees.length === 0 && !loading && (
                <p className="text-xs text-red-500">No employees in this department</p>
              )}
            </div>

            {/* Year Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-left">
                Select Year
              </label>
              <div className="relative">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 rounded bg-white appearance-none cursor-pointer text-gray-700"
                  disabled={loading || Object.keys(years).length === 0}
                >
                  <option value="">Select Year</option>
                  {Object.entries(years).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {Object.keys(years).length === 0 && !loading && (
                <p className="text-xs text-red-500">No years available</p>
              )}
            </div>
          </div>

          {/* Allowance and Deduction Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Allowance Section */}
            <div className="border border-gray-300 rounded p-4">
              <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Allowance</h3>
              <div className="space-y-2">
                {allowances.length > 0 ? (
                  allowances.map((allowance) => (
                    <div key={allowance.id} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-gray-700">{allowance.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No allowances available</p>
                )}
              </div>
            </div>

            {/* Deduction Section */}
            <div className="border border-gray-300 rounded p-4">
              <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Deduction</h3>
              <div className="space-y-2">
                {deductions.length > 0 ? (
                  deductions.map((deduction) => (
                    <div key={deduction.id} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-gray-700">{deduction.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No deductions available</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button 
              onClick={handleSubmit}
              disabled={!selectedDepartment || !selectedEmployee || !selectedYear || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded shadow-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;