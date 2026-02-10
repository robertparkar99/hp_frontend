```javascript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

console.log('=== GENKIT SERVER DIAGNOSTIC TOOL ===');
console.log('⏰ Time:', new Date().toISOString());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}
console.log('✅ API Key found:', GEMINI_API_KEY.substring(0, 10) + '...');

async function runCallback() {
    try {
        console.log('\n--- Step 1: Initializing Genkit ---');
        const gk = genkit({
            plugins: [googleAI({ apiKey: GEMINI_API_KEY })],
        });
        console.log('✅ Genkit instance created');

        console.log('\n--- Step 2: Loading Flows ---');
        const { buildWithAIFlow } = await import('./flows/buildWithAIFlow.js');
        console.log('✅ Flow module imported');

        const flowInstance = buildWithAIFlow(gk);
        console.log('✅ Flow instance created');

        console.log('\n--- Step 3: Running Test Execution (Mock) ---');
        // Mock input data matching schema
        const testInput = {
            industry: 'Technology',
            department: 'Engineering',
            jobRole: 'Software Engineer',
            modality: { selfPaced: true },
            tasks: ['Write code', 'Debug issues'],
            criticalWorkFunction: 'Develop software',
            slideCount: 3,
            knowledge: [],
            ability: [],
            attitude: [],
            behaviour: [],
        };

        console.log('INPUT:', JSON.stringify(testInput, null, 2));

        console.log('🚀 Invoking flow directly...');
        const result = await flowInstance(testInput);

        console.log('\n✅ EXECUTION SUCCESSFUL!');
        console.log('OUTPUT:', result);

    } catch (error) {
        console.error('\n❌ EXECUTION FAILED');
        console.error('Error:', error.message);
        if (error.stack) console.error('Stack:', error.stack);

        if (error.message.includes('model not found') || error.message.includes('404')) {
            console.log('\n💡 SUGGESTION: The model name might be invalid. Check gemini-1.5-flash availability.');
        }
    }
}

runCallback();
```
