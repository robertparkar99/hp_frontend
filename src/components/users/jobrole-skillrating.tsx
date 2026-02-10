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
import { validateSkillProficiencies, getValidationMessages } from "@/lib/utils";

interface JobroleSkillRatingDesignProps {
  subInstituteId: number;
  jobroleId: number;
  jobroleTitle: string;
}

type CategoryType = 'skill' | 'knowledge' | 'ability' | 'attitude' | 'behaviour';

interface SkillItem {
  id: string;
  title: string;
  description: string;
  proficiency_level: number;
}

interface ProficiencyLevel {
  id: string;
  proficiency_level: string;
  description: string;
  type_description?: string;
  descriptor?: string;
  indicators?: string;
}

interface SavedRatings {
  skill_ids: Record<string, string> | null;
  knowledge_ids: Record<string, string> | null;
  ability_ids: Record<string, string> | null;
  attitude_ids: Record<string, string> | null;
  behaviour_ids: Record<string, string> | null;
}

interface RatingRecord {
  id: number;
  user_id: number;
  jobrole_id: number;
  skill_ids: string | null;
  knowledge_ids: string | null;
  ability_ids: string | null;
  attitude_ids: string | null;
  behavior_ids: string | null;
  sub_institute_id: number;
}

export default function JobroleSkillRatingDesign({
  subInstituteId,
  jobroleId,
  jobroleTitle,
}: JobroleSkillRatingDesignProps) {
  // State for all categories
  const [categories, setCategories] = useState<Record<CategoryType, SkillItem[]>>({
    skill: [],
    knowledge: [],
    ability: [],
    attitude: [],
    behaviour: []
  });

  const [expandedTab, setExpandedTab] = useState<CategoryType | null>('skill');
  const [selectedItems, setSelectedItems] = useState<Record<CategoryType, SkillItem | null>>({
    skill: null,
    knowledge: null,
    ability: null,
    attitude: null,
    behaviour: null
  });

  const [currentIndexes, setCurrentIndexes] = useState<Record<CategoryType, number>>({
    skill: 0,
    knowledge: 0,
    ability: 0,
    attitude: 0,
    behaviour: 0
  });

  const [proficiencyLevels, setProficiencyLevels] = useState<Record<CategoryType, ProficiencyLevel[]>>({
    skill: [],
    knowledge: [],
    ability: [],
    attitude: [],
    behaviour: []
  });

  const [selectedLevels, setSelectedLevels] = useState<Record<CategoryType, ProficiencyLevel | null>>({
    skill: null,
    knowledge: null,
    ability: null,
    attitude: null,
    behaviour: null
  });

  const [levelSelections, setLevelSelections] = useState<Record<CategoryType, Record<string, ProficiencyLevel>>>({
    skill: {},
    knowledge: {},
    ability: {},
    attitude: {},
    behaviour: {}
  });

  const [savedRatings, setSavedRatings] = useState<SavedRatings>({
    skill_ids: null,
    knowledge_ids: null,
    ability_ids: null,
    attitude_ids: null,
    behaviour_ids: null
  });

  const [initialLevelSelections, setInitialLevelSelections] = useState<Record<CategoryType, Record<string, ProficiencyLevel>>>({
    skill: {},
    knowledge: {},
    ability: {},
    attitude: {},
    behaviour: {}
  });

  const [hasChanges, setHasChanges] = useState(false);

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });

  // Dialog states
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [validationType, setValidationType] = useState<"error" | "warning">("warning");
  const [pendingBulkData, setPendingBulkData] = useState<any>(null);

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = useState("Information");
  const [infoDialogMessages, setInfoDialogMessages] = useState<string[]>([]);
  const [infoDialogVariant, setInfoDialogVariant] = useState<"info" | "success" | "error">("info");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = sessionData.userId && jobroleId ? `jobrole_skill_ratings_${sessionData.userId}_${jobroleId}` : null;

  // Helper functions
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

  const normalizeItem = (item: any, index: number, type: string): SkillItem => {
    if (typeof item === 'string') {
      return { id: `${type}_${index}`, title: item, description: '', proficiency_level: 5 };
    } else {
      let resolvedId: string | number | undefined = item.id;
      if (type === 'skill') resolvedId = item.skill_id ?? item.id;
      else if (type === 'knowledge') resolvedId = item.knowledge_id ?? item.id;
      else if (type === 'ability') resolvedId = item.ability_id ?? item.id;
      else if (type === 'attitude') resolvedId = item.attitude_id ?? item.id;
      else if (type === 'behaviour') resolvedId = item.behaviour_id ?? item.id;

      return {
        id: (resolvedId !== undefined && resolvedId !== null) ? String(resolvedId) : `${type}_${index}`,
        title: item.title || item.skill || item.knowledge || item.ability || item.attitude || item.behaviour || item,
        description: item.description || '',
        proficiency_level: item.proficiency_level || 5
      };
    }
  };

  // Extract numeric ID from item ID
  const extractNumericId = (id: string): number | null => {
    if (/^\d+$/.test(id.toString())) {
      return parseInt(id.toString(), 10);
    }
    const match = id.toString().match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Initialize session data
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

  // Load saved ratings from API
  const loadSavedRatings = async (): Promise<SavedRatings | null> => {
    if (!sessionData.url || !sessionData.userId) return null;

    try {
      const response = await fetch(
        `${sessionData.url}/table_data/?table=user_rating_details&filters[sub_institute_id]=${subInstituteId}&filters[user_id]=${sessionData.userId}&filters[jobrole_id]=${jobroleId}`
      );
      
      if (response.ok) {
        const data: RatingRecord[] = await response.json();
        
        if (data.length > 0) {
          const ratingData = data[0];
          const newSavedRatings: SavedRatings = {
            skill_ids: ratingData.skill_ids ? JSON.parse(ratingData.skill_ids) : null,
            knowledge_ids: ratingData.knowledge_ids ? JSON.parse(ratingData.knowledge_ids) : null,
            ability_ids: ratingData.ability_ids ? JSON.parse(ratingData.ability_ids) : null,
            attitude_ids: ratingData.attitude_ids ? JSON.parse(ratingData.attitude_ids) : null,
            behaviour_ids: ratingData.behavior_ids ? JSON.parse(ratingData.behavior_ids) : null,
          };
          
          setSavedRatings(newSavedRatings);
          return newSavedRatings;
        }
      } else {
        console.error("Failed to load saved ratings:", response.status);
      }
    } catch (err) {
      console.error("Error loading saved ratings:", err);
    }
    return null;
  };

  // Apply saved ratings to level selections
  const applySavedRatings = (ratings: SavedRatings) => {
    const newLevelSelections: Record<CategoryType, Record<string, ProficiencyLevel>> = {
      skill: {},
      knowledge: {},
      ability: {},
      attitude: {},
      behaviour: {}
    };

    // Process each category
    const categoryMapping: Record<CategoryType, keyof SavedRatings> = {
      skill: 'skill_ids',
      knowledge: 'knowledge_ids',
      ability: 'ability_ids',
      attitude: 'attitude_ids',
      behaviour: 'behaviour_ids'
    };

    Object.entries(categoryMapping).forEach(([category, ratingKey]) => {
      const cat = category as CategoryType;
      const ratingData = ratings[ratingKey];
      
      if (ratingData) {
        Object.entries(ratingData).forEach(([itemId, levelValue]) => {
          // Find item in categories
          const item = categories[cat].find(item => {
            const numericId = extractNumericId(item.id);
            return numericId && numericId.toString() === itemId;
          });
          
          if (item) {
            // Find matching proficiency level
            const levels = proficiencyLevels[cat];
            if (levels.length > 0) {
              const level = levels.find(l => {
                const levelNum = l.proficiency_level?.match(/\d+/)?.[0];
                return levelNum === levelValue;
              });
              
              if (level) {
                newLevelSelections[cat][item.id] = level;
              }
            }
          }
        });
      }
    });

    setLevelSelections(newLevelSelections);
    setInitialLevelSelections(newLevelSelections);
    return newLevelSelections;
  };

  // Fetch KAAB data and load saved ratings
  useEffect(() => {
    if (!sessionData.url || !subInstituteId || !jobroleId || !jobroleTitle) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch KAAB data
        const response = await fetch(
          `${sessionData.url}/get-kaba?sub_institute_id=${subInstituteId}&type=jobrole&type_id=${jobroleId}&title=${encodeURIComponent(jobroleTitle)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          const newCategories = {
            skill: data.skill?.map((item: any, index: number) => normalizeItem(item, index, 'skill')) || [],
            knowledge: data.knowledge?.map((item: any, index: number) => normalizeItem(item, index, 'knowledge')) || [],
            ability: data.ability?.map((item: any, index: number) => normalizeItem(item, index, 'ability')) || [],
            attitude: data.attitude?.map((item: any, index: number) => normalizeItem(item, index, 'attitude')) || [],
            behaviour: data.behaviour?.map((item: any, index: number) => normalizeItem(item, index, 'behaviour')) || []
          };

          setCategories(newCategories);
          
          if (newCategories.skill.length) {
            setSelectedItems(prev => ({ ...prev, skill: newCategories.skill[0] }));
            setExpandedTab('skill');
          }

          // Load saved ratings after fetching KAAB data
          const ratings = await loadSavedRatings();
          if (ratings) {
            // We need proficiency levels first to apply ratings properly
            // This will be handled in the proficiency levels useEffect
          }
        } else {
          console.error("KAAB API failed:", response.status);
        }
      } catch (err) {
        console.error("Error fetching KAAB data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionData.url, subInstituteId, jobroleId, jobroleTitle]);

  // Fetch proficiency levels and apply saved ratings
  useEffect(() => {
    if (!sessionData.url || !expandedTab || !selectedItems[expandedTab]) return;

    const fetchProficiencyLevels = async (category: CategoryType) => {
      try {
        let endpoint = '';
        switch(category) {
          case 'skill': endpoint = 's_proficiency_levels'; break;
          case 'knowledge': endpoint = 's_proficiency_knowledge'; break;
          case 'ability': endpoint = 's_proficiency_ability'; break;
          case 'attitude': endpoint = 's_proficiency_attitude'; break;
          case 'behaviour': endpoint = 's_proficiency_behaviour'; break;
        }

        const response = await fetch(
          `${sessionData.url}/table_data?filters[sub_institute_id]=${subInstituteId}&table=${endpoint}`
        );

        if (response.ok) {
          const data = await response.json();
          processProficiencyLevels(category, data);
        } else {
          console.error(`${category} Proficiency API failed:`, response.status);
        }
      } catch (err) {
        console.error(`Error fetching ${category} proficiency levels:`, err);
      }
    };

    const processProficiencyLevels = (category: CategoryType, apiData: any[]) => {
      const currentItem = selectedItems[category];
      if (!currentItem) return;

      // Extract max proficiency level from item
      let maxLevel = 5;
      if (currentItem.proficiency_level) {
        const match = currentItem.proficiency_level.toString().match(/\d+/);
        if (match) {
          maxLevel = Math.min(parseInt(match[0], 10), 5);
        }
      }

      // Generate levels array
      const generatedLevels: ProficiencyLevel[] = [];
      for (let i = 1; i <= maxLevel; i++) {
        const apiLevel = apiData.find(level => {
          const levelNumber = level?.proficiency_level?.match(/\d+/)?.[0];
          return levelNumber && parseInt(levelNumber, 10) === i;
        });

        generatedLevels.push(
          apiLevel ? {
            id: apiLevel.id || `level_${i}`,
            proficiency_level: apiLevel.proficiency_level || `Level ${i}`,
            description: apiLevel.description || `Proficiency Level ${i}`,
            type_description: apiLevel.type_description,
            descriptor: apiLevel.descriptor,
            indicators: apiLevel.indicators
          } : {
            id: `level_${i}`,
            proficiency_level: `Level ${i}`,
            description: `Proficiency Level ${i}`,
            type_description: `Type description for Level ${i}`
          }
        );
      }

      setProficiencyLevels(prev => ({ ...prev, [category]: generatedLevels }));

      // Set selected level - check saved ratings first
      const itemId = currentItem.id;
      const numericId = extractNumericId(itemId);
      
      let savedLevel: ProficiencyLevel | null = null;
      
      // Check API saved ratings
      if (numericId && savedRatings[`${category}_ids` as keyof SavedRatings]) {
        const savedRatingData = savedRatings[`${category}_ids` as keyof SavedRatings] as Record<string, string> | null;
        if (savedRatingData && savedRatingData[numericId.toString()]) {
          const levelValue = savedRatingData[numericId.toString()];
          savedLevel = generatedLevels.find(l => {
            const levelNum = l.proficiency_level?.match(/\d+/)?.[0];
            return levelNum === levelValue;
          }) || null;
        }
      }
      
      // Check current selections as fallback
      if (!savedLevel) {
        savedLevel = levelSelections[category][itemId] || null;
      }
      
      setSelectedLevels(prev => ({ 
        ...prev, 
        [category]: savedLevel || generatedLevels[0] || null 
      }));
    };

    fetchProficiencyLevels(expandedTab);
  }, [sessionData.url, expandedTab, selectedItems, subInstituteId, savedRatings]);

  // Apply saved ratings when proficiency levels are available
  useEffect(() => {
    const applySavedRatingsIfPossible = () => {
      // Check if we have all proficiency levels loaded
      const hasAllLevels = Object.values(proficiencyLevels).every(levels => levels.length > 0);
      
      if (hasAllLevels && Object.keys(savedRatings.skill_ids || {}).length > 0) {
        const newSelections = applySavedRatings(savedRatings);
        
        // Update selected level for current item if applicable
        if (expandedTab && selectedItems[expandedTab]) {
          const currentItem = selectedItems[expandedTab];
          const savedLevel = newSelections[expandedTab][currentItem.id];
          if (savedLevel) {
            setSelectedLevels(prev => ({ ...prev, [expandedTab]: savedLevel }));
          }
        }
      }
    };

    applySavedRatingsIfPossible();
  }, [proficiencyLevels, savedRatings, expandedTab, selectedItems]);

  // Update hasChanges when levelSelections change
  useEffect(() => {
    const checkForChanges = () => {
      let changed = false;
      
      // Compare current selections with initial selections (which reflect saved ratings)
      Object.keys(levelSelections).forEach(categoryKey => {
        const category = categoryKey as CategoryType;
        const currentSelections = levelSelections[category];
        const initialSelections = initialLevelSelections[category];
        
        // Check if any item has different level or is newly added
        Object.keys(currentSelections).forEach(itemId => {
          const currentLevel = currentSelections[itemId];
          const initialLevel = initialSelections[itemId];
          
          if (!initialLevel || currentLevel.id !== initialLevel.id) {
            changed = true;
          }
        });
        
        // Check if any saved rating was removed
        Object.keys(initialSelections).forEach(itemId => {
          if (!currentSelections[itemId]) {
            changed = true;
          }
        });
      });
      
      setHasChanges(changed);
    };

    checkForChanges();
  }, [levelSelections, initialLevelSelections]);

  // Navigation helpers
  const navigateItem = (direction: 'next' | 'prev') => {
    if (!expandedTab) return;

    const currentItems = categories[expandedTab];
    const currentIndex = currentIndexes[expandedTab];
    
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Boundary checks
    if (newIndex < 0 || newIndex >= currentItems.length) return;

    setCurrentIndexes(prev => ({ ...prev, [expandedTab]: newIndex }));
    
    const newItem = currentItems[newIndex];
    setSelectedItems(prev => ({ ...prev, [expandedTab]: newItem }));

    // Clear other selections
    const otherCategories: CategoryType[] = ['skill', 'knowledge', 'ability', 'attitude', 'behaviour']
      .filter(cat => cat !== expandedTab) as CategoryType[];
    
    otherCategories.forEach(cat => {
      setSelectedItems(prev => ({ ...prev, [cat]: null }));
    });

    // Load level for this item
    const savedLevel = levelSelections[expandedTab][newItem.id];
    setSelectedLevels(prev => ({ ...prev, [expandedTab]: savedLevel || null }));
  };

  // Level selection handler
  const handleLevelSelect = (level: ProficiencyLevel) => {
    if (!expandedTab || !selectedItems[expandedTab]) return;

    setSelectedLevels(prev => ({ ...prev, [expandedTab]: level }));
    setLevelSelections(prev => ({
      ...prev,
      [expandedTab]: {
        ...prev[expandedTab],
        [selectedItems[expandedTab]!.id]: level
      }
    }));
  };

  // Check if item has saved rating
  const getItemSavedRating = (category: CategoryType, itemId: string): string | null => {
    const numericId = extractNumericId(itemId);
    if (!numericId) return null;
    
    const savedCategoryRatings = savedRatings[`${category}_ids` as keyof SavedRatings] as Record<string, string> | null;
    return savedCategoryRatings ? savedCategoryRatings[numericId.toString()] || null : null;
  };

  // Get current item's saved rating level
  const getCurrentItemSavedLevel = (): ProficiencyLevel | null => {
    if (!expandedTab || !selectedItems[expandedTab]) return null;
    
    const savedRatingValue = getItemSavedRating(expandedTab, selectedItems[expandedTab]!.id);
    if (!savedRatingValue) return null;
    
    const levels = proficiencyLevels[expandedTab];
    return levels.find(l => {
      const levelNum = l.proficiency_level?.match(/\d+/)?.[0];
      return levelNum === savedRatingValue;
    }) || null;
  };

  // Bulk validation and save
  const validateAndSaveAllSkills = async () => {
    const ratedItems: any[] = [];
    const changedItems: any[] = [];

    Object.entries(categories).forEach(([category, items]) => {
      const cat = category as CategoryType;
      const currentSelections = levelSelections[cat];
      const initialSelections = initialLevelSelections[cat];

      items.forEach((item: SkillItem) => {
        const current = currentSelections[item.id];
        const initial = initialSelections[item.id];
        
        // Check if rating exists or changed
        if (current) {
          const levelValue = current?.proficiency_level?.match(/\d+/)?.[0] || '1';
          ratedItems.push({
            id: item.id,
            title: item.title,
            level: levelValue,
            type: cat,
            category: cat
          });
          
          // Check if changed from initial
          if (!initial || current.id !== initial.id) {
            changedItems.push({
              id: item.id,
              title: item.title,
              level: levelValue,
              type: cat,
              category: cat
            });
          }
        }
      });
    });

    if (ratedItems.length === 0) {
      showInfo("No ratings", "No items have been rated yet!", "info");
      return;
    }

    if (changedItems.length === 0) {
      showInfo("No changes", "No changes detected to save!", "info");
      return;
    }

    // Run validation
    const validation = validateSkillProficiencies(
      ratedItems.map((item) => ({
        skill_id: item.id,
        skill_name: item.title,
        proficiency_level: Number(item.level?.match(/\d+/)?.[0] || 0),
        category: item.category,
      }))
    );

    const messages = getValidationMessages(validation);

    if (!validation.isValid) {
      setValidationMessages(messages);
      setValidationType("error");
      setValidationDialogOpen(true);
      return;
    } else if (validation.warnings.length > 0) {
      setValidationMessages(messages);
      setValidationType("warning");
      setPendingBulkData({ ratedItems, changedItems });
      setValidationDialogOpen(true);
      return;
    }

    await performBulkSave(ratedItems);
  };

  const performBulkSave = async (ratedItems: any[]) => {
    setIsProcessing(true);
    try {
      const jsonData: Record<CategoryType, Record<string, string>> = {
        skill: {},
        knowledge: {},
        ability: {},
        attitude: {},
        behaviour: {}
      };

      // Start with existing saved ratings to preserve them
      const categoryMapping: Record<CategoryType, keyof SavedRatings> = {
        skill: 'skill_ids',
        knowledge: 'knowledge_ids',
        ability: 'ability_ids',
        attitude: 'attitude_ids',
        behaviour: 'behaviour_ids'
      };

      Object.entries(categoryMapping).forEach(([category, ratingKey]) => {
        const cat = category as CategoryType;
        const existingRatings = savedRatings[ratingKey];
        if (existingRatings) {
          jsonData[cat] = { ...existingRatings };
        }
      });

      // Update with current/new ratings
      ratedItems.forEach((item) => {
        const numericId = extractNumericId(item.id);
        if (numericId) {
          let levelValue = 1;
          if (item.level) {
            const levelMatch = item.level.toString().match(/\d+/);
            if (levelMatch) {
              levelValue = parseInt(levelMatch[0], 10);
            }
          }
          const validatedLevel = Math.max(1, Math.min(5, levelValue)).toString();
          jsonData[item.type as CategoryType][numericId.toString()] = validatedLevel;
        }
      });

      const bulkData = {
        skill_ids: Object.keys(jsonData.skill).length > 0 ? JSON.stringify(jsonData.skill) : null,
        knowledge_ids: Object.keys(jsonData.knowledge).length > 0 ? JSON.stringify(jsonData.knowledge) : null,
        ability_ids: Object.keys(jsonData.ability).length > 0 ? JSON.stringify(jsonData.ability) : null,
        attitude_ids: Object.keys(jsonData.attitude).length > 0 ? JSON.stringify(jsonData.attitude) : null,
        behaviour_ids: Object.keys(jsonData.behaviour).length > 0 ? JSON.stringify(jsonData.behaviour) : null,
        user_id: sessionData.userId,
        jobrole_id: jobroleId,
        sub_institute_id: sessionData.subInstituteId,
        token: sessionData.token
      };

      console.log("Saving data:", bulkData);

      const response = await fetch(`${sessionData.url}/user/user_rating_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify(bulkData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Save successful:", result);
        
        // Update initial selections to current selections
        setInitialLevelSelections(levelSelections);
        
        // Reload saved ratings from API
        const updatedRatings = await loadSavedRatings();
        if (updatedRatings) {
          // Re-apply ratings to ensure sync
          applySavedRatings(updatedRatings);
        }
        
        setHasChanges(false);
        
        showInfo(
          "Success ✅",
          `All ${ratedItems.length} items have been successfully saved!`,
          "success"
        );
      } else if (response.status === 422) {
        const errorData = await response.json();
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
        showInfo(
          "Failed",
          `Server error (${response.status}): ${response.statusText}`,
          "error"
        );
      }
    } catch (error) {
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

  // Reset to saved ratings
  const resetToSaved = async () => {
    if (hasChanges) {
      // Reload saved ratings from API
      const updatedRatings = await loadSavedRatings();
      if (updatedRatings) {
        // Re-apply saved ratings
        applySavedRatings(updatedRatings);
        
        // Update selected level for current item
        if (expandedTab && selectedItems[expandedTab]) {
          const savedLevelValue = getItemSavedRating(expandedTab, selectedItems[expandedTab]!.id);
          if (savedLevelValue) {
            const levels = proficiencyLevels[expandedTab];
            const savedLevel = levels.find(l => {
              const levelNum = l.proficiency_level?.match(/\d+/)?.[0];
              return levelNum === savedLevelValue;
            });
            if (savedLevel) {
              setSelectedLevels(prev => ({ ...prev, [expandedTab]: savedLevel }));
            }
          }
        }
      }
      
      setHasChanges(false);
      showInfo("Reset", "All changes have been reset to saved values.", "info");
    }
  };

  // UI helpers
  const tabConfig = [
    { key: 'skill' as CategoryType, icon: 'mdi-brain', label: 'Skills' },
    { key: 'knowledge' as CategoryType, icon: 'mdi-library', label: 'Knowledge' },
    { key: 'ability' as CategoryType, icon: 'mdi-hand-okay', label: 'Ability' },
    { key: 'attitude' as CategoryType, icon: 'mdi-emoticon', label: 'Attitude' },
    { key: 'behaviour' as CategoryType, icon: 'mdi-account-child', label: 'Behaviour' },
  ];

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

  const currentCategory = expandedTab;
  const currentItem = expandedTab ? selectedItems[expandedTab] : null;
  const currentLevels = expandedTab ? proficiencyLevels[expandedTab] : [];
  const currentSelectedLevel = expandedTab ? selectedLevels[expandedTab] : null;
  const currentIndex = expandedTab ? currentIndexes[expandedTab] : 0;
  const currentItems = expandedTab ? categories[expandedTab] : [];
  const canGoPrev = expandedTab && currentIndex > 0;
  const canGoNext = expandedTab && currentIndex < currentItems.length - 1;

  // Check if current item has saved rating
  const hasSavedRating = currentCategory && currentItem ? 
    getItemSavedRating(currentCategory, currentItem.id) !== null : false;

  // Check if current item's level has changed
  const hasLevelChanged = currentCategory && currentItem && currentSelectedLevel ? (() => {
    const savedLevelValue = getItemSavedRating(currentCategory, currentItem.id);
    if (!savedLevelValue) return true; // New rating
    
    const currentLevelValue = currentSelectedLevel.proficiency_level?.match(/\d+/)?.[0];
    return savedLevelValue !== currentLevelValue;
  })() : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left Panel */}
      <div className="w-[280px] bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-3">
        <h2 className="text-[#23395B] font-semibold text-sm mb-2 flex items-center gap-2">
          📊 Competency Overview
        </h2>
        <div className="h-[2px] bg-gray-400 mb-3" />

        <div className="space-y-2">
          {tabConfig.map((tab) => (
            <div key={tab.key} className="border border-gray-200 rounded-lg">
              <div
                onClick={() => setExpandedTab(expandedTab === tab.key ? null : tab.key)}
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-t-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`mdi ${tab.icon} text-sm`}></span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
                <span className={`text-sm transition-transform ${expandedTab === tab.key ? 'rotate-90' : ''}`}>
                  ›
                </span>
              </div>

              {expandedTab === tab.key && (
                <div className="px-3 pb-3 bg-gray-50 rounded-b-lg">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {categories[tab.key].map((item, index) => {
                      const hasSaved = getItemSavedRating(tab.key, item.id) !== null;
                      const hasCurrentSelection = levelSelections[tab.key][item.id] !== undefined;
                      const isSelected = selectedItems[tab.key]?.id === item.id;
                      
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setCurrentIndexes(prev => ({ ...prev, [tab.key]: index }));
                            setSelectedItems(prev => ({ ...prev, [tab.key]: item }));
                            setExpandedTab(tab.key);
                            
                            // Clear other selections
                            tabConfig.filter(t => t.key !== tab.key).forEach(({ key }) => {
                              setSelectedItems(prev => ({ ...prev, [key]: null }));
                            });
                          }}
                          className={`w-full border p-2 rounded-lg cursor-pointer transition relative
                            ${isSelected ? "border-blue-500 bg-blue-50" : "border-blue-100 bg-white"}
                            hover:bg-gray-50
                          `}
                        >
                          <p className="text-xs font-medium">{item.title}</p>
                          
                          {/* Status indicators */}
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                            {hasSaved && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" title="Saved rating"></div>
                            )}
                            {hasCurrentSelection && !hasSaved && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" title="New rating"></div>
                            )}
                            {hasCurrentSelection && hasSaved && 
                              levelSelections[tab.key][item.id]?.proficiency_level?.match(/\d+/)?.[0] !== 
                              getItemSavedRating(tab.key, item.id) && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full" title="Rating changed"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-800">
              {currentItem?.title || "Select an item"}
            </h1>
            <div className="flex gap-2">
              {hasSavedRating && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  hasLevelChanged ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {hasLevelChanged ? '✎ Changed' : '✓ Rated'}
                </span>
              )}
              {!hasSavedRating && currentSelectedLevel && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  New Rating
                </span>
              )}
            </div>
          </div>
          <span className="text-blue-600 text-xl cursor-pointer">ℹ️</span>
        </div>

        {currentItem && (
          <p className="text-sm text-gray-600 mb-4">
            {currentItem.description || ""}
          </p>
        )}

        <hr className="mb-6" />

        {currentCategory && currentItem ? (
          <>
            {/* Saved Rating Indicator */}
            {/* {hasSavedRating && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600">📊</span>
                  <span className="font-medium text-blue-800">Saved Rating:</span>
                  <span className="text-blue-600">
                    Level {getItemSavedRating(currentCategory, currentItem.id)}
                  </span>
                  {hasLevelChanged && (
                    <span className="ml-2 text-orange-600">
                      → Changing to: Level {currentSelectedLevel?.proficiency_level?.match(/\d+/)?.[0]}
                    </span>
                  )}
                </div>
              </div>
            )} */}

            {/* Proficiency Levels */}
            <div className="flex justify-center flex-wrap gap-0">
              <div className="flex p-1 rounded-full bg-white shadow-[0_0_0_1px_#c7d2fe,0_4px_12px_rgba(0,0,0,0.08)]">
                {currentLevels.map((level, index) => {
                  const levelNumber = level?.proficiency_level?.match(/\d+/)?.[0] ?? "1";
                  const isSelected = currentSelectedLevel?.id === level.id;
                  const isSavedLevel = hasSavedRating && 
                    levelNumber === getItemSavedRating(currentCategory, currentItem.id);

                  return (
                    <button
                      key={level.id}
                      onClick={() => handleLevelSelect(level)}
                      className={`
                        relative w-[64px] h-[38px] flex items-center justify-center text-sm font-semibold
                        transition-all duration-200 ${bgColors[index]}
                        ${index === 0 ? "rounded-l-full" : ""}
                        ${index === currentLevels.length - 1 ? "rounded-r-full" : ""}
                        ${isSelected ? `border-2 ${borderColors[index]} z-10` : "border border-transparent"}
                        ${isSavedLevel ? 'ring-2 ring-blue-300' : ''}
                      `}
                    >
                      {levelNumber}
                      {isSavedLevel && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Level Description */}
            {currentSelectedLevel && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 space-y-4">
                {currentSelectedLevel.type_description && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      Type Description :
                    </span>
                    <span className="text-sm text-gray-600">
                      {currentSelectedLevel.type_description}
                    </span>
                  </div>
                )}

                {currentSelectedLevel.descriptor && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      Descriptor :
                    </span>
                    <span className="text-sm text-gray-600">
                      {currentSelectedLevel.descriptor}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {currentCategory === 'skill' ? 'Level Description' : 'Indicators'} :
                  </span>
                  <span className="text-sm text-gray-600">
                    {currentSelectedLevel.indicators || currentSelectedLevel.description}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500">
            Please select a Skill or KAAB item from the left panel to view details.
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => navigateItem('prev')}
            disabled={!canGoPrev}
            className={`px-6 py-2 rounded-full font-medium shadow-md border transition-all
              ${canGoPrev 
                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300 hover:from-blue-500 hover:to-blue-600"
                : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
              }`}
          >
            ← Previous
          </button>
          <button
            onClick={() => navigateItem('next')}
            disabled={!canGoNext}
            className={`px-6 py-2 rounded-full font-medium shadow-md border transition-all
              ${canGoNext
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 hover:from-blue-600 hover:to-blue-700"
                : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
              }`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-50">
        {hasChanges && (
          <button
            onClick={resetToSaved}
            className="px-4 py-2 rounded-full bg-gray-600 text-white shadow hover:bg-gray-700 transition-colors"
            title="Reset to Saved Ratings"
          >
            Reset Changes
          </button>
        )}
        <button
          onClick={validateAndSaveAllSkills}
          className="px-4 py-2 rounded-full bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Validate & Save All KAAB Ratings"
          disabled={isProcessing || !hasChanges}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </span>
          ) : (
            `Save All Changes (${hasChanges ? '1+' : '0'})`
          )}
        </button>
      </div>

      {/* Dialogs */}
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
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
              onClick={() => {
                setValidationDialogOpen(false);
                setPendingBulkData(null);
              }}
            >
              Close
            </button>

            {validationType === "warning" && (
              <button
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                onClick={() => {
                  setValidationDialogOpen(false);
                  if (pendingBulkData) performBulkSave(pendingBulkData.ratedItems);
                }}
              >
                Proceed Anyway
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`text-lg font-semibold ${
              infoDialogVariant === "success" ? "text-green-600" :
              infoDialogVariant === "error" ? "text-red-600" : "text-slate-800"
            }`}>
              {infoDialogTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 space-y-2">
            {infoDialogMessages.map((msg, idx) => (
              <div key={idx} className={`text-sm ${
                infoDialogVariant === "error" ? "text-red-500" : 
                infoDialogVariant === "success" ? "text-green-600" : "text-slate-700"
              }`}>
                {msg}
              </div>
            ))}
          </div>

          <DialogFooter className="flex justify-end">
            <button
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
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
