import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || " "; // Store securely

export async function POST(req: Request) {
    try {
        const { jobrole, description, orgType } = await req.json();
        console.log("Received data:", { jobrole, description, orgType });

        const prompt = `Given a job role named "${jobrole}" with description "${description}" in the "${orgType}" industry, please generate:
        1. Most suitable department and sub-department
        2. Performance expectations
        3. Related job roles
        4. Key responsibilities
        5. Required skills and competencies
        6. Career progression path
        7. Industry alignment

        Return ONLY a valid JSON object with these keys:
        {
        "department": "",
        "sub_department": "",
        "performance_expectation": "",
        "related_jobrole": [],
        "key_responsibilities": "",
        "required_skills": [],
        "career_path": "",
        "industry_alignment": ""
        }`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("OpenRouter error:", error);
        return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }
}