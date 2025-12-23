import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ✅ Parse input from frontend
    const { inputText, slideCount } = await req.json();

    if (!inputText) {
      return NextResponse.json(
        { error: "inputText is required" },
        { status: 400 }
      );
    }

    // 🚫 No default, no validation, no fallback
    // slideCount will be passed exactly as received

    const requestData = {
      inputText: inputText,
      textMode: "generate",
      format: "presentation",
      themeName: "Oasis",

      // 🔥 FIX: dynamic slide count from frontend
      numCards: slideCount,

      cardSplit: "auto",
      additionalInstructions:
        "All slides must use clear, consistent formatting. Ensure a formal instructional tone.",
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

    console.log("🚀 Sending request to Gamma API");
    console.log("🧮 Slide Count:", slideCount);

    const response = await fetch(
      "https://public-api.gamma.app/v0.2/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.GAMMA_API_KEY || "",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gamma API Error:", errorText);
      return NextResponse.json(
        { error: "Gamma API call failed", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    const generationId = result.generationId;

    if (!generationId) {
      return NextResponse.json(
        { error: "No generationId received from Gamma API" },
        { status: 500 }
      );
    }

    // Poll for completion
    let status = "pending";
    let attempts = 0;

    while (status !== "completed" && attempts < 120) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;

      const pollResponse = await fetch(
        `https://public-api.gamma.app/v0.2/generations/${generationId}`,
        {
          headers: {
            "x-api-key": process.env.GAMMA_API_KEY || "",
          },
        }
      );

      if (!pollResponse.ok) continue;

      const pollData = await pollResponse.json();
      status = pollData.status;

      if (status === "completed") {
        return NextResponse.json({
          success: true,
          data: {
            generationId: pollData.generationId,
            gammaUrl: pollData.gammaUrl,
            exportUrl: pollData.exportUrl,
          },
        });
      }

      if (status === "failed") {
        return NextResponse.json(
          { error: "Course generation failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Course generation timed out" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("⚠️ Server-side error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
