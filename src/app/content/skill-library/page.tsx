"use client";

import React, { useEffect, useState } from "react";
import ViewSkill from "@/components/skillComponent/viewDialouge";
import EditDialog from "@/components/skillComponent/editDialouge";
import { FiEdit } from "react-icons/fi";
import { Trash2, Funnel, LayoutGrid, Table } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Atom } from "react-loading-indicators";

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
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [selectedProficiency, setSelectedProficiency] = useState<string | undefined>(undefined);

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

  // 🔑 New State for View Mode
  const [viewMode, setViewMode] = useState<"hexagon" | "table">("hexagon");

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
      if (!sessionData.url) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${sessionData.url}/skill_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&category=&sub_category=`
        );
        const data = await res.json();

        const userTree = data?.userTree || {};
        let userSkillsArr: Skill[] = data?.userSkills || [];

        // Sort skills ascending by title
        userSkillsArr = userSkillsArr.sort((a, b) => a.title.localeCompare(b.title));

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

        // Set default category on first load
        if (userSkillsArr.length > 0 && !selectedCategory) {
          setSelectedCategory(userSkillsArr[0].category);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
  const departmentOptions = Array.from(new Set(userSkills.map((s) => s.department)))
    .filter((dept): dept is string => typeof dept === "string")
    .sort((a, b) => a.localeCompare(b));

  const categoryOptions = Array.from(new Set(userSkills.map((s) => s.category)))
    .filter((cat): cat is string => typeof cat === "string")
    .sort((a, b) => a.localeCompare(b));

  const proficiencyOptions = Array.from(new Set(userSkills.map((s) => s.proficiency_level)))
    .filter(Boolean)
    .map((lvl) => Number(lvl))
    .sort((a, b) => a - b)
    .map(String);

  // Filtered skills
  let filteredSkills = userSkills.filter((s) => {
    return (
      (!selectedDepartment || s.department === selectedDepartment) &&
      (!selectedCategory || s.category === selectedCategory) &&
      (!selectedSubcategory || s.sub_category === selectedSubcategory) &&
      (!selectedProficiency || s.proficiency_level === selectedProficiency)
    );
  });

  // Default page load → first category skills
  if (
    !selectedDepartment &&
    !selectedCategory &&
    !selectedSubcategory &&
    !selectedProficiency &&
    userSkills.length > 0
  ) {
    const firstCategory = userSkills[0].category;
    filteredSkills = userSkills.filter((s) => s.category === firstCategory);
  }

  const hexagonItems =
    filteredSkills.map((skill) => ({
      id: skill.id,
      title: skill.title,
      subtitle: skill.description,
      skillObj: skill,
    })) || [];

  return (
    <>
      {/* Top bar with Funnel + View Toggle */}
      <div className="p-4 flex justify-between items-center mb-6">
        {/* View Toggle */}
        <div className="flex gap-2 px-2">
          <Button
            variant={viewMode === "hexagon" ? "default" : "outline"}
            onClick={() => setViewMode("hexagon")}
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Hexagon
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <Table className="w-4 h-4 mr-2" /> Table
          </Button>
        </div>

        {/* Filter Button */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-3 rounded-lg hover:bg-gray-100">
              <Funnel className="w-5 h-5" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-[300px] p-4 space-y-4" align="end">
            <h3 className="text-lg font-semibold mb-2">Filter Skills</h3>

            {/* Department Filter */}
            <Select
              value={selectedDepartment || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedDepartment(undefined);
                  setSelectedCategory(undefined);
                  setSelectedSubcategory(undefined);
                  setSelectedProficiency(undefined);
                } else {
                  setSelectedDepartment(value);
                  setSelectedCategory(undefined);
                  setSelectedSubcategory(undefined);
                  setSelectedProficiency(undefined);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map((dept, idx) => (
                  <SelectItem key={idx} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={selectedCategory || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedCategory(undefined);
                  setSelectedSubcategory(undefined);
                } else {
                  setSelectedCategory(value);
                  setSelectedSubcategory(undefined);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((cat, idx) => (
                  <SelectItem key={idx} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subcategory Filter */}
            <Select
              value={selectedSubcategory || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedSubcategory(undefined);
                } else {
                  setSelectedSubcategory(value);
                }
              }}
              disabled={!selectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Sub Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub Categories</SelectItem>
                {selectedCategory &&
                  Array.from(
                    new Set(
                      userSkills
                        .filter((s) => s.category === selectedCategory)
                        .map((s) => s.sub_category)
                    )
                  )
                    .filter((sub): sub is string => typeof sub === "string")
                    .sort((a, b) => a.localeCompare(b))
                    .map((sub, idx) => (
                      <SelectItem key={idx} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>

            {/* Proficiency Filter */}
            <Select
              value={selectedProficiency || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedProficiency(undefined);
                } else {
                  setSelectedProficiency(value);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Proficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proficiency Levels</SelectItem>
                {proficiencyOptions.map((lvl, idx) => (
                  <SelectItem key={idx} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Buttons */}
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDepartment(undefined);
                  setSelectedCategory(undefined);
                  setSelectedSubcategory(undefined);
                  setSelectedProficiency(undefined);
                }}
              >
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Content Section */}
      <div className="flex gap-6 flex-col">
        <section className="w-full h-screen overflow-y-auto scrollbar-hide flex items-start justify-center">
          {loading ? (
            <div className="flex justify-start items-center h-screen">
              <Atom color="#525ceaff" size="medium" text="" textColor="" />
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 text-lg font-medium">No skills found</p>
            </div>
          ) : viewMode === "hexagon" ? (
            // 🔷 Hexagon View
            <div className="honeycomb-container-skill flex flex-wrap gap-6 justify-center pb-4">
              {hexagonItems.map((item, index) => (
                <div
                  key={index}
                  className="hexagon-wrapper-skill relative cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => {
                    if (item.skillObj) {
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
          ) : (
            // 📋 Table View with rounded corners
<div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
  <table className="min-w-full">
    <thead>
      <tr className="bg-gray-100 text-left">
        <th className="p-3 border-b">Title</th>
        <th className="p-3 border-b">Description</th>
        <th className="p-3 border-b">Department</th>
        <th className="p-3 border-b">Category</th>
        <th className="p-3 border-b">Sub Category</th>
        <th className="p-3 border-b">Proficiency</th>
        <th className="p-3 border-b">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredSkills.map((skill) => (
        <tr key={skill.id} className="hover:bg-gray-50">
          <td className="p-3 border-b">{skill.title}</td>
          <td className="p-3 border-b">{skill.description}</td>
          <td className="p-3 border-b">{skill.department}</td>
          <td className="p-3 border-b">{skill.category}</td>
          <td className="p-3 border-b">{skill.sub_category}</td>
          <td className="p-3 border-b">{skill.proficiency_level}</td>
          <td className="p-3 border-b gap-4">
            <button
              className="text-gray-500"
              onClick={() => handleEdit(skill)}
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              className="text-gray-500"
              onClick={() => handleDelete(skill.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          )}
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
      </div>
    </>
  );
}
