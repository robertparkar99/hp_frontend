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

        // Declare variables for job role and job role ID
        let jobRole: string | null = null;
        let jobRoleId: string | null = null;

        // Check if this is a "Select my department as X" or "Select my department in X industry" pattern
        const rawQuery = body.query || '';
        const departmentPattern = /^select my department\s+(?:as\s+|in\s+)?(.+?)(?:\s+industry)?$/i;
        const departmentMatch = rawQuery.match(departmentPattern);
        
        // Check if this is a "Selected Industry as X" pattern (new format from frontend)
        const selectedIndustryPattern = /^selected industry\s+as\s+(.+)$/i;
        const selectedIndustryMatch = rawQuery.match(selectedIndustryPattern);
        
        // Check if user selected a department (e.g., "selected department: design" or "department: design")
        const selectedDeptPattern = /^(?:selected )?department[:\s]+(.+)$/i;
        const selectedDeptMatch = rawQuery.match(selectedDeptPattern);
        
        // Check if this is a "Select my job role as X" or "Select my job role in X department" pattern
        const jobRolePattern = /^select (?:my )?job role\s+(?:as\s+|in\s+)?(.+?)(?:\s+department)?$/i;
        const jobRoleMatch = rawQuery.match(jobRolePattern);
        
        // Check if this is a "Select my skills for X" or "select my jobrole as X" pattern
        // This directly calls the skills API after job role is selected
        const skillsPattern = /^(?:select\s+(?:my\s+)?)?(?:skills\s+for|jobrole\s+as)\s+(.+)$/i;
        const skillsMatch = rawQuery.match(skillsPattern);
        
        if (departmentMatch && departmentMatch[1]) {
            // Extract industry name from the query
            const industry = departmentMatch[1].trim();
            console.log('[chat] Detected department selection pattern, industry:', industry);
            
            try {
                // Call get-departments API
                const deptResponse = await fetch(new URL('/api/get-departments', request.url).toString(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ industry })
                });
                
                if (!deptResponse.ok) {
                    throw new Error('Failed to fetch departments');
                }
                
                const deptData = await deptResponse.json();
                console.log('[chat] get-departments response:', deptData);
                
                result = {
                    answer: `Select your department in ${industry} from the list below:`,
                    selectionOptions: deptData.data || [],
                    currentStep: 'department',
                    nextStep: 'department',
                    action: 'SHOW_SKILL_GAP_OPTIONS'
                };
            } catch (deptError) {
                console.error('[chat] Error fetching departments:', deptError);
                result = {
                    answer: "Sorry, I couldn't fetch the departments. Please try again.",
                    error: String(deptError)
                };
            }
        } else if (selectedIndustryMatch && selectedIndustryMatch[1]) {
            // Handle "Selected Industry as X" pattern (new format from frontend)
            const industry = selectedIndustryMatch[1].trim();
            console.log('[chat] Detected selected industry pattern, industry:', industry);
            
            try {
                // Call get-departments API
                const deptResponse = await fetch(new URL('/api/get-departments', request.url).toString(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ industry })
                });
                
                if (!deptResponse.ok) {
                    throw new Error('Failed to fetch departments');
                }
                
                const deptData = await deptResponse.json();
                console.log('[chat] get-departments response:', deptData);
                
                result = {
                    answer: `Select your department in ${industry} from the list below:`,
                    selectionOptions: deptData.data || [],
                    currentStep: 'department',
                    nextStep: 'department',
                    action: 'SHOW_SKILL_GAP_OPTIONS'
                };
            } catch (deptError) {
                console.error('[chat] Error fetching departments:', deptError);
                result = {
                    answer: "Sorry, I couldn't fetch the departments. Please try again.",
                    error: String(deptError)
                };
            }
        } else if (selectedDeptMatch && selectedDeptMatch[1]) {
            // User selected a department - call skill-gap-analysis to get job roles
            const department = selectedDeptMatch[1].trim();
            console.log('[chat] Detected selected department pattern, department:', department);
            console.log('[chat] Full request body:', JSON.stringify(body, null, 2));
            
            // Try to get industry from multiple sources:
            // 1. formData in request body (preferred - comes from frontend state)
            // 2. metadata in last bot message
            // 3. conversationHistory - look for industry in bot messages like "Select your department in X from the list below"
            let industry = body.formData?.industry || '';
            
            // If not in formData, try to find industry from metadata or conversation history
            if (!industry && body.conversationHistory && body.conversationHistory.length > 0) {
                // Look at all messages to find industry
                const allMessages = body.conversationHistory;
                for (const msg of allMessages) {
                    // Check bot messages for industry in the answer text like "Select your department in Healthcare"
                    if (msg.role === 'assistant' && msg.content) {
                        // Match "in X industry" or "in X from the list" patterns
                        const industryMatch = msg.content.match(/(?:in|for)\s+([A-Za-z]+)\s+(?:industry|department)/i);
                        if (industryMatch && industryMatch[1]) {
                            industry = industryMatch[1].trim();
                            // Capitalize first letter
                            industry = industry.charAt(0).toUpperCase() + industry.slice(1);
                            break;
                        }
                        // Also check for "Select your department in X" pattern
                        const deptIndustryMatch = msg.content.match(/Select your department in ([A-Za-z]+)/i);
                        if (deptIndustryMatch && deptIndustryMatch[1]) {
                            industry = deptIndustryMatch[1].trim();
                            industry = industry.charAt(0).toUpperCase() + industry.slice(1);
                            break;
                        }
                    }
                    // Check for metadata in bot messages
                    if (msg.role === 'assistant' && msg.metadata?.industry) {
                        industry = msg.metadata.industry;
                        break;
                    }
                }
            }
            
            // Get sub_institute_id from the request body
            const subInstituteId = body.subInstituteId || '';
            console.log('[chat] Using industry:', industry, 'for department:', department, 'subInstituteId:', subInstituteId);
          
            // If no industry provided, we can't get job roles
            if (!industry) {
                result = {
                    answer: `Please select an industry first, then you can select the department "${department}".`,
                    currentStep: 'department',
                    action: 'ASK_INDUSTRY'
                };
            } else {
                console.log('[chat] Using industry:', industry, 'for department:', department, 'subInstituteId:', subInstituteId);
                try {
                    // Call skill-gap-analysis API to get job roles
                    const skillGapResponse = await fetch(new URL('/api/skill-gap-analysis', request.url).toString(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            currentStep: 'jobRole',
                            industry: industry,
                            department: department,
                            sub_institute_id: subInstituteId
                        })
                    });
                    
                    if (!skillGapResponse.ok) {
                        throw new Error('Failed to fetch job roles');
                    }
                    
                    const skillGapData = await skillGapResponse.json();
                    console.log('[chat] skill-gap-analysis (job roles) response:', skillGapData);
                    
                    result = {
                        answer: `You selected ${department} department in ${industry} industry. Select your job role:`,
                        selectionOptions: skillGapData.data || [],
                        currentStep: 'jobRole',
                        nextStep: 'jobRole',
                        action: 'SHOW_SKILL_GAP_OPTIONS'
                    };
                } catch (skillGapError) {
                    console.error('[chat] Error fetching job roles 222:', skillGapError);
                    result = {
                        answer: "Sorry, I couldn't fetch the job roles. Please try again.",
                        error: String(skillGapError)
                    };
                }
            }
        } else if (jobRoleMatch && jobRoleMatch[1]) {
            // Extract department name from the query
            const department = jobRoleMatch[1].trim();
            console.log('[chat] Detected job role selection pattern, department:', department);
            
            // Try to get industry from multiple sources:
            // 1. formData in request body (preferred - comes from frontend state)
            // 2. metadata in last bot message
            // 3. conversationHistory - look for industry in bot messages like "Select your job role in X"
            let industry = body.formData?.industry || '';
            
            // If not in formData, try to find industry from metadata or conversation history
            if (!industry && body.conversationHistory && body.conversationHistory.length > 0) {
                // Look at all messages to find industry
                const allMessages = body.conversationHistory;
                for (const msg of allMessages) {
                    // Check bot messages for industry in the answer text
                    if (msg.role === 'assistant' && msg.content) {
                        // Match patterns like "Select your department in Healthcare" or "in Healthcare industry"
                        const deptIndustryMatch = msg.content.match(/Select your department in ([A-Za-z]+)/i);
                        if (deptIndustryMatch && deptIndustryMatch[1]) {
                            industry = deptIndustryMatch[1].trim();
                            industry = industry.charAt(0).toUpperCase() + industry.slice(1);
                            break;
                        }
                        // Also check for "in X industry" pattern
                        const industryMatch = msg.content.match(/(?:in|for)\s+([A-Za-z]+)\s+(?:industry|department)/i);
                        if (industryMatch && industryMatch[1]) {
                            industry = industryMatch[1].trim();
                            industry = industry.charAt(0).toUpperCase() + industry.slice(1);
                            break;
                        }
                    }
                    // Check for metadata in bot messages
                    if (msg.role === 'assistant' && msg.metadata?.industry) {
                        industry = msg.metadata.industry;
                        break;
                    }
                }
            }
            
            // Get sub_institute_id from the request body
            const subInstituteId = body.subInstituteId || '';
            
            // If no industry found, we need to ask for it
            if (!industry) {
                result = {
                    answer: `Please provide the industry first to get job roles for ${department}. For example, "select my department as ${department} in IT industry".`,
                    currentStep: 'jobRole',
                    action: 'ASK_INDUSTRY'
                };
            } else {
                console.log('[chat] Using industry:', industry, 'for department:', department, 'subInstituteId:', subInstituteId);
                try {
                    // Call get-job-roles API with industry, department and sub_institute_id
                    const jobRoleResponse = await fetch(new URL('/api/get-job-roles', request.url).toString(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ industry, department, sub_institute_id: subInstituteId })
                    });
                    
                    if (!jobRoleResponse.ok) {
                        throw new Error('Failed to fetch job roles');
                    }
                    
                    const jobRoleData = await jobRoleResponse.json();
                    console.log('[chat] get-job-roles response:', jobRoleData);
                    
                    result = {
                        answer: `Select your job role in ${department} from the list below:`,
                        selectionOptions: jobRoleData.data || [],
                        currentStep: 'jobRole',
                        nextStep: 'jobRole',
                        action: 'SHOW_SKILL_GAP_OPTIONS'
                    };
                } catch (jobRoleError) {
                    console.error('[chat] Error fetching job roles:', jobRoleError);
                    result = {
                        answer: "Sorry, I couldn't fetch the job roles. Please try again.",
                        error: String(jobRoleError)
                    };
                }
            }
        } else if (skillsMatch && skillsMatch[1]) {
            // User wants to select skills for a specific job role
            // Direct pattern: "select my skills for Content Strategist" or "select my jobrole as Content Strategist"
            // Pattern match: skillsMatch[1] contains the job role name (e.g., "Content Strategist")
            jobRole = skillsMatch[1].trim();
            console.log('[chat] Detected skills selection pattern, jobRole:', jobRole);
            
            // Get sub_institute_id from the request body
            const subInstituteId = body.subInstituteId || '';
            
            // Try to get job role ID by searching job roles in the database
            // This is needed because the get-kaba API requires type_id (job role ID)
            // We search the s_user_jobrole table for a matching job role name
            // If found, we get the job role ID which will be passed to the frontend
            // and used in the get-kaba API call as type_id parameter
            if (jobRole) {
                try {
                    // Search for job role by name in s_user_jobrole table with sub_institute_id
                    const subInstituteIdParam = subInstituteId ? `&filters[sub_institute_id]=${subInstituteId}` : '';
                    const jobRoleSearchUrl = `https://hp.triz.co.in/table_data?table=s_user_jobrole&filters[jobrole]=${encodeURIComponent(jobRole)}${subInstituteIdParam}`;
                    
                    const jobRoleSearchResponse = await fetch(jobRoleSearchUrl);
                    if (jobRoleSearchResponse.ok) {
                        const jobRoleSearchData = await jobRoleSearchResponse.json();
                        console.log('[chat] Job role search response:', jobRoleSearchData);
                        
                        // Find the matching job role
                        let jobRolesArray = [];
                        if (Array.isArray(jobRoleSearchData)) {
                            jobRolesArray = jobRoleSearchData;
                        } else if (jobRoleSearchData.data) {
                            jobRolesArray = jobRoleSearchData.data;
                        } else if (jobRoleSearchData.result) {
                            jobRolesArray = jobRoleSearchData.result;
                        }
                        
                        // Find the job role with matching name
                        const normalizedJobRole = jobRole.toLowerCase();
                        const matchedJobRole = jobRolesArray.find((jr: any) => {
                            const candidate = (jr.jobrole || jr.jobRole || jr.job_role || '').toLowerCase();
                            return candidate === normalizedJobRole;
                        });
                        
                        if (matchedJobRole && matchedJobRole.id) {
                            jobRoleId = String(matchedJobRole.id);
                            console.log('[chat] Found job role ID:', jobRoleId);
                        }
                    }
                } catch (jobRoleSearchError) {
                    console.error('[chat] Error searching for job role:', jobRoleSearchError);
                    // Continue without job role ID - the API might still work with just the name
                }
            }
            
            try {
                // Call get-skills-by-job-role API directly with sub_institute_id
                const skillsResponse = await fetch(new URL('/api/get-skills-by-job-role', request.url).toString(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobRole, jobRoleId, sub_institute_id: subInstituteId })
                });
                
                if (!skillsResponse.ok) {
                    throw new Error('Failed to fetch skills');
                }
                
                const skillsData = await skillsResponse.json();
                console.log('[chat] get-skills-by-job-role response:', skillsData);
                
                result = {
                    answer: `Select your skills for ${jobRole}:`,
                    selectionOptions: skillsData.data || [],
                    currentStep: 'skills',
                    nextStep: 'skills',
                    action: 'SHOW_SKILL_GAP_OPTIONS',
                    // Include job role info in metadata for frontend to store
                    metadata: {
                        jobRole: jobRole,
                        jobRoleId: jobRoleId
                    }
                };
            } catch (skillsError) {
                console.error('[chat] Error fetching skills:', skillsError);
                result = {
                    answer: "Sorry, I couldn't fetch the skills. Please try again.",
                    error: String(skillsError)
                };
            }
        } else {
            // Normal chat flow
            try {
                result = await handleChatRequest({
                    query: body.query,
                    sessionId: body.sessionId,
                    conversationHistory: body.conversationHistory,
                    userId: userId,
                    subInstituteId: subInstituteId,
                    selectedJobRole: jobRole || undefined,
                    selectedjobRoleId: jobRoleId || undefined
                });

            } catch (innerError) {
                console.error("[handleChatRequest ERROR]:", innerError);

                result = {
                    answer: "I ran into an issue, but I'm still here — try asking in simpler words!",
                    error: innerError instanceof Error ? innerError.message : "Unknown internal error",
                    insights: "POST fallback"
                };
            }
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
