import React, { useEffect, useState } from "react";

type Props = { editData: any };

const DetailData: React.FC<Props> = ({ editData }) => {
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
    description:  "",
    responsibilities:  "",
    required_skill_experience: "",
    location: "",
    salary_range: "",
    company_information: "",
    benefits: "",
    keyword_tags: "",
    job_posting_date: "",
    application_deadline:  "",
    contact_information: "",
    internal_tracking: ""
  };

  const [formData, setFormData] = useState<FormData>({
          jobrole: editData?.jobrole || "",
          description: editData?.description || "",
          responsibilities: editData?.responsibilities || "",
          required_skill_experience: editData?.required_skill_experience || "",
          location: editData?.location || "",
          salary_range: editData?.salary_range || "",
          company_information: editData?.company_information || "",
          benefits: editData?.benefits || "",
          keyword_tags: editData?.keyword_tags || "",
          job_posting_date: editData?.job_posting_date || "",
          application_deadline: editData?.application_deadline || "",
          contact_information: editData?.contact_information || "",
          internal_tracking: editData?.internal_tracking || ""
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
  const [relatedSkills, setRelatedSkills] = useState<any[]>([]);
  const [editCustomTags, setEditCustomTags] = useState<any[]>([]);

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
          responsibilities: editData?.responsibilities || "",
          required_skill_experience: editData?.required_skill_experience || "",
          location: editData?.location || "",
          salary_range: editData?.salary_range || "",
          company_information: editData?.company_information || "",
          benefits: editData?.benefits || "",
          keyword_tags: editData?.keyword_tags || "",
          job_posting_date: editData?.job_posting_date || "",
          application_deadline: editData?.application_deadline || "",
          contact_information: editData?.contact_information || "",
          internal_tracking: editData?.internal_tracking || ""
        });
      }
  
  }, [editData]); // Depend on editData

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

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove));
    // Also remove from editCustomTags if present
    setEditCustomTags(editCustomTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSelectSkill = (skillTitle: string) => {
    if (skillTitle && !selectedSkills.includes(skillTitle)) {
      setSelectedSkills((prev) => [...prev, skillTitle]);
    }
    setSearch("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleRemoveSkill = (skillTitle: string) => {
    setSelectedSkills((prev) => prev.filter((skill) => skill !== skillTitle));
    // Also remove from relatedSkills if present
    setRelatedSkills(relatedSkills.filter((skill) => skill !== skillTitle));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData, // Use the current formData state
      type: "API",
      method_field: "PUT",
      related_skills: selectedSkills, // This will contain skills from both initial and new selections
      custom_tags: customTags, // This will contain tags from both initial and new additions
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
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  return (
    <div className="w-[100%]">
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
            <div className="flex gap-4">

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
            </div>

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
                  placeholder="Type tags and press Enter..."
                  className="w-full rounded-lg p-2 border-2 border-[var(--color-blue-100)] h-[38px] bg-[#fff] text-black focus:outline-none focus:border-blue-500"
                />
                
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
  );
};

export default DetailData;
