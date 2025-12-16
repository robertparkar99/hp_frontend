import React, { useEffect, useState } from "react";
import EditDialog from "./editDialouge";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

interface ViewKnowledgeProps {
  knowledgeId: number;
  onClose: () => void;
  onSuccess: () => void;
  viewMode?: "full" | "kaab-only"; // ✅ Add viewMode prop
}

const ViewKnowledge: React.FC<ViewKnowledgeProps> = ({
  knowledgeId,
  onClose,
  viewMode = "full",
}) => {
  const [sessionUrl, setSessionUrl] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [sessionOrgType, setessionOrgType] = useState<string>();
  const [sessionSubInstituteId, setessinSubInstituteId] = useState<string>();
  const [sessionUserID, setessionUserID] = useState<string>();
  const [sessionUserProfile, setessionUserProfile] = useState<string>();
  const [sessionSyear, setessionSyear] = useState<string>();
  const [viewData, setViewData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [relatedSkills, setRelatedSkills] = useState<any[]>([]);
  const [customTags, setCustomTags] = useState<any[]>([]);
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState<any>(null);
  const [activeAbilityTab, setActiveAbilityTab] = useState<any>(null);
  // const [activeApplicationTab, setActiveApplicationTab] = useState<any>(null);
  const [jobroleData, setJobroleData] = useState<any[]>([]);
  const [proficiencyLevel, setProficiencyLevel] = useState<any[]>([]);
  const [knowldegeData, setKnowldegeData] = useState<any[]>([]);
  const [knowldegeLevel, setKnowlegeLevel] = useState<any[]>([]);
  const [abilityLevel, setAbilityLevel] = useState<any[]>([]);
  // const [applicationLevel, setApplicationLevel] = useState<any[]>([]);
  const [abilityData, setAbililtyData] = useState<any[]>([]);
  // const [applicationData, setApplicationData] = useState<any[]>([]);
  const [attitudeData, setAttitudeData] = useState<any[]>([]);
  const [behaviourData, setBehaviourData] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const {
          APP_URL,
          token,
          org_type,
          sub_institute_id,
          user_id,
          user_profile_name,
          syear,
        } = JSON.parse(userData);
        setSessionUrl(APP_URL);
        setSessionToken(token);
        setessionOrgType(org_type);
        setessinSubInstituteId(sub_institute_id);
        setessionUserID(user_id);
        setessionUserProfile(user_profile_name);
        setessionSyear(syear);
      }
    }
  }, []);

  useEffect(() => {
    if (sessionUrl && sessionToken) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `${sessionUrl}/table_data?filters[sub_institute_id]=3&table=s_user_knowledge`,
            {
              headers: {
                Authorization: `Bearer ${sessionToken}`,
              },
            }
          );
          const data = await res.json();
          setViewData(data.find((item: any) => item.id === knowledgeId) || null);
        } catch (error) {
          console.error("Error fetching knowledge data:", error);
          setViewData(null);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [sessionUrl, sessionToken, knowledgeId]);

  // ✅ Auto-select first KAAB tab when in kaab-only mode
  useEffect(() => {
    if (viewMode === "kaab-only" && knowldegeLevel.length > 0) {
      setActiveCardIndex(3); // Select Knowledge tab by default
    }
  }, [viewMode, knowldegeLevel]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative h-screen overflow-auto hide-scroll">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          >
            ✖
          </button>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!viewData) {
    return (
      <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative h-screen overflow-auto hide-scroll">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          >
            ✖
          </button>
          <div>No data found for this knowledge.</div>
        </div>
      </div>
    );
  }

  // ✅ Conditionally hide header in kaab-only mode
  const showHeader = viewMode !== "kaab-only";

  const cardData = [
    {
      id: 0,
      title: "Knowledge Details",
      iconClass: "mdi mdi-information-slab-circle",
      images: "assets/skill_images/book.png",
    },
    {
      id: 1,
      title: "Knowledge Jobrole",
      iconClass: "mdi mdi-account-hard-hat",
      images: "assets/skill_images/jobrole.png",
    },
    {
      id: 2,
      title: "Knowledge Level",
      iconClass: "mdi mdi-arrow-up-box",
      images: "assets/skill_images/proficiency.png",
    },
    {
      id: 3,
      title: "Knowledge Skill",
      iconClass: "mdi mdi-head-snowflake",
      images: "assets/skill_images/knowledge.png",
    },
    {
      id: 4,
      title: "Knowledge Ability",
      iconClass: "mdi mdi-alpha-a-box",
      images: "assets/skill_images/ability.png",
    },
    // {
    //   id: 5,
    //   title: "Knowledge Application",
    //   iconClass: "mdi mdi-send",
    //   images: "assets/skill_images/application.png",
    // },
    {
      id: 6,
      title: "Knowledge Attitude",
      iconClass: "mdi mdi-send",
      images: "assets/skill_images/image 1.png",
    },
    {
      id: 7,
      title: "Knowledge Behaviour",
      iconClass: "mdi mdi-send",
      images: "assets/skill_images/behaviour.png",
    },
  ];

  const exportPDF = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById("printData");

      if (!element) {
        console.error("Element not found");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#f8fafc",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("knowledge.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      fallbackPDFExport();
    }
  };

  const fallbackPDFExport = () => {
    const doc = new jsPDF();
    const table = document.getElementById("example");

    if (table) {
      autoTable(doc, {
        html: "#example",
        startY: 20,
        theme: "grid",
        styles: { fontSize: 10 },
      });
      doc.save("knowledge.pdf");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionUrl}/skill_library/${id}?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&user_id=${sessionUserID}&formType=user`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  const handleCardClick = (index: number | 0) => {
    setActiveCardIndex(index);
  };

  // Define the KnowledgeItem interface to fix the type error
  interface KnowledgeItem {
    classification_item: string;
    classification_category: string;
    classification_sub_category: string;
    [key: string]: any;
  }
  interface abilityItem {
    classification_item: string;
    classification_category: string;
    classification_sub_category: string;
    [key: string]: any;
  }
  // interface applicationItem {
  //   application: string;
  //   proficiency_level: number | string;
  //   [key: string]: any;
  // }

  function empty(arr: any[]) {
    return !Array.isArray(arr) || arr.length === 0;
  }

  const handleCousreCreation = async () => {
    alert(
      "Course Creation in progress, Please Wait it will take sometime ! If failed then please try after some seconds"
    );
    try {
      const res = await fetch(
        `${sessionUrl}/AICourseGeneration?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&user_id=${sessionUserID}&user_profile_name=${sessionUserProfile}&syear=${sessionSyear}&industry=${sessionOrgType}&department=${viewData?.department}&skill_category=${viewData?.category}&skill_sub_category=${viewData?.sub_category}&skill_micro_category=${viewData?.micro_category}&skill_name=${viewData?.title}&skill_description=${viewData?.description}`
      );

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error("Error deleting job role:", error);
      alert("Error deleting job role");
    }
  };

  // ✅ Render KAAB content with proficiency level tabs
  const renderKaabWithProficiencyLevels = (
    type: "knowledge" | "ability" | "attitude" | "behaviour"
  ) => {
    let levels: any[] = [];
    let activeTab: any;
    let setActiveTab: any;

    switch (type) {
      case "knowledge":
        levels = knowldegeLevel;
        activeTab = activeKnowledgeTab;
        setActiveTab = setActiveKnowledgeTab;
        break;
      case "ability":
        levels = abilityLevel;
        activeTab = activeAbilityTab;
        setActiveTab = setActiveAbilityTab;
        break;
      case "attitude":
        // For attitude, show direct data since no proficiency levels
        return (
          <div className="cardDetails grid grid-cols-1 gap-6 p-4">
            {!empty(attitudeData) ? (
              attitudeData.map((item, index) => (
                <div
                  key={index}
                  className="cardData border-2 border-[#E6E6E6] shadow-md bg-[#F7FAFC] p-4 rounded-lg"
                >
                  <h3 className="text-[16px] font-bold text-[#2060E6] mb-2">
                    {item.classification_item || "N/A"}
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Category:</strong>{" "}
                      {item.classification_category || "-"}
                    </p>
                    <p>
                      <strong>Sub-Category:</strong>{" "}
                      {item.classification_sub_category || "-"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm mt-4">
                No {type} data available
              </div>
            )}
          </div>
        );
      case "behaviour":
        // For behaviour, show direct data since no proficiency levels
        return (
          <div className="cardDetails grid grid-cols-1 gap-6 p-4">
            {!empty(behaviourData) ? (
              behaviourData.map((item, index) => (
                <div
                  key={index}
                  className="cardData border-2 border-[#E6E6E6] shadow-md bg-[#F7FAFC] p-4 rounded-lg"
                >
                  <h3 className="text-[16px] font-bold text-[#2060E6] mb-2">
                    {item.classification_item || "N/A"}
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Category:</strong>{" "}
                      {item.classification_category || "-"}
                    </p>
                    <p>
                      <strong>Sub-Category:</strong>{" "}
                      {item.classification_sub_category || "-"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm mt-4">
                No {type} data available
              </div>
            )}
          </div>
        );
    }

    if (empty(levels)) {
      return (
        <div className="text-center text-gray-500 text-sm mt-4">
          No {type} data available
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-center mt-4 flex-wrap gap-2">
          {levels.map((level, index) => (
            <button
              key={`${type}Tab-${index}`}
              onClick={() => setActiveTab(level.proficiency_level)}
              className={`px-4 py-2 text-sm font-bold rounded-md border shadow-lg transition ${
                activeTab === level.proficiency_level
                  ? "bg-[#dfd9ff] text-[#4135ff] border-blue-500 shadow-blue-500/50"
                  : "bg-[#e7efff] text-gray-700 border-[#c1d2f7]"
              }`}
            >
              Level {level.proficiency_level}
            </button>
          ))}
        </div>

        <div className="w-full mt-6 p-4 border border-[#c1d2f7] rounded-lg shadow-lg shadow-blue-400/50">
          {levels.find((k: any) => k.proficiency_level === activeTab) ? (
            <div>
              <h3 className="text-lg font-semibold text-[#2060E6] mb-4">
                Level {activeTab} -{" "}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </h3>
              <ul className="space-y-3">
                {levels.find((k: any) => k.proficiency_level === activeTab)
                  ?.items?.length > 0 ? (
                  levels
                    .find((k: any) => k.proficiency_level === activeTab)
                    ?.items.map((item: any, itemIndex: number) => (
                      <li
                        className="bg-[#ebe3f3] p-3 rounded-lg"
                        key={itemIndex}
                      >
                        <div className="flex items-start">
                          <i
                            className="fa fa-chevron-circle-right mr-2 mt-1 text-[#4135ff]"
                            aria-hidden="true"
                          ></i>
                          <div>
                            <strong className="text-[#2060E6]">
                              {item.classification_item ||
                                item.application ||
                                "N/A"}
                            </strong>
                            {item.classification_category && (
                              <div className="text-sm text-gray-600 ml-2 mt-1">
                                <span className="block">
                                  <strong>Category:</strong>{" "}
                                  {item.classification_category}
                                </span>
                                {item.classification_sub_category && (
                                  <span className="block">
                                    <strong>Sub-Category:</strong>{" "}
                                    {item.classification_sub_category}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))
                ) : (
                  <li className="bg-[#ebe3f3] p-3 text-center text-gray-500">
                    No items available for this level
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="text-gray-400 italic text-center">
              Select a proficiency level
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative h-screen overflow-auto hide-scroll">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        {/* ✅ Conditionally render header */}
        {showHeader && (
          <>
            {/* header parts start  */}
            <div className="flex w-full">
              {/* Left: GIF */}
              <div className="w-[10%] bg-gradient-to-b from-violet-100 to-violet-200 p-2 rounded-l-lg">
                <img
                  src={`/assets/loading/robo_dance.gif`}
                  alt="Loading..."
                  className="w-full h-auto"
                />
              </div>

              {/* Center Content */}
              <div className="w-[70%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 flex justify-center">
                <div className="heade">
                  <h2 className="text-gray-800 font-bold text-lg">
                    <b>Knowledge Name : </b>
                    {viewData?.title}
                  </h2>
                  {/* <h5 className="text-gray-600 font-semibold text-sm">
                    <b>Industry : </b>
                    {sessionOrgType}
                  </h5> */}
                  <h5 className="text-gray-600 font-semibold text-sm">
                    <b>Category : </b>
                    {viewData?.category}
                  </h5>
                  <h5 className="text-gray-600 font-semibold text-sm">
                    <b>Sub Category : </b>
                    {viewData?.sub_category}
                  </h5>
                </div>
              </div>

              {/* Right Level */}
              <div className="w-[20%] bg-gradient-to-br from-violet-200 to-violet-100 p-4 rounded-r-lg flex flex-col items-center justify-center space-y-2">
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex justify-between w-full rounded-lg border-2 border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition duration-200 shadow-sm"
                  >
                    <span className="flex items-center">
                      <span className="mdi mdi-cog-outline mr-2"></span>
                      Actions
                    </span>
                    <svg
                      className="h-5 w-5 text-violet-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <ul className="absolute z-10 mt-2 w-full rounded-lg bg-white border border-violet-100 shadow-lg py-1 text-sm">
                      <li
                        onClick={() =>
                          setDialogOpen({ ...dialogOpen, edit: true })
                        }
                        className="flex items-center px-4 py-2.5 hover:bg-violet-50 cursor-pointer text-violet-700 border-b border-violet-100"
                      >
                        <span className="mdi mdi-note-edit-outline mr-2"></span>
                        Edit Knowledge
                      </li>
                      <li
                        onClick={() => handleDelete(knowledgeId)}
                        className="flex items-center px-4 py-2.5 hover:bg-violet-50 cursor-pointer text-red-600"
                      >
                        <span className="mdi mdi-delete mr-2"></span>
                        Delete Knowledge
                      </li>
                    </ul>
                  )}
                  {dialogOpen.edit && (
                    <EditDialog
                      skillId={knowledgeId}
                      onClose={() =>
                        setDialogOpen({ ...dialogOpen, edit: false })
                      }
                      onSuccess={() => {
                        fetch(
                          `${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}`
                        )
                          .then((res) => res.json())
                          .then((data) => {});
                        setDialogOpen({ ...dialogOpen, edit: false });
                      }}
                    />
                  )}
                </div>

                <button
                  onClick={() => handleCousreCreation()}
                  className="flex items-center justify-center space-x-2 w-full rounded-lg border-2 border-yellow-300 bg-white px-1 py-1 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 transition duration-200 shadow-sm"
                >
                  <span className="mdi mdi-creation text-xl"></span>
                  <span>Build Course</span>
                </button>
              </div>
            </div>
            {/* header parts end  */}
          </>
        )}

        {/* table Data parts start  */}
        <div
          className="w-[100%] bg-gradient-to-b from-blue-200 to-blue-100 p-2 rounded-lg mt-4"
          id="printData"
        >
          <div
            className={`grid gap-6 p-4 ${
              viewMode === "kaab-only" ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {cardData
              .filter(
                (card) =>
                  viewMode !== "kaab-only" || [3, 4, 6, 7].includes(card.id)
              ) // ✅ Show only KAAB cards in kaab-only mode
              .map((card, index) => (
                <div
                  key={`card` + index}
                  className="flex relative mx-auto w-[250px] h-[120px] bg-white shadow-[5px_5px_60px_rgb(235,235,235),-5px_-5px_60px_rgb(237,237,237)] rounded-[15px] transition-all duration-[2s] items-center justify-center cursor-pointer group overflow-hidden"
                  onClick={() => handleCardClick(card.id)}
                >
                  {/* Card Title */}
                  <div className="flex flex-col items-center justify-center w-full">
                    <img
                      src={`/${card.images}`}
                      alt={card.title}
                      className="w-[80px] group-hover:opacity-[10] z-[20]"
                    />
                    <h4 className="text-[#2060E6] font-semibold text-center w-full z-[20]">
                      {card.title}
                    </h4>
                  </div>

                  {/* Circle element - adjust its absolute positioning as needed */}
                  <div className="absolute z-[10] left-0 bottom-0 w-[52px] h-[60px] bg-[#FFDB97] rounded-[0px_50px_0px_15px] transition-all duration-500 group-hover:w-[250px] group-hover:h-[120px] group-hover:rounded-[15px] group-hover:opacity-[0.5]"></div>
                </div>
              ))}
          </div>

          <div className="w-[100%] p-8">
            {/* ✅ Show only KAAB content when in kaab-only mode */}
            {viewMode === "kaab-only" ? (
              <>
                {activeCardIndex === 3 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                        <b>KNOWLEDGE SKILL</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("knowledge")}
                  </div>
                )}
                {activeCardIndex === 4 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                        <b>KNOWLEDGE ABILITY</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("ability")}
                  </div>
                )}
                {activeCardIndex === 6 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                        <b>KNOWLEDGE ATTITUDE</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("attitude")}
                  </div>
                )}
                {activeCardIndex === 7 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                        <b>KNOWLEDGE BEHAVIOUR</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("behaviour")}
                  </div>
                )}
              </>
            ) : (
              // ✅ Show all content when in full mode (existing code)
              <>
                {activeCardIndex === 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                          <b>Knowledge Details</b>
                      </h2>
                    </div>
                    <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                      {/* ... existing Skill Details content ... */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Category
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.category ? viewData.category : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Sub Category
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.sub_category ? viewData.sub_category : "-"}
                        </p>
                      </div> */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Micro Category
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.micro_category
                            ? viewData.micro_category
                            : "-"}
                        </p>
                      </div> */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Name
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.title ? viewData.title : "-"}
                        </p>
                      </div> */}
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Description
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.description ? viewData.description : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          Related Skills
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        {relatedSkills && !empty(relatedSkills) ? (
                          relatedSkills.map((skill, index) => (
                            <ul
                              key={`related` + index}
                              className="skill-item px-4"
                            >
                              <li className="list-disc text-[12px]">{skill}</li>
                            </ul>
                          ))
                        ) : (
                          <p className="text-[12px]">-</p>
                        )}
                      </div>
                        <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Tags
                          </h4>
                          <hr className="text-[#ddd] pt-2" />
                          <p className="text-[12px]">
                            {viewData.knowledge_tags ? viewData.knowledge_tags : "-"}
                          </p>
                        </div>
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Custom Tags
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        {customTags && !empty(customTags)
                          ? customTags.map((skill, index) => (
                              <ul
                                key={`tags` + index}
                                className="skill-item px-4"
                              >
                                <li className="list-disc text-[12px]">
                                  {skill}
                                </li>
                              </ul>
                            ))
                          : "-"}
                      </div> */}
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Business Links
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px] break-words">
                            {viewData.business_link ? (
                              viewData.business_link.startsWith('http') ? (
                                <a
                                  href={viewData.business_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline break-words"
                                >
                                  {viewData.business_link}
                                </a>
                              ) : (
                                viewData.business_link
                              )
                            ) : "-"}
                        </p>
                      </div>
                      {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                   <h4 className="text-[14px] text-[#2060E6] font-bold">Proficiency Level</h4>
                   <hr className="text-[#ddd] pt-2" />
                   <p className="text-[12px]">{viewData.proficiency_level ? viewData.proficiency_level : '-'}</p>
                 </div> */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Learning Resource
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.learning_resources
                            ? viewData.learning_resources
                            : "-"}
                        </p>
                      </div> */}
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Assessment Method
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                            {viewData.assessment_method
                              ? viewData.assessment_method
                            : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Knowledge Certification Options
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                            {viewData.certification_options
                              ? viewData.certification_options
                            : "-"}
                        </p>
                      </div>
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Experience/Project
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p>
                          {viewData.experience_project
                            ? viewData.experience_project
                            : "-"}
                        </p>
                      </div> */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Maps
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.skill_maps ? viewData.skill_maps : "-"}
                        </p>
                      </div>

                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Status
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.skill_status ? viewData.skill_status : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Importance
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.skill_importance
                            ? viewData.skill_importance
                            : "-"}
                        </p>
                      </div> */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Legel/Compliance Relevance
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.legal_compliance_relevance
                            ? viewData.legal_compliance_relevance
                            : "-"}
                        </p>
                      </div> */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE SOP Practice Link
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.sop_practice_link
                            ? viewData.sop_practice_link
                            : "-"}
                        </p>
                      </div> */}
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          Knowledge Performance Metrics
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.performance_metrics
                            ? viewData.performance_metrics
                            : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          Knowledge Common Errors Tips
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.common_errors_tips
                            ? viewData.common_errors_tips
                            : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          Knowledge SME/Help Contacts
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.sme_contacts ? viewData.sme_contacts : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          Sub-Knowledges
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.sub_skills ? viewData.sub_skills : "-"}
                        </p>
                      </div> */}

                        <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                          <h4 className="text-[14px] text-[#2060E6] font-bold">
                            Compliance Relevance
                          </h4>
                          <hr className="text-[#ddd] pt-2" />
                          <p className="text-[12px]">
                            {viewData.compliance_relevance ? viewData.compliance_relevance : "-"}
                          </p>
                        </div>
                        {/* <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Workflow/Mindmap
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.skill_flow ? viewData.skill_flow : "-"}
                        </p>
                      </div>
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h4 className="text-[14px] text-[#2060E6] font-bold">
                          KNOWLEDGE Tasklist
                        </h4>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]">
                          {viewData.tasklist ? viewData.tasklist : "-"}
                        </p>
                      </div> */}
                    </div>
                  </div>
                )}
                {activeCardIndex === 1 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                          <b>Knowledge Jobrole</b>
                      </h2>
                    </div>
                    {jobroleData && jobroleData.length > 0 ? (
                      <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                        {jobroleData.map((jobrole, index) => (
                          <div
                            key={index}
                            className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]"
                          >
                            <p className="text-[12px]">
                              <span>
                                <b>Category : </b>
                              </span>
                              {jobrole.jobrole_category
                                ? jobrole.jobrole_category
                                : "-"}
                            </p>
                            <h2
                              className="text-[14px] h-[48px] text-[#2060E6] font-bold"
                              data-titleHead={
                                jobrole.jobrole ? jobrole.jobrole : "-"
                              }
                            >
                              {" "}
                              {jobrole.jobrole
                                ? jobrole.jobrole.slice(0, 50) +
                                  (jobrole.jobrole.length > 50 ? "..." : "")
                                : "-"}
                            </h2>
                            <hr className="text-[#ddd] pt-2" />
                            <p
                              className="text-[12px]"
                              data-titleHead={jobrole.description}
                            >
                              <span>
                                <b>Jobrole Description : </b>
                              </span>
                              {jobrole.description
                                ? jobrole.description.slice(0, 150) +
                                  (jobrole.description.length > 150
                                    ? "..."
                                    : "")
                                : "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm mt-4">
                        No Data Found
                      </div>
                    )}
                  </div>
                )}
                {activeCardIndex === 2 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                          <b>Knowledge Level</b>
                      </h2>
                    </div>
                    {proficiencyLevel && proficiencyLevel.length > 0 ? (
                      <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                        {proficiencyLevel.map((proficiencyLevel, index) => (
                          <div
                            key={index}
                            className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]"
                          >
                            <h2
                              className="text-[14px] h-[48px] text-[#2060E6] font-bold"
                              title={
                                proficiencyLevel.proficiency_level
                                  ? proficiencyLevel.proficiency_level
                                  : "-"
                              }
                            >
                              {proficiencyLevel.proficiency_level
                                ? proficiencyLevel.proficiency_level.slice(
                                    0,
                                    50
                                  ) +
                                  (proficiencyLevel.proficiency_level.length >
                                  50
                                    ? "..."
                                    : "")
                                : "-"}
                            </h2>
                            <hr className="text-[#ddd] pt-2" />
                            <p className="text-[12px]">
                              <span>
                                <b>Level Description :</b>
                              </span>{" "}
                              {proficiencyLevel.description || "-"}
                            </p>
                            <p className="text-[12px]">
                              <span>
                                <b>Level Type :</b>
                              </span>{" "}
                              {proficiencyLevel.proficiency_type || "-"}
                            </p>
                            <p className="text-[12px]">
                              <span>
                                <b>Type Description :</b>
                              </span>{" "}
                              {proficiencyLevel.type_description || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm mt-4">
                        No Data Found
                      </div>
                    )}
                  </div>
                )}
                {activeCardIndex === 3 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                          <b>Knowledge Skill</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("knowledge")}
                  </div>
                )}
                {activeCardIndex === 4 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                          <b>Knowledge Ability</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("ability")}
                  </div>
                )}
                  {/* {activeCardIndex === 5 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                        <b>KNOWLEDGE APPLICATION</b>
                      </h2>
                    </div>
                    {applicationLevel.length > 0 ? (
                      <>
                        <div className="flex justify-center mt-4 flex-wrap gap-2">
                          {applicationLevel.map((applicationValue, index) => (
                            <button
                              key={`ApplicationTab-${index}`}
                              onClick={() =>
                                setActiveApplicationTab(
                                  applicationValue.proficiency_level
                                )
                              }
                              className={`px-3 py-1 text-lg font-bold mr-6 rounded-md border shadow-lg shadow-blue-300/30 transition ${
                                activeApplicationTab ===
                                applicationValue.proficiency_level
                                  ? "bg-[#dfd9ff] text-[#4135ff] border-blue-500 shadow-blue-500/50"
                                  : "bg-[#e7efff] text-gray-700 border-[#c1d2f7]"
                              }`}
                            >
                              {applicationValue.proficiency_level}
                            </button>
                          ))}
                        </div>

                        <div className="w-full mt-6 p-4 border border-[#c1d2f7] rounded-lg shadow-lg shadow-blue-400/50">
                          {applicationLevel.find(
                            (k) => k.proficiency_level === activeApplicationTab
                          ) ? (
                            <div>
                              <ul className="space-y-1">
                                {applicationLevel.find(
                                  (k) =>
                                    k.proficiency_level === activeApplicationTab
                                )?.items?.length > 0 ? (
                                  applicationLevel
                                    .find(
                                      (k) =>
                                        k.proficiency_level ===
                                        activeApplicationTab
                                    )
                                    ?.items.map(
                                      (
                                        itemVal: applicationItem,
                                        itemIndex: number
                                      ) => (
                                        <li
                                          className="bg-[#ebe3f3] p-2 rounded-lg mb-4"
                                          key={itemIndex}
                                        >
                                          <i
                                            className="fa fa-chevron-circle-right mr-1"
                                            aria-hidden="true"
                                          ></i>
                                          {itemVal.application}
                                        </li>
                                      )
                                    )
                                ) : (
                                  <li className="bg-[#ebe3f3] p-2">
                                    No items available
                                  </li>
                                )}
                              </ul>
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">
                              Select a proficiency level
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 text-sm mt-4">
                        No Data Found
                      </div>
                    )}
                  </div>
                )} */}
                {activeCardIndex === 6 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                          <b>Knowledge Attitude</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("attitude")}
                  </div>
                )}
                {activeCardIndex === 7 && (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                      <h2 className="text-[20px] text-[#2060E6] text-center font-semibold">
                          <b>Knowledge Behaviour</b>
                      </h2>
                    </div>
                    {renderKaabWithProficiencyLevels("behaviour")}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewKnowledge;
