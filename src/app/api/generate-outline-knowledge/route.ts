import { NextResponse } from "next/server";

// ✅ POST handler for generating knowledge-based course outlines
export async function POST(req: Request) {
  try {
    // Parse input from frontend
    const { 
      jsonObject,
      industry, 
      modality, 
      aiModel, 
      mappingType, 
      mappingValue, 
      mappingReason, 
      mappingTypeName, 
      mappingValueName,
      proficiencyLevel: proficiencyLevelInput,
      proficiencyDescriptor: proficiencyDescriptorInput,
      proficiencyIndicators: proficiencyIndicatorsInput
    } = await req.json();
    
    // Validate server-side API key (never exposed to client)
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
    
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Extract knowledge information from jsonObject (front-end format)
    const knowledgeName = jsonObject?.selected_knowledge || jsonObject?.selectedKnowledge || jsonObject?.knowledge || "";
    const knowledgeDescription = jsonObject?.knowledge_description || jsonObject?.knowledgeDescription || jsonObject?.description || "";
    const knowledgeCategory = jsonObject?.knowledge_category || jsonObject?.knowledgeCategory || "";
    const knowledgeSubCategory = jsonObject?.knowledge_sub_category || jsonObject?.knowledgeSubCategory || "";
    const slideCount = jsonObject?.slideCount || 15;
    
    // Extract proficiency information
    const proficiencyLevel = proficiencyLevelInput || "";
    const proficiencyDescriptor = proficiencyDescriptorInput || "";
    const proficiencyIndicators = proficiencyIndicatorsInput || "";

    // Validate required knowledge input
    if (!knowledgeName) {
      return NextResponse.json(
        { error: "Knowledge name is required" },
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
    console.log("Knowledge Name:", knowledgeName);
    console.log("Knowledge Description:", knowledgeDescription);
    console.log("Knowledge Category:", knowledgeCategory);
    console.log("Knowledge Sub Category:", knowledgeSubCategory);
    console.log("Industry:", industry);

    // Helper function to generate mapping guidance
    function getMappingGuidance(mappingType: string, mappingValue: string) {
      const guidanceMap = {
        "pedagogical process": {
          "Inquiry-Based": {
            slide_guidance: "Structure each slide around a central question or investigative theme",
            activity_type: "Question formulation, evidence gathering, analysis tasks",
            assessment: "Evaluate questioning skills, research ability, and analytical thinking",
            reason: "Inquiry-Based Learning promotes critical thinking and problem-solving by encouraging learners to explore questions, gather evidence, and analyze information. This approach develops independent learning skills and fosters a deeper understanding of the subject matter through active investigation."
          },
          "Experiential-Based": {
            slide_guidance: "Connect theoretical concepts to hands-on experience and reflection",
            activity_type: "Simulations, practical exercises, reflective journals",
            assessment: "Assess application of learning in practical contexts",
            reason: "Experiential-Based Learning enhances knowledge acquisition and retention by bridging theory with real-world practice. Through hands-on activities and reflection, learners develop practical competencies and gain confidence in applying knowledge to actual situations, leading to more effective and lasting learning outcomes."
          },
          "Art-Integrated": {
            slide_guidance: "Incorporate creative elements and metaphorical thinking",
            activity_type: "Visual representations, creative problem-solving, metaphorical analysis",
            assessment: "Evaluate innovative thinking and creative application",
            reason: "Art-Integrated Learning stimulates creativity and innovation by connecting technical content with artistic expression. This approach encourages metaphorical thinking, visual representation, and alternative perspectives, helping learners develop innovative problem-solving skills and enhancing engagement through creative exploration."
          },
          "Project-Based": {
            slide_guidance: "Organize content around project phases and deliverables",
            activity_type: "Project planning, execution, presentation, and evaluation",
            assessment: "Assess project outcomes and process management",
            reason: "Project-Based Learning provides comprehensive knowledge development through structured, goal-oriented activities. By working on complete projects with clear deliverables, learners develop planning, execution, collaboration, and evaluation skills that directly translate to professional competence and real-world application."
          },
          "Scenario-Based": {
            slide_guidance: "Build content around realistic scenarios and case studies",
            activity_type: "Scenario analysis, role-playing, decision-making exercises",
            assessment: "Evaluate decision-making in context and scenario resolution",
            reason: "Scenario-Based Learning improves decision-making and contextual understanding by placing learners in realistic situations. Through case studies and role-playing, participants develop the ability to analyze complex situations, make informed decisions, and resolve challenges effectively, preparing them for actual workplace scenarios."
          }
        }
      };

      const typeMap = guidanceMap[mappingType as keyof typeof guidanceMap];
      const guidance = (typeMap as any)?.[mappingValue] || {
        slide_guidance: `Apply ${mappingValue} principles throughout the course`,
        activity_type: "Activities aligned with selected approach",
        assessment: "Assessment methods matching the chosen methodology",
        reason: `The ${mappingValue} approach provides a structured methodology for effective learning and knowledge development, ensuring comprehensive coverage of the subject matter through targeted activities and assessments.`
      };
      return guidance;
    }

    // Use the names sent from the frontend
    const selectedMappingType = mappingTypeName || "pedagogical process";
    const selectedMappingValue = mappingValueName || "Project-Based";
    const mappingGuidance = getMappingGuidance(selectedMappingType, selectedMappingValue);
    
    // Use provided reason or fall back to generated one
    const reason = mappingReason || mappingGuidance.reason;

    // Build the instruction text for knowledge-based course
    const knowledgeDescText = knowledgeDescription ? `Knowledge Description: ${knowledgeDescription}.` : "";
    const categoryText = knowledgeCategory ? `Knowledge Category: ${knowledgeCategory}.` : "";
    const subCategoryText = knowledgeSubCategory ? `Knowledge Sub-Category: ${knowledgeSubCategory}.` : "";
    const instructionText = `You are an expert instructional designer and L&D manager specializing in the industry: ${industry || 'General'}. Your task is to design a complete, exactly ${slideCount}-slide ${modalityString} training course focused on mastering the knowledge: ${knowledgeName}. ${knowledgeDescText} ${categoryText} ${subCategoryText} The course must be a comprehensive, competency-based guide to develop this knowledge.`;

    // Build knowledge metadata
    const knowledgeMetadata = {
      name: knowledgeName,
      description: knowledgeDescription || "No description provided",
      category: knowledgeCategory || "Not specified",
      sub_category: knowledgeSubCategory || "Not specified",
      industry: industry || "General",
      teaching_methodology: `${selectedMappingType}: ${selectedMappingValue}`
    };

    // Create the comprehensive prompt for knowledge-based course generation
    const promptToUse = {
      instruction: instructionText,
      output_format: {
        total_slides: `${slideCount}`,
        language: "Practical, professional, engaging, and competency-based",
        style: "Formal and structured",
        visuals: "No visuals, design elements, or styling instructions of any kind",
        repetition: "No repetition of content across slides",
        tone: modalityString,
        
        // Pedagogical approach
        pedagogical_approach: {
          mapping_type: selectedMappingType,
          mapping_value: selectedMappingValue,
          context: `Using ${selectedMappingValue} approach for knowledge: ${knowledgeName} development`,
          reason: reason
        },
        
        slide_structure: [
          "Slide X: [Appropriate Slide Title Based on Position]",
          "Slide X: [Appropriate Slide Description Based on Position]",
          "Followed by 5 to 6 concise bullet points.",
          "Each bullet point must be instructional, clear, and under 40 words.",
          "Use only plain text and hyphens for bullets. No markdown, symbols, or numbering.",
          "INTEGRATE knowledge-related competencies naturally into bullet points where relevant.",
          `ALIGN content with ${selectedMappingValue} approach for knowledge: ${knowledgeName} mastery`
        ],

        // Knowledge metadata
        knowledge_metadata: knowledgeMetadata,

        // Mapping integration guidance specific to knowledge development
        mapping_integration: {
          type: selectedMappingType,
          value: selectedMappingValue,
           
          knowledge_specific_guidance: [
            `Apply ${selectedMappingValue} approach to develop knowledge: ${knowledgeName}`,
            `Design learning activities for ${knowledgeName} using ${selectedMappingValue} methodology`,
            `Structure knowledge progression from basic to advanced using ${selectedMappingValue} principles`,
            `Assess ${knowledgeName} mastery through ${selectedMappingValue} evaluation methods`
          ],
           
          // Pedagogical approach implementation for knowledge development
          pedagogical_implementation: {
            "Inquiry-Based": [
              `Frame ${knowledgeName} development around investigative questions and discovery`,
              "Encourage questioning and exploration of knowledge applications",
              "Design knowledge practice as problem-solving investigations",
              "Assess knowledge through inquiry-based challenges and scenarios"
            ],
            "Experiential-Based": [
              `Connect ${knowledgeName} theory to hands-on practice and reflection`,
              "Design experiential learning activities for knowledge application",
              "Use real-world simulations to practice knowledge in context",
              "Assess knowledge through experiential performance and reflection"
            ],
            "Art-Integrated": [
              `Use creative approaches to explore and develop ${knowledgeName}`,
              "Incorporate artistic elements into knowledge practice and application",
              "Encourage metaphorical thinking about knowledge development",
              "Assess knowledge through creative expression and innovative application"
            ],
            "Project-Based": [
              `Structure ${knowledgeName} development around a central project`,
              "Design project milestones that require knowledge application",
              "Use project deliverables to demonstrate knowledge mastery",
              "Assess knowledge through project outcomes and process management"
            ],
            "Scenario-Based": [
              `Develop ${knowledgeName} through realistic scenarios and case studies`,
              "Use contextual scenarios to practice knowledge application",
              "Design decision-making exercises that require knowledge use",
              "Assess knowledge through scenario resolution and performance"
            ]
          },
           
          integration_rules: [
            `The ${selectedMappingValue} approach must guide ${knowledgeName} development throughout`,
            "Align knowledge practice activities with selected pedagogical methodology",
            "Use approach-specific terminology and concepts in knowledge instruction",
            "Ensure knowledge assessment methods match the pedagogical approach"
          ]
        },

        // Knowledge competency integration guidelines
        knowledge_integration: {
          core_components: [
            `Knowledge Name: ${knowledgeName}`,
            `Knowledge Description: ${knowledgeDescription || 'No description provided'}`,
            `Knowledge Category: ${knowledgeCategory || 'Not specified'}`,
            `Knowledge Sub-Category: ${knowledgeSubCategory || 'Not specified'}`,
            `Industry Context: ${industry || 'General'}`
          ],
           
          content_guidance: [
            `Develop comprehensive content for ${knowledgeName}`,
            `Connect knowledge to industry: ${industry || 'General'} applications`,
            `Incorporate knowledge description: ${knowledgeDescription || 'No description provided'}`,
            `Address knowledge category: ${knowledgeCategory || 'General'}`,
            `Cover knowledge sub-category: ${knowledgeSubCategory || 'General'}`,
            `Apply ${selectedMappingValue} pedagogical approach`
          ],
           
          progression_strategy: [
            "Start with foundational concepts and basics",
            "Build toward intermediate applications",
            "Advance to complex scenarios and mastery",
            "Include real-world industry examples",
            "Align with professional standards"
          ]
        },

        // Slide sequence logic for knowledge-based course
        slide_sequence_logic: {
          // Core required slides (always included in this order)
          required_slides: [
            {
              position: 1,
              title_logic: `'Mastering knowledge: ${knowledgeName}'`,
              content_focus: [
                `Overview of knowledge: ${knowledgeName} development`,
                `Industry context: ${industry || 'General'} requirements for knowledge: ${knowledgeName}`,
                knowledgeCategory ? `Knowledge category: ${knowledgeCategory}` : "Knowledge overview",
                knowledgeSubCategory ? `Knowledge sub-category: ${knowledgeSubCategory}` : "",
                knowledgeDescription ? `Knowledge description: ${knowledgeDescription}` : "Knowledge overview and importance",
                `Course modality: ${modalityString}`,
                // Add proficiency level context
                proficiencyLevel ? `Target proficiency level: ${proficiencyLevel}` : "",
                proficiencyDescriptor ? `Proficiency descriptor: ${proficiencyDescriptor}` : "",
                proficiencyIndicators ? `Proficiency indicators: ${proficiencyIndicators}` : "",
                // Add mapping context
                `Teaching approach: ${selectedMappingValue} methodology`,
                "Introduce key concepts and learning path for knowledge mastery"
              ],
              knowledge_integration: [
                `Focus on core knowledge: ${knowledgeName}`,
                `Connect knowledge: ${knowledgeName} to real-world applications in industry: ${industry || 'General'}`,
                knowledgeCategory ? `Relate to knowledge category: ${knowledgeCategory}` : "",
                knowledgeSubCategory ? `Address knowledge sub-category: ${knowledgeSubCategory}` : "",
                // Add mapping integration
                `Introduce ${selectedMappingValue} approach for knowledge: ${knowledgeName} development`
              ],
              // Add mapping-specific content
              mapping_integration: `Explain how ${selectedMappingValue} approach enhances ${knowledgeName} learning`
            },
            {
              position: 2,
              title_logic: `'Learning Objectives for knowledge: ${knowledgeName} Mastery'`,
              content_focus: [
                `Targeted development outcomes for knowledge: ${knowledgeName}`,
                `Importance of knowledge: ${knowledgeName} in ${industry || 'General'} industry`,
                knowledgeCategory ? `Category alignment: ${knowledgeCategory}` : "",
                "Facilitator guidance and session flow overview",
                "Participant engagement expectations",
                "Session timing and break structure",
                // Add mapping-specific objectives
                `How ${selectedMappingValue} approach supports knowledge: ${knowledgeName} mastery`,
                "Define measurable knowledge development targets"
              ],
              knowledge_integration: [
                `Define measurable knowledge: ${knowledgeName} development targets`,
                `Connect knowledge to industry standards: ${industry || 'General'}`,
                `Establish clear knowledge: ${knowledgeName} assessment criteria`,
                // Add mapping integration
                `Align objectives with ${selectedMappingValue} methodology`
              ],
              // Add mapping-specific planning
              mapping_objectives: `Set learning objectives that leverage ${selectedMappingValue} approach`
            },
            {
              position: -1, // Last slide
              title_logic: `'${knowledgeName} Mastery & Evaluation'`,
              content_focus: [
                `Summary of knowledge: ${knowledgeName} development journey`,
                "Key takeaways and competency achievements",
                "Assessment and evaluation criteria",
                "Next steps for continued knowledge development",
                "Resources for ongoing learning",
                // Add mapping context
                `Evaluation through ${selectedMappingValue} approach`,
                "Action plan for knowledge application in workplace"
              ],
              knowledge_integration: [
                `Reinforce ${knowledgeName} competency development`,
                `Connect knowledge: ${knowledgeName} to career advancement in industry: ${industry || 'General'}`,
                knowledgeCategory ? `Highlight ${knowledgeCategory} expertise achieved` : "Highlight knowledge expertise achieved",
                // Add mapping integration
                `Final assessment using ${selectedMappingValue} methodology`
              ],
              // Add mapping-specific conclusion
              mapping_conclusion: `Evaluate knowledge mastery through ${selectedMappingValue} assessment methods`
            }
          ],
           
          // Dynamic middle slides - distributed content
          middle_slides_guidance: {
            content_areas: [
              "Foundational concepts and theory",
              "Core techniques and methodologies",
              "Practical applications and exercises",
              "Industry-specific use cases",
              "Best practices and standards",
              "Common challenges and solutions",
              "Advanced techniques and mastery",
              "Real-world case studies"
            ],
             
            distribution_strategy: `Distribute ${slideCount - 3} middle slides evenly across these content areas`,
             
            knowledge_focus_per_slide: [
              `Each slide should advance ${knowledgeName} competency`,
              "Connect content to industry applications",
              knowledgeCategory ? "Incorporate knowledge category concepts" : "Define knowledge components",
              "Use selected pedagogical approach",
              "Include practical examples and exercises"
            ]
          }
        },

        // Additional guidelines
        additional_guidelines: {
          content_quality: [
            "All content must be directly relevant to the specified knowledge",
            "Use industry-specific terminology appropriately",
            "Include practical examples from the specified industry",
            "Ensure clear progression from basics to advanced",
            "Make content actionable and implementable"
          ],
           
          formatting: [
            "Use plain text with hyphens for bullet points",
            "Keep bullet points under 40 words each",
            "No markdown, numbering, or special symbols",
            "Consistent formatting across all slides",
            "Clear slide titles and descriptions"
          ],
           
          pedagogical_alignment: [
            `Follow ${selectedMappingValue} approach throughout`,
            "Include appropriate learning activities",
            "Design relevant assessments",
            "Ensure interactive elements where appropriate",
            "Connect theory to practice"
          ]
        }
      }
    };

    // Select the AI model to use
    const selectedModel = aiModel || "openai/gpt-4o-mini";

    console.log("Generating knowledge-based course outline for:", knowledgeName);
    console.log("Model:", selectedModel);
    console.log("Slides:", slideCount);
    console.log("Pedagogical approach:", selectedMappingValue);

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Course Outline Generator"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: "You are an expert instructional designer and L&D manager specializing in creating comprehensive, competency-based training courses. You excel at designing courses that integrate pedagogical approaches with practical knowledge development. Your courses are well-structured, professionally written, and focused on measurable learning outcomes."
          },
          {
            role: "user",
            content: JSON.stringify(promptToUse)
          }
        ],
        temperature: 0.7,
        max_tokens: 16000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate course outline", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      return NextResponse.json(
        { error: "Invalid response from AI model" },
        { status: 500 }
      );
    }

    const generatedContent = data.choices[0].message?.content || "";

    // Return the generated course outline
    return NextResponse.json({
      success: true,
      content: generatedContent,
      metadata: {
        knowledgeName,
        knowledgeDescription,
        knowledgeCategory,
        knowledgeSubCategory,
        industry,
        slideCount: slideCount,
        modality: modalityString,
        pedagogicalApproach: {
          type: selectedMappingType,
          value: selectedMappingValue,
          reason
        },
        model: selectedModel
      }
    });

  } catch (error) {
    console.error("Error generating knowledge-based course outline:", error);
    
    // Check if it's a fetch/network error
    const errorMessage = error instanceof Error ? error.message : String(error);
    let userMessage = "Internal server error";
    
    if (errorMessage.includes("fetch failed") || errorMessage.includes("network") || errorMessage.includes("ENOTFOUND") || errorMessage.includes("ECONNREFUSED")) {
      userMessage = "Failed to connect to AI service. Please check your network connection and try again.";
    } else if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
      userMessage = "Invalid API key. Please check your OpenRouter API key configuration.";
    } else if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      userMessage = "Rate limit exceeded. Please try again later.";
    } else if (errorMessage.includes("500") || errorMessage.includes("502") || errorMessage.includes("503")) {
      userMessage = "AI service is currently unavailable. Please try again later.";
    }
    
    return NextResponse.json(
      { error: userMessage, details: errorMessage },
      { status: 500 }
    );
  }
}

// ✅ GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    endpoint: "generate-outline-knowledge",
    description: "Knowledge library based course outline generator",
    requiredInputs: [
      "jsonObject.selected_knowledge (required) - knowledge name"
    ],
    optionalInputs: [
      "jsonObject.knowledge_description (optional) - knowledge description",
      "jsonObject.knowledge_category (optional) - knowledge category",
      "jsonObject.knowledge_sub_category (optional) - knowledge sub category",
      "industry",
      "modality (selfPaced, instructorLed)",
      "aiModel",
      "mappingType",
      "mappingValue",
      "mappingReason",
      "mappingTypeName",
      "mappingValueName",
      "jsonObject.slideCount"
    ]
  });
}
