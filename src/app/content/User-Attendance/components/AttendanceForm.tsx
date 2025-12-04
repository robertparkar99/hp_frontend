"use client";
import React, { useState } from "react";
import { Save, Clock, Calendar, FileText } from "lucide-react";
import { Employee, AttendanceFormData } from "../types/attendance";
import { format } from "date-fns";

interface AttendanceFormProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSubmit: (data: AttendanceFormData) => void;
  onCancel: () => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  employees,
  selectedEmployee,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<AttendanceFormData>({
    employeeId: selectedEmployee?.id ? String(selectedEmployee.id) : "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Add Attendance</h3>
          <p className="text-sm text-gray-500">Record employee punch in time</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select an employee...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Punch In Time (disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Punch In
            </label>
            <input
              type="time"
              value={formData.time}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Submit</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;
