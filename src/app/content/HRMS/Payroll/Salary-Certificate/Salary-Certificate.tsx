"use client";

import React, { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { se } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Employee {
  id: number;
  name: string;
  first_name: string;
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
    url: "",
    token: "",
    subInstituteId: "",
    userId: "",
  });

  const years = ["2024", "2025", "2026"];

  // Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        userId: user_id,
      });
    }
  }, []);

  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!sessionData.token || !sessionData.subInstituteId) return;
      try {
        setLoadingDepartments(true);

        const res = await fetch(`${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`);
        const json = await res.json();

        const list = Object.entries(json.data || {}).map(([deptName, jobRoles]) => {
          const deptId = (jobRoles as any[])[0]?.department_id;
          const name = (jobRoles as any[])[0]?.department_name || deptName;
          return { id: deptId?.toString(), name };
        });
        setDepartments(list);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [sessionData]);

  // Fetch Employees when department changes
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedDepartment || !sessionData.url || !sessionData.subInstituteId) {
        setEmployees([]);
        return;
      }
      try {
        setLoadingEmployees(true);

        const res = await fetch(`${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[status]=1&filters[department_id]=${selectedDepartment}&user_id=${sessionData.userId}`);
        const json = await res.json();

        const list = Array.isArray(json) ? json : json.data ?? [];
        setEmployees(list);
        console.log("Employees for department", selectedDepartment, list);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setEmployees([]);
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
          <Select
            value={selectedDepartment}
            onValueChange={(value) => {
              setSelectedDepartment(value);
              setSelectedEmployee("");
            }}
            disabled={loadingDepartments}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingDepartments ? "Loading..." : "Select Department"} />
            </SelectTrigger>
            <SelectContent className="w-200">
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employee */}
        <div>
          <label className="block mb-2 font-semibold">Employee *</label>
          <Select
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
            disabled={!selectedDepartment || loadingEmployees}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingEmployees ? "Loading..." : "Select Employee"} />
            </SelectTrigger>
            <SelectContent >
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  {e.first_name}{e.employee_no ? ` (${e.employee_no})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
