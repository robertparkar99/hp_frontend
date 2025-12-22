
import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_NEW!;
const MODEL = "0";

function extractJSON(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobRole, assessmentType, questionCount, mappings, data: jobData } = body;
    const { tasksByFunction, skillsData, tasksData, knowledgeItems, abilityItems, attitudeItems, behaviourItems } = jobData;
    console.log("JObdiscription model data",jobData);

    const prompt = `You are an expert assessment question generator.

    Job Role: ${jobRole}
    Assessment Type: ${assessmentType}

    Generate ${questionCount} multiple-choice questions based on the Question Mapping Settings.

    Rules:
    - 4 options per question (A, B, C, D)
    - Exactly ONE correct answer
    - Include rationale
    - Map each question to Critical Work Function and Key Task

    Question Mapping Settings:
    ${mappings?.map((m: any, i: number) =>
          `${i + 1}. Type: ${m.typeName} → Value: ${m.valueName}
    Reason: ${m.reason}
    Questions: ${m.questionCount}
    Marks: ${m.marks}`
        ).join("\n") || "No mappings provided"}

    IMPORTANT: Return ONLY valid JSON. Do NOT include any markdown, code blocks, or extra text. Start directly with { and end with }.

    Output format:
    {
      "questions": [
        {
          "id": 1,
          "type": "${assessmentType}",
          "question": "Question text here?",
          "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
          "correctAnswer": "A. Option 1",
          "cwf": "Critical Work Function",
          "keyTask": "Key Task",
          "rationale": "Explanation here"
        }
      ]
    }`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 2500,
        }),
      }
    );

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response", raw: data },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(extractJSON(content));
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from AI", raw: content },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "No questions array in response", raw: parsed },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
