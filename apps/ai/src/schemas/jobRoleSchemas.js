// import { z } from 'genkit';

// // --- 1. SKILLS HIERARCHY ---

// export const SkillSchema = z.discriminatedUnion('category', [
//   z.object({
//     category: z.literal('Cognitive & Thinking Skills'),
//     sub_category: z.enum(['Analytical reasoning', 'Critical thinking', 'Problem-solving']),
//   }),
//   z.object({
//     category: z.literal('Compliance & Regulatory Skills'),
//     sub_category: z.enum(['Industry Compliance Knowledge', 'Legal', 'Safety']),
//   }),
//   z.object({
//     category: z.literal('Critical Core Skills'),
//     sub_category: z.enum(['Interacting with Others', 'Thinking Critically']),
//   }),
//   z.object({
//     category: z.literal('Digital & Data Skills'),
//     sub_category: z.enum(['Data Analytics', 'Digital Literacy']),
//   }),
//   z.object({
//     category: z.literal('Functional Skills'),
//     sub_category: z.literal('Job Role-Specific'),
//   }),
//   z.object({
//     category: z.literal('Leadership & Management Skills'),
//     sub_category: z.enum(['Decision-Making', 'Strategic Thinking', 'Team Management']),
//   }),
//   z.object({
//     category: z.literal('Soft Skills'),
//     sub_category: z.enum(['Communication skills', 'Interpersonal', 'Leadership']),
//   }),
//   z.object({
//     category: z.literal('Technical Skills'),
//     sub_category: z.enum(['Domain-Specific', 'Industry-specific']),
//   }),
// ]).and(z.object({
//   title: z.string().min(1),
//   description: z.string().min(1),
//   level: z.number().int().min(1).max(6),
// }));

// // --- 2. KNOWLEDGE HIERARCHY ---

// export const KnowledgeSchema = z.discriminatedUnion('category', [
//   z.object({
//     category: z.literal('Conceptual Knowledge'),
//     sub_category: z.enum(['Knowledge of classifications and categories', 'Knowledge of principles and generalizations', 'Knowledge of theories, models, and structures']),
//   }),
//   z.object({
//     category: z.literal('Metacognitive Knowledge'),
//     sub_category: z.enum(['Knowledge about cognitive tasks, including appropriate contextual and conditional knowledge', 'Self-knowledge', 'Strategic knowledge']),
//   }),
//   z.object({
//     category: z.literal('Procedural Knowledge'),
//     sub_category: z.enum(['Knowledge of criteria for determining when to use appropriate procedures', 'Knowledge of subject-specific skills and algorithms', 'Knowledge of subject-specific techniques and methods']),
//   }),
//   z.object({
//     category: z.literal('Factual Knowledge'),
//     sub_category: z.enum(['Knowledge of specific details and elements', 'Knowledge of terminology']),
//   }),
// ]).and(z.object({
//   title: z.string().min(1),
//   level: z.number().int().min(1).max(5),
// }));

// // --- 3. ABILITY HIERARCHY ---

// export const AbilitySchema = z.discriminatedUnion('category', [
//   z.object({
//     category: z.literal('Cognitive Abilities'),
//     sub_category: z.enum(['Visualization', 'Verbal comprehension', 'Mathematical reasoning', 'Deductive reasoning', 'Memory (short-term, long-term)', 'Information ordering', 'Inductive reasoning']),
//   }),
//   z.object({
//     category: z.literal('Psychomotor Abilities'),
//     sub_category: z.enum(['Response orientation', 'Multilimb coordination', 'Precision control', 'Reaction time']),
//   }),
//   z.object({
//     category: z.literal('Physical Abilities'),
//     sub_category: z.enum(['Coordination and dexterity', 'Flexibility and stamina', 'Manual and finger dexterity', 'Strength (static, explosive, dynamic)']),
//   }),
//   z.object({
//     category: z.literal('Sensory Abilities'),
//     sub_category: z.enum(['Hearing sensitivity', 'Speech clarity']),
//   }),
//   z.object({
//     category: z.literal('Social/Interpersonal Abilities'),
//     sub_category: z.enum(['Team coordination', 'Persuasion']),
//   }),
// ]).and(z.object({
//   title: z.string().min(1),
//   level: z.number().int().min(1).max(5),
// }));

// // --- 4. ATTITUDE HIERARCHY ---

// export const AttitudeSchema = z.discriminatedUnion('category', [
//   z.object({ category: z.literal('Adaptability/Flexibility'), sub_category: z.enum(['Flexibility', 'Change Readiness']) }),
//   z.object({ category: z.literal('Accountability/Responsibility'), sub_category: z.enum(['Answerability', 'Ownership', 'Transparency']) }),
//   z.object({ category: z.literal('Openness to Feedback'), sub_category: z.literal('Coachability') }),
//   z.object({ category: z.literal('Commitment to Quality/Quality Focus'), sub_category: z.enum(['Precision', 'Diligence', 'Excellence']) }),
//   z.object({ category: z.literal('Integrity/Honesty/Ethics'), sub_category: z.enum(['Integrity', 'Psychological Safety']) }),
//   z.object({ category: z.literal('Growth Mindset/Growth Orientation'), sub_category: z.enum(['Learning Hunger', 'Curiosity']) }),
//   z.object({ category: z.literal('Initiative/Proactiveness/Proactivity'), sub_category: z.literal('Initiative') }),
// ]).and(z.object({
//   title: z.string().min(1),
//   level: z.number().int().min(1).max(5),
// }));

// // --- 5. BEHAVIOR HIERARCHY ---

// export const BehaviorSchema = z.discriminatedUnion('category', [
//   z.object({ category: z.literal('Stakeholder Focus'), sub_category: z.literal('Customer Empathy') }),
//   z.object({ category: z.literal('Commitment to Quality/Quality Focus'), sub_category: z.literal('Precision') }),
//   z.object({ category: z.literal('Communication'), sub_category: z.enum(['Active Listening', 'Clarity', 'Diplomacy']) }),
//   z.object({ category: z.literal('Safety-Consciousness/Process Adherence'), sub_category: z.enum(['Compliance', 'Following Procedures', 'Standardization']) }),
//   z.object({ category: z.literal('Cognitive Agility'), sub_category: z.literal('Cognitive Agility') }),
//   z.object({ category: z.literal('Accountability in Execution'), sub_category: z.enum(['Task Accountability', 'Error Prevention']) }),
//   z.object({ category: z.literal('Problem-Solving in Action'), sub_category: z.enum(['Critical Analysis', 'Decisiveness']) }),
//   z.object({ category: z.literal('Collaboration/Teamwork'), sub_category: z.enum(['Cross-Functional Synergy', 'Teamwork']) }),
//   z.object({ category: z.literal('Efficiency Drive'), sub_category: z.literal('Resource Optimization') }),
//   z.object({ category: z.literal('Risk Vigilance'), sub_category: z.literal('Safety Focus') }),
//   z.object({ category: z.literal('Digital Fluency'), sub_category: z.literal('Technology Adoption & Integration') }),
// ]).and(z.object({
//   title: z.string().min(1),
//   level: z.number().int().min(1).max(5),
// }));

// // --- 6. WORK FUNCTIONS & FINAL EXPORT ---

// export const CWFKTSchema = z.object({
//   critical_work_function: z.string().min(1),
//   key_tasks: z.array(z.string().min(1)).min(3).max(5),
// });

// export const JobRoleCompetencySchema = z.object({
//   CWFKT: z.array(CWFKTSchema).min(3).max(5),
//   skills: z.array(SkillSchema).min(4).max(8),
//   knowledge: z.array(KnowledgeSchema).min(4).max(8),
//   ability: z.array(AbilitySchema).min(4).max(8),
//   attitude: z.array(AttitudeSchema).min(4).max(8),
//   behavior: z.array(BehaviorSchema).min(4).max(8),
// });

// // Input schema for job role extraction
// // Note: jobRole title will be generated by LLM based on department and description
// export const JobRoleInputSchema = z.object({
//   industry: z.string().optional(),
//   department: z.string(),  // Required: Department name from user
//   jobRole: z.string().optional(),  // Optional: Will be generated by LLM if not provided
//   description: z.string(),  // Required: Job Role Description from user
//   chatHistory: z.array(z.string()).optional(),
// });








import { z } from 'genkit';

// --- 1. SKILLS HIERARCHY ---
export const SkillSchema = z.object({
  category: z.enum([
    'Cognitive & Thinking Skills',
    'Compliance & Regulatory Skills',
    'Critical Core Skills',
    'Digital & Data Skills',
    'Functional Skills',
    'Leadership & Management Skills',
    'Soft Skills',
    'Technical Skills',
  ]),
  sub_category: z.string(),  // allow Gemini to pick or generate
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.number().int().min(1).max(6),
});

// --- 2. KNOWLEDGE HIERARCHY ---
export const KnowledgeSchema = z.object({
  category: z.enum([
    'Conceptual Knowledge',
    'Metacognitive Knowledge',
    'Procedural Knowledge',
    'Factual Knowledge',
  ]),
  sub_category: z.string(),
  title: z.string().min(1),
  level: z.number().int().min(1).max(5),
});

// --- 3. ABILITY HIERARCHY ---
export const AbilitySchema = z.object({
  category: z.enum([
    'Cognitive Abilities',
    'Psychomotor Abilities',
    'Physical Abilities',
    'Sensory Abilities',
    'Social/Interpersonal Abilities',
  ]),
  sub_category: z.string(),
  title: z.string().min(1),
  level: z.number().int().min(1).max(5),
});

// --- 4. ATTITUDE HIERARCHY ---
export const AttitudeSchema = z.object({
  category: z.enum([
    'Adaptability/Flexibility',
    'Accountability/Responsibility',
    'Openness to Feedback',
    'Commitment to Quality/Quality Focus',
    'Integrity/Honesty/Ethics',
    'Growth Mindset/Growth Orientation',
    'Initiative/Proactiveness/Proactivity',
  ]),
  sub_category: z.string(),
  title: z.string().min(1),
  level: z.number().int().min(1).max(5),
});

// --- 5. BEHAVIOR HIERARCHY ---
export const BehaviorSchema = z.object({
  category: z.enum([
    'Stakeholder Focus',
    'Commitment to Quality/Quality Focus',
    'Communication',
    'Safety-Consciousness/Process Adherence',
    'Cognitive Agility',
    'Accountability in Execution',
    'Problem-Solving in Action',
    'Collaboration/Teamwork',
    'Efficiency Drive',
    'Risk Vigilance',
    'Digital Fluency',
  ]),
  sub_category: z.string(),
  title: z.string().min(1),
  level: z.number().int().min(1).max(5),
});

// --- 6. WORK FUNCTIONS & FINAL EXPORT ---
export const CWFKTSchema = z.object({
  critical_work_function: z.string().min(1),
  key_tasks: z.array(z.string().min(1)).min(3).max(5),
});

export const JobRoleCompetencySchema = z.object({
  CWFKT: z.array(CWFKTSchema).min(3).max(5),
  skills: z.array(SkillSchema).min(4).max(8),
  knowledge: z.array(KnowledgeSchema).min(4).max(8),
  ability: z.array(AbilitySchema).min(4).max(8),
  attitude: z.array(AttitudeSchema).min(4).max(8),
  behavior: z.array(BehaviorSchema).min(4).max(8),
});

// Input schema for job role extraction
export const JobRoleInputSchema = z.object({
  industry: z.string(),
  department: z.string(),
  jobRole: z.string(),
  description: z.string(),
}).passthrough();
