import { z } from 'genkit';

// --- 1. SKILL ITEM (With full details) ---
const SkillItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  level: z.number().int().min(1).max(6),
});

// --- 2. KNOWLEDGE ITEM (Enhanced - Like Skills) ---
const KnowledgeItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  level: z.number().int().min(1).max(5),
});

// --- 3. ABILITY ITEM (Enhanced - Like Skills) ---
const AbilityItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  level: z.number().int().min(1).max(5),
});

// --- 4. ATTITUDE ITEM (Enhanced - Like Skills) ---
const AttitudeItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  level: z.number().int().min(1).max(5),
});

// --- 5. BEHAVIOR ITEM (Enhanced - Like Skills) ---
const BehaviorItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  level: z.number().int().min(1).max(5),
});

// --- 6. CWF + TASKS (Simplified) ---
const CWFTItemSchema = z.object({
  critical_work_function: z.string(),
  key_tasks: z.array(z.string()).max(3), // reduced max tasks
});

// --- 7. INPUT SCHEMA ---
export const JobRoleInputSchema = z.object({
  industry: z.string().optional(),
  department: z.string().optional(),
  jobRole: z.string().optional(),
  description: z.string().optional(),
  chatHistory: z.array(z.string()).optional(),
});


export const SimpleJobRoleCompetencySchema = z.object({
  // Required textual context to describe the job role
  department: z.string(),
  description: z.string(),

  // Increased array sizes to generate comprehensive competency profiles
  skills: z.array(SkillItemSchema).max(10),
  knowledge: z.array(KnowledgeItemSchema).max(5),
  ability: z.array(AbilityItemSchema).max(5),
  attitude: z.array(AttitudeItemSchema).max(5),
  behavior: z.array(BehaviorItemSchema).max(5),

  // CWF sections, increased count for more comprehensive coverage
  cwf_items: z.array(CWFTItemSchema).max(5),
});
