//
// Part 1/3
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
import JobroleSkillRatingDesign from "./jobrole-skillrating";
import { useRouter } from "next/navigation";
// validators (do not change utils.ts)
import { validateSkillProficiencies, getValidationMessages } from "@/lib/utils";

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
  userJobroleSkills,
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
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(
    null
  );
  const [skillTempData, setSkillTempData] = useState<
    Record<number, SkillTempData>
  >({});

  const [attrArray] = useState([
    { title: "knowledge", icon: "mdi-library" },
    { title: "ability", icon: "mdi-hand-okay" },
    { title: "behaviour", icon: "mdi-account-child" },
    { title: "attitude", icon: "mdi-emoticon" },
  ]);

  const [localRatedSkills, setLocalRatedSkills] = useState<any[]>([]);

  // --- Dialog states for replacing alerts/confirms ---
  const [validationDialogOpen, setValidationDialogOpen] =
    useState<boolean>(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [validationType, setValidationType] = useState<"error" | "warning">(
    "warning"
  );
  const [pendingBulkData, setPendingBulkData] = useState<any>(null);

  const [infoDialogOpen, setInfoDialogOpen] = useState<boolean>(false);
  const [infoDialogTitle, setInfoDialogTitle] = useState<string>("Information");
  const [infoDialogMessages, setInfoDialogMessages] = useState<string[]>([]);
  const [infoDialogVariant, setInfoDialogVariant] = useState<
    "info" | "success" | "error"
  >("info");

  // Helper to show info dialog (replaces alert)
  const showInfo = (
    title: string,
    messages: string | string[],
    variant: "info" | "success" | "error" = "info"
  ) => {
    setInfoDialogTitle(title);
    setInfoDialogMessages(Array.isArray(messages) ? messages : [messages]);
    setInfoDialogVariant(variant);
    setInfoDialogOpen(true);
  };

  useEffect(() => {
    const storedRatedSkills = localStorage.getItem(`ratedSkills_${clickedUser}`);
    if (storedRatedSkills) {
      try {
        const parsedSkills = JSON.parse(storedRatedSkills);

        // Ensure objects are properly parsed (in case of double stringification)
        const processedSkills = parsedSkills.map((skill: any) => ({
          ...skill,
          knowledge: typeof skill.knowledge === 'string' ? JSON.parse(skill.knowledge) : (skill.knowledge || {}),
          ability: typeof skill.ability === 'string' ? JSON.parse(skill.ability) : (skill.ability || {}),
          behaviour: typeof skill.behaviour === 'string' ? JSON.parse(skill.behaviour) : (skill.behaviour || {}),
          attitude: typeof skill.attitude === 'string' ? JSON.parse(skill.attitude) : (skill.attitude || {}),
        }));

        console.log("Loaded skills from localStorage:", processedSkills);
        setLocalRatedSkills(processedSkills);
        setUserRatedSkills(processedSkills);

        // Load current skill data if available
        if (selectedSkill) {
          const ratedSkill = processedSkills.find(
            (rated: any) => rated.skill_id === selectedSkill.skill_id
          );
          if (ratedSkill) {
            console.log("Found rated skill on load:", ratedSkill);
            // This will trigger the useEffect above to load KAAB data
          }
        }
      } catch (error) {
        console.error("Error parsing stored rated skills:", error);
      }
    } else if (userRatedSkills && userRatedSkills.length > 0) {
      setLocalRatedSkills(userRatedSkills);
      localStorage.setItem(
        `ratedSkills_${clickedUser}`,
        JSON.stringify(userRatedSkills)
      );
    }
  }, [userRatedSkills, clickedUser, setUserRatedSkills, selectedSkill]);

  useEffect(() => {
    if (localRatedSkills.length > 0) {
      localStorage.setItem(
        `ratedSkills_${clickedUser}`,
        JSON.stringify(localRatedSkills)
      );
    }
  }, [localRatedSkills, clickedUser]);

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

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchInitialData();
      // fetchUserRatedSkills();
    }
  }, [sessionData]);

  // Fetch user rated skills to load existing KAAB data
  // const fetchUserRatedSkills = async (): Promise<void> => {
  //   try {
  //     const userData = localStorage.getItem("userData");
  //     if (!userData) return;

  //     const { APP_URL, token, user_id } = JSON.parse(userData);
  //     const response = await fetch(
  //       `${APP_URL}/user-rated-skills?user_id=${user_id}&token=${token}&include_proficiency=true`
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Fetched rated skills for rating:", data.userRatedSkills);

  //       // Update local rated skills with fetched data
  //       const fetchedSkills = data.userRatedSkills || [];
  //       setLocalRatedSkills(fetchedSkills);
  //       if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
  //         setUserRatedSkills(fetchedSkills);
  //       }

  //       // Save to localStorage
  //       localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(fetchedSkills));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user rated skills:", error);
  //   }
  // };

  // FIXED: Load KAAB data when selectedSkill changes
  useEffect(() => {
    if (selectedSkill && localRatedSkills && localRatedSkills.length > 0) {
      const ratedSkill = localRatedSkills.find(
        (rated: any) => rated.skill_id === selectedSkill.skill_id
      );

      console.log("Loading KAAB data for skill:", selectedSkill.skill, ratedSkill);

      if (ratedSkill) {
        // Load level selection
        const levelIndex = SkillLevels.findIndex((level: ProficiencyLevel) => {
          if (!ratedSkill.skill_level) return false;
          const levelNumber = ratedSkill.skill_level.replace("Level ", "");
          return (
            level.proficiency_level.includes(levelNumber) ||
            level.proficiency_type === ratedSkill.skill_level ||
            level.proficiency_level === ratedSkill.skill_level
          );
        });

        if (levelIndex !== -1) {
          setSelectedLevelIndex(levelIndex);
          setSelectedSkillLevel(ratedSkill.skill_level);
        }

        // Load KAAB validation state - THIS IS THE KEY FIX
        setValidationState({
          knowledge: ratedSkill.knowledge || {},
          ability: ratedSkill.ability || {},
          behaviour: ratedSkill.behaviour || {},
          attitude: ratedSkill.attitude || {},
        });

        // Show details if KAAB data exists
        const hasKAABData = Object.keys(ratedSkill.knowledge || {}).length > 0 ||
          Object.keys(ratedSkill.ability || {}).length > 0 ||
          Object.keys(ratedSkill.behaviour || {}).length > 0 ||
          Object.keys(ratedSkill.attitude || {}).length > 0;

        setShowDetails(hasKAABData);
      } else {
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
  }, [selectedSkill, localRatedSkills, SkillLevels]);

  const saveCurrentSkillData = (): void => {
    if (selectedSkill) {
      setSkillTempData((prev) => ({
        ...prev,
        [currentSkillIndex]: {
          selectedLevelIndex,
          selectedSkillLevel,
          validationState: { ...validationState },
          showDetails,
        },
      }));
    }
  };

  const loadSkillData = (skillIndex: number): void => {
    const savedData = skillTempData[skillIndex];
    if (savedData) {
      setSelectedLevelIndex(savedData.selectedLevelIndex);
      setSelectedSkillLevel(savedData.selectedSkillLevel);
      setValidationState(savedData.validationState);
      setShowDetails(savedData.showDetails);
    } else {
      const currentSkill = userJobroleSkills[skillIndex];
      if (currentSkill && localRatedSkills) {
        const ratedSkill = localRatedSkills.find(
          (rated: any) => rated.skill_id === currentSkill.skill_id
        );

        if (ratedSkill && ratedSkill.skill_level) {
          const levelIndex = SkillLevels.findIndex((level: ProficiencyLevel) => {
            const levelNumber = ratedSkill.skill_level.replace("Level ", "");
            return (
              level.proficiency_level.includes(levelNumber) ||
              level.proficiency_type === ratedSkill.skill_level ||
              level.proficiency_level === ratedSkill.skill_level
            );
          });

          if (levelIndex !== -1) {
            setSelectedLevelIndex(levelIndex);
            setSelectedSkillLevel(
              SkillLevels[levelIndex]?.proficiency_type ||
              SkillLevels[levelIndex]?.proficiency_level
            );
            return;
          }
        }
      }

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

  // handleValidation, moveToNextSkill, moveToPreviousSkill
  const handleValidation = (
    type: "knowledge" | "ability" | "behaviour" | "attitude",
    attribute: string,
    isValid: boolean,
    index: number,
    array: any[]
  ): void => {
    setValidationState((prev) => {
      const newState = {
        ...prev,
        [type]: {
          ...prev[type],
          [attribute]: isValid ? "yes" : "no",
        },
      };

      if (index === array.length - 1) {
        const currentIndex = attrArray.findIndex(
          (a) => a.title.toLowerCase() === type
        );

        if (currentIndex < attrArray.length - 1) {
          setTimeout(() => {
            setActiveTab(attrArray[currentIndex + 1].title);
          }, 300);
        } else {
          // ✅ CRITICAL FIX: pass the updated state to handleSubmit
          setTimeout(() => {
            handleSubmit(newState);
          }, 300);
        }
      }

      return newState;
    });
  };
  const moveToNextSkill = (): void => {
    if (currentSkillIndex < userJobroleSkills.length - 1) {
      const nextIndex = currentSkillIndex + 1;
      setCurrentSkillIndex(nextIndex);
      setSelectedSkill(userJobroleSkills[nextIndex]);

      // Reset for new skill - but data will be loaded from useEffect
      setActiveTab("knowledge");
      setValidationState({
        knowledge: {},
        ability: {},
        behaviour: {},
        attitude: {},
      });
      setShowDetails(false);
      setSelectedLevelIndex(null);
      setSelectedSkillLevel("");

      // The useEffect will automatically load data for the new selectedSkill
    }

    setIsProcessing(false);
    setSelectedImage("/image 16.png");
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


  const handleSubmit = async (passedValidationState?: ValidationState): Promise<void> => {
    if (selectedLevelIndex === null) {
      showInfo("Validation", "Please select at least one proficiency level before proceeding.", "error");
      return;
    }

    if (!selectedSkill) return;

    setIsProcessing(true);

    const currentValidationState = passedValidationState || validationState;

    try {
      // Create the rated skill with KAAB data - ensure objects are preserved
      const newRatedSkill = {
        skill_id: selectedSkill.skill_id,
        skill_level: selectedSkillLevel,
        skill: selectedSkill.skill,
        category: selectedSkill.category,
        knowledge: { ...currentValidationState.knowledge }, // Spread to create new object
        ability: { ...currentValidationState.ability },     // Spread to create new object
        behaviour: { ...currentValidationState.behaviour }, // Spread to create new object
        attitude: { ...(currentValidationState.attitude || {}) }   // Spread to create new object
      };

      console.log("Saving skill with KAAB data:", newRatedSkill);

      // Update local rated skills
      // setLocalRatedSkills(prev => {
      //   const filtered = prev.filter(skill => skill.skill_id !== selectedSkill.skill_id);
      //   const updatedSkills = [...filtered, newRatedSkill];

      //   // Save to localStorage - ensure proper JSON structure
      //   localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(updatedSkills));

      //   console.log("Updated localRatedSkills:", updatedSkills);
      //   return updatedSkills;
      // });
setLocalRatedSkills(prev => {
  const filtered = prev.filter(
    skill => skill.skill_id !== selectedSkill.skill_id
  );
  return [...filtered, newRatedSkill];
});

      // Move to next skill after ensuring state is updated
      setTimeout(() => {
        if (currentSkillIndex < userJobroleSkills.length - 1) {
          moveToNextSkill();
        } else {
          setIsProcessing(false);
          showInfo("Completed", "All skills rated! Click 'Validate & Save All' to submit.", "success");
        }
      }, 500);

    } catch (error) {
      console.error("Error saving skill:", error);
      showInfo("Error", "Error saving skill assessment", "error");
      setIsProcessing(false);
    }
  };

  // Part 2/3 (continue)

  const handleLevelSelect = (index: number, level: ProficiencyLevel): void => {
    setSelectedLevelIndex(selectedLevelIndex === index ? null : index);
    setSelectedSkillLevel(level.proficiency_type || level.proficiency_level);
    setShowDetails(false);
  };

  const handleSkillSelect = (skill: Skill, index: number): void => {
    // Save current skill data before switching ONLY if skill_level is selected
    if (selectedSkill && selectedLevelIndex !== null && selectedSkillLevel) {
      const currentRatedSkill = {
        skill_id: selectedSkill.skill_id,
        skill_level: selectedSkillLevel,
        skill: selectedSkill.skill,
        knowledge: validationState.knowledge,
        ability: validationState.ability,
        behaviour: validationState.behaviour,
        attitude: validationState.attitude,
      };

      setLocalRatedSkills(prev => {
        const filtered = prev.filter(s => s.skill_id !== selectedSkill.skill_id);
        const updated = [...filtered, currentRatedSkill];
        localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(updated));
        console.log("Auto-saved skill when switching:", currentRatedSkill.skill);
        return updated;
      });
    }

    // Switch to new skill
    setSelectedSkill(skill);
    setCurrentSkillIndex(index);
    setActiveTab("knowledge");

    // Load the new skill's data
    setTimeout(() => {
      const ratedSkill = localRatedSkills.find(
        (rated: any) => rated.skill_id === skill.skill_id
      );

      if (ratedSkill && ratedSkill.skill_level) {
        setSelectedLevelIndex(SkillLevels.findIndex(level =>
          level.proficiency_level === ratedSkill.skill_level ||
          level.proficiency_type === ratedSkill.skill_level
        ));
        setSelectedSkillLevel(ratedSkill.skill_level);
        setValidationState({
          knowledge: ratedSkill.knowledge || {},
          ability: ratedSkill.ability || {},
          behaviour: ratedSkill.behaviour || {},
          attitude: ratedSkill.attitude || {},
        });
        setShowDetails(true);
      } else {
        setSelectedLevelIndex(null);
        setSelectedSkillLevel("");
        setValidationState({
          knowledge: {}, ability: {}, behaviour: {}, attitude: {}
        });
        setShowDetails(false);
      }
    }, 100);
  };

  // Function to clear all rated skills (for testing/debugging)
  // Function to clear all rated skills
  const clearRatedSkills = (): void => {
    localStorage.removeItem(`ratedSkills_${clickedUser}`);
    setLocalRatedSkills([]);

    // Only call setUserRatedSkills if it's provided and is a function
    if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
      setUserRatedSkills([]);
    } else {
      console.warn('setUserRatedSkills is not available or not a function');
    }

    showInfo("Cleared", "Rated skills cleared!", "success");
  };


  // Add this helper function to debug your data
  const debugBulkData = (skillsToSave: any[]) => {
    console.log("=== BULK DATA DEBUG ===");
    console.log("Number of skills to save:", skillsToSave.length);
    console.log("Skills data:", skillsToSave);

    const bulkData = {
      skills: skillsToSave.map((skill) => ({
        skill_id: skill.skill_id,
        skill_level: skill.skill_level,
        knowledge: skill.knowledge || {},
        ability: skill.ability || {},
        behaviour: skill.behaviour || {},
        attitude: skill.attitude || {},
        user_id: clickedUser || 0,
        sub_institute_id: sessionData.subInstituteId,
      })),
      user_id: clickedUser || 0,
      sub_institute_id: sessionData.subInstituteId,
    };

    console.log("Final bulk data structure:", bulkData);
    console.log("=== END DEBUG ===");
  };
const isSkillValid = (skill: any) => {
  return !!skill?.skill_level;
};
  // ✅ Bulk validation with dialog (called by Save All button)
const validateAndSaveAllSkills = async (): Promise<void> => {
  const validSkills = localRatedSkills.filter(isSkillValid);

  if (validSkills.length === 0) {
    showInfo(
      "Validation Error",
      "Please rate at least one skill proficiency level before saving.",
      "error"
    );
    return;
  }

  // ❌ Find invalid skills
  const invalidSkills = localRatedSkills.filter(
    (skill) => !skill?.skill_level
  );

  if (invalidSkills.length > 0) {
    showInfo(
      "Incomplete Skills",
      "Some skills are missing proficiency level. Please complete them before saving.",
      "error"
    );
    return;
  }

  // ✅ Proceed ONLY with valid skills
  await performBulkSave(validSkills);
};

  const performBulkSave = async (skillsToSave: any[]): Promise<void> => {
    setIsProcessing(true);
    try {
      // Process skills to ensure valid proficiency levels (1-5 only)
      const processedSkills = skillsToSave.map((skill) => {
        // Extract numeric level from skill_level string
        let numericLevel = 1; // Default to 1

        if (skill.skill_level) {
          const levelMatch = skill.skill_level.toString().match(/\d+/);
          if (levelMatch) {
            numericLevel = parseInt(levelMatch[0], 10);
          }
        }

        // FORCE level to be between 1-5 - if 6, make it 5
        // This is required because backend validation only accepts 1-5
        const validatedLevel = Math.max(1, Math.min(5, numericLevel));

        // Log if we're changing level 6 to 5
        if (numericLevel > 5) {
          console.warn(`Converting skill level ${numericLevel} to 5 for skill: ${skill.skill}`);
        }

        return {
          ...skill,
          skill_level: validatedLevel, // Use validated numeric level (1-5 only)
          knowledge: typeof skill.knowledge === 'string' ? JSON.parse(skill.knowledge) : (skill.knowledge || {}),
          ability: typeof skill.ability === 'string' ? JSON.parse(skill.ability) : (skill.ability || {}),
          behaviour: typeof skill.behaviour === 'string' ? JSON.parse(skill.behaviour) : (skill.behaviour || {}),
          attitude: typeof skill.attitude === 'string' ? JSON.parse(skill.attitude) : (skill.attitude || {}),
        };
      });

      console.log("Processed skills for bulk save (levels 1-5 only):", processedSkills);

      // Check if any skills had level 6 that we converted
      const convertedSkills = skillsToSave.filter((skill, index) => {
        const originalLevel = skill.skill_level?.toString().match(/\d+/)?.[0];
        const processedLevel = processedSkills[index].skill_level;
        return originalLevel && parseInt(originalLevel) > 5;
      });

      const bulkData = {
        skills: processedSkills.map((skill) => ({
          skill_id: skill.skill_id,
          skill_level: skill.skill_level, // This is now guaranteed to be 1-5
          knowledge: skill.knowledge || {},
          ability: skill.ability || {},
          behaviour: skill.behaviour || {},
          attitude: skill.attitude || {},
          user_id: clickedUser || 0,
          sub_institute_id: sessionData.subInstituteId,
        })),
        user_id: clickedUser || 0,
        sub_institute_id: sessionData.subInstituteId,
      };

      console.log("Final bulk data to send (ALL LEVELS 1-5):", bulkData);

      const response = await fetch(`${sessionData.url}/skill-matrix/store-bulk`, {
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
        setLocalRatedSkills([]);

        if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
          setUserRatedSkills([]);
        }

        // Show appropriate success message
        if (convertedSkills.length > 0) {
          showInfo(
            "Success ✅ (Levels Adjusted)",
            [
              `All ${processedSkills.length} skills have been successfully saved!`,
              `Note: ${convertedSkills.length} skills with level 6 were adjusted to level 5.`,
              "Backend only accepts proficiency levels 1-5."
            ],
            "success"
          );
        } else {
          showInfo(
            "Success ✅",
            `All ${processedSkills.length} skills have been successfully saved!`,
            "success"
          );
        }

      } else if (response.status === 422) {
        const errorData = await response.json();
        console.error("Validation error details:", errorData);

        // Extract specific error messages
        const errorMessages = Object.values(errorData.errors || {})
          .flat()
          .map((msg: any) => `• ${msg}`);

        showInfo(
          "Validation Failed",
          errorMessages.length > 0 ? errorMessages : ["Please check all skill levels are valid (1-5)"],
          "error"
        );
      } else {
        const errorText = await response.text();
        console.error("Bulk submission failed:", response.status, errorText);
        showInfo(
          "Failed",
          `Server error (${response.status}): ${response.statusText}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error in bulk submission:", error);
      showInfo(
        "Error",
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "error"
      );
    } finally {
      setIsProcessing(false);
      setValidationDialogOpen(false);
      setPendingBulkData(null);
    }
  };



  // Validation Dialog component (replaces confirm/alerts for validation)
  const ValidationDialog = () => (
    <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-lg font-semibold ${validationType === "error" ? "text-red-600" : "text-yellow-600"}`}>
            {validationType === "error" ? "Validation Errors" : "Validation Warnings"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-2 max-h-[50vh] overflow-y-auto">
          {validationMessages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${validationType === "error" ? "text-red-500" : "text-yellow-500"}`}>
              • {msg}
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => {
              setValidationDialogOpen(false);
              setPendingBulkData(null);
            }}
          >
            Close
          </button>

          {validationType === "warning" && (
            <button
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setValidationDialogOpen(false);
                if (pendingBulkData) performBulkSave(pendingBulkData);
              }}
            >
              Proceed Anyway
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Generic Info Dialog replacement for alert/info/success/error
  const InfoDialog = () => (
    <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-lg font-semibold ${infoDialogVariant === "success" ? "text-green-600" :
            infoDialogVariant === "error" ? "text-red-600" : "text-slate-800"
            }`}>
            {infoDialogTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-2">
          {infoDialogMessages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${infoDialogVariant === "error" ? "text-red-500" : infoDialogVariant === "success" ? "text-green-600" : "text-slate-700"}`}>
              {msg}
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => setInfoDialogOpen(false)}
          >
            OK
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Conditional Rendering - Show AdminSkillRating if user is rating someone else's skills
  if (String(sessionData.userId) !== String(clickedUser)) {
    return (
      <>
        <AdminSkillRating
          skills={skills}
          userRatedSkills={localRatedSkills}
          parentSetUserRatedSkills={setLocalRatedSkills}
          SkillLevels={SkillLevels}
          userJobroleSkills={userJobroleSkills}
        />
        {/* Render dialogs still so parent page has them if AdminSkillRating returns early */}
        <ValidationDialog />
        <InfoDialog />
      </>
    );
  }
  // Part 3/3 (final)

  return (
    <>
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
              {/* Star Icon */}
              <span
                className="mdi mdi-star-box-multiple-outline text-xl cursor-pointer p-2 bg-yellow-100 text-yellow-600 shadow hover:bg-yellow-200 hover:text-yellow-700 transition-all rounded-md"
                title="Star Box"
                onClick={() => {
                  setViewPart("default");
                }}
              ></span>

              {/* Chart Icon */}
              <span
                className="mdi mdi-chart-bar text-xl cursor-pointer p-2 bg-blue-100 text-blue-600 shadow hover:bg-blue-200 hover:text-blue-700 transition-all rounded-md"
                title="Admin Skill Rating"
                onClick={() => {
                  setViewPart("rated skill");
                }}
              ></span>

              {/* ✅ NEW ICON (Settings / Info) */}
              <span
                className="mdi mdi-cog-outline text-xl cursor-pointer p-2 bg-gray-100 text-gray-700 shadow hover:bg-gray-200 hover:text-gray-900 transition-all rounded-md"
                title="Jobrole Skill Rating"
                onClick={() => setViewPart("jobrole-skillrating")}
              ></span>
            </div>


            {viewPart === "rated skill" ? (
              <AdminSkillRating
                skills={skills}
                userRatedSkills={localRatedSkills}
                parentSetUserRatedSkills={setLocalRatedSkills}
                SkillLevels={SkillLevels}
                userJobroleSkills={userJobroleSkills}
              />
            ) : viewPart === "jobrole-skillrating" ? (
              <JobroleSkillRatingDesign
                subInstituteId={sessionData.subInstituteId}
                jobroleId={3154} // TODO: Get actual jobrole id
                jobroleTitle={userJobroleSkills[0]?.jobrole || "Community Care Associate"}
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
                      const ratedSkill = localRatedSkills?.find((rated: any) =>
                        rated.skill_id === skill.skill_id
                      );

                      const hasKAAB = ratedSkill && (
                        Object.keys(ratedSkill.knowledge || {}).length > 0 ||
                        Object.keys(ratedSkill.ability || {}).length > 0 ||
                        Object.keys(ratedSkill.behaviour || {}).length > 0 ||
                        Object.keys(ratedSkill.attitude || {}).length > 0
                      );

                      return (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => {
                            handleSkillSelect(skill, index);
                          }}
                        >
                          <div className={`h-[36px] flex items-center transition-all duration-300 ${skill.skill_id === selectedSkill?.skill_id
                            ? "bg-[#47A0FF] text-black"
                            : ratedSkill
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-white group-hover:bg-[#47A0FF] group-hover:text-black"
                            } mb-1`}
                          >
                            <div className="flex items-center justify-between w-full pl-[24px] pr-[8px]">
                              <span className={`text-[12px] truncate ${skill.skill_id === selectedSkill?.skill_id
                                ? "text-black"
                                : ratedSkill
                                  ? "text-green-700"
                                  : "text-[#393939]"
                                }`}
                              >
                                {skill.skill.length > 20 ? `${skill.skill.slice(0, 20)}...` : skill.skill}
                                {ratedSkill && hasKAAB && " ✓"} {/* Only show checkmark when KAAB values exist */}
                              </span>
                              <svg width="16" height="17" viewBox="0 0 24 25" fill="none">
                                <path d="M7.84467 21.376C7.55178 21.0831 7.55178 20.6083 7.84467 20.3154L14.5643 13.5957L7.84467 6.87601C7.55178 6.58311 7.55178 6.1083 7.84467 5.8154C8.13756 5.5225 8.61244 5.5225 8.90533 5.8154L16.1553 13.0654C16.4482 13.3583 16.4482 13.8331 16.1553 14.126L8.90533 21.376C8.61244 21.6689 8.13756 21.6689 7.84467 21.376Z" fill="#393939" />
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

                        {/* REMOVED: Success message */}
                        {/* {showSuccess && (
                          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                            Skill updated successfully!
                          </div>
                        )} */}

                        {/* Next Button - Hide when showDetails is true */}
                        {!showDetails && (
                          <button
                            onClick={() => handleSubmit()}
                            className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md"
                          >
                            Next →
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

                        {/* ✅ Next Button -> show only on last tab - UPDATED: Changed from "Save & Next" to "Next" */}
                        {activeTab === attrArray[attrArray.length - 1].title && (
                          <div className="mt-5 flex justify-end">
                            <button
                              className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => handleSubmit()}
                              title={
                                selectedLevelIndex === null
                                  ? "Please select a level first"
                                  : "Click to go to next skill"
                              }
                              disabled={isProcessing === null}
                            >
                              Next
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

      {/* Bottom-right fixed actions: Clear, Save All, etc. - Only show in default view */}
      {viewPart !== "jobrole-skillrating" && viewPart !== "rated skill" && (
        <div className="fixed bottom-6 right-6 flex gap-3 z-50">
          <button
            onClick={clearRatedSkills}
            className="px-4 py-2 rounded-full bg-red-500 text-white shadow hover:bg-red-600"
            title="Clear rated skills"
          >
            Clear Rated
          </button>

          <button
            onClick={validateAndSaveAllSkills}
            className="px-4 py-2 rounded-full bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Validate & Save All"
            disabled={isProcessing || localRatedSkills.length === 0}
          >
            {isProcessing ? "Processing..." : `Validate & Save All (${localRatedSkills.length})`}
          </button>
        </div>
      )}

      {/* Dialogs */}
      <ValidationDialog />
      <InfoDialog />
    </>
  );
}
