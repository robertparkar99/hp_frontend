import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { industry, department, jobRole } = await req.json();

    if (!jobRole) {
      return NextResponse.json(
        { error: "Job role is required" },
        { status: 400 }
      );
    }

    // Call LLM to generate skills
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are a competency framework expert. Generate skills for a job role in JSON format only. Return ONLY a JSON array with no other text.' 
          },
          { 
            role: 'user', 
            content: `Generate 5-10 skills for a ${jobRole} in ${department || 'General'} department of ${industry || 'General'} industry. 

Return ONLY a JSON array with this structure (no other text):
[
  {
    "title": "Skill name",
    "description": "Brief description of the skill",
    "category": "One of: Technical Skills, Soft Skills, Digital & Data Skills, Leadership & Management Skills, Cognitive & Thinking Skills, Functional Skills, Compliance & Regulatory Skills, Critical Core Skills",
    "sub_category": "Specific sub-category based on category",
    "level": number between 1-6
  }
]

Ensure each skill is relevant to the job role and has appropriate category and level.`}
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API failed: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
    const cleanedContent = rawContent.replace(/```json\n?|\n?```/g, '').trim();
    
    let skills = [];
    try {
      skills = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[generate-skills-llm] Failed to parse LLM response:', parseError);
      return NextResponse.json(
        { error: "Failed to parse skills response", skills: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ skills });

  } catch (error) {
    console.error('[generate-skills-llm] Error:', error);
    return NextResponse.json(
      { error: "Failed to generate skills", details: String(error) },
      { status: 500 }
    );
  }
}