'use client';

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";

interface TabsMenuProps {
  tabs?: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  openPage: string | null;
  onOpenPage: (page: string | null) => void;
}

const TabsMenu: React.FC<TabsMenuProps> = ({
  tabs = [],
  activeTab,
  onTabChange,
  openPage,
  onOpenPage,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openAndClose = (page: string) => {
    onOpenPage(page);
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => {
                onTabChange(tab);
                onOpenPage(null); // tab બદલતાં dropdown page હાઇડ
              }}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab && !openPage
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
            onClick={() => setIsDropdownOpen((s) => !s)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="More actions"
          >
            <MoreVertical size={20} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-md z-10">
              {activeTab === "Skill" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("SkillTaxonomy")}
                >
                  Skill Taxonomy
                </button>
              )}

              {activeTab === "Jobrole" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("JobroleTaxonomy")}
                >
                  Jobrole Taxonomy
                </button>
              )}

              {activeTab === "Jobrole Task" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("JobroleTaskTaxonomy")}
                >
                  Jobrole Task Taxonomy
                </button>
              )}

              {activeTab === "Knowledge" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("Knowledge")}
                >
                  Taxonomy
                </button>
              )}

              {activeTab === "Ability" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("Ability")}
                >
                  Taxonomy
                </button>
              )}

              {activeTab === "Attitude" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("Attitude")}
                >
                  Taxonomy
                </button>
              )}

              {activeTab === "Behaviour" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("Behaviour")}
                >
                  Taxonomy
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TabsMenu;
