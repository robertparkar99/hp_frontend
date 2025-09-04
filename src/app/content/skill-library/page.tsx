"use client";

import React, { useEffect, useState } from "react";
import ViewSkill from "@/components/skillComponent/viewDialouge";
import EditDialog from "@/components/skillComponent/editDialouge";
import { FiEdit } from "react-icons/fi";
import { Trash2, Funnel  } from "lucide-react";
 // ✅ filter icon

type Skill = {
  id: number;
  title: string;
  description?: string;
  department?: string;
  category?: string;
  sub_category?: string;
  proficiency_level?: string;
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
  const [userSkills, setUserSkills] = useState<Skill[]>([]);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(null);

  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
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
  const [showFilters, setShowFilters] = useState(false); // ✅ toggle state

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
        const userSkillsArr: Skill[] = data?.userSkills || [];

        const parsedCategories: Category[] = Object.entries(userTree).map(
          ([categoryName, subCatObj]) => {
            const subcategories: SubCategory[] = Object.entries(
              subCatObj as Record<string, any[]>
            ).map(([subName, skillsArr]) => {
              const skills: Skill[] = (skillsArr as any[]).map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                department: s.department,
                category: s.category,
                sub_category: s.sub_category,
                proficiency_level: s.proficiency_level,
              }));
              return { name: subName, skills };
            });

            return { name: categoryName, subcategories };
          }
        );

        setCategories(parsedCategories);
        setUserSkills(userSkillsArr);
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
            headers: { Authorization: `Bearer ${sessionData.token}` },
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

  // Dropdown options
  const departmentOptions = Array.from(new Set(userSkills.map((s) => s.department))).filter(
    (dept): dept is string => typeof dept === "string"
  );

  const proficiencyOptions = Array.from(
    new Set(userSkills.map((s) => s.proficiency_level))
  )
    .filter(Boolean)
    .map((lvl) => Number(lvl))
    .sort((a, b) => a - b)
    .map(String);

  // Decide hexagon items
  let hexagonItems: { id?: number; title: string; subtitle?: string; skillObj?: Skill }[] = [];

  if (!selectedDepartment) {
    hexagonItems = departmentOptions.map((dept) => ({ title: dept }));
  } else if (selectedDepartment && !selectedCategory) {
    const categoriesForDept = Array.from(
      new Set(userSkills.filter((s) => s.department === selectedDepartment).map((s) => s.category))
    ).filter(Boolean);
    hexagonItems = categoriesForDept.map((cat) => ({ title: cat! }));
  } else if (selectedDepartment && selectedCategory && !selectedSubcategory) {
    const subcategoriesForCat = Array.from(
      new Set(
        userSkills
          .filter((s) => s.department === selectedDepartment && s.category === selectedCategory)
          .map((s) => s.sub_category)
      )
    ).filter(Boolean);
    hexagonItems = subcategoriesForCat.map((sub) => ({ title: sub! }));
  } else if (selectedDepartment && selectedCategory && selectedSubcategory) {
    hexagonItems =
      userSkills
        .filter(
          (s) =>
            s.department === selectedDepartment &&
            s.category === selectedCategory &&
            s.sub_category === selectedSubcategory &&
            (!selectedProficiency || s.proficiency_level === selectedProficiency)
        )
        .map((skill) => ({
          id: skill.id,
          title: skill.title,
          subtitle: skill.description,
          skillObj: skill,
        })) || [];
  }

  return (
    <main className="flex  gap-6 pr-8 min-h-screen flex-col">
      {/* 🔽 Filter Toggle Button */}
      <div className="flex justify-end ">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="p-2"
        >
          <Funnel />
        </button>
      </div>

      {/* 🔽 Filters Section - only visible if showFilters is true */}
      {showFilters && (
        <div className="flex justify-end gap-4 mb-4 flex-wrap">
          {/* Department Filter */}
          <select
            value={selectedDepartment || ""}
            onChange={(e) => {
              setSelectedDepartment(e.target.value || null);
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
            className="border border-gray-300 rounded-2xl px-3 py-2 bg-white shadow-sm w-60"
          >
            <option value="">Filter by Department</option>
            {departmentOptions.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => {
              setSelectedCategory(e.target.value || null);
              setSelectedSubcategory(null);
            }}
            className="border border-gray-300 rounded-2xl px-3 py-2 bg-white shadow-sm w-60"
            disabled={!selectedDepartment}
          >
            <option value="">Filter by Category</option>
            {selectedDepartment &&
              Array.from(
                new Set(
                  userSkills.filter((s) => s.department === selectedDepartment).map((s) => s.category)
                )
              ).map((cat, idx) => (
                <option key={idx} value={cat || ""}>
                  {cat}
                </option>
              ))}
          </select>

          {/* Subcategory Filter */}
          <select
            value={selectedSubcategory || ""}
            onChange={(e) => setSelectedSubcategory(e.target.value || null)}
            className="border border-gray-300 rounded-2xl px-3 py-2 bg-white shadow-sm w-60"
            disabled={!selectedCategory}
          >
            <option value="">Filter by Sub Category</option>
            {selectedDepartment &&
              selectedCategory &&
              Array.from(
                new Set(
                  userSkills
                    .filter(
                      (s) =>
                        s.department === selectedDepartment && s.category === selectedCategory
                    )
                    .map((s) => s.sub_category)
                )
              ).map((sub, idx) => (
                <option key={idx} value={sub || ""}>
                  {sub}
                </option>
              ))}
          </select>

          {/* Proficiency Level Filter */}
          <select
            value={selectedProficiency || ""}
            onChange={(e) => setSelectedProficiency(e.target.value || null)}
            className="border border-gray-300 rounded-2xl px-3 py-2 bg-white shadow-sm w-60"
          >
            <option value="">Filter by Proficiency Level</option>
            {proficiencyOptions.map((lvl, idx) => (
              <option key={idx} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Honeycomb Section */}
      <section className="w-full h-screen overflow-y-auto scrollbar-hide">
        <div className="honeycomb-container-skill flex flex-wrap gap-6 justify-center pb-4">
          {hexagonItems.map((item, index) => (
            <div
              key={index}
              className="hexagon-wrapper-skill relative cursor-pointer"
              onClick={() => {
                if (!selectedDepartment) {
                  setSelectedDepartment(item.title);
                } else if (selectedDepartment && !selectedCategory) {
                  setSelectedCategory(item.title);
                } else if (selectedDepartment && selectedCategory && !selectedSubcategory) {
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
                  <p
                    className="hexagon-title-skill text-black font-inter text-center"
                    title={item.subtitle}
                  >
                    {item.title}
                  </p>

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
          onSuccess={() => setDialogOpen({ ...dialogOpen, add: false })}
        />
      )}

      {/* Edit Dialog */}
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
