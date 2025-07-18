import React from "react";

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
    proficiency_level: string;
    skill: string;
    skill_id: number;
    sub_category: string;
    title: string;
}

interface UserJobroleSkillsProps {
    userJobroleSkills: Skill[];
    activeSkill : string;
}
export default function Index({ userJobroleSkills, activeSkill }: UserJobroleSkillsProps) {
    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Layout */}
            <div className="xl:hidden">
                <div className="max-w-full mx-auto p-1">
                    {/* Header */}
                    <div className="mb-2">
                        <h1 className="text-[#393939] font-inter text-lg font-bold mb-1">
                            Skill
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

                            {/* Ability Section */}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Compact to fit viewport */}
            <div className="hidden xl:block">
                <div className="max-w-screen-xl mx-auto p-4 h-screen overflow-y-auto hide-scrollbar">
                    <div className="flex gap-4 h-full">
                        {/* Sidebar */}
                        <div className="w-[200px] flex-shrink-0">
                            <div className="mb-4">
                                <h1 className="text-[#393939] font-inter text-[24px] font-bold mb-2">
                                    Skill
                                </h1>
                                <div className="flex items-center w-full max-w-[150px]">
                                    <div className="w-[6px] h-[6px] bg-[#393939] rounded-full"></div>
                                    <div className="flex-1 h-[2px] bg-[#393939] ml-2"></div>
                                </div>
                            </div>
                            <div className="bg-[#C8C8C8] rounded-[15px] border-[1.5px] border-[rgba(71,160,255,0.25)] shadow-[0px_0px_6px_1px_rgba(0,0,0,0.25)] h-[calc(76vh-120px)] overflow-hidden">
                                <div className="space-y-px">
                                    {menuItems.map((item, index) => (
                                        <div key={index} className="relative">
                                            <div className="w-[12px] h-[32px] bg-[#47A0FF] rounded-r-[4px] absolute -left-[6px] top-[2px]"></div>
                                            <div className="bg-white h-[36px] flex items-center">
                                                <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
                                                    <span className="text-[#393939] text-[12px] font-normal truncate">
                                                        {item}
                                                    </span>
                                                    <svg
                                                        width="16"
                                                        height="17"
                                                        viewBox="0 0 24 25"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z"
                                                            fill="#393939"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                            {/* Knowledge Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="text-[#393939] font-inter text-[18px] font-bold mb-1">
                                            Knowledge:
                                        </h2>
                                        <div className="w-[125vh] h-[3px] bg-[#686868]"></div>
                                    </div>
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/96c5e570547156dbec01c64c2b33e42ed2609d23?width=161"
                                        alt=""
                                        className="w-[50px] h-[47px]"
                                    />
                                </div>

                                {/* Knowledge Bento Grid */}
                                <div className="grid grid-cols-4 gap-3 h-[280px]">
                                    {/* Box 1 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-3">
                                        <p className="text-white font-bold text-[11px] text-center leading-tight">
                                            Coding languages for programming of algorithms and signals
                                        </p>
                                    </div>

                                    {/* Box 2 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 row-span-2">
                                        <p className="text-white font-bold text-[11px] text-center leading-tight">
                                            Usage of analytics platforms and tools
                                        </p>
                                    </div>

                                    {/* Box 3 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 col-span-2 row-span-2">
                                        <p className="text-white font-bold text-[11px] text-center leading-tight">
                                            Range and application of various statistical methods and
                                            algorithms
                                        </p>
                                    </div>

                                    {/* Box 4 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 row-span-3">
                                        <p className="text-white font-bold text-[11px] text-center leading-tight">
                                            Range and application of various types of data models
                                        </p>
                                    </div>

                                    {/* Box 5 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 row-span-2">
                                        <p className="text-white font-bold text-[11px] text-center leading-tight">
                                            Statistical modelling techniques
                                        </p>
                                    </div>

                                    {/* Box 6 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-3 col-span-3">
                                        <p className="text-white font-bold text-[11px] text-center leading-tight">
                                            Types of statistical analyses, data models, algorithms and
                                            advanced computational methods
                                        </p>
                                    </div>

                                    {/* Box 7 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-3 col-span-2">
                                        <p className="text-white font-bold text-[11px] text-center leading-tight">
                                            Data analytics and modelling business use cases
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ability Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="text-[#393939] font-inter text-[18px] font-bold mb-1">
                                            Ability:
                                        </h2>
                                        <div className="w-[125vh] h-[3px] bg-[#686868]"></div>
                                    </div>
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/9244e2a21aa3673a48797299453c941622eefb86?width=200"
                                        alt=""
                                        className="w-[60px] h-[34px]"
                                    />
                                </div>

                                {/* Ability Bento Grid */}
                                <div className="grid grid-cols-4 gap-3 h-[280px]">
                                    {/* Box 1 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-3">
                                        <p className="text-white font-bold text-[10px] text-center leading-tight">
                                            Coding languages for programming of algorithms and signals
                                        </p>
                                    </div>

                                    {/* Box 2 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 row-span-2">
                                        <p className="text-white font-bold text-[10px] text-center leading-tight">
                                            Usage of analytics platforms and tools
                                        </p>
                                    </div>

                                    {/* Box 3 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 col-span-2 row-span-2">
                                        <p className="text-white font-bold text-[10px] text-center leading-tight">
                                            Range and application of various statistical methods and
                                            algorithms
                                        </p>
                                    </div>

                                    {/* Box 4 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 row-span-3">
                                        <p className="text-white font-bold text-[10px] text-center leading-tight">
                                            Range and application of various types of data models
                                        </p>
                                    </div>

                                    {/* Box 5 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-end justify-center p-3 row-span-2">
                                        <p className="text-white font-bold text-[10px] text-center leading-tight">
                                            Statistical modelling techniques
                                        </p>
                                    </div>

                                    {/* Box 6 - Special gradient background */}
                                    {/* bg-gradient-to-r from-[#1E8C7A] */}
                                    <div className=" bg-[#007BE5] via-[#0E4037] to-[#082621] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-3 col-span-3">
                                        <p className="text-white font-bold text-[10px] text-center leading-tight">
                                            Types of statistical analyses, data models, algorithms and
                                            advanced computational methods
                                        </p>
                                    </div>

                                    {/* Box 7 */}
                                    <div className="bg-[#007BE5] rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] flex items-center justify-center p-3 col-span-2">
                                        <p className="text-white font-bold text-[10px] text-center leading-tight">
                                            Data analytics and modelling business use cases
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
