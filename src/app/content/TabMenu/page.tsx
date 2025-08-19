'use client';

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import SkillTaxonomyCreation from "@/app/content/Libraries/SkillTaxonomyCreation";
import DepartmentStructure from "../organization-profile-management/components/DepartmentStructure";
import KnowledgeTax from "../Libraries/knowledgeTax";
import AttitudeTaxonomy from "../Libraries/AttitudeTaxo";
import AbilityTaxonomy from "../Libraries/AbilityTaxo";
import BehaviourTaxonomy from "../Libraries/BehaviourTaxo";

interface TabsMenuProps {
  tabs?: string[]; // optional now to avoid undefined.map error
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabsMenu: React.FC<TabsMenuProps> = ({ tabs = [], activeTab, onTabChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openPage, setOpenPage] = useState<string | null>(null);

  const handleOpen = (page: string) => {
    setOpenPage(page);
    setIsDropdownOpen(false);
  };

  // generic save handler
  const handleSave = (name: string) => {
    alert(`${name} saved!`);
    setOpenPage(null);
  };

  return (
    <>
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                onTabChange(tab);
                setOpenPage(null); // reset page when switching tab
              }}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 3-dot dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MoreVertical size={20} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-md z-10">
              {activeTab === "Skill Library" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleOpen("SkillTaxonomy")}
                >
                  Skill Taxonomy
                </button>
              )}

              {activeTab === "Jobrole Library" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleOpen("JobroleTaxonomy")}
                >
                  Department
                </button>
              )}

              {activeTab === "Knowledge" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleOpen("Knowledge")}
                >
                  Taxonomy
                </button>
              )}

              {activeTab === "Ability" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleOpen("Ability")}
                >
                  Taxonomy
                </button>
              )}

              {activeTab === "Attitude" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleOpen("Attitude")}
                >
                  Taxonomy
                </button>
              )}

              {activeTab === "Behaviour" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleOpen("Behaviour")}
                >
                  Taxonomy
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render selected taxonomy pages inline */}
      {openPage === "SkillTaxonomy" && (
        <SkillTaxonomyCreation />
      )}

      {openPage === "JobroleTaxonomy" && (
        <DepartmentStructure
          onSave={() => handleSave("Jobrole Taxonomy")}
          loading={false}
        />
      )}

      {openPage === "Knowledge" && (
        <KnowledgeTax
          onSave={() => handleSave("Knowledge Taxonomy")}
          loading={false}
        />
      )}

      {openPage === "Ability" && (
        <AbilityTaxonomy
          onSave={() => handleSave("Ability Taxonomy")}
          loading={false}
        />
      )}

      {openPage === "Attitude" && (
        <AttitudeTaxonomy
          onSave={() => handleSave("Attitude Taxonomy")}
          loading={false}
        />
      )}

      {openPage === "Behaviour" && (
        <BehaviourTaxonomy
          onSave={() => handleSave("Behaviour Taxonomy")}
          loading={false}
        />
      )}
    </>
  );
};

export default TabsMenu;
