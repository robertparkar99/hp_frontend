  import { NextResponse } from "next/server";

  // ✅ POST handler for generating skill-based course outlines
  export async function POST(req: Request) {
    try {
      // Parse input from frontend
      const { 
        jsonObject,
        skillName,
        skillDescription,
        skillCategory,
        skillSubCategory,
        industry, 
        modality, 
        aiModel, 
        mappingType, 
        mappingValue, 
        mappingReason, 
        mappingTypeName, 
        mappingValueName,
        proficiencyLevel,
        description,
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

      // Extract skill information - support both root level and jsonObject format
      // Root level format: { skillName, skillDescription, skillCategory, skillSubCategory }
      // jsonObject format: { jsonObject: { selected_skill, skill_description, skill_category, skill_sub_category } }
      const skillNameInput = skillName || jsonObject?.selected_skill || jsonObject?.selectedSkill || jsonObject?.skill || "";
      const skillDescriptionInput = skillDescription || jsonObject?.skill_description || jsonObject?.skillDescription || jsonObject?.description || "";
      const skillCategoryInput = skillCategory || jsonObject?.skill_category || jsonObject?.skillCategory || "";
      const skillSubCategoryInput = skillSubCategory || jsonObject?.skill_sub_category || jsonObject?.skillSubCategory || "";
      const proficiencyLevelInput = proficiencyLevel || jsonObject?.proficiencyLevel || jsonObject?.proficiency_level || jsonObject?.level || "";
      const proficiencyDescriptionInput = description || jsonObject?.proficiency_description || jsonObject?.description || jsonObject?.proficiencyDescription || "";
      const slideCount = slideCountInput || jsonObject?.slideCount || 15;

      // Validate required skill input
      if (!skillNameInput) {
        return NextResponse.json(
          { error: "Skill name is required" },
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
      console.log("Skill Name:", skillNameInput);
      console.log("Skill Description:", skillDescriptionInput);
      console.log("Skill Category:", skillCategoryInput);
      console.log("Skill Sub Category:", skillSubCategoryInput);
      console.log("Proficiency Level:", proficiencyLevelInput);
      console.log("Proficiency Description:", proficiencyDescriptionInput);
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
              reason: "Experiential-Based Learning enhances skill acquisition and retention by bridging theory with real-world practice. Through hands-on activities and reflection, learners develop practical competencies and gain confidence in applying knowledge to actual situations, leading to more effective and lasting learning outcomes."
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
              reason: "Project-Based Learning provides comprehensive skill development through structured, goal-oriented activities. By working on complete projects with clear deliverables, learners develop planning, execution, collaboration, and evaluation skills that directly translate to professional competence and real-world application."
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
          reason: `The ${mappingValue} approach provides a structured methodology for effective learning and skill development, ensuring comprehensive coverage of the subject matter through targeted activities and assessments.`
        };
        return guidance;
      }

      // Use the names sent from the frontend
      const selectedMappingType = mappingTypeName || "pedagogical process";
      const selectedMappingValue = mappingValueName || "Project-Based";
      const mappingGuidance = getMappingGuidance(selectedMappingType, selectedMappingValue);
      
      // Use provided reason or fall back to generated one
      const reason = mappingReason || mappingGuidance.reason;

      // Build the instruction text for skill-based course
      const skillDescText = skillDescriptionInput ? `Skill Description: ${skillDescriptionInput}.` : "";
      const categoryText = skillCategoryInput ? `Skill Category: ${skillCategoryInput}.` : "";
      const subCategoryText = skillSubCategoryInput ? `Skill Sub-Category: ${skillSubCategoryInput}.` : "";
      const proficiencyText = proficiencyLevelInput ? `Proficiency Level: ${proficiencyLevelInput}.` : "";
      const proficiencyDescText = proficiencyDescriptionInput ? `Proficiency Level Description: ${proficiencyDescriptionInput}.` : "";
      const instructionText = `You are an expert instructional designer and L&D manager specializing in the industry: ${industry || 'General'}. Your task is to design a complete, exactly ${slideCount}-slide ${modalityString} training course focused on mastering the skill: ${skillNameInput}. ${skillDescText} ${categoryText} ${subCategoryText} ${proficiencyText} ${proficiencyDescText} The course must be a comprehensive, competency-based guide to develop this skill.`;

      // Build skill metadata
      const skillMetadata = {
        name: skillNameInput,
        description: skillDescriptionInput || "No description provided",
        category: skillCategoryInput || "Not specified",
        sub_category: skillSubCategoryInput || "Not specified",
        industry: industry || "General",
        proficiency_level: proficiencyLevelInput || "Not specified",
        proficiency_description: proficiencyDescriptionInput || "Not specified",
        teaching_methodology: `${selectedMappingType}: ${selectedMappingValue}`
      };

      // Create the comprehensive prompt for skill-based course generation
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
            context: `Using ${selectedMappingValue} approach for skill: ${skillNameInput} development`,
            reason: reason
          },
          
          slide_structure: [
            "Slide X: [Appropriate Slide Title Based on Position]",
            "Slide X: [Appropriate Slide Description Based on Position]",
            "Followed by 5 to 6 concise bullet points.",
            "Each bullet point must be instructional, clear, and under 40 words.",
            "Use only plain text and hyphens for bullets. No markdown, symbols, or numbering.",
            "INTEGRATE skill-related competencies naturally into bullet points where relevant.",
            `ALIGN content with ${selectedMappingValue} approach for skill: ${skillNameInput} mastery`
          ],

          // Skill metadata
          skill_metadata: skillMetadata,

          // Mapping integration guidance specific to skill development
          mapping_integration: {
            type: selectedMappingType,
            value: selectedMappingValue,
            
            skill_specific_guidance: [
              `Apply ${selectedMappingValue} approach to develop skill: ${skillNameInput}`,
              `Design learning activities for ${skillNameInput} using ${selectedMappingValue} methodology`,
              `Structure skill progression from basic to advanced using ${selectedMappingValue} principles`,
              `Assess ${skillNameInput} mastery through ${selectedMappingValue} evaluation methods`
            ],
            
            // Pedagogical approach implementation for skill development
            pedagogical_implementation: {
              "Inquiry-Based": [
                `Frame ${skillNameInput} development around investigative questions and discovery`,
                "Encourage questioning and exploration of skill applications",
                "Design skill practice as problem-solving investigations",
                "Assess skill through inquiry-based challenges and scenarios"
              ],
              "Experiential-Based": [
                `Connect ${skillNameInput} theory to hands-on practice and reflection`,
                "Design experiential learning activities for skill application",
                "Use real-world simulations to practice skill in context",
                "Assess skill through experiential performance and reflection"
              ],
              "Art-Integrated": [
                `Use creative approaches to explore and develop ${skillNameInput}`,
                "Incorporate artistic elements into skill practice and application",
                "Encourage metaphorical thinking about skill development",
                "Assess skill through creative expression and innovative application"
              ],
              "Project-Based": [
                `Structure ${skillNameInput} development around a central project`,
                "Design project milestones that require skill application",
                "Use project deliverables to demonstrate skill mastery",
                "Assess skill through project outcomes and process management"
              ],
              "Scenario-Based": [
                `Develop ${skillNameInput} through realistic scenarios and case studies`,
                "Use contextual scenarios to practice skill application",
                "Design decision-making exercises that require skill use",
                "Assess skill through scenario resolution and performance"
              ]
            },
            
            integration_rules: [
              `The ${selectedMappingValue} approach must guide ${skillNameInput} development throughout`,
              "Align skill practice activities with selected pedagogical methodology",
              "Use approach-specific terminology and concepts in skill instruction",
              "Ensure skill assessment methods match the pedagogical approach"
            ]
          },

          // Skill competency integration guidelines
          skill_integration: {
            core_components: [
              `Skill Name: ${skillNameInput}`,
              `Skill Description: ${skillDescriptionInput || 'No description provided'}`,
              `Skill Category: ${skillCategoryInput || 'Not specified'}`,
              `Skill Sub-Category: ${skillSubCategoryInput || 'Not specified'}`,
              `Proficiency Level: ${proficiencyLevelInput || 'Not specified'}`,
              `Proficiency Level Description: ${proficiencyDescriptionInput || 'Not specified'}`,
              `Industry Context: ${industry || 'General'}`
            ],
            
            content_guidance: [
              `Develop comprehensive content for ${skillNameInput}`,
              `Connect skill to industry: ${industry || 'General'} applications`,
              `Incorporate skill description: ${skillDescriptionInput || 'No description provided'}`,
              `Address skill category: ${skillCategoryInput || 'General'}`,
              `Cover skill sub-category: ${skillSubCategoryInput || 'General'}`,
              proficiencyLevelInput ? `Target proficiency level: ${proficiencyLevelInput}` : "",
              proficiencyDescriptionInput ? `Proficiency description: ${proficiencyDescriptionInput}` : "",
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

          // Slide sequence logic for skill-based course
          slide_sequence_logic: {
            // Core required slides (always included in this order)
            required_slides: [
              {
                position: 1,
                title_logic: `'Mastering skill: ${skillNameInput}'`,
                content_focus: [
                  `Overview of skill: ${skillNameInput} development`,
                  `Industry context: ${industry || 'General'} requirements for skill: ${skillNameInput}`,
                  skillCategoryInput ? `Skill category: ${skillCategoryInput}` : "Skill overview",
                  skillSubCategoryInput ? `Skill sub-category: ${skillSubCategoryInput}` : "",
                  skillDescriptionInput ? `Skill description: ${skillDescriptionInput}` : "Skill overview and importance",
                  proficiencyLevelInput ? `Target proficiency level: ${proficiencyLevelInput}` : "",
                  proficiencyDescriptionInput ? `Proficiency description: ${proficiencyDescriptionInput}` : "",
                  `Course modality: ${modalityString}`,
                  // Add mapping context
                  `Teaching approach: ${selectedMappingValue} methodology`,
                  "Introduce key concepts and learning path for skill mastery"
                ],
                skill_integration: [
                  `Focus on core skill: ${skillNameInput}`,
                  `Connect skill: ${skillNameInput} to real-world applications in industry: ${industry || 'General'}`,
                  skillCategoryInput ? `Relate to skill category: ${skillCategoryInput}` : "",
                  skillSubCategoryInput ? `Address skill sub-category: ${skillSubCategoryInput}` : "",
                  // Add mapping integration
                  `Introduce ${selectedMappingValue} approach for skill: ${skillNameInput} development`
                ],
                // Add mapping-specific content
                mapping_integration: `Explain how ${selectedMappingValue} approach enhances ${skillNameInput} learning`
              },
              {
                position: 2,
                title_logic: `'Learning Objectives for skill: ${skillNameInput} Mastery'`,
                content_focus: [
                  `Targeted development outcomes for skill: ${skillNameInput}`,
                  `Importance of skill: ${skillNameInput} in ${industry || 'General'} industry`,
                  skillCategoryInput ? `Category alignment: ${skillCategoryInput}` : "",
                  "Facilitator guidance and session flow overview",
                  "Participant engagement expectations",
                  "Session timing and break structure",
                  // Add mapping-specific objectives
                  `How ${selectedMappingValue} approach supports skill: ${skillNameInput} mastery`,
                  "Define measurable skill development targets"
                ],
                skill_integration: [
                  `Define measurable skill: ${skillNameInput} development targets`,
                  `Connect skill to industry standards: ${industry || 'General'}`,
                  `Establish clear skill: ${skillNameInput} assessment criteria`,
                  // Add mapping integration
                  `Align objectives with ${selectedMappingValue} methodology`
                ],
                // Add mapping-specific planning
                mapping_objectives: `Set learning objectives that leverage ${selectedMappingValue} approach`
              },
              {
                position: -1, // Last slide
                title_logic: `'${skillNameInput} Mastery & Evaluation'`,
                content_focus: [
                  `Summary of skill: ${skillNameInput} development journey`,
                  "Key takeaways and competency achievements",
                  "Assessment and evaluation criteria",
                  "Next steps for continued skill development",
                  "Resources for ongoing learning",
                  // Add mapping context
                  `Evaluation through ${selectedMappingValue} approach`,
                  "Action plan for skill application in workplace"
                ],
                skill_integration: [
                  `Reinforce ${skillNameInput} competency development`,
                  `Connect skill: ${skillNameInput} to career advancement in industry: ${industry || 'General'}`,
                  skillCategoryInput ? `Highlight ${skillCategoryInput} expertise achieved` : "Highlight skill expertise achieved",
                  // Add mapping integration
                  `Final assessment using ${selectedMappingValue} methodology`
                ],
                // Add mapping-specific conclusion
                mapping_conclusion: `Evaluate skill mastery through ${selectedMappingValue} assessment methods`
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
              
              skill_focus_per_slide: [
                `Each slide should advance ${skillNameInput} competency`,
                "Connect content to industry applications",
                skillCategoryInput ? "Incorporate skill category concepts" : "Define skill components",
                "Use selected pedagogical approach",
                "Include practical examples and exercises"
              ]
            }
          },

          // Additional guidelines
          additional_guidelines: {
            content_quality: [
              "All content must be directly relevant to the specified skill",
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

      console.log("Generating skill-based course outline for:", skillNameInput);
      console.log("Model:", selectedModel);
      console.log("Slides:", slideCount);
      console.log("Pedagogical approach:", selectedMappingValue);

      // Call OpenRouter API
      let response;
      try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
                content: "You are an expert instructional designer and L&D manager specializing in creating comprehensive, competency-based training courses. You excel at designing courses that integrate pedagogical approaches with practical skill development. Your courses are well-structured, professionally written, and focused on measurable learning outcomes."
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
      } catch (fetchError) {
        console.error("Network error while calling OpenRouter:", fetchError);
        const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        throw new Error(`Network error: ${errorMsg}`);
      }

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
          skillName: skillNameInput,
          skillDescription: skillDescriptionInput,
          skillCategory: skillCategoryInput,
          skillSubCategory: skillSubCategoryInput,
          proficiencyLevel: proficiencyLevelInput,
          proficiencyDescription: proficiencyDescriptionInput,
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
      console.error("Error generating skill-based course outline:", error);
      
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
      endpoint: "generate-outline-skill",
      description: "Skill library based course outline generator",
      requiredInputs: [
        "jsonObject.selected_skill (required) - skill name"
      ],
      optionalInputs: [
        "jsonObject.skill_description (optional) - skill description",
        "jsonObject.skill_category (optional) - skill category",
        "jsonObject.skill_sub_category (optional) - skill sub category",
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
