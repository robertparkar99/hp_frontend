import { NextResponse } from "next/server";

// Environment variables
// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_NEW || "";
const GAMMA_API_KEY = process.env.GAMMA_API_KEY || "";
const MODEL = process.env.AI_MODEL || "deepseek/deepseek-chat";
const MAX_POLL_ATTEMPTS = parseInt(process.env.GAMMA_MAX_POLL_ATTEMPTS || "120", 10);

// Validate API keys on startup
// if (!OPENROUTER_API_KEY || !GAMMA_API_KEY) {
//   console.error("Missing required API keys: OPENROUTER_API_KEY_NEW, GAMMA_API_KEY");
// }

function extractJSON(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

// Generate assessment questions using OpenRouter
// async function generateAssessmentQuestions(topic: string, jobRole: string, department: string, questionCount: number = 5) {
//   const prompt = `Generate ${questionCount} high-quality assessment questions about "${topic}" for ${jobRole} role in ${department} department.

// Output must be valid JSON in this exact format:
// {
//   "questions": [
//     {
//       "id": 1,
//       "question_title": "Question text here?",
//       "answers": [
//         { "answer": "Option A", "correct_answer": 1 },
//         { "answer": "Option B", "correct_answer": 0 },
//         { "answer": "Option C", "correct_answer": 0 },
//         { "answer": "Option D", "correct_answer": 0 }
//       ],
//       "marks": 1,
//       "reason": "Explanation of correct answer"
//     }
//   ]
// }`;

//   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: MODEL,
//       messages: [
//         {
//           role: "system",
//           content: "You are an expert assessment question generator. Generate valid JSON only, no explanations."
//         },
//         { role: "user", content: prompt }
//       ],
//       max_tokens: 2500,
//       temperature: 0.0,
//     }),
//   });

//   const data = await response.json();
//   const content = data?.choices?.[0]?.message?.content;

//   if (!content) {
//     const errorMessage = data?.error?.message || "Empty AI response for questions";
//     throw new Error(errorMessage);
//   }

//   try {
//     return JSON.parse(extractJSON(content));
//   } catch {
//     throw new Error("Invalid JSON from AI for questions");
//   }
// }

// Generate course content using Gamma API
async function generateCourseContent(topic: string, slideCount: number = 10) {
  const requestData = {
    inputText: topic,
    textMode: "generate",
    format: "presentation",
    numCards: slideCount,
    cardSplit: "auto",
    additionalInstructions: "All slides must use clear, consistent formatting. Ensure a formal instructional tone.",
    exportAs: "pdf",
    textOptions: {
      amount: "extensive",
      tone: "formal, instructional",
      audience: "employees, L&D managers, HR",
      language: "en",
    },
    imageOptions: {
      source: "aiGenerated",
      model: "imagen-4-pro",
      style: "minimal, professional",
    },
    cardOptions: {
      dimensions: "fluid",
    },
    sharingOptions: {
      workspaceAccess: "view",
      externalAccess: "noAccess",
    },
  };

  const response = await fetch("https://public-api.gamma.app/v1.0/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": GAMMA_API_KEY,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gamma API Error: ${errorText}`);
  }

  const result = await response.json();
  const generationId = result.generationId;

  if (!generationId) {
    throw new Error("No generationId received from Gamma API");
  }

  // Poll for completion
  let status = "pending";
  let attempts = 0;

  while (status !== "completed" && attempts < MAX_POLL_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, 2000));
    attempts++;

    const pollResponse = await fetch(
      `https://public-api.gamma.app/v1.0/generations/${generationId}`,
      {
        headers: {
          "x-api-key": GAMMA_API_KEY,
        },
      }
    );

    if (!pollResponse.ok) continue;

    const pollData = await pollResponse.json();
    status = pollData.status;

    if (status === "completed") {
      return {
        generationId: pollData.generationId,
        gammaUrl: pollData.gammaUrl,
        exportUrl: pollData.exportUrl,
      };
    }

    if (status === "failed") {
      throw new Error("Course generation failed");
    }
  }

  throw new Error("Course generation timed out");
}

export async function POST(req: Request) {
  console.log("API /api/bulk-content-generate called");
  
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { 
      rows, 
      contentType = "jobrole" 
    } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No rows provided" },
        { status: 400 }
      );
    }

    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowResult: any = {
        rowIndex: i + 1,
        topic: row.chapterName || row.topic || "",
        department: row.department || "",
        jobRole: row.jobrole || "",
        contentType: row.contentType || contentType,
        success: false,
        errors: [],
      };

      try {
        // Commented out: Generate Assessment if requested
        /*
        if (row.contentType === "assessment" || row.contentType === "jobrole") {
          try {
            const questionCount = row.questionCount || 0;
            const assessmentData = await generateAssessmentQuestions(
              row.chapterName || row.topic,
              row.jobrole,
              row.department,
              questionCount
            );
            rowResult.assessment = {
              success: true,
              questions: assessmentData.questions,
              questionCount: assessmentData.questions?.length || 0,
            };
          } catch (assessmentError: any) {
            rowResult.assessment = {
              success: false,
              error: assessmentError.message,
            };
            rowResult.errors.push(`Assessment error: ${assessmentError.message}`);
          }
        }
        */

        // Generate Course if requested
        if (row.contentType === "course" || row.contentType === "jobrole") {
          try {
            const slideCount = row.slideCount || 0;
            const courseData = await generateCourseContent(
              row.chapterName || row.topic,
              slideCount
            );
            rowResult.course = {
              success: true,
              ...courseData,
            };
          } catch (courseError: any) {
            rowResult.course = {
              success: false,
              error: courseError.message,
            };
            rowResult.errors.push(`Course error: ${courseError.message}`);
          }
        }

        // Commented out: Mark as success if at least one content type succeeded
        // Assessment generation is commented out, so success based only on course
        rowResult.success = false; // default
        if (row.contentType === "course" || row.contentType === "jobrole") {
          rowResult.success = rowResult.course?.success || false;
        }
        // For assessment contentType, success remains false since assessment is commented out

      } catch (error: any) {
        rowResult.errors.push(`Row processing error: ${error.message}`);
        console.error(`Error processing row ${i + 1}:`, error);
      }

      results.push(rowResult);
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        succeeded: successCount,
        failed: failedCount,
      },
      results,
    });

  } catch (error: any) {
    console.error("Bulk generation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
