"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";  
// validators (do not change utils.ts)
import { validateSkillProficiencies, getValidationMessages } from "@/lib/utils";

interface JobroleSkillRatingDesignProps {
  subInstituteId: number;
  jobroleId: number;
  jobroleTitle: string;
}

export default function JobroleSkillRatingDesign({
  subInstituteId,
  jobroleId,
  jobroleTitle,
}: JobroleSkillRatingDesignProps) {
  const [skills, setSkills] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [ability, setAbility] = useState<any[]>([]);
  const [attitude, setAttitude] = useState<any[]>([]);
  const [behaviour, setBehaviour] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [currentSkillIndex, setCurrentSkillIndex] = useState<number>(0);
  const [expandedTab, setExpandedTab] = useState<string | null>(null);
  const [proficiencyLevels, setProficiencyLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [skillLevelSelections, setSkillLevelSelections] = useState<Record<string, any>>({});
  const [selectedKnowledge, setSelectedKnowledge] = useState<any>(null);
  const [knowledgeProficiencyLevels, setKnowledgeProficiencyLevels] = useState<any[]>([]);
  const [selectedKnowledgeLevel, setSelectedKnowledgeLevel] = useState<any>(null);
  const [knowledgeLevelSelections, setKnowledgeLevelSelections] = useState<Record<string, any>>({});
  const [selectedAbility, setSelectedAbility] = useState<any>(null);
  const [abilityProficiencyLevels, setAbilityProficiencyLevels] = useState<any[]>([]);
  const [selectedAbilityLevel, setSelectedAbilityLevel] = useState<any>(null);
  const [abilityLevelSelections, setAbilityLevelSelections] = useState<Record<string, any>>({});

  const [selectedAttitude, setSelectedAttitude] = useState<any>(null);
  const [selectedBehaviour, setSelectedBehaviour] = useState<any>(null);
  const [currentKnowledgeIndex, setCurrentKnowledgeIndex] = useState<number>(0);
  const [currentAbilityIndex, setCurrentAbilityIndex] = useState<number>(0);
  const [currentAttitudeIndex, setCurrentAttitudeIndex] = useState<number>(0);
  const [currentBehaviourIndex, setCurrentBehaviourIndex] = useState<number>(0);

  const [attitudeProficiencyLevels, setAttitudeProficiencyLevels] = useState<any[]>([]);
  const [selectedAttitudeLevel, setSelectedAttitudeLevel] = useState<any>(null);
  const [attitudeLevelSelections, setAttitudeLevelSelections] = useState<Record<string, any>>({});

  const [behaviourProficiencyLevels, setBehaviourProficiencyLevels] = useState<any[]>([]);
  const [selectedBehaviourLevel, setSelectedBehaviourLevel] = useState<any>(null);
  const [behaviourLevelSelections, setBehaviourLevelSelections] = useState<Record<string, any>>({});

  const [initialSkillLevelSelections, setInitialSkillLevelSelections] = useState<Record<string, any>>({});
  const [initialKnowledgeLevelSelections, setInitialKnowledgeLevelSelections] = useState<Record<string, any>>({});
  const [initialAbilityLevelSelections, setInitialAbilityLevelSelections] = useState<Record<string, any>>({});
  const [initialAttitudeLevelSelections, setInitialAttitudeLevelSelections] = useState<Record<string, any>>({});
  const [initialBehaviourLevelSelections, setInitialBehaviourLevelSelections] = useState<Record<string, any>>({});

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });

  const [localRatedSkills, setLocalRatedSkills] = useState<any[]>([]);

  const storageKey = sessionData.userId && jobroleId ? `jobrole_skill_ratings_${sessionData.userId}_${jobroleId}` : null;

  // --- Dialog states for replacing alerts/confirms ---
  const [validationDialogOpen, setValidationDialogOpen] = useState<boolean>(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [validationType, setValidationType] = useState<"error" | "warning">("warning");
  const [pendingBulkData, setPendingBulkData] = useState<any>(null);

  const [infoDialogOpen, setInfoDialogOpen] = useState<boolean>(false);
  const [infoDialogTitle, setInfoDialogTitle] = useState<string>("Information");
  const [infoDialogMessages, setInfoDialogMessages] = useState<string[]>([]);
  const [infoDialogVariant, setInfoDialogVariant] = useState<"info" | "success" | "error">("info");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);


  useEffect(() => {
    if (!sessionData.url || !subInstituteId || !jobroleId || !jobroleTitle) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/get-kaba?sub_institute_id=${subInstituteId}&type=jobrole&type_id=${jobroleId}&title=${encodeURIComponent(jobroleTitle)}`
        );
        if (response.ok) {
          const data = await response.json();

          const normalizeItem = (item: any, index: number, type: string) => {
            if (typeof item === 'string') {
              return { id: `${type}_${index}`, title: item, description: '' };
            } else {
              return { id: item.id || `${type}_${index}`, title: item.title || item, description: item.description || '' };
            }
          };

          setSkills(data.skill?.map((item: any, index: number) => normalizeItem(item, index, 'skill')) || []);
          setKnowledge(data.knowledge?.map((item: any, index: number) => normalizeItem(item, index, 'knowledge')) || []);
          setAbility(data.ability?.map((item: any, index: number) => normalizeItem(item, index, 'ability')) || []);
          setAttitude(data.attitude?.map((item: any, index: number) => normalizeItem(item, index, 'attitude')) || []);
          setBehaviour(data.behaviour?.map((item: any, index: number) => normalizeItem(item, index, 'behaviour')) || []);

          if (data.skill?.length) {
            setSelectedSkill(data.skill[0]);
            setExpandedTab('skills');
          }

        } else {
          console.error("KAAB API failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching KAAB data:", err);
      }
    };

    fetchData();
  }, [sessionData.url, subInstituteId, jobroleId, jobroleTitle]);

  // Load saved ratings from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSkillLevelSelections(parsed.skillLevelSelections || {});
          setKnowledgeLevelSelections(parsed.knowledgeLevelSelections || {});
          setAbilityLevelSelections(parsed.abilityLevelSelections || {});
          setAttitudeLevelSelections(parsed.attitudeLevelSelections || {});
          setBehaviourLevelSelections(parsed.behaviourLevelSelections || {});
          setInitialSkillLevelSelections(parsed.skillLevelSelections || {});
          setInitialKnowledgeLevelSelections(parsed.knowledgeLevelSelections || {});
          setInitialAbilityLevelSelections(parsed.abilityLevelSelections || {});
          setInitialAttitudeLevelSelections(parsed.attitudeLevelSelections || {});
          setInitialBehaviourLevelSelections(parsed.behaviourLevelSelections || {});
        } catch (e) {
          console.error('Error parsing saved ratings:', e);
        }
      }
    }
  }, [storageKey]);

  // Save ratings to localStorage whenever selections change
  useEffect(() => {
    if (storageKey) {
      const data = {
        skillLevelSelections,
        knowledgeLevelSelections,
        abilityLevelSelections,
        attitudeLevelSelections,
        behaviourLevelSelections,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [skillLevelSelections, knowledgeLevelSelections, abilityLevelSelections, attitudeLevelSelections, behaviourLevelSelections, storageKey]);


  useEffect(() => {
    if (!sessionData.url || !selectedSkill) return;

    const fetchProficiencyLevels = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/table_data?filters[sub_institute_id]=${subInstituteId}&table=s_proficiency_levels`
        );
        if (response.ok) {
          const data = await response.json();
          setProficiencyLevels(data);
        } else {
          console.error("Proficiency API failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching proficiency levels:", err);
      }
    };

    fetchProficiencyLevels();
  }, [sessionData.url, selectedSkill, subInstituteId]);

  useEffect(() => {
    if (!sessionData.url || !selectedKnowledge) return;

    const fetchKnowledgeProficiencyLevels = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/table_data?filters[sub_institute_id]=${subInstituteId}&table=s_proficiency_knowledge`
        );
        if (response.ok) {
          const data = await response.json();
          setKnowledgeProficiencyLevels(data);
        } else {
          console.error("Knowledge Proficiency API failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching knowledge proficiency levels:", err);
      }
    };

    fetchKnowledgeProficiencyLevels();
  }, [sessionData.url, selectedKnowledge, subInstituteId]);

  useEffect(() => {
    if (!sessionData.url || !selectedAbility) return;

    const fetchAbilityProficiencyLevels = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/table_data?filters[sub_institute_id]=${subInstituteId}&table=s_proficiency_ability`
        );
        if (response.ok) {
          const data = await response.json();
          setAbilityProficiencyLevels(data);
        } else {
          console.error("Ability Proficiency API failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching ability proficiency levels:", err);
      }
    };

    fetchAbilityProficiencyLevels();
  }, [sessionData.url, selectedAbility, subInstituteId]);

  useEffect(() => {
    if (!sessionData.url || !selectedAttitude) return;

    const fetchAttitudeProficiencyLevels = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/table_data?filters[sub_institute_id]=${subInstituteId}&table=s_proficiency_attitude`
        );
        if (response.ok) {
          const data = await response.json();
          setAttitudeProficiencyLevels(data);
        } else {
          console.error("Attitude Proficiency API failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching attitude proficiency levels:", err);
      }
    };

    fetchAttitudeProficiencyLevels();
  }, [sessionData.url, selectedAttitude, subInstituteId]);

  useEffect(() => {
    if (!sessionData.url || !selectedBehaviour) return;

    const fetchBehaviourProficiencyLevels = async () => {
      try {
        const response = await fetch(
          `${sessionData.url}/table_data?filters[sub_institute_id]=${subInstituteId}&table=s_proficiency_behaviour`
        );
        if (response.ok) {
          const data = await response.json();
          setBehaviourProficiencyLevels(data);
        } else {
          console.error("Behaviour Proficiency API failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching behaviour proficiency levels:", err);
      }
    };

    fetchBehaviourProficiencyLevels();
  }, [sessionData.url, selectedBehaviour, subInstituteId]);


  const getCurrentCategory = () => {
    if (expandedTab === 'skills') return 'skill';
    if (expandedTab === 'knowledge') return 'knowledge';
    if (expandedTab === 'ability') return 'ability';
    if (expandedTab === 'attitude') return 'attitude';
    if (expandedTab === 'behaviour') return 'behaviour';
    return null;
  };
  

  const moveToNext = () => {
    const category = getCurrentCategory();
    if (!category) return;
    let currentIndex!: number;
    let setCurrentIndex!: (index: number) => void;
    let data!: any[];
    let setSelected!: (item: any) => void;
    let setLevelSetter!: (level: any) => void;
    let levelSelections!: Record<string, any>;
    if (category === 'skill') {
      currentIndex = currentSkillIndex;
      setCurrentIndex = setCurrentSkillIndex;
      data = skills;
      setSelected = setSelectedSkill;
      setLevelSetter = setSelectedLevel;
      levelSelections = skillLevelSelections;
    } else if (category === 'knowledge') {
      currentIndex = currentKnowledgeIndex;
      setCurrentIndex = setCurrentKnowledgeIndex;
      data = knowledge;
      setSelected = setSelectedKnowledge;
      setLevelSetter = setSelectedKnowledgeLevel;
      levelSelections = knowledgeLevelSelections;
    } else if (category === 'ability') {
      currentIndex = currentAbilityIndex;
      setCurrentIndex = setCurrentAbilityIndex;
      data = ability;
      setSelected = setSelectedAbility;
      setLevelSetter = setSelectedAbilityLevel;
      levelSelections = abilityLevelSelections;
    } else if (category === 'attitude') {
      currentIndex = currentAttitudeIndex;
      setCurrentIndex = setCurrentAttitudeIndex;
      data = attitude;
      setSelected = setSelectedAttitude;
      setLevelSetter = setSelectedAttitudeLevel;
      levelSelections = attitudeLevelSelections;
    } else if (category === 'behaviour') {
      currentIndex = currentBehaviourIndex;
      setCurrentIndex = setCurrentBehaviourIndex;
      data = behaviour;
      setSelected = setSelectedBehaviour;
      setLevelSetter = setSelectedBehaviourLevel;
      levelSelections = behaviourLevelSelections;
    }
    if (currentIndex < data.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextItem = data[nextIndex];
      const selectedLevel = levelSelections[nextItem.id] || null;
      setCurrentIndex(nextIndex);
      setLevelSetter(selectedLevel);
      setSelected(nextItem);
      // Clear other selections
      if (category === 'skill') {
        setSelectedKnowledge(null);
        setSelectedAbility(null);
        setSelectedAttitude(null);
        setSelectedBehaviour(null);
      } else if (category === 'knowledge') {
        setSelectedSkill(null);
        setSelectedAbility(null);
        setSelectedAttitude(null);
        setSelectedBehaviour(null);
      } else if (category === 'ability') {
        setSelectedSkill(null);
        setSelectedKnowledge(null);
        setSelectedAttitude(null);
        setSelectedBehaviour(null);
      } else if (category === 'attitude') {
        setSelectedSkill(null);
        setSelectedKnowledge(null);
        setSelectedAbility(null);
        setSelectedBehaviour(null);
      } else if (category === 'behaviour') {
        setSelectedSkill(null);
        setSelectedKnowledge(null);
        setSelectedAbility(null);
        setSelectedAttitude(null);
      }
      // Set expanded tab
      setExpandedTab(category === 'skill' ? 'skills' : category);
    }
  };

  const moveToPrevious = () => {
    const category = getCurrentCategory();
    if (!category) return;
    let currentIndex!: number;
    let setCurrentIndex!: (index: number) => void;
    let data!: any[];
    let setSelected!: (item: any) => void;
    let setLevelSetter!: (level: any) => void;
    let levelSelections!: Record<string, any>;
    if (category === 'skill') {
      currentIndex = currentSkillIndex;
      setCurrentIndex = setCurrentSkillIndex;
      data = skills;
      setSelected = setSelectedSkill;
      setLevelSetter = setSelectedLevel;
      levelSelections = skillLevelSelections;
    } else if (category === 'knowledge') {
      currentIndex = currentKnowledgeIndex;
      setCurrentIndex = setCurrentKnowledgeIndex;
      data = knowledge;
      setSelected = setSelectedKnowledge;
      setLevelSetter = setSelectedKnowledgeLevel;
      levelSelections = knowledgeLevelSelections;
    } else if (category === 'ability') {
      currentIndex = currentAbilityIndex;
      setCurrentIndex = setCurrentAbilityIndex;
      data = ability;
      setSelected = setSelectedAbility;
      setLevelSetter = setSelectedAbilityLevel;
      levelSelections = abilityLevelSelections;
    } else if (category === 'attitude') {
      currentIndex = currentAttitudeIndex;
      setCurrentIndex = setCurrentAttitudeIndex;
      data = attitude;
      setSelected = setSelectedAttitude;
      setLevelSetter = setSelectedAttitudeLevel;
      levelSelections = attitudeLevelSelections;
    } else if (category === 'behaviour') {
      currentIndex = currentBehaviourIndex;
      setCurrentIndex = setCurrentBehaviourIndex;
      data = behaviour;
      setSelected = setSelectedBehaviour;
      setLevelSetter = setSelectedBehaviourLevel;
      levelSelections = behaviourLevelSelections;
    }
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevItem = data[prevIndex];
      const selectedLevel = levelSelections[prevItem.id] || null;
      setCurrentIndex(prevIndex);
      setLevelSetter(selectedLevel);
      setSelected(prevItem);
      // Clear other selections
      if (category === 'skill') {
        setSelectedKnowledge(null);
        setSelectedAbility(null);
        setSelectedAttitude(null);
        setSelectedBehaviour(null);
      } else if (category === 'knowledge') {
        setSelectedSkill(null);
        setSelectedAbility(null);
        setSelectedAttitude(null);
        setSelectedBehaviour(null);
      } else if (category === 'ability') {
        setSelectedSkill(null);
        setSelectedKnowledge(null);
        setSelectedAttitude(null);
        setSelectedBehaviour(null);
      } else if (category === 'attitude') {
        setSelectedSkill(null);
        setSelectedKnowledge(null);
        setSelectedAbility(null);
        setSelectedBehaviour(null);
      } else if (category === 'behaviour') {
        setSelectedSkill(null);
        setSelectedKnowledge(null);
        setSelectedAbility(null);
        setSelectedAttitude(null);
      }
      // Set expanded tab
      setExpandedTab(category === 'skill' ? 'skills' : category);
    }
  };

  // ✅ Bulk validation with dialog (called by Save All button)
  const validateAndSaveAllSkills = async (): Promise<void> => {
    // Collect all rated items
    const ratedSkills: any[] = [];
    const ratedKAAB: any[] = [];
  
    // Collect from all categories
    const categories = [
      { data: skills, selections: skillLevelSelections, type: 'skill' },
      { data: knowledge, selections: knowledgeLevelSelections, type: 'knowledge' },
      { data: ability, selections: abilityLevelSelections, type: 'ability' },
      { data: attitude, selections: attitudeLevelSelections, type: 'attitude' },
      { data: behaviour, selections: behaviourLevelSelections, type: 'behaviour' },
    ];
  
    categories.forEach(({ data, selections, type }) => {
      const initialSelections = type === 'skill' ? initialSkillLevelSelections :
        type === 'knowledge' ? initialKnowledgeLevelSelections :
        type === 'ability' ? initialAbilityLevelSelections :
        type === 'attitude' ? initialAttitudeLevelSelections :
        initialBehaviourLevelSelections;
      data.forEach((item: any) => {
        const current = selections[item.id];
        const initial = initialSelections[item.id];
        if (current !== initial) {
          const selectedLevel = current;
          const levelValue = typeof selectedLevel === 'object' ? (selectedLevel.proficiency_level || selectedLevel.level) : selectedLevel;
          const itemData = {
            id: item.id,
            title: item.title || item,
            level: levelValue,
            type: type,
            category: type,
          };
          if (type === 'skill') {
            ratedSkills.push(itemData);
          } else {
            ratedKAAB.push(itemData);
          }
        }
      });
    });

    if (ratedSkills.length === 0 && ratedKAAB.length === 0) {
      showInfo("No ratings", "No items have been rated yet!", "info");
      return;
    }

    // Run validation before submitting
    const allRated = [...ratedSkills, ...ratedKAAB];
    const validation = validateSkillProficiencies(
      allRated.map((item) => ({
        skill_id: item.id,
        skill_name: item.title,
        proficiency_level: Number(item.level?.match(/\d+/)?.[0] || 0),
        category: item.category,
      }))
    );

    const messages = getValidationMessages(validation);

    if (!validation.isValid) {
      // Show errors dialog
      setValidationMessages(messages);
      setValidationType("error");
      setValidationDialogOpen(true);
      return;
    } else if (validation.warnings.length > 0) {
      // Show warnings dialog with Proceed button
      setValidationMessages(messages);
      setValidationType("warning");
      setPendingBulkData({ ratedSkills, ratedKAAB });
      setValidationDialogOpen(true);
      return;
    }

    // No issues — proceed
    await performBulkSave(ratedSkills, ratedKAAB);
  };

  const performBulkSave = async (ratedSkills: any[], ratedKAAB: any[]): Promise<void> => {
    setIsProcessing(true);
    try {
      // Process skills
      const processedSkills = ratedSkills.map((item) => {
        let numericLevel = 1;

        if (item.level) {
          const levelMatch = item.level.toString().match(/\d+/);
          if (levelMatch) {
            numericLevel = parseInt(levelMatch[0], 10);
          }
        }

        const validatedLevel = Math.max(1, Math.min(5, numericLevel));

        return {
          skill_id: item.id,
          skill_level: validatedLevel,
          type: item.type,
          user_id: sessionData.userId
        };
      });

      // Process KAAB
      const processedKAAB = ratedKAAB.map((item) => {
        let numericLevel = 1;

        if (item.level) {
          const levelMatch = item.level.toString().match(/\d+/);
          if (levelMatch) {
            numericLevel = parseInt(levelMatch[0], 10);
          }
        }

        const validatedLevel = Math.max(1, Math.min(5, numericLevel));

        return {
          skill_id: item.id,
          skill_level: validatedLevel,
          type: item.type,
          user_id: sessionData.userId
        };
      });

      const bulkData = {
        skills: processedSkills,
        kaab: processedKAAB,
        user_id: sessionData.userId,
        sub_institute_id: sessionData.subInstituteId
      };
  
      console.log("Final bulk data to send:", bulkData);
  
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
  
        // Update initial selections to current after successful save
        setInitialSkillLevelSelections(skillLevelSelections);
        setInitialKnowledgeLevelSelections(knowledgeLevelSelections);
        setInitialAbilityLevelSelections(abilityLevelSelections);
        setInitialAttitudeLevelSelections(attitudeLevelSelections);
        setInitialBehaviourLevelSelections(behaviourLevelSelections);

        showInfo(
          "Success ✅",
          `All ${processedSkills.length + processedKAAB.length} items have been successfully saved!`,
          "success"
        );
      } else if (response.status === 422) {
        const errorData = await response.json();
        console.error("Validation error details:", errorData);
  
        // Extract specific error messages
        const errorMessages = Object.values(errorData.errors || {})
          .flat()
          .map((msg: any) => `• ${msg}`);
  
        showInfo(
          "Validation Failed",
          errorMessages.length > 0 ? errorMessages : ["Please check all levels are valid (1-5)"],
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

  return (
    <div className="flex gap-6">

      {/* ================= LEFT PANEL ================= */}
      <div className="w-[280px] bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-3">
        <h2 className="text-[#23395B] font-semibold text-sm mb-2 flex items-center gap-2">
          📊 Skill Proficiency Overview
        </h2>

        <div className="h-[2px] bg-gray-400 mb-3" />

        {/* Accordion Tabs */}
        <div className="space-y-2">
          {[
            { title: "skills", icon: "mdi-brain", label: "Skills", data: skills },
            { title: "knowledge", icon: "mdi-library", label: "Knowledge", data: knowledge },
            { title: "ability", icon: "mdi-hand-okay", label: "Ability", data: ability },
            { title: "attitude", icon: "mdi-emoticon", label: "Attitude", data: attitude },
            { title: "behaviour", icon: "mdi-account-child", label: "Behaviour", data: behaviour },
          ].map((tab) => (
            <div key={tab.title} className="border border-gray-200 rounded-lg">
              {/* Accordion Header */}
              <div
                onClick={() => setExpandedTab(expandedTab === tab.title ? null : tab.title)}
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-t-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`mdi ${tab.icon} text-sm`}></span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
                <span className={`text-sm transition-transform ${expandedTab === tab.title ? 'rotate-90' : ''}`}>
                  ›
                </span>
              </div>

              {/* Accordion Content */}
              {expandedTab === tab.title && (
                <div className="px-3 pb-3 bg-gray-50 rounded-b-lg">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {tab.data.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={tab.title === "skills" ? () => {
                          const skillIndex = skills.findIndex(skill => skill.id === item.id);
                          setCurrentSkillIndex(skillIndex);
                          setSelectedSkill(item);
                          setSelectedLevel(skillLevelSelections[item.id] || null);
                          setSelectedKnowledge(null);
                          setSelectedAbility(null);
                          setSelectedAttitude(null);
                          setSelectedBehaviour(null);
                          setExpandedTab('skills');
                        } : tab.title === "knowledge" ? () => {
                          const knowledgeIndex = knowledge.findIndex(k => k.id === item.id);
                          setCurrentKnowledgeIndex(knowledgeIndex);
                          setSelectedKnowledge(item);
                          setSelectedKnowledgeLevel(knowledgeLevelSelections[item.id] || null);
                          setSelectedSkill(null);
                          setSelectedAbility(null);
                          setSelectedAttitude(null);
                          setSelectedBehaviour(null);
                          setExpandedTab('knowledge');
                        } : tab.title === "ability" ? () => {
                          const abilityIndex = ability.findIndex(a => a.id === item.id);
                          setCurrentAbilityIndex(abilityIndex);
                          setSelectedAbility(item);
                          setSelectedAbilityLevel(abilityLevelSelections[item.id] || null);
                          setSelectedSkill(null);
                          setSelectedKnowledge(null);
                          setSelectedAttitude(null);
                          setSelectedBehaviour(null);
                          setExpandedTab('ability');
                        } : tab.title === "attitude" ? () => {
                          const attitudeIndex = attitude.findIndex(att => att.id === item.id);
                          setCurrentAttitudeIndex(attitudeIndex);
                          setSelectedAttitude(item);
                          setSelectedAttitudeLevel(attitudeLevelSelections[item.id] || null);
                          setSelectedSkill(null);
                          setSelectedKnowledge(null);
                          setSelectedAbility(null);
                          setSelectedBehaviour(null);
                          setExpandedTab('attitude');
                        } : tab.title === "behaviour" ? () => {
                          const behaviourIndex = behaviour.findIndex(beh => beh.id === item.id);
                          setCurrentBehaviourIndex(behaviourIndex);
                          setSelectedBehaviour(item);
                          setSelectedBehaviourLevel(behaviourLevelSelections[item.id] || null);
                          setSelectedSkill(null);
                          setSelectedKnowledge(null);
                          setSelectedAbility(null);
                          setSelectedAttitude(null);
                          setExpandedTab('behaviour');
                        } : undefined}
                        className={`w-full bg-white border p-2 rounded-lg cursor-pointer transition hover:bg-gray-50
  ${(tab.title === "skills" && selectedSkill?.id === item.id) ||
                            (tab.title === "knowledge" && selectedKnowledge?.id === item.id) ||
                            (tab.title === "ability" && selectedAbility?.id === item.id) ||
                            (tab.title === "attitude" && selectedAttitude?.id === item.id) ||
                            (tab.title === "behaviour" && selectedBehaviour?.id === item.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-blue-100"
                          }
`}

                      >
                        <p className="text-xs font-medium">{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================= CENTER PANEL ================= */}
      <div className="flex-1 bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-gray-800">
            {selectedSkill ? selectedSkill.title : selectedKnowledge ? selectedKnowledge.title : selectedAbility ? selectedAbility.title : selectedAttitude ? selectedAttitude.title : selectedBehaviour ? selectedBehaviour.title : "Select an item"}
          </h1>

          <span className="text-blue-600 text-xl cursor-pointer">ℹ️</span>
        </div>

        {/* Item Description */}
        {(selectedSkill || selectedKnowledge || selectedAbility || selectedAttitude || selectedBehaviour) && (
          <p className="text-sm text-gray-600 mb-4">
            {selectedSkill?.description || selectedKnowledge?.description || selectedAbility?.description || selectedAttitude?.description || selectedBehaviour?.description || ""}
          </p>
        )}

        <hr className="mb-6" />

        {selectedSkill ? (
          <>
            {/* Proficiency Levels – COLOR-SYNCED OUTLINE */}
            <div className="flex justify-center flex-wrap gap-0">
              <div
                className="
      flex p-1 rounded-full
      bg-white
      shadow-[0_0_0_1px_#c7d2fe,0_4px_12px_rgba(0,0,0,0.08)]
    "
              >
                {proficiencyLevels.map((level, index) => {
                  const levelNumber =
                    level?.proficiency_level?.match(/\d+/)?.[0] ?? "1";

                  const bgColors = [
                    "bg-blue-100 text-blue-700",
                    "bg-green-100 text-green-700",
                    "bg-yellow-100 text-yellow-700",
                    "bg-orange-100 text-orange-700",
                    "bg-red-100 text-red-700",
                    "bg-purple-100 text-purple-700",
                  ];

                  const borderColors = [
                    "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]",
                    "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.25)]",
                    "border-yellow-500 shadow-[0_0_0_3px_rgba(234,179,8,0.25)]",
                    "border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.25)]",
                    "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]",
                    "border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.25)]",
                  ];

                  const isSelected = selectedLevel?.id === level.id;

                  return (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedLevel(level);
                        setSkillLevelSelections(prev => ({
                          ...prev,
                          [selectedSkill.id]: level
                        }));
                      }}
                      className={`
            relative
            w-[64px] h-[38px]
            flex items-center justify-center
            text-sm font-semibold
            transition-all duration-200
            ${bgColors[index]}
            ${index === 0 ? "rounded-l-full" : ""}
            ${index === proficiencyLevels.length - 1 ? "rounded-r-full" : ""}
            ${isSelected
                          ? `border-2 ${borderColors[index]} z-10`
                          : "border border-transparent"
                        }
          `}
                    >
                      {levelNumber}
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Selected Level Description */}
            {selectedLevel && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 space-y-4">

                {/* Type Description */}
                {selectedLevel.type_description && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      Type Description :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedLevel.type_description}
                    </span>
                  </div>
                )}

                {/* Level Description */}
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Level Description :
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedLevel.description}
                  </span>
                </div>

              </div>

            )}

          </>
        ) : selectedKnowledge ? (
          <>
            {/* Knowledge Proficiency Levels */}
            <div className="flex justify-center flex-wrap gap-0">
              <div
                className="
  flex p-1 rounded-full
  bg-white
  shadow-[0_0_0_1px_#c7d2fe,0_4px_12px_rgba(0,0,0,0.08)]
"
              >
                {knowledgeProficiencyLevels.map((level, index) => {
                  const levelNumber =
                    (level?.proficiency_level || level?.level || "").toString().match(/\d+/)?.[0] ?? "1";

                  const bgColors = [
                    "bg-blue-100 text-blue-700",
                    "bg-green-100 text-green-700",
                    "bg-yellow-100 text-yellow-700",
                    "bg-orange-100 text-orange-700",
                    "bg-red-100 text-red-700",
                    "bg-purple-100 text-purple-700",
                  ];

                  const borderColors = [
                    "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]",
                    "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.25)]",
                    "border-yellow-500 shadow-[0_0_0_3px_rgba(234,179,8,0.25)]",
                    "border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.25)]",
                    "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]",
                    "border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.25)]",
                  ];

                  const isSelected = selectedKnowledgeLevel?.id === level.id;

                  return (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedKnowledgeLevel(level);
                        setKnowledgeLevelSelections(prev => ({
                          ...prev,
                          [selectedKnowledge.id]: level
                        }));
                      }}
                      className={`
        relative
        w-[64px] h-[38px]
        flex items-center justify-center
        text-sm font-semibold
        transition-all duration-200
        ${bgColors[index]}
        ${index === 0 ? "rounded-l-full" : ""}
        ${index === knowledgeProficiencyLevels.length - 1 ? "rounded-r-full" : ""}
        ${isSelected
                          ? `border-2 ${borderColors[index]} z-10`
                          : "border border-transparent"
                        }
      `}
                    >
                      {levelNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Knowledge Level Description */}
            {selectedKnowledgeLevel && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 space-y-4">
                {/* Descriptor */}
                {selectedKnowledgeLevel.descriptor && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      Descriptor :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedKnowledgeLevel.descriptor}
                    </span>
                  </div>
                )}

                {/* Indicators */}
                {selectedKnowledgeLevel.indicators && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      Indicators :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedKnowledgeLevel.indicators}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : selectedAbility ? (
          /* ================= ABILITY ================= */
          <>
            {/* Ability Proficiency Levels */}
            <div className="flex justify-center flex-wrap gap-0">
              <div className="flex p-1 rounded-full bg-white shadow-[0_0_0_1px_#c7d2fe,0_4px_12px_rgba(0,0,0,0.08)]">
                {abilityProficiencyLevels.map((level, index) => {
                  const levelNumber = (level?.proficiency_level || level?.level || "").toString().match(/\d+/)?.[0] ?? "1";

                  const bgColors = [
                    "bg-blue-100 text-blue-700",
                    "bg-green-100 text-green-700",
                    "bg-yellow-100 text-yellow-700",
                    "bg-orange-100 text-orange-700",
                    "bg-red-100 text-red-700",
                    "bg-purple-100 text-purple-700",
                  ];

                  const borderColors = [
                    "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]",
                    "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.25)]",
                    "border-yellow-500 shadow-[0_0_0_3px_rgba(234,179,8,0.25)]",
                    "border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.25)]",
                    "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]",
                    "border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.25)]",
                  ];

                  const isSelected = selectedAbilityLevel?.id === level.id;

                  return (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedAbilityLevel(level);
                        setAbilityLevelSelections(prev => ({
                          ...prev,
                          [selectedAbility.id]: level,
                        }));
                      }}
                      className={`
                relative
                w-[64px] h-[38px]
                flex items-center justify-center
                text-sm font-semibold
                transition-all duration-200
                ${bgColors[index]}
                ${index === 0 ? "rounded-l-full" : ""}
                ${index === abilityProficiencyLevels.length - 1 ? "rounded-r-full" : ""}
                ${isSelected ? `border-2 ${borderColors[index]} z-10` : "border border-transparent"}
              `}
                    >
                      {levelNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descriptor + Indicators */}
            {selectedAbilityLevel && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 space-y-4">
                {selectedAbilityLevel.descriptor && (
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Descriptor :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedAbilityLevel.descriptor}
                    </span>
                  </div>
                )}

                {selectedAbilityLevel.indicators && (
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Indicators :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedAbilityLevel.indicators}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : selectedAttitude ? (
          <>
            {/* Attitude Proficiency Levels */}
            <div className="flex justify-center flex-wrap gap-0">
              <div className="flex p-1 rounded-full bg-white shadow-[0_0_0_1px_#c7d2fe,0_4px_12px_rgba(0,0,0,0.08)]">
                {attitudeProficiencyLevels.map((level, index) => {
                  const levelNumber = (level?.proficiency_level || level?.level || "").toString().match(/\d+/)?.[0] ?? "1";

                  const bgColors = [
                    "bg-blue-100 text-blue-700",
                    "bg-green-100 text-green-700",
                    "bg-yellow-100 text-yellow-700",
                    "bg-orange-100 text-orange-700",
                    "bg-red-100 text-red-700",
                    "bg-purple-100 text-purple-700",
                  ];

                  const borderColors = [
                    "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]",
                    "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.25)]",
                    "border-yellow-500 shadow-[0_0_0_3px_rgba(234,179,8,0.25)]",
                    "border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.25)]",
                    "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]",
                    "border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.25)]",
                  ];

                  const isSelected = selectedAttitudeLevel?.id === level.id;

                  return (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedAttitudeLevel(level);
                        setAttitudeLevelSelections(prev => ({
                          ...prev,
                          [selectedAttitude.id]: level,
                        }));
                      }}
                      className={`
                relative
                w-[64px] h-[38px]
                flex items-center justify-center
                text-sm font-semibold
                transition-all duration-200
                ${bgColors[index]}
                ${index === 0 ? "rounded-l-full" : ""}
                ${index === attitudeProficiencyLevels.length - 1 ? "rounded-r-full" : ""}
                ${isSelected ? `border-2 ${borderColors[index]} z-10` : "border border-transparent"}
              `}
                    >
                      {levelNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descriptor + Indicators */}
            {selectedAttitudeLevel && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 space-y-4">
                {selectedAttitudeLevel.descriptor && (
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Descriptor :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedAttitudeLevel.descriptor}
                    </span>
                  </div>
                )}

                {selectedAttitudeLevel.indicators && (
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Indicators :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedAttitudeLevel.indicators}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : selectedBehaviour ? (
          <>
            {/* Behaviour Proficiency Levels */}
            <div className="flex justify-center flex-wrap gap-0">
              <div className="flex p-1 rounded-full bg-white shadow-[0_0_0_1px_#c7d2fe,0_4px_12px_rgba(0,0,0,0.08)]">
                {behaviourProficiencyLevels.map((level, index) => {
                  const levelNumber = (level?.proficiency_level || level?.level || "").toString().match(/\d+/)?.[0] ?? "1";

                  const bgColors = [
                    "bg-blue-100 text-blue-700",
                    "bg-green-100 text-green-700",
                    "bg-yellow-100 text-yellow-700",
                    "bg-orange-100 text-orange-700",
                    "bg-red-100 text-red-700",
                    "bg-purple-100 text-purple-700",
                  ];

                  const borderColors = [
                    "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]",
                    "border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.25)]",
                    "border-yellow-500 shadow-[0_0_0_3px_rgba(234,179,8,0.25)]",
                    "border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.25)]",
                    "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]",
                    "border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.25)]",
                  ];

                  const isSelected = selectedBehaviourLevel?.id === level.id;

                  return (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedBehaviourLevel(level);
                        setBehaviourLevelSelections(prev => ({
                          ...prev,
                          [selectedBehaviour.id]: level,
                        }));
                      }}
                      className={`
                relative
                w-[64px] h-[38px]
                flex items-center justify-center
                text-sm font-semibold
                transition-all duration-200
                ${bgColors[index]}
                ${index === 0 ? "rounded-l-full" : ""}
                ${index === behaviourProficiencyLevels.length - 1 ? "rounded-r-full" : ""}
                ${isSelected ? `border-2 ${borderColors[index]} z-10` : "border border-transparent"}
              `}
                    >
                      {levelNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descriptor + Indicators */}
            {selectedBehaviourLevel && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 space-y-4">
                {selectedBehaviourLevel.descriptor && (
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Descriptor :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedBehaviourLevel.descriptor}
                    </span>
                  </div>
                )}

                {selectedBehaviourLevel.indicators && (
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      Indicators :
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedBehaviourLevel.indicators}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500">
            Please select a Skill or KAAB item from the left panel to view details.
          </div>
        )}

        {/* Navigation Buttons - Always Visible */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={moveToPrevious}
            disabled={!getCurrentCategory() || (getCurrentCategory() === 'skill' && currentSkillIndex === 0) || (getCurrentCategory() === 'knowledge' && currentKnowledgeIndex === 0) || (getCurrentCategory() === 'ability' && currentAbilityIndex === 0) || (getCurrentCategory() === 'attitude' && currentAttitudeIndex === 0) || (getCurrentCategory() === 'behaviour' && currentBehaviourIndex === 0)}
            className={`px-6 py-2 rounded-full font-medium shadow-md border transition-all ${!getCurrentCategory() || (getCurrentCategory() === 'skill' && currentSkillIndex === 0) || (getCurrentCategory() === 'knowledge' && currentKnowledgeIndex === 0) || (getCurrentCategory() === 'ability' && currentAbilityIndex === 0) || (getCurrentCategory() === 'attitude' && currentAttitudeIndex === 0) || (getCurrentCategory() === 'behaviour' && currentBehaviourIndex === 0)
                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300 hover:from-blue-500 hover:to-blue-600"
              }`}
          >
            ← Previous
          </button>
          <button
            onClick={moveToNext}
            disabled={!getCurrentCategory() || (getCurrentCategory() === 'skill' && currentSkillIndex === skills.length - 1) || (getCurrentCategory() === 'knowledge' && currentKnowledgeIndex === knowledge.length - 1) || (getCurrentCategory() === 'ability' && currentAbilityIndex === ability.length - 1) || (getCurrentCategory() === 'attitude' && currentAttitudeIndex === attitude.length - 1) || (getCurrentCategory() === 'behaviour' && currentBehaviourIndex === behaviour.length - 1)}
            className={`px-6 py-2 rounded-full font-medium shadow-md border transition-all ${!getCurrentCategory() || (getCurrentCategory() === 'skill' && currentSkillIndex === skills.length - 1) || (getCurrentCategory() === 'knowledge' && currentKnowledgeIndex === knowledge.length - 1) || (getCurrentCategory() === 'ability' && currentAbilityIndex === ability.length - 1) || (getCurrentCategory() === 'attitude' && currentAttitudeIndex === attitude.length - 1) || (getCurrentCategory() === 'behaviour' && currentBehaviourIndex === behaviour.length - 1)
                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 hover:from-blue-600 hover:to-blue-700"
              }`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Bottom-right fixed actions: Validate & Save All */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-50">
        <button
          onClick={validateAndSaveAllSkills}
          className="px-4 py-2 rounded-full bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Validate & Save All KAAB Ratings"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Validate & Save All"}
        </button>
      </div>

      {/* Validation Dialog */}
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
                  if (pendingBulkData) performBulkSave(pendingBulkData.ratedSkills, pendingBulkData.ratedKAAB);
                }}
              >
                Proceed Anyway
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
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
    </div>
  );
}
