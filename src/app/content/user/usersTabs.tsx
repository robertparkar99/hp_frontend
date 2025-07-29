'use client'

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, User, Upload, BadgeCheck, ClipboardList, ChartColumnIncreasing, Star, Search, Filter, MoreVertical, ListCheck, ListChecks } from 'lucide-react';
import { useEffect, useState } from "react";
import JobRoleNew from '../../../components/users/jobroleNew';
import JobRoleSkillsAdd1 from '../../../components/users/jobroleSkilladd1';
import JobRoleSkill from '../../../components/users/jobroleSkill';
import JobRoleTasks from '../../../components/users/jobroleTask';
import PersonalDetails from '../../../components/users/personalDetails';
import LOR from '../../../components/users/NewLOR';
import UploadDoc from '../../../components/users/uploadDoc';
import { Button } from "@/components/ui/button";  // Make sure you have this
import { cn } from "@/lib/utils";                 // Make sure you have this
import React from 'react';
import Loading from "@/components/utils/loading";

export default function EditProfilePage() {
    const router = useRouter();
    const [isLoading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<any>();
    const [userJobroleSkills, SetUserJobroleSkills] = useState<any[]>([]);
    const [userJobroleLists, SetUserJobroleLists] = useState<any[]>([]);
    const [userLOR, SetUserLOR] = useState<any[]>([]);
    const [userProfiles, SetUserProfiles] = useState<any[]>([]);
    const [userJobroleTask, setUserJobroleTask] = useState<any[]>([]);
    const [documentLists, setDocumentLists] = useState<any[]>([]);
    const [userLists, setUserLists] = useState<any[]>([]);
    const [clickedUser, setClickedUser] = useState<any>();
    const [activeTab, setActiveTab] = useState('personal-info');
    const [uploadDoc, setdocumentTypeLists] = useState<any>();

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
        const clickedUser = localStorage.getItem("clickedUser");
        // alert(clickedUser);
        if (userData && clickedUser) {
            setClickedUser(clickedUser);
            const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, syear } = JSON.parse(userData);
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
    }, [clickedUser]);

    useEffect(() => {
        if (sessionData.url && sessionData.token) {
            fetchInitialData();
        }
    }, [sessionData.url, sessionData.token]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${sessionData.url}/user/add_user/${clickedUser}'/edit?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&syear=${sessionData.syear}`
            );
            const data = await res.json();
            setLoading(false);
            SetUserJobroleSkills(data.jobroleSkills || []);
            setUserJobroleTask(data.jobroleTasks || []);
            SetUserJobroleLists(data.jobroleList || []);
            SetUserLOR(data.levelOfResponsbility || []);
            SetUserProfiles(data.user_profiles || []);
            setUserLists(data.employees || []);
            // console.log(data);
            setUserDetails(data.data || null);
            setdocumentTypeLists(data.documentTypeLists || []);
            setDocumentLists(data.documentLists || []);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        }
    };

    const handleGoBack = () => router.back();

    // Tabs: keep ids matching your content rendering logic
    const tabs = [
        { id: 'personal-info', label: 'Personal Information', logo: "assets/User Details Images/Personal Details.png", icon: <User className="mr-2 h-5 w-5 text-slate-700" /> },
        { id: 'upload-docs', label: 'Upload Document', logo: "assets/User Details Images/Upload Document.jpg", icon: <Upload className="mr-2 h-5 w-5 text-slate-700" /> },
        { id: 'jobrole-skill', label: 'Jobrole Skill', logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/b61c6f56b46586f24e1f40fd22b5f9c187703d2f?width=287", icon: <BadgeCheck className="mr-2 h-5 w-5 text-slate-700" /> },
        { id: 'jobrole-tasks', label: 'Jobrole Tasks', logo: "assets/User Details Images/Jobrole Task.png", icon: <ListChecks className="mr-2 h-5 w-5 text-slate-700" /> },
        { id: 'responsibility', label: 'Level of Responsibility', logo: "assets/User Details Images/Level of Responsibility.png", icon: <ChartColumnIncreasing className="mr-2 h-5 w-5 text-slate-700" /> },
        { id: 'skill-rating', label: 'Skill Rating', logo: "assets/User Details Images/Skill Rating.jpg", icon: <Star className="mr-2 h-5 w-5 text-slate-700" /> }
    ];

    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };


    return (
        <>
            {
                isLoading ?
                    (
                        <Loading />
                    ) : (
                        <div className="w-full">
                            {/* Header Row: Back arrow + Logo + Tabs */}
                            <div className="flex jutsify-between items-center py-4">
                                <div className="backbutton w-[3%]">
                                    <button onClick={handleGoBack} className="text-black mr-4" aria-label="Go back">
                                        <ArrowLeft size={24} />
                                    </button>
                                </div>

                                <div className="flex-shrink-0 mr-2 w-[6%]">
                                    <img
                                        src={tabs.find(tab => tab.id === activeTab)?.logo || "default_logo_url"}
                                        alt="Logo"
                                        className="h-12 w-12 sm:h-10 lg:h-12"
                                    />
                                </div>
                                <div className=" w-[91%] flex justify-center px-2 py-2 rounded-full border-2 border-blue-100 bg-gradient-to-r from-white via-white to-teal-100 shadow-lg flex-wrap">
                                    {tabs.map((tab) => (
                                        <Button
                                            key={tab.id}
                                            variant="ghost"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "rounded-full text-xs sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 min-w-0 flex-shrink-0 flex items-center",
                                                activeTab === tab.id
                                                    ? "bg-emerald-500 text-white [&>svg]:text-white shadow-md hover:bg-emerald-500"
                                                    : " hover:bg-slate-50"
                                            )}
                                        >
                                            {React.cloneElement(tab.icon, {
                                                className: cn(
                                                    "m-0",
                                                    activeTab === tab.id ? "text-white" : "text-slate-700"
                                                )
                                            })}
                                            {tab.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Controls row under tabs, aligned right */}
                            <div className="flex justify-end items-center gap-6 px-8 py-2">
                                {/* Toggle button */}
                                {/* <label className='flex cursor-pointer select-none items-center'>
                                    <div className='relative'>
                                        <input
                                            type='checkbox'
                                            checked={isChecked}
                                            onChange={handleCheckboxChange}
                                            className='sr-only focus:ring-0 focus:ring-offset-0 focus:outline-none'
                                        />
                                        <div className={`block h-[26px] w-[50px] rounded-full ${isChecked ? 'bg-emerald-500' : 'bg-[#E8EAEA]'}`}></div>
                                        <div className={`dot absolute ${isChecked ? 'left-7' : 'left-1'} top-1 h-[18px] w-[18px] rounded-full bg-white transition`}></div>
                                    </div>
                                </label> */}
                                {/* Search icon */}
                                {/* <span>
                                    <Search className="h-6 w-6 text-gray-700" />
                                </span> */}
                                {/* Filter icon */}
                                {/* <span>
                                    <Filter className="h-6 w-6 text-gray-700" />
                                </span> */}
                                {/* More icon */}
                                {/* <span>
                                    <MoreVertical className="h-6 w-6 text-gray-700" />
                                </span> */}
                            </div>

                            {/* Divider */}
                            <div className="w-full h-[1px] bg-gray-300 my-2" />

                            {/* Content */}
                            <div className="p-4">
                                {activeTab === 'personal-info' && <PersonalDetails userDetails={userDetails} userJobroleLists={userJobroleLists} userLOR={userLOR} userProfiles={userProfiles} userLists={userLists} sessionData={sessionData} />}
                                {activeTab === 'upload-docs' && <UploadDoc uploadDoc={uploadDoc} sessionData={sessionData} clickedID={clickedUser} documentLists={documentLists} />}
                                {activeTab === 'jobrole-skill' && <JobRoleSkill userJobroleSkills={userJobroleSkills} />}
                                {activeTab === 'jobrole-tasks' && <JobRoleTasks userJobroleTask={userJobroleTask} />}
                                {activeTab === 'responsibility' && <LOR />}
                                {/* {activeTab === 'skill-rating' && <div>Skill Rating Content</div>} */}
                                {activeTab === 'skill-rating' && <JobRoleSkillsAdd1 skills={userJobroleSkills} />}
                            </div>

                        </div>
                    )
            }
        </>
    );
}
