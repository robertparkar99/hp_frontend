'use client';

import React, { useEffect, useState, useMemo } from 'react';
import AddSkillView from '@/components/skillComponent/addTreeView';
import Loading from "../../../components/utils/loading";
import AddDialog from "@/components/skillComponent/addDialouge";

interface allSkillData { id: number; category: string; sub_category: string; no_sub_category: string; title: string; description: string; }
interface userSkillsData { id: number; category: string; sub_category: string; no_sub_category: string; title: string; description: string; }
interface SkillItem {
  id: number;
  category: string;
  sub_category: string;
  no_sub_category: string;
  title: string;
  description: string;
}

type SkillTree = {
  [category: string]: {
    [subCategory: string]: SkillItem[];
  };
};

const SkillLibrary = () => {
  const [sessionUrl, setSessionUrl] = useState<string>();
  const [sessionToken, setSessionToken] = useState<string>();
  const [sessionOrgType, setessionOrgType] = useState<string>();
  const [sessionSubInstituteId, setessinSubInstituteId] = useState<string>();
  const [sessionUserID, setessionUserID] = useState<string>();
  const [sessionUserProfile, setessionUserProfile] = useState<string>();
  const [isLoading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [userSkillsData, setuserSkillsData] = useState<userSkillsData[]>([]);
  const [selectedSubDepartments, setSelectedSubDepartments] = useState<string[]>([]);
  const [skillTreeData, setSkillTreeData] = useState<SkillTree>({});
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  const transformToTree = useMemo(() => (data: allSkillData[] | userSkillsData[]): SkillTree => {
    const tree: SkillTree = {};
    if (!Array.isArray(data)) return tree;
    data.forEach((item) => {
      const category = item.category;
      const subCategory = item.sub_category || 'no_sub_category';
      if (!tree[category]) tree[category] = {};
      if (!tree[category][subCategory]) tree[category][subCategory] = [];
      tree[category][subCategory].push(item);
    });
    return tree;
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name } = JSON.parse(userData);
      setSessionUrl(APP_URL);
      setSessionToken(token);
      setessionOrgType(org_type);
      setessinSubInstituteId(sub_institute_id);
      setessionUserID(user_id);
      setessionUserProfile(user_profile_name);
    }
  }, []);

  useEffect(() => {
    if (sessionUrl && sessionToken) {
      fetchData();
      fetchDepartments();
    }
  }, [sessionUrl, sessionToken]);

  async function fetchData(department: string | null = '', sub_department: string | null = '') {
   
    const res = await fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&category=${department}&sub_category=${sub_department}`);
    const data = await res.json();
    console.log('skillData', data);
    setLoading(false);
    setuserSkillsData(data.userTree || []);
    setSkillTreeData(transformToTree(data.userTree || []));
  }

  const getSubDepartment = async (department: string) => {
    if (!department) {
      const res = await fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}`);
      setSubDepartments([]);
      const data = await res.json();
    }
    else {
      const res = await fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&department=${department}`);
      const data = await res.json();
      setSubDepartments(data.jobroleSkill || []);
    }
  };

  const getSkillData = async (subdeps: string[]) => {
    const res = await fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&sub_department=${subdeps}`);
    setSelectedSubDepartments(subdeps);
    const data = await res.json();
  };

  const handleAddClick = async () => {
    try {
      const res = await fetch(`${sessionUrl}/skill_library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          type: "API",
          token: sessionToken,
          method_field: 'POST',
          org_type: sessionOrgType,
          sub_department: selectedSubDepartments,
          sub_institute_id: sessionSubInstituteId,
          user_id: sessionUserID,
          user_profile_name: sessionUserProfile,
          formType: 'master',
        }),
      });

      const data = await res.json();
      if (data.status_code == 1) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${sessionUrl}/search_data?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&searchType=category&searchWord=departments`);
      const data = await res.json();
      setDepartments(data.searchData || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  };

  const fetchSubDepartments = async (department: string) => {
    try {
      setSelectedDepartment(department);
      const res = await fetch(`${sessionUrl}/search_data?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&searchType=sub_category&searchWord=${encodeURIComponent(department)}`);
      fetchData(department);
      const data = await res.json();
      setSubDepartments(data.searchData || []);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
  };

  const handleSubDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedOptions: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedOptions.push(options[i].value);
      }
    }
    
    setSelectedSubDepartments(selectedOptions);
    fetchData(selectedDepartment, selectedOptions.join(','));
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4">
          <div className='flex rounded-lg p-4'>
            <div className="headerMenu">
              <p className="text-3xl font-bold mb-4 text-[#4876ab]" style={{ fontFamily: "cursive" }}>Skill Library</p>
            </div>
            <div className="ml-auto">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full" onClick={() => setDialogOpen({ ...dialogOpen, add: true })} data-titleHead="Add New Skill">+</button>
            </div>
          </div>

          <div className="flex justify-center gap-8 py-6 inset-shadow-sm inset-shadow-[#EBF7FF] rounded-lg">
            <div className="flex flex-col items-center w-[320px]">
              <label htmlFor="Department" className="self-start mb-1 px-3">Skill Category</label>
              <select
                name="department"
                className="rounded-lg p-2 border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)]"
                onChange={e => fetchSubDepartments(e.target.value)}
              >
                <option value="">Choose a Category to Filter</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center w-[320px]">
              <label htmlFor="subDepartment" className="self-start mb-1 px-3">Skill Sub-Category</label>
              <select
                name="sub_department"
                className="rounded-lg p-2 resize-y overflow-hidden border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)]"
                onChange={handleSubDepartmentChange}
                multiple
                size={3}
                value={selectedSubDepartments}
              >
                <option value="">Choose a Sub-Category to Filter</option>
                {subDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className='mb-[26px] text-[#ddd] border-2 border-[#449dd5] rounded' />
        </div>
      )}
      <AddSkillView 
        key={`${selectedDepartment}-${selectedSubDepartments.join(',')}`}
        userSkillsData={skillTreeData} category={selectedDepartment} subCategory={selectedSubDepartments.join(',')}
      />
      {dialogOpen.add && (
        <AddDialog 
          skillId={0}
          onClose={() => setDialogOpen({...dialogOpen, add: false})}
          onSuccess={() => {
            setDialogOpen({...dialogOpen, add: false});
            fetchData(selectedDepartment, selectedSubDepartments.join(','));
          }}
        />
      )}
    </>
  );
};

export default SkillLibrary;