import { handleContextualSuggestions } from '../../api-handler';
export const dynamic = "force-dynamic";

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

// OPTIONS handler (browser preflight)
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            ...corsHeaders(),
        },
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { module, context } = body;

        if (!module) {
            return new Response(JSON.stringify({
                error: 'Module is required',
                suggestions: []
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders()
                }
            });
        }

        const result = await handleContextualSuggestions({
            module,
            context
        });

        return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders()
            }
        });

    } catch (error) {
        console.error("[SUGGESTIONS API ERROR]:", error);

        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
            suggestions: []
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders()
            }
        });
    }
}
