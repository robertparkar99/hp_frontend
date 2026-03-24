/**
 * Schema Definitions for Skill Gap Analysis Flow
 * 
 * These schemas define the input/output structures for the skill gap analysis
 * which follows the flow: Industry → Department → Job Role → Tasks → Skills
 */

import { z } from 'zod';

// ================= OUTPUT SCHEMAS =================

/**
 * Schema for a single industry item
 */
export const IndustrySchema = z.object({
  industryId: z.number().optional(),
  industryName: z.string(),
});

/**
 * Schema for a single department item
 */
export const DepartmentSchema = z.object({
  departmentId: z.number().optional(),
  departmentName: z.string(),
});

/**
 * Schema for a single job role item
 */
export const JobRoleSchema = z.object({
  jobRoleId: z.number().optional(),
  jobRoleName: z.string(),
});

/**
 * Schema for a single task item
 */
export const TaskSchema = z.object({
  taskId: z.number().optional(),
  taskName: z.string(),
});

/**
 * Schema for a single skill item
 */
export const SkillSchema = z.object({
  skillId: z.number().optional(),
  skillName: z.string(),
});

// ================= INPUT SCHEMA =================

/**
 * Input schema for the skill gap analysis flow.
 * Determines which step of the flow to execute.
 */
export const SkillGapAnalysisInputSchema = z.object({
  // Current step in the flow: industry -> department -> jobRole -> tasks -> skills
  currentStep: z.enum(['industry', 'department', 'jobRole', 'tasks', 'skills']),
  
  // Industry name (required for department, jobRole, tasks, skills steps)
  industry: z.string().optional(),
  
  // Department name (required for jobRole, tasks, skills steps)
  department: z.string().optional(),
  
  // Job role name (required for tasks, skills steps)
  jobRole: z.string().optional(),
});

// ================= OUTPUT SCHEMA =================

/**
 * Output schema for the skill gap analysis flow
 */
export const SkillGapAnalysisOutputSchema = z.object({
  // Current step that was executed
  step: z.string(),
  
  // Array of data returned from the tool (industries, departments, jobRoles, tasks, or skills)
  data: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
  })),
  
  // Next step in the flow
  nextStep: z.string(),
  
  // Optional message
  message: z.string().optional(),
});

// ================= EXPORTS =================

export default {
  IndustrySchema,
  DepartmentSchema,
  JobRoleSchema,
  TaskSchema,
  SkillSchema,
  SkillGapAnalysisInputSchema,
  SkillGapAnalysisOutputSchema,
};
