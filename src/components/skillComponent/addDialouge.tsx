"use client";

import React, { useEffect, useState } from "react";

interface AddDialogProps {
  // skillId: number | null;
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
      fetchDepartments(); // categorires
    }
  }, [sessionData]);

  const fetchInitialData = async () => {
    const res = await fetch(
      `${sessionData.url}/skill_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}`
    );
    const data = await res.json();
    
    setProficiencyLevels(data.proficiency_levels || []);
  };
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=category&searchWord=departments`);
      const data = await res.json();
      setCategories(data.searchData || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  };
  const getSubDepartment = async (category: string) => {
    try {
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_category&searchWord=${encodeURIComponent(category)}`);
      const data = await res.json();
      setSubCategories(data.searchData || []);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
    setFormData(prev => ({ ...prev, category }));
  };

  const fetchSkills = async (word: string) => {
    if (!word.trim()) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchWord=${word}`
    );
    const data = await res.json();
    setResults(data.searchData || []);
    setShowDropdown(true);
  };



  // Function to generate form content using AI
  // Remove aiTimer since we'll use a button instead
  const generateFormContent = async (skillName: string, description: string) => {
    if (!skillName.trim() || !description.trim()) {
      return alert("Please enter both skill name and description first");
    }

    if (!formData.category.trim()) {
      return alert("Please select a Skill Category first");
    }

    if (!formData.sub_category.trim()) {
      return alert("Please select a Skill Sub Category first");
    }

    try {
      const res = await fetch("/api/generate-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName,
          description,
          orgType: sessionData.orgType
        }),
      });

      const data = await res.json();

      if (!data?.choices?.length) throw new Error("Empty AI response");

      // Clean and parse JSON safely
      let content = data.choices[0].message.content.trim();
      content = content.replace(/```json|```/g, "").trim();

      let aiResponse: any;
      try {
        aiResponse = JSON.parse(content);
      } catch (err) {
        console.warn("AI returned invalid JSON:", content);
        return alert("AI returned invalid JSON, please retry.");
      }

      // Update form data safely
      setFormData(prev => ({
        ...prev,
        category: aiResponse.category || prev.category,
        sub_category: aiResponse.sub_category || prev.sub_category,
        business_links: aiResponse.business_links || prev.business_links,
        learning_resources: aiResponse.learning_resources || prev.learning_resources,
        assesment_method: aiResponse.assessment_methods || prev.assesment_method,
        certification_qualifications: aiResponse.certifications || prev.certification_qualifications,
        experience_project: aiResponse.experience || prev.experience_project,
        skill_maps: aiResponse.skill_mapping || prev.skill_maps
      }));

      if (Array.isArray(aiResponse.related_skills)) setSelectedSkills(aiResponse.related_skills);
      if (Array.isArray(aiResponse.custom_tags)) setCustomTags(aiResponse.custom_tags);
      if (aiResponse.category) await getSubDepartment(aiResponse.category);

    } catch (error) {
      console.error("Error generating form content:", error);
      alert("Error generating AI content. Check console for details.");
    }
  };

  let aiTimer: NodeJS.Timeout;
  // generateFormContent("Python Programming", "Learn to write and optimize code in Python for AI applications.");

  // Modify handleFormChange to trigger AI generation
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

        {/* header parts start  */}
        <div className="flex w-full">
          {/* Left: GIF */}
          <div className="w-[10%] bg-gradient-to-b from-violet-100 to-violet-200 p-2 rounded-l-lg">
            <img src={`/assets/loading/robo_dance.gif`} alt="Loading..." className="w-full h-auto" />
          </div>

          {/* Center Content */}
          <div className="w-[90%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 text-center rounded-r-lg">
            <h2 className="text-gray-800 font-bold text-lg">Add New Skill</h2>
            <h4 className="text-gray-700 font-semibold text-sm">
              <b>Industry : </b>{sessionData.orgType}
            </h4>
          </div>
        </div>
        <div className="w-[100%] bg-gradient-to-r from-blue-100 to-blue-200 my-2 p-4 text-center rounded-lg gap-4">
          <form className="w-[100%]" onSubmit={handleSubmit}>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="category" className="text-left">Skill Category{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label><br />
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
                  {categories.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="sub_category" className="text-left">Skill Sub Category</label><br />
                <select
                  name="sub_category"
                  className="form-select focus:border-blue-500 w-full rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black" // Changed w-3/3 to w-full
                  onChange={handleFormChange}
                  value={formData.sub_category}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
              <div className="relative z-0 w-full mb-5 group text-left">
                <label htmlFor="skill_name" className="text-left">Skill Name{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label><br />
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
                <label htmlFor="description" className="text-left">Skill Description</label><br />
                <div className="flex gap-2">
                  <textarea
                    name="description"
                    rows={2}
                    className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
                    placeholder="Enter Descriptions..."
                    onChange={handleFormChange}
                    value={formData.description}
                  ></textarea>
                  <button
                    type="button"
                    onClick={() => generateFormContent(formData.skill_name, formData.description)}
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
                <label htmlFor="custom_tags" className="text-left">Skill Custom Tags</label><br />
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
                <label htmlFor="business_links" className="text-left">Skill Business links</label><br />
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
                <label htmlFor="learning_resources" className="text-left">Skill Learning Resources</label><br />
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
                <label htmlFor="assesment_method" className="text-left">Skill Assesment Method</label><br />
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
                <label htmlFor="certification_qualifications" className="text-left">Skill Certification/Qualifications</label><br />
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
                <label htmlFor="experience_project" className="text-left">Skill Experience/Project</label><br />
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
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDialog;
