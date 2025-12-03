"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AdminSkillRating from "./AdminSkillRating";
import { useRouter } from "next/navigation";

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
  userRatedSkills: any;
  setUserRatedSkills: React.Dispatch<React.SetStateAction<any[]>>;
  clickedUser: any;
  userJobroleSkills: any;
}

interface ValidationState {
  knowledge: Record<string, string>;
  ability: Record<string, string>;
  behaviour: Record<string, string>;
  attitude: Record<string, string>;
}

interface SkillTempData {
  selectedLevelIndex: number | null;
  selectedSkillLevel: string;
  validationState: ValidationState;
  showDetails: boolean;
}

interface ProficiencyLevel {
  proficiency_level: string;
  description: string;
  proficiency_type?: string;
}

export default function Index({ 
  skills, 
  userRatedSkills, 
  setUserRatedSkills,
  clickedUser, 
  userJobroleSkills 
}: JobroleSkilladd1Props) {
  const router = useRouter();
  const [currentSkillIndex, setCurrentSkillIndex] = useState<number>(0);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(
    userJobroleSkills.length > 0 ? userJobroleSkills[0] : null
  );
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("/image 16.png");
  const [opacity, setOpacity] = useState<number>(1);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [SkillLevels, setSkillLevels] = useState<ProficiencyLevel[]>([]);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [viewPart, setViewPart] = useState<any>("chart Box");
  const [activeTab, setActiveTab] = useState<string>("knowledge");

  const [validationState, setValidationState] = useState<ValidationState>({
    knowledge: {},
    ability: {},
    behaviour: {},
    attitude: {},
  });
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(null);

  const [skillTempData, setSkillTempData] = useState<Record<number, SkillTempData>>({});

  const [attrArray] = useState([
    { title: "knowledge", icon: "mdi-library" },
    { title: "ability", icon: "mdi-hand-okay" },
    { title: "behaviour", icon: "mdi-account-child" },
    { title: "attitude", icon: "mdi-emoticon" },
  ]);

  // Use localStorage to persist rated skills
  const [localRatedSkills, setLocalRatedSkills] = useState<any[]>([]);

  // Initialize localRatedSkills from props and localStorage
  useEffect(() => {
    const storedRatedSkills = localStorage.getItem(`ratedSkills_${clickedUser}`);
    if (storedRatedSkills) {
      try {
        const parsedSkills = JSON.parse(storedRatedSkills);
        setLocalRatedSkills(parsedSkills);
        // Also update parent state
        setUserRatedSkills(parsedSkills);
      } catch (error) {
        console.error("Error parsing stored rated skills:", error);
      }
    } else if (userRatedSkills && userRatedSkills.length > 0) {
      setLocalRatedSkills(userRatedSkills);
      localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(userRatedSkills));
    }
  }, [userRatedSkills, clickedUser, setUserRatedSkills]);

  // Save to localStorage whenever localRatedSkills changes
  useEffect(() => {
    if (localRatedSkills.length > 0) {
      localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(localRatedSkills));
    }
  }, [localRatedSkills, clickedUser]);

  // Load user session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
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
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch initial data once session is ready
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
    }
  }, [sessionData]);

  // Check if current skill is already rated and set the level accordingly
  useEffect(() => {
    if (selectedSkill && localRatedSkills && localRatedSkills.length > 0) {
      const ratedSkill = localRatedSkills.find((rated: any) =>
        rated.skill_id === selectedSkill.skill_id
      );

      if (ratedSkill && ratedSkill.skill_level) {
        // Find the corresponding level index in SkillLevels
        const levelIndex = SkillLevels.findIndex((level: ProficiencyLevel) => {
          // Handle different level formats (e.g., "Level 1", "1", "Beginner")
          const levelNumber = ratedSkill.skill_level.replace('Level ', '');
          return level.proficiency_level.includes(levelNumber) ||
            level.proficiency_type === ratedSkill.skill_level ||
            level.proficiency_level === ratedSkill.skill_level;
        });

        if (levelIndex !== -1) {
          setSelectedLevelIndex(levelIndex);
          setSelectedSkillLevel(SkillLevels[levelIndex]?.proficiency_type || SkillLevels[levelIndex]?.proficiency_level);

          // Also load any existing validation state for this skill
          const savedData = skillTempData[currentSkillIndex];
          if (savedData) {
            setValidationState(savedData.validationState);
            setShowDetails(savedData.showDetails);
          }
        }
      } else {
        // Reset if skill is not rated
        setSelectedLevelIndex(null);
        setSelectedSkillLevel("");
        setValidationState({
          knowledge: {},
          ability: {},
          behaviour: {},
          attitude: {},
        });
        setShowDetails(false);
      }
    }
  }, [selectedSkill, localRatedSkills, SkillLevels, currentSkillIndex, skillTempData]);

  // Save current skill data to temporary storage
  const saveCurrentSkillData = (): void => {
    if (selectedSkill) {
      setSkillTempData(prev => ({
        ...prev,
        [currentSkillIndex]: {
          selectedLevelIndex,
          selectedSkillLevel,
          validationState: { ...validationState },
          showDetails
        }
      }));
    }
  };

  // Load skill data from temporary storage
  const loadSkillData = (skillIndex: number): void => {
    const savedData = skillTempData[skillIndex];
    if (savedData) {
      setSelectedLevelIndex(savedData.selectedLevelIndex);
      setSelectedSkillLevel(savedData.selectedSkillLevel);
      setValidationState(savedData.validationState);
      setShowDetails(savedData.showDetails);
    } else {
      // Check if this skill is already rated in localRatedSkills
      const currentSkill = userJobroleSkills[skillIndex];
      if (currentSkill && localRatedSkills) {
        const ratedSkill = localRatedSkills.find((rated: any) =>
          rated.skill_id === currentSkill.skill_id
        );

        if (ratedSkill && ratedSkill.skill_level) {
          const levelIndex = SkillLevels.findIndex((level: ProficiencyLevel) => {
            const levelNumber = ratedSkill.skill_level.replace('Level ', '');
            return level.proficiency_level.includes(levelNumber) ||
              level.proficiency_type === ratedSkill.skill_level ||
              level.proficiency_level === ratedSkill.skill_level;
          });

          if (levelIndex !== -1) {
            setSelectedLevelIndex(levelIndex);
            setSelectedSkillLevel(SkillLevels[levelIndex]?.proficiency_type || SkillLevels[levelIndex]?.proficiency_level);
            return;
          }
        }
      }

      // Reset to default if no saved data and not rated
      setSelectedLevelIndex(null);
      setSelectedSkillLevel("");
      setValidationState({
        knowledge: {},
        ability: {},
        behaviour: {},
        attitude: {},
      });
      setShowDetails(false);
    }
  };

  // Get data from skill level rate
  const fetchInitialData = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${sessionData.url}/table_data?table=s_proficiency_levels&filters[sub_institute_id]=${sessionData.subInstituteId}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const data: ProficiencyLevel[] = await response.json();
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
    isValid: boolean,
    index: number,
    array: any[]
  ): void => {
    setValidationState((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [attribute]: isValid ? "yes" : "no",
      },
    }));

    if (index === array.length - 1) {
      const currentIndex = attrArray.findIndex((a) => a.title.toLowerCase() === type);

      if (currentIndex < attrArray.length - 1) {
        setTimeout(() => {
          setActiveTab(attrArray[currentIndex + 1].title);
        }, 300);
      } else {
        setTimeout(() => {
          handleSubmit();
          if (currentSkillIndex < userJobroleSkills.length - 1) {
            setTimeout(() => {
              moveToNextSkill();
            }, 500);
          }
        }, 300);
      }
    }
  };

  const moveToNextSkill = (): void => {
    if (currentSkillIndex < userJobroleSkills.length - 1) {
      saveCurrentSkillData();

      const nextIndex = currentSkillIndex + 1;
      setCurrentSkillIndex(nextIndex);
      setSelectedSkill(userJobroleSkills[nextIndex]);
      setActiveTab("knowledge");
      loadSkillData(nextIndex);
    }

    setSelectedImage("/image 16.png");
    setIsProcessing(false);
  };

  const moveToPreviousSkill = (): void => {
    if (currentSkillIndex > 0) {
      saveCurrentSkillData();

      const prevIndex = currentSkillIndex - 1;
      setCurrentSkillIndex(prevIndex);
      setSelectedSkill(userJobroleSkills[prevIndex]);
      setActiveTab("knowledge");
      loadSkillData(prevIndex);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    // Check if at least one level is selected
    if (selectedLevelIndex === null) {
      alert("Please select at least one proficiency level before proceeding.");
      return;
    }

    if (!selectedSkill) return;

    setIsProcessing(true);
    setOpacity(0);

    setTimeout(() => setSelectedImage("/Illustration.png"), 300);

    try {
      // Store skill rating locally instead of saving to database immediately
      const newRatedSkill = {
        // skill_id is already included in the spread below, so we skip it here
        skill_level: selectedSkillLevel,
        // skill: selectedSkill.skill,
        // category: selectedSkill.category,
        // sub_category: selectedSkill.sub_category,
        // jobrole: selectedSkill.jobrole,
        // description: selectedSkill.description,
        // proficiency_level: selectedSkill.proficiency_level,
        // knowledge: validationState.knowledge,
        // ability: validationState.ability,
        // behaviour: validationState.behaviour,
        // attitude: validationState.attitude,
        // Add other necessary properties
        ...selectedSkill
      };

      // Update local state
      setLocalRatedSkills((prev: any[]) => {
        const filtered = prev.filter((skill: any) => skill.skill_id !== selectedSkill.skill_id);
        const updated = [...filtered, newRatedSkill];
        
        // Save to localStorage immediately
        localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(updated));
        
        return updated;
      });

      // Update parent state if setter function is provided
      if (setUserRatedSkills) {
        setUserRatedSkills((prev: any[]) => {
          const filtered = prev.filter((skill: any) => skill.skill_id !== selectedSkill.skill_id);
          return [...filtered, newRatedSkill];
        });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      saveCurrentSkillData();

      if (currentSkillIndex < userJobroleSkills.length - 1) {
        moveToNextSkill();
      } else {
        // All skills have been rated - show validation modal
        setIsProcessing(false);
        setSelectedImage("/image 16.png");
        setOpacity(1);
        
        // Show validation modal when all skills are rated
        alert("All skills rated! You can review and submit all ratings together later.");
      }
    } catch (error) {
      console.error("Error saving skill locally:", error);
      alert("Error saving skill assessment");
      setIsProcessing(false);
      setSelectedImage("/image 16.png");
    }
  };

  const handleLevelSelect = (index: number, level: ProficiencyLevel): void => {
    setSelectedLevelIndex(selectedLevelIndex === index ? null : index);
    setSelectedSkillLevel(level.proficiency_type || level.proficiency_level);
    setShowDetails(false);
  };

  const handleSkillSelect = (skill: Skill, index: number): void => {
    saveCurrentSkillData();
    setSelectedSkill(skill);
    setCurrentSkillIndex(index);
    loadSkillData(index);
  };

  // Function to clear all rated skills (for testing/debugging)
  const clearRatedSkills = (): void => {
    localStorage.removeItem(`ratedSkills_${clickedUser}`);
    setLocalRatedSkills([]);
    setUserRatedSkills([]);
    alert("Rated skills cleared!");
  };

  // New function to validate and save all skills in bulk
  const validateAndSaveAllSkills = async (): Promise<void> => {
    if (localRatedSkills.length === 0) {
      alert("No skills have been rated yet!");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare all rated skills for bulk submission
      const bulkData = {
        skills: localRatedSkills.map(skill => ({
          skill_id: skill.skill_id,
          skill_level: skill.skill_level,
          knowledge: skill.knowledge || {},
          ability: skill.ability || {},
          behaviour: skill.behaviour || {},
          attitude: skill.attitude || {},
          userId: clickedUser || 0,
          sub_institute_id: sessionData.subInstituteId,
        })),
        userId: clickedUser || 0,
        sub_institute_id: sessionData.subInstituteId,
      };

      const response = await fetch(`${sessionData.url}/matrix/save-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify(bulkData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Bulk submission successful:", result);
        
        // Clear local storage after successful bulk save
        localStorage.removeItem(`ratedSkills_${clickedUser}`);
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // Optionally redirect or show completion message
          alert("All skills have been successfully saved!");
        }, 2000);
      } else {
        console.error("Bulk submission failed:", response.statusText);
        alert("Failed to save skill assessments in bulk");
      }
    } catch (error) {
      console.error("Error in bulk submission:", error);
      alert("Error submitting bulk assessment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Conditional Rendering - Show AdminSkillRating if user is rating someone else's skills
  if (String(sessionData.userId) !== String(clickedUser)) {
    return (
      <AdminSkillRating 
        skills={skills} 
        userRatedSkills={localRatedSkills} 
        SkillLevels={SkillLevels} 
        userJobroleSkills={userJobroleSkills} 
      />
    );
  }

  return (
    <div className="h-[fit-height] bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mt-10">
        {/* Top-right Icons - Positioned higher */}
        <div className="relative">
          {/* Debug button - remove in production */}
          {/* <button 
            onClick={clearRatedSkills}
            className="absolute -top-15 left-0 bg-red-500 text-white px-2 py-1 rounded text-xs"
            title="Clear all rated skills (debug)"
          >
            Clear Rated Skills
          </button> */}

          {/* Top Right Icons - Moved higher with negative top margin */}
          <div className="absolute -top-15 right-0 flex gap-5 z-10">
            <span
              className="star-box-icon mdi mdi-star-box-multiple-outline text-xl cursor-pointer p-2 full bg-yellow-100 text-yellow-600 shadow hover:bg-yellow-200 hover:text-yellow-700 transition-all rounded-md"
              title="Star Box"
              onClick={() => {
                setViewPart("default");
              }}
            ></span>

            <span
              className="chart-bar-icon mdi mdi-chart-bar text-xl cursor-pointer p-2 full bg-blue-100 text-blue-600 shadow hover:bg-blue-200 hover:text-blue-700 transition-all rounded-md"
              title="Admin Skill Rating"
              onClick={() => {
                setViewPart("rated skill");
              }}
            ></span>
          </div>

          {viewPart === "rated skill" ? (
            <AdminSkillRating
              skills={skills}
              userRatedSkills={localRatedSkills}
              SkillLevels={SkillLevels}
              userJobroleSkills={userJobroleSkills}
            />
          ) : (
            <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
              {/* Left Panel */}
              <div className="w-full xl:w-[280px] min-h-[472px] bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-2">
                <h2 className="text-[#23395B] font-bold text-md mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                  📈 Skill Proficiency Overview
                </h2>
                <div className="w-full h-0.5 bg-[#686868] mb-8"></div>

                <div className="h-[472px] overflow-y-auto">
                  {userJobroleSkills.map((skill: any, index: any) => {
                    // Check if this skill is already rated - use localRatedSkills
                    const isRated = localRatedSkills?.some((rated: any) =>
                      rated.skill_id === skill.skill_id
                    );

                    return (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => handleSkillSelect(skill, index)}
                      >
                        <div className="w-[12px] h-[32px] bg-[#47A0FF] rounded-r-[4px] absolute -left-[6px] top-[2px] transition-all duration-300 group-hover:w-full group-hover:left-0 group-hover:rounded-none opacity-100 group-hover:opacity-0 group-hover:delay-[0ms]"></div>
                        <div
                          className={`h-[36px] flex items-center transition-all duration-300 ${skill.skill_id === selectedSkill?.skill_id
                            ? "bg-[#47A0FF] text-black"
                            : isRated
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-white group-hover:bg-[#47A0FF] group-hover:text-black"
                            } mb-1`}
                        >
                          <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
                            <span
                              className={`text-[12px] truncate group-hover:text-black transition-colors duration-300 ${skill.skill_id === selectedSkill?.skill_id
                                ? "text-black"
                                : isRated
                                  ? "text-green-700"
                                  : "text-[#393939]"
                                }`}
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              {skill.skill.length > 20 ? `${skill.skill.slice(0, 20)}...` : skill.skill}
                              {isRated && " ✓"}
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
                    );
                  })}
                </div>
              </div>

              {/* Center Panel */}
              <div className="w-full flex-1 flex flex-col gap-6 ">
                <div className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 border-[#D4EBFF]">
                  <div className="w-full flex justify-between items-center mb-4">
                    <h1 className="text-[#393939] font-bold text-xs md:text-xl" style={{ fontFamily: "Inter, sans-serif" }}>
                      Are you proficient in {selectedSkill?.skill || "this skill"}?
                    </h1>
                    <span
                      className="mdi mdi-information-variant-circle text-2xl cursor-pointer text-blue-600"
                      title="Skill Detail"
                      onClick={() => setIsEditModalOpen(true)}
                    ></span>
                  </div>

                  <hr className="border-gray-500 mb-6" />

                  {/* Skill Level Selection with Description */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex justify-center flex-wrap gap-0">
                      {SkillLevels.length > 0 && SkillLevels.map((val: any, key) => {
                        const levelMatch = val?.proficiency_level?.match(/\d+/);
                        const levelNumber = levelMatch ? levelMatch[0] : '0';

                        const levelColors = [
                          'bg-blue-100 text-blue-800 border-blue-300',
                          'bg-green-100 text-green-800 border-green-300',
                          'bg-yellow-100 text-yellow-800 border-yellow-300',
                          'bg-orange-100 text-orange-800 border-orange-300',
                          'bg-red-100 text-red-800 border-red-300',
                          'bg-purple-100 text-purple-800 border-purple-300',
                          'bg-pink-100 text-pink-800 border-pink-300'
                        ];
                        const ringColors = [
                          "ring-blue-400 shadow-blue-400/50",
                          "ring-green-400 shadow-green-400/50",
                          "ring-yellow-400 shadow-yellow-400/50",
                          "ring-orange-400 shadow-orange-400/50",
                          "ring-red-400 shadow-red-400/50",
                          "ring-purple-400 shadow-purple-400/50",
                          "ring-pink-400 shadow-pink-400/50",
                        ];

                        const colorClass = levelColors[parseInt(levelNumber) - 1] || levelColors[0];
                        const isSelected = selectedLevelIndex === key;
                        let borderLeft = '';
                        let borderRight = '';
                        if (key == 0) {
                          borderLeft = 'rounded-l-[30px]';
                        }
                        if (SkillLevels.length === (key + 1)) {
                          borderRight = 'rounded-r-[30px]';
                        }
                        return (
                          <button
                            key={key}
                            onClick={() => handleLevelSelect(key, val)}
                            className={`px-4 py-2 shadow-lg border-2 ${borderLeft} ${borderRight} cursor-pointer flex items-center justify-center min-w-[80px] font-medium transition-all duration-200
    ${isSelected
                                ? `scale-105 ${colorClass} ring-2 ${ringColors[parseInt(levelNumber) - 1] || "ring-blue-400 shadow-blue-400/50"}`
                                : `hover:scale-105 hover:shadow-lg hover:shadow-current/50 hover:border-current ${colorClass}`
                              }`}
                          >
                            {levelNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Description Below Levels */}
                    {selectedLevelIndex !== null && SkillLevels[selectedLevelIndex]?.description && (
                      <p className="text-gray-700 text-sm font-medium text-center mt-2 max-w-2xl">
                        {SkillLevels[selectedLevelIndex]?.description}
                      </p>
                    )}

                    {/* Next and Previous Buttons - positioned at start and end */}
                    <div className="flex justify-between items-center w-full mt-4">
                      {/* Previous Button */}
                      <button
                        onClick={moveToPreviousSkill}
                        disabled={currentSkillIndex === 0}
                        className={`px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md ${currentSkillIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        ← Previous
                      </button>

                      {showSuccess && (
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                          Skill updated successfully!
                        </div>
                      )}

                      {/* Next Button - Hide when showDetails is true */}
                      {!showDetails && (
                        <button
                          onClick={handleSubmit}
                          className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md"
                        >
                          Save & Next →
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Detailed Rating Section */}
                <div className="text-left bg-white rounded-2xl p-4 shadow-sm border-2 border-[#D4EBFF]">
                  <div className="flex items-center mb-4">
                    <span className="mr-2 text-gray-700 font-medium">Want to rate your skill in detail?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={showDetails}
                        onChange={(e) => {
                          if (selectedLevelIndex !== null) {
                            setShowDetails(e.target.checked);
                          }
                        }}
                        disabled={selectedLevelIndex === null}
                      />
                      <div
                        className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full 
                      peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                      after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all ${selectedLevelIndex === null
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-gray-200 peer-checked:bg-blue-600 cursor-pointer"
                          }`}
                      ></div>
                    </label>
                  </div>

                  {/* Warning message if no level selected */}
                  {selectedLevelIndex === null && (
                    <div className="text-center mt-2">
                      <span className="text-orange-500 text-sm">
                        ⚠️ Please select a proficiency level to enable detailed rating
                      </span>
                    </div>
                  )}

                  {/* Show tabs only when showDetails is true and level is selected */}
                  {showDetails && selectedLevelIndex !== null && (
                    <div className="mt-4">
                      {/* Tabs */}
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full shadow-sm w-fit mb-4">
                        {attrArray.map((attr) => (
                          <button
                            key={attr.title}
                            onClick={() => setActiveTab(attr.title)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === attr.title
                              ? "bg-blue-100 text-blue-700 font-semibold shadow-inner"
                              : "bg-white text-gray-600 hover:bg-gray-100"
                              }`}
                          >
                            <span className={`mdi ${attr.icon} text-lg`}></span>
                            {attr.title.charAt(0).toUpperCase() + attr.title.slice(1)}
                          </button>
                        ))}
                      </div>

                      {/* Show selected tab data */}
                      <div className="space-y-3">
                        {(selectedSkill?.[activeTab as keyof Skill] as any[])?.map(
                          (item: any, index: number, array: any[]) => (
                            <div
                              key={index}
                              className="w-full bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between"
                            >
                              <p className="text-sm flex-1">{item}</p>
                              <div className="flex gap-3 ml-3">
                                <button
                                  onClick={() =>
                                    handleValidation(activeTab as any, item, true, index, array)
                                  }
                                  className={`w-7 h-7 flex items-center justify-center rounded-full border ${validationState?.[activeTab as keyof ValidationState]?.[item] === "yes"
                                    ? "bg-green-600 text-white"
                                    : "bg-white text-green-600"
                                    }`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    handleValidation(activeTab as any, item, false, index, array)
                                  }
                                  className={`w-7 h-7 flex items-center justify-center rounded-full border ${validationState?.[activeTab as keyof ValidationState]?.[item] === "no"
                                    ? "bg-red-600 text-white"
                                    : "bg-white text-red-600"
                                    }`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* ✅ Save & Next Button -> show only on last tab */}
                      {activeTab === attrArray[attrArray.length - 1].title && (
                        <div className="mt-5 flex justify-end">
                          <button
                            className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            title={
                              selectedLevelIndex === null
                                ? "Please select a level first"
                                : "Click to submit"
                            }
                            disabled={isProcessing === null}
                          >
                            {isProcessing
                              ? "Processing..."
                              : currentSkillIndex === userJobroleSkills.length - 1
                                ? "Complete"
                                : "Save & Next"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Skill Detail Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <span className="mdi mdi-brain"></span> {selectedSkill?.skill}
            </DialogTitle>
          </DialogHeader>
          <hr className="m-0 mx-2" />
          <div className="helloDiv">
            {selectedSkill ? (
              <div className="w-full">
                <div className="flex gap-4 px-4">
                  <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                    <span className="mdi mdi-briefcase"></span>&nbsp;&nbsp;
                    <label className="text-bold">Skill Jobrole</label>
                    <hr className="border-[#aaaaaa] my-2" />
                    {selectedSkill?.jobrole}
                  </div>
                  <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                    <span className="mdi mdi-tag-multiple"></span>&nbsp;&nbsp;
                    <label className="text-bold">Skill Category</label>
                    <hr className="border-[#aaaaaa] my-2" />
                    {selectedSkill?.category}
                  </div>
                  <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                    <span className="mdi mdi-tag"></span>&nbsp;&nbsp;
                    <label className="text-bold">Skill Sub-Category</label>
                    <hr className="border-[#aaaaaa] my-2" />
                    {selectedSkill?.sub_category}
                  </div>
                  <div className="w-1/4 bg-[#eaf7ff] shadow-lg shadow-blue-300/50 p-2 rounded-md">
                    <span className="mdi mdi-chart-bar"></span>&nbsp;&nbsp;
                    <label className="text-bold">Skill Proficiency Level</label>
                    <hr className="border-[#aaaaaa] my-2" />
                    {selectedSkill?.proficiency_level}
                  </div>
                </div>

                <div className="descriptionDiv px-4 mt-4">
                  <div className="w-full bg-[#eaf7f2] shadow-lg shadow-green-200/50 p-2 rounded-md">
                    <span className="mdi mdi-information-variant-circle"></span>
                    &nbsp;&nbsp;
                    <label className="text-bold">Skill Description</label>
                    <hr className="border-[#aaaaaa] my-2" />
                    {selectedSkill?.description}
                  </div>
                </div>

                <div className="attributeParts flex gap-4 px-4 mt-4">
                  {attrArray.map((attr, key) => (
                    <div key={key} className="w-1/4 bg-blue-100 rounded-2xl shadow-lg shadow-blue-300/50 p-2">
                      <div className="py-2 w-full">
                        <div className="space-y-6">
                          <h4 className="font-semibold mb-2">
                            <span className={`mdi ${attr.icon} text-xl`}></span>
                            {attr.title.charAt(0).toUpperCase() + attr.title.slice(1)}:
                          </h4>
                          <hr className="mx-0 mb-2 border-[#000000]" />
                          <div className="h-[50vh] overflow-y-auto hide-scrollbar">
                            {(selectedSkill[attr.title as keyof Skill] as any[])?.map((item: any, index: number) => (
                              <div key={index} className="w-full bg-white p-2 rounded-lg mb-2">
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
    </div>
  );
}