import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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"; // Store securely

export async function POST(req: Request) {
    try {
        const { skillName, description, orgType } = await req.json();

        const prompt = `Given a skill named "${skillName}" with description "${description}" in the "${orgType}" industry, please generate:
1. Most suitable skill category and sub-category
2. Related skills
3. Custom tags
4. Business links
5. Learning resources
6. Assessment methods
7. Required certifications/qualifications
8. Typical experience/projects
9. Skill mapping

Return ONLY a valid JSON object with these keys:
{
  "category": "",
  "sub_category": "",
  "related_skills": [],
  "custom_tags": [],
  "business_links": "",
  "learning_resources": "",
  "assessment_methods": "",
  "certifications": "",
  "experience": "",
  "skill_mapping": ""
}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://yourdomain.com",
                "X-Title": "Skill Generator",
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
