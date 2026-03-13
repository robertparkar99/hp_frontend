import { NextResponse } from "next/server";

// ✅ POST handler for generating behaviour-based course outlines
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

    // Extract behaviour information from jsonObject (front-end format)
    const behaviourName = jsonObject?.selected_behaviour || jsonObject?.behaviour_name || jsonObject?.title || "";
    const behaviourDescription = jsonObject?.behaviour_description || jsonObject?.description || "";
    const behaviourCategory = jsonObject?.behaviour_category || jsonObject?.category || "";
    const behaviourSubCategory = jsonObject?.behaviour_sub_category || jsonObject?.sub_category || "";
    const departmentId = jsonObject?.department_id || "";
    const department = jsonObject?.department || departmentId || "";
    const jobRole = jsonObject?.jobrole || "";
    const slideCount = slideCountInput || jsonObject?.slideCount || 15;
    
    // Extract proficiency information
    const proficiencyLevel = proficiencyLevelInput || "";
    const description = descriptionInput || "";

    // Validate required behaviour input
    if (!behaviourName) {
      return NextResponse.json(
        { error: "Behaviour name is required" },
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
    console.log("Behaviour Name:", behaviourName);
    console.log("Behaviour Description:", behaviourDescription);
    console.log("Behaviour Category:", behaviourCategory);
    console.log("Behaviour Sub Category:", behaviourSubCategory);
    console.log("Department ID:", departmentId);
    console.log("Department:", department);
    console.log("Job Role:", jobRole);

    // Build the prompt for behaviour-based course
    const prompt = `
You are an expert instructional designer and L&D manager specializing in the industry: ${industry || 'General'}. Your task is to design a complete, exactly ${slideCount}-slide ${modalityString || 'Self-paced'} training course focused on developing the behaviour: ${behaviourName}. ${behaviourDescription ? `Description: ${behaviourDescription}.` : ''} ${behaviourCategory ? `Category: ${behaviourCategory}.` : ''} ${behaviourSubCategory ? `Sub Category: ${behaviourSubCategory}.` : ''} The course must be a comprehensive, competency-based guide to develop this behaviour.

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
- Content should be practical and actionable to help learners develop the behaviour of "${behaviourName}" in a professional setting
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
        "X-Title": "Behaviour Course Generator"
      },
      body: JSON.stringify({
        model: aiModel || "deepseek/deepseek-chat-v3.1",
        messages: [
          {
            role: "system",
            content: "You are an expert instructional designer and course developer specializing in behaviour and behavioral competency training. Create comprehensive, practical course outlines that help learners develop professional attitudes and behaviors."
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
    console.error("Error in generate-outline-behaviour:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
