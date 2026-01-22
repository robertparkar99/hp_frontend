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

// FIXED: Changed to string type for "yes"/"no" values
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

  // FIXED: Initialize with empty objects for string values
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

        // Process skills and ensure KAAB values are "yes"/"no" strings
        const processedSkills = parsedSkills.map((skill: any) => {
          // Helper function to convert KAAB values to "yes"/"no" strings
          const convertKAABValues = (kaabObj: any) => {
            const result: Record<string, string> = {};
            for (const [key, value] of Object.entries(kaabObj || {})) {
              if (value === "yes" || value === "1" || value === 1 || value === true || value === "true") {
                result[key] = "yes";
              } else if (value === "no" || value === "0" || value === 0 || value === false || value === "false") {
                result[key] = "no";
              } else {
                result[key] = value as string; // Keep as-is if already "yes"/"no"
              }
            }
            return result;
          };

          return {
            ...skill,
            detailed_ratings: skill.detailed_ratings ? {
              knowledge: convertKAABValues(
                typeof skill.detailed_ratings.knowledge === 'string' 
                  ? JSON.parse(skill.detailed_ratings.knowledge) 
                  : skill.detailed_ratings.knowledge
              ),
              ability: convertKAABValues(
                typeof skill.detailed_ratings.ability === 'string'
                  ? JSON.parse(skill.detailed_ratings.ability)
                  : skill.detailed_ratings.ability
              ),
              behaviour: convertKAABValues(
                typeof skill.detailed_ratings.behaviour === 'string'
                  ? JSON.parse(skill.detailed_ratings.behaviour)
                  : skill.detailed_ratings.behaviour
              ),
              attitude: convertKAABValues(
                typeof skill.detailed_ratings.attitude === 'string'
                  ? JSON.parse(skill.detailed_ratings.attitude)
                  : skill.detailed_ratings.attitude
              ),
            } : {
              knowledge: {},
              ability: {},
              behaviour: {},
              attitude: {}
            },
            modified: skill.modified || false,
          };
        });

        console.log("Loaded skills from localStorage:", processedSkills);
        setLocalRatedSkills(processedSkills);
        if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
          setUserRatedSkills(processedSkills);
        }
      } catch (error) {
        console.error("Error parsing stored rated skills:", error);
      }
    } else if (userRatedSkills && userRatedSkills.length > 0) {
      const skillsWithModified = userRatedSkills.map((skill: any) => {
        const existing = localRatedSkills.find(s => s.skill_id === skill.skill_id);
        return { 
          ...skill, 
          detailed_ratings: skill.detailed_ratings || {
            knowledge: {},
            ability: {},
            behaviour: {},
            attitude: {}
          },
          modified: existing ? existing.modified : (skill.modified || false) 
        };
      });
      setLocalRatedSkills(skillsWithModified);
      localStorage.setItem(
        `ratedSkills_${clickedUser}`,
        JSON.stringify(skillsWithModified)
      );
      if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
        setUserRatedSkills(skillsWithModified);
      }
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
    }
  }, [sessionData]);

  // FIXED: Load KAAB data when selectedSkill changes - Ensure values are "yes"/"no" strings
  useEffect(() => {
    if (selectedSkill && localRatedSkills && localRatedSkills.length > 0) {
      const ratedSkill = localRatedSkills.find(
        (rated: any) => rated.skill_id === selectedSkill.skill_id
      );

      console.log("Loading KAAB data for skill:", selectedSkill.skill, ratedSkill);

      if (ratedSkill && ratedSkill.detailed_ratings) {
        // Load level selection
        const levelIndex = SkillLevels.findIndex((level: ProficiencyLevel) => {
          if (!ratedSkill.skill_level) return false;
          const levelNumber = ratedSkill.skill_level.toString().replace("Level ", "");
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

        // Load KAAB validation state - Ensure values are "yes"/"no" strings
        const convertToStrings = (obj: Record<string, any>): Record<string, string> => {
          const result: Record<string, string> = {};
          for (const [key, value] of Object.entries(obj || {})) {
            if (value === "yes" || value === "1" || value === 1 || value === true || value === "true") {
              result[key] = "yes";
            } else if (value === "no" || value === "0" || value === 0 || value === false || value === "false") {
              result[key] = "no";
            } else {
              result[key] = value as string;
            }
          }
          return result;
        };

        setValidationState({
          knowledge: convertToStrings(ratedSkill.detailed_ratings.knowledge || {}),
          ability: convertToStrings(ratedSkill.detailed_ratings.ability || {}),
          behaviour: convertToStrings(ratedSkill.detailed_ratings.behaviour || {}),
          attitude: convertToStrings(ratedSkill.detailed_ratings.attitude || {}),
        });

        // Show details if KAAB data exists
        const hasKAABData = ratedSkill.detailed_ratings &&
          (Object.keys(ratedSkill.detailed_ratings.knowledge || {}).length > 0 ||
          Object.keys(ratedSkill.detailed_ratings.ability || {}).length > 0 ||
          Object.keys(ratedSkill.detailed_ratings.behaviour || {}).length > 0 ||
          Object.keys(ratedSkill.detailed_ratings.attitude || {}).length > 0);

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
            const levelNumber = ratedSkill.skill_level.toString().replace("Level ", "");
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

  // FIXED: Updated handleValidation to use "yes"/"no" strings
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
          [attribute]: isValid ? "yes" : "no", // Store as "yes"/"no" strings
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
          setTimeout(() => {
            handleSubmit(newState);
          }, 300);
        }
      }

      return newState;
    });
  };

  const handleSubmit = (passedValidationState?: ValidationState): void => {
    if (selectedLevelIndex === null) {
      showInfo("Validation", "Please select at least one proficiency level before proceeding.", "error");
      return;
    }

    if (!selectedSkill) return;

    const currentValidationState = passedValidationState || validationState;

    // Create the rated skill with KAAB data - ensure objects are preserved
    const newRatedSkill = {
      skill_id: selectedSkill.skill_id,
      skill_level: selectedSkillLevel,
      skill: selectedSkill.skill,
      category: selectedSkill.category,
      detailed_ratings: {
        knowledge: { ...currentValidationState.knowledge },
        ability: { ...currentValidationState.ability },
        behaviour: { ...currentValidationState.behaviour },
        attitude: { ...(currentValidationState.attitude || {}) }
      },
      modified: true, // Mark as modified
    };

    console.log("Updating skill with KAAB data:", newRatedSkill);
    console.log("Knowledge values:", currentValidationState.knowledge);
    console.log("Ability values:", currentValidationState.ability);

    // Update local rated skills
    setLocalRatedSkills(prev => {
      const filtered = prev.filter(
        skill => skill.skill_id !== selectedSkill.skill_id
      );
      const updated = [...filtered, newRatedSkill];
      if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
        setUserRatedSkills(updated); // Update parent state
      }
      return updated;
    });

    // Move to next skill
    if (currentSkillIndex < userJobroleSkills.length - 1) {
      moveToNextSkill();
    } else {
      showInfo("Completed", "All skills rated! Click 'Validate & Save All' to submit.", "success");
    }
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

  // Part 2/3 - Continued...

  const handleLevelSelect = (index: number, level: ProficiencyLevel): void => {
    const newIndex = selectedLevelIndex === index ? null : index;
    const newLevel = level.proficiency_type || level.proficiency_level;

    setSelectedLevelIndex(newIndex);
    setSelectedSkillLevel(newLevel);
    setShowDetails(false);

    // Update local rated skills with the selected level
    if (selectedSkill) {
      const updatedSkill = {
        skill_id: selectedSkill.skill_id,
        skill_level: newLevel,
        skill: selectedSkill.skill,
        category: selectedSkill.category,
        detailed_ratings: {
          knowledge: validationState.knowledge,
          ability: validationState.ability,
          behaviour: validationState.behaviour,
          attitude: validationState.attitude,
        },
        modified: true, // Mark as modified
      };

      setLocalRatedSkills(prev => {
        const filtered = prev.filter(skill => skill.skill_id !== selectedSkill.skill_id);
        const updated = [...filtered, updatedSkill];
        if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
          setUserRatedSkills(updated);
        }
        return updated;
      });
    }
  };

  const handleSkillSelect = (skill: Skill, index: number): void => {
    // Save current skill data before switching ONLY if skill_level is selected
    if (selectedSkill && selectedLevelIndex !== null && selectedSkillLevel) {
      const currentRatedSkill = {
        skill_id: selectedSkill.skill_id,
        skill_level: selectedSkillLevel,
        skill: selectedSkill.skill,
        category: selectedSkill.category,
        detailed_ratings: {
          knowledge: validationState.knowledge,
          ability: validationState.ability,
          behaviour: validationState.behaviour,
          attitude: validationState.attitude,
        },
        modified: true, // Mark as modified
      };

      setLocalRatedSkills(prev => {
        const filtered = prev.filter(s => s.skill_id !== selectedSkill.skill_id);
        const updated = [...filtered, currentRatedSkill];
        localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(updated));
        if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
          setUserRatedSkills(updated); // Update parent state
        }
        console.log("Updated skill when switching:", currentRatedSkill.skill);
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
          knowledge: ratedSkill.detailed_ratings?.knowledge || {},
          ability: ratedSkill.detailed_ratings?.ability || {},
          behaviour: ratedSkill.detailed_ratings?.behaviour || {},
          attitude: ratedSkill.detailed_ratings?.attitude || {},
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

  const isSkillValid = (skill: any) => {
    return !!skill?.skill_level;
  };

  const hasKAABData = (skill: any) => {
    return skill.detailed_ratings &&
      (Object.keys(skill.detailed_ratings.knowledge || {}).length > 0 ||
       Object.keys(skill.detailed_ratings.ability || {}).length > 0 ||
       Object.keys(skill.detailed_ratings.behaviour || {}).length > 0 ||
       Object.keys(skill.detailed_ratings.attitude || {}).length > 0);
  };

  // ✅ Bulk validation with dialog (called by Save All button)
  const validateAndSaveAllSkills = async (): Promise<void> => {
    let skillsToSave = localRatedSkills.filter(skill => skill.modified && isSkillValid(skill));

    // If current skill has level selected, include it with current validationState
    if (selectedSkill && selectedLevelIndex !== null) {
      const currentSkillData = {
        skill_id: selectedSkill.skill_id,
        skill_level: selectedSkillLevel,
        skill: selectedSkill.skill,
        category: selectedSkill.category,
        detailed_ratings: {
          knowledge: { ...validationState.knowledge },
          ability: { ...validationState.ability },
          behaviour: { ...validationState.behaviour },
          attitude: { ...validationState.attitude }
        },
        modified: true,
      };

      // Replace or add the current skill
      skillsToSave = skillsToSave.filter(skill => skill.skill_id !== selectedSkill.skill_id);
      skillsToSave.push(currentSkillData);

      // Update localRatedSkills
      setLocalRatedSkills(prev => {
        const filtered = prev.filter(skill => skill.skill_id !== selectedSkill.skill_id);
        return [...filtered, currentSkillData];
      });
    }

    if (skillsToSave.length === 0) {
      showInfo(
        "No Updated Skills",
        "No skills have been updated. Please update some skills before saving.",
        "info"
      );
      return;
    }

    // ✅ Proceed with updated skills (KAAB is optional)
    await performBulkSave(skillsToSave);
  };

  // FIXED: performBulkSave to properly format KAAB data with "yes"/"no" values
  const performBulkSave = async (skillsToSave: any[]): Promise<void> => {
    setIsProcessing(true);
    try {
      console.log("skillsToSave:", skillsToSave);
      
      // Process skills - keep KAAB values as yes/no strings
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

        // Helper function to ensure KAAB values are "yes"/"no" strings
        const processKAAB = (kaabObj: any): Record<string, string> => {
          const result: Record<string, string> = {};
          for (const [key, value] of Object.entries(kaabObj || {})) {
            if (value === "yes" || value === "1" || value === 1 || value === true || value === "true") {
              result[key] = "yes";
            } else if (value === "no" || value === "0" || value === 0 || value === false || value === "false") {
              result[key] = "no";
            } else {
              result[key] = value as string; // Keep as-is if already "yes"/"no"
            }
          }
          return result;
        };

        // Process KAAB data - check both direct properties and detailed_ratings
        const knowledgeData = skill.knowledge || 
          (skill.detailed_ratings?.knowledge ? 
            (typeof skill.detailed_ratings.knowledge === 'string' 
              ? JSON.parse(skill.detailed_ratings.knowledge) 
              : skill.detailed_ratings.knowledge) 
            : {});
        
        const abilityData = skill.ability || 
          (skill.detailed_ratings?.ability ?
            (typeof skill.detailed_ratings.ability === 'string'
              ? JSON.parse(skill.detailed_ratings.ability)
              : skill.detailed_ratings.ability)
            : {});
        
        const behaviourData = skill.behaviour || 
          (skill.detailed_ratings?.behaviour ?
            (typeof skill.detailed_ratings.behaviour === 'string'
              ? JSON.parse(skill.detailed_ratings.behaviour)
              : skill.detailed_ratings.behaviour)
            : {});
        
        const attitudeData = skill.attitude || 
          (skill.detailed_ratings?.attitude ?
            (typeof skill.detailed_ratings.attitude === 'string'
              ? JSON.parse(skill.detailed_ratings.attitude)
              : skill.detailed_ratings.attitude)
            : {});

        return {
          ...skill,
          skill_level: validatedLevel,
          knowledge: processKAAB(knowledgeData),
          ability: processKAAB(abilityData),
          behaviour: processKAAB(behaviourData),
          attitude: processKAAB(attitudeData),
        };
      });

      console.log("Processed skills for bulk save:", processedSkills);

      const bulkData = {
        skills: processedSkills.map((skill) => ({
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

      console.log("Final bulk data to send:", JSON.stringify(bulkData, null, 2));

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

        // Mark saved skills as not modified
        setLocalRatedSkills(prev => {
          const updated = prev.map(skill =>
            skillsToSave.some(saved => saved.skill_id === skill.skill_id)
              ? { ...skill, modified: false }
              : skill
          );
          localStorage.setItem(`ratedSkills_${clickedUser}`, JSON.stringify(updated));
          return updated;
        });

        if (setUserRatedSkills && typeof setUserRatedSkills === 'function') {
          setUserRatedSkills([]);
        }

        showInfo(
          "Success ✅",
          `${skillsToSave.length} updated skills have been successfully saved!`,
          "success"
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

  // Validation Dialog component
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

  // Part 3/3 (final) - UI rendering remains mostly the same
  return (
    <>
      <div className="h-[fit-height] bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto mt-10">
          <div className="relative">
            <div className="absolute -top-15 right-0 flex gap-5 z-10">
              <span
                className="mdi mdi-star-box-multiple-outline text-xl cursor-pointer p-2 bg-yellow-100 text-yellow-600 shadow hover:bg-yellow-200 hover:text-yellow-700 transition-all rounded-md"
                title="Star Box"
                onClick={() => {
                  setViewPart("default");
                }}
              ></span>

              <span
                className="mdi mdi-chart-bar text-xl cursor-pointer p-2 bg-blue-100 text-blue-600 shadow hover:bg-blue-200 hover:text-blue-700 transition-all rounded-md"
                title="Admin Skill Rating"
                onClick={() => {
                  setViewPart("rated skill");
                }}
              ></span>

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
                    📈 Competency Overview
                  </h2>
                  <div className="w-full h-0.5 bg-[#686868] mb-8"></div>

                  <div className="h-[472px] overflow-y-auto">
                    {userJobroleSkills.map((skill: any, index: any) => {
                      const ratedSkill = localRatedSkills?.find((rated: any) =>
                        rated.skill_id === skill.skill_id
                      );

                      const hasKAAB = ratedSkill && hasKAABData(ratedSkill);

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

                  {/* Detailed Rating Section - FIXED: Button styling */}
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
                            (item: any, index: number, array: any[]) => {
                              const currentValue = validationState[activeTab as keyof ValidationState]?.[item];
                              return (
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
                                      className={`w-7 h-7 flex items-center justify-center rounded-full border ${currentValue === "yes"
                                          ? "bg-green-600 text-white border-green-700"
                                          : "bg-white text-green-600 border-green-300 hover:bg-green-50"
                                        }`}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleValidation(activeTab as any, item, false, index, array)
                                      }
                                      className={`w-7 h-7 flex items-center justify-center rounded-full border ${currentValue === "no"
                                          ? "bg-red-600 text-white border-red-700"
                                          : "bg-white text-red-600 border-red-300 hover:bg-red-50"
                                        }`}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        {/* ✅ Next Button -> show only on last tab */}
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
            disabled={isProcessing || localRatedSkills.filter(skill => skill.modified && isSkillValid(skill)).length === 0}
          >
            {isProcessing ? "Processing..." : `Validate & Save All (${localRatedSkills.filter(skill => skill.modified && isSkillValid(skill)).length})`}
          </button>
        </div>
      )}

      {/* Dialogs */}
      <ValidationDialog />
      <InfoDialog />
    </>
  );
}