import { NextResponse } from "next/server";

/**
 * Get Departments by Industry API
 * 
 * Fetches departments for a given industry from the database
 * 
 * Request body:
 * {
 *   industry: string
 * }
 * 
 * Response:
 * {
 *   data: Array<{ id: number, name: string }>,
 *   nextStep: string
 * }
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { industry } = body;

        if (!industry) {
            return NextResponse.json(
                { error: "Industry is required" },
                { status: 400 }
            );
        }

        console.log('[get-departments] Fetching departments for industry:', industry);

        // Call the HP API to get departments by industry
        const apiUrl = `https://hp.triz.co.in/table_data?table=s_industries&filters[industries]=${encodeURIComponent(industry)}&group_by=department`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('[get-departments] Full API response:', JSON.stringify(result, null, 2));
        
        // Handle different response formats
        let departmentsData = [];
        
        // Check if result is an array directly
        if (Array.isArray(result)) {
            departmentsData = result;
        } else if (result.data && Array.isArray(result.data)) {
            departmentsData = result.data;
        } else if (result.result && Array.isArray(result.result)) {
            departmentsData = result.result;
        }
        
        console.log('[get-departments] Departments data count:', departmentsData.length);
        
        // Map API response to output schema (with UI-compatible field names)
        const departments = departmentsData.map((item: any) => ({
            id: item.id || null,
            name: item.department || item.department_name || String(item),
        }));

        return NextResponse.json({
            data: departments,
            nextStep: 'department'
        });
        
    } catch (error) {
        console.error("[get-departments] Error fetching departments:", error);
        return NextResponse.json(
            { error: "Failed to fetch departments", details: String(error) },
            { status: 500 }
        );
    }
}
