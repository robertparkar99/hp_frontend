import { NextResponse } from "next/server";

// Define proper interfaces for KABA items
interface KabaItem {
  title: string;
  category?: string;
  subCategory?: string;
  [key: string]: any;
}

interface KabaArrays {
  knowledge: KabaItem[];
  ability: KabaItem[];
  attitude: KabaItem[];
  behaviour: KabaItem[];
}

// ✅ POST handler for generating course outlines securely on the server
export async function POST(req: Request) {
  try {
    // Parse input from frontend
    const { jsonObject, modality, aiModel } = await req.json();
    
    // Validate server-side API key (never exposed to client)
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
    
    //console.log("AI API KEY 28112025 : ", OPENROUTER_API_KEY);
    //console.log("jsonobject", jsonObject);

    // Dynamically build course prompt using jsonObject and modality
    const modalityString = [
      modality?.selfPaced && "Self-paced",
      modality?.instructorLed && "Instructor-led",
    ]
      .filter(Boolean)
      .join(", ");

    const keyTask = jsonObject?.key_tasks?.length > 0 ? jsonObject.key_tasks : "-";
    const criticalWorkFunction = jsonObject?.critical_work_function || "-";
    const industry = jsonObject?.industry || "-";
    const department = jsonObject?.department || "-";
    const jobRole = jsonObject?.jobrole || "-";
    const selectedSkill = jsonObject?.selectedSkill || {};
    const slideCount = jsonObject?.slideCount || 15;
    console.log("DEBUG: Before slideCount log");
    console.log("Number of Slides:", slideCount);
    console.log("DEBUG: After slideCount log");
    
    //console.log("jobrole", jobRole);
    //console.log("keyTask", keyTask);
    //console.log("criticalWorkFunction", criticalWorkFunction);

    // ✅ KABA - Improved parsing with better type safety
    const parseKabaItems = (items: any[] | undefined | null): KabaItem[] => {
      // Handle all edge cases
      if (!items || !Array.isArray(items)) {
        return [];
      }

      return items
        .filter(item => item != null && typeof item === 'object')
        .map(item => {
          // Handle different possible data structures
          const title = 
            item.title || 
            item.name || 
            item.value || 
            item.label || 
            item.text || 
            'Untitled';
          
          const category = item.category || item.type || item.group;
          const subCategory = item.subCategory || item.subType || item.subGroup;
          
          return {
            title,
            category,
            subCategory,
            // Include all other properties
            ...item
          };
        })
        .filter(item => item.title.trim() !== ''); // Remove empty items
    };

    // Parse all KABA arrays
    const parsedKnowledge = parseKabaItems(jsonObject?.knowledge);
    const parsedAbility = parseKabaItems(jsonObject?.ability);
    const parsedAttitude = parseKabaItems(jsonObject?.attitude);
    const parsedBehaviour = parseKabaItems(jsonObject?.behaviour);

    // Calculate totals
    const totalKabaItems = 
      parsedKnowledge.length + 
      parsedAbility.length + 
      parsedAttitude.length + 
      parsedBehaviour.length;

    // Format KABA titles for instruction - only include up to 3 per category for readability
    const formatKabaTitlesForInstruction = (items: KabaItem[]): string => {
      if (!items.length) return "Not provided";
      
      if (items.length <= 3) {
        return items.map(i => i.title).join(', ');
      }
      
      // If more than 3, show first 3 with count
      return `${items.slice(0, 3).map(i => i.title).join(', ')}, and ${items.length - 3} more`;
    };

    const knowledgeTitles = formatKabaTitlesForInstruction(parsedKnowledge);
    const abilityTitles = formatKabaTitlesForInstruction(parsedAbility);
    const attitudeTitles = formatKabaTitlesForInstruction(parsedAttitude);
    const behaviourTitles = formatKabaTitlesForInstruction(parsedBehaviour);

    // Format KABA items for display in kabaText (full list)
    const formatKabaFull = (title: string, items: KabaItem[]): string => {
      if (!items.length) return `${title}: Not provided\n`;

      return `${title} (${items.length} items):\n` + 
        items.map((item, index) => `  ${index + 1}. ${item.title}` + 
          (item.category ? ` [Category: ${item.category}]` : '') + 
          (item.subCategory ? ` [Sub-category: ${item.subCategory}]` : '')).join("\n") + "\n";
    };

    // Create comprehensive KABA text
    const kabaText = `
${formatKabaFull("Knowledge", parsedKnowledge)}
${formatKabaFull("Ability", parsedAbility)}
${formatKabaFull("Attitude", parsedAttitude)}
${formatKabaFull("Behaviour", parsedBehaviour)}
`.trim();

    const focusText = criticalWorkFunction
      ? `Critical Work Function: ${criticalWorkFunction}
Key Tasks: ${Array.isArray(keyTask) ? keyTask.join(", ") : keyTask || "-"}`
      : `Skill Focus: ${selectedSkill?.skillName || "-"}`;

    // Fixed instruction string - removed broken quotes and line breaks
    const instructionText = `You are an expert instructional designer and L&D manager specializing in the industry: ${industry} and department: ${department}. Your task is to design a complete, exactly ${slideCount}-slide ${modalityString} training course. The course must be a comprehensive, competency-based guide for the job role: ${jobRole} to master key tasks: (${keyTask}) within the critical work function: ${criticalWorkFunction}.

CRITICAL REQUIREMENT: You MUST integrate ALL provided KAAB competencies throughout the course:
- Knowledge (${parsedKnowledge.length} items): ${knowledgeTitles}
- Ability (${parsedAbility.length} items): ${abilityTitles}
- Attitude (${parsedAttitude.length} items): ${attitudeTitles}
- Behaviour (${parsedBehaviour.length} items): ${behaviourTitles}

IMPORTANT: You must use ALL items from ALL four KAAB categories. Do NOT just use the first items. Each slide should integrate 1-2 KAAB items naturally based on relevance.

For each competency, use this format: [Category: "category_value", Sub-category: "sub_category_value", Title: "title_value"]. Weave these competencies naturally into slide content. Track which items have been used and ensure comprehensive coverage. Ensure content is practical, professional, engaging, and strictly adheres to all provided formatting and content rules.`;

    const coursePrompt = {
      instruction: instructionText,

      output_format: {
        total_slides: `${slideCount}`,
        language: "Practical, professional, engaging, and competency-based",
        style: "Formal and structured",
        visuals: "No visuals, design elements, or styling instructions of any kind",
        repetition: "No repetition of content across slides",
        tone: `${modalityString}`,

        slide_structure: [
          "Slide X: [Appropriate Slide Title Based on Position]",
          "Slide X: [Appropriate Slide Description Based on Position]",
          "Followed by 5 to 6 concise bullet points.",
          "Each bullet point must be instructional, clear, and under 40 words.",
          "Use only plain text and hyphens for bullets. No markdown, symbols, or numbering.",
          "INTEGRATE KAAB COMPETENCIES naturally into bullet points where relevant.",
          "IMPORTANT: Use ALL KAAB items across the course, not just the first ones."
        ],

        // KAAB integration guidelines for ALL items
        kaab_integration: {
          knowledge: {
            placeholder: `${knowledgeTitles}`,
            total_items: `${parsedKnowledge.length}`,
            items_list: parsedKnowledge.map((item, index) => `${index + 1}. ${item.title}`),
            integration_guidance: [
              `Embed ALL ${parsedKnowledge.length} knowledge competencies into appropriate slides`,
              parsedKnowledge.length > 0 ? `Use ALL knowledge titles as listed above` : "No knowledge items provided",
              "Map categories to appropriate slide types",
              "Ensure NO knowledge items are left unused"
            ],
            example: parsedKnowledge.length > 0 ? `For '${parsedKnowledge[0].title}' (${parsedKnowledge[0].category || 'No category'}):\n` +
              "- Develop nursing care plans that align with established diagnostic protocols\n" +
              "- Apply procedural knowledge to create comprehensive patient care documentation" : "No knowledge example available"
          },
          ability: {
            placeholder: `${abilityTitles}`,
            total_items: `${parsedAbility.length}`,
            items_list: parsedAbility.map((item, index) => `${index + 1}. ${item.title}`),
            integration_guidance: [
              `Incorporate ALL ${parsedAbility.length} ability competencies into practical application slides`,
              "Focus on how EACH ability is demonstrated in task execution",
              "Connect ALL ability titles to observable performance indicators"
            ],
            example: parsedAbility.length > 0 ? `For '${parsedAbility[0].title}' (${parsedAbility[0].category || 'No category'}):\n` +
              "- Demonstrate precise wound care techniques while educating patients and families\n" +
              "- Apply psychomotor control when showing proper stoma care maintenance procedures" : "No ability example available"
          },
          attitude: {
            placeholder: `${attitudeTitles}`,
            total_items: `${parsedAttitude.length}`,
            items_list: parsedAttitude.map((item, index) => `${index + 1}. ${item.title}`),
            integration_guidance: [
              `Weave ALL ${parsedAttitude.length} attitude competencies into slides about mindset and approach`,
              `Highlight how EACH attitude affects task performance and outcomes`,
              `Use ALL attitude titles to shape behavioral expectations`
            ],
            example: parsedAttitude.length > 0 ? `For '${parsedAttitude[0].title}' (${parsedAttitude[0].category || 'No category'}):\n` +
              "- Demonstrate initiative by anticipating medication needs before formal requests\n" +
              "- Proactively coordinate with pharmacy to prevent treatment delays" : "No attitude example available"
          },
          behaviour: {
            placeholder: `${behaviourTitles}`,
            total_items: `${parsedBehaviour.length}`,
            items_list: parsedBehaviour.map((item, index) => `${index + 1}. ${item.title}`),
            integration_guidance: [
              `Integrate ALL ${parsedBehaviour.length} behaviour competencies into slides about interactions and standards`,
              `Show how EACH behavior manifests in daily work activities`,
              `Connect ALL behaviour titles to performance expectations and evaluation criteria`
            ],
            example: parsedBehaviour.length > 0 ? `For '${parsedBehaviour[0].title}' (${parsedBehaviour[0].category || 'No category'}):\n` +
              "- Exercise customer empathy by meticulously compiling medication lists for seamless care continuity\n" +
              "- Demonstrate stakeholder focus through accurate, patient-centered documentation" : "No behaviour example available"
          },

          // Comprehensive integration tracking
          comprehensive_requirement: {
            must_use_all: "YES - Use ALL items from ALL four KAAB categories",
            total_kaab_items: `${totalKabaItems} items to distribute`,
            distribution_strategy: "Spread items evenly across ALL slides based on relevance",
            tracking_method: "Keep mental checklist to ensure no KAAB items are omitted",
            verification: `Before finalizing, verify ALL ${totalKabaItems} items have been incorporated`
          }
        },

        // Dynamic slide generation with COMPLETE KAAB integration
        slide_sequence_logic: {
          // Core required slides (always included in this order)
          required_slides: [
            {
              position: 1,
              title_logic: `'Training course for Mastering ' + ${jobRole}`,
              content_focus: [
                `Overview of key tasks: (${keyTask})`,
                `Relevance to critical work function: ${criticalWorkFunction}`,
                `Industry context: ${industry}`,
                `Department: ${department}`,
                `Course modality: ${modalityString}`,
                "INTEGRATE: Introduce a selection of KAAB competencies from ALL categories"
              ],
              kaab_integration_plan: [
                parsedKnowledge.length > 0 ? `Include knowledge items: Start with ${parsedKnowledge[0].title}` : "No knowledge items to include",
                parsedAbility.length > 0 ? `Include ability items: Start with ${parsedAbility[0].title}` : "No ability items to include",
                parsedAttitude.length > 0 ? `Include attitude items: Start with ${parsedAttitude[0].title}` : "No attitude items to include",
                parsedBehaviour.length > 0 ? `Include behaviour items: Start with ${parsedBehaviour[0].title}` : "No behaviour items to include",
                "Balance representation from ALL KAAB categories"
              ]
            },
            {
              position: 2,
              title_logic: "'Learning Objectives & Modality Instructions'",
              content_focus: [
                `Targeted outcomes for mastering (${keyTask})`,
                "Importance of monitoring and evaluation",
                "Facilitator guidance and session flow overview",
                "Participant engagement expectations",
                "Session timing and break structure",
                "INTEGRATE: Link objectives to development of ALL KAAB competencies"
              ],
              kaab_integration_plan: [
                parsedKnowledge.length > 1 ? `Connect objectives to knowledge development: ${parsedKnowledge[1]?.title}` : "No knowledge items for objectives",
                parsedAbility.length > 1 ? `Link to ability enhancement: ${parsedAbility[1]?.title}` : "No ability items for objectives",
                parsedAttitude.length > 1 ? `Relate to attitude cultivation: ${parsedAttitude[1]?.title}` : "No attitude items for objectives",
                parsedBehaviour.length > 1 ? `Tie to behavior expectations: ${parsedBehaviour[1]?.title}` : "No behaviour items for objectives"
              ]
            },
            {
              position: -1, // Last slide
              title_logic: "'Completion Criteria & Evaluation'",
              content_focus: [
                `Final verification for key tasks: (${keyTask})`,
                "Quality assurance checkpoints",
                "Facilitator sign-off checklist",
                "Competency assessment methods",
                "Continuous improvement planning",
                "INTEGRATE: Evaluate mastery of ALL KAAB competencies covered"
              ],
              kaab_integration_plan: [
                "Assess application of remaining knowledge items",
                "Verify demonstration of remaining ability items",
                "Evaluate remaining attitude items",
                "Measure remaining behaviour items",
                "Ensure ALL KAAB items have been addressed somewhere in the course"
              ]
            }
          ],

          // Middle slides - dynamically allocated based on slideCount
          dynamic_slides: [
            {
              template_id: "contextualization",
              title_logic: "'Task Contextualization'",
              content_focus: [
                `Role of key tasks: (${keyTask}) within critical work function: ${criticalWorkFunction}`,
                `Industry context: ${industry}`,
                "Dependencies and prerequisites",
                "Stakeholders or systems involved",
                "Impact on organizational goals",
                "INTEGRATE: Show how KAAB competencies support task context"
              ],
              priority: 1,
              kaab_integration_plan: [
                parsedKnowledge.length > 2 ? `Use knowledge: ${parsedKnowledge[2]?.title}` : "No knowledge items for context",
                parsedAbility.length > 2 ? `Use ability: ${parsedAbility[2]?.title}` : "No ability items for context",
                parsedAttitude.length > 2 ? `Use attitude: ${parsedAttitude[2]?.title}` : "No attitude items for context",
                parsedBehaviour.length > 2 ? `Use behaviour: ${parsedBehaviour[2]?.title}` : "No behaviour items for context"
              ]
            }
          ],

          // KAAB distribution and tracking strategy
          kaab_distribution_tracking: {
            requirement: "MUST use ALL items from all four KAAB arrays",
            total_items_track: `Knowledge: ${parsedKnowledge.length}, Ability: ${parsedAbility.length}, Attitude: ${parsedAttitude.length}, Behaviour: ${parsedBehaviour.length}`,
            distribution_logic: "Spread items across slides based on relevance, not rigid rotation",
            tracking_system: "Mentally track which items from each array have been used",
            completion_check: `Before final slide, verify all ${totalKabaItems} items integrated`,
            avoidance: "Do not cluster items - distribute evenly throughout the course"
          }
        },

        // Example showing COMPLETE integration
        example_complete_coverage: {
          using_your_sample: `With ${parsedKnowledge.length} knowledge, ${parsedAbility.length} ability, ${parsedAttitude.length} attitude, ${parsedBehaviour.length} behaviour items`,
          coverage_plan: [
            parsedKnowledge.length > 0 && parsedAbility.length > 0 && parsedAttitude.length > 0 && parsedBehaviour.length > 0 
              ? `Slide 1: Use ${parsedKnowledge[0].title}, ${parsedAbility[0].title}, ${parsedAttitude[0].title}, ${parsedBehaviour[0].title}` 
              : "Slide 1: Use available KAAB items",
            parsedKnowledge.length > 1 && parsedAbility.length > 1 && parsedAttitude.length > 1 && parsedBehaviour.length > 1 
              ? `Slide 2: Use ${parsedKnowledge[1]?.title}, ${parsedAbility[1]?.title}, ${parsedAttitude[1]?.title}, ${parsedBehaviour[1]?.title}` 
              : "Slide 2: Use available KAAB items"
          ],
          final_check: `After all slides, verify all ${totalKabaItems} items have been naturally integrated`
        }
      }
    };
    console.log("By AJ");

    console.log("Generated Course Prompt:", JSON.stringify(coursePrompt, null, 2));
    console.log("KABA Summary:", {
      knowledge: { count: parsedKnowledge.length, items: parsedKnowledge.map(k => k.title) },
      ability: { count: parsedAbility.length, items: parsedAbility.map(a => a.title) },
      attitude: { count: parsedAttitude.length, items: parsedAttitude.map(a => a.title) },
      behaviour: { count: parsedBehaviour.length, items: parsedBehaviour.map(b => b.title) },
      total: totalKabaItems
    });

    // Prepare request payload for OpenRouter API
    const requestData = {
      model: aiModel || "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            `You are an AI specialized in generating clean, well-formatted course slide outlines. Format Requirements: Use 'Slide X:' followed by the slide title & descriptionwith no bold text, no italics, no parentheses, and no special characters. Use simple bullet points under each slide. Do not add symbols such as *, **, (), [], {}, emojis, or decorative formatting. Do not format text as Markdown headings. Output must be plain text only. Keep bullet points clear, concise, and instructional. Maintain consistent tone across all slides. Do not add additional commentary, notes, or explanations before or after the slides. Only output the formatted slides.

            Example format:

            Slide 1: Topic Name
            Bullet point one
            Bullet point two
            Bullet point three

            Slide 2: Next Topic
            Bullet point one
            Bullet point two
            Bullet point three

            Ensure the final output strictly follows this structure.`,
        },
        {
          role: "user",
          content: JSON.stringify(coursePrompt, null, 2),
        },
      ],
      max_tokens: 4000,
      temperature: 0.0,
      top_p: 0.0,
      top_k: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      repetition_penalty: 0.0,
      seed: 12345,
    };

    //console.log("🚀 Sending request to OpenRouter with model:", aiModel);
    // Call OpenRouter API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "AI Course Generator",
        },
        body: JSON.stringify(requestData),
      }
    );

    // Handle errors from OpenRouter
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API Error:", errorText);

      return NextResponse.json(
        {
          error: `OpenRouter API call failed (${response.status})`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Parse result
    const text = await response.text();
    let result: any;

    try {
      result = JSON.parse(text);
    } catch {
      console.error("⚠️ Could not parse JSON, returning raw text.");
      result = { rawText: text };
    }

    const generatedContent =
      result?.choices?.[0]?.message?.content || result?.rawText;

    if (!generatedContent) {
      return NextResponse.json(
        {
          error: "No content generated by the AI model.",
          raw: result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      model: aiModel,
      content: generatedContent,
      kaabSummary: {
        knowledgeCount: parsedKnowledge.length,
        abilityCount: parsedAbility.length,
        attitudeCount: parsedAttitude.length,
        behaviourCount: parsedBehaviour.length,
        totalKabaItems
      }
    });
  } catch (error: any) {
    console.error("⚠️ Server-side course generation error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Internal server error during course generation.",
      },
      { status: 500 }
    );
  }
}