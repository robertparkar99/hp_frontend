import { NextResponse } from "next/server";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
// @ts-ignore - Flow is a JavaScript module
import { courseRecommendationFlow } from "../../../apps/ai/src/flows/courseRecommendationFlow";

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

export async function POST(req: Request) {
    try {
        // Get userId and sub_institute_id from session cookie automatically
        const cookieHeader = req.headers.get('cookie') || '';
        
        let userId = null;
        let subInstituteId = null;
        
        // Parse userData from cookie
        const userDataMatch = cookieHeader.match(/userData=([^;]+)/);
        if (userDataMatch) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataMatch[1]));
                userId = userData.user_id;
                subInstituteId = userData.sub_institute_id;
                console.log('[course-recommendation] Found userId from session cookie:', userId);
                console.log('[course-recommendation] Found subInstituteId from session cookie:', subInstituteId);
            } catch (e) {
                console.error('[course-recommendation] Error parsing userData cookie:', e);
            }
        }
        
        // Fallback: try to get from header if cookie not available
        if (!userId) {
            userId = req.headers.get('x-user-id');
        }
        if (!subInstituteId) {
            subInstituteId = req.headers.get('x-sub-institute-id');
        }

        // Validate input
        if (!userId || typeof userId !== 'string') {
            return NextResponse.json(
                { error: "User session not found. Please login again." },
                { status: 401 }
            );
        }

        const gk = getGenkitInstance();

        // Pass userId and subInstituteId to the flow
        const result = await courseRecommendationFlow({ userId, subInstituteId });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error executing Course Recommendation Flow:", error);
        return NextResponse.json(
            { error: "Course recommendation failed", details: String(error) },
            { status: 500 }
        );
    }
}
