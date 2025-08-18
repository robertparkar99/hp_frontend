"use client";
import React, { useState, useMemo } from "react";

type GroupwiseRights = {
  id: number;
  userProfileName: string;
  menuName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

const customCheck = (value: boolean) => {
  return value ? (
    <span className="text-emerald-500 text-lg">✔</span>
  ) : (
    <span className="text-gray-300 text-lg">—</span>
  );
};

export default function GroupwiseRightsTable() {
  const [filterText, setFilterText] = useState("");

  const data: GroupwiseRights[] = useMemo(
    () => [
      { id: 1, userProfileName: "Teacher", menuName: "Institute (Master)", canView: true, canAdd: true, canEdit: true, canDelete: true },
      { id: 2, userProfileName: "Teacher", menuName: "Student Quota", canView: true, canAdd: true, canEdit: true, canDelete: true },
      { id: 3, userProfileName: "Teacher", menuName: "Student Request Type", canView: true, canAdd: true, canEdit: true, canDelete: false },
      { id: 4, userProfileName: "Teacher", menuName: "Petty Cash Master", canView: true, canAdd: true, canEdit: false, canDelete: false },
      { id: 5, userProfileName: "Teacher", menuName: "User Profile Masters", canView: true, canAdd: false, canEdit: false, canDelete: false },
      { id: 6, userProfileName: "Teacher", menuName: "Exam & Question Master", canView: true, canAdd: true, canEdit: true, canDelete: true },
      { id: 7, userProfileName: "Teacher", menuName: "Implementation Management", canView: true, canAdd: false, canEdit: false, canDelete: false },
      { id: 8, userProfileName: "Teacher", menuName: "SMS API Master", canView: true, canAdd: true, canEdit: false, canDelete: false },
      { id: 9, userProfileName: "Teacher", menuName: "Create Batch", canView: true, canAdd: true, canEdit: true, canDelete: false },
      { id: 10, userProfileName: "Teacher", menuName: "Create Periods", canView: true, canAdd: false, canEdit: false, canDelete: false },
    ],
    []
  );

  const filteredItems = data.filter(
    (item) =>
      item.menuName.toLowerCase().includes(filterText.toLowerCase()) ||
      item.userProfileName.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-6 mt-10 mx-10 bg-white rounded-xl shadow-md">
      {/* header with button + search */}
      <div className="flex justify-between items-center mb-4">
        <button className="bg-[#C7E3FF] text-black px-5 py-2 rounded-lg text-sm font-medium shadow">
          + Manage Groupwise Rights
        </button>

        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm  focus:outline-none"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* modern table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="text-gray-700 bg-[#C7E3FF] text-left text-sm">
              <th className="px-6 py-3">Id</th>
              <th className="px-6 py-3">User Profile Name</th>
              <th className="px-6 py-3">Menu Name</th>
              <th className="px-6 py-3 text-center">Can View</th>
              <th className="px-6 py-3 text-center">Can Add</th>
              <th className="px-6 py-3 text-center">Can Edit</th>
              <th className="px-6 py-3 text-center">Can Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((row, idx) => (
              <tr
                key={row.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-white"}
              >
                <td className="px-6 py-3 text-sm text-gray-700">{row.id}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{row.userProfileName}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{row.menuName}</td>
                <td className="px-6 py-3 text-center">{customCheck(row.canView)}</td>
                <td className="px-6 py-3 text-center">{customCheck(row.canAdd)}</td>
                <td className="px-6 py-3 text-center">{customCheck(row.canEdit)}</td>
                <td className="px-6 py-3 text-center">{customCheck(row.canDelete)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
