import React, { useEffect, useState } from "react";

type Props = { 
  editData: any,
  onClose?: () => void;
  onSuccess?: () => void; };

const DetailData: React.FC<Props> = ({ editData, onClose, onSuccess }) => {
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });

  type FormData = {
    jobrole: "",
    description: "",
    department: '',
    sub_department: "",
    performance_expectation: "",
    jobrole_category: "",
    education?: "",
    training?: "",
    experience?: "",
  };

  const [formData, setFormData] = useState<FormData>({
    jobrole: editData?.jobrole || "",
    description: editData?.description || "",
    department: editData?.department || '',
    sub_department: editData?.sub_department || "",
    jobrole_category: editData?.jobrole_category || "",
    performance_expectation: editData?.performance_expectation || "",
    education: editData?.education || "",
    training: editData?.training || "",
    experience: editData?.experience || "",
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  useEffect(() => {
    // alert(editData?.id);
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
        user_profile_name,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
      });
    }
  }, []);

  // New useEffect to handle editData prop changes
  useEffect(() => {

    if (editData) {
      setFormData({
        jobrole: editData?.jobrole || "",
        description: editData?.description || "",
        department: editData?.department || '',
        sub_department: editData?.sub_department || "",
        jobrole_category: editData?.jobrole_category || "",
        performance_expectation: editData?.performance_expectation || "",
        education: editData?.education || "",
        training: editData?.training || "",
        experience: editData?.experience || "",

      });
    }

  }, [editData]); // Depend on editData

  useEffect(() => {
    if (sessionData.url && sessionData.token) fetchDepartments();
  }, [sessionData.url, sessionData.token]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=department&searchWord="departments"`);
      const data = await res.json();
      setDepartments(data.searchData || []);
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

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
     if (name === "department" && value) {
      fetchSubDepartments(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData, // Use the current formData state
      type: "API",
      method_field: "PUT",
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "user",
    };

    try {
      const res = await fetch(
        `${sessionData.url}/jobrole_library/${editData?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      alert(data.message);
      if (onSuccess) onSuccess(); // Refresh tableView
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="w-[100%]">
      <form className="w-[100%]" onSubmit={handleSubmit}>

        <div className="flex gap-4">
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="department" className="text-left">Jobrole Department</label><br />
            <input
              type="text"
              name="department"
              list="departments"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
              placeholder="Search or Add Department..."
              onChange={handleFormChange}
              value={formData.department}
              required
              autoComplete="off"
            />
            <datalist id="departments">
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </datalist>
          </div>

          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="jobrole_category" className="text-left">Jobrole Category</label><br />
            <input
              type="text"
              name="jobrole_category"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
              placeholder="Enter Jobrole Category..."
              onChange={handleFormChange}
              value={formData.jobrole_category}
            />
          </div>
{/*
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="subDepartment" className="text-left">Jobrole Sub-Department</label><br />
            <input
              type="text"
              name="sub_department"
              list="subDepartments"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
              placeholder="Search or Add Sub-Department..."
              onChange={handleFormChange}
              value={formData.sub_department}
            />
            <datalist id="subDepartments">
              {subDepartments.map((subDept) => (
                <option key={subDept} value={subDept}>
                  {subDept}
                </option>
              ))}
            </datalist>
          </div>
*/}
        </div>

        {/* Job Role and Location */}
        <div className="flex gap-4">
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="jobrole" className="text-left">Job Role</label><br />
            <input
              type="text"
              name="jobrole"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#ddd] text-black focus:outline-none focus:border-blue-500"
              placeholder="Enter Job Role..."
              onChange={handleFormChange}
              value={formData.jobrole}
              required
              readOnly
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
{/* Description */}
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
           <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="education" className="text-left">Education</label><br />
            <input
              type="text"
              name="education"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
              placeholder="Enter Education..."
              onChange={handleFormChange}
              value={formData.education}
            />
          </div>
          
{/* education
training
experience */}
        </div>

          <div className="flex gap-4">
{/* Description */}
          
           <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="training" className="text-left">Training</label><br />
            <input
              type="text"
              name="training"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
              placeholder="Enter training..."
              onChange={handleFormChange}
              value={formData.training}
            />
          </div>
           <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="experience" className="text-left">Experience</label><br />
            <input
              type="text"
              name="experience"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
              placeholder="Enter Eraining..."
              onChange={handleFormChange}
              value={formData.experience}
            />
          </div>
        </div>

        <button type="submit" className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Submit
        </button>
      </form>
    </div>
  );
};

export default DetailData;
