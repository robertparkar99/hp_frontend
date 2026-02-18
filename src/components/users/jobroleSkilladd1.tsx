// old skill rating file
import React, { useState } from 'react';

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

interface JobroleSkilladd1Props {
    skills: Skill[];
}

export default function Index({ skills }: JobroleSkilladd1Props) {
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(skills.length > 0 ? skills[0] : null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedImage, setSelectedImage] = useState('/image 16.png');
    const [opacity, setOpacity] = useState(1);
    
    const handleValidation = (type: 'knowledge' | 'ability', index: number, isValid: boolean) => {
        // Update validation logic here
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };
    
    const handleValidationNew = (isValid: boolean) => {
        setOpacity(0);
        setTimeout(() => {
            setSelectedImage(isValid ? '/Illustration.png' : '/image 16.png');
            setOpacity(1);
        }, 300);
    };
    
    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
                        {/* Left Panel */}
                        <div className="w-full xl:w-[280px] bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-2">
                            <h2 className="text-[#23395B] font-bold text-md mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                                📈 Skill Proficiency Overview
                            </h2>
                            <div className="w-full h-0.5 bg-[#686868] mb-8"></div>

                            <div className="h-[calc(86vh-0px)] overflow-y-auto hide-scrollbar">
                                {skills.map((skill, index) => (
                                    <div key={index} className="relative group" onClick={() => setSelectedSkill(skill)}>
                                        <div className="w-[12px] h-[32px] bg-[#47A0FF] rounded-r-[4px] absolute -left-[6px] top-[2px] transition-all duration-300 group-hover:w-full group-hover:left-0 group-hover:rounded-none opacity-100 group-hover:opacity-0 group-hover:delay-[0ms]"></div>
                                        <div className={`h-[36px] flex items-center transition-all duration-300 ${skill === selectedSkill
                                            ? 'bg-[#47A0FF] text-white'
                                            : 'bg-white group-hover:bg-[#47A0FF] group-hover:text-white'
                                            } mb-1`}>
                                            <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
                                                <span className={` text-[12px] truncate group-hover:text-white transition-colors duration-300 ${skill === selectedSkill
                                                    ? 'text-white'
                                                    : 'text-[#393939]'}`} style={{
                                                        fontFamily: 'Inter, sans-serif',
                                                    }}>
                                                    {skill.skill.length > 20 ? `${skill.skill.slice(0, 20)}...` : skill.skill}
                                                </span>
                                                <svg width="16" height="17" viewBox="0 0 24 25" fill="none" className="group-hover:fill-white transition-colors duration-300">
                                                    <path d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z" fill="#393939" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Center Panel */}
                        <div className="flex-1 min-h-[472px] flex flex-col justify-between">
                            <div className="bg-white rounded-2xl p-4 shadow-sm">
                                <h1 className="text-[#393939] font-bold text-xl md:text-[14px] text-center mb-12 leading-tight"
                                    style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Are you proficient in {selectedSkill?.skill || 'this skill'}?
                                </h1>
                                {/* Illustration */}
                                <div className="flex justify-center mb-12">
                                    <div className="w-80 h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center relative overflow-hidden">
                                        {/* Karate person illustration using SVG */}
                                        <img
                                            src={selectedImage}
                                            alt="Validation Illustration"
                                            className="w-full h-full object-cover transition-opacity duration-300"
                                            style={{ opacity: opacity }}
                                        />
                                    </div>
                                </div>

                                {/* Yes/No Buttons */}
                                <div className="flex justify-center gap-12">
                                    <button className="w-20 h-10 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                                        onClick={() => handleValidationNew(true)}>
                                        <span className="text-[#C1C1C1] font-bold text-xl" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>Yes</span>
                                    </button>
                                    <button className="w-20 h-10 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                                        onClick={() => handleValidationNew(false)}>
                                        <span className="text-[#C1C1C1] font-bold text-xl" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>No</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel */}
                        {selectedSkill && (
                            <div className="w-full xl:w-[280px] bg-white rounded-l-2xl xl:rounded-l-none xl:rounded-r-2xl border-l-4 border-[#47A0FF] shadow-sm relative">
                                {/* Blue accent bar */}
                                <div className="absolute left-0 top-0 w-4 h-full bg-[#47A0FF] rounded-l-2xl xl:rounded-l-none"></div>

                                <div className="pl-8 pr-4 py-4">
                                    <h3 className="text-sm font-bold mb-4">{selectedSkill.skill} Validation</h3>

                                    <div className="space-y-6">
                                        <h4 className="font-semibold mb-2">Knowledge:</h4>
                                        <div className="h-[calc(38vh-0px)] overflow-y-auto hide-scrollbar">
                                            {selectedSkill.knowledge.map((item, index) => (
                                                <div key={index} className="bg-blue-100 p-2 rounded mb-2">
                                                    <p className="text-sm">{item}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleValidation('knowledge', index, true)}
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => handleValidation('knowledge', index, false)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <h4 className="font-semibold mb-2">Ability:</h4>
                                        <div className="h-[calc(38vh-0px)] overflow-y-auto hide-scrollbar">
                                            {selectedSkill.ability.map((item, index) => (
                                                <div key={index} className="bg-blue-100 p-2 rounded mb-2">
                                                    <p className="text-sm">{item}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleValidation('ability', index, true)}
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            onClick={() => handleValidation('ability', index, false)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {showSuccess && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                            Skill updated successfully!
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}