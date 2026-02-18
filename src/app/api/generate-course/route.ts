
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

    // Validate API key
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      console.error("❌ GAMMA_API_KEY not configured");
      return NextResponse.json(
        { error: "Gamma API key not configured. Please add GAMMA_API_KEY to your .env file." },
        { status: 500 }
      );
    }


    const requestData = {
      inputText: inputText,
      textMode: "generate",
      format: "presentation",
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
    console.log("📝 Content length:", inputText.length, "characters");

    // Initial request to Gamma API with retry
    let response;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        response = await fetch(
          "https://public-api.gamma.app/v1.0/generations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            body: JSON.stringify(requestData),
          }
        );
        break; // Success, exit retry loop
      } catch (fetchError: any) {
        retries++;
        console.error(`❌ Gamma API fetch error (attempt ${retries}/${maxRetries}):`, fetchError.message);
        if (retries >= maxRetries) {
          return NextResponse.json(
            { error: "Failed to connect to Gamma API. Please try again." },
            { status: 503 }
          );
        }
        await new Promise((r) => setTimeout(r, 2000)); // Wait before retry
      }
    }

    if (!response) {
      return NextResponse.json(
        { error: "Failed to connect to Gamma API" },
        { status: 503 }
      );
    }

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

    console.log("📋 Generation ID:", generationId);

    // Poll for completion with extended timeout (10 minutes max)
    // 180 attempts × 3 seconds = 540 seconds = 9 minutes
    let status = "pending";
    let attempts = 0;
    const maxAttempts = 180;
    const pollInterval = 3000; // 3 seconds between polls

    while (status !== "completed" && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, pollInterval));
      attempts++;

      if (attempts % 10 === 0) {
        console.log(`⏳ Polling Gamma API... attempt ${attempts}/${maxAttempts} (${Math.round(attempts * pollInterval / 1000)}s elapsed)`);
      }

      try {
        const pollResponse = await fetch(
          `https://public-api.gamma.app/v1.0/generations/${generationId}`,
          {
            headers: {
              "x-api-key": apiKey,
            },
          }
        );

        if (!pollResponse.ok) {
          console.warn(`⚠️ Poll request failed (attempt ${attempts}), continuing...`);
          continue;
        }

        const pollData = await pollResponse.json();
        status = pollData.status;

        if (status === "completed") {
          console.log("✅ Gamma generation completed successfully!");
          console.log("🔗 Gamma URL:", pollData.gammaUrl);
          console.log("📄 Export URL:", pollData.exportUrl);

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
          console.error("❌ Gamma generation failed:", pollData);
          return NextResponse.json(
            { error: "Course generation failed. The Gamma API encountered an error." },
            { status: 500 }
          );
        }

        // Log progress for other statuses
        if (status !== "pending" && attempts % 5 === 0) {
          console.log(`📊 Status: ${status}`);
        }

      } catch (pollError: any) {
        console.warn(`⚠️ Poll error (attempt ${attempts}):`, pollError.message);
        // Continue polling even if one request fails
        continue;
      }
    }

    // Timeout reached
    console.error(`❌ Gamma generation timed out after ${Math.round(attempts * pollInterval / 1000)} seconds`);
    return NextResponse.json(
      {
        error: "Course generation timed out. The presentation is still being generated. Please check your Gamma dashboard or try again with fewer slides.",
        generationId: generationId // Return ID so user can check manually
      },
      { status: 504 }
    );

  } catch (error: any) {
    console.error("⚠️ Server-side error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
