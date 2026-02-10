import { z } from 'genkit';

/**
 * Input schema for Build with AI course outline generation
 * Supports both simple and advanced (jsonObject) formats
 */
export const BuildWithAIInputSchema = z.object({
    // Core fields (simple format)
    industry: z.string().optional().default('-'),
    department: z.string().optional().default('-'),
    jobRole: z.string().optional().default('-'),
    modality: z.object({
        selfPaced: z.boolean().optional().default(false),
        instructorLed: z.boolean().optional().default(false),
    }).optional().default({}),
    tasks: z.array(z.string()).optional().default([]),
    criticalWorkFunction: z.string().optional().default('-'),

    // Advanced fields (jsonObject format from ConfigurationModal)
    slideCount: z.number().optional().default(10),

    // Skill-based fields
    selectedSkill: z.object({
        skillName: z.string().optional(),
        description: z.string().optional(),
        proficiency_level: z.string().optional(),
        category: z.string().optional(),
        sub_category: z.string().optional(),
    }).optional(),

    // KAAB competencies
    knowledge: z.array(z.object({
        title: z.string(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
    })).optional().default([]),
    ability: z.array(z.object({
        title: z.string(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
    })).optional().default([]),
    attitude: z.array(z.object({
        title: z.string(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
    })).optional().default([]),
    behaviour: z.array(z.object({
        title: z.string(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
    })).optional().default([]),

    // Mapping/Pedagogical approach
    mappingType: z.string().optional(),
    mappingValue: z.string().optional(),
    mappingReason: z.string().optional(),
});

/**
 * Output schema for Build with AI course outline generation
 * Returns plain text content suitable for Gamma API consumption
 */
export const BuildWithAIOutputSchema = z.object({
    content: z.string().describe('Generated course outline text for Gamma API'),
});
