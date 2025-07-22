"use client";

import React, { useState } from "react";
import JobroleNew from './jobroleNew';

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
}

const JobRoleSkills: React.FC<UserJobroleSkillsProps> = ({ userJobroleSkills }) => {
    const [activeSkill, setActiveSkill] = useState("");
    const [skillArray, setSkillArray] = useState<Skill[]>(userJobroleSkills);
    console.log('userJobroleSkills', userJobroleSkills);

    return (
        <>
            {activeSkill != '' ?
                (
                    <JobroleNew onBack={() => setActiveSkill("")} />
                )
                : (

                    skillArray.length > 0 ? (
                        <div className="honeycomb-container pb-8">
                            {skillArray.map((skill, index) => (
                                <div className="hexagon-wrapper" key={index}>
                                    <div className="hexagon-inner">
                                        <div className="hexagon-content">
                                            <span className="right mdi mdi-open-in-new hexagon-icon" onClick={() => setActiveSkill(skill.skill)}></span>
                                            <p className="hexagon-title">
                                                {skill.skill.length > 50 ? `${skill.skill.slice(0, 50)}...` : skill.skill}
                                            </p>
                                            <p className="hexagon-level">Level {skill.proficiency_level}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No skills found.</p>
                    )

                )}

        </>
    );
};

export default JobRoleSkills;