// import React, { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";

// interface Skill {
//   ability: any[];
//   category: string;
//   description: string;
//   jobrole: string;
//   jobrole_skill_id: number;
//   knowledge: any[];
//   behaviour: any[];
//   attitude: any[];
//   proficiency_level: string;
//   skill: string;
//   skill_id: number;
//   sub_category: string;
//   title: string;
// }

// interface JobroleSkilladd1Props {
//   skills: Skill[];
// }

// interface ValidationState {
//   knowledge: Record<string, string>; // attribute: "yes" or "no"
//   ability: Record<string, string>;
//   behaviour: Record<string, string>;
//   attitude: Record<string, string>;
// }

// export default function Index({ skills }: JobroleSkilladd1Props) {
//   const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
//   const [selectedSkill, setSelectedSkill] = useState<Skill | null>(
//     skills.length > 0 ? skills[0] : null
//   );
//   const [sessionData, setSessionData] = useState<Record<string, unknown>>({});
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [selectedImage, setSelectedImage] = useState("/image 16.png");
//   const [opacity, setOpacity] = useState(1);
//   const [showDetails, setShowDetails] = useState(false);
//   const [SkillLevels, setSkillLevels] = useState([]);
//   const [selectedSkillLevel, setSelectedSkillLevel] = useState("");
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [validationState, setValidationState] = useState<ValidationState>({
//     knowledge: {},
//     ability: {},
//     behaviour: {},
//     attitude: {}
//   });

//   const [attrArray, setAttrArray] = useState([
//     { title: "knowledge", icon: "mdi-library" },
//     { title: "ability", icon: "mdi-hand-okay" },
//     { title: "behaviour", icon: "mdi-account-child" },
//     { title: "attitude", icon: "mdi-emoticon" },
//   ]);

//   // Load user session data from localStorage
//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       const {
//         APP_URL,
//         token,
//         org_type,
//         sub_institute_id,
//         user_id,
//         user_profile_name,
//       } = JSON.parse(userData);
//       setSessionData({
//         url: APP_URL,
//         token,
//         orgType: org_type,
//         subInstituteId: sub_institute_id,
//         userId: user_id,
//         userProfile: user_profile_name,
//       });
//     }
//   }, []);

//   // Fetch initial data once session is ready
//   useEffect(() => {
//     if (sessionData.url && sessionData.token) {
//       fetchInitialData(); // get data from skill level rate
//     }
//   }, [sessionData]);

//   // get data from skill level rate
//   const fetchInitialData = async () => {
//     try {
//       const response = await fetch(
//         `${sessionData.url}/table_data?table=s_proficiency_levels&filters[sub_institute_id]=${sessionData.subInstituteId}`,
//         {
//           method: "GET",
//         }
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setSkillLevels(data);
//         if (data.length > 0) {
//           setSelectedSkillLevel(data[0]?.proficiency_level || "");
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching initial data:", error);
//     }
//   };

//   const handleValidation = (
//     type: "knowledge" | "ability" | "behaviour" | "attitude",
//     attribute: string,
//     isValid: boolean
//   ) => {
//     setValidationState(prev => ({
//       ...prev,
//       [type]: {
//         ...prev[type],
//         [attribute]: isValid ? "yes" : "no"
//       }
//     }));

//     setShowSuccess(true);
//     setTimeout(() => setShowSuccess(false), 1000);
//   };

//   const moveToNextSkill = () => {
//     if (currentSkillIndex < skills.length - 1) {
//       const nextIndex = currentSkillIndex + 1;
//       setCurrentSkillIndex(nextIndex);
//       setSelectedSkill(skills[nextIndex]);
//       // Reset validation state for new skill
//       setValidationState({
//         knowledge: {},
//         ability: {},
//         behaviour: {},
//         attitude: {}
//       });
//     } else {
//       // Last skill completed
//       // You can add any completion logic here
//     }

//     // Reset the image and processing state
//     setSelectedImage("/image 16.png");
//     setIsProcessing(false);
//   };

//   const handleSubmit = async () => {
//     if (!selectedSkill || !selectedSkillLevel) {
//       alert("Please select a skill level");
//       return;
//     }

//     setIsProcessing(true);
//     setOpacity(0);

//     setTimeout(() => {
//       setSelectedImage("/Illustration.png");
//       setOpacity(1);
//     }, 300);

//     try {
//       const formData = {
//         skill_id: selectedSkill.skill_id,
//         skill_level: selectedSkillLevel,
//         knowledge: validationState.knowledge,
//         ability: validationState.ability,
//         behaviour: validationState.behaviour,
//         attitude: validationState.attitude,
//         userId: sessionData.userId,
//         sub_institute_id: sessionData.subInstituteId
//       };

//       console.log("Submitting data:", formData);

//       const response = await fetch(`${sessionData.url}/matrix/save`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${sessionData.token}`
//         },
//         body: JSON.stringify(formData)
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log("Submission successful:", result);
//         setShowSuccess(true);
//         setTimeout(() => setShowSuccess(false), 2000);

//         // Move to next skill after successful API response
//         moveToNextSkill();
//       } else {
//         console.error("Submission failed:", response.statusText);
//         alert("Failed to save skill assessment");
//         // Reset processing state on failure
//         setIsProcessing(false);
//         setSelectedImage("/image 16.png");
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("Error submitting form");
//       // Reset processing state on error
//       setIsProcessing(false);
//       setSelectedImage("/image 16.png");
//     }
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
//             {/* Left Panel */}
//             <div className="w-full xl:w-[280px] min-h-[472px] bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-2">
//               <h2
//                 className="text-[#23395B] font-bold text-md mb-3"
//                 style={{ fontFamily: "Inter, sans-serif" }}
//               >
//                 📈 Skill Proficiency Overview
//               </h2>
//               <div className="w-full h-0.5 bg-[#686868] mb-8"></div>

//               <div className="h-[472] overflow-y-auto hide-scrollbar">
//                 {skills.map((skill, index) => (
//                   <div
//                     key={index}
//                     className="relative group"
//                     onClick={() => {
//                       setSelectedSkill(skill);
//                       setCurrentSkillIndex(index);
//                       // Reset validation state when changing skill
//                       setValidationState({
//                         knowledge: {},
//                         ability: {},
//                         behaviour: {},
//                         attitude: {}
//                       });
//                     }}
//                   >
//                     <div className="w-[12px] h-[32px] bg-[#47A0FF] rounded-r-[4px] absolute -left-[6px] top-[2px] transition-all duration-300 group-hover:w-full group-hover:left-0 group-hover:rounded-none opacity-100 group-hover:opacity-0 group-hover:delay-[0ms]"></div>
//                     <div
//                       className={`h-[36px] flex items-center transition-all duration-300 ${
//                         skill.skill_id === selectedSkill?.skill_id
//                           ? "bg-[#47A0FF] text-white"
//                           : "bg-white group-hover:bg-[#47A0FF] group-hover:text-white"
//                       } mb-1`}
//                     >
//                       <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
//                         <span
//                           className={` text-[12px] truncate group-hover:text-white transition-colors duration-300 ${
//                             skill.skill_id === selectedSkill?.skill_id
//                               ? "text-white"
//                               : "text-[#393939]"
//                           }`}
//                           style={{
//                             fontFamily: "Inter, sans-serif",
//                           }}
//                         >
//                           {skill.skill.length > 20
//                             ? `${skill.skill.slice(0, 20)}...`
//                             : skill.skill}
//                         </span>
//                         <svg
//                           width="16"
//                           height="17"
//                           viewBox="0 0 24 25"
//                           fill="none"
//                           className="group-hover:fill-white transition-colors duration-300"
//                         >
//                           <path
//                             d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z"
//                             fill="#393939"
//                           />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Center Panel */}
//             <div className="w-full flex-1 min-h-[472px] flex flex-col justify-between">
//               <div className="w-full bg-white rounded-2xl p-4 shadow-sm">
//                 <div className="w-full flex justify-between gap-20">
//                   <h1
//                     className="text-[#393939] text-center font-bold text-xl md:text-[14px] text-center mb-12 leading-tight"
//                     style={{ fontFamily: "Inter, sans-serif" }}
//                   >
//                     Are you proficient in {selectedSkill?.skill || "this skill"}?
//                   </h1>
//                   <h1>
//                     <span
//                       className="mdi mdi-information-variant-circle text-2xl"
//                        title="Skill Detail"
//                       onClick={() => setIsEditModalOpen(true)}
//                     ></span>
//                   </h1>
//                 </div>

//                 {/* Illustration */}
//                 <div className="flex justify-center mb-12">
//                   <div className="w-80 h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center relative overflow-hidden">
//                     <img
//                       src={selectedImage}
//                       alt="Validation Illustration"
//                       className="w-full h-full object-cover transition-opacity duration-300"
//                       style={{ opacity: opacity }}
//                     />
//                   </div>
//                 </div>

//                 {/* Skill Level Selection */}
//                 <div className="flex justify-center gap-6">
//                   <div className="dropdownDiv">
//                     <select 
//                       className="w-80 h-10 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow pl-2"
//                       value={selectedSkillLevel}
//                       onChange={(e) => setSelectedSkillLevel(e.target.value)}
//                     >
//                       {SkillLevels.length > 0 &&
//                         SkillLevels.map((val: any, key) => (
//                           <option
//                             key={key}
//                             value={val?.proficiency_level}
//                             title={val?.description}
//                           >
//                             {val?.proficiency_level}
//                           </option>
//                         ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {!showDetails && (
//                 <div className="text-left mt-2">
//                   <div className="flex items-center mb-4">
//                     <span className="mr-2">
//                       Want to rate your skill in detail ?
//                     </span>
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input
//                         type="checkbox"
//                         className="sr-only peer"
//                         onChange={(e) => {
//                           setShowDetails(e.target.checked);
//                         }}
//                       />
//                       <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                     </label>
//                     <button
//                       className="mx-4 px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
//                       onClick={handleSubmit}
//                       title="Click to submit"
//                       disabled={isProcessing}
//                     >
//                       {currentSkillIndex === skills.length - 1 ? "Complete" : "Next"}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           {showSuccess && (
//             <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
//               Skill updated successfully!
//             </div>
//           )}
//         </div>

//         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//           <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
//             <DialogHeader>
//               <DialogTitle>
//                 <span className="mdi mdi-brain"></span> {selectedSkill?.skill}{" "}
//               </DialogTitle>
//             </DialogHeader>
//             <hr className="m-0 mx-2" />
//             <div className="helloDiv">
//               {selectedSkill ? (
//                 <div className="w-full">
//                   <div className="flex gap-4 px-4">
//                     <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
//                       <span className="mdi mdi-briefcase"></span>&nbsp;&nbsp;{" "}
//                       <label htmlFor="Skill Jobrole" className="text-bold">
//                         Skill Jobrole
//                       </label>
//                       <hr className="border-[#aaaaaa] my-2" />
//                       {selectedSkill?.jobrole}
//                     </div>
//                     <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
//                       <span className="mdi mdi-tag-multiple"></span>&nbsp;&nbsp;{" "}
//                       <label htmlFor="Skill Category" className="text-bold">
//                         Skill Category
//                       </label>
//                       <hr className="border-[#aaaaaa] my-2" />
//                       {selectedSkill?.category}
//                     </div>
//                     <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
//                       <span className="mdi mdi-tag"></span>&nbsp;&nbsp;{" "}
//                       <label htmlFor="Skill Sub-Category" className="text-bold">
//                         Skill Sub-Category
//                       </label>
//                       <hr className="border-[#aaaaaa] my-2" />
//                       {selectedSkill?.sub_category}
//                     </div>
//                     <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
//                       <span className="mdi mdi-chart-bar"></span>&nbsp;&nbsp;{" "}
//                       <label
//                         htmlFor="Skill Proficiency Level"
//                         className="text-bold"
//                       >
//                         Skill Proficiency Level
//                       </label>
//                       <hr className="border-[#aaaaaa] my-2" />
//                       {selectedSkill?.proficiency_level}
//                     </div>
//                   </div>

//                   <div className="descriptionDiv px-4 mt-4">
//                     <div className="w-full bg-[#eaf7f2] shadow-lg shadow-green-200/50 p-2 rounded-md">
//                       <span className="mdi mdi-information-variant-circle"></span>
//                       &nbsp;&nbsp;
//                       <label htmlFor="Skill Description" className="text-bold">
//                         Skill Description
//                       </label>
//                       <hr className="border-[#aaaaaa] my-2" />
//                       {selectedSkill?.description}
//                     </div>
//                   </div>

//                   <div className="attributeParts flex gap-4 px-4 mt-4">
//                     {attrArray.map((attr, key) => (
//                       <div
//                         key={key}
//                         className="w-full bg-blue-100 w-1/4 flex rounded-2xl shadow-blue-300/50 shadow-lg relative p-2"
//                       >
//                         <div className="py-2 w-full">
//                           <div className="space-y-6">
//                             <h4 className="font-semibold mb-2">
//                               <span
//                                 className={`mdi ${attr?.icon} text-xl`}
//                               ></span>{" "}
//                               {attr?.title.charAt(0).toUpperCase() +
//                                 attr?.title.slice(1)}
//                               :
//                             </h4>
//                             <hr className="mx-0 mb-2 border-[#000000]" />
//                             <div className="w-full h-[calc(50vh-0px)] overflow-y-auto hide-scrollbar">
//                               {(selectedSkill[
//                                 attr?.title as keyof Skill
//                               ] as any[]) &&
//                                 (
//                                   selectedSkill[
//                                     attr?.title as keyof Skill
//                                   ] as any[]
//                                 ).map((item: any, index: number) => (
//                                   <div
//                                     key={index}
//                                     className="w-full bg-[white] p-2 rounded-lg mb-2"
//                                   >
//                                     <p className="text-sm">{item}</p>
//                                   </div>
//                                 ))}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <p>No Skill details Found</p>
//               )}
//             </div>
//             <DialogFooter>
//               <button
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//               >
//                 Close
//               </button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {showDetails && (
//           <div className="my-6 p-2">
//             {selectedSkill && (
//               <div className="flex flex-wrap gap-3">
//                 {attrArray.map((attr, key) => (
//                   <div
//                     key={key}
//                     className="w-full xl:w-[230px] flex bg-white rounded-2xl shadow-sm relative p-2"
//                   >
//                     <div className="py-2 w-full">
//                       <div className="space-y-6">
//                         <h4 className="font-semibold mb-2">
//                           <span className={`mdi ${attr?.icon} text-xl`}></span>{" "}
//                           {attr?.title.charAt(0).toUpperCase() +
//                             attr?.title.slice(1)}
//                           :
//                         </h4>
//                         <hr className="mx-0 mb-2" />
//                         <div className="w-full h-[calc(40vh-0px)] overflow-y-auto hide-scrollbar">
//                           {(selectedSkill[
//                             attr?.title as keyof Skill
//                           ] as any[]) &&
//                             (
//                               selectedSkill[attr?.title as keyof Skill] as any[]
//                             ).map((item: any, index: number) => (
//                               <div
//                                 key={index}
//                                 className="w-full bg-blue-100 p-2 rounded mb-2"
//                               >
//                                 <p className="text-sm">{item}</p>
//                                 <div className="flex gap-2 mt-2">
//                                   <button
//                                     onClick={() =>
//                                       handleValidation(
//                                         attr?.title as
//                                           | "knowledge"
//                                           | "ability"
//                                           | "behaviour"
//                                           | "attitude",
//                                         item, // Use the actual attribute text as key
//                                         true
//                                       )
//                                     }
//                                     className={`px-3 py-1 rounded hover:bg-green-600 ${
//                                       validationState[attr?.title as keyof ValidationState]?.[item] === "yes"
//                                         ? "bg-green-600 text-white"
//                                         : "bg-green-500 text-white"
//                                     }`}
//                                   >
//                                     Yes
//                                   </button>
//                                   <button
//                                     onClick={() =>
//                                       handleValidation(
//                                         attr?.title as
//                                           | "knowledge"
//                                           | "ability"
//                                           | "behaviour"
//                                           | "attitude",
//                                         item, // Use the actual attribute text as key
//                                         false
//                                       )
//                                     }
//                                     className={`px-3 py-1 rounded hover:bg-red-600 ${
//                                       validationState[attr?.title as keyof ValidationState]?.[item] === "no"
//                                         ? "bg-red-600 text-white"
//                                         : "bg-red-500 text-white"
//                                     }`}
//                                   >
//                                     No
//                                   </button>
//                                 </div>
//                               </div>
//                             ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Next button moved to the end when showDetails is true */}
//             <div className="flex items-center justify-end mt-4">
//               <span className="mr-2">
//                 Want to rate your skill in detail ?
//               </span>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="sr-only peer"
//                   checked={showDetails}
//                   onChange={(e) => {
//                     setShowDetails(e.target.checked);
//                   }}
//                 />
//                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//               </label>
//               <button
//                 className="mx-4 px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
//                 onClick={handleSubmit}
//                 title="Click to submit"
//                 disabled={isProcessing}
//               >
//                 {currentSkillIndex === skills.length - 1 ? "Complete" : "Next"}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ✅ Import AdminSkillRating (make sure this path is correct in your project)
import AdminSkillRating from "./AdminSkillRating";

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

interface JobroleSkilladd1Props {
  skills: Skill[];
  userRatedSkills: any; // Add userRatedSkills prop
}

interface ValidationState {
  knowledge: Record<string, string>; // attribute: "yes" or "no"
  ability: Record<string, string>;
  behaviour: Record<string, string>;
  attitude: Record<string, string>;
}

export default function Index({ skills, userRatedSkills }: JobroleSkilladd1Props) {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(
    skills.length > 0 ? skills[0] : null
  );
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState("/image 16.png");
  const [opacity, setOpacity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [SkillLevels, setSkillLevels] = useState([]);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    knowledge: {},
    ability: {},
    behaviour: {},
    attitude: {},
  });

  const [clickedUser, setClickedUser] = useState<string | null>(null); // Add clickedUser state

  const [attrArray, setAttrArray] = useState([
    { title: "knowledge", icon: "mdi-library" },
    { title: "ability", icon: "mdi-hand-okay" },
    { title: "behaviour", icon: "mdi-account-child" },
    { title: "attitude", icon: "mdi-emoticon" },
  ]);

  // Load user session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const clickedUserData = localStorage.getItem("clickedUser"); // Get clickedUser

    if (userData) {
      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
        user_profile_name,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
      });
    }

    setClickedUser(clickedUserData);
  }, [clickedUser]);

  // Fetch initial data once session is ready
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData(); // get data from skill level rate
      console.log("Session Data:", sessionData); // Debugging line
      console.log("ckicked Data:", clickedUser); // Debugging line

    }
  }, [sessionData]);

  // get data from skill level rate
  const fetchInitialData = async () => {
    try {
      const response = await fetch(
        `${sessionData.url}/table_data?table=s_proficiency_levels&filters[sub_institute_id]=${sessionData.subInstituteId}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSkillLevels(data);
        if (data.length > 0) {
          setSelectedSkillLevel(data[0]?.proficiency_level || "");
        }
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleValidation = (
    type: "knowledge" | "ability" | "behaviour" | "attitude",
    attribute: string,
    isValid: boolean
  ) => {
    setValidationState((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [attribute]: isValid ? "yes" : "no",
      },
    }));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
  };

  const moveToNextSkill = () => {
    if (currentSkillIndex < skills.length - 1) {
      const nextIndex = currentSkillIndex + 1;
      setCurrentSkillIndex(nextIndex);
      setSelectedSkill(skills[nextIndex]);
      // Reset validation state for new skill
      setValidationState({
        knowledge: {},
        ability: {},
        behaviour: {},
        attitude: {},
      });
    } else {
      // Last skill completed
      // You can add any completion logic here
    }

    // Reset the image and processing state
    setSelectedImage("/image 16.png");
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    if (!selectedSkill || !selectedSkillLevel) {
      alert("Please select a skill level");
      return;
    }

    setIsProcessing(true);
    setOpacity(0);

    setTimeout(() => {
      setSelectedImage("/Illustration.png");
      setOpacity(1);
    }, 300);

    try {
      // Use clickedUser if available, otherwise fall back to session user ID
      const userIdToUse = clickedUser || sessionData.userId;

      const formData = {
        skill_id: selectedSkill.skill_id,
        skill_level: selectedSkillLevel,
        knowledge: validationState.knowledge,
        ability: validationState.ability,
        behaviour: validationState.behaviour,
        attitude: validationState.attitude,
        userId: userIdToUse, // Use the appropriate user ID
        sub_institute_id: sessionData.subInstituteId,
      };

      // console.log("Submitting data:", formData);

      const response = await fetch(`${sessionData.url}/matrix/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        // console.log("Submission successful:", result);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        // Move to next skill after successful API response
        moveToNextSkill();
      } else {
        console.error("Submission failed:", response.statusText);
        alert("Failed to save skill assessment");
        // Reset processing state on failure
        setIsProcessing(false);
        setSelectedImage("/image 16.png");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
      // Reset processing state on error
      setIsProcessing(false);
      setSelectedImage("/image 16.png");
    }
  };

  // ✅ Conditional Rendering
  // if (sessionData.userId == clickedUser) {
  //   return <AdminSkillRating />;
  // }
  if (String(sessionData.userId) === String(clickedUser)) {
    // show skill rating page
  } else {
    return <AdminSkillRating skills={skills}
      userRatedSkills={userRatedSkills} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
            {/* Left Panel */}
            <div className="w-full xl:w-[280px] min-h-[472px] bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-2">
              <h2
                className="text-[#23395B] font-bold text-md mb-3"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                📈 Skill Proficiency Overview
              </h2>
              <div className="w-full h-0.5 bg-[#686868] mb-8"></div>

              <div className="h-[472] overflow-y-auto hide-scrollbar">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="relative group"
                    onClick={() => {
                      setSelectedSkill(skill);
                      setCurrentSkillIndex(index);
                      // Reset validation state when changing skill
                      setValidationState({
                        knowledge: {},
                        ability: {},
                        behaviour: {},
                        attitude: {}
                      });
                    }}
                  >
                    <div className="w-[12px] h-[32px] bg-[#47A0FF] rounded-r-[4px] absolute -left-[6px] top-[2px] transition-all duration-300 group-hover:w-full group-hover:left-0 group-hover:rounded-none opacity-100 group-hover:opacity-0 group-hover:delay-[0ms]"></div>
                    <div
                      className={`h-[36px] flex items-center transition-all duration-300 ${skill.skill_id === selectedSkill?.skill_id
                        ? "bg-[#47A0FF] text-white"
                        : "bg-white group-hover:bg-[#47A0FF] group-hover:text-white"
                        } mb-1`}
                    >
                      <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
                        <span
                          className={` text-[12px] truncate group-hover:text-white transition-colors duration-300 ${skill.skill_id === selectedSkill?.skill_id
                            ? "text-white"
                            : "text-[#393939]"
                            }`}
                          style={{
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {skill.skill.length > 20
                            ? `${skill.skill.slice(0, 20)}...`
                            : skill.skill}
                        </span>
                        <svg
                          width="16"
                          height="17"
                          viewBox="0 0 24 25"
                          fill="none"
                          className="group-hover:fill-white transition-colors duration-300"
                        >
                          <path
                            d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z"
                            fill="#393939"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Panel */}
            <div className="w-full flex-1 min-h-[472px] flex flex-col justify-between">
              <div className="w-full bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-full flex justify-between gap-20">
                  <h1
                    className="text-[#393939] text-center font-bold text-xl md:text-[14px] text-center mb-12 leading-tight"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Are you proficient in {selectedSkill?.skill || "this skill"}?
                  </h1>
                  <h1>
                    <span
                      className="mdi mdi-information-variant-circle text-2xl"
                      title="Skill Detail"
                      onClick={() => setIsEditModalOpen(true)}
                    ></span>
                  </h1>
                </div>

                {/* Illustration */}
                <div className="flex justify-center mb-12">
                  <div className="w-80 h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center relative overflow-hidden">
                    <img
                      src={selectedImage}
                      alt="Validation Illustration"
                      className="w-full h-full object-cover transition-opacity duration-300"
                      style={{ opacity: opacity }}
                    />
                  </div>
                </div>

                {/* Skill Level Selection */}
                <div className="flex justify-center gap-6">
                  <div className="dropdownDiv">
                    <select
                      className="w-80 h-10 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow pl-2"
                      value={selectedSkillLevel}
                      onChange={(e) => setSelectedSkillLevel(e.target.value)}
                    >
                      {SkillLevels.length > 0 &&
                        SkillLevels.map((val: any, key) => (
                          <option
                            key={key}
                            value={val?.proficiency_level}
                            title={val?.description}
                          >
                            {val?.proficiency_level}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {!showDetails && (
                <div className="text-left mt-2">
                  <div className="flex items-center mb-4">
                    <span className="mr-2">
                      Want to rate your skill in detail ?
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        onChange={(e) => {
                          setShowDetails(e.target.checked);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      className="mx-4 px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
                      onClick={handleSubmit}
                      title="Click to submit"
                      disabled={isProcessing}
                    >
                      {currentSkillIndex === skills.length - 1 ? "Complete" : "Next"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {showSuccess && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              Skill updated successfully!
            </div>
          )}
        </div>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
            <DialogHeader>
              <DialogTitle>
                <span className="mdi mdi-brain"></span> {selectedSkill?.skill}{" "}
              </DialogTitle>
            </DialogHeader>
            <hr className="m-0 mx-2" />
            <div className="helloDiv">
              {selectedSkill ? (
                <div className="w-full">
                  <div className="flex gap-4 px-4">
                    <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                      <span className="mdi mdi-briefcase"></span>&nbsp;&nbsp;{" "}
                      <label htmlFor="Skill Jobrole" className="text-bold">
                        Skill Jobrole
                      </label>
                      <hr className="border-[#aaaaaa] my-2" />
                      {selectedSkill?.jobrole}
                    </div>
                    <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                      <span className="mdi mdi-tag-multiple"></span>&nbsp;&nbsp;{" "}
                      <label htmlFor="Skill Category" className="text-bold">
                        Skill Category
                      </label>
                      <hr className="border-[#aaaaaa] my-2" />
                      {selectedSkill?.category}
                    </div>
                    <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                      <span className="mdi mdi-tag"></span>&nbsp;&nbsp;{" "}
                      <label htmlFor="Skill Sub-Category" className="text-bold">
                        Skill Sub-Category
                      </label>
                      <hr className="border-[#aaaaaa] my-2" />
                      {selectedSkill?.sub_category}
                    </div>
                    <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                      <span className="mdi mdi-chart-bar"></span>&nbsp;&nbsp;{" "}
                      <label
                        htmlFor="Skill Proficiency Level"
                        className="text-bold"
                      >
                        Skill Proficiency Level
                      </label>
                      <hr className="border-[#aaaaaa] my-2" />
                      {selectedSkill?.proficiency_level}
                    </div>
                  </div>

                  <div className="descriptionDiv px-4 mt-4">
                    <div className="w-full bg-[#eaf7f2] shadow-lg shadow-green-200/50 p-2 rounded-md">
                      <span className="mdi mdi-information-variant-circle"></span>
                      &nbsp;&nbsp;
                      <label htmlFor="Skill Description" className="text-bold">
                        Skill Description
                      </label>
                      <hr className="border-[#aaaaaa] my-2" />
                      {selectedSkill?.description}
                    </div>
                  </div>

                  <div className="attributeParts flex gap-4 px-4 mt-4">
                    {attrArray.map((attr, key) => (
                      <div
                        key={key}
                        className="w-full bg-blue-100 w-1/4 flex rounded-2xl shadow-blue-300/50 shadow-lg relative p-2"
                      >
                        <div className="py-2 w-full">
                          <div className="space-y-6">
                            <h4 className="font-semibold mb-2">
                              <span
                                className={`mdi ${attr?.icon} text-xl`}
                              ></span>{" "}
                              {attr?.title.charAt(0).toUpperCase() +
                                attr?.title.slice(1)}
                              :
                            </h4>
                            <hr className="mx-0 mb-2 border-[#000000]" />
                            <div className="w-full h-[calc(50vh-0px)] overflow-y-auto hide-scrollbar">
                              {(selectedSkill[
                                attr?.title as keyof Skill
                              ] as any[]) &&
                                (
                                  selectedSkill[
                                  attr?.title as keyof Skill
                                  ] as any[]
                                ).map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="w-full bg-[white] p-2 rounded-lg mb-2"
                                  >
                                    <p className="text-sm">{item}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No Skill details Found</p>
              )}
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showDetails && (
          <div className="my-6 p-2">
            {selectedSkill && (
              <div className="flex flex-wrap gap-3">
                {attrArray.map((attr, key) => (
                  <div
                    key={key}
                    className="w-full xl:w-[230px] flex bg-white rounded-2xl shadow-sm relative p-2"
                  >
                    <div className="py-2 w-full">
                      <div className="space-y-6">
                        <h4 className="font-semibold mb-2">
                          <span className={`mdi ${attr?.icon} text-xl`}></span>{" "}
                          {attr?.title.charAt(0).toUpperCase() +
                            attr?.title.slice(1)}
                          :
                        </h4>
                        <hr className="mx-0 mb-2" />
                        <div className="w-full h-[calc(40vh-0px)] overflow-y-auto hide-scrollbar">
                          {(selectedSkill[
                            attr?.title as keyof Skill
                          ] as any[]) &&
                            (
                              selectedSkill[attr?.title as keyof Skill] as any[]
                            ).map((item: any, index: number) => (
                              <div
                                key={index}
                                className="w-full bg-blue-100 p-2 rounded mb-2"
                              >
                                <p className="text-sm">{item}</p>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      handleValidation(
                                        attr?.title as
                                        | "knowledge"
                                        | "ability"
                                        | "behaviour"
                                        | "attitude",
                                        item, // Use the actual attribute text as key
                                        true
                                      )
                                    }
                                    className={`px-3 py-1 rounded hover:bg-green-600 ${validationState[attr?.title as keyof ValidationState]?.[item] === "yes"
                                      ? "bg-green-600 text-white"
                                      : "bg-green-500 text-white"
                                      }`}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleValidation(
                                        attr?.title as
                                        | "knowledge"
                                        | "ability"
                                        | "behaviour"
                                        | "attitude",
                                        item, // Use the actual attribute text as key
                                        false
                                      )
                                    }
                                    className={`px-3 py-1 rounded hover:bg-red-600 ${validationState[attr?.title as keyof ValidationState]?.[item] === "no"
                                      ? "bg-red-600 text-white"
                                      : "bg-red-500 text-white"
                                      }`}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next button moved to the end when showDetails is true */}
            <div className="flex items-center justify-end mt-4">
              <span className="mr-2">
                Want to rate your skill in detail ?
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showDetails}
                  onChange={(e) => {
                    setShowDetails(e.target.checked);
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <button
                className="mx-4 px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
                onClick={handleSubmit}
                title="Click to submit"
                disabled={isProcessing}
              >
                {currentSkillIndex === skills.length - 1 ? "Complete" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}