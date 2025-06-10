import React, { useEffect, useState } from "react";
import EditDialog from "./editDialouge";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { spawn } from "child_process";

interface ViewSkillProps {
  skillId: number;
  formType: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ViewSkill: React.FC<ViewSkillProps> = ({ skillId, formType, onClose }) => {
  const [sessionUrl, setSessionUrl] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [sessionOrgType, setessionOrgType] = useState<string>();
  const [sessionSubInstituteId, setessinSubInstituteId] = useState<string>();
  const [sessionUserID, setessionUserID] = useState<string>();
  const [sessionUserProfile, setessionUserProfile] = useState<string>();
  const [viewData, setViewData] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [relatedSkills, setRelatedSkills] = useState<any[]>([]);
  const [customTags, setCustomTags] = useState<any[]>([]);

  const [jobroleData, setJobroleData] = useState<any[]>([]);
  const [proficiencyLevel, setProficiencyLevel] = useState<any[]>([]);
  const [knowldegeData, setKnowldegeData] = useState<any[]>([]);
  const [abilityData, setAbililtyData] = useState<any[]>([]);
  const [applicationData, setApplicationData] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name } = JSON.parse(userData);
        setSessionUrl(APP_URL);
        setSessionToken(token);
        setessionOrgType(org_type);
        setessinSubInstituteId(sub_institute_id);
        setessionUserID(user_id);
        setessionUserProfile(user_profile_name);
      }
    }
  }, []);

  useEffect(() => {
    if (sessionUrl && sessionToken) {
      // fetch(`${sessionUrl}/skill_library/${skillId}/edit/?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&formType=${formType}`)
      //   .then((res) => res.json())
      //   .then((data) => setViewData(data.editData || null));
      const fetchData = async () => {
        // const res = await fetch(`${sessionUrl}/skill_library/${skillId}/edit/?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&formType=${formType}`);
        // const data = await res.json();
        const res = await fetch(
          `${sessionUrl}/skill_library/${skillId}/edit?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}&formType=${formType}`
        );
        const data = await res.json();
        setViewData(data.editData || null);

        setJobroleData(data.userJobroleData || []);
        setProficiencyLevel(data.userproficiency_levelData || []);
        setKnowldegeData(data.userKnowledgeData || []);
        setAbililtyData(data.userabilityData || []);
        setApplicationData(data.userApplicationData || []);

        if (data.editData?.related_skills) {
          try {
            const parsedRelatedSkills = JSON.parse(data.editData.related_skills);
            // console.log(parsedRelatedSkills);
            setRelatedSkills(parsedRelatedSkills);
          } catch (error) {
            console.error("Error parsing related_skills:", error);
          }
        }

        if (data.editData?.custom_tags) {
          try {
            const parsedCustomTags = JSON.parse(data.editData.custom_tags);
            setCustomTags(parsedCustomTags);
          } catch (error) {
            console.error("Error parsing custom_tags:", error);
          }
        }
        // console.log(data);
      }
      fetchData();
    }
  }, [sessionUrl, sessionToken]);

  if (!viewData) return null;
  const cardData = [
    {
      title: "Skill Details",
      iconClass: "mdi mdi-information-slab-circle",
      images: "assets/skill_images/book.png",
    },
    {
      title: "Jobrole",
      iconClass: "mdi mdi-account-hard-hat",
      images: "assets/skill_images/jobrole.png",
    },
    {
      title: "Proficiency Level",
      iconClass: "mdi mdi-arrow-up-box",
      images: "assets/skill_images/proficiency.png",
    },
    {
      title: "Knowledge",
      iconClass: "mdi mdi-head-snowflake",
      images: "assets/skill_images/knowledge.png",
    },
    {
      title: "Ability",
      iconClass: "mdi mdi-alpha-a-box",
      images: "assets/skill_images/ability.png",
    },
    {
      title: "Application",
      iconClass: "mdi mdi-send",
      images: "assets/skill_images/application.png",
    },
  ];
  const exportPDF = async () => {
    try {
      // Load html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('printData');

      if (!element) {
        console.error('Element not found');
        return;
      }

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#f8fafc' // Match your bg color
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('skill.pdf');

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to autoTable if html2canvas fails
      fallbackPDFExport();
    }
  };

  const fallbackPDFExport = () => {
    const doc = new jsPDF();
    const table = document.getElementById('example');

    if (table) {
      autoTable(doc, {
        html: '#example',
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      doc.save('skill.pdf');
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
  return (
    <div className="fixed inset-0 bg-[var(--background)] backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-md w-4/5 max-w-5xl shadow-lg relative h-screen overflow-auto hide-scroll">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">✖</button>
        {/* header parts start  */}
        <div className="flex w-full">
          {/* Left: GIF */}
          <div className="w-[10%] bg-gradient-to-b from-violet-100 to-violet-200 p-2 rounded-l-lg">
            <img src={`/assets/loading/robo_dance.gif`} alt="Loading..." className="w-full h-auto" />
          </div>

          {/* Center Content */}
          <div className="w-[70%] bg-gradient-to-r from-violet-100 to-violet-200 p-4 text-center">
            <h2 className="text-gray-800 font-bold text-lg">{viewData.title}</h2>
            <h4 className="text-gray-700 font-semibold text-sm">
              ({viewData.category}{viewData.sub_category ? ` > ${viewData.sub_category}` : ''})
            </h4>
          </div>

          {/* Right Dropdown */}
          <div className="w-[20%] bg-gradient-to-br from-violet-200 to-violet-100 p-4 rounded-r-lg flex items-center justify-center">
            <div className="relative w-2/3">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-between w-full rounded-sm border-2 border-blue-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Actions
                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.23 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </button>

              {isOpen && (
                <ul className="absolute z-10 mt-1 w-full rounded-sm bg-white border border-gray-200 shadow-lg py-1 text-sm text-gray-700">
                  <li onClick={() => setDialogOpen({ ...dialogOpen, edit: true })}><button className="w-full text-left px-2 py-2 hover:bg-gray-100 border-b-1 border-[#ddd]"><span className="mdi mdi-note-edit-outline"></span> Edit Skills</button></li>
                  {/* <li onClick={exportPDF}><button className="w-full text-left px-2 py-2 hover:bg-gray-100 border-b-1 border-[#ddd]"> <span className="mdi mdi-download"></span> Export PDF</button></li> */}
                  <li onClick={() => handleDelete(skillId)}><button className="w-full text-left px-2 py-2 hover:bg-gray-100 border-b-1 border-[#ddd]"><span className="mdi mdi-delete"></span> Delete Skill</button></li>
                </ul>
              )}
              {dialogOpen.edit && (
                <EditDialog
                  skillId={skillId}
                  onClose={() => setDialogOpen({ ...dialogOpen, edit: false })}
                  onSuccess={() => {
                    // Refresh data after editing
                    fetch(`${sessionUrl}/skill_library?type=API&token=${sessionToken}&sub_institute_id=${sessionSubInstituteId}&org_type=${sessionOrgType}`)
                      .then(res => res.json())
                      .then(data => { });
                    setDialogOpen({ ...dialogOpen, edit: false });
                  }}
                />
              )}
            </div>
          </div>
        </div>
        {/* header parts end  */}

        {/* table Data parts start  */}
        <div className="w-[100%] bg-gradient-to-b from-blue-200 to-blue-100 p-2 rounded-lg mt-4" id="printData">

          <div className="grid grid-cols-3 gap-6 p-4">
            {cardData.map((card, index) => (
              <div
                key={index} // Using index as key is okay if items don't change order or get added/removed often.
                className="flex relative mx-auto w-[250px] h-[120px] bg-white shadow-[5px_5px_60px_rgb(235,235,235),-5px_-5px_60px_rgb(237,237,237)] rounded-[15px] transition-all duration-[2s] items-center justify-center cursor-pointer group overflow-hidden"
                onClick={() => handleCardClick(index)}
              >
                {/* Card Title */}
                <div className="flex flex-col items-center justify-center w-full">
                  <img
                    src={`${sessionUrl}/${card.images}`}
                    alt={card.title}
                    className="w-[80px] group-hover:opacity-[10] z-[20]"  // Added margin-bottom to create space
                  />
                  <h4 className="text-[#2060E6] font-semibold text-center w-full z-[20]">
                    {card.title}
                  </h4>
                </div>

                {/* Circle element - adjust its absolute positioning as needed */}
                <div className="absolute z-[10] left-0 bottom-0 w-[52px] h-[60px] bg-[#FFDB97] rounded-[0px_50px_0px_15px] transition-all duration-500 group-hover:w-[250px] group-hover:h-[120px] group-hover:rounded-[15px] group-hover:opacity-[0.5]"></div>

                {/* Icon */}
                {/* <span className={`${card.iconClass} absolute left-[8px] bottom-[0px] z-10 text-[30px]`}></span> */}
              </div>
            ))}
          </div>


          <div className="w-[100%] p-8">
            {/* {cardData.map((card, index) => (
            <div key={index}>
              {activeCardIndex === index && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="border-b-[10px] border-[#edbcbc] rounded"><b>{card.title}</b></h4>
                </div>
              )}
            </div>
          ))} */}
            {activeCardIndex === 0 && (
              <div className="bg-white p-4 rounded-lg">
                <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                  <h2 className="text-[20px] text-[#2060E6] text-center font-semibold"><b>Skill DETAILS</b></h2>
                </div>
                <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Category</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.category ? viewData.category : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Sub Category</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.sub_category ? viewData.sub_category : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Skill Name</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.title ? viewData.title : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Skill Description</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.description ? viewData.description : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Related Skills</h4>
                    <hr className="text-[#ddd] pt-2" />
                    {relatedSkills && relatedSkills.map((skill, index) => (
                      <ul key={index} className="skill-item px-4">
                        <li className="list-disc text-[12px]">{skill}</li>
                      </ul>
                    ))}
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Custom Tags</h4>
                    <hr className="text-[#ddd] pt-2" />
                    {customTags.map((skill, index) => (
                      <ul key={index} className="skill-item px-4">
                        <li className="list-disc text-[12px]">{skill}</li>
                      </ul>
                    ))}
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Business Links</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.bussiness_links ? viewData.bussiness_links : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Proficiency Level</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.proficiency_level ? viewData.proficiency_level : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Learning Resource</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.learning_resources ? viewData.learning_resources : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Assesment Method</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.assesment_method ? viewData.assesment_method : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Certification/Qualification</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.certification_qualifications ? viewData.certification_qualifications : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Experience/Project</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p>{viewData.experience_project ? viewData.experience_project : '-'}</p>
                  </div>
                  <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                    <h4 className="text-[14px] text-[#2060E6] font-bold">Skill Maps</h4>
                    <hr className="text-[#ddd] pt-2" />
                    <p className="text-[12px]">{viewData.skill_maps ? viewData.skill_maps : '-'}</p>
                  </div>
                </div>
              </div>
            )}
            {activeCardIndex === 1 && (
              <div className="bg-white p-4 rounded-lg">
                <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                  <h2 className="text-[20px] text-[#2060E6] text-center font-semibold"><b>JOBROLE</b></h2>
                </div>
                {/* {jobroleData.map((item: any) => ({ */}
                {jobroleData && jobroleData.length > 0 ? (
                  <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                    {jobroleData.map((jobrole, index) => (
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h2 className="text-[14px] h-[48px] text-[#2060E6] font-bold" title={jobrole.jobrole ? jobrole.jobrole : '-'}> {jobrole.jobrole
                          ? jobrole.jobrole.slice(0, 50) + (jobrole.jobrole.length > 50 ? "..." : "")
                          : "-"}</h2>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]"><span><b>Category : </b></span>{jobrole.category ? jobrole.category : '-'}</p>
                        <p className="text-[12px]"><span><b>Sub Category : </b></span>{jobrole.sub_category ? jobrole.sub_category : '-'}</p>
                        <p className="text-[12px]"><span><b>Skill Name : </b></span>{jobrole.skillTitle ? jobrole.skillTitle : '-'}</p>
                        <p className="text-[12px]"><span><b>Description : </b></span>{jobrole.description ? jobrole.description : '-'}</p>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm mt-4">No Data Found</div>
                )}
                {/* <h4 className="border-b-[10px] border-[#FFDB97] rounded"><b>JOBROLE</b></h4> */}
              </div>
            )}
            {activeCardIndex === 2 && (
              <div className="bg-white p-4 rounded-lg">
                <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                  <h2 className="text-[20px] text-[#2060E6] text-center font-semibold"><b>PROFICIENCY LEVEL</b></h2>
                </div>
                {proficiencyLevel && proficiencyLevel.length > 0 ? (
                  <div className="cardDetails grid grid-cols-3 gap-6 p-4">

                    {proficiencyLevel.map((proficiencyLevel, index) => (
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h2
                          className="text-[14px] h-[48px] text-[#2060E6] font-bold"
                          title={proficiencyLevel.proficiency_level ? proficiencyLevel.proficiency_level : '-'}
                        >
                          {proficiencyLevel.proficiency_level
                            ? proficiencyLevel.proficiency_level.slice(0, 50) + (proficiencyLevel.proficiency_level.length > 50 ? "..." : "")
                            : "-"}
                        </h2>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]"><span><b>Category :</b></span> {proficiencyLevel.category || '-'}</p>
                        <p className="text-[12px]"><span><b>Sub Category :</b></span> {proficiencyLevel.sub_category || '-'}</p>
                        <p className="text-[12px]"><span><b>Skill Name :</b></span> {proficiencyLevel.skillTitle || '-'}</p>
                        <p className="text-[12px]"><span><b>Description :</b></span> {proficiencyLevel.description || '-'}</p>
                      </div>
                    ))}
                  </div>

                ) : (
                  <div className="text-center text-gray-500 text-sm mt-4">No Data Found</div>
                )}

              </div>
            )}
            {activeCardIndex === 3 && (
              <div className="bg-white p-4 rounded-lg">
                <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                  <h2 className="text-[20px] text-[#2060E6] text-center font-semibold"><b>KNOWLEDGE</b></h2>
                </div>
                {knowldegeData && knowldegeData.length > 0 ? (
                  <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                    {knowldegeData.map((knowldegeData, index) => (
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h2 className="text-[14px] h-[48px] text-[#2060E6] font-bold" title={knowldegeData.classification_item ? knowldegeData.classification_item : '-'}> {knowldegeData.classification_item
                          ? knowldegeData.classification_item.slice(0, 50) + (knowldegeData.classification_item.length > 50 ? "..." : "")
                          : "-"}</h2>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]"><span><b>Category :</b></span>{knowldegeData.category ? knowldegeData.category : '-'}</p>
                        <p className="text-[12px]"><span><b>Sub Category :</b></span>{knowldegeData.sub_category ? knowldegeData.sub_category : '-'}</p>
                        <p className="text-[12px]"><span><b>Skill Name :</b></span>{knowldegeData.skillTitle ? knowldegeData.skillTitle : '-'}</p>
                        <p className="text-[12px]"><span><b>Proficiency Level :</b></span>{knowldegeData.proficiency_level ? knowldegeData.proficiency_level : '-'}</p>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm mt-4">No Data Found</div>
                )}
              </div>
            )}
            {activeCardIndex === 4 && (
              <div className="bg-white p-4 rounded-lg">
                <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                  <h2 className="text-[20px] text-[#2060E6] text-center font-semibold"><b>ABILITY</b></h2>
                </div>
                {abilityData && abilityData.length > 0 ? (

                  <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                    {abilityData.map((abilityData, index) => (
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h2 className="text-[14px] h-[48px] text-[#2060E6] font-bold" title={abilityData.classification_item ? abilityData.classification_item : '-'}> {abilityData.classification_item
                          ? abilityData.classification_item.slice(0, 50) + (abilityData.classification_item.length > 50 ? "..." : "")
                          : "-"}</h2>
                        <hr className="text-[#ddd] pt-2" /><p className="text-[12px]"><span><b>Category :</b></span>{abilityData.category ? abilityData.category : '-'}</p>
                        <p className="text-[12px]"><span><b>Sub Category :</b></span>{abilityData.sub_category ? abilityData.sub_category : '-'}</p>
                        <p className="text-[12px]"><span><b>Skill Name :</b></span>{abilityData.skillTitle ? abilityData.skillTitle : '-'}</p>
                        <p className="text-[12px]"><span><b>Proficiency Level :</b></span>{abilityData.proficiency_level ? abilityData.proficiency_level : '-'}</p>


                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm mt-4">No Data Found</div>
                )}
              </div>
            )}
            {activeCardIndex === 5 && (
              <div className="bg-white p-4 rounded-lg">
                <div className="cardTitle border-b-[5px] border-[#FFDB97] rounded pb-2">
                  <h2 className="text-[20px] text-[#2060E6] text-center font-semibold"><b>APPLICATION</b></h2>
                </div>
                {applicationData && applicationData.length > 0 ? (

                  <div className="cardDetails grid grid-cols-3 gap-6 p-4">
                    {applicationData.map((applicationData, index) => (
                      <div className="cardData border-2 border-[#E6E6E6] shadow-[4px_8px_8px_-1px_rgba(173,216,230,1),4px_8px_8px_-1px_rgba(173,216,230,1)] bg-[#F7FAFC] p-4 rounded-lg transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(173,216,230,0.3),0_4px_6px_-2px_rgba(173,216,230,0.2)]">
                        <h2 className="text-[14px] h-[48px] text-[#2060E6] font-bold" title={applicationData.application ? applicationData.application : '-'}> {applicationData.application
                          ? applicationData.application.slice(0, 50) + (applicationData.application.length > 50 ? "..." : "")
                          : "-"}</h2>
                        <hr className="text-[#ddd] pt-2" />
                        <p className="text-[12px]"><span><b>Proficiency Level :</b></span>{applicationData.proficiency_level ? applicationData.proficiency_level : '-'}</p>
                        <p className="text-[12px]"><span><b>Category :</b></span>{applicationData.category ? applicationData.category : '-'}</p>
                        <p className="text-[12px]"><span><b>Sub Category :</b></span>{applicationData.sub_category ? applicationData.sub_category : '-'}</p>
                        <p className="text-[12px]"><span><b>Skill Name :</b></span>{applicationData.skillTitle ? applicationData.skillTitle : '-'}</p>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm mt-4">No Data Found</div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* table Data parts start  */}

      </div>
    </div>
  );
};

export default ViewSkill;
