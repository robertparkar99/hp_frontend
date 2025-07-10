'use client'

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from "react";
import JobRoleSkill from '../../../components/users/jobroleSkill'; // Corrected the import path casing
import PersonalDetails from '../../../components/users/personalDetails';

export default function EditProfilePage() {
  const router = useRouter();

  const [userDetails, setUserDetails] = useState<any>();
  const [activeTab, setActiveTab] = useState('personal-info');

   const [sessionData, setSessionData] = useState({
      url: "",
      token: "",
      orgType: "",
      subInstituteId: "",
      userId: "",
      userProfile: "",
      syear: "",
    });
  
    useEffect(() => {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, syear, } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          orgType: org_type,
          subInstituteId: sub_institute_id,
          userId: user_id,
          userProfile: user_profile_name,
          syear: syear,
        });
      }
    }, [])

    useEffect(() => {
      if (sessionData.url && sessionData.token) {
        fetchInitialData();
      }
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionData.url, sessionData.token]);
    const fetchInitialData = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/user/add_user/${sessionData.userId}/edit?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&syear=${sessionData.syear}`
        );
        const data = await res.json();
        // console.log(data);
        setUserDetails(data.data || null);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

  const handleGoBack = () => router.back();

  const tabs = [
    { id: 'personal-info', label: 'Personal Information' },
    { id: 'upload-docs', label: 'Upload Document' },
    { id: 'jobrole-skill', label: 'Jobrole Skill' },
    { id: 'jobrole-tasks', label: 'Jobrole Tasks' },
    { id: 'responsibility', label: 'Level of Responsibility' },
    { id: 'skill-rating', label: 'Skill Rating' }
  ];

  return (
    <div className="w-full bg-white shadow-md">
      {/* Header Section */}
      <div className="flex h-[130px] bg-[#ACD4FF] rounded-t-[15px] shadow-md items-center px-4 " >
        <button onClick={handleGoBack} className="text-black" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Profile Image and Main Tabs */}
      <div className="flex justify-center items-end -mt-22 mb-4 gap-24">
        <button
          onClick={() => setActiveTab('personal-info')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg ${
            activeTab === 'personal-info' 
              ? 'bg-[#358788] text-white shadow-[#358788]' 
              : 'border border-[#007be5] text-[#007be5] bg-white shadow-[#9ccdf7]'
          }`}
        >
          Personal Information
        </button>

        <div className="relative">
          {userDetails && userDetails.image && userDetails.image !== '' ? (
            <img
              src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${userDetails.image}`}
              alt="Profile picture"
              className="w-[150px] h-[150px] bg-white rounded-full border-[5px] border-white object-cover actualImage shadow-lg shadow-blue-500/50"
            />
          ) : (
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
              alt="Profile picture"
              className="w-[150px] h-[150px] bg-white rounded-full border-[5px] border-white defaultImage shadow-lg shadow-blue-500/50"
            />
          )}
        </div>

        <button
          onClick={() => setActiveTab('upload-docs')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg ${
            activeTab === 'upload-docs' 
              ? 'bg-[#358788] text-white shadow-[#358788]' 
              : 'border border-[#007be5] text-[#007be5] bg-white shadow-[#9ccdf7]'
          }`}
        >
          Upload Document
        </button>
      </div>

      {/* Secondary Tabs */}
      <div className="flex flex-wrap justify-center gap-4 px-2 mb-4">
        {tabs.slice(2).map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              
            }}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg ${
              activeTab === tab.id 
                ? 'bg-[#358788] text-white shadow-[#358788]' 
                : 'border border-[#007be5] text-[#007be5] bg-white shadow-[#9ccdf7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-gray-300 my-2" />

      {/* Content Sections */}
      <div className="p-4">
        {activeTab === 'personal-info' && (
          // <div>Personal Information Content</div>
          <PersonalDetails />
        )}
        {activeTab === 'upload-docs' && (
          <div>Upload Documents Content</div>
        )}
        {activeTab === 'jobrole-skill' && (
          <JobRoleSkill />
        )}
        {activeTab === 'jobrole-tasks' && (
          <div>Jobrole Tasks Content</div>
        )}
        {activeTab === 'responsibility' && (
          <div>Level of Responsibility Content</div>
        )}
        {activeTab === 'skill-rating' && (
          <div>Skill Rating Content</div>
        )}
      </div>
    </div>
  )
}