import { handleChatRequest } from '../../api-handler';
export const dynamic = "force-dynamic";

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

// OPTIONS handler (browser preflight by AJ)
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
        
        // Get user session data from request body first (sent by client from localStorage)
        // Fall back to cookies if not provided in body
        let userId = body.userId || null;
        let subInstituteId = body.subInstituteId || null;
        
        // If not in body, try to get from cookies as fallback
        const cookieHeader = request.headers.get('cookie') || '';
        
        // Parse userData from cookie
        const userDataMatch = cookieHeader.match(/userData=([^;]+)/);
        if (userDataMatch) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataMatch[1]));
                // Only use cookie values if body values are null
                userId = userId || userData.user_id || null;
                subInstituteId = subInstituteId || userData.sub_institute_id || null;
            } catch (e) {
                console.error('[chat] Error parsing userData cookie:', e);
            }
        }
        
        console.log('[chat] Received userId:', userId, 'subInstituteId:', subInstituteId);

        let result: any = null;

        try {
            result = await handleChatRequest({
                query: body.query,
                sessionId: body.sessionId,
                conversationHistory: body.conversationHistory,
                userId: userId,
                subInstituteId: subInstituteId
            });

        } catch (innerError) {
            console.error("[handleChatRequest ERROR]:", innerError);

            result = {
                answer: "I ran into an issue, but I'm still here — try asking in simpler words!",
                error: innerError instanceof Error ? innerError.message : "Unknown internal error",
                insights: "POST fallback"
            };
        }

        // 🔥 FORCE conversion-safe JSON
        return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders()
            }
        });

    } catch (outerError) {
        console.error("[POST ERROR]:", outerError);

        return new Response(
            JSON.stringify(
                {
                    answer: "Something went wrong reading your request.",
                    error: outerError instanceof Error ? outerError.message : "Unknown POST error",
                    insights: "POST-level catch"
                },
                null,
                2
            ),
            {
                status: 200, // important!
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders()
                }
            }
        );
    }
}
