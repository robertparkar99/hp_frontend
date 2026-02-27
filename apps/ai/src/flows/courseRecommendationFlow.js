/**
 * Course Recommendation Flow
 * 
 * This flow recommends courses based on what peers (users with the same allocated_standards/job role)
 * are enrolled in. It uses a single unified API call to get all data at once.
 */

import { genkit } from 'genkit';
import { googleAIPlugin } from '../genkit.config.js';
import { z } from 'zod';

// Initialize genkit
const gk = genkit({
  plugins: [googleAIPlugin]
});

// Define input schema for the flow
const CourseRecommendationInputSchema = z.object({
  userId: z.union([z.string(), z.number()]),
  subInstituteId: z.union([z.string(), z.number()]),
  appUrl: z.string().optional(),
  token: z.string().optional(),
  orgType: z.string().optional()
});

// Define output schema
const CourseRecommendationOutputSchema = z.array(z.object({
  courseName: z.string(),
  courseId: z.union([z.string(), z.number()]),
  courseDescription: z.string(),
  courseLink: z.string(),
  reasonForRecommendation: z.string()
}));

// --- Unified Course Recommendation Tool ---
// This single tool calls the unified API that returns all data together

/**
 * Get course recommendations from unified API
 * Calls: https://hp.triz.co.in/courses-recommendation?sub_institute_id=XXX&user_id=YYY
 * Returns: { success, message, data: [{ id, name, similar_users, course_id, created_course_user, display_name }] }
 * 
 *ontaining success, message, and data array
 */
async function getCourseRecommendationData(userId, subInstituteId) {
  try {
    // Validate inputs
    if (!userId || !subInstituteId) {
      throw new Error('userId and subInstituteId are required');
    }

    // Coerce numeric inputs to strings
    const userIdStr = String(userId);
    const subInstituteIdStr = String(subInstituteId);

    console.log(`[getCourseRecommendationData] Calling unified API for userId: ${userIdStr}, subInstituteId: ${subInstituteIdStr}`);
    
    // Get API token from environment
    const apiToken = process.env.HP_API_TOKEN || '';
    const apiUrl = `https://hp.triz.co.in/courses-recommendation?sub_institute_id=${subInstituteIdStr}&user_id=${userIdStr}&token=${apiToken}`;
    
    console.log('[getCourseRecommendationData] Full API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Check if API returned success
    if (!result.success) {
      console.warn('[getCourseRecommendationData] API returned failure:', result.message);
      return { courses: [], similarUsers: '' };
    }
    
    const data = result.data || [];
    
    console.log(`[getCourseRecommendationData] Got response:`, {
      success: result.success,
      message: result.message,
      coursesCount: data.length
    });
    
    // Extract similar_users from first record (it's the same for all)
    const similarUsers = data.length > 0 ? data[0].similar_users : '';
    
    return {
      success: result.success,
      message: result.message,
      courses: data, // Array of { id, name, similar_users, course_id, created_course_user, display_name }
      similarUsers: similarUsers
    };
    
  } catch (error) {
    console.error('[getCourseRecommendationData] Error:', error);
    throw error;
  }
}

/**
 * Genkit Flow to recommend courses based on what peers with the same allocated_standards are enrolled in.
 * Uses a single unified API to get all data at once.
 * 
 * @param {Object} input - The input object containing session data from client
 * @param {string|number} input.userId - User ID from session
 * @param {string|number} input.subInstituteId - Sub-institute ID from session
 */
export const courseRecommendationFlow = gk.defineFlow(
  {
    name: 'courseRecommendationFlow',
    inputSchema: CourseRecommendationInputSchema,
    outputSchema: CourseRecommendationOutputSchema
  },
  async (input) => {
    console.log('[courseRecommendationFlow] Started with input:', input);
    
    // Check if input is undefined or null
    if (!input) {
      console.error('[courseRecommendationFlow] Input is undefined or null');
      throw new Error('Input object is required with userId and subInstituteId');
    }
    
    // Validate required parameters
    if (!input.userId || !input.subInstituteId) {
      console.error('[courseRecommendationFlow] Missing required parameters:', { 
        userId: input.userId, 
        subInstituteId: input.subInstituteId 
      });
      throw new Error('userId and subInstituteId are required');
    }
    
    const { userId, subInstituteId } = input;
    
    console.log('[courseRecommendationFlow] Using session data from client:', {
      userId,
      subInstituteId
    });

    try {
      // Step 1: Get all course recommendation data from unified API
      const recommendationData = await gk.run('fetch-recommendation-data', async () => {
        const data = await getCourseRecommendationData(userId, subInstituteId);
        
        if (!data || !data.courses || data.courses.length === 0) {
          console.log('[fetch-recommendation-data] No data returned from API');
          return { courses: [] };
        }
        
        console.log('[fetch-recommendation-data] Got data:', {
          coursesCount: data.courses?.length || 0,
          similarUsers: data.similarUsers || ''
        });
        
        return data;
      });

      // Extract data from unified response
      const courses = recommendationData.courses || [];
      const similarUsers = recommendationData.similarUsers || '';

      // If no courses are found, return an empty array immediately.
      if (courses.length === 0) {
        console.log('[courseRecommendationFlow] No courses found, returning empty array');
        return [];
      }

      console.log('[courseRecommendationFlow] Found', courses.length, 'courses from', similarUsers, 'similar users');

      // Step 2: Aggregate and format course recommendations
      const courseEnrollmentCounts = {};
      courses.forEach(course => {
        const courseId = course.course_id;
        courseEnrollmentCounts[courseId] = (courseEnrollmentCounts[courseId] || 0) + 1;
      });

      // Step 3: Format the final output
      const finalRecommendations = await gk.run('format-final-output', async () => {
        console.log('[format-final-output] Formatting final recommendations');
        
        const recommendations = [];
        
        // Use a Map to avoid duplicates more efficiently
        const uniqueCoursesMap = new Map();
        
        for (const course of courses) {
          const courseId = course.course_id;
          
          // Only add if we haven't seen this course before
          if (!uniqueCoursesMap.has(courseId)) {
            // Format the similar users names (replace || with comma)
            const similarUsersFormatted = (course.similar_users_name || '').replace(/\|\|/g, ', ');
            
            uniqueCoursesMap.set(courseId, {
              courseName: course.display_name || course.name || 'Unknown Course',
              courseId: courseId,
              courseDescription: '', // API doesn't provide description
              courseLink: '', // API doesn't provide link
              reasonForRecommendation: `User with Similar Role: ${similarUsersFormatted}\nCreated by: ${course.created_user_name || 'N/A'}`,
            });
          }
        }
        
        // Convert Map to array
        recommendations.push(...uniqueCoursesMap.values());

        // Sort recommendations by the number of peer enrollments (descending)
        recommendations.sort((a, b) => {
          const countA = parseInt(a.reasonForRecommendation?.match(/\d+/)?.[0] || '0');
          const countB = parseInt(b.reasonForRecommendation?.match(/\d+/)?.[0] || '0');
          return countB - countA;
        });

        console.log('[format-final-output] Returning', recommendations.length, 'recommendations');
        return recommendations;
      });

      console.log('[courseRecommendationFlow] Completed successfully');
      return finalRecommendations;
      
    } catch (error) {
      console.error('[courseRecommendationFlow] Error:', error);
      throw error;
    }
  }
);

export default gk;