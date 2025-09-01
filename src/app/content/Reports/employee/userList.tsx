"use client";

import React, { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import AddUserModal from "./AddUserModal";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  joinDate: string;
  profileImage: string;
}

interface UserListProps {
  employees: Employee[];
}

const UserList: React.FC<UserListProps> = ({ employees }) => {
  const [activeFilter, setActiveFilter] = useState<string>("View All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [employeesLists, setEmployeesLists] = useState<any[]>([]);

  const [userJobroleLists, setUserJobroleLists] = useState<any[]>([]);
  const [userLOR, setUserLOR] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
        user_profile_name,
        syear,
      } = JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
        syear,
      });
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
      fetchUserProfiles(); // ✅ Separate API call for user profiles
    }
  }, [sessionData.url, sessionData.token]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/user/add_user?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&user_profile_name=${sessionData.userProfile}&syear=${sessionData.syear}`
      );
      const data = await res.json();

      setEmployeesLists(data.data || []);
      setUserJobroleLists(data.jobroleList || []);
      setUserLOR(data.levelOfResponsbility || []);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  const fetchUserProfiles = async () => {
    try {
      const res = await fetch(
       `${sessionData.url}/user/add_user?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&user_profile_name=${sessionData.userProfile}&syear=${sessionData.syear}`
      );
      const data = await res.json();
      setUserProfiles(data.data || []);
    } catch (err) {
      console.error("Failed to fetch user profiles:", err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <AddUserModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        sessionData={{
          url: `${sessionData.url}`,
          subInstituteId: sessionData.subInstituteId,
          userId: sessionData.userId,
          token: sessionData.token,
        }}
        userJobroleLists={userJobroleLists}
        userLOR={userLOR}
        //userProfiles={userProfiles}
        userLists={employeesLists}
      />


      

      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-2 bg-[#e5f5ff] px-1 rounded-lg shadow-lg shadow-black-900/50">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-lg text-sm transition-colors ${
                activeFilter === filter
                  ? "bg-[#9ecfff] text-blue-800"
                  : "text-gray-600 hover:bg-blue-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div>
          <button
            type="button"
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-blue-600 text-blue-600 hover:border-blue-500 hover:text-blue-500"
            onClick={() => setIsModalOpen(true)}
          >
            Add User
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg bg-white shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-[#9cc4f1]">
              <th className="text-left px-4 py-3">Full Name</th>
              <th className="text-left px-4 py-3">Mobile</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Active Status</th>
              <th className="text-left px-4 py-3">Join Date</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {employeesLists.map((employee) => (
              <tr key={employee.id} className="bg-[#FFF7F5] border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                      <img
                        src={
                          employee.image
                            ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${employee.image}`
                            : "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0"
                        }
                        alt="Profile"
                        className="w-[50px] h-[50px] rounded-full border border-[#ddd]"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {employee.full_name}
                      </div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{employee.mobile}</td>
                <td className="px-4 py-3 text-gray-700">{employee.profile_name}</td>
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
                <td className="px-4 py-3 text-gray-700">{employee.join_year}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      localStorage.setItem("clickedUser", employee.id);
                      const menu = "user/usersTabs.tsx";
                      (window as any).__currentMenuItem = menu;
                      window.dispatchEvent(
                        new CustomEvent("menuSelected", {
                          detail: {
                            menu,
                            pageType: "page",
                            access: menu,
                            pageProps: employee.id || null,
                          },
                        })
                      );
                    }}
                  >
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

export default UserList;
