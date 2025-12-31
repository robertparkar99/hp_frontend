/**
 * API Route: /api/screenCandidate
 * Screens candidate resumes against JD competencies and predicts fit
 * Input: { resume: string, jdData: object }
 * Output: { competency_match, cultural_fit, predicted_success, summary, skill_gaps }
 */

import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.SCREENING_DEEPSEEK_API_KEY;
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { resume, jdData } = await req.json();

    if (!resume || !jdData) {
      return NextResponse.json({ error: 'Missing resume or JD data' }, { status: 400 });
    }

    const gptPrompt = `You are an expert recruiter. Analyze this candidate's resume against the job requirements.

Job Requirements:
- Core Skills: ${jdData.core_skills?.join(', ') || 'Not specified'}
- Behavioral Traits: ${jdData.behavioral_traits?.join(', ') || 'Not specified'}
- Required Competency Levels: ${JSON.stringify(jdData.competency_level || {})}

Candidate Resume:
${resume}

Provide analysis in valid JSON format:
{
  "competency_match": <number 0-100>,
  "cultural_fit": "Low" | "Medium" | "High",
  "predicted_success": "Unlikely" | "Possible" | "Likely" | "Highly Likely",
  "summary": "<150 word summary of candidate fit>",
  "skill_gaps": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "recommendation": "Schedule Interview" | "Request Additional Info" | "Reject"
}`;

    const gptResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: gptPrompt }],
        temperature: 0.4,
      }),
    });

    if (!gptResponse.ok) {
      throw new Error('GPT API failed');
    }

    const gptData = await gptResponse.json();
    const content = gptData.choices?.[0]?.message?.content || '{}';

    let analysis: any;
    try {
      analysis = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        competency_match: 0,
        cultural_fit: 'Low',
        predicted_success: 'Unlikely',
        summary: 'Unable to analyze',
        skill_gaps: [],
        strengths: [],
        recommendation: 'Request Additional Info'
      };
    }

    const skillMatchDetails = jdData.core_skills?.map((skill: string) => {
      const skillLower = skill.toLowerCase();
      const resumeLower = resume.toLowerCase();
      const isPresent = resumeLower.includes(skillLower);
      const requiredLevel = jdData.competency_level?.[skill] || 'Intermediate';

      return {
        skill,
        present: isPresent,
        required_level: requiredLevel,
        gap: !isPresent
      };
    }) || [];

    return NextResponse.json({
      success: true,
      competency_match: analysis.competency_match || 0,
      cultural_fit: analysis.cultural_fit || 'Medium',
      predicted_success: analysis.predicted_success || 'Possible',
      summary: analysis.summary || 'Analysis complete',
      skill_gaps: analysis.skill_gaps || [],
      strengths: analysis.strengths || [],
      recommendation: analysis.recommendation || 'Request Additional Info',
      skill_match_details: skillMatchDetails,
      total_skills_required: jdData.core_skills?.length || 0,
      skills_matched: skillMatchDetails.filter((s: any) => s.present).length
    });

  } catch (error) {
    console.error('Candidate screening error:', error);
    return NextResponse.json(
      { error: 'Failed to screen candidate', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
