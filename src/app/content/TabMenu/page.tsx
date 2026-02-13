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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-300 pb-2 mb-4 gap-2">
        {/* Tabs container with horizontal scroll on small screens */}
        <div className="w-full sm:w-auto overflow-x-auto sm:overflow-visible">
          <div className="flex space-x-6 sm:whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  onTabChange(tab);
                  onOpenPage(null); // tab change 時 dropdown page 隱藏
                }}
                className={`pb-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab && !openPage
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 3-dot dropdown */}
        <div className="relative self-end sm:self-auto">
          <button
            onClick={() => setIsDropdownOpen((s) => !s)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="More actions"
          >
            <MoreVertical size={20} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-md z-10">
              {activeTab === "Skill Library" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("SkillTaxonomy")}
                >
                  Skill Taxonomy
                </button>
              )}

              {activeTab === "Jobrole Library" && (
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => openAndClose("JobroleTaxonomy")}
                >
                  Jobrole Taxonomy
                </button>
              )}

              {activeTab === "Jobrole Task Library" && (
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
