"use client";

import React, { useEffect, useState } from "react";
import ViewDialog from "./viewDialouge";
import AddDialog from "./addDialouge";
import EditDialog from "./editDialouge";
import ViewSkill from "./viewDialouge";

interface Skill {
  id: number;
  category: string;
  sub_category: string | null;
  no_sub_category: string | null;
  title: string;
}

type SkillTree = {
  [category: string]: {
    [subCategory: string]: Skill[];
  };
};

interface AddSkillViewProps {
  userSkillsData: SkillTree;
}

const AddSkillView: React.FC<AddSkillViewProps> = ({ userSkillsData }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [SelectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
  });
  const [skillsData, setSkillsData] = useState<SkillTree>({});
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  // Initialize session data
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, org_type, sub_institute_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
      });
    }
  }, []);

  // Fetch skills data
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      const fetchData = async () => {
        try {
          const res = await fetch(
            `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}`
          );
          const data = await res.json();
          setSkillsData(data.userTree || {});
        } catch (error) {
          console.error("Error fetching skills:", error);
        }
      };
      fetchData();
    }
  }, [sessionData]);

  // Initialize expanded state
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    
    Object.entries(skillsData).forEach(([cat, subCats]) => {
      initialExpanded[`cat-${cat}`] = true;
      Object.keys(subCats).forEach((sub) => {
        initialExpanded[`sub-${cat}-${sub}`] = true;
      });
    });
    
    setExpanded(initialExpanded);
  }, [skillsData]);

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = (open: boolean) => {
    const newExpanded: Record<string, boolean> = {};
    Object.entries(skillsData).forEach(([cat, subCats]) => {
      newExpanded[`cat-${cat}`] = open;
      Object.keys(subCats).forEach(sub => {
        newExpanded[`sub-${cat}-${sub}`] = open;
      });
    });
    setExpanded(newExpanded);
  };

  const filterTree = (): SkillTree => {
    if (!searchTerm.trim()) return skillsData;

    const filtered: SkillTree = {};

    Object.entries(skillsData).forEach(([cat, subCats]) => {
      const filteredSub: Record<string, Skill[]> = {};

      Object.entries(subCats).forEach(([sub, skills]) => {
        const matchedSkills = skills.filter(skill =>
          skill.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchedSkills.length) filteredSub[sub] = matchedSkills;
      });

      if (Object.keys(filteredSub).length) filtered[cat] = filteredSub;
    });

    return filtered;
  };

  const handleSkillSelect = (skillId: number|null) => {
    setSelectedSkill(skillId);
  };

  const handleAddSkill= (skillId: number|null) => {
    setSelectedSkill(skillId);
  };

  const handleDelete = async () => {
    if (!selectedSkill) return;
    
    try {
      await fetch(`${sessionData.url}/skill_library/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: sessionData.token,
          skill_id: selectedSkill,
        }),
      });
      // Refresh data after deletion
      const res = await fetch(
        `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}`
      );
      const data = await res.json();
      setSkillsData(data.userTree || {});
      setSelectedSkill(null);
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };
 const dbclickLi = (id: number | null) => {
  // alert(id);
  if (id !== null) setDialogOpen({...dialogOpen, view: true});
  };

  const displayedSkills = filterTree();

  return (
    <div className="flex gap-4 mx-2 mb-2">
      {/* Sidebar */}
      <div className="w-1/5 shadow p-2 bg-white rounded-sm mb-2 h-fit">
        <div className="p-4 space-y-6">
          <div>
            <h6 className="text-sm font-semibold text-gray-700">Search:</h6>
            <hr className="my-2" />
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <h6 className="text-sm font-semibold text-gray-700">TOGGLE</h6>
            <hr className="my-2" />
            <div className="space-y-2">
              <button
                className="w-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => toggleAll(true)}
              >
                Open All
              </button>
              <button
                className="w-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => toggleAll(false)}
              >
                Close All
              </button>
            </div>
          </div>

          <div>
            <h6 className="text-sm font-semibold text-gray-700">CONTROL</h6>
            <hr className="my-2" />
            <div className="space-y-2">
              <button
                className={`w-full border rounded px-3 py-1 text-sm ${
                  selectedSkill ? "border-gray-400 text-gray-700 hover:bg-gray-100" 
                               : "border-gray-400 text-gray-700 opacity-50 cursor-not-allowed"
                }`}
                disabled={!selectedSkill}
                onClick={() => setDialogOpen({...dialogOpen, view: true})}
              >
                View
              </button>
              <button
                className={`w-full border rounded px-3 py-1 text-sm ${
                  selectedSkill ? "border-gray-400 text-gray-700 hover:bg-gray-100" 
                               : "border-gray-400 text-gray-700 opacity-50 cursor-not-allowed"
                }`}
                disabled={!selectedSkill}
                onClick={() => setDialogOpen({...dialogOpen, edit: true})}
              >
                Edit
              </button>
              <button
                className={`w-full border rounded px-3 py-1 text-sm ${
                  selectedSkill ? "border-gray-400 text-gray-700 hover:bg-gray-100" 
                               : "border-gray-400 text-gray-700 opacity-50 cursor-not-allowed"
                }`}
                disabled={!selectedSkill}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>

          <div>
            <h6 className="text-sm font-semibold text-gray-700">ADD NEW</h6>
            <hr className="my-2" />
            <button
              className="w-full flex items-center justify-center gap-2 border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setDialogOpen({...dialogOpen, add: true})}
            >
              New Skill
            </button>
          </div>
        </div>
      </div>

      {/* Main Tree */}
      <div className="w-4/5 shadow p-2 bg-white rounded-sm mb-2 h-fit">
        <div className="p-4">
          <ul className="space-y-2">
            <li>
              <summary className="cursor-pointer flex items-center p-0 hover:bg-gray-100 rounded">
                <span className="flex items-center font-semibold border-1 border-[#ddd] rounded-sm px-2">
                  <i className="mdi mdi-folder mr-2 font-bold text-yellow-700"></i> All Skills
                </span>
              </summary>
              <ul className="ml-4 space-y-1">
                {Object.entries(displayedSkills).map(([category, subCategories]) => (
                  <li key={category}>
                    <summary
                      onClick={() => toggleExpand(`cat-${category}`)}
                      className="cursor-pointer flex items-center hover:bg-gray-100 rounded"
                    >
                      <span className="flex items-center font-semibold border-b-1 border-[#ddd] rounded-sm px-2">
                        <i className="mdi mdi-folder mr-2 text-yellow-600"></i>
                        {category}
                      </span>
                    </summary>
                    {expanded[`cat-${category}`] && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {Object.entries(subCategories).map(([subCategory, skills]) => (
                          <li key={subCategory}>
                           <summary
                              onClick={() => toggleExpand(`sub-${category}-${subCategory}`)}
                              className={`cursor-pointer flex items-center hover:bg-gray-50 rounded-sm px-2 ${
                                subCategory !== "no_sub_category" ? "border-b-1 border-[#ddd]" : ""
                              }`}
                            >

                              {subCategory !== "no_sub_category" && (
                                <span className="flex items-center font-bold">
                                  <i className="mdi mdi-folder-multiple-outline mr-2 text-green-400"></i>
                                  {subCategory}
                                </span>
                              )}
                            </summary>
                            {expanded[`sub-${category}-${subCategory}`] && (
                              <ul className="ml-6 mt-1 space-y-0.5">
                                {skills.map(skill => (
                                  <li key={skill.id} className="text-sm"   onDoubleClick={() => dbclickLi(skill.id)}>
                                    <summary className="hover:bg-gray-100 rounded">
                                      <span
                                        className="flex items-center cursor-pointer border-b-1 border-[#ddd]"
                                        onClick={() => handleAddSkill(skill.id)}
                                      >
                                        <i className="mdi mdi-star-outline mr-2 text-yellow-400"></i>
                                        {skill.title}
                                      </span>
                                    </summary>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </div>

      {/* Dialogs */}
      {dialogOpen.view && selectedSkill && (
       <ViewSkill skillId={selectedSkill} formType="user"
           onClose={() => {
            setDialogOpen({ ...dialogOpen, view: false });
            setSelectedSkillId(null);
          }}
          onSuccess={() => {
            setDialogOpen({...dialogOpen, add: false});
        }}
        />
      )}
      
      {dialogOpen.add && (
        <AddDialog skillId={selectedSkill}
          onClose={() => setDialogOpen({...dialogOpen, add: false})}
          onSuccess={() => {
            setDialogOpen({...dialogOpen, add: false});
        }}
        />
      )}
      
      {dialogOpen.edit && selectedSkill && (
        <EditDialog 
          skillId={selectedSkill}
          onClose={() => setDialogOpen({...dialogOpen, edit: false})}
          onSuccess={() => {
            // Refresh data after editing
            fetch(`${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}`)
              .then(res => res.json())
              .then(data => setSkillsData(data.userTree || {}));
            setDialogOpen({...dialogOpen, edit: false});
          }}
        />
      )}
    </div>
  );
};

export default AddSkillView;