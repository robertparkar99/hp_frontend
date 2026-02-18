import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { startFlowServer } from '@genkit-ai/express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('=== GENKIT SERVER DIAGNOSTIC ===');
console.log('Step 1: Loading environment...');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('✅ GEMINI_API_KEY loaded:', GEMINI_API_KEY.substring(0, 20) + '...');

console.log('\\nStep 2: Initializing Genkit...');
try {
    const gk = genkit({
        plugins: [googleAI({ apiKey: GEMINI_API_KEY })],
    });
    console.log('✅ Genkit initialized successfully');

    console.log('\\nStep 3: Defining test flow...');
    const testFlow = gk.defineFlow(
        {
            name: 'testFlow',
            inputSchema: (z) => z.object({ message: z.string() }),
            outputSchema: (z) => z.object({ response: z.string() }),
        },
        async (input) => {
            console.log('🔵 testFlow called with:', input);
            return { response: `Echo: ${input.message}` };
        }
    );
    console.log('✅ Test flow defined');

    console.log('\\nStep 4: Starting flow server on port 3400...');
    startFlowServer({
        flows: [testFlow],
        port: 3400,
    });

    console.log('✅ Flow server started!');
    console.log('🌐 Server listening on: http://localhost:3400');
    console.log('🧪 Test the flow:');
    console.log('   curl -X POST http://localhost:3400/testFlow \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d "{\\"data\\":{\\"message\\":\\"Hello\\"}}"');
    console.log('\\n✅ Server is ready!');

} catch (error) {
    console.error('❌ ERROR during initialization:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
