/**
 * Skill Gap Analysis Flow
 * 
 * This flow fetches industries from the database and displays them
 * as a list for user selection in the skill gap analysis process.
 */

import { genkit } from 'genkit';
import { googleAIPlugin } from '../genkit.config.js';
import { z } from 'zod';

// Initialize genkit
const gk = genkit({
  plugins: [googleAIPlugin]
});

// Define output schema for industries (matches what UI expects)
const IndustriesOutputSchema = z.object({
  data: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    expectedProficiency: z.number().optional(), // Expected proficiency level (1-5)
  })),
  nextStep: z.string()
});

// --- Get Industries Tool ---
// Fetches list of industries from the API

/**
 * Get industries from the database API
 * Calls: https://hp.triz.co.in/table_data?table=s_industries&group_by=industries
 * Returns: Array of industries
 */
async function getIndustriesFromAPI() {
  try {
    console.log('[getIndustriesFromAPI] Fetching industries from database');

    const apiUrl = 'https://hp.triz.co.in/table_data?table=s_industries&group_by=industries';
    
    console.log('[getIndustriesFromAPI] API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('[getIndustriesFromAPI] Full API response:', JSON.stringify(result, null, 2));
    
    // Handle different response formats
    let industriesData = [];
    
    // Check if result is an array directly
    if (Array.isArray(result)) {
      industriesData = result;
    } else if (result.data && Array.isArray(result.data)) {
      industriesData = result.data;
    } else if (result.result && Array.isArray(result.result)) {
      industriesData = result.result;
    }
    
    console.log('[getIndustriesFromAPI] Industries data count:', industriesData.length);
    
    // Map API response to output schema (with UI-compatible field names)
    const industries = industriesData.map((item) => ({
      id: item.id || null,
      name: item.industries || item.industry_name || item.name || String(item),
    }));
    
    // Return in format expected by handler: { data: [...], nextStep: '...' }
    return {
      data: industries,
      nextStep: 'department'
    };

  } catch (error) {
    console.error('[getIndustriesFromAPI] Error fetching industries:', error);
    return { data: [], nextStep: 'industry' }; // Fail-safe
  }
}

/**
 * Get departments by industry from the database API
 * Calls: https://hp.triz.co.in/table_data?table=s_industries&filters[industries]=Design&group_by=department
 * Returns: Array of departments
 */
async function getDepartmentsByIndustryAPI(industry) {
  try {
    console.log(`[getDepartmentsByIndustryAPI] Fetching departments for industry: ${industry}`);

    const apiUrl = `https://hp.triz.co.in/table_data?table=s_industries&filters[industries]=${encodeURIComponent(industry)}&group_by=department`;
    
    console.log('[getDepartmentsByIndustryAPI] API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('[getDepartmentsByIndustryAPI] Full API response:', JSON.stringify(result, null, 2));
    
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
    
    console.log('[getDepartmentsByIndustryAPI] Departments data count:', departmentsData.length);
    
    // Map API response to output schema (with UI-compatible field names)
    const departments = departmentsData.map((item) => ({
      id: item.id || null,
      name: item.department || item.department_name || String(item),
    }));
    
    // Return in format expected by handler: { data: [...], nextStep: '...' }
    return {
      data: departments,
      nextStep: 'jobRole'
    };

  } catch (error) {
    console.error('[getDepartmentsByIndustryAPI] Error fetching departments:', error);
    return { data: [], nextStep: 'department' }; // Fail-safe
  }
}

/**
 * Get job roles by industry and department from the database API
 * Calls: https://hp.triz.co.in/table_data?table=s_user_jobrole&filters[industries]=Design&filters[department]=Design&filters[sub_institute_id]=3&group_by=jobrole
 * Returns: Array of job roles
 */
async function getJobRolesByIndustryAndDepartmentAPI(industry, department, sub_institute_id) {
  try {
    console.log(`[getJobRolesByIndustryAndDepartmentAPI] Fetching job roles for industry: ${industry}, department: ${department}, sub_institute_id: ${sub_institute_id}`);

    // Add sub_institute_id filter if provided
    const subInstituteIdParam = sub_institute_id ? `&filters[sub_institute_id]=${sub_institute_id}` : '';
    const apiUrl = `https://hp.triz.co.in/table_data?table=s_user_jobrole&filters[industries]=${encodeURIComponent(industry)}&filters[department]=${encodeURIComponent(department)}${subInstituteIdParam}&group_by=jobrole`;
    
    console.log('[getJobRolesByIndustryAndDepartmentAPI] API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('[getJobRolesByIndustryAndDepartmentAPI] Full API response:', JSON.stringify(result, null, 2));
    
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
    
    console.log('[getJobRolesByIndustryAndDepartmentAPI] Job roles data count:', jobRolesData.length);
    
    // Map API response to output schema (with UI-compatible field names)
    const jobRoles = jobRolesData.map((item) => ({
      id: item.id || null,
      name: item.jobrole || item.job_role || item.jobRoleName || String(item),
    }));
    
    // Return in format expected by handler: { data: [...], nextStep: '...' }
    return {
      data: jobRoles,
      nextStep: 'skills'
    };

  } catch (error) {
    console.error('[getJobRolesByIndustryAndDepartmentAPI] Error fetching job roles:', error);
    return { data: [], nextStep: 'jobRole' }; // Fail-safe
  }
}

/**
 * Get skills by job role from the database API
 * Calls: https://hp.triz.co.in/table_data?table=s_user_skill_jobrole&filters[jobrole]=Content%20Strategist&filters[sub_institute_id]=3&group_by=skill
 * Returns: Array of skills
 */
async function getSkillsByJobRoleAPI(jobRole, sub_institute_id) {
  try {
    console.log(`[getSkillsByJobRoleAPI] Fetching skills for job role: ${jobRole}, sub_institute_id: ${sub_institute_id}`);

    // Add sub_institute_id filter if provided
    const subInstituteIdParam = sub_institute_id ? `&filters[sub_institute_id]=${sub_institute_id}` : '';
    const apiUrl = `https://hp.triz.co.in/table_data?table=s_user_skill_jobrole&filters[jobrole]=${encodeURIComponent(jobRole)}${subInstituteIdParam}&group_by=skill`;
    
    console.log('[getSkillsByJobRoleAPI] API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('[getSkillsByJobRoleAPI] Full API response:', JSON.stringify(result, null, 2));
    
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
    
    console.log('[getSkillsByJobRoleAPI] Skills data count:', skillsData.length);
    
    // Map API response to output schema (with UI-compatible field names)
    // Include expected_proficiency if available in the API response
    const skills = skillsData.map((item) => ({
      id: item.id || null,
      name: item.skill || item.skillName || item.skill_name || String(item),
      expectedProficiency: item.expected_proficiency || item.proficiency_level || item.expectedProficiency || Math.floor(Math.random() * 3) + 2, // Default 2-4 if not provided
    }));
    
    // Return in format expected by handler: { data: [...], nextStep: 'rating_prompt' }
    // This will trigger the "Would you like to rate your skills?" prompt
    return {
      data: skills,
      nextStep: 'rating_prompt'
    };

  } catch (error) {
    console.error('[getSkillsByJobRoleAPI] Error fetching skills:', error);
    return { data: [], nextStep: 'skills' }; // Fail-safe
  }
}

/**
 * Genkit Flow to get industries for skill gap analysis
 * 
 * This flow:
 * 1. Calls the API to fetch industries
 * 2. Returns formatted list for user selection
 * 
 * The output displays: "Select your industry from the list below." + numbered list
 */
export const skillGapAnalysisFlow = gk.defineFlow(
  {
    name: 'skillGapAnalysisFlow',
    inputSchema: z.object({
      currentStep: z.string().optional(),
      industry: z.string().optional(),
      department: z.string().optional(),
      jobRole: z.string().optional(),
      sub_institute_id: z.string().optional()
    }),
    outputSchema: IndustriesOutputSchema
  },
  async (input) => {
    console.log('[skillGapAnalysisFlow] Started with input:', input);
    
    const currentStep = input?.currentStep || 'industry';
    
    try {
      // Fetch data based on current step
      const flowResult = await gk.run('fetch-data-for-step', async () => {
        
        if (currentStep === 'industry') {
          // Fetch industries from API
          const result = await getIndustriesFromAPI();
          console.log('[fetch-data-for-step] Got industries:', result.data?.length || 0);
          return result;
        }
        
        if (currentStep === 'department') {
          // Fetch departments for the selected industry
          const industry = input?.industry;
          if (!industry) {
            console.warn('[fetch-data-for-step] No industry provided for department step');
            return { data: [], nextStep: 'department' };
          }
          const result = await getDepartmentsByIndustryAPI(industry);
          console.log('[fetch-data-for-step] Got departments:', result.data?.length || 0);
          return result;
        }
        
        if (currentStep === 'jobRole') {
          // Fetch job roles for the selected industry and department
          const industry = input?.industry;
          const department = input?.department;
          const sub_institute_id = input?.sub_institute_id;
          if (!industry || !department) {
            console.warn('[fetch-data-for-step] No industry or department provided for job role step');
            console.warn('[fetch-data-for-step] Industry:', industry, 'Department:', department);
            return { data: [], nextStep: 'jobRole' };
          }
          const result = await getJobRolesByIndustryAndDepartmentAPI(industry, department, sub_institute_id);
          console.log('[fetch-data-for-step] Got job roles:', result.data?.length || 0);
          return result;
        }
        
        if (currentStep === 'skills') {
          // Fetch skills for the selected job role (with expected proficiency levels)
          const jobRole = input?.jobRole;
          const sub_institute_id = input?.sub_institute_id;
          if (!jobRole) {
            console.warn('[fetch-data-for-step] No job role provided for skills step');
            return { data: [], nextStep: 'skills' };
          }
          const result = await getSkillsByJobRoleAPI(jobRole, sub_institute_id);
          console.log('[fetch-data-for-step] Got skills:', result.data?.length || 0);
          return result;
        }
        
        // For rating_prompt step - return empty options (UI will show Yes/No buttons)
        if (currentStep === 'rating_prompt') {
          return {
            data: [],
            nextStep: 'skill_rating'
          };
        }
        
        // For skill_rating step - return the skills with their expected proficiency
        if (currentStep === 'skill_rating') {
          const jobRole = input?.jobRole;
          const sub_institute_id = input?.sub_institute_id;
          if (!jobRole) {
            return { data: [], nextStep: 'skill_rating' };
          }
          const result = await getSkillsByJobRoleAPI(jobRole, sub_institute_id);
          return { ...result, nextStep: 'complete' };
        }
        
        // For other steps, return empty for now
        return { data: [], nextStep: currentStep };
      });

      console.log('[skillGapAnalysisFlow] Completed successfully');
      return flowResult; // Already in { data: [...], nextStep: '...' } format
      
    } catch (error) {
      console.error('[skillGapAnalysisFlow] Error:', error);
      throw error;
    }
  }
);

export default gk;
