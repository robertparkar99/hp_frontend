import { NextResponse } from "next/server";

// ✅ POST handler for generating attitude-based course outlines
export async function POST(req: Request) {
  try {
    // Parse input from frontend
    const { 
      jsonObject,
      industry, 
      modality, 
      aiModel, 
      proficiencyLevel: proficiencyLevelInput,
      description: descriptionInput,
      slideCount: slideCountInput
    } = await req.json();
    
    // Validate server-side API key (never exposed to client)
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
    
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Extract attitude information from jsonObject (front-end format)
    const attitudeName = jsonObject?.selected_attitude || jsonObject?.attitude_name || jsonObject?.title || "";
    const attitudeDescription = jsonObject?.attitude_description || jsonObject?.description || "";
    const attitudeCategory = jsonObject?.attitude_category || jsonObject?.category || "";
    const attitudeSubCategory = jsonObject?.attitude_sub_category || jsonObject?.sub_category || "";
    const departmentId = jsonObject?.department_id || "";
    const department = jsonObject?.department || departmentId || "";
    const jobRole = jsonObject?.jobrole || "";
    const slideCount = slideCountInput || jsonObject?.slideCount || 15;
    
    // Extract proficiency information
    const proficiencyLevel = proficiencyLevelInput || "";
    const description = descriptionInput || "";

    // Validate required attitude input
    if (!attitudeName) {
      return NextResponse.json(
        { error: "Attitude name is required" },
        { status: 400 }
      );
    }

    // Build modality string
    const modalityString = [
      modality?.selfPaced && "Self-paced",
      modality?.instructorLed && "Instructor-led",
    ]
      .filter(Boolean)
      .join(", ");

    console.log("Number of Slides:", slideCount);
    console.log("Attitude Name:", attitudeName);
    console.log("Attitude Description:", attitudeDescription);
    console.log("Attitude Category:", attitudeCategory);
    console.log("Attitude Sub Category:", attitudeSubCategory);
    console.log("Department ID:", departmentId);
    console.log("Department:", department);
    console.log("Job Role:", jobRole);

    // Build the prompt for attitude-based course
    const prompt = `
You are an expert instructional designer and L&D manager specializing in the industry: ${industry || 'General'}. Your task is to design a complete, exactly ${slideCount}-slide ${modalityString || 'Self-paced'} training course focused on developing the attitude: ${attitudeName}. ${attitudeDescription ? `Description: ${attitudeDescription}.` : ''} ${attitudeCategory ? `Category: ${attitudeCategory}.` : ''} ${attitudeSubCategory ? `Sub Category: ${attitudeSubCategory}.` : ''} The course must be a comprehensive, competency-based guide to develop this attitude/behavior.

## Output Format (Plain Text - No JSON):
Slide 1: [Appropriate Slide Title Based on Position]
Slide 1 Description: [Appropriate Slide Description Based on Position]
- Bullet point 1
- Bullet point 2
- Bullet point 3
- Bullet point 4
- Bullet point 5

Slide 2: [Appropriate Slide Title]
Slide 2 Description: [Appropriate Slide Description]
- Bullet point 1
- Bullet point 2
- Bullet point 3
- Bullet point 4
- Bullet point 5

... continue for all ${slideCount} slides

## Requirements:
- Use exactly ${slideCount} slides
- Each slide must have a clear title and description
- Each slide must have 5-6 concise bullet points (under 40 words each)
- Use only plain text and hyphens for bullets. No markdown, symbols, or numbering.
- Content should be practical and actionable to help learners develop the attitude of "${attitudeName}" in a professional setting
- Include competency-based learning objectives
- Focus on behavioral change and practical application
`;

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://hp-frontend.vercel.app",
        "X-Title": "Attitude Course Generator"
      },
      body: JSON.stringify({
        model: aiModel || "deepseek/deepseek-chat-v3.1",
        messages: [
          {
            role: "system",
            content: "You are an expert instructional designer and course developer specializing in attitude and behavioral competency training. Create comprehensive, practical course outlines that help learners develop professional attitudes and behaviors."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to generate course outline" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (!content) {
      return NextResponse.json(
        { error: "No content generated by AI model" },
        { status: 500 }
      );
    }

    console.log("✅ Course outline generated successfully");

    return NextResponse.json({
      success: true,
      content: content
    });

  } catch (error) {
    console.error("Error in generate-outline-attitude:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
