import { NextResponse } from "next/server";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { z } from "zod";
// @ts-ignore - Flow is a JavaScript module
import { skillGapAnalysisFlow } from "../../../../apps/ai/src/flows/skillGapAnalysisFlow";

/**
 * Skill Gap Analysis API Route
 * 
 * Handles the skill gap analysis conversation flow:
 * Industry → Department → Job Role → Tasks → Skills
 * 
 * Request body:
 * {
 *   currentStep: 'industry' | 'department' | 'jobRole' | 'tasks' | 'skills',
 *   industry?: string,
 *   department?: string,
 *   jobRole?: string
 * }
 * 
 * Response:
 * {
 *   step: string,
 *   data: Array<{ id: number, name: string }>,
 *   nextStep: string,
 *   message: string
 * }
 */

// Initialize Genkit with Google AI plugin (singleton pattern for serverless)
let gkInstance: ReturnType<typeof genkit> | null = null;

function getGenkitInstance() {
    if (!gkInstance) {
        gkInstance = genkit({
            plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY || "" })]
        });
    }
    return gkInstance;
}

// Input validation schema
const SkillGapAnalysisRequestSchema = z.object({
    currentStep: z.enum(['industry', 'department', 'jobRole', 'tasks', 'skills', 'rating_prompt', 'skill_rating']),
    industry: z.string().optional(),
    department: z.string().optional(),
    jobRole: z.string().optional(),
    sub_institute_id: z.union([z.string(), z.number()]).optional(),
});

export async function POST(req: Request) {
    try {
        // Parse and validate request body
        const body = await req.json();
        
        const validationResult = SkillGapAnalysisRequestSchema.safeParse(body);
        
        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: "Invalid input", 
                    details: validationResult.error.errors 
                },
                { status: 400 }
            );
        }

        const { currentStep, industry, department, jobRole, sub_institute_id } = validationResult.data;

        console.log('[skill-gap-analysis] Request received:', {
            currentStep,
            industry,
            department,
            jobRole,
            sub_institute_id
        });

        const gk = getGenkitInstance();

        // Call the skill gap analysis flow - convert sub_institute_id to string if it's a number
        const subInstituteIdStr = sub_institute_id ? String(sub_institute_id) : '';
        const result = await skillGapAnalysisFlow({
            currentStep,
            industry: industry || '',
            department: department || '',
            jobRole: jobRole || '',
            sub_institute_id: subInstituteIdStr
        });

        console.log('[skill-gap-analysis] Flow result:', result);

        return NextResponse.json(result);
        
    } catch (error) {
        console.error("Error executing Skill Gap Analysis Flow:", error);
        return NextResponse.json(
            { error: "Skill gap analysis failed", details: String(error) },
            { status: 500 }
        );
    }
}
