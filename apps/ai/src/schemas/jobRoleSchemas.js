import { z } from 'genkit';

// --- 1. SKILL ITEM (Simplified) ---
const SkillItemSchema = z.object({
  title: z.string(),
  level: z.number().int().min(1).max(6),
});

// --- 2. KNOWLEDGE ITEM (Simplified) ---
const KnowledgeItemSchema = z.object({
  title: z.string(),
  level: z.number().int().min(1).max(5),
});

// --- 3. ABILITY ITEM (Simplified) ---
const AbilityItemSchema = z.object({
  title: z.string(),
  level: z.number().int().min(1).max(5),
});

// --- 4. ATTITUDE ITEM (Simplified) ---
const AttitudeItemSchema = z.object({
  title: z.string(),
  level: z.number().int().min(1).max(5),
});

// --- 5. BEHAVIOR ITEM (Simplified) ---
const BehaviorItemSchema = z.object({
  title: z.string(),
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

  // Reduced array sizes to control schema complexity
  skills: z.array(SkillItemSchema).max(3),
  knowledge: z.array(KnowledgeItemSchema).max(3),
  ability: z.array(AbilityItemSchema).max(3),
  attitude: z.array(AttitudeItemSchema).max(3),
  behavior: z.array(BehaviorItemSchema).max(3),

  // CWF sections, limited count
  cwf_items: z.array(CWFTItemSchema).max(3),
});
