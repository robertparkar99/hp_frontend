import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Parse input from frontend - support both formats
        const body = await req.json();

        // Detect format: simple (cfg, industry) vs advanced (jsonObject)
        const isAdvancedFormat = 'jsonObject' in body;

        let genkitInput: any;

        if (isAdvancedFormat) {
            // Advanced format from ConfigurationModal (jsonObject)
            const { jsonObject, modality, aiModel, mappingType, mappingValue, mappingTypeName, mappingValueName, mappingReason, industry } = body;

            // Extract skill if present
            const selectedSkill = jsonObject?.selectedSkill || jsonObject?.selected_skill ||
                (Array.isArray(jsonObject?.selectedSkills) ? jsonObject.selectedSkills[0] : null);

            // Parse KAAB items
            const parseKaab = (items: any[]) => {
                if (!Array.isArray(items)) return [];
                return items.filter(item => item != null).map(item => ({
                    title: item.title || item.name || item.value || 'Untitled',
                    category: item.category || item.type || '',
                    subCategory: item.subCategory || item.subType || '',
                }));
            };

            genkitInput = {
                industry: industry || jsonObject?.industry || '-',
                department: jsonObject?.department || '-',
                jobRole: jsonObject?.jobrole || jsonObject?.jobRole || '-',
                modality: modality || {},
                tasks: Array.isArray(jsonObject?.key_tasks) ? jsonObject.key_tasks :
                    (jsonObject?.key_tasks ? [jsonObject.key_tasks] : []),
                criticalWorkFunction: jsonObject?.critical_work_function || '-',
                slideCount: jsonObject?.slideCount || 10,

                // Skill-based fields
                selectedSkill: selectedSkill ? {
                    skillName: selectedSkill.skillName || selectedSkill.SkillName || selectedSkill.name || '',
                    description: selectedSkill.description || selectedSkill.Description || '',
                    proficiency_level: selectedSkill.proficiency_level || selectedSkill.proficiency || '',
                    category: selectedSkill.category || '',
                    sub_category: selectedSkill.sub_category || selectedSkill.subCategory || '',
                } : undefined,

                // KAAB competencies
                knowledge: parseKaab(jsonObject?.knowledge),
                ability: parseKaab(jsonObject?.ability),
                attitude: parseKaab(jsonObject?.attitude),
                behaviour: parseKaab(jsonObject?.behaviour),

                // Mapping/Pedagogical approach
                mappingType: mappingTypeName || mappingType || '',
                mappingValue: mappingValueName || mappingValue || '',
                mappingReason: mappingReason || '',
            };

            console.log("🚀 Calling Genkit buildWithAIFlow (advanced format):", {
                industry: genkitInput.industry,
                jobRole: genkitInput.jobRole,
                slideCount: genkitInput.slideCount,
                hasSkill: !!genkitInput.selectedSkill?.skillName,
                kaabCounts: {
                    knowledge: genkitInput.knowledge.length,
                    ability: genkitInput.ability.length,
                    attitude: genkitInput.attitude.length,
                    behaviour: genkitInput.behaviour.length,
                },
                mappingValue: genkitInput.mappingValue,
                timestamp: new Date().toISOString(),
            });
        } else {
            // Simple format (cfg, industry, aiModel)
            const { cfg, industry, aiModel } = body;

            // Validate required inputs
            if (!cfg || !cfg.department || !cfg.jobRole) {
                return NextResponse.json(
                    { error: "Missing required fields: department and jobRole are required" },
                    { status: 400 }
                );
            }

            genkitInput = {
                industry: industry || '-',
                department: cfg.department || '-',
                jobRole: cfg.jobRole || '-',
                modality: cfg.modality || {},
                tasks: cfg.tasks || [],
                criticalWorkFunction: cfg.criticalWorkFunction || '-',
                slideCount: cfg.slideCount || 10,
            };

            console.log("🚀 Calling Genkit buildWithAIFlow (simple format):", {
                industry: genkitInput.industry,
                department: genkitInput.department,
                jobRole: genkitInput.jobRole,
                timestamp: new Date().toISOString(),
            });
        }

        // Health check: Verify Genkit server is reachable
        const healthCheckController = new AbortController();
        const healthCheckTimeout = setTimeout(() => healthCheckController.abort(), 2000);

        try {
            const healthCheck = await fetch("http://localhost:3400/", {
                signal: healthCheckController.signal,
            });
            clearTimeout(healthCheckTimeout);

            // Genkit returns 404 for root path (Cannot GET /), which is fine - it means server is up
            // We only care if the connection completely fails (caught by catch block)
            if (!healthCheck.ok && healthCheck.status !== 404) {
                console.error(`❌ Genkit server health check failed with status: ${healthCheck.status}`);
                return NextResponse.json(
                    {
                        error: "AI service is currently unavailable. Please try again later.",
                        details: `Genkit server responded with status ${healthCheck.status}`
                    },
                    { status: 503 }
                );
            }
        } catch (healthError) {
            clearTimeout(healthCheckTimeout);
            console.error("❌ Genkit server is not reachable:", healthError);
            return NextResponse.json(
                {
                    error: "AI service is currently unavailable. Please ensure the Genkit server is running on port 3400.",
                    details: "Cannot connect to Genkit server"
                },
                { status: 503 }
            );
        }

        // Call Genkit flow with timeout (60 seconds for complex prompts)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        let genkitResponse;
        try {
            genkitResponse = await fetch("http://localhost:3400/buildWithAIFlow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: genkitInput }),
                signal: controller.signal,
            });
        } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                console.error("❌ Genkit flow timeout after 60 seconds");
                return NextResponse.json(
                    {
                        error: "Request timeout. The AI is taking too long to respond. Please try again.",
                        details: "Flow execution exceeded 60 seconds"
                    },
                    { status: 504 }
                );
            }

            console.error("❌ Network error calling Genkit flow:", fetchError);
            return NextResponse.json(
                {
                    error: "Network error communicating with AI service. Please try again.",
                    details: fetchError.message
                },
                { status: 503 }
            );
        }

        clearTimeout(timeoutId);

        // Handle errors from Genkit flow
        if (!genkitResponse.ok) {
            const errorText = await genkitResponse.text();
            console.error("❌ Genkit Flow Error:", {
                status: genkitResponse.status,
                error: errorText,
                timestamp: new Date().toISOString(),
            });

            return NextResponse.json(
                {
                    error: "Failed to generate course outline. Please try again.",
                    details: `Genkit flow returned status ${genkitResponse.status}`
                },
                { status: genkitResponse.status }
            );
        }

        // Parse result from Genkit
        const genkitResult = await genkitResponse.json();
        const generatedContent = genkitResult.result?.content || genkitResult.content;

        if (!generatedContent) {
            console.error("❌ Empty content from Genkit:", genkitResult);
            return NextResponse.json(
                {
                    error: "No content generated. Please try again with different inputs.",
                    details: "Genkit flow returned empty content"
                },
                { status: 500 }
            );
        }

        // Validate content quality
        if (generatedContent.length < 100) {
            console.warn("⚠️ Generated content is suspiciously short:", generatedContent.length);
        }

        console.log("✅ Genkit flow completed successfully:", {
            contentLength: generatedContent.length,
            model: "googleai/gemini-2.5-flash",
            slideCount: genkitInput.slideCount,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            model: "googleai/gemini-2.5-flash",
            content: generatedContent,
        });

    } catch (error: any) {
        console.error("⚠️ Server-side course generation error:", {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
            {
                error: "An unexpected error occurred. Please try again.",
                details: error.message || "Internal server error during course generation."
            },
            { status: 500 }
        );
    }
}
