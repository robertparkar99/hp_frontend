import React, { useEffect, useState } from "react";

type Props = { editData: any };

type FormData = {
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
};
 
const DetailData: React.FC<Props> = ({ editData }) => {
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });

  const [formData, setFormData] = useState<FormData>({
    category: "",
    sub_category: "",
    skill_name: "",
    description: "",
    business_links: "",
    proficiency_level: "",
    learning_resources: "",
    assesment_method: "",
    certification_qualifications: "",
    experience_project: "",
    skill_maps: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState('');
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [relatedSkills, setRelatedSkills] = useState<string[]>([]);
  const [editCustomTags, setEditCustomTags] = useState<string[]>([]);

  // Load session data on mount
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

  // Fetch categories when sessionData ready
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchCategories();
    }
  }, [sessionData]);

  // When editData changes, populate form and fetch subCategories if needed
  useEffect(() => {
    if (editData) {
      setFormData({
        category: editData.category || "",
        sub_category: editData.sub_category || "",
        skill_name: editData.title || "",
        description: editData.description || "",
        business_links: editData.bussiness_links || "",
        proficiency_level: editData.proficiency_level || "",
        learning_resources: editData.learning_resources || "",
        assesment_method: editData.assesment_method || "",
        certification_qualifications:
          editData.certification_qualifications || "",
        experience_project: editData.experience_project || "",
        skill_maps: editData.skill_maps || "",
      });

      if (editData.related_skills) {
        try {
          const parsedRelatedSkills = JSON.parse(editData.related_skills);
          setRelatedSkills(parsedRelatedSkills);
          setSelectedSkills(parsedRelatedSkills);
        } catch (error) {
          console.error("Error parsing related_skills:", error);
        }
      }

      if (editData.custom_tags) {
        try {
          const parsedCustomTags = JSON.parse(editData.custom_tags);
          setEditCustomTags(parsedCustomTags);
          setCustomTags(parsedCustomTags);
        } catch (error) {
          console.error("Error parsing custom_tags:", error);
        }
      }

      if (editData.category) {
        fetchSubCategories(editData.category);
      }
    }
  }, [editData]);

  // Fetch unique categories from API
const fetchCategories = async () => {
  // try {
  //   const res = await fetch(
  //     `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=category&searchWord=categories`
  //   );
  //   const data = await res.json();
  //   if (!Array.isArray(data.searchData)) {
  //     console.error("Expected data.searchData to be an array but got", data.searchData);
  //     setCategories([]);
  //     return;
  //   }
  //   const uniqueCategories = Array.from(
  //     new Set(data.searchData.map((item: any) => item.category))
  //   );
  //   setCategories(uniqueCategories);
  // } catch (error) {
  //   console.error("Error fetching categories:", error);
  //   setCategories([]);
   try {
         const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=category&searchWord=departments`);
      const data = await res.json();
      setCategories(data.searchData || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  // }
};

const fetchSubCategories = async (category: string) => {
  // try {
  //   setFormData((prev) => ({ ...prev, category, sub_category: "" }));
  //   const res = await fetch(
  //     `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_category&searchWord=${encodeURIComponent(category)}`
  //   );
  //   const data = await res.json();
  //   if (!Array.isArray(data.searchData)) {
  //     console.error("Expected data.searchData to be an array but got", data.searchData);
  //     setSubCategories([]);
  //     return;
  //   }
  //   const uniqueSubCategories = Array.from(
  //     new Set(data.searchData.map((item: any) => item.sub_category))
  //   );
  //   setSubCategories(uniqueSubCategories);
  // } catch (error) {
  //   console.error("Error fetching sub-categories:", error);
  //   setSubCategories([]);
  // }
   try {
      setSelectedCategories(category);
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_category&searchWord=${encodeURIComponent(category)}`);
      // fetchData(department);
      const data = await res.json();
      setSubCategories(data.searchData || []);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
};
  // Fetch skills for related skills input
  const fetchSkills = async (word: string) => {
    if (!word.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchWord=${encodeURIComponent(
          word
        )}`
      );
      const data = await res.json();
      setResults(data.searchData || []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setResults([]);
    }
  };

  // Handle form input changes
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add custom tag on Enter key press
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !customTags.includes(trimmed)) {
        setCustomTags([...customTags, trimmed]);
      }
      setTagInput("");
    }
  };

  // Remove a custom tag
  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove));
    setEditCustomTags(editCustomTags.filter((tag) => tag !== tagToRemove));
  };

  // Add selected skill to selectedSkills list
  const handleSelectSkill = (skillTitle: string) => {
    if (skillTitle && !selectedSkills.includes(skillTitle)) {
      setSelectedSkills((prev) => [...prev, skillTitle]);
    }
    setSearch("");
    setResults([]);
    setShowDropdown(false);
  };

  // Remove selected skill
  const handleRemoveSkill = (skillTitle: string) => {
    setSelectedSkills((prev) => prev.filter((skill) => skill !== skillTitle));
    setRelatedSkills(relatedSkills.filter((skill) => skill !== skillTitle));
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData,
      type: "API",
      method_field: "PUT",
      related_skills: selectedSkills,
      custom_tags: customTags,
      token: sessionData.token,
      sub_institute_id: sessionData.subInstituteId,
      org_type: sessionData.orgType,
      user_profile_name: sessionData.userProfile,
      user_id: sessionData.userId,
      formType: "details",
    };

    try {
      const res = await fetch(`${sessionData.url}/skill_library/${editData?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="w-full">
      <form className="w-full" onSubmit={handleSubmit}>
        {/* Category and Subcategory */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="category" className="text-left">
              Skill Category
            </label>
            <br />
            <select
              name="category"
              className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-white text-black"
              onChange={(e) => {
                fetchSubCategories(e.target.value);
                handleFormChange(e);
              }}
              value={formData.category}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="sub_category" className="text-left">
              Skill Sub Category
            </label>
            <br />
            <select
              name="sub_category"
              className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-white text-black"
              onChange={handleFormChange}
              value={formData.sub_category}
              required
              disabled={subCategories.length === 0}
            >
              <option value="">Select Sub Category</option>
              {subCategories.length > 0 ? (
                subCategories.map((subCat, index) => (
                  <option key={index} value={subCat}>
                    {subCat}
                  </option>
                ))
              ) : (
                <option value="">No Subcategory Available</option>
              )}
            </select>
          </div>
        </div>

        {/* Skill Name and Description */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="skill_name" className="text-left">
              Skill Name
            </label>
            <br />
            <input
              type="text"
              name="skill_name"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-white text-black focus:outline-none focus:border-blue-500"
              placeholder="Enter Skill..."
              onChange={handleFormChange}
              value={formData.skill_name}
              required
            />
          </div>

          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="description" className="text-left">
              Skill Description
            </label>
            <br />
            <textarea
              name="description"
              rows={2}
              className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              placeholder="Enter Description..."
              onChange={handleFormChange}
              value={formData.description}
            />
          </div>
        </div>

        {/* Related Skills */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="w-full mb-5 group text-left">
            <label htmlFor="related_skills" className="text-left">
              Related Skills
            </label>
            <br />
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-white text-black focus:outline-none focus:border-blue-500"
                placeholder="Type to search skills..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchSkills(e.target.value);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
              {showDropdown && results.length > 0 && (
                <ul className="absolute z-[9999] bg-opacity-100 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {results.map((skill, index) => (
                    <li
                      key={index}
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
              {[...new Set([...relatedSkills, ...selectedSkills])].map(
                (skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      className="ml-2 text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ✖
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Custom Tags */}
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="custom_tags" className="text-left">
              Skill Custom Tags
            </label>
            <br />
            <input
              type="text"
              name="custom_tags_input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type and press Enter to add tags..."
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-white text-black focus:outline-none focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[...new Set([...editCustomTags, ...customTags])].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-2 text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ✖
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Business Links */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="business_links" className="text-left">
              Skill Business Links
            </label>
            <br />
            <input
              type="text"
              name="business_links"
              className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-white text-black focus:outline-none focus:border-blue-500"
              placeholder="Enter business links..."
              onChange={handleFormChange}
              value={formData.business_links}
            />
          </div>

          {/* Uncomment and enable proficiency levels if needed */}
          {/* <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="proficiency_level" className="text-left">
              Proficiency Levels
            </label>
            <br />
            {proficiencyLevels.length > 0 && (
              <select
                name="proficiency_level"
                className="form-select w-full focus:border-blue-500 rounded-lg border-2 border-[var(--color-blue-100)] h-[38px] bg-white text-black"
                onChange={handleFormChange}
                value={formData.proficiency_level}
              >
                <option value="">Select Proficiency Level</option>
                {proficiencyLevels.map((d) => (
                  <option key={d.proficiency_level} value={d.proficiency_level}>
                    {d.proficiency_level}
                  </option>
                ))}
              </select>
            )}
          </div> */}
        </div>

        {/* Other Textareas */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="learning_resources" className="text-left">
              Skill Learning Resources
            </label>
            <br />
            <textarea
              name="learning_resources"
              rows={2}
              className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              placeholder="Enter learning resources..."
              onChange={handleFormChange}
              value={formData.learning_resources}
            />
          </div>
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="assesment_method" className="text-left">
              Skill Assessment Method
            </label>
            <br />
            <textarea
              name="assesment_method"
              rows={2}
              className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              placeholder="Enter assessment method..."
              onChange={handleFormChange}
              value={formData.assesment_method}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group text-left">
            <label
              htmlFor="certification_qualifications"
              className="text-left"
            >
              Skill Certification Qualifications
            </label>
            <br />
            <textarea
              name="certification_qualifications"
              rows={2}
              className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              placeholder="Enter certification qualifications..."
              onChange={handleFormChange}
              value={formData.certification_qualifications}
            />
          </div>
          <div className="relative z-0 w-full mb-5 group text-left">
            <label htmlFor="experience_project" className="text-left">
              Skill Experience Project
            </label>
            <br />
            <textarea
              name="experience_project"
              rows={2}
              className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              placeholder="Enter experience project..."
              onChange={handleFormChange}
              value={formData.experience_project}
            />
          </div>
        </div>

        <div className="relative z-0 w-full mb-5 group text-left">
          <label htmlFor="skill_maps" className="text-left">
            Skill Maps
          </label>
          <br />
          <textarea
            name="skill_maps"
            rows={2}
            className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
            placeholder="Enter skill maps..."
            onChange={handleFormChange}
            value={formData.skill_maps}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default DetailData;
