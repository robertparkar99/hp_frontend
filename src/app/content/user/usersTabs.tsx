"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  BadgeCheck,
  ListChecks,
  ChartColumnIncreasing,
  Star,
  UserRoundSearch,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import JobRoleSkill from "../../../components/users/jobroleSkill";
import JobRoleTasks from "../../../components/users/jobroleTask";
import PersonalDetails from "../../../components/users/personalDetails";
import LOR from "../../../components/users/NewLOR";
import UploadDoc from "../../../components/users/uploadDoc";
import Skillrating from "../../../components/users/skillRating";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import Loading from "@/components/utils/loading";
import Radar from "@/app/Radar/page";

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);

  const [userDetails, setUserDetails] = useState<any>();
  const [userJobroleSkills, SetUserJobroleSkills] = useState<any[]>([]);
  const [userRatingSkills, SetUserRatingSkills] = useState<any[]>([]);
  const [userRatedSkills, SetUserRatedSkills] = useState<any[]>([]);
  const [userJobroleLists, SetUserJobroleLists] = useState<any[]>([]);
  const [userLOR, SetUserLOR] = useState<any[]>([]);
  const [SelLORs, setSelLOR] = useState<any[]>([]);
  const [userProfiles, SetUserProfiles] = useState<any[]>([]);
  const [userdepartment, setUserdepartment] = useState<any[]>([]);
  const [userJobroleTask, setUserJobroleTask] = useState<any[]>([]);
  const [documentLists, setDocumentLists] = useState<any[]>([]);
  const [userLists, setUserLists] = useState<any[]>([]);
  const [clickedUser, setClickedUser] = useState<any>();
  const [activeTab, setActiveTab] = useState("personal-info");
  const [uploadDoc, setdocumentTypeLists] = useState<any>();
  const [userJobroleComponent, setUserJobroleComponents] = useState<any>();
  const [userCategory, setUserCategory] = useState<any>("");
  // near your other states
  const [fullJobroleData, setFullJobroleData] = useState<any>({});


  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    syear: "",
  });

  // Load session + clicked user
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const clicked = localStorage.getItem("clickedUser");

    if (userData && clicked) {
      setClickedUser(clicked);

      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
        user_profile_name,
        syear,
      } = JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
        syear,
      });
    }
  }, []);

  // Load initial data and NEW Department/Jobrole API
  useEffect(() => {
    if (sessionData.url && sessionData.token && clickedUser) {
      fetchInitialData();
      fetchDepartmentsAndJobroles(); // NEW API
    }
  }, [sessionData]);

  // 🔥 NEW API: Department + Jobrole
  const fetchDepartmentsAndJobroles = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.subInstituteId}`
      );

      const api = await res.json();
      console.log("NEW API DATA:", api);

      const deptObject = api.data || {};

      // store full map so child can read department -> jobroles mapping
      setFullJobroleData(deptObject);

      const departmentList = Object.keys(deptObject);
      setUserdepartment(departmentList);

      // don't set jobrole list globally here; PersonalDetails will derive based on selected department
    } catch (error) {
      console.error("Failed to fetch new dept/jobroles:", error);
    }
  };


  // Old full user load (jobroleList/department removed)
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}/user/add_user/${clickedUser}/edit?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&syear=${sessionData.syear}`
      );

      const data = await res.json();
      console.log("FULL USER DATA:", data);

      SetUserJobroleSkills(data.jobroleSkills || []);
      SetUserRatingSkills(data.skills || []);
      SetUserRatedSkills(data.userRatedSkills || []);
      setUserJobroleTask(data.jobroleTasks || []);
      SetUserLOR(data.levelOfResponsbility || []);
      setSelLOR(data.userLevelOfResponsibility || []);
      SetUserProfiles(data.user_profiles || []);
      setUserLists(data.employees || []);
      setUserDetails(data.data || null);
      setdocumentTypeLists(data.documentTypeLists || []);
      setDocumentLists(data.documentLists || []);
      setUserJobroleComponents(data.usersJobroleComponent || []);
      setUserCategory(data.usersJobroleComponent?.jobrole_category || "");

      // ❌ REMOVE OLD DEPT + JOBROLE → we now use NEW API only

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setLoading(false);
    }
  };

  const handleGoBack = () => router.back();

  const tabs = [
    {
      id: "personal-info",
      label: "Personal Information",
      icon: <User className="mr-2 h-5 w-5 text-slate-700" />,
    },
    {
      id: "upload-docs",
      label: "Upload Document",
      icon: <Upload className="mr-2 h-5 w-5 text-slate-700" />,
    },
    {
      id: "jobrole-skill",
      label: "Jobrole Skill",
      icon: <BadgeCheck className="mr-2 h-5 w-5 text-slate-700" />,
    },
    {
      id: "jobrole-tasks",
      label: "Jobrole Tasks",
      icon: <ListChecks className="mr-2 h-5 w-5 text-slate-700" />,
    },
    {
      id: "responsibility",
      label: "Level of Responsibility",
      icon: <ChartColumnIncreasing className="mr-2 h-5 w-5 text-slate-700" />,
    },
    {
      id: "skill-rating",
      label: "Skill Rating",
      icon: <Star className="mr-2 h-5 w-5 text-slate-700" />,
    },
    {
      id: "Jobrole-Type",
      label: "Expected Competancy",
      icon: <UserRoundSearch className="mr-2 h-5 w-5 text-slate-700" />,
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="w-full min-h-screen bg-background flex flex-col rounded-xl">


          {/* ================= HEADER ================= */}
          <div className="z-40 border-b border-blue-100">
            <div className="flex items-center gap-3 px-3 py-2">

              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="shrink-0 text-black"
              >
                <ArrowLeft size={20} />
              </button>


              {/* Tabs Scroll Area */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex justify-start">
                  <div
                    className="bg-white
        inline-flex items-center gap-2
        pl-2 pr-4 py-1.5
        rounded-full
        border border-blue-200
        bg-gradient-to-r from-white to-[#D9FFF6]
        max-w-screen-lg
      "
                  >
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          `
            flex items-center gap-1.5
            whitespace-nowrap
            rounded-full
            transition-all
            text-[12.5px] font-medium

            px-3 py-1.5
            md:px-2 md:py-1
            lg:px-3 lg:py-1.5
            `,
                          activeTab === tab.id
                            ? "bg-emerald-500 text-white shadow"
                            : "text-slate-700 hover:bg-white"
                        )}
                      >
                        {React.cloneElement(tab.icon, {
                          className: cn(
                            "h-3.5 w-3.5",
                            activeTab === tab.id ? "text-white" : "text-slate-600"
                          ),
                        })}
                        <span className="leading-none">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* ================= CONTENT SECTION ================= */}
          <div className="flex-1 px-4 py-4">

            {activeTab === "personal-info" && (
              <PersonalDetails
                userDetails={userDetails}
                userdepartment={userdepartment}
                userJobroleLists={userJobroleLists}
                fullJobroleData={fullJobroleData}
                userLOR={userLOR}
                userProfiles={userProfiles}
                userLists={userLists}
                sessionData={sessionData}
                onUpdate={fetchInitialData}
              />
            )}

            {activeTab === "upload-docs" && (
              <UploadDoc
                uploadDoc={uploadDoc}
                sessionData={sessionData}
                clickedID={clickedUser}
                documentLists={documentLists}
              />
            )}

            {activeTab === "jobrole-skill" && (
              <JobRoleSkill userJobroleSkills={userJobroleSkills} />
            )}

            {activeTab === "jobrole-tasks" && (
              <JobRoleTasks userJobroleTask={userJobroleTask} />
            )}

            {activeTab === "responsibility" && (
              <LOR SelLOR={SelLORs} />
            )}

            {activeTab === "skill-rating" && (
              <Skillrating
                skills={userRatingSkills}
                clickedUser={clickedUser}
                userRatedSkills={userRatedSkills}
                userJobroleSkills={userJobroleSkills}
              />
            )}

            {activeTab === "Jobrole-Type" && (
              <Radar
                usersJobroleComponent={userJobroleComponent}
                userCategory={userCategory}
              />
            )}
          </div>
        </div>
      )}
    </>
  );

}
