import { googleAI } from '@genkit-ai/google-genai'; 
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable not found.');
  process.exit(1);
}

// Export the plugin and the model
export const googleAIPlugin = googleAI({ apiKey });
export const gemini25FlashModel = 'googleai/gemini-2.5-flash';