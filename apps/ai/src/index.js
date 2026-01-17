import { genkit } from 'genkit';
import { startFlowServer } from '@genkit-ai/express';
// Import the plugin from our config
import { googleAIPlugin } from './genkit.config.js';
// Import prompts
import { seniorExpertPrompt } from './prompts/seniorExpertPrompt.js';
// Import flows
import { jobRoleCompetencyFlow } from './flows/jobRoleCompetencyFlow.js';

// Initialize genkit with the plugin
const gk = genkit({
  plugins: [googleAIPlugin]
});

// 1. Define the Senior Expert Prompt for Genkit UI

export const seniorExpertPromptDef = gk.definePrompt(
  {
    name: 'seniorExpertPrompt',
    description: 'Senior Expert prompt for generating job role competency profiles',
  },
  seniorExpertPrompt
);

// 2. Define the Job Role Competency Flow

const jobRoleCompetencyFlowInstance = jobRoleCompetencyFlow(gk);

// 3. Start the Flow Server

startFlowServer({
  flows: [jobRoleCompetencyFlowInstance],
  port: 3400,
});

export default gk;