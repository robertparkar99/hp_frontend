"use client";

import React, { useEffect, useState } from "react";
import ViewSkill from "./viewDialouge"; // Adjust path as needed
import AddDialog from "./addDialouge";

interface allSkillData {
  id: number;
  category: string;
  sub_category: string | null;
  no_sub_category: string | null;
  title: string;
  description?: string;
}

type SkillTree = {
  [category: string]: {
    [subCategory: string]: allSkillData[];
  };
};

interface TreeViewProps {
  allSkillData: SkillTree;
}
interface userSkillsData {
  id: number;
  category: string;
  sub_category: string;
  no_sub_category: string;
  title: string;
  description?: string;
}

const TreeView: React.FC<TreeViewProps> = ({ allSkillData }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string>();
  const [sessionToken, setSessionToken] = useState<string>();
  const [sessionOrgType, setessionOrgType] = useState<string>();
  const [sessionSubInstituteId, setessinSubInstituteId] = useState<string>();
  const [sessionUserID, setessionUserID] = useState<string>();
  const [sessionUserProfile, setessionUserProfile] = useState<string>();
  const [userSkillsData, setuserSkillsData] = useState<userSkillsData[]>([]);
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

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
      setSessionUrl(APP_URL);
      setSessionToken(token);
      setessionOrgType(org_type);
      setessinSubInstituteId(sub_institute_id);
      setessionUserID(user_id);
      setessionUserProfile(user_profile_name);
      // console.log('allSkillData',allSkillData);
    }

    const initialExpanded: { [key: string]: boolean } = {};

    Object.entries(allSkillData).forEach(([cat, subCats]) => {
      initialExpanded[`cat-${cat}`] = true;
      Object.keys(subCats).forEach((sub) => {
        initialExpanded[`sub-${cat}-${sub}`] = true;
      });
    });

    setExpanded(initialExpanded);
  }, [allSkillData]);
  const openAll = () => {
    const allKeys: { [key: string]: boolean } = {};
    Object.entries(allSkillData).forEach(([cat, subCats]) => {
      allKeys[`cat-${cat}`] = true;
      Object.keys(subCats).forEach((sub) => {
        allKeys[`sub-${cat}-${sub}`] = true;
      });
    });
    setExpanded(allKeys);
  };

  const closeAll = () => {
    setExpanded({});
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const dbclickLi = (id: number | null) => {
    if (id !== null) {
      setSelectedSkillId(id); // First set the selected skill ID
      setDialogOpen((prev) => ({ ...prev, view: true })); // Then open the dialog
    }
  };

  const filterTree = () => {
    if (!searchTerm.trim()) return allSkillData;

    const filtered: SkillTree = {};

    Object.entries(allSkillData).forEach(([cat, subCats]) => {
      const filteredSub: { [sub: string]: allSkillData[] } = {};

      Object.entries(subCats).forEach(([sub, skills]) => {
        const matchedSkills = skills.filter((skill) =>
          skill.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchedSkills.length) {
          filteredSub[sub] = matchedSkills;
        }
      });

      if (Object.keys(filteredSub).length) {
        filtered[cat] = filteredSub;
      }
    });

    return filtered;
  };

  const displayedSkills = filterTree();

  const handleAddClick = async (skillname: string | null) => {
    // alert(skillname);
    try {
      const res = await fetch(`${sessionUrl}/skill_library`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          type: "API",
          token: sessionToken,
          method_field: "POST",
          org_type: sessionOrgType,
          skill_name: skillname,
          sub_institute_id: sessionSubInstituteId,
          user_profile_name: sessionUserProfile,
          user_id: sessionUserID,
          formType: "master",
        }),
      });

      const data = await res.json();
      if (data.status_code == 1) {
        alert(data.message);
        setuserSkillsData([]);
        setuserSkillsData(data.userTree || []);
      } else {
        alert(data.message);
      }
      // console.log("API response:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div>
        {/* {selectedSkillId && (
        <ViewSkill 
          skillId={selectedSkillId} formType="master"
          onClose={() => setSelectedSkillId(null)}
        />
      )} */}
        {dialogOpen.view && selectedSkillId && (
          <ViewSkill
            skillId={selectedSkillId}
            formType="master"
            onClose={() => {
              setDialogOpen({ ...dialogOpen, view: false });
              setSelectedSkillId(null);
            }}
            onSuccess={() => {
              setDialogOpen({ ...dialogOpen, add: false });
            }}
          />
        )}

        {dialogOpen.add && selectedSkillId && (
        <AddDialog skillId={selectedSkillId}
          onClose={() => setDialogOpen({...dialogOpen, add: false})}
          onSuccess={() => {
            setDialogOpen({...dialogOpen, add: false});
        }}
        />
      )}
      </div>
      <div className="flex gap-4 mx-2 mb-2">
        {/* Sidebar */}
        <div className="w-1/5 shadow p-2 bg-white rounded-sm mb-2 h-fit">
          <div className="p-4 space-y-6">
            {/* Search */}
            <div>
              <h6 className="text-sm font-semibold text-gray-700">Search :</h6>
              <hr className="my-2" />
              <input
                type="text"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Toggle */}
            <div>
              <h6 className="text-sm font-semibold text-gray-700">TOGGLE</h6>
              <hr className="my-2" />
              <div className="space-y-2">
                <button
                  className="w-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={openAll}
                >
                  Open All
                </button>
                <button
                  className="w-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAll}
                >
                  Close All
                </button>
              </div>
            </div>

            {/* Disabled Buttons */}
            {/* <div>
              <h6 className="text-sm font-semibold text-gray-700">CONTROL</h6>
              <hr className="my-2" />
              <div className="space-y-2">
                <button
                  className="w-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                  disabled
                >
                  View
                </button>
                <button
                  className="w-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Edit
                </button>
                <button
                  className="w-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Delete
                </button>
              </div>
            </div> */}

            {/* Add New */}
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
                    <i className="mdi mdi-folder mr-2 font-bold text-yellow-700"></i>{" "}
                    All Skills
                  </span>
                </summary>
                <ul className="ml-4 space-y-1">
                  {Object.entries(displayedSkills).map(
                    ([category, subCategories]) => (
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
                            {Object.entries(subCategories).map(
                              ([subCategory, skills]) => (
                                <li key={subCategory}>
                                  <summary
                                    onClick={() =>
                                      toggleExpand(
                                        `sub-${category}-${subCategory}`
                                      )
                                    }
                                    className="cursor-pointer flex items-center hover:bg-gray-50 border-b-1 border-[#ddd] rounded-sm px-2"
                                  >
                                    <span className="flex items-center font-bold ">
                                      <i className="mdi mdi-folder-multiple-outline mr-2 text-green-400"></i>
                                      {subCategory}
                                    </span>
                                  </summary>
                                  {expanded[
                                    `sub-${category}-${subCategory}`
                                  ] && (
                                    <ul className="ml-6 mt-1 space-y-0.5">
                                      {skills.map((skill) => (
                                        <li
                                          key={skill.id}
                                          data-id={skill.id}
                                          className="text-sm"
                                          onDoubleClick={() =>
                                            dbclickLi(skill.id)
                                          }
                                          title={skill.title ? skill.title : '555'}
                                        >
                                          <summary className="hover:bg-gray-100 rounded">
                                            <span className="flex items-center cursor-pointer border-b-1 border-[#ddd]">
                                              <i
                                                className="mdi mdi mdi-plus-circle mr-2 text-blue-400"
                                                onClick={() =>
                                                  handleAddClick(skill.title)
                                                }
                                              ></i>
                                              {skill.title}
                                            </span>
                                          </summary>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
       
    </>
  );
};

export default TreeView;
