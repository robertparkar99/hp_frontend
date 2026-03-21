import { NextResponse } from "next/server";

/**
 * Get Skills by Job Role API
 * 
 * Fetches skills for a given job role from the database
 * 
 * Request body:
 * {
 *   jobRole: string
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
        const { jobRole, sub_institute_id } = body;

        if (!jobRole) {
            return NextResponse.json(
                { error: "Job role is required" },
                { status: 400 }
            );
        }

        console.log('[get-skills-by-job-role] Fetching skills for job role:', jobRole, 'sub_institute_id:', sub_institute_id);

        // Call the HP API to get skills by job role with sub_institute_id if provided
        const subInstituteIdParam = sub_institute_id ? `&filters[sub_institute_id]=${sub_institute_id}` : '';
        const apiUrl = `https://hp.triz.co.in/table_data?table=s_user_skill_jobrole&filters[jobrole]=${encodeURIComponent(jobRole)}${subInstituteIdParam}&group_by=skill`;
        
        console.log('[get-skills-by-job-role] API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('[get-skills-by-job-role] Full API response:', JSON.stringify(result, null, 2));
        
        // Handle different response formats
        let skillsData = [];
        
        // Check if result is an array directly
        if (Array.isArray(result)) {
            skillsData = result;
        } else if (result.data && Array.isArray(result.data)) {
            skillsData = result.data;
        } else if (result.result && Array.isArray(result.result)) {
            skillsData = result.result;
        }
        
        console.log('[get-skills-by-job-role] Skills data count:', skillsData.length);
        
        // Map API response to output schema (with UI-compatible field names)
        const skills = skillsData.map((item: any) => ({
            id: item.id || null,
            name: item.skill || item.skillName || item.skill_name || String(item),
        }));

        return NextResponse.json({
            data: skills,
            nextStep: 'skills'
        });
        
    } catch (error) {
        console.error("[get-skills-by-job-role] Error fetching skills:", error);
        return NextResponse.json(
            { error: "Failed to fetch skills", details: String(error) },
            { status: 500 }
        );
    }
}
