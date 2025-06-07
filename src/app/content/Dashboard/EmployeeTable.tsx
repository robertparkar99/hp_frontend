"use client";

import React from "react";
import { Check, MoreVertical, Search } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  joinDate: string;
  profileImage: string;
}

interface EmployeeTableProps {
  employees: Employee[];
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  const [activeFilter, setActiveFilter] = React.useState<string>("View All");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const filters = ["View All", "Admin", "Creator", "General"];
  const allSelected = employees.length > 0 && selectedIds.length === employees.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((emp) => emp.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Filter and Search Section */}
      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-2 bg-blue-100/50 p-1 rounded-lg">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeFilter === filter
                  ? "bg-blue-200 text-blue-800"
                  : "text-gray-600 hover:bg-blue-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg shadow-md bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-200/70">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="text-left px-4 py-3 text-gray-700 font-medium">
                Full Name
              </th>
              <th className="text-left px-4 py-3 text-gray-700 font-medium">
                Role
              </th>
              <th className="text-left px-4 py-3 text-gray-700 font-medium">
                Active Status
              </th>
              <th className="text-left px-4 py-3 text-gray-700 font-medium">
                Join Date
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600"
                    checked={selectedIds.includes(employee.id)}
                    onChange={() => toggleSelect(employee.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={employee.profileImage}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{employee.role}</td>
                <td className="px-4 py-3">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-md ${
                      employee.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {employee.status}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{employee.joinDate}</td>
                <td className="px-4 py-3">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmployeeTable;
