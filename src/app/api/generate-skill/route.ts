import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_SKILL || " "; // Store securely in env file

export async function POST(req: Request) {
    try {
        console.log("Received POST request at /api/generate-skill");
        console.log("OPENROUTER_API_KEY:", OPENROUTER_API_KEY);
        const { skillName, description, orgType } = await req.json();
        console.log("Parsed skillName:", skillName);
        console.log("Parsed description:", description);
        console.log("Parsed orgType:", orgType);
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
                
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        const data = await response.json();
        console.log("OpenRouter response data:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("OpenRouter error:", error);
        console.log("Error details:", error);
        return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }
}


// export const runtime = "nodejs";

// import { NextResponse } from "next/server";

// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;


// export async function POST(req: Request) {
//     console.log("Received POST request at /api/generate-skill");
//     try {
//         const bodyText = await req.text();
//         console.log("Raw request body:", bodyText);

//         // Safe parsing
//         const { description, orgType } = JSON.parse(bodyText);
//         console.log("Parsed description:", description);
//         console.log("Parsed orgType:", orgType);

//         const prompt = `Generate a skill description based on: "${description}" for organization type: "${orgType}".`;

//         const requestBody = {
//             model: "deepseek/deepseek-chat",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.7,
//             max_tokens: 500,
//         };

//         console.log("Request body to OpenRouter:", JSON.stringify(requestBody));

//         const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(requestBody),
//         });

//         const text = await response.text();
//         console.log("OpenRouter response text:", text);

//         let data;
//         try {
//             data = JSON.parse(text);
//         } catch {
//             data = { error: "Non-JSON response from OpenRouter", raw: text };
//         }

//         return NextResponse.json(data);
//     } catch (error) {
//         console.error("OpenRouter error:", error);
//         return NextResponse.json({ error: "AI generation failed by AJ" }, { status: 500 });
//     }
// }

