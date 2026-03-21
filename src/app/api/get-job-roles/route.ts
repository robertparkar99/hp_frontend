import { NextResponse } from "next/server";

/**
 * Get Job Roles by Industry and Department API
 * 
 * Fetches job roles for a given industry and department from the database
 * 
 * Request body:
 * {
 *   industry: string,
 *   department: string
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
        const { industry, department, sub_institute_id } = body;

        if (!industry) {
            return NextResponse.json(
                { error: "Industry is required" },
                { status: 400 }
            );
        }

        if (!department) {
            return NextResponse.json(
                { error: "Department is required" },
                { status: 400 }
            );
        }

        console.log('[get-job-roles] Fetching job roles for industry:', industry, 'department:', department, 'sub_institute_id:', sub_institute_id);

        // Call the HP API to get job roles by industry and department
        // Include sub_institute_id if provided in request body
        const subInstituteIdParam = sub_institute_id ? `&filters[sub_institute_id]=${sub_institute_id}` : '1';
        const apiUrl = `https://hp.triz.co.in/table_data?table=s_user_jobrole&filters[industries]=${encodeURIComponent(industry)}&filters[department]=${encodeURIComponent(department)}${subInstituteIdParam}&group_by=jobrole`;
        
        console.log('[get-job-roles] API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('[get-job-roles] Full API response:', JSON.stringify(result, null, 2));
        
        // Handle different response formats
        let jobRolesData = [];
        
        // Check if result is an array directly
        if (Array.isArray(result)) {
            jobRolesData = result;
        } else if (result.data && Array.isArray(result.data)) {
            jobRolesData = result.data;
        } else if (result.result && Array.isArray(result.result)) {
            jobRolesData = result.result;
        }
        
        console.log('[get-job-roles] Job roles data count:', jobRolesData.length);
        
        // Map API response to output schema (with UI-compatible field names)
        const jobRoles = jobRolesData.map((item: any) => ({
            id: item.id || null,
            name: item.jobrole || item.job_role || item.jobRoleName || String(item),
        }));

        return NextResponse.json({
            data: jobRoles,
            nextStep: 'jobRole'
        });
        
    } catch (error) {
        console.error("[get-job-roles] Error fetching job roles:", error);
        return NextResponse.json(
            { error: "Failed to fetch job roles", details: String(error) },
            { status: 500 }
        );
    }
}
