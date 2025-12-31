"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Atom } from "react-loading-indicators";

import TabsMenu from "../TabMenu/page";
import ShepherdTour from "../Onboarding/Competency-Management/ShepherdTour";
import SkillTaxonomyCreation from "@/app/content/Libraries/SkillTaxonomyCreation";
import DepartmentStructure from "../organization-profile-management/components/DepartmentStructure";
import KnowledgeTax from "../Libraries/knowledgeTax";
import AttitudeTaxonomy from "../Libraries/AttitudeTaxo";
import AbilityTaxonomy from "../Libraries/AbilityTaxo";
import BehaviourTaxonomy from "../Libraries/BehaviourTaxo";
import KnowledgeLibrary from "../Knowledge_library/page";
// import Behaviour from "../Behaviour-library/page";
import Attitude from "../Attitude-library/page";
import Ability from "../ability-library/page";
import Behaviour from "../Behaviour-library/page";
import Jobrole from "../Jobrole-library/jobroleLibrary";
import JobroleTask from "./Jobrole-task-library/page";
import JobroleTaxonomy from "../jobrole-taxonomy/page";
import JobroleTAskTaxonomy from "./jobroleTaskTaxo";
import CourseLibrary from "./CourseLibrary";
import ViewDetail from "../LMS/ViewChepter/ViewDetail";
import InvisibleLibrary from "../Libraries/Invisible-library/page";
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
}) as React.ComponentType<{ showDetailTour?: boolean | { show: boolean; onComplete?: () => void } }>;

const DynamicJobrole = dynamic(() => import("./JobroleLibrary"), {
  ssr: false,
  loading: Loader,
});

interface SkillLibraryProps {
  showTour?: boolean;
  onTourComplete?: () => void;
  onDetailComplete?: () => void;
}

const SkillLibrary: React.FC<SkillLibraryProps> = ({ showTour, onTourComplete, onDetailComplete }) => {
  const tabs = ["Skill", "Jobrole", "Jobrole Task", "Knowledge", "Ability", "Attitude", "Behaviour", "Invisible"];
  const [activeTab, setActiveTab] = useState("Skill");
  const [openPage, setOpenPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [subjectId, setSubjectId] = useState(0);
  const [standardId, setStandardId] = useState(0);
  const [detailTourTab, setDetailTourTab] = useState<string | null>(null);
  const [showMainTour, setShowMainTour] = useState(false);
  const [tourTabs, setTourTabs] = useState(tabs);
  const pathname = usePathname();

  // If user navigates to /taxonomy, hide the tabs
  const isTaxonomyPage = pathname.includes("/taxonomy");


  // Sync showMainTour with showTour prop
  useEffect(() => {
    setShowMainTour(showTour ?? false);
  }, [showTour]);


  // Reset detailTourTab after triggering
  useEffect(() => {
    if (detailTourTab) {
      const timer = setTimeout(() => setDetailTourTab(null), 100);
      return () => clearTimeout(timer);
    }
  }, [detailTourTab]);
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

  const handleViewDetails = (subject_id: number, standard_id: number) => {
    if (subject_id && standard_id) {
      setSubjectId(subject_id);
      setStandardId(standard_id);
      setIsViewOpen(true);
    }
  };

  const handleCloseViewDetail = () => {
    setIsViewOpen(false);
  };

  if (isTaxonomyPage) return null;

  // If ViewDetail is open, show only that
  if (isViewOpen) {
    return <ViewDetail subject_id={subjectId} standard_id={standardId} onClose={handleCloseViewDetail} />;
  }

  return (
    <div className="bg-background rounded-xl p-5 min-h-screen">
      {/* Fixed Shepherd anchors for stable targeting */}
      <div className="absolute opacity-0 pointer-events-none">
        <div id="shep-skill" data-shepherd-anchor='skill-library'></div>
        <div id="shep-jobrole" data-shepherd-anchor='jobrole-library'></div>
        <div id="shep-jobtask" data-shepherd-anchor='jobrole-task-library'></div>
        <div id="shep-knowledge" data-shepherd-anchor='knowledge'></div>
        <div id="shep-ability" data-shepherd-anchor='ability'></div>
        <div id="shep-attitude" data-shepherd-anchor='attitude'></div>
        <div id="shep-behaviour" data-shepherd-anchor='behaviour'></div>
      </div>

      <TabsMenu
        tabs={["Skill", "Jobrole", "Jobrole Task", "Knowledge", "Ability", "Attitude", "Behaviour", "Invisible"]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        openPage={openPage}
        onOpenPage={setOpenPage}
        data-shepherd="tabs"
      />

      {showMainTour && <ShepherdTour tabs={tourTabs} onComplete={onTourComplete} onOpenDetailModal={(tab: string) => { setActiveTab(tab); setDetailTourTab(tab); setShowMainTour(false); setTourTabs(tabs); }} />}

      <Suspense fallback={<Loader />}>
        {isLoading ? (
          <Loader />
        ) : openPage ? (
          <>
            {openPage === "SkillTaxonomy" && <SkillTaxonomyCreation />}
            {openPage === "JobroleTaxonomy" && (
              <JobroleTaxonomy />
            )}
            {openPage === "JobroleTaskTaxonomy" && <JobroleTAskTaxonomy />}
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
                {activeTab === "Skill" && <DynamicSkill showDetailTour={{ show: detailTourTab === 'Skill', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Skill') + 1)); setShowMainTour(true); } }} />}
                {activeTab === "Jobrole" && <Jobrole showDetailTour={{ show: detailTourTab === 'Jobrole', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Jobrole') + 1)); setShowMainTour(true); } }} />}
                {activeTab === "Jobrole Task" && <JobroleTask showDetailTour={{ show: detailTourTab === 'Jobrole Task', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Jobrole Task') + 1)); setShowMainTour(true); } }} />}
                {activeTab === "Knowledge" && <KnowledgeLibrary showDetailTour={{ show: detailTourTab === 'Knowledge', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Knowledge') + 1)); setShowMainTour(true); } }} />}
                {activeTab === "Ability" && <Ability showDetailTour={{ show: detailTourTab === 'Ability', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Ability') + 1)); setShowMainTour(true); } }} />}
                {activeTab === "Attitude" && <Attitude showDetailTour={{ show: detailTourTab === 'Attitude', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Attitude') + 1)); setShowMainTour(true); } }} />}
                {activeTab === "Behaviour" && <Behaviour showDetailTour={{ show: detailTourTab === 'Behaviour', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Behaviour') + 1)); setShowMainTour(true); } }} />}
            {activeTab === "Behaviour" && <Behaviour />}

                {activeTab === "Invisible" && <InvisibleLibrary showDetailTour={{ show: detailTourTab === 'Invisible', onComplete: () => { onDetailComplete && onDetailComplete(); setTourTabs(tabs.slice(tabs.indexOf('Invisible') + 1)); setShowMainTour(true); } }} />}
          </>
        )}
      </Suspense>
    </div>
  );
};

export default SkillLibrary;


// "use client";

// import React, { useEffect, useState, useMemo, Suspense } from "react";
// import dynamic from "next/dynamic";
// import { usePathname } from "next/navigation";
// import { Atom } from "react-loading-indicators";

// import TabsMenu from "../TabMenu/page";
// import ShepherdTour from "../Onboarding/Competency-Management/ShepherdTour";
// import SkillTaxonomyCreation from "@/app/content/Libraries/SkillTaxonomyCreation";
// import DepartmentStructure from "../organization-profile-management/components/DepartmentStructure";
// import KnowledgeTax from "../Libraries/knowledgeTax";
// import AttitudeTaxonomy from "../Libraries/AttitudeTaxo";
// import AbilityTaxonomy from "../Libraries/AbilityTaxo";
// import BehaviourTaxonomy from "../Libraries/BehaviourTaxo";
// import KnowledgeLibrary from "../Knowledge_library/page";
// import Behaviour from "../Behaviour-library/page";
// import Attitude from "../Attitude-library/page";
// import Ability from "../ability-library/page";
// import Jobrole from "../Jobrole-library/jobroleLibrary";
// import JobroleTask from "./Jobrole-task-library/page";
// import JobroleTaxonomy from "../jobrole-taxonomy/page";
// import JobroleTAskTaxonomy from "./jobroleTaskTaxo";
// import CourseLibrary from "./CourseLibrary";
// import ViewDetail from "../LMS/ViewChepter/ViewDetail";
// // ✅ Loader Component
// const Loader = () => (
//   <div className="flex justify-center items-center h-screen">
//     <Atom color="#525ceaff" size="medium" text="" textColor="" />
//   </div>
// );

// // ✅ Dynamic imports with loader
// const DynamicSkill = dynamic(() => import("../skill-library/page"), {
//   ssr: false,
//   loading: Loader,
// });

// const DynamicJobrole = dynamic(() => import("./JobroleLibrary"), {
//   ssr: false,
//   loading: Loader,
// });

// interface SkillLibraryProps {
//   showTour?: boolean;
//   onTourComplete?: () => void;
//   onDetailComplete?: () => void;
// }

// const SkillLibrary: React.FC<SkillLibraryProps> = ({ showTour = false, onTourComplete, onDetailComplete }) => {
//   const [activeTab, setActiveTab] = useState("Skill Library");
//   const [openPage, setOpenPage] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isViewOpen, setIsViewOpen] = useState(false);
//   const [subjectId, setSubjectId] = useState(0);
//   const [standardId, setStandardId] = useState(0);
//   const [detailTourTab, setDetailTourTab] = useState<string | null>(null);
//   const [showMainTour, setShowMainTour] = useState(false);
//   const pathname = usePathname();

//   // If user navigates to /taxonomy, hide the tabs
//   const isTaxonomyPage = pathname.includes("/taxonomy");

//   // Sync showMainTour with showTour prop
//   useEffect(() => {
//     setShowMainTour(showTour);
//   }, [showTour]);

//   // Reset detailTourTab after triggering
//   useEffect(() => {
//     if (detailTourTab) {
//       const timer = setTimeout(() => setDetailTourTab(null), 100);
//       return () => clearTimeout(timer);
//     }
//   }, [detailTourTab]);

//   // 👉 Trigger loader when switching tabs
//   const handleTabChange = (tab: string) => {
//     setIsLoading(true);
//     setActiveTab(tab);

//     // Small timeout to show loader while component mounts
//     setTimeout(() => setIsLoading(false), 500);
//   };

//   const handleSaveAndClose = (name: string) => {
//     alert(`${name} saved!`);
//     setOpenPage(null);
//   };

//   const handleViewDetails = (subject_id: number, standard_id: number) => {
//     if (subject_id && standard_id) {
//       setSubjectId(subject_id);
//       setStandardId(standard_id);
//       setIsViewOpen(true);
//     }
//   };

//   const handleCloseViewDetail = () => {
//     setIsViewOpen(false);
//   };

//   if (isTaxonomyPage) return null;

//   // If ViewDetail is open, show only that
//   if (isViewOpen) {
//     return <ViewDetail subject_id={subjectId} standard_id={standardId} onClose={handleCloseViewDetail} />;
//   }

//   return (
//     <div className="bg-background rounded-xl p-5 min-h-screen">
//       {/* Fixed Shepherd anchors for stable targeting */}
//       <div className="absolute opacity-0 pointer-events-none">
//         <div id="shep-skill" data-shepherd-anchor='skill-library'></div>
//         <div id="shep-jobrole" data-shepherd-anchor='jobrole-library'></div>
//         <div id="shep-jobtask" data-shepherd-anchor='jobrole-task-library'></div>
//         <div id="shep-knowledge" data-shepherd-anchor='knowledge'></div>
//         <div id="shep-ability" data-shepherd-anchor='ability'></div>
//         <div id="shep-attitude" data-shepherd-anchor='attitude'></div>
//         <div id="shep-behaviour" data-shepherd-anchor='behaviour'></div>
//         <div id="shep-course" data-shepherd-anchor='course-library'></div>
//       </div>

//       <TabsMenu
//         tabs={["Skill Library", "Jobrole Library", "Jobrole Task Library", "Knowledge", "Ability", "Attitude", "Behaviour", "Course Library"]}
//         activeTab={activeTab}
//         onTabChange={handleTabChange}
//         openPage={openPage}
//         onOpenPage={setOpenPage}
//         data-shepherd="tabs"

//       />

//       {showMainTour && <ShepherdTour tabs={["Skill Library", "Jobrole Library", "Jobrole Task Library", "Knowledge", "Ability", "Attitude", "Behaviour", "Course Library"]} onComplete={onTourComplete} onOpenDetailModal={(tab: string) => { setActiveTab(tab); setDetailTourTab(tab); setShowMainTour(false); }} />}

//       <Suspense fallback={<Loader />}>
//         {isLoading ? (
//           <Loader />
//         ) : openPage ? (
//           <>
//             {openPage === "SkillTaxonomy" && <SkillTaxonomyCreation />}
//             {openPage === "JobroleTaxonomy" && (
//               <JobroleTaxonomy />
//             )}
//             {openPage === "JobroleTaskTaxonomy" && <JobroleTAskTaxonomy />}
//             {openPage === "Knowledge" && (
//               <KnowledgeTax onSave={() => handleSaveAndClose("Knowledge Taxonomy")} loading={false} />
//             )}
//             {openPage === "Ability" && (
//               <AbilityTaxonomy onSave={() => handleSaveAndClose("Ability Taxonomy")} loading={false} />
//             )}
//             {openPage === "Attitude" && (
//               <AttitudeTaxonomy onSave={() => handleSaveAndClose("Attitude Taxonomy")} loading={false} />
//             )}
//             {openPage === "Behaviour" && (
//               <BehaviourTaxonomy onSave={() => handleSaveAndClose("Behaviour Taxonomy")} loading={false} />
//             )}
//           </>
//         ) : (
//           <>
//                 {activeTab === "Skill Library" && <DynamicSkill showDetailTour={{ show: detailTourTab === 'Skill Library', onComplete: () => { onDetailComplete && onDetailComplete(); setShowMainTour(true); } }} />}
//             {activeTab === "Jobrole Library" && <Jobrole />}
//                 {activeTab === "Jobrole Task Library" && <JobroleTask />}
//             {activeTab === "Knowledge" && <KnowledgeLibrary />}
//                 {activeTab === "Ability" && <Ability />}
//             {activeTab === "Attitude" && <Attitude />}
//             {activeTab === "Behaviour" && <Behaviour />}
//                 {activeTab === "Course Library" && <CourseLibrary onViewDetails={handleViewDetails} />}
//           </>
//         )}
//       </Suspense>
//     </div>
//   );
// };

// export default SkillLibrary;

