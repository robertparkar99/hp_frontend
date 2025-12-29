import React from "react";
import { useState } from "react";
import { BentoGrid, BentoItem } from "./BentoGrid";
import DynamicBentoGrid from "./DynamicBentoGrid";
import DynamicBentoAbillity from "./DynamicBentoAbillity";
const topics = [
    "Coding languages for programming of algorithms and signals",
    "Usage of analytics platforms and tools",
    "Range and application of various statistical methods and algorithms",
    "Range and application of various types of data models",
    "Statistical modelling techniques",
    "Types of statistical analyses, data models, algorithms and advanced computational methods",
    "Data analytics and modelling business",
    "Statistical modelling techniques",
];
const menuItems = Array(11).fill("Data Analytics and Com...");

function ChevronIcon() {
    return (
        <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z"
                fill="#393939"
            />
        </svg>
    );
}

function Sidebar() {
    return (
        <div className="w-full max-w-[351px] bg-[#C8C8C8] rounded-[15px] border-[1.5px] border-[rgba(71,160,255,0.25)] shadow-[0px_0px_6px_1px_rgba(0,0,0,0.25)] h-[370px] xl:h-[914px] overflow-hidden">
            <div className="space-y-px">
                {menuItems.map((item, index) => (
                    <div key={index} className="relative">
                        <div className="w-[20px] h-[44px] bg-[#47A0FF] rounded-r-[6px] absolute -left-[8px] top-[3px]"></div>
                        <div className="bg-white h-[50px] flex items-center">
                            <div className="flex items-center justify-between w-full pl-[40px] pr-[10px]">
                                <span className="text-[#393939] text-lg font-normal truncate">
                                    {item}
                                </span>
                                <ChevronIcon />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
interface Skill {
    ability: any[];
    category: string;
    description: string;
    jobrole: string;
    jobrole_skill_id: number;
    knowledge: any[];
    behaviour: any[];
    attitude: any[];
    proficiency_level: string;
    skill: string;
    skill_id: number;
    sub_category: string;
    title: string;
}
interface JobroleNewProps {
    onBack: () => void;
    knowledge: any[];
    ability: any[];
    behaviour: any[];
    attitude: any[];
    skills: Skill[];
    activeSkillName?: string; // Add this prop
}
export default function Index({ onBack, knowledge, ability, behaviour, attitude, skills, activeSkillName }: JobroleNewProps) {
    // const [selectedSkill, setSelectedSkill] = useState<Skill | null>(activeSkillName ? skills.find(skill => skill.skill === activeSkillName) || null : null);

    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(
        // Find the skill that matches activeSkillName, or default to the first skill
        activeSkillName
            ? skills.find(skill => skill.skill === activeSkillName) || skills[0] || null
            : skills[0] || null
    );

    const hasData = (array: any[]) => {
        return array && array.length > 0;
    };




    return (
        <div className="bg-white">
            {/* Mobile Layout */}
            <div className="xl:hidden">
                <div className="max-w-full mx-auto p-1">
                    {/* Header */}
                    <div className="mb-2">
                        <h1 className="text-[#393939] font-inter text-lg font-bold mb-1">
                            Skill
                            {/* Skill {activeSkillName && `- ${activeSkillName}`} */}
                        </h1>
                        <div className="flex items-center w-full max-w-[200px]">
                            <div className="w-[4px] h-[4px] bg-[#393939] rounded-full"></div>
                            <div className="flex-1 h-[1px] bg-[#393939] ml-1"></div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-2">
                        {/* Sidebar */}
                        <div className="lg:w-[351px] flex-shrink-0">
                            <Sidebar />
                        </div>

                        {/* Content sections */}
                        <div className="flex-1 space-y-2">
                            {/* Knowledge Section */}
                            {hasData(knowledge) && (
                                <div>
                                    <div className="mb-1">
                                        <h2 className="text-[#393939] font-inter text-sm font-bold mb-1">
                                            Knowledge:
                                        </h2>
                                        <div className="w-full h-[1px] bg-[#686868]"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Coding languages for programming of algorithms and signals
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Usage of analytics platforms and tools
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various statistical methods and
                                                algorithms
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various types of data models
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Statistical modelling techniques
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Types of statistical analyses, data models, algorithms and
                                                advanced computational methods
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Data analytics and modelling business use cases
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Ability Section */}
                            {hasData(ability) && (
                                <div>
                                    <div className="mb-1">
                                        <h2 className="text-[#393939] font-inter text-sm font-bold mb-1">
                                            Ability:
                                        </h2>
                                        <div className="w-full h-[1px] bg-[#686868]"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Coding languages for programming of algorithms and signals
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Usage of analytics platforms and tools
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various statistical methods and
                                                algorithms
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various types of data models
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Statistical modelling techniques
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-[#1E8C7A] via-[#0E4037] to-[#082621] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Types of statistical analyses, data models, algorithms and
                                                advanced computational methods
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Data analytics and modelling business use cases
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* behaviour Section */}
                            {hasData(behaviour) && (
                                <div>
                                    <div className="mb-1">
                                        <h2 className="text-[#393939] font-inter text-sm font-bold mb-1">
                                            behaviour:
                                        </h2>
                                        <div className="w-full h-[1px] bg-[#686868]"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Coding languages for programming of algorithms and signals
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Usage of analytics platforms and tools
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various statistical methods and
                                                algorithms
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various types of data models
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Statistical modelling techniques
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-[#1E8C7A] via-[#0E4037] to-[#082621] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Types of statistical analyses, data models, algorithms and
                                                advanced computational methods
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Data analytics and modelling business use cases
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* attitude Section */}
                            {hasData(attitude) && (
                                <div>
                                    <div className="mb-1">
                                        <h2 className="text-[#393939] font-inter text-sm font-bold mb-1">
                                            attitude:
                                        </h2>
                                        <div className="w-full h-[1px] bg-[#686868]"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Coding languages for programming of algorithms and signals
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Usage of analytics platforms and tools
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various statistical methods and
                                                algorithms
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Range and application of various types of data models
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px]">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Statistical modelling techniques
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-[#1E8C7A] via-[#0E4037] to-[#082621] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Types of statistical analyses, data models, algorithms and
                                                advanced computational methods
                                            </p>
                                        </div>
                                        <div className="bg-[#007BE5] rounded-[8px] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-1 h-[40px] col-span-2">
                                            <p className="text-white font-bold text-[9px] text-center leading-tight">
                                                Data analytics and modelling business use cases
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Compact to fit viewport */}
            <div className="hidden xl:block">
                <div className="max-w-screen-xl mx-auto overflow-y-auto hide-scrollbar">
                    <button
                        onClick={onBack}
                        className="mt-6 mb-6 text-blue-500 hover:text-blue-700 hover:cursor-pointer"
                    >
                        ← Back to Skills
                    </button>   

                    <div className="flex gap-4">
                        {/* Sidebar */}
                        <div className="w-[200px] flex-shrink-0">
                            <div className="mb-4">
                                <h1 className="text-[#393939] font-inter text-[24px] font-bold mb-2">
                                    Skill
                                    {/* Skill {activeSkillName && `- ${activeSkillName}`} */}
                                </h1>
                                <div className="flex items-center w-full max-w-[150px]">
                                    <div className="w-[6px] h-[6px] bg-[#393939] rounded-full"></div>
                                    <div className="flex-1 h-[2px] bg-[#393939] ml-2"></div>
                                </div>
                            </div>
                            <div className="bg-[#C8C8C8] rounded-[15px] border-[1.5px] border-[rgba(71,160,255,0.25)] shadow-[0px_0px_6px_1px_rgba(0,0,0,0.25)] h-[calc(76vh-120px)] overflow-hidden">
                                <div className="space-y-px">
                                    {skills.map((skill, index) => {
                                        const isActive = skill.skill === selectedSkill?.skill;
                                        return (
                                            <div key={index} className="relative group" onClick={() => setSelectedSkill(skill)}>
                                                <div className={`w-[12px] h-[32px] ${isActive ? 'bg-[#47A0FF]' : 'bg-transparent'} rounded-r-[4px] absolute -left-[6px] top-[2px] transition-all duration-300 group-hover:w-full group-hover:left-0 group-hover:rounded-none opacity-100 group-hover:opacity-0 group-hover:delay-[0ms]`}></div>
                                                <div className={`h-[36px] flex items-center transition-all duration-300 ${isActive
                                                    ? 'bg-[#47A0FF] text-white'
                                                    : 'bg-white group-hover:bg-[#47A0FF] group-hover:text-white'
                                                    }`}>
                                                    <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
                                                        <span className={`text-[12px] truncate ${isActive ? 'text-white' : 'text-[#393939]'} group-hover:text-white transition-colors duration-300`} style={{
                                                            fontFamily: 'Inter, sans-serif',
                                                        }}>
                                                            {skill.skill.length > 20 ? `${skill.skill.slice(0, 20)}...` : skill.skill}
                                                        </span>
                                                        <svg
                                                            width="16"
                                                            height="17"
                                                            viewBox="0 0 24 25"
                                                            fill="none"
                                                            className={`group-hover:fill-white transition-colors duration-300 ${isActive ? 'fill-white' : 'fill-[#393939]'}`}
                                                        >
                                                            <path
                                                                d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z"
                                                                fill="currentColor"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {/* {skills.map((skill, index) => (
                                        
                                        <div key={index} className="relative group" onClick={() => setSelectedSkill(skill)}>
                                            <div className="w-[12px] h-[32px] bg-[#47A0FF] rounded-r-[4px] absolute -left-[6px] top-[2px] transition-all duration-300 group-hover:w-full group-hover:left-0 group-hover:rounded-none opacity-100 group-hover:opacity-0 group-hover:delay-[0ms]"></div>
                                            <div className={`h-[36px] flex items-center transition-all duration-300 ${skill === selectedSkill
                                                ? 'bg-[#47A0FF] text-white'
                                                : 'bg-white group-hover:bg-[#47A0FF] group-hover:text-white'
                                                }`}>
                                                <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
                                                    <span className={`text-[12px] truncate group-hover:text-white transition-colors duration-300${skill === selectedSkill
                                                        ? 'text-white'
                                                        : 'text-[#393939]'}`} style={{
                                                            fontFamily: 'Inter, sans-serif',
                                                        }}>
                                                        {skill.skill.length > 20 ? `${skill.skill.slice(0, 20)}...` : skill.skill}
                                                    </span>
                                                    <svg
                                                        width="16"
                                                        height="17"
                                                        viewBox="0 0 24 25"
                                                        fill="none"
                                                        className="group-hover:fill-white transition-colors duration-300"
                                                    >
                                                        <path
                                                            d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z"
                                                            fill="#393939"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))} */}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                            {/* Knowledge Section */}
                            {hasData(selectedSkill?.knowledge || knowledge) && (
                                <div >
                                    <div className="w-full flex items-center justify-between mb-3">
                                        <div className="w-full">
                                            <h2 className="text-[#393939] font-inter text-[18px] font-bold mb-1">
                                                Knowledge:
                                            </h2>
                                            <div className="w-full h-[3px] bg-[#686868]"></div>
                                        </div>
                                        {/* <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/96c5e570547156dbec01c64c2b33e42ed2609d23?width=161"
                                        alt=""
                                        className="w-[50px] h-[47px]"
                                    /> */}
                                    </div>

                                    {/* <div className="h-[280px] w-full pt-2">
                                    <BentoGrid>
                                        <BentoItem>Coding languages for programming of algorithms and signals</BentoItem>
                                        <BentoItem>Usage of analytics platforms and tools</BentoItem>
                                        <BentoItem>Range and application of various statistical methods and algorithms</BentoItem>
                                        <BentoItem>Range and application of various types of data models</BentoItem>
                                        <BentoItem>Statistical modelling techniques</BentoItem>
                                        <BentoItem>
                                            Types of statistical analyses, data models, algorithms and advanced computational methods
                                        </BentoItem>
                                        <BentoItem>Data analytics and modelling business use cases</BentoItem>
                                    </BentoGrid>
                                </div> */}
                                    <DynamicBentoGrid items={selectedSkill?.knowledge || knowledge} />

                                </div >
                            )}
                            {/* Ability Section */}
                            {hasData(selectedSkill?.ability || ability) && (
                                <div >
                                    <div className="w-full flex items-center justify-between mb-3">
                                        <div className="w-full">
                                            <h2 className="text-[#393939] font-inter text-[18px] font-bold mb-1">
                                                Ability:
                                            </h2>
                                            <div className="w-full h-[3px] bg-[#686868]"></div>
                                        </div>
                                        {/* <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/9244e2a21aa3673a48797299453c941622eefb86?width=200"
                                        alt=""
                                        className="w-[60px] h-[34px]"
                                    /> */}
                                    </div>
                                    <DynamicBentoAbillity items={selectedSkill?.ability || ability} />
                                </div>
                            )}
                            {/* behaviour Section */}
                            {hasData(selectedSkill?.behaviour || behaviour) && (
                                <div>
                                    <div className="w-full flex items-center justify-between mb-3">
                                        <div className="w-full">
                                            <h2 className="text-[#393939] font-inter text-[18px] font-bold mb-1">
                                                Behaviour:
                                            </h2>
                                            <div className="w-full h-[3px] bg-[#686868]"></div>
                                        </div>
                                        {/* <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/96c5e570547156dbec01c64c2b33e42ed2609d23?width=161"
                                        alt=""
                                        className="w-[50px] h-[47px]"
                                    /> */}
                                    </div>

                                    {/* <div className="h-[280px] w-full pt-2">
                                    <BentoGrid>
                                        <BentoItem>Coding languages for programming of algorithms and signals</BentoItem>
                                        <BentoItem>Usage of analytics platforms and tools</BentoItem>
                                        <BentoItem>Range and application of various statistical methods and algorithms</BentoItem>
                                        <BentoItem>Range and application of various types of data models</BentoItem>
                                        <BentoItem>Statistical modelling techniques</BentoItem>
                                        <BentoItem>
                                            Types of statistical analyses, data models, algorithms and advanced computational methods
                                        </BentoItem>
                                        <BentoItem>Data analytics and modelling business use cases</BentoItem>
                                    </BentoGrid>
                                </div> */}
                                    <DynamicBentoGrid items={selectedSkill?.behaviour || behaviour} />

                                </div>
                            )}
                            {/* attitude Section */}
                            {hasData(selectedSkill?.attitude || attitude) && (
                                <div >
                                    <div className="w-full flex items-center justify-between mb-3">
                                        <div className="w-full">
                                            <h2 className="text-[#393939] font-inter text-[18px] font-bold mb-1">
                                                Attitude:
                                            </h2>
                                            <div className="w-full h-[3px] bg-[#686868]"></div>
                                        </div>
                                        {/* <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/96c5e570547156dbec01c64c2b33e42ed2609d23?width=161"
                                        alt=""
                                        className="w-[50px] h-[47px]"
                                    /> */}
                                    </div>

                                    {/* <div className="h-[280px] w-full pt-2">
                                    <BentoGrid>
                                        <BentoItem>Coding languages for programming of algorithms and signals</BentoItem>
                                        <BentoItem>Usage of analytics platforms and tools</BentoItem>
                                        <BentoItem>Range and application of various statistical methods and algorithms</BentoItem>
                                        <BentoItem>Range and application of various types of data models</BentoItem>
                                        <BentoItem>Statistical modelling techniques</BentoItem>
                                        <BentoItem>
                                            Types of statistical analyses, data models, algorithms and advanced computational methods
                                        </BentoItem>
                                        <BentoItem>Data analytics and modelling business use cases</BentoItem>
                                    </BentoGrid>
                                </div> */}
                                    <DynamicBentoGrid items={selectedSkill?.attitude || attitude} />

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
// // First install the bento grid library
// import { BentoGrid, BentoGridItem } from 'react-bento-grid';

// <div className="h-[280px] w-full">
//     <BentoGrid
//         cols={4}
//         rows={3}
//         gap={12}
//         autoRows={true}
//         className="h-full w-full"
//     >
//         {[
//             {
//                 title: 'Coding languages',
//                 description: 'Programming of algorithms and signals',
//                 className: 'bg-[#007BE5] rounded-[12px]',
//                 span: 1
//             },
//             {
//                 title: 'Analytics platforms',
//                 description: 'Usage of analytics tools',
//                 className: 'bg-[#007BE5] rounded-[12px] row-span-2',
//                 span: 1
//             },
//             // Add all other items with appropriate span configurations
//         ].map((item, i) => (
//             <BentoGridItem
//                 key={i}
//                 title={item.title}
//                 description={item.description}
//                 header={null}
//                 className={item.className}
//                 colSpan={item.span}
//                 rowSpan={item.span}
//             >
//                 <p className="text-white font-bold text-[11px] text-center p-3">
//                     {item.description}
//                 </p>
//             </BentoGridItem>
//         ))}
//     </BentoGrid>
// </div>



