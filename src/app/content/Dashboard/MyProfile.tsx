"use client";
import React from "react";
import { useEffect, useState } from "react";
import DonutChart from '@/components/utils/donutChart';

interface MyProfileProps {
  employeeId?: number;
}
const MyProfile: React.FC<MyProfileProps> = ({ employeeId }) => {
  const [userDetails, setUserDetails] = useState<any>();
  const [certificateData, setCertificateData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [taskData, setTaskData] = useState<any[]>([]);
  const [empId, setEmpId] = useState<number>(0);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    syear: "",
  });

  const skills = [
    { name: "Labor Law Compliance", color: "#8979ff" },
    { name: "Recruitment Strategy", color: "#ff928a" },
    { name: "HRIS Tools (SAP/Workday)", color: "#3bc3de" },
    { name: "DEI Implementation", color: "#ffae4c" },
    { name: "Onboarding Workflow", color: "#527ef0" },
    { name: "Performance Management", color: "#6fd195" },
    { name: "People Analytics", color: "#8c63da" },
  ];

  const listColors = [
    "#8979ff",
    "#ff928a",
    "#3bc3de",
    "#ffae4c",
    "#527ef0",
    "#6fd195",
    "#8c63da",
  ];

  useEffect(() => {
    (window as any).__currentMainMenu = "EditProfile";
    window.dispatchEvent(
      new CustomEvent("mainMenuSelected", { detail: "EditProfile" })
    );
  }, []);

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
    const effectiveEmployeeId = Number(employeeId ?? sessionData?.userId ?? 0);
    setEmpId(effectiveEmployeeId);

    // Only run when sessionData is updated with url and token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, sessionData.url, sessionData.token]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/user/add_user/${sessionData.userId}/edit?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&syear=${sessionData.syear}`
      );
      const data = await res.json();
      // console.log(data);
      setUserDetails(data.data || null);
      setCertificateData(data.documentLists || []);
      setSkillData(data.jobroleSkills || []);
      setTaskData(data.jobroleTasks || []);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };


  return (
    <div className="w-full p-6">
      {/* Upper section with profile and certificate cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Profile Card */}
        <div className="h-[280px] md:w-[620px] bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff]/40 relative">
          <div className="titleDiv flex bg-[#47a0ff] px-4 rounded-t-[15px] h-[calc(var(--spacing) * 20]">
            <div className="empImg w-[fit-content]" style={{
              transform: "translate(10px, 30px)",
            }}>
              {userDetails && userDetails.image && userDetails.image !== '' ? (
                <img
                  src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/` + userDetails.image}
                  alt="Profile picture"
                  className="w-[100px] h-[100px] bg-white rounded-full border-1 border-[#ddd] shadow-lg shadow-blue-500/50"
                />
              ) : (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
                  alt="Profile picture"
                  className="w-[100px] h-[100px] bg-white rounded-full border-1 border-[#ddd] shadow-lg shadow-blue-500/50"
                />
              )}
            </div>
            <div className="empName pl-10 mt-4">
              <h2 className="text-white text-2xl font-bold">{userDetails?.first_name} {userDetails?.last_name}</h2>
              <div className="lg:flex md:block sm:block mt-2">
                <p className="mr-2 text-[#686868]">{userDetails?.userJobrole}</p>
              </div>
            </div>

            <div className="editButton">
              <button
                className="absolute right-4 top-4 w-[30px] h-[30px] p-[2.50px] rounded-full flex justify-center items-center"
                aria-label="EditProfile"
                onClick={() => {
                  const menu = "Dashboard/EditProfile.tsx";
                  (window as any).__currentMenuItem = menu;
                  window.dispatchEvent(new CustomEvent("menuSelected", { detail: { menu: menu, pageType: 'page', access: menu } }));
                }}
              >
                <span className="mdi mdi-pencil text-3xl"></span>
              </button>
            </div>
          </div>
          <div className="w-[fit-content] text-[#686868] mx-4 pb-4 mt-10 font-normal font-poppins rounded-full flex">
           <span className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full shadow-sm">
                  <span className="fa fa-envelope text-blue-600 text-lg"></span>
                </span>
                <span className="text-gray-700 font-medium text-sm bg-blue-50 px-2 py-1 rounded-md" style={{whiteSpace:"nowrap"}}>
                  Email ID: <span className="text-gray-900">
                    {userDetails?.email}
                  </span>
                </span>

          </div>
          <div className="detailDiv lg:flex md:block sm:block pb-6 gap-8">
            {/* Left Data Column */}
            <div className="leftData pl-4 space-y-4">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full shadow-sm">
                  <span className="fa fa-phone text-blue-600 text-lg"></span>
                </span>
                <span className="text-gray-700 font-medium text-sm bg-blue-50 px-2 py-1 rounded-md" style={{whiteSpace:"nowrap"}}>
                  Phone No.: <span className="text-gray-900">{userDetails?.mobile || 'Not provided'}</span>
                </span>
              </div>

              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full shadow-sm">
                  <span className="fa fa-calendar text-blue-600 text-lg"></span>
                </span>
                <span className="text-gray-700 font-medium text-sm bg-blue-50 px-2 py-1 rounded-md" style={{whiteSpace:"nowrap"}}>
                  Date of Birth: <span className="text-gray-900">
                    {userDetails?.birthdate
                      ? new Date(userDetails.birthdate).toLocaleDateString("en-GB")
                      : 'Not provided'}
                  </span>
                </span>
              </div>
            </div>

            {/* Right Data Column */}
            <div className="rightData pl-2 space-y-4">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full shadow-sm">
                  <span className="fa fa-building text-blue-600 text-lg"></span>
                </span>
                <span className="text-gray-700 font-medium text-sm bg-blue-50 px-2 py-1 rounded-md" style={{whiteSpace:"nowrap"}}>
                  Department: <span className="text-gray-900">{userDetails?.userDepartment || 'Not provided'}</span>
                </span>
              </div>

              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full shadow-sm">
                  <span className="fa fa-map-marker text-blue-600 text-lg"></span>
                </span>
                <span className="text-gray-700 font-medium text-sm bg-blue-50 px-2 py-1 rounded-md" style={{whiteSpace:"nowrap"}}>
                  Address: <span className="text-gray-900">
                    {[userDetails?.city, userDetails?.gujarat].filter(Boolean).join(', ') || 'Not provided'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="w-full h-[280px] md:w-[40%] bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(245,161,161,0.45)] border border-[#ffd2d2]">
          <div className="w-full relative">
            <div className="bg-[#ffd2d2] rounded-t-[15px] p-5 text-[#393939] text-[24px] font-bold font-inter leading-[30px]">
             <span className="mdi mdi-certificate-outline"></span> My Certificate
            </div>
            {/* Certificate content would go here */}
            <div className="certicateDiv  p-5 h-[200px] overflow-scroll hide-scroll">
              {certificateData && certificateData.length > 0 ? (
                certificateData.map((val, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-white mr-2"
                      style={{ backgroundColor: listColors[index % listColors.length] }}
                    ></div>
                    <div className="text-[#686868] text-[15px] font-normal font-poppins leading-[24px]" data-title={val.document_title}>
                      <a href={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_staff_document/` + val.file_name} target="_blank">
                        {val.document_title
                          ? val.document_title.length > 30
                            ? (
                              <>
                                {val.document_title.slice(0, 30)}...
                              </>
                            )
                            : val.document_title
                          : "Certificate"}</a>
                    </div>
                  </div>

                ))
              ) : (
                <p> No Certificates Found </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower section with tasks and skills cards */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Task Card */}
        <div className="w-full md:w-[300px] h-[350px] bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(255,174,76,0.45)] border border-[#ffd570]">
          <div className="w-full h-full relative">
            <div className="bg-[#ffd570] rounded-t-[15px]  px-5 py-3 text-[#393939] text-[24px] font-bold font-inter">
              <span className="mdi mdi-format-list-checks"></span> My Task
            </div>
            {/* Task content would go here */}
            <div className="taslDiv  px-5 py-3 h-[180px] overflow-scroll hide-scroll">
              {taskData && taskData.length > 0 ? (
                taskData.map((val, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-white mr-2"
                      style={{ backgroundColor: listColors[index % listColors.length] }}
                    ></div>
                    <div className="text-[#686868] text-[15px] font-normal font-poppins leading-[24px]" data-small={val.task}>
                      {val.task
                        ? val.task.length > 30
                          ? (
                            <>
                              {val.task.slice(0, 30)}...
                            </>
                          )
                          : val.task
                        : "Task"}
                    </div>
                  </div>

                ))
              ) : (
                <p> No jobrole Mapped with Tasks </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Card */}
        <div className="flex-grow h-[350px] bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,165,150,0.45)] border border-[#33afa4]">
          <div className="relative w-full bg-[#33afa4] rounded-t-[15px] px-5 py-3">
            <div className="text-[#393939] text-[24px] font-bold font-inter">
              <span className="mdi mdi-lightbulb-on-outline"></span> My Skills
            </div>
          </div>

          <div className="flex flex-col px-5 py-4 md:flex-row w-full ">
            {/* Placeholder for chart */}
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <div className="w-[250px] h-[250px] relative">
                <div className="absolute inset-0 rounded-full bg-gray-100">
                  <div className="absolute inset-0 flex justify-center items-center">
                    <main className="flex items-center justify-center">
                      <DonutChart />
                    </main>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills legend */}
            <div className="w-full md:w-1/2 pl-0 md:pl-4 space-y-[10px] mt-4 md:mt-0">
              {skillData.map((skill, index) => (
                <div key={index} className="flex items-center gap-2" data-titleHead={skill.skill}>
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-white"
                    style={{ backgroundColor: listColors[index % listColors.length] }}
                  ></div>
                  <span className="text-black/70 text-base font-normal font-inter">
                    {skill.skill
                      ? skill.skill.length > 30
                        ? (
                          <>
                            {skill.skill.slice(0, 30)}...
                          </>
                        )
                        : skill.skill
                      : "Skill"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;