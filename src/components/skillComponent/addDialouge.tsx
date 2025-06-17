"use client";

import React, { useEffect, useState } from "react";

interface AddDialogProps {
  skillId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  category: string;
  sub_category: string;
  skill_name: string;
  description: string;
  business_links: string;
  proficiency_level?: string;
  learning_resources?: string;
  assesment_method?: string;
  certification_qualifications?: string;
  experience_project?: string;
  skill_maps?: string;
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
    category: "",
    sub_category: "",
    skill_name: "",
    description: "",
    business_links: ""
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [proficiencyLevels, setProficiencyLevels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);

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
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
    }
  }, [sessionData]);

  const fetchInitialData = async () => {
    const res = await fetch(
      `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}`
    );
    const data = await res.json();
    setCategories(data.skillData || []);
    setProficiencyLevels(data.proficiency_levels || []);
  };

  const getSubDepartment = async (category: string) => {
    const res = await fetch(
      `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&category=${category}`
    );
    const data = await res.json();
    setSubCategories(data.skillData || []);
    setFormData(prev => ({ ...prev, category }));
  };

  const fetchSkills = async (word: string) => {
    if (!word.trim()) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `${sessionData.url}/search_skill?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchWord=${word}`
    );
    const data = await res.json();
    setResults(data.searchData || []);
    setShowDropdown(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !customTags.includes(trimmed)) {
        setCustomTags([...customTags, trimmed]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectSkill = (skillTitle: string) => {
    if (skillTitle && !selectedSkills.includes(skillTitle)) {
      setSelectedSkills(prev => [...prev, skillTitle]);
    }
    setSearch('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleRemoveSkill = (skillTitle: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill !== skillTitle));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData,
      type: "API",
      method_field: 'POST',
      related_skills: selectedSkills,
      custom_tags: customTags,
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: 'user',
    };

    try {
      const res = await fetch(`${sessionData.url}/skill_library`, {
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
      <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative my-auto"> {/* Added my-auto for vertical centering when content is smaller than screen */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">
          ✖
        </button>

        <div className="w-[100%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 text-center rounded-lg">
          <h2>Add New Skills</h2>
        </div>

        <div className="w-[100%] bg-gradient-to-r from-blue-100 to-blue-200 my-2 p-4 text-center rounded-lg gap-4">
          <form className="w-[100%]" onSubmit={handleSubmit}>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="category" className="text-left">Select Category</label><br />
                <select
                  name="category"
                  className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black" // Changed w-3/3 to w-full
                  onChange={(e) => {
                    getSubDepartment(e.target.value);
                    handleFormChange(e);
                  }}
                  value={formData.category}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(d => <option key={d.category} value={d.category}>{d.category}</option>)}
                </select>
              </div>

              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="sub_category" className="text-left">Sub Category</label><br />
                <select
                  name="sub_category"
                  className="form-select focus:border-blue-500 w-full rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black" // Changed w-3/3 to w-full
                  onChange={handleFormChange}
                  value={formData.sub_category}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map(d => <option key={d.sub_category} value={d.sub_category}>{d.sub_category}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="skill_name" className="text-left">Add Skill</label><br />
                <input
                  type="text"
                  name="skill_name"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500" // Changed w-3/3 to w-full
                  placeholder="Enter Skill..."
                  onChange={handleFormChange}
                  value={formData.skill_name}
                  required
                />
              </div>

              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="description" className="text-left">Add Description</label><br />
                <textarea
                  name="description"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Descriptions..."
                  onChange={handleFormChange}
                  value={formData.description}
                ></textarea>
              </div>
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="w-full mb-5 group text-left">
                <label htmlFor="related_skills" className="text-left">Related Skills</label><br />
                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                    placeholder="Type to search skills..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      fetchSkills(e.target.value);
                    }}
                    onFocus={() => setShowDropdown(true)}
                   // onBlur={() => setTimeout(() => setShowDropdown(false), 100)} // Optional: hide dropdown on blur with a delay
                  />
                  {showDropdown && results.length > 0 && (
                    <ul className="absolute z-[9999] bg-opacity-100 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {results.map((skill) => (
                        <li
                          key={skill.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectSkill(skill.title)}
                        >
                          {skill.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills.map((skill) => (
                    <div key={skill} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                      <button
                        type="button"
                        className="ml-2 text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="custom_tags" className="text-left">Custom Tags</label><br />
                <input
                  type="text"
                  name="custom_tags_input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type and press Enter to add tags..."
                  className="w-full rounded-lg p-2 z-0 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500" // Changed w-3/3 to w-full
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {customTags.map((tag) => (
                    <div key={tag} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-red-600 hover:text-red-800"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 opacity-100 w-full mb-5 group text-left">
                <label htmlFor="business_links" className="text-left">Business links</label><br />
                <input
                  type="text"
                  name="business_links"
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500" // Changed w-3/3 to w-full
                  placeholder="Enter business links..."
                  onChange={handleFormChange}
                  value={formData.business_links}
                />
              </div>

              {/* <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="proficiency_level" className="text-left">Proficiency Levels</label><br />
                  <select
                    name="proficiency_level"
                    className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black" // Changed w-3/3 to w-full
                    onChange={handleFormChange}
                    value={formData.proficiency_level || ''}
                  >
                  <option value="">Select Proficiency Level</option>
                      {proficiencyLevels.map(d => <option key={d.select_value} value={d.select_value}>{d.select_option}</option>)}
                  
                  </select>
              </div> */}
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="learning_resources" className="text-left">Learning Resources</label><br />
                <textarea
                  name="learning_resources"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter learning Resources..."
                  onChange={handleFormChange}
                  value={formData.learning_resources || ''}
                ></textarea>
              </div>
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="assesment_method" className="text-left">Add Assesment Method</label><br />
                <textarea
                  name="assesment_method"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Assesment Method..."
                  onChange={handleFormChange}
                  value={formData.assesment_method || ''} // Added || '' for controlled component
                ></textarea>
              </div>
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="certification_qualifications" className="text-left">Certification/Qualifications</label><br />
                <textarea
                  name="certification_qualifications"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Certification Qualifications..."
                  onChange={handleFormChange}
                  value={formData.certification_qualifications || ''}
                ></textarea>
              </div>
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="experience_project" className="text-left">Add Experience/Project</label><br />
                <textarea
                  name="experience_project"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Experience Project..."
                  onChange={handleFormChange}
                  value={formData.experience_project || ''} // Added || '' for controlled component
                ></textarea>
              </div>
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="skill_maps" className="text-left">Skill Map</label><br />
                <textarea
                  name="skill_maps"
                  rows={2}
                  className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                  placeholder="Enter Skill Map..."
                  onChange={handleFormChange}
                  value={formData.skill_maps || ''}
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