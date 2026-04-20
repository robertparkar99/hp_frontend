import { NextRequest, NextResponse } from "next/server";

/**
 * Career Journey API Route
 *
 * GET /api/career-journey
 *
 * Fetches career progression data for a user, including vertical and lateral movements.
 *
 * Query Parameters:
 * - user_id: User identifier (required)
 * - sub_institute_id: Institute identifier (required)
 *
 * Headers:
 * - Authorization: Bearer token (required)
 *
 * Response:
 * {
 *   status: boolean,
 *   data: Array<{
 *     movement_type: 'vertical' | 'lateral',
 *     role_name: string,
 *     job_level: string,
 *     progress?: string, // Only for vertical movements
 *     status?: string    // Only for vertical movements
 *   }>
 * }
 */

// Mock database data - In production, this would connect to actual database
const mockCareerData: Record<string, any[]> = {
  'user-001': [
    {
      movement_type: 'vertical',
      role_name: 'Staff Nurse',
      job_level: 'MID',
      progress: '85%',
      status: 'active'
    },
    {
      movement_type: 'vertical',
      role_name: 'Nurse Manager',
      job_level: 'SENIOR',
      progress: '60%',
      status: 'planned'
    },
    {
      movement_type: 'vertical',
      role_name: 'Director of Nursing',
      job_level: 'EXECUTIVE',
      progress: '25%',
      status: 'planned'
    },
    {
      movement_type: 'lateral',
      role_name: 'Clinical Educator',
      job_level: 'MID'
    },
    {
      movement_type: 'lateral',
      role_name: 'Quality Assurance Nurse',
      job_level: 'MID'
    },
    {
      movement_type: 'lateral',
      role_name: 'Research Nurse',
      job_level: 'MID'
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const sub_institute_id = searchParams.get('sub_institute_id');

    // Extract authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Validate required parameters
    if (!user_id || !sub_institute_id) {
      return NextResponse.json(
        {
          status: false,
          error: 'Missing required parameters: user_id and sub_institute_id'
        },
        { status: 400 }
      );
    }

    // Validate authentication token
    if (!token) {
      return NextResponse.json(
        {
          status: false,
          error: 'Authorization token required'
        },
        { status: 401 }
      );
    }

    // TODO: Verify JWT token in production
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (!decoded) {
    //   return NextResponse.json(
    //     { status: false, error: 'Invalid token' },
    //     { status: 403 }
    //   );
    // }

    console.log(`[career-journey] Fetching data for user: ${user_id}, institute: ${sub_institute_id}`);

    // TODO: Replace with actual database query
    // const careerData = await db.query(`
    //   SELECT movement_type, role_name, job_level, progress, status
    //   FROM career_movements
    //   WHERE user_id = ? AND sub_institute_id = ?
    //   ORDER BY movement_type, created_at
    // `, [user_id, sub_institute_id]);

    // Mock data retrieval
    const careerData = mockCareerData[user_id] || [];

    if (careerData.length === 0) {
      console.log(`[career-journey] No career data found for user: ${user_id}`);
      return NextResponse.json({
        status: true,
        data: [],
        message: 'No career journey data found for this user'
      });
    }

    console.log(`[career-journey] Found ${careerData.length} career movements for user: ${user_id}`);

    // Process and format data (remove database-specific fields if any)
    const processedData = careerData.map(item => ({
      movement_type: item.movement_type,
      role_name: item.role_name,
      job_level: item.job_level,
      ...(item.movement_type === 'vertical' && {
        progress: item.progress,
        status: item.status
      })
    }));

    return NextResponse.json({
      status: true,
      data: processedData
    });

  } catch (error) {
    console.error('[career-journey] Error:', error);

    return NextResponse.json(
      {
        status: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

