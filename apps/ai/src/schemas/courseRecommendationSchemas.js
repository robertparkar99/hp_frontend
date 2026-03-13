/**
 * Schema Definitions for Course Recommendation Flow
 * 
 * These schemas define the input/output structures for recommending courses
 * based on peer enrollments (users with the same allocated_standards).
 */

import { z } from 'zod';

/**
 * Input schema for the course recommendation flow.
 * userId and subInstituteId are obtained from session.
 */
// export const CourseRecommendationInputSchema = z.object({
//   userId: z.string().optional(),
//   subInstituteId:,
// });

/**
 * Schema for a single recommended course.
 */
export const RecommendedCourseSchema = z.object({
  courseName: z.string(),
  courseId: z.string(),
  courseDescription: z.string(),
  reasonForRecommendation: z.string().optional(), // e.g., "Enrolled by X users with the same allocated_standards as you."
  courseLink: z.string().url().optional(), // A direct link to the course page
});

/**
 * Output schema for the course recommendation flow (an array of recommended courses).
 */
export const CourseRecommendationOutputSchema = z.array(RecommendedCourseSchema);

export default {
  CourseRecommendationInputSchema,
  RecommendedCourseSchema,
  CourseRecommendationOutputSchema,
};
