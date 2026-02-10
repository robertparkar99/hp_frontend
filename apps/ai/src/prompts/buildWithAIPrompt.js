/**
 * Build with AI Prompt Template
 * Generates comprehensive course outlines for Gamma API integration
 * Supports both simple and advanced (KAAB, mapping) configurations
 */

/**
 * Format KAAB items for prompt inclusion
 */
function formatKaabItems(items, category) {
   if (!items || items.length === 0) return `${category}: Not specified`;

   const titles = items.map((item, i) => `${i + 1}. ${item.title || item.name || 'Untitled'}`);
   if (titles.length <= 3) {
      return `${category}: ${titles.join(', ')}`;
   }
   return `${category}: ${titles.slice(0, 3).join(', ')}, and ${titles.length - 3} more`;
}

/**
 * Get mapping guidance based on pedagogical approach
 */
function getMappingGuidance(mappingType, mappingValue) {
   const guidanceMap = {
      'Project-Based': {
         approach: 'Structure content around project phases and deliverables',
         activities: 'Project planning, execution, and evaluation tasks',
      },
      'Scenario-Based': {
         approach: 'Build content around realistic scenarios and case studies',
         activities: 'Scenario analysis, role-playing, decision-making exercises',
      },
      'Inquiry-Based': {
         approach: 'Structure content around investigative questions',
         activities: 'Question formulation, evidence gathering, analysis tasks',
      },
      'Experiential-Based': {
         approach: 'Connect theory to hands-on practice and reflection',
         activities: 'Simulations, practical exercises, reflective journals',
      },
      'Art-Integrated': {
         approach: 'Incorporate creative elements and metaphorical thinking',
         activities: 'Visual representations, creative problem-solving',
      },
   };

   return guidanceMap[mappingValue] || {
      approach: `Apply ${mappingValue} principles throughout`,
      activities: 'Activities aligned with selected approach',
   };
}

/**
 * Build the prompt for course outline generation
 * @param {Object} input - Input data for the prompt
 * @returns {string} Formatted prompt string
 */
export function buildWithAIPrompt(input) {
   // Extract core fields
   const industry = input.industry || '-';
   const department = input.department || '-';
   const jobRole = input.jobRole || '-';
   const criticalWorkFunction = input.criticalWorkFunction || '-';
   const slideCount = input.slideCount || 10;

   // Handle modality
   const modalityParts = [];
   if (input.modality?.selfPaced) modalityParts.push('Self-paced');
   if (input.modality?.instructorLed) modalityParts.push('Instructor-led');
   const modalityText = modalityParts.length > 0 ? modalityParts.join(', ') : 'Self-paced';

   // Handle key task
   const keyTask = Array.isArray(input.tasks) && input.tasks.length > 0
      ? input.tasks.join(', ')
      : '-';

   // Determine tone based on modality
   const tone = input.modality?.instructorLed
      ? 'Professional, structured, facilitator-friendly'
      : 'Engaging, clear, learner-focused';

   // Handle skill-based content
   const selectedSkill = input.selectedSkill;
   const hasSkill = selectedSkill?.skillName;

   // Format KAAB competencies
   const knowledgeText = formatKaabItems(input.knowledge, 'Knowledge');
   const abilityText = formatKaabItems(input.ability, 'Ability');
   const attitudeText = formatKaabItems(input.attitude, 'Attitude');
   const behaviourText = formatKaabItems(input.behaviour, 'Behaviour');

   const hasKaab = (input.knowledge?.length > 0 || input.ability?.length > 0 ||
      input.attitude?.length > 0 || input.behaviour?.length > 0);

   // Handle mapping/pedagogical approach
   const mappingType = input.mappingType || '';
   const mappingValue = input.mappingValue || '';
   const mappingGuidance = getMappingGuidance(mappingType, mappingValue);
   const hasMappingGuidance = mappingValue && mappingValue !== '';

   // Build the prompt
   let prompt = `You are an expert instructional designer and L&D specialist with 15+ years of experience creating professional training courses.

Your task is to create a structured ${slideCount}-slide course outline based on the provided context. This outline will be used with the Gamma API to generate a presentation.

**CONTEXT:**
- Industry: ${industry}
- Department: ${department}
- Job Role: ${jobRole}
- Critical Work Function: ${criticalWorkFunction}
- Key Tasks: ${keyTask}
- Learning Modality: ${modalityText}`;

   // Add skill context if available
   if (hasSkill) {
      prompt += `

**SKILL FOCUS:**
- Skill Name: ${selectedSkill.skillName}
- Description: ${selectedSkill.description || 'Not specified'}
- Proficiency Level: ${selectedSkill.proficiency_level || 'Intermediate'}
- Category: ${selectedSkill.category || 'General'}
- Sub-category: ${selectedSkill.sub_category || 'General'}`;
   }

   // Add KAAB competencies if available
   if (hasKaab) {
      prompt += `

**KAAB COMPETENCIES TO INTEGRATE:**
- ${knowledgeText}
- ${abilityText}
- ${attitudeText}
- ${behaviourText}

IMPORTANT: Naturally integrate these KAAB competencies throughout the course content. Do not force them, but ensure they are addressed across the slides.`;
   }

   // Add pedagogical approach if specified
   if (hasMappingGuidance) {
      prompt += `

**PEDAGOGICAL APPROACH:** ${mappingValue}
- Teaching Method: ${mappingGuidance.approach}
- Suggested Activities: ${mappingGuidance.activities}
${input.mappingReason ? `- Rationale: ${input.mappingReason}` : ''}`;
   }

   prompt += `

**REQUIREMENTS:**
1. Create EXACTLY ${slideCount} slides (no more, no less)
2. Each slide must have:
   - A clear, descriptive title
   - A brief description of the slide's purpose
   - 3-5 bullet points (each under 40 words)
3. Bullet points must be:
   - Instructional and actionable
   - Clear and concise
   - Formatted with hyphens (-)
   - Plain text only (no markdown, symbols, or numbering)
4. Content style:
   - Formal and structured
   - Competency-based approach
   - Professional language
   - Tone: ${tone}

**OUTPUT FORMAT:**
Return the course content in plain text format suitable for the Gamma API. Structure each slide as follows:

Slide 1: [Title]
[Brief description]
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]
- [Bullet point 4]
- [Bullet point 5]

**IMPORTANT:**
- Do NOT use JSON formatting
- Do NOT use markdown formatting
- Use simple plain text with hyphens for bullets
- Ensure content flows logically from introduction to conclusion
- Make the content specific to the ${industry} industry and ${department} department
${hasSkill ? `- Focus on developing the ${selectedSkill.skillName} skill` : ''}
${hasMappingGuidance ? `- Apply ${mappingValue} pedagogical approach throughout` : ''}

Generate the ${slideCount}-slide course outline now.`;

   return prompt;
}
