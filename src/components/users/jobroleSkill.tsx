"use client";

import React, { useState } from "react";

const JobRoleSkills: React.FC = () => {
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

        { name: "Business Environment Analysis", level: 4 },



    ];

    return (
        <>
            <div className="w-full max-w-6xl mx-auto p-4 bg-white">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-medium text-gray-700">Job Role Skills </h1>
                </div>
            </div>
            {skills.length > 0 ? (
                <div className="honeycomb-container">
                    {skills.map((skill, index) => (
                        <div className="hexagon-wrapper" key={index}>

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
