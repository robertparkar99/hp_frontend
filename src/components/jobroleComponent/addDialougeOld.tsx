"use client";

import React, { useEffect, useState, useCallback } from "react";

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
  const [allSubDepartments, setAllSubDepartments] = useState<any>({});
  const [loading, setLoading] = useState(false);
  // const [jobroles, setJobroles] = useState<{ name: string }[]>([]);
  const [formData, setFormData] = useState<FormData>({
    jobrole: "",
    description: "",
    department: "",
    department_id: undefined,
    subDepartment: "",
    performance_expectation: ""
  });

  // const [showJobroleDropdown, setShowJobroleDropdown] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("userData");
    if (!data) return;
    const parsed = JSON.parse(data);
    setSessionData({
      url: parsed.APP_URL,
      token: parsed.token,
      orgType: parsed.org_type,
      subInstituteId: parsed.sub_institute_id,
      userId: parsed.user_id,
      userProfile: parsed.user_profile_name
    });
  }, []);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(`${sessionData.url}/api/departments-management`);
      url.searchParams.set("type", "api");
      url.searchParams.set("token", sessionData.token);
      url.searchParams.set("sub_institute_id", sessionData.subInstituteId);
      const res = await fetch(url.toString());
      const data = await res.json();
      console.log('Fetched data:', data);
      setDepartments(
        (data.main_departments || []).map((d: any) => ({
          name: d.department,
          id: d.id
        }))
      );
      setAllSubDepartments(data.sub_departments || {});
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [sessionData.url, sessionData.token, sessionData.subInstituteId]);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchDepartments();
    }
  }, [sessionData.url, sessionData.token, fetchDepartments]);

  // const fetchJobroles = async () => {
  //   try {
  //     const res = await fetch(`${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}`);
  //     const json = await res.json();
  //     let data: any[] = [];
  //     if (Array.isArray(json)) {
  //       data = json;
  //     } else if (json?.data) {
  //       data = json.data;
  //     }
  //     const roles = data.map((item: any) => ({ name: item.jobrole }));
  //     setJobroles(roles);
  //   } catch (error) {
  //     console.error("Error fetching jobroles:", error);
  //   }
  // };



  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { subDepartment, ...rest } = formData;

    const payload = {
      ...rest,
      sub_department: subDepartment,
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
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="department" className="text-left">Jobrole Department</label><br />
                <select
                  name="department"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  value={formData.department}
                  disabled={loading}
                  onChange={(e) => {
                    handleFormChange(e);
                    const value = e.target.value;
                    const selectedDept = departments.find(d => d.name === value);
                    if (selectedDept) {
                      setFormData(prev => ({ ...prev, department_id: selectedDept.id, subDepartment: "" }));
                      setSubDepartments((allSubDepartments[selectedDept.id] || []).map((sub: any) => sub.department));
                    } else {
                      setFormData(prev => ({ ...prev, department_id: undefined, subDepartment: "" }));
                      setSubDepartments([]);
                    }
                  }}
                >
                  <option value="">Select Department...</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="subDepartment" className="text-left">Jobrole Sub-Department</label><br />

                <select
                  name="subDepartment"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  value={formData.subDepartment}
                  onChange={handleFormChange}
                  disabled={!formData.department || loading}
                >
                  <option value="">Select Sub-Department...</option>
                  {subDepartments.map((subDept, index) => (
                    <option key={index} value={subDept}>
                      {subDept}
                    </option>
                  ))}
                </select>
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