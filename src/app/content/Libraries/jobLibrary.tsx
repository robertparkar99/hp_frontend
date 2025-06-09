import React, { useEffect, useState, useMemo } from 'react';
import TableView from '@/components/skillComponent/tableView';
import TreeView from '@/components/skillComponent/treeView';
import AddSkillView from '@/components/skillComponent/addTreeView';

interface Industry { industries: string }
interface Department { department: string }
interface SubDepartment { sub_department: string }
interface TableData { id: number; category: string; sub_category: string; title: string }
interface allSkillData { id: number; category: string; sub_category: string; no_sub_category: string; title: string }
interface userSkillsData { id: number; category: string; sub_category: string; no_sub_category: string; title: string }
interface SkillItem {
  id: number;
  category: string;
  sub_category: string;
  no_sub_category: string;
  title: string;
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
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [allSkillData, setallSkillData] = useState<allSkillData[]>([]);
  const [userSkillsData, setuserSkillsData] = useState<userSkillsData[]>([]);
  const [activeTab, setActiveTab] = useState<'Tree' | 'Table' | 'Added Skills'>('Tree'); // start with Table for demo
  const [selectedSubDepartments, setSelectedSubDepartments] = useState<string[]>([]);
  const transformToTree = (data: allSkillData[] | userSkillsData[]): SkillTree => {
    const tree: SkillTree = {};
    
    data.forEach((item) => {
      const category = item.category;
      const subCategory = item.sub_category || 'no_sub_category';
      
      if (!tree[category]) {
        tree[category] = {};
      }
      
      if (!tree[category][subCategory]) {
        tree[category][subCategory] = [];
      }
      
      tree[category][subCategory].push(item);
    });
    
    return tree;
  };

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, org_type,sub_institute_id,user_id, user_profile_name } = JSON.parse(userData);
      setSessionUrl(APP_URL);
      setSessionToken(token);
      setessionOrgType(org_type);
      setessinSubInstituteId(sub_institute_id);
      setessionUserID(user_id);
      setessionUserProfile(user_profile_name);
    }
  }, []);

  useEffect(() => {
    if (sessionUrl && sessionToken) fetchData();
    async function fetchData() {
      const res = await fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}`);
      const data = await res.json();
      setIndustries(data.jobroleSkill || []);
      setTableData(data.tableData || []);
      setDepartments(data.jobroleSkill || []);
      setallSkillData(data.allSkillData || []);
      setuserSkillsData(data.userTree || []);
    }
  }, [sessionUrl, sessionToken]);

  // const getDepartment = async (industries: string) => {
  //   if (!industries) return setDepartments([]);
  //   const res = await fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&industries=${industries}`);
  //   const data = await res.json();
  //   setDepartments(data.jobroleSkill || []);
  // };

  const getSubDepartment = async (department: string) => {
    if (!department){
      const res = await fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}`);
        setSubDepartments([]);
        const data = await res.json();
        setTableData(data.tableData || []);
        setallSkillData(data.allSkillData || []);
        setuserSkillsData(data.userTree || []);
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
    setTableData(data.tableData || []);
    setallSkillData(data.allSkillData || []);
    setuserSkillsData(data.userTree || []);
};


    // console.log("Selected Sub Departments:", selectedSubDepartments);
     const handleAddClick = async () => {
      // alert(sessionToken);
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
            sub_institute_id : sessionSubInstituteId,
            user_id: sessionUserID,
            user_profile_name : sessionUserProfile,
            formType : 'master',
          }),
        });

        const data = await res.json();
        if(data.status_code==1){
          alert(data.message);
          setuserSkillsData([]);
          setuserSkillsData(data.userTree || []);
        }else{
          alert(data.message);
        }
        // console.log("API response:", data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    useEffect(() => {
      console.log('Updated skills data:', userSkillsData);
    }, [userSkillsData]);
  // In a real application, you'd likely manage the 'open' state using React state (e.g., useState)
  // For this direct conversion, we'll keep the classes as they are.
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Job Library</h2>

      {/* Industry / Department dropdowns (unchanged) */}
      <div className="mb-6 p-4 rounded-sm shadow-lg shadow-blue-300/60">
        <div className="flex gap-20">
          {/* <select className="form-select w-1/3 rounded-sm border-2 border-[var(--color-blue-100)] h-[38px]" onChange={e => getDepartment(e.target.value)}>
            <option value="">Select Industry</option>
            {industries.map(i => <option key={i.industries} value={i.industries}>{i.industries}</option>)}
          </select> */}
          <select className="form-select w-1/3 rounded-sm border-2 border-[var(--color-blue-100)] h-[38px]" onChange={e => getSubDepartment(e.target.value)}>
            <option value="">Select Department</option>
            {departments.map(d => <option key={d.department} value={d.department}>{d.department}</option>)}
          </select>
       <select
          className="form-select w-1/3 rounded-sm border-2 border-[var(--color-blue-100)] resize-y p-2"
          multiple
          onChange={e => {
            const selectedValues = Array.from(e.target.selectedOptions).map(option => option.value);
            getSkillData(selectedValues);
          }}
        >
          <option value="">Select Sub Department</option>
          {subDepartments.map(s => (
            <option key={s.sub_department} value={s.sub_department}>
              {s.sub_department}
            </option>
          ))}
        </select>
         {selectedSubDepartments.length > 0 && (
          <button
            type="button"
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br text-white w-[100px] h-[38px] px-4 rounded-lg"
            onClick={handleAddClick}
          >
            Add
          </button>
        )}
        </div>
      </div>


      <div className="tabDiv rounded-sm shadow-lg shadow-blue-300/60 bg-[#f0f6ff] rounded-lg">
        <div className="text-center">
          {['Tree', 'Table','Added Skills'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 ${activeTab === tab ? ' mt-2 border-b-2 border-blue-500 font-bold bg-[#fff] rounded-t-lg' : ''}`}
              onClick={() => setActiveTab(tab as 'Tree' | 'Table')}
            >{tab}</button>
          ))}
        </div>

        {activeTab === 'Tree' && (
        <TreeView allSkillData={transformToTree(allSkillData)} />
      )}

      {activeTab === 'Added Skills' && (
        <AddSkillView userSkillsData={transformToTree(userSkillsData)} />
      )}
      </div>
    </div>
  );
};

export default SkillLibrary;
