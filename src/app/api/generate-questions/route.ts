
import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_NEW || " ";
console.log("OPENROUTER_API_KEY set:", !!OPENROUTER_API_KEY);
const MODEL = "deepseek/deepseek-chat";

function extractJSON(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(req: Request) {
  console.log("API /api/generate-questions called");
  try {
    const body = await req.json();
    console.log("Request body:", body);
    const { jobRole, question_type, questionCount, mappings, data: jobData } = body;
    const { tasksByFunction, skillsData, tasksData, knowledgeItems, abilityItems, attitudeItems, behaviourItems } = jobData;
    console.log("Job Role:", jobRole);
    console.log("JObdiscription model data", jobData);
    console.log("mappings ", mappings);
    console.log("question_type ", question_type);
    console.log("questionCount ", questionCount);
    const totalMarks = mappings?.reduce((sum: number, m: any) => sum + m.questionCount * m.marks, 0) || 0;
    console.log("Total Marks:", totalMarks);


    const prompt = `Your task is to generate ${questionCount} high-quality, job-relevant hiring
assessment questions using the structured job context, structured domain context,
mapping requirements, and mandatory assessment rules provided below.

========================
JOB CONTEXT
========================
Industry: ${jobData.jobRole.industries}
Department: ${jobData.jobRole.department}
Job Role: ${jobData.jobRole.jobrole}

Role Description:
${jobData.jobRole.description}

========================
STRUCTURED DOMAIN CONTEXT (GROUNDING ONLY)
========================
Use the following datasets strictly as grounding context.
Do NOT invent skills, tasks, knowledge, abilities, attitudes, or behaviours
beyond what is explicitly provided.

SKILLS DATA (SkillName, description, proficiency_level):
${JSON.stringify(skillsData, null, 2)}

TASKS DATA (critical work functions & taskName):
${JSON.stringify(tasksData, null, 2)}

KNOWLEDGE ITEMS (title, description):
${JSON.stringify(knowledgeItems, null, 2)}

ABILITY ITEMS (title, description):
${JSON.stringify(abilityItems, null, 2)}

ATTITUDE ITEMS (title, description):
${JSON.stringify(attitudeItems, null, 2)}

BEHAVIOUR ITEMS (title, description):
${JSON.stringify(behaviourItems, null, 2)}

========================
MANDATORY COVERAGE RULES
========================
Across all generated questions, coverage MUST include:

• Tasks: observable work execution or decision-making  
• Skills: applied capability or technique  
• Knowledge: factual or conceptual understanding  
• Abilities: underlying capacity (analysis, judgment, problem-solving)  
• Attitudes: values, mindset, or disposition  
• Behaviours: observable actions or patterns over time  

Each question MUST:
1. Target exactly ONE primary domain category
   (Task | Skill | Knowledge | Ability | Attitude | Behaviour)
2. Be clearly assessable in a hiring context
3. Be grounded in exactly ONE specific item from the provided datasets
4. Avoid testing multiple domains in a single question

========================
ANSWER OPTION QUALITY RULES
========================
• Correct answers MUST NOT be identifiable solely by being more specific,
  more technical, longer, or more detailed than the distractors.
• All answer options must be plausible, comparable in length and specificity,
  and aligned to the same domain and difficulty level.
• Distractors must represent realistic but incorrect reasoning,
  not obviously wrong or irrelevant choices.
• If one option stands out due to uniqueness or excessive detail,
  regenerate the answer set until options are balanced.

========================
MAPPING REQUIREMENTS
========================
Each requirement set defines WHAT to assess, WHY it is assessed,
HOW MANY questions to generate, and WHICH domain category it belongs to.

${mappings?.map((m: any, i: number) => `
REQUIREMENT SET ${i + 1}:
  - Mapping Type: ${m.typeName}
  - Target Value: ${m.valueName}
  - Domain Category (Task | Skill | Knowledge | Ability | Attitude | Behaviour): ${m.domainCategory}
  - Reason: ${m.reason}
  - Questions Required: ${m.questionCount}
  - Total Marks: ${m.marks}

For this set:
• All questions MUST assess the specified Domain Category
• Each question must operationalize the Target Value
• Content must be appropriate for the specified Job Role
• sourceItem.dataset = "${m.domainCategory.toUpperCase()} ITEMS"
• sourceItem.title = the title of the specific item from the dataset used for the question
`).join("\n")}

========================
OUTPUT FORMAT (JSON ONLY)
========================
{
  "questions": [
    {
      "id": 1,
      "domainCategory": "Behaviour",
      "sourceItem": {
        "dataset": "BEHAVIOUR ITEMS",
        "title": "Conflict Resolution"
      },
      "question_title": "Job-specific, scenario-based question text",
      "answers": [
        { "answer": "Plausible option A", "correct_answer": 0 },
        { "answer": "Plausible option B", "correct_answer": 1 },
        { "answer": "Plausible option C", "correct_answer": 0 },
        { "answer": "Plausible option D", "correct_answer": 0 }
      ],
      "mappingType": "${mappings[0]?.typeName}",
      "mappingValue": "${mappings[0]?.valueName}",
      "marks": ${mappings[0]?.marks},
      "reason": "Explanation explicitly linking the question to the selected dataset item, domain category, and job context"
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
          messages: [
            {
              role: "system",
              content:
                `You are an expert assessment question generator and psychometric specialist.
                ========================
                QUESTION GENERATION RULES
                ========================
                1. Generate EXACTLY the number of questions specified per requirement set.
                2. Each question must be explicitly grounded in:
                  - at least one Skill OR Task
                  - and one Knowledge / Ability / Attitude / Behaviour where relevant.
                3. Avoid generic questions — remain specific to the provided job context.
                4. Each MCQ must include:
                  - 4 plausible options
                  - only ONE fully correct answer
                  - Randomized correct option between A-D.
                5.For every question:
                  - Generate exactly 4 answer options.
                  - Randomly shuffle the options (A, B, C, D) independently for each question.
                  - The correct answer must appear in a different letter position across questions whenever possible.
                  - Do NOT follow any fixed ordering pattern.
                6. Provide a clear reason explaining why the answer is correct.
                ========================
                OPENROUTER MODEL GUIDANCE
                ========================
                - Be deterministic and structured.
                - Avoid unnecessary verbosity.
                - Do NOT include explanations outside the JSON output.
                - Output valid, strictly parseable JSON only.
                Ensure the final output strictly follows this structure.`,
            },
            { role: "user", content: JSON.stringify(prompt, null, 2) }],
          max_tokens: 8000,
          temperature: 0.0,
          top_p: 0.0,
          top_k: 1,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          repetition_penalty: 0.0,
          seed: 12345,
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
