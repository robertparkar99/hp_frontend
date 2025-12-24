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
    const { jsonObject, modality, aiModel, mappingType, mappingValue, mappingReason, mappingTypeName, mappingValueName } = await req.json();
    
    // Validate server-side API key (never exposed to client)
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

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
    const selectedSkill =
      jsonObject?.selectedSkill ||
      jsonObject?.skill ||
      jsonObject?.selected_skill ||
      (Array.isArray(jsonObject?.selectedSkills)
        ? jsonObject.selectedSkills[0]
        : {}) ||
      {};

    // normalize keys from frontend / DB
    const skillName =
      selectedSkill.skillName ||
      selectedSkill.SkillName ||
      selectedSkill.name ||
      "";

    const skillDescription =
      selectedSkill.description ||
      selectedSkill.Description ||
      "";

    const skillProficiency =
      selectedSkill.proficiency_level ||
      selectedSkill.proficiency ||
      "";

    const skillCategory =
      selectedSkill.category ||
      "";

    const skillsubCategory =
      selectedSkill.sub_category ||
      selectedSkill.subCategory ||
      "";

    const slideCount = jsonObject?.slideCount || 15;
    console.log("Number of Slides:", slideCount);

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

    // Format selected skill for instruction using the parsed individual fields
    const formatSelectedSkill = (): string => {
      const parts = [];
      if (skillName) parts.push(`Skill: ${skillName}`);
      if (skillDescription) parts.push(`Description: ${skillDescription}`);
      if (skillProficiency) parts.push(`Proficiency: ${skillProficiency}`);
      if (skillCategory) parts.push(`Category: ${skillCategory}`);
      if (skillsubCategory) parts.push(`Sub-category: ${skillsubCategory}`);

      return parts.length > 0 ? parts.join(', ') : "Not provided";
    };

    // Create comprehensive KABA text
    const kabaText = `
${formatKabaFull("Knowledge", parsedKnowledge)}
${formatKabaFull("Ability", parsedAbility)}
${formatKabaFull("Attitude", parsedAttitude)}
${formatKabaFull("Behaviour", parsedBehaviour)}
`.trim();

    const selectedSkillText = formatSelectedSkill();

    const focusText = selectedSkillText && selectedSkillText !== "Not provided"
      ? `Selected Skill: ${selectedSkillText}
 Key Tasks: ${Array.isArray(keyTask) ? keyTask.join(", ") : keyTask || "-"}
 Critical Work Function: ${criticalWorkFunction}`
      : `Critical Work Function: ${criticalWorkFunction}
 Key Tasks: ${Array.isArray(keyTask) ? keyTask.join(", ") : keyTask || "-"}`;

    // Fixed instruction string - removed broken quotes and line breaks
    const instructionTaskText = `You are an expert instructional designer and L&D manager specializing in the industry: ${industry} and department: ${department}. Your task is to design a complete, exactly ${slideCount}-slide ${modalityString} training course. The course must be a comprehensive, competency-based guide for the job role: ${jobRole} to master key tasks: (${keyTask}) within the critical work function: ${criticalWorkFunction}`;

    const instructionSkillText = `You are an expert instructional designer and L&D manager specializing in the industry: ${industry} and department: ${department}. Your task is to design a complete, exactly ${slideCount}-slide ${modalityString} training course focused on mastering the skill: ${skillName} for the job role: ${jobRole}. The course must be a comprehensive, competency-based guide to develop the selected skill: ${skillName}`;

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
        // Add other mapping types here as needed
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

    // Then integrate in your prompt:
    // Use the names sent from the frontend (mappingTypeName and mappingValueName)
    // These contain the actual display names that the user selected
    const selectedMappingType = mappingTypeName || "pedagogical process";
    const selectedMappingValue = mappingValueName || "Project-Based";
    const mappingGuidance = getMappingGuidance(selectedMappingType, selectedMappingValue);
    
    // Use provided reason or fall back to generated one
    const reason = mappingReason || mappingGuidance.reason;

    // Determine which prompt to generate based on user configuration
    const hasValidSkillData = Boolean(skillName);
    const hasValidKeyTasks = keyTask && keyTask !== "-" && Array.isArray(keyTask) && keyTask.length > 0;

    // Only generate and log the appropriate prompt based on configuration
    let promptToUse: any;

    if (hasValidSkillData) {
      // Skill configuration selected - use singleSkillPrompt
      const singleSkillPrompt = {
        instruction: instructionSkillText,
        output_format: {
          total_slides: `${slideCount}`,
          language: "Practical, professional, engaging, and competency-based",
          style: "Formal and structured",
          visuals: "No visuals, design elements, or styling instructions of any kind",
          repetition: "No repetition of content across slides",
          tone: `${modalityString}`,
          
          // NEW: Add mapping context
          pedagogical_approach: {
            mapping_type: selectedMappingType,
            mapping_value: selectedMappingValue,
            context: `Using ${selectedMappingValue} approach for skill: ${skillName} development`,
            reason: reason
          },
          
          slide_structure: [
            "Slide X: [Appropriate Slide Title Based on Position]",
            "Slide X: [Appropriate Slide Description Based on Position]",
            "Followed by 5 to 6 concise bullet points.",
            "Each bullet point must be instructional, clear, and under 40 words.",
            "Use only plain text and hyphens for bullets. No markdown, symbols, or numbering.",
            "INTEGRATE KAAB COMPETENCIES naturally into bullet points where relevant.",
            "IMPORTANT: Use ALL KAAB items across the course, not just the first ones.",
            // NEW: Add mapping integration instruction
            `ALIGN content with ${selectedMappingValue} approach for skill: ${skillName} mastery`
          ],

          // Skill metadata for single skill focus
          skill_metadata: {
            name: `${skillName}`,
            category: `${skillCategory}`,
            sub_category: `${skillsubCategory}`,
            proficiency_level: `${skillProficiency}`,
            description: `${skillDescription}`,
            job_role_context: `${jobRole}`,
            industry_context: `${industry}`,
            department_context: `${department}`,
            // NEW: Add pedagogical approach to metadata
            teaching_methodology: `${selectedMappingType}: ${selectedMappingValue}`
          },

          // NEW: Mapping integration guidance specific to skill development
          mapping_integration: {
            type: selectedMappingType,
            value: selectedMappingValue,
            
            skill_specific_guidance: [
              `Apply ${selectedMappingValue} approach to develop skill: ${skillName}`,
              `Design learning activities for ${skillName} using ${selectedMappingValue} methodology`,
              `Structure skill progression from basic to ${skillProficiency} using ${selectedMappingValue} principles`,
              `Assess ${skillName} mastery through ${selectedMappingValue} evaluation methods`
            ],
            
            // Pedagogical approach implementation for skill development
            pedagogical_implementation: {
              "Inquiry-Based": [
                `Frame ${skillName} development around investigative questions and discovery`,
                "Encourage questioning and exploration of skill applications",
                "Design skill practice as problem-solving investigations",
                "Assess skill through inquiry-based challenges and scenarios"
              ],
              "Experiential-Based": [
                `Connect ${skillName} theory to hands-on practice and reflection`,
                "Design experiential learning activities for skill application",
                "Use real-world simulations to practice skill in context",
                "Assess skill through experiential performance and reflection"
              ],
              "Art-Integrated": [
                `Use creative approaches to explore and develop ${skillName}`,
                "Incorporate artistic elements into skill practice and application",
                "Encourage metaphorical thinking about skill development",
                "Assess skill through creative expression and innovative application"
              ],
              "Project-Based": [
                `Structure ${skillName} development around a central project`,
                "Design project milestones that require skill application",
                "Use project deliverables to demonstrate skill mastery",
                "Assess skill through project outcomes and process management"
              ],
              "Scenario-Based": [
                `Develop ${skillName} through realistic scenarios and case studies`,
                "Use contextual scenarios to practice skill application",
                "Design decision-making exercises that require skill use",
                "Assess skill through scenario resolution and performance"
              ]
            },
            
            integration_rules: [
              `The ${selectedMappingValue} approach must guide ${skillName} development throughout`,
              "Align skill practice activities with selected pedagogical methodology",
              "Use approach-specific terminology and concepts in skill instruction",
              "Ensure skill assessment methods match the pedagogical approach"
            ]
          },

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
                "Ensure NO knowledge items are left unused",
                `Connect knowledge items to skill: ${skillName} development`,
                // NEW: Add mapping context
                `Integrate knowledge through ${selectedMappingValue} learning approach`
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
                "Connect ALL ability titles to observable performance indicators",
                `Link abilities to skill: ${skillName} demonstration`,
                // NEW: Add mapping context
                `Develop abilities using ${selectedMappingValue} practice methods`
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
                `Highlight how EACH attitude affects performance and outcomes`,
                `Use ALL attitude titles to shape behavioral expectations`,
                `Connect attitudes to mastering skill: ${skillName}`,
                // NEW: Add mapping context
                `Cultivate attitudes through ${selectedMappingValue} learning experiences`
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
                `Connect ALL behaviour titles to performance expectations and evaluation criteria`,
                `Link behaviors to effective application of skill: ${skillName}`,
                // NEW: Add mapping context
                `Practice behaviors through ${selectedMappingValue} instructional activities`
              ],
              example: parsedBehaviour.length > 0 ? `For '${parsedBehaviour[0].title}' (${parsedBehaviour[0].category || 'No category'}):\n` +
                "- Exercise customer empathy by meticulously compiling medication lists for seamless care continuity\n" +
                "- Demonstrate stakeholder focus through accurate, patient-centered documentation" : "No behaviour example available"
            },

            // Comprehensive integration tracking
            comprehensive_requirement: {
              must_use_all: "YES - Use ALL items from ALL four KAAB categories",
              total_kaab_items: `${totalKabaItems} items to distribute`,
              distribution_strategy: `Spread items evenly across ALL slides based on relevance to skill: ${skillName}`,
              tracking_method: "Keep mental checklist to ensure no KAAB items are omitted",
              verification: `Before finalizing, verify ALL ${totalKabaItems} items have been incorporated with skill: ${skillName}`,
              // NEW: Add mapping context
              pedagogical_context: `Using ${selectedMappingValue} approach for KAAB integration with skill: ${skillName}`
            }
          },

          // SINGLE SKILL SLIDE GENERATION with COMPLETE KAAB integration
          slide_sequence_logic: {
            // Core required slides (always included in this order)
            required_slides: [
              {
                position: 1,
                title_logic: `'Mastering skill: ${skillName} for ${jobRole}'`,
                content_focus: [
                  `Overview of skill: ${skillName} development for jobrole: ${jobRole}`,
                  `Industry context: ${industry} requirements for skill: ${skillName}`,
                  `Departmental focus: ${department} applications of skill: ${skillName}`,
                  `Course modality: ${modalityString}`,
                  `Target proficiency level: ${skillProficiency}`,
                  // NEW: Add mapping context
                  `Teaching approach: ${selectedMappingValue} methodology`,
                  "INTEGRATE: Introduce a selection of KAAB competencies from ALL categories relevant to skill: ${skillName}"
                ],
                skill_integration: [
                  `Focus on core skill: ${skillName}`,
                  `Connect skill: ${skillName} to real-world applications in industry: ${industry}`,
                  `Highlight skill category: ${skillCategory} & subcategory: ${skillsubCategory} as critical for success`,
                  // NEW: Add mapping integration
                  `Introduce ${selectedMappingValue} approach for skill: ${skillName} development`
                ],
                // NEW: Add mapping-specific content
                mapping_integration: `Explain how ${selectedMappingValue} approach enhances ${skillName} learning`,
                kaab_integration_plan: [
                  parsedKnowledge.length > 0 ? `Include knowledge items relevant to skill: ${skillName}: Start with ${parsedKnowledge[0].title}` : "No knowledge items to include",
                  parsedAbility.length > 0 ? `Include ability items relevant to skill: ${skillName}: Start with ${parsedAbility[0].title}` : "No ability items to include",
                  parsedAttitude.length > 0 ? `Include attitude items relevant to skill: ${skillName}: Start with ${parsedAttitude[0].title}` : "No attitude items to include",
                  parsedBehaviour.length > 0 ? `Include behaviour items relevant to skill: ${skillName}: Start with ${parsedBehaviour[0].title}` : "No behaviour items to include",
                  "Balance representation from ALL KAAB categories relevant to skill: ${skillName} development",
                  // NEW: Add mapping context
                  `Frame KAAB integration within ${selectedMappingValue} approach`
                ]
              },
              {
                position: 2,
                title_logic: `'Learning Objectives for skill: ${skillName} Mastery'`,
                content_focus: [
                  `Targeted development outcomes for skill: ${skillName}`,
                  `Proficiency level expectations: ${skillProficiency}`,
                  `Importance of skill: ${skillName} monitoring and evaluation`,
                  "Facilitator guidance and session flow overview",
                  "Participant engagement expectations",
                  "Session timing and break structure",
                  // NEW: Add mapping-specific objectives
                  `How ${selectedMappingValue} approach supports skill: ${skillName} mastery`,
                  "INTEGRATE: Link objectives to development of ALL KAAB competencies through skill: ${skillName}"
                ],
                skill_integration: [
                  `Define measurable skill: ${skillName} development targets`,
                  `Connect skill proficiency level: ${skillProficiency} to skill: ${skillName} learning outcomes`,
                  `Establish clear skill: ${skillName} assessment criteria`,
                  // NEW: Add mapping integration
                  `Align objectives with ${selectedMappingValue} methodology`
                ],
                // NEW: Add mapping-specific planning
                mapping_objectives: `Set learning objectives that leverage ${selectedMappingValue} approach`,
                kaab_integration_plan: [
                  parsedKnowledge.length > 1 ? `Connect objectives to knowledge development for skill: ${skillName}: ${parsedKnowledge[1]?.title}` : "No knowledge items for objectives",
                  parsedAbility.length > 1 ? `Link to ability enhancement for skill: ${skillName}: ${parsedAbility[1]?.title}` : "No ability items for objectives",
                  parsedAttitude.length > 1 ? `Relate to attitude cultivation for skill: ${skillName}: ${parsedAttitude[1]?.title}` : "No attitude items for objectives",
                  parsedBehaviour.length > 1 ? `Tie to behavior expectations for skill: ${skillName}: ${parsedBehaviour[1]?.title}` : "No behaviour items for objectives",
                  // NEW: Add mapping context
                  `Use ${selectedMappingValue} approach to achieve KAAB competency objectives`
                ]
              },
              {
                position: -1, // Last slide
                title_logic: `skill: '${skillName} Mastery & Evaluation'`,
                content_focus: [
                  `Final skill: ${skillName} proficiency verification`,
                  `Quality assurance checkpoints for skill: ${skillName} application`,
                  "Facilitator sign-off checklist",
                  "Competency assessment methods",
                  `Continuous improvement planning for skill: ${skillName} development`,
                  // NEW: Add mapping evaluation
                  `Evaluation methods aligned with ${selectedMappingValue} approach`,
                  "INTEGRATE: Evaluate mastery of ALL KAAB competencies through skill: ${skillName}"
                ],
                skill_integration: [
                  `Assess application of skill: ${skillName} in practical scenarios`,
                  `Verify achievement of ${skillProficiency} proficiency level`,
                  `Establish ongoing skill: ${skillName} development pathways`,
                  // NEW: Add mapping integration
                  `Use ${selectedMappingValue}-appropriate assessment methods`
                ],
                // NEW: Add mapping evaluation
                mapping_evaluation: `Design final assessment using ${selectedMappingValue} principles`,
                kaab_integration_plan: [
                  "Assess application of remaining knowledge items through skill: ${skillName}",
                  "Verify demonstration of remaining ability items through skill: ${skillName}",
                  "Evaluate remaining attitude items in skill: ${skillName} context",
                  "Measure remaining behaviour items in skill: ${skillName} application",
                  "Ensure ALL KAAB items have been addressed through skill: ${skillName} development",
                  // NEW: Add mapping context
                  `Use ${selectedMappingValue} assessment methods for KAAB competency evaluation`
                ]
              }
            ],

            // Middle slides - focused on single skill development with mapping integration
            dynamic_slides: [
              {
                template_id: "skill_foundations",
                title_logic: `'skill: ${skillName}: Core Foundations'`,
                content_focus: [
                  `Essential technical and professional aspects of skill: ${skillName}`,
                  `skill category: ${skillCategory} & subcategory: ${skillsubCategory} categorization and hierarchy`,
                  `Prerequisite relationships for skill: ${skillName}`,
                  `Foundational approaches to developing skill: ${skillName}`,
                  // NEW: Add mapping context
                  `Using ${selectedMappingValue} approach for foundational learning`,
                  `INTEGRATE: Show how KAAB competencies support skill: ${skillName} foundations`
                ],
                skill_integration: [
                  `Focus on foundational aspects of skill: ${skillName}`,
                  `Organize by skill category: ${skillCategory} & subcategory: ${skillsubCategory} structure`,
                  `Address basic to intermediate proficiency levels for skill: ${skillName}`,
                  // NEW: Add mapping integration
                  `Apply ${selectedMappingValue} principles to foundational skill development`
                ],
                // NEW: Add mapping-specific guidance
                mapping_foundations: `Teach basic ${skillName} concepts using ${selectedMappingValue} methods`,
                priority: 1,
                kaab_integration_plan: [
                  parsedKnowledge.length > 2 ? `Use knowledge relevant to skill: ${skillName}: ${parsedKnowledge[2]?.title}` : "No knowledge items for foundations",
                  parsedAbility.length > 2 ? `Use ability relevant to skill: ${skillName}: ${parsedAbility[2]?.title}` : "No ability items for foundations",
                  parsedAttitude.length > 2 ? `Use attitude relevant to skill: ${skillName}: ${parsedAttitude[2]?.title}` : "No attitude items for foundations",
                  parsedBehaviour.length > 2 ? `Use behaviour relevant to skill: ${skillName}: ${parsedBehaviour[2]?.title}` : "No behaviour items for foundations",
                  // NEW: Add mapping context
                  `Integrate KAAB through ${selectedMappingValue} foundational activities`
                ]
              },
              {
                template_id: "skill_application",
                title_logic: `'skill: ${skillName}: Practical Application'`,
                content_focus: [
                  `Real-world application of skill: ${skillName}`,
                  `Industry-specific: ${industry} requirements for skill: ${skillName}`,
                  `Departmental: ${department} expectations for skill: ${skillName}`,
                  `Problem-solving using skill: ${skillName}`,
                  // NEW: Add mapping context
                  `Applying ${selectedMappingValue} approach to skill practice`,
                  `INTEGRATE: Demonstrate KAAB competencies in skill: ${skillName} application`
                ],
                skill_integration: [
                  `Apply skill: ${skillName} to practical scenarios and case studies`,
                  `Connect skill: ${skillName} to industry: ${industry} and department: ${department} needs`,
                  `Address advanced proficiency levels for skill: ${skillName}`,
                  // NEW: Add mapping integration
                  `Use ${selectedMappingValue} activities for skill application practice`
                ],
                // NEW: Add mapping-specific application
                mapping_application: `Design ${selectedMappingValue} activities for ${skillName} practice`,
                priority: 2,
                kaab_integration_plan: [
                  parsedKnowledge.length > 3 ? `Use knowledge in skill: ${skillName} application: ${parsedKnowledge[3]?.title}` : "No knowledge items for application",
                  parsedAbility.length > 3 ? `Use ability in skill: ${skillName} application: ${parsedAbility[3]?.title}` : "No ability items for application",
                  parsedAttitude.length > 3 ? `Use attitude in skill: ${skillName} application: ${parsedAttitude[3]?.title}` : "No attitude items for application",
                  parsedBehaviour.length > 3 ? `Use behaviour in skill: ${skillName} application: ${parsedBehaviour[3]?.title}` : "No behaviour items for application",
                  // NEW: Add mapping context
                  `Demonstrate KAAB competencies through ${selectedMappingValue} application tasks`
                ]
              },
              {
                template_id: "skill_advancement",
                title_logic: `'skill: ${skillName}: Advanced Development'`,
                content_focus: [
                  `Mastery-level development of skill: ${skillName}`,
                  `Complex skill: ${skillName} integration`,
                  `Leadership and mentoring in skill: ${skillName}`,
                  `Continuous professional development for skill: ${skillName}`,
                  // NEW: Add mapping context
                  `Advanced ${selectedMappingValue} techniques for skill mastery`,
                  `INTEGRATE: Advanced KAAB competency integration through skill: ${skillName}`
                ],
                skill_integration: [
                  `Focus on expert proficiency level for skill: ${skillName}`,
                  `Address complex skill: ${skillName} combinations`,
                  `Develop skill: ${skillName} leadership and teaching capabilities`,
                  // NEW: Add mapping integration
                  `Use ${selectedMappingValue} for advanced skill development`
                ],
                // NEW: Add mapping-specific advancement
                mapping_advancement: `Apply ${selectedMappingValue} for mastery-level ${skillName} development`,
                priority: 3,
                kaab_integration_plan: [
                  parsedKnowledge.length > 4 ? `Use knowledge for skill: ${skillName} mastery: ${parsedKnowledge[4]?.title}` : "No knowledge items for advancement",
                  parsedAbility.length > 4 ? `Use ability for skill: ${skillName} mastery: ${parsedAbility[4]?.title}` : "No ability items for advancement",
                  parsedAttitude.length > 4 ? `Use attitude for skill: ${skillName} mastery: ${parsedAttitude[4]?.title}` : "No attitude items for advancement",
                  parsedBehaviour.length > 4 ? `Use behaviour for skill: ${skillName} mastery: ${parsedBehaviour[4]?.title}` : "No behaviour items for advancement",
                  // NEW: Add mapping context
                  `Integrate advanced KAAB competencies through ${selectedMappingValue} mastery activities`
                ]
              }
            ],

            // NEW: Mapping-specific skill development slides
            mapping_specific_slides: selectedMappingValue === "Project-Based" ? [
              {
                title: `Project-Based ${skillName} Development`,
                focus: `Design a project that requires comprehensive ${skillName} application`,
                kaab_integration: "Map project phases to specific KAAB competency development"
              },
              {
                title: `${skillName} Project Execution`,
                focus: `Guide participants through applying ${skillName} in project context`,
                kaab_integration: "Assess KAAB competencies through project deliverables"
              }
            ] : selectedMappingValue === "Scenario-Based" ? [
              {
                title: `${skillName} Scenario Challenges`,
                focus: `Present scenarios requiring strategic ${skillName} application`,
                kaab_integration: "Embed KAAB competencies within scenario resolution"
              },
              {
                title: `Scenario-Based ${skillName} Assessment`,
                focus: `Evaluate ${skillName} proficiency through scenario performance`,
                kaab_integration: "Assess KAAB competencies through scenario outcomes"
              }
            ] : [], // Add other approaches as needed

            // SINGLE SKILL GENERATION LOGIC with mapping integration
            single_skill_generation: {
              skill_focus: `${skillName}`,
              category_context: `${skillCategory} > ${skillsubCategory}`,
              proficiency_progression: `Structure content from basic to ${skillProficiency} proficiency levels`,
              skill_kaab_mapping: `Map skill: ${skillName} to relevant KAAB competencies`,
              coverage_requirement: `Ensure comprehensive coverage of skill: ${skillName} at ${skillProficiency} proficiency level`,
              // NEW: Add pedagogical approach
              pedagogical_approach: `Use ${selectedMappingValue} methodology for ${skillName} development`,
              teaching_strategy: `Apply ${selectedMappingType}: ${selectedMappingValue} throughout skill development process`
            },

            // KAAB distribution and tracking strategy
            kaab_distribution_tracking: {
              requirement: "MUST use ALL items from all four KAAB arrays",
              total_items_track: `Knowledge: ${parsedKnowledge.length}, Ability: ${parsedAbility.length}, Attitude: ${parsedAttitude.length}, Behaviour: ${parsedBehaviour.length}`,
              distribution_logic: `Spread items across slides based on skill: ${skillName} relevance, not rigid rotation`,
              tracking_system: "Mentally track which items from each array have been used",
              completion_check: `Before final slide, verify all ${totalKabaItems} items integrated through skill: ${skillName}`,
              avoidance: "Do not cluster items - distribute evenly throughout skill: ${skillName} development",
              // NEW: Add mapping context
              pedagogical_distribution: `Distribute KAAB items using ${selectedMappingValue} learning sequence`
            }
          },

          // Example showing COMPLETE integration with single skill
          example_complete_coverage: {
            skill_context: `Focusing on skill: ${skillName}, skill category: (${skillCategory}) & skill subcategory: ${skillsubCategory}) at ${skillProficiency} level`,
            pedagogical_context: `Using ${selectedMappingValue} approach for skill development`,
            using_your_sample: `With ${parsedKnowledge.length} knowledge, ${parsedAbility.length} ability, ${parsedAttitude.length} attitude, ${parsedBehaviour.length} behaviour items`,
            coverage_plan: [
              parsedKnowledge.length > 0 && parsedAbility.length > 0 && parsedAttitude.length > 0 && parsedBehaviour.length > 0
                ? `Slide 1: Use ${parsedKnowledge[0].title}, ${parsedAbility[0].title}, ${parsedAttitude[0].title}, ${parsedBehaviour[0].title} with foundational ${skillName}`
                : `Slide 1: Use available KAAB items with ${skillName}`,
              parsedKnowledge.length > 1 && parsedAbility.length > 1 && parsedAttitude.length > 1 && parsedBehaviour.length > 1
                ? `Slide 2: Use ${parsedKnowledge[1]?.title}, ${parsedAbility[1]?.title}, ${parsedAttitude[1]?.title}, ${parsedBehaviour[1]?.title} with applied ${skillName}`
                : `Slide 2: Use available KAAB items with ${skillName}`
            ],
            skill_kaab_integration: `For ${skillName}, identify relevant KAAB competencies and integrate them naturally`,
            mapping_integration_example: `For ${selectedMappingValue}: Design ${skillName} activities using inquiry-based questions, experiential practice, creative approaches, project milestones, or scenario challenges as appropriate`,
            final_check: `After all slides, verify all ${totalKabaItems} items have been naturally integrated with ${skillName} development using ${selectedMappingValue} approach`
          }
        }
      };
      
      console.log("Generated Single Skill Prompt with Mapping Integration");
      console.log("Mapping Type:", selectedMappingType);
      console.log("Mapping Value:", selectedMappingValue);
      console.log("Skill Focus:", skillName);
      promptToUse = singleSkillPrompt;
    } else {
      // Task configuration selected - use coursePrompt
      const coursePrompt = {
        instruction: instructionTaskText,
        critical_work_function: criticalWorkFunction,

        // NEW: Add mapping type and value
        pedagogical_approach: {
          mapping_type: selectedMappingType, // e.g., "pedagogical process"
          mapping_value: selectedMappingValue, // e.g., "Project-Based"
          reason: reason
        },

        output_format: {
          total_slides: `${slideCount}`,
          language: "Practical, professional, engaging, and competency-based",
          style: "Formal and structured",
          visuals: "No visuals, design elements, or styling instructions of any kind",
          repetition: "No repetition of content across slides",
          tone: `${modalityString}`,

          // Add mapping context to style or create new section
          pedagogical_context: `Course designed using ${selectedMappingValue} ${selectedMappingType} approach`,


          slide_structure: [
            "Slide X: [Appropriate Slide Title Based on Position]",
            "Slide X: [Appropriate Slide Description Based on Position]",
            "Followed by 5 to 6 concise bullet points.",
            "Each bullet point must be instructional, clear, and under 40 words.",
            "Use only plain text and hyphens for bullets. No markdown, symbols, or numbering.",
            "INTEGRATE KAAB COMPETENCIES naturally into bullet points where relevant.",
            "IMPORTANT: Use ALL KAAB items across the course, not just the first ones.",
            // NEW: Add mapping integration instruction
            `ALIGN content with ${selectedMappingValue} pedagogical approach throughout`

          ],

          // Add this as a new section after output_format or within it
          mapping_integration: {
            type: selectedMappingType,
            value: selectedMappingValue,

            // Different integration strategies based on mapping type
            integration_strategy: selectedMappingType === "pedagogical process" ? [
              `Apply ${selectedMappingValue} learning methodology across all slides`,
              "Design activities and content delivery according to chosen pedagogical approach",
              "Structure slide sequence to reflect the selected teaching/learning process"
            ] : selectedMappingType === "another_type" ? [
              // Add strategies for other mapping types as needed
            ] : [
              "Integrate the selected mapping approach into content design"
            ],

            // Specific guidance for different pedagogical approaches
            pedagogical_guidance: reason,

            // How to apply the selected approach
            application_rules: [
              `The ${selectedMappingValue} approach must influence ALL slide content`,
              "Integrate approach-specific terminology and concepts naturally",
              "Design learning activities that align with the selected methodology",
              "Ensure assessment and evaluation methods match the pedagogical approach"
            ]
          },

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
                  // NEW: Add mapping context
                  `${selectedMappingType}: ${selectedMappingValue}`,
                  "INTEGRATE: Introduce a selection of KAAB competencies from ALL categories"
                ],
                // NEW: Add mapping to integration plan
                mapping_integration: `Introduce ${selectedMappingValue} approach and its relevance to ${jobRole}`,
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
                  // NEW: Add mapping-specific objectives
                  `How ${selectedMappingValue} approach will be used to achieve objectives`,
                  "INTEGRATE: Link objectives to development of ALL KAAB competencies"
                ],
                // NEW: Add mapping alignment
                mapping_alignment: `Align learning objectives with ${selectedMappingValue} methodology`,

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
                  // NEW: Add mapping-specific focus
                  `How ${selectedMappingValue} approach enhances task understanding`,
                  "INTEGRATE: Show how KAAB competencies support task context"
                ],
                priority: 1,
                // NEW: Add mapping implementation
                mapping_implementation: `Apply ${selectedMappingValue} principles to task contextualization`,

                kaab_integration_plan: [
                  parsedKnowledge.length > 2 ? `Use knowledge: ${parsedKnowledge[2]?.title}` : "No knowledge items for context",
                  parsedAbility.length > 2 ? `Use ability: ${parsedAbility[2]?.title}` : "No ability items for context",
                  parsedAttitude.length > 2 ? `Use attitude: ${parsedAttitude[2]?.title}` : "No attitude items for context",
                  parsedBehaviour.length > 2 ? `Use behaviour: ${parsedBehaviour[2]?.title}` : "No behaviour items for context"
                ]
              }
            ],

            // NEW: Add mapping-specific slide templates
            mapping_specific_slides: selectedMappingValue === "Project-Based" ? [
              {
                title: "Project Definition and Scope",
                focus: "Define the core project that will drive learning throughout the course",
                kaab_integration: "Connect project requirements to specific KAAB competencies"
              },
              {
                title: "Milestone Planning and Execution",
                focus: "Break down project into manageable phases with clear deliverables",
                kaab_integration: "Map milestones to progressive competency development"
              }
            ] : selectedMappingValue === "Scenario-Based" ? [
              {
                title: "Scenario Introduction and Context",
                focus: "Present the central scenario that will guide learning activities",
                kaab_integration: "Embed KAAB competencies within scenario challenges"
              },
              {
                title: "Scenario Analysis and Decision Points",
                focus: "Identify key decision moments within the scenario",
                kaab_integration: "Link decisions to competency demonstration"
              }
            ] : [],


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
      console.log("Generated Course Prompt with Mapping Integration");
      console.log("Mapping Type:", selectedMappingType);
      console.log("Mapping Value:", selectedMappingValue);
      
      promptToUse = coursePrompt;
    }

    console.log("KABA Summary:", {
      knowledge: { count: parsedKnowledge.length, items: parsedKnowledge.map(k => k.title) },
      ability: { count: parsedAbility.length, items: parsedAbility.map(a => a.title) },
      attitude: { count: parsedAttitude.length, items: parsedAttitude.map(a => a.title) },
      behaviour: { count: parsedBehaviour.length, items: parsedBehaviour.map(b => b.title) },
      total: totalKabaItems
    });

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
          content: JSON.stringify(promptToUse, null, 2),
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
