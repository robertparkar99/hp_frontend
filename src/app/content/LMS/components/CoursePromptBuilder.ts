import { Config } from "./Types";

// Enhanced prompt builder that creates a structured JSON object 

export function buildPrompt(cfg: Config, industry: string, allCwfTasks: string[] = []) {
  const modality = [
    cfg.modality.selfPaced && "Self-paced",
    cfg.modality.instructorLed && "Instructor-led",
  ]
    .filter(Boolean)
    .join(", ");

  const criticalWorkFunction = cfg.criticalWorkFunction || " - ";
  
  console.log("🔍 buildPrompt - allCwfTasks parameter:", allCwfTasks);
  console.log("🔍 buildPrompt - allCwfTasks length:", allCwfTasks?.length);
  console.log("🔍 buildPrompt - cfg.tasks:", cfg.tasks);
  
  // ✅ FIXED: Better logic for task selection
  let formattedKeyTasks: string;
  
  // Check if we should use all CWF tasks (for template t1)
  const shouldUseAllCwfTasks = allCwfTasks && Array.isArray(allCwfTasks) && allCwfTasks.length > 0;
  
  if (shouldUseAllCwfTasks) {
    // Use all tasks from the CWF
    formattedKeyTasks = allCwfTasks.join(", ");
    console.log("✅ Using all CWF tasks:", formattedKeyTasks);
  } else if (cfg.tasks && cfg.tasks.length > 0) {
    // Check if we have any valid tasks in cfg.tasks
    const validTasks = cfg.tasks.filter(task => task && task.trim() !== "");
    if (validTasks.length > 0) {
      formattedKeyTasks = validTasks.join(", ");
      console.log("✅ Using selected tasks:", formattedKeyTasks);
    } else {
      formattedKeyTasks = " - ";
      console.log("❌ No valid tasks in cfg.tasks, using default");
    }
  } else {
    formattedKeyTasks = " - ";
    console.log("❌ No tasks available, using default");
  }

  console.log("🔧 Final formattedKeyTasks:", formattedKeyTasks);

  // Rest of your function remains the same...
  const coursePromptObject = {
    instruction: `You are an expert L&D Manager. Design a complete 10-slide instructional training course that provides a comprehensive guide to mastering the Critical Work Function: "${criticalWorkFunction}".`,
    input_variables: {
      industry: industry || " - ",
      department: cfg.department || " - ",
      job_role: cfg.jobRole || " - ",
      critical_work_function: criticalWorkFunction,
      key_tasks: formattedKeyTasks, 
      modality: modality || " - ",
    },
    output_format: {
      total_slides: 10,
      slide_structure: "Each slide = 1 instructional unit",
      bullet_points_per_slide: "3–5 (under 40 words each)",
      language: "Instructional, practical, professional",
      style: "Formal, structured, competency-based",
      visuals: "No visuals or design styling",
      repetition: "No repetition — ensure uniqueness per slide",
      tone: modality.includes("Self-paced")
        ? "Direct, learner-led tone; emphasis on individual reflection"
        : "Include facilitator cues, group discussion prompts",
      response_format: `EXACT OUTPUT FORMAT REQUIRED:
Slide 1: Title Slide
- Industry: [industry]
- Department: [department]  
- Job role: [job role]
- Key Tasks: [key tasks]
- Critical Work Function: [critical work function]
- Modality: [modality]

Slide 2: [title]
- [bullet point 1]
- [bullet point 2]
- [bullet point 3]
- [bullet point 4]

[Continue for all 10 slides with exact same format]`,
    },
    slide_structure: [
      {
        slide: 1,
        title: "Title Slide",
        content: [
          `Industry: ${industry || " - "}`,
          `Department: ${cfg.department || " - "}`,
          `Job role: ${cfg.jobRole || " - "}`,
          `Key Tasks: ${formattedKeyTasks}`,
          `Critical Work Function: ${criticalWorkFunction}`,
          `Modality: ${modality || " - "}`,
        ],
      },
      {
        slide: 2,
        title: "Learning Objectives & Modality Instructions",
        content: [
          `Targeted outcomes for mastering these Key tasks: ${formattedKeyTasks}`,
          "Importance of monitoring and evaluation",
          modality.includes("Self-paced") ? "Tips for self-driven navigation and checks" : "Facilitator guidance and session flow overview"
        ]
      },
      {
        slide: 3,
        title: "Task Contextualization",
        content: [
          `Role of the Key Tasks: ${formattedKeyTasks} within the Critical Work Function: ${criticalWorkFunction}`,
          `Industry Context: ${industry || " - "}`,
          "Dependencies and prerequisites",
          "Stakeholders or systems involved"
        ]
      },
      {
        slide: 4,
        title: "Performance Expectations",
        content: [
          "Key success indicators",
          "Task standards and KPIs",
          "Timeliness and quality dimensions"
        ]
      },
      {
        slide: 5,
        title: "Monitoring Indicators",
        content: [
          "Observable checkpoints",
          "Red flags to watch for",
          "Sample field-level evidence"
        ]
      },
      {
        slide: 6,
        title: "Tools & Methods for Monitoring",
        content: [
          "Digital or manual tools",
          "Logging and feedback techniques",
          "Real-time vs retrospective tracking"
        ]
      },
      {
        slide: 7,
        title: "Data Capture & Reporting",
        content: [
          "How to document outcomes",
          "Structured logs or templates",
          "Communicating progress or deviations"
        ]
      },
      {
        slide: 8,
        title: "Common Pitfalls & Risk Management",
        content: [
          `Frequent errors during tasks: ${formattedKeyTasks} execution`,
          "Preventive and corrective strategies",
          "Escalation criteria"
        ]
      },
      {
        slide: 9,
        title: "Best Practice Walkthrough",
        content: [
          `Example scenario of successful tasks: ${formattedKeyTasks} monitoring`,
          "Highlighting decision points",
          modality.includes("Instructor-led") ? "Facilitator questions for discussion" : "Reflection prompts for learner"
        ]
      },
      {
        slide: 10,
        title: "Completion Criteria & Evaluation",
        content: [
          `Final checks for tasks: ${formattedKeyTasks} closure`,
          "Quality assurance checkpoints",
          modality.includes("Self-paced") ? "Self-assessment checklist" : "Facilitator sign-off checklist"
        ]
      }
    ],
    requirements: [
      "Ensure each slide has 3-5 bullet points with clear, actionable content under 40 words each",
      "Focus on practical successful task completion strategies",
      "Maintain professional instructional tone throughout"
    ]
  };

  return JSON.stringify(coursePromptObject, null, 2);
}

// Skill-focused prompt function that uses department, job role, and skill from course mapping
// and includes proficiency target from course parameters
export function buildSkillPrompt(cfg: Config, industry: string) {
  const modality = [
    cfg.modality.selfPaced && "Self-paced",
    cfg.modality.instructorLed && "Instructor-led",
  ]
    .filter(Boolean)
    .join(", ");

  const primarySkill = cfg.skills.length > 0 ? cfg.skills[0] : " - ";
  const proficiencyTarget = cfg.proficiencyTarget || 3;

  // Create proficiency level descriptions based on the target
  const proficiencyLevels = {
    1: "Basic Awareness & Understanding",
    2: "Fundamental Application",
    3: "Proficient Execution",
    4: "Advanced Application",
    5: "Expert Mastery",
    6: "Strategic Leadership & Innovation"
  };

  const targetProficiencyDescription = proficiencyLevels[proficiencyTarget as keyof typeof proficiencyLevels] || "Proficient Execution";

  // Create a structured course prompt object with focus on skill development
  // Using department, jobRole, skill from course mapping and proficiencyTarget from course parameters
  const coursePromptObject = {
    instruction: `You are an expert L&D Manager. Design a complete 10-slide instructional training course that develops "${primarySkill}" to ${targetProficiencyDescription} level (Proficiency Target: ${proficiencyTarget}/6) for ${cfg.jobRole || "the job role"} in ${cfg.department || "the department"}.`,
    input_variables: {
      industry: industry || " - ",
      department: cfg.department || " - ",
      job_role: cfg.jobRole || " - ",
      primary_skill: primarySkill,
      proficiency_target: proficiencyTarget,
      target_proficiency_level: targetProficiencyDescription,
      modality: modality || " - "
    },

    output_format: {
      total_slides: 10,
      slide_structure: "Each slide = 1 instructional unit",
      bullet_points_per_slide: "3–5 (under 40 words each)",
      language: "Instructional, practical, professional",
      style: "Formal, structured, competency-based",
      visuals: "No visuals or design styling",
      repetition: "No repetition — ensure uniqueness per slide",
      tone: modality.includes("Self-paced") ? "Direct, learner-led tone; emphasis on individual reflection" : "Include facilitator cues, group discussion prompts",
      response_format: `EXACT OUTPUT FORMAT REQUIRED:
Slide 1: Title Slide
- Industry: [industry]
- Department: [department]  
- Job role: [job role]
- Core Skill: [primary skill]
- Proficiency Target: [proficiency target]/6 - [target level]
- Modality: [modality]

Slide 2: [title]
- [bullet point 1]
- [bullet point 2]
- [bullet point 3]
- [bullet point 4]

[Continue for all 10 slides with exact same format]`
    },
    slide_structure: [
      {
        slide: 1,
        title: "Title Slide",
        content: [
          `Industry: ${industry || " - "}`,
          `Department: ${cfg.department || " - "}`,
          `Job role: ${cfg.jobRole || " - "}`,
          `Core Skill: ${primarySkill}`,
          `Proficiency Target: ${proficiencyTarget}/6 - ${targetProficiencyDescription}`,
          `Modality: ${modality || " - "}`
        ]
      },
      {
        slide: 2,
        title: "Skill Development Objectives & Proficiency Roadmap",
        content: [
          `Mastering ${primarySkill} for ${cfg.jobRole || "the role"}`,
          `Progression pathway to ${targetProficiencyDescription}`,
          "Learning outcomes and competency targets",
          modality.includes("Self-paced") ? "Self-paced skill development approach" : "Structured skill-building sessions"
        ]
      },
      {
        slide: 3,
        title: "Departmental Context & Skill Relevance",
        content: [
          `${cfg.department || "Department"} requirements for ${primarySkill}`,
          `Strategic importance of ${primarySkill} in organizational context`,
          "Cross-functional applications and dependencies",
          "Business impact and value creation"
        ]
      },
      {
        slide: 4,
        title: "Job Role Integration & Skill Application",
        content: [
          `${cfg.jobRole || "Job role"} specific applications of ${primarySkill}`,
          "Daily operational usage and scenarios",
          "Performance enhancement through skill mastery",
          "Quality standards and excellence criteria"
        ]
      },
      {
        slide: 5,
        title: `Foundational ${primarySkill} Concepts & Principles`,
        content: [
          `Core concepts and fundamentals of ${primarySkill}`,
          "Theoretical framework and underlying principles",
          "Key terminology and definitions",
          "Fundamental methodologies and approaches"
        ]
      },
      {
        slide: 6,
        title: `Practical Application & ${primarySkill} Techniques`,
        content: [
          `Step-by-step application of ${primarySkill}`,
          "Practical techniques and methods",
          "Real-world scenarios and use cases",
          "Best practices for effective implementation"
        ]
      },
      {
        slide: 7,
        title: `Advanced ${primarySkill} Development & Mastery`,
        content: [
          `Advanced techniques in ${primarySkill}`,
          "Complex problem-solving applications",
          "Innovation and creative applications",
          "Expert-level insights and approaches"
        ]
      },
      {
        slide: 8,
        title: "Performance Assessment & Skill Evaluation",
        content: [
          `Measuring ${primarySkill} proficiency progression`,
          "Performance indicators and success metrics",
          "Self-assessment and reflection techniques",
          "Feedback mechanisms and improvement planning"
        ]
      },
      {
        slide: 9,
        title: "Overcoming Challenges & Skill Enhancement",
        content: [
          `Common challenges in developing ${primarySkill}`,
          "Problem-solving strategies and approaches",
          "Continuous improvement methodologies",
          modality.includes("Instructor-led") ? "Group exercises: Skill application scenarios" : "Self-practice: Skill refinement techniques"
        ]
      },
      {
        slide: 10,
        title: "Proficiency Achievement & Career Advancement",
        content: [
          `Achieving ${targetProficiencyDescription} in ${primarySkill}`,
          "Career development and advancement opportunities",
          "Ongoing learning and skill maintenance",
          modality.includes("Self-paced") ? "Personal skill development roadmap" : "Certification and proficiency validation"
        ]
      }
    ],
    requirements: [
      "Ensure each slide has 3-5 bullet points with clear, actionable content under 40 words each",
      "Use '-' prefix for all bullet points - do not use asterisks (*)",
      "Follow EXACT output format: 'Slide X: Title' followed by bullet points starting with '-'",
      "Include slide number and title in the response as shown in the format",
      `Focus on progressive skill development towards ${targetProficiencyDescription} level`,
      "Maintain strong departmental and job role context throughout",
      "Emphasize practical application and real-world relevance",
      "Include progressive learning activities appropriate for the proficiency target",
      "Maintain professional instructional tone with emphasis on competency development"
    ],
    skill_development_emphasis: {
      primary_skill: primarySkill,
      proficiency_target: proficiencyTarget,
      target_level: targetProficiencyDescription,
      departmental_context: `Application within ${cfg.department || "the department"}`,
      job_role_specificity: `Tailored for ${cfg.jobRole || "the specific job role"}`,
      progressive_learning: `Building from fundamentals to ${targetProficiencyDescription}`,
      practical_application: "Focus on real-world usage and scenarios"
    }
  };

  return JSON.stringify(coursePromptObject, null, 2);
}

// Alternative version for templates that don't use critical work function or specific skills
export function buildPromptWithoutCWF(cfg: Config, industry: string) {
  const modality = [
    cfg.modality.selfPaced && "Self-paced",
    cfg.modality.instructorLed && "Instructor-led",
  ]
    .filter(Boolean)
    .join(", ");

  // Create a structured course prompt object without critical work function
  // Using ONLY department and jobRole from course mapping
  const coursePromptObject = {
    instruction: "You are an expert L&D Manager. Design a complete 10-slide instructional training course that provides comprehensive professional development for the specific job role.",
    input_variables: {
      industry: industry || " - ",
      department: cfg.department || " - ",
      job_role: cfg.jobRole || " - ",
      key_task: cfg.tasks || " - ",
      modality: modality || " - "
    },

    output_format: {
      total_slides: 10,
      slide_structure: "Each slide = 1 instructional unit",
      bullet_points_per_slide: "3–5 (under 40 words each)",
      language: "Instructional, practical, professional",
      style: "Formal, structured, competency-based",
      visuals: "No visuals or design styling",
      repetition: "No repetition — ensure uniqueness per slide",
      tone: modality.includes("Self-paced") ? "Direct, learner-led tone; emphasis on individual reflection" : "Include facilitator cues, group discussion prompts",
      response_format: `EXACT OUTPUT FORMAT REQUIRED:
Slide 1: Title Slide
- Industry: [industry]
- Department: [department]  
- Job role: [job role]
- Key Task: [key task]
- Modality: [modality]
- Focus: Professional excellence for [job role]

Slide 2: [title]
- [bullet point 1]
- [bullet point 2]
- [bullet point 3]
- [bullet point 4]

[Continue for all 10 slides with exact same format]`
    },
    slide_structure: [
      {
        slide: 1,
        title: "Title Slide",
        content: [
          `Industry: ${industry || " - "}`,
          `Department: ${cfg.department || " - "}`,
          `Job role: ${cfg.jobRole || " - "}`,
          `Modality: ${modality || " - "}`,
          `Focus: Professional excellence for ${cfg.jobRole || "the role"}`
        ]
      },
      {
        slide: 2,
        title: "Learning Objectives & Role Mastery",
        content: [
          `Professional development goals for ${cfg.jobRole || "the role"}`,
          "Core competencies and skill development",
          modality.includes("Self-paced") ? "Self-directed learning pathway" : "Structured learning objectives"
        ]
      },
      {
        slide: 3,
        title: "Departmental Context & Role Significance",
        content: [
          `${cfg.department || "Department"} structure and objectives`,
          `Strategic importance of ${cfg.jobRole || "the role"}`,
          "Organizational impact and value creation",
          "Industry positioning and trends"
        ]
      },
      {
        slide: 4,
        title: "Performance Standards & Expectations",
        content: [
          "Role-specific performance criteria",
          "Quality standards and benchmarks",
          "Key performance indicators",
          "Professional conduct requirements"
        ]
      },
      {
        slide: 5,
        title: "Core Competencies & Skill Framework",
        content: [
          "Essential technical competencies",
          "Professional and soft skills",
          "Leadership and collaboration abilities",
          "Continuous learning requirements"
        ]
      },
      {
        slide: 6,
        title: "Tools & Resources for Role Excellence",
        content: [
          "Essential tools and technologies",
          "Departmental systems and platforms",
          "Reference materials and guidelines",
          "Support networks and resources"
        ]
      },
      {
        slide: 7,
        title: "Performance Management & Development",
        content: [
          "Performance monitoring approaches",
          "Feedback and evaluation mechanisms",
          "Professional development planning",
          "Career progression pathways"
        ]
      },
      {
        slide: 8,
        title: "Challenges & Professional Problem-Solving",
        content: [
          "Common role-specific challenges",
          "Critical thinking and decision-making",
          "Conflict resolution strategies",
          "Innovation and improvement approaches"
        ]
      },
      {
        slide: 9,
        title: "Best Practices & Professional Excellence",
        content: [
          "Industry standards and benchmarks",
          "Efficiency and effectiveness techniques",
          "Quality enhancement methods",
          modality.includes("Instructor-led") ? "Professional scenario discussions" : "Self-assessment for excellence"
        ]
      },
      {
        slide: 10,
        title: "Career Development & Continuous Growth",
        content: [
          "Professional competency assessment",
          "Skill gap analysis and development",
          "Long-term career planning",
          modality.includes("Self-paced") ? "Personal growth roadmap" : "Professional certification pathways"
        ]
      }
    ],
    requirements: [
      "Ensure each slide has 3-5 bullet points with clear, actionable content under 40 words each",
      "Use '-' prefix for all bullet points - do not use asterisks (*)",
      "Follow EXACT output format: 'Slide X: Title' followed by bullet points starting with '-'",
      "Include slide number and title in the response as shown in the format",
      "Focus on professional development and role mastery",
      "Maintain strong departmental and organizational context",
      "Emphasize practical application and real-world relevance",
      "Maintain professional instructional tone throughout"
    ]
  };

  return JSON.stringify(coursePromptObject, null, 2);
}

// Main build prompt function that selects the appropriate version based on template
export function buildDynamicPrompt(cfg: Config, industry: string, templateId?: string, allCwfTasks: string[] = []) {
  console.log("🚀 buildDynamicPrompt called with:", {
    templateId,
    tasks: cfg.tasks,
    skills: cfg.skills,
    criticalWorkFunction: cfg.criticalWorkFunction,
    allCwfTasks: allCwfTasks,
    allCwfTasksLength: allCwfTasks?.length
  });
  
  // Use CWF-focused prompt for templates that include critical work function
  if (templateId === "t1" || cfg.criticalWorkFunction) {
    console.log("📋 Using CWF-focused prompt with all tasks");
    console.log("📋 All CWF tasks being passed:", allCwfTasks);
    return buildPrompt(cfg, industry, allCwfTasks);
  }
  // Use skill-focused prompt for skill templates
  if (templateId === "t3" || (cfg.skills.length > 0 && cfg.skills[0])) {
    console.log("📋 Using skill-focused prompt");
    return buildSkillPrompt(cfg, industry);
  }
  // Use task-focused prompt for t2 template
  if (templateId === "t2" || (cfg.tasks.length > 0 && cfg.tasks[0])) {
    console.log("📋 Using task-focused prompt");
    return buildPrompt(cfg, industry); // Use the same CWF prompt but tasks will be the focus
  }
  // Use non-CWF prompt for other templates or when no specific focus is specified
  console.log("📋 Using non-CWF prompt");
  return buildPromptWithoutCWF(cfg, industry);
}