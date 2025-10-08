"use client";

import React, { useState, useEffect } from "react";
import JobroleNew from "./jobroleNew";

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

interface UserJobroleSkillsProps {
  userJobroleSkills?: Skill[] | null; // can be null/undefined
  skillType?: string; // 👈 added this to customize empty message
}

const JobRoleSkills: React.FC<UserJobroleSkillsProps> = ({ userJobroleSkills, skillType = "Job role" }) => {
  const [activeSkill, setActiveSkill] = useState("");
  const [skillArray, setSkillArray] = useState<Skill[]>([]);

  useEffect(() => {
    if (Array.isArray(userJobroleSkills)) {
      setSkillArray(userJobroleSkills);
    } else {
      setSkillArray([]);
    }
  }, [userJobroleSkills]);

  if (!userJobroleSkills) {
    return (
      <p className="text-red-500 text-center py-6">
        ⚠️ Failed to fetch {skillType.toLowerCase()} skills. Please try again later.
      </p>
    );
  }

  return (
    <>
      {activeSkill !== "" ? (
        <JobroleNew
          onBack={() => setActiveSkill("")}
          knowledge={skillArray.find((s) => s.skill === activeSkill)?.knowledge || []}
          ability={skillArray.find((s) => s.skill === activeSkill)?.ability || []}
          behaviour={skillArray.find((s) => s.skill === activeSkill)?.behaviour || []}
          attitude={skillArray.find((s) => s.skill === activeSkill)?.attitude || []}
          skills={skillArray}
          activeSkillName={activeSkill} // Add this line
        />
      ) : skillArray.length > 0 ? (
        <div className="honeycomb-container pb-8">
          {skillArray.map((skill, index) => (
            <div className="hexagon-wrapper" key={index}>
              <div className="hexagon-inner">
                <div className="hexagon-content">
                  <span
                    className="right mdi mdi-open-in-new hexagon-icon"
                    onClick={() => setActiveSkill(skill.skill)}
                  ></span>
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
        <p className="text-gray-500 text-center py-6">
          {skillType} skills not found.
        </p>
      )}
    </>
  );
};

export default JobRoleSkills;
