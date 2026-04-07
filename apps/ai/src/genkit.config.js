import { googleAI } from '@genkit-ai/google-genai'; 
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

const apiKey = process.env.GEMINI_API_KEY;

console.log("API key exists:", !!apiKey);

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY');
}

export const googleAIPlugin = googleAI({
  apiKey,
});
export const gemini25FlashModel = 'gemini-1.5-flash';