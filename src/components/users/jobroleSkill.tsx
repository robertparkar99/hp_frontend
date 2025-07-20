"use client";

import React, { useState } from "react";
import JobNew from "./jobroleNew";
const JobRoleSkills: React.FC = () => {
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Add hover state
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("Job role Skills");

    const tabs = [
        "Personal Details",
        "Upload Document",
        "Job role Skills",
        "Job role Task",
        "level of Responsibility",
        "Skill Rating",
    ];

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
                                </div>
                            </div>
                        </div>

                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No skills found.</p>
            )}
        </>
    );
};

export default JobRoleSkills;
