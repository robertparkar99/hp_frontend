"use client";

import React, { useEffect, useState } from "react";

interface AddDialogProps {
  skillId: number | null;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
}

interface FormData {
  jobrole: string;
  description: string;
  department?: string;
  department_id?: number;
  subDepartment?: string;
  performance_expectation?: string;
}


const AddDialog: React.FC<AddDialogProps> = ({ onClose, onSuccess, isOpen }) => {
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: ""
  });
  const [departments, setDepartments] = useState<{ name: string, id: number }[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    jobrole: "",
    description: "",
    department: "",
    department_id: undefined,
    subDepartment: "",
    performance_expectation: ""
  });
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name
      });
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) fetchDepartments();
  }, [sessionData.url, sessionData.token]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`);
      const data = await res.json();
      console.log('Fetched data:', data);
      let depts: { name: string, id: number }[] = [];
      if (Array.isArray(data)) {
        const deptMap = new Map<string, number>();
        data.forEach((item: any) => {
          if (item.department_name && item.department_id && !deptMap.has(item.department_name)) {
            deptMap.set(item.department_name, item.department_id);
          }
        });
        depts = Array.from(deptMap.entries()).map(([name, id]) => ({ name, id }));
      } else if (data.data && typeof data.data === 'object') {
        // Assuming data.data is object with department names as keys, but to get ids, need to extract from values
        const deptMap = new Map<string, number>();
        Object.entries(data.data).forEach(([name, jobroles]: [string, any]) => {
          if (Array.isArray(jobroles) && jobroles.length > 0) {
            deptMap.set(name, jobroles[0].department_id);
          }
        });
        depts = Array.from(deptMap.entries()).map(([name, id]) => ({ name, id }));
      } else if (data.jobroles && Array.isArray(data.jobroles)) {
        const deptMap = new Map<string, number>();
        data.jobroles.forEach((item: any) => {
          if (item.department_name && item.department_id && !deptMap.has(item.department_name)) {
            deptMap.set(item.department_name, item.department_id);
          }
        });
        depts = Array.from(deptMap.entries()).map(([name, id]) => ({ name, id }));
      } else if (typeof data === 'object') {
        const deptMap = new Map<string, number>();
        Object.entries(data).forEach(([name, jobroles]: [string, any]) => {
          if (Array.isArray(jobroles) && jobroles.length > 0) {
            deptMap.set(name, jobroles[0].department_id);
          }
        });
        depts = Array.from(deptMap.entries()).map(([name, id]) => ({ name, id }));
      }
      setDepartments(depts);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  };

  const fetchSubDepartments = async (department: string) => {
    try {
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_department&searchWord=${encodeURIComponent(department)}`);
      const data = await res.json();
      setSubDepartments(data.searchData || []);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If department changes, fetch sub-departments
    if (name === "department" && value) {
      fetchSubDepartments(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData,
      department_id: formData.department_id,
      type: "API",
      method_field: 'POST',
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: 'user',
    };

    try {
      const res = await fetch(`${sessionData.url}/jobrole_library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      alert(data.message);
      onSuccess();
      onClose();

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 h-screen overflow-y-auto hide-scroll">
      <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative my-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">
          ✖
        </button>

        {/* header parts start  */}
        <div className="flex w-full">
          {/* Left: GIF */}
          <div className="w-[10%] bg-gradient-to-b from-violet-100 to-violet-200 p-2 rounded-l-lg">
            <img src={`/assets/loading/robo_dance.gif`} alt="Loading..." className="w-full h-auto" />
          </div>

          {/* Center Content */}
          <div className="w-[90%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 text-center rounded-r-lg">
            <h2 className="text-gray-800 font-bold text-lg">Add New Jobrole</h2>
            <h4 className="text-gray-700 font-semibold text-sm">
              <b>Industry : </b>{sessionData.orgType}
            </h4>
          </div>
        </div>

        {/* header parts end  */}
        <div className="w-[100%] bg-gradient-to-r from-blue-100 to-blue-200 my-2 p-4 text-center rounded-lg gap-4">
          <form className="w-[100%]" onSubmit={handleSubmit}>
            {/* Job Role and Location */}
            <div className="flex gap-4">
              <div className="relative z-50 w-full mb-5 group text-left">
                <label htmlFor="department" className="text-left">Jobrole Department</label><br />
                <div className="relative w-full">
                  <input
                    type="text"
                    name="department"
                    className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                    placeholder="Search or Add Department..."
                    value={formData.department}
                    onChange={(e) => {
                      handleFormChange(e);
                      setShowDeptDropdown(true);
                    }}
                    onFocus={() => setShowDeptDropdown(true)}
                    autoComplete="off"
                  />

                  {/* Custom Dropdown (Always Comes Under Input) */}
                  {showDeptDropdown && (
                    <ul className="absolute top-[42px] left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-43 overflow-y-auto hide-scrollbar z-50">
                      {departments
                        .filter((d) =>
                          d.name.toLowerCase().includes(formData.department?.toLowerCase() || "")
                        )
                        .map((dept, index) => (
                          <li
                            key={index}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, department: dept.name, department_id: dept.id }));
                              fetchSubDepartments(dept.name);
                              setShowDeptDropdown(false);
                            }}
                          >
                            {dept.name}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

              </div>

              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="subDepartment" className="text-left">Jobrole Sub-Department</label><br />

                <input
                  type="text"
                  name="subDepartment"   // ✅ FIXED
                  list="subDepartments"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  placeholder="Search or Add Sub-Department..."
                  onChange={handleFormChange}
                  value={formData.subDepartment}
                  autoComplete="off"
                  disabled={!formData.department}
                />

                <datalist id="subDepartments">
                  {subDepartments.map((subDept, index) => (
                    <option key={index} value={subDept}>
                      {subDept}
                    </option>
                  ))}
                </datalist>
              </div>

            </div>

            <div className="flex gap-4">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="jobrole" className="text-left">Job Role</label><br />
                <input
                  type="text"
                  name="jobrole"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  placeholder="Enter Job Role..."
                  onChange={handleFormChange}
                  value={formData.jobrole}
                  required
                />
              </div>
              {/* Description */}
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="description" className="text-left">Jobrole Description</label><br />
                <textarea
                  name="description"
                  rows={3}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Job Description..."
                  onChange={handleFormChange}
                  value={formData.description}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="performance_expectation" className="text-left">Performance Expectation</label><br />
                <textarea
                  name="performance_expectation"
                  rows={3}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Performance Expectation..."
                  onChange={handleFormChange}
                  value={formData.performance_expectation}
                ></textarea>
              </div>

            </div>

            <button type="submit" className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDialog;