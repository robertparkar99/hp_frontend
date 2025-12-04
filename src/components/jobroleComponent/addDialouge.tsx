"use client";

import React, { useEffect, useState } from "react";

interface AddDialogProps {
  skillId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  jobrole: string;
  description: string;
  department?: string;
  subDepartment?: string;
  performance_expectation?: string;
}

const AddDialog: React.FC<AddDialogProps> = ({ onClose, onSuccess }) => {
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: ""
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    jobrole: "",
    description: "",
  });

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
      const apiUrl = `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`;

      const res = await fetch(apiUrl, {
        headers: sessionData.token
          ? { Authorization: `Bearer ${sessionData.token}` }
          : {},
      });

      const data = await res.json();

      if (!data?.data) {
        setDepartments([]);
        return;
      }

      const deptArray: any[] = [];

      // Extract unique Department list
      Object.entries(data.data).forEach(([deptName, jobroles]: any) => {
        if (Array.isArray(jobroles) && jobroles.length > 0) {
          deptArray.push({
            id: jobroles[0].department_id,
            department_name: deptName,
          });
        }
      });

      setDepartments(deptArray);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  };

  const fetchSubDepartments = async (department: string) => {
    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_department&searchWord=${encodeURIComponent(department)}`
      );
      const data = await res.json();
      setSubDepartments(data.searchData || []);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
  };

  // 🧠 Generate jobrole data using AI by AJ
  const generateJobRoleContent = async (jobrole: string, description: string) => {
    if (!jobrole.trim() || !description.trim()) {
      return alert("Please enter both Job Role and Description first");
    }

    if (!formData.department) {
      return alert("Please select a Department first");
    }

    if (!formData.subDepartment) {
      return alert("Please select a Sub Department first");
    }

    try {
      const res = await fetch("/api/generate-jobrole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobrole,
          description,
          orgType: sessionData.orgType,
        }),
      });

      const data = await res.json();

      if (!data?.choices?.length) throw new Error("Empty AI response");

      let content = data.choices[0].message.content.trim();
      content = content.replace(/```json|```/g, "").trim();

      let aiResponse: any;
      try {
        aiResponse = JSON.parse(content);
      } catch (err) {
        console.warn("AI returned invalid JSON:", content);
        return alert("AI returned invalid JSON, please retry.");
      }

      setFormData(prev => ({
        ...prev,
        department: aiResponse.department || prev.department,
        subDepartment: aiResponse.sub_department || prev.subDepartment,
        performance_expectation: aiResponse.performance_expectation || prev.performance_expectation,
      }));

      if (aiResponse.department) await fetchSubDepartments(aiResponse.department);

    } catch (error) {
      console.error("Error generating job role content:", error);
      alert("Error generating AI content. Check console for details.");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "department" && value) {
      fetchSubDepartments(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const selectedDept = departments.find(dept => dept.department_name === formData.department);
    if (!selectedDept) {
      alert("Please select a valid department");
      return;
    }

    const payload = {
      ...formData,
      department_id: selectedDept.id,
      type: "API",
      method_field: "POST",
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "user",
    };

    try {
      const res = await fetch(`${sessionData.url}/jobrole_library`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.token}`,
          "Accept": "application/json",
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

  return (
    <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 h-screen overflow-y-auto hide-scroll">
      <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative my-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">✖</button>

        {/* Header */}
        <div className="flex w-full">
          <div className="w-[10%] bg-gradient-to-b from-violet-100 to-violet-200 p-2 rounded-l-lg">
            <img src={`/assets/loading/robo_dance.gif`} alt="AI Robo" className="w-full h-auto" />
          </div>
          <div className="w-[90%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 text-center rounded-r-lg">
            <h2 className="text-gray-800 font-bold text-lg">Add New Job Role</h2>
            <h4 className="text-gray-700 font-semibold text-sm">
              <b>Industry : </b>{sessionData.orgType}
            </h4>
          </div>
        </div>

        <div className="w-full bg-gradient-to-r from-blue-100 to-blue-200 my-2 p-4 text-center rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="text-left mb-5">
                <label htmlFor="department">Department</label><br />
                <select
                  name="department"
                  value={formData.department || ""}
                  onChange={handleFormChange}
                  className="form-select w-full border-2 rounded-lg p-2 border-[var(--color-blue-100)] bg-white text-black focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.department_name}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>

              </div>

              <div className="text-left mb-5">
                <label htmlFor="subDepartment">Sub Department</label><br />
                <select
                  name="subDepartment"
                  value={formData.subDepartment || ""}
                  onChange={handleFormChange}
                  className="form-select w-full border-2 rounded-lg p-2 border-[var(--color-blue-100)] bg-white text-black focus:border-blue-500"
                >
                  <option value="">Select Sub Department</option>
                  {subDepartments.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="text-left mb-5">
                <label htmlFor="jobrole">Job Role</label><br />
                <input
                  type="text"
                  name="jobrole"
                  value={formData.jobrole}
                  onChange={handleFormChange}
                  placeholder="Enter Job Role..."
                  className="w-full border-2 rounded-lg p-2 border-[var(--color-blue-100)] bg-white text-black focus:border-blue-500"
                  required
                />
              </div>

              <div className="text-left mb-5">
                <label htmlFor="description">Description</label><br />
                <div className="flex gap-2">
                  <textarea
                    name="description"
                    rows={2}
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter Description..."
                    className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  ></textarea>
                  <button
                    type="button"
                    onClick={() => generateJobRoleContent(formData.jobrole, formData.description)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 h-10 w-50"
                    title="Generate with AI"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.5 4.938l1.563 1.562a4.001 4.001 0 01-5.656 5.656L8.344 13.5a4 4 0 105.656-5.656l-1.563-1.563a5.5 5.5 0 00-7.778 7.778l1.562 1.563a5.5 5.5 0 007.778-7.778z" />
                    </svg>
                    AI Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="text-left mb-5">
              <label htmlFor="performance_expectation">Performance Expectation</label><br />
              <textarea
                name="performance_expectation"
                rows={3}
                value={formData.performance_expectation || ""}
                onChange={handleFormChange}
                placeholder="Enter Performance Expectation..."
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              ></textarea>
            </div>

            <button
              type="submit"
              className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br 
              focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDialog;
