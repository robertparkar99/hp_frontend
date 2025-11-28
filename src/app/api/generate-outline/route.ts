import { NextResponse } from "next/server";

// ✅ POST handler for generating course outlines securely on the server
export async function POST(req: Request) {
    try {
        // Parse input from frontend
        const { cfg, industry, aiModel } = await req.json();

        // Validate server-side API key (never exposed to client)
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || " ";


        // Dynamically build course prompt (mirroring your buildPrompt logic)
        const modality = [
            cfg?.modality?.selfPaced && "Self-paced",
            cfg?.modality?.instructorLed && "Instructor-led",
        ]
            .filter(Boolean)
            .join(", ");

        const keyTask = cfg?.tasks?.length > 0 ? cfg.tasks[0] : "-";
        const criticalWorkFunction = cfg?.criticalWorkFunction || "-";

        const coursePrompt = {
            instruction:
                `You are an expert instructional designer and L&D manager belonging to ${industry} industry & specialized in ${cfg.department}. Design a complete 10-slide ${modality} training course that provides comprehensive, competency-based guide to mastering ${keyTask} within ${criticalWorkFunction} for ${cfg.jobRole} in ${cfg.department}.`,
            output_format: {
                total_slides: 10,
                slide_structure: [
                    "Slide Title",
                    "3–5 concise bullet points (under 40 words each) per slide",
                ],
                presentation_structure: [
                    {
                        "slide": 1,
                        "title": "Title Slide",
                        "content": [
                            `Industry: ${industry}`,
                            `Department: ${cfg.department}`,
                            `Job role: ${cfg.jobRole}`,
                            `Key Tasks: ${keyTask}`,
                            `Critical Work Function: ${criticalWorkFunction}`,
                            `Modality: ${modality}`
                        ]
                    },
                    {
                        "slide": 2,
                        "title": "Learning Objectives & Modality Instructions",
                        "content": [
                            `Targeted outcomes for mastering: ${keyTask}`,
                            "Importance of monitoring and evaluation",
                            "Facilitator guidance and session flow overview",
                            "Participant engagement expectations",
                            "Session timing and break structure"
                        ]
                    },
                    {
                        "slide": 3,
                        "title": "Task Contextualization",
                        "content": [
                            `Role of ${keyTask} within ${criticalWorkFunction}`,
                            `Industry context: ${industry}`,
                            "Dependencies and prerequisites",
                            "Stakeholders or systems involved",
                            "Impact on organizational goals"
                        ]
                    },
                    {
                        "slide": 4,
                        "title": "Performance Expectations",
                        "content": [
                            `Key success indicators for ${keyTask}`,
                            "Task standards and KPIs",
                            "Timeliness and quality dimensions",
                            "Competency proficiency levels",
                            "Performance benchmarking criteria"
                        ]
                    },
                    {
                        "slide": 5,
                        "title": "Monitoring Indicators",
                        "content": [
                            `Observable checkpoints for ${keyTask}`,
                            "Red flags and warning signs",
                            "Sample field-level evidence",
                            "Progress tracking metrics",
                            "Quality assurance indicators"
                        ]
                    },
                    {
                        "slide": 6,
                        "title": "Tools & Methods for Monitoring",
                        "content": [
                            "Digital or manual monitoring tools",
                            "Logging and feedback techniques",
                            "Real-time vs retrospective tracking",
                            "Data collection methodologies",
                            "Technology integration points"
                        ]
                    },
                    {
                        "slide": 7,
                        "title": "Data Capture & Reporting",
                        "content": [
                            "Documentation protocols for outcomes",
                            "Structured logs and templates",
                            "Progress and deviation communication",
                            "Reporting frequency and formats",
                            "Stakeholder update mechanisms"
                        ]
                    },
                    {
                        "slide": 8,
                        "title": "Common Pitfalls & Risk Management",
                        "content": [
                            `Frequent errors in: ${keyTask}`,
                            "Preventive and corrective strategies",
                            "Escalation criteria and procedures",
                            "Risk mitigation techniques",
                            "Problem-solving approaches"
                        ]
                    },
                    {
                        "slide": 9,
                        "title": "Best Practice Walkthrough",
                        "content": [
                            `Success scenario for: ${keyTask}`,
                            "Critical decision points highlighted",
                            "Facilitator discussion questions",
                            "Lessons learned examples",
                            "Peer learning opportunities"
                        ]
                    },
                    {
                        "slide": 10,
                        "title": "Completion Criteria & Evaluation",
                        "content": [
                            `Final verification for: ${keyTask}`,
                            "Quality assurance checkpoints",
                            "Facilitator sign-off checklist",
                            "Competency assessment methods",
                            "Continuous improvement planning"
                        ]
                    }

                ],
                language: "practical, professional, and engaging",
                style: "Formal, structured, competency-based",
                visuals: "no visuals or design styling",
                repetition: "no repetition of content across slides",
                tone: modality.includes("Self-paced")
                    ? "Direct, learner-led tone"
                    : "Facilitator-focused guidance",
            },
        };

        // Prepare request payload for OpenRouter API
        const requestData = {
            model: aiModel || "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content:
                        `You are an AI specialized in generating clean, well-formatted course slide outlines. Format Requirements: Use 'Slide X:' followed by the slide title with no bold text, no italics, no parentheses, and no special characters. Use simple hyphen (-) bullet points under each slide. Do not add symbols such as *, **, (), [], {}, emojis, or decorative formatting. Do not format text as Markdown headings. Output must be plain text only. Keep bullet points clear, concise, and instructional. Maintain consistent tone across all slides. Do not add additional commentary, notes, or explanations before or after the slides. Only output the formatted slides.

                        Example format:

                        Slide 1: Topic Name
                        - Bullet point one
                        - Bullet point two
                        - Bullet point three

                        Slide 2: Next Topic
                        - Bullet point one
                        - Bullet point two
                        - Bullet point three

                        Ensure the final output strictly follows this structure.`,
                },
                {
                    role: "user",
                    content: JSON.stringify(coursePrompt, null, 2),
                },
            ],
            max_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
        };

        console.log("🚀 Sending request to OpenRouter with model:", aiModel);

        // Call OpenRouter API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "AI Course Generator",
            },
            body: JSON.stringify(requestData),
        });

        // Handle errors from OpenRouter
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ OpenRouter API Error:", errorText);
            return NextResponse.json(
                { error: `OpenRouter API call failed (${response.status})`, details: errorText },
                { status: response.status }
            );
        }

        // Parse result
        const text = await response.text();
        let result: any;
        try {
            result = JSON.parse(text);
        } catch {
            console.error("⚠️ Could not parse JSON, returning raw text.");
            result = { rawText: text };
        }

        const generatedContent = result?.choices?.[0]?.message?.content || result?.rawText;

        if (!generatedContent) {
            return NextResponse.json(
                { error: "No content generated by the AI model.", raw: result },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            model: aiModel,
            content: generatedContent,
        });

    } catch (error: any) {
        console.error("⚠️ Server-side course generation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error during course generation." },
            { status: 500 }
        );
    }
}
