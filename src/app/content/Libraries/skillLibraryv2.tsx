"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Atom } from "react-loading-indicators";

import TabsMenu from "../TabMenu/page";
import SkillTaxonomyCreation from "@/app/content/Libraries/SkillTaxonomyCreation";
import DepartmentStructure from "../organization-profile-management/components/DepartmentStructure";
import KnowledgeTax from "../Libraries/knowledgeTax";
import AttitudeTaxonomy from "../Libraries/AttitudeTaxo";
import AbilityTaxonomy from "../Libraries/AbilityTaxo";
import BehaviourTaxonomy from "../Libraries/BehaviourTaxo";
import KnowledgeLibrary from "../Knowledge_library/page";
import Behaviour from "../Behaviour-library/page";
import Attitude from "../Attitude-library/page";

// ✅ Loader Component
const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <Atom color="#525ceaff" size="medium" text="" textColor="" />
  </div>
);

// ✅ Dynamic imports with loader
const DynamicSkill = dynamic(() => import("../skill-library/page"), {
  ssr: false,
  loading: Loader,
});

const DynamicJobrole = dynamic(() => import("./JobroleLibrary"), {
  ssr: false,
  loading: Loader,
});

const SkillLibrary = () => {
  const [activeTab, setActiveTab] = useState("Skill Library");
  const [openPage, setOpenPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // If user navigates to /taxonomy, hide the tabs
  const isTaxonomyPage = pathname.includes("/taxonomy");

  // 👉 Trigger loader when switching tabs
  const handleTabChange = (tab: string) => {
    setIsLoading(true);
    setActiveTab(tab);

    // Small timeout to show loader while component mounts
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleSaveAndClose = (name: string) => {
    alert(`${name} saved!`);
    setOpenPage(null);
  };

  if (isTaxonomyPage) return null;

  return (
    <>
      <TabsMenu
        tabs={["Skill Library", "Jobrole Library", "Knowledge", "Ability", "Attitude", "Behaviour"]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        openPage={openPage}
        onOpenPage={setOpenPage}
      />

      <Suspense fallback={<Loader />}>
        {isLoading ? (
          <Loader />
        ) : openPage ? (
          <>
            {openPage === "SkillTaxonomy" && <SkillTaxonomyCreation />}
            {openPage === "JobroleTaxonomy" && (
              <DepartmentStructure onSave={() => handleSaveAndClose("Jobrole Taxonomy")} loading={false} />
            )}
            {openPage === "Knowledge" && (
              <KnowledgeTax onSave={() => handleSaveAndClose("Knowledge Taxonomy")} loading={false} />
            )}
            {openPage === "Ability" && (
              <AbilityTaxonomy onSave={() => handleSaveAndClose("Ability Taxonomy")} loading={false} />
            )}
            {openPage === "Attitude" && (
              <AttitudeTaxonomy onSave={() => handleSaveAndClose("Attitude Taxonomy")} loading={false} />
            )}
            {openPage === "Behaviour" && (
              <BehaviourTaxonomy onSave={() => handleSaveAndClose("Behaviour Taxonomy")} loading={false} />
            )}
          </>
        ) : (
          <>
            {activeTab === "Skill Library" && <DynamicSkill />}
            {activeTab === "Jobrole Library" && <DynamicJobrole />}
            {activeTab === "Knowledge" && <KnowledgeLibrary />}
            {activeTab === "Ability" && <h1 className="text-center">Coming soon</h1>}
            {activeTab === "Attitude" && <Attitude />}
            {activeTab === "Behaviour" && <Behaviour />}
          </>
        )}
      </Suspense>
    </>
  );
};

export default SkillLibrary;
