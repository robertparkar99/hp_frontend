import { googleAI } from '@genkit-ai/google-genai';

// Note: Environment variables should be loaded by the calling module (index.js)
// This config file just exports the plugin and model

// Get API key from already-loaded environment
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ Warning: GEMINI_API_KEY not loaded yet in genkit.config.js');
  console.warn('   Make sure environment is loaded before importing this file');
}

// Export the plugin and the model
export const googleAIPlugin = googleAI({ apiKey: apiKey || '' });
export const gemini25FlashModel = 'googleai/gemini-2.5-flash';