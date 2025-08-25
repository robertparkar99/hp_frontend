import React, { useEffect, useState, useMemo } from 'react';
import TableView from '@/components/jobroleComponent/tableView';
import Loading from "../../../components/utils/loading"; // Import the Loading component
import AddDialog from "@/components/jobroleComponent/addDialouge";

interface Industry { industries: string }
interface Department { department: string }
interface SubDepartment { sub_department: string }
interface masterTable { id: number; track: string; jobrole: string; description: string }
interface alljobroleData { id: number; category: string; sub_category: string; no_sub_category: string; jobrole: string }
interface userSkillsData { id: number; category: string; sub_category: string; no_sub_category: string; jobrole: string }
interface SkillItem {
  id: number;
  category: string;
  sub_category: string;
  no_sub_category: string;
  jobrole: string;
}

const JobroleLibrary = () => {
  const [sessionUrl, setSessionUrl] = useState<string>();
  const [sessionToken, setSessionToken] = useState<string>();
  const [sessionOrgType, setessionOrgType] = useState<string>();
  const [sessionSubInstituteId, setessinSubInstituteId] = useState<string>();
  const [sessionUserID, setessionUserID] = useState<string>();
  const [sessionUserProfile, setessionUserProfile] = useState<string>();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoading, setLoading] = useState(true);

  const [userSkillsData, setuserSkillsData] = useState<userSkillsData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSubDepartments, setSelectedSubDepartments] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });


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
    if (sessionUrl && sessionToken) fetchData();
    async function fetchData() {
      const res = await fetch(`${sessionUrl}/jobrole_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}`);
      const data = await res.json();
      setLoading(false);

      setuserSkillsData(data.userTree || []);
    }
  }, [sessionUrl, sessionToken]);


  const getSubDepartment = async (department: string) => {
    if (!department) {
      const res = await fetch(`${sessionUrl}/jobrole_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}`);

      const data = await res.json();

      setuserSkillsData(data.userTree || []);
    }
    else {
      const res = await fetch(`${sessionUrl}/jobrole_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&department=${department}`);
      const data = await res.json();

    }
  };

  const getSkillData = async (subdeps: string[]) => {
    const res = await fetch(`${sessionUrl}/jobrole_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&sub_department=${subdeps}`);
    setSelectedSubDepartments(subdeps);
    const data = await res.json();

    setuserSkillsData(data.userTree || []);
  };


  // console.log("Selected Sub Departments:", selectedSubDepartments);
  const handleAddClick = async () => {
    // alert(sessionToken);
    try {

      const res = await fetch(`${sessionUrl}/jobrole_library`, {
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
  useEffect(() => {
    // console.log('Updated skills data:', userSkillsData);
  }, [userSkillsData]);
  // In a real application, you'd likely manage the 'open' state using React state (e.g., useState)
  // For this direct conversion, we'll keep the classes as they are.
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (

        <div className="container mx-auto px-1 rounded-lg pb-4">
          {/* <div className='flex rounded-lg p-4'>
            <div className="headerMenu">
              <p className="text-3xl font-bold mb-4 text-[#4876ab]" style={{ fontFamily: "cursive" }}>Jobrole Library</p>
            </div>
            <div className="ml-auto">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full" onClick={() => setDialogOpen({ ...dialogOpen, add: true })} data-titleHead="Add New Jobrole">+</button>
            </div>
          </div> */}

          <TableView refreshKey={refreshKey} />
        </div>
      )}

      {dialogOpen.add && (
        <AddDialog skillId={null}
          onClose={() => setDialogOpen({ ...dialogOpen, add: false })}
          onSuccess={() => {
            setDialogOpen({ ...dialogOpen, add: false });
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </>
  );
};

export default JobroleLibrary;