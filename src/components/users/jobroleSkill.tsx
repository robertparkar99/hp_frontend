"use client";

import React, { useState } from "react";
<<<<<<< HEAD
import JobNew from "./jobroleNew";
const JobRoleSkills: React.FC = () => {
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Add hover state
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("Job role Skills");
=======
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
>>>>>>> dfc81c2bc47b6ec93b41493f44a6c144a95fa2fd

interface UserJobroleSkillsProps {
    userJobroleSkills: Skill[];
}

<<<<<<< HEAD
    const skills = [
        { name: "Continuous Improvement Management", level: 4 },
        { name: "Data Analytics and Computational Modelling", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        {
            name: "Information Technology Application Support and Monitoring",
            level: "Level 4",
        },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
        { name: "Business Environment Analysis", level: 4 },
    ];

    return (
        <>
            {showDetails ? (
                <JobNew onBack={() => setShowDetails(false)} />
            ) : skills.length > 0 ? (
                <div className="honeycomb-container">
                    {skills.map((skill, index) => (
                        <div
                            className={`hexagon-wrapper ${hoveredSkill === skill.name ? 'hexagon-hover' : ''}`}
                            key={index}
                            onClick={() => {
                                setSelectedSkill(skill.name);
                                setShowDetails(true);
                            }}
                            onMouseEnter={() => setHoveredSkill(skill.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                        >

                            <div className="hexagon-inner">
                                <div className="hexagon-content">
                                    <span className="right mdi mdi-open-in-new hexagon-icon"></span>
                                    <p className="hexagon-title">
                                        {skill.name.length > 50 ? `${skill.name.slice(0, 50)}...` : skill.name}
                                    </p>

                                    <p className="hexagon-level">Level {skill.level}</p>
=======
const JobRoleSkills: React.FC<UserJobroleSkillsProps> = ({ userJobroleSkills }) => {
    const [activeSkill, setActiveSkill] = useState("");
    const [skillArray, setSkillArray] = useState<Skill[]>(userJobroleSkills);
    console.log('userJobroleSkills', userJobroleSkills);

    return (
        <>
            {activeSkill != '' ? 
            (
                <JobroleNew userJobroleSkills={userJobroleSkills} activeSkill={activeSkill}/>
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
>>>>>>> dfc81c2bc47b6ec93b41493f44a6c144a95fa2fd
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