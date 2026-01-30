import { NextResponse } from "next/server";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { z } from "zod";

// Initialize Genkit with Google AI plugin (singleton pattern for serverless)
let gkInstance: ReturnType<typeof genkit> | null = null;

function getGenkitInstance() {
    if (!gkInstance) {
        gkInstance = genkit({
            plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY || "" })],
        });
    }
    return gkInstance;
}

// Define the flow inline to avoid import issues
function createJobRoleCompetencyTestFlow(gk: ReturnType<typeof genkit>) {
    return gk.defineFlow(
        {
            name: "jobRoleCompetencyTestFlow",
            inputSchema: z.any(),
        },
        async (input) => {
            console.log("🟢 TEST FLOW RECEIVED RAW INPUT:", input);
            return {
                received: true,
                timestamp: new Date().toISOString(),
                payload: input,
            };
        }
    );
}
import { jobRoleCompetencyFlow } from "../../../../apps/ai/src/flows/jobRoleCompetencyFlow";
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const gk = getGenkitInstance();
        const flow = jobRoleCompetencyFlow(gk);

        const result = await flow(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error executing Genkit flow:", error);
        return NextResponse.json(
            { error: "Flow execution failed", details: String(error) },
            { status: 500 }
        );
    }
}