
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("API /api/generate-questions called");
  try {
    const body = await req.json();
    console.log("Request body:", body);



    // Prepare payload for the new API
    const payload = {
      jobRole: body.jobRole,
      question_type: body.question_type,
      questionCount: body.questionCount,
      data: body.data,
      mappings: body.mappings,
    };

    console.log("Payload for new API:", payload);

    const response = await fetch("https://hp.triz.co.in/api/gemini/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate questions", raw: data },
        { status: response.status }
      );
    }

    if (!Array.isArray(data.data?.questions)) {
      return NextResponse.json(
        { error: "No questions array in response", raw: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: data.data.questions });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
