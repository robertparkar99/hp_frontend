"use client";

import React, { useEffect, useState } from "react";
import ViewSkill from "@/components/skillComponent/viewDialouge";
import EditDialog from "@/components/skillComponent/editDialouge"; // ✅ Import EditDialog
import { FiEdit } from "react-icons/fi";
import { Trash2 } from "lucide-react";

type Skill = {
  id: number;
  title: string;
  description?: string;
};

type SubCategory = {
  name: string;
  skills: Skill[];
};

type Category = {
  name: string;
  subcategories: SubCategory[];
};

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // Fetch API Data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&category=&sub_category=`
        );
        const data = await res.json();

        const userTree = data?.userTree || {};

        const parsedCategories: Category[] = Object.entries(userTree).map(
          ([categoryName, subCatObj]) => {
            const subcategories: SubCategory[] = Object.entries(
              subCatObj as Record<string, any[]>
            ).map(([subName, skillsArr]) => {
              const skills: Skill[] = (skillsArr as any[]).map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
              }));
              return { name: subName, skills };
            });

            return { name: categoryName, subcategories };
          }
        );

        setCategories(parsedCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (sessionData.url) {
      fetchData();
    }
  }, [sessionData, refreshKey]);

  // Delete handler
  const handleDelete = async (skillId: number) => {
    if (!skillId) return;

    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library/${skillId}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=user`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);

        setRefreshKey((prev) => prev + 1);
        setSelectedSkillId(null);
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  // Edit handler
  const handleEdit = (skill: Skill) => {
    setActiveSkill(skill);
    setSelectedSkillId(skill.id);
    setDialogOpen({ ...dialogOpen, edit: true });
  };

  // Decide hexagon items
  let hexagonItems: { id?: number; title: string; subtitle?: string; skillObj?: Skill }[] = [];
  if (!selectedCategory && !selectedSubcategory) {
    hexagonItems = categories.map((cat) => ({ title: cat.name }));
  } else if (selectedCategory && !selectedSubcategory) {
    const category = categories.find((c) => c.name === selectedCategory);
    hexagonItems = category?.subcategories.map((sub) => ({ title: sub.name })) || [];
  } else if (selectedCategory && selectedSubcategory) {
    const category = categories.find((c) => c.name === selectedCategory);
    const sub = category?.subcategories.find((s) => s.name === selectedSubcategory);
    hexagonItems =
      sub?.skills.map((skill) => ({
        id: skill.id,
        title: skill.title,
        subtitle: skill.description,
        skillObj: skill,
      })) || [];
  }

  return (
    <main className="flex bg-gray-50 gap-6 p-8 min-h-screen">
      {/* Sidebar */}
      <aside className="w-2/6 bg-white h-full border border-gray-300 rounded-lg shadow-sm p-4">
        <h2 className="text-gray-800 font-semibold mb-2">Skill Taxonomy</h2>
        <hr className="mb-6 border-gray-300" />

        <div className="relative">
          <div className="absolute left-[16px] top-5 bottom-0 w-[2px] bg-blue-300"></div>

          <ul className="space-y-4 relative">
            {categories.map((cat, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                    setSelectedSubcategory(null);
                    setActiveSkill(null);
                  }}
                  className="flex items-center w-full text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 relative z-10 ${selectedCategory === cat.name ? "bg-blue-400" : "bg-gray-200"
                      }`}
                  ></div>
                  <span
                    className={`ml-4 ${selectedCategory === cat.name ? "text-black font-bold" : "text-gray-800"
                      }`}
                  >
                    {cat.name}
                  </span>
                </button>

                {selectedCategory === cat.name && (
                  <ul className="ml-12 mt-3 space-y-3">
                    {cat.subcategories.map((sub, sIdx) => (
                      <li key={sIdx}>
                        <button
                          onClick={() => {
                            setSelectedSubcategory(selectedSubcategory === sub.name ? null : sub.name);
                            setActiveSkill(null);
                          }}
                          className={`w-full text-left ${selectedSubcategory === sub.name
                              ? "text-black font-bold"
                              : "text-gray-600"
                            } hover:text-black`}
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Honeycomb */}
      <section className="w-4/6 h-screen overflow-y-auto scrollbar-hide">
        <div className="honeycomb-container-skill flex flex-wrap gap-6 justify-center pb-8">
          {hexagonItems.map((item, index) => (
            <div
              key={index}
              className="hexagon-wrapper-skill relative cursor-pointer"
              onClick={() => {
                if (!selectedCategory) {
                  setSelectedCategory(item.title);
                } else if (selectedCategory && !selectedSubcategory) {
                  setSelectedSubcategory(item.title);
                } else if (item.skillObj) {
                  setActiveSkill(item.skillObj);
                  setSelectedSkillId(item.skillObj.id);
                  setDialogOpen({ ...dialogOpen, view: true });
                }
              }}
            >
              <div className="hexagon-inner-skill">
                <div className="hexagon-content-skill bg-[#9FD0FF] flex flex-col items-center justify-center relative">
                  {/* Title */}
                  <p
                    className="hexagon-title-skill text-black font-inter text-center"
                    title={item.subtitle}
                  >
                    {item.title}
                  </p>

                  {/* Edit + Delete buttons */}
                  {item.skillObj && (
                    <div className="flex gap-3 mt-2">
                      <button
                        className="text-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item.skillObj!);
                        }}
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>

                      <button
                        className="text-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.skillObj!.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* View Dialog */}
      {dialogOpen.view && activeSkill && (
        <ViewSkill
          skillId={activeSkill.id}
          formType="user"
          onClose={() => {
            setDialogOpen({ ...dialogOpen, view: false });
            setSelectedSkillId(null);
          }}
          onSuccess={() => {
            setDialogOpen({ ...dialogOpen, add: false });
          }}
        />
      )}

      {/* ✅ Edit Dialog */}
      {dialogOpen.edit && activeSkill && (
        <EditDialog
          skillId={activeSkill.id}
          onClose={() => {
            setDialogOpen({ ...dialogOpen, edit: false });
            setSelectedSkillId(null);
          }}
          onSuccess={() => {
            setDialogOpen({ ...dialogOpen, edit: false });
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}
    </main>
  );
}
