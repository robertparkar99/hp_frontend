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
        const { jobRole, jobRoleId, sub_institute_id } = body;

        if (!jobRole) {
            return NextResponse.json(
                { error: "Job role is required" },
                { status: 400 }
            );
        }

        console.log('[get-skills-by-job-role] Fetching skills for job role:', jobRole, 'jobRoleId:', jobRoleId, 'sub_institute_id:', sub_institute_id);

        let result: any;

        if (jobRoleId) {
            const kabaUrl = `https://hp.triz.co.in/get-kaba?sub_institute_id=${encodeURIComponent(String(sub_institute_id || ''))}&type=jobrole&type_id=${encodeURIComponent(String(jobRoleId))}&title=${encodeURIComponent(jobRole)}`;

            console.log('[get-skills-by-job-role] KABA API URL:', kabaUrl);

            const response = await fetch(kabaUrl);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            result = await response.json();
        } else {
            const subInstituteIdParam = sub_institute_id ? `&filters[sub_institute_id]=${sub_institute_id}` : '';
            const apiUrl = `https://hp.triz.co.in/table_data?table=s_user_skill_jobrole&filters[jobrole]=${encodeURIComponent(jobRole)}${subInstituteIdParam}&group_by=skill`;

            console.log('[get-skills-by-job-role] Fallback API URL:', apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            result = await response.json();
        }

        console.log('[get-skills-by-job-role] Full API response:', JSON.stringify(result, null, 2));

        let skillsData = [];

        if (Array.isArray(result)) {
            skillsData = result;
        } else if (result.data && Array.isArray(result.data)) {
            skillsData = result.data;
        } else if (result.result && Array.isArray(result.result)) {
            skillsData = result.result;
        } else if (result.skill && Array.isArray(result.skill)) {
            skillsData = result.skill;
        } else if (result.skills && Array.isArray(result.skills)) {
            skillsData = result.skills;
        }

        console.log('[get-skills-by-job-role] Skills data count:', skillsData.length);

        const skills = skillsData.map((item: any) => ({
            id: item.id || item.skill_id || item.jobrole_skill_id || null,
            name: item.title || item.skill || item.skillName || item.skill_name || String(item),
            category: item.category || item.Category || item.skill_category || '',
            subCategory: item.sub_category || item.subCategory || item.sub_category_name || '',
            description: item.description || item.Description || item.skill_description || '',
            proficiencyLevel: parseInt(item.proficiency_level, 10) || item.proficiencyLevel || item.expected_proficiency || 3
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
