"use client";
import React, { useEffect } from "react";
import { Pencil } from "lucide-react";

const MyProfile = () => {
  const skills = [
    { name: "Labor Law Compliance", color: "#8979ff" },
    { name: "Recruitment Strategy", color: "#ff928a" },
    { name: "HRIS Tools (SAP/Workday)", color: "#3bc3de" },
    { name: "DEI Implementation", color: "#ffae4c" },
    { name: "Onboarding Workflow", color: "#527ef0" },
    { name: "Performance Management", color: "#6fd195" },
    { name: "People Analytics", color: "#8c63da" },
  ];

  useEffect(() => {
    (window as any).__currentMainMenu = "EditProfile";
    window.dispatchEvent(
      new CustomEvent("mainMenuSelected", { detail: "EditProfile" })
    );
  }, []);

  return (
    <div className="w-full p-6">
      {/* Upper section with profile and certificate cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Profile Card */}
        <div className="w-full md:w-[450px] h-[200px] bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff]/40 relative">
          {/* Header with name and edit button */}
          <div className="w-full h-[90px] relative bg-[#47a0ff]">
            <div className="left-[130px] top-[20px] absolute text-white text-[28px] font-bold font-poppins leading-[30px]">
              Devanshi Modi
            </div>
            <div className="left-[130px] top-[60px] absolute text-[#686868] text-sm font-medium font-poppins leading-[30px]">
              Designation: Employee
            </div>
            <div className="left-[300px] top-[60px] absolute text-[#686868] text-xs font-medium font-poppins leading-[30px]">
              Department: HR
            </div>
            <button
              className="absolute right-4 top-4 w-[30px] h-[30px] p-[2.50px] bg-white/10 rounded-full flex justify-center items-center"
              aria-label="EditProfile"
              onClick={() => {
                const menu = "Dashboard/EditProfile.tsx";
                 (window as any).__currentMenuItem = menu;
      window.dispatchEvent(new CustomEvent("menuSelected", { detail: { menu: menu, pageType: 'page', access: menu } }));
              }}
            >
              <Pencil className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Profile image */}
          <div className="absolute left-[45px] top-[35px]">
            <img
              src="https://storage.googleapis.com/tempo-public-images/figma-exports%2Fgithub%7C113496956-1745910157090-node-332%3A345-1745910158152.png"
              alt="Profile picture of Devanshi Modi"
              className="w-[80px] h-[80px] rounded-full border-2 border-white"
            />
          </div>

          {/* Contact information */}
          <div className="absolute left-[30px] top-[130px] text-[#686868] text-sm font-normal font-poppins leading-[30px]">
            Email ID: 123456789123@gmail.com
          </div>
          <div className="absolute left-[30px] top-[150px] text-[#686868] text-sm font-normal font-poppins leading-[30px]">
            Phone Number: 1234567891    
          </div>
          <div className="absolute left-[230px] top-[150px] text-[#686868] text-xs font-normal font-poppins leading-[30px]">
            Employment Type: Full-Time
          </div>
        </div>

        {/* Certificate Card */}
        <div className="w-full md:w-[40%] h-[200px] p-5 bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(245,161,161,0.45)] border border-[#ffd2d2]">
          <div className="w-full h-full relative">
            <div className="text-[#393939] text-[24px] font-bold font-inter leading-[30px]">
              My Certificate
            </div>
            <div className="w-full h-[1px] bg-[#393939]/20 mt-2 mb-4"></div>
            {/* Certificate content would go here */}
          </div>
        </div>
      </div>

      {/* Lower section with tasks and skills cards */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Task Card */}
        <div className="w-full md:w-[300px] h-[350px] p-5 bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(255,174,76,0.45)] border border-[#ffd570]">
          <div className="w-full h-full relative">
            <div className="text-[#393939] text-[28px] font-bold font-inter">
              My Task
            </div>
            <div className="w-full h-[1px] bg-[#393939]/20 mt-2 mb-4"></div>
            {/* Task content would go here */}
          </div>
        </div>

        {/* Skills Card */}
        <div className="flex-grow h-[350px] p-5 bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,165,150,0.45)] border border-[#33afa4]">
          <div className="h-11 relative w-full">
            <div className="text-[#393939] text-[28px] font-bold font-inter">
              My Skills
            </div>
            <div className="w-full h-[1px] bg-[#393939]/20 mt-2 mb-4"></div>
          </div>

          <div className="flex flex-col md:flex-row w-full mt-4">
            {/* Placeholder for chart */}
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <div className="w-[250px] h-[250px] relative">
                <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img
                    src="/dashboard/image1.png"
                    alt="Skills chart"
                    className="w-[250px] h-[200px]"
                  />
                </div>
              </div>
            </div>

            {/* Skills legend */}
            <div className="w-full md:w-1/2 pl-0 md:pl-4 space-y-[10px] mt-4 md:mt-0">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-white"
                    style={{ backgroundColor: skill.color }}
                  ></div>
                  <span className="text-black/70 text-base font-normal font-inter">
                    {skill.name}
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