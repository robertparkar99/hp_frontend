"use client";

import React, { useEffect, useState } from "react";

interface AddDialogProps {
  skillId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  jobrole: string;
  description: string; // Added description
  responsibilities: string;
  required_skill_experience: string;
  location: string;
  salary_range: string;
  company_information: string;
  benefits: string;
  keyword_tags: string;
  job_posting_date: string;
  application_deadline: string;
  contact_information: string;
  internal_tracking: string;
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

  const [formData, setFormData] = useState<FormData>({
    jobrole: "",
    description: "", // Added description
    responsibilities: "",
    required_skill_experience: "",
    location: "",
    salary_range: "",
    company_information: "",
    benefits: "",
    keyword_tags: "",
    job_posting_date: "",
    application_deadline: "",
    contact_information: "",
    internal_tracking: ""
  });

  const [keywordTagInput, setKeywordTagInput] = useState("");
  const [keywordTags, setKeywordTags] = useState<string[]>([]);

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeywordTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedTag = keywordTagInput.trim();
      if (trimmedTag && !keywordTags.includes(trimmedTag)) {
        setKeywordTags([...keywordTags, trimmedTag]);
      }
      setKeywordTagInput('');
    }
  };

  const handleRemoveKeywordTag = (tagToRemove: string) => {
    setKeywordTags(keywordTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData,
      type: "API",
      method_field: 'POST',
      keyword_tags: keywordTags.join(','),
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
      if (data.status === 1) {
        alert(data.message);
        onSuccess();
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 h-screen overflow-y-auto hide-scroll">
      <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative my-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">
          ✖
        </button>

        <div className="w-[100%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 text-center rounded-lg">
          <h2>Add New Job Role</h2>
        </div>

        <div className="w-[100%] bg-gradient-to-r from-blue-100 to-blue-200 my-2 p-4 text-center rounded-lg gap-4">
          <form className="w-[100%]" onSubmit={handleSubmit}>
            {/* Job Role and Location */}
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
                <label htmlFor="description" className="text-left">Description</label><br />
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



            {/* Responsibilities and Required Skills */}
            {/* <div className="flex gap-4">

              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="responsibilities" className="text-left">Responsibilities</label><br />
                <textarea
                  name="responsibilities"
                  rows={3}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Responsibilities..."
                  onChange={handleFormChange}
                  value={formData.responsibilities}
                ></textarea>
              </div>
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="required_skill_experience" className="text-left">Required Skills</label><br />
                <textarea
                  name="required_skill_experience"
                  rows={3}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Required Skills..."
                  onChange={handleFormChange}
                  value={formData.required_skill_experience}
                ></textarea>
              </div>
            </div> */}

            {/* Salary Range and Company Info */}
            <div className="flex gap-4">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="location" className="text-left">Location</label><br />
                <input
                  type="text"
                  name="location"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  placeholder="Enter Location..."
                  onChange={handleFormChange}
                  value={formData.location}
                />
              </div>

              <div className="relative z-0 w-full mb-5 group text-left">

                <label htmlFor="salary_range" className="text-left">Salary Range</label><br />
                <input
                  type="text"
                  name="salary_range"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  placeholder="Enter Salary Range..."
                  onChange={handleFormChange}
                  value={formData.salary_range}
                />
              </div>

            </div>

            {/* Benefits and Keyword Tags */}
            <div className="flex gap-4">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="company_information" className="text-left">Company Info</label><br />
                <textarea
                  name="company_information"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Company Info..."
                  onChange={handleFormChange}
                  value={formData.company_information}
                ></textarea>
              </div>
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="benefits" className="text-left">Benefits</label><br />
                <textarea
                  name="benefits"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Benefits..."
                  onChange={handleFormChange}
                  value={formData.benefits}
                ></textarea>
              </div>

            </div>

            {/* Dates */}
            <div className="flex gap-4">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="keyword_tags" className="text-left">Keyword Tags</label><br />
                <input
                  type="text"
                  name="keyword_tag_input"
                  value={keywordTagInput}
                  onChange={(e) => setKeywordTagInput(e.target.value)}
                  onKeyDown={handleKeywordTagKeyDown}
                  placeholder="Type tags and press Enter..."
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywordTags.map((tag) => (
                    <div key={tag} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveKeywordTag(tag)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="job_posting_date" className="text-left">Posting Date</label><br />
                <input
                  type="date"
                  name="job_posting_date"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  onChange={handleFormChange}
                  value={formData.job_posting_date}
                />
              </div>

            </div>

            {/* Contact Info and Internal Tracking */}
            <div className="flex gap-4">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="application_deadline" className="text-left">Deadline</label><br />
                <input
                  type="date"
                  name="application_deadline"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                  onChange={handleFormChange}
                  value={formData.application_deadline}
                />
              </div>
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="contact_information" className="text-left">Contact Info</label><br />
                <textarea
                  name="contact_information"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Contact Info..."
                  onChange={handleFormChange}
                  value={formData.contact_information}
                ></textarea>
              </div>

            </div>
            <div className="flex gap-4">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="internal_tracking" className="text-left">Internal Tracking</label><br />
                <textarea
                  name="internal_tracking"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Internal Tracking..."
                  onChange={handleFormChange}
                  value={formData.internal_tracking}
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
