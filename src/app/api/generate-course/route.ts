import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Parse input from frontend
        const { inputText } = await req.json();

        if (!inputText) {
            return NextResponse.json(
                { error: "inputText is required" },
                { status: 400 }
            );
        }

        // Prepare request payload for Gamma API
        const requestData = {
            inputText: inputText,
            textMode: "generate",
            format: "presentation",
            themeName: "Oasis",
            numCards: 10,
            cardSplit: "auto",
            additionalInstructions: "All slides must use clear, consistent formatting. Ensure a formal instructional tone.",
            exportAs: "pdf",
            textOptions: {
                amount: "extensive",
                tone: "formal, instructional",
                audience: "employees, L&D managers, HR",
                language: "en"
            },
            imageOptions: {
                source: "aiGenerated",
                model: "imagen-4-pro",
                style: "minimal, professional"
            },
            cardOptions: {
                dimensions: "fluid"
            },
            sharingOptions: {
                workspaceAccess: "view",
                externalAccess: "noAccess"
            }
        };

        console.log("🚀 Sending request to Gamma API for course generation");

        // Call Gamma API
        const response = await fetch(
            "https://public-api.gamma.app/v0.2/generations",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.GAMMA_API_KEY || ""
                },
                body: JSON.stringify(requestData),
            }
        );

        // Handle errors from Gamma API
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Gamma API Error:", errorText);

            return NextResponse.json(
                {
                    error: `Gamma API call failed (${response.status})`,
                    details: errorText,
                },
                { status: response.status }
            );
        }

        // Parse result
        const result = await response.json();

        console.log("✅ Course generation initiated via Gamma API");

        const generationId = result.generationId;
        if (!generationId) {
            return NextResponse.json(
                { error: "No generationId received from Gamma API" },
                { status: 500 }
            );
        }

        // Poll for completion
        let status = 'pending';
        let attempts = 0;
        const maxAttempts = 120; // 120 seconds max (2 minutes)
        const pollInterval = 2000; // 2 seconds

        while (status !== 'completed' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            attempts++;

            try {
                const pollResponse = await fetch(
                    `https://public-api.gamma.app/v0.2/generations/${generationId}`,
                    {
                        method: "GET",
                        headers: {
                            "x-api-key": process.env.GAMMA_API_KEY || ""
                        },
                    }
                );

                if (!pollResponse.ok) {
                    console.error("❌ Poll request failed:", pollResponse.status);
                    continue;
                }

                const pollData = await pollResponse.json();
                status = pollData.status;
                console.log(`🔄 Generation status: ${status} (attempt ${attempts})`);

                if (status === 'completed') {
                    console.log("✅ Generation completed");
                    return NextResponse.json({
                        success: true,
                        data: {
                            generationId: pollData.generationId,
                            gammaUrl: pollData.gammaUrl,
                            exportUrl: pollData.exportUrl
                        }
                    });
                } else if (status === 'failed') {
                    console.error("❌ Generation failed");
                    return NextResponse.json(
                        { error: "Course generation failed" },
                        { status: 500 }
                    );
                }
                // If pending or processing, continue polling
            } catch (pollError) {
                console.error("❌ Poll error:", pollError);
                // Continue polling
            }
        }

        // Timeout
        return NextResponse.json(
            { error: "Course generation timed out" },
            { status: 500 }
        );
    } catch (error: any) {
        console.error("⚠️ Server-side course generation error:", error);

        return NextResponse.json(
            {
                error:
                    error.message ||
                    "Internal server error during course generation.",
            },
            { status: 500 }
        );
    }
}