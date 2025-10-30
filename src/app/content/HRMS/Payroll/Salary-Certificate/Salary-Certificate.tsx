"use client";

import React, { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: number;
  name: string;
  employee_no: string;
}

interface Department {
  id: string;
  name: string;
}

interface PayrollType {
  id: number;
  payroll_name: string;
}

interface ApiResponse {
  departments?: { [key: string]: string };
  employees?: Employee[] | { [key: string]: any };
  months?: string[];
  status?: string;
  message?: string;
  pdf_url?: string;
}

const SalaryCertificate: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedPayrollType, setSelectedPayrollType] = useState("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [reason, setReason] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollTypes, setPayrollTypes] = useState<PayrollType[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  const [sessionData, setSessionData] = useState({
    url: "http://127.0.0.1:8000",
    token: "",
    subInstituteId: "",
  });

  const years = ["2024", "2025", "2026"];

  // Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
      });
    }
  }, []);

  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!sessionData.token || !sessionData.subInstituteId) return;
      try {
        setLoadingDepartments(true);
        const params = new URLSearchParams({
          token: sessionData.token,
          type: "API",
          sub_institute_id: sessionData.subInstituteId,
        });

        const res = await fetch(`${sessionData.url}/hrms-salary-certificate?${params}`);
        const data: ApiResponse = await res.json();

        if (data.departments && typeof data.departments === "object") {
          const deptArray: Department[] = Object.entries(data.departments).map(([id, name]) => ({
            id,
            name,
          }));
          setDepartments(deptArray);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [sessionData]);

  // Fetch Employees when department changes
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedDepartment) {
        setEmployees([]);
        return;
      }
      try {
        setLoadingEmployees(true);
        const params = new URLSearchParams({
          token: sessionData.token,
          type: "API",
          sub_institute_id: sessionData.subInstituteId,
          department_id: selectedDepartment,
        });

        const res = await fetch(`${sessionData.url}/hrms-salary-certificate?${params}`);
        const data: ApiResponse = await res.json();

        if (data.employees) {
          if (Array.isArray(data.employees)) setEmployees(data.employees);
          else if (typeof data.employees === "object")
            setEmployees(Object.values(data.employees) as Employee[]);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [selectedDepartment, sessionData]);

  // Fetch months from API
  useEffect(() => {
    const fetchMonths = async () => {
      if (!sessionData.token || !sessionData.subInstituteId) return;
      try {
        setLoadingMonths(true);
        const params = new URLSearchParams({
          token: sessionData.token,
          type: "API",
          sub_institute_id: sessionData.subInstituteId,
        });
        const res = await fetch(`${sessionData.url}/hrms-salary-months?${params}`);
        const data: ApiResponse = await res.json();

        if (Array.isArray(data.months)) {
          setAvailableMonths(data.months);
        } else {
          setAvailableMonths([]);
        }
      } catch (err) {
        console.error("Error fetching months:", err);
        setAvailableMonths([]);
      } finally {
        setLoadingMonths(false);
      }
    };
    fetchMonths();
  }, [sessionData]);

  // Mock Payroll Types
  useEffect(() => {
    setPayrollTypes([
      { id: 1, payroll_name: "Basic" },
      { id: 2, payroll_name: "HRA" },
      { id: 3, payroll_name: "DA" },
      { id: 4, payroll_name: "Bonus" },
    ]);
  }, []);

  const handleGenerateCertificate = async () => {
    if (!selectedDepartment || selectedMonths.length === 0 || !selectedEmployee || !selectedPayrollType) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoadingGenerate(true);

      const params = new URLSearchParams({
        token: sessionData.token,
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        department_id: selectedDepartment,
        month: selectedMonths.join(","), // multiple months
        employee_id: selectedEmployee,
        payroll_type_id: selectedPayrollType,
        syear: selectedYear,
        reason,
      });

      const res = await fetch(`${sessionData.url}/generate-salary-certificate?${params}`);
      const result = await res.json();

      if (res.ok && result.status === "1") {
        if (result.pdf_url) window.open(result.pdf_url, "_blank");
        alert("Salary certificate generated successfully!");
      } else {
        alert(`Error: ${result.message || "Failed to generate certificate"}`);
      }
    } catch (err) {
      console.error("Error generating certificate:", err);
      alert("Error generating salary certificate");
    } finally {
      setLoadingGenerate(false);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-6xl mx-auto my-10">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Salary Certificate
        </h1>
      </div>

      <div className="space-y-6">
        {/* Department */}
        <div>
          <label className="block mb-2 font-semibold">Department *</label>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedEmployee("");
            }}
            disabled={loadingDepartments}
            className="w-full p-3 border rounded-md"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {loadingDepartments && <p>Loading departments...</p>}
        </div>

        {/* Employee */}
        <div>
          <label className="block mb-2 font-semibold">Employee *</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            disabled={!selectedDepartment || loadingEmployees}
            className="w-full p-3 border rounded-md"
          >
            <option value="">Select Employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.employee_no})
              </option>
            ))}
          </select>
          {loadingEmployees && <p>Loading employees...</p>}
        </div>

        {/* Month (Multi-select) */}
        <div>
          <label className="block mb-2 font-semibold">Month(s) *</label>
          <select
            multiple
            value={selectedMonths}
            onChange={(e) =>
              setSelectedMonths(Array.from(e.target.selectedOptions, (opt) => opt.value))
            }
            className="w-full p-3 border rounded-md h-40"
          >
            {availableMonths.map((m, idx) => (
              <option key={idx} value={m.toLowerCase()}>
                {m}
              </option>
            ))}
          </select>
          {loadingMonths && <p>Loading months...</p>}
        </div>

        {/* Year */}
        <div>
          <label className="block mb-2 font-semibold">Year *</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-3 border rounded-md"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Payroll Type */}
        <div>
          <label className="block mb-2 font-semibold">Payroll Type *</label>
          <select
            value={selectedPayrollType}
            onChange={(e) => setSelectedPayrollType(e.target.value)}
            className="w-full p-3 border rounded-md"
          >
            <option value="">Select Payroll Type</option>
            {payrollTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.payroll_name}
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block mb-2 font-semibold">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for certificate"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleGenerateCertificate}
            disabled={loadingGenerate}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
          >
            {loadingGenerate ? "Generating..." : "Generate Certificate"}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            <Download className="w-5 h-5 inline-block mr-1" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalaryCertificate;
