import {
  JobRoleCompetencySchema,
  JobRoleInputSchema,
} from '../schemas/jobRoleSchemas.js';
import { seniorExpertPrompt } from '../prompts/seniorExpertPrompt.js';
import { gemini25FlashModel } from '../genkit.config.js';

// Job Role Competency Flow
// This flow generates a comprehensive competency profile for a job role
// by analyzing the job context and grounding data from the organization
console.log("Defining jobRoleCompetencyFlow");
export const jobRoleCompetencyFlow = (gk) => gk.defineFlow(
  {
    name: 'jobRoleCompetencyFlow',
    inputSchema: JobRoleInputSchema,
    outputSchema: JobRoleCompetencySchema,
    stream: true,
  },
  async (input) => {
    // Generate the prompt with the input
    console.log("🔵 jobRoleCompetencyFlow called with input:", input);
    const prompt = seniorExpertPrompt(input, null);

    // Generate the competency profile using the AI model
    const { output } = await gk.generate({
      model: gemini25FlashModel,
      prompt,
      output: { schema: JobRoleCompetencySchema },
      stream: true,
    });

    if (!output) throw new Error('Failed to generate competency profile');
    return output;
  }
);








// import {
//   JobRoleCompetencySchema,
//   JobRoleInputSchema,
// } from '../schemas/jobRoleSchemas.js';
// import { seniorExpertPrompt } from '../prompts/seniorExpertPrompt.js';
// import { gemini25FlashModel } from '../genkit.config.js';

// export const jobRoleCompetencyFlow = (gk) =>
//   gk.defineFlow(
//     {
//       name: 'jobRoleCompetencyFlow',
//       inputSchema: JobRoleInputSchema,
//       stream: true,
//     },
//     async (input) => {
//       const prompt = seniorExpertPrompt(input, null);

//       const response = await gk.generate({
//         model: gemini25FlashModel,
//         prompt,
//         config: { responseMimeType: 'application/json' },
//         stream: false,
//       });

//       // Access the output
//       const rawText =
//         typeof response.output === 'string'
//           ? response.output
//           : JSON.stringify(response.output);

//       if (!rawText) throw new Error('Empty response from Gemini');

//       let parsed;
//       try {
//         parsed = JSON.parse(rawText);
//       } catch (err) {
//         throw new Error('Model returned invalid JSON');
//       }

//       const validatedOutput = JobRoleCompetencySchema.parse(parsed);

//       return validatedOutput;
//     }
//   );
