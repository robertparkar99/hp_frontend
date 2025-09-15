"use client";
import React, { useState } from "react";
import { Clock, Calendar, AlertCircle, User } from "lucide-react";
import { AttendanceRecord, Employee } from "../types/attendance";
import { format, parseISO } from "date-fns";

interface AttendanceListProps {
  records: AttendanceRecord[];
  employees: Employee[];
  selectedEmployee: Employee | null;
  onUpdateRecords?: (updated: AttendanceRecord[]) => void;
  fromDate?: string;
  toDate?: string;
}

const fallbackImg =
  "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

const getAvatarUrl = (image?: string): string => {
  if (image && image.trim()) {
    return image.startsWith("http")
      ? image
      : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${encodeURIComponent(
          image
        )}`;
  }
  return fallbackImg;
};

const AttendanceList: React.FC<AttendanceListProps> = ({
  records,
  employees,
  selectedEmployee,
  onUpdateRecords,
  fromDate,
  toDate,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editedRecords, setEditedRecords] = useState<Record<string, AttendanceRecord>>({});

  const getEmployee = (employeeId: string): Employee | undefined => {
    return employees.find((emp) => emp.id === employeeId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "early-leave":
        return "bg-orange-100 text-orange-800";
      case "absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <Clock className="w-3 h-3" />;
      case "late":
      case "early-leave":
        return <AlertCircle className="w-3 h-3" />;
      case "absent":
        return <User className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  let filteredRecords = selectedEmployee
    ? records.filter((record) => record.employeeId === selectedEmployee.id)
    : records;

  if (fromDate) {
    filteredRecords = filteredRecords.filter(
      (rec) => new Date(rec.date) >= new Date(fromDate)
    );
  }
  if (toDate) {
    filteredRecords = filteredRecords.filter(
      (rec) => new Date(rec.date) <= new Date(toDate)
    );
  }

  const sortedRecords = filteredRecords.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleCheckboxChange = (record: AttendanceRecord) => {
    setSelectedRows((prev) =>
      prev.includes(record.id)
        ? prev.filter((id) => id !== record.id)
        : [...prev, record.id]
    );
    setEditedRecords((prev) => ({
      ...prev,
      [record.id]: { ...record },
    }));
  };

  const handleFieldChange = (
    recordId: string,
    field: "punchIn" | "punchOut",
    value: string
  ) => {
    setEditedRecords((prev) => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [field]: value,
      },
    }));
  };

  const handleUpdate = () => {
    const updated = selectedRows.map((id) => editedRecords[id]);
    if (onUpdateRecords) onUpdateRecords(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedEmployee
                ? `${selectedEmployee.name}'s Attendance`
                : "All Employee Attendance"}
            </h3>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sr. No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Punch In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Punch Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRecords.map((record, index) => {
              const employee = getEmployee(record.employeeId);
              const isSelected = selectedRows.includes(record.id);
              const edited = editedRecords[record.id] || record;

              return (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  {/* Sr. No + Checkbox */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(record)}
                      className="mr-2"
                    />
                    {index + 1}
                  </td>

                  {/* Employee */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={getAvatarUrl(employee?.avatar)}
                        alt={employee?.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImg;
                        }}
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {employee?.name || "Unknown Employee"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(record.date), "MMM dd, yyyy")}
                  </td>

                  {/* Punch In */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isSelected ? (
                      <input
                        type="time"
                        value={edited.punchIn || ""}
                        onChange={(e) =>
                          handleFieldChange(record.id, "punchIn", e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      record.punchIn || "-"
                    )}
                  </td>

                  {/* Punch Out */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isSelected ? (
                      <input
                        type="time"
                        value={edited.punchOut || ""}
                        onChange={(e) =>
                          handleFieldChange(record.id, "punchOut", e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      record.punchOut || "-"
                    )}
                  </td>

                  {/* Total Hours */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.totalHours ? `${record.totalHours}h` : "-"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getStatusIcon(record.status)}
                      <span className="capitalize">
                        {record.status.replace("-", " ")}
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedRecords.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No attendance records
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedEmployee
                ? `No records found for ${selectedEmployee.name}`
                : "No attendance records available"}
            </p>
          </div>
        )}
      </div>

      {/* Update Button */}
      {selectedRows.length > 0 && (
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Update Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
