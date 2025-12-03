import React, { useEffect, useState } from "react";

// Placeholder components for demonstration.
// In a real Next.js app, these would be imported from:
import DetailData from "./tabComponent/detailData";
import JobroleData from "./tabComponent/jobroleData";
import ProficiencyLevelData from "./tabComponent/proficiencyData";
import KnowledgeAbilityData from "./tabComponent/knowledgeData";
import ApplicationData from "./tabComponent/applicationData";
import AbilityData from "./tabComponent/AbilityData";
import AttributesData from "./tabComponent/Attributes";
import BehaviourData from "./tabComponent/Behaviour";

const Detail = ({ skillId }: { skillId: number }) => (
  <div className="p-4 bg-gray-50 rounded-md">
    <h3 className="text-lg font-medium mb-2">Detail Tab Content</h3>
    <p>
      This is the detail view for skill ID: <strong>{skillId}</strong>.
    </p>
    <p>Here you can manage general information about the skill.</p>
  </div>
);

const JobRole = () => (
  <div className="p-4 bg-gray-50 rounded-md">
    <h3 className="text-lg font-medium mb-2">Job Role Tab Content</h3>
    <p>Manage job roles associated with this skill here.</p>
  </div>
);

const ProficiencyLevel = () => (
  <div className="p-4 bg-gray-50 rounded-md">
    <h3 className="text-lg font-medium mb-2">Proficiency Level Tab Content</h3>
    <p>Define and adjust proficiency levels for the skill.</p>
  </div>
);

const KnowledgeAbility = () => (
  <div className="p-4 bg-gray-50 rounded-md">
    <h3 className="text-lg font-medium mb-2">Knowledge Tab Content</h3>
    <p>Add or edit knowledge and ability requirements for the skill.</p>
  </div>
);

const Applications = () => (
  <div className="p-4 bg-gray-50 rounded-md">
    <h3 className="text-lg font-medium mb-2">Applications Tab Content</h3>
    <p>List and manage applications related to this skill.</p>
  </div>
);

const Competency = () => (
  <div className="p-4 bg-gray-50 rounded-md">
    <h3 className="text-lg font-medium mb-2">Ability Tab Content</h3>
    <p>Define and link competencies to this skill.</p>
  </div>
);

interface EditDialogProps {
  skillId: number;
  onClose: () => void;
  onSuccess: () => void; // Added onSuccess as per your original interface
}

interface FormData {
  category: string;
  sub_category: string;
  skill_name: string;
  description: string;
  business_links: string;
  proficiency_level?: string;
  learning_resources?: string;
  assesment_method?: string;
  certification_qualifications?: string;
  experience_project?: string;
  skill_maps?: string;
}
const EditDialog: React.FC<EditDialogProps> = ({
  skillId,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState("detail"); // State to manage active tab
  const [sessionUrl, setSessionUrl] = useState<string>();
  const [sessionToken, setSessionToken] = useState<string>();
  const [sessionOrgType, setessionOrgType] = useState<string>();
  const [sessionSubInstituteId, setessinSubInstituteId] = useState<string>();
  const [sessionUserID, setessionUserID] = useState<string>();
  const [sessionUserProfile, setessionUserProfile] = useState<string>();
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
        user_profile_name,
      } = JSON.parse(userData);
      setSessionUrl(APP_URL);
      setSessionToken(token);
      setessionOrgType(org_type);
      setessinSubInstituteId(sub_institute_id);
      setessionUserID(user_id);
      setessionUserProfile(user_profile_name);
    }
  }, []);

  useEffect(() => {
    if (sessionUrl && sessionToken) fetchData();
    async function fetchData() {
      const res = await fetch(
        `${sessionUrl}/knowledge_library/${skillId}/edit?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&formType=user`
      );
      const data = await res.json();
      setEditData(data.editData || {});
      //   console.log('data',data.editData);
    }
  }, [sessionUrl, sessionToken]);

  // Define tabs with their corresponding components
  const tabs = [
    {
      id: "detail",
      name: "Knowledge Details",
      component: <DetailData editData={editData} />,
    },
    {
      id: "jobrole",
      name: "Knowledge JobRole",
      component: <JobroleData editData={editData} />,
    },
    {
      id: "proficiencylevel",
      name: "Knowledge Proficiency Level",
      component: <ProficiencyLevelData editData={editData} />,
    },
    {
      id: "knowledge",
      name: "Knowledge Skills",
      component: <KnowledgeAbilityData editData={editData} />,
    },
    {
      id: "ability",
      name: "Knowledge Ability",
      component: <AbilityData editData={editData} />,
    },

    {
      id: "attitude",
      name: "Knowledge Attitude",
      component: <AttributesData editData={editData} />,
    },
    {
      id: "behaviour",
      name: "Knowledge Behaviour",
      component: <BehaviourData editData={editData} />,
    },
      {
      id: "applications",
      name: "Knowledge Applications",
      component: <ApplicationData editData={editData} />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-5xl shadow-2xl relative flex flex-col h-[98vh] md:h-[98vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Close dialog"
        >
          ✖
        </button>

        {/* <div className="w-[100%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 text-center rounded-lg">
          <h2 className="font-bold">{editData.title}</h2>
        </div> */}
         {/* header parts start  */}
        <div className="flex w-full">
          {/* Left: GIF */}
          <div className="w-[10%] bg-gradient-to-b from-violet-100 to-violet-200 p-2 rounded-l-lg">
            <img src={`/assets/loading/robo_dance.gif`} alt="Loading..." className="w-full h-auto" />
          </div>

          {/* Center Content */}
          <div className="w-[90%] bg-gradient-to-r from-violet-100 to-violet-200 py-2 flex justify-center rounded-r-lg">
            <div className="heade">
              <h2 className="text-gray-800 font-bold text-lg"><b>Knowledge Name : </b>{editData?.title}</h2>
              {/* <h5 className="text-gray-600 font-semibold text-sm">
                <b>Industry : </b>{sessionOrgType}
              </h5> */}
              <h5 className="text-gray-600 font-semibold text-sm"><b>Knowledge Department : </b>{editData?.department}</h5>
              {editData.sub_department ? (
                <h5 className="text-gray-600 font-semibold text-sm"><b>Knowledge Sub Department : </b>{editData.sub_department}</h5>
              ) : ''}
            </div>

          </div>
          </div>
        {/* Tab Navigation */}
        <div className="w-[100%] flex flex-wrap justify-center custom-oklch-gradient my-2 p-4 text-center rounded-lg gap-2">
          {tabs.map((tab,index) => (
            <span
              key={index}
              onClick={() => setActiveTab(tab.id)}
              className={`p-2 rounded-lg text-sm
                 font-semibold transition-all duration-300
                ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600"
                }
              `}
            >
              {tab.name}
            </span>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="w-[100%] bg-gradient-to-r from-blue-100 to-blue-200 my-2 p-4 text-center rounded-lg gap-4  overflow-auto hide-scroll">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default EditDialog;
