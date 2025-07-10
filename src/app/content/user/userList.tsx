"use client";

import React from "react";
import { Check, MoreVertical, Search } from "lucide-react";
import { useEffect, useState } from "react";
import MyProfile from '../Dashboard/MyProfile';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  joinDate: string;
  profileImage: string;
}

interface userListProps {
  employees: Employee[];
}

const userList: React.FC<userListProps> = ({ employees }) => {
  const [activeFilter, setActiveFilter] = React.useState<string>("View All");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [employeesLists, setEmployeesLists] = React.useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const filters = ["View All", "Admin", "Creator", "General"];

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    syear: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, syear, } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
        syear: syear,
      });
    }
  }, [])

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
    }
    // Only run when sessionData is updated with url and token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData.url, sessionData.token]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/user/add_user?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_profile_name=${sessionData.userProfile}&syear=${sessionData.syear}`
      );
      const data = await res.json();
      console.log('empData', data.data);
      setEmployeesLists(data.data || []);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
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
        <div className="flex space-x-2 bg-[#e5f5ff] px-1 rounded-lg shadow-lg shadow-black-900/50">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-lg text-sm transition-colors ${activeFilter === filter
                  ? "bg-[#9ecfff] text-blue-800 inset-shadow-sm inset-shadow-black-500"
                  : "text-gray-600 hover:bg-blue-100"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative">
          {/* <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
          /> */}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg bg-white shadow-lg shadow-black/40">
        <table className="w-full">
          <thead>
            <tr className="bg-[#9cc4f1]">
              <th className="text-left px-4 py-3 text-gray-700 font-medium">
                Full Name
              </th>
              <th className="text-left px-4 py-3 text-gray-700 font-medium">
                Mobile
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
            {employeesLists && employeesLists.map((employee, index) => (
              <tr
                key={employee.id}
                className="bg-[#FFF7F5] border-b border-gray-100 hover:bg-gray-50"
              >
                {/* <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600"
                    checked={selectedIds.includes(employee.id)}
                    onChange={() => toggleSelect(employee.id)}
                  />
                </td> */}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                      {employee && employee.image && employee.image !== '' ? (
                        <img
                          src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/` + employee.image}
                          alt="Profile picture"
                          className="w-[50px] h-[50px] rounded-full border-1 border-[#ddd]"
                        />
                      ) : (
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
                          alt="Profile picture"
                          className="w-[50px] h-[50px] bg-white rounded-full border-1 border-[#ddd]"
                        />
                      )}

                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {employee.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                 <td className="px-4 py-3 text-gray-700">{employee.mobile}</td>
                <td className="px-4 py-3 text-gray-700">{employee.profile_name}</td>
                <td className="px-4 py-3">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-md ${employee.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {employee.status}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{employee.join_year}</td>
                <td className="px-4 py-3">
      <div className="relative">
        <button 
          className="text-gray-400 hover:text-gray-600"
         onClick={() => {
                  const menu = "Dashboard/JobrolesSkill.tsx";
                  (window as any).__currentMenuItem = menu;
                  window.dispatchEvent(new CustomEvent("menuSelected", { detail: { menu: menu, pageType: 'page', access: menu, pageProps: employee.id || null } }));
                }}
        >
          <MoreVertical size={20} />
        </button>
        
        {/* Conditionally render MyProfile when this employee is selected */}
        {selectedEmployee === employee.id && (
            <MyProfile employeeId={employee.id} />
        )}
      </div>
    </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default userList;
