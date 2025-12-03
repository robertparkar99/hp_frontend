import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Skill rating validation utilities
export interface SkillRatingValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface SkillProficiency {
  skill_id: number;
  skill_name: string;
  proficiency_level: number;
  category?: string;
}

/**
 * Validates skill proficiency selections for genuineness
 * Prevents patterns, same proficiency for all skills, and random selections
 */
export function validateSkillProficiencies(proficiencies: SkillProficiency[]): SkillRatingValidation {
  const result: SkillRatingValidation = {
    isValid: true,
    warnings: [],
    errors: []
  };

  if (proficiencies.length === 0) {
    result.errors.push("No skills to validate");
    result.isValid = false;
    return result;
  }

  // Check 1: All skills have same proficiency level
  const uniqueLevels = new Set(proficiencies.map(p => p.proficiency_level));
  if (uniqueLevels.size === 1) {
    result.warnings.push("All skills have the same proficiency level. This may indicate non-genuine self-assessment.");
    result.isValid = false;
  }

  // Check 2: Sequential pattern detection (1,2,3,4,5 or 5,4,3,2,1)
  const levels = proficiencies.map(p => p.proficiency_level);
  if (isSequentialPattern(levels)) {
    result.warnings.push("Sequential proficiency pattern detected. This appears to follow a pattern rather than genuine assessment.");
    result.isValid = false;
  }

  // Check 3: Alternating pattern detection
  if (isAlternatingPattern(levels)) {
    result.warnings.push("Alternating proficiency pattern detected. This appears to follow a pattern rather than genuine assessment.");
    result.isValid = false;
  }

  // Check 4: Too many extreme values (all 1s or all 5s)
  const extremeCount = proficiencies.filter(p => p.proficiency_level === 1 || p.proficiency_level === 5).length;
  const extremePercentage = (extremeCount / proficiencies.length) * 100;
  if (extremePercentage > 80) {
    result.warnings.push(`High percentage (${Math.round(extremePercentage)}%) of extreme proficiency values. Please ensure accurate self-assessment.`);
  }

  // Check 5: Category-based consistency (skills in same category should have similar levels)
  const categoryAnalysis = analyzeCategoryConsistency(proficiencies);
  if (categoryAnalysis.inconsistentCategories.length > 0) {
    result.warnings.push(`Inconsistent proficiency levels detected in ${categoryAnalysis.inconsistentCategories.length} skill categories.`);
  }

  // Check 6: Time-based validation (if available)
  const completionTime = estimateCompletionTime(proficiencies);
  if (completionTime < 2) { // Less than 2 seconds per skill on average
    result.warnings.push("Assessment completed very quickly. Please take adequate time to reflect on each skill.");
  }

  return result;
}

/**
 * Detects sequential patterns like 1,2,3,4,5 or 5,4,3,2,1
 */
function isSequentialPattern(levels: number[]): boolean {
  if (levels.length < 3) return false;
  
  // Check ascending pattern
  let isAscending = true;
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] !== levels[i-1] + 1) {
      isAscending = false;
      break;
    }
  }
  
  // Check descending pattern
  let isDescending = true;
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] !== levels[i-1] - 1) {
      isDescending = false;
      break;
    }
  }
  
  return isAscending || isDescending;
}

/**
 * Detects alternating patterns like 1,3,1,3,1 or 2,4,2,4,2
 */
function isAlternatingPattern(levels: number[]): boolean {
  if (levels.length < 4) return false;
  
  // Check for simple alternation
  const pattern1 = [levels[0], levels[1]];
  let matchesPattern = true;
  
  for (let i = 2; i < levels.length; i++) {
    const expected = pattern1[i % 2];
    if (levels[i] !== expected) {
      matchesPattern = false;
      break;
    }
  }
  
  return matchesPattern;
}

/**
 * Analyzes consistency within skill categories
 */
function analyzeCategoryConsistency(proficiencies: SkillProficiency[]): {
  inconsistentCategories: string[];
  categoryStats: Record<string, { min: number; max: number; avg: number; count: number }>;
} {
  const categoryStats: Record<string, number[]> = {};
  const inconsistentCategories: string[] = [];

  // Group by category
  proficiencies.forEach(prof => {
    if (prof.category) {
      if (!categoryStats[prof.category]) {
        categoryStats[prof.category] = [];
      }
      categoryStats[prof.category].push(prof.proficiency_level);
    }
  });

  // Calculate statistics
  const stats: Record<string, { min: number; max: number; avg: number; count: number }> = {};
  
  for (const [category, levels] of Object.entries(categoryStats)) {
    if (levels.length >= 3) { // Only check categories with enough skills
      const min = Math.min(...levels);
      const max = Math.max(...levels);
      const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      const range = max - min;
      
      stats[category] = { min, max, avg, count: levels.length };
      
      // If range is too large within same category, it might be inconsistent
      if (range > 3) { // More than 3 levels difference within same category
        inconsistentCategories.push(category);
      }
    }
  }

  return { inconsistentCategories, categoryStats: stats };
}

/**
 * Estimates completion time based on number of skills
 * (Placeholder - would need actual timing data)
 */
function estimateCompletionTime(proficiencies: SkillProficiency[]): number {
  // Assuming 5 seconds per skill as reasonable minimum
  return proficiencies.length * 5;
}

/**
 * Generates user-friendly validation messages
 */
export function getValidationMessages(validation: SkillRatingValidation): string[] {
  const messages: string[] = [];
  
  if (validation.errors.length > 0) {
    messages.push(...validation.errors.map(e => `❌ ${e}`));
  }
  
  if (validation.warnings.length > 0) {
    messages.push(...validation.warnings.map(w => `⚠️ ${w}`));
  }
  
  if (messages.length === 0) {
    messages.push("✅ Your skill assessment appears genuine and well-considered.");
  }
  
  return messages;
}
