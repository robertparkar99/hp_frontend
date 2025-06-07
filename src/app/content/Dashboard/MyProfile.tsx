"use client";
import React, { useEffect } from "react";
import { Pencil } from "lucide-react";
// Removed unused imports

// Example content of addOrgDetails.tsx
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
      return ( <div>
          <div className="self-stretch h-[250px] relative">
            {/* Profile Card */}
            <div className="w-[450px] h-[200px] left-0 top-0 absolute bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff]/40 flex-col justify-start items-start inline-flex overflow-hidden">
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
                    const menu = "EditProfile";
                    (window as any).__currentMenuItem = menu;
                    window.dispatchEvent(new CustomEvent("menuSelected", { detail: menu }));
                  }}
                >
                  <Pencil className="w-5 h-5 text-white" />
                </button>
              </div>
    
              {/* Profile image */}
              <div className="absolute left-[45px] top-[35px]" style={  { left:"10px" }}>
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
            <div className="w-[40%] h-[200px] pl-[20px] pt-5  left-[470px] top-0 absolute bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(245,161,161,0.45)] border border-[#ffd2d2] justify-end items-center inline-flex overflow-hidden">
              <div className="w-full relative" style={{ height: "-webkit-fill-available" }}>
                <div className="left-[5px] top-0 absolute text-[#393939] text-[24px] font-bold font-inter leading-[30px]">
                  My Certificate
                </div>
                <div className="absolute left-0 top-[44px] w-full h-[1px] bg-[#393939]/20"></div>
              </div>
            </div>
          </div>
    
          {/* Lower section with tasks and skills cards */}
          <div className="self-stretch relative">
            {/* Skills Card */}
            <div className="w-[450px] h-[350px] left-[320px] top-0 absolute bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,165,150,0.45)] border border-[#33afa4] flex-col justify-start items-start p-5 inline-flex">
              <div className="h-11 relative w-full">
                <div className="left-0 top-0 absolute text-[#393939] text-[28px] font-bold font-inter">
                  My SkillS
                </div>
                <div className="absolute left-0 top-[44px] w-full h-[1px] bg-[#393939]/20"></div>
              </div>
    
              {/* Skills chart and legend will be implemented in the next batch */}
              <div className="flex w-full mt-14">
                {/* Placeholder for chart */}
                <div className="w-1/2 flex justify-center items-center relative">
                  <div className="w-[250px] h-[250px] relative">
                    {/* This is a placeholder for the pie chart */}
                    <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                    <div className="absolute inset-0 flex justify-center items-center">
                      <img
                        src="/dashboard/image1.png"
                        alt="Placeholder chart"
                        className="w-[250px] h-[200px]"
                      />
                    </div>
                  </div>
                </div>
    
                {/* Skills legend */}
                <div className="w-1/2 pl-4 space-y-[10px]">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-white"
                        style={{ backgroundColor: skill.color }}
                      ></div>
                      <span className="text-black/70 text-base font-normal font-inter text-sm">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
    
            {/* Task Card */}
            <div className="w-[300px] h-[350px] px-[20px] pt-5 pb-[100px]  absolute bg-white rounded-[15px] shadow-[0px_4px_4px_0px_rgba(255,174,76,0.45)] border border-[#ffd570] justify-center items-center inline-flex overflow-hidden">
              <div className="w-full h-[-webkit-fill-available] relative">
                <div className="left-[4px] top-0 absolute text-[#393939] text-[28px] font-bold font-inter">
                  My Task
                </div>
                <div className="absolute left-0 top-[44px] w-full h-[1px] bg-[#393939]/20"></div>
              </div>
            </div>
          </div>
          </div>
      );
    };
      
export default MyProfile;