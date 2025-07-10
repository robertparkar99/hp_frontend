"use client";

import React, { useState } from "react";
import './JobroleSkill.css'; // Reuse the same CSS file from JobIndustriesGrid

const JobRoleSkill: React.FC = () => {
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
    { name: "Continuous Improvement Management", level: null },
    { name: "Data Analytics and Computational Modelling", level: null },
    { name: "Business Environment Analysis", level: null },
    {
      name: "Information Technology Application Support and Monitoring",
      level: "Level 4",
    },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },
    { name: "Business Environment Analysis", level: null },

    { name: "Business Environment Analysis", level: null },

    { name: "Business Environment Analysis", level: null },

    { name: "Business Environment Analysis", level: null },



  ];

return (
  <>
    <div className="w-full max-w-6xl mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-700">Job Role Skills</h1>
      </div>
    </div>
    <div className="hexagon-flex p-4 m-20">
      {skills.length > 0 ? (
        <div className="hexagon-grid2">
          {skills.map((skill, index) => (
            <div className="hexagonN">
        <h3 >
          {skill.name}
        </h3>
        <p>level 4</p>
</div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No skills found.</p>
      )}
    </div>
  </>
);
};

export default JobRoleSkill;
